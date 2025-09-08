'use client';

import { useState, useMemo } from 'react';
import type { Session, Evaluation } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileUploader } from './file-uploader';
import { ScoresOverview } from './visualizations/scores-overview';
import { FlavorProfileChart } from './visualizations/flavor-profile-chart';
import { ReportGenerator } from './report-generator';

interface SessionViewProps {
  session: Session;
}

export function SessionView({ session }: SessionViewProps) {
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [selectedEvalId, setSelectedEvalId] = useState<string>(
    session.evaluations[0].id
  );

  const selectedEvaluation = useMemo(() => {
    return (
      session.evaluations.find((e) => e.id === selectedEvalId) ||
      session.evaluations[0]
    );
  }, [session, selectedEvalId]);

  const handleDataLoad = () => {
    setIsDataLoaded(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <FileUploader onDataLoad={handleDataLoad} isDataLoaded={isDataLoaded} />
        {session.evaluations.length > 1 && (
          <div className="flex-shrink-0 md:ml-auto">
            <Select
              defaultValue={selectedEvalId}
              onValueChange={setSelectedEvalId}
            >
              <SelectTrigger className="w-full md:w-[280px]">
                <SelectValue placeholder="Select an evaluation" />
              </SelectTrigger>
              <SelectContent>
                {session.evaluations.map((ev) => (
                  <SelectItem key={ev.id} value={ev.id}>
                    {ev.coffeeName} (by {ev.evaluator})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {isDataLoaded ? (
        <div className="grid animate-in fade-in-50 duration-500 grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <ScoresOverview evaluation={selectedEvaluation} />
            <FlavorProfileChart evaluation={selectedEvaluation} />
          </div>
          <div className="lg:col-span-1">
            <ReportGenerator evaluation={selectedEvaluation} />
          </div>
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed bg-card">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium">No Data Loaded</p>
            <p>Upload an SCA evaluation file to see the results.</p>
          </div>
        </div>
      )}
    </div>
  );
}
