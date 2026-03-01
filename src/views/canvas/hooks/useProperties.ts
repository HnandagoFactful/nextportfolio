import { useState, useCallback, useEffect, RefObject, Dispatch, SetStateAction } from "react";
import type { Canvas as FabricCanvas, FabricObject } from "fabric";
import type { IObjectProperties } from "@/providers/CanvasProvider";
import { findById, type ArrowObject, type RectAnimObject, type TextPatternObject } from "../canvasUtils";

export const DEFAULT_PROPERTIES: IObjectProperties = {
  fillColor: '#4CAF50',
  strokeColor: '#84cc16',
  strokeWidth: 2,
  opacity: 1,
  shadow: { color: '#000000', blur: 0, offsetX: 0, offsetY: 0 },
  brushColor: '#84cc16',
  brushWidth: 4,
  fontSize: 20,
  fontFamily: 'Arial',
  fontWeight: 'normal',
  fontStyle: 'normal',
  arrowAnimation: 'none',
  rectBorderStyle: 'solid',
  scaleX: 1,
  scaleY: 1,
  skewX: 0,
  skewY: 0,
  hasFillPattern: false,
  patternRepeat: 'repeat',
  patternScale: 1,
};

export interface UsePropertiesReturn {
  properties: IObjectProperties;
  textPathId: string | null;
  textPathOffset: number;
  /** Exposed so useTextOnPath can write path state when a path is drawn or cleared. */
  setTextPathId: Dispatch<SetStateAction<string | null>>;
  setTextPathOffset: Dispatch<SetStateAction<number>>;
  setProperties: (patch: Partial<IObjectProperties>) => void;
  applyPropertiesToSelection: () => Promise<void>;
}

export function useProperties(
  canvasRef: RefObject<FabricCanvas | null>,
  selectedLayerId: string | null,
): UsePropertiesReturn {
  const [properties, setPropertiesState] = useState<IObjectProperties>(DEFAULT_PROPERTIES);
  const [textPathId, setTextPathId] = useState<string | null>(null);
  const [textPathOffset, setTextPathOffset] = useState(0);

  // Auto-populate properties panel from the currently selected Fabric object.
  // Reads both visual properties (fill, stroke, font…) and text-on-path state.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedLayerId) {
      setTextPathId(null);
      setTextPathOffset(0);
      return;
    }
    const obj = findById(canvas, selectedLayerId);
    if (!obj) {
      setTextPathId(null);
      setTextPathOffset(0);
      return;
    }

    const s = obj.shadow as (Record<string, unknown> | null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t = obj as any;
    const isText = obj.type === 'i-text' || obj.type === 'text';
    const arrowObj = obj as ArrowObject;
    const effectiveStroke = typeof obj.stroke === 'string' ? obj.stroke : undefined;

    setPropertiesState((prev) => ({
      ...prev,
      fillColor:   typeof obj.fill   === 'string' ? obj.fill   : prev.fillColor,
      strokeColor: effectiveStroke ?? prev.strokeColor,
      strokeWidth: obj.strokeWidth ?? prev.strokeWidth,
      opacity:     obj.opacity     ?? prev.opacity,
      shadow: s
        ? {
            color:   (s.color   as string) || prev.shadow.color,
            blur:    (s.blur    as number) ?? prev.shadow.blur,
            offsetX: (s.offsetX as number) ?? prev.shadow.offsetX,
            offsetY: (s.offsetY as number) ?? prev.shadow.offsetY,
          }
        : { color: '#000000', blur: 0, offsetX: 0, offsetY: 0 },
      ...(isText && {
        fontSize:   typeof t.fontSize   === 'number' ? t.fontSize   : prev.fontSize,
        fontFamily: typeof t.fontFamily === 'string' ? t.fontFamily : prev.fontFamily,
        fontWeight: t.fontWeight === 'bold'   ? 'bold'   : ('normal' as const),
        fontStyle:  t.fontStyle  === 'italic' ? 'italic' : ('normal' as const),
      }),
      // Arrow animation state
      arrowAnimation: arrowObj.canvasArrowType === 'arrow'
        ? (arrowObj.canvasAnimationType ?? 'none')
        : prev.arrowAnimation,
      // Rect border style
      rectBorderStyle: obj.type === 'rect'
        ? ((obj as unknown as RectAnimObject).canvasBorderStyle ?? 'solid')
        : prev.rectBorderStyle,
      // Transform properties (read from every object)
      scaleX: obj.scaleX ?? prev.scaleX,
      scaleY: obj.scaleY ?? prev.scaleY,
      skewX:  obj.skewX  ?? prev.skewX,
      skewY:  obj.skewY  ?? prev.skewY,
      // Pattern fill (text objects only)
      hasFillPattern: typeof obj.fill !== 'string' && obj.fill !== null,
      ...(isText && {
        patternRepeat: (obj as unknown as TextPatternObject).canvasPatternRepeat ?? prev.patternRepeat,
        patternScale:  (obj as unknown as TextPatternObject).canvasPatternScale  ?? prev.patternScale,
      }),
    }));

    // Read text-on-path assignment from the selected object
    const tobj = obj as FabricObject & { path?: unknown; pathStartOffset?: number };
    if (tobj.path) {
      const matched = canvas.getObjects().find((o) => o === tobj.path);
      if (matched) {
        setTextPathId(
          (matched as FabricObject & { canvasId?: string }).canvasId ?? '__drawn__',
        );
      } else {
        setTextPathId('__drawn__');
      }
      setTextPathOffset(tobj.pathStartOffset ?? 0);
    } else {
      setTextPathId(null);
      setTextPathOffset(0);
    }
  }, [selectedLayerId]);

  const setProperties = useCallback((patch: Partial<IObjectProperties>) => {
    setPropertiesState((prev) => ({ ...prev, ...patch }));
  }, []);

  const applyPropertiesToSelection = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;

    const { Shadow } = await import('fabric');
    const shadow = new Shadow({
      color:   properties.shadow.color,
      blur:    properties.shadow.blur,
      offsetX: properties.shadow.offsetX,
      offsetY: properties.shadow.offsetY,
    });

    // For an ActiveSelection (multi-checkbox), apply to each child individually.
    const targets: FabricObject[] =
      active.type === 'activeSelection'
        ? (active as unknown as { getObjects(): FabricObject[] }).getObjects()
        : [active];

    targets.forEach((obj) => {
      obj.set({
        // Don't overwrite a Pattern fill — only apply when fill is a plain colour string.
        ...(typeof obj.fill === 'string' && { fill: properties.fillColor }),
        stroke:      properties.strokeColor,
        strokeWidth: properties.strokeWidth,
        opacity:     properties.opacity,
        shadow,
        scaleX:      properties.scaleX,
        scaleY:      properties.scaleY,
        skewX:       properties.skewX,
        skewY:       properties.skewY,
      });
      if (obj.type === 'i-text' || obj.type === 'text') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (obj as any).set({
          fontSize:   properties.fontSize,
          fontFamily: properties.fontFamily,
          fontWeight: properties.fontWeight,
          fontStyle:  properties.fontStyle,
        });
      }
      obj.setCoords();
    });
    canvas.requestRenderAll();
  }, [properties]);

  return {
    properties,
    textPathId,
    textPathOffset,
    setTextPathId,
    setTextPathOffset,
    setProperties,
    applyPropertiesToSelection,
  };
}
