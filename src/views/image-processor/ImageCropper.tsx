/* eslint-disable @next/next/no-img-element */
import { use, useEffect, useRef, useState } from "react";
import ReactCrop, {
    Crop,
    PixelCrop
} from "react-image-crop";
import { Box } from "@radix-ui/themes";
import ImageProcessorProvider from "@/providers/ImageProcessorProvider";
import CropperControls from "./CropperControls";
import { centerAspectCrop, downloadImageFromPreview } from "./utils";

import 'react-image-crop/dist/ReactCrop.css'

export default function ImageCropper() {
    const imgProvider = use(ImageProcessorProvider)
    const hiddenAnchorRef = useRef<HTMLAnchorElement | null>(null);
    const blobUrlRef = useRef<string>('')
    const imgRef = useRef<HTMLImageElement>(null)
    const [crop, setCrop] = useState<Crop>()
    const [scale, setScale] = useState<number>(1)
    const [rotate, setRotate] = useState<number>(0)
    const [translateX, setTranslateX] = useState<number>(0)
    const [translateY, setTranslateY] = useState<number>(0)
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
    const [isCropDisabled, setIsCropDisabled] = useState<boolean>(false);
    const [aspectRatio, setAspectRatio] = useState<number | undefined>(1)
    const [fileData, setFileData] = useState<string | undefined>(undefined);

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
      if (aspectRatio) {
        const { width, height } = e.currentTarget
        setCrop(centerAspectCrop(width, height, aspectRatio))
      }
    }

    async function onDownloadCropClick(previewCanvasRef: HTMLCanvasElement, isSaveToList?: boolean) {
      const image = imgRef.current
      const previewCanvas = previewCanvasRef;
      if (!image || !previewCanvas || !completedCrop) {
        throw new Error('Crop canvas does not exist')
      }
  
      // This will size relative to the uploaded image
      // size. If you want to size according to what they
      // are looking at on screen, remove scaleX + scaleY
      const blob = await downloadImageFromPreview(
        image,
        previewCanvas,
        completedCrop,
        imgProvider.selectedFileData?.type
      )
      if (!isSaveToList) {
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current)
        }
        blobUrlRef.current = URL.createObjectURL(blob)
    
        if (hiddenAnchorRef.current) {
          hiddenAnchorRef.current.href = blobUrlRef.current
          hiddenAnchorRef.current.click()
        }
      } else {
        const selectedFileName = imgProvider.selectedFileData?.name?.split('.');
        const currentDate = new Date();
        const modifiedFile = new File([blob], `image-${currentDate.toLocaleDateString().split('/').join('-')}-${currentDate.toLocaleTimeString().split(' ').join('-')}.${selectedFileName?.[1]}`, { type: imgProvider.selectedFileData?.type ?? 'text/plain' });
        imgProvider.setData(modifiedFile);
        imgProvider.setSelectedFileData(modifiedFile)
      }
    }

    useEffect(function() {
      if (imgProvider.selectedFileData) {
          setFileData(window.URL.createObjectURL(imgProvider.selectedFileData))
      }
      if (fileData && !imgProvider.selectedFileData) {
          setFileData(undefined)
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imgProvider.selectedFileData])


    if (!fileData) {
      return null;
    }

    return (
      <Box className="relative">
        <a className="visibility-hidden h-w w-0"
          href="#hidden"
          ref={hiddenAnchorRef}
          download
          style={{
            position: 'absolute',
            top: '-200vh',
            visibility: 'hidden',
          }}
        >
          Hidden download
        </a>
        <CropperControls isCropDisabled={isCropDisabled}
          aspectRatio={aspectRatio}
          imgRef={imgRef}
          rotate={rotate}
          scale={scale}
          completedCrop={completedCrop}
          translateX={translateX}
          translateY={translateY}
          setTranslateX={setTranslateX}
          setTranslateY={setTranslateY}
          setIsCropDisabled={setIsCropDisabled}
          setAspectRatio={setAspectRatio}
          setScale={setScale}
          setRotate={setRotate}
          onDownload={onDownloadCropClick}
          />
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => {
              setCrop(percentCrop)}
          }
          onComplete={(c) => setCompletedCrop(c)}
          aspect={aspectRatio}
          disabled={isCropDisabled}
          minHeight={100}
        >
            <img
                ref={imgRef}
                alt="Crop me"
                src={fileData}
                width={"inherit"}
                height={"inherit"}
                style={{ transform: `scale(${scale}) rotate(${rotate}deg) translateX(${translateX}px) translateY(${translateY}px)` }}
                onLoad={onImageLoad}
            />
        </ReactCrop>
      </Box>
    );
}