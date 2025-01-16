import { Card } from "@radix-ui/themes";
import React from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
const ResponsiveGridLayout = WidthProvider(Responsive);

import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"

export default function ThreeColResponsiveLayout({
    children,
    rowHeight = 200
}: {
    rowHeight?: number;
    children: React.ReactNode
}) {
    return (
        <ResponsiveGridLayout
            className="layout"
            isBounded
            rowHeight={rowHeight}
            layouts={{
                lg: [
                    { i: 'a', x: 0, y: 0, w: 4, h: 2, isDraggable: false, isResizable: false },
                    { i: 'b', x: 4, y: 0, w: 4, h: 2, isDraggable: false, isResizable: false },
                    { i: 'c', x: 9, y: 0, w: 4, h: 2, isDraggable: false, isResizable: false }
                ],
                md: [
                    { i: 'a', x: 0, y: 0, w: 4, h: 2, isDraggable: false, isResizable: false },
                    { i: 'b', x: 4, y: 0, w: 4, h: 2, isDraggable: false, isResizable: false },
                    { i: 'c', x: 9, y: 0, w: 4, h: 2, isDraggable: false, isResizable: false }
                ],
                sm: [
                    { i: 'a', x: 0, y: 0, w: 6, h: 2, isDraggable: false, isResizable: false },
                    { i: 'b', x: 7, y: 0, w: 6, h: 2, isDraggable: false, isResizable: false },
                    { i: 'c', x: 0, y: 1, w: 12, h: 2, isDraggable: false, isResizable: false }
                ],
                xs: [
                    { i: 'a', x: 0, y: 0, w: 12, h: 2, isDraggable: false, isResizable: false },
                    { i: 'b', x: 0, y: 1, w: 12, h: 2, isDraggable: false, isResizable: false },
                    { i: 'c', x: 0, y: 2, w: 12, h: 2, isDraggable: false, isResizable: false }
                ],
                xxs: [
                    { i: 'a', x: 0, y: 0, w: 12, h: 2, isDraggable: false, isResizable: false },
                    { i: 'b', x: 0, y: 1, w: 12, h: 2, isDraggable: false, isResizable: false },
                    { i: 'c', x: 0, y: 2, w: 12, h: 2, isDraggable: false, isResizable: false }
                ],
            }}
            breakpoints={{ lg: 1200, md: 980, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
        >
            <Card key="a" variant="surface">{(children as React.ReactNode[])[0]}</Card>
            <Card key="b" variant="surface">{(children as React.ReactNode[][])[1]}</Card>
            <Card key="c" variant="surface">{(children as React.ReactNode[][])[2]}</Card>
        </ResponsiveGridLayout>
    );
}