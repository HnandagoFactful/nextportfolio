"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, ReactNode, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { Flex, Section, Heading } from "@radix-ui/themes";

import Navigation from './Navigation';
import { useTranslations } from 'next-intl';
import { TranslationProvider } from "@/providers/TranslationProvider";

export default function ContainerLayout({ children, pageName }: { children: ReactNode, pageName: string }) {
    const layoutContentRef = useRef<any>(null);
    const t = useTranslations(pageName)
    const [scrollPosition, setScrollPOsition] = useState<number>(0);
    const onScroll = function (event: any) {
        setScrollPOsition(event.srcElement.scrollTop)
    }
    useEffect(function () {
        if (layoutContentRef.current) {

            layoutContentRef.current.addEventListener('scroll', onScroll, { passive: true });
            return () => {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                layoutContentRef?.current?.removeEventListener?.('scroll', onScroll);
            }
        }
    }, [])

    return (
        <TranslationProvider.Provider value={{
            pageName,
            translation: undefined
        }}>
            <Section style={{
                paddingTop: 0
            }} className="h-screen w-screen p-0 pt-0! overflow-y-auto overflow-x-hidden">
                <Flex id="nav-bar" direction={'column'}
                    justify={"center"}
                    gap="1"
                    className={clsx("p-0")}
                    style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 50,
                        borderBottom: "1px solid var(--lime-9)", 
                        background: "linear-gradient(to right, var(--lime-2) 10%, var(--lime-8) 30%, var(--lime-2))",
                        boxShadow: scrollPosition > 10 ? "-2px 2px 8px -2px var(--lime-9)" : "unset",
                    }}>
                    <Flex height={"60px"}
                        direction={"row"}
                        justify={"between"}
                        align={'center'}
                        style={{
                            borderColor: "var(--lime-9)",
                        }}>

                        <Flex direction={"row"} align={"center"}>
                            <Image
                                src="/icon.png"
                                alt={t('global.project')}
                                height={26}
                                width={90}
                                className="object-contain"
                            />
                            <Heading className='pl-4 text-2xl sm:text-2xl' style={{ color: "#e6effff0" }}>
                                {t('global.project')}
                            </Heading>
                        </Flex>
                        <Flex direction={"row"} gap="2" align={"center"}>
                            <Navigation />
                        </Flex>
                    </Flex>
                </Flex>
                <Section className="relative !pt-4">
                    {children}
                </Section>
            </Section>
        </TranslationProvider.Provider>
    );
}