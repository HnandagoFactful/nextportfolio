'use client';
import useAlerts from '@/hooks/useAlerts';
import pageProvider from '@/providers/PageProvider';
import ContainerLayout from '@/components/globals/ContainerLayout';
import HomeView from '@/views/home/HomeView';

export default function AboutPage() {
    const {
        alert,
        resetAlert,
        setAlertContentType
    } = useAlerts()
    return (
        <pageProvider.Provider value={{
            pageName: 'about',
            ...alert,
            resetAlert,
            setAlertContentType
        }}>
            <ContainerLayout pageName="about">
                <HomeView />
            </ContainerLayout>
        </pageProvider.Provider>
    )
}
