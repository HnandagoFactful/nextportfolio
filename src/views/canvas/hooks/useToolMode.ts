import { useEffect, RefObject } from "react";
import type { Canvas as FabricCanvas, FabricObject, TPointerEventInfo } from "fabric";
import type { CanvasTool, IObjectProperties } from "@/providers/CanvasProvider";
import {
  assignId, buildArrowPath, findNearestConnection,
  type ArrowObject,
} from "../canvasUtils";

interface UseToolModeParams {
  canvasRef: RefObject<FabricCanvas | null>;
  canvasReady: boolean;
  activeTool: CanvasTool;
  pathDrawingMode: boolean;
  properties: IObjectProperties;
  imageInputRef: RefObject<HTMLInputElement | null>;
  videoInputRef: RefObject<HTMLInputElement | null>;
  setActiveTool: (tool: CanvasTool) => void;
}

/**
 * Manages all tool modes on the Fabric canvas:
 *   select / pencil / text / rect / circle / triangle / line / image / video
 *
 * Also owns the brush-property sync effect (live updates while pencil tool is active).
 *
 * Note: `properties` values are captured via closure when the effect runs (activeTool changes).
 * They are intentionally excluded from the dep array — adding them would re-register mouse
 * listeners on every brush-color slider change, interrupting any in-progress drag.
 */
export function useToolMode({
  canvasRef,
  canvasReady,
  activeTool,
  pathDrawingMode,
  properties,
  imageInputRef,
  videoInputRef,
  setActiveTool,
}: UseToolModeParams): void {
  // ---- Tool mode effect ----
  useEffect(() => {
    const canvas = canvasRef.current;
    // path-drawing effect owns the canvas during its mode — don't interfere
    if (!canvas || pathDrawingMode) return;

    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.defaultCursor = 'default';

    if (activeTool === 'select') {
      canvas.selection = true;
      return;
    }

    if (activeTool === 'image') {
      imageInputRef.current?.click();
      setActiveTool('select');
      return;
    }

    if (activeTool === 'video') {
      videoInputRef.current?.click();
      setActiveTool('select');
      return;
    }

    // Track listeners registered in this effect run so cleanup removes exactly them.
    let cancelledImport = false;
    let cleanupListeners: (() => void) | null = null;

    // Import fabric once — synchronous classes available inside .then so
    // onMouseMove is a plain function with no async race condition.
    import('fabric').then(({ PencilBrush, IText, Rect, Ellipse, Triangle, Line, Path, Circle }) => {
      if (cancelledImport) return;

      if (activeTool === 'pencil') {
        canvas.isDrawingMode = true;
        const brush = new PencilBrush(canvas);
        brush.color = properties.brushColor;
        brush.width = properties.brushWidth;
        canvas.freeDrawingBrush = brush;
        return;
      }

      if (activeTool === 'text') {
        canvas.defaultCursor = 'text';
        const onDown = ({ scenePoint }: TPointerEventInfo) => {
          const text = new IText('Type here...', {
            left: scenePoint.x,
            top: scenePoint.y,
            fontSize: properties.fontSize,
            fontFamily: properties.fontFamily,
            fontWeight: properties.fontWeight,
            fontStyle: properties.fontStyle,
            fill: properties.fillColor,
          });
          assignId(text);
          canvas.add(text);
          canvas.setActiveObject(text);
          text.enterEditing();
          canvas.requestRenderAll();
          canvas.off('mouse:down', onDown);
          canvas.defaultCursor = 'default';
        };
        canvas.on('mouse:down', onDown);
        cleanupListeners = () => canvas.off('mouse:down', onDown);
        return;
      }

      // ── Arrow tool ──────────────────────────────────────────────────────────
      if (activeTool === 'arrow') {
        canvas.defaultCursor = 'crosshair';

        let arrowOriginX = 0;
        let arrowOriginY = 0;
        let arrowDrawing = false;
        let arrowPreview: FabricObject | null = null;
        let snapIndicator: FabricObject | null = null;
        let startSnap: ReturnType<typeof findNearestConnection> = null;

        const clearSnap = () => {
          if (snapIndicator) { canvas.remove(snapIndicator); snapIndicator = null; }
        };

        const onArrowDown = ({ scenePoint }: TPointerEventInfo) => {
          const snap = findNearestConnection(canvas, scenePoint.x, scenePoint.y);
          arrowOriginX = snap ? snap.x : scenePoint.x;
          arrowOriginY = snap ? snap.y : scenePoint.y;
          startSnap = snap;
          arrowDrawing = true;
          arrowPreview = null;
        };

        const onArrowMove = ({ scenePoint }: TPointerEventInfo) => {
          clearSnap();
          const snap = findNearestConnection(canvas, scenePoint.x, scenePoint.y);
          if (snap) {
            snapIndicator = new Circle({
              left: snap.x - 7, top: snap.y - 7,
              radius: 7, fill: 'transparent',
              stroke: '#84cc16', strokeWidth: 2,
              selectable: false, evented: false,
            });
            canvas.add(snapIndicator);
          }
          if (arrowDrawing) {
            const ex = snap ? snap.x : scenePoint.x;
            const ey = snap ? snap.y : scenePoint.y;
            if (arrowPreview) canvas.remove(arrowPreview);
            arrowPreview = new Path(buildArrowPath(arrowOriginX, arrowOriginY, ex, ey), {
              fill: properties.strokeColor,
              stroke: properties.strokeColor,
              strokeWidth: properties.strokeWidth,
              selectable: false, evented: false,
            });
            canvas.add(arrowPreview);
          }
          canvas.requestRenderAll();
        };

        const onArrowUp = ({ scenePoint }: TPointerEventInfo) => {
          clearSnap();
          arrowDrawing = false;
          if (arrowPreview) { canvas.remove(arrowPreview); arrowPreview = null; }

          const endSnap = findNearestConnection(canvas, scenePoint.x, scenePoint.y);
          const x2 = endSnap ? endSnap.x : scenePoint.x;
          const y2 = endSnap ? endSnap.y : scenePoint.y;
          if (Math.hypot(x2 - arrowOriginX, y2 - arrowOriginY) < 5) return;

          const finalPath = new Path(buildArrowPath(arrowOriginX, arrowOriginY, x2, y2), {
            fill: properties.strokeColor,
            stroke: properties.strokeColor,
            strokeWidth: properties.strokeWidth,
          });
          assignId(finalPath);
          const arrow = finalPath as unknown as ArrowObject;
          arrow.canvasArrowType = 'arrow';
          arrow.arrowFrom = startSnap
            ? { type: 'connected', objId: startSnap.objId, side: startSnap.side }
            : { type: 'free', x: arrowOriginX, y: arrowOriginY };
          arrow.arrowTo = endSnap
            ? { type: 'connected', objId: endSnap.objId, side: endSnap.side }
            : { type: 'free', x: x2, y: y2 };

          canvas.add(finalPath);
          canvas.requestRenderAll();
        };

        canvas.on('mouse:down', onArrowDown);
        canvas.on('mouse:move', onArrowMove);
        canvas.on('mouse:up', onArrowUp);

        cleanupListeners = () => {
          clearSnap();
          canvas.off('mouse:down', onArrowDown);
          canvas.off('mouse:move', onArrowMove);
          canvas.off('mouse:up', onArrowUp);
        };
        return;
      }

      // Drag-to-draw tools: rect / circle / triangle / line
      let originX = 0;
      let originY = 0;
      let isDrawing = false;
      let activeShape: FabricObject | null = null;

      canvas.defaultCursor = 'crosshair';

      const onMouseDown = ({ scenePoint }: TPointerEventInfo) => {
        isDrawing = true;
        originX = scenePoint.x;
        originY = scenePoint.y;
        activeShape = null;
      };

      const onMouseMove = ({ scenePoint }: TPointerEventInfo) => {
        if (!isDrawing) return;
        const w = Math.abs(scenePoint.x - originX);
        const h = Math.abs(scenePoint.y - originY);
        const left = Math.min(scenePoint.x, originX);
        const top = Math.min(scenePoint.y, originY);

        if (activeShape) canvas.remove(activeShape);

        switch (activeTool) {
          case 'rect':
            activeShape = new Rect({ left, top, width: w, height: h, fill: properties.fillColor, stroke: properties.strokeColor, strokeWidth: properties.strokeWidth, opacity: properties.opacity });
            break;
          case 'circle':
            activeShape = new Ellipse({ left, top, rx: w / 2, ry: h / 2, fill: properties.fillColor, stroke: properties.strokeColor, strokeWidth: properties.strokeWidth, opacity: properties.opacity });
            break;
          case 'triangle':
            activeShape = new Triangle({ left, top, width: w, height: h, fill: properties.fillColor, stroke: properties.strokeColor, strokeWidth: properties.strokeWidth, opacity: properties.opacity });
            break;
          case 'line':
            activeShape = new Line([originX, originY, scenePoint.x, scenePoint.y], { stroke: properties.strokeColor, strokeWidth: properties.strokeWidth, opacity: properties.opacity });
            break;
        }

        if (activeShape) {
          canvas.add(activeShape);
          canvas.requestRenderAll();
        }
      };

      const onMouseUp = () => {
        isDrawing = false;
        if (activeShape) {
          assignId(activeShape);
          activeShape = null;
        }
      };

      canvas.on('mouse:down', onMouseDown);
      canvas.on('mouse:move', onMouseMove);
      canvas.on('mouse:up', onMouseUp);

      cleanupListeners = () => {
        canvas.off('mouse:down', onMouseDown);
        canvas.off('mouse:move', onMouseMove);
        canvas.off('mouse:up', onMouseUp);
      };
    });

    return () => {
      cancelledImport = true;
      canvas.isDrawingMode = false;
      canvas.selection = false;
      canvas.defaultCursor = 'default';
      cleanupListeners?.();
    };
    // properties values are captured via closure — intentionally excluded from deps.
    // Adding properties here would re-register listeners on every color slider change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTool, canvasReady, pathDrawingMode]);

  // ---- Brush property sync ----
  // Live-updates the pencil brush while it is active without re-triggering the full tool effect.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || activeTool !== 'pencil' || !canvas.freeDrawingBrush) return;
    canvas.freeDrawingBrush.color = properties.brushColor;
    (canvas.freeDrawingBrush as { width: number }).width = properties.brushWidth;
  }, [properties.brushColor, properties.brushWidth, activeTool]);
}
