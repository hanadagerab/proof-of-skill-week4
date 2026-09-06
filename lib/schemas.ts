import { z } from "zod";

export const verificationStepSchema = z.enum([
  "full_case",
  "shortened_case",
  "brief_verification_interview",
  "no_additional_skill_assessment",
]);

export const candidateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  synthetic: z.literal(true),
});

export const taskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  prompt: z.string().min(1),
  brief: z.string().min(1),
});

export const sourceDatasetRowSchema = z.object({
  id: z.string().min(1),
  period: z.string().min(1),
  revenue: z.number().nonnegative(),
  unitsSold: z.number().int().nonnegative(),
  materialCost: z.number().nonnegative(),
  freightCost: z.number().nonnegative(),
  otherCOGS: z.number().nonnegative(),
});

export const submittedCalculationSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  calculation: z.string().min(1),
  result: z.string().min(1),
});

export const conclusionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
});

export const provenanceSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
});

export const criterionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
});

export const verificationAssumptionsSchema = z.object({
  baseline: z.object({
    verificationStep: z.literal("full_case"),
    minutes: z.literal(60),
  }),
  minutesByStep: z.object({
    full_case: z.literal(60),
    shortened_case: z.literal(35),
    brief_verification_interview: z.literal(15),
    no_additional_skill_assessment: z.literal(0),
  }),
});

export const sourcePacketSchema = z
  .object({
    candidate: candidateSchema,
    task: taskSchema,
    sourceDataset: z.array(sourceDatasetRowSchema).min(1),
    submittedCalculations: z.array(submittedCalculationSchema).min(1),
    conclusion: conclusionSchema,
    provenance: provenanceSchema,
    criteria: z
      .array(criterionSchema)
      .length(4)
      .refine(
        (criteria) =>
          new Set(criteria.map((criterion) => criterion.id)).size ===
          criteria.length,
        {
          message: "Criterion IDs must be unique.",
        }
      ),
    verificationAssumptions: verificationAssumptionsSchema,
  })
  .strict();

export type VerificationStep = z.infer<typeof verificationStepSchema>;
export type SourcePacket = z.infer<typeof sourcePacketSchema>;
export const evidenceStatusSchema = z.enum([
  "supported",
  "partially_supported",
  "missing",
]);

export const criterionMappingSchema = z.object({
  criterionId: z.string().min(1),
  status: evidenceStatusSchema,
  evidenceReferences: z.array(z.string().min(1)),
  gap: z.string(),
  uncertainty: z.string(),
});

export const evidenceMappingResponseSchema = z.object({
  mappings: z.array(criterionMappingSchema).length(4),
});

export type EvidenceMappingResponse = z.infer<
  typeof evidenceMappingResponseSchema
>;