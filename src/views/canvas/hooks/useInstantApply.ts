/**
 * useInstantApply
 *
 * Provides callbacks that write directly to a Fabric object without waiting
 * for the "Apply to Selection" button. These are used for controls where
 * the user expects immediate feedback (animation toggles, border styles,
 * scale / skew sliders).
 *
 * All returned functions are stable — wrapped in useCallback with only
 * ref-based deps — so they can be safely spread into a context value
 * without triggering unnecessary consumer re-renders.
 */

import { useCallback, RefObject } from 'react';
import type { Canvas as FabricCanvas } from 'fabric';
import type { IObjectProperties, ArrowAnimationType, RectBorderStyle } from '@/providers/CanvasProvider';
import { findById, type ArrowObject, type RectAnimObject } from '../canvasUtils';

export interface UseInstantApplyReturn {
  /** Set the stroke-dash animation mode on the selected arrow object. */
  applyArrowAnimation: (type: ArrowAnimationType) => void;
  /** Set the border dash style on the selected rect object. */
  applyRectBorderStyle: (style: RectBorderStyle) => void;
  /**
   * Write scale and/or skew values directly to the selected object.
   * Only keys present in `patch` are updated; others are left unchanged.
   */
  applyTransform: (
    patch: Partial<Pick<IObjectProperties, 'scaleX' | 'scaleY' | 'skewX' | 'skewY'>>,
  ) => void;
}

/**
 * @param canvasRef          - Ref to the initialised Fabric Canvas.
 * @param selectedLayerIdRef - Ref that always holds the latest selectedLayerId.
 * @param onPropertyChange   - Stable setter for merging property patches.
 */
export function useInstantApply(
  canvasRef: RefObject<FabricCanvas | null>,
  selectedLayerIdRef: RefObject<string | null>,
  onPropertyChange: (patch: Partial<IObjectProperties>) => void,
): UseInstantApplyReturn {
  /**
   * Sets the arrow animation mode.
   * - 'none'  → clears strokeDashArray
   * - 'dash'  → applies a [10, 8] dash pattern; the rAF loop in
   *             useCanvasAnimations then advances the dashOffset each frame.
   */
  const applyArrowAnimation = useCallback((type: ArrowAnimationType) => {
    const canvas = canvasRef.current;
    const selectedLayerId = selectedLayerIdRef.current;
    if (!canvas || !selectedLayerId) return;

    const obj = findById(canvas, selectedLayerId);
    if (!obj) return;

    (obj as unknown as ArrowObject).canvasAnimationType = type;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (obj as any).strokeDashArray  = type === 'none' ? [] : [10, 8];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (obj as any).strokeDashOffset = 0;
    canvas.requestRenderAll();
    onPropertyChange({ arrowAnimation: type });
  }, [canvasRef, selectedLayerIdRef, onPropertyChange]);

  /**
   * Sets the rect border dash style.
   * - 'solid'            → clears strokeDashArray
   * - 'dashed'           → [6, 6] static dash
   * - 'animated-dashed'  → [6, 6] dash; rAF loop drives the dashOffset
   */
  const applyRectBorderStyle = useCallback((style: RectBorderStyle) => {
    const canvas = canvasRef.current;
    const selectedLayerId = selectedLayerIdRef.current;
    if (!canvas || !selectedLayerId) return;

    const obj = findById(canvas, selectedLayerId);
    if (!obj) return;

    (obj as unknown as RectAnimObject).canvasBorderStyle = style;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const o = obj as any;
    o.strokeDashArray  = style === 'solid' ? null : [10, 16];
    o.strokeDashOffset = 0;
    // Disable object caching for animated borders so Fabric re-renders the
    // object directly to the main canvas every frame, picking up the live
    // strokeDashOffset. Without this, Fabric uses a stale offscreen cache and
    // the animation has no visible effect.
    o.objectCaching = style !== 'animated-dashed';
    if (style !== 'animated-dashed') o.dirty = true;
    canvas.requestRenderAll();
    onPropertyChange({ rectBorderStyle: style });
  }, [canvasRef, selectedLayerIdRef, onPropertyChange]);

  /**
   * Applies scale / skew transform values directly to the selected object
   * and calls setCoords so Fabric's selection handles update immediately.
   */
  const applyTransform = useCallback(
    (patch: Partial<Pick<IObjectProperties, 'scaleX' | 'scaleY' | 'skewX' | 'skewY'>>) => {
      const canvas = canvasRef.current;
      const selectedLayerId = selectedLayerIdRef.current;
      if (!canvas || !selectedLayerId) return;

      const obj = findById(canvas, selectedLayerId);
      if (!obj) return;

      if (patch.scaleX !== undefined) obj.scaleX = patch.scaleX;
      if (patch.scaleY !== undefined) obj.scaleY = patch.scaleY;
      if (patch.skewX  !== undefined) obj.skewX  = patch.skewX;
      if (patch.skewY  !== undefined) obj.skewY  = patch.skewY;
      obj.setCoords();
      canvas.requestRenderAll();
      onPropertyChange(patch);
    },
    [canvasRef, selectedLayerIdRef, onPropertyChange],
  );

  return { applyArrowAnimation, applyRectBorderStyle, applyTransform };
}
