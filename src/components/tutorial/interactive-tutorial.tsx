'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/language-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TutorialStep {
  id: string;
  titleKey: string;
  descriptionKey: string;
}

interface InteractiveTutorialProps {
  onFinish: () => void;
}

const tutorialSteps: TutorialStep[] = [
  { id: 'coffeeName-section', titleKey: 'tutorialStep1Title', descriptionKey: 'tutorialStep1Desc' },
  { id: 'roastLevel-section', titleKey: 'tutorialStep2Title', descriptionKey: 'tutorialStep2Desc' },
  { id: 'cup-tabs-section', titleKey: 'tutorialStep3Title', descriptionKey: 'tutorialStep3Desc' },
  { id: 'aroma-score-slider', titleKey: 'tutorialStep4Title', descriptionKey: 'tutorialStep4Desc' },
  { id: 'temperature-tabs-section', titleKey: 'tutorialStep5Title', descriptionKey: 'tutorialStep5Desc' },
];

export function InteractiveTutorial({ onFinish }: InteractiveTutorialProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  const [dialogStyle, setDialogStyle] = useState<React.CSSProperties>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    const currentStep = tutorialSteps[stepIndex];
    if (!currentStep) return;

    const element = document.getElementById(currentStep.id);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      const handlePositionUpdate = () => {
        const rect = element.getBoundingClientRect();
        setHighlightStyle({
          position: 'fixed',
          top: `${rect.top - 4}px`,
          left: `${rect.left - 4}px`,
          width: `${rect.width + 8}px`,
          height: `${rect.height + 8}px`,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
          border: '2px solid hsl(var(--primary))',
          borderRadius: 'var(--radius)',
          zIndex: 100,
          pointerEvents: 'none',
          transition: 'top 0.3s, left 0.3s, width 0.3s, height 0.3s',
        });
        
        // --- Dialog Positioning Logic ---
        const dialogHeight = 200; // Approximate height of the dialog
        const spaceAbove = rect.top;
        const spaceBelow = window.innerHeight - rect.bottom;

        let top, transform;
        
        if (spaceBelow > dialogHeight + 20) {
            // Position below the element
            top = rect.bottom + 10;
            transform = 'translateX(-50%)';
        } else if (spaceAbove > dialogHeight + 20) {
            // Position above the element
            top = rect.top - dialogHeight - 10;
            transform = 'translateX(-50%)';
        } else {
            // Fallback to center if no space
            top = '50%';
            transform = 'translate(-50%, -50%)';
        }

        setDialogStyle({
          top: `${top}${typeof top === 'string' ? '' : 'px'}`,
          left: `50%`,
          transform: transform,
          position: 'fixed',
          zIndex: 101,
        });

        setDialogOpen(true);
      };
      
      const scrollTimeout = setTimeout(handlePositionUpdate, 300); 
      
      window.addEventListener('resize', handlePositionUpdate);

      return () => {
        clearTimeout(scrollTimeout);
        window.removeEventListener('resize', handlePositionUpdate);
      }
    }
  }, [stepIndex]);

  const handleNext = () => {
    if (stepIndex < tutorialSteps.length - 1) {
      setDialogOpen(false);
      setTimeout(() => setStepIndex(stepIndex + 1), 150);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setDialogOpen(false);
      setTimeout(() => setStepIndex(stepIndex - 1), 150);
    }
  };

  const handleFinish = () => {
    setDialogOpen(false);
    setHighlightStyle({});
    onFinish();
  };
  
  const currentStepContent = tutorialSteps[stepIndex];

  return (
    <>
      <div style={highlightStyle} />
      <Dialog open={dialogOpen} onOpenChange={(isOpen) => !isOpen && handleFinish()}>
        <DialogContent style={dialogStyle} className="w-80 sm:w-96" onInteractOutside={(e) => e.preventDefault()}>
            {currentStepContent && (
                <>
                <DialogHeader>
                    <DialogTitle>{t(currentStepContent.titleKey)}</DialogTitle>
                    <DialogDescription>
                        {t(currentStepContent.descriptionKey)}
                    </DialogDescription>
                </DialogHeader>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center pt-4">
                        <div>
                            {stepIndex > 0 && (
                            <Button variant="ghost" size="sm" onClick={handlePrev}>{t('tutorialPrevious')}</Button>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{stepIndex + 1} / {tutorialSteps.length}</span>
                            {stepIndex < tutorialSteps.length - 1 ? (
                            <Button size="sm" onClick={handleNext}>{t('tutorialNext')}</Button>
                            ) : (
                            <Button size="sm" onClick={handleFinish}>{t('tutorialFinish')}</Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={handleFinish}>{t('tutorialSkip')}</Button>
                        </div>
                    </div>
                </div>
                </>
            )}
        </DialogContent>
      </Dialog>
    </>
  );
}
