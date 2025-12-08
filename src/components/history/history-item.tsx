'use client';

import type { Evaluation } from '@/lib/types';
import { Star, Trash2, FileJson } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/language-context';

interface HistoryItemProps {
  evaluation: Evaluation;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onDownloadPdf: (evaluation: Evaluation) => void;
}

export function HistoryItem({ evaluation, onDelete, onToggleFavorite, onDownloadPdf }: HistoryItemProps) {
  const { t } = useLanguage();
  return (
    <li className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors group">
        <Link href={`/evaluations/${evaluation.id}`} className="flex-1 flex items-center gap-4 cursor-pointer">
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleFavorite(evaluation.id, !!evaluation.isFavorite);
                }}
                className="hover:bg-yellow-100 dark:hover:bg-yellow-800/20"
            >
                <Star className={`h-5 w-5 ${evaluation.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground group-hover:text-yellow-500'}`} />
            </Button>
            <div className="flex-1">
                <div className="font-semibold text-base">{evaluation.coffeeName}</div>
                <div className="text-sm text-muted-foreground">
                    {evaluation.createdAt?.toDate().toLocaleDateString()} - {t('score')}: {evaluation.overallScore.toFixed(2)}
                </div>
            </div>
            <div className="text-lg font-bold text-primary pr-4">
                {evaluation.overallScore.toFixed(2)}
            </div>
        </Link>
        <div className="flex items-center gap-2">
            <Button 
                variant="ghost" 
                size="icon"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDownloadPdf(evaluation);
                }}
            >
                <FileJson className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                <span className="sr-only">Generate Report JSON</span>
            </Button>
            <Button 
                variant="ghost" 
                size="icon"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(evaluation.id);
                }}
                className="hover:bg-red-100 dark:hover:bg-red-800/20"
            >
                <Trash2 className="h-5 w-5 text-muted-foreground group-hover:text-destructive" />
                <span className="sr-only">Delete</span>
            </Button>
        </div>
    </li>
  );
}
