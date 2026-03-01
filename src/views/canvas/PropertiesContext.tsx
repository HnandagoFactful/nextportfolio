/**
 * PropertiesContext
 *
 * Sub-context scoped to the canvas editor that carries all object-property
 * state and every operation that modifies it. Consuming components
 * (PropertiesPanel and its section sub-components) read from this context
 * directly, eliminating the prop-drilling chain:
 *   CanvasViewer → RightPanel → PropertiesPanel → [section components]
 *
 * Sections that only need one or two values still benefit because they
 * subscribe to a single, focused context instead of a sprawling prop list.
 *
 * The context value is memoised in CanvasViewer; it only changes when
 * properties or derived routing state (activeTool, selectedLayerType) change.
 */

import { createContext, use } from 'react';
import type {
  IObjectProperties,
  CanvasTool,
  ArrowAnimationType,
  RectBorderStyle,
  PatternRepeat,
} from '@/providers/CanvasProvider';

/** Shape of the value provided to PropertiesContext.Provider. */
export interface IPropertiesContext {
  // ── Core property state ───────────────────────────────────────────────────

  /** Current visual properties reflected in the panel. */
  properties: IObjectProperties;

  /**
   * Merge a partial patch into the properties state.
   * Used by live controls (sliders, pickers) for immediate preview.
   * Actual Fabric writes happen in `applyPropertiesToSelection`.
   */
  setProperties: (patch: Partial<IObjectProperties>) => void;

  /**
   * Write all panel properties to the currently active Fabric object(s).
   * Handles ActiveSelection children individually.
   */
  applyPropertiesToSelection: () => Promise<void>;

  // ── Text-on-path ──────────────────────────────────────────────────────────

  /** canvasId of the path object currently assigned to the selected text, or null. */
  textPathId: string | null;

  /** Character offset (pixels along arc) for the text-on-path assignment. */
  textPathOffset: number;

  /** True while the user is in freehand path-drawing mode. */
  pathDrawingMode: boolean;

  /** Activate freehand path-drawing mode; captures the target text id first. */
  openPathDrawer: () => void;

  /**
   * Assign (pathId !== null) or remove (pathId === null) a path from the
   * selected text object and update the character offset.
   */
  applyPathToText: (pathId: string | null, offset: number) => void;

  // ── Pattern fill ──────────────────────────────────────────────────────────

  /**
   * Load an image file and apply it as a tiled Pattern fill to the selected
   * text object using an offscreen canvas source.
   */
  applyPatternFill: (file: File) => Promise<void>;

  /** Update the CSS repeat mode without re-uploading the image. */
  updatePatternRepeat: (repeat: PatternRepeat) => void;

  /** Re-render the cached source image at a new scale factor. */
  updatePatternScale: (scale: number) => void;

  /** Clear the Pattern fill and restore the plain colour fill. */
  removePatternFill: () => void;

  // ── Instant-apply operations ──────────────────────────────────────────────

  /**
   * Set the animation mode on the selected arrow.
   * Writes directly to the Fabric object; no "Apply" button needed.
   */
  applyArrowAnimation: (type: ArrowAnimationType) => void;

  /**
   * Set the border dash style on the selected rect.
   * Writes directly to the Fabric object; no "Apply" button needed.
   */
  applyRectBorderStyle: (style: RectBorderStyle) => void;

  /**
   * Write scale / skew transform values directly to the selected object.
   * Only the keys present in `patch` are updated.
   */
  applyTransform: (
    patch: Partial<Pick<IObjectProperties, 'scaleX' | 'scaleY' | 'skewX' | 'skewY'>>,
  ) => void;

  // ── Routing helpers ───────────────────────────────────────────────────────

  /** The currently active drawing / selection tool. Used to show/hide sections. */
  activeTool: CanvasTool;

  /**
   * Fabric type string of the currently selected layer (e.g. 'i-text', 'rect',
   * 'arrow'). Undefined when nothing is selected. Used by sections to gate
   * their own visibility.
   */
  selectedLayerType: string | undefined;
}

// ── Default (no-op) context value ─────────────────────────────────────────────
const noop = () => {};
const noopAsync = async () => {};

const DEFAULT: IPropertiesContext = {
  properties: {
    fillColor:       '#4CAF50',
    strokeColor:     '#84cc16',
    strokeWidth:     2,
    opacity:         1,
    shadow:          { color: '#000000', blur: 0, offsetX: 0, offsetY: 0 },
    brushColor:      '#84cc16',
    brushWidth:      4,
    fontSize:        20,
    fontFamily:      'Arial',
    fontWeight:      'normal',
    fontStyle:       'normal',
    arrowAnimation:  'none',
    rectBorderStyle: 'solid',
    scaleX:          1,
    scaleY:          1,
    skewX:           0,
    skewY:           0,
    hasFillPattern:  false,
    patternRepeat:   'repeat',
    patternScale:    1,
  },
  setProperties:              noop,
  applyPropertiesToSelection: noopAsync,
  textPathId:                 null,
  textPathOffset:             0,
  pathDrawingMode:            false,
  openPathDrawer:             noop,
  applyPathToText:            noop,
  applyPatternFill:           noopAsync,
  updatePatternRepeat:        noop,
  updatePatternScale:         noop,
  removePatternFill:          noop,
  applyArrowAnimation:        noop,
  applyRectBorderStyle:       noop,
  applyTransform:             noop,
  activeTool:                 'select',
  selectedLayerType:          undefined,
};

/** The React context object. Use `PropertiesContext.Provider` in CanvasViewer. */
const PropertiesContext = createContext<IPropertiesContext>(DEFAULT);

export default PropertiesContext;

/**
 * Convenience hook for consuming PropertiesContext in function components.
 * Must be called inside a `<PropertiesContext.Provider>` tree.
 */
export function usePropertiesContext(): IPropertiesContext {
  return use(PropertiesContext);
}
