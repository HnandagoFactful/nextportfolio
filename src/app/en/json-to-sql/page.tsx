'use client';
import ContainerLayout from "@/components/layouts/ContainerLayout";
import { Text } from "@radix-ui/themes";
import pageProvider from '@/providers/PageProvider';
import HomeView from "@/views/home/HomeView";
import StaticTwoColResponsive from "@/components/layouts/StaticTwoColResponsive";

export default function JsonToSql() {

    return (  <pageProvider.Provider value={{
        pageName: 'jsontosql'
    }}>
        <ContainerLayout pageName="jsontosql">
            <StaticTwoColResponsive />
        </ContainerLayout>
    </pageProvider.Provider>)
}