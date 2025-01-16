"use client";

import { use } from "react";
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl';
import pageProvider from "@/providers/PageProvider";
import { Button, Text } from "@radix-ui/themes";

export default function NavItems() {
    const {
        pageName
    } = use(pageProvider)
    const t = useTranslations(pageName);
    
    const router = useRouter()
    return (
        <>
            {t?.raw?.('global.navigation')?.map((item: { name: string, path: string; alias: string; isVisible?: boolean }) => {
                if (!item.isVisible) {
                    return null;
                }
                return (<Button key={`navigation-${item?.name}`}
                    className="pl-2"
                    color="lime"
                    variant="ghost"
                    onClick={() => router.push(item.path)}>
                    <Text size={"4"} weight={item.alias === pageName ? "bold" : "regular"}>{item?.name}</Text>
                </Button>)
            })}
        </>
    )
}