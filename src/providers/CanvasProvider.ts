import { createContext, RefObject } from "react";
import type { Canvas as FabricCanvas } from "fabric";

export type CanvasTool =
  | 'select'
  | 'rect'
  | 'circle'
  | 'triangle'
  | 'line'
  | 'arrow'
  | 'text'
  | 'pencil'
  | 'image'
  | 'video';

export type ArrowAnimationType = 'none' | 'dash';
export type RectBorderStyle   = 'solid' | 'dashed' | 'animated-dashed';
export type PatternRepeat     = 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';

export interface IShadowConfig {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export interface IObjectProperties {
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
  shadow: IShadowConfig;
  brushColor: string;
  brushWidth: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  arrowAnimation: ArrowAnimationType;
  rectBorderStyle: RectBorderStyle;
  scaleX: number;
  scaleY: number;
  skewX: number;
  skewY: number;
  /** True when the selected text object's fill is a Fabric Pattern (not a colour string). */
  hasFillPattern: boolean;
  patternRepeat: PatternRepeat;
  patternScale: number;
}

export interface ICanvasLayer {
  id: string;
  type: string;
  label: string;
}

export interface ICanvasProvider {
  canvasRef: RefObject<FabricCanvas | null>;
  activeTool: CanvasTool;
  setActiveTool: (tool: CanvasTool) => void;
  layers: ICanvasLayer[];
  selectedLayerId: string | null;
  selectLayerById: (id: string) => void;
  properties: IObjectProperties;
  setProperties: (patch: Partial<IObjectProperties>) => void;
  applyPropertiesToSelection: () => void;
  videoObjects: Array<{ id: string; videoEl: HTMLVideoElement }>;
  addVideoObject: (id: string, videoEl: HTMLVideoElement) => void;
  removeVideoObject: (id: string) => void;
  /** Canvas-level background colour (not an object property). */
  canvasBackground: string;
  setCanvasBackground: (color: string) => void;
  /** Undo / redo. */
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const CanvasProvider = createContext<ICanvasProvider>({
  canvasRef: { current: null },
  activeTool: 'select',
  setActiveTool: () => {},
  layers: [],
  selectedLayerId: null,
  selectLayerById: () => {},
  properties: {
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
  },
  setProperties: () => {},
  applyPropertiesToSelection: () => {},
  videoObjects: [],
  addVideoObject: () => {},
  removeVideoObject: () => {},
  canvasBackground: '#ffffff',
  setCanvasBackground: () => {},
  undo: () => {},
  redo: () => {},
  canUndo: false,
  canRedo: false,
});

export default CanvasProvider;
