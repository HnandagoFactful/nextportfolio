import { Layout } from "react-grid-layout";

export const canvasViewerLayout: { [key: string]: Layout[] } = {
  lg: [
    { i: 'a', x: 0, y: 0, w: 12, minW: 1, maxW: 2, h: 1, minH: 5, isDraggable: false, isResizable: false },
    { i: 'b', x: 0, y: 1, w: 10, minW: 4, maxW: 10, h: 18, minH: 10, isDraggable: false, isResizable: true },
    { i: 'c', x: 10, y: 1, w: 2, minW: 2, maxW: 5, h: 18, minH: 10, isDraggable: false, isResizable: true },
  ],
  md: [
    { i: 'a', x: 0, y: 0, w: 12, minW: 1, maxW: 2, h: 1, minH: 10, isDraggable: false, isResizable: false },
    { i: 'b', x: 0, y: 1, w: 9, minW: 4, maxW: 10, h: 18, minH: 10, isDraggable: false, isResizable: true },
    { i: 'c', x: 9, y: 1, w: 3, minW: 2, maxW: 5, h: 18, minH: 10, isDraggable: false, isResizable: true },
  ],
  sm: [
    { i: 'a', x: 0, y: 0, w: 12, h: 1, minH: 2, isDraggable: false, isResizable: false },
    { i: 'b', x: 0, y: 1, w: 12, h: 14, minH: 8, isDraggable: false, isResizable: true },
    { i: 'c', x: 0, y: 15, w: 12, h: 8, minH: 4, isDraggable: false, isResizable: true },
  ],
  xs: [
    { i: 'a', x: 0, y: 0, w: 12, h: 1, minH: 2, isDraggable: false, isResizable: false },
    { i: 'b', x: 0, y: 1, w: 12, h: 14, minH: 8, isDraggable: false, isResizable: true },
    { i: 'c', x: 0, y: 15, w: 12, h: 6, minH: 4, isDraggable: false, isResizable: true },
  ],
  xxs: [
    { i: 'a', x: 0, y: 0, w: 12, h: 1, minH: 2, isDraggable: false, isResizable: false },
    { i: 'b', x: 0, y: 2, w: 12, h: 12, minH: 8, isDraggable: false, isResizable: true },
    { i: 'c', x: 0, y: 14, w: 12, h: 6, minH: 4, isDraggable: false, isResizable: true },
  ],
};
