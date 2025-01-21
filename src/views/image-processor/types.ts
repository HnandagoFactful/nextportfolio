import { Dispatch, RefObject, SetStateAction } from "react";
import { PixelCrop } from "react-image-crop";

export interface ICroppedImagePreviewButton {
    completedCrop: PixelCrop | undefined;
    showPreview: boolean;
    previewCanvasRef: RefObject<HTMLCanvasElement | null>
    setShowPreview: (event: boolean) => void;
    onDownload: (canvas: HTMLCanvasElement, isSaveToList?: boolean) => Promise<void>;
}

export interface ICropperControls {
    completedCrop: PixelCrop | undefined;
    imgRef: RefObject<HTMLImageElement | null>;
    scale: number;
    rotate: number;
    aspectRatio: number | undefined;
    isCropDisabled: boolean;
    translateX?: number;
    translateY?: number;
    setAspectRatio: Dispatch<SetStateAction<number | undefined>>;
    setScale: Dispatch<SetStateAction<number>>;
    setRotate: Dispatch<SetStateAction<number>>;
    setTranslateX?: Dispatch<SetStateAction<number>>;
    setTranslateY?: Dispatch<SetStateAction<number>>;
    setIsCropDisabled: Dispatch<SetStateAction<boolean>>;
    onDownload: (ref: HTMLCanvasElement, isSaveToList?: boolean) => Promise<void>;
}