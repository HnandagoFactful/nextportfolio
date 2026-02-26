'use client';

import dynamic from "next/dynamic";
import ContainerLayout from "@/components/globals/ContainerLayout";
import pageProvider from "@/providers/PageProvider";
import { ErrorBoundary } from "react-error-boundary";
import useAlerts from "@/hooks/useAlerts";

const CanvasViewer = dynamic(
    () => import("@/views/canvas/CanvasViewer"),
    { ssr: false }
);

export default function CanvasPage() {
    const { alert, resetAlert, setAlertContentType } = useAlerts();

    return (
        <pageProvider.Provider value={{
            pageName: 'canvas',
            ...alert,
            setAlertContentType,
            resetAlert,
        }}>
            <ContainerLayout pageName="canvas">
                <ErrorBoundary fallback={<div>Something went wrong with the canvas</div>}>
                    <CanvasViewer />
                </ErrorBoundary>
            </ContainerLayout>
        </pageProvider.Provider>
    );
}
