"use client";
import React from "react";
import type { ShapeType } from "./FlowNode";

interface ShapeRendererProps {
    shape: ShapeType;
    bgColor: string;
    bgTransparent: boolean;
    borderColor: string;
    borderWidth: number;
    borderDisabled: boolean;
    label: string;
    width: number;
    height: number;
    selected: boolean;
}

export default function ShapeRenderer({
    shape, bgColor, bgTransparent, borderColor, borderWidth, borderDisabled,
    label, width, height, selected,
}: ShapeRendererProps) {
    const border     = borderDisabled ? "none" : `${borderWidth}px solid ${borderColor}`;
    const boxShadow  = selected ? `0 0 0 2px ${borderDisabled ? "var(--lime-9)" : borderColor}55` : undefined;
    const background = bgTransparent ? "transparent" : bgColor;

    const baseStyle: React.CSSProperties = {
        backgroundColor: background,
        border, boxShadow,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 500, color: "#e5e7eb",
        transition: "box-shadow 0.15s",
        userSelect: "none", wordBreak: "break-word",
        textAlign: "center", padding: "4px 8px",
        overflow: "hidden", width, height,
    };

    if (shape === "rectangle" || shape === "square") {
        return <div style={{ ...baseStyle, borderRadius: 6 }}>{label}</div>;
    }
    if (shape === "circle" || shape === "oval") {
        return <div style={{ ...baseStyle, borderRadius: "50%" }}>{label}</div>;
    }
    return null;
}
