import React, { useState } from 'react';
import { toast } from 'sonner';
import { useInviteInfoQuery, useSignUpInvitedMutation } from '../lib/api/auth';
import { useAuthStore } from '../lib/utils/useAuthStore';
import { useNavigate } from 'react-router-dom';

type Props = {
  token: string | null;
};

const inputCls =
  'h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none ring-offset-background transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50';

export const InvitePage: React.FC<Props> = ({ token }) => {
  const { login } = useAuthStore();
  const { data: invite, isLoading, isError } = useInviteInfoQuery(token);
  const mutation = useSignUpInvitedMutation();

  const [firstName,       setFirstName]       = useState('');
  const [lastName,        setLastName]         = useState('');
  const [password,        setPassword]         = useState('');
  const [confirmPassword, setConfirmPassword]  = useState('');
  const [showPwd,         setShowPwd]          = useState(false);
  const [pwdError,        setPwdError]         = useState('');

  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');

    if (password.length < 8) {
      setPwdError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setPwdError('Passwords do not match');
      return;
    }
    if (!invite || !token) return;

    try {
      const data = await mutation.mutateAsync({
        email:       invite.email,
        password,
        firstName,
        lastName,
        inviteToken: token,
      });
      // Invited signUp doesn't return a token — go to SignIn
      login('', data.user);
      toast.success(`Welcome to ${invite.company.name}! Please sign in.`);
      navigate('sign-in');
    } catch (err) {
      toast.error((err as Error).message ?? 'Registration failed');
    }
  };

  // ── No token in URL ──────────────────────────────────────────────────────────
  if (!token) {
    return (
      <EmptyState
        icon="link"
        title="No invitation token"
        description="This link is missing an invitation token. Check your email and try again."
        action={{ label: 'Go to sign in', onClick: () => navigate('/sign-in') }}
      />
    );
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-primary/[0.03]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
          </svg>
          <p className="text-sm">Verifying invitation…</p>
        </div>
      </div>
    );
  }

  // ── Invalid / expired token ──────────────────────────────────────────────────
  if (isError || !invite) {
    return (
      <EmptyState
        icon="x"
        title="Invalid invitation"
        description="This invitation link is invalid or has expired. Ask your admin to send a new one."
        action={{ label: 'Go to sign in', onClick: () => navigate('/sign-in') }}
      />
    );
  }

  // ── Valid invite — show registration form ────────────────────────────────────
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-primary/[0.03] p-4">
      <div className="w-full max-w-sm">

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

        {/* Invite banner */}
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">You've been invited to join</p>
            <p className="truncate text-sm font-semibold text-foreground">{invite.company.name}</p>
          </div>
          <span className="ml-auto shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium capitalize text-primary">
            {invite.role}
          </span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-foreground">Complete your account</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Signing up as <span className="font-medium text-foreground">{invite.email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="firstName" className="text-sm font-medium text-foreground">First name</label>
                <input id="firstName" type="text" autoComplete="given-name" required value={firstName}
                  onChange={(e) => setFirstName(e.target.value)} placeholder="John" className={inputCls}/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="lastName" className="text-sm font-medium text-foreground">Last name</label>
                <input id="lastName" type="text" autoComplete="family-name" required value={lastName}
                  onChange={(e) => setLastName(e.target.value)} placeholder="Doe" className={inputCls}/>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <input id="password" type={showPwd ? 'text' : 'password'} autoComplete="new-password"
                  required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" className={`${inputCls} pr-10`}/>
                <button type="button" aria-label="Toggle password" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground">
                  {showPwd
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/></svg>
                  }
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">Confirm password</label>
              <input id="confirmPassword" type={showPwd ? 'text' : 'password'} autoComplete="new-password"
                required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••" className={inputCls}/>
              {pwdError && <p className="text-xs text-red-500">{pwdError}</p>}
            </div>

            <button
              type="submit"
              disabled={mutation.isPending || !firstName || !lastName || !password}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60"
            >
              {mutation.isPending ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                  </svg>
                  Creating account…
                </>
              ) : `Join ${invite.company.name}`}
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

// ─── Empty state helper ────────────────────────────────────────────────────────

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: 'link' | 'x';
  title: string;
  description: string;
  action: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-primary/[0.03] p-4">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/50 bg-muted/30 text-muted-foreground">
          {icon === 'x' ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6"/>
              <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          )}
        </div>
        <div>
          <p className="font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <button type="button" onClick={action.onClick}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90">
          {action.label}
        </button>
      </div>
    </div>
  );
}