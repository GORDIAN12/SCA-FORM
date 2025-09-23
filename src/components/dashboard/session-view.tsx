'use client';

import { useState, useMemo } from 'react';
import type { Session, Evaluation, CupEvaluation } from '@/lib/types';
import {
  ScaForm,
  type ScaFormValues,
  type CupFormValues,
} from './sca-form';
import { ScoresRadarChart } from './visualizations/scores-radar-chart';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { BackToTopButton } from '../ui/back-to-top-button';

interface SessionViewProps {
  session: Session;
}

export function SessionView({ session: initialSession }: SessionViewProps) {
  const [session, setSession] = useState(initialSession);
  const [liveFormData, setLiveFormData] = useState<ScaFormValues | null>(null);
  const [activeCupId, setActiveCupId] = useState('cup-1');
  const [activeCupData, setActiveCupData] = useState<CupFormValues | null>(
    null
  );
  const [activeTempTab, setActiveTempTab] = useState('hot');

  const handleFormSubmit = (data: Evaluation) => {
    const newEvaluation = { ...data, id: `eval-${Date.now()}` };
    setSession((prev) => ({
      ...prev,
      evaluations: [...prev.evaluations, newEvaluation],
    }));
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

  const activeRadarChartData = useMemo(() => {
    if (!activeCupData) return null;
    const scores =
      activeCupData.scores[activeTempTab as keyof CupEvaluation['scores']];
    return {
      ...scores,
      aroma: activeCupData.aroma,
      cupperScore: activeCupData.cupperScore,
    };
  }, [activeCupData, activeTempTab]);

  return (
    <div className="space-y-6">
      <div className="col-span-full">
        <ScaForm
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
              <TabsContent value="hot">
                {activeRadarChartData && (
                  <ScoresRadarChart scores={activeRadarChartData} />
                )}
              </TabsContent>
              <TabsContent value="warm">
                {activeRadarChartData && (
                  <ScoresRadarChart scores={activeRadarChartData} />
                )}
              </TabsContent>
              <TabsContent value="cold">
                {activeRadarChartData && (
                  <ScoresRadarChart scores={activeRadarChartData} />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-center py-4">
        <BackToTopButton targetId="main-content" />
      </div>
    </div>
  );
}
