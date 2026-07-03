"use client";

/**
 * QR code decorativo (placeholder) desenhado em SVG.
 * Padrão determinístico para evitar divergência entre SSR e cliente.
 */

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

const SIZE = 25; // módulos por lado

function isFinderZone(x: number, y: number) {
  return (x < 8 && y < 8) || (x >= SIZE - 8 && y < 8) || (x < 8 && y >= SIZE - 8);
}

function finderModule(x: number, y: number): boolean {
  // Desenha os três "olhos" clássicos do QR: anel externo 7x7 + miolo 3x3.
  const corners: Array<[number, number]> = [
    [0, 0],
    [SIZE - 7, 0],
    [0, SIZE - 7],
  ];
  for (const [cx, cy] of corners) {
    const lx = x - cx;
    const ly = y - cy;
    if (lx >= 0 && lx < 7 && ly >= 0 && ly < 7) {
      const ring = lx === 0 || lx === 6 || ly === 0 || ly === 6;
      const core = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4;
      return ring || core;
    }
  }
  return false;
}

/** Pseudo-aleatório determinístico por célula. */
function noise(x: number, y: number) {
  const v = (x * 31 + y * 17 + x * y * 7 + ((x + y) % 4) * 13) % 9;
  return v < 4;
}

export function FakeQr({ className }: { className?: string }) {
  const cells = useMemo(() => {
    const out: Array<{ x: number; y: number }> = [];
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const filled = isFinderZone(x, y) ? finderModule(x, y) : noise(x, y);
        if (filled) out.push({ x, y });
      }
    }
    return out;
  }, []);

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-hidden
      shapeRendering="crispEdges"
      className={cn("h-full w-full", className)}
    >
      {cells.map((c) => (
        <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width={1} height={1} fill="#0B0F0C" />
      ))}
    </svg>
  );
}
