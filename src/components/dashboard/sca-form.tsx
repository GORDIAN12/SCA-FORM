
'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import type { Evaluation } from '@/lib/types';
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

const cupSchema = z.object({
  uniformity: z.boolean().default(true),
  cleanCup: z.boolean().default(true),
  sweetness: z.boolean().default(true),
});

const formSchema = z.object({
  coffeeName: z.string().min(1, 'Coffee name is required'),
  roastLevel: z.enum(['light', 'medium', 'medium-dark', 'dark'], {
    required_error: 'You need to select a roast level.',
  }),
  aromaCategory: aromaCategorySchema.optional(),
  dryFragrance: intensitySchema,
  wetAroma: intensitySchema,
  cups: z.array(cupSchema).length(5),
  aroma: scoreSchema,
  flavor: scoreSchema,
  aftertaste: scoreSchema,
  acidity: scoreSchema,
  acidityIntensity: intensitySchema,
  body: scoreSchema,
  bodyIntensity: intensitySchema,
  balance: scoreSchema,
  cupperScore: scoreSchema,
  defects: z.object({
    cups: z.coerce.number().min(0).max(5).default(0),
    intensity: z.coerce.number().min(0).max(20).default(0),
  }),
  notes: z.string().optional(),
});

export type ScaFormValues = z.infer<typeof formSchema>;

interface ScaFormProps {
  onSubmit: (data: Evaluation) => void;
  onValuesChange?: (data: ScaFormValues) => void;
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
    <div className="relative flex justify-between text-xs text-muted-foreground mt-9 px-2.5">
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

export function ScaForm({ onSubmit, onValuesChange }: ScaFormProps) {
  const form = useForm<ScaFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      coffeeName: '',
      roastLevel: 'medium',
      aromaCategory: 'Frutal',
      dryFragrance: 'medium',
      wetAroma: 'medium',
      cups: Array(5).fill({
        uniformity: true,
        cleanCup: true,
        sweetness: true,
      }),
      aroma: 8,
      flavor: 8,
      aftertaste: 8,
      acidity: 8,
      acidityIntensity: 'medium',
      body: 8,
      bodyIntensity: 'medium',
      balance: 8,
      cupperScore: 8,
      defects: { cups: 0, intensity: 0 },
      notes: '',
    },
  });

  const watchedValues = useWatch({ control: form.control });

  useEffect(() => {
    if (onValuesChange) {
      onValuesChange(watchedValues as ScaFormValues);
    }
  }, [watchedValues, onValuesChange]);

  const { totalScore, defectsScore } = useMemo(() => {
    const cups = watchedValues.cups || [];
    const uniformityScore =
      cups.filter((cup) => cup.uniformity).length * 2;
    const cleanCupScore =
      cups.filter((cup) => cup.cleanCup).length * 2;
    const sweetnessScore =
      cups.filter((cup) => cup.sweetness).length * 2;


    const defectsScore =
      (watchedValues.defects?.cups || 0) *
      (watchedValues.defects?.intensity || 0);

    const baseScoresTotal = scoreFields.reduce(
      (acc, field) => acc + (watchedValues[field] || 0),
      0
    );

    const subtotal =
      baseScoresTotal + uniformityScore + cleanCupScore + sweetnessScore;
    const totalScore = subtotal - defectsScore;

    return { totalScore, defectsScore };
  }, [watchedValues]);

  function handleSubmit(values: ScaFormValues) {
    const uniformityScore = values.cups.filter((c) => c.uniformity).length * 2;
    const cleanCupScore = values.cups.filter((c) => c.cleanCup).length * 2;
    const sweetnessScore = values.cups.filter((c) => c.sweetness).length * 2;
    const defectPoints =
      (values.defects.cups || 0) * (values.defects.intensity || 0);

    const scores = [
      ...scoreFields.map((name) => ({
        name:
          name.charAt(0).toUpperCase() +
          name.slice(1).replace('Score', ' Score'),
        value: values[name],
      })),
      { name: 'Uniformity', value: uniformityScore },
      { name: 'Clean Cup', value: cleanCupScore },
      { name: 'Sweetness', value: sweetnessScore },
    ];

    const subtotal = scores.reduce((acc, score) => acc + score.value, 0);
    const overallScore = subtotal - defectPoints;

    const evaluationData: Omit<Evaluation, 'id'> = {
      coffeeName: values.coffeeName,
      roastLevel: values.roastLevel,
      aromaCategory: values.aromaCategory,
      dryFragrance: values.dryFragrance,
      wetAroma: values.wetAroma,
      acidityIntensity: values.acidityIntensity,
      bodyIntensity: values.bodyIntensity,
      scores,
      uniformity: uniformityScore,
      cleanCup: cleanCupScore,
      sweetness: sweetnessScore,
      defects: defectPoints,
      overallScore: totalScore,
      notes: values.notes || '',
    };

    onSubmit({ ...evaluationData, id: 'temp-id' });
  }

  const capitalize = (s: string) =>
    s.charAt(0).toUpperCase() + s.slice(1).replace(/([A-Z])/g, ' $1');
  
  const cupQualityFields = ['uniformity', 'cleanCup', 'sweetness'] as const;


  return (
    <Card>
      <CardHeader>
        <CardTitle>SCA Evaluation Form</CardTitle>
        <CardDescription>
          Enter the coffee cupping details below.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
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

            <Separator />
            <FormField
              control={form.control}
              name="roastLevel"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Roast Level</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4 sm:grid-cols-4"
                    >
                      <FormItem>
                        <FormControl>
                          <RadioGroupItem value="light" className="sr-only" />
                        </FormControl>
                        <FormLabel
                          className={cn(
                            'flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer h-full',
                            field.value === 'light' && 'border-primary'
                          )}
                        >
                          <span
                            className="mb-2 inline-block size-6 rounded-full"
                            style={{ backgroundColor: '#e7c6a4' }}
                          />
                          Light
                        </FormLabel>
                      </FormItem>
                      <FormItem>
                        <FormControl>
                          <RadioGroupItem value="medium" className="sr-only" />
                        </FormControl>
                        <FormLabel
                          className={cn(
                            'flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer h-full',
                            field.value === 'medium' && 'border-primary'
                          )}
                        >
                          <span
                            className="mb-2 inline-block size-6 rounded-full"
                            style={{ backgroundColor: '#a47551' }}
                          />
                          Medium
                        </FormLabel>
                      </FormItem>
                      <FormItem>
                        <FormControl>
                          <RadioGroupItem
                            value="medium-dark"
                            className="sr-only"
                          />
                        </FormControl>
                        <FormLabel
                          className={cn(
                            'flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer h-full',
                            field.value === 'medium-dark' && 'border-primary'
                          )}
                        >
                          <span
                            className="mb-2 inline-block size-6 rounded-full"
                            style={{ backgroundColor: '#6b4a35' }}
                          />
                          Medium-Dark
                        </FormLabel>
                      </FormItem>
                      <FormItem>
                        <FormControl>
                          <RadioGroupItem value="dark" className="sr-only" />
                        </FormControl>
                        <FormLabel
                          className={cn(
                            'flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer h-full',
                            field.value === 'dark' && 'border-primary'
                          )}
                        >
                          <span
                            className="mb-2 inline-block size-6 rounded-full"
                            style={{ backgroundColor: '#4a2d1e' }}
                          />
                          Dark
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
              name="aromaCategory"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Aroma Category</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
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
                              field.value === category
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

            <Separator />
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Cup Quality</h3>
              <Tabs defaultValue="cup-1" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  {[...Array(5)].map((_, i) => (
                    <TabsTrigger key={`cup-trigger-${i}`} value={`cup-${i + 1}`}>
                      Cup {i + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {[...Array(5)].map((_, i) => (
                  <TabsContent key={`cup-content-${i}`} value={`cup-${i + 1}`}>
                    <Card>
                      <CardContent className="space-y-4 pt-6">
                        {cupQualityFields.map((quality) => (
                          <FormField
                            key={`cup-${i}-${quality}`}
                            control={form.control}
                            name={`cups.${i}.${quality}`}
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex justify-between items-center">
                                  <FormLabel>{capitalize(quality)}</FormLabel>
                                  <div className="flex items-center gap-4">
                                    <CupSelector
                                      field={{
                                        value: field.value,
                                        onChange: field.onChange,
                                      }}
                                    />
                                    <span className="text-sm font-medium w-8 text-right">
                                      {field.value ? 2 : 0}
                                    </span>
                                  </div>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </div>


            <Separator />
            <h3 className="text-lg font-semibold">Scores</h3>
            <div className="space-y-4">
              <div className="p-4 border rounded-md">
                <h4 className="text-md font-medium mb-2">Fragrance / Aroma</h4>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="aroma"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex justify-between">
                          <span>Aroma Score</span>
                          <span>{field.value.toFixed(2)}</span>
                        </FormLabel>
                        <FormControl>
                          <ScoreSlider
                            field={{
                              value: field.value,
                              onChange: field.onChange,
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dryFragrance"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Dry Fragrance</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
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
                      name="wetAroma"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Wet Aroma (Crust)</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
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

              {['flavor', 'aftertaste', 'balance'].map((name) => (
                <div key={name} className="p-4 border rounded-md">
                  <FormField
                    control={form.control}
                    name={name as keyof ScaFormValues}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex justify-between">
                          <span>{capitalize(name)}</span>
                          <span>{(field.value as number).toFixed(2)}</span>
                        </FormLabel>
                        <FormControl>
                          <ScoreSlider
                            field={{
                              value: field.value as number,
                              onChange: field.onChange,
                            }}
                          />
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
                    name="acidity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex justify-between">
                          <span>Acidity Score</span>
                          <span>{field.value.toFixed(2)}</span>
                        </FormLabel>
                        <FormControl>
                          <ScoreSlider
                            field={{
                              value: field.value,
                              onChange: field.onChange,
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="acidityIntensity"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Acidity Intensity</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="low" />
                              </FormControl>
                              <FormLabel className="font-normal">Low</FormLabel>
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
                              <FormLabel className="font-normal">High</FormLabel>
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
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex justify-between">
                          <span>Body Score</span>
                          <span>{field.value.toFixed(2)}</span>
                        </FormLabel>
                        <FormControl>
                          <ScoreSlider
                            field={{
                              value: field.value,
                              onChange: field.onChange,
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bodyIntensity"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Body Intensity</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="low" />
                              </FormControl>
                              <FormLabel className="font-normal">Low</FormLabel>
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
                              <FormLabel className="font-normal">High</FormLabel>
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
                  name={'cupperScore'}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex justify-between">
                        <span>Cupper Score</span>
                        <span>{(field.value as number).toFixed(2)}</span>
                      </FormLabel>
                      <FormControl>
                        <ScoreSlider
                          field={{
                            value: field.value as number,
                            onChange: field.onChange,
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Defects</h3>
              <div className="grid grid-cols-3 items-center gap-4">
                <FormField
                  control={form.control}
                  name="defects.cups"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No. of Cups</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="5" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <span className="text-center self-end pb-2">x</span>
                <FormField
                  control={form.control}
                  name="defects.intensity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intensity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          step="2"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormDescription>Taint = 2, Fault = 4</FormDescription>
              <div className="flex justify-end items-center gap-4 font-medium">
                <span>Defect Score:</span>
                <span className="w-16 text-right text-lg text-destructive">
                  -{defectsScore}
                </span>
              </div>
            </div>

            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Score</span>
                <span>{totalScore.toFixed(2)}</span>
              </div>
            </div>
            <Separator />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overall Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe overall impressions of the coffee..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
