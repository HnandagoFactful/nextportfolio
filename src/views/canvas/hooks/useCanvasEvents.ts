import { useEffect, RefObject } from "react";
import type { Canvas as FabricCanvas, FabricObject } from "fabric";
import type { ICanvasLayer } from "@/providers/CanvasProvider";

function buildLabel(type: string | undefined, index: number): string {
  const typeMap: Record<string, string> = {
    rect: 'Rectangle',
    circle: 'Circle',
    ellipse: 'Ellipse',
    triangle: 'Triangle',
    line: 'Line',
    'i-text': 'Text',
    path: 'Path',
    image: 'Image',
    group: 'Group',
  };
  const name = typeMap[type ?? ''] ?? (type ?? 'Object');
  return `${name} ${index + 1}`;
}

export function useCanvasEvents(
  canvasRef: RefObject<FabricCanvas | null>,
  setLayers: (layers: ICanvasLayer[]) => void,
  setSelectedLayerId: (id: string | null) => void,
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const syncLayers = () => {
      const objects = canvas.getObjects();
      setLayers(
        objects.map((obj, index) => ({
          id: (obj as FabricObject & { canvasId?: string }).canvasId ?? String(index),
          type: obj.type ?? 'object',
          label: buildLabel(obj.type, index),
        }))
      );
    };

    const onSelectionChange = () => {
      const active = canvas.getActiveObject();
      setSelectedLayerId(
        active ? ((active as FabricObject & { canvasId?: string }).canvasId ?? null) : null
      );
    };

    canvas.on('object:added', syncLayers);
    canvas.on('object:removed', syncLayers);
    canvas.on('object:modified', syncLayers);
    canvas.on('selection:created', onSelectionChange);
    canvas.on('selection:updated', onSelectionChange);
    canvas.on('selection:cleared', () => setSelectedLayerId(null));

    return () => {
      canvas.off('object:added', syncLayers);
      canvas.off('object:removed', syncLayers);
      canvas.off('object:modified', syncLayers);
      canvas.off('selection:created', onSelectionChange);
      canvas.off('selection:updated', onSelectionChange);
      canvas.off('selection:cleared');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef.current]);
}
