import type { ReactNode } from "react";

type EvidenceSectionProps = {
  title: string;
  children: ReactNode;
};

export function EvidenceSection({
  title,
  children,
}: EvidenceSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-950">
        {title}
      </h2>

      {children}
    </section>
  );
}
