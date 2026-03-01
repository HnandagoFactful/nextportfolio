import { useRef, useCallback, useState, RefObject } from "react";
import type { Canvas as FabricCanvas, FabricObject } from "fabric";
import { assignId } from "../canvasUtils";

interface UseMediaUploadReturn {
  imageInputRef: RefObject<HTMLInputElement | null>;
  videoInputRef: RefObject<HTMLInputElement | null>;
  videoObjects: Array<{ id: string; videoEl: HTMLVideoElement }>;
  addVideoObject: (id: string, videoEl: HTMLVideoElement) => void;
  removeVideoObject: (id: string) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleVideoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function useMediaUpload(
  canvasRef: RefObject<FabricCanvas | null>,
): UseMediaUploadReturn {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const [videoObjects, setVideoObjects] = useState<
    Array<{ id: string; videoEl: HTMLVideoElement }>
  >([]);

  const addVideoObject = useCallback((id: string, videoEl: HTMLVideoElement) => {
    setVideoObjects((prev) => [...prev, { id, videoEl }]);
  }, []);

  const removeVideoObject = useCallback((id: string) => {
    setVideoObjects((prev) => {
      const entry = prev.find((v) => v.id === id);
      if (entry) {
        entry.videoEl.pause();
        const src = entry.videoEl.src;
        if (src.startsWith('blob:')) URL.revokeObjectURL(src);
      }
      return prev.filter((v) => v.id !== id);
    });
  }, []);

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !canvasRef.current) return;
      const url = URL.createObjectURL(file);
      import('fabric').then(({ FabricImage }) => {
        FabricImage.fromURL(url).then((img) => {
          assignId(img);
          canvasRef.current?.add(img);
          canvasRef.current?.requestRenderAll();
          URL.revokeObjectURL(url);
        });
      });
      e.target.value = '';
    },
    // canvasRef is a stable ref — omitting from deps is intentional
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleVideoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !canvasRef.current) return;
      const url = URL.createObjectURL(file);
      const videoEl = document.createElement('video');
      videoEl.src = url;
      videoEl.loop = true;
      videoEl.muted = true;
      videoEl.autoplay = true;
      videoEl.playsInline = true;

      videoEl.addEventListener(
        'loadeddata',
        () => {
          videoEl.play();
          import('fabric').then(({ FabricImage }) => {
            const fabricVideo = new FabricImage(
              videoEl as unknown as HTMLImageElement,
              {
                left: 50,
                top: 50,
                width: videoEl.videoWidth || 320,
                height: videoEl.videoHeight || 240,
              },
            );
            assignId(fabricVideo);
            canvasRef.current?.add(fabricVideo);
            canvasRef.current?.requestRenderAll();
            const id = (fabricVideo as FabricObject & { canvasId?: string }).canvasId!;
            addVideoObject(id, videoEl);
          });
        },
        { once: true },
      );

      e.target.value = '';
    },
    [addVideoObject],
  );

  return {
    imageInputRef,
    videoInputRef,
    videoObjects,
    addVideoObject,
    removeVideoObject,
    handleImageUpload,
    handleVideoUpload,
  };
}
