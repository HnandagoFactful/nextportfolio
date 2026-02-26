'use client';

import { use, useRef, useState, useCallback, useEffect } from "react";
import { Card } from "@radix-ui/themes";
import { Responsive, WidthProvider } from "react-grid-layout";
import Alert from "@/components/globals/Alert";
import CanvasProvider, {
  CanvasTool,
  ICanvasLayer,
  IObjectProperties,
} from "@/providers/CanvasProvider";
import { TranslationProvider } from "@/providers/TranslationProvider";
import { canvasViewerLayout } from "./layouts";
import CanvasStage from "./CanvasStage";
import CanvasToolbar from "./CanvasToolbar";
import RightPanel from "./RightPanel";
import PathDrawerDialog from "./PathDrawerDialog";
import { useCanvasInit } from "./hooks/useCanvasInit";
import { useCanvasEvents } from "./hooks/useCanvasEvents";
import { useVideoLoop } from "./hooks/useVideoLoop";
import type { Canvas as FabricCanvas, FabricObject, TPointerEventInfo } from "fabric";

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const DEFAULT_PROPERTIES: IObjectProperties = {
  fillColor: '#4CAF50',
  strokeColor: '#84cc16',
  strokeWidth: 2,
  opacity: 1,
  shadow: { color: '#000000', blur: 0, offsetX: 0, offsetY: 0 },
  brushColor: '#84cc16',
  brushWidth: 4,
};

// Assigns a stable unique id to a fabric object
function assignId(obj: FabricObject) {
  if (!(obj as FabricObject & { canvasId?: string }).canvasId) {
    (obj as FabricObject & { canvasId: string }).canvasId = crypto.randomUUID();
  }
}

export default function CanvasViewer() {
  use(TranslationProvider); // keep translation context alive

  const canvasRef = useRef<FabricCanvas | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);

  // Hidden file inputs for image/video upload
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTool, setActiveTool] = useState<CanvasTool>('select');
  const [canvasReady, setCanvasReady] = useState(false);
  const [layers, setLayers] = useState<ICanvasLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [properties, setPropertiesState] = useState<IObjectProperties>(DEFAULT_PROPERTIES);
  const [videoObjects, setVideoObjects] = useState<Array<{ id: string; videoEl: HTMLVideoElement }>>([]);
  const [textPathId, setTextPathId] = useState<string | null>(null);
  const [textPathOffset, setTextPathOffset] = useState(0);
  const [pathDrawerOpen, setPathDrawerOpen] = useState(false);

  // ---- Canvas init ----
  useCanvasInit(containerRef, canvasElRef, (canvas) => {
    canvasRef.current = canvas;
    canvas.on('object:added', ({ target }) => {
      if (target) assignId(target);
    });
    setCanvasReady(true);
  });

  // ---- Canvas events ----
  useCanvasEvents(canvasRef, setLayers, setSelectedLayerId);

  // ---- Video loop ----
  useVideoLoop(videoObjects, canvasRef);

  // ---- Tool mode effect ----
  // Depends on canvasReady so it re-runs once the async canvas init completes.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Reset canvas state (listeners cleared by previous cleanup)
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
    // Storing as mutable refs inside the closure avoids stale captures.
    let cancelledImport = false;
    let cleanupListeners: (() => void) | null = null;

    // Import fabric once — synchronous classes available inside .then so
    // onMouseMove is a plain function with no async race condition.
    import('fabric').then(({ PencilBrush, IText, Rect, Ellipse, Triangle, Line }) => {
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
            fontSize: 20,
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

      // Drag-to-draw tools (rect, circle, triangle, line)
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

      // Synchronous — no await, no race condition
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTool, canvasReady]);

  // ---- Brush property sync ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || activeTool !== 'pencil' || !canvas.freeDrawingBrush) return;
    canvas.freeDrawingBrush.color = properties.brushColor;
    (canvas.freeDrawingBrush as { width: number }).width = properties.brushWidth;
  }, [properties.brushColor, properties.brushWidth, activeTool]);

  // ---- Auto-populate properties from selected layer ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedLayerId) { setTextPathId(null); setTextPathOffset(0); return; }
    const obj = canvas.getObjects().find(
      (o) => (o as FabricObject & { canvasId?: string }).canvasId === selectedLayerId
    );
    if (!obj) { setTextPathId(null); setTextPathOffset(0); return; }

    const s = obj.shadow as (Record<string, unknown> | null);
    setPropertiesState((prev) => ({
      ...prev,
      fillColor:   typeof obj.fill   === 'string' ? obj.fill   : prev.fillColor,
      strokeColor: typeof obj.stroke === 'string' ? obj.stroke : prev.strokeColor,
      strokeWidth: obj.strokeWidth ?? prev.strokeWidth,
      opacity:     obj.opacity     ?? prev.opacity,
      shadow: s ? {
        color:   (s.color   as string)  || prev.shadow.color,
        blur:    (s.blur    as number)  ?? prev.shadow.blur,
        offsetX: (s.offsetX as number)  ?? prev.shadow.offsetX,
        offsetY: (s.offsetY as number)  ?? prev.shadow.offsetY,
      } : { color: '#000000', blur: 0, offsetX: 0, offsetY: 0 },
    }));

    // Read text-on-path assignment
    type SelTextLike = FabricObject & { path?: unknown; pathStartOffset?: number };
    const tobj = obj as SelTextLike;
    if (tobj.path) {
      // Is the path a canvas-level object we can identify by canvasId?
      const matched = canvas.getObjects().find(o => o === tobj.path);
      if (matched) {
        setTextPathId((matched as FabricObject & { canvasId?: string }).canvasId ?? '__drawn__');
      } else {
        // In-memory path drawn via the dialog
        setTextPathId('__drawn__');
      }
      setTextPathOffset(tobj.pathStartOffset ?? 0);
    } else {
      setTextPathId(null);
      setTextPathOffset(0);
    }
  }, [selectedLayerId]);

  // ---- Text on path ----
  type TextLike = { path?: unknown; pathStartOffset?: number; setCoords?(): void };

  const applyPathToText = useCallback((pathId: string | null, offset: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedLayerId) return;
    const textObj = canvas.getObjects().find(
      (o) => (o as FabricObject & { canvasId?: string }).canvasId === selectedLayerId
    ) as unknown as TextLike | undefined;
    if (!textObj) return;

    if (pathId === null) {
      // Clear drawn or canvas-object path
      textObj.path = undefined;
      textObj.pathStartOffset = 0;
      setTextPathId(null);
      setTextPathOffset(0);
    } else if (pathId === '__drawn__') {
      // Drawn in-memory path — just update offset on the already-assigned path
      textObj.pathStartOffset = offset;
      setTextPathOffset(offset);
    } else {
      const pathObj = canvas.getObjects().find(
        (o) => (o as FabricObject & { canvasId?: string }).canvasId === pathId
      );
      if (!pathObj) return;
      textObj.path = pathObj;
      textObj.pathStartOffset = offset;
      setTextPathId(pathId);
      setTextPathOffset(offset);
    }
    textObj.setCoords?.();
    canvas.requestRenderAll();
  }, [selectedLayerId]);

  // Apply a hand-drawn path (from PathDrawerDialog) to the selected text object.
  // The path is kept in memory only — not added to the canvas layers.
  // Font size is auto-calculated from path length (matches the Fabric.js demo formula).
  const applyDrawnPath = useCallback(async (pathCommands: unknown[][], pathLength: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedLayerId) return;
    const textObj = canvas.getObjects().find(
      (o) => (o as FabricObject & { canvasId?: string }).canvasId === selectedLayerId
    ) as unknown as TextLike & { text?: string; fontSize?: number; set(opts: Record<string, unknown>): void } | undefined;
    if (!textObj) return;

    const { Path } = await import('fabric');
    // In-memory guide path — not added to canvas so it won't appear in layers
    const guidePath = new Path(pathCommands as unknown as string, {
      fill: '',
      stroke: 'transparent',
    });

    textObj.path = guidePath;
    textObj.pathStartOffset = 0;

    // Auto-size: 2.5 × pathLength ÷ char count (same formula as the official demo)
    const charCount = (textObj.text?.length ?? 1) || 1;
    const autoFontSize = Math.round((2.5 * pathLength) / charCount);
    if (autoFontSize > 0) textObj.set({ fontSize: autoFontSize });

    textObj.setCoords?.();
    setTextPathId('__drawn__');
    setTextPathOffset(0);
    canvas.requestRenderAll();
  }, [selectedLayerId]);

  // ---- Helpers ----
  const setProperties = useCallback((patch: Partial<IObjectProperties>) => {
    setPropertiesState(prev => ({ ...prev, ...patch }));
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
    // For a single object or Group, apply directly.
    // Use .type check instead of instanceof — dynamic imports don't satisfy
    // TypeScript's instanceof type narrowing reliably.
    const targets: FabricObject[] =
      active.type === 'activeSelection'
        ? (active as unknown as { getObjects(): FabricObject[] }).getObjects()
        : [active];

    targets.forEach((obj) => {
      obj.set({
        fill:        properties.fillColor,
        stroke:      properties.strokeColor,
        strokeWidth: properties.strokeWidth,
        opacity:     properties.opacity,
        shadow,
      });
    });
    canvas.requestRenderAll();
  }, [properties]);

  const selectLayerById = useCallback((id: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const obj = canvas.getObjects().find(
      (o) => (o as FabricObject & { canvasId?: string }).canvasId === id
    );
    if (obj) {
      canvas.setActiveObject(obj);
      canvas.requestRenderAll();
    }
  }, []);

  const addVideoObject = useCallback((id: string, videoEl: HTMLVideoElement) => {
    setVideoObjects(prev => [...prev, { id, videoEl }]);
  }, []);

  const removeVideoObject = useCallback((id: string) => {
    setVideoObjects(prev => {
      const entry = prev.find(v => v.id === id);
      if (entry) {
        entry.videoEl.pause();
        const src = entry.videoEl.src;
        if (src.startsWith('blob:')) URL.revokeObjectURL(src);
      }
      return prev.filter(v => v.id !== id);
    });
  }, []);

  const removeLayerById = useCallback((id: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const obj = canvas.getObjects().find(
      (o) => (o as FabricObject & { canvasId?: string }).canvasId === id
    );
    if (!obj) return;
    if (canvas.getActiveObject() === obj) canvas.discardActiveObject();
    canvas.remove(obj);
    canvas.requestRenderAll();
    removeVideoObject(id);
  }, [removeVideoObject]);

  const renameLayerById = useCallback((id: string, label: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const obj = canvas.getObjects().find(
      (o) => (o as FabricObject & { canvasId?: string }).canvasId === id
    );
    if (!obj) return;
    (obj as FabricObject & { canvasLabel?: string }).canvasLabel = label.trim() || undefined;
    // Re-sync layers so the new label reflects immediately
    setLayers(
      canvas.getObjects().map((o, index) => {
        const lo = o as FabricObject & { canvasId?: string; canvasLabel?: string };
        const typeMap: Record<string, string> = {
          rect: 'Rectangle', circle: 'Circle', ellipse: 'Ellipse', triangle: 'Triangle',
          line: 'Line', 'i-text': 'Text', path: 'Path', image: 'Image', group: 'Group',
        };
        const fallback = `${typeMap[o.type ?? ''] ?? (o.type ?? 'Object')} ${index + 1}`;
        return {
          id: lo.canvasId ?? String(index),
          type: o.type ?? 'object',
          label: lo.canvasLabel ?? fallback,
        };
      })
    );
  }, []);

  const reorderLayerById = useCallback((id: string, direction: 'up' | 'down') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const obj = canvas.getObjects().find(
      (o) => (o as FabricObject & { canvasId?: string }).canvasId === id
    );
    if (!obj) return;
    if (direction === 'up') {
      canvas.bringObjectForward(obj);
    } else {
      canvas.sendObjectBackwards(obj);
    }
    canvas.requestRenderAll();
    // bringObjectForward/sendObjectBackwards don't fire object:modified,
    // so sync the layers list manually to reflect the new z-order.
    const typeMap: Record<string, string> = {
      rect: 'Rectangle', circle: 'Circle', ellipse: 'Ellipse', triangle: 'Triangle',
      line: 'Line', 'i-text': 'Text', path: 'Path', image: 'Image', group: 'Group',
    };
    setLayers(
      canvas.getObjects().map((o, index) => {
        const lo = o as FabricObject & { canvasId?: string; canvasLabel?: string };
        const fallback = `${typeMap[o.type ?? ''] ?? (o.type ?? 'Object')} ${index + 1}`;
        return {
          id: lo.canvasId ?? String(index),
          type: o.type ?? 'object',
          label: lo.canvasLabel ?? fallback,
        };
      })
    );
  }, []);

  // Sync checkbox selection → Fabric ActiveSelection so checked objects
  // can be moved together before a permanent Group is committed.
  const handleCheckLayers = useCallback(async (ids: string[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (ids.length === 0) {
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      return;
    }

    const objects = ids
      .map((id) => canvas.getObjects().find((o) => (o as FabricObject & { canvasId?: string }).canvasId === id))
      .filter(Boolean) as FabricObject[];

    if (objects.length === 1) {
      canvas.setActiveObject(objects[0]);
    } else {
      const { ActiveSelection } = await import('fabric');
      const selection = new ActiveSelection(objects, { canvas });
      canvas.setActiveObject(selection);
    }
    canvas.requestRenderAll();
  }, []);

  // Convert the checked ActiveSelection into a permanent fabric.Group.
  const handleGroupChecked = useCallback(async (ids: string[]) => {
    const canvas = canvasRef.current;
    if (!canvas || ids.length < 2) return;

    const objects = ids
      .map((id) => canvas.getObjects().find((o) => (o as FabricObject & { canvasId?: string }).canvasId === id))
      .filter(Boolean) as FabricObject[];

    if (objects.length < 2) return;

    const { Group } = await import('fabric');
    canvas.discardActiveObject();
    objects.forEach((obj) => canvas.remove(obj));
    const group = new Group(objects);
    assignId(group);
    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.requestRenderAll();
  }, []);

  // ---- Image upload handler ----
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvasRef.current) return;
    const url = URL.createObjectURL(file);
    import('fabric').then(({ FabricImage }) => {
      FabricImage.fromURL(url).then((img) => {
        assignId(img);
        canvasRef.current?.add(img);
        canvasRef.current?.requestRenderAll();
        URL.revokeObjectURL(url);
      });
    });
    e.target.value = '';
  }, []);

  // ---- Video upload handler ----
  const handleVideoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvasRef.current) return;
    const url = URL.createObjectURL(file);
    const videoEl = document.createElement('video');
    videoEl.src = url;
    videoEl.loop = true;
    videoEl.muted = true;
    videoEl.autoplay = true;
    videoEl.playsInline = true;

    videoEl.addEventListener('loadeddata', () => {
      videoEl.play();
      import('fabric').then(({ FabricImage }) => {
        const fabricVideo = new FabricImage(videoEl as unknown as HTMLImageElement, {
          left: 50,
          top: 50,
          width: videoEl.videoWidth || 320,
          height: videoEl.videoHeight || 240,
        });
        assignId(fabricVideo);
        canvasRef.current?.add(fabricVideo);
        canvasRef.current?.requestRenderAll();
        const id = (fabricVideo as FabricObject & { canvasId?: string }).canvasId!;
        addVideoObject(id, videoEl);
      });
    }, { once: true });

    e.target.value = '';
  }, [addVideoObject]);

  return (
    <CanvasProvider.Provider value={{
      canvasRef,
      activeTool,
      setActiveTool,
      layers,
      selectedLayerId,
      selectLayerById,
      properties,
      setProperties,
      applyPropertiesToSelection,
      videoObjects,
      addVideoObject,
      removeVideoObject,
    }}>
      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        style={{ display: 'none' }}
        onChange={handleVideoUpload}
      />

      <Alert isTimer isWarningIcon />

      <PathDrawerDialog
        open={pathDrawerOpen}
        onClose={() => setPathDrawerOpen(false)}
        onApply={applyDrawnPath}
      />

      <ResponsiveGridLayout
        className="layout"
        isResizable
        resizeHandles={["e", "s", "se"]}
        rowHeight={50}
        style={{ width: "98%" }}
        useCSSTransforms
        margin={[12, 8]}
        layouts={canvasViewerLayout}
        breakpoints={{ lg: 1200, md: 980, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
      >
        <Card key="a" variant="surface" style={{ height: '100%', overflow: 'hidden' }}>
          <CanvasToolbar />
        </Card>
        <Card key="b" variant="surface" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CanvasStage containerRef={containerRef} canvasElRef={canvasElRef} />
        </Card>
        <Card key="c" variant="surface" style={{ height: '100%', overflow: 'hidden' }}>
          <RightPanel
            layers={layers}
            selectedLayerId={selectedLayerId}
            properties={properties}
            activeTool={activeTool}
            onSelectLayer={selectLayerById}
            onRemoveLayer={removeLayerById}
            onReorderLayer={reorderLayerById}
            onCheckLayers={handleCheckLayers}
            onGroupChecked={handleGroupChecked}
            onRenameLayer={renameLayerById}
            onPropertyChange={setProperties}
            onApply={applyPropertiesToSelection}
            textPathId={textPathId}
            textPathOffset={textPathOffset}
            onApplyTextOnPath={applyPathToText}
            onOpenPathDrawer={() => setPathDrawerOpen(true)}
          />
        </Card>
      </ResponsiveGridLayout>
    </CanvasProvider.Provider>
  );
}
