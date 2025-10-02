'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import type { Evaluation, CupEvaluation } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  useEffect,
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { cn } from '@/lib/utils';
import { Coffee } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlavorProfileChart } from './flavor-profile-chart';

const scoreSchema = z.coerce.number().min(6).max(10);
const intensitySchema = z.enum(['low', 'medium', 'high'], {
  required_error: 'You need to select an intensity level.',
});
const aromaCategorySchema = z.enum([
  'Floral',
  'Frutal',
  'Especiado',
  'Nueces/Cacao',
  'Caramelizado',
  'Herbal',
  'Tierra',
  'Otros',
]);
const roastLevelSchema = z.enum(['light', 'medium', 'medium-dark', 'dark'], {
  required_error: 'You need to select a roast level.',
});

const scoreSetSchema = z.object({
  flavor: scoreSchema,
  aftertaste: scoreSchema,
  acidity: scoreSchema,
  acidityIntensity: intensitySchema,
  body: scoreSchema,
  bodyIntensity: intensitySchema,
  balance: scoreSchema,
});

const cupEvaluationSchema = z.object({
  id: z.string(),
  aromaCategory: aromaCategorySchema.optional(),
  dryFragrance: intensitySchema,
  wetAroma: intensitySchema,
  uniformity: z.boolean().default(true),
  cleanCup: z.boolean().default(true),
  sweetness: z.boolean().default(true),
  aroma: scoreSchema,
  scores: z.object({
    hot: scoreSetSchema,
    warm: scoreSetSchema,
    cold: scoreSetSchema,
  }),
  cupperScore: scoreSchema,
  totalScore: z.number().default(0),
});

const formSchema = z.object({
  coffeeName: z.string().min(1, 'Coffee name is required'),
  roastLevel: roastLevelSchema,
  cups: z.array(cupEvaluationSchema).length(5),
});

export type ScaFormValues = z.infer<typeof formSchema>;
export type CupFormValues = z.infer<typeof cupEvaluationSchema>;
export type ScoreSetFormValues = z.infer<typeof scoreSetSchema>;

interface ScaFormProps {
  initialData?: Omit<Evaluation, 'id' | 'createdAt' | 'userId'> | null;
  onSubmit: (data: Omit<Evaluation, 'id' | 'createdAt' | 'userId'>) => void;
  onValuesChange?: (data: ScaFormValues) => void;
  onActiveCupChange?: (cupId: string, cupData: CupFormValues | null) => void;
  isSubmitting?: boolean;
}

export interface ScaFormRef {
  submit: () => void;
  reset: () => void;
}

const CupSelector = ({
  field,
  disabled,
}: {
  field: {
    value: boolean;
    onChange: (value: boolean) => void;
  };
  disabled?: boolean;
}) => {
  return (
    <div className="flex items-center space-x-2">
      <button
        type="button"
        onClick={() => field.onChange(!field.value)}
        className={cn(
          'p-1 rounded-md transition-colors',
          'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          disabled && 'cursor-not-allowed opacity-70'
        )}
        disabled={disabled}
      >
        <Coffee
          className={cn(
            'size-5 transition-colors',
            field.value
              ? 'text-primary fill-primary/20'
              : 'text-muted-foreground/50'
          )}
        />
      </button>
    </div>
  );
};

const ScoreSlider = ({
  field,
  disabled,
}: {
  field: {
    value: number;
    onChange: (value: number) => void;
  };
  disabled?: boolean;
}) => (
  <div className="relative pt-2">
    <Slider
      min={6}
      max={10}
      step={0.25}
      value={[field.value]}
      onValueChange={(value) => field.onChange(value[0])}
      disabled={disabled}
    />
    <div className="absolute top-1/2 left-0 right-0 h-0 flex justify-between px-2 pointer-events-none -translate-y-1/2">
      {[...Array(17)].map((_, i) => (
        <div
          key={i}
          className={cn(
            'w-[2px]',
            i % 4 === 0 ? 'h-3 bg-[#4A2C2A]' : 'h-1.5 bg-[#9B705D]'
          )}
        />
      ))}
    </div>
    <div className="relative flex justify-between text-xs text-muted-foreground mt-12 px-1">
      {[...Array(5)].map((_, i) => (
        <span key={i}>{6 + i}</span>
      ))}
    </div>
  </div>
);

const aromaCategories = [
  'Floral',
  'Frutal',
  'Especiado',
  'Nueces/Cacao',
  'Caramelizado',
  'Herbal',
  'Tierra',
  'Otros',
];

const roastLevels = [
  { id: 'light', label: 'Light', color: 'bg-[#966F33]' },
  { id: 'medium', label: 'Medium', color: 'bg-[#6A4C2E]' },
  { id: 'medium-dark', label: 'Medium-Dark', color: 'bg-[#4A3522]' },
  { id: 'dark', label: 'Dark', color: 'bg-[#3A2418]' },
];

const createDefaultScoreSet = (): ScoreSetFormValues => ({
  flavor: 8,
  aftertaste: 8,
  acidity: 8,
  acidityIntensity: 'medium',
  body: 8,
  bodyIntensity: 'medium',
  balance: 8,
});

const createDefaultCup = (index: number): CupFormValues => ({
  id: `cup-${index + 1}`,
  aromaCategory: 'Frutal',
  dryFragrance: 'medium',
  wetAroma: 'medium',
  uniformity: true,
  cleanCup: true,
  sweetness: true,
  aroma: 8,
  scores: {
    hot: createDefaultScoreSet(),
    warm: createDefaultScoreSet(),
    cold: createDefaultScoreSet(),
  },
  cupperScore: 8,
  totalScore: 0,
});

const createDefaultFormValues = (): ScaFormValues => ({
  coffeeName: '',
  roastLevel: 'medium',
  cups: Array.from({ length: 5 }, (_, i) => createDefaultCup(i)),
});

export const ScaForm = forwardRef<ScaFormRef, ScaFormProps>(
  ({ initialData, onSubmit, onValuesChange, onActiveCupChange, isSubmitting }, ref) => {
    const [activeCupTab, setActiveCupTab] = useState('cup-1');
    const [activeTempTab, setActiveTempTab] = useState<'hot' | 'warm' | 'cold'>('hot');

    const form = useForm<ScaFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: initialData
        ? {
            coffeeName: initialData.coffeeName,
            roastLevel: initialData.roastLevel,
            cups: initialData.cups,
          }
        : createDefaultFormValues(),
    });

    useEffect(() => {
      if (initialData) {
        form.reset({
          coffeeName: initialData.coffeeName,
          roastLevel: initialData.roastLevel,
          cups: initialData.cups,
        });
      } else {
        form.reset(createDefaultFormValues());
      }
    }, [initialData, form]);

    useImperativeHandle(ref, () => ({
      submit: form.handleSubmit(handleSubmit),
      reset: () => form.reset(createDefaultFormValues()),
    }));

    const { fields } = useFieldArray({
      control: form.control,
      name: 'cups',
    });

    const watchedValues = useWatch({ control: form.control });

    useEffect(() => {
      if (onValuesChange) {
        onValuesChange(watchedValues as ScaFormValues);
      }
    }, [watchedValues, onValuesChange]);
    
    const activeCupIndex = useMemo(() => {
      return parseInt(activeCupTab.split('-')[1], 10) - 1;
    }, [activeCupTab]);

    const activeCupData = watchedValues.cups?.[activeCupIndex];
    
    const flavorProfileData = useMemo(() => {
        if (!activeCupData) return null;

        const { aroma, scores } = activeCupData;
        const tempScores = scores?.[activeTempTab];

        if (!tempScores) return null;

        return {
            aroma,
            flavor: tempScores.flavor,
            aftertaste: tempScores.aftertaste,
            acidity: tempScores.acidity,
            body: tempScores.body,
            balance: tempScores.balance,
        };
    }, [activeCupData, activeTempTab]);

    useEffect(() => {
      if (onActiveCupChange && activeCupData) {
        onActiveCupChange(activeCupTab, activeCupData as CupFormValues | null);
      }
    }, [activeCupTab, activeCupData, onActiveCupChange]);

    const overallScore = useMemo(() => {
      if(initialData?.overallScore) {
        return initialData.overallScore;
      }
      if (!watchedValues.cups || watchedValues.cups.length === 0) return 0;
      const validCups = watchedValues.cups.filter(
        (cup) => cup && typeof cup.totalScore === 'number'
      );
      if (validCups.length === 0) return 0;
      const total = validCups.reduce((acc, cup) => acc + cup.totalScore, 0);
      return total / validCups.length;
    }, [watchedValues.cups, initialData]);

    function handleSubmit(values: ScaFormValues) {
      const evaluationData: Omit<Evaluation, 'id' | 'createdAt' | 'userId'> = {
        coffeeName: values.coffeeName,
        roastLevel: values.roastLevel,
        cups: values.cups,
        overallScore: parseFloat(overallScore.toFixed(2)),
      };

      onSubmit(evaluationData);
    }

    const capitalize = (s: string) =>
      s.charAt(0).toUpperCase() + s.slice(1).replace(/([A-Z])/g, ' $1');

    const isReadOnly = !!initialData || isSubmitting;

    return (
      <Card>
        <CardHeader>
          <CardTitle>SCA Evaluation Form</CardTitle>
          <CardDescription>
            {isReadOnly ? 'Viewing a saved coffee evaluation.' : 'Enter the coffee cupping details below, cup by cup.'}
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="coffeeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coffee Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Ethiopia Yirgacheffe"
                          {...field}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="roastLevel"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Roast Level</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-2 md:grid-cols-4 gap-4"
                          disabled={isReadOnly}
                        >
                          {roastLevels.map((level) => (
                            <FormItem key={level.id}>
                              <FormControl>
                                <RadioGroupItem
                                  value={level.id}
                                  className="sr-only"
                                />
                              </FormControl>
                              <FormLabel
                                className={cn(
                                  'flex items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-4 font-semibold hover:bg-accent hover:text-accent-foreground cursor-pointer',
                                  field.value === level.id &&
                                    'border-primary',
                                  isReadOnly && 'cursor-not-allowed opacity-70'
                                )}
                              >
                                <span
                                  className={cn(
                                    'size-4 rounded-full',
                                    level.color
                                  )}
                                />
                                {level.label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Separator />

              <Tabs
                defaultValue="cup-1"
                className="w-full"
                onValueChange={setActiveCupTab}
              >
                <TabsList className="grid w-full grid-cols-5">
                  {fields.map((field, index) => (
                    <TabsTrigger key={field.id} value={`cup-${index + 1}`} disabled={isReadOnly}>
                      Cup {index + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {fields.map((field, index) => {
                  const cupValues = watchedValues.cups?.[index];

                  const cupTotalScore = useMemo(() => {
                    if (!cupValues) return 0;

                    const avgScores = Object.keys(cupValues.scores.hot).reduce(
                      (acc, key) => {
                        const scoreKey = key as keyof ScoreSetFormValues;
                        if (
                          typeof cupValues.scores.hot[scoreKey] === 'number'
                        ) {
                          const hotScore =
                            (cupValues.scores.hot[
                              scoreKey
                            ] as number) ?? 0;
                          const warmScore =
                            (cupValues.scores.warm[
                              scoreKey
                            ] as number) ?? 0;
                          const coldScore =
                            (cupValues.scores.cold[
                              scoreKey
                            ] as number) ?? 0;
                          acc += (hotScore + warmScore + coldScore) / 3;
                        }
                        return acc;
                      },
                      0
                    );

                    const baseScore = 36;
                    const qualityScore =
                      (cupValues.uniformity ? 10 : 0) +
                      (cupValues.cleanCup ? 10 : 0) +
                      (cupValues.sweetness ? 10 : 0);
                    const finalScore =
                      cupValues.aroma + avgScores + cupValues.cupperScore;

                    const totalScore = finalScore - baseScore;
                    return isNaN(totalScore) ? 0 : totalScore;
                  }, [cupValues]);

                  useEffect(() => {
                    if (!isReadOnly) {
                      form.setValue(
                        `cups.${index}.totalScore`,
                        parseFloat(cupTotalScore.toFixed(2))
                      );
                    }
                  }, [cupTotalScore, index, form, isReadOnly]);

                  return (
                    <TabsContent key={field.id} value={`cup-${index + 1}`}>
                      <Card>
                        <CardHeader>
                          <CardTitle>Cup {index + 1} Evaluation</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">
                              Cup Quality
                            </h3>
                            {(
                              ['uniformity', 'cleanCup', 'sweetness'] as const
                            ).map((quality) => (
                              <FormField
                                key={`${field.id}-${quality}`}
                                control={form.control}
                                name={`cups.${index}.${quality}`}
                                render={({ field: qualityField }) => (
                                  <FormItem>
                                    <div className="flex justify-between items-center">
                                      <FormLabel>
                                        {capitalize(quality)}
                                      </FormLabel>
                                      <div className="flex items-center gap-4">
                                        <CupSelector
                                          field={qualityField}
                                          disabled={isReadOnly}
                                        />
                                        <span className="text-sm font-medium w-8 text-right">
                                          {qualityField.value ? '10.00' : '0.00'}
                                        </span>
                                      </div>
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                          <Separator />
                          <h3 className="text-lg font-semibold">Scores</h3>
                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name={`cups.${index}.aromaCategory`}
                              render={({ field: aromaField }) => (
                                <FormItem className="space-y-3">
                                  <FormLabel>Aroma Category</FormLabel>
                                  <FormControl>
                                    <RadioGroup
                                      onValueChange={aromaField.onChange}
                                      value={aromaField.value}
                                      className="flex flex-wrap gap-2"
                                      disabled={isReadOnly}
                                    >
                                      {aromaCategories.map((category) => (
                                        <FormItem key={category}>
                                          <FormControl>
                                            <RadioGroupItem
                                              value={category}
                                              className="sr-only"
                                            />
                                          </FormControl>
                                          <FormLabel
                                            className={cn(
                                              'px-3 py-1.5 border rounded-full cursor-pointer transition-colors',
                                              aromaField.value === category
                                                ? 'bg-primary text-primary-foreground border-primary'
                                                : 'bg-transparent hover:bg-accent',
                                              isReadOnly &&
                                                'cursor-not-allowed opacity-70'
                                            )}
                                          >
                                            {category}
                                          </FormLabel>
                                        </FormItem>
                                      ))}
                                    </RadioGroup>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="p-4 border rounded-md">
                              <h4 className="text-md font-medium mb-2">
                                Fragrance / Aroma
                              </h4>
                              <div className="space-y-4">
                                <FormField
                                  control={form.control}
                                  name={`cups.${index}.aroma`}
                                  render={({ field: scoreField }) => (
                                    <FormItem>
                                      <FormLabel className="flex justify-between">
                                        <span>Aroma Score</span>
                                        <span>
                                          {scoreField.value.toFixed(2)}
                                        </span>
                                      </FormLabel>
                                      <FormControl>
                                        <ScoreSlider
                                          field={scoreField}
                                          disabled={isReadOnly}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <FormField
                                    control={form.control}
                                    name={`cups.${index}.dryFragrance`}
                                    render={({ field: intensityField }) => (
                                      <FormItem className="space-y-3">
                                        <FormLabel>Dry Fragrance</FormLabel>
                                        <FormControl>
                                          <RadioGroup
                                            onValueChange={
                                              intensityField.onChange
                                            }
                                            value={intensityField.value}
                                            className="flex space-x-4"
                                            disabled={isReadOnly}
                                          >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                              <FormControl>
                                                <RadioGroupItem value="low" />
                                              </FormControl>
                                              <FormLabel className="font-normal">
                                                Low
                                              </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                              <FormControl>
                                                <RadioGroupItem value="medium" />
                                              </FormControl>
                                              <FormLabel className="font-normal">
                                                Medium
                                              </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                              <FormControl>
                                                <RadioGroupItem value="high" />
                                              </FormControl>
                                              <FormLabel className="font-normal">
                                                High
                                              </FormLabel>
                                            </FormItem>
                                          </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name={`cups.${index}.wetAroma`}
                                    render={({ field: intensityField }) => (
                                      <FormItem className="space-y-3">
                                        <FormLabel>Wet Aroma (Crust)</FormLabel>
                                        <FormControl>
                                          <RadioGroup
                                            onValueChange={
                                              intensityField.onChange
                                            }
                                            value={intensityField.value}
                                            className="flex space-x-4"
                                            disabled={isReadOnly}
                                          >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                              <FormControl>
                                                <RadioGroupItem value="low" />
                                              </FormControl>
                                              <FormLabel className="font-normal">
                                                Low
                                              </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                              <FormControl>
                                                <RadioGroupItem value="medium" />
                                              </FormControl>
                                              <FormLabel className="font-normal">
                                                Medium
                                              </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                              <FormControl>
                                                <RadioGroupItem value="high" />
                                              </FormControl>
                                              <FormLabel className="font-normal">
                                                High
                                              </FormLabel>
                                            </FormItem>
                                          </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>
                            </div>

                            <Tabs defaultValue="hot" className="w-full">
                              <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="hot" disabled={isReadOnly}>Hot</TabsTrigger>
                                <TabsTrigger value="warm" disabled={isReadOnly}>Warm</TabsTrigger>
                                <TabsTrigger value="cold" disabled={isReadOnly}>Cold</TabsTrigger>
                              </TabsList>
                              {(['hot', 'warm', 'cold'] as const).map(
                                (temp) => (
                                  <TabsContent key={temp} value={temp}>
                                    <div className="space-y-4 pt-4">
                                      <div className="p-4 border rounded-md">
                                        <FormField
                                          control={form.control}
                                          name={`cups.${index}.scores.${temp}.flavor`}
                                          render={({ field: scoreField }) => (
                                            <FormItem>
                                              <FormLabel className="flex justify-between">
                                                <span>Flavor</span>
                                                <span>
                                                  {scoreField.value.toFixed(2)}
                                                </span>
                                              </FormLabel>
                                              <FormControl>
                                                <ScoreSlider
                                                  field={scoreField}
                                                  disabled={isReadOnly}
                                                />
                                              </FormControl>
                                            </FormItem>
                                          )}
                                        />
                                      </div>
                                      <div className="p-4 border rounded-md">
                                        <FormField
                                          control={form.control}
                                          name={`cups.${index}.scores.${temp}.aftertaste`}
                                          render={({ field: scoreField }) => (
                                            <FormItem>
                                              <FormLabel className="flex justify-between">
                                                <span>Aftertaste</span>
                                                <span>
                                                  {scoreField.value.toFixed(2)}
                                                </span>
                                              </FormLabel>
                                              <FormControl>
                                                <ScoreSlider
                                                  field={scoreField}
                                                  disabled={isReadOnly}
                                                />
                                              </FormControl>
                                            </FormItem>
                                          )}
                                        />
                                      </div>
                                      <div className="p-4 border rounded-md">
                                        <div className="space-y-4">
                                          <FormField
                                            control={form.control}
                                            name={`cups.${index}.scores.${temp}.acidity`}
                                            render={({ field: scoreField }) => (
                                              <FormItem>
                                                <FormLabel className="flex justify-between">
                                                  <span>Acidity Score</span>
                                                  <span>
                                                    {scoreField.value.toFixed(
                                                      2
                                                    )}
                                                  </span>
                                                </FormLabel>
                                                <FormControl>
                                                  <ScoreSlider
                                                    field={scoreField}
                                                    disabled={isReadOnly}
                                                  />
                                                </FormControl>
                                              </FormItem>
                                            )}
                                          />
                                          <FormField
                                            control={form.control}
                                            name={`cups.${index}.scores.${temp}.acidityIntensity`}
                                            render={({
                                              field: intensityField,
                                            }) => (
                                              <FormItem className="space-y-3">
                                                <FormLabel>
                                                  Acidity Intensity
                                                </FormLabel>
                                                <FormControl>
                                                  <RadioGroup
                                                    onValueChange={
                                                      intensityField.onChange
                                                    }
                                                    value={intensityField.value}
                                                    className="flex space-x-4"
                                                    disabled={isReadOnly}
                                                  >
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                      <FormControl>
                                                        <RadioGroupItem value="low" />
                                                      </FormControl>
                                                      <FormLabel className="font-normal">
                                                        Low
                                                      </FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                      <FormControl>
                                                        <RadioGroupItem value="medium" />
                                                      </FormControl>
                                                      <FormLabel className="font-normal">
                                                        Medium
                                                      </FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                      <FormControl>
                                                        <RadioGroupItem value="high" />
                                                      </FormControl>
                                                      <FormLabel className="font-normal">
                                                        High
                                                      </FormLabel>
                                                    </FormItem>
                                                  </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />
                                        </div>
                                      </div>
                                      <div className="p-4 border rounded-md">
                                        <div className="space-y-4">
                                          <FormField
                                            control={form.control}
                                            name={`cups.${index}.scores.${temp}.body`}
                                            render={({ field: scoreField }) => (
                                              <FormItem>
                                                <FormLabel className="flex justify-between">
                                                  <span>Body Score</span>
                                                  <span>
                                                    {scoreField.value.toFixed(
                                                      2
                                                    )}
                                                  </span>
                                                </FormLabel>
                                                <FormControl>
                                                  <ScoreSlider
                                                    field={scoreField}
                                                    disabled={isReadOnly}
                                                  />
                                                </FormControl>
                                              </FormItem>
                                            )}
                                          />
                                          <FormField
                                            control={form.control}
                                            name={`cups.${index}.scores.${temp}.bodyIntensity`}
                                            render={({
                                              field: intensityField,
                                            }) => (
                                              <FormItem className="space-y-3">
                                                <FormLabel>
                                                  Body Intensity
                                                </FormLabel>
                                                <FormControl>
                                                  <RadioGroup
                                                    onValueChange={
                                                      intensityField.onChange
                                                    }
                                                    value={intensityField.value}
                                                    className="flex space-x-4"
                                                    disabled={isReadOnly}
                                                  >
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                      <FormControl>
                                                        <RadioGroupItem value="low" />
                                                      </FormControl>
                                                      <FormLabel className="font-normal">
                                                        Low
                                                      </FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                      <FormControl>
                                                        <RadioGroupItem value="medium" />
                                                      </FormControl>
                                                      <FormLabel className="font-normal">
                                                        Medium
                                                      </FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                      <FormControl>
                                                        <RadioGroupItem value="high" />
                                                      </FormControl>
                                                      <FormLabel className="font-normal">
                                                        High
                                                      </FormLabel>
                                                    </FormItem>
                                                  </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />
                                        </div>
                                      </div>
                                      <div className="p-4 border rounded-md">
                                        <FormField
                                          control={form.control}
                                          name={`cups.${index}.scores.${temp}.balance`}
                                          render={({ field: scoreField }) => (
                                            <FormItem>
                                              <FormLabel className="flex justify-between">
                                                <span>Balance</span>
                                                <span>
                                                  {scoreField.value.toFixed(2)}
                                                </span>
                                              </FormLabel>
                                              <FormControl>
                                                <ScoreSlider
                                                  field={scoreField}
                                                  disabled={isReadOnly}
                                                />
                                              </FormControl>
                                            </FormItem>
                                          )}
                                        />
                                      </div>
                                    </div>
                                  </TabsContent>
                                )
                              )}
                            </Tabs>

                            <div className="p-4 border rounded-md">
                              <FormField
                                control={form.control}
                                name={`cups.${index}.cupperScore`}
                                render={({ field: scoreField }) => (
                                  <FormItem>
                                    <FormLabel className="flex justify-between">
                                      <span>Cupper Score</span>
                                      <span>
                                        {scoreField.value.toFixed(2)}
                                      </span>
                                    </FormLabel>
                                    <FormControl>
                                      <ScoreSlider
                                        field={scoreField}
                                        disabled={isReadOnly}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  );
                })}
              </Tabs>
               <Card>
                   <CardContent className="pt-6">
                       <Tabs 
                           defaultValue="hot" 
                           className="w-full" 
                           onValueChange={(value) => setActiveTempTab(value as 'hot' | 'warm' | 'cold')}
                       >
                           <TabsList className="grid w-full grid-cols-3">
                               <TabsTrigger value="hot" disabled={isReadOnly}>Hot</TabsTrigger>
                               <TabsTrigger value="warm" disabled={isReadOnly}>Warm</TabsTrigger>
                               <TabsTrigger value="cold" disabled={isReadOnly}>Cold</TabsTrigger>
                           </TabsList>
                       </Tabs>
                       <h3 className="text-center text-xl font-semibold my-4">Flavor Profile</h3>
                       <div className="h-80">
                           {flavorProfileData && <FlavorProfileChart scores={flavorProfileData} />}
                       </div>
                   </CardContent>
               </Card>
               <div className="p-6 space-y-6">
                 <Separator />
                 <div className="space-y-2">
                   <div className="flex justify-between text-xl font-bold">
                     <span>Overall Average Score</span>
                     <span>{overallScore.toFixed(2)}</span>
                   </div>
                 </div>
               </div>
            </CardContent>
          </form>
        </Form>
      </Card>
    );
  }
);

ScaForm.displayName = 'ScaForm';
