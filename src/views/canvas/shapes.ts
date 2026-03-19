/**
 * Extra shapes for poster / illustration / design work.
 * Each entry has an id, label, group, and create() that drops the shape
 * onto the canvas at the current viewport centre.
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
  obj.setCoords();
  canvas.setActiveObject(obj);
  canvas.requestRenderAll();
}

function makePath(Path: AnyClass, cx: number, cy: number, d: string): FabricObject {
  const obj = new Path(d, {
    left: cx, top: cy,
    originX: 'center', originY: 'center',
    fill: 'transparent', stroke: '#84cc16', strokeWidth: 2,
  }) as FabricObject;
  assignId(obj);
  return obj;
}

// ── Math helpers ─────────────────────────────────────────────────────────────

/** Regular polygon centered at (cx, cy) with circumradius r, n sides. */
function polygon(cx: number, cy: number, r: number, n: number, startDeg = 0): string {
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (startDeg + (i * 360 / n)) * Math.PI / 180;
    return `${+(cx + r * Math.cos(a)).toFixed(2)},${+(cy + r * Math.sin(a)).toFixed(2)}`;
  });
  return `M ${pts.join(' L ')} Z`;
}

/** Star: pts tips alternating R (outer) and r (inner). */
function star(cx: number, cy: number, R: number, r: number, pts: number, startDeg = -90): string {
  const verts = Array.from({ length: pts * 2 }, (_, i) => {
    const a = (startDeg + i * (180 / pts)) * Math.PI / 180;
    const rad = i % 2 === 0 ? R : r;
    return `${+(cx + rad * Math.cos(a)).toFixed(2)},${+(cy + rad * Math.sin(a)).toFixed(2)}`;
  });
  return `M ${verts.join(' L ')} Z`;
}

// ── Shape registry ────────────────────────────────────────────────────────────

export interface IShape {
  id:     string;
  label:  string;
  group:  string;
  create: (canvas: FabricCanvas) => Promise<void>;
}

export const SHAPES: IShape[] = [

  // ── Geometric ──────────────────────────────────────────────────────────────

  {
    id: 'hexagon', label: 'Hexagon', group: 'Geometric',
    create: async (canvas) => {
      const { Path } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      // Flat-top hexagon 120 × 104
      drop(canvas, makePath(Path, cx, cy, 'M 30,0 L 90,0 L 120,52 L 90,104 L 30,104 L 0,52 Z'));
    },
  },

  {
    id: 'octagon', label: 'Octagon', group: 'Geometric',
    create: async (canvas) => {
      const { Path } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      drop(canvas, makePath(Path, cx, cy, 'M 29,0 L 71,0 L 100,29 L 100,71 L 71,100 L 29,100 L 0,71 L 0,29 Z'));
    },
  },

  {
    id: 'pentagon', label: 'Pentagon', group: 'Geometric',
    create: async (canvas) => {
      const { Path } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      drop(canvas, makePath(Path, cx, cy, polygon(50, 52, 50, 5, -90)));
    },
  },

  {
    id: 'diamond', label: 'Diamond', group: 'Geometric',
    create: async (canvas) => {
      const { Path } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      drop(canvas, makePath(Path, cx, cy, 'M 60,0 L 120,50 L 60,100 L 0,50 Z'));
    },
  },

  {
    id: 'plus', label: 'Plus', group: 'Geometric',
    create: async (canvas) => {
      const { Path } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      drop(canvas, makePath(Path, cx, cy,
        'M 30,0 L 60,0 L 60,30 L 90,30 L 90,60 L 60,60 L 60,90 L 30,90 L 30,60 L 0,60 L 0,30 L 30,30 Z'
      ));
    },
  },

  // ── Stars & Symbols ────────────────────────────────────────────────────────

  {
    id: 'star5', label: 'Star', group: 'Stars',
    create: async (canvas) => {
      const { Path } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      // 5-pointed star in ~110×110 box
      drop(canvas, makePath(Path, cx, cy, star(55, 55, 52, 22, 5)));
    },
  },

  {
    id: 'star6', label: 'Star 6pt', group: 'Stars',
    create: async (canvas) => {
      const { Path } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      drop(canvas, makePath(Path, cx, cy, star(55, 55, 52, 28, 6)));
    },
  },

  {
    id: 'starburst', label: 'Starburst', group: 'Stars',
    create: async (canvas) => {
      const { Path } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      // 12-pointed tight starburst
      drop(canvas, makePath(Path, cx, cy, star(55, 55, 52, 30, 12)));
    },
  },

  {
    id: 'sun', label: 'Sun', group: 'Stars',
    create: async (canvas) => {
      const { Path } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      // 8-point sun with distinct ray / body contrast
      drop(canvas, makePath(Path, cx, cy, star(55, 55, 55, 36, 8)));
    },
  },

  // ── Curved ─────────────────────────────────────────────────────────────────

  {
    id: 'heart', label: 'Heart', group: 'Curved',
    create: async (canvas) => {
      const { Path } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      drop(canvas, makePath(Path, cx, cy,
        'M 50,90 C 20,70 0,55 0,32 C 0,12 14,0 30,0 C 40,0 48,7 50,14 C 52,7 60,0 70,0 C 86,0 100,12 100,32 C 100,55 80,70 50,90 Z'
      ));
    },
  },

  {
    id: 'moon', label: 'Moon', group: 'Curved',
    create: async (canvas) => {
      const { Path } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      // Left-facing crescent (☽) via cubic bezier outline
      drop(canvas, makePath(Path, cx, cy,
        'M 50,5 C 20,5 0,25 0,50 C 0,75 20,95 50,95 C 35,80 28,65 28,50 C 28,35 35,20 50,5 Z'
      ));
    },
  },

  {
    id: 'arc', label: 'Arc', group: 'Curved',
    create: async (canvas) => {
      const { Path } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      // Upper dome / D-shape: flat bottom, arc top
      drop(canvas, makePath(Path, cx, cy, 'M 5,55 A 50,50,0,0,0,105,55 Z'));
    },
  },

  {
    id: 'pie', label: 'Pie', group: 'Curved',
    create: async (canvas) => {
      const { Path } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      // 120° wedge from 12 o'clock going clockwise
      // Center(55,55) tip→(55,5), arc end→(55+50·cos30°, 55+50·sin30°) = (98.3, 80)
      drop(canvas, makePath(Path, cx, cy, 'M 55,55 L 55,5 A 50,50,0,0,1,98.3,80 Z'));
    },
  },

  // ── Poster ─────────────────────────────────────────────────────────────────

  {
    id: 'speech-bubble', label: 'Speech', group: 'Poster',
    create: async (canvas) => {
      const { Path } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      drop(canvas, makePath(Path, cx, cy,
        'M 10,0 L 110,0 Q 120,0 120,10 L 120,60 Q 120,70 110,70 L 40,70 L 24,88 L 30,70 L 10,70 Q 0,70 0,60 L 0,10 Q 0,0 10,0 Z'
      ));
    },
  },

  {
    id: 'chevron', label: 'Chevron', group: 'Poster',
    create: async (canvas) => {
      const { Path } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      drop(canvas, makePath(Path, cx, cy, 'M 0,0 L 80,0 L 110,35 L 80,70 L 0,70 L 30,35 Z'));
    },
  },

  {
    id: 'banner', label: 'Banner', group: 'Poster',
    create: async (canvas) => {
      const { Path } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      // Ribbon banner with v-cut ends
      drop(canvas, makePath(Path, cx, cy, 'M 0,0 L 130,0 L 115,25 L 130,50 L 0,50 L 15,25 Z'));
    },
  },

  {
    id: 'double-arrow', label: 'Dbl Arrow', group: 'Poster',
    create: async (canvas) => {
      const { Path } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      drop(canvas, makePath(Path, cx, cy,
        'M 0,30 L 28,0 L 28,18 L 82,18 L 82,0 L 110,30 L 82,60 L 82,42 L 28,42 L 28,60 Z'
      ));
    },
  },

  {
    id: 'callout', label: 'Callout', group: 'Poster',
    create: async (canvas) => {
      const { Path } = await import('fabric');
      const { cx, cy } = getViewportCenter(canvas);
      drop(canvas, makePath(Path, cx, cy,
        'M 10,0 L 100,0 Q 110,0 110,10 L 110,55 Q 110,65 100,65 L 60,65 L 45,82 L 45,65 L 10,65 Q 0,65 0,55 L 0,10 Q 0,0 10,0 Z'
      ));
    },
  },
];

/** Unique group names in declaration order. */
export const SHAPE_GROUPS = [...new Set(SHAPES.map((s) => s.group))];
