"use client";
import { useRouter } from 'next/router'
import { useEffect, useRef, ReactNode, useState } from "react";
import clsx from "clsx";
import { Box, IconButton, Flex, Heading, ScrollArea, Text, Section, Button } from "@radix-ui/themes";
import ThemeSwitcher from "../theme/ThemeSwitcher";

import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import Navigation from './Navigation';
import { useTranslations } from 'next-intl';

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
            return () => layoutContentRef.current.removeEventListener('scroll', onScroll);
        }
    }, [])
    return (
        <Section className="h-screen w-screen p-0">
            <Flex id="nav-bar" direction={'column'}
                justify={"center"}
                gap="1"
                className={clsx("p-0")}
                style={{
                    borderBottom: "2px solid var(--lime-9)",
                    boxShadow: scrollPosition > 10 ? "-2px 2px 8px -2px var(--lime-9)" : "unset",
                }}>
                <Flex height={"60px"}
                    direction={"row"}
                    justify={"between"}
                    align={'center'}
                    style={{
                        borderColor: "var(--lime-9)",
                    }}>
                    <Heading color="lime" size={"8"} className='pl-4'>
                        {t('global.project')}
                    </Heading>
                    <Navigation />
                    <Box className="pr-4">
                        <ThemeSwitcher />
                    </Box>
                </Flex>
            </Flex>

            <ScrollArea ref={layoutContentRef}
                type="always"
                scrollbars="vertical"
                className="pt-4 pl-4 pr-4 w-screen"
                style={{
                    height: 'calc(100vh - 62px)',
                    background: "linear-gradient(to top, var(--lime-2), transparent)"
                }}>
                    {children}
            </ScrollArea>
        </Section>
    );
}