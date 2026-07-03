"use client";

/**
 * Confete leve com divs animadas via Framer Motion — sem dependências extras.
 * Renderiza apenas após interação do usuário (sem risco de hidratação).
 */

import React, { useMemo } from "react";
import { motion } from "framer-motion";

const COLORS = ["#00E676", "#39FF88", "#00A85A", "#D9FFE8", "#FFFFFF"];

interface Piece {
  id: number;
  left: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  drift: number;
  rotate: number;
  round: boolean;
}

export function ConfettiBurst({ count = 80 }: { count?: number }) {
  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 6 + Math.random() * 8,
        color: COLORS[i % COLORS.length],
        delay: Math.random() * 0.5,
        duration: 2.2 + Math.random() * 1.6,
        drift: -70 + Math.random() * 140,
        rotate: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 540),
        round: i % 3 === 0,
      })),
    [count]
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: "-6vh", x: 0, rotate: 0, opacity: 1 }}
          animate={{ y: "106vh", x: p.drift, rotate: p.rotate, opacity: [1, 1, 0.75] }}
          transition={{ duration: p.duration, delay: p.delay, ease: [0.25, 0.4, 0.6, 1] }}
          className="absolute top-0"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 0.55,
            backgroundColor: p.color,
            borderRadius: p.round ? 9999 : 2,
          }}
        />
      ))}
    </div>
  );
}
