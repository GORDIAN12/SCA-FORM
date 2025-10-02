'use client';

import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenu,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlusCircle, Coffee } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Evaluation } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';

interface EvaluationHistoryProps {
  userId: string;
}

export function EvaluationHistory({ userId }: EvaluationHistoryProps) {
  const pathname = usePathname();
  const firestore = useFirestore();

  const evaluationsQuery = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return query(
      collection(firestore, 'users', userId, 'evaluations'),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, userId]);

  const { data: evaluations, isLoading } =
    useCollection<Evaluation>(evaluationsQuery);

  return (
    <div className="flex flex-col h-full">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={pathname === '/'}>
            <Link href="/">
              <PlusCircle className="size-4" />
              <span>New Evaluation</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <ScrollArea className="flex-1">
        <SidebarMenu className="px-4">
          {isLoading && (
            <>
              <SidebarMenuSkeleton showIcon />
              <SidebarMenuSkeleton showIcon />
              <SidebarMenuSkeleton showIcon />
            </>
          )}
          {evaluations?.map((evaluation) => (
            <SidebarMenuItem key={evaluation.id}>
              <SidebarMenuButton
                asChild
                isActive={pathname === `/evaluations/${evaluation.id}`}
                className="w-full justify-start"
              >
                <Link href={`/evaluations/${evaluation.id}`}>
                  <Coffee className="size-4" />
                  <span className="truncate">{evaluation.coffeeName}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </ScrollArea>
    </div>
  );
}