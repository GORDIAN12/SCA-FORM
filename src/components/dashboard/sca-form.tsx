'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
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
  CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import type { Evaluation, CupEvaluation } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Coffee } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

const cupEvaluationSchema = z.object({
  id: z.string(),
  aromaCategory: aromaCategorySchema.optional(),
  dryFragrance: intensitySchema,
  wetAroma: intensitySchema,
  uniformity: z.boolean().default(true),
  cleanCup: z.boolean().default(true),
  sweetness: z.boolean().default(true),
  aroma: scoreSchema,
  flavor: scoreSchema,
  aftertaste: scoreSchema,
  acidity: scoreSchema,
  acidityIntensity: intensitySchema,
  body: scoreSchema,
  bodyIntensity: intensitySchema,
  balance: scoreSchema,
  cupperScore: scoreSchema,
  totalScore: z.number().default(0),
});

const formSchema = z.object({
  coffeeName: z.string().min(1, 'Coffee name is required'),
  roastLevel: z.enum(['light', 'medium', 'medium-dark', 'dark'], {
    required_error: 'You need to select a roast level.',
  }),
  cups: z.array(cupEvaluationSchema).length(5),
});

export type ScaFormValues = z.infer<typeof formSchema>;
export type CupFormValues = z.infer<typeof cupEvaluationSchema>;

interface ScaFormProps {
  onSubmit: (data: Evaluation) => void;
  onValuesChange?: (data: ScaFormValues) => void;
  onActiveTabChange?: (tab: string) => void;
}

const scoreFields = [
  'aroma',
  'flavor',
  'aftertaste',
  'acidity',
  'body',
  'balance',
  'cupperScore',
] as const;

const CupSelector = ({
  field,
}: {
  field: {
    value: boolean;
    onChange: (value: boolean) => void;
  };
}) => {
  return (
    <div className="flex items-center space-x-2">
      <button
        type="button"
        onClick={() => field.onChange(!field.value)}
        className={cn(
          'p-1 rounded-md transition-colors',
          'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        )}
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
}: {
  field: {
    value: number;
    onChange: (value: number) => void;
  };
}) => (
  <div className="relative pt-2">
    <Slider
      min={6}
      max={10}
      step={0.25}
      value={[field.value]}
      onValueChange={(value) => field.onChange(value[0])}
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

const createDefaultCup = (index: number): CupFormValues => ({
  id: `cup-${index + 1}`,
  aromaCategory: 'Frutal',
  dryFragrance: 'medium',
  wetAroma: 'medium',
  uniformity: true,
  cleanCup: true,
  sweetness: true,
  aroma: 8,
  flavor: 8,
  aftertaste: 8,
  acidity: 8,
  acidityIntensity: 'medium',
  body: 8,
  bodyIntensity: 'medium',
  balance: 8,
  cupperScore: 8,
  totalScore: 0,
});

const roastLevelColors = {
  light: 'bg-[#C9A26A]',
  medium: 'bg-[#A27B48]',
  'medium-dark': 'bg-[#6B4F2E]',
  dark: 'bg-[#4A2C2A]',
};

export function ScaForm({
  onSubmit,
  onValuesChange,
  onActiveTabChange,
}: ScaFormProps) {
  const form = useForm<ScaFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      coffeeName: '',
      roastLevel: 'medium',
      cups: Array.from({ length: 5 }, (_, i) => createDefaultCup(i)),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: 'cups',
  });

  const watchedValues = useWatch({ control: form.control });
  const watchedRoastLevel = useWatch({
    control: form.control,
    name: 'roastLevel',
  });

  useEffect(() => {
    if (onValuesChange) {
      onValuesChange(watchedValues as ScaFormValues);
    }
  }, [watchedValues, onValuesChange]);

  const overallScore = useMemo(() => {
    const total =
      watchedValues.cups?.reduce((acc, cup) => acc + (cup?.totalScore || 0), 0) ||
      0;
    return watchedValues.cups?.length ? total / watchedValues.cups.length : 0;
  }, [watchedValues.cups]);

  function handleSubmit(values: ScaFormValues) {
    const evaluationData: Omit<Evaluation, 'id'> = {
      coffeeName: values.coffeeName,
      roastLevel: values.roastLevel,
      cups: values.cups,
      overallScore: overallScore,
    };

    onSubmit({ ...evaluationData, id: `eval-${Date.now()}` });
  }

  const capitalize = (s: string) =>
    s.charAt(0).toUpperCase() + s.slice(1).replace(/([A-Z])/g, ' $1');

  return (
    <Card>
      <CardHeader>
        <CardTitle>SCA Evaluation Form</CardTitle>
        <CardDescription>
          Enter the coffee cupping details below, cup by cup.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <FormItem>
                    <div className="flex items-center gap-2 mb-2">
                      <FormLabel>Roast Level</FormLabel>
                      <div
                        className={cn(
                          'size-4 rounded-full transition-colors',
                          roastLevelColors[watchedRoastLevel]
                        )}
                      />
                    </div>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-wrap gap-2"
                      >
                        {(
                          ['light', 'medium', 'medium-dark', 'dark'] as const
                        ).map((level) => (
                          <FormItem key={level}>
                            <FormControl>
                              <RadioGroupItem
                                value={level}
                                className="sr-only"
                              />
                            </FormControl>
                            <FormLabel
                              className={cn(
                                'px-3 py-1.5 border rounded-full cursor-pointer transition-colors text-center',
                                field.value === level
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'bg-transparent hover:bg-accent'
                              )}
                            >
                              {capitalize(level)}
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
              onValueChange={onActiveTabChange}
            >
              <TabsList className="grid w-full grid-cols-5">
                {fields.map((field, index) => (
                  <TabsTrigger key={field.id} value={`cup-${index + 1}`}>
                    Cup {index + 1}
                  </TabsTrigger>
                ))}
              </TabsList>
              {fields.map((field, index) => {
                const cupValues = watchedValues.cups?.[index];
                const cupTotalScore = useMemo(() => {
                  if (!cupValues) return 0;
                  const uniformityScore = cupValues.uniformity ? 2 : 0;
                  const cleanCupScore = cupValues.cleanCup ? 2 : 0;
                  const sweetnessScore = cupValues.sweetness ? 2 : 0;

                  const baseScoresTotal = scoreFields.reduce(
                    (acc, field) => acc + (cupValues[field] || 0),
                    0
                  );
                  return (
                    baseScoresTotal +
                    uniformityScore +
                    cleanCupScore +
                    sweetnessScore
                  );
                }, [cupValues]);

                useEffect(() => {
                  form.setValue(`cups.${index}.totalScore`, cupTotalScore);
                }, [cupTotalScore, index, form]);

                return (
                  <TabsContent key={field.id} value={`cup-${index + 1}`}>
                    <Card>
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
                                      <CupSelector field={qualityField} />
                                      <span className="text-sm font-medium w-8 text-right">
                                        {qualityField.value ? '2.00' : '0.00'}
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
                                              : 'bg-transparent hover:bg-accent'
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
                                      <span>{scoreField.value.toFixed(2)}</span>
                                    </FormLabel>
                                    <FormControl>
                                      <ScoreSlider field={scoreField} />
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
                          {[
                            'flavor',
                            'aftertaste',
                            'balance',
                            'cupperScore',
                          ].map((name) => (
                            <div key={name} className="p-4 border rounded-md">
                              <FormField
                                control={form.control}
                                name={
                                  `cups.${index}.${name}` as `cups.${number}.${
                                    | 'flavor'
                                    | 'aftertaste'
                                    | 'balance'
                                    | 'cupperScore'}`
                                }
                                render={({ field: scoreField }) => (
                                  <FormItem>
                                    <FormLabel className="flex justify-between">
                                      <span>{capitalize(name)}</span>
                                      <span>
                                        {scoreField.value.toFixed(2)}
                                      </span>
                                    </FormLabel>
                                    <FormControl>
                                      <ScoreSlider field={scoreField} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          ))}
                          <div className="p-4 border rounded-md">
                            <div className="space-y-4">
                              <FormField
                                control={form.control}
                                name={`cups.${index}.acidity`}
                                render={({ field: scoreField }) => (
                                  <FormItem>
                                    <FormLabel className="flex justify-between">
                                      <span>Acidity Score</span>
                                      <span>
                                        {scoreField.value.toFixed(2)}
                                      </span>
                                    </FormLabel>
                                    <FormControl>
                                      <ScoreSlider field={scoreField} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`cups.${index}.acidityIntensity`}
                                render={({ field: intensityField }) => (
                                  <FormItem className="space-y-3">
                                    <FormLabel>Acidity Intensity</FormLabel>
                                    <FormControl>
                                      <RadioGroup
                                        onValueChange={intensityField.onChange}
                                        value={intensityField.value}
                                        className="flex space-x-4"
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
                                name={`cups.${index}.body`}
                                render={({ field: scoreField }) => (
                                  <FormItem>
                                    <FormLabel className="flex justify-between">
                                      <span>Body Score</span>
                                      <span>
                                        {scoreField.value.toFixed(2)}
                                      </span>
                                    </FormLabel>
                                    <FormControl>
                                      <ScoreSlider field={scoreField} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`cups.${index}.bodyIntensity`}
                                render={({ field: intensityField }) => (
                                  <FormItem className="space-y-3">
                                    <FormLabel>Body Intensity</FormLabel>
                                    <FormControl>
                                      <RadioGroup
                                        onValueChange={intensityField.onChange}
                                        value={intensityField.value}
                                        className="flex space-x-4"
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
                      </CardContent>
                      <CardFooter>
                        <div className="flex justify-between text-lg font-bold w-full">
                          <span>Cup {index + 1} Total Score</span>
                          <span>{cupTotalScore.toFixed(2)}</span>
                        </div>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                );
              })}
            </Tabs>

            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-xl font-bold">
                <span>Overall Average Score</span>
                <span>{overallScore.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Submit Evaluation
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
