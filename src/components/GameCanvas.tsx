import { useEffect, useMemo, useRef } from "react";
import { VIEW_H, VIEW_W } from "@/game/constants";
import { createKeyboardInput } from "@/game/input";
import { renderGame, createRenderCache } from "@/game/render";
import { createInitialRuntime } from "@/game/state";
import { stepRuntime } from "@/game/step";
import type { GameRuntime, PlayerId } from "@/game/types";

type Props = {
  resetKey: number;
  onHpChange: (p1Hp: number, p2Hp: number) => void;
  onEnd: (winner: PlayerId) => void;
};

export default function GameCanvas({ resetKey, onHpChange, onEnd }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const runtimeRef = useRef<GameRuntime>(createInitialRuntime());
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const lastHudRef = useRef<{ p1: number; p2: number; phase: string }>({
    p1: 100,
    p2: 100,
    phase: "playing",
  });

  const input = useMemo(() => createKeyboardInput(), []);
  const cache = useMemo(() => createRenderCache(), []);

  useEffect(() => {
    input.attach();
    return () => input.detach();
  }, [input]);

  useEffect(() => {
    runtimeRef.current = createInitialRuntime();
    lastTsRef.current = null;
    lastHudRef.current = { p1: 100, p2: 100, phase: "playing" };
    onHpChange(100, 100);
  }, [resetKey, onHpChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loop = (ts: number) => {
      const last = lastTsRef.current ?? ts;
      lastTsRef.current = ts;

      const dt = (ts - last) / 1000;
      const runtime = runtimeRef.current;
      const snap = input.snapshot();
      stepRuntime(runtime, snap, dt);
      renderGame(ctx, runtime, cache);

      const lastHud = lastHudRef.current;
      if (runtime.p1.hp !== lastHud.p1 || runtime.p2.hp !== lastHud.p2) {
        lastHudRef.current = { ...lastHud, p1: runtime.p1.hp, p2: runtime.p2.hp };
        onHpChange(runtime.p1.hp, runtime.p2.hp);
      }

      if (runtime.phase !== lastHud.phase) {
        lastHudRef.current = { p1: runtime.p1.hp, p2: runtime.p2.hp, phase: runtime.phase };
        if (runtime.phase === "ended" && runtime.winner) onEnd(runtime.winner);
      }

      rafRef.current = window.requestAnimationFrame(loop);
    };

    rafRef.current = window.requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [cache, input, onEnd, onHpChange]);

  return (
    <canvas
      ref={canvasRef}
      width={VIEW_W}
      height={VIEW_H}
      className="w-full max-w-[960px] border-2 border-emerald-200/25 bg-black shadow-[8px_8px_0_0_rgba(15,23,42,0.65)]"
    />
  );
}

