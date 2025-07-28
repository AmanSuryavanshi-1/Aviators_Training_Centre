import React from 'react';

interface CountdownTimerProps {
  targetDate: Date;
  className?: string;
}

export function CountdownTimer({ targetDate, className }: CountdownTimerProps) {
  // Simple placeholder implementation
  return (
    <div className={className}>
      <p className="text-sm text-foreground/60">
        Offer expires: {targetDate.toLocaleDateString()}
      </p>
    </div>
  );
}