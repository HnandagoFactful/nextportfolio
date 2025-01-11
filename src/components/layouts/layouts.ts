import { Layout } from "react-grid-layout";

export const initial2ColResizeLayout: (initialWidths?: [number, number]) => {[key: string]: Layout[]} = (initialWidths = [6, 6]) => ({
    lg: [
        { i: 'a', x: 0, y: 0, w: initialWidths[0], minW: 3, maxW: 8, h: 2, isDraggable: false, isResizable: true, isBounded: true },
        { i: 'b', x: 7, y: 0, w: initialWidths[1], minW: 3, maxW: 8, h: 2, isDraggable: false, isResizable: false, isBounded: true },
    ],
    md: [
        { i: 'a', x: 0, y: 0, w: initialWidths[0], minW: 3, maxW: 8, h: 2, isDraggable: false, isResizable: true, isBounded: true },
        { i: 'b', x: 7, y: 0, w: initialWidths[1], minW: 3, maxW: 8, h: 2, isDraggable: false, isResizable: false, isBounded: true },
    ],
    sm: [
        { i: 'a', x: 0, y: 0, w: initialWidths[0], minW: 3, maxW: 8, h: 2, isDraggable: false, isResizable: true, isBounded: true },
        { i: 'b', x: 7, y: 0, w: initialWidths[1], minW: 3, maxW: 8, h: 2, isDraggable: false, isResizable: false, isBounded: true },
    ],
    xs:  [
            { i: 'a', x: 0, y: 0, w: initialWidths[0], minW: 3, maxW: 8, h: 2, isDraggable: false, isResizable: true, isBounded: true },
            { i: 'b', x: 7, y: 0, w: initialWidths[1], minW: 3, maxW: 8, h: 2, isDraggable: false, isResizable: false, isBounded: true }
        ],
    xxs: [
        { i: 'a', x: 0, y: 0, w: 12, h: 2, isDraggable: false, isResizable: false, isBounded: true },
        { i: 'b', x: 0, y: 1, w: 12, h: 2, isDraggable: false, isResizable: false, isBounded: true }
    ]
})

export const default2ColResponsiveLayouts = (resizable = false, useMdForXs = false, useMdForXss = false, isStatic = false) => ({
    lg: [
        { i: 'a', x: 0, y: 0, w: 6, minW: 3, maxW: 9, h: 2, isDraggable: false, isResizable: resizable, isStatic },
        { i: 'b', x: 7, y: 0, w: 6, minW: 3, maxW: 9, h: 2, isDraggable: false, isResizable: resizable },
    ],
    md: [
        { i: 'a', x: 0, y: 0, w: 6, minW: 3, maxW: 9, h: 2, isDraggable: false, isResizable: resizable },
        { i: 'b', x: 7, y: 0, w: 6, minW: 3, maxW: 9, h: 2, isDraggable: false, isResizable: resizable },
    ],
    sm: [
        { i: 'a', x: 0, y: 0, w: 6, minW: 3, maxW: 9, h: 2, isDraggable: false, isResizable: resizable },
        { i: 'b', x: 7, y: 0, w: 6, minW: 3, maxW: 9, h: 2, isDraggable: false, isResizable: resizable },
    ],
    xs: 
        !useMdForXs ? [
            { i: 'a', x: 0, y: 0,  minW: 3, w: 12, h: 2, isDraggable: false, isResizable: resizable },
            { i: 'b', x: 0, y: 1,  minW: 3, w: 12, h: 2, isDraggable: false, isResizable: resizable }
        ]
            : [
                { i: 'a', x: 0, y: 0, minW: 3, maxW: 9, w: 6, h: 2, isDraggable: false, isResizable: resizable },
                { i: 'b', x: 7, y: 0, minW: 3, maxW: 9, w: 6, h: 2, isDraggable: false, isResizable: resizable }
            ],
    xxs: !useMdForXss ?  [
        { i: 'a', x: 0, y: 0,  minW: 3, w: 12, h: 2, isDraggable: false, isResizable: resizable },
        { i: 'b', x: 0, y: 1,  minW: 3, w: 12, h: 2, isDraggable: false, isResizable: resizable }
    ]: [
        { i: 'a', x: 0, y: 0,  minW: 3, maxW: 9, w: 6, h: 2, isDraggable: false, isResizable: resizable },
        { i: 'b', x: 7, y: 0, minW: 3, maxW: 8, w: 6, h: 2, isDraggable: false, isResizable: resizable }
    ]
})
