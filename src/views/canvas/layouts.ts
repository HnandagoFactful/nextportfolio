import ReactGridLayout from "react-grid-layout";

export const canvasViewerLayout: { [key: string]: ReactGridLayout.Layout[] } = {
  lg: [
    { i: 'b', x: 0, y: 0, w: 10, minW: 4, maxW: 10, h: 18, minH: 10, isDraggable: false, isResizable: true },
    { i: 'c', x: 10, y: 0, w: 2, minW: 2, maxW: 5, h: 18, minH: 10, isDraggable: false, isResizable: true },
  ],
  md: [
    { i: 'b', x: 0, y: 0, w: 9, minW: 4, maxW: 10, h: 18, minH: 10, isDraggable: false, isResizable: true },
    { i: 'c', x: 9, y: 0, w: 3, minW: 2, maxW: 5, h: 18, minH: 10, isDraggable: false, isResizable: true },
  ],
  sm: [
    { i: 'b', x: 0, y: 0, w: 12, h: 14, minH: 8, isDraggable: false, isResizable: true },
    { i: 'c', x: 0, y: 14, w: 12, h: 8, minH: 4, isDraggable: false, isResizable: true },
  ],
  xs: [
    { i: 'b', x: 0, y: 0, w: 12, h: 14, minH: 8, isDraggable: false, isResizable: true },
    { i: 'c', x: 0, y: 14, w: 12, h: 6, minH: 4, isDraggable: false, isResizable: true },
  ],
  xxs: [
    { i: 'b', x: 0, y: 0, w: 12, h: 12, minH: 8, isDraggable: false, isResizable: true },
    { i: 'c', x: 0, y: 12, w: 12, h: 6, minH: 4, isDraggable: false, isResizable: true },
  ],
};
