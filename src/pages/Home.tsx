import { useNavigate } from "react-router-dom";
import PixelButton from "@/components/PixelButton";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-dvh overflow-hidden bg-slate-950 text-emerald-50">
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_1px_1px,rgba(52,211,153,0.28)_1px,transparent_0)] [background-size:18px_18px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:repeating-linear-gradient(to_bottom,rgba(255,255,255,0.22)_0px,rgba(255,255,255,0.22)_1px,transparent_1px,transparent_4px)]" />

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-4">
          <div className="inline-flex w-fit items-center gap-3 rounded-none border-2 border-emerald-200/40 bg-emerald-300/5 px-4 py-3 text-[10px] tracking-wider text-emerald-100">
            <span className="h-2 w-2 bg-emerald-300 shadow-[0_0_0_2px_rgba(16,185,129,0.28)]" />
            <span>LOCAL VS / PIXEL ARENA</span>
          </div>
          <h1 className="pixel-font text-3xl leading-tight tracking-[0.06em] text-emerald-200">
            像素机甲对战
          </h1>
          <p className="max-w-2xl text-sm text-emerald-100/80">
            同屏双人键盘对战：走位、出手、举盾格挡。先把对手血量打空者获胜。
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="pixel-panel">
            <div className="pixel-font mb-3 text-xs text-emerald-200">P1（左）</div>
            <ul className="space-y-2 text-sm text-emerald-50/90">
              <li>
                <span className="text-emerald-200">A / D</span> 移动
              </li>
              <li>
                <span className="text-emerald-200">W</span> 防御
              </li>
              <li>
                <span className="text-emerald-200">F</span> 攻击
              </li>
            </ul>
          </div>

          <div className="pixel-panel">
            <div className="pixel-font mb-3 text-xs text-rose-200">P2（右）</div>
            <ul className="space-y-2 text-sm text-emerald-50/90">
              <li>
                <span className="text-rose-200">← / →</span> 移动
              </li>
              <li>
                <span className="text-rose-200">↑</span> 防御
              </li>
              <li>
                <span className="text-rose-200">/</span> 攻击
              </li>
            </ul>
          </div>
        </section>

        <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-emerald-100/70">
            规则：攻击造成 10 伤害；举盾可减伤；受击会短暂硬直。
          </div>
          <div className="flex gap-3">
            <PixelButton variant="ghost" onClick={() => navigate("/game")}>
              进入对战
            </PixelButton>
            <PixelButton onClick={() => navigate("/game")}>开始</PixelButton>
          </div>
        </section>

        <footer className="text-xs text-emerald-100/50">
          提示：浏览器焦点需要在页面内；如果按键无响应请点击页面空白处。
        </footer>
      </div>
    </div>
  );
}
