import { createContext, RefObject } from "react";
import type { Canvas as FabricCanvas } from "fabric";

export type CanvasTool =
  | 'select'
  | 'rect'
  | 'circle'
  | 'triangle'
  | 'line'
  | 'text'
  | 'pencil'
  | 'image'
  | 'video';

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
  },
  setProperties: () => {},
  applyPropertiesToSelection: () => {},
  videoObjects: [],
  addVideoObject: () => {},
  removeVideoObject: () => {},
});

export default CanvasProvider;
