"use client";

import PageError from "@/components/workspace/PageError";

export default function NewVehicleError({ reset }: { reset: () => void }) {
  return <PageError messageKey="vehicles.error" onRetry={reset} />;
}
