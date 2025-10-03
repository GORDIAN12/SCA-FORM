'use client';

import { useDoc, useFirestore, useUser } from '@/firebase';
import { doc, DocumentReference } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import type { Evaluation } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft, ArrowUpCircle } from 'lucide-react';
import { CuppingCompassLogo } from '@/components/cupping-compass-logo';
import { useMemo, useState, useEffect } from 'react';
import { ScaForm } from '@/components/dashboard/sca-form';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';

export default function EvaluationPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const params = useParams();
  const { evaluationId } = params;
  const { t } = useLanguage();

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const evaluationRef = useMemo(() => {
    if (!user || !evaluationId || !firestore) return null;
    return doc(
      firestore,
      'users',
      user.uid,
      'evaluations',
      evaluationId as string
    ) as DocumentReference<Evaluation>;
  }, [user, evaluationId, firestore]);

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
    return <div className="p-8">{t('evaluationNotFound')}</div>;
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
          {t('logout')}
        </Button>
      </header>
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
           <ScaForm 
            initialData={evaluation}
            onSubmit={() => {}}
           />
        </div>
      </main>
       <button
        onClick={scrollToTop}
        className={cn(
          'fixed bottom-8 right-8 z-50 p-2 rounded-full bg-primary text-primary-foreground shadow-lg transition-opacity hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          showScrollTop ? 'opacity-100' : 'opacity-0'
        )}
        aria-label="Scroll to top"
      >
        <ArrowUpCircle className="h-6 w-6" />
      </button>
    </div>
  );
}
