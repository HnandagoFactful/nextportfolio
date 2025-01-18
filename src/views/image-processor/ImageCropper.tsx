/* eslint-disable @next/next/no-img-element */
import { use, useEffect, useRef, useState } from "react";
import ReactCrop, { 
    centerCrop,
    makeAspectCrop,
    Crop,
    PixelCrop
} from "react-image-crop";
import { Box } from "@radix-ui/themes";
import ImageProcessorProvider from "@/providers/ImageProcessorProvider";
import 'react-image-crop/dist/ReactCrop.css'
import CropperControls from "./CropperControls";

function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
  ) {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight,
      ),
      mediaWidth,
      mediaHeight,
    )
  }
  

export default function ImageCropper() {
    const imgProvider = use(ImageProcessorProvider)
    const [fileData, setFileData] = useState<string | undefined>(undefined);
    const imgRef = useRef<HTMLImageElement>(null)
    const [isCropDisabled, setIsCropDisabled] = useState<boolean>(false);
    const [crop, setCrop] = useState<Crop>()
    const [aspectRatio, setAspectRatio] = useState<number | undefined>(1)
    const [scale, setScale] = useState<number>(1)
    const [rotate, setRotate] = useState<number>(0)
    const [translateX, setTranslateX] = useState<number>(0)
    const [translateY, setTranslateY] = useState<number>(0)
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>()

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        if (aspectRatio) {
          const { width, height } = e.currentTarget
          setCrop(centerAspectCrop(width, height, aspectRatio))
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

    console.log("scale", isCropDisabled)

    return (
      <Box className="relative">
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