import React, { useState } from 'react';
import { toast } from 'sonner';
import { useInviteInfoQuery, useSignUpInvitedMutation } from '../lib/api/auth';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../components/ui/EmptyState';
import { BrandLogo } from '../components/common/BrandLogo';

type Props = {
  token: string | null;
};

const inputCls =
  'h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none ring-offset-background transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50';

export const InvitePage: React.FC<Props> = ({ token }) => {
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
        <BrandLogo />

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