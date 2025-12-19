'use client';

import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, deleteDoc, updateDoc, where, Timestamp } from 'firebase/firestore';
import type { Evaluation, RadarChartData } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, FilterX, Calendar as CalendarIcon, FileDown } from 'lucide-react';
import { CuppingCompassLogo } from '@/components/cupping-compass-logo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HistoryItem } from '@/components/history/history-item';
import { useState, useEffect, useMemo, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';
import { generateReportJson } from '@/lib/generate-report-json';
import { generatePdf } from '@/lib/generate-pdf';

export default function HistoryPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [roastLevelFilter, setRoastLevelFilter] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>();
  
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const evaluationsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;

    const constraints = [];

    if (roastLevelFilter && roastLevelFilter !== 'all') {
      constraints.push(where('roastLevel', '==', roastLevelFilter));
    }
    
    if (dateFilter) {
      const start = startOfDay(dateFilter);
      const end = endOfDay(dateFilter);
      constraints.push(where('createdAt', '>=', Timestamp.fromDate(start)));
      constraints.push(where('createdAt', '<=', Timestamp.fromDate(end)));
    }
    
    return query(
      collection(firestore, 'users', user.uid, 'evaluations'),
      ...constraints,
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user, roastLevelFilter, dateFilter]);

  const { data, isLoading, error } = useCollection<Evaluation>(evaluationsQuery);

  useEffect(() => {
    if (data) {
      setEvaluations(data);
    }
  }, [data]);
  
  const filteredEvaluations = useMemo(() => {
    if (!evaluations) return [];
    return evaluations.filter(evaluation => {
      return evaluation.coffeeName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [evaluations, searchTerm]);
  

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
  
  const handleDownloadPdf = async (evaluation: Evaluation) => {
    const reportJson = generateReportJson(evaluation, t);
    if (!reportJson) {
      console.error("Failed to generate report JSON.");
      return;
    };
    await generatePdf(reportJson, t);
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
              {t('historyPageTitle')}
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
          {t('logout')}
        </Button>
      </header>
       <main className="p-4 sm:p-6 lg:p-8">
         <div className="mx-auto max-w-4xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('evaluationLog')}</CardTitle>
                <CardDescription>{t('evaluationLogDescription')}</CardDescription>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                    <Input 
                        placeholder={t('searchByName')}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <Select value={roastLevelFilter} onValueChange={setRoastLevelFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder={t('filterByRoast')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('allRoasts')}</SelectItem>
                            <SelectItem value="light">{t('roastLight')}</SelectItem>
                            <SelectItem value="medium">{t('roastMedium')}</SelectItem>
                            <SelectItem value="medium-dark">{t('roastMediumDark')}</SelectItem>
                            <SelectItem value="dark">{t('roastDark')}</SelectItem>
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
                            {dateFilter ? format(dateFilter, "PPP") : <span>{t('pickDate')}</span>}
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
                        {t('clearFilters')}
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
                   {error && <p className="text-destructive text-center py-8">Error: Could not load evaluations. You might need to create a composite index in Firestore. Check browser console for a link.</p>}
                  {filteredEvaluations && filteredEvaluations.length > 0 ? (
                    <ul className="space-y-2">
                      {filteredEvaluations.map((evaluation) => (
                         <HistoryItem 
                          key={evaluation.id}
                          evaluation={evaluation}
                          onDelete={handleDelete}
                          onToggleFavorite={handleToggleFavorite}
                          onDownloadPdf={handleDownloadPdf}
                         />
                      ))}
                    </ul>
                  ) : (
                    !isLoading && !error && <p className="text-center text-muted-foreground py-8">{t('noEvaluationsFound')}</p>
                  )}
                </div>
              </CardContent>
            </Card>
         </div>
      </main>
    </div>
  );
}
