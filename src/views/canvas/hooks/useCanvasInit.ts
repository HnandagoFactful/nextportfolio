import { useEffect, RefObject } from "react";
import type { Canvas as FabricCanvas } from "fabric";

export function useCanvasInit(
  containerRef: RefObject<HTMLDivElement | null>,
  canvasElRef: RefObject<HTMLCanvasElement | null>,
  onReady: (canvas: FabricCanvas) => void,
) {
  useEffect(() => {
    let fabricCanvas: FabricCanvas | null = null;
    let ro: ResizeObserver | null = null;
    let cancelled = false;

    import('fabric').then(({ Canvas }) => {
      // StrictMode unmounted before the async import resolved — skip init
      if (cancelled) return;

      const container = containerRef.current;
      const canvasEl = canvasElRef.current;
      if (!container || !canvasEl) return;

      fabricCanvas = new Canvas(canvasEl, {
        width: container.clientWidth,
        height: container.clientHeight,
        backgroundColor: '#1a1a1a',
        selection: true,
        preserveObjectStacking: true,
      });

      onReady(fabricCanvas);

      ro = new ResizeObserver(([entry]) => {
        if (!fabricCanvas) return;
        const { width, height } = entry.contentRect;
        // Never shrink below the current canvas size — the canvas may have
        // been expanded by useCanvasExpand when objects were dragged near
        // the boundary. Allow it to grow when the container grows.
        const newW = Math.max(width,  fabricCanvas.getWidth());
        const newH = Math.max(height, fabricCanvas.getHeight());
        fabricCanvas.setDimensions({ width: newW, height: newH });
        fabricCanvas.requestRenderAll();
      });
      ro.observe(container);
    });

    return () => {
      cancelled = true;
      ro?.disconnect();
      fabricCanvas?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
