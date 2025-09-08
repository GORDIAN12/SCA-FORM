'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUp, Loader, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  onDataLoad: () => void;
  isDataLoaded: boolean;
}

export function FileUploader({ onDataLoad, isDataLoaded }: FileUploaderProps) {
  const [isPending, startTransition] = useTransition();
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileSelect = () => {
    // In a real app, this would open a file dialog.
    // Here we simulate selecting a file and processing it.
    setFileName('SCA_Evaluation_Form.xlsx');
    startTransition(() => {
      // Simulate processing delay
      setTimeout(() => {
        onDataLoad();
      }, 1500);
    });
  };

  return (
    <Card className="flex-1">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex size-10 items-center justify-center rounded-full bg-secondary',
                isDataLoaded && 'bg-green-100 dark:bg-green-900'
              )}
            >
              {isDataLoaded ? (
                <CheckCircle2 className="size-6 text-green-600 dark:text-green-400" />
              ) : (
                <FileUp className="size-6 text-secondary-foreground" />
              )}
            </div>
            <div>
              <p className="font-semibold">
                {isDataLoaded ? 'Data Loaded' : 'Upload SCA File'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isDataLoaded
                  ? fileName
                  : 'CSV or Excel files are supported'}
              </p>
            </div>
          </div>
          <Button
            onClick={handleFileSelect}
            disabled={isPending || isDataLoaded}
            size="sm"
          >
            {isPending ? (
              <>
                <Loader className="mr-2 animate-spin" />
                Processing...
              </>
            ) : isDataLoaded ? (
              'Loaded'
            ) : (
              'Upload'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
