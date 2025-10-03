'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { ScaFormValues } from '@/lib/types';
import { DRAFTS_KEY } from './sca-form';
import { useLanguage } from '@/context/language-context';

interface DraftsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoadDraft: (draft: ScaFormValues) => void;
}

export function DraftsDialog({ open, onOpenChange, onLoadDraft }: DraftsDialogProps) {
  const [drafts, setDrafts] = useState<ScaFormValues[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    if (open) {
      const storedDrafts = JSON.parse(localStorage.getItem(DRAFTS_KEY) || '{}');
      const draftsArray = Object.values(storedDrafts) as ScaFormValues[];
      draftsArray.sort((a, b) => new Date(b.lastModified!).getTime() - new Date(a.lastModified!).getTime());
      setDrafts(draftsArray);
    }
  }, [open]);

  const handleDelete = (draftId: string) => {
    const storedDrafts = JSON.parse(localStorage.getItem(DRAFTS_KEY) || '{}');
    delete storedDrafts[draftId];
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(storedDrafts));
    setDrafts((prev) => prev.filter((d) => d.draftId !== draftId));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('myDrafts')}</DialogTitle>
          <DialogDescription>
            {t('draftsDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {drafts.length > 0 ? (
            <ul className="space-y-2">
              {drafts.map((draft) => (
                <li key={draft.draftId} className="flex items-center justify-between p-2 rounded-md hover:bg-accent">
                  <button
                    className="flex-1 text-left"
                    onClick={() => onLoadDraft(draft)}
                  >
                    <div className="font-semibold">{draft.coffeeName || t('untitledDraft')}</div>
                    <div className="text-sm text-muted-foreground">
                      {t('lastModified')}: {new Date(draft.lastModified!).toLocaleString()}
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(draft.draftId!)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-muted-foreground">{t('noDrafts')}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
