import { useState } from "react";
import { Card } from "@radix-ui/themes";
import Alert from "@/components/globals/Alert";
import ImageProcessorProvider from "@/providers/ImageProcessorProvider";
import ImageUploader from "./ImageUploader";
import ImagesList from "./ImagesList";
import ImageCropper from "./ImageCropper";
import ConversionControls from "./ConversionControls";

export default function ImageViewer() {

    const [fileData, setFileData] = useState<File[] | undefined>(undefined);
    const [selectedFileData, setSelectedFileData] = useState<File | undefined>(undefined);

    const setData = (file: File) => {
        setFileData(prev => prev ? [...prev, file] : [file])
    }

    const removeData = (fileId: string) => {
        setFileData(prev => prev?.filter((item: File) => item.name !== fileId))
        if (selectedFileData && fileId.trim() === selectedFileData.name.trim()) {
            setSelectedFileData(undefined)
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

            {/*
              Layout:
                Mobile  → 1 column, stacked: Upload / Cropper / Convert
                Desktop → 2 columns: left sidebar (Upload on top, Convert fills rest)
                                     right main   (Cropper spans full height)
            */}
            <div className="img-viewer-grid grid grid-cols-1 md:grid-cols-[280px_1fr] gap-3 p-2">

                {/* A — Upload (top-left) */}
                <Card variant="surface" className="overflow-auto">
                    <ImageUploader />
                    <ImagesList />
                </Card>

                {/* B — Cropper  mobile: order-2  desktop: col-2 rows-1→3 */}
                <Card
                    variant="surface"
                    className="flex flex-col overflow-hidden min-h-[420px] md:row-start-1 md:row-end-3 md:col-start-2"
                >
                    <ImageCropper />
                </Card>

                {/* C — Conversion (bottom-left, fills remaining height on desktop) */}
                <Card variant="surface" className="overflow-auto md:row-start-2 md:col-start-1">
                    <ConversionControls />
                </Card>
            </div>

            {/* grid-template-rows can't be set via Tailwind arbitraries for responsive,
                so a minimal scoped rule handles desktop row sizing. */}
            <style>{`
                @media (min-width: 768px) {
                    .img-viewer-grid {
                        height: calc(100svh - 68px);
                        grid-template-rows: auto 1fr;
                    }
                }
            `}</style>
        </ImageProcessorProvider.Provider>
    )
}
