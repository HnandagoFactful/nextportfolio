import { Box, Card } from "@radix-ui/themes";
import React, { Children } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
const ResponsiveGridLayout = WidthProvider(Responsive);

import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"

export default function TwoColResponsiveLayout({
    children,
    rowHeight = 200,
    useMdForXs = false,
    useMdForXss = false
}: {
    rowHeight?: number;
    useMdForXs?: boolean;
    useMdForXss?: boolean;
    children: React.ReactNode
}) {
    const x = Children.map(children, (child) => child)
    console.log(x, children)
    return (
        <ResponsiveGridLayout
            className="layout"
            isBounded
            rowHeight={rowHeight}
            layouts={{
                lg: [
                    { i: 'a', x: 0, y: 0, w: 6, h: 2, isDraggable: false, isResizable: false },
                    { i: 'b', x: 7, y: 0, w: 6, h: 2, isDraggable: false, isResizable: false },
                ],
                md: [
                    { i: 'a', x: 0, y: 0, w: 6, h: 2, isDraggable: false, isResizable: false },
                    { i: 'b', x: 7, y: 0, w: 6, h: 2, isDraggable: false, isResizable: false },
                ],
                sm: [
                    { i: 'a', x: 0, y: 0, w: 6, h: 2, isDraggable: false, isResizable: false },
                    { i: 'b', x: 7, y: 0, w: 6, h: 2, isDraggable: false, isResizable: false },
                ],
                xs: 
                    !useMdForXs ? [
                        { i: 'a', x: 0, y: 0, w: 12, h: 2, isDraggable: false, isResizable: false },
                        { i: 'b', x: 0, y: 1, w: 12, h: 2, isDraggable: false, isResizable: false }
                    ]
                        : [
                            { i: 'a', x: 0, y: 0, w: 6, h: 2, isDraggable: false, isResizable: false },
                            { i: 'b', x: 7, y: 0, w: 6, h: 2, isDraggable: false, isResizable: false }
                        ],
                xxs: !useMdForXss ?  [
                    { i: 'a', x: 0, y: 0, w: 12, h: 2, isDraggable: false, isResizable: false },
                    { i: 'b', x: 0, y: 1, w: 12, h: 2, isDraggable: false, isResizable: false }
                ]: [
                    { i: 'a', x: 0, y: 0, w: 6, h: 2, isDraggable: false, isResizable: false },
                    { i: 'b', x: 7, y: 0, w: 6, h: 2, isDraggable: false, isResizable: false }
                ]
            }}
            breakpoints={{ lg: 1200, md: 980, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
        >
            <Card key="a" variant="surface">{(children as any[])[0]}</Card>
            <Card key="b" variant="surface">{(children as any[])[1]}</Card>
        </ResponsiveGridLayout>
    );
}