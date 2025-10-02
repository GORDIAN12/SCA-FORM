'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import type { Evaluation, CupEvaluation } from '@/lib/types';
import {
  ScaForm,
  type ScaFormValues,
  type CupFormValues,
} from './sca-form';
import { ScoresRadarChart } from './visualizations/scores-radar-chart';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';

interface SessionViewProps {
  evaluation: Evaluation | null;
  onAddEvaluation: (evaluation: Omit<Evaluation, 'id' | 'createdAt'>) => void;
}

export function SessionView({
  evaluation,
  onAddEvaluation,
}: SessionViewProps) {
  const [liveFormData, setLiveFormData] = useState<ScaFormValues | null>(null);
  const [activeCupId, setActiveCupId] = useState('cup-1');
  const [activeCupData, setActiveCupData] = useState<CupFormValues | null>(
    null
  );
  const [activeTempTab, setActiveTempTab] = useState('hot');
  const formRef = useRef<{ submit: () => void; reset: () => void }>(null);

  useEffect(() => {
    // If an existing evaluation is passed, update the form
    // The form component itself will handle this via its props
  }, [evaluation]);

  const handleFormSubmit = (data: Omit<Evaluation, 'id' | 'createdAt'>) => {
    onAddEvaluation(data);
  };

  const handleValuesChange = (values: ScaFormValues) => {
    setLiveFormData(values);
  };

  const handleActiveCupChange = (
    cupId: string,
    cupData: CupFormValues | null
  ) => {
    setActiveCupId(cupId);
    setActiveCupData(cupData);
  };

  const handleTriggerSubmit = () => {
    formRef.current?.submit();
  };

  const activeRadarChartData = useMemo(() => {
    const data = evaluation
      ? evaluation.cups.find((c) => c.id === activeCupId)
      : activeCupData;
    if (!data) return null;
    const scores =
      data.scores[activeTempTab as keyof CupEvaluation['scores']];
    return {
      ...scores,
      aroma: data.aroma,
      cupperScore: data.cupperScore,
    };
  }, [evaluation, activeCupData, activeTempTab, activeCupId]);

  const isReadOnly = !!evaluation;

  return (
    <div className="space-y-6">
      <div className="col-span-full">
        <ScaForm
          ref={formRef}
          initialData={evaluation}
          onSubmit={handleFormSubmit}
          onValuesChange={handleValuesChange}
          onActiveCupChange={handleActiveCupChange}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 animate-in fade-in-50 duration-500">
        <Card>
          <CardContent className="p-2 pt-4">
            <Tabs
              defaultValue="hot"
              className="w-full"
              onValueChange={setActiveTempTab}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="hot">Hot</TabsTrigger>
                <TabsTrigger value="warm">Warm</TabsTrigger>
                <TabsTrigger value="cold">Cold</TabsTrigger>
              </TabsList>
              {(['hot', 'warm', 'cold'] as const).map((temp) => (
                <TabsContent key={temp} value={temp}>
                  {activeRadarChartData ? (
                    <ScoresRadarChart scores={activeRadarChartData} />
                  ) : (
                    <div className="flex justify-center items-center h-72 text-muted-foreground">
                      Complete el formulario para ver la visualización
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {!isReadOnly && (
        <div className="flex justify-center">
          <Button onClick={handleTriggerSubmit} className="w-full md:w-1/2">
            Submit Evaluation
          </Button>
        </div>
      )}
    </div>
  );
}