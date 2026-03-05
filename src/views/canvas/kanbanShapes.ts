/**
 * Kanban shape factory functions.
 * Each `create` function adds one shape to the canvas at the current
 * viewport centre and immediately selects it so the user can reposition it.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClass = new (...args: any[]) => any;

import type { Canvas as FabricCanvas, FabricObject } from 'fabric';
import { assignId } from './canvasUtils';

function getViewportCenter(canvas: FabricCanvas) {
  const vpt = canvas.viewportTransform as number[];
  const zoom = canvas.getZoom();
  return {
    cx: (canvas.getWidth()  / 2 - vpt[4]) / zoom,
    cy: (canvas.getHeight() / 2 - vpt[5]) / zoom,
  };
}

function drop(canvas: FabricCanvas, obj: FabricObject) {
  canvas.add(obj);
  canvas.setActiveObject(obj);
  canvas.requestRenderAll();
}

function makeRect(
  Rect: AnyClass,
  cx: number, cy: number,
  w: number, h: number,
  fill: string, stroke: string,
  rx = 6,
): FabricObject {
  const obj = new Rect({
    left: cx, top: cy, width: w, height: h,
    originX: 'center', originY: 'center',
    rx, ry: rx, fill, stroke, strokeWidth: 2,
  }) as FabricObject;
  assignId(obj);
  return obj;
}

function makePath(
  Path: AnyClass,
  cx: number, cy: number,
  d: string,
  fill: string, stroke: string,
): FabricObject {
  const obj = new Path(d, {
    left: cx, top: cy,
    originX: 'center', originY: 'center',
    fill, stroke, strokeWidth: 2,
  }) as FabricObject;
  assignId(obj);
  return obj;
}

// ─────────────────────────────────────────────────────────────────────────────

export interface IKanbanShape {
  id:     string;
  label:  string;
  create: (canvas: FabricCanvas) => Promise<void>;
}

export const KANBAN_SHAPES: IKanbanShape[] = [

  // ── Task Card ─────────────────────────────────────────────────────────────
  {
    id: 'kb-task', label: 'Task Card',
    create: async (canvas) => {
      const { Rect } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      drop(canvas, makeRect(Rect, cx, cy, 160, 80, '#1e3a5f', '#60a5fa'));
    },
  },

  // ── Epic ──────────────────────────────────────────────────────────────────
  {
    id: 'kb-epic', label: 'Epic',
    create: async (canvas) => {
      const { Rect } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      drop(canvas, makeRect(Rect, cx, cy, 200, 100, '#3b0764', '#c084fc', 8));
    },
  },

  // ── Bug ───────────────────────────────────────────────────────────────────
  {
    id: 'kb-bug', label: 'Bug',
    create: async (canvas) => {
      const { Rect } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      drop(canvas, makeRect(Rect, cx, cy, 160, 80, '#450a0a', '#f87171'));
    },
  },

  // ── Swimlane ──────────────────────────────────────────────────────────────
  {
    id: 'kb-swimlane', label: 'Swimlane',
    create: async (canvas) => {
      const { Rect } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      drop(canvas, makeRect(Rect, cx, cy, 420, 40, '#0f172a', '#475569', 4));
    },
  },

  // ── Milestone (diamond) ───────────────────────────────────────────────────
  {
    id: 'kb-milestone', label: 'Milestone',
    create: async (canvas) => {
      const { Path } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      const W = 80, H = 80;
      drop(canvas, makePath(Path, cx, cy,
        `M ${W/2},0 L ${W},${H/2} L ${W/2},${H} L 0,${H/2} Z`,
        '#78350f', '#fbbf24',
      ));
    },
  },

  // ── Sticky Note (square with folded corner) ────────────────────────────────
  {
    id: 'kb-sticky', label: 'Sticky Note',
    create: async (canvas) => {
      const { Path } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      const W = 100, H = 100, F = 22;
      drop(canvas, makePath(Path, cx, cy,
        `M 0,0 L ${W-F},0 L ${W},${F} L ${W},${H} L 0,${H} Z ` +
        `M ${W-F},0 L ${W-F},${F} L ${W},${F}`,
        '#713f12', '#fcd34d',
      ));
    },
  },

  // ── Blocker (octagon / stop-sign) ─────────────────────────────────────────
  {
    id: 'kb-blocker', label: 'Blocker',
    create: async (canvas) => {
      const { Path } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      const S = 70, cut = 20;
      drop(canvas, makePath(Path, cx, cy,
        `M ${cut},0 L ${S-cut},0 L ${S},${cut} L ${S},${S-cut} ` +
        `L ${S-cut},${S} L ${cut},${S} L 0,${S-cut} L 0,${cut} Z`,
        '#450a0a', '#dc2626',
      ));
    },
  },

  // ── Label Tag (rectangle with right-pointing tip) ─────────────────────────
  {
    id: 'kb-label-tag', label: 'Label Tag',
    create: async (canvas) => {
      const { Path } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      const W = 120, H = 44, tip = 16;
      drop(canvas, makePath(Path, cx, cy,
        `M 0,0 L ${W-tip},0 L ${W},${H/2} L ${W-tip},${H} L 0,${H} Z`,
        '#134e4a', '#2dd4bf',
      ));
    },
  },
];
