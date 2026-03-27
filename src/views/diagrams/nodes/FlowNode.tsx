"use client";
import { useState, useCallback } from "react";
import { Handle, Position, NodeResizer, useReactFlow, type NodeProps, type ResizeDragEvent, type ResizeParams } from "@xyflow/react";
import ShapeRenderer from "./ShapeRenderer";
import NodeEditPopover from "./NodeEditPopover";
import { useDiagramContext } from "../DiagramContext";

export type ShapeType = "rectangle" | "square" | "circle" | "oval";

export interface NodeData {
    label: string;
    bgColor: string;
    bgTransparent: boolean;
    borderColor: string;
    borderWidth: number;
    borderDisabled: boolean;
    shape: ShapeType;
    width: number;
    height: number;
    [key: string]: unknown;
}

const HANDLE_STYLE: React.CSSProperties = {
    width: 10,
    height: 10,
    background: "var(--lime-9)",
    border: "2px solid var(--lime-11)",
};

export default function FlowNode({ id, data, selected }: NodeProps) {
    const nodeData = data as NodeData;
    const { deleteElements, updateNodeData } = useReactFlow();
    const { showNodeControls } = useDiagramContext();
    const [editOpen, setEditOpen] = useState(false);

    const handleRemove = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        deleteElements({ nodes: [{ id }] });
    }, [id, deleteElements]);

    const handleChange = useCallback((patch: Partial<NodeData>) => {
        updateNodeData(id, patch);
    }, [id, updateNodeData]);

    const handleResize = useCallback((_: ResizeDragEvent, params: ResizeParams) => {
        updateNodeData(id, { width: Math.round(params.width), height: Math.round(params.height) });
    }, [id, updateNodeData]);

    return (
        <div style={{ position: "relative" }}>
            <NodeResizer
                isVisible={!!selected}
                minWidth={40}
                minHeight={40}
                onResize={handleResize}
                lineStyle={{ borderColor: "var(--lime-9)" }}
                handleStyle={{ width: 10, height: 10, borderRadius: 2, background: "var(--lime-9)", border: "2px solid var(--lime-11)" }}
            />
            {showNodeControls && (<>
                {/* Top-left edit button */}
                <NodeEditPopover
                    data={nodeData}
                    open={editOpen}
                    onOpenChange={setEditOpen}
                    onChange={handleChange}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setEditOpen(true); }}
                        title="Edit node"
                        style={{
                            position: "absolute",
                            top: -10,
                            left: -10,
                            zIndex: 10,
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            background: "var(--lime-9)",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            color: "#000",
                            lineHeight: 1,
                        }}>
                        ✎
                    </button>
                </NodeEditPopover>

                {/* Top-right remove button */}
                <button
                    onClick={handleRemove}
                    title="Remove node"
                    style={{
                        position: "absolute",
                        top: -10,
                        right: -10,
                        zIndex: 10,
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: "var(--red-9)",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        color: "#fff",
                        lineHeight: 1,
                    }}>
                    ✕
                </button>
            </>)}

            {/* Each side has both a source and target handle so any direction connects */}
            <Handle id="top-s"    type="source" position={Position.Top}    style={HANDLE_STYLE} />
            <Handle id="top-t"    type="target" position={Position.Top}    style={HANDLE_STYLE} />
            <Handle id="bottom-s" type="source" position={Position.Bottom} style={HANDLE_STYLE} />
            <Handle id="bottom-t" type="target" position={Position.Bottom} style={HANDLE_STYLE} />
            <Handle id="left-s"   type="source" position={Position.Left}   style={HANDLE_STYLE} />
            <Handle id="left-t"   type="target" position={Position.Left}   style={HANDLE_STYLE} />
            <Handle id="right-s"  type="source" position={Position.Right}  style={HANDLE_STYLE} />
            <Handle id="right-t"  type="target" position={Position.Right}  style={HANDLE_STYLE} />

            <ShapeRenderer
                shape={nodeData.shape}
                bgColor={nodeData.bgColor}
                bgTransparent={nodeData.bgTransparent}
                borderColor={nodeData.borderColor}
                borderWidth={nodeData.borderWidth}
                borderDisabled={nodeData.borderDisabled}
                label={nodeData.label}
                width={nodeData.width}
                height={nodeData.height}
                selected={!!selected}
            />
        </div>
    );
}
