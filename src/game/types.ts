export type PlayerId = "p1" | "p2";

export type Facing = "left" | "right";

export type Pose = "idle" | "walk" | "attack" | "block" | "hit";

export type Vec2 = {
  x: number;
  y: number;
};

export type Rect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type PlayerRuntime = {
  id: PlayerId;
  hp: number;
  x: number;
  vx: number;
  facing: Facing;
  isBlocking: boolean;
  cooldown: number;
  hitstun: number;
  attackTime: number;
  attackHasHit: boolean;
  walkTime: number;
};

export type HitSpark = {
  id: string;
  x: number;
  y: number;
  life: number;
  maxLife: number;
};

export type GameRuntime = {
  phase: "playing" | "ended";
  winner: PlayerId | null;
  time: number;
  p1: PlayerRuntime;
  p2: PlayerRuntime;
  sparks: HitSpark[];
};

export type InputSnapshot = {
  p1: {
    left: boolean;
    right: boolean;
    block: boolean;
    attackPressed: boolean;
  };
  p2: {
    left: boolean;
    right: boolean;
    block: boolean;
    attackPressed: boolean;
  };
};
