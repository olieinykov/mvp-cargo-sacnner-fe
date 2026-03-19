import React from 'react';
import { cn } from '../../lib/utils/cn';

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card: React.FC<CardProps> = ({ className, ...props }) => (
  <div
    className={cn(
      'rounded-xl bg-background shadow-sm',
      className,
    )}
    {...props}
  />
);

type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;
export const CardHeader: React.FC<CardHeaderProps> = ({ className, ...props }) => (
  <div className={cn('px-5 py-4', className)} {...props} />
);

type CardContentProps = React.HTMLAttributes<HTMLDivElement>;
export const CardContent: React.FC<CardContentProps> = ({ className, ...props }) => (
  <div className={cn('px-5 py-4 pt-0', className)} {...props} />
);

