import { EvidenceSection } from "@/components/EvidenceSection";
import { sourcePacket } from "@/lib/sourcePacket";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Home() {
  const {
    candidate,
    task,
    sourceDataset,
    submittedCalculations,
    conclusion,
    provenance,
  } = sourcePacket;

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
                    <th className="px-3 py-3 font-medium">Period</th>
                    <th className="px-3 py-3 font-medium">Revenue</th>
                    <th className="px-3 py-3 font-medium">Units sold</th>
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

          <section className="rounded-2xl border border-slate-900 bg-slate-950 p-6 text-white">
            <p className="mb-4 max-w-3xl text-sm leading-6 text-slate-300">
              The next step will compare only the structured evidence above
              against the explicit task criteria.
            </p>

            <button
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 opacity-75"
            >
              Analyze evidence against criteria
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
