import { useState, useRef, useCallback, useEffect, RefObject } from "react";
import type { Canvas as FabricCanvas, FabricObject, TPointerEventInfo } from "fabric";
import type { CanvasTool, IObjectProperties } from "@/providers/CanvasProvider";
import { assignId } from "../canvasUtils";

interface UsePolygonToolParams {
  canvasRef: RefObject<FabricCanvas | null>;
  canvasReady: boolean;
  activeTool: CanvasTool;
  properties: IObjectProperties;
  setActiveTool: (tool: CanvasTool) => void;
}

interface UsePolygonToolReturn {
  polygonDrawingMode: boolean;
  polygonPointCount: number;
  lockPolygon: () => void;
}

const SNAP_DIST = 15;

export function usePolygonTool({
  canvasRef,
  canvasReady,
  activeTool,
  properties,
  setActiveTool,
}: UsePolygonToolParams): UsePolygonToolReturn {
  const [polygonDrawingMode, setPolygonDrawingMode] = useState(false);
  const [polygonPointCount, setPolygonPointCount] = useState(0);

  const pointsRef        = useRef<{ x: number; y: number }[]>([]);
  const previewsRef      = useRef<FabricObject[]>([]);  // dots + committed segment lines
  const cursorLineRef    = useRef<FabricObject | null>(null);
  const snapIndicatorRef = useRef<FabricObject | null>(null);
  const propertiesRef    = useRef<IObjectProperties>(properties);

  // Keep propertiesRef current so lock always uses latest fill/stroke.
  useEffect(() => { propertiesRef.current = properties; }, [properties]);

  // Enter drawing mode when polygon tool is selected; exit on any other tool.
  useEffect(() => {
    if (activeTool === 'polygon') {
      pointsRef.current = [];
      setPolygonPointCount(0);
      setPolygonDrawingMode(true);
    } else {
      setPolygonDrawingMode(false);
    }
  }, [activeTool]);

  // Remove all transient preview objects from the canvas.
  const cleanupPreviews = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    for (const obj of previewsRef.current) canvas.remove(obj);
    previewsRef.current = [];
    if (cursorLineRef.current)    { canvas.remove(cursorLineRef.current);    cursorLineRef.current    = null; }
    if (snapIndicatorRef.current) { canvas.remove(snapIndicatorRef.current); snapIndicatorRef.current = null; }
  }, [canvasRef]);

  // Close the polygon, create a Fabric Polygon, and return to select mode.
  const finishPolygon = useCallback(async () => {
    const canvas = canvasRef.current;
    const points = pointsRef.current;
    if (!canvas || points.length < 2) return;

    cleanupPreviews();

    const props = propertiesRef.current;
    const { Polygon } = await import('fabric');
    const poly = new Polygon([...points], {
      fill:        props.fillColor,
      stroke:      props.strokeColor,
      strokeWidth: props.strokeWidth,
      opacity:     props.opacity,
    });
    assignId(poly);
    canvas.add(poly);
    canvas.setActiveObject(poly);
    canvas.requestRenderAll();

    pointsRef.current = [];
    setPolygonPointCount(0);
    setPolygonDrawingMode(false);
    setActiveTool('select');
  }, [canvasRef, cleanupPreviews, setActiveTool]);

  // Exposed to the Lock button in the UI.
  const lockPolygon = useCallback(() => { finishPolygon(); }, [finishPolygon]);

  // Main interaction effect — runs while polygonDrawingMode is true.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasReady || !polygonDrawingMode) return;

    canvas.isDrawingMode   = false;
    canvas.selection       = false;
    canvas.defaultCursor   = 'crosshair';
    canvas.skipTargetFind  = true;

    let cancelled = false;
    let removeListeners: (() => void) | null = null;

    import('fabric').then(({ Circle, Line }) => {
      if (cancelled) return;

      const onMouseDown = ({ scenePoint }: TPointerEventInfo) => {
        const points = pointsRef.current;

        // Clicking near the first point closes the polygon (≥ 3 points needed).
        if (points.length >= 3) {
          const first = points[0];
          if (Math.hypot(scenePoint.x - first.x, scenePoint.y - first.y) < SNAP_DIST) {
            finishPolygon();
            return;
          }
        }

        const pt = { x: scenePoint.x, y: scenePoint.y };
        points.push(pt);
        setPolygonPointCount(points.length);

        // Visual dot — the first point is a hollow circle so the user knows it's the connector.
        const isFirst = points.length === 1;
        const dot = new Circle({
          left:        pt.x - (isFirst ? 6 : 4),
          top:         pt.y - (isFirst ? 6 : 4),
          radius:      isFirst ? 6 : 4,
          fill:        isFirst ? 'transparent' : '#84cc16',
          stroke:      '#84cc16',
          strokeWidth: isFirst ? 2 : 1,
          selectable:  false,
          evented:     false,
        });
        canvas.add(dot);
        previewsRef.current.push(dot);

        // Dashed segment line from previous point.
        if (points.length >= 2) {
          const prev = points[points.length - 2];
          const seg = new Line([prev.x, prev.y, pt.x, pt.y], {
            stroke:          '#84cc16',
            strokeWidth:     1.5,
            strokeDashArray: [4, 4],
            selectable:      false,
            evented:         false,
          });
          canvas.add(seg);
          previewsRef.current.push(seg);
        }

        canvas.requestRenderAll();
      };

      const onMouseMove = ({ scenePoint }: TPointerEventInfo) => {
        const points = pointsRef.current;
        if (points.length === 0) return;

        if (cursorLineRef.current)    { canvas.remove(cursorLineRef.current);    cursorLineRef.current    = null; }
        if (snapIndicatorRef.current) { canvas.remove(snapIndicatorRef.current); snapIndicatorRef.current = null; }

        const last = points[points.length - 1];
        const line = new Line([last.x, last.y, scenePoint.x, scenePoint.y], {
          stroke:          '#84cc16',
          strokeWidth:     1.5,
          strokeDashArray: [4, 4],
          selectable:      false,
          evented:         false,
        });
        canvas.add(line);
        cursorLineRef.current = line;

        // Snap-to-first-point indicator.
        if (points.length >= 3) {
          const first = points[0];
          if (Math.hypot(scenePoint.x - first.x, scenePoint.y - first.y) < SNAP_DIST) {
            const snap = new Circle({
              left:        first.x - 9,
              top:         first.y - 9,
              radius:      9,
              fill:        'rgba(132,204,22,0.2)',
              stroke:      '#84cc16',
              strokeWidth: 2,
              selectable:  false,
              evented:     false,
            });
            canvas.add(snap);
            snapIndicatorRef.current = snap;
          }
        }

        canvas.requestRenderAll();
      };

      canvas.on('mouse:down', onMouseDown);
      canvas.on('mouse:move', onMouseMove);
      removeListeners = () => {
        canvas.off('mouse:down', onMouseDown);
        canvas.off('mouse:move', onMouseMove);
      };
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cleanupPreviews();
        pointsRef.current = [];
        setPolygonPointCount(0);
        setPolygonDrawingMode(false);
        setActiveTool('select');
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      cancelled = true;
      canvas.isDrawingMode  = false;
      canvas.selection      = false;
      canvas.skipTargetFind = false;
      canvas.defaultCursor  = 'default';
      document.removeEventListener('keydown', onKeyDown);
      removeListeners?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [polygonDrawingMode, canvasReady]);

  return { polygonDrawingMode, polygonPointCount, lockPolygon };
}
