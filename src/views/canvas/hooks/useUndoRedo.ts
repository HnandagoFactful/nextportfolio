import { useEffect, useRef, useReducer, useCallback, RefObject } from "react";
import type { Canvas as FabricCanvas } from "fabric";

/**
 * Custom canvas properties that must be round-tripped through JSON snapshots.
 * Fabric's toJSON() accepts an extra-properties array so these survive
 * serialise → deserialise.
 */
const CUSTOM_PROPS = [
  'canvasId', 'canvasLabel',
  'canvasArrowType', 'canvasAnimationType', 'canvasDotColor', 'canvasOriginalStroke',
  'arrowFrom', 'arrowTo',
  'canvasBorderStyle',
  'canvasPatternRepeat', 'canvasPatternScale',
];

const MAX_HISTORY = 50;

export interface UseUndoRedoReturn {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  /** Manually push a snapshot (e.g. after canvas-level property changes). */
  saveSnapshot: () => void;
}

/**
 * Snapshot-based undo/redo for the Fabric canvas.
 *
 * - History stack capped at MAX_HISTORY entries.
 * - `object:added`, `object:removed`, `object:modified` auto-save a snapshot.
 * - During `loadFromJSON` restoration the `isRestoringRef` flag prevents
 *   recursive snapshot saves triggered by the flood of `object:added` events.
 * - `onAfterRestore(canvas)` lets the caller sync any React state that mirrors
 *   canvas-level properties (e.g. background colour).
 */
export function useUndoRedo(
  canvasRef: RefObject<FabricCanvas | null>,
  canvasReady: boolean,
  onAfterRestore?: (canvas: FabricCanvas) => void,
): UseUndoRedoReturn {
  const historyRef     = useRef<string[]>([]);
  const indexRef       = useRef(-1);
  const isRestoringRef = useRef(false);

  // A simple counter so that canUndo/canRedo recompute after each mutation.
  const [, bump] = useReducer((c: number) => c + 1, 0);

  // ── Save ───────────────────────────────────────────────────────────────────

  const saveSnapshot = useCallback(() => {
    if (isRestoringRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const snap = JSON.stringify(// eslint-disable-next-line @typescript-eslint/no-explicit-any
    (canvas as any).toJSON(CUSTOM_PROPS));
    // Discard any "future" snapshots (branching history).
    historyRef.current = historyRef.current.slice(0, indexRef.current + 1);
    historyRef.current.push(snap);
    if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
    indexRef.current = historyRef.current.length - 1;
    bump();
  }, [canvasRef]);

  // ── Restore ────────────────────────────────────────────────────────────────

  const restore = useCallback((snap: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    isRestoringRef.current = true;
    canvas.loadFromJSON(JSON.parse(snap))
      .then(() => {
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        onAfterRestore?.(canvas);
      })
      .finally(() => {
        isRestoringRef.current = false;
        bump();
      });
  }, [canvasRef, onAfterRestore]);

  // ── Undo / Redo ────────────────────────────────────────────────────────────

  const undo = useCallback(() => {
    if (indexRef.current <= 0 || isRestoringRef.current) return;
    indexRef.current--;
    restore(historyRef.current[indexRef.current]);
  }, [restore]);

  const redo = useCallback(() => {
    if (indexRef.current >= historyRef.current.length - 1 || isRestoringRef.current) return;
    indexRef.current++;
    restore(historyRef.current[indexRef.current]);
  }, [restore]);

  // ── Canvas event wiring ────────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasReady) return;

    // Seed history with the current canvas state (already has background set).
    historyRef.current = [JSON.stringify(// eslint-disable-next-line @typescript-eslint/no-explicit-any
    (canvas as any).toJSON(CUSTOM_PROPS))];
    indexRef.current = 0;
    bump();

    const onSave = () => saveSnapshot();
    canvas.on('object:added',    onSave);
    canvas.on('object:removed',  onSave);
    canvas.on('object:modified', onSave);

    return () => {
      canvas.off('object:added',    onSave);
      canvas.off('object:removed',  onSave);
      canvas.off('object:modified', onSave);
    };
    // saveSnapshot is stable; canvasRef is a stable ref — intentionally omitted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasReady]);

  return {
    undo,
    redo,
    canUndo: indexRef.current > 0,
    canRedo: indexRef.current < historyRef.current.length - 1,
    saveSnapshot,
  };
}
