export interface TasbihStepResult {
  nextCount: number;
  justReachedMilestone: boolean;
  completedRounds: number;
}

export function advanceTasbihCount(currentCount: number, milestone: number): TasbihStepResult {
  const safeMilestone = Math.max(1, Math.floor(milestone));
  const nextCount = Math.max(0, Math.floor(currentCount)) + 1;
  const justReachedMilestone = nextCount % safeMilestone === 0;
  const completedRounds = Math.floor(nextCount / safeMilestone);
  return {
    nextCount,
    justReachedMilestone,
    completedRounds,
  };
}

export function calculateRingProgress(current: number, target: number): number {
  const safeTarget = Math.max(1, target);
  if (current <= 0) return 0;
  const mod = current % safeTarget;
  if (mod === 0) return 1;
  return Math.min(1, Math.max(0, mod / safeTarget));
}
