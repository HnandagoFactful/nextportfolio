import { useEffect, RefObject } from "react";
import type { Canvas as FabricCanvas, FabricObject, Path as FabricPath } from "fabric";
import {
  findById, getRectConnectionPoint, buildArrowPath,
  type ArrowObject, type LabelledObject,
} from "../canvasUtils";

/**
 * Updates connected arrows in real-time as their linked rects are moved.
 *
 * Listens to BOTH:
 *   object:moving  — fires every frame during drag  → arrows track in real-time
 *   object:modified — fires once on mouse-up         → final sync to clean state
 *
 * Uses an in-place path update (no canvas.remove + canvas.add) so that:
 *   - Layers panel never flickers
 *   - object:removed / object:added are never triggered
 *   - Animation state (strokeDashArray etc.) is preserved on the same object
 *
 * Fabric is imported once via import().then() so the event handlers are
 * synchronous after the initial load (same pattern as useToolMode / useTextOnPath).
 */
export function useArrowConnections(
  canvasRef: RefObject<FabricCanvas | null>,
  canvasReady: boolean,
): void {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasReady) return;

    let cancelled = false;
    let removeListeners: (() => void) | null = null;

    import('fabric').then(({ Path }) => {
      if (cancelled) return;

      /**
       * Update each arrow connected to `movedId` in-place.
       * "In-place" means we reuse the existing Fabric Path object —
       * only its internal path data, pathOffset, left, top, width, height change.
       * No remove/add → no event cascade.
       */
      const updateConnectedArrows = (movedId: string) => {
        const arrows = canvas.getObjects().filter((o) => {
          const a = o as ArrowObject;
          if (a.canvasArrowType !== 'arrow') return false;
          return (
            (a.arrowFrom?.type === 'connected' && a.arrowFrom.objId === movedId) ||
            (a.arrowTo?.type === 'connected' && a.arrowTo.objId === movedId)
          );
        }) as unknown as ArrowObject[];

        if (arrows.length === 0) return;

        for (const arrow of arrows) {
          const from = arrow.arrowFrom!;
          const to   = arrow.arrowTo!;

          let x1: number, y1: number, x2: number, y2: number;

          if (from.type === 'free') {
            x1 = from.x; y1 = from.y;
          } else {
            const obj = findById(canvas, from.objId);
            if (!obj) continue;
            ({ x: x1, y: y1 } = getRectConnectionPoint(obj, from.side));
          }

          if (to.type === 'free') {
            x2 = to.x; y2 = to.y;
          } else {
            const obj = findById(canvas, to.objId);
            if (!obj) continue;
            ({ x: x2, y: y2 } = getRectConnectionPoint(obj, to.side));
          }

          // Build a temp Path to get normalised path data + bounding box position.
          // We then transplant its internals into the existing arrow object.
          const temp = new Path(buildArrowPath(x1, y1, x2, y2));
          const fab  = arrow as unknown as FabricPath;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (fab as any).path       = (temp as any).path;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (fab as any).pathOffset = (temp as any).pathOffset;
          fab.width  = temp.width;
          fab.height = temp.height;
          fab.left   = temp.left;
          fab.top    = temp.top;
          fab.setCoords();
        }

        canvas.requestRenderAll();
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const onMoving = (e: any) => {
        const target = e?.target as FabricObject | undefined;
        if (!target) return;
        const id = (target as LabelledObject).canvasId;
        if (id) updateConnectedArrows(id);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const onModified = (e: any) => {
        const target = e?.target as FabricObject | undefined;
        if (!target) return;
        const id = (target as LabelledObject).canvasId;
        if (id) updateConnectedArrows(id);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      canvas.on('object:moving',  onMoving   as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      canvas.on('object:modified', onModified as any);

      removeListeners = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        canvas.off('object:moving',  onMoving   as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        canvas.off('object:modified', onModified as any);
      };
    });

    return () => {
      cancelled = true;
      removeListeners?.();
    };
    // canvasRef is stable — intentionally omitted from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasReady]);
}
