"use client";
import { useCallback, useMemo, useState, useRef } from "react";
import { DiagramContext, useDiagramContext } from "./DiagramContext";
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    ReactFlowProvider,
    useReactFlow,
    BackgroundVariant,
    ConnectionMode,
    type Connection,
    type Node,
    type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./diagrams.css";

import ShapePalette from "./ShapePalette";
import FlowNode from "./nodes/FlowNode";
import ImageNode from "./nodes/ImageNode";
import FlowEdge from "./edges/FlowEdge";
import EdgeEditPanel from "./edges/EdgeEditPanel";
import type { ShapeType, NodeData } from "./nodes/FlowNode";
import type { ImageNodeData } from "./nodes/ImageNode";
import type { EdgeData } from "./edges/FlowEdge";

const nodeTypes = { flowNode: FlowNode, imageNode: ImageNode };
const edgeTypes = { flowEdge: FlowEdge };

interface ShapeDefaults {
    bgColor: string;
    bgTransparent: boolean;
    borderColor: string;
    borderWidth: number;
    borderDisabled: boolean;
    width: number;
    height: number;
}

const SHAPE_DEFAULTS: Record<ShapeType, ShapeDefaults> = {
    rectangle: { bgColor: "#1a1a2e", bgTransparent: false, borderColor: "var(--lime-6)", borderWidth: 2, borderDisabled: false, width: 140, height: 60  },
    square:    { bgColor: "#1a1a2e", bgTransparent: false, borderColor: "var(--lime-6)", borderWidth: 2, borderDisabled: false, width: 90,  height: 90  },
    circle:    { bgColor: "#1a1a2e", bgTransparent: false, borderColor: "var(--lime-6)", borderWidth: 2, borderDisabled: false, width: 90,  height: 90  },
    oval:      { bgColor: "#1a1a2e", bgTransparent: false, borderColor: "var(--lime-6)", borderWidth: 2, borderDisabled: false, width: 140, height: 70  },
};

const DEFAULT_EDGE_DATA: EdgeData = { color: "var(--lime-4)", dashed: false, animated: false };

let nodeCounter = 1;

interface EditingEdge {
    id: string;
    x: number;
    y: number;
    data: EdgeData;
}

function DiagramCanvas() {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [editingEdge, setEditingEdge] = useState<EditingEdge | null>(null);
    const { screenToFlowPosition } = useReactFlow();
    const { canvasColor, canvasRef } = useDiagramContext();

    const onConnect = useCallback(
        (connection: Connection) =>
            setEdges((eds) =>
                addEdge({ ...connection, type: "flowEdge", data: { ...DEFAULT_EDGE_DATA } }, eds)
            ),
        [setEdges]
    );

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    }, []);

    const onDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });

            if (e.dataTransfer.getData("application/reactflow-image") === "image") {
                const newNode: Node = {
                    id: `node-${nodeCounter++}`,
                    type: "imageNode",
                    position,
                    data: { label: "", imageSrc: "", width: 120, height: 120 } satisfies ImageNodeData,
                };
                setNodes((nds) => [...nds, newNode]);
                return;
            }

            const shapeType = e.dataTransfer.getData("application/reactflow-shape") as ShapeType;
            if (!shapeType) return;

            const newNode: Node = {
                id: `node-${nodeCounter++}`,
                type: "flowNode",
                position,
                data: {
                    label: shapeType.charAt(0).toUpperCase() + shapeType.slice(1),
                    shape: shapeType,
                    ...SHAPE_DEFAULTS[shapeType],
                } satisfies NodeData,
            };
            setNodes((nds) => [...nds, newNode]);
        },
        [screenToFlowPosition, setNodes]
    );

    const onEdgeDoubleClick = useCallback(
        (e: React.MouseEvent, edge: Edge) => {
            e.stopPropagation();
            setEditingEdge({
                id: edge.id,
                x: e.clientX + 8,
                y: e.clientY + 8,
                data: { ...DEFAULT_EDGE_DATA, ...(edge.data as EdgeData) },
            });
        },
        []
    );

    const onEdgeChange = useCallback(
        (patch: Partial<EdgeData>) => {
            if (!editingEdge) return;
            const updated = { ...editingEdge.data, ...patch };
            setEditingEdge((prev) => prev ? { ...prev, data: updated } : null);
            setEdges((eds) =>
                eds.map((e) =>
                    e.id === editingEdge.id
                        ? { ...e, animated: updated.animated, data: updated }
                        : e
                )
            );
        },
        [editingEdge, setEdges]
    );

    const memoNodeTypes = useMemo(() => nodeTypes, []);
    const memoEdgeTypes = useMemo(() => edgeTypes, []);

    return (
        <>
            <div
                ref={canvasRef}
                className="my-[12px] mx-[20px]"
                style={{
                    flex: 1, minHeight: 0,
                    background: canvasColor === "transparent" ? "var(--lime-2)" : canvasColor,
                    padding: 16,
                }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    nodeTypes={memoNodeTypes}
                    edgeTypes={memoEdgeTypes}
                    onEdgeDoubleClick={onEdgeDoubleClick}
                    connectionMode={ConnectionMode.Loose}
                    defaultEdgeOptions={{ type: "flowEdge", data: { ...DEFAULT_EDGE_DATA } }}
                    fitView
                    style={{ background: "transparent" }}>
                    <Background
                        variant={BackgroundVariant.Dots}
                        gap={20}
                        size={1}
                        color="var(--lime-5)"
                    />
                    <Controls
                        style={{
                            background: "var(--lime-12)",
                            border: "1px solid var(--lime-12)",
                            borderRadius: 8,
                        }}
                        className="shadow-md diagram-controls"
                    />
                    <MiniMap
                        style={{
                            background: "var(--color-panel-solid)",
                            border: "1px solid var(--lime-6)",
                        }}
                        nodeColor="var(--lime-6)"
                    />
                </ReactFlow>
            </div>

            {editingEdge && (
                <EdgeEditPanel
                    x={editingEdge.x}
                    y={editingEdge.y}
                    data={editingEdge.data}
                    onChange={onEdgeChange}
                    onClose={() => setEditingEdge(null)}
                />
            )}
        </>
    );
}

export default function DiagramsView() {
    const [showNodeControls, setShowNodeControls] = useState(true);
    const [canvasColor, setCanvasColor] = useState("transparent");
    const canvasRef = useRef<HTMLDivElement>(null);

    return (
        <DiagramContext.Provider value={{
            showNodeControls,
            toggleNodeControls: () => setShowNodeControls(v => !v),
            canvasColor,
            setCanvasColor,
            canvasRef,
        }}>
            <ReactFlowProvider>
                <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 76px)" }}>
                    <ShapePalette />
                    <DiagramCanvas />
                </div>
            </ReactFlowProvider>
        </DiagramContext.Provider>
    );
}
