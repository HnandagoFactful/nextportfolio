"use client";
import { useCallback, type ReactNode } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Box, Flex, Text } from "@radix-ui/themes";
import type { ImageNodeData } from "./ImageNode";

interface Props {
    data: ImageNodeData;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onChange: (patch: Partial<ImageNodeData>) => void;
    children: ReactNode;
}

const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--color-surface)",
    border: "1px solid var(--lime-6)",
    borderRadius: 6,
    color: "var(--gray-12)",
    fontSize: 13,
    padding: "4px 8px",
    outline: "none",
    boxSizing: "border-box",
};

export default function ImageNodeEditPopover({ data, open, onOpenChange, onChange, children }: Props) {
    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            onChange({ imageSrc: ev.target?.result as string });
        };
        reader.readAsDataURL(file);
        // Reset input so the same file can be re-selected
        e.target.value = "";
    }, [onChange]);

    return (
        <Popover.Root open={open} onOpenChange={onOpenChange}>
            <Popover.Trigger asChild>{children}</Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    side="top"
                    sideOffset={8}
                    onInteractOutside={() => onOpenChange(false)}
                    style={{
                        background: "var(--color-panel-solid)",
                        border: "1px solid var(--lime-6)",
                        borderRadius: 10,
                        padding: 20,
                        width: 300,
                        zIndex: 1000,
                        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                    }}>
                    <Flex direction="column" gap="3">

                        {/* Upload file */}
                        <Box>
                            <Text size="1" color="gray" mb="1" as="p">Upload Image</Text>
                            <label style={{
                                display: "flex", alignItems: "center", justifyContent: "center",
                                gap: 6, padding: "8px 12px", borderRadius: 6, cursor: "pointer",
                                border: "1px dashed var(--lime-7)", background: "var(--lime-2)",
                                color: "var(--lime-11)", fontSize: 13, transition: "background 0.15s",
                            }}
                                onMouseEnter={e => (e.currentTarget.style.background = "var(--lime-3)")}
                                onMouseLeave={e => (e.currentTarget.style.background = "var(--lime-2)")}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                                Choose file…
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: "none" }}
                                />
                            </label>
                        </Box>

                        {/* URL input */}
                        <Box>
                            <Text size="1" color="gray" mb="1" as="p">Image URL</Text>
                            <input
                                type="text"
                                placeholder="https://… or /svg/…"
                                value={data.imageSrc.startsWith("data:") ? "" : data.imageSrc}
                                onChange={(e) => onChange({ imageSrc: e.target.value })}
                                style={{ ...inputStyle, height: 32 }}
                            />
                        </Box>

                        {/* Preview */}
                        {data.imageSrc && (
                            <Box>
                                <div style={{
                                    width: "100%", height: 80,
                                    border: "1px solid var(--lime-6)", borderRadius: 6,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    overflow: "hidden", background: "var(--lime-2)",
                                }}>
                                    <img src={data.imageSrc} alt="preview"
                                        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                                </div>
                            </Box>
                        )}

                        {/* Label */}
                        <Box>
                            <Text size="1" color="gray" mb="1" as="p">Label</Text>
                            <textarea
                                rows={2}
                                placeholder="Caption / label"
                                value={data.label}
                                onChange={(e) => onChange({ label: e.target.value })}
                                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
                            />
                        </Box>

                        {/* Width / Height */}
                        <Flex gap="3" justify="between">
                            <Box style={{ width: "40%" }}>
                                <Text size="1" color="gray" mb="1" as="p">Width</Text>
                                <input type="number" min={40} max={800} value={data.width}
                                    onChange={(e) => onChange({ width: Number(e.target.value) })}
                                    style={{ ...inputStyle, height: 32 }} />
                            </Box>
                            <Box style={{ width: "40%" }}>
                                <Text size="1" color="gray" mb="1" as="p">Height</Text>
                                <input type="number" min={40} max={800} value={data.height}
                                    onChange={(e) => onChange({ height: Number(e.target.value) })}
                                    style={{ ...inputStyle, height: 32 }} />
                            </Box>
                        </Flex>

                        {/* Clear image */}
                        {data.imageSrc && (
                            <button
                                onClick={() => onChange({ imageSrc: "" })}
                                style={{
                                    padding: "6px 10px", borderRadius: 6, cursor: "pointer",
                                    border: "1px solid var(--red-7)", background: "transparent",
                                    color: "var(--red-9)", fontSize: 12, fontWeight: 500,
                                }}>
                                Clear Image
                            </button>
                        )}
                    </Flex>
                    <Popover.Arrow style={{ fill: "var(--lime-6)" }} />
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
