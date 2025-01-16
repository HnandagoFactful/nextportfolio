"use client";

import { initial2ColResizeLayout } from "./layouts";
import TwoColResponsiveLayout from "./TwoColResponsiveLayout";

export default function StaticTwoColResponsive({ initialWidths = [6, 6], children }: {
    initialWidths?: [number, number]
    children?: React.ReactNode
}) {
    return (
        <TwoColResponsiveLayout
            resizeHandles={[]}
            customLayouts={initial2ColResizeLayout((initialWidths))}>
            {children}
        </TwoColResponsiveLayout>
    )
}