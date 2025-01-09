'use client';
import ContainerLayout from "@/components/globals/ContainerLayout";
import pageProvider from '@/providers/PageProvider';
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