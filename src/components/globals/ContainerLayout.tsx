"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, ReactNode, useState } from "react";
import clsx from "clsx";
import { Flex, Heading, Section } from "@radix-ui/themes";

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
            <Section className="h-screen w-screen p-0 overflow-y-auto overflow-x-hidden">
                <Flex id="nav-bar" direction={'column'}
                    justify={"center"}
                    gap="1"
                    className={clsx("p-0")}
                    style={{
                        borderBottom: "1px solid var(--lime-9)",
                        boxShadow: scrollPosition > 10 ? "-2px 2px 8px -2px var(--lime-9)" : "unset",
                    }}>
                    <Flex height={"60px"}
                        direction={"row"}
                        justify={"between"}
                        align={'center'}
                        style={{
                            borderColor: "var(--lime-9)",
                        }}>
                        <Heading color="lime" className='pl-4 text-xl sm:text-lg'>
                            {t('global.project')}
                        </Heading>
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