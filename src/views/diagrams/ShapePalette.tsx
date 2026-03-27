"use client";
import { useRef, useState, useEffect } from "react";
import { Flex, Text } from "@radix-ui/themes";
import type { ShapeType } from "./nodes/FlowNode";
import { useDiagramContext } from "./DiagramContext";
import { useReactFlow } from "@xyflow/react";
import { toPng, toJpeg, toSvg } from "html-to-image";

const BORDER = "2px solid var(--lime-9)";
const BG     = "var(--lime-3)";

const BASIC_SHAPES = [
    {
        type: "rectangle" as ShapeType,
        label: "Rectangle",
        preview: <div style={{ width: 48, height: 28, background: BG, border: BORDER, borderRadius: 4 }} />,
    },
    {
        type: "square" as ShapeType,
        label: "Square",
        preview: <div style={{ width: 32, height: 32, background: BG, border: BORDER, borderRadius: 4 }} />,
    },
    {
        type: "circle" as ShapeType,
        label: "Circle",
        preview: <div style={{ width: 32, height: 32, background: BG, border: BORDER, borderRadius: "50%" }} />,
    },
    {
        type: "oval" as ShapeType,
        label: "Oval",
        preview: <div style={{ width: 52, height: 28, background: BG, border: BORDER, borderRadius: "50%" }} />,
    },
];

/* ── helpers ─────────────────────────────────────────────────── */
function download(href: string, name: string) {
    const a = document.createElement("a");
    a.href = href;
    a.download = name;
    a.click();
}

function encodeFlow(data: object): string {
    const json = JSON.stringify(data);
    const bytes = new TextEncoder().encode(json);
    const bin = Array.from(bytes, (b) => String.fromCodePoint(b)).join("");
    return btoa(bin);
}

function decodeFlow(b64: string): object {
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, (c) => c.codePointAt(0)!);
    return JSON.parse(new TextDecoder().decode(bytes));
}

/* ── DraggableTile ───────────────────────────────────────────── */
function DraggableTile({ type, label, preview, onDragStart }: {
    type: ShapeType;
    label: string;
    preview: React.ReactNode;
    onDragStart: (e: React.DragEvent, t: ShapeType) => void;
}) {
    return (
        <Flex
            direction="column" align="center" gap="1"
            draggable onDragStart={(e) => onDragStart(e, type)}
            style={{
                cursor: "grab", padding: "6px 10px", borderRadius: 6,
                border: "1px solid transparent",
                transition: "border-color 0.15s, background 0.15s",
                userSelect: "none", minWidth: 56,
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--lime-6)";
                (e.currentTarget as HTMLElement).style.background  = "var(--lime-2)";
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "transparent";
                (e.currentTarget as HTMLElement).style.background  = "transparent";
            }}>
            <Flex align="center" justify="center" style={{ width: 52, height: 40 }}>
                {preview}
            </Flex>
            <Text size="1" color="gray">{label}</Text>
        </Flex>
    );
}

/* ── ExportMenu ──────────────────────────────────────────────── */
type ExportFormat = "png" | "jpeg" | "svg" | "code";

function ExportMenu() {
    const { canvasColor, setCanvasColor, canvasRef } = useDiagramContext();
    const { getNodes, getEdges, setNodes, setEdges, fitView } = useReactFlow();
    const [open, setOpen] = useState(false);
    const [exporting, setExporting] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const importRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const exportImage = async (fmt: "png" | "jpeg" | "svg") => {
        if (!canvasRef.current || exporting) return;
        setExporting(true);
        setOpen(false);
        try {
            await fitView({ padding: 0.12, duration: 200 });
            await new Promise((r) => setTimeout(r, 280));

            const el = canvasRef.current;
            const bg = canvasColor === "transparent"
                ? (fmt === "jpeg" ? "#ffffff" : undefined)
                : canvasColor;
            const opts = { backgroundColor: bg, pixelRatio: 2 };

            let url: string;
            if (fmt === "png")  url = await toPng(el, opts);
            else if (fmt === "jpeg") url = await toJpeg(el, { ...opts, quality: 0.95 });
            else                url = await toSvg(el, opts);

            download(url, `diagram.${fmt}`);
        } finally {
            setExporting(false);
        }
    };

    const exportCode = () => {
        setOpen(false);
        const payload = {
            version: 1,
            canvasColor,
            nodes: getNodes(),
            edges: getEdges(),
        };
        const b64 = encodeFlow(payload);
        const blob = new Blob([b64], { type: "text/plain" });
        download(URL.createObjectURL(blob), "diagram.flow");
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const raw = (ev.target?.result as string).trim();
                const data = decodeFlow(raw) as {
                    version?: number;
                    canvasColor?: string;
                    nodes?: Parameters<typeof setNodes>[0];
                    edges?: Parameters<typeof setEdges>[0];
                };
                if (data.nodes) setNodes(data.nodes);
                if (data.edges) setEdges(data.edges);
                if (data.canvasColor) setCanvasColor(data.canvasColor);
                setTimeout(() => fitView({ padding: 0.12, duration: 300 }), 50);
            } catch {
                alert("Invalid .flow file.");
            }
        };
        reader.readAsText(file);
        e.target.value = "";
    };

    const btnBase: React.CSSProperties = {
        display: "flex", alignItems: "center", gap: 6,
        padding: "5px 10px", borderRadius: 6,
        border: "1px solid var(--lime-6)",
        background: "transparent", color: "var(--lime-11)",
        cursor: "pointer", fontSize: 12, fontWeight: 500,
        whiteSpace: "nowrap", transition: "background 0.15s",
    };
    const fmtBtn: React.CSSProperties = {
        ...btnBase,
        width: "100%", border: "none",
        borderRadius: 4, padding: "6px 10px",
        justifyContent: "flex-start",
        color: "var(--gray-12)",
    };

    return (
        <div ref={menuRef} style={{ position: "relative", display: "flex", alignItems: "center", gap: 6 }}>
            {/* Canvas color picker */}
            <label
                title="Canvas background color"
                style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
                <div style={{
                    width: 20, height: 20, borderRadius: 4,
                    border: "1px solid var(--lime-6)",
                    background: canvasColor === "transparent" ? "repeating-conic-gradient(var(--lime-3) 0% 25%, var(--lime-2) 0% 50%) 0 0 / 8px 8px" : canvasColor,
                }} />
                <input
                    type="color"
                    value={canvasColor === "transparent" ? "#0f1117" : canvasColor}
                    onChange={(e) => setCanvasColor(e.target.value)}
                    style={{ opacity: 0, position: "absolute", pointerEvents: "none", width: 1, height: 1 }}
                />
                <Text size="1" color="gray">BG</Text>
            </label>

            <button
                onClick={() => setCanvasColor("transparent")}
                title="Reset to transparent"
                style={{ ...btnBase, padding: "4px 7px", fontSize: 10, opacity: canvasColor === "transparent" ? 0.4 : 1 }}>
                ↺
            </button>

            {/* Divider */}
            <div style={{ width: 1, height: 28, background: "var(--lime-6)" }} />

            {/* Export button */}
            <button
                onClick={() => setOpen((o) => !o)}
                disabled={exporting}
                style={{
                    ...btnBase,
                    border: `1px solid ${open ? "var(--lime-7)" : "var(--lime-6)"}`,
                    background: open ? "var(--lime-3)" : "transparent",
                    opacity: exporting ? 0.6 : 1,
                }}>
                {exporting ? "…" : "⬇"} Export
                <span style={{ fontSize: 10, opacity: 0.7 }}>{open ? "▲" : "▼"}</span>
            </button>

            {/* Import button */}
            <label style={{ ...btnBase, padding: "5px 10px" }}>
                ⬆ Import
                <input
                    ref={importRef}
                    type="file"
                    accept=".flow"
                    onChange={handleImport}
                    style={{ display: "none" }}
                />
            </label>

            {/* Dropdown */}
            {open && (
                <div style={{
                    position: "fixed",
                    top: (() => {
                        const el = menuRef.current;
                        if (!el) return 0;
                        return el.getBoundingClientRect().bottom + 6;
                    })(),
                    left: (() => {
                        const el = menuRef.current;
                        if (!el) return 0;
                        return el.getBoundingClientRect().left;
                    })(),
                    zIndex: 1000,
                    background: "var(--color-panel-solid)",
                    border: "1px solid var(--lime-6)",
                    borderRadius: 8, padding: 6,
                    minWidth: 140,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
                    display: "flex", flexDirection: "column", gap: 2,
                }}>
                    <Text size="1" color="gray" style={{ padding: "4px 10px 2px", display: "block" }}>Export as</Text>
                    {(["png", "jpeg", "svg"] as ExportFormat[]).map((fmt) => (
                        <button key={fmt} onClick={() => exportImage(fmt as "png" | "jpeg" | "svg")}
                            style={fmtBtn}
                            onMouseEnter={e => (e.currentTarget.style.background = "var(--lime-3)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                            {fmt.toUpperCase()}
                        </button>
                    ))}
                    <div style={{ height: 1, background: "var(--lime-6)", margin: "4px 0" }} />
                    <button onClick={exportCode} style={fmtBtn}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--lime-3)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        Code <span style={{ fontSize: 10, opacity: 0.6 }}>(.flow)</span>
                    </button>
                </div>
            )}
        </div>
    );
}

/* ── ShapePalette ────────────────────────────────────────────── */
export default function ShapePalette() {
    const { showNodeControls, toggleNodeControls } = useDiagramContext();

    const onDragStart = (e: React.DragEvent, shapeType: ShapeType) => {
        e.dataTransfer.setData("application/reactflow-shape", shapeType);
        e.dataTransfer.effectAllowed = "move";
    };

    const onImageDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData("application/reactflow-image", "image");
        e.dataTransfer.effectAllowed = "move";
    };

    return (
        <Flex id="shape-palette"
            align="center"
            gap="2"
            px="4"
            style={{
                height: 72, minHeight: 72,
                borderBottom: "1px solid var(--lime-6)",
                background: "var(--color-panel-solid)",
                flexShrink: 0, flexWrap: "nowrap", overflowX: "auto",
                position: "relative", zIndex: 100,
            }}>
            <Text size="1" color="gray" style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
                Drag to canvas:
            </Text>

            {BASIC_SHAPES.map((s) => (
                <DraggableTile
                    key={s.type}
                    type={s.type}
                    label={s.label}
                    preview={s.preview}
                    onDragStart={onDragStart}
                />
            ))}

            {/* Divider */}
            <div style={{ width: 1, height: 40, background: "var(--lime-6)", flexShrink: 0, margin: "0 4px" }} />

            {/* Image node tile */}
            <Flex
                direction="column" align="center" gap="1"
                draggable onDragStart={onImageDragStart}
                style={{
                    cursor: "grab", padding: "6px 10px", borderRadius: 6,
                    border: "1px solid transparent",
                    transition: "border-color 0.15s, background 0.15s",
                    userSelect: "none", minWidth: 56,
                }}
                onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--lime-6)";
                    (e.currentTarget as HTMLElement).style.background  = "var(--lime-2)";
                }}
                onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "transparent";
                    (e.currentTarget as HTMLElement).style.background  = "transparent";
                }}>
                <Flex align="center" justify="center" style={{ width: 52, height: 40 }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                        stroke="var(--lime-9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="m21 15-5-5L5 21" />
                    </svg>
                </Flex>
                <Text size="1" color="gray">Image</Text>
            </Flex>

            {/* Right-side controls */}
            <Flex align="center" gap="2" style={{ marginLeft: "auto", flexShrink: 0 }}>
                <ExportMenu />

                {/* Divider */}
                <div style={{ width: 1, height: 28, background: "var(--lime-6)" }} />

                {/* Show/hide node controls */}
                <button
                    onClick={toggleNodeControls}
                    title={showNodeControls ? "Hide node controls" : "Show node controls"}
                    style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "6px 12px", borderRadius: 6,
                        border: `1px solid ${showNodeControls ? "var(--lime-7)" : "var(--gray-6)"}`,
                        background: showNodeControls ? "var(--lime-3)" : "transparent",
                        color: showNodeControls ? "var(--lime-11)" : "var(--gray-10)",
                        cursor: "pointer", fontSize: 12, fontWeight: 500,
                        transition: "all 0.15s", whiteSpace: "nowrap",
                    }}>
                    {showNodeControls ? "✎ Hide Controls" : "✎ Show Controls"}
                </button>
            </Flex>
        </Flex>
    );
}
