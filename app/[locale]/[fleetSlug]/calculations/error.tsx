"use client";

import PageError from "@/components/workspace/PageError";

export default function FleetCalculationsError({
  reset,
}: {
  reset: () => void;
}) {
  return <PageError messageKey="calculations.error" onRetry={reset} />;
}
