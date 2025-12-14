'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/language-context';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TutorialStep {
  id: string;
  titleKey: string;
  descriptionKey: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface InteractiveTutorialProps {
  onFinish: () => void;
}

const tutorialSteps: TutorialStep[] = [
  { id: 'coffeeName-section', titleKey: 'tutorialStep1Title', descriptionKey: 'tutorialStep1Desc', position: 'bottom' },
  { id: 'roastLevel-section', titleKey: 'tutorialStep2Title', descriptionKey: 'tutorialStep2Desc', position: 'bottom' },
  { id: 'cup-tabs-section', titleKey: 'tutorialStep3Title', descriptionKey: 'tutorialStep3Desc', position: 'bottom' },
  { id: 'aroma-score-slider', titleKey: 'tutorialStep4Title', descriptionKey: 'tutorialStep4Desc', position: 'top' },
  { id: 'temperature-tabs-section', titleKey: 'tutorialStep5Title', descriptionKey: 'tutorialStep5Desc', position: 'bottom' },
];

export function InteractiveTutorial({ onFinish }: InteractiveTutorialProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { t } = useLanguage();
  const targetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    const currentStep = tutorialSteps[stepIndex];
    const element = document.getElementById(currentStep.id);

    if (element) {
      targetRef.current = element;
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      const handleScrollEnd = () => {
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
        setPopoverOpen(true);
      };
      
      const scrollTimeout = setTimeout(handleScrollEnd, 300); // Wait for scroll to finish
      return () => clearTimeout(scrollTimeout);
    }
  }, [stepIndex]);

  const handleNext = () => {
    if (stepIndex < tutorialSteps.length - 1) {
      setPopoverOpen(false);
      setStepIndex(stepIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setPopoverOpen(false);
      setStepIndex(stepIndex - 1);
    }
  };

  const handleFinish = () => {
    setPopoverOpen(false);
    onFinish();
  };

  return (
    <>
      <div style={highlightStyle} />
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <div ref={targetRef} />
        </PopoverTrigger>
        <PopoverContent
          side={tutorialSteps[stepIndex]?.position || 'bottom'}
          className="z-[101] w-80"
          sideOffset={10}
          align="start"
        >
          <div className="space-y-4">
            <h4 className="font-semibold">{t(tutorialSteps[stepIndex]?.titleKey)}</h4>
            <p className="text-sm text-muted-foreground">
              {t(tutorialSteps[stepIndex]?.descriptionKey)}
            </p>
            <div className="flex justify-between items-center">
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
        </PopoverContent>
      </Popover>
    </>
  );
}