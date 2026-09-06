import assert from "node:assert/strict";

import { calculateVerificationTime } from "../lib/calculateVerificationTime";
import {
  evidenceMappingResponseSchema,
  verificationStepSchema,
} from "../lib/schemas";
import { sourcePacket } from "../lib/sourcePacket";
import { validateEvidenceMapping } from "../lib/validateEvidenceMapping";

import type { VerificationStep } from "../lib/schemas";

console.log("Running Week 4 mechanical tests...\n");

// 1. Source packet loads and validates.
assert.equal(sourcePacket.candidate.name, "Sofía Martínez");
assert.equal(sourcePacket.candidate.synthetic, true);
assert.equal(sourcePacket.criteria.length, 4);

console.log("✓ source packet loads and validates");

// 2. Verification enum contains exactly the four locked choices.
const lockedVerificationSteps: VerificationStep[] = [
  "full_case",
  "shortened_case",
  "brief_verification_interview",
  "no_additional_skill_assessment",
];

for (const step of lockedVerificationSteps) {
  assert.equal(verificationStepSchema.safeParse(step).success, true);
}

assert.equal(
  verificationStepSchema.safeParse("ai_recommended_step").success,
  false
);

console.log("✓ verification choices are locked and validated");

// 3. Deterministic time calculations.
const expectedResults: Record<
  VerificationStep,
  { remaining: number; avoided: number }
> = {
  full_case: {
    remaining: 60,
    avoided: 0,
  },
  shortened_case: {
    remaining: 35,
    avoided: 25,
  },
  brief_verification_interview: {
    remaining: 15,
    avoided: 45,
  },
  no_additional_skill_assessment: {
    remaining: 0,
    avoided: 60,
  },
};

for (const step of lockedVerificationSteps) {
  const result = calculateVerificationTime(
    step,
    sourcePacket.verificationAssumptions
  );

  assert.equal(
    result.minutesRemaining,
    expectedResults[step].remaining
  );

  assert.equal(
    result.potentialMinutesAvoided,
    expectedResults[step].avoided
  );

  assert.equal(result.baselineMinutes, 60);
}

console.log("✓ deterministic minute outputs are correct");

// 4. Valid structured mapping passes.
const validMapping = {
  mappings: sourcePacket.criteria.map((criterion) => ({
    criterionId: criterion.id,
    status: "supported" as const,
    evidenceReferences: ["conclusion_1"],
    gap: "",
    uncertainty: "",
  })),
};

const parsedValidMapping =
  evidenceMappingResponseSchema.parse(validMapping);

assert.doesNotThrow(() =>
  validateEvidenceMapping(parsedValidMapping, sourcePacket)
);

console.log("✓ valid LLM mapping passes validation");

// 5. Invalid evidence reference is rejected.
const invalidReferenceMapping = {
  mappings: sourcePacket.criteria.map((criterion) => ({
    criterionId: criterion.id,
    status: "supported" as const,
    evidenceReferences: ["fabricated_evidence_id"],
    gap: "",
    uncertainty: "",
  })),
};

const parsedInvalidReference =
  evidenceMappingResponseSchema.parse(invalidReferenceMapping);

assert.throws(() =>
  validateEvidenceMapping(
    parsedInvalidReference,
    sourcePacket
  )
);

console.log("✓ fabricated evidence reference is rejected");

// 6. Duplicate criterion IDs are rejected.
const duplicateCriterionMapping = {
  mappings: sourcePacket.criteria.map(() => ({
    criterionId: "criterion_1",
    status: "supported" as const,
    evidenceReferences: ["conclusion_1"],
    gap: "",
    uncertainty: "",
  })),
};

const parsedDuplicateMapping =
  evidenceMappingResponseSchema.parse(
    duplicateCriterionMapping
  );

assert.throws(() =>
  validateEvidenceMapping(
    parsedDuplicateMapping,
    sourcePacket
  )
);

console.log("✓ duplicate criterion IDs are rejected");

// 7. Malformed structured output is rejected by Zod.
const malformedMapping = {
  mappings: [
    {
      criterionId: "criterion_1",
      status: "definitely_hired",
      evidenceReferences: [],
      gap: "",
      uncertainty: "",
    },
  ],
};

assert.equal(
  evidenceMappingResponseSchema.safeParse(
    malformedMapping
  ).success,
  false
);

console.log("✓ malformed LLM output is rejected");

// 8. Calculation function receives no LLM mapping.
assert.equal(calculateVerificationTime.length, 2);

console.log(
  "✓ time calculation accepts only choice + fixed assumptions"
);

console.log("\nAll mechanical tests passed.");
