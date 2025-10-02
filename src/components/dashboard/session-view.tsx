'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import type { Evaluation, CupEvaluation, CuppingSession } from '@/lib/types';
import {
  ScaForm,
  type ScaFormValues,
  type CupFormValues,
} from './sca-form';
import { ScoresRadarChart } from './visualizations/scores-radar-chart';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { useCollection, useUser, useFirestore } from '@/firebase';
import { useMemoFirebase } from '@/firebase/provider';
import { collection, query, addDoc, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

interface SessionViewProps {
  session: CuppingSession | null;
}

export function SessionView({ session }: SessionViewProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | 'new'>('new');
  const [key, setKey] = useState(Date.now());
  const formRef = useRef<{ submit: () => void; reset: () => void }>(null);

  // Fetch evaluations for the current session
  const evaluationsQuery = useMemoFirebase(() => {
    if (!session) return null;
    return query(collection(firestore, 'sessions', session.id, 'evaluations'));
  }, [firestore, session]);

  const { data: evaluations = [], isLoading: isLoadingEvaluations } = useCollection<Evaluation>(evaluationsQuery);

  const handleAddEvaluation = async (evaluationData: Omit<Evaluation, 'id' | 'createdAt'>) => {
    if (!session || !user) return;
    
    const newEvaluation = {
      ...evaluationData,
      userId: user.uid,
      createdAt: serverTimestamp(),
    };

    try {
      const evaluationsCollection = collection(firestore, 'sessions', session.id, 'evaluations');
      await addDoc(evaluationsCollection, newEvaluation);
      toast({
        title: 'Evaluation Saved',
        description: 'Your coffee evaluation has been saved to the session.',
      });
      handleNewEvaluation();
    } catch (error: any) {
       toast({
        title: 'Error Saving Evaluation',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  const handleSelectEvaluation = (evaluation: Evaluation | 'new') => {
    setSelectedEvaluation(evaluation);
    setKey(Date.now());
  };

  const handleNewEvaluation = () => {
    setSelectedEvaluation('new');
    setKey(Date.now());
  };

  const handleTriggerSubmit = () => {
    formRef.current?.submit();
  };

  const isReadOnly = selectedEvaluation !== 'new';
  const currentEvaluationData = selectedEvaluation === 'new' ? null : selectedEvaluation;

  if (!session) {
     return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="space-y-4 text-center">
          <p className="text-muted-foreground">Selecciona una sesión o crea una nueva para empezar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card>
          <CardContent className="p-4">
             <h3 className="font-semibold mb-4">Evaluaciones en esta sesión</h3>
             <Button onClick={handleNewEvaluation} className="w-full mb-4" variant="outline">
                Nueva Evaluación
             </Button>
             {isLoadingEvaluations && <Skeleton className="h-10 w-full" />}
             <ul className="space-y-2">
                {evaluations && evaluations.map(evalItem => (
                  <li key={evalItem.id}>
                    <Button 
                      onClick={() => handleSelectEvaluation(evalItem)}
                      variant={selectedEvaluation !== 'new' && selectedEvaluation.id === evalItem.id ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                    >
                      {evalItem.coffeeName}
                    </Button>
                  </li>
                ))}
             </ul>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2 space-y-6">
        <ScaForm
          ref={formRef}
          key={key}
          initialData={currentEvaluationData}
          onSubmit={handleAddEvaluation}
        />
        {!isReadOnly && (
          <div className="flex justify-center">
            <Button onClick={handleTriggerSubmit} className="w-full md:w-1/2">
              Guardar Evaluación
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
