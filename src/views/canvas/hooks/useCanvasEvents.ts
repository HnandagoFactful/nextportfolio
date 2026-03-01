import { useEffect, RefObject } from "react";
import type { Canvas as FabricCanvas } from "fabric";
import type { ICanvasLayer } from "@/providers/CanvasProvider";
import { buildLayerList, LabelledObject } from "../canvasUtils";

export function useCanvasEvents(
  canvasRef: RefObject<FabricCanvas | null>,
  setLayers: (layers: ICanvasLayer[]) => void,
  setSelectedLayerId: (id: string | null) => void,
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const syncLayers = () => {
      setLayers(buildLayerList(canvas.getObjects()));
    };

    const onSelectionChange = () => {
      const active = canvas.getActiveObject();
      setSelectedLayerId(
        active ? ((active as LabelledObject).canvasId ?? null) : null,
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
