'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
import { Coffee, PlusCircle, Settings, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const roastLevelColors = {
  light: 'bg-[#966F33]',
  medium: 'bg-[#6A4C2E]',
  'medium-dark': 'bg-[#4A3522]',
  dark: 'bg-[#3A2418]',
};

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

  const handleExportToPdf = async (evaluation: Evaluation) => {
    await handleSelectEvaluation(evaluation);

    // Allow the UI to update before capturing
    setTimeout(async () => {
      const input = document.getElementById('main-content');
      if (!input) {
        toast({
          title: 'Error exporting PDF',
          description: 'Could not find the content to export.',
          variant: 'destructive',
        });
        return;
      }

      try {
        const canvas = await html2canvas(input, {
          scale: 2, // Higher scale for better quality
          useCORS: true,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height],
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`${evaluation.coffeeName.replace(/\s+/g, '-')}-evaluation.pdf`);
      } catch (error) {
        console.error('Error generating PDF:', error);
        toast({
          title: 'Error exporting PDF',
          description: 'An unexpected error occurred during PDF generation.',
          variant: 'destructive',
        });
      }
    }, 100); // 100ms delay
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
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleNewEvaluation}
                isActive={selectedEvaluation === 'new'}
              >
                <PlusCircle />
                <span>Nueva Evaluación</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {evaluations.map((evaluation) => (
              <SidebarMenuItem key={evaluation.id} className="relative group">
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
                  className="w-full pr-8"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Coffee />
                    <span
                      className={cn(
                        'size-3 rounded-full',
                        roastLevelColors[evaluation.roastLevel]
                      )}
                    />
                    <span className="truncate">{evaluation.coffeeName}</span>
                  </div>
                </SidebarMenuButton>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportToPdf(evaluation);
                  }}
                  className="absolute right-1 top-1.5 p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
                  aria-label={`Export ${evaluation.coffeeName} to PDF`}
                >
                  <FileDown className="size-4 shrink-0" />
                </button>
              </SidebarMenuItem>
            ))}
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
