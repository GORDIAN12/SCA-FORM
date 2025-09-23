'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface BackToTopButtonProps {
  targetId: string;
}

export function BackToTopButton({ targetId }: BackToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setTargetElement(document.getElementById(targetId));
  }, [targetId]);

  const toggleVisibility = () => {
    if (targetElement && targetElement.scrollTop > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    targetElement?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    if (targetElement) {
      targetElement.addEventListener('scroll', toggleVisibility);
    }
    return () => {
      if (targetElement) {
        targetElement.removeEventListener('scroll', toggleVisibility);
      }
    };
  }, [targetElement]);

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={scrollToTop}
      className={cn(
        'fixed bottom-8 right-8 z-50 rounded-full h-12 w-12 shadow-lg transition-opacity duration-300 ease-in-out',
        'bg-background/80 backdrop-blur-sm hover:bg-accent',
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <ArrowUp className="h-6 w-6" />
      <span className="sr-only">Go to top</span>
    </Button>
  );
}
