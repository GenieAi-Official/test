import {
  ATTACK_DURATION,
  ATTACK_COOLDOWN,
  BASE_DAMAGE,
  BLOCK_REDUCTION,
  GROUND_Y,
  HITSTUN,
  HITSTUN_BLOCK,
  KNOCKBACK,
  MOVE_SPEED,
  MOVE_SPEED_BLOCKING,
  PLAYER_H,
  PLAYER_W,
  SEPARATION,
  VIEW_W,
} from "@/game/constants";
import { clamp, rectCenter, rectsIntersect } from "@/game/math";
import type { GameRuntime, HitSpark, InputSnapshot, PlayerRuntime, Rect } from "@/game/types";

function playerRect(p: PlayerRuntime): Rect {
  return { x: p.x - PLAYER_W / 2, y: GROUND_Y - PLAYER_H, w: PLAYER_W, h: PLAYER_H };
}

function hitBox(attacker: PlayerRuntime): Rect {
  const reach = 14;
  const w = 12;
  const h = 12;
  const y = GROUND_Y - PLAYER_H + 10;
  const x =
    attacker.facing === "right"
      ? attacker.x + PLAYER_W / 2 + reach - w / 2
      : attacker.x - PLAYER_W / 2 - reach - w / 2;
  return { x, y, w, h };
}

function pushApart(a: PlayerRuntime, b: PlayerRuntime) {
  const ar = playerRect(a);
  const br = playerRect(b);
  if (!rectsIntersect(ar, br)) return;

  const overlap = ar.x + ar.w - br.x;
  const push = overlap / 2 + SEPARATION;
  a.x -= push;
  b.x += push;
}

function newSpark(x: number, y: number): HitSpark {
  return {
    id: `${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`,
    x,
    y,
    life: 0.12,
    maxLife: 0.12,
  };
}

function applyDamage(defender: PlayerRuntime, dmg: number) {
  defender.hp = Math.max(0, defender.hp - dmg);
}

function handleAttack(attacker: PlayerRuntime, defender: PlayerRuntime, sparks: HitSpark[]) {
  if (attacker.attackTime <= 0) {
    attacker.attackHasHit = false;
    return;
  }
  if (attacker.attackHasHit) return;

  const hb = hitBox(attacker);
  const dr = playerRect(defender);
  if (!rectsIntersect(hb, dr)) return;

  attacker.attackHasHit = true;

  const blocked = defender.isBlocking && defender.hitstun <= 0;
  const dmg = blocked ? Math.max(1, Math.round(BASE_DAMAGE * (1 - BLOCK_REDUCTION))) : BASE_DAMAGE;

  applyDamage(defender, dmg);

  defender.hitstun = blocked ? HITSTUN_BLOCK : HITSTUN;
  defender.vx += attacker.facing === "right" ? KNOCKBACK : -KNOCKBACK;

  const c = rectCenter(hb);
  sparks.push(newSpark(c.x, c.y));
}

function updatePlayer(p: PlayerRuntime, input: { left: boolean; right: boolean; block: boolean; attackPressed: boolean }, dt: number) {
  p.cooldown = Math.max(0, p.cooldown - dt);
  p.hitstun = Math.max(0, p.hitstun - dt);
  p.attackTime = Math.max(0, p.attackTime - dt);

  if (p.hitstun > 0) {
    p.isBlocking = false;
  } else {
    p.isBlocking = input.block;
  }

  if (p.hitstun <= 0 && input.attackPressed && p.cooldown <= 0) {
    p.attackTime = ATTACK_DURATION;
    p.cooldown = ATTACK_COOLDOWN;
    p.attackHasHit = false;
  }

  const speed = p.isBlocking ? MOVE_SPEED_BLOCKING : MOVE_SPEED;
  const move = (input.right ? 1 : 0) - (input.left ? 1 : 0);

  const targetVx = move * speed;
  const accel = p.hitstun > 0 ? 22 : 18;
  p.vx += (targetVx - p.vx) * (1 - Math.pow(0.001, dt * accel));

  p.x += p.vx * dt;
  p.x = clamp(p.x, PLAYER_W / 2 + 6, VIEW_W - PLAYER_W / 2 - 6);

  if (Math.abs(move) > 0.1) p.walkTime += dt;
}

export function stepRuntime(runtime: GameRuntime, input: InputSnapshot, dtRaw: number) {
  const dt = Math.min(0.033, Math.max(0.001, dtRaw));
  runtime.time += dt;

  if (runtime.phase !== "playing") {
    runtime.sparks = runtime.sparks
      .map((s) => ({ ...s, life: Math.max(0, s.life - dt) }))
      .filter((s) => s.life > 0);
    return;
  }

  const dx = runtime.p2.x - runtime.p1.x;
  runtime.p1.facing = dx >= 0 ? "right" : "left";
  runtime.p2.facing = dx >= 0 ? "left" : "right";

  updatePlayer(runtime.p1, input.p1, dt);
  updatePlayer(runtime.p2, input.p2, dt);

  pushApart(runtime.p1, runtime.p2);

  const sparks: HitSpark[] = [];
  handleAttack(runtime.p1, runtime.p2, sparks);
  handleAttack(runtime.p2, runtime.p1, sparks);

  runtime.sparks = runtime.sparks
    .map((s) => ({ ...s, life: Math.max(0, s.life - dt) }))
    .filter((s) => s.life > 0)
    .concat(sparks);

  if (runtime.p1.hp <= 0 || runtime.p2.hp <= 0) {
    runtime.phase = "ended";
    runtime.winner = runtime.p1.hp <= 0 ? "p2" : "p1";
  }
}
