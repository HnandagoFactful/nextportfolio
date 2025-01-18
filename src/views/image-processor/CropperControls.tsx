import { ChangeEvent, Dispatch, RefObject, SetStateAction, useRef, useState } from "react"
import { PixelCrop } from "react-image-crop";
import { Flex, Text, Box, Button, Dialog } from "@radix-ui/themes"
import { useDebounceEffect } from "@/hooks/useDebounceEffect";
import { canvasPreview } from "./utils";
import CropperControlInput from "./CropperControlInput";

export interface ICropperControls {
    completedCrop: PixelCrop | undefined;
    setAspectRatio: Dispatch<SetStateAction<number | undefined>>;
    setScale: Dispatch<SetStateAction<number>>;
    setRotate: Dispatch<SetStateAction<number>>;
    imgRef: RefObject<HTMLImageElement | null>;
    scale: number;
    rotate: number;
    aspectRatio: number | undefined;
    isCropDisabled: boolean;
    translateX?: number;
    translateY?: number;
    setTranslateX?: Dispatch<SetStateAction<number>>;
    setTranslateY?: Dispatch<SetStateAction<number>>;
    setIsCropDisabled: Dispatch<SetStateAction<boolean>>;
}

export default function CropperControls({
    completedCrop,
    imgRef,
    scale,
    rotate,
    aspectRatio,
    isCropDisabled,
    translateX = 1,
    translateY = 1,
    setTranslateX,
    setTranslateY,
    setIsCropDisabled,
    setAspectRatio,
    setScale,
    setRotate
}: ICropperControls) {
    const previewCanvasRef = useRef<HTMLCanvasElement>(null)
    const [showPreview, setShowPreview] = useState<boolean>(false);

    
    useDebounceEffect(
        async () => {
          if (
            completedCrop?.width &&
            completedCrop?.height &&
            imgRef.current &&
            previewCanvasRef.current
          ) {
            // We use canvasPreview as it's much faster than imgPreview.
            canvasPreview(
              imgRef.current,
              previewCanvasRef.current,
              completedCrop,
              scale,
              rotate,
            )
          }
        },
        100,
        [completedCrop, scale, rotate,  showPreview],
    )
    return (
        <Flex direction={"row"} justify={"between"} align={"center"}>
          <Flex direction="row" className="mb-4" wrap={"wrap"} gap={"2"}>
            <CropperControlInput withCheckBox
                label={"Allow aspect ratio"}
                step={1}
                value={aspectRatio}
                defaultUpdater={(value: number) => {
                  setAspectRatio(value);
                }}
                onCheckedChange={(checked: boolean) => {
                    setAspectRatio(checked ? 1 : undefined)
                }}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    setAspectRatio(Number(event.target.value))
                }}
                updaterPlus={() => {
                setAspectRatio(aspectRatio ? aspectRatio + 0.5 : 1)
                }}
                updaterMinus={() => {
                setAspectRatio(aspectRatio  && aspectRatio > 1 ? aspectRatio - 0.5 : 1)
                }}
            />
            <CropperControlInput label={"Scale image to fit container:"}
                step={0.25}
                value={scale}
                defaultUpdater={(value: number) => {
                  setScale(value);
                }}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    setScale(Number(event.target.value))
                }}
                updaterPlus={() => {
                    setScale(scale ? scale + 0.25 : 1)
                }}
                updaterMinus={() => {
                    setScale(scale - 0.25)
                }}
            />
            <CropperControlInput label={"Rotate image:"}
                step={0.25}
                value={rotate}
                defaultUpdater={(value: number) => {
                  setRotate(value);
                }}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    setRotate(Number(event.target.value))
                }}
                updaterPlus={() => {
                    setRotate(rotate ? rotate + 0.25 : 1)
                }}
                updaterMinus={() => {
                    setRotate(rotate - 0.25)
                }}
            />
            <CropperControlInput label={"Move enlarged image left to right:"}
                step={1}
                value={translateX}
                defaultUpdater={(value: number) => {
                  console.log("default updater", value)
                  setTranslateX?.(value);
                }}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setTranslateX?.(Number(event.target.value))
                }}
                updaterPlus={() => {
                  setTranslateX?.(translateX ? translateX +1 : 1)
                }}
                updaterMinus={() => {
                  setTranslateX?.(translateX - 1)
                }}
            />
            <CropperControlInput label={"Move enlarged image top to bottom:"}
                step={1}
                value={translateY}
                defaultUpdater={(value: number) => {
                  setTranslateY?.(value);
                }}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    setTranslateY?.(Number(event.target.value))
                }}
                updaterPlus={() => {
                  setTranslateY?.(translateY ? translateY + 1  : 1)
                }}
                updaterMinus={() => {
                  setTranslateY?.(translateY - 1)
                }}
            />
          </Flex>
          <Flex direction={"column"} gap="2">
            <Button color={isCropDisabled ? "red" : "lime"}
              className="!min-h-[32px] !h-max"
              onClick={() => {
                  setIsCropDisabled(!isCropDisabled)
              }}>{`${!isCropDisabled ?  "Disable" : "Enable"} Crop`}</Button>
            {(completedCrop?.height && completedCrop.width) ?  (<Box>
              {(completedCrop?.height && completedCrop.width)  ? (
                <Dialog.Root onOpenChange={(event: boolean) => {
                  setShowPreview(event);
                }}>
                  <Dialog.Trigger>
                    <Button color="blue" onClick={() => {
                    setShowPreview(true);
                  }}>Preview</Button>
                  </Dialog.Trigger>
                  
                  <Dialog.Content maxWidth={"100vw"} height={"80vh"} width="90vw" className="flex flex-col items-end gap-4">
                    <Flex direction={"row"} justify={"between"} className="w-full">
                      <Dialog.Title color="lime">Preview Image</Dialog.Title>
                      <Dialog.Close>
                        <Button variant="soft" size={"2"} color="gray">
                          Cancel
                        </Button>
                      </Dialog.Close>
                    </Flex>
                    <Flex direction={"column"} justify={"center"} className="w-full h-full">
                    {showPreview ? (
                      <canvas
                        ref={previewCanvasRef}
                        style={{
                          margin: "0 auto",
                          border: '1px solid black',
                          objectFit: 'contain',
                          width: completedCrop.width,
                          height: completedCrop.height,
                        }}
                      />
                    ): (<Text>Please select a segment of the image to preview</Text>)}
                    </Flex>
                  </Dialog.Content>
                </Dialog.Root>
              ) : null}
            </Box>) : null}
          </Flex>
        </Flex>
    )
}