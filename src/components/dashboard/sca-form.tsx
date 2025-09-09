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
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

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
      notes: '',
    },
  });

  const watchedTemperature = useWatch({
    control: form.control,
    name: 'waterTemperature',
  });

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
    const scores = scoreFields.map((name) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: values[name],
    }));

    const overallScore =
      (scores.reduce((acc, score) => acc + score.value, 0) / scores.length) *
      10;

    const evaluationData: Omit<Evaluation, 'id'> = {
      coffeeName: values.coffeeName,
      roastLevel: values.roastLevel,
      waterTemperature: values.waterTemperature,
      dryFragrance: values.dryFragrance,
      wetAroma: values.wetAroma,
      acidityIntensity: values.acidityIntensity,
      bodyIntensity: values.bodyIntensity,
      scores,
      overallScore,
      notes: values.notes || '',
    };

    onSubmit({ ...evaluationData, id: 'temp-id' });
  }

  const capitalize = (s: string) =>
    s.charAt(0).toUpperCase() + s.slice(1).replace(/([A-Z])/g, ' $1');

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
                        <Slider
                          min={6}
                          max={10}
                          step={0.25}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
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
                        <Slider
                          min={6}
                          max={10}
                          step={0.25}
                          value={[field.value as number]}
                          onValueChange={(value) => field.onChange(value[0])}
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
                        <Slider
                          min={6}
                          max={10}
                          step={0.25}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
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
                        <Slider
                          min={6}
                          max={10}
                          step={0.25}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
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
