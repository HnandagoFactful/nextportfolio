"use client";
import { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { Theme } from "@radix-ui/themes";

import "@radix-ui/themes/styles.css";
import "./theme-primary.css";
import "./theme-dark.css";

export default function AppThemeProvider({ children }: { children: ReactNode }) {
    
    return (<ThemeProvider defaultTheme='dark' attribute="class">
        <Theme appearance="dark" accentColor='blue' panelBackground='translucent'>
            {children}
        </Theme>
    </ThemeProvider>);
}