import { Layout } from "react-grid-layout";

export const initial2ColImgVIewerLayout: {[key: string]: Layout[]} = {
    lg: [
        { i: 'a', x: 0, y: 0, w: 3, minW: 3, maxW: 12, h: 3,  minH: 3, maxH: 20, isDraggable: false, isResizable: false, isBounded: false },
        { i: 'b', x: 3, y: 0, w: 9, minW: 3, maxW: 12, h: 9, isDraggable: false, isResizable: true, isBounded: false },
        { i: 'c', x: 0, y: 4, w: 3, h: 5, isDraggable: false, isResizable: false }
    ],
    md: [
        { i: 'a', x: 0, y: 0, w: 4, minW: 3, maxW: 12, h: 3, isDraggable: false, isResizable: false, isBounded: false },
        { i: 'b', x: 4, y: 0, w: 8, minW: 3, maxW: 12, h: 9, isDraggable: false, isResizable: true, isBounded: false },
        { i: 'c', x: 0, y: 4, w: 4, h: 5, isDraggable: false, isResizable: false }
    ],
    sm: [
        { i: 'a', x: 0, y: 0, w: 12, minW: 3, maxW: 12, h: 3, isDraggable: false, isResizable: false, isBounded: false },
        { i: 'b', x: 0, y: 8, w: 12, minW: 3, maxW: 12, h: 9, isDraggable: false, isResizable: true, isBounded: false },
        { i: 'c', x: 0, y: 4, w: 12, h: 3, isDraggable: false, isResizable: false }
    ],
    xs:  [
            { i: 'a', x: 0, y: 0, w: 12, minW: 3, maxW: 12, h: 3, isDraggable: false, isResizable: true, isBounded: false },
            { i: 'b', x: 0, y: 8, w: 12, minW: 3, maxW: 12, h: 9, isDraggable: false, isResizable: true, isBounded: false },
            { i: 'c', x: 0, y: 4, w: 12, h: 4, isDraggable: false, isResizable: true }
        ],
    xxs: [
        { i: 'a', x: 0, y: 0, w: 12, h: 3, isDraggable: false, isResizable: true, isBounded: false },
        { i: 'b', x: 0, y: 9, w: 12, h: 9, isDraggable: false, isResizable: true, isBounded: false },
        { i: 'c', x: 0, y: 4, w: 12, h: 5,isDraggable: false, isResizable: true }
    ]
}
