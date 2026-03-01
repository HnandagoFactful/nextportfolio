import { useCallback, RefObject } from "react";
import type { Canvas as FabricCanvas, FabricObject } from "fabric";
import type { ICanvasLayer } from "@/providers/CanvasProvider";
import { assignId, buildLayerList, findById } from "../canvasUtils";

interface UseLayersReturn {
  selectLayerById: (id: string) => void;
  removeLayerById: (id: string) => void;
  renameLayerById: (id: string, label: string) => void;
  reorderLayerById: (id: string, direction: 'up' | 'down') => void;
  handleCheckLayers: (ids: string[]) => Promise<void>;
  handleGroupChecked: (ids: string[]) => Promise<void>;
}

export function useLayers(
  canvasRef: RefObject<FabricCanvas | null>,
  setLayers: (layers: ICanvasLayer[]) => void,
  removeVideoObject: (id: string) => void,
): UseLayersReturn {
  const selectLayerById = useCallback((id: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const obj = findById(canvas, id);
    if (obj) {
      canvas.setActiveObject(obj);
      canvas.requestRenderAll();
    }
    // canvasRef is stable — intentionally omitted from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeLayerById = useCallback(
    (id: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const obj = findById(canvas, id);
      if (!obj) return;
      if (canvas.getActiveObject() === obj) canvas.discardActiveObject();
      canvas.remove(obj);
      canvas.requestRenderAll();
      removeVideoObject(id);
    },
    [removeVideoObject],
  );

  const renameLayerById = useCallback(
    (id: string, label: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const obj = findById(canvas, id);
      if (!obj) return;
      (obj as FabricObject & { canvasLabel?: string }).canvasLabel =
        label.trim() || undefined;
      setLayers(buildLayerList(canvas.getObjects()));
    },
    [setLayers],
  );

  const reorderLayerById = useCallback(
    (id: string, direction: 'up' | 'down') => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const obj = findById(canvas, id);
      if (!obj) return;
      if (direction === 'up') canvas.bringObjectForward(obj);
      else canvas.sendObjectBackwards(obj);
      canvas.requestRenderAll();
      // bringObjectForward/sendObjectBackwards don't fire object:modified,
      // so sync the layers list manually to reflect the new z-order.
      setLayers(buildLayerList(canvas.getObjects()));
    },
    [setLayers],
  );

  // Sync checkbox selection → Fabric ActiveSelection so checked objects
  // can be moved together before a permanent Group is committed.
  const handleCheckLayers = useCallback(async (ids: string[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (ids.length === 0) {
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      return;
    }

    const objects = ids
      .map((id) => findById(canvas, id))
      .filter(Boolean) as FabricObject[];

    if (objects.length === 1) {
      canvas.setActiveObject(objects[0]);
    } else {
      const { ActiveSelection } = await import('fabric');
      const selection = new ActiveSelection(objects, { canvas });
      canvas.setActiveObject(selection);
    }
    canvas.requestRenderAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Convert the checked ActiveSelection into a permanent fabric.Group.
  const handleGroupChecked = useCallback(async (ids: string[]) => {
    const canvas = canvasRef.current;
    if (!canvas || ids.length < 2) return;

    const objects = ids
      .map((id) => findById(canvas, id))
      .filter(Boolean) as FabricObject[];

    if (objects.length < 2) return;

    const { Group } = await import('fabric');
    canvas.discardActiveObject();
    objects.forEach((obj) => canvas.remove(obj));
    const group = new Group(objects);
    assignId(group);
    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.requestRenderAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    selectLayerById,
    removeLayerById,
    renameLayerById,
    reorderLayerById,
    handleCheckLayers,
    handleGroupChecked,
  };
}
