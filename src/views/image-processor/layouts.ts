import { Layout } from "react-grid-layout";

// rowHeight=50px → h:16 ≈ 800px, enough to contain calc(100vh-220px) on most screens.
// Panel b (cropper) is taller by default and user-resizable.
export const initial2ColImgVIewerLayout: {[key: string]: Layout[]} = {
    lg: [
        { i: 'a', x: 0, y: 0, w: 3, minW: 3, maxW: 12, h: 3,  minH: 3, maxH: 20, isDraggable: false, isResizable: false, isBounded: false },
        { i: 'b', x: 3, y: 0, w: 9, minW: 3, maxW: 12, h: 16, minH: 8, isDraggable: false, isResizable: true, isBounded: false },
        { i: 'c', x: 0, y: 4, w: 3, h: 5, isDraggable: false, isResizable: false }
    ],
    md: [
        { i: 'a', x: 0, y: 0, w: 4, minW: 3, maxW: 12, h: 3, isDraggable: false, isResizable: false, isBounded: false },
        { i: 'b', x: 4, y: 0, w: 8, minW: 3, maxW: 12, h: 16, minH: 8, isDraggable: false, isResizable: true, isBounded: false },
        { i: 'c', x: 0, y: 4, w: 4, h: 5, isDraggable: false, isResizable: false }
    ],
    sm: [
        { i: 'a', x: 0, y: 0, w: 12, minW: 3, maxW: 12, h: 3, isDraggable: false, isResizable: false, isBounded: false },
        { i: 'b', x: 0, y: 8, w: 12, minW: 3, maxW: 12, h: 14, minH: 8, isDraggable: false, isResizable: true, isBounded: false },
        { i: 'c', x: 0, y: 4, w: 12, h: 3, isDraggable: false, isResizable: false }
    ],
    xs: [
        { i: 'a', x: 0, y: 0, w: 12, minW: 3, maxW: 12, h: 3, isDraggable: false, isResizable: true, isBounded: false },
        { i: 'b', x: 0, y: 8, w: 12, minW: 3, maxW: 12, h: 14, minH: 8, isDraggable: false, isResizable: true, isBounded: false },
        { i: 'c', x: 0, y: 4, w: 12, h: 4, isDraggable: false, isResizable: true }
    ],
    xxs: [
        { i: 'a', x: 0, y: 0, w: 12, h: 3, isDraggable: false, isResizable: true, isBounded: false },
        { i: 'b', x: 0, y: 9, w: 12, h: 14, minH: 8, isDraggable: false, isResizable: true, isBounded: false },
        { i: 'c', x: 0, y: 4, w: 12, h: 5, isDraggable: false, isResizable: true }
    ]
}
