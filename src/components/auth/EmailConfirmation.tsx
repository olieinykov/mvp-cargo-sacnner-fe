import { useNavigate } from 'react-router-dom';
import { BrandLogo } from '../common/BrandLogo';
import React from 'react';

type EmailConfirmationProps = {
  registeredEmail: string | null;
  setRegisteredEmail: (email: string | null) => void;
};

export const EmailConfirmation: React.FC<EmailConfirmationProps> = ({
  registeredEmail,
  setRegisteredEmail,
}) => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-primary/[0.03] p-4">
      <div className="w-full max-w-sm">
        <BrandLogo />

        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm text-center">
          {/* Mail icon */}
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect
                x="2"
                y="4"
                width="20"
                height="16"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M2 7l10 7 10-7"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h2 className="text-lg font-semibold text-foreground">Check your inbox</h2>
          <p className="mt-2 text-sm text-muted-foreground">We sent a confirmation link to</p>
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
};
