import type { GoalStatus } from "../types";

const transitions: Record<GoalStatus, readonly GoalStatus[]> = {
  active: ["active", "paused", "completed", "canceled"],
  paused: ["paused", "active", "completed", "canceled"],
  completed: ["completed"],
  canceled: ["canceled"]
};

/** Same-status transitions are intentional no-ops and therefore valid. */
export function canTransitionGoalStatus(from: GoalStatus, to: GoalStatus): boolean {
  return transitions[from]?.includes(to) ?? false;
}

export function assertGoalStatusTransition(from: GoalStatus, to: GoalStatus): void {
  if (!canTransitionGoalStatus(from, to)) throw new Error(`Transición de meta no permitida: ${from} → ${to}.`);
}

export function transitionGoalStatus<T extends { status: GoalStatus }>(goal: T, status: GoalStatus): T {
  assertGoalStatusTransition(goal.status, status);
  return goal.status === status ? goal : { ...goal, status };
}
