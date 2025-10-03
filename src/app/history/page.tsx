'use client';

import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Evaluation } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { CuppingCompassLogo } from '@/components/cupping-compass-logo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function HistoryPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const evaluationsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'evaluations'),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user]);

  const { data: evaluations, isLoading } = useCollection<Evaluation>(evaluationsQuery);

  if (isUserLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-10 w-1/2 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
       <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <CuppingCompassLogo className="size-8 text-primary" />
            <h1 className="text-xl font-semibold hidden sm:block">
              Historial de Evaluaciones
            </h1>
          </div>
        </div>
        <Button
          onClick={async () => {
            const { getAuth, signOut } = await import('firebase/auth');
            const auth = getAuth();
            await signOut(auth);
            router.push('/login');
          }}
        >
          Logout
        </Button>
      </header>
       <main className="p-4 sm:p-6 lg:p-8">
         <div className="mx-auto max-w-4xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bitácora de Evaluaciones</CardTitle>
                <CardDescription>Aquí están todas tus evaluaciones de café guardadas.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
                  {isLoading && (
                    <div className="space-y-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  )}
                  {evaluations && evaluations.length > 0 ? (
                    <ul className="space-y-2">
                      {evaluations.map((evaluation) => (
                        <li key={evaluation.id}>
                          <Button asChild variant="ghost" className="w-full h-auto justify-start text-left p-4">
                            <Link href={`/evaluations/${evaluation.id}`}>
                              <div className="flex-1">
                                <div className="font-semibold text-base">{evaluation.coffeeName}</div>
                                <div className="text-sm text-muted-foreground">
                                  {evaluation.createdAt?.toDate().toLocaleDateString()} - Score: {evaluation.overallScore.toFixed(2)}
                                </div>
                              </div>
                               <div className="text-lg font-bold text-primary">
                                {evaluation.overallScore.toFixed(2)}
                              </div>
                            </Link>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    !isLoading && <p className="text-center text-muted-foreground py-8">No hay evaluaciones guardadas.</p>
                  )}
                </div>
              </CardContent>
            </Card>
         </div>
      </main>
    </div>
  );
}
