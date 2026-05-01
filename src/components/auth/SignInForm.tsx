import React, { useState } from 'react';
import { useSignInMutation } from '../../lib/api/auth';
import { useAuthStore } from '../../lib/utils/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type SignInViewProps = {
  onForgotPassword: (email: string) => void;
};

export const SignInView: React.FC<SignInViewProps> = ({ onForgotPassword }) => {
  const { login } = useAuthStore();
  const mutation = useSignInMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await mutation.mutateAsync({ email, password });
      login(data.accessToken);
      toast.success('Welcome back!');
      navigate('/audits');
    } catch (err) {
      const message = (err as Error).message ?? 'Sign-in failed';
      if (message === 'EMAIL_NOT_CONFIRMED') {
        toast.error('Please confirm your email before signing in. Check your inbox.');
      } else {
        toast.error(message);
      }
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      toast.error('Please enter your email address first.');
      return;
    }
    onForgotPassword(email);
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Sign in</h2>
        <p className="mt-1 text-sm text-muted-foreground">Enter your credentials to continue</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none ring-offset-background transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPwd ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none ring-offset-background transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
            />
            <button
              type="button"
              aria-label={showPwd ? 'Hide password' : 'Show password'}
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors hover:text-muted-foreground"
            >
              {showPwd ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60"
        >
          {mutation.isPending ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>
    </>
  );
};
