import { createContext } from "react";
export interface IImageProcessorProvider {
    data: File[] | undefined,
    setData: (data: File) => void;
    removeData: (fileId: string) => void
}
const ImageProcessorProvider = createContext<IImageProcessorProvider>({
    data: undefined,
    setData: () => {},
    removeData: () => {}
})

export default ImageProcessorProvider;