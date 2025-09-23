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
      size="lg"
      onClick={scrollToTop}
      className={cn(
        'transition-opacity duration-300 ease-in-out',
        'bg-background/80 backdrop-blur-sm hover:bg-accent',
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <ArrowUp className="h-5 w-5 mr-2" />
      <span>Back to Top</span>
    </Button>
  );
}
