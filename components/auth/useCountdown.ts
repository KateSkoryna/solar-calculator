import { useCallback, useEffect, useState } from "react";

const TICK_MILLISECONDS = 1000;

export function useCountdown(totalSeconds: number) {
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const isRunning = remainingSeconds > 0;

  useEffect(() => {
    if (!isRunning) return;

    const tick = setInterval(
      () => setRemainingSeconds((seconds) => Math.max(seconds - 1, 0)),
      TICK_MILLISECONDS,
    );
    return () => clearInterval(tick);
  }, [isRunning]);

  const restart = useCallback(
    () => setRemainingSeconds(totalSeconds),
    [totalSeconds],
  );

  return { remainingSeconds, restart };
}
