"use client";

import PageError from "@/components/workspace/PageError";

export default function EditVehicleError({ reset }: { reset: () => void }) {
  return <PageError messageKey="vehicles.error" onRetry={reset} />;
}
