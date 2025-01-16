import { Layout } from "react-grid-layout";

export const initial2ColResizeLayout: (initialWidths?: [number, number]) => {[key: string]: Layout[]} = (initialWidths = [6, 6]) => ({
    lg: [
        { i: 'a', x: 0, y: 0, w: initialWidths[0], minW: 3, maxW: 8, h: 9, isDraggable: false, isResizable: true, isBounded: false },
        { i: 'b', x: 7, y: 0, w: initialWidths[1], minW: 3, maxW: 8, h: 9, isDraggable: false, isResizable: false, isBounded: false },
    ],
    md: [
        { i: 'a', x: 0, y: 0, w: initialWidths[0], minW: 3, maxW: 8, h: 9, isDraggable: false, isResizable: true, isBounded: false },
        { i: 'b', x: 7, y: 0, w: initialWidths[1], minW: 3, maxW: 8, h: 9, isDraggable: false, isResizable: false, isBounded: false },
    ],
    sm: [
        { i: 'a', x: 0, y: 0, w: initialWidths[0], minW: 3, maxW: 8, h: 9, isDraggable: false, isResizable: true, isBounded: false },
        { i: 'b', x: 7, y: 0, w: initialWidths[1], minW: 3, maxW: 8, h: 9, isDraggable: false, isResizable: false, isBounded: false },
    ],
    xs:  [
            { i: 'a', x: 0, y: 0, w: initialWidths[0], minW: 3, maxW: 8, h: 9, isDraggable: false, isResizable: true, isBounded: false },
            { i: 'b', x: 7, y: 0, w: initialWidths[1], minW: 3, maxW: 8, h: 9, isDraggable: false, isResizable: false, isBounded: false }
        ],
    xxs: [
        { i: 'a', x: 0, y: 0, w: 12, h: 9, isDraggable: false, isResizable: false, isBounded: false },
        { i: 'b', x: 0, y: 1, w: 12, h: 9, isDraggable: false, isResizable: false, isBounded: false }
    ]
})

export const default2ColResponsiveLayouts = (resizable = false, useMdForXs = false, useMdForXss = false, isStatic = false) => ({
    lg: [
        { i: 'a', x: 0, y: 0, w: 6, minW: 3, maxW: 9, h: 9, isDraggable: false, isResizable: resizable, isStatic,  },
        { i: 'b', x: 7, y: 0, w: 6, minW: 3, maxW: 9, h: 9, isDraggable: false, isResizable: resizable },
    ],
    md: [
        { i: 'a', x: 0, y: 0, w: 6, minW: 3, maxW: 9, h: 9, isDraggable: false, isResizable: resizable },
        { i: 'b', x: 7, y: 0, w: 6, minW: 3, maxW: 9, h: 9, isDraggable: false, isResizable: resizable },
    ],
    sm: [
        { i: 'a', x: 0, y: 0, w: 6, minW: 3, maxW: 9, h: 9, isDraggable: false, isResizable: resizable },
        { i: 'b', x: 7, y: 0, w: 6, minW: 3, maxW: 9, h: 9, isDraggable: false, isResizable: resizable },
    ],
    xs: 
        !useMdForXs ? [
            { i: 'a', x: 0, y: 0,  minW: 3, w: 12, h: 9, isDraggable: false, isResizable: resizable },
            { i: 'b', x: 0, y: 1,  minW: 3, w: 12, h: 9, isDraggable: false, isResizable: resizable }
        ]
            : [
                { i: 'a', x: 0, y: 0, minW: 3, maxW: 9, w: 6, h: 9, isDraggable: false, isResizable: resizable },
                { i: 'b', x: 7, y: 0, minW: 3, maxW: 9, w: 6, h: 9, isDraggable: false, isResizable: resizable }
            ],
    xxs: !useMdForXss ?  [
        { i: 'a', x: 0, y: 0,  minW: 3, w: 12, h: 9, isDraggable: false, isResizable: resizable },
        { i: 'b', x: 0, y: 1,  minW: 3, w: 12, h: 9, isDraggable: false, isResizable: resizable }
    ]: [
        { i: 'a', x: 0, y: 0,  minW: 3, maxW: 9, w: 6, h: 9, isDraggable: false, isResizable: resizable },
        { i: 'b', x: 7, y: 0, minW: 3, maxW: 8, w: 6, h: 9, isDraggable: false, isResizable: resizable }
    ]
})
