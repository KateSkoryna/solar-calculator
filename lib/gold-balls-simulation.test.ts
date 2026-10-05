import {
  BALL_COUNT,
  WANDERER_COUNT,
  GoldBallsSimulation,
  type Bounds,
  type SunShape,
} from "@/lib/gold-balls-simulation";

const BOUNDS: Bounds = { width: 600, height: 520 };
const SUN: SunShape = { center: { x: 520, y: 80 }, radius: 110 };
const FRAME_SECONDS = 1 / 60;
const FALL_FRAMES = 60 * 1.5;
const TOTAL_FRAMES = 60 * 10;
const SEED_SETTLED_FRAMES = 60 * 5.2;
const MAX_SINGLE_BALL_RADIUS = 9;
const JOINING_BALL_COUNT = BALL_COUNT - WANDERER_COUNT;
const PHASE_TOLERANCE_PIXELS = 1;

function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function createSimulation() {
  const simulation = new GoldBallsSimulation(BOUNDS, seededRandom(7));
  simulation.setSun(SUN);
  return simulation;
}

function run(simulation: GoldBallsSimulation, frames: number) {
  for (let frame = 0; frame < frames; frame += 1) {
    simulation.step(FRAME_SECONDS);
  }
}

describe("GoldBallsSimulation", () => {
  it("starts with every ball above the box", () => {
    const simulation = createSimulation();

    expect(simulation.balls).toHaveLength(BALL_COUNT);
    for (const ball of simulation.balls) {
      expect(ball.y + ball.radius).toBeLessThan(0);
    }
    expect(simulation.phase).toBe("falling");
  });

  it("drops the balls into the box and keeps them inside its walls", () => {
    const simulation = createSimulation();

    run(simulation, FALL_FRAMES);

    expect(simulation.phase).toBe("rolling");
    for (const ball of simulation.balls) {
      expect(ball.x - ball.radius).toBeGreaterThanOrEqual(
        -PHASE_TOLERANCE_PIXELS,
      );
      expect(ball.x + ball.radius).toBeLessThanOrEqual(
        BOUNDS.width + PHASE_TOLERANCE_PIXELS,
      );
      expect(ball.y + ball.radius).toBeLessThanOrEqual(
        BOUNDS.height + PHASE_TOLERANCE_PIXELS,
      );
    }
  });

  it("makes the balls bounce off a rectangular obstacle", () => {
    const simulation = createSimulation();
    const obstacle = { left: 40, top: 300, right: 560, bottom: 500 };
    simulation.setObstacle(obstacle);

    run(simulation, FALL_FRAMES);

    for (const ball of simulation.balls) {
      const isInsideObstacle =
        ball.x > obstacle.left &&
        ball.x < obstacle.right &&
        ball.y > obstacle.top &&
        ball.y < obstacle.bottom;
      expect(isInsideObstacle).toBe(false);
    }
  });

  it("never lets two balls overlap deeply while they roll", () => {
    const simulation = createSimulation();

    run(simulation, FALL_FRAMES + 60);

    for (let first = 0; first < simulation.balls.length; first += 1) {
      for (
        let second = first + 1;
        second < simulation.balls.length;
        second += 1
      ) {
        const a = simulation.balls[first];
        const b = simulation.balls[second];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        expect(distance).toBeGreaterThan((a.radius + b.radius) * 0.8);
      }
    }
  });

  it("stops one ball at the sun first and lets the others join it", () => {
    const simulation = createSimulation();
    run(simulation, SEED_SETTLED_FRAMES);

    const cluster = simulation.cluster;
    expect(simulation.phase).toBe("gathering");
    expect(cluster).not.toBeNull();
    expect(
      Math.hypot(cluster!.x - SUN.center.x, cluster!.y - SUN.center.y),
    ).toBeLessThan(6);
    expect(Math.hypot(cluster!.vx, cluster!.vy)).toBeLessThan(20);
    expect(
      simulation.balls.filter((ball) => ball.state === "free").length,
    ).toBeGreaterThan(BALL_COUNT / 2);
  });

  it("absorbs the balls one at a time and grows the cluster", () => {
    const simulation = createSimulation();
    const absorbedCounts = new Set<number>();
    let largestRadius = 0;

    for (let frame = 0; frame < TOTAL_FRAMES; frame += 1) {
      simulation.step(FRAME_SECONDS);
      absorbedCounts.add(
        simulation.balls.filter((ball) => ball.state === "absorbed").length,
      );
      largestRadius = Math.max(largestRadius, simulation.cluster?.radius ?? 0);
    }

    expect(absorbedCounts.size).toBeGreaterThan(JOINING_BALL_COUNT / 2);
    expect(largestRadius).toBeGreaterThan(MAX_SINGLE_BALL_RADIUS);
  });

  it("ends as one sun-sized cluster on the sun", () => {
    const simulation = createSimulation();

    run(simulation, TOTAL_FRAMES);

    expect(simulation.phase).toBe("merged");
    expect(simulation.mergeProgress).toBe(1);
    expect(simulation.cluster).toMatchObject({
      x: SUN.center.x,
      y: SUN.center.y,
      radius: SUN.radius,
    });
    expect(
      simulation.balls.filter((ball) => ball.state === "absorbed"),
    ).toHaveLength(JOINING_BALL_COUNT - 1);
  });

  it("keeps a few sparkles wandering inside the box after the sun forms", () => {
    const simulation = createSimulation();
    run(simulation, TOTAL_FRAMES);
    const wanderers = simulation.balls.filter((ball) => ball.isWanderer);
    const before = wanderers.map(({ x, y }) => ({ x, y }));
    const cluster = { ...simulation.cluster! };

    run(simulation, 120);

    expect(wanderers).toHaveLength(WANDERER_COUNT);
    expect(wanderers.every((ball) => ball.state === "free")).toBe(true);
    expect(wanderers.map(({ x, y }) => ({ x, y }))).not.toEqual(before);
    expect(simulation.cluster).toMatchObject({
      x: cluster.x,
      y: cluster.y,
      radius: cluster.radius,
    });
    for (const ball of wanderers) {
      expect(ball.x).toBeGreaterThanOrEqual(0);
      expect(ball.x).toBeLessThanOrEqual(BOUNDS.width);
      expect(ball.y).toBeGreaterThanOrEqual(0);
      expect(ball.y).toBeLessThanOrEqual(BOUNDS.height);
      expect(
        Math.hypot(ball.x - SUN.center.x, ball.y - SUN.center.y),
      ).toBeGreaterThanOrEqual(SUN.radius - PHASE_TOLERANCE_PIXELS);
    }
  });

  it("can start with only the wandering sparkles", () => {
    const simulation = GoldBallsSimulation.ambient(BOUNDS, seededRandom(3));
    simulation.setSun(SUN);

    run(simulation, 60);

    expect(simulation.isMerged).toBe(true);
    expect(simulation.balls).toHaveLength(WANDERER_COUNT);
    for (const ball of simulation.balls) {
      expect(ball.y).toBeGreaterThanOrEqual(0);
      expect(ball.y).toBeLessThanOrEqual(BOUNDS.height);
    }
  });
});
