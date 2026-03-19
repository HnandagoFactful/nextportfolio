/**
 * UI wireframe component shapes.
 *
 * Each shape is a Fabric Group of Rect / Path / Circle primitives dropped at
 * the current viewport centre so the user can immediately reposition it.
 *
 * All children are positioned in an absolute (0, 0) = top-left coordinate
 * system; the Group constructor derives its bounding box from all children,
 * and `originX/Y: 'center'` places the visual centre at the viewport centre.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClass = new (...args: any[]) => any;

import type { Canvas as FabricCanvas, FabricObject } from 'fabric';
import { assignId } from '../canvasUtils';

function getViewportCenter(canvas: FabricCanvas) {
  const vpt = canvas.viewportTransform as number[];
  const zoom = canvas.getZoom();
  return {
    cx: (canvas.getWidth()  / 2 - vpt[4]) / zoom,
    cy: (canvas.getHeight() / 2 - vpt[5]) / zoom,
  };
}

// ── Dark wireframe palette ────────────────────────────────────────────────────
const BG  = '#1e293b'; // element background
const BG2 = '#0f172a'; // darker / secondary
const ACT = '#1d4ed8'; // active / accent blue
const BOR = '#475569'; // border / stroke
const PLH = '#334155'; // placeholder bar fill
const WHT = '#f1f5f9'; // near-white (labels, thumb)

// ── Primitive helpers ─────────────────────────────────────────────────────────

function mkR(
  Rect: AnyClass,
  x: number, y: number, w: number, h: number,
  fill: string,
  stroke = 'transparent', sw = 0, rx = 0,
): FabricObject {
  const o = new Rect({ left: x, top: y, width: w, height: h, fill, stroke, strokeWidth: sw, rx, ry: rx }) as FabricObject;
  assignId(o);
  return o;
}

function mkP(Path: AnyClass, d: string, stroke: string, sw = 1.5): FabricObject {
  const o = new Path(d, { stroke, strokeWidth: sw, fill: 'transparent' }) as FabricObject;
  assignId(o);
  return o;
}

function mkC(Circle: AnyClass, cx: number, cy: number, r: number, fill: string, stroke = 'transparent', sw = 0): FabricObject {
  const o = new Circle({
    left: cx, top: cy, radius: r,
    originX: 'center', originY: 'center',
    fill, stroke, strokeWidth: sw,
  }) as FabricObject;
  assignId(o);
  return o;
}

async function dropGroup(canvas: FabricCanvas, items: FabricObject[], cx: number, cy: number) {
  const { Group } = await import('fabric');
  const g = new Group(items, { left: cx, top: cy, originX: 'center', originY: 'center' });
  assignId(g);
  canvas.add(g);
  canvas.setActiveObject(g);
  canvas.requestRenderAll();
}

// ─────────────────────────────────────────────────────────────────────────────

export interface IUiShape {
  id:     string;
  label:  string;
  create: (canvas: FabricCanvas) => Promise<void>;
}

export const UI_SHAPES: IUiShape[] = [

  // ── 1. Accordion ───────────────────────────────────────────────────────────
  // Row 1 open (header + expanded content), Rows 2–3 collapsed.
  {
    id: 'ui-accordion', label: 'Accordion',
    create: async (canvas) => {
      const { Rect, Path } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      const W = 220, RH = 36, CH = 44;

      // chevron-down helper (row 1, open)
      const cvDown = (yBase: number) =>
        mkP(Path, `M ${W-22},${yBase+RH/2-5} L ${W-14},${yBase+RH/2+4} L ${W-6},${yBase+RH/2-5}`, BOR);

      // chevron-right helper (rows 2-3, closed)
      const cvRight = (yBase: number) =>
        mkP(Path, `M ${W-22},${yBase+RH/2-6} L ${W-12},${yBase+RH/2} L ${W-22},${yBase+RH/2+6}`, BOR);

      const items: FabricObject[] = [
        // Row 1 — open
        mkR(Rect, 0,  0, W, RH, BG, BOR, 1, 4),
        mkR(Rect, 12, 13, 120, 10, PLH),
        cvDown(0),
        // Expanded content
        mkR(Rect, 0, RH, W, CH, BG2, BOR, 1),
        mkR(Rect, 14, RH + 10, 160, 8, PLH),
        mkR(Rect, 14, RH + 24, 120, 8, PLH),
        // Row 2 — closed
        mkR(Rect, 0, RH+CH,    W, RH, BG, BOR, 1),
        mkR(Rect, 12, RH+CH+13, 100, 10, PLH),
        cvRight(RH+CH),
        // Row 3 — closed
        mkR(Rect, 0, RH*2+CH,    W, RH, BG, BOR, 1),
        mkR(Rect, 12, RH*2+CH+13, 110, 10, PLH),
        cvRight(RH*2+CH),
      ];
      await dropGroup(canvas, items, cx, cy);
    },
  },

  // ── 2. Bullet List (ul-style) ──────────────────────────────────────────────
  {
    id: 'ui-bullet-list', label: 'Bullet List',
    create: async (canvas) => {
      const { Rect, Circle } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      const W = 200, H = 140, RH = 28;
      const items: FabricObject[] = [
        mkR(Rect, 0, 0, W, H, BG, BOR, 1, 6),
      ];
      for (let i = 0; i < 4; i++) {
        const y = 14 + i * RH;
        items.push(mkC(Circle, 22, y + RH / 2, 5, PLH));
        items.push(mkR(Rect, 36, y + (RH - 8) / 2, 130 - i * 12, 8, PLH));
      }
      await dropGroup(canvas, items, cx, cy);
    },
  },

  // ── 3. Numbered List (ol-style) ────────────────────────────────────────────
  {
    id: 'ui-numbered-list', label: 'Numbered List',
    create: async (canvas) => {
      const { Rect } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      const W = 200, H = 140, RH = 28;
      const items: FabricObject[] = [
        mkR(Rect, 0, 0, W, H, BG, BOR, 1, 6),
      ];
      for (let i = 0; i < 4; i++) {
        const y = 14 + i * RH;
        // Number badge
        items.push(mkR(Rect, 10, y + (RH - 16) / 2, 18, 16, PLH, 'transparent', 0, 3));
        // Text bar (decreasing widths for visual variety)
        items.push(mkR(Rect, 36, y + (RH - 8) / 2, 130 - i * 12, 8, PLH));
      }
      await dropGroup(canvas, items, cx, cy);
    },
  },

  // ── 4. Card ────────────────────────────────────────────────────────────────
  // Image placeholder → title + body text → footer button.
  {
    id: 'ui-card', label: 'Card',
    create: async (canvas) => {
      const { Rect } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      const W = 200, IMG_H = 80, BODY_H = 86, BTN_H = 48;
      const H = IMG_H + BODY_H + BTN_H;
      const half = W / 2;

      const items: FabricObject[] = [
        mkR(Rect, 0, 0, W, H, BG, BOR, 1, 8),           // card shell
        mkR(Rect, 0, 0, W, IMG_H, BG2, 'transparent', 0, 8), // image area (rounded top)
        mkR(Rect, 0, IMG_H - 8, W, 8, BG2),              // square-off image bottom corners
        // Camera icon placeholder in image area
        mkR(Rect, half - 22, IMG_H / 2 - 16, 44, 32, PLH, 'transparent', 0, 4),
        mkR(Rect, half - 8,  IMG_H / 2 - 26, 16, 12, PLH, 'transparent', 0, 2),
        // Body text
        mkR(Rect, 14, IMG_H + 16, 120, 11, PLH),          // title
        mkR(Rect, 14, IMG_H + 34, 160, 8,  PLH),          // body line 1
        mkR(Rect, 14, IMG_H + 46, 140, 8,  PLH),          // body line 2
        // Footer button
        mkR(Rect, 14, IMG_H + BODY_H + 10, 88, 28, ACT, 'transparent', 0, 6),
      ];
      await dropGroup(canvas, items, cx, cy);
    },
  },

  // ── 5. Button with shadow ──────────────────────────────────────────────────
  {
    id: 'ui-button', label: 'Button',
    create: async (canvas) => {
      const { Rect } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      const W = 140, H = 44;
      const items: FabricObject[] = [
        mkR(Rect, 4, 4, W, H, BG2, 'transparent', 0, 8),       // shadow
        mkR(Rect, 0, 0, W, H, ACT, 'transparent', 0, 8),        // button surface
        mkR(Rect, W / 2 - 38, H / 2 - 5, 76, 10, WHT),         // label bar
      ];
      await dropGroup(canvas, items, cx, cy);
    },
  },

  // ── 6. Tabs ────────────────────────────────────────────────────────────────
  // 3 tabs (first active) above a content panel.
  {
    id: 'ui-tabs', label: 'Tabs',
    create: async (canvas) => {
      const { Rect } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      const W = 264, TAB_H = 34, BODY_H = 120;
      const TAB_W = 80, GAP = 4;

      const items: FabricObject[] = [
        // Content area
        mkR(Rect, 0, TAB_H, W, BODY_H, BG, BOR, 1, 4),
        mkR(Rect, 16, TAB_H + 18, 200, 9, PLH),
        mkR(Rect, 16, TAB_H + 34, 170, 9, PLH),
        mkR(Rect, 16, TAB_H + 50, 190, 9, PLH),
        // Tab 1 — active
        mkR(Rect, 0,              0, TAB_W, TAB_H, ACT, BOR, 1, 4),
        mkR(Rect, 18,             TAB_H / 2 - 4, 44, 8, WHT),
        // Tab 2 — inactive
        mkR(Rect, TAB_W + GAP,              0, TAB_W, TAB_H, BG, BOR, 1, 4),
        mkR(Rect, TAB_W + GAP + 18,         TAB_H / 2 - 4, 44, 8, PLH),
        // Tab 3 — inactive
        mkR(Rect, (TAB_W + GAP) * 2,        0, TAB_W, TAB_H, BG, BOR, 1, 4),
        mkR(Rect, (TAB_W + GAP) * 2 + 18,   TAB_H / 2 - 4, 44, 8, PLH),
      ];
      await dropGroup(canvas, items, cx, cy);
    },
  },

  // ── 7. Sonner / Toast Alert ────────────────────────────────────────────────
  // Floating card with success icon, title, description, and close button.
  {
    id: 'ui-toast', label: 'Alert',
    create: async (canvas) => {
      const { Rect, Circle } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      const W = 264, H = 68;

      const items: FabricObject[] = [
        // Drop-shadow effect (offset duplicate)
        mkR(Rect, 4, 4, W, H, BG2, 'transparent', 0, 8),
        // Toast body
        mkR(Rect, 0, 0, W, H, BG, BOR, 1, 8),
        // Left success-green accent strip (inset to avoid corner overlap)
        mkR(Rect, 0, 6, 4, H - 12, '#16a34a'),
        // Icon: outer circle (dark green) + inner dot (bright green)
        mkC(Circle, 30, H / 2, 14, '#14532d'),
        mkC(Circle, 30, H / 2,  7, '#4ade80'),
        // Title bar
        mkR(Rect, 56, H / 2 - 14, 110, 10, WHT),
        // Description bar
        mkR(Rect, 56, H / 2 +  2, 155,  8, PLH),
        // Close button (small rounded square on the right)
        mkR(Rect, W - 22, H / 2 - 8, 14, 14, PLH, 'transparent', 0, 3),
      ];
      await dropGroup(canvas, items, cx, cy);
    },
  },

  // ── 8. Toggle button ───────────────────────────────────────────────────────
  // Row card with a label on the left and an ON-state pill toggle on the right.
  {
    id: 'ui-toggle', label: 'Toggle',
    create: async (canvas) => {
      const { Rect, Circle } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      const W = 180, H = 44;
      const TRK_W = 52, TRK_H = 28;
      const TRK_X = W - TRK_W - 10;
      const TRK_Y = (H - TRK_H) / 2;
      const THR = 11;                              // thumb radius
      const THX = TRK_X + TRK_W - THR - 4;        // thumb centre X (ON = right)
      const THY = H / 2;                           // thumb centre Y

      const items: FabricObject[] = [
        // Row background
        mkR(Rect, 0, 0, W, H, BG, BOR, 1, 8),
        // Label placeholder bar
        mkR(Rect, 12, H / 2 - 5, 80, 10, PLH),
        // Track (pill, active/blue = ON)
        mkR(Rect, TRK_X, TRK_Y, TRK_W, TRK_H, ACT, 'transparent', 0, TRK_H / 2),
        // Thumb (white circle, on the right = ON)
        mkC(Circle, THX, THY, THR, WHT),
      ];
      await dropGroup(canvas, items, cx, cy);
    },
  },
];
