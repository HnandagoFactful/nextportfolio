/**
 * types.ts
 *
 * Shared TypeScript interfaces for canvas components that still communicate
 * via props. Most data-passing between canvas components now flows through
 * LayersContext and PropertiesContext, so this file is intentionally small.
 *
 * Interfaces removed in this refactor (formerly prop-drilled):
 *  - ILayersPanel     → LayersPanel reads from LayersContext
 *  - IPropertiesPanel → PropertiesPanel reads from PropertiesContext
 *  - IRightPanel      → RightPanel has no props; panels read their contexts
 */

import { RefObject } from 'react';

/**
 * Props for CanvasStage — the thin wrapper around the raw <canvas> element.
 * These refs are created in CanvasViewer and passed directly to CanvasStage
 * (not through a context) since they are DOM refs, not application state.
 */
export interface ICanvasStage {
  /** Ref to the outer <div> wrapper used by the ResizeObserver in useCanvasInit. */
  containerRef: RefObject<HTMLDivElement | null>;
  /** Ref to the <canvas> element that Fabric attaches to. */
  canvasElRef: RefObject<HTMLCanvasElement | null>;
}
