import { useEffect, useRef, RefObject } from "react";
import type { Canvas as FabricCanvas } from "fabric";

export function useVideoLoop(
  videoObjects: Array<{ id: string; videoEl: HTMLVideoElement }>,
  canvasRef: RefObject<FabricCanvas | null>,
) {
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (videoObjects.length === 0) return;

    const loop = () => {
      canvasRef.current?.requestRenderAll();
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [videoObjects, canvasRef]);
}
