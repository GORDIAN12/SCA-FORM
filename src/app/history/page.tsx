'use client';

import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import type { Evaluation } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, FilterX, Calendar as CalendarIcon } from 'lucide-react';
import { CuppingCompassLogo } from '@/components/cupping-compass-logo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HistoryItem } from '@/components/history/history-item';
import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function HistoryPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [roastLevelFilter, setRoastLevelFilter] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>();

  const evaluationsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'evaluations'),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user]);

  const { data, isLoading } = useCollection<Evaluation>(evaluationsQuery);

  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  useEffect(() => {
    if (data) {
      setEvaluations(data);
    }
  }, [data]);
  
  const filteredEvaluations = useMemo(() => {
    return evaluations.filter(evaluation => {
      const matchesSearchTerm = evaluation.coffeeName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRoastLevel = !roastLevelFilter || roastLevelFilter === 'all' ? true : evaluation.roastLevel === roastLevelFilter;
      const matchesDate = dateFilter ? format(evaluation.createdAt?.toDate(), 'yyyy-MM-dd') === format(dateFilter, 'yyyy-MM-dd') : true;

      return matchesSearchTerm && matchesRoastLevel && matchesDate;
    });
  }, [evaluations, searchTerm, roastLevelFilter, dateFilter]);

  if (isUserLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-10 w-1/2 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleDelete = async (evaluationId: string) => {
    if (!user || !firestore) return;
    try {
      const docRef = doc(firestore, 'users', user.uid, 'evaluations', evaluationId);
      await deleteDoc(docRef);
      setEvaluations((prev) => prev.filter((e) => e.id !== evaluationId));
    } catch (error) {
      console.error("Error deleting evaluation: ", error);
    }
  };

  const handleToggleFavorite = async (evaluationId: string, currentState: boolean) => {
    if (!user || !firestore) return;
    try {
      const docRef = doc(firestore, 'users', user.uid, 'evaluations', evaluationId);
      await updateDoc(docRef, { isFavorite: !currentState });
      setEvaluations((prev) => 
        prev.map((e) => 
          e.id === evaluationId ? { ...e, isFavorite: !currentState } : e
        )
      );
    } catch (error) {
      console.error("Error updating favorite status: ", error);
    }
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setRoastLevelFilter('');
    setDateFilter(undefined);
  };

  return (
    <div className="min-h-screen bg-background">
       <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <CuppingCompassLogo className="size-8 text-primary" />
            <h1 className="text-xl font-semibold hidden sm:block">
              Historial de Evaluaciones
            </h1>
          </div>
        </div>
        <Button
          onClick={async () => {
            const { getAuth, signOut } = await import('firebase/auth');
            const auth = getAuth();
            await signOut(auth);
            router.push('/login');
          }}
        >
          Logout
        </Button>
      </header>
       <main className="p-4 sm:p-6 lg:p-8">
         <div className="mx-auto max-w-4xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bitácora de Evaluaciones</CardTitle>
                <CardDescription>Aquí están todas tus evaluaciones de café guardadas. Usa los filtros para encontrar evaluaciones específicas.</CardDescription>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                    <Input 
                        placeholder="Buscar por nombre..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <Select value={roastLevelFilter} onValueChange={setRoastLevelFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filtrar por tueste" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los tuestes</SelectItem>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="medium-dark">Medium-Dark</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                        </SelectContent>
                    </Select>
                     <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateFilter && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateFilter ? format(dateFilter, "PPP") : <span>Seleccionar fecha</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={dateFilter}
                            onSelect={setDateFilter}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <Button variant="outline" onClick={clearFilters}>
                        <FilterX className="mr-2 h-4 w-4" />
                        Limpiar Filtros
                    </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                  {isLoading && (
                    <div className="space-y-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  )}
                  {filteredEvaluations && filteredEvaluations.length > 0 ? (
                    <ul className="space-y-2">
                      <AnimatePresence>
                      {filteredEvaluations.map((evaluation) => (
                         <HistoryItem 
                          key={evaluation.id}
                          evaluation={evaluation}
                          onDelete={handleDelete}
                          onToggleFavorite={handleToggleFavorite}
                         />
                      ))}
                      </AnimatePresence>
                    </ul>
                  ) : (
                    !isLoading && <p className="text-center text-muted-foreground py-8">No se encontraron evaluaciones con los filtros aplicados.</p>
                  )}
                </div>
              </CardContent>
            </Card>
         </div>
      </main>
    </div>
  );
}
