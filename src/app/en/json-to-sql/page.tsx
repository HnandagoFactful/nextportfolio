'use client';
import ContainerLayout from "@/components/globals/ContainerLayout";
import pageProvider from "@/providers/PageProvider";
import useAlerts from "@/hooks/useAlerts";
import ConverterView from "@/views/converters/ConverterView";

export default function ConverterPage() {
    const { alert, resetAlert, setAlertContentType } = useAlerts();

    return (
        <pageProvider.Provider value={{ pageName: 'converter', ...alert, resetAlert, setAlertContentType }}>
            <ContainerLayout pageName="converter">
                <ConverterView />
            </ContainerLayout>
        </pageProvider.Provider>
    );
}
