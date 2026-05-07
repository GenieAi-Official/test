import { GROUND_Y, PLAYER_H, PLAYER_W, VIEW_H, VIEW_W } from "@/game/constants";
import type { GameRuntime, PlayerRuntime, Pose } from "@/game/types";

type Star = { x: number; y: number; tw: number; s: number };

export type RenderCache = {
  stars: Star[];
};

export function createRenderCache() {
  const stars: Star[] = [];
  for (let i = 0; i < 72; i += 1) {
    stars.push({
      x: Math.random() * VIEW_W,
      y: Math.random() * (GROUND_Y - 18),
      tw: Math.random() * Math.PI * 2,
      s: 10 + Math.random() * 22,
    });
  }
  return { stars } satisfies RenderCache;
}

function poseOf(p: PlayerRuntime): Pose {
  if (p.hitstun > 0) return "hit";
  if (p.attackTime > 0) return "attack";
  if (p.isBlocking) return "block";
  if (Math.abs(p.vx) > 8) return "walk";
  return "idle";
}

function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function drawMecha(ctx: CanvasRenderingContext2D, p: PlayerRuntime, t: number) {
  const pose = poseOf(p);
  const x0 = Math.round(p.x - PLAYER_W / 2);
  const y0 = GROUND_Y - PLAYER_H;

  const bodyA = p.id === "p1" ? "#22c55e" : "#fb7185";
  const bodyB = p.id === "p1" ? "#94a3b8" : "#fda4af";
  const dark = "#0b1020";
  const glow = p.id === "p1" ? "#67e8f9" : "#fef08a";

  const dir = p.facing === "right" ? 1 : -1;
  const walk = pose === "walk" ? Math.sin(t * 10) : 0;
  const wobble = pose === "idle" ? Math.sin(t * 3) * 0.6 : 0;
  const hit = pose === "hit" ? Math.sin(t * 24) * 1.2 : 0;

  const torsoY = y0 + 10 + wobble + hit;
  const headY = y0 + 4 + wobble + hit;
  const legY = y0 + 22 + hit;

  ctx.fillStyle = dark;
  px(ctx, x0 - 1, y0 + 2, PLAYER_W + 2, PLAYER_H - 1);

  ctx.fillStyle = bodyB;
  px(ctx, x0 + 6, headY, 6, 4);
  px(ctx, x0 + 5, torsoY, 8, 10);

  ctx.fillStyle = bodyA;
  px(ctx, x0 + 6, headY + 1, 6, 3);
  px(ctx, x0 + 6, torsoY + 1, 6, 8);

  ctx.fillStyle = glow;
  px(ctx, x0 + 8, headY + 2, 2, 1);
  px(ctx, x0 + 9, torsoY + 3, 1, 1);

  const armBaseY = torsoY + 2;
  const armSwing = pose === "attack" ? 3 : walk * 2;

  const leftArmX = x0 + 3;
  const rightArmX = x0 + 12;

  ctx.fillStyle = bodyB;
  px(ctx, leftArmX, armBaseY + armSwing, 2, 6);
  px(ctx, rightArmX, armBaseY - armSwing, 2, 6);

  if (pose === "block") {
    ctx.fillStyle = p.id === "p1" ? "rgba(103,232,249,0.6)" : "rgba(253,224,71,0.6)";
    px(ctx, x0 + (dir === 1 ? 14 : -3), torsoY + 2, 4, 9);
  }

  if (pose === "attack") {
    ctx.fillStyle = p.id === "p1" ? "rgba(103,232,249,0.9)" : "rgba(251,113,133,0.9)";
    px(ctx, x0 + (dir === 1 ? 14 : -6), torsoY + 4, 6, 2);
    ctx.fillStyle = p.id === "p1" ? "rgba(103,232,249,0.45)" : "rgba(251,113,133,0.45)";
    px(ctx, x0 + (dir === 1 ? 16 : -8), torsoY + 3, 2, 4);
  }

  ctx.fillStyle = bodyB;
  px(ctx, x0 + 6, legY + walk * 2, 3, 8);
  px(ctx, x0 + 9, legY - walk * 2, 3, 8);

  ctx.fillStyle = dark;
  px(ctx, x0 + 6, legY + 7, 3, 1);
  px(ctx, x0 + 9, legY + 7, 3, 1);
}

function drawSparks(ctx: CanvasRenderingContext2D, runtime: GameRuntime) {
  for (const s of runtime.sparks) {
    const k = s.life / s.maxLife;
    const size = 1 + Math.round((1 - k) * 2);
    ctx.fillStyle = `rgba(251,191,36,${0.35 + k * 0.6})`;
    px(ctx, s.x - size, s.y, size * 2 + 1, 1);
    px(ctx, s.x, s.y - size, 1, size * 2 + 1);
  }
}

export function renderGame(ctx: CanvasRenderingContext2D, runtime: GameRuntime, cache: RenderCache) {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);

  ctx.fillStyle = "#050712";
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  for (const st of cache.stars) {
    const a = 0.2 + (Math.sin(runtime.time * 2 + st.tw) + 1) * 0.2;
    ctx.fillStyle = `rgba(52,211,153,${a})`;
    px(ctx, st.x, st.y, 1, 1);
  }

  ctx.fillStyle = "rgba(148,163,184,0.08)";
  for (let x = 0; x < VIEW_W; x += 8) px(ctx, x, GROUND_Y, 1, VIEW_H - GROUND_Y);

  ctx.fillStyle = "#0b1020";
  ctx.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);

  ctx.fillStyle = "rgba(16,185,129,0.15)";
  for (let x = 0; x < VIEW_W; x += 6) px(ctx, x + (Math.sin(runtime.time * 2) * 2), GROUND_Y + 6, 2, 1);

  drawMecha(ctx, runtime.p1, runtime.time);
  drawMecha(ctx, runtime.p2, runtime.time);

  drawSparks(ctx, runtime);

  if (runtime.phase === "ended") {
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
}
