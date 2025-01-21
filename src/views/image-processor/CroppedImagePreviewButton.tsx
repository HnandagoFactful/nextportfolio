import { Box, Dialog, Button, Flex, Text } from "@radix-ui/themes";
import { ICroppedImagePreviewButton } from "./types";
import { useRef } from "react";
import delay from "lodash.delay";

export default function CroppedImagePreviewButton({
    completedCrop,
    showPreview,
    previewCanvasRef,
    setShowPreview,
    onDownload
}: ICroppedImagePreviewButton) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
    if  (!completedCrop || (completedCrop?.height && !completedCrop.width)) {
        return null;
    }
    return (
        <Box>
            {(completedCrop?.height && completedCrop.width)  ? (
              <Dialog.Root onOpenChange={(event: boolean) => {
                setShowPreview(event);
              }}>
                <Dialog.Trigger>
                  <Button color="blue" size="3" className="text-sm" onClick={() => {
                  setShowPreview(true);
                }}>Preview & Download</Button>
                </Dialog.Trigger>
                
                <Dialog.Content maxWidth={"100vw"} height={"80vh"} width="90vw" className="flex flex-col items-end gap-4">
                  <Flex direction={"row"} justify={"between"} className="w-full">
                    <Dialog.Title color="lime">Preview Image</Dialog.Title>
                    <Box>
                      <Button color={"lime"}
                        className="!min-h-[32px] !h-max"
                        onClick={function() {
                        if (previewCanvasRef.current) {
                            onDownload(previewCanvasRef.current)
                        }
                        }}>Download</Button>
                        <Button variant="outline" color={"lime"}
                        className="!min-h-[32px] !h-max ml-4"
                        onClick={function() {
                        if (previewCanvasRef.current) {
                            onDownload(previewCanvasRef.current, true);
                            delay(() => {
                              closeButtonRef?.current?.click();
                            }, 500);
                        }
                        }}>Save to list</Button>
                    </Box>
                    <Dialog.Close>
                      <Button ref={closeButtonRef} variant="soft" size={"2"} color="gray">
                        Cancel
                      </Button>
                    </Dialog.Close>
                  </Flex>
                  <Flex direction={"column"} justify={"center"} className="w-full h-full mt-[90px]">
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
          </Box>
    )
}