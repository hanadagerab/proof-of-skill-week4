import type {
  SourcePacket,
  VerificationStep,
} from "@/lib/schemas";

type VerificationAssumptions =
  SourcePacket["verificationAssumptions"];

export type VerificationTimeResult = {
  selectedStep: VerificationStep;
  baselineMinutes: number;
  minutesRemaining: number;
  potentialMinutesAvoided: number;
};

export function calculateVerificationTime(
  verificationChoice: VerificationStep,
  assumptions: VerificationAssumptions
): VerificationTimeResult {
  const baselineMinutes = assumptions.baseline.minutes;
  const minutesRemaining =
    assumptions.minutesByStep[verificationChoice];

  return {
    selectedStep: verificationChoice,
    baselineMinutes,
    minutesRemaining,
    potentialMinutesAvoided:
      baselineMinutes - minutesRemaining,
  };
}
