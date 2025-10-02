'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
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
import {
  Coffee,
  PlusCircle,
  Settings,
  FileDown,
  LogOut,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '../ui/button';
import {
  useAuth,
  useUser,
  useFirestore,
  useCollection,
  useMemoFirebase,
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase';
import { signOut } from 'firebase/auth';
import {
  collection,
  query,
  orderBy,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const roastLevelColors = {
  light: 'bg-[#966F33]',
  medium: 'bg-[#6A4C2E]',
  'medium-dark': 'bg-[#4A3522]',
  dark: 'bg-[#3A2418]',
};

export function DashboardLayout() {
  const auth = useAuth();
  const { user } = useUser();
  const firestore = useFirestore();

  const evaluationsCollectionRef = useMemoFirebase(
    () =>
      user ? collection(firestore, 'users', user.uid, 'evaluations') : null,
    [firestore, user]
  );
  const evaluationsQuery = useMemoFirebase(
    () =>
      evaluationsCollectionRef
        ? query(evaluationsCollectionRef, orderBy('createdAt', 'desc'))
        : null,
    [evaluationsCollectionRef]
  );

  const { data: evaluations = [], isLoading: isLoadingEvaluations } =
    useCollection<Evaluation>(evaluationsQuery);

  const [selectedEvaluation, setSelectedEvaluation] = useState<
    Evaluation | 'new'
  >('new');
  const [key, setKey] = useState(Date.now());
  const [theme, setTheme] = useState('light');
  const { toast } = useToast();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const handleAddEvaluation = (evaluationData: Omit<Evaluation, 'id'>) => {
    if (!evaluationsCollectionRef) return;
    if (
      evaluations.some(
        (e) =>
          e.coffeeName.toLowerCase() ===
          evaluationData.coffeeName.toLowerCase()
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

    const newEvaluation = {
      ...evaluationData,
      createdAt: serverTimestamp(),
    };

    addDocumentNonBlocking(evaluationsCollectionRef, newEvaluation)
      .then((docRef) => {
        toast({
          title: 'Evaluation Saved',
          description: 'Your coffee evaluation has been saved to the cloud.',
        });
        // We don't need to manually select it, the collection listener will update the UI
        // and the user can select it from the list.
        handleNewEvaluation();
      })
      .catch((error) => {
        console.error('Error adding document: ', error);
        toast({
          title: 'Error Saving',
          description:
            'There was an issue saving your evaluation. Please try again.',
          variant: 'destructive',
        });
      });
  };

  const handleDeleteEvaluation = (evaluationId: string) => {
    if (!user) return;
    const docRef = doc(
      firestore,
      'users',
      user.uid,
      'evaluations',
      evaluationId
    );
    deleteDocumentNonBlocking(docRef);
    toast({
      title: 'Evaluation Deleted',
      description: 'The evaluation has been removed.',
    });
    // If the deleted one was selected, go back to new evaluation screen
    if (
      selectedEvaluation !== 'new' &&
      selectedEvaluation.id === evaluationId
    ) {
      handleNewEvaluation();
    }
  };

  const handleSelectEvaluation = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setKey(Date.now());
  };

  const handleNewEvaluation = () => {
    setSelectedEvaluation('new');
    setKey(Date.now());
  };

  const drawScore = (
    doc: jsPDF,
    label: string,
    score: number,
    x: number,
    lineY: number
  ) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(label, x, lineY, {
      baseline: 'middle',
    });
    doc.text(score.toFixed(2), x + 40, lineY, {
      baseline: 'middle',
    });
  };

  const handleExportToPdf = async (evaluation: Evaluation) => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;
      const margin = 15;
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
        drawScore(doc, 'Aroma:', cup.aroma, margin + 5, y);
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
              drawScore(
                doc,
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

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // The redirect is handled by the page component
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error Signing Out',
        description: 'Could not sign out. Please try again.',
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
                  className="w-full pr-14"
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

                <div className="absolute right-1 top-1.5 flex items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportToPdf(evaluation);
                    }}
                    className="p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
                    aria-label={`Export ${evaluation.coffeeName} to PDF`}
                  >
                    <FileDown className="size-4 shrink-0" />
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                        aria-label={`Delete ${evaluation.coffeeName}`}
                      >
                        <Trash2 className="size-4 shrink-0" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the evaluation for &quot;
                          {evaluation.coffeeName}&quot;.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel
                          onClick={(e) => e.stopPropagation()}
                        >
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvaluation(evaluation.id);
                          }}
                          className={cn(
                            'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                          )}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <Dialog>
                <DialogTrigger asChild>
                  <SidebarMenuButton
                    tooltip={{
                      children: 'Settings',
                    }}
                  >
                    <Settings />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>
                      Customize your experience.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="language" className="text-right">
                        Language
                      </Label>
                      <Select defaultValue="en">
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Interface Theme</Label>
                      <RadioGroup
                        value={theme}
                        onValueChange={setTheme}
                        className="col-span-3 flex items-center space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="light" id="light" />
                          <Label htmlFor="light">Light</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="dark" id="dark" />
                          <Label htmlFor="dark">Dark</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    className="justify-start"
                    tooltip={{ children: 'User Profile' }}
                  >
                    <Avatar className="size-6">
                      <AvatarImage
                        src={user?.photoURL ?? 'https://picsum.photos/100'}
                      />
                      <AvatarFallback>
                        {user?.email?.[0].toUpperCase() ?? 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span>User Profile</span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.displayName ?? 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
