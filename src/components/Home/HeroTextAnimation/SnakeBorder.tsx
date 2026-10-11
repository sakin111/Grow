
"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SnakeBorderProps {
  children: ReactNode;
  className?: string;
  color?: string;
  speed?: number;
  snakeLength?: number;
}

export function SnakeBorder({
  children,
  className,
  color = "#22d3ee",
  speed = 4,
  snakeLength = 100,
}: SnakeBorderProps) {
  const path = `
    M 30 10
    Q 45 0 60 10
    T 90 10 T 120 10 T 150 10
    T 180 10 T 210 10 T 240 10
    T 270 10 T 300 10 T 330 10
    Q 390 0 390 40
    T 390 100 T 390 160 T 390 190
    Q 370 220 340 210
    T 280 210 T 220 210 T 160 210
    T 100 210 T 40 210
    Q 10 220 10 180
    T 10 120 T 10 60
    Q 10 20 30 10
    Z
  `;

  return (
    <div
      className={cn(
        "relative isolate rounded-2xl p-[2px]",
        className
      )}
    >
      <svg
        viewBox="0 0 400 220"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 size-full"
        fill="none"
        aria-hidden="true"
      >
        {/* Static border */}
        <path
          d={path}
          pathLength="1000"
          className="stroke-border"
          strokeWidth="2"
        />

        {/* Moving snake */}
        <path
          d={path}
          pathLength="1000"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${snakeLength} ${1000 - snakeLength}`}
          className="animate-snake"
          style={{
            animation: `snake ${speed}s linear infinite`,
          }}
        />
      </svg>

      <div className="relative z-10 h-full rounded-[calc(1rem-2px)] bg-background">
        {children}
      </div>
    </div>
  );
}