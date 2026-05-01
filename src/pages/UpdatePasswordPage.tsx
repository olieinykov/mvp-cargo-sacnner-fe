import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useUpdatePasswordMutation } from '../lib/api/auth';
import { BrandLogo } from '../components/common/BrandLogo';

function parseHashToken(): { accessToken: string | null; type: string | null } {
  const hash = window.location.hash.slice(1);
  const params = new URLSearchParams(hash);
  return {
    accessToken: params.get('access_token'),
    type: params.get('type'),
  };
}

export const UpdatePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const mutation = useUpdatePasswordMutation();

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const { accessToken: token, type } = parseHashToken();
    if (token && type === 'recovery') {
      setAccessToken(token);
      setTokenValid(true);
    } else {
      setTokenValid(false);
    }
  }, []);

  const passwordsMatch = password === confirm;
  const canSubmit = password.length >= 8 && passwordsMatch && !mutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    try {
      await mutation.mutateAsync({ password, accessToken });
      setDone(true);
    } catch (err) {
      toast.error((err as Error).message ?? 'Failed to update password');
    }
  };

  // ── Loading / checking token ──
  if (tokenValid === null) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-primary/[0.03]">
        <svg className="h-6 w-6 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
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
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-primary/[0.03] p-4">
      <div className="w-full max-w-sm">
        {/* Logo / brand mark */}
        <BrandLogo />

        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
          {/* Invalid / expired token */}
          {!tokenValid && (
            <div className="flex flex-col items-center gap-4 py-2 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 ring-1 ring-red-200">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="1.8" />
                  <path
                    d="M12 8v4M12 16h.01"
                    stroke="#ef4444"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Link is invalid or expired
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  This password reset link is no longer valid.
                  <br />
                  Please request a new one.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/sign-in')}
                className="mt-2 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
              >
                Back to sign in
              </button>
            </div>
          )}

          {/* Success */}
          {tokenValid && done && (
            <div className="flex flex-col items-center gap-4 py-2 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-200">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="#059669" strokeWidth="1.8" />
                  <path
                    d="M8 12l3 3 5-5"
                    stroke="#059669"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Password updated!</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Your password has been changed successfully.
                  <br />
                  You can now sign in with your new password.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/sign-in')}
                className="mt-2 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
              >
                Go to sign in
              </button>
            </div>
          )}

          {/* Form */}
          {tokenValid && !done && (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground">Set new password</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose a strong password — at least 8 characters.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                {/* New password */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="new-password" className="text-sm font-medium text-foreground">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPwd ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none ring-offset-background transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <button
                      type="button"
                      aria-label={showPwd ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPwd((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors hover:text-muted-foreground"
                    >
                      {showPwd ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                          />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
                  {password.length > 0 && password.length < 8 && (
                    <p className="text-xs text-red-500">Password must be at least 8 characters.</p>
                  )}
                </div>

                {/* Confirm password */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirm-password" className="text-sm font-medium text-foreground">
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConf ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repeat your password"
                      className={`h-10 w-full rounded-lg border bg-background px-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none ring-offset-background transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                        confirm.length > 0 && !passwordsMatch
                          ? 'border-red-400 focus-visible:ring-red-400'
                          : 'border-input'
                      }`}
                    />
                    <button
                      type="button"
                      aria-label={showConf ? 'Hide password' : 'Show password'}
                      onClick={() => setShowConf((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors hover:text-muted-foreground"
                    >
                      {showConf ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                          />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
                  {confirm.length > 0 && !passwordsMatch && (
                    <p className="text-xs text-red-500">Passwords do not match.</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60"
                >
                  {mutation.isPending ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
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
                      Updating…
                    </>
                  ) : (
                    'Update password'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
