'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth, useUser } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
import { CuppingCompassLogo } from '@/components/cupping-compass-logo';
import { useLanguage } from '@/context/language-context';
import { GoogleLogo } from '@/components/google-logo';

const signUpSchema = z
  .object({
    email: z.string().email({ message: 'Invalid email address.' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });

const signInSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;
type SignInFormValues = z.infer<typeof signInSchema>;

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && user) {
        router.push('/');
    }
  }, [user, isUserLoading, router]);

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSignUp = async (values: SignUpFormValues) => {
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: t('accountCreated'),
        description: t('youHaveBeenRegistered'),
      });
      router.push('/?new_user=true');
    } catch (error: any) {
      toast({
        title: t('registrationFailed'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (values: SignInFormValues) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: t('signedIn'),
        description: t('welcomeBack'),
      });
      router.push('/');
    } catch (error: any) {
      toast({
        title: t('signInFailed'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    const email = signInForm.getValues('email');
    if (!email) {
      signInForm.setError('email', {
        type: 'manual',
        message: t('emailForPasswordReset'),
      });
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: t('passwordResetSent'),
        description: t('passwordResetSentDescription'),
      });
    } catch (error: any) {
      toast({
        title: t('passwordResetFailed'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({
        title: t('signedIn'),
        description: t('welcomeBack'),
      });
      router.push('/');
    } catch (error: any) {
      toast({
        title: t('signInFailed'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <CuppingCompassLogo className="size-16 text-primary" />
        </div>
        <Tabs defaultValue="sign-in" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sign-in">{t('signIn')}</TabsTrigger>
            <TabsTrigger value="sign-up">{t('signUp')}</TabsTrigger>
          </TabsList>
          <TabsContent value="sign-in">
            <Card>
              <CardHeader>
                <CardTitle>{t('signIn')}</CardTitle>
                <CardDescription>
                  {t('signInDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...signInForm}>
                  <form
                    onSubmit={signInForm.handleSubmit(handleSignIn)}
                    className="space-y-6"
                  >
                    <FormField
                      control={signInForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('email')}</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="m@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signInForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('password')}</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                           <div className="text-right">
                            <Button
                              type="button"
                              variant="link"
                              className="px-0 h-auto font-normal text-sm"
                              onClick={handlePasswordReset}
                            >
                              {t('forgotPassword')}
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? t('signingIn') : t('signIn')}
                    </Button>
                  </form>
                </Form>
                 <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      {t('orContinueWith')}
                    </span>
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                  <GoogleLogo className="mr-2 h-4 w-4" />
                  Sign in with Google
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="sign-up">
            <Card>
              <CardHeader>
                <CardTitle>{t('signUp')}</CardTitle>
                <CardDescription>
                  {t('signUpDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...signUpForm}>
                  <form
                    onSubmit={signUpForm.handleSubmit(handleSignUp)}
                    className="space-y-6"
                  >
                    <FormField
                      control={signUpForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('email')}</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="m@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signUpForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('password')}</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signUpForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('confirmPassword')}</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? t('creatingAccount') : t('createAccount')}
                    </Button>
                  </form>
                </Form>
                 <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      {t('orContinueWith')}
                    </span>
                  </div>
                </div>
                 <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                  <GoogleLogo className="mr-2 h-4 w-4" />
                   Sign in with Google
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
