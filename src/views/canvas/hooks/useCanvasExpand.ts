import { useEffect, RefObject } from 'react';
import type { Canvas as FabricCanvas } from 'fabric';

/**
 * Expands the Fabric canvas when objects are dragged or scaled near / beyond
 * the current canvas boundary, giving a Figma-like "infinite canvas" feel.
 *
 * Only right/bottom expansion is handled (canvas origin stays fixed). The
 * container div must have `overflow: 'auto'` so the user can scroll to the
 * newly revealed area.
 *
 * Constants:
 *   TRIGGER_MARGIN – start expanding when the object's bounding-rect edge is
 *                    within this many pixels of the canvas boundary.
 *   BUFFER         – how many pixels of empty space to add beyond the object.
 */
const TRIGGER_MARGIN = 48;
const BUFFER         = 140;

export function useCanvasExpand(
  canvasRef: RefObject<FabricCanvas | null>,
  canvasReady: boolean,
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasReady) return;

    const expand = () => {
      const obj = canvas.getActiveObject();
      if (!obj) return;

      // getBoundingRect() returns coords in viewport (CSS-pixel) space.
      // With no zoom applied (identity viewportTransform) this equals world space.
      const br = obj.getBoundingRect();
      const cw = canvas.getWidth();
      const ch = canvas.getHeight();

      let newW = cw;
      let newH = ch;

      if (br.left + br.width > cw - TRIGGER_MARGIN) {
        newW = Math.ceil(br.left + br.width + BUFFER);
      }
      if (br.top + br.height > ch - TRIGGER_MARGIN) {
        newH = Math.ceil(br.top + br.height + BUFFER);
      }

      if (newW !== cw || newH !== ch) {
        canvas.setDimensions({ width: newW, height: newH });
        // No explicit requestRenderAll — Fabric re-renders during the move.
      }
    };

    canvas.on('object:moving', expand);
    canvas.on('object:scaling', expand);

    return () => {
      canvas.off('object:moving', expand);
      canvas.off('object:scaling', expand);
    };
  }, [canvasRef, canvasReady]);
}
