import { createContext } from "react";
export interface IImageProcessorProvider {
    data: File[] | undefined,
    setData: (data: File) => void;
    removeData: (fileId: string) => void
    selectedFileData: File | undefined
    setSelectedFileData: (file: File | undefined) => void;
}
const ImageProcessorProvider = createContext<IImageProcessorProvider>({
    data: undefined,
    setData: () => {},
    removeData: () => {},
    selectedFileData: undefined,
    setSelectedFileData: () => {}
})

export default ImageProcessorProvider;