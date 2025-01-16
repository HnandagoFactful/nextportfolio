'use client';
import dynamic from 'next/dynamic'

const HomeView = dynamic(
    () => import('@/views/home/HomeView'),
    { ssr: false }
  )
import pageProvider from '@/providers/PageProvider';


export default function Visits() {
    return (
        <pageProvider.Provider value={{
            pageName: 'home'
        }}>
            {/* <ContainerLayout pageName="home"> */}
                <HomeView />
            {/* </ContainerLayout> */}
        </pageProvider.Provider>)
}