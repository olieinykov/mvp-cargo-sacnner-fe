import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/common/BrandLogo';
import { ForgotPasswordView } from '../components/auth/ForgotPasswordForm';
import { SignInView } from '../components/auth/SignInForm';

// ─── Page ──────────────────────────────────────────────────────────────────────

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'signin' | 'forgot'>('signin');
  const [forgotEmail, setForgotEmail] = useState('');

  const handleForgotPassword = (email: string) => {
    setForgotEmail(email);
    setView('forgot');
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-primary/[0.03] p-4">
      <div className="w-full max-w-sm">
        {/* Logo / brand mark */}
        <BrandLogo />

        {/* Card */}
        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
          {view === 'signin' ? (
            <SignInView onForgotPassword={handleForgotPassword} />
          ) : (
            <ForgotPasswordView initialEmail={forgotEmail} onBack={() => setView('signin')} />
          )}
        </div>

        {/* Footer link — only on sign in view */}
        {view === 'signin' && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/sign-up')}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Register your company
            </button>
          </p>
        )}
      </div>
    </div>
  );
};
