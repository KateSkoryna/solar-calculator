"use client";

import { useEffect, useRef, useState } from "react";
import BrandIllustration from "@/components/common/BrandIllustration";
import {
  BALL_OBSTACLE_SELECTOR,
  GoldBallsSimulation,
  type Rectangle,
} from "@/lib/gold-balls-simulation";
import {
  SUN_HIGHLIGHT_ALPHA,
  SUN_HIGHLIGHT_OFFSET_RATIO,
  SUN_HIGHLIGHT_RADIUS_RATIO,
} from "@/lib/sun-highlight";
import {
  hasPlayedSunAnimation,
  markSunAnimationPlayed,
} from "@/lib/sun-animation-session";
import {
  REDUCED_MOTION_MEDIA_QUERY,
  useMediaQuery,
} from "@/lib/use-media-query";

const MILLISECONDS_PER_SECOND = 1000;
const SUN_COLOR_VARIABLE = "--sun";
const HIGHLIGHT_COLOR = "#ffffff";

function relativeRectangle(element: Element, container: Element): Rectangle {
  const elementBox = element.getBoundingClientRect();
  const containerBox = container.getBoundingClientRect();

  return {
    left: elementBox.left - containerBox.left,
    top: elementBox.top - containerBox.top,
    right: elementBox.right - containerBox.left,
    bottom: elementBox.bottom - containerBox.top,
  };
}

export default function AnimatedSun() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sunRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useMediaQuery(REDUCED_MOTION_MEDIA_QUERY);
  const [isMerged, setIsMerged] = useState(false);
  const isSunVisible = isMerged || prefersReducedMotion;

  useEffect(() => {
    const canvas = canvasRef.current;
    const sunElement = sunRef.current;
    const container = canvas?.parentElement;
    const context = canvas?.getContext("2d");
    if (prefersReducedMotion || !canvas || !sunElement || !container) return;

    if (
      !context ||
      typeof ResizeObserver === "undefined" ||
      hasPlayedSunAnimation()
    ) {
      const revealFrame = requestAnimationFrame(() => setIsMerged(true));
      return () => cancelAnimationFrame(revealFrame);
    }

    const ballColor =
      getComputedStyle(canvas).getPropertyValue(SUN_COLOR_VARIABLE).trim() ||
      "#f2b544";
    const simulation = new GoldBallsSimulation({
      width: container.clientWidth,
      height: container.clientHeight,
    });
    let animationFrame = 0;
    let previousTimestamp: number | null = null;

    const measureLayout = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = container.clientWidth * pixelRatio;
      canvas.height = container.clientHeight * pixelRatio;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      simulation.resize({
        width: container.clientWidth,
        height: container.clientHeight,
      });

      const obstacleElement = container.querySelector(BALL_OBSTACLE_SELECTOR);
      simulation.setObstacle(
        obstacleElement ? relativeRectangle(obstacleElement, container) : null,
      );

      const sunBox = relativeRectangle(sunElement, container);
      simulation.setSun({
        center: {
          x: (sunBox.left + sunBox.right) / 2,
          y: (sunBox.top + sunBox.bottom) / 2,
        },
        radius: (sunBox.right - sunBox.left) / 2,
      });
    };

    const draw = () => {
      context.clearRect(0, 0, container.clientWidth, container.clientHeight);

      for (const ball of simulation.balls) {
        if (ball.state === "absorbed") continue;

        context.globalAlpha = 1;
        context.fillStyle = ballColor;
        context.beginPath();
        context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        context.fill();

        context.globalAlpha = SUN_HIGHLIGHT_ALPHA;
        context.fillStyle = HIGHLIGHT_COLOR;
        context.beginPath();
        context.arc(
          ball.x - ball.radius * SUN_HIGHLIGHT_OFFSET_RATIO,
          ball.y - ball.radius * SUN_HIGHLIGHT_OFFSET_RATIO,
          ball.radius * SUN_HIGHLIGHT_RADIUS_RATIO,
          0,
          Math.PI * 2,
        );
        context.fill();
      }
      context.globalAlpha = 1;
    };

    const renderFrame = (timestamp: number) => {
      const deltaSeconds =
        previousTimestamp === null
          ? 0
          : (timestamp - previousTimestamp) / MILLISECONDS_PER_SECOND;
      previousTimestamp = timestamp;

      simulation.step(deltaSeconds);
      draw();

      if (simulation.isMerged) {
        markSunAnimationPlayed();
        setIsMerged(true);
        return;
      }
      animationFrame = requestAnimationFrame(renderFrame);
    };

    measureLayout();
    const resizeObserver = new ResizeObserver(measureLayout);
    resizeObserver.observe(container);
    animationFrame = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, [prefersReducedMotion]);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 size-full transition-opacity duration-300 ${
          isMerged ? "opacity-0 delay-700" : "opacity-100"
        }`}
      />
      <div
        ref={sunRef}
        className={`absolute -top-16 -right-16 w-56 transition-opacity duration-700 md:w-72 ${
          isSunVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <BrandIllustration highlighted className="w-full" />
      </div>
    </>
  );
}
