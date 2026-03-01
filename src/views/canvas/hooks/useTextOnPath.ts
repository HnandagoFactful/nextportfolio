import { useState, useRef, useCallback, useEffect, RefObject, Dispatch, SetStateAction } from "react";
import type { Canvas as FabricCanvas } from "fabric";
import type { CanvasTool } from "@/providers/CanvasProvider";
import { findById } from "../canvasUtils";

interface UseTextOnPathParams {
  canvasRef: RefObject<FabricCanvas | null>;
  canvasReady: boolean;
  selectedLayerId: string | null;
  setActiveTool: (tool: CanvasTool) => void;
  setTextPathId: Dispatch<SetStateAction<string | null>>;
  setTextPathOffset: Dispatch<SetStateAction<number>>;
}

interface UseTextOnPathReturn {
  pathDrawingMode: boolean;
  /** Call when the user clicks "Draw Path" — captures the target text ID before selection is cleared. */
  openPathDrawer: () => void;
  applyPathToText: (pathId: string | null, offset: number) => void;
}

export function useTextOnPath({
  canvasRef,
  canvasReady,
  selectedLayerId,
  setActiveTool,
  setTextPathId,
  setTextPathOffset,
}: UseTextOnPathParams): UseTextOnPathReturn {
  const [pathDrawingMode, setPathDrawingMode] = useState(false);
  // Stable ref: captures the target text layer ID at the moment "Draw Path" is clicked.
  // Needed because canvas.isDrawingMode=true triggers discardActiveObject() → selection:cleared
  // → selectedLayerId becomes null before the user has even drawn anything.
  const pathTargetIdRef = useRef<string | null>(null);

  // Path-drawing mode effect.
  // When active, the main canvas becomes a freehand drawing surface.
  // Mirrors the official Fabric.js text-on-path demo:
  //   before:path:created → compute arc length via util.getPathSegmentsInfo,
  //                          auto-size font, assign path to the target text object
  //   path:created        → remove the guide path from the canvas render list
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasReady || !pathDrawingMode) return;

    let cancelled = false;
    let removeListeners: (() => void) | null = null;

    import('fabric').then(({ PencilBrush, util }) => {
      if (cancelled) return;

      canvas.isDrawingMode = true;
      const brush = new PencilBrush(canvas);
      brush.color = '#84cc16';
      brush.width = 2;
      brush.decimate = 8; // smooth the curve before path:created fires
      canvas.freeDrawingBrush = brush;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const onBeforePathCreated = (e: any) => {
        const drawnPath = e.path;

        // Use Fabric's native path-segment API to compute total arc length.
        // getPathSegmentsInfo returns cumulative lengths per segment; the last
        // entry's .length is the full path length — equivalent to SVGPath.getTotalLength()
        // but computed entirely in Fabric's own math.
        // Assigning the result to drawnPath.segmentsInfo before passing it to
        // Text is belt-and-suspenders: Text.set({ path }) auto-calls setPathInfo()
        // which re-runs this internally, but being explicit makes the intent clear.
        const pathInfo = util.getPathSegmentsInfo(drawnPath.path);
        drawnPath.segmentsInfo = pathInfo;
        const pathLength = pathInfo[pathInfo.length - 1]?.length ?? 300;

        const targetId = pathTargetIdRef.current;
        if (!targetId) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const textObj = findById(canvas, targetId) as any;
        if (!textObj) return;

        const charCount = (textObj.text?.length ?? 1) || 1;
        // Pass drawnPath directly (not a copy). Text.set({ path }) calls setPathInfo()
        // which populates segmentsInfo on the same object reference.
        // canvas.remove(drawnPath) in path:created only removes it from the render list;
        // textObj.path still holds the JS reference, so text keeps flowing on the curve.
        textObj.set({
          fontSize: Math.round(2.5 * pathLength / charCount),
          path: drawnPath,
          pathStartOffset: 0,
          left: drawnPath.left,
          top: drawnPath.top,
        });
        textObj.setCoords?.();
        setTextPathId('__drawn__');
        setTextPathOffset(0);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const onPathCreated = (e: any) => {
        // Remove drawn path from canvas render list — textObj.path still holds
        // the JS reference, so text continues to flow along the curve.
        canvas.remove(e.path);
        canvas.requestRenderAll();
        setPathDrawingMode(false);
        setActiveTool('select'); // re-triggers tool effect to restore select mode
      };

      canvas.on('before:path:created', onBeforePathCreated);
      canvas.on('path:created', onPathCreated);
      removeListeners = () => {
        canvas.off('before:path:created', onBeforePathCreated);
        canvas.off('path:created', onPathCreated);
      };
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPathDrawingMode(false);
        setActiveTool('select');
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      cancelled = true;
      canvas.isDrawingMode = false;
      document.removeEventListener('keydown', onKeyDown);
      removeListeners?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathDrawingMode, canvasReady]);

  // Opens path-drawing mode, capturing the currently selected text layer ID into a
  // stable ref before Fabric's discardActiveObject() clears the selection.
  const openPathDrawer = useCallback(() => {
    pathTargetIdRef.current = selectedLayerId;
    setPathDrawingMode(true);
  }, [selectedLayerId]);

  const applyPathToText = useCallback(
    (pathId: string | null, offset: number) => {
      const canvas = canvasRef.current;
      if (!canvas || !selectedLayerId) return;

      type TextLike = { path?: unknown; pathStartOffset?: number; setCoords?(): void };
      const textObj = findById(canvas, selectedLayerId) as unknown as TextLike | undefined;
      if (!textObj) return;

      if (pathId === null) {
        textObj.path = undefined;
        textObj.pathStartOffset = 0;
        setTextPathId(null);
        setTextPathOffset(0);
      } else if (pathId === '__drawn__') {
        // Drawn in-memory path — just update offset on the already-assigned path object
        textObj.pathStartOffset = offset;
        setTextPathOffset(offset);
      } else {
        const pathObj = findById(canvas, pathId);
        if (!pathObj) return;
        textObj.path = pathObj;
        textObj.pathStartOffset = offset;
        setTextPathId(pathId);
        setTextPathOffset(offset);
      }
      textObj.setCoords?.();
      canvas.requestRenderAll();
    },
    [selectedLayerId, setTextPathId, setTextPathOffset],
  );

  return { pathDrawingMode, openPathDrawer, applyPathToText };
}
