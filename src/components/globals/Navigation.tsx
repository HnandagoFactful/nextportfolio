"use client";
import { usePathname } from 'next/navigation'
import { Flex, IconButton } from "@radix-ui/themes";
import { useWindowSize } from '@uidotdev/usehooks';
import useIsClient from "@/hooks/useIsClient";
import NavItems from './NavItems';

import { HamburgerMenuIcon } from '@radix-ui/react-icons';

export default function Navigation() {
    const isMounted = useIsClient();
    const pathname = usePathname()
    const size = useWindowSize();
    if (size && size?.width > 768 && isMounted) {
        return (
            <Flex
                direction={"row"}
                gap={"3"}
                align={"center"}
                justify={"end"}
                width={"75%"}
                className='mr-4'>
                <NavItems />
            </Flex>
        )
    }

    return (<IconButton color="lime" variant="ghost" name='expand navigation'>
        <HamburgerMenuIcon height={24} width={24} />
    </IconButton>)

}