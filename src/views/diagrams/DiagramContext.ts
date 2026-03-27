import { createContext, useContext, type RefObject } from "react";

interface DiagramContextValue {
    showNodeControls: boolean;
    toggleNodeControls: () => void;
    canvasColor: string;
    setCanvasColor: (c: string) => void;
    canvasRef: RefObject<HTMLDivElement | null>;
}

export const DiagramContext = createContext<DiagramContextValue>({
    showNodeControls: true,
    toggleNodeControls: () => {},
    canvasColor: "transparent",
    setCanvasColor: () => {},
    canvasRef: { current: null },
});

export function useDiagramContext() {
    return useContext(DiagramContext);
}
