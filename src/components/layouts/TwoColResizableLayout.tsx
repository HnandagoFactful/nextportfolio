import { useState } from "react"
import { Layout, Layouts } from "react-grid-layout"
import TwoColResponsiveLayout from "./TwoColResponsiveLayout";

import { initial2ColResizeLayout } from './layouts';

export default function TwoColResizableLayout({ initialWidths = [6, 6], children }: {
    initialWidths?: [number, number]
    children?: React.ReactNode
}) {
    const [layouts, setLayouts] = useState<Layouts>(initial2ColResizeLayout(initialWidths));
    const onResize = (
        layout: Layout[],
        oldItem: Layout,
        newItem: Layout,
    ) => {
        const otherItem = layout.find((item: Layout) => item.i != newItem.i);
        if (otherItem) {
            if (newItem.w > 8) {
                otherItem.w = 12;
                otherItem.y = 1;
            } else {
                otherItem.w = 12 - newItem.w;
                otherItem.y = 0;
            }
            setLayouts({
                lg: [
                    newItem,
                    otherItem
                ],
                md: [
                    newItem,
                    otherItem
                ],
                sm: [
                    newItem,
                    otherItem
                ],
                xs: [
                    newItem,
                    otherItem
                ],
                xxs: layouts.xxs
            })
        }
    }
    return (
        <TwoColResponsiveLayout
            resizeHandles={["e"]}
            customLayouts={layouts}
            onResize={onResize}>
            {children}
        </TwoColResponsiveLayout>
    )
}