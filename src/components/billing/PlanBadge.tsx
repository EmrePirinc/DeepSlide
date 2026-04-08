'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import { useAuth } from '@/hooks/useAuth';
import { getPlan } from '@/lib/billing/plans';

export function PlanBadge() {
  const { user, profile, isPremium } = useAuth();

  if (!user) return null;

  const plan = getPlan(profile.plan);
  const { trialRemaining, monthlyPresentationsUsed } = profile;
  const monthlyLimit = plan.limits.monthlyPresentations;
  const remaining = monthlyLimit - monthlyPresentationsUsed;

  if (isPremium) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
        Pro
      </span>
    );
  }

  if (trialRemaining > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600">
        Trial {trialRemaining}/3
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
        Free
      </span>
      {monthlyLimit !== Infinity && (
        <span className="text-xs text-muted-foreground">
          {remaining}/{monthlyLimit} sunum
        </span>
      )}
    </div>
  );
}
