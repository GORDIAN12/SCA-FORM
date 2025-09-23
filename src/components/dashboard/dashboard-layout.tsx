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

  const handleExportToPdf = async (evaluation: Evaluation) => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      };

      const capitalize = (s: string) =>
        s.charAt(0).toUpperCase() + s.slice(1);

      // --- PDF Header ---
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('Cupping Compass - Evaluation Report', pageWidth / 2, y, {
        align: 'center',
      });
      y += 10;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text(`Coffee: ${evaluation.coffeeName}`, margin, y);
      doc.text(
        `Overall Score: ${evaluation.overallScore.toFixed(2)}`,
        pageWidth - margin,
        y,
        { align: 'right' }
      );
      y += 10;
      doc.setDrawColor(200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;

      // --- Draw Score Bar ---
      const drawScoreBar = (
        label: string,
        score: number,
        x: number,
        barY: number
      ) => {
        const barMaxWidth = contentWidth * 0.4;
        const barHeight = 5;
        const scoreRange = 10 - 6; // Scores are from 6 to 10
        const scorePercentage = (score - 6) / scoreRange;
        const barWidth = scorePercentage * barMaxWidth;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(label, x, barY + barHeight / 2, {
          baseline: 'middle',
        });

        const barX = x + 30;
        doc.setDrawColor('#cccccc');
        doc.setFillColor('#e0e0e0');
        doc.rect(barX, barY, barMaxWidth, barHeight, 'FD'); // Background bar
        doc.setFillColor('#4A3522');
        doc.rect(barX, barY, barWidth, barHeight, 'F'); // Score bar
        doc.text(score.toFixed(2), barX + barMaxWidth + 5, barY + barHeight / 2, {
          baseline: 'middle',
        });
      };

      // --- Loop through cups and temperatures ---
      for (let cupIndex = 0; cupIndex < evaluation.cups.length; cupIndex++) {
        const cup = evaluation.cups[cupIndex];
        checkPageBreak(80); // Estimate height for a full cup section
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Cup ${cupIndex + 1}`, margin, y);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Cup Total Score: ${cup.totalScore.toFixed(2)}`,
          pageWidth - margin,
          y,
          { align: 'right' }
        );
        y += 8;

        // Draw Aroma score for the cup
        drawScoreBar('Aroma:', cup.aroma, margin + 5, y);
        y += 10;

        for (const temp of ['hot', 'warm', 'cold'] as const) {
          checkPageBreak(50);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(capitalize(temp), margin + 5, y);
          y += 8;

          const scores = cup.scores[temp];
          const scoreKeys: (keyof ScoreSet)[] = [
            'flavor',
            'aftertaste',
            'acidity',
            'body',
            'balance',
          ];

          scoreKeys.forEach((key) => {
            if (typeof scores[key] === 'number') {
              drawScoreBar(
                `${capitalize(key)}:`,
                scores[key] as number,
                margin + 10,
                y
              );
              y += 8;
            }
          });

          if (temp !== 'cold') {
            y += 2;
            doc.setLineDashPattern([1, 1], 0);
            doc.line(margin, y, pageWidth - margin, y);
            doc.setLineDashPattern([], 0);
            y += 8;
          }
        }
        y += 10; // Extra space between cups
      }

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
            <h2 className="text-lg font-semibold sm:text-xl">
              {currentTitle}
            </h2>
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
