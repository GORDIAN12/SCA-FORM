'use client';

import { useState, useMemo } from 'react';
import type { Session, Evaluation, CupEvaluation } from '@/lib/types';
import { ScaForm, type ScaFormValues, type CupFormValues } from './sca-form';
import { ScoresRadarChart } from './visualizations/scores-radar-chart';
import { Card, CardContent } from '../ui/card';

interface SessionViewProps {
  session: Session;
}

export function SessionView({ session: initialSession }: SessionViewProps) {
  const [session, setSession] = useState(initialSession);
  const [liveFormData, setLiveFormData] = useState<ScaFormValues | null>(null);
  const [activeTab, setActiveTab] = useState('cup-1');

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

  const handleActiveTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const activeCupData = useMemo(() => {
    if (!liveFormData || !liveFormData.cups) return null;
    const cupIndex = parseInt(activeTab.split('-')[1], 10) - 1;
    return liveFormData.cups[cupIndex] as CupFormValues | null;
  }, [liveFormData, activeTab]);

  return (
    <div className="space-y-6">
      <div className="col-span-full">
        <ScaForm
          onSubmit={handleFormSubmit}
          onValuesChange={handleValuesChange}
          onActiveTabChange={handleActiveTabChange}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 animate-in fade-in-50 duration-500">
        <Card>
          <CardContent className="p-2 pt-4">
            {activeCupData && <ScoresRadarChart scores={activeCupData} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
