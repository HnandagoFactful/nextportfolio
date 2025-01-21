import { use, useState } from "react";
import { Card } from "@radix-ui/themes";
import { Responsive, WidthProvider } from "react-grid-layout";
import Alert from "@/components/globals/Alert";
import ImageProcessorProvider from "@/providers/ImageProcessorProvider";
import { initial2ColImgVIewerLayout } from "./layouts";
import ImageUploader from "./ImageUploader";
import ImagesList from "./ImagesList";
import ImageCropper from "./ImageCropper";

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import GenericNotification from "@/components/globals/GenericNotification";
import { TranslationProvider } from "@/providers/TranslationProvider";
import { useTranslations } from "next-intl";
import ConversionControls from "./ConversionControls";


const ResponsiveGridLayout = WidthProvider(Responsive);

export default function ImageViewer() {
    const translationProvider = use(TranslationProvider) 
    const translations = useTranslations(translationProvider.pageName)
    const [fileData, setFileData] = useState<File[] | undefined>(undefined);
    const [selectedFileData, setSelectedFileData] = useState<File | undefined>(undefined);

    const setData = (file: File) => {
        setFileData(fileData ? [...fileData, file] : [file] )
    }

    const removeData = (fileId: string) => {
       setFileData(fileData?.filter((item: File) => item.name !== fileId))
        if (selectedFileData &&
            fileId.trim() === selectedFileData.name.trim()) {
            setSelectedFileData(() => undefined)
        }
    }

    return (
        <ImageProcessorProvider.Provider value={{
            data: fileData,
            removeData,
            setData,
            selectedFileData,
            setSelectedFileData
        }}>
            <Alert isTimer isWarningIcon />
            <GenericNotification message={translations('cardDragNotification')} />
            <ResponsiveGridLayout
                className="layout"
                isResizable
                resizeHandles={["e", "s", "se"]}
                rowHeight={50}
                style={{ width: "98%"}}
                useCSSTransforms={true}
                margin={[12, 8]}
                layouts={initial2ColImgVIewerLayout}
                breakpoints={{ lg: 1200, md: 980, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}>
                <Card key="a" variant="surface">
                    <ImageUploader />
                    <ImagesList />
                </Card>
                <Card key="b" variant="surface">
                    <ImageCropper />
                </Card>
                <Card key="c">
                    <ConversionControls />
                </Card>
            </ResponsiveGridLayout>
        </ImageProcessorProvider.Provider>
    )
}