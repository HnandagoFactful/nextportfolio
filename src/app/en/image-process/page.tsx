'use client';

import dynamic from "next/dynamic";
import ContainerLayout from "@/components/globals/ContainerLayout";
import { Spinner, Text } from '@radix-ui/themes'
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
        <ContainerLayout pageName="home">
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
                <ImageViewer />
                <Spinner />
            </ErrorBoundary>
        </ContainerLayout>
    </pageProvider.Provider>)
}