export interface Point {
  x: number;
  y: number;
}

export interface Bounds {
  width: number;
  height: number;
}

export interface Rectangle {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface SunShape {
  center: Point;
  radius: number;
}

export type BallState = "free" | "attracted" | "cluster" | "absorbed";

export interface GoldBall {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  state: BallState;
  attractedSeconds: number;
}

export type SimulationPhase =
  | "falling"
  | "rolling"
  | "gathering"
  | "swelling"
  | "merged";

type RandomSource = () => number;

export const BALL_COUNT = 24;
export const BALL_OBSTACLE_SELECTOR = "[data-ball-obstacle]";

const MIN_BALL_RADIUS = 5;
const MAX_BALL_RADIUS = 9;
const FALL_DURATION_SECONDS = 1.4;
const ROLL_DURATION_SECONDS = 2.8;
const FIRST_ATTRACTION_DELAY_SECONDS = 0.7;
const ATTRACTION_INTERVAL_SECONDS = 0.11;
const SWELL_DURATION_SECONDS = 1;
const GRAVITY = 1800;
const NO_GRAVITY = 0;
const WALL_RESTITUTION = 0.94;
const BALL_RESTITUTION = 0.97;
const BREAK_MIN_SPEED = 380;
const BREAK_MAX_SPEED = 760;
const SPAWN_HEIGHT_RATIO = 0.8;
const CLUSTER_STIFFNESS = 36;
const CLUSTER_DAMPING = 2 * Math.sqrt(CLUSTER_STIFFNESS);
const CLUSTER_GROWTH_RATE = 3;
const ATTRACTION_ACCELERATION = 2600;
const ATTRACTION_MAX_SPEED = 1100;
const ATTRACTION_STEERING_RATE = 10;
const ABSORB_OVERLAP_RATIO = 0.25;
const MAX_STEP_SECONDS = 1 / 30;
const SUBSTEPS_PER_STEP = 3;
const FULL_PROGRESS = 1;

function randomBetween(random: RandomSource, minimum: number, maximum: number) {
  return minimum + random() * (maximum - minimum);
}

function distanceBetween(first: Point, second: Point) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

function createBall(bounds: Bounds, random: RandomSource): GoldBall {
  const radius = randomBetween(random, MIN_BALL_RADIUS, MAX_BALL_RADIUS);

  return {
    x: randomBetween(random, radius, bounds.width - radius),
    y: -radius - random() * bounds.height * SPAWN_HEIGHT_RATIO,
    vx: randomBetween(random, -BREAK_MIN_SPEED, BREAK_MIN_SPEED) / 2,
    vy: 0,
    radius,
    baseRadius: radius,
    state: "free",
    attractedSeconds: 0,
  };
}

function bounceOffWalls(
  ball: GoldBall,
  bounds: Bounds,
  isCeilingSolid: boolean,
) {
  if (ball.x - ball.radius < 0) {
    ball.x = ball.radius;
    ball.vx = Math.abs(ball.vx) * WALL_RESTITUTION;
  } else if (ball.x + ball.radius > bounds.width) {
    ball.x = bounds.width - ball.radius;
    ball.vx = -Math.abs(ball.vx) * WALL_RESTITUTION;
  }

  if (ball.y + ball.radius > bounds.height) {
    ball.y = bounds.height - ball.radius;
    ball.vy = -Math.abs(ball.vy) * WALL_RESTITUTION;
  } else if (isCeilingSolid && ball.y - ball.radius < 0) {
    ball.y = ball.radius;
    ball.vy = Math.abs(ball.vy) * WALL_RESTITUTION;
  }
}

function contactNormalWithRectangle(ball: GoldBall, rectangle: Rectangle) {
  const closestX = Math.min(Math.max(ball.x, rectangle.left), rectangle.right);
  const closestY = Math.min(Math.max(ball.y, rectangle.top), rectangle.bottom);
  const distance = Math.hypot(ball.x - closestX, ball.y - closestY);

  if (distance === 0) {
    const gaps = [
      { x: -1, y: 0, gap: ball.x - rectangle.left },
      { x: 1, y: 0, gap: rectangle.right - ball.x },
      { x: 0, y: -1, gap: ball.y - rectangle.top },
      { x: 0, y: 1, gap: rectangle.bottom - ball.y },
    ];
    const [nearestEdge] = gaps.sort((first, second) => first.gap - second.gap);
    return {
      normal: { x: nearestEdge.x, y: nearestEdge.y },
      depth: nearestEdge.gap + ball.radius,
    };
  }

  if (distance >= ball.radius) return null;

  return {
    normal: {
      x: (ball.x - closestX) / distance,
      y: (ball.y - closestY) / distance,
    },
    depth: ball.radius - distance,
  };
}

function bounceOffRectangle(ball: GoldBall, rectangle: Rectangle) {
  const contact = contactNormalWithRectangle(ball, rectangle);
  if (contact === null) return;

  const { normal, depth } = contact;
  ball.x += normal.x * depth;
  ball.y += normal.y * depth;

  const approachSpeed = ball.vx * normal.x + ball.vy * normal.y;
  if (approachSpeed >= 0) return;

  const bounceImpulse = -(1 + WALL_RESTITUTION) * approachSpeed;
  ball.vx += normal.x * bounceImpulse;
  ball.vy += normal.y * bounceImpulse;
}

function collideBalls(first: GoldBall, second: GoldBall) {
  const dx = second.x - first.x;
  const dy = second.y - first.y;
  const distance = Math.hypot(dx, dy);
  const minimumDistance = first.radius + second.radius;
  if (distance === 0 || distance >= minimumDistance) return;

  const normalX = dx / distance;
  const normalY = dy / distance;
  const firstMass = first.radius ** 2;
  const secondMass = second.radius ** 2;
  const totalMass = firstMass + secondMass;
  const overlap = minimumDistance - distance;

  first.x -= (normalX * overlap * secondMass) / totalMass;
  first.y -= (normalY * overlap * secondMass) / totalMass;
  second.x += (normalX * overlap * firstMass) / totalMass;
  second.y += (normalY * overlap * firstMass) / totalMass;

  const approachSpeed =
    (first.vx - second.vx) * normalX + (first.vy - second.vy) * normalY;
  if (approachSpeed <= 0) return;

  const impulse =
    ((1 + BALL_RESTITUTION) * approachSpeed) / (1 / firstMass + 1 / secondMass);
  first.vx -= (impulse * normalX) / firstMass;
  first.vy -= (impulse * normalY) / firstMass;
  second.vx += (impulse * normalX) / secondMass;
  second.vy += (impulse * normalY) / secondMass;
}

function bounceOffCircle(ball: GoldBall, center: Point, radius: number) {
  const distance = distanceBetween(ball, center);
  const minimumDistance = radius + ball.radius;
  if (distance === 0 || distance >= minimumDistance) return;

  const normalX = (ball.x - center.x) / distance;
  const normalY = (ball.y - center.y) / distance;
  ball.x = center.x + normalX * minimumDistance;
  ball.y = center.y + normalY * minimumDistance;

  const approachSpeed = ball.vx * normalX + ball.vy * normalY;
  if (approachSpeed >= 0) return;

  const bounceImpulse = -(1 + WALL_RESTITUTION) * approachSpeed;
  ball.vx += normalX * bounceImpulse;
  ball.vy += normalY * bounceImpulse;
}

export class GoldBallsSimulation {
  readonly balls: GoldBall[];
  phase: SimulationPhase = "falling";
  mergeProgress = 0;
  private elapsedSeconds = 0;
  private swellStartSeconds = 0;
  private nextAttractionSeconds = 0;
  private clusterTargetRadius = 0;
  private totalBallArea = 0;
  private clusterArea = 0;
  private obstacle: Rectangle | null = null;
  private sun: SunShape | null = null;

  constructor(
    private bounds: Bounds,
    private readonly random: RandomSource = Math.random,
  ) {
    this.balls = Array.from({ length: BALL_COUNT }, () =>
      createBall(bounds, random),
    );
  }

  get isMerged() {
    return this.phase === "merged";
  }

  get cluster() {
    return this.balls.find((ball) => ball.state === "cluster") ?? null;
  }

  resize(bounds: Bounds) {
    this.bounds = bounds;
  }

  setObstacle(obstacle: Rectangle | null) {
    this.obstacle = obstacle;
  }

  setSun(sun: SunShape) {
    this.sun = sun;
  }

  step(deltaSeconds: number) {
    if (this.isMerged) return;

    const stepSeconds = Math.min(deltaSeconds, MAX_STEP_SECONDS);
    const substepSeconds = stepSeconds / SUBSTEPS_PER_STEP;

    for (let substep = 0; substep < SUBSTEPS_PER_STEP; substep += 1) {
      this.elapsedSeconds += substepSeconds;
      this.advancePhase();
      if (this.isMerged) return;
      this.moveFreeBalls(substepSeconds);
      this.moveAttractedBalls(substepSeconds);
      this.settleCluster(substepSeconds);
    }
  }

  private advancePhase() {
    const gatherStart = FALL_DURATION_SECONDS + ROLL_DURATION_SECONDS;

    if (
      this.phase === "falling" &&
      this.elapsedSeconds >= FALL_DURATION_SECONDS
    ) {
      this.phase = "rolling";
      this.breakBalls();
    }
    if (this.phase === "rolling" && this.elapsedSeconds >= gatherStart) {
      this.startGathering();
    }
    if (this.phase === "gathering") {
      this.attractNextBall();
      this.absorbArrivedBalls();
      if (
        this.balls.every(
          (ball) => ball.state !== "free" && ball.state !== "attracted",
        )
      ) {
        this.startSwelling();
      }
    }
    if (this.phase === "swelling") {
      this.mergeProgress = Math.min(
        (this.elapsedSeconds - this.swellStartSeconds) / SWELL_DURATION_SECONDS,
        FULL_PROGRESS,
      );
      if (this.mergeProgress >= FULL_PROGRESS) this.finishMerging();
    }
  }

  private breakBalls() {
    for (const ball of this.balls) {
      const angle = this.random() * Math.PI * 2;
      const speed = randomBetween(
        this.random,
        BREAK_MIN_SPEED,
        BREAK_MAX_SPEED,
      );
      ball.vx = Math.cos(angle) * speed;
      ball.vy = Math.sin(angle) * speed;
    }
  }

  private startGathering() {
    const { sun } = this;
    if (sun === null) {
      this.phase = "merged";
      return;
    }

    const [seed] = [...this.balls].sort(
      (first, second) =>
        distanceBetween(first, sun.center) -
        distanceBetween(second, sun.center),
    );
    seed.state = "cluster";
    this.totalBallArea = this.balls.reduce(
      (total, ball) => total + ball.radius ** 2,
      0,
    );
    this.clusterArea = seed.radius ** 2;
    this.clusterTargetRadius = this.radiusForClusterArea(sun);
    this.phase = "gathering";
    this.nextAttractionSeconds =
      this.elapsedSeconds + FIRST_ATTRACTION_DELAY_SECONDS;
  }

  private attractNextBall() {
    const { cluster } = this;
    if (cluster === null || this.elapsedSeconds < this.nextAttractionSeconds) {
      return;
    }

    const [nextBall] = this.balls
      .filter((ball) => ball.state === "free")
      .sort(
        (first, second) =>
          distanceBetween(first, cluster) - distanceBetween(second, cluster),
      );
    if (nextBall === undefined) return;

    nextBall.state = "attracted";
    this.nextAttractionSeconds += ATTRACTION_INTERVAL_SECONDS;
  }

  private absorbArrivedBalls() {
    const { cluster } = this;
    if (cluster === null) return;

    for (const ball of this.balls) {
      const isTouchingCluster =
        distanceBetween(ball, cluster) <=
        cluster.radius + ball.radius * ABSORB_OVERLAP_RATIO;
      if (ball.state !== "attracted" || !isTouchingCluster) continue;

      ball.state = "absorbed";
      this.clusterArea += ball.radius ** 2;
      if (this.sun !== null) {
        this.clusterTargetRadius = this.radiusForClusterArea(this.sun);
      }
    }
  }

  private radiusForClusterArea(sun: SunShape) {
    return sun.radius * Math.sqrt(this.clusterArea / this.totalBallArea);
  }

  private startSwelling() {
    if (this.sun === null) return;

    this.phase = "swelling";
    this.swellStartSeconds = this.elapsedSeconds;
    this.clusterTargetRadius = this.sun.radius;
  }

  private finishMerging() {
    const { cluster, sun } = this;
    if (cluster !== null && sun !== null) {
      cluster.x = sun.center.x;
      cluster.y = sun.center.y;
      cluster.radius = sun.radius;
    }
    this.phase = "merged";
  }

  private moveFreeBalls(seconds: number) {
    const freeBalls = this.balls.filter((ball) => ball.state === "free");
    const gravity = this.phase === "falling" ? GRAVITY : NO_GRAVITY;
    const isCeilingSolid = this.phase !== "falling";
    const { cluster } = this;

    for (const ball of freeBalls) {
      ball.vy += gravity * seconds;
      ball.x += ball.vx * seconds;
      ball.y += ball.vy * seconds;
    }

    for (let first = 0; first < freeBalls.length; first += 1) {
      for (let second = first + 1; second < freeBalls.length; second += 1) {
        collideBalls(freeBalls[first], freeBalls[second]);
      }
    }

    for (const ball of freeBalls) {
      if (this.obstacle !== null && ball.y > 0) {
        bounceOffRectangle(ball, this.obstacle);
      }
      if (cluster !== null) bounceOffCircle(ball, cluster, cluster.radius);
      bounceOffWalls(ball, this.bounds, isCeilingSolid);
    }
  }

  private moveAttractedBalls(seconds: number) {
    const { cluster } = this;
    if (cluster === null) return;

    const steering = Math.min(
      ATTRACTION_STEERING_RATE * seconds,
      FULL_PROGRESS,
    );

    for (const ball of this.balls) {
      if (ball.state !== "attracted") continue;

      ball.attractedSeconds += seconds;
      const distance = distanceBetween(ball, cluster);
      const speed = Math.min(
        ATTRACTION_ACCELERATION * ball.attractedSeconds,
        ATTRACTION_MAX_SPEED,
      );
      const desiredVx = ((cluster.x - ball.x) / distance) * speed;
      const desiredVy = ((cluster.y - ball.y) / distance) * speed;
      ball.vx += (desiredVx - ball.vx) * steering;
      ball.vy += (desiredVy - ball.vy) * steering;
      ball.x += ball.vx * seconds;
      ball.y += ball.vy * seconds;
    }
  }

  private settleCluster(seconds: number) {
    const { cluster, sun } = this;
    if (cluster === null || sun === null) return;

    cluster.vx +=
      (CLUSTER_STIFFNESS * (sun.center.x - cluster.x) -
        CLUSTER_DAMPING * cluster.vx) *
      seconds;
    cluster.vy +=
      (CLUSTER_STIFFNESS * (sun.center.y - cluster.y) -
        CLUSTER_DAMPING * cluster.vy) *
      seconds;
    cluster.x += cluster.vx * seconds;
    cluster.y += cluster.vy * seconds;
    cluster.radius +=
      (this.clusterTargetRadius - cluster.radius) *
      Math.min(CLUSTER_GROWTH_RATE * seconds, FULL_PROGRESS);
  }
}
