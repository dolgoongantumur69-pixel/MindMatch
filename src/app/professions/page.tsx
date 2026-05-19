import { Suspense } from "react";
import ProfessionsClient from "./ProfessionsClient";

export default function ProfessionsPage() {
  return (
    <Suspense fallback={<ProfessionsLoading />}>
      <ProfessionsClient />
    </Suspense>
  );
}

function ProfessionsLoading() {
  return (
    <div>
      <div className="mb-8">
        <div className="h-8 w-48 rounded-lg animate-pulse mb-2" style={{ background: "#111827" }} />
        <div className="h-4 w-72 rounded animate-pulse" style={{ background: "#111827" }} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-2xl animate-pulse" style={{ background: "#111827", height: 200 }} />
        ))}
      </div>
    </div>
  );
}
