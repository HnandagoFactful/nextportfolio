'use client';

/**
 * CanvasViewer
 *
 * Root orchestrator for the canvas editor. Its responsibilities are:
 *
 *  1. Initialise the Fabric canvas and wire up all domain hooks.
 *  2. Manage the two pieces of routing state that hooks share:
 *       - `layers` / `selectedLayerId` (owned here, read by multiple hooks)
 *       - `activeTool`                 (owned here, read by toolbar + toolMode)
 *  3. Provide two sub-contexts so child panels can read data without
 *     prop-drilling through RightPanel:
 *       - LayersContext    → consumed by LayersPanel
 *       - PropertiesContext → consumed by PropertiesPanel and its sections
 *  4. Render the responsive grid layout (toolbar | canvas | right panel).
 *
 * Stable-ref pattern
 *   `selectedLayerIdRef` and `propertiesRef` are kept in sync with their
 *   corresponding state values via effects. Hooks that need these values
 *   inside memoised callbacks (usePatternFill, useInstantApply) accept the
 *   refs instead of the raw state to avoid listing them as useCallback deps,
 *   which would recreate the callbacks on every selection change.
 */

import { use, useRef, useState, useEffect, useMemo } from 'react';
import { Card } from '@radix-ui/themes';
import { Responsive, WidthProvider } from 'react-grid-layout';
import Alert from '@/components/globals/Alert';
import CanvasProvider, { CanvasTool, ICanvasLayer } from '@/providers/CanvasProvider';
import { TranslationProvider } from '@/providers/TranslationProvider';
import { canvasViewerLayout } from './layouts';
import CanvasStage    from './CanvasStage';
import CanvasToolbar  from './CanvasToolbar';
import RightPanel     from './RightPanel';
import LayersContext  from './LayersContext';
import PropertiesContext from './PropertiesContext';
import { useCanvasInit }        from './hooks/useCanvasInit';
import { useCanvasEvents }      from './hooks/useCanvasEvents';
import { useVideoLoop }         from './hooks/useVideoLoop';
import { useMediaUpload }       from './hooks/useMediaUpload';
import { useLayers }            from './hooks/useLayers';
import { useProperties, DEFAULT_PROPERTIES } from './hooks/useProperties';
import { useTextOnPath }        from './hooks/useTextOnPath';
import { useToolMode }          from './hooks/useToolMode';
import { useArrowConnections }  from './hooks/useArrowConnections';
import { useCanvasAnimations }  from './hooks/useCanvasAnimations';
import { useUndoRedo }          from './hooks/useUndoRedo';
import { usePatternFill }       from './hooks/usePatternFill';
import { useInstantApply }      from './hooks/useInstantApply';
import { assignId }             from './canvasUtils';
import type { Canvas as FabricCanvas } from 'fabric';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const DEFAULT_BG = '#2e342d'
const ResponsiveGridLayout = WidthProvider(Responsive);

export default function CanvasViewer() {
  use(TranslationProvider); // keep translation context alive

  // ── Canvas DOM refs ───────────────────────────────────────────────────────
  const canvasRef    = useRef<FabricCanvas | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasElRef  = useRef<HTMLCanvasElement | null>(null);

  // ── Core state ────────────────────────────────────────────────────────────
  const [canvasReady,      setCanvasReady]      = useState(false);
  const [layers,           setLayers]           = useState<ICanvasLayer[]>([]);
  const [selectedLayerId,  setSelectedLayerId]  = useState<string | null>(null);
  const [activeTool,       setActiveTool]       = useState<CanvasTool>('select');
  const [canvasBackground, setCanvasBackground] = useState<string>(DEFAULT_BG);

  // ── Stable refs for hook callbacks ────────────────────────────────────────
  // usePatternFill and useInstantApply use these refs inside useCallback so
  // their returned functions stay referentially stable across state changes.

  /** Always holds the latest selectedLayerId without triggering dep changes. */
  const selectedLayerIdRef = useRef<string | null>(null);
  useEffect(() => { selectedLayerIdRef.current = selectedLayerId; }, [selectedLayerId]);

  /** Always holds the latest properties without triggering dep changes. */
  const propertiesRef = useRef(DEFAULT_PROPERTIES);

  // ── Canvas init + event sync ──────────────────────────────────────────────
  useCanvasInit(containerRef, canvasElRef, (canvas) => {
    canvasRef.current = canvas;
    // Set background before canvasReady so the first undo snapshot is correct.
    canvas.backgroundColor = DEFAULT_BG;
    canvas.on('object:added', ({ target }) => { if (target) assignId(target); });
    setCanvasReady(true);
  });
  useCanvasEvents(canvasRef, setLayers, setSelectedLayerId);

  // ── Media upload (image / video) ─────────────────────────────────────────
  const {
    imageInputRef, videoInputRef,
    videoObjects, addVideoObject, removeVideoObject,
    handleImageUpload, handleVideoUpload,
  } = useMediaUpload(canvasRef);
  useVideoLoop(videoObjects, canvasRef);

  // ── Layer operations ──────────────────────────────────────────────────────
  const {
    selectLayerById, removeLayerById, renameLayerById,
    reorderLayerById, handleCheckLayers, handleGroupChecked,
  } = useLayers(canvasRef, setLayers, removeVideoObject);

  // ── Properties state ──────────────────────────────────────────────────────
  const {
    properties,
    textPathId, textPathOffset,
    setTextPathId, setTextPathOffset,
    setProperties, applyPropertiesToSelection,
  } = useProperties(canvasRef, selectedLayerId);

  // Keep propertiesRef in sync for stable callbacks in usePatternFill.
  useEffect(() => { propertiesRef.current = properties; }, [properties]);

  // ── Pattern fill + instant-apply (stable callback hooks) ─────────────────
  // Destructured so individual function refs (all stable useCallback) can be
  // listed in the propertiesContextValue useMemo dependency array. Spreading
  // the hook return object into deps would create a new object reference every
  // render and negate the memoisation.
  const {
    applyPatternFill, updatePatternRepeat, updatePatternScale, removePatternFill,
  } = usePatternFill(canvasRef, selectedLayerIdRef, propertiesRef, setProperties);

  const {
    applyArrowAnimation, applyRectBorderStyle, applyTransform,
  } = useInstantApply(canvasRef, selectedLayerIdRef, setProperties);

  // ── Text-on-path ──────────────────────────────────────────────────────────
  const { pathDrawingMode, openPathDrawer, applyPathToText } = useTextOnPath({
    canvasRef,
    canvasReady,
    selectedLayerId,
    setActiveTool,
    setTextPathId,
    setTextPathOffset,
  });

  // ── Tool mode (must follow useTextOnPath so pathDrawingMode is available) ──
  useToolMode({
    canvasRef, canvasReady, activeTool, pathDrawingMode,
    properties, imageInputRef, videoInputRef, setActiveTool,
  });

  // ── Arrow connections + canvas animations ─────────────────────────────────
  useArrowConnections(canvasRef, canvasReady);
  useCanvasAnimations(canvasRef, canvasReady);

  // ── Undo / redo ───────────────────────────────────────────────────────────
  const { undo, redo, canUndo, canRedo, saveSnapshot } = useUndoRedo(
    canvasRef,
    canvasReady,
    // After each restore, sync the background colour React state so the
    // colour picker stays in sync with the restored canvas state.
    (canvas) => {
      const bg = canvas.backgroundColor;
      setCanvasBackground(typeof bg === 'string' ? (bg || DEFAULT_BG) : DEFAULT_BG);
    },
  );

  // ── Canvas background colour ──────────────────────────────────────────────
  // Skip the first run (canvas ready fires once) to avoid a double snapshot.
  const bgInitRef = useRef(false);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasReady) return;
    canvas.backgroundColor = canvasBackground;
    canvas.requestRenderAll();
    if (bgInitRef.current) {
      saveSnapshot(); // user explicitly changed the colour — record in history
    } else {
      bgInitRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasBackground, canvasReady]);

  // ── Keyboard shortcuts: Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z ───────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't intercept while a Fabric IText is being edited.
      const activeObj = canvasRef.current?.getActiveObject();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((activeObj as any)?.isEditing) return;
      // Don't intercept while a native form field has focus.
      const el = document.activeElement;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return;

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 'y' || (e.shiftKey && e.key === 'Z'))
      ) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  // ── Derived values for context ────────────────────────────────────────────
  /** Fabric type string of the currently selected object (e.g. 'i-text', 'rect'). */
  const selectedLayerType = layers.find((l) => l.id === selectedLayerId)?.type;

  // ── Sub-context values (memoised to prevent unnecessary re-renders) ───────

  const layersContextValue = useMemo(() => ({
    layers,
    selectedLayerId,
    selectLayerById,
    removeLayerById,
    renameLayerById,
    reorderLayerById,
    handleCheckLayers,
    handleGroupChecked,
  }), [
    layers, selectedLayerId,
    selectLayerById, removeLayerById, renameLayerById,
    reorderLayerById, handleCheckLayers, handleGroupChecked,
  ]);

  const propertiesContextValue = useMemo(() => ({
    properties, setProperties, applyPropertiesToSelection,
    textPathId, textPathOffset, pathDrawingMode, openPathDrawer, applyPathToText,
    applyPatternFill, updatePatternRepeat, updatePatternScale, removePatternFill,
    applyArrowAnimation, applyRectBorderStyle, applyTransform,
    activeTool,
    selectedLayerType,
  }), [
    properties, setProperties, applyPropertiesToSelection,
    textPathId, textPathOffset, pathDrawingMode, openPathDrawer, applyPathToText,
    applyPatternFill, updatePatternRepeat, updatePatternScale, removePatternFill,
    applyArrowAnimation, applyRectBorderStyle, applyTransform,
    activeTool, selectedLayerType,
  ]);

  // ─────────────────────────────────────────────────────────────────────────
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
      canvasBackground,
      setCanvasBackground,
      undo,
      redo,
      canUndo,
      canRedo,
    }}>
      <LayersContext.Provider value={layersContextValue}>
        <PropertiesContext.Provider value={propertiesContextValue}>

          {/* Hidden file inputs for image/video upload */}
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

          <ResponsiveGridLayout
            className="layout"
            isResizable
            resizeHandles={['e', 's', 'se']}
            rowHeight={50}
            style={{ width: '98%' }}
            useCSSTransforms
            margin={[12, 8]}
            layouts={canvasViewerLayout}
            breakpoints={{ lg: 1200, md: 980, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
          >
            {/* Toolbar */}
            <Card key="a" variant="surface" style={{ height: '100%', overflow: 'hidden' }}>
              <CanvasToolbar />
            </Card>

            {/* Canvas stage */}
            <Card
              key="b"
              variant="surface"
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
              }}
            >
              {/* Path-drawing mode overlay banner */}
              {pathDrawingMode && (
                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--lime-9)',
                    color: 'white',
                    padding: '5px 16px',
                    borderRadius: 20,
                    fontSize: 12,
                    zIndex: 10,
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                  }}
                >
                  Draw your path on the canvas · ESC to cancel
                </div>
              )}
              <CanvasStage containerRef={containerRef} canvasElRef={canvasElRef} />
            </Card>

            {/* Right panel — no props; reads from LayersContext + PropertiesContext */}
            <Card key="c" variant="surface" style={{ height: '100%', overflow: 'hidden' }}>
              <RightPanel />
            </Card>
          </ResponsiveGridLayout>

        </PropertiesContext.Provider>
      </LayersContext.Provider>
    </CanvasProvider.Provider>
  );
}
