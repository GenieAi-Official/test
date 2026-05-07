import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PixelButton from "@/components/PixelButton";
import GameCanvas from "@/components/GameCanvas";

type Winner = "p1" | "p2" | null;

function HpBar({ value, side }: { value: number; side: "left" | "right" }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="pixel-font text-[10px] tracking-wider text-emerald-100/80">
        {side === "left" ? "P1" : "P2"} HP
      </div>
      <div className="h-4 border-2 border-emerald-200/35 bg-black/40">
        <div
          className="h-full bg-emerald-300"
          style={{
            width: `${pct}%`,
            background: side === "left" ? "#34d399" : "#fb7185",
          }}
        />
      </div>
    </div>
  );
}

export default function Game() {
  const navigate = useNavigate();
  const [hp, setHp] = useState({ p1: 100, p2: 100 });
  const [winner, setWinner] = useState<Winner>(null);
  const [resetKey, setResetKey] = useState(0);

  const ended = winner !== null;
  const title = useMemo(() => {
    if (!ended) return "FIGHT";
    return winner === "p1" ? "P1 WIN" : "P2 WIN";
  }, [ended, winner]);

  return (
    <div className="relative min-h-dvh bg-slate-950 text-emerald-50">
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,rgba(52,211,153,0.25)_1px,transparent_0)] [background-size:18px_18px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:repeating-linear-gradient(to_bottom,rgba(255,255,255,0.22)_0px,rgba(255,255,255,0.22)_1px,transparent_1px,transparent_4px)]" />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-6">
        <div className="flex items-center justify-between gap-4">
          <div className="pixel-font text-xs tracking-wider text-emerald-200">{title}</div>
          <div className="flex gap-2">
            <PixelButton
              variant="ghost"
              onClick={() => {
                setWinner(null);
                setHp({ p1: 100, p2: 100 });
                setResetKey((v) => v + 1);
              }}
            >
              重开
            </PixelButton>
            <PixelButton variant="ghost" onClick={() => navigate("/")}>
              返回
            </PixelButton>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <HpBar value={hp.p1} side="left" />
          <HpBar value={hp.p2} side="right" />
        </div>

        <div className="flex justify-center">
          <GameCanvas
            resetKey={resetKey}
            onHpChange={(p1, p2) => setHp({ p1, p2 })}
            onEnd={(w) => setWinner(w)}
          />
        </div>

        <div className="grid gap-3 text-xs text-emerald-100/70 md:grid-cols-2">
          <div className="pixel-border border-2 border-emerald-200/20 bg-emerald-300/5 p-3">
            P1：A/D 移动，W 防御，F 攻击
          </div>
          <div className="pixel-border border-2 border-emerald-200/20 bg-emerald-300/5 p-3">
            P2：←/→ 移动，↑ 防御，/ 攻击
          </div>
        </div>
      </div>

      {ended ? (
        <div className="absolute inset-0 grid place-items-center bg-black/50 p-6">
          <div className="pixel-panel w-full max-w-md">
            <div className="pixel-font mb-4 text-center text-lg tracking-[0.08em] text-emerald-200">
              {winner === "p1" ? "P1 WIN" : "P2 WIN"}
            </div>
            <div className="mb-5 text-center text-sm text-emerald-50/80">
              再来一局，或者返回开始页切换节奏。
            </div>
            <div className="flex justify-center gap-3">
              <PixelButton
                onClick={() => {
                  setWinner(null);
                  setHp({ p1: 100, p2: 100 });
                  setResetKey((v) => v + 1);
                }}
              >
                再来一局
              </PixelButton>
              <PixelButton variant="ghost" onClick={() => navigate("/")}>
                返回
              </PixelButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

