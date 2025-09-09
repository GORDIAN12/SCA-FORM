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

const scoreSchema = z.coerce.number().min(6).max(10);
const intensitySchema = z.enum(['low', 'medium', 'high'], {
  required_error: 'You need to select an intensity level.',
});

const formSchema = z.object({
  coffeeName: z.string().min(1, 'Coffee name is required'),
  roastLevel: z.enum(['light', 'medium', 'medium-dark', 'dark'], {
    required_error: 'You need to select a roast level.',
  }),
  waterTemperature: z.enum(['cold', 'warm', 'hot'], {
    required_error: 'You need to select a water temperature.',
  }),
  dryFragrance: intensitySchema,
  wetAroma: intensitySchema,
  aroma: scoreSchema,
  flavor: scoreSchema,
  aftertaste: scoreSchema,
  acidity: scoreSchema,
  acidityIntensity: intensitySchema,
  body: scoreSchema,
  bodyIntensity: intensitySchema,
  balance: scoreSchema,
  uniformity: z.array(z.boolean()).length(5).default(Array(5).fill(true)),
  cleanCup: z.array(z.boolean()).length(5).default(Array(5).fill(true)),
  sweetness: z.array(z.boolean()).length(5).default(Array(5).fill(true)),
  defects: z.object({
    cups: z.coerce.number().min(0).max(5).default(0),
    intensity: z.coerce.number().min(0).max(4).step(2).default(0),
  }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ScaFormProps {
  onSubmit: (data: Evaluation) => void;
}

const scoreFields = [
  'aroma',
  'flavor',
  'aftertaste',
  'acidity',
  'body',
  'balance',
] as const;

const temperatureDefaults: Record<
  'cold' | 'warm' | 'hot',
  Partial<FormValues>
> = {
  hot: {
    aroma: 8.5,
    flavor: 8.25,
    aftertaste: 8,
    acidity: 8.5,
    body: 8,
    balance: 8.25,
  },
  warm: {
    aroma: 7,
    flavor: 7.5,
    aftertaste: 7.25,
    acidity: 6.5,
    body: 7.5,
    balance: 7,
  },
  cold: {
    aroma: 6,
    flavor: 6.5,
    aftertaste: 6,
    acidity: 6.5,
    body: 6.5,
    balance: 6,
  },
};

const CupSelector = ({
  field,
}: {
  field: {
    value: boolean[];
    onChange: (value: boolean[]) => void;
  };
}) => {
  const toggleCup = (index: number) => {
    const newValues = [...field.value];
    newValues[index] = !newValues[index];
    field.onChange(newValues);
  };
  return (
    <div className="flex items-center space-x-2">
      {[...Array(5)].map((_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => toggleCup(index)}
          className={cn(
            'p-1 rounded-md transition-colors',
            'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          <Coffee
            className={cn(
              'size-5 transition-colors',
              field.value[index]
                ? 'text-primary fill-primary/20'
                : 'text-muted-foreground/50'
            )}
          />
        </button>
      ))}
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
  <div className="relative">
    <Slider
      min={6}
      max={10}
      step={0.25}
      value={[field.value]}
      onValueChange={(value) => field.onChange(value[0])}
    />
    <div className="relative flex justify-between text-xs text-muted-foreground mt-1 px-1">
      {[...Array(5)].map((_, i) => (
        <span key={i}>{6 + i}</span>
      ))}
    </div>
  </div>
);

export function ScaForm({ onSubmit }: ScaFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      coffeeName: '',
      roastLevel: 'medium',
      waterTemperature: 'hot',
      dryFragrance: 'medium',
      wetAroma: 'medium',
      acidityIntensity: 'medium',
      bodyIntensity: 'medium',
      ...temperatureDefaults.hot,
      uniformity: Array(5).fill(true),
      cleanCup: Array(5).fill(true),
      sweetness: Array(5).fill(true),
      defects: { cups: 0, intensity: 0 },
      notes: '',
    },
  });

  const watchedTemperature = useWatch({
    control: form.control,
    name: 'waterTemperature',
  });

  const watchedDefects = useWatch({
    control: form.control,
    name: 'defects',
  });

  const defectsScore = useMemo(() => {
    return (watchedDefects.cups || 0) * (watchedDefects.intensity || 0);
  }, [watchedDefects]);

  useEffect(() => {
    const newDefaults = temperatureDefaults[watchedTemperature];
    for (const key in newDefaults) {
      form.setValue(
        key as keyof FormValues,
        newDefaults[key as keyof FormValues]
      );
    }
  }, [watchedTemperature, form]);

  function handleSubmit(values: FormValues) {
    const uniformityScore = values.uniformity.filter(Boolean).length * 2;
    const cleanCupScore = values.cleanCup.filter(Boolean).length * 2;
    const sweetnessScore = values.sweetness.filter(Boolean).length * 2;
    const defectPoints = (values.defects.cups || 0) * (values.defects.intensity || 0);

    const scores = [
      ...scoreFields.map((name) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
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
      waterTemperature: values.waterTemperature,
      dryFragrance: values.dryFragrance,
      wetAroma: values.wetAroma,
      acidityIntensity: values.acidityIntensity,
      bodyIntensity: values.bodyIntensity,
      scores,
      uniformity: uniformityScore,
      cleanCup: cleanCupScore,
      sweetness: sweetnessScore,
      defects: defectPoints,
      overallScore,
      notes: values.notes || '',
    };

    onSubmit({ ...evaluationData, id: 'temp-id' });
  }

  const capitalize = (s: string) =>
    s.charAt(0).toUpperCase() + s.slice(1).replace(/([A-Z])/g, ' $1');

  const cupFields = ['uniformity', 'cleanCup', 'sweetness'] as const;

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
                      className="flex flex-wrap gap-4"
                    >
                      <FormItem>
                        <FormControl>
                          <RadioGroupItem value="light" className="sr-only" />
                        </FormControl>
                        <FormLabel
                          className={cn(
                            'flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer',
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
                            'flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer',
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
                            'flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer',
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
                            'flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer',
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

            <Separator />
            <FormField
              control={form.control}
              name="waterTemperature"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Water Temperature</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1 md:flex-row md:space-y-0 md:space-x-8"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="cold" />
                        </FormControl>
                        <FormLabel className="font-normal">Cold</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="warm" />
                        </FormControl>
                        <FormLabel className="font-normal">Warm</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="hot" />
                        </FormControl>
                        <FormLabel className="font-normal">Hot</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />
            <h3 className="text-lg font-semibold">Scores</h3>
            <div>
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

            <div className="space-y-4">
              {['flavor', 'aftertaste', 'balance'].map((name) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name as keyof FormValues}
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
              ))}
            </div>

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
                          <FormLabel className="font-normal">Medium</FormLabel>
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
                          <FormLabel className="font-normal">Medium</FormLabel>
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

            <Separator />
            <div className="space-y-4">
              {cupFields.map((name) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => {
                    const checkedCount = field.value.filter(Boolean).length;
                    const score = checkedCount * 2;
                    return (
                      <FormItem>
                        <div className="flex justify-between items-center">
                          <FormLabel>{capitalize(name)}</FormLabel>
                          <div className="flex items-center gap-4">
                            <CupSelector
                              field={{
                                value: field.value,
                                onChange: field.onChange,
                              }}
                            />
                            <span className="text-sm font-medium w-8 text-right">
                              {score}
                            </span>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              ))}
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
                <span>x</span>
                <FormField
                  control={form.control}
                  name="defects.intensity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intensity</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="4" step="2" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
               <FormDescription>
                Intensity: Taint = 2, Fault = 4
              </FormDescription>
              <div className="flex justify-end items-center gap-4 font-medium">
                <span>Defect Score:</span>
                <span className="w-16 text-right text-lg text-destructive">
                  -{defectsScore}
                </span>
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
