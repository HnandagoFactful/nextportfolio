/**
 * Flowchart symbol factory functions.
 * Each `create` function adds one symbol to the canvas at the current
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

const FILL   = '#1e3a5f';
const STROKE = '#60a5fa';
const SW     = 2;

function makeRect(
  Rect: AnyClass,
  cx: number, cy: number,
  w: number, h: number,
  rx = 4,
): FabricObject {
  const obj = new Rect({
    left: cx, top: cy, width: w, height: h,
    originX: 'center', originY: 'center',
    rx, ry: rx,
    fill: FILL, stroke: STROKE, strokeWidth: SW,
  }) as FabricObject;
  assignId(obj);
  return obj;
}

function makePath(
  Path: AnyClass,
  cx: number, cy: number,
  d: string,
): FabricObject {
  const obj = new Path(d, {
    left: cx, top: cy,
    originX: 'center', originY: 'center',
    fill: FILL, stroke: STROKE, strokeWidth: SW,
  }) as FabricObject;
  assignId(obj);
  return obj;
}

function makeCircle(
  Circle: AnyClass,
  cx: number, cy: number,
  r: number,
): FabricObject {
  const obj = new Circle({
    left: cx, top: cy, radius: r,
    originX: 'center', originY: 'center',
    fill: FILL, stroke: STROKE, strokeWidth: SW,
  }) as FabricObject;
  assignId(obj);
  return obj;
}

function drop(canvas: FabricCanvas, obj: FabricObject) {
  canvas.add(obj);
  canvas.setActiveObject(obj);
  canvas.requestRenderAll();
}

// ─────────────────────────────────────────────────────────────────────────────

export interface IFlowchartSymbol {
  id:     string;
  label:  string;
  create: (canvas: FabricCanvas) => Promise<void>;
}

export const FLOWCHART_SYMBOLS: IFlowchartSymbol[] = [

  // ── Process ──────────────────────────────────────────────────────────────
  {
    id: 'fc-process', label: 'Process',
    create: async (canvas) => {
      const { Rect } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      drop(canvas, makeRect(Rect, cx, cy, 120, 60, 4));
    },
  },

  // ── Terminator ───────────────────────────────────────────────────────────
  {
    id: 'fc-terminator', label: 'Terminator',
    create: async (canvas) => {
      const { Rect } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      drop(canvas, makeRect(Rect, cx, cy, 120, 50, 25));
    },
  },

  // ── Decision (diamond) ───────────────────────────────────────────────────
  {
    id: 'fc-decision', label: 'Decision',
    create: async (canvas) => {
      const { Path } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      const W = 100, H = 80;
      drop(canvas, makePath(Path, cx, cy, `M ${W/2},0 L ${W},${H/2} L ${W/2},${H} L 0,${H/2} Z`));
    },
  },

  // ── Document (wave bottom) ───────────────────────────────────────────────
  {
    id: 'fc-document', label: 'Document',
    create: async (canvas) => {
      const { Path } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      const W = 120, H = 70;
      drop(canvas, makePath(Path, cx, cy,
        `M 0,0 L ${W},0 L ${W},${H-15} Q ${W*0.75},${H} ${W/2},${H-15} Q ${W*0.25},${H-30} 0,${H-15} Z`
      ));
    },
  },

  // ── Input / Output (parallelogram) ───────────────────────────────────────
  {
    id: 'fc-input-output', label: 'Input/Output',
    create: async (canvas) => {
      const { Path } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      const W = 130, H = 60, SK = 20;
      drop(canvas, makePath(Path, cx, cy, `M ${SK},0 L ${W},0 L ${W-SK},${H} L 0,${H} Z`));
    },
  },

  // ── Manual Operation (trapezoid wider at top) ────────────────────────────
  {
    id: 'fc-manual-operation', label: 'Manual Operation',
    create: async (canvas) => {
      const { Path } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      const W = 120, H = 60, PAD = 18;
      drop(canvas, makePath(Path, cx, cy, `M 0,0 L ${W},0 L ${W-PAD},${H} L ${PAD},${H} Z`));
    },
  },

  // ── Merge (downward triangle) ─────────────────────────────────────────────
  {
    id: 'fc-merge', label: 'Merge',
    create: async (canvas) => {
      const { Path } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      const W = 100, H = 70;
      drop(canvas, makePath(Path, cx, cy, `M 0,0 L ${W},0 L ${W/2},${H} Z`));
    },
  },

  // ── Manual Input (slanted top) ────────────────────────────────────────────
  {
    id: 'fc-manual-input', label: 'Manual Input',
    create: async (canvas) => {
      const { Path } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      const W = 120, H = 60;
      drop(canvas, makePath(Path, cx, cy, `M 0,${H*0.28} L ${W},0 L ${W},${H} L 0,${H} Z`));
    },
  },

  // ── Connector (small circle) ──────────────────────────────────────────────
  {
    id: 'fc-connector', label: 'Connector',
    create: async (canvas) => {
      const { Circle } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      drop(canvas, makeCircle(Circle, cx, cy, 30));
    },
  },

  // ── Database (cylinder) ───────────────────────────────────────────────────
  // Single path: closed body + open cap-divider arc (open subpath → stroke only).
  {
    id: 'fc-database', label: 'Database',
    create: async (canvas) => {
      const { Path } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      const W = 80, H = 80, ry = 14;
      drop(canvas, makePath(Path, cx, cy,
        `M 0,${ry} Q ${W/2},0 ${W},${ry} L ${W},${H-ry} Q ${W/2},${H} 0,${H-ry} Z ` +
        `M 0,${ry} Q ${W/2},${ry*2} ${W},${ry}`
      ));
    },
  },

  // ── Data Storage (D-shape, curved left side) ──────────────────────────────
  {
    id: 'fc-data-storage', label: 'Data Storage',
    create: async (canvas) => {
      const { Path } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      const W = 110, H = 60, cur = 22;
      drop(canvas, makePath(Path, cx, cy,
        `M ${cur},0 L ${W},0 L ${W},${H} L ${cur},${H} Q 0,${H/2} ${cur},0 Z`
      ));
    },
  },

  // ── Display (pentagon-ish display shape) ─────────────────────────────────
  {
    id: 'fc-display', label: 'Display',
    create: async (canvas) => {
      const { Path } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      const W = 130, H = 60, px = 18;
      drop(canvas, makePath(Path, cx, cy,
        `M 0,${H/2} L ${px},0 L ${W-px},0 Q ${W},${H/2} ${W-px},${H} L ${px},${H} Z`
      ));
    },
  },

  // ── Internal Storage (rect + two inner divider lines) ────────────────────
  // Open subpaths (the two lines) are stroked but not filled.
  {
    id: 'fc-internal-storage', label: 'Internal Storage',
    create: async (canvas) => {
      const { Path } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      const W = 100, H = 80, d = 20;
      drop(canvas, makePath(Path, cx, cy,
        `M 0,0 L ${W},0 L ${W},${H} L 0,${H} Z ` +
        `M 0,${d} L ${W},${d} ` +
        `M ${d},0 L ${d},${H}`
      ));
    },
  },

  // ── Tape Data (circle, represents magnetic tape reel) ────────────────────
  {
    id: 'fc-tape-data', label: 'Tape Data',
    create: async (canvas) => {
      const { Circle } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      drop(canvas, makeCircle(Circle, cx, cy, 38));
    },
  },
];
