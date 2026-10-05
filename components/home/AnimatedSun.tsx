"use client";

import { useEffect, useRef, useState } from "react";
import BrandIllustration from "@/components/common/BrandIllustration";
import {
  BALL_OBSTACLE_SELECTOR,
  GoldBallsSimulation,
  type Rectangle,
  type SunShape,
} from "@/lib/gold-balls-simulation";
import {
  resolveSunColor,
  SUN_COLOR_VARIABLE,
  SUN_CORE_COLOR_VARIABLE,
  withAlpha,
} from "@/lib/sun-gradient";
import {
  hasPlayedSunAnimation,
  markSunAnimationPlayed,
} from "@/lib/sun-animation-session";
import {
  REDUCED_MOTION_MEDIA_QUERY,
  useMediaQuery,
} from "@/lib/use-media-query";

const MILLISECONDS_PER_SECOND = 1000;
const TRAIL_FADE_PER_FRAME = 0.3;
const SPARKLE_GLOW_RADIUS_RATIO = 2.4;
const SPARKLE_CORE_SHARE = 0.35;
const SPARKLE_CORE_ALPHA = 0.7;
const SPARKLE_BODY_ALPHA = 0.28;
const TWINKLE_DEPTH = 0.3;
const TWINKLE_RADIANS_PER_SECOND = 7;
const ERASE_COMPOSITE = "destination-out";
const DRAW_COMPOSITE = "source-over";

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
  const growingSunRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useMediaQuery(REDUCED_MOTION_MEDIA_QUERY);
  const [hasSunAppeared, setHasSunAppeared] = useState(false);
  const isSunVisible = hasSunAppeared || prefersReducedMotion;

  useEffect(() => {
    const canvas = canvasRef.current;
    const sunElement = sunRef.current;
    const growingSun = growingSunRef.current;
    const container = canvas?.parentElement;
    const context = canvas?.getContext("2d");
    if (
      prefersReducedMotion ||
      !canvas ||
      !sunElement ||
      !growingSun ||
      !container
    ) {
      return;
    }

    if (!context || typeof ResizeObserver === "undefined") {
      const revealFrame = requestAnimationFrame(() => setHasSunAppeared(true));
      return () => cancelAnimationFrame(revealFrame);
    }

    const canvasStyle = getComputedStyle(canvas);
    const readColor = (colorVariable: string) =>
      resolveSunColor(
        canvasStyle.getPropertyValue(colorVariable),
        colorVariable,
      );
    const coreColor = readColor(SUN_CORE_COLOR_VARIABLE);
    const sunColor = readColor(SUN_COLOR_VARIABLE);
    const bounds = {
      width: container.clientWidth,
      height: container.clientHeight,
    };
    const simulation = hasPlayedSunAnimation()
      ? GoldBallsSimulation.ambient(bounds)
      : new GoldBallsSimulation(bounds);
    let isSunFinished = false;
    let animationFrame = 0;
    let previousTimestamp: number | null = null;
    let sunShape: SunShape | null = null;
    let isSunFollowingCluster = false;

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
      sunShape = {
        center: {
          x: (sunBox.left + sunBox.right) / 2,
          y: (sunBox.top + sunBox.bottom) / 2,
        },
        radius: (sunBox.right - sunBox.left) / 2,
      };
      simulation.setSun(sunShape);
    };

    const growSunWithCluster = () => {
      const { cluster } = simulation;
      if (isSunFinished || cluster === null || sunShape === null) return;

      growingSun.style.transform = `translate(${cluster.x - sunShape.center.x}px, ${
        cluster.y - sunShape.center.y
      }px) scale(${cluster.radius / sunShape.radius})`;
      if (!isSunFollowingCluster) {
        isSunFollowingCluster = true;
        setHasSunAppeared(true);
      }
    };

    const draw = (elapsedSeconds: number) => {
      context.globalCompositeOperation = ERASE_COMPOSITE;
      context.fillStyle = withAlpha(sunColor, TRAIL_FADE_PER_FRAME);
      context.fillRect(0, 0, container.clientWidth, container.clientHeight);
      context.globalCompositeOperation = DRAW_COMPOSITE;

      simulation.balls.forEach((ball, ballIndex) => {
        if (ball.state === "absorbed" || ball.state === "cluster") return;

        const twinkle =
          1 -
          TWINKLE_DEPTH *
            (0.5 +
              0.5 *
                Math.sin(
                  elapsedSeconds * TWINKLE_RADIANS_PER_SECOND + ballIndex,
                ));
        const glowRadius = ball.radius * SPARKLE_GLOW_RADIUS_RATIO;
        const sparkle = context.createRadialGradient(
          ball.x,
          ball.y,
          0,
          ball.x,
          ball.y,
          glowRadius,
        );
        sparkle.addColorStop(
          0,
          withAlpha(coreColor, SPARKLE_CORE_ALPHA * twinkle),
        );
        sparkle.addColorStop(
          SPARKLE_CORE_SHARE / SPARKLE_GLOW_RADIUS_RATIO,
          withAlpha(sunColor, SPARKLE_BODY_ALPHA * twinkle),
        );
        sparkle.addColorStop(1, withAlpha(sunColor, 0));

        context.fillStyle = sparkle;
        context.beginPath();
        context.arc(ball.x, ball.y, glowRadius, 0, Math.PI * 2);
        context.fill();
      });
    };

    const renderFrame = (timestamp: number) => {
      const deltaSeconds =
        previousTimestamp === null
          ? 0
          : (timestamp - previousTimestamp) / MILLISECONDS_PER_SECOND;
      previousTimestamp = timestamp;

      simulation.step(deltaSeconds);
      draw(timestamp / MILLISECONDS_PER_SECOND);
      growSunWithCluster();

      if (simulation.isMerged && !isSunFinished) {
        isSunFinished = true;
        markSunAnimationPlayed();
        growingSun.style.transform = "";
        setHasSunAppeared(true);
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
        className="pointer-events-none absolute inset-0 size-full"
      />
      <div ref={sunRef} className="absolute -top-12 -right-12 w-44 md:w-56">
        <div
          ref={growingSunRef}
          className={`transition-opacity duration-300 ${
            isSunVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <BrandIllustration radiant className="w-full" />
        </div>
      </div>
    </>
  );
}
