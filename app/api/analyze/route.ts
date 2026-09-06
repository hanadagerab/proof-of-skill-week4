import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import { sourcePacket } from "@/lib/sourcePacket";
import { evidenceMappingResponseSchema } from "@/lib/schemas";
import { validateEvidenceMapping } from "@/lib/validateEvidenceMapping";

export const runtime = "nodejs";

const FALLBACK_MESSAGE =
  "AI mapping unavailable — raw evidence remains inspectable.";

export async function POST() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured.");
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.responses.parse({
      model: "gpt-5.6-luna",
      instructions: `
You are performing a narrow evidence-mapping task for an evaluator-facing Proof-of-Skill checkpoint.

You may ONLY:
- inspect the supplied structured evidence
- map evidence to the explicit task criteria
- classify each criterion as supported, partially_supported, or missing
- cite specific evidence references supplied in the packet
- state gaps
- state uncertainty

You MUST NOT:
- score the candidate
- rank the candidate
- recommend hire or no-hire
- recommend any verification step
- estimate verification minutes
- estimate savings
- fabricate evidence
- claim authorship certainty
- infer protected attributes
- provide an overall candidate judgment

Rules:
- Return exactly one mapping for each supplied criterion.
- Use criterion IDs exactly as supplied.
- Evidence references must use only IDs present in sourceDataset, submittedCalculations, conclusion, or provenance.
- Never invent an evidence reference.
- If evidence is insufficient, classify it as partially_supported or missing.
- Do not guess.
      `.trim(),
      input: JSON.stringify({
        candidate: sourcePacket.candidate,
        task: sourcePacket.task,
        sourceDataset: sourcePacket.sourceDataset,
        submittedCalculations: sourcePacket.submittedCalculations,
        conclusion: sourcePacket.conclusion,
        provenance: sourcePacket.provenance,
        criteria: sourcePacket.criteria,
      }),
      text: {
        format: zodTextFormat(
          evidenceMappingResponseSchema,
          "criterion_evidence_mapping"
        ),
      },
    });

    if (!response.output_parsed) {
      throw new Error("No parsed structured output returned.");
    }

    const validatedMapping = validateEvidenceMapping(
      response.output_parsed,
      sourcePacket
    );

    return Response.json({
      success: true,
      mapping: validatedMapping,
    });
  } catch {
    return Response.json(
      {
        success: false,
        error: FALLBACK_MESSAGE,
      },
      {
        status: 503,
      }
    );
  }
}
