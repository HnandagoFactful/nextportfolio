import { use, useEffect, useRef, useState } from "react";
import ReactCrop, { 
    centerCrop,
    makeAspectCrop,
    Crop,
    PixelCrop
} from "react-image-crop";
import ImageProcessorProvider from "@/providers/ImageProcessorProvider";


import 'react-image-crop/dist/ReactCrop.css'

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
    const [fileData, setFileData] = useState<any>(undefined);
    const previewCanvasRef = useRef<HTMLCanvasElement>(null)
    const imgRef = useRef<HTMLImageElement>(null)
    const hiddenAnchorRef = useRef<HTMLAnchorElement>(null)
    const blobUrlRef = useRef('')
    const [crop, setCrop] = useState<Crop>()
    const [aspectRatio, setAspectRatio] = useState<number>(1)
    const [scale, setScale] = useState(1)
    const [rotate, setRotate] = useState(0)
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
            setFileData(null)
        }
      }, [imgProvider])

    if (!fileData) {
        return null;
    }

    return (
        <ReactCrop
            crop={crop}

            onChange={(_, percentCrop) => {
                console.log('percentage', percentCrop)
                setCrop(percentCrop)}
            }
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio}
            // minWidth={400}
            minHeight={100}
        // circularCrop
        >
            <img
                ref={imgRef}
                alt="Crop me"
                src={fileData}
                style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                onLoad={onImageLoad}
            />
        </ReactCrop>
    );
}