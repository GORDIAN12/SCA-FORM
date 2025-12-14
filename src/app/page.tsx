'use client';

import { useUser } from '@/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScaForm, ScaFormRef } from '@/components/dashboard/sca-form';
import type { Evaluation, ScaFormValues } from '@/lib/types';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { CuppingCompassLogo } from '@/components/cupping-compass-logo';
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
} from '@/components/ui/sidebar';
import { EvaluationHistory } from '@/components/dashboard/evaluation-history';
import { Menu, ArrowUpCircle } from 'lucide-react';
import { SettingsDialog } from '@/components/settings-dialog';
import { DraftsDialog } from '@/components/dashboard/drafts-dialog';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';
import { InteractiveTutorial } from '@/components/tutorial/interactive-tutorial';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const firestore = useFirestore();
  const { toast } = useToast();
  const formRef = useRef<ScaFormRef>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDraftsOpen, setIsDraftsOpen] = useState(false);
  const [draftToLoad, setDraftToLoad] = useState<ScaFormValues | null>(null);
  const { t } = useLanguage();
  const [showTutorial, setShowTutorial] = useState(false);

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // The scroll container is SidebarInset which is a <main> tag.
      // However, the scrolling is on the window.
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

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (draftToLoad) {
      formRef.current?.loadDraft(draftToLoad);
      setDraftToLoad(null); // Reset after loading
    }
  }, [draftToLoad]);
  
  useEffect(() => {
    const isNewUser = searchParams.get('new_user');
    if (isNewUser === 'true') {
      window.scrollTo(0, 0);
      setShowTutorial(true);
      // Clean up the URL
      router.replace('/', { scroll: false });
    }
  }, [searchParams, router]);

  const handleAddEvaluation = async (
    evaluationData: Omit<Evaluation, 'id' | 'createdAt' | 'userId'>
  ) => {
    if (!user || !firestore) return;

    setIsSubmitting(true);
    const newEvaluation = {
      ...evaluationData,
      userId: user.uid,
      createdAt: serverTimestamp(),
    };

    try {
      const evaluationsCollection = collection(
        firestore,
        'users',
        user.uid,
        'evaluations'
      );
      const docRef = await addDoc(evaluationsCollection, newEvaluation);
      toast({
        title: t('evaluationSaved'),
        description: t('evaluationSavedDescription'),
      });
      formRef.current?.reset(true); // pass true to indicate it's a final submission
      router.push(`/evaluations/${docRef.id}`);
    } catch (error: any) {
      toast({
        title: t('errorSavingEvaluation'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTriggerSubmit = () => {
    formRef.current?.submit();
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    );
  }

  const handleLoadDraft = (draft: ScaFormValues) => {
    setDraftToLoad(draft);
    setIsDraftsOpen(false);
  };
  
  const startTutorial = () => {
    window.scrollTo(0, 0);
    setShowTutorial(true);
    setIsSettingsOpen(false);
  };

  return (
    <>
    {showTutorial && <InteractiveTutorial onFinish={() => setShowTutorial(false)} />}
    <SidebarProvider>
      <Sidebar>
        <SidebarContent className="p-0">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
              <CuppingCompassLogo className="size-8 text-primary" />
              <h2 className="text-lg font-semibold">Cupping Compass</h2>
            </div>
          </SidebarHeader>
          <EvaluationHistory 
            onDraftsClick={() => setIsDraftsOpen(true)}
            onSettingsClick={() => setIsSettingsOpen(true)}
           />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="min-h-screen bg-background">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden">
                <Menu />
              </SidebarTrigger>
              <CuppingCompassLogo className="size-8 text-primary hidden sm:block" />
              <h1 className="text-xl font-semibold">{t('newEvaluation')}</h1>
            </div>
          </header>
          <main className="p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-4xl space-y-6">
              <ScaForm
                ref={formRef}
                onSubmit={handleAddEvaluation}
                isSubmitting={isSubmitting}
              />
              <div className="flex justify-center">
                <Button
                  onClick={handleTriggerSubmit}
                  className="w-full md:w-1/2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('saving') : t('saveEvaluation')}
                </Button>
              </div>
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
      </SidebarInset>
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} onStartTutorial={startTutorial} />
      <DraftsDialog open={isDraftsOpen} onOpenChange={setIsDraftsOpen} onLoadDraft={handleLoadDraft} />
    </SidebarProvider>
    </>
  );
}