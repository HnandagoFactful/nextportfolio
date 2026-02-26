import { Box, Dialog, Button, Flex, Text, DropdownMenu } from "@radix-ui/themes";
import { ICroppedImagePreviewButton } from "./types";
import { useRef, useState } from "react";
import delay from "lodash.delay";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import imageConversion from "@/services/image-conversion";

export default function CroppedImagePreviewButton({
    completedCrop,
    showPreview,
    previewCanvasRef,
    setShowPreview,
    onDownload
}: ICroppedImagePreviewButton) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  async function downloadAs(format: 'png' | 'jpeg' | 'pdf') {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    setIsDownloading(true);
    try {
      const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(b => b ? resolve(b) : reject(new Error('Canvas toBlob failed')), mimeType, 0.95);
      });

      let downloadBlob: Blob = blob;
      if (format === 'pdf') {
        const pngFile = new File([blob], 'image.png', { type: 'image/png' });
        const result = await imageConversion({ data: pngFile, format: 'pdf', flip: '0', resize: [canvas.height, canvas.width] });
        if (!result) throw new Error('PDF conversion failed');
        downloadBlob = result;
      }

      const url = URL.createObjectURL(downloadBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cropped-image.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  }

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
                  <Button color="blue" size="2" className="text-sm" onClick={() => {
                  setShowPreview(true);
                }}>Preview & Download</Button>
                </Dialog.Trigger>
                
                <Dialog.Content maxWidth={"100vw"} height={"80vh"} width="90vw" className="flex flex-col items-end gap-4">
                  <Flex direction={"row"} justify={"between"} className="w-full">
                    <Dialog.Title color="lime">Preview Image</Dialog.Title>
                    <Box>
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger>
                          <Button color="lime" className="!min-h-[32px] !h-max" loading={isDownloading}>
                            Download <ChevronDownIcon />
                          </Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content>
                          <DropdownMenu.Item onClick={() => downloadAs('png')}>Download as PNG</DropdownMenu.Item>
                          <DropdownMenu.Item onClick={() => downloadAs('jpeg')}>Download as JPEG</DropdownMenu.Item>
                          <DropdownMenu.Item onClick={() => downloadAs('pdf')}>Download as PDF</DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Root>
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