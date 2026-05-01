import React from 'react';
import { cn } from '../../lib/utils/cn';

type ButtonVariant = 'default' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
};

const baseClasses =
  'inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50';

const variantClasses: Record<ButtonVariant, string> = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  outline: 'border border-border bg-background hover:bg-muted hover:text-foreground',
  ghost: 'hover:bg-muted hover:text-foreground',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3',
  md: 'h-10 px-4',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  ),
);

Button.displayName = 'Button';
