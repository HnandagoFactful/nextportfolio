'use client';
import ContainerLayout from "@/components/layouts/ContainerLayout";
import { Text } from "@radix-ui/themes";
import pageProvider from '@/providers/PageProvider';
import HomeView from "@/views/home/HomeView";

export default function Visits() {
    return (
        <pageProvider.Provider value={{
            pageName: 'home'
        }}>
            <ContainerLayout pageName="home">
                <Text>Home</Text>
                <HomeView />
            </ContainerLayout>
        </pageProvider.Provider>)
}