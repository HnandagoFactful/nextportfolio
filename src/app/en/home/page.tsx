'use client';
import pageProvider from '@/providers/PageProvider';
import HomeView from '@/views/home/HomeView';


export default function Visits() {
    return (
        <pageProvider.Provider value={{
            pageName: 'home'
        }}>
            <HomeView />
        </pageProvider.Provider>)
}