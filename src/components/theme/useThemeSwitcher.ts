'use client';

import { useTheme } from "next-themes"

export default function useThemeSwitcher() {
    const {theme, themes, setTheme} = useTheme();

    return {
        theme: theme ?? '',
        themes,
        setTheme
    }
}