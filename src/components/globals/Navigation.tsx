"use client";
import { useState } from "react";
import { Flex, IconButton } from "@radix-ui/themes";
import { useWindowSize } from '@uidotdev/usehooks';
import useIsClient from "@/hooks/useIsClient";
import NavItems from './NavItems';

import { HamburgerMenuIcon, Cross1Icon } from '@radix-ui/react-icons';
import { Heading } from "@radix-ui/themes";
import DirectflowIcon from "@/icons/DirectflowIcon";

export default function Navigation() {
    const isMounted = useIsClient();
    const size = useWindowSize();
    const [isOpen, setIsOpen] = useState(false);

    if (!isMounted) return null;

    if (size && size.width && size.width > 768) {
        return (
            <Flex
                direction={"row"}
                gap={"3"}
                align={"center"}
                justify={"end"}
                width={"200px"}
                className='mr-4'>
                <NavItems />
            </Flex>
        );
    }

    return (
        <>
            <IconButton
                color="lime"
                variant="ghost"
                aria-label="toggle navigation"
                onClick={() => setIsOpen(true)}>
                <HamburgerMenuIcon height={24} width={24} />
            </IconButton>

            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Slide-in panel */}
            <div className={`fixed top-0 right-0 z-50 h-full w-full bg-[var(--color-background)] shadow-xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex items-center justify-between p-4">
                    <Flex align="center" gap="2">
                        <DirectflowIcon size={28} />
                        <Heading size="4" color="lime">Navigation</Heading>
                    </Flex>
                    <IconButton
                        color="lime"
                        variant="ghost"
                        aria-label="close navigation"
                        onClick={() => setIsOpen(false)}>
                        <Cross1Icon height={24} width={24} />
                    </IconButton>
                </div>
                <Flex direction="column" justify={"start"} align={"start"} gap="3" className="px-6 pt-4">
                    
                    <NavItems />
                </Flex>
            </div>
        </>
    );
}
