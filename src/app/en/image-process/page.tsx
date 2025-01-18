'use client';

import dynamic from "next/dynamic";
import ContainerLayout from "@/components/globals/ContainerLayout";
import pageProvider from "@/providers/PageProvider";
import { ErrorBoundary } from "react-error-boundary";
import useAlerts from "@/hooks/useAlerts";
const ImageViewer = dynamic(() => import("@/views/image-processor/ImageViewer"), {
    ssr: false
});
 

export default function JsonToSql() {
    const {
        alert,
        resetAlert,
        setAlertContentType
    } = useAlerts()

    return (<pageProvider.Provider value={{
        pageName: 'imageprocessor',
        ...alert,
        setAlertContentType,
        resetAlert
    }}>
        <ContainerLayout pageName="imageprocessor">
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
                <ImageViewer />
            </ErrorBoundary>
        </ContainerLayout>
    </pageProvider.Provider>)
}