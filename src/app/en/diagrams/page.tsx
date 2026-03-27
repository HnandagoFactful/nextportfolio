'use client';
import dynamic from 'next/dynamic';
import useAlerts from '@/hooks/useAlerts';
import pageProvider from '@/providers/PageProvider';
import ContainerLayout from '@/components/globals/ContainerLayout';

const DiagramsView = dynamic(() => import('@/views/diagrams/DiagramsView'), { ssr: false });

export default function DiagramsPage() {
    const {
        alert,
        resetAlert,
        setAlertContentType
    } = useAlerts()
    return (
        <pageProvider.Provider value={{
            pageName: 'diagrams',
            ...alert,
            resetAlert,
            setAlertContentType
        }}>
            <ContainerLayout pageName="diagrams">
                <DiagramsView />
            </ContainerLayout>
        </pageProvider.Provider>
    )
}
