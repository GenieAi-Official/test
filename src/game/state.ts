import {
  P1_SPAWN_X,
  P2_SPAWN_X,
} from "@/game/constants";
import type { GameRuntime, PlayerRuntime } from "@/game/types";

function createPlayer(id: "p1" | "p2", x: number): PlayerRuntime {
  return {
    id,
    hp: 100,
    x,
    vx: 0,
    facing: id === "p1" ? "right" : "left",
    isBlocking: false,
    cooldown: 0,
    hitstun: 0,
    attackTime: 0,
    attackHasHit: false,
    walkTime: 0,
  };
}

export function createInitialRuntime(): GameRuntime {
  return {
    phase: "playing",
    winner: null,
    time: 0,
    p1: createPlayer("p1", P1_SPAWN_X),
    p2: createPlayer("p2", P2_SPAWN_X),
    sparks: [],
  };
}
