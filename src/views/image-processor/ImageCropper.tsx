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
    const containerRef = useRef<HTMLDivElement>(null)
    const lastPinchDistRef = useRef<number>(0)
    // Drag-to-pan state (refs avoid re-renders during continuous drag)
    const isDraggingRef = useRef(false)
    const lastPointerPosRef = useRef({ x: 0, y: 0 })
    const activePointerCountRef = useRef(0)

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
      const img = e.currentTarget
      if (aspectRatio) {
        setCrop(centerAspectCrop(img.width, img.height, aspectRatio))
      }
      // Read the container's actual rendered height (after flex layout settles)
      // so the auto-fit scale is always exact regardless of viewport size.
      requestAnimationFrame(() => {
        const container = containerRef.current
        if (!container || img.height === 0) return
        const containerH = container.clientHeight
        if (containerH > 0 && img.height < containerH) {
          setScale(parseFloat(Math.min(containerH / img.height, 5).toFixed(2)))
        }
      })
    }

    // Centers the image in the canvas by calculating the translate needed to
    // place the visual midpoint of the (scaled) image at the container midpoint.
    function centerImage() {
      const img = imgRef.current
      const container = containerRef.current
      if (!img || !container) return
      setTranslateX((container.clientWidth  - img.offsetWidth  * scale) / 2)
      setTranslateY((container.clientHeight - img.offsetHeight * scale) / 2)
    }

    // --- Drag-to-pan handlers (active via transparent overlay when crop is disabled) ---
    function handlePanStart(e: React.PointerEvent<HTMLDivElement>) {
      activePointerCountRef.current++
      // Two or more pointers = pinch gesture; hand off to the touch zoom handler
      if (activePointerCountRef.current > 1) {
        isDraggingRef.current = false
        return
      }
      isDraggingRef.current = true
      lastPointerPosRef.current = { x: e.clientX, y: e.clientY }
      // Capture keeps receiving events even when pointer leaves the element
      e.currentTarget.setPointerCapture(e.pointerId)
    }

    function handlePanMove(e: React.PointerEvent<HTMLDivElement>) {
      if (!isDraggingRef.current || activePointerCountRef.current > 1) return
      const dx = e.clientX - lastPointerPosRef.current.x
      const dy = e.clientY - lastPointerPosRef.current.y
      setTranslateX(prev => prev + dx)
      setTranslateY(prev => prev + dy)
      lastPointerPosRef.current = { x: e.clientX, y: e.clientY }
    }

    function handlePanEnd() {
      activePointerCountRef.current = Math.max(0, activePointerCountRef.current - 1)
      if (activePointerCountRef.current === 0) {
        isDraggingRef.current = false
      }
    }

    async function onDownloadCropClick(previewCanvasRef: HTMLCanvasElement, isSaveToList?: boolean) {
      const image = imgRef.current
      const previewCanvas = previewCanvasRef;
      if (!image || !previewCanvas || !completedCrop) {
        throw new Error('Crop canvas does not exist')
      }

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

    // Non-passive wheel listener — React's synthetic onWheel is passive so
    // preventDefault() would be silently ignored without this native listener.
    useEffect(() => {
      const el = containerRef.current
      if (!el || !fileData) return

      const onWheel = (e: WheelEvent) => {
        e.preventDefault()
        const delta = e.deltaY < 0 ? 0.1 : -0.1
        setScale(prev => Math.min(Math.max(parseFloat((prev + delta).toFixed(2)), 0.1), 10))
      }

      el.addEventListener('wheel', onWheel, { passive: false })
      return () => el.removeEventListener('wheel', onWheel)
    }, [fileData])

    // Non-passive touchmove so we can preventDefault() on 2-finger pinch
    useEffect(() => {
      const el = containerRef.current
      if (!el || !fileData) return

      const onTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 2) {
          lastPinchDistRef.current = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          )
        }
      }

      const onTouchMove = (e: TouchEvent) => {
        if (e.touches.length !== 2) return
        e.preventDefault()
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
        if (lastPinchDistRef.current > 0) {
          const ratio = dist / lastPinchDistRef.current
          setScale(prev => Math.min(Math.max(parseFloat((prev * ratio).toFixed(2)), 0.1), 10))
        }
        lastPinchDistRef.current = dist
      }

      const onTouchEnd = () => { lastPinchDistRef.current = 0 }

      el.addEventListener('touchstart', onTouchStart, { passive: true })
      el.addEventListener('touchmove', onTouchMove, { passive: false })
      el.addEventListener('touchend', onTouchEnd, { passive: true })
      return () => {
        el.removeEventListener('touchstart', onTouchStart)
        el.removeEventListener('touchmove', onTouchMove)
        el.removeEventListener('touchend', onTouchEnd)
      }
    }, [fileData])

    useEffect(() => {
      if (isCropDisabled) {
        setCrop(undefined)
      }
    }, [isCropDisabled])

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
      <Box className="relative flex flex-col gap-2 w-full" style={{ flex: 1, minHeight: 0 }}>
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
          onCenter={centerImage}
          />
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden"
          style={{ touchAction: 'none', flex: 1, minHeight: 0 }}
        >
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => { setCrop(percentCrop) }}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio}
            disabled={isCropDisabled}
            minHeight={100}
            style={{ width: '100%', display: 'block' }}
          >
            <img
              ref={imgRef}
              alt="Crop me"
              src={fileData}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                // translate is listed BEFORE scale so each pixel of drag maps
                // to exactly one screen pixel regardless of the current zoom level.
                // With scale() first, translateX(t) moves s*t pixels visually.
                transform: `translateX(${translateX}px) translateY(${translateY}px) scale(${scale}) rotate(${rotate}deg)`,
                transformOrigin: 'top left',
              }}
              onLoad={onImageLoad}
            />
          </ReactCrop>

          {/*
            Transparent overlay rendered on top of ReactCrop when crop is disabled.
            It intercepts all pointer events so the user can freely drag to reposition
            the image. When crop is enabled the overlay is removed and ReactCrop owns
            the pointer events for selection.
          */}
          {isCropDisabled && (
            <div
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
              style={{ zIndex: 20, touchAction: 'none' }}
              onPointerDown={handlePanStart}
              onPointerMove={handlePanMove}
              onPointerUp={handlePanEnd}
              onPointerCancel={handlePanEnd}
            />
          )}
        </div>
      </Box>
    );
}
