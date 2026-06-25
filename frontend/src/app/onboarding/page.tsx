'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  User,
  Mail,
  Phone,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { BRANCHES, YEARS, SUBJECTS, APP_NAME } from '@/constants';
import { cn } from '@/lib/utils';

// ---- Validation Schema ----
const onboardingSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  branch: z.string().min(1, 'Please select your branch'),
  year: z.string().min(1, 'Please select your year'),
  subjects: z.array(z.string()).min(1, 'Select at least one subject'),
  phone: z
    .string()
    .min(10, 'Enter a valid phone number')
    .regex(/^[+]?[\d\s-]{10,15}$/, 'Invalid phone format'),
  email: z.string().email('Enter a valid email address'),
  googleAccount: z.string().email('Enter a valid Google account'),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const steps = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Academics', icon: BookOpen },
  { id: 3, title: 'Contact', icon: Mail },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: '',
      branch: '',
      year: '',
      subjects: [],
      phone: '',
      email: '',
      googleAccount: '',
    },
    mode: 'onChange',
  });

  const selectedSubjects = watch('subjects');

  const toggleSubject = (subject: string) => {
    const current = selectedSubjects || [];
    if (current.includes(subject)) {
      setValue(
        'subjects',
        current.filter((s) => s !== subject),
        { shouldValidate: true }
      );
    } else {
      setValue('subjects', [...current, subject], { shouldValidate: true });
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof OnboardingFormData)[] = [];
    if (currentStep === 1) fieldsToValidate = ['fullName'];
    if (currentStep === 2) fieldsToValidate = ['branch', 'year', 'subjects'];

    const isValid = await trigger(fieldsToValidate);
    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    toast({
      title: 'Welcome to CampusFlow! 🎉',
      message: `Great to have you, ${data.fullName}. Let\'s get productive!`,
      type: 'success',
    });
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background gradient-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/25 mb-4">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent">
              {APP_NAME}
            </span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Let&apos;s set up your profile in just a few steps
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-2 mb-8"
        >
          {steps.map((step, idx) => (
            <React.Fragment key={step.id}>
              <div
                className={cn(
                  'flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all duration-300',
                  currentStep === step.id
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : currentStep > step.id
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {currentStep > step.id ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <step.icon className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">{step.title}</span>
                <span className="sm:hidden">{step.id}</span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 w-8 rounded-full transition-colors duration-300',
                    currentStep > step.id ? 'bg-emerald-500' : 'bg-border'
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </motion.div>

        {/* Form Card */}
        <Card className="glass border-border/50 shadow-xl">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait">
                {/* Step 1: Personal Info */}
                {currentStep === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    <div>
                      <h2 className="text-lg font-semibold mb-1">
                        Personal Information
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Tell us about yourself
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <div className="relative mt-1.5">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="fullName"
                            placeholder="Enter your full name"
                            className="pl-10"
                            {...register('fullName')}
                            aria-invalid={errors.fullName ? 'true' : 'false'}
                          />
                        </div>
                        {errors.fullName && (
                          <p className="text-xs text-destructive mt-1.5" role="alert">
                            {errors.fullName.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Academics */}
                {currentStep === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    <div>
                      <h2 className="text-lg font-semibold mb-1">
                        Academic Details
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Help us personalize your experience
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="branch">Branch</Label>
                          <Select
                            id="branch"
                            className="mt-1.5"
                            {...register('branch')}
                            aria-invalid={errors.branch ? 'true' : 'false'}
                          >
                            <option value="">Select branch</option>
                            {BRANCHES.map((b) => (
                              <option key={b} value={b}>
                                {b}
                              </option>
                            ))}
                          </Select>
                          {errors.branch && (
                            <p className="text-xs text-destructive mt-1.5" role="alert">
                              {errors.branch.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="year">Year</Label>
                          <Select
                            id="year"
                            className="mt-1.5"
                            {...register('year')}
                            aria-invalid={errors.year ? 'true' : 'false'}
                          >
                            <option value="">Select year</option>
                            {YEARS.map((y) => (
                              <option key={y.value} value={y.value}>
                                {y.label}
                              </option>
                            ))}
                          </Select>
                          {errors.year && (
                            <p className="text-xs text-destructive mt-1.5" role="alert">
                              {errors.year.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label>Subjects</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          Select the subjects you&apos;re currently studying
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {SUBJECTS.map((subject) => {
                            const isSelected = selectedSubjects?.includes(subject);
                            return (
                              <button
                                key={subject}
                                type="button"
                                onClick={() => toggleSubject(subject)}
                                className={cn(
                                  'rounded-full px-3 py-1.5 text-xs font-medium border transition-all duration-200',
                                  isSelected
                                    ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
                                    : 'bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground'
                                )}
                                aria-pressed={isSelected}
                              >
                                {subject}
                              </button>
                            );
                          })}
                        </div>
                        {errors.subjects && (
                          <p className="text-xs text-destructive mt-1.5" role="alert">
                            {errors.subjects.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Contact */}
                {currentStep === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    <div>
                      <h2 className="text-lg font-semibold mb-1">
                        Contact & Integrations
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        We&apos;ll use these for reminders and calendar sync
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative mt-1.5">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            placeholder="+91 98765 43210"
                            className="pl-10"
                            {...register('phone')}
                            aria-invalid={errors.phone ? 'true' : 'false'}
                          />
                        </div>
                        {errors.phone && (
                          <p className="text-xs text-destructive mt-1.5" role="alert">
                            {errors.phone.message}
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Used for WhatsApp reminders
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative mt-1.5">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            placeholder="you@university.edu"
                            className="pl-10"
                            {...register('email')}
                            aria-invalid={errors.email ? 'true' : 'false'}
                          />
                        </div>
                        {errors.email && (
                          <p className="text-xs text-destructive mt-1.5" role="alert">
                            {errors.email.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="googleAccount">Google Account</Label>
                        <div className="relative mt-1.5">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="googleAccount"
                            placeholder="you@gmail.com"
                            className="pl-10"
                            {...register('googleAccount')}
                            aria-invalid={errors.googleAccount ? 'true' : 'false'}
                          />
                        </div>
                        {errors.googleAccount && (
                          <p className="text-xs text-destructive mt-1.5" role="alert">
                            {errors.googleAccount.message}
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Used for Google Calendar integration
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-4 border-t border-border/50">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>

                {currentStep < 3 ? (
                  <Button type="button" onClick={nextStep} className="gap-2">
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="gradient"
                    disabled={isSubmitting}
                    className="gap-2 min-w-[140px]"
                  >
                    {isSubmitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <>
                        Get Started
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Skip link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-4 text-xs text-muted-foreground"
        >
          Already have an account?{' '}
          <button
            onClick={() => router.push('/dashboard')}
            className="text-primary hover:underline font-medium"
          >
            Go to Dashboard
          </button>
        </motion.p>
      </div>
    </div>
  );
}
