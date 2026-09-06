"use client";

import { useState } from "react";

import { EvidenceSection } from "@/components/EvidenceSection";
import { calculateVerificationTime } from "@/lib/calculateVerificationTime";
import { verificationStepSchema } from "@/lib/schemas";

import type {
  EvidenceMappingResponse,
  SourcePacket,
  VerificationStep,
} from "@/lib/schemas";

type ProofCheckpointClientProps = {
  packet: SourcePacket;
};

type AnalyzeSuccessResponse = {
  success: true;
  mapping: EvidenceMappingResponse;
};

type AnalyzeFailureResponse = {
  success: false;
  error: string;
};

type AnalyzeResponse = AnalyzeSuccessResponse | AnalyzeFailureResponse;

const FALLBACK_MESSAGE =
  "AI mapping unavailable — raw evidence remains inspectable.";

const verificationOptions: Array<{
  value: VerificationStep;
  label: string;
}> = [
  {
    value: "full_case",
    label: "Full case",
  },
  {
    value: "shortened_case",
    label: "Shortened case",
  },
  {
    value: "brief_verification_interview",
    label: "Brief verification interview",
  },
  {
    value: "no_additional_skill_assessment",
    label: "No additional skill assessment",
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatStatus(status: string) {
  if (status === "supported") {
    return "Supported";
  }

  if (status === "partially_supported") {
    return "Partially supported";
  }

  return "Missing";
}

export function ProofCheckpointClient({
  packet,
}: ProofCheckpointClientProps) {
  const [screen, setScreen] = useState<"raw" | "map">("raw");

  const [mapping, setMapping] =
    useState<EvidenceMappingResponse | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [verificationChoice, setVerificationChoice] =
    useState<VerificationStep | null>(null);

  const verificationTimeResult = verificationChoice
    ? calculateVerificationTime(
        verificationChoice,
        packet.verificationAssumptions
      )
    : null;

  const {
    candidate,
    task,
    sourceDataset,
    submittedCalculations,
    conclusion,
    provenance,
    criteria,
  } = packet;

  const evidenceLabels = new Map<string, string>([
    ...sourceDataset.map(
      (item) => [item.id, `Source dataset — ${item.period}`] as const
    ),
    ...submittedCalculations.map(
      (item) => [item.id, `Submitted calculation — ${item.label}`] as const
    ),
    [conclusion.id, "Candidate conclusion"],
    [provenance.id, "Provenance"],
  ]);

  async function analyzeEvidence() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
      });

      const data = (await response.json()) as AnalyzeResponse;

      if (!response.ok || !data.success) {
        setError(FALLBACK_MESSAGE);
        return;
      }

      setMapping(data.mapping);
      setVerificationChoice(null);
      setScreen("map");
    } catch {
      setError(FALLBACK_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  }

  function handleVerificationChoice(value: string) {
    const parsedChoice = verificationStepSchema.safeParse(value);

    if (!parsedChoice.success) {
      setVerificationChoice(null);
      return;
    }

    if (verificationChoice === parsedChoice.data) {
      setVerificationChoice(null);
      return;
    }

    setVerificationChoice(parsedChoice.data);
  }

  if (screen === "map" && mapping) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <header className="mb-8">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-900">
                Synthetic demo data
              </span>

              <span className="text-sm text-slate-500">
                Evaluator-facing proof packet
              </span>
            </div>

            <button
              type="button"
              onClick={() => setScreen("raw")}
              className="mb-5 text-sm font-medium text-slate-600 underline underline-offset-4 hover:text-slate-950"
            >
              Back to raw evidence
            </button>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Criterion-Level Evidence Map
            </h1>
          </header>

          <div className="mb-8 rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <p className="font-semibold text-blue-950">
              AI-assisted interpretation — not a certification or hiring recommendation
            </p>
          </div>

          <div className="space-y-5">
            {criteria.map((criterion) => {
              const criterionMapping = mapping.mappings.find(
                (item) => item.criterionId === criterion.id
              );

              if (!criterionMapping) {
                return null;
              }

              return (
                <section
                  key={criterion.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-6">
                    <p className="text-sm font-medium text-slate-500">
                      Criterion
                    </p>

                    <h2 className="mt-1 text-xl font-semibold text-slate-950">
                      {criterion.label}
                    </h2>
                  </div>

                  <div className="grid gap-6 md:grid-cols-3">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Proposed Status
                      </p>

                      <p className="mt-2 font-semibold text-slate-950">
                        {formatStatus(criterionMapping.status)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Evidence Used
                      </p>

                      {criterionMapping.evidenceReferences.length > 0 ? (
                        <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                          {criterionMapping.evidenceReferences.map(
                            (reference) => (
                              <li key={reference}>
                                <span className="font-medium text-slate-950">
                                  {evidenceLabels.get(reference) ?? reference}
                                </span>

                                <br />

                                <code className="text-xs text-slate-500">
                                  {reference}
                                </code>
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm text-slate-600">
                          No evidence reference supplied.
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Gap / Uncertainty
                      </p>

                      <div className="mt-2 space-y-3 text-sm leading-6 text-slate-700">
                        <p>
                          <span className="font-medium text-slate-950">
                            Gap:
                          </span>{" "}
                          {criterionMapping.gap || "None stated."}
                        </p>

                        <p>
                          <span className="font-medium text-slate-950">
                            Uncertainty:
                          </span>{" "}
                          {criterionMapping.uncertainty || "None stated."}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <p className="text-sm font-medium text-slate-500">
                Your decision
              </p>

              <h2 className="mt-1 text-xl font-semibold text-slate-950">
                Based on the evidence you inspected, how much additional skill verification do you still require?
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {verificationOptions.map((option) => {
                const isSelected =
                  verificationChoice === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      handleVerificationChoice(option.value)
                    }
                    aria-pressed={isSelected}
                    className={`rounded-xl border p-4 text-left text-sm font-medium transition ${
                      isSelected
                        ? "border-slate-950 bg-slate-100 text-slate-950"
                        : "border-slate-300 bg-white text-slate-800 hover:border-slate-500"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </section>

          {verificationTimeResult && (
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Deterministic demo calculation
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-slate-500">
                    Demo baseline
                  </p>

                  <p className="mt-1 text-xl font-semibold text-slate-950">
                    {verificationTimeResult.baselineMinutes} min
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Evaluator minutes remaining
                  </p>

                  <p className="mt-1 text-xl font-semibold text-slate-950">
                    {verificationTimeResult.minutesRemaining} min
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Potential minutes avoided
                  </p>

                  <p className="mt-1 text-xl font-semibold text-slate-950">
                    {verificationTimeResult.potentialMinutesAvoided} min
                  </p>
                </div>
              </div>
            </section>
          )}

          <footer className="mt-8 text-center text-xs text-slate-500">
            Synthetic demo data
          </footer>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <header className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-900">
              Synthetic demo data
            </span>

            <span className="text-sm text-slate-500">
              Evaluator-facing proof packet
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Proof Checkpoint — Junior Financial Analyst
          </h1>

          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Inspect the candidate&apos;s submitted evidence before deciding
            whether any additional skill verification is needed.
          </p>
        </header>

        <div className="space-y-6">
          <EvidenceSection title="Candidate">
            <dl className="grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-slate-500">
                  Candidate name
                </dt>

                <dd className="mt-1 text-base font-semibold text-slate-950">
                  {candidate.name}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-slate-500">
                  Role
                </dt>

                <dd className="mt-1 text-base font-semibold text-slate-950">
                  {candidate.role}
                </dd>
              </div>
            </dl>
          </EvidenceSection>

          <EvidenceSection title="Task">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Task
                </p>

                <p className="mt-1 text-base font-semibold text-slate-950">
                  {task.prompt}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Task brief
                </p>

                <p className="mt-1 max-w-4xl leading-7 text-slate-700">
                  {task.brief}
                </p>
              </div>
            </div>
          </EvidenceSection>

          <EvidenceSection title="Source Dataset">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="px-3 py-3 font-medium">
                      Period
                    </th>

                    <th className="px-3 py-3 font-medium">
                      Revenue
                    </th>

                    <th className="px-3 py-3 font-medium">
                      Units sold
                    </th>

                    <th className="px-3 py-3 font-medium">
                      Material cost
                    </th>

                    <th className="px-3 py-3 font-medium">
                      Freight cost
                    </th>

                    <th className="px-3 py-3 font-medium">
                      Other COGS
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {sourceDataset.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-3 py-4 font-semibold text-slate-950">
                        {row.period}
                      </td>

                      <td className="px-3 py-4 text-slate-700">
                        {formatCurrency(row.revenue)}
                      </td>

                      <td className="px-3 py-4 text-slate-700">
                        {row.unitsSold.toLocaleString("en-US")}
                      </td>

                      <td className="px-3 py-4 text-slate-700">
                        {formatCurrency(row.materialCost)}
                      </td>

                      <td className="px-3 py-4 text-slate-700">
                        {formatCurrency(row.freightCost)}
                      </td>

                      <td className="px-3 py-4 text-slate-700">
                        {formatCurrency(row.otherCOGS)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </EvidenceSection>

          <EvidenceSection title="Submitted Calculations">
            <div className="divide-y divide-slate-100">
              {submittedCalculations.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-2 py-4 first:pt-0 last:pb-0 sm:grid-cols-[1fr_1.4fr_0.7fr]"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Calculation
                    </p>

                    <p className="mt-1 font-semibold text-slate-950">
                      {item.label}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Formula
                    </p>

                    <code className="mt-1 block text-sm text-slate-700">
                      {item.calculation}
                    </code>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Result
                    </p>

                    <p className="mt-1 font-semibold text-slate-950">
                      {item.result}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </EvidenceSection>

          <EvidenceSection title="Candidate Conclusion">
            <p className="max-w-4xl leading-7 text-slate-700">
              {conclusion.text}
            </p>
          </EvidenceSection>

          <EvidenceSection title="Provenance">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-950">
                {provenance.label}
              </p>

              <p className="mt-2 leading-7 text-slate-600">
                {provenance.description}
              </p>
            </div>
          </EvidenceSection>

          {error && (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 p-5 font-medium text-red-900"
            >
              {error}
            </div>
          )}

          <section className="rounded-2xl border border-slate-900 bg-slate-950 p-6 text-white">
            <p className="mb-4 max-w-3xl text-sm leading-6 text-slate-300">
              The next step compares only the structured evidence above
              against the explicit task criteria.
            </p>

            <button
              type="button"
              onClick={analyzeEvidence}
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading
                ? "Analyzing evidence..."
                : "Analyze evidence against criteria"}
            </button>
          </section>
        </div>

        <footer className="mt-8 text-center text-xs text-slate-500">
          Synthetic demo data
        </footer>
      </div>
    </main>
  );
}
