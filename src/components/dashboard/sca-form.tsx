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
import type { Evaluation, CupEvaluation, ScaFormValues as ScaFormValuesType, ScoreSet } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  useEffect,
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
  useCallback,
} from 'react';
import { cn } from '@/lib/utils';
import { Coffee, Volume2, LoaderCircle, Plus, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlavorProfileChart } from './flavor-profile-chart';
import { useLanguage } from '@/context/language-context';
import { Button } from '@/components/ui/button';
import { textToSpeech } from '@/ai/flows/tts-flow';

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
  draftId: z.string().optional(),
  coffeeName: z.string().min(1, 'Coffee name is required'),
  roastLevel: roastLevelSchema,
  cups: z.array(cupEvaluationSchema).min(1),
  lastModified: z.string().optional(),
});

export type ScaFormValues = z.infer<typeof formSchema>;
export type CupFormValues = z.infer<typeof cupEvaluationSchema>;
export type ScoreSetFormValues = z.infer<typeof scoreSetSchema>;

interface ScaFormProps {
  initialData?: Omit<Evaluation, 'id' | 'createdAt' | 'userId' | 'isFavorite'> | null;
  onSubmit: (data: Omit<Evaluation, 'id' | 'createdAt' | 'userId'>) => void;
  onValuesChange?: (data: ScaFormValues) => void;
  onActiveCupChange?: (cupId: string, cupData: CupFormValues | null) => void;
  isSubmitting?: boolean;
}

export interface ScaFormRef {
  submit: () => void;
  reset: (isSubmission?: boolean) => void;
  loadDraft: (data: ScaFormValues) => void;
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
  id
}: {
  field: {
    value: number;
    onChange: (value: number) => void;
  };
  disabled?: boolean;
  id?: string;
}) => (
  <div className="relative pt-2" id={id}>
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
  draftId: `draft-${Date.now()}`,
  coffeeName: '',
  roastLevel: 'medium',
  cups: [createDefaultCup(0)],
  lastModified: new Date().toISOString(),
});

const DRAFTS_KEY = 'cupping-compass-drafts';

// New component to hold the cup evaluation content
const CupEvaluationContent = ({ form, index, isReadOnly, isSubmitting, isAudioLoading, activeTempTab, setActiveTempTab, fieldId }: {
    form: any,
    index: number,
    isReadOnly: boolean,
    isSubmitting: boolean,
    isAudioLoading: boolean,
    activeTempTab: 'hot' | 'warm' | 'cold',
    setActiveTempTab: (temp: 'hot' | 'warm' | 'cold') => void,
    fieldId: string
}) => {
    const { t } = useLanguage();
    const watchedCup = useWatch({ control: form.control, name: `cups.${index}` });

    const cupTotalScore = useMemo(() => {
        if (!watchedCup) return 0;
        const cupValues = watchedCup as CupFormValues;

        const avgScores = Object.keys(cupValues.scores.hot).reduce(
            (acc, key) => {
                const scoreKey = key as keyof ScoreSetFormValues;
                if (
                    typeof cupValues.scores.hot[scoreKey] === 'number'
                ) {
                    const hotScore = (cupValues.scores.hot[scoreKey] as number) ?? 0;
                    const warmScore = (cupValues.scores.warm[scoreKey] as number) ?? 0;
                    const coldScore = (cupValues.scores.cold[scoreKey] as number) ?? 0;
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
    }, [watchedCup]);

    useEffect(() => {
        if (!isReadOnly && watchedCup.totalScore !== parseFloat(cupTotalScore.toFixed(2))) {
            form.setValue(
                `cups.${index}.totalScore`,
                parseFloat(cupTotalScore.toFixed(2))
            );
        }
    }, [cupTotalScore, index, form, isReadOnly, watchedCup.totalScore]);

    const handleSoundEffect = (soundUrl: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      const audio = new Audio(soundUrl);
      audio.play();
    };

    return (
        <TabsContent key={fieldId} value={fieldId}>
          <Card>
            <CardHeader>
               <div className="flex items-center gap-2">
                    <CardTitle>{t('cup')} {index + 1} {t('evaluation')}</CardTitle>
                     <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleSoundEffect('/sounds/olor.mp3')}
                        disabled={isAudioLoading}
                    >
                        {isAudioLoading ? (
                        <LoaderCircle className="animate-spin" />
                        ) : (
                        <Volume2 className="h-4 w-4" />
                        )}
                        <span className="sr-only">Play Sound</span>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">
                    {t('cupQuality')}
                    </h3>
                    <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleSoundEffect('/sounds/calidad.mp3')}
                    disabled={isAudioLoading}
                    >
                    {isAudioLoading ? (
                        <LoaderCircle className="animate-spin" />
                    ) : (
                        <Volume2 className="h-4 w-4" />
                    )}
                    <span className="sr-only">Play Sound</span>
                    </Button>
                </div>
                {(
                  ['uniformity', 'cleanCup', 'sweetness'] as const
                ).map((quality) => (
                  <FormField
                    key={`${fieldId}-${quality}`}
                    control={form.control}
                    name={`cups.${index}.${quality}`}
                    render={({ field: qualityField }) => (
                      <FormItem>
                        <div className="flex justify-between items-center">
                          <FormLabel>
                            {t(quality)}
                          </FormLabel>
                          <div className="flex items-center gap-4">
                            <CupSelector
                              field={qualityField}
                              disabled={isReadOnly || isSubmitting}
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
              <h3 className="text-lg font-semibold">{t('scores')}</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name={`cups.${index}.aromaCategory`}
                  render={({ field: aromaField }) => (
                    <FormItem className="space-y-3">
                       <div className="flex items-center gap-2">
                        <FormLabel>{t('aromaCategory')}</FormLabel>
                         <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={handleSoundEffect('/sounds/aromas.mp3')}
                            disabled={isAudioLoading}
                        >
                            {isAudioLoading ? (
                            <LoaderCircle className="animate-spin" />
                            ) : (
                            <Volume2 className="h-4 w-4" />
                            )}
                            <span className="sr-only">Play Sound</span>
                        </Button>
                      </div>
                      <FormControl>
                        <RadioGroup
                          onValueChange={aromaField.onChange}
                          value={aromaField.value}
                          className="flex flex-wrap gap-2"
                          disabled={isReadOnly || isSubmitting}
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
                                  (isReadOnly || isSubmitting) &&
                                    'cursor-not-allowed opacity-70'
                                )}
                              >
                                {t(`aroma${category.replace('/', '')}`)}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="p-4 border rounded-md" id="fragrance-aroma-section">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-md font-medium">
                      {t('fragranceAroma')}
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={handleSoundEffect('/sounds/olor.mp3')}
                      disabled={isAudioLoading}
                    >
                      {isAudioLoading ? (
                        <LoaderCircle className="animate-spin" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                      <span className="sr-only">Play Sound</span>
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name={`cups.${index}.aroma`}
                      render={({ field: scoreField }) => (
                        <FormItem>
                          <FormLabel className="flex justify-between">
                            <span>{t('aromaScore')}</span>
                            <span>
                              {scoreField.value.toFixed(2)}
                            </span>
                          </FormLabel>
                          <FormControl>
                            <ScoreSlider
                              field={scoreField}
                              disabled={isReadOnly || isSubmitting}
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
                            <div className="flex items-center gap-2">
                              <FormLabel>{t('dryFragrance')}</FormLabel>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={handleSoundEffect('/sounds/olor.mp3')}
                                disabled={isAudioLoading}
                              >
                                {isAudioLoading ? (
                                  <LoaderCircle className="animate-spin" />
                                ) : (
                                  <Volume2 className="h-4 w-4" />
                                )}
                                <span className="sr-only">Play Sound</span>
                              </Button>
                            </div>
                            <FormControl>
                              <RadioGroup
                                onValueChange={intensityField.onChange}
                                value={intensityField.value}
                                className="flex space-x-4"
                                disabled={isReadOnly || isSubmitting}
                              >
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="low" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {t('low')}
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="medium" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {t('medium')}
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="high" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {t('high')}
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
                            <div className="flex items-center gap-2">
                              <FormLabel>{t('wetAroma')}</FormLabel>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={handleSoundEffect('/sounds/olor.mp3')}
                                disabled={isAudioLoading}
                              >
                                {isAudioLoading ? (
                                  <LoaderCircle className="animate-spin" />
                                ) : (
                                  <Volume2 className="h-4 w-4" />
                                )}
                                <span className="sr-only">Play Sound</span>
                              </Button>
                            </div>
                            <FormControl>
                              <RadioGroup
                                onValueChange={intensityField.onChange}
                                value={intensityField.value}
                                className="flex space-x-4"
                                disabled={isReadOnly || isSubmitting}
                              >
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="low" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {t('low')}
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="medium" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {t('medium')}
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="high" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {t('high')}
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
                
                <div id="temperature-tabs-section">
                    <Tabs
                        defaultValue="hot"
                        className="w-full"
                        onValueChange={(value) =>
                        setActiveTempTab(value as 'hot' | 'warm' | 'cold')
                        }
                        value={activeTempTab}
                    >
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-10 w-10"
                                onClick={handleSoundEffect('/sounds/temperaturas.mp3')}
                                disabled={isAudioLoading}
                            >
                                {isAudioLoading ? <LoaderCircle className="animate-spin" /> : <Volume2 />}
                                <span className="sr-only">Play Sound</span>
                            </Button>
                            <TabsList className="grid w-full grid-cols-3">
                                {(['hot', 'warm', 'cold'] as const).map((temp) => (
                                <TabsTrigger
                                    key={temp}
                                    value={temp}
                                    disabled={isSubmitting}
                                >
                                    {t(temp)}
                                </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>
                    {(['hot', 'warm', 'cold'] as const).map(
                        (temp) => (
                        <TabsContent key={temp} value={temp} forceMount className={cn('space-y-4 pt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', activeTempTab !== temp && "hidden")}>
                            <div className="p-4 border rounded-md">
                                <FormField
                                control={form.control}
                                name={`cups.${index}.scores.${temp}.flavor`}
                                render={({ field: scoreField }) => (
                                    <FormItem>
                                    <FormLabel className="flex justify-between">
                                        <div className="flex items-center gap-2">
                                            <span>{t('flavor')}</span>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={handleSoundEffect('/sounds/olor.mp3')}
                                                disabled={isAudioLoading}
                                            >
                                                {isAudioLoading ? (
                                                <LoaderCircle className="animate-spin" />
                                                ) : (
                                                <Volume2 className="h-4 w-4" />
                                                )}
                                                <span className="sr-only">Play Sound</span>
                                            </Button>
                                        </div>
                                        <span>
                                        {scoreField.value.toFixed(2)}
                                        </span>
                                    </FormLabel>
                                    <FormControl>
                                        <ScoreSlider
                                        field={scoreField}
                                        disabled={isReadOnly || isSubmitting}
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
                                        <div className="flex items-center gap-2">
                                            <span>{t('aftertaste')}</span>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={handleSoundEffect('/sounds/sabor_despues.mp3')}
                                                disabled={isAudioLoading}
                                            >
                                                {isAudioLoading ? (
                                                <LoaderCircle className="animate-spin" />
                                                ) : (
                                                <Volume2 className="h-4 w-4" />
                                                )}
                                                <span className="sr-only">Play Sound</span>
                                            </Button>
                                        </div>
                                        <span>
                                        {scoreField.value.toFixed(2)}
                                        </span>
                                    </FormLabel>
                                    <FormControl>
                                        <ScoreSlider
                                        field={scoreField}
                                        disabled={isReadOnly || isSubmitting}
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
                                        <div className="flex items-center gap-2">
                                            <span>{t('acidityScore')}</span>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={handleSoundEffect('/sounds/acido.mp3')}
                                                disabled={isAudioLoading}
                                            >
                                                {isAudioLoading ? (
                                                <LoaderCircle className="animate-spin" />
                                                ) : (
                                                <Volume2 className="h-4 w-4" />
                                                )}
                                                <span className="sr-only">Play Sound</span>
                                            </Button>
                                        </div>
                                        <span>
                                            {scoreField.value.toFixed(
                                            2
                                            )}
                                        </span>
                                        </FormLabel>
                                        <FormControl>
                                        <ScoreSlider
                                            field={scoreField}
                                            disabled={isReadOnly || isSubmitting}
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
                                        {t('acidityIntensity')}
                                        </FormLabel>
                                        <FormControl>
                                        <RadioGroup
                                            onValueChange={
                                            intensityField.onChange
                                            }
                                            value={intensityField.value}
                                            className="flex space-x-4"
                                            disabled={isReadOnly || isSubmitting}
                                        >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="low" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                {t('low')}
                                            </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="medium" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                {t('medium')}
                                            </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="high" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                {t('high')}
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
                                        <div className="flex items-center gap-2">
                                            <span>{t('bodyScore')}</span>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={handleSoundEffect('/sounds/sabor_fuerte-cuerpo.mp3')}
                                                disabled={isAudioLoading}
                                            >
                                                {isAudioLoading ? (
                                                <LoaderCircle className="animate-spin" />
                                                ) : (
                                                <Volume2 className="h-4 w-4" />
                                                )}
                                                <span className="sr-only">Play Sound</span>
                                            </Button>
                                        </div>
                                        <span>
                                            {scoreField.value.toFixed(
                                            2
                                            )}
                                        </span>
                                        </FormLabel>
                                        <FormControl>
                                        <ScoreSlider
                                            field={scoreField}
                                            disabled={isReadOnly || isSubmitting}
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
                                        {t('bodyIntensity')}
                                        </FormLabel>
                                        <FormControl>
                                        <RadioGroup
                                            onValueChange={
                                            intensityField.onChange
                                            }
                                            value={intensityField.value}
                                            className="flex space-x-4"
                                            disabled={isReadOnly || isSubmitting}
                                        >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="low" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                {t('low')}
                                            </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="medium" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                {t('medium')}
                                            </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="high" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                {t('high')}
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
                                        <div className="flex items-center gap-2">
                                            <span>{t('balance')}</span>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={handleSoundEffect('/sounds/balance.mp3')}
                                                disabled={isAudioLoading}
                                            >
                                                {isAudioLoading ? (
                                                <LoaderCircle className="animate-spin" />
                                                ) : (
                                                <Volume2 className="h-4 w-4" />
                                                )}
                                                <span className="sr-only">Play Sound</span>
                                            </Button>
                                        </div>
                                        <span>
                                        {scoreField.value.toFixed(2)}
                                        </span>
                                    </FormLabel>
                                    <FormControl>
                                        <ScoreSlider
                                        field={scoreField}
                                        disabled={isReadOnly || isSubmitting}
                                        />
                                    </FormControl>
                                    </FormItem>
                                )}
                                />
                            </div>
                        </TabsContent>
                        )
                    )}
                    </Tabs>
                 </div>

                <div className="p-4 border rounded-md">
                  <FormField
                    control={form.control}
                    name={`cups.${index}.cupperScore`}
                    render={({ field: scoreField }) => (
                      <FormItem>
                        <FormLabel className="flex justify-between">
                          <div className="flex items-center gap-2">
                            <span>{t('cupperScore')}</span>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={handleSoundEffect('/sounds/catador.mp3')}
                                disabled={isAudioLoading}
                            >
                                {isAudioLoading ? (
                                <LoaderCircle className="animate-spin" />
                                ) : (
                                <Volume2 className="h-4 w-4" />
                                )}
                                <span className="sr-only">Play Sound</span>
                            </Button>
                          </div>
                          <span>
                            {scoreField.value.toFixed(2)}
                          </span>
                        </FormLabel>
                        <FormControl>
                          <ScoreSlider
                            field={scoreField}
                            disabled={isReadOnly || isSubmitting}
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
}

export const ScaForm = forwardRef<ScaFormRef, ScaFormProps>(
  ({ initialData, onSubmit, onValuesChange, onActiveCupChange, isSubmitting }, ref) => {
    const [activeCupTab, setActiveCupTab] = useState('cup-1');
    const [activeTempTab, setActiveTempTab] = useState<'hot' | 'warm' | 'cold'>('hot');
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const isReadOnly = !!initialData;
    const { t } = useLanguage();
    const previousValuesRef = useRef<ScaFormValues | null>(null);

    const roastLevels = [
      { id: 'light', label: t('roastLight'), color: 'bg-[#966F33]' },
      { id: 'medium', label: t('roastMedium'), color: 'bg-[#6A4C2E]' },
      { id: 'medium-dark', label: t('roastMediumDark'), color: 'bg-[#4A3522]' },
      { id: 'dark', label: t('roastDark'), color: 'bg-[#3A2418]' },
    ];
    
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
        const resetData = {
          coffeeName: initialData.coffeeName,
          roastLevel: initialData.roastLevel,
          cups: initialData.cups,
        };
        form.reset(resetData);
        previousValuesRef.current = resetData as ScaFormValues;
      } else {
        const defaultValues = createDefaultFormValues();
        form.reset(defaultValues);
        previousValuesRef.current = defaultValues;
      }
    }, [initialData, form]);

    useImperativeHandle(ref, () => ({
      submit: form.handleSubmit(handleSubmit),
      reset: (isSubmission = false) => {
        const currentDraftId = form.getValues('draftId');
        if (isSubmission && currentDraftId) {
            if (typeof window !== 'undefined') {
                const drafts = JSON.parse(localStorage.getItem(DRAFTS_KEY) || '{}');
                delete drafts[currentDraftId];
                localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
            }
        }
        const newValues = createDefaultFormValues();
        form.reset(newValues);
        setActiveCupTab('cup-1');
        previousValuesRef.current = newValues;
      },
      loadDraft: (data) => {
        if (!isReadOnly) {
            form.reset(data);
            setActiveCupTab(data.cups[0]?.id || 'cup-1');
            previousValuesRef.current = data;
        }
      }
    }));

    const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: 'cups',
    });
    
    const handleAddCup = () => {
        const newCup = createDefaultCup(fields.length);
        append(newCup);
        setActiveCupTab(newCup.id);
    };

    const handleRemoveCup = (index: number) => {
        if (fields.length <= 1) return;
        const cupToRemoveId = fields[index].id;
        
        // If the active tab is the one being removed, switch to a different tab
        if (activeCupTab === cupToRemoveId) {
            if (index > 0) {
                setActiveCupTab(fields[index - 1].id);
            } else {
                setActiveCupTab(fields[1].id);
            }
        }
        remove(index);
    };

    const watchedValues = useWatch({ control: form.control });
    
    const handleScoreSync = useCallback((currentValues: ScaFormValues) => {
        const prevValues = previousValuesRef.current;
        if (!prevValues) return;

        const cupIndex = fields.findIndex(f => f.id === activeCupTab);
        if (cupIndex === -1) return;

        const currentCup = currentValues.cups?.[cupIndex];
        const prevCup = prevValues.cups?.[cupIndex];

        if (!currentCup || !prevCup) return;

        const scoreKeys: (keyof ScoreSet)[] = ['flavor', 'aftertaste', 'acidity', 'body', 'balance'];
        const tempKeys: ('hot' | 'warm' | 'cold')[] = ['hot', 'warm', 'cold'];
    
        for (const temp of tempKeys) {
            for (const scoreKey of scoreKeys) {
                if (currentCup.scores[temp][scoreKey] !== prevCup.scores[temp][scoreKey]) {
                    const newValue = currentCup.scores[temp][scoreKey];
                    tempKeys.forEach(otherTemp => {
                        if (otherTemp !== temp && form.getValues(`cups.${cupIndex}.scores.${otherTemp}.${scoreKey}`) !== newValue) {
                            form.setValue(`cups.${cupIndex}.scores.${otherTemp}.${scoreKey}`, newValue as any, { shouldDirty: true });
                        }
                    });
                    // Update ref immediately to prevent loops
                    previousValuesRef.current = form.getValues();
                    return;
                }
            }
        }
    }, [activeCupTab, form, fields]);


    useEffect(() => {
        const subscription = form.watch((currentValues) => {
            const currentScaValues = currentValues as ScaFormValues;
            
            if (onValuesChange) {
                onValuesChange(currentScaValues);
            }

            if (!isReadOnly) {
                if (currentScaValues.coffeeName && currentScaValues.draftId) {
                    const currentDraft = { ...currentScaValues, lastModified: new Date().toISOString() };
                    try {
                        const drafts = JSON.parse(localStorage.getItem(DRAFTS_KEY) || '{}');
                        drafts[currentScaValues.draftId] = currentDraft;
                        localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
                    } catch (error) {
                        console.error("Failed to save draft to localStorage", error);
                    }
                }
                
                if (JSON.stringify(currentScaValues) !== JSON.stringify(previousValuesRef.current)) {
                    handleScoreSync(currentScaValues);
                    previousValuesRef.current = currentScaValues;
                }
            }
        });
        return () => subscription.unsubscribe();
    }, [form, onValuesChange, isReadOnly, handleScoreSync]);

    const activeCupIndex = useMemo(() => {
      return fields.findIndex(f => f.id === activeCupTab);
    }, [activeCupTab, fields]);

    const activeCupData = watchedValues.cups?.[activeCupIndex];
    
    const flavorProfileData = useMemo(() => {
        if (!activeCupData) return null;

        const { aroma, scores } = activeCupData;
        const tempScores = scores?.[activeTempTab];

        if (!tempScores) return null;

        return {
            aroma: aroma,
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
      
      const draftId = values.draftId;
      if (!isReadOnly && draftId && typeof window !== 'undefined') {
        const drafts = JSON.parse(localStorage.getItem(DRAFTS_KEY) || '{}');
        delete drafts[draftId];
        localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
      }

      onSubmit(evaluationData);
    }

    const handleSoundEffect = (soundUrl: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      const audio = new Audio(soundUrl);
      audio.play();
    };
    
    const capitalize = (s: string) =>
      s.charAt(0).toUpperCase() + s.slice(1).replace(/([A-Z])/g, ' $1');


    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('scaFormTitle')}</CardTitle>
          <CardDescription>
            {isReadOnly ? t('scaFormDescriptionReadOnly') : t('scaFormDescriptionEdit')}
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4" id="coffeeName-section">
                <FormField
                  control={form.control}
                  name="coffeeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('coffeeName')}</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input
                            placeholder={t('coffeeNamePlaceholder')}
                            {...field}
                            disabled={isReadOnly || isSubmitting}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleSoundEffect('/sounds/olor.mp3')}
                          disabled={isAudioLoading}
                        >
                          {isAudioLoading ? (
                            <LoaderCircle className="animate-spin" />
                          ) : (
                            <Volume2 />
                          )}
                          <span className="sr-only">Play Sound</span>
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="roastLevel"
                  render={({ field }) => (
                    <FormItem className="space-y-3" id="roastLevel-section">
                      <div className="flex items-center gap-2">
                        <FormLabel>{t('roastLevel')}</FormLabel>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={handleSoundEffect('/sounds/niveles_tueste.mp3')}
                          disabled={isAudioLoading}
                        >
                          {isAudioLoading ? (
                            <LoaderCircle className="animate-spin" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                          <span className="sr-only">Play Sound</span>
                        </Button>
                      </div>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-2 md:grid-cols-4 gap-4"
                          disabled={isReadOnly || isSubmitting}
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
                                  (isReadOnly || isSubmitting) && 'cursor-not-allowed opacity-70'
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
                value={activeCupTab}
              >
                 <div className="flex items-center gap-2" id="cup-tabs-section">
                    <div className="flex items-center gap-2 flex-grow">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 shrink-0"
                            onClick={handleSoundEffect('/sounds/number_taza.mp3')}
                            disabled={isAudioLoading}
                        >
                            {isAudioLoading ? <LoaderCircle className="animate-spin" /> : <Volume2 />}
                            <span className="sr-only">Play Sound</span>
                        </Button>
                        <TabsList className="grid w-full" style={{gridTemplateColumns: `repeat(${fields.length}, minmax(0, 1fr))`}}>
                        {fields.map((field, index) => (
                            <TabsTrigger key={field.id} value={field.id} disabled={isSubmitting} className="relative pr-6">
                                <span>{t('cup')} {index + 1}</span>
                                {!isReadOnly && fields.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveCup(index);
                                        }}
                                        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-muted-foreground/20"
                                    >
                                        <X className="size-3" />
                                    </button>
                                )}
                            </TabsTrigger>
                        ))}
                        </TabsList>
                    </div>
                     {!isReadOnly && (
                        <Button type="button" size="icon" variant="ghost" onClick={handleAddCup} disabled={isSubmitting}>
                            <Plus className="size-4" />
                        </Button>
                    )}
                </div>
                {fields.map((field, index) => (
                    <CupEvaluationContent
                        key={field.id}
                        fieldId={field.id}
                        form={form}
                        index={index}
                        isReadOnly={isReadOnly}
                        isSubmitting={!!isSubmitting}
                        isAudioLoading={isAudioLoading}
                        activeTempTab={activeTempTab}
                        setActiveTempTab={setActiveTempTab}
                    />
                ))}
              </Tabs>
              <Card>
                  <CardHeader>
                    <h3 className="text-xl font-semibold">{t('flavorProfile')}</h3>
                  </CardHeader>
                  <CardContent className="pt-6">
                      <Tabs 
                          defaultValue="hot" 
                          className="w-full" 
                          onValueChange={(value) => setActiveTempTab(value as 'hot' | 'warm' | 'cold')}
                          value={activeTempTab}
                      >
                          <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="hot" disabled={isSubmitting}>{t('hot')}</TabsTrigger>
                              <TabsTrigger value="warm" disabled={isSubmitting}>{t('warm')}</TabsTrigger>
                              <TabsTrigger value="cold" disabled={isSubmitting}>{t('cold')}</TabsTrigger>
                          </TabsList>
                      </Tabs>
                      
                      <div className="h-80 mt-4">
                          {flavorProfileData && <FlavorProfileChart scores={flavorProfileData} />}
                      </div>
                  </CardContent>
              </Card>
               <div className="p-6 space-y-6">
                 <Separator />
                 <div className="space-y-2">
                   <div className="flex justify-between text-xl font-bold">
                     <span>{t('overallAverageScore')}</span>
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
export { DRAFTS_KEY };
