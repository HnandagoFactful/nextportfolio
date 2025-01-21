import { ChangeEvent, use, useRef, useState, useTransition } from "react";
import { Box, Button, Checkbox, Dialog, Flex, Heading, Text, TextField } from "@radix-ui/themes";
import ImageProcessorProvider from "@/providers/ImageProcessorProvider";
import imageConversion from "@/services/image-conversion";
import pageProvider from "@/providers/PageProvider";

export default function ConversionControls() {
    const pageContext = use(pageProvider);
    const processorProvider = use(ImageProcessorProvider);
    const hiddenAnchorRef = useRef<HTMLAnchorElement | null>(null);
    const blobUrlRef = useRef<string>('');
    const [, transition] = useTransition()
    const [isApiDispatched, setIsApiDispatched] = useState<boolean>(false);
    const dialogCloseRef= useRef<HTMLButtonElement | null>(null);
    const [selectedImageFormat, setSelectedFormat] = useState<string | undefined>(undefined);
    const [canFlip, setCanFlip] = useState<boolean>(false);
    const [resize, setResize] = useState<{height: number, width: number}>({
        height: 600,
        width: 600
    });

    const getConvertedFile = async function() {
        setIsApiDispatched(true);
        try {
            if (processorProvider.selectedFileData && selectedImageFormat) {
                const response = await imageConversion({
                    data: processorProvider.selectedFileData,
                    format: selectedImageFormat,
                    flip: canFlip ? '1' : '0',
                    resize: [resize.height, resize.width]
                });

                transition(() => {
                    setIsApiDispatched(false);
                    pageContext.setAlertContentType('Image converted successfully',  'success')
                });
                if (response) {
                    blobUrlRef.current = URL.createObjectURL(response)
        
                    if (hiddenAnchorRef.current) {
                        hiddenAnchorRef.current.href = blobUrlRef.current
                        hiddenAnchorRef.current.click()
                    }
                    dialogCloseRef.current?.click?.()
                } else {
                    throw 'Error';
                }
            }
        } catch(e) {
            transition(() => {
                console.log(e);
                setIsApiDispatched(false);
                pageContext.setAlertContentType('Failed to convert image',  'error')
            });
        }
    }
    
    return (
        <Box>
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
            <Flex direction={"row"} justify={"between"} gap={"2"} align={"center"}>
                <Heading color="lime">
                    Convert image
                </Heading>
                <Dialog.Root>
                    <Dialog.Trigger>
                        <Button color="lime" disabled={!selectedImageFormat}>Convert & Download</Button>
                    </Dialog.Trigger>
                    <Dialog.Content maxWidth="450px">
                        <Dialog.Title color="lime">Confirm image to convert</Dialog.Title>
                        <Dialog.Description size="2" mb="4"  color="lime">
                            {
                            processorProvider.selectedFileData?.name ?
                                `${processorProvider.selectedFileData?.name} to ${selectedImageFormat} format`
                                : 'No Image file selected to convert'
                            }
                        </Dialog.Description>
                        <Flex gap="3" mt="4" justify="end">
                            <Dialog.Close>
                                <Button ref={dialogCloseRef} variant="soft" color="gray">
                                    Cancel
                                </Button>
                            </Dialog.Close>
                            <Button color="lime" loading={isApiDispatched}
                                disabled={!processorProvider.selectedFileData?.name || isApiDispatched}
                                onClick={getConvertedFile}>
                                    Convert
                                </Button>
                        </Flex>
                    </Dialog.Content>
                </Dialog.Root>
            </Flex>
            <Flex direction={"row"} gap={"4"} align={"center"} className="pt-4">
                <Text color="lime" as="label" size="2">
                    <Flex gap="2">
                        <Checkbox color="lime"
                            checked={canFlip}
                            onCheckedChange={(event: boolean) => {
                                setCanFlip(event)
                            }} />
                        {"Flip Image"}
                    </Flex>
                </Text>
                <Flex gap="2" wrap={"wrap"}>
                    <TextField.Root placeholder="Resize Height" type="number"
                        value={resize.height} onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        setResize({
                            ...resize,
                            height: Number(event.target.value)
                        })
                    }}>
                        <TextField.Slot color="lime" className="bg-gray-700 rounded mr-1 ml-[0.5px] text-xs">Resize height</TextField.Slot>
                    </TextField.Root>
                    <TextField.Root placeholder="Resize Width"  type="number"
                        value={resize.width} onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        setResize({
                            ...resize,
                            width: Number(event.target.value)
                        })
                    }}>
                        <TextField.Slot color="lime" className="bg-gray-700 rounded mr-1 ml-[0.5px] text-xs">Resize width</TextField.Slot>
                    </TextField.Root>
                </Flex>
            </Flex>
            <Flex direction={"column"} className="mt-2" gap="4">
                <Text as="p">{processorProvider.selectedFileData ? `Selected Image type: ${processorProvider.selectedFileData.type}` : 'Upload and select an image file'}</Text>
                <Flex direction={"row"} wrap={"wrap"} gap="2"  className="pt-1 pl-4">
                    <Box className="w-[80px]">
                        <Text color="lime" as="label" size="2">
                            <Flex gap="2">
                                <Checkbox color="lime"
                                    checked={selectedImageFormat === "jpeg"}
                                    onCheckedChange={(event: boolean) => {
                                    if (event) {
                                        setSelectedFormat("jpeg")
                                    } else {
                                        setSelectedFormat(undefined)
                                    }
                                }} />
                                {"To JPEG"}
                            </Flex>
                        </Text>
                    </Box>
                    <Box className="w-[80px]">
                        <Text color="lime" as="label" size="2">
                            <Flex gap="2">
                                <Checkbox color="lime"
                                    checked={selectedImageFormat === "png"}
                                    onCheckedChange={(event: boolean) => {
                                    if (event) {
                                        setSelectedFormat("png")
                                    } else {
                                        setSelectedFormat(undefined)
                                    }
                                }} />
                                {"To PNG"}
                            </Flex>
                        </Text>
                    </Box>
                    <Box className="w-[80px]">
                        <Text color="lime" as="label" size="2">
                            <Flex gap="2">
                                <Checkbox color="lime" checked={selectedImageFormat === "pdf"}
                                    onCheckedChange={(event: boolean) => {
                                    if (event) {
                                        setSelectedFormat("pdf")
                                    } else {
                                        setSelectedFormat(undefined)
                                    }
                                }} />
                                {"To PDF"}
                            </Flex>
                        </Text>
                    </Box>
                    <Box className="w-[80px]">
                        <Text color="lime" as="label" size="2">
                            <Flex gap="2">
                                <Checkbox color="lime" checked={selectedImageFormat === "svg"}
                                    onCheckedChange={(event: boolean) => {
                                    if (event) {
                                        setSelectedFormat("svg")
                                    } else {
                                        setSelectedFormat(undefined)
                                    }
                                }}/>
                                {"To SVG"}
                            </Flex>
                        </Text>
                    </Box>
                    <Box className="w-[80px]">
                        <Text color="lime" as="label" size="2">
                            <Flex gap="2">
                                <Checkbox color="lime" checked={selectedImageFormat === "webp"}
                                    onCheckedChange={(event: boolean) => {
                                    if (event) {
                                        setSelectedFormat("webp")
                                    } else {
                                        setSelectedFormat(undefined)
                                    }
                                }}/>
                                {"To WEBP"}
                            </Flex>
                        </Text>
                    </Box>
                </Flex>
            </Flex>
        </Box>
    )
}