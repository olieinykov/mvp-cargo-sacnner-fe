import React, { useState } from 'react';
import { toast } from 'sonner';
import { useSignUpAdminMutation } from '../lib/api/auth';
import { useNavigate } from 'react-router-dom';

type FormState = {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  companyName: string;
  dotNumber: string;
  mcNumber: string;
};

const INIT: FormState = {
  email: '', password: '', confirmPassword: '',
  firstName: '', lastName: '',
  companyName: '', dotNumber: '', mcNumber: '',
};

function Field({
  label, id, required, children,
  hint,
}: {
  label: string;
  id: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {!required && <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

const inputCls =
  'h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none ring-offset-background transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50';

export const SignUpPage: React.FC = () => {
  const mutation = useSignUpAdminMutation();
  const [form, setForm] = useState<FormState>(INIT);
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const navigate = useNavigate()

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!form.email)         next.email = 'Email is required';
    if (!form.firstName)     next.firstName = 'First name is required';
    if (!form.lastName)      next.lastName = 'Last name is required';
    if (form.password.length < 8) next.password = 'Minimum 8 characters';
    if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match';
    if (!form.companyName)   next.companyName = 'Company name is required';
    if (!form.dotNumber)     next.dotNumber = 'DOT number is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await mutation.mutateAsync({
        email:     form.email,
        password:  form.password,
        firstName: form.firstName,
        lastName:  form.lastName,
        company: {
          name:      form.companyName,
          dotNumber: form.dotNumber,
          ...(form.mcNumber ? { mcNumber: form.mcNumber } : {}),
        },
      });
      setRegisteredEmail(form.email);
    } catch (err) {
      toast.error((err as Error).message ?? 'Registration failed');
    }
  };

  const err = (key: keyof FormState) =>
    errors[key] ? (
      <p className="text-xs text-red-500">{errors[key]}</p>
    ) : null;

  // ── Email confirmation screen ──────────────────────────────────────────────
  if (registeredEmail) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-primary/[0.03] p-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">HazmatAudit</h1>
          </div>

          <div className="rounded-2xl border border-border bg-background p-6 shadow-sm text-center">
            {/* Mail icon */}
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M2 7l10 7 10-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>

            <h2 className="text-lg font-semibold text-foreground">Check your inbox</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We sent a confirmation link to
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">{registeredEmail}</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Click the link in the email to activate your account, then sign in.
            </p>

            <button
              type="button"
              onClick={() => navigate('/sign-in')}
              className="mt-6 flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Go to sign in
            </button>
          </div>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Wrong email?{' '}
            <button
              type="button"
              onClick={() => setRegisteredEmail(null)}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Go back
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-primary/[0.03] p-4">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">HazmatAudit</h1>
        </div>

        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">Register your company</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              You'll become the admin. Invite your team after signing in.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

            {/* ── Personal info ── */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                Your info
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="First name" id="firstName" required>
                  <input id="firstName" type="text" autoComplete="given-name" value={form.firstName} onChange={set('firstName')} placeholder="John" className={inputCls}/>
                  {err('firstName')}
                </Field>
                <Field label="Last name" id="lastName" required>
                  <input id="lastName" type="text" autoComplete="family-name" value={form.lastName} onChange={set('lastName')} placeholder="Doe" className={inputCls}/>
                  {err('lastName')}
                </Field>
              </div>
              <div className="mt-3">
                <Field label="Email" id="email" required>
                  <input id="email" type="email" autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@company.com" className={inputCls}/>
                  {err('email')}
                </Field>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Field label="Password" id="password" required>
                  <div className="relative">
                    <input
                      id="password" type={showPwd ? 'text' : 'password'} autoComplete="new-password"
                      value={form.password} onChange={set('password')} placeholder="••••••••"
                      className={`${inputCls} pr-10`}
                    />
                    <button type="button" aria-label="Toggle password" onClick={() => setShowPwd(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground">
                      {showPwd
                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/></svg>
                      }
                    </button>
                  </div>
                  {err('password')}
                </Field>
                <Field label="Confirm password" id="confirmPassword" required>
                  <input id="confirmPassword" type={showPwd ? 'text' : 'password'} autoComplete="new-password"
                    value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="••••••••" className={inputCls}/>
                  {err('confirmPassword')}
                </Field>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border" aria-hidden="true"/>

            {/* ── Company info ── */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                Company info
              </p>
              <div className="flex flex-col gap-3">
                <Field label="Company name" id="companyName" required>
                  <input id="companyName" type="text" value={form.companyName} onChange={set('companyName')} placeholder="Acme Logistics LLC" className={inputCls}/>
                  {err('companyName')}
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="DOT number" id="dotNumber" required hint="e.g. 1234567">
                    <input id="dotNumber" type="text" value={form.dotNumber} onChange={set('dotNumber')} placeholder="1234567" className={inputCls}/>
                    {err('dotNumber')}
                  </Field>
                  <Field label="MC number" id="mcNumber" hint="e.g. MC-999000">
                    <input id="mcNumber" type="text" value={form.mcNumber} onChange={set('mcNumber')} placeholder="MC-999000" className={inputCls}/>
                  </Field>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60"
            >
              {mutation.isPending ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                  </svg>
                  Creating account…
                </>
              ) : 'Create account'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <button type="button" onClick={() => navigate('/sign-in')}
            className="font-medium text-primary underline-offset-4 hover:underline">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};