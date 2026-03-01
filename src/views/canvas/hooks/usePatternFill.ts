/**
 * usePatternFill
 *
 * Manages image-pattern fill operations for Fabric text objects.
 *
 * Why a dedicated hook?
 *   Pattern fill involves async image loading, offscreen canvas pre-rendering,
 *   and direct Fabric API writes. Keeping this logic in a hook prevents
 *   PropertiesPanel from ballooning and makes the operations independently
 *   testable.
 *
 * Source-as-canvas strategy
 *   Fabric's `Pattern.toLive()` guards against HTMLImageElement sources where
 *   `naturalWidth === 0` (a DataURL timing edge case) and silently returns null,
 *   causing text to render with a solid colour. Using an HTMLCanvasElement as
 *   the Pattern source bypasses that guard entirely.
 *
 * Stable callbacks
 *   All returned functions are wrapped in `useCallback` with only stable deps
 *   (canvasRef, selectedLayerIdRef, propertiesRef) so the PropertiesContext
 *   value does not change on every render.
 */

import { useCallback, RefObject } from 'react';
import type { Canvas as FabricCanvas } from 'fabric';
import type { IObjectProperties, PatternRepeat } from '@/providers/CanvasProvider';
import { findById, type TextPatternObject } from '../canvasUtils';

export interface UsePatternFillReturn {
  /** Load a file and apply it as a tiled Pattern fill to the selected text object. */
  applyPatternFill: (file: File) => Promise<void>;
  /** Update the CSS repeat mode without re-uploading the image. */
  updatePatternRepeat: (repeat: PatternRepeat) => void;
  /** Re-render the cached source image at a new scale factor. */
  updatePatternScale: (scale: number) => void;
  /** Clear the Pattern fill and restore the plain colour fill. */
  removePatternFill: () => void;
}

/**
 * @param canvasRef           - Ref to the initialised Fabric Canvas.
 * @param selectedLayerIdRef  - Ref that always holds the latest selectedLayerId.
 * @param propertiesRef       - Ref that always holds the latest IObjectProperties.
 * @param onPropertyChange    - Stable setter for merging property patches.
 */
export function usePatternFill(
  canvasRef: RefObject<FabricCanvas | null>,
  selectedLayerIdRef: RefObject<string | null>,
  propertiesRef: RefObject<IObjectProperties>,
  onPropertyChange: (patch: Partial<IObjectProperties>) => void,
): UsePatternFillReturn {
  /**
   * Reads an image file, pre-renders it onto an offscreen canvas at the
   * current patternScale, and applies a Fabric Pattern fill to the selected
   * text object. Stores the original HTMLImageElement for later re-scaling.
   */
  const applyPatternFill = useCallback(async (file: File) => {
    const canvas = canvasRef.current;
    const selectedLayerId = selectedLayerIdRef.current;
    if (!canvas || !selectedLayerId) return;

    const obj = findById(canvas, selectedLayerId);
    if (!obj) return;

    // Convert the file to a DataURL so Fabric's util.loadImage can handle it.
    const url = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });

    const { Pattern, util } = await import('fabric');
    const imgEl = await util.loadImage(url);

    const { patternRepeat, patternScale } = propertiesRef.current;

    // Pre-render onto an offscreen canvas — bypasses the `isImageSource` guard
    // in Pattern.toLive() that can silently return null for HTMLImageElement.
    const pw = Math.max(1, Math.round(imgEl.naturalWidth  * patternScale));
    const ph = Math.max(1, Math.round(imgEl.naturalHeight * patternScale));
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width  = pw;
    srcCanvas.height = ph;
    srcCanvas.getContext('2d')!.drawImage(imgEl, 0, 0, pw, ph);

    const pattern = new Pattern({ source: srcCanvas, repeat: patternRepeat });

    // Cache the original image element for use by updatePatternScale.
    (obj as unknown as TextPatternObject).canvasPatternImgEl  = imgEl;
    (obj as unknown as TextPatternObject).canvasPatternRepeat = patternRepeat;
    (obj as unknown as TextPatternObject).canvasPatternScale  = patternScale;
    obj.set({ fill: pattern });
    canvas.requestRenderAll();
    onPropertyChange({ hasFillPattern: true });
  }, [canvasRef, selectedLayerIdRef, propertiesRef, onPropertyChange]);

  /**
   * Mutates the existing Pattern's repeat mode in-place.
   * Avoids re-uploading or re-creating the pattern object.
   */
  const updatePatternRepeat = useCallback((repeat: PatternRepeat) => {
    onPropertyChange({ patternRepeat: repeat });
    const canvas = canvasRef.current;
    const selectedLayerId = selectedLayerIdRef.current;
    if (!canvas || !selectedLayerId) return;

    const obj = findById(canvas, selectedLayerId);
    if (!obj || typeof obj.fill === 'string' || !obj.fill) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (obj.fill as any).repeat = repeat;
    (obj as unknown as TextPatternObject).canvasPatternRepeat = repeat;
    canvas.requestRenderAll();
  }, [canvasRef, selectedLayerIdRef, onPropertyChange]);

  /**
   * Re-renders the cached source image at `scale` and replaces the
   * Pattern's source with the newly sized canvas element.
   * Falls back to `patternTransform` for SVGs where naturalWidth is 0.
   */
  const updatePatternScale = useCallback((scale: number) => {
    onPropertyChange({ patternScale: scale });
    const canvas = canvasRef.current;
    const selectedLayerId = selectedLayerIdRef.current;
    if (!canvas || !selectedLayerId) return;

    const obj = findById(canvas, selectedLayerId);
    if (!obj || typeof obj.fill === 'string' || !obj.fill) return;

    const imgEl = (obj as unknown as TextPatternObject).canvasPatternImgEl;
    if (imgEl && imgEl.naturalWidth > 0 && imgEl.naturalHeight > 0) {
      const pw = Math.max(1, Math.round(imgEl.naturalWidth  * scale));
      const ph = Math.max(1, Math.round(imgEl.naturalHeight * scale));
      const srcCanvas = document.createElement('canvas');
      srcCanvas.width  = pw;
      srcCanvas.height = ph;
      srcCanvas.getContext('2d')!.drawImage(imgEl, 0, 0, pw, ph);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (obj.fill as any).source = srcCanvas;
    } else {
      // SVG / unresolved image: fall back to a matrix transform on the pattern.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (obj.fill as any).patternTransform = [scale, 0, 0, scale, 0, 0];
    }

    (obj as unknown as TextPatternObject).canvasPatternScale = scale;
    canvas.requestRenderAll();
  }, [canvasRef, selectedLayerIdRef, onPropertyChange]);

  /**
   * Removes the Pattern fill and restores the plain colour stored in
   * `properties.fillColor`, clearing all cached pattern metadata.
   */
  const removePatternFill = useCallback(() => {
    const canvas = canvasRef.current;
    const selectedLayerId = selectedLayerIdRef.current;
    if (!canvas || !selectedLayerId) return;

    const obj = findById(canvas, selectedLayerId);
    if (!obj) return;

    obj.set({ fill: propertiesRef.current.fillColor });
    (obj as unknown as TextPatternObject).canvasPatternRepeat = undefined;
    (obj as unknown as TextPatternObject).canvasPatternScale  = undefined;
    (obj as unknown as TextPatternObject).canvasPatternImgEl  = undefined;
    canvas.requestRenderAll();
    onPropertyChange({ hasFillPattern: false });
  }, [canvasRef, selectedLayerIdRef, propertiesRef, onPropertyChange]);

  return { applyPatternFill, updatePatternRepeat, updatePatternScale, removePatternFill };
}
