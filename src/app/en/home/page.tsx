'use client';
import useAlerts from '@/hooks/useAlerts';
import pageProvider from '@/providers/PageProvider';
import HomeView from '@/views/home/HomeView';


export default function Visits() {
    const {
        alert,
        resetAlert,
        setAlertContentType
    } = useAlerts()
    return (
        <pageProvider.Provider value={{
            pageName: 'home',
            ...alert,
            resetAlert,
            setAlertContentType
        }}>
            <HomeView />
        </pageProvider.Provider>)
}