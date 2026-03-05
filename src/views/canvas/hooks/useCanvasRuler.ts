/**
 * useCanvasRuler
 *
 * Draws a horizontal and a vertical ruler that stay in sync with the Fabric
 * canvas viewport (pan + zoom).  Both rulers are plain <canvas> elements
 * whose refs the caller provides and places adjacent to the Fabric stage.
 *
 * Re-renders on:
 *   • every Fabric `after:render` event (covers pan / zoom / object drag)
 *   • window `resize` (ruler elements change physical size)
 */

import { useEffect, type RefObject } from 'react';
import type { Canvas as FabricCanvas } from 'fabric';

const RS    = 20;          // ruler thickness in px
const R_BG  = '#1e293b';   // ruler background
const R_BOR = '#334155';   // border / tick colour
const R_TXT = '#94a3b8';   // label colour

// ── Tick-interval helper ──────────────────────────────────────────────────────

function getInterval(zoom: number): { major: number; minor: number } {
  // Target ~100 screen-px between major ticks at the current zoom level.
  const target = 100 / zoom;
  const exp    = Math.pow(10, Math.floor(Math.log10(Math.max(target, 1))));
  const n      = target / exp;
  const major  = n < 2 ? exp : n < 5 ? 2 * exp : 5 * exp;
  return { major, minor: major / 5 };
}

// ── Drawing functions ─────────────────────────────────────────────────────────

function drawH(el: HTMLCanvasElement, vpt: number[], zoom: number) {
  const W = el.clientWidth;
  if (!W) return;
  el.width  = W;
  el.height = RS;

  const ctx = el.getContext('2d');
  if (!ctx) return;

  // Background + bottom border
  ctx.fillStyle = R_BG;
  ctx.fillRect(0, 0, W, RS);
  ctx.fillStyle = R_BOR;
  ctx.fillRect(0, RS - 1, W, 1);

  const tx  = vpt[4];
  const { minor } = getInterval(zoom);
  const startW = Math.floor(-tx / zoom / minor) * minor;
  const endW   = startW + W / zoom + minor;

  ctx.font         = '9px ui-monospace, monospace';
  ctx.textBaseline = 'top';

  for (let w = startW; w <= endW; w += minor) {
    const sx = Math.round(w * zoom + tx);
    if (sx < 0 || sx > W) continue;

    const isMajor = Math.round(w / minor) % 5 === 0;
    const tickH   = isMajor ? RS * 0.55 : RS * 0.30;

    ctx.fillStyle = R_BOR;
    ctx.fillRect(sx, RS - tickH, 1, tickH);

    if (isMajor) {
      ctx.fillStyle = R_TXT;
      ctx.textAlign = 'left';
      ctx.fillText(String(Math.round(w)), sx + 2, 1);
    }
  }
}

function drawV(el: HTMLCanvasElement, vpt: number[], zoom: number) {
  const H = el.clientHeight;
  if (!H) return;
  el.width  = RS;
  el.height = H;

  const ctx = el.getContext('2d');
  if (!ctx) return;

  // Background + right border
  ctx.fillStyle = R_BG;
  ctx.fillRect(0, 0, RS, H);
  ctx.fillStyle = R_BOR;
  ctx.fillRect(RS - 1, 0, 1, H);

  const ty  = vpt[5];
  const { minor } = getInterval(zoom);
  const startW = Math.floor(-ty / zoom / minor) * minor;
  const endW   = startW + H / zoom + minor;

  ctx.font      = '9px ui-monospace, monospace';
  ctx.textAlign = 'right';

  for (let w = startW; w <= endW; w += minor) {
    const sy = Math.round(w * zoom + ty);
    if (sy < 0 || sy > H) continue;

    const isMajor = Math.round(w / minor) % 5 === 0;
    const tickW   = isMajor ? RS * 0.55 : RS * 0.30;

    ctx.fillStyle = R_BOR;
    ctx.fillRect(RS - tickW, sy, tickW, 1);

    if (isMajor) {
      ctx.save();
      ctx.fillStyle    = R_TXT;
      ctx.textBaseline = 'middle';
      ctx.translate(RS / 2 - 1, sy);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(String(Math.round(w)), 0, 0);
      ctx.restore();
    }
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export const RULER_SIZE = RS; // exported so layout code can reference the same constant

export function useCanvasRuler(
  canvasRef:  RefObject<FabricCanvas | null>,
  canvasReady: boolean,
  hRulerRef:  RefObject<HTMLCanvasElement | null>,
  vRulerRef:  RefObject<HTMLCanvasElement | null>,
) {
  useEffect(() => {
    const fc = canvasRef.current;
    if (!fc || !canvasReady) return;

    const redraw = () => {
      const vpt  = fc.viewportTransform as number[];
      const zoom = fc.getZoom();
      if (hRulerRef.current) drawH(hRulerRef.current, vpt, zoom);
      if (vRulerRef.current) drawV(vRulerRef.current, vpt, zoom);
    };

    fc.on('after:render', redraw);
    window.addEventListener('resize', redraw);
    redraw(); // initial paint

    return () => {
      fc.off('after:render', redraw);
      window.removeEventListener('resize', redraw);
    };
  }, [canvasRef, canvasReady, hRulerRef, vRulerRef]);
}
