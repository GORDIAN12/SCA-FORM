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
import { ScaForm, type ScaFormValues } from './sca-form';
import { ScoresRadarChart } from './visualizations/scores-radar-chart';
import { Card, CardContent } from '../ui/card';

interface SessionViewProps {
  session: Session;
}

export function SessionView({ session: initialSession }: SessionViewProps) {
  const [session, setSession] = useState(initialSession);
  const [selectedEvalId, setSelectedEvalId] = useState<string>(
    session.evaluations[0].id
  );
  const [liveFormData, setLiveFormData] = useState<ScaFormValues | null>(null);

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
  };

  const handleValuesChange = (values: ScaFormValues) => {
    setLiveFormData(values);
  };

  const allEvaluations = session.newEvaluation
    ? [...session.evaluations, session.newEvaluation as Evaluation]
    : session.evaluations;

  return (
    <div className="space-y-6">
      <div className="col-span-full">
        <ScaForm
          onSubmit={handleFormSubmit}
          onValuesChange={handleValuesChange}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 animate-in fade-in-50 duration-500">
        <Card>
          <CardContent className="p-2 pt-4">
            {liveFormData && <ScoresRadarChart scores={liveFormData} />}
          </CardContent>
        </Card>
      </div>

      {allEvaluations.length > 1 && (
        <div className="flex justify-center">
          <Select value={selectedEvalId} onValueChange={setSelectedEvalId}>
            <SelectTrigger className="w-full md:w-[280px]">
              <SelectValue placeholder="Select an evaluation" />
            </SelectTrigger>
            <SelectContent>
              {allEvaluations.map((ev) => (
                <SelectItem key={ev.id} value={ev.id}>
                  {ev.coffeeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
