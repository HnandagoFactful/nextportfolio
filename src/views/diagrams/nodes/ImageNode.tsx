"use client";
import { useState, useCallback, useRef } from "react";
import {
    Handle, Position, NodeResizer, useReactFlow,
    type NodeProps, type ResizeDragEvent, type ResizeParams,
} from "@xyflow/react";
import { useDiagramContext } from "../DiagramContext";
import ImageNodeEditPopover from "./ImageNodeEditPopover";

export interface ImageNodeData {
    label: string;
    imageSrc: string;
    width: number;
    height: number;
    [key: string]: unknown;
}

const HANDLE_STYLE: React.CSSProperties = {
    width: 10, height: 10,
    background: "var(--lime-9)",
    border: "2px solid var(--lime-11)",
};

export default function ImageNode({ id, data, selected }: NodeProps) {
    const nodeData = data as ImageNodeData;
    const { deleteElements, updateNodeData } = useReactFlow();
    const { showNodeControls } = useDiagramContext();
    const [editOpen, setEditOpen] = useState(false);
    const dropRef = useRef<HTMLDivElement>(null);
    const [dragOver, setDragOver] = useState(false);

    const handleRemove = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        deleteElements({ nodes: [{ id }] });
    }, [id, deleteElements]);

    const handleChange = useCallback((patch: Partial<ImageNodeData>) => {
        updateNodeData(id, patch);
    }, [id, updateNodeData]);

    const handleResize = useCallback((_: ResizeDragEvent, params: ResizeParams) => {
        updateNodeData(id, { width: Math.round(params.width), height: Math.round(params.height) });
    }, [id, updateNodeData]);

    /* Drop an image file directly onto the node */
    const handleFileDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (!file || !file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            updateNodeData(id, { imageSrc: ev.target?.result as string });
        };
        reader.readAsDataURL(file);
    }, [id, updateNodeData]);

    return (
        <div style={{ position: "relative" }}>
            <NodeResizer
                isVisible={!!selected}
                minWidth={60}
                minHeight={60}
                onResize={handleResize}
                lineStyle={{ borderColor: "var(--lime-9)" }}
                handleStyle={{ width: 10, height: 10, borderRadius: 2, background: "var(--lime-9)", border: "2px solid var(--lime-11)" }}
            />

            {showNodeControls && (<>
                <ImageNodeEditPopover
                    data={nodeData}
                    open={editOpen}
                    onOpenChange={setEditOpen}
                    onChange={handleChange}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setEditOpen(true); }}
                        title="Edit node"
                        style={{
                            position: "absolute", top: -10, left: -10, zIndex: 10,
                            width: 22, height: 22, borderRadius: "50%",
                            background: "var(--lime-9)", border: "none", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, color: "#000", lineHeight: 1,
                        }}>
                        ✎
                    </button>
                </ImageNodeEditPopover>
                <button
                    onClick={handleRemove}
                    title="Remove node"
                    style={{
                        position: "absolute", top: -10, right: -10, zIndex: 10,
                        width: 22, height: 22, borderRadius: "50%",
                        background: "var(--red-9)", border: "none", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, color: "#fff", lineHeight: 1,
                    }}>
                    ✕
                </button>
            </>)}

            <Handle id="top-s"    type="source" position={Position.Top}    style={HANDLE_STYLE} />
            <Handle id="top-t"    type="target" position={Position.Top}    style={HANDLE_STYLE} />
            <Handle id="bottom-s" type="source" position={Position.Bottom} style={HANDLE_STYLE} />
            <Handle id="bottom-t" type="target" position={Position.Bottom} style={HANDLE_STYLE} />
            <Handle id="left-s"   type="source" position={Position.Left}   style={HANDLE_STYLE} />
            <Handle id="left-t"   type="target" position={Position.Left}   style={HANDLE_STYLE} />
            <Handle id="right-s"  type="source" position={Position.Right}  style={HANDLE_STYLE} />
            <Handle id="right-t"  type="target" position={Position.Right}  style={HANDLE_STYLE} />

            <div
                ref={dropRef}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                style={{
                    width: nodeData.width,
                    height: nodeData.height,
                    position: "relative",
                    border: dragOver
                        ? "2px dashed var(--lime-9)"
                        : selected
                            ? "2px solid var(--lime-9)"
                            : "2px solid var(--lime-6)",
                    borderRadius: 6,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: dragOver ? "var(--lime-3)" : "var(--lime-2)",
                    transition: "border-color 0.15s, background 0.15s",
                    userSelect: "none",
                }}>

                {nodeData.imageSrc ? (
                    <img
                        src={nodeData.imageSrc}
                        alt={nodeData.label || "node image"}
                        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                        draggable={false}
                    />
                ) : (
                    <div style={{
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                        color: "var(--lime-9)", opacity: 0.7, pointerEvents: "none",
                    }}>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="m21 15-5-5L5 21" />
                        </svg>
                        <span style={{ fontSize: 11, textAlign: "center", padding: "0 8px" }}>
                            Drop image or click ✎
                        </span>
                    </div>
                )}

                {nodeData.label && (
                    <div style={{
                        position: "absolute", bottom: 0, left: 0, right: 0,
                        background: "rgba(0,0,0,0.6)",
                        padding: "3px 8px",
                        fontSize: 12, fontWeight: 500,
                        color: "#e5e7eb", textAlign: "center",
                        userSelect: "none", wordBreak: "break-word",
                    }}>
                        {nodeData.label}
                    </div>
                )}
            </div>
        </div>
    );
}
