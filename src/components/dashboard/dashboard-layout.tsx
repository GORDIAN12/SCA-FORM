'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
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
import type { Evaluation, ScoreSet } from '@/lib/types';
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

  const handleExportToPdf = (evaluation: Evaluation) => {
    try {
      const doc = new jsPDF();
      const pageHeight = doc.internal.pageSize.height;
      let y = 20;

      // Helper function to check for page breaks
      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
      };

      // Title
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('Cupping Compass - Evaluation Report', 105, y, {
        align: 'center',
      });
      y += 10;

      // Coffee Name and Score
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text(`Coffee: ${evaluation.coffeeName}`, 20, y);
      doc.text(
        `Overall Score: ${evaluation.overallScore.toFixed(2)}`,
        190,
        y,
        { align: 'right' }
      );
      y += 10;

      doc.setDrawColor(200);
      doc.line(20, y, 190, y); // Horizontal line
      y += 10;

      const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

      evaluation.cups.forEach((cup, cupIndex) => {
        checkPageBreak(70); // Estimate height for a cup section
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Taza ${cupIndex + 1}`, 20, y);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Puntaje Total Taza: ${cup.totalScore.toFixed(2)}`,
          190,
          y,
          { align: 'right' }
        );
        y += 8;

        (['hot', 'warm', 'cold'] as const).forEach((temp) => {
          checkPageBreak(40); // Estimate height for a temp section
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(capitalize(temp), 25, y);
          y += 6;

          const scores = cup.scores[temp];
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');

          Object.entries(scores).forEach(([key, value]) => {
            if (typeof value === 'number') {
              doc.text(
                `${capitalize(key)}: ${value.toFixed(2)}`,
                30,
                y
              );
              y += 5;
            } else {
              doc.text(
                `${capitalize(key)} Intensity: ${value}`,
                30,
                y
              );
              y += 5;
            }
          });
          y += 2; // Extra space between temp sections
        });
        doc.setLineDashPattern([1, 1], 0);
        doc.line(20, y, 190, y);
        doc.setLineDashPattern([], 0);
        y += 8;
      });

      doc.save(`${evaluation.coffeeName.replace(/\s+/g, '-')}-evaluation.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error exporting PDF',
        description: 'An unexpected error occurred during PDF generation.',
        variant: 'destructive',
      });
    }
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
