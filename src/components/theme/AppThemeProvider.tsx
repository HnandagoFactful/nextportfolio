"use client";
import { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { Theme } from "@radix-ui/themes";

import "@radix-ui/themes/styles.css";
import "./theme-primary.css";

export default function AppThemeProvider({ children }: { children: ReactNode }) {
    console.log('theme rendering')
    return (<ThemeProvider attribute="class">
        <Theme className='light'>
            {children}
        </Theme>
    </ThemeProvider>);
}