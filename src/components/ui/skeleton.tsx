import React from 'react';
import { cn } from '../../lib/utils/cn';

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => (
  <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />
);
