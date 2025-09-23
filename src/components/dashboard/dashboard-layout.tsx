'use client';

import { useState } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Evaluation } from '@/lib/types';
import { SessionView } from './session-view';
import { CuppingCompassLogo } from '../cupping-compass-logo';
import { Coffee, PlusCircle, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function DashboardLayout() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState<
    Evaluation | 'new'
  >('new');
  const [key, setKey] = useState(Date.now());
  const { toast } = useToast();

  const handleAddEvaluation = (evaluation: Evaluation) => {
    if (
      evaluations.some(
        (e) => e.coffeeName.toLowerCase() === evaluation.coffeeName.toLowerCase()
      )
    ) {
      toast({
        title: 'Duplicate Coffee Name',
        description:
          'An evaluation with this coffee name already exists. Please use a different name.',
        variant: 'destructive',
      });
      return;
    }

    const newEvaluations = [...evaluations, evaluation];
    setEvaluations(newEvaluations);
    setSelectedEvaluation(evaluation);
    setKey(Date.now());
  };

  const handleSelectEvaluation = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setKey(Date.now());
  };

  const handleNewEvaluation = () => {
    setSelectedEvaluation('new');
    setKey(Date.now());
  };

  const currentEvaluationData =
    selectedEvaluation === 'new' ? null : selectedEvaluation;
  const currentTitle =
    selectedEvaluation === 'new'
      ? 'Nueva Evaluación'
      : selectedEvaluation.coffeeName;

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <CuppingCompassLogo className="size-8 text-primary" />
            <h1 className="text-xl font-headline font-semibold">
              Cupping Compass
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-2 font-semibold">Bitácora</div>
          <SidebarMenu>
            {evaluations.map((evaluation) => (
              <SidebarMenuItem key={evaluation.id}>
                <SidebarMenuButton
                  onClick={() => handleSelectEvaluation(evaluation)}
                  isActive={
                    selectedEvaluation !== 'new' &&
                    selectedEvaluation.id === evaluation.id
                  }
                  tooltip={{
                    children: evaluation.coffeeName,
                    className: 'w-48 text-center',
                  }}
                >
                  <Coffee />
                  <span>{evaluation.coffeeName}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleNewEvaluation}
                isActive={selectedEvaluation === 'new'}
              >
                <PlusCircle />
                <span>Nueva Evaluación</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={{
                  children: 'Settings',
                }}
              >
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="justify-start"
                tooltip={{ children: 'User Profile' }}
              >
                <Avatar className="size-6">
                  <AvatarImage src="https://picsum.photos/100" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <span>User Profile</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold sm:text-xl">{currentTitle}</h2>
            {currentEvaluationData && (
              <p className="text-sm text-muted-foreground">
                Roast: {currentEvaluationData.roastLevel}
              </p>
            )}
          </div>
        </header>
        <main id="main-content" className="flex-1 overflow-auto p-4 sm:p-6">
          <SessionView
            key={key}
            evaluation={currentEvaluationData}
            onAddEvaluation={handleAddEvaluation}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
