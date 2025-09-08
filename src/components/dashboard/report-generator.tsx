'use client';

import { useState, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Text, Loader, Wand2, Share2, ClipboardCopy } from 'lucide-react';
import type { Evaluation } from '@/lib/types';
import { generateCuppingReportAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

interface ReportGeneratorProps {
  evaluation: Evaluation;
}

export function ReportGenerator({ evaluation }: ReportGeneratorProps) {
  const [report, setReport] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleGenerateReport = () => {
    const cuppingData = JSON.stringify(evaluation, null, 2);
    startTransition(async () => {
      const result = await generateCuppingReportAction({ cuppingData });
      if (result.success && result.data) {
        setReport(result.data.report);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error Generating Report',
          description: result.error || 'An unknown error occurred.',
        });
      }
    });
  };

  const handleShare = () => {
    if (!report) return;
    navigator.clipboard.writeText(report);
    toast({
      title: 'Report Copied!',
      description: 'The cupping report has been copied to your clipboard.',
    });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <Wand2 className="size-6 text-primary" />
          </div>
          <div>
            <CardTitle>AI-Powered Report</CardTitle>
            <CardDescription>
              Generate a comprehensive summary.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-sm">
        {isPending ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-full mt-4" />
            <Skeleton className="h-4 w-[90%]" />
          </div>
        ) : report ? (
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-body">
            {report}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
            <Text className="size-10 mb-2" />
            <p>Your generated report will appear here.</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {report ? (
          <Button onClick={handleShare} className="w-full">
            <ClipboardCopy />
            Copy Report
          </Button>
        ) : (
          <Button
            onClick={handleGenerateReport}
            disabled={isPending}
            className="w-full"
          >
            {isPending ? (
              <>
                <Loader className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 />
                Generate Report
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
