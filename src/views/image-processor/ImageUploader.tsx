import ImageProcessorProvider from "@/providers/ImageProcessorProvider";
import pageProvider from "@/providers/PageProvider";
import { TranslationProvider } from "@/providers/TranslationProvider";
import { UploadIcon } from "@radix-ui/react-icons";
import { Box, TextField, Heading } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import { ChangeEvent, use, useRef } from "react";

export default function ImageUploader() {
    const translationProvider = use(TranslationProvider) 
    const translations = useTranslations(translationProvider.pageName)
    const uploaderContext = use(ImageProcessorProvider);
    const pageContext = use(pageProvider);
    const inputRef = useRef<HTMLInputElement | null>(null);

    return (
        <Box maxWidth="300px">
            <Heading color="lime">{translations('uploadImage')}</Heading>
            <input ref={inputRef} type="file"
                accept="image/png, image/jpeg"
                name={translations("uploadImageInputName")}
                className="invisible h-0 w-0"
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    if (event.target.files) {
                        const file = event.target.files[0]
                        const fileExists = uploaderContext.data?.find((item) => item?.name === file.name)
                        if (!fileExists) {
                            uploaderContext.setData(file)
                            
                        } else {
                            console.log("else")
                            pageContext.setAlertContentType(translations("imageExists"), 'warning')
                        }
                    }
                    if (inputRef.current) {
                        inputRef.current.value = ''
                    }
                }}
            />
            <TextField.Root placeholder={translations('uploadImagePlaceholder')} size="2" onClick={() => {
                inputRef?.current?.click?.()
            }}>
                <TextField.Slot>
                    <UploadIcon height="16" width="16" />
                </TextField.Slot>
            </TextField.Root>
        </Box>
    )
}