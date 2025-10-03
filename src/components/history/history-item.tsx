'use client';

import type { Evaluation } from '@/lib/types';
import { motion } from 'framer-motion';
import { Star, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HistoryItemProps {
  evaluation: Evaluation;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
}

const DRAG_THRESHOLD = 100;

export function HistoryItem({ evaluation, onDelete, onToggleFavorite }: HistoryItemProps) {
  
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: any) => {
    if (info.offset.x > DRAG_THRESHOLD) {
      onDelete(evaluation.id);
    } else if (info.offset.x < -DRAG_THRESHOLD) {
      onToggleFavorite(evaluation.id, !!evaluation.isFavorite);
    }
  };

  return (
    <motion.li
        initial={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0, transition: { duration: 0.3 } }}
        layout
        className="relative"
      >
        <div className="absolute inset-y-0 left-0 flex items-center justify-between w-full">
            <div className="bg-red-500 text-white h-full flex items-center px-6 rounded-l-md">
                <Trash2 className="h-5 w-5" />
            </div>
            <div className="bg-yellow-400 text-white h-full flex items-center px-6 rounded-r-md">
                <Star className="h-5 w-5" />
            </div>
        </div>
        <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            className="relative z-10 bg-background"
        >
          <Button asChild variant="ghost" className="w-full h-auto justify-start text-left p-4 cursor-pointer">
            <Link href={`/evaluations/${evaluation.id}`}>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        {evaluation.isFavorite && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
                        <div className="font-semibold text-base">{evaluation.coffeeName}</div>
                    </div>
                    <div className="text-sm text-muted-foreground ml-6">
                        {evaluation.createdAt?.toDate().toLocaleDateString()} - Score: {evaluation.overallScore.toFixed(2)}
                    </div>
                </div>
                <div className="text-lg font-bold text-primary">
                    {evaluation.overallScore.toFixed(2)}
                </div>
            </Link>
          </Button>
        </motion.div>
    </motion.li>
  );
}
