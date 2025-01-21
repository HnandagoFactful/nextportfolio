"use client";
import { Flex, IconButton } from "@radix-ui/themes";
import { useWindowSize } from '@uidotdev/usehooks';
import useIsClient from "@/hooks/useIsClient";
import NavItems from './NavItems';

import { HamburgerMenuIcon } from '@radix-ui/react-icons';

export default function Navigation() {
    const isMounted = useIsClient();
    const size = useWindowSize();
    if (isMounted) {
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
        )
    }

    return (<IconButton color="lime" variant="ghost" name='expand navigation'>
        <HamburgerMenuIcon height={24} width={24} />
    </IconButton>)
    }
    return null
}