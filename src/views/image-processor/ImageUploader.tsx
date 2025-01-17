import ImageProcessorProvider from "@/providers/ImageProcessorProvider";
import pageProvider from "@/providers/PageProvider";
import { MagnifyingGlassIcon, DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Box, TextField, IconButton, Heading } from "@radix-ui/themes";
import { use, useRef } from "react";

export default function ImageUploader() {
    const uploaderContext = use(ImageProcessorProvider);
    const pageContext = use(pageProvider);
    const inputRef = useRef<HTMLInputElement | null>(null);

    return (
        <Box maxWidth="300px">
            <Heading className="mb-2" color="lime">Upload Images</Heading>
            <TextField.Root placeholder="Upload the images" size="3" onClick={() => {
                inputRef?.current?.click?.()
            }}>
                <TextField.Slot>
                    <input ref={inputRef} type="file"
                        accept="image/png, image/jpeg"
                        name="Image uploader"
                        className="invisible h-0 w-0"
                        onChange={(event: any) => {
                            if (event.target.files) {
                                const file = event.target.files[0]
                                const fileExists = uploaderContext.data?.find((item) => item?.name === file.name)
                                if (!fileExists) {
                                    uploaderContext.setData(file)
                                    
                                } else {
                                    console.log("else")
                                    pageContext.setAlertContentType('Image already exists', 'warning')
                                }
                            }
                            if (inputRef.current) {
                                inputRef.current.value = ''
                            }
                        }}
                    />
                    <MagnifyingGlassIcon height="16" width="16" />
                </TextField.Slot>
                <TextField.Slot>
                    <IconButton size="1" variant="ghost">
                        <DotsHorizontalIcon height="14" width="14" />
                    </IconButton>
                </TextField.Slot>
            </TextField.Root>
        </Box>
    )
}