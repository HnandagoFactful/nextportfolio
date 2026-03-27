"use client";
import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react";

export interface EdgeData {
    color: string;
    dashed: boolean;
    animated: boolean;
    [key: string]: unknown;
}

export default function FlowEdge({
    sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition,
    data, markerEnd, style,
}: EdgeProps) {
    const edgeData = (data ?? {}) as EdgeData;
    const color  = edgeData.color  ?? "var(--lime-4)";
    const dashed = edgeData.dashed ?? false;

    const [edgePath] = getSmoothStepPath({
        sourceX, sourceY, targetX, targetY,
        sourcePosition, targetPosition,
    });

    return (
        <BaseEdge
            path={edgePath}
            markerEnd={markerEnd}
            style={{
                ...style,
                stroke: color,
                strokeWidth: 2,
                strokeDasharray: dashed ? "8 5" : undefined,
            }}
        />
    );
}
