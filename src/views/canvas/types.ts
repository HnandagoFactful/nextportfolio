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
  onRemoveLayer: (id: string) => void;
  onReorderLayer: (id: string, direction: 'up' | 'down') => void;
  onCheckLayers: (ids: string[]) => void;
  onGroupChecked: (ids: string[]) => void;
  onRenameLayer: (id: string, label: string) => void;
}

export interface IPropertiesPanel {
  properties: IObjectProperties;
  activeTool: CanvasTool;
  layers: ICanvasLayer[];
  selectedLayerId: string | null;
  textPathId: string | null;
  textPathOffset: number;
  onPropertyChange: (patch: Partial<IObjectProperties>) => void;
  onApply: () => void;
  onApplyTextOnPath: (pathId: string | null, offset: number) => void;
  onOpenPathDrawer: () => void;
}

export interface IRightPanel {
  layers: ICanvasLayer[];
  selectedLayerId: string | null;
  properties: IObjectProperties;
  activeTool: CanvasTool;
  onSelectLayer: (id: string) => void;
  onRemoveLayer: (id: string) => void;
  onReorderLayer: (id: string, direction: 'up' | 'down') => void;
  onCheckLayers: (ids: string[]) => void;
  onGroupChecked: (ids: string[]) => void;
  onRenameLayer: (id: string, label: string) => void;
  onPropertyChange: (patch: Partial<IObjectProperties>) => void;
  onApply: () => void;
  textPathId: string | null;
  textPathOffset: number;
  onApplyTextOnPath: (pathId: string | null, offset: number) => void;
  onOpenPathDrawer: () => void;
}
