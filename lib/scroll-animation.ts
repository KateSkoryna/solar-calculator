export const SCROLL_REVEAL_CLASSES = {
  rise: "scroll-reveal",
  fromLeft: "scroll-reveal [--scroll-reveal-keyframes:scroll-from-left]",
  fromRight: "scroll-reveal [--scroll-reveal-keyframes:scroll-from-right]",
  zoom: "scroll-reveal [--scroll-reveal-keyframes:scroll-zoom]",
  screen:
    "scroll-reveal origin-bottom [--scroll-reveal-keyframes:scroll-screen] [--scroll-reveal-end:48%]",
  bar: "scroll-reveal origin-bottom [--scroll-reveal-keyframes:scroll-bar] [--scroll-reveal-start:20%] [--scroll-reveal-end:45%]",
  line: "scroll-reveal origin-left [--scroll-reveal-keyframes:scroll-line] [--scroll-reveal-start:10%] [--scroll-reveal-end:40%]",
} as const;

export const SCROLL_STAGGER_CLASSES = [
  "",
  "[--scroll-reveal-start:12%] [--scroll-reveal-end:38%]",
  "[--scroll-reveal-start:24%] [--scroll-reveal-end:44%]",
  "[--scroll-reveal-start:36%] [--scroll-reveal-end:50%]",
] as const;

export const SCROLL_DRIFT_CLASSES = {
  slow: "scroll-drift [--scroll-drift-from:60px] [--scroll-drift-to:-70px]",
  medium: "scroll-drift [--scroll-drift-from:120px] [--scroll-drift-to:-40px]",
  fast: "scroll-drift [--scroll-drift-from:220px] [--scroll-drift-to:-10px]",
} as const;
