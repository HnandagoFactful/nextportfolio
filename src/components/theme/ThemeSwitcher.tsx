'use client';

import { Button, DropdownMenu, Text } from "@radix-ui/themes";
import useThemeSwitcher from "@/hooks/useThemeSwitcher";
import useIsClient from "@/hooks/useIsClient";

const ThemeSwitcher = () => {
    const { theme, themes, setTheme } = useThemeSwitcher();
    const isMounted = useIsClient()
    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger className="w-20">
                <Button variant="soft" className="p-0" color="lime">
                    <Text className="text-sm">{isMounted ? `${theme ? theme[0].toUpperCase() + theme.slice(1,) : ''}` : ''}</Text>
                    <DropdownMenu.TriggerIcon />
                </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className="w-32">
                {themes.map((item: string, index: number) => {
                    return (<DropdownMenu.Item key={`${index}`} onClick={() => {
                        setTheme(item)
                    }}>{`${item ? item[0].toUpperCase() + item.slice(1,) : ''}`}</DropdownMenu.Item>)
                })}
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    )
}

export default ThemeSwitcher;