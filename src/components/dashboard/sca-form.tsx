'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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

const scoreSchema = z.coerce.number().min(0).max(10);

const formSchema = z.object({
  coffeeName: z.string().min(1, 'Coffee name is required'),
  evaluator: z.string().min(1, 'Evaluator name is required'),
  aroma: scoreSchema,
  flavor: scoreSchema,
  aftertaste: scoreSchema,
  acidity: scoreSchema,
  body: scoreSchema,
  balance: scoreSchema,
  floral: scoreSchema,
  fruity: scoreSchema,
  sweetSpice: scoreSchema,
  nutty: scoreSchema,
  toasted: scoreSchema,
  richChocolate: scoreSchema,
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
const flavorFields = [
  'floral',
  'fruity',
  'sweetSpice',
  'nutty',
  'toasted',
  'richChocolate',
] as const;

export function ScaForm({ onSubmit }: ScaFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      coffeeName: '',
      evaluator: '',
      aroma: 7,
      flavor: 7,
      aftertaste: 7,
      acidity: 7,
      body: 7,
      balance: 7,
      floral: 5,
      fruity: 5,
      sweetSpice: 5,
      nutty: 5,
      toasted: 5,
      richChocolate: 5,
      notes: '',
    },
  });

  function handleSubmit(values: FormValues) {
    const scores = scoreFields.map((name) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: values[name],
    }));

    const flavorProfile = {
      Floral: values.floral,
      Fruity: values.fruity,
      'Sweet Spice': values.sweetSpice,
      Nutty: values.nutty,
      Toasted: values.toasted,
      'Rich Chocolate': values.richChocolate,
    };

    const overallScore = scores.reduce((acc, score) => acc + score.value, 0) / scores.length * 10;

    const evaluationData: Omit<Evaluation, 'id'> = {
      coffeeName: values.coffeeName,
      evaluator: values.evaluator,
      scores,
      flavorProfile,
      overallScore,
      notes: values.notes || '',
    };
    
    onSubmit({ ...evaluationData, id: 'temp-id' });
  }

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/([A-Z])/g, ' $1');

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="coffeeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coffee Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Ethiopia Yirgacheffe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="evaluator"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Evaluator</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />
            <h3 className="text-lg font-semibold">Scores</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {scoreFields.map((name) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex justify-between">
                        <span>{capitalize(name)}</span>
                        <span>{field.value.toFixed(2)}</span>
                      </FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={10}
                          step={0.25}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <Separator />
            <h3 className="text-lg font-semibold">Flavor Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {flavorFields.map((name) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex justify-between">
                         <span>{capitalize(name)}</span>
                        <span>{field.value.toFixed(2)}</span>
                      </FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={10}
                          step={0.25}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
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
