'use client';

import { useDoc, useFirestore, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { ScoresOverview } from '@/components/dashboard/scores-overview';
import type { Evaluation } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { CuppingCompassLogo } from '@/components/cupping-compass-logo';

export default function EvaluationPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const params = useParams();
  const { evaluationId } = params;

  const evaluationRef =
    user && evaluationId && firestore
      ? doc(firestore, 'users', user.uid, 'evaluations', evaluationId as string)
      : null;

  const {
    data: evaluation,
    isLoading: isEvaluationLoading,
    error,
  } = useDoc<Evaluation>(evaluationRef);

  if (isUserLoading || isEvaluationLoading) {
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

  if (error) {
    return <div className="p-8 text-destructive">Error: {error.message}</div>;
  }

  if (!evaluation) {
    return <div className="p-8">Evaluation not found.</div>;
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
              Cupping Compass
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
          <ScoresOverview evaluation={evaluation} />
        </div>
      </main>
    </div>
  );
}
