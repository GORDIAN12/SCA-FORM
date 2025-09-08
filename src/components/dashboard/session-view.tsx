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
import { ScoresOverview } from './visualizations/scores-overview';
import { FlavorProfileChart } from './visualizations/flavor-profile-chart';
import { ReportGenerator } from './report-generator';
import { ScaForm } from './sca-form';

interface SessionViewProps {
  session: Session;
}

export function SessionView({ session: initialSession }: SessionViewProps) {
  const [session, setSession] = useState(initialSession);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [selectedEvalId, setSelectedEvalId] = useState<string>(
    session.evaluations[0].id
  );

  const selectedEvaluation = useMemo(() => {
    const allEvaluations = session.newEvaluation
      ? [...session.evaluations, session.newEvaluation as Evaluation]
      : session.evaluations;
    return (
      allEvaluations.find((e) => e.id === selectedEvalId) || allEvaluations[0]
    );
  }, [session, selectedEvalId]);

  const handleFormSubmit = (data: Evaluation) => {
    const newEvaluation = { ...data, id: 'new-eval' };
    setSession((prev) => ({ ...prev, newEvaluation }));
    setSelectedEvalId('new-eval');
    setIsDataLoaded(true);
  };

  const allEvaluations = session.newEvaluation
    ? [...session.evaluations, session.newEvaluation as Evaluation]
    : session.evaluations;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <ScaForm onSubmit={handleFormSubmit} />
        </div>
        <div className="lg:col-span-3">
          {isDataLoaded ? (
            <div className="animate-in fade-in-50 duration-500 space-y-6">
              {allEvaluations.length > 1 && (
                <div className="flex-shrink-0 md:ml-auto">
                  <Select
                    value={selectedEvalId}
                    onValueChange={setSelectedEvalId}
                  >
                    <SelectTrigger className="w-full md:w-[280px]">
                      <SelectValue placeholder="Select an evaluation" />
                    </SelectTrigger>
                    <SelectContent>
                      {allEvaluations.map((ev) => (
                        <SelectItem key={ev.id} value={ev.id}>
                          {ev.coffeeName} (by {ev.evaluator})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-6 lg:col-span-2">
                  <ScoresOverview evaluation={selectedEvaluation} />
                  <FlavorProfileChart evaluation={selectedEvaluation} />
                </div>
                <div className="lg:col-span-2">
                  <ReportGenerator evaluation={selectedEvaluation} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed bg-card">
              <div className="text-center text-muted-foreground p-8">
                <p className="text-lg font-medium">No Data Loaded</p>
                <p>
                  Complete and submit the SCA form to see the results and
                  generate a report.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
