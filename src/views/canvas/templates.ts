/**
 * Canvas Templates
 *
 * Each template reads canvas.getWidth() / canvas.getHeight() to position
 * all objects proportionally, so the layout fills any canvas size.
 *
 * Flowchart arrows use canvasArrowType + arrowFrom/arrowTo so that
 * useArrowConnections auto-tracks them when their connected shapes are moved.
 *
 * Mind Map connectors are computed from ellipse-edge to ellipse-edge using
 * the angle from center to branch. They use plain Line objects (no tracking).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClass = new (...args: any[]) => any;

import type { Canvas as FabricCanvas, FabricObject } from 'fabric';
import {
  assignId, buildArrowPath,
  type ArrowObject, type LabelledObject, type ConnectionSide,
} from './canvasUtils';

const DEFAULT_BG = '#2e342d';

export interface ITemplate {
  id: string;
  label: string;
  description: string;
  apply: (canvas: FabricCanvas, setBackground: (color: string) => void) => Promise<void>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Create a centred IText label using a passed-in IText constructor.
 * Accepts the constructor to avoid an extra dynamic import per call —
 * the caller does `import('fabric')` once and passes IText in.
 */
function makeLabel(
  IText: AnyClass,
  text: string,
  cx: number,
  cy: number,
  opts: Record<string, unknown> = {},
): FabricObject {
  const t = new IText(text, {
    left: cx, top: cy,
    originX: 'center', originY: 'center',
    fontSize: 14, fontFamily: 'Arial', fontWeight: 'bold',
    fill: '#0a0a0a',
    ...opts,
  }) as FabricObject;
  assignId(t);
  return t;
}

/**
 * Create a connected arrow between two shapes.
 * fromPt / toPt are the initial pixel coordinates (computed by the caller
 * from known positions). arrowFrom / arrowTo metadata lets useArrowConnections
 * re-route the arrow in real-time whenever either shape is moved.
 * Both objects must have their canvasId assigned before calling this.
 */
function makeConnectedArrow(
  Path: AnyClass,
  fromPt: { x: number; y: number },
  fromObj: FabricObject,
  fromSide: ConnectionSide,
  toPt: { x: number; y: number },
  toObj: FabricObject,
  toSide: ConnectionSide,
  color = '#a3e635',
): FabricObject {
  const p = new Path(buildArrowPath(fromPt.x, fromPt.y, toPt.x, toPt.y), {
    fill: color, stroke: color, strokeWidth: 2,
  }) as FabricObject;
  assignId(p);
  (p as unknown as ArrowObject).canvasArrowType = 'arrow';
  (p as unknown as ArrowObject).arrowFrom = {
    type: 'connected',
    objId: (fromObj as LabelledObject).canvasId!,
    side: fromSide,
  };
  (p as unknown as ArrowObject).arrowTo = {
    type: 'connected',
    objId: (toObj as LabelledObject).canvasId!,
    side: toSide,
  };
  return p;
}

// ── Template list ─────────────────────────────────────────────────────────────

export const TEMPLATES: ITemplate[] = [

  // ── 1. Blank ──────────────────────────────────────────────────────────────
  {
    id: 'blank',
    label: 'Blank',
    description: 'Start fresh with a clean canvas',
    apply: async (canvas, setBackground) => {
      canvas.clear();
      setBackground(DEFAULT_BG);
      canvas.requestRenderAll();
    },
  },

  // ── 2. Flowchart ──────────────────────────────────────────────────────────
  {
    id: 'flowchart',
    label: 'Flowchart',
    description: 'Start → Process → Decision → End',
    apply: async (canvas, setBackground) => {
      const { Rect, IText, Path } = await import('fabric');
      canvas.clear();
      setBackground(DEFAULT_BG);

      const cW = canvas.getWidth();
      const cH = canvas.getHeight();

      // Proportional box dimensions
      const BW  = Math.min(Math.round(cW * 0.26), 200);
      const BH  = Math.min(Math.round(cH * 0.10), 58);
      const GAP = Math.max(Math.round(cH * 0.09), 44);  // vertical gap between boxes
      const CX  = Math.round(cW * 0.25);                 // horizontal center of the column
      const TOP = Math.round(cH * 0.07);
      const FS  = Math.max(11, Math.round(BH * 0.27));   // font size

      const y1 = TOP;
      const y2 = y1 + BH + GAP;
      const y3 = y2 + BH + GAP;
      const y4 = y3 + BH + GAP;

      const makeBox = (y: number, text: string, fill: string, rx = 6): [FabricObject, FabricObject] => {
        const cy = y + BH / 2;
        const box = new Rect({
          left: CX, top: cy, width: BW, height: BH,
          originX: 'center', originY: 'center',
          fill, rx, ry: rx, strokeWidth: 0,
        }) as FabricObject;
        assignId(box);
        const lbl = makeLabel(IText, text, CX, cy, { fill: '#1a1a1a', fontSize: FS });
        // Link label → shape so double-clicking the box enters editing on the
        // existing label (Case 2) rather than spawning a duplicate IText.
        // canvasTextShouldGroup is intentionally NOT set here — template shapes
        // must stay separate from their labels so arrow connections keep working.
        (lbl as FabricObject & { canvasTextOwnerId?: string }).canvasTextOwnerId =
          (box as FabricObject & { canvasId?: string }).canvasId;
        return [box, lbl];
      };

      const [sBox, sLbl] = makeBox(y1, 'Start',    '#4ade80', 24);
      const [pBox, pLbl] = makeBox(y2, 'Process',  '#84cc16',  4);
      const [dBox, dLbl] = makeBox(y3, 'Decision', '#fbbf24',  4);
      const [eBox, eLbl] = makeBox(y4, 'End',      '#f87171', 24);

      // Connected arrows — pass computed points for initial draw;
      // useArrowConnections re-routes them automatically when shapes are moved.
      const arr1 = makeConnectedArrow(Path, { x: CX, y: y1 + BH }, sBox, 'bottom', { x: CX, y: y2 }, pBox, 'top');
      const arr2 = makeConnectedArrow(Path, { x: CX, y: y2 + BH }, pBox, 'bottom', { x: CX, y: y3 }, dBox, 'top');
      const arr3 = makeConnectedArrow(Path, { x: CX, y: y3 + BH }, dBox, 'bottom', { x: CX, y: y4 }, eBox, 'top');

      canvas.add(sBox, sLbl, pBox, pLbl, dBox, dLbl, eBox, eLbl, arr1, arr2, arr3);
      canvas.requestRenderAll();
    },
  },

];
