import { useEffect, RefObject } from "react";
import type { Canvas as FabricCanvas } from "fabric";
import { type ArrowObject, type RectAnimObject } from "../canvasUtils";

/**
 * Runs a requestAnimationFrame loop that animates:
 *   - Arrow dashed flow (strokeDashArray [10, 8], medium dashOffset)
 *   - Rect animated-dashed border (strokeDashArray [10, 16], clockwise march)
 *
 * Animated rects must have objectCaching=false (set in applyRectBorderStyle)
 * so Fabric re-renders the object directly each frame, reading the live
 * strokeDashOffset rather than blitting a stale offscreen cache.
 *
 * Only calls canvas.requestRenderAll() when at least one animated object exists,
 * so there is no per-frame cost when the canvas has no animations.
 */
export function useCanvasAnimations(
  canvasRef: RefObject<FabricCanvas | null>,
  canvasReady: boolean,
): void {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasReady) return;

    let rafId: number;

    const loop = () => {
      const objects = canvas.getObjects();
      let needsRender = false;

      for (const obj of objects) {
        const ao = obj as ArrowObject;
        const ro = obj as unknown as RectAnimObject;

        if (ao.canvasArrowType === 'arrow' && ao.canvasAnimationType === 'dash') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (obj as any).strokeDashOffset = ((obj as any).strokeDashOffset || 0) - 1.5;
          needsRender = true;
        } else if (obj.type === 'rect' && ro.canvasBorderStyle === 'animated-dashed') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (obj as any).strokeDashOffset = ((obj as any).strokeDashOffset || 0) - 2;
          needsRender = true;
        }
      }

      if (needsRender) canvas.requestRenderAll();
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
    // canvasRef is stable — intentionally omitted from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasReady]);
}
