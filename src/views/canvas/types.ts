import { RefObject } from "react";
import type { ICanvasLayer, IObjectProperties, CanvasTool } from "@/providers/CanvasProvider";

export interface ICanvasToolbar {
  activeTool: CanvasTool;
  onToolSelect: (tool: CanvasTool) => void;
}

export interface ICanvasStage {
  containerRef: RefObject<HTMLDivElement | null>;
  canvasElRef: RefObject<HTMLCanvasElement | null>;
}

export interface ILayersPanel {
  layers: ICanvasLayer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string) => void;
}

export interface IPropertiesPanel {
  properties: IObjectProperties;
  activeTool: CanvasTool;
  onPropertyChange: (patch: Partial<IObjectProperties>) => void;
  onApply: () => void;
}

export interface IRightPanel {
  layers: ICanvasLayer[];
  selectedLayerId: string | null;
  properties: IObjectProperties;
  activeTool: CanvasTool;
  onSelectLayer: (id: string) => void;
  onPropertyChange: (patch: Partial<IObjectProperties>) => void;
  onApply: () => void;
}
