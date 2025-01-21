import ImageProcessorProvider from "@/providers/ImageProcessorProvider";
import { Box, Card, Flex, IconButton, Popover, Text } from "@radix-ui/themes";
import { Cross2Icon, EyeOpenIcon } from "@radix-ui/react-icons";
import { use } from "react";

export default function ImagesList() {
    const uploaderContext = use(ImageProcessorProvider);

    if (!uploaderContext.data) {
        return null;
    }

    return (
        <>
            <Popover.Root>
                <Popover.Trigger>
                    <Box className="pt-4 flex flex-row gap-3 items-center">
                        <Text size="2" color="lime" as="p">Uploaded Images: {uploaderContext.data.length}</Text>
                        <IconButton color="lime" className="p-0"><EyeOpenIcon height={19} width={19} /></IconButton>
                    </Box>
                </Popover.Trigger>
                <Popover.Content width="360px" height={"200px"}>
                    <Flex direction={"column"} wrap={"wrap"} gap={"3"}>
                        {uploaderContext.data.map((item: File, index: number) => {
                            return (
                                <Card key={`uploaded-file-${index}`}
                                    onClick={() => {
                                        uploaderContext.setSelectedFileData(item)
                                    }}
                                    className="flex flex-row gap-3 items-center justify-between w-full hover:opacity-60 cursor-pointer">
                                    <Text>{item.name}</Text>
                                    <Cross2Icon height={18} width={18} className="hover:opacity-40" onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        uploaderContext.removeData(item.name)
                                    }} />
                                </Card>
                            )
                        })}
                    </Flex>
                </Popover.Content>
            </Popover.Root>
        </>
    )
}