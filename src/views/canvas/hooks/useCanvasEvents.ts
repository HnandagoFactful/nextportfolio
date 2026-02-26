import { useEffect, RefObject } from "react";
import type { Canvas as FabricCanvas, FabricObject } from "fabric";
import type { ICanvasLayer } from "@/providers/CanvasProvider";

type LabelledObject = FabricObject & { canvasId?: string; canvasLabel?: string };

function buildLabel(obj: LabelledObject, index: number): string {
  if (obj.canvasLabel) return obj.canvasLabel;
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
  const name = typeMap[obj.type ?? ''] ?? (obj.type ?? 'Object');
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
        objects.map((obj, index) => {
          const lo = obj as LabelledObject;
          return {
            id: lo.canvasId ?? String(index),
            type: obj.type ?? 'object',
            label: buildLabel(lo, index),
          };
        })
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
    const onSelectionCleared = () => setSelectedLayerId(null);
    canvas.on('selection:cleared', onSelectionCleared);

    return () => {
      canvas.off('object:added', syncLayers);
      canvas.off('object:removed', syncLayers);
      canvas.off('object:modified', syncLayers);
      canvas.off('selection:created', onSelectionChange);
      canvas.off('selection:updated', onSelectionChange);
      canvas.off('selection:cleared', onSelectionCleared);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef.current]);
}
