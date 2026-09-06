import type { EvidenceMappingResponse, SourcePacket } from "@/lib/schemas";

export function validateEvidenceMapping(
  mapping: EvidenceMappingResponse,
  packet: SourcePacket
): EvidenceMappingResponse {
  const validCriterionIds = new Set(
    packet.criteria.map((criterion) => criterion.id)
  );

  const returnedCriterionIds = mapping.mappings.map(
    (item) => item.criterionId
  );

  if (new Set(returnedCriterionIds).size !== returnedCriterionIds.length) {
    throw new Error("Duplicate criterion IDs in LLM output.");
  }

  if (
    returnedCriterionIds.length !== validCriterionIds.size ||
    returnedCriterionIds.some((id) => !validCriterionIds.has(id))
  ) {
    throw new Error("Invalid criterion IDs in LLM output.");
  }

  const validEvidenceReferences = new Set([
    ...packet.sourceDataset.map((item) => item.id),
    ...packet.submittedCalculations.map((item) => item.id),
    packet.conclusion.id,
    packet.provenance.id,
  ]);

  for (const criterion of mapping.mappings) {
    for (const reference of criterion.evidenceReferences) {
      if (!validEvidenceReferences.has(reference)) {
        throw new Error(
          `Invalid evidence reference in LLM output: ${reference}`
        );
      }
    }
  }

  return mapping;
}
