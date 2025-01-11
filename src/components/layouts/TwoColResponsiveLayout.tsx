import { Box, Card } from "@radix-ui/themes";
import React, { Children } from "react";
import { Layouts, Responsive, WidthProvider } from "react-grid-layout";

import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"
import { default2ColResponsiveLayouts } from "./layouts";
import { TResizeHandles } from "./types";


const ResponsiveGridLayout = WidthProvider(Responsive);

export default function TwoColResponsiveLayout({
    children,
    rowHeight = 50,
    useMdForXs = false,
    useMdForXss = false,
    resizable = false,
    isStatic = false,
    customLayouts = null,
    height = 'auto',
    resizeHandles = ["e"],
    onResize
}: {
    rowHeight?: number;
    useMdForXs?: boolean;
    useMdForXss?: boolean;
    resizable?: boolean;
    customLayouts?: Layouts | null;
    isStatic?: boolean;
    height?: string;
    resizeHandles?: TResizeHandles[] | undefined;
    onResize?: ReactGridLayout.ItemCallback | undefined;
    children: React.ReactNode
}) {
    return (
        <ResponsiveGridLayout
            className="layout"
            maxRows={10}
            style={{ minHeight: 11 * rowHeight }}
            isBounded
            rowHeight={rowHeight}
            autoSize
            onResize={customLayouts ? onResize : undefined}
            resizeHandles={resizeHandles}
            compactType={"horizontal"}
            layouts={customLayouts ?? default2ColResponsiveLayouts(resizable, useMdForXs, useMdForXss, isStatic)}
            breakpoints={{ lg: 1200, md: 980, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
        >
            <Card key="a" variant="surface">{(children as any[])[0]}</Card>
            <Card key="b" variant="surface">{(children as any[])[1]}</Card>
        </ResponsiveGridLayout>
    );
}