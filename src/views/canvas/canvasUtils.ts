import type { FabricObject } from "fabric";
import type { ICanvasLayer, PatternRepeat } from "@/providers/CanvasProvider";

export type LabelledObject = FabricObject & { canvasId?: string; canvasLabel?: string };

// ── Arrow types ───────────────────────────────────────────────────────────────
export type ConnectionSide = 'top' | 'right' | 'bottom' | 'left';

export interface ArrowFreeEndpoint { type: 'free'; x: number; y: number }
export interface ArrowConnectedEndpoint { type: 'connected'; objId: string; side: ConnectionSide }
export type ArrowEndpoint = ArrowFreeEndpoint | ArrowConnectedEndpoint;

export type ArrowObject = FabricObject & {
  canvasId?: string;
  canvasLabel?: string;
  canvasArrowType?: 'arrow';
  canvasAnimationType?: 'none' | 'dash';
  arrowFrom?: ArrowEndpoint;
  arrowTo?: ArrowEndpoint;
};

export type RectAnimObject = FabricObject & {
  canvasBorderStyle?: 'solid' | 'dashed' | 'animated-dashed';
};

export type TextPatternObject = FabricObject & {
  canvasPatternRepeat?: PatternRepeat;
  canvasPatternScale?: number;
  /** Original image element stored for re-scaling the pattern without patternTransform */
  canvasPatternImgEl?: HTMLImageElement;
};

export const TYPE_MAP: Record<string, string> = {
  rect: 'Rectangle', circle: 'Circle', ellipse: 'Ellipse', triangle: 'Triangle',
  line: 'Line', 'i-text': 'Text', text: 'Text', path: 'Path',
  image: 'Image', group: 'Group',
};

/** Assigns a stable canvasId UUID to a Fabric object if it doesn't already have one. */
export function assignId(obj: FabricObject): void {
  if (!(obj as LabelledObject).canvasId) {
    (obj as LabelledObject).canvasId = crypto.randomUUID();
  }
}

/** Finds a Fabric object on a canvas by its canvasId. */
export function findById(
  canvas: { getObjects(): FabricObject[] },
  id: string,
): FabricObject | undefined {
  return canvas.getObjects().find((o) => (o as LabelledObject).canvasId === id);
}

/** Builds the ICanvasLayer[] list from a Fabric canvas's current object stack. */
export function buildLayerList(objects: FabricObject[]): ICanvasLayer[] {
  return objects.map((o, i) => {
    const lo = o as LabelledObject;
    const isArrow = (o as ArrowObject).canvasArrowType === 'arrow';
    const typeName = isArrow ? 'Arrow' : (TYPE_MAP[o.type ?? ''] ?? (o.type ?? 'Object'));
    return {
      id: lo.canvasId ?? String(i),
      type: isArrow ? 'arrow' : (o.type ?? 'object'),
      label: lo.canvasLabel ?? `${typeName} ${i + 1}`,
    };
  });
}

// ── Arrow utilities ───────────────────────────────────────────────────────────

/** Returns the center point of a connection side on a Fabric object's AABB. */
export function getRectConnectionPoint(
  obj: FabricObject,
  side: ConnectionSide,
): { x: number; y: number } {
  const br = obj.getBoundingRect();
  switch (side) {
    case 'top':    return { x: br.left + br.width / 2, y: br.top };
    case 'bottom': return { x: br.left + br.width / 2, y: br.top + br.height };
    case 'left':   return { x: br.left,                y: br.top + br.height / 2 };
    case 'right':  return { x: br.left + br.width,     y: br.top + br.height / 2 };
  }
}

/** Finds the nearest rectangle connection point within snapDist pixels. Returns null if none. */
export function findNearestConnection(
  canvas: { getObjects(): FabricObject[] },
  x: number,
  y: number,
  snapDist = 20,
): { objId: string; side: ConnectionSide; x: number; y: number } | null {
  const sides: ConnectionSide[] = ['top', 'right', 'bottom', 'left'];
  let nearest: { objId: string; side: ConnectionSide; x: number; y: number } | null = null;
  let nearestDist = snapDist;
  for (const obj of canvas.getObjects()) {
    const lo = obj as LabelledObject;
    if (!lo.canvasId || obj.type !== 'rect') continue;
    for (const side of sides) {
      const pt = getRectConnectionPoint(obj, side);
      const d = Math.hypot(pt.x - x, pt.y - y);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = { objId: lo.canvasId, side, x: pt.x, y: pt.y };
      }
    }
  }
  return nearest;
}

/**
 * Builds an SVG path string for an arrow from (x1,y1) to (x2,y2).
 * The shaft ends at the base of the filled arrowhead triangle.
 */
export function buildArrowPath(x1: number, y1: number, x2: number, y2: number): string {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLen = 14;
  const headWidth = 7;
  const tipBackX = x2 - headLen * Math.cos(angle);
  const tipBackY = y2 - headLen * Math.sin(angle);
  const lx = tipBackX + headWidth * Math.sin(angle);
  const ly = tipBackY - headWidth * Math.cos(angle);
  const rx = tipBackX - headWidth * Math.sin(angle);
  const ry = tipBackY + headWidth * Math.cos(angle);
  const r = (n: number) => Math.round(n * 100) / 100;
  return (
    `M ${r(x1)} ${r(y1)} L ${r(tipBackX)} ${r(tipBackY)} ` +
    `M ${r(lx)} ${r(ly)} L ${r(x2)} ${r(y2)} L ${r(rx)} ${r(ry)} Z`
  );
}
