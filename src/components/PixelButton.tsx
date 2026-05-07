import { cn } from "@/lib/utils";
import type React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
  size?: "md" | "lg";
};

const base =
  "select-none border-2 px-4 py-2 text-[10px] leading-4 tracking-wider transition active:translate-y-px disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<NonNullable<Props["variant"]>, string> = {
  primary:
    "bg-emerald-300 text-slate-950 border-slate-950 shadow-[3px_3px_0_0_#0b1020] hover:bg-emerald-200",
  ghost:
    "bg-transparent text-emerald-200 border-emerald-200/70 hover:bg-emerald-200/10 shadow-[3px_3px_0_0_rgba(16,185,129,0.35)]",
};

const sizes: Record<NonNullable<Props["size"]>, string> = {
  md: "",
  lg: "px-6 py-3 text-xs",
};

export default function PixelButton({
  className,
  variant = "primary",
  size = "md",
  ...props
}: Props) {
  return (
    <button
      {...props}
      className={cn(
        "pixel-border",
        base,
        variants[variant],
        sizes[size],
        className,
      )}
    />
  );
}
