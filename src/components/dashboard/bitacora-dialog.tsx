'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import type { Evaluation } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';

interface BitacoraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function BitacoraDialog({ open, onOpenChange, userId }: BitacoraDialogProps) {
  const firestore = useFirestore();

  const evaluationsQuery = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return query(
      collection(firestore, 'users', userId, 'evaluations'),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, userId]);

  const { data: evaluations, isLoading } = useCollection<Evaluation>(evaluationsQuery);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bitácora de Evaluaciones</DialogTitle>
          <DialogDescription>
            Aquí están todas tus evaluaciones de café guardadas.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}
          {evaluations && evaluations.length > 0 ? (
            <ul className="space-y-2">
              {evaluations.map((evaluation) => (
                <li key={evaluation.id}>
                  <Button asChild variant="ghost" className="w-full justify-start">
                    <Link href={`/evaluations/${evaluation.id}`} onClick={() => onOpenChange(false)}>
                      <div className="flex-1 text-left">
                        <div className="font-semibold">{evaluation.coffeeName}</div>
                        <div className="text-sm text-muted-foreground">
                          {evaluation.createdAt?.toDate().toLocaleDateString()} - Score: {evaluation.overallScore.toFixed(2)}
                        </div>
                      </div>
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            !isLoading && <p className="text-center text-muted-foreground">No hay evaluaciones guardadas.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
