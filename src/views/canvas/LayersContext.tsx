/**
 * LayersContext
 *
 * Sub-context scoped to the canvas editor that carries the layer list and
 * all layer-management operations. Consuming components (LayersPanel) read
 * from this context instead of receiving the same data as props, eliminating
 * the prop-drilling chain:
 *   CanvasViewer → RightPanel → LayersPanel
 *
 * The context value is memoised in CanvasViewer so consumers only re-render
 * when layers or selectedLayerId actually change.
 */

import { createContext, use } from 'react';
import type { ICanvasLayer } from '@/providers/CanvasProvider';

/** Shape of the value provided to the LayersContext.Provider. */
export interface ILayersContext {
  /** Ordered list of canvas objects (index 0 = bottom of the stack). */
  layers: ICanvasLayer[];

  /** canvasId of the currently active (single-selected) Fabric object, or null. */
  selectedLayerId: string | null;

  /** Make the object with `id` the active Fabric selection. */
  selectLayerById: (id: string) => void;

  /** Remove the object with `id` from the canvas (also tears down its video loop). */
  removeLayerById: (id: string) => void;

  /** Update the display label of an object without removing and re-adding it. */
  renameLayerById: (id: string, label: string) => void;

  /** Move the object one step forward ('up') or backward ('down') in the z-order. */
  reorderLayerById: (id: string, direction: 'up' | 'down') => void;

  /**
   * Build a temporary Fabric ActiveSelection from the supplied canvasIds so
   * the user can move the checked objects together.
   */
  handleCheckLayers: (ids: string[]) => void;

  /** Promote the checked objects into a permanent fabric.Group. */
  handleGroupChecked: (ids: string[]) => void;
}

const DEFAULT: ILayersContext = {
  layers: [],
  selectedLayerId: null,
  selectLayerById:   () => {},
  removeLayerById:   () => {},
  renameLayerById:   () => {},
  reorderLayerById:  () => {},
  handleCheckLayers: () => {},
  handleGroupChecked: () => {},
};

/** The React context object. Use `LayersContext.Provider` in CanvasViewer. */
const LayersContext = createContext<ILayersContext>(DEFAULT);

export default LayersContext;

/**
 * Convenience hook for consuming LayersContext in function components.
 * Must be called inside a `<LayersContext.Provider>` tree.
 */
export function useLayersContext(): ILayersContext {
  return use(LayersContext);
}
