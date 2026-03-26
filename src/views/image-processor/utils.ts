import { centerCrop, makeAspectCrop, PixelCrop } from 'react-image-crop'

const TO_RADIANS = Math.PI / 180

export async function canvasPreview(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop,
  scale = 1,
  rotate = 0,
  translateX = 0,
  translateY = 0,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No 2d context')

  const pixelRatio = window.devicePixelRatio

  // Canvas represents the crop-box viewport in layout/CSS-pixel space.
  // Size = crop selection dimensions × devicePixelRatio for HiDPI sharpness.
  canvas.width  = Math.floor(crop.width  * pixelRatio)
  canvas.height = Math.floor(crop.height * pixelRatio)

  ctx.scale(pixelRatio, pixelRatio)
  ctx.imageSmoothingQuality = 'high'

  ctx.save()

  // Reproduce the exact CSS transform chain applied to the <img> element:
  //   transform: translateX(tx) translateY(ty) scale(s) rotate(r)
  //   transformOrigin: top left
  //
  // Step 1: shift the canvas origin to the crop-box top-left so that the
  //         crop region becomes our (0,0) viewport.
  ctx.translate(-crop.x, -crop.y)

  // Steps 2-4: apply the image's own CSS transforms in the same order.
  //   The image sits at (0,0) inside the ReactCrop wrapper, so these
  //   transforms are anchored at the image's top-left corner (= wrapper 0,0).
  ctx.translate(translateX, translateY)
  ctx.scale(scale, scale)
  ctx.rotate(rotate * TO_RADIANS)

  // Draw the image at its CSS layout dimensions so the coordinate space
  // matches the CSS rendering exactly.
  ctx.drawImage(image, 0, 0, image.width, image.height)

  ctx.restore()
}

export function centerAspectCrop(
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

export async function downloadImageFromPreview(
  image: HTMLImageElement,
  previewCanvas: HTMLCanvasElement,
  completedCrop: PixelCrop,
  type = 'image/png'
) {
  const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height
  
      const offscreen = new OffscreenCanvas(
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
      )
      const ctx = offscreen.getContext('2d')
      if (!ctx) {
        throw new Error('No 2d context')
      }
  
      ctx.drawImage(
        previewCanvas,
        0,
        0,
        previewCanvas.width,
        previewCanvas.height,
        0,
        0,
        offscreen.width,
        offscreen.height,
      )
      // You might want { type: "image/jpeg", quality: <0 to 1> } to
      // reduce image size
      const blob = await offscreen.convertToBlob({
        type: type,
      })

      return blob;
  
      
}