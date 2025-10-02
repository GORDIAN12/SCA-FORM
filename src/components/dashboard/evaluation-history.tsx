'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Evaluation } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { PlusCircle } from 'lucide-react';

interface EvaluationHistoryProps {
  userId: string;
}

export function EvaluationHistory({ userId }: EvaluationHistoryProps) {
  const firestore = useFirestore();
  const pathname = usePathname();
  const params = useParams();

  const evaluationsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'users', userId, 'evaluations'),
            orderBy('createdAt', 'desc')
          )
        : null,
    [firestore, userId]
  );

  const {
    data: evaluations,
    isLoading,
    error,
  } = useCollection<Evaluation>(evaluationsQuery);

  if (error) {
    return <p className="text-sm text-destructive">Error loading history.</p>;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname === '/'}>
          <Link href="/">
            <PlusCircle className="size-4" />
            <span>New Evaluation</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      {isLoading && (
         <div className="space-y-2 mt-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      )}
      {evaluations && evaluations.length > 0 ? (
        evaluations.map((evaluation) => (
          <SidebarMenuItem key={evaluation.id}>
            <SidebarMenuButton
              asChild
              isActive={params.evaluationId === evaluation.id}
            >
              <Link href={`/evaluations/${evaluation.id}`}>
                <div className="flex flex-col items-start text-left w-full">
                  <span className="font-medium text-sm truncate w-full">
                    {evaluation.coffeeName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {evaluation.createdAt
                      ? formatDistanceToNow(evaluation.createdAt.toDate(), {
                          addSuffix: true,
                        })
                      : 'Just now'}
                  </span>
                </div>
                <div className="ml-auto pl-2">
                  <span className="font-bold text-sm">
                    {evaluation.overallScore.toFixed(2)}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))
      ) : (
        !isLoading && (
        <p className="text-sm text-muted-foreground p-2 text-center mt-4">
          Aún no hay evaluaciones.
        </p>
        )
      )}
    </SidebarMenu>
  );
}
