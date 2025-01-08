"use client";

import { use } from "react";
import { useTranslations } from 'next-intl';
import pageProvider from "@/providers/PageProvider";
import { Button, IconButton, Text } from "@radix-ui/themes";

export default function NavItems() {
    const {
        pageName
    } = use(pageProvider)
    const t = useTranslations(pageName);
    return (
        <>
            {t?.raw?.('global.navigation')?.map((item: { name: string, path: string }) => {
                return (<Button key={`navigation-${item?.name}`} className="pl-2" color="lime" variant="ghost">
                    <Text size={"4"} weight={item.name?.toLowerCase?.() === pageName ? "bold" : "regular"}>{item?.name}</Text>
                </Button>)
            })}
        </>
    )
}