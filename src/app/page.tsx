'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScaForm } from '@/components/dashboard/sca-form';
import type { Evaluation } from '@/lib/types';
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
  SidebarMenu,
  SidebarFooter,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { EvaluationHistory } from '@/components/dashboard/evaluation-history';
import { Menu, LogOut, Settings } from 'lucide-react';
import { SettingsDialog } from '@/components/settings-dialog';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const formRef = useRef<{ submit: () => void; reset: () => void }>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

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
        title: 'Evaluation Saved',
        description: 'Your coffee evaluation has been saved.',
      });
      formRef.current?.reset();
      router.push(`/evaluations/${docRef.id}`);
    } catch (error: any) {
      toast({
        title: 'Error Saving Evaluation',
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

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent className="p-0">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
              <CuppingCompassLogo className="size-8 text-primary" />
              <h2 className="text-lg font-semibold">Cupping Compass</h2>
            </div>
          </SidebarHeader>
          <SidebarMenu className="flex-1 px-4">
            <EvaluationHistory userId={user.uid} />
          </SidebarMenu>
          <SidebarFooter className="p-4 flex flex-col gap-2">
             <SidebarMenuButton onClick={() => setIsSettingsOpen(true)}>
                <Settings className="size-4" />
                <span>Settings</span>
              </SidebarMenuButton>
            <SidebarMenuButton
              onClick={async () => {
                const { getAuth, signOut } = await import('firebase/auth');
                const auth = getAuth();
                await signOut(auth);
                router.push('/login');
              }}
            >
              <LogOut className="size-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarFooter>
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
              <h1 className="text-xl font-semibold">New Evaluation</h1>
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
                  {isSubmitting ? 'Saving...' : 'Save Evaluation'}
                </Button>
              </div>
            </div>
          </main>
        </div>
      </SidebarInset>
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </SidebarProvider>
  );
}
