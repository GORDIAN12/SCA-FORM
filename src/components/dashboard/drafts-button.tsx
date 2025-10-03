'use client';

import { useState, useEffect, type RefObject } from 'react';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { FileText } from 'lucide-react';
import type { ScaFormRef, ScaFormValues } from './sca-form';
import { AUTOSAVE_KEY } from './sca-form';

interface DraftsButtonProps {
    formRef: RefObject<ScaFormRef>;
}

export function DraftsButton({ formRef }: DraftsButtonProps) {
  const [draft, setDraft] = useState<ScaFormValues | null>(null);

  useEffect(() => {
    // This effect runs on the client and checks for drafts periodically
    const checkDrafts = () => {
      try {
        const savedData = localStorage.getItem(AUTOSAVE_KEY);
        if (savedData) {
          const parsedData = JSON.parse(savedData) as ScaFormValues;
          if(parsedData.coffeeName) {
            setDraft(parsedData);
          } else {
            setDraft(null);
          }
        } else {
          setDraft(null);
        }
      } catch (error) {
        console.error('Failed to check for drafts', error);
        setDraft(null);
      }
    };

    checkDrafts();
    const interval = setInterval(checkDrafts, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const handleLoadDraft = () => {
    formRef.current?.loadDraft();
  };

  if (!draft) {
    return null;
  }

  return (
    <SidebarMenuButton onClick={handleLoadDraft}>
      <FileText className="size-4" />
      <span className="truncate">Draft: {draft.coffeeName}</span>
    </SidebarMenuButton>
  );
}
