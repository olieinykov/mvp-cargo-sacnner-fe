import { useState } from "react";
import { useRequestPasswordResetMutation } from "../../lib/api/auth";
import { toast } from "sonner";

export const ForgotPasswordView = ({
  initialEmail,
  onBack,
}: {
  initialEmail: string;
  onBack: () => void;
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [sent, setSent] = useState(false);
  const mutation = useRequestPasswordResetMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutation.mutateAsync(email);
      setSent(true);
    } catch (err) {
      toast.error((err as Error).message ?? 'Failed to send reset email');
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-200">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path 
              d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8" 
              stroke="currentColor" 
              strokeWidth="1.8" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" 
              stroke="currentColor" 
              strokeWidth="1.8" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="m16 19 2 2 4-4" 
              stroke="#059669" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">Check your inbox</h3>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            We sent a password reset link to{' '}
            <span className="font-medium text-foreground">{email}</span>.
            <br />
            Follow the link in the email to set a new password.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="mt-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Reset password</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="reset-email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="reset-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none ring-offset-background transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={mutation.isPending || !email}
          className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60"
        >
          {mutation.isPending ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
              </svg>
              Sending…
            </>
          ) : 'Send reset link'}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-full items-center justify-center rounded-lg border border-border text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Back to sign in
        </button>
      </form>
    </>
  );
}