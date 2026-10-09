export type GoalArea = "health" | "finance" | "education" | "work" | "business" | "habits" | "personal";
export type GoalStatus = "active" | "paused" | "completed" | "canceled";
export type GoalDirection = "increase" | "decrease";
export type GoalDate = `${number}-${number}-${number}`;
export type GoalTimestamp = string;

export type NumericGoalIndicator = {
  type: "number" | "count";
  unit?: string;
  direction: GoalDirection;
  initialValue: number;
  currentValue: number;
  targetValue: number;
};

export type PercentageGoalIndicator = {
  type: "percentage";
  direction: GoalDirection;
  initialValue: number;
  currentValue: number;
  targetValue: number;
};

export type BooleanGoalIndicator = {
  type: "boolean";
  currentValue: boolean;
  targetValue: true;
};

export type GoalIndicator = NumericGoalIndicator | PercentageGoalIndicator | BooleanGoalIndicator;

export type Goal = {
  id?: string;
  name: string;
  area: GoalArea;
  reason?: string;
  expectedOutcome?: string;
  targetDate?: GoalDate;
  status: GoalStatus;
  indicator: GoalIndicator;
  nextAction?: string;
  obstacles?: string[];
  createdAt: GoalTimestamp;
  updatedAt: GoalTimestamp;
};

export type CreateGoalInput = {
  name: string;
  area: GoalArea;
  reason?: string;
  expectedOutcome?: string;
  targetDate?: GoalDate;
  indicator: GoalIndicator;
  nextAction?: string;
  obstacles?: string[];
};

export type UpdateGoalInput = Partial<Omit<CreateGoalInput, "indicator">> & { indicator?: GoalIndicator };

export type UpdateGoalProgressInput = {
  currentValue: number | boolean;
};
