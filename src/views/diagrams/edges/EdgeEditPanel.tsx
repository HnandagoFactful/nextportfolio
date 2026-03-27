"use client";
import { useEffect, useRef } from "react";
import { Flex, Text, Box } from "@radix-ui/themes";
import type { EdgeData } from "./FlowEdge";

interface EdgeEditPanelProps {
    x: number;
    y: number;
    data: EdgeData;
    onChange: (patch: Partial<EdgeData>) => void;
    onClose: () => void;
}

function Toggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
    return (
        <div
            onClick={onToggle}
            style={{
                width: 36, height: 20, borderRadius: 10,
                background: active ? "var(--lime-9)" : "var(--gray-6)",
                position: "relative", cursor: "pointer",
                transition: "background 0.2s", flexShrink: 0,
            }}>
            <div style={{
                position: "absolute", top: 2,
                left: active ? 18 : 2,
                width: 16, height: 16, borderRadius: "50%",
                background: "#fff", transition: "left 0.2s",
            }} />
        </div>
    );
}

export default function EdgeEditPanel({ x, y, data, onChange, onClose }: EdgeEditPanelProps) {
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [onClose]);

    // Keep panel inside viewport
    const panelWidth = 220;
    const panelHeight = 160;
    const left = Math.min(x, window.innerWidth  - panelWidth  - 8);
    const top  = Math.min(y, window.innerHeight - panelHeight - 8);

    return (
        <div
            ref={panelRef}
            style={{
                position: "fixed",
                left,
                top,
                width: panelWidth,
                background: "var(--color-panel-solid)",
                border: "1px solid var(--lime-6)",
                borderRadius: 10,
                padding: 16,
                zIndex: 2000,
                boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
            }}>
            <Flex direction="column" gap="3">
                {/* Color */}
                <Box>
                    <Text size="1" color="gray" mb="1" as="p">Connector Color</Text>
                    <input
                        type="color"
                        value={data.color ?? "#84cc16"}
                        onChange={(e) => onChange({ color: e.target.value })}
                        style={{ width: "100%", height: 34, borderRadius: 4, border: "1px solid var(--lime-6)", cursor: "pointer", padding: 2 }}
                    />
                </Box>

                {/* Dashed toggle */}
                <Flex align="center" justify="between">
                    <Text size="1" color="gray">Dashed line</Text>
                    <Toggle active={!!data.dashed} onToggle={() => onChange({ dashed: !data.dashed })} />
                </Flex>

                {/* Animated toggle */}
                <Flex align="center" justify="between">
                    <Text size="1" color="gray">Animated</Text>
                    <Toggle active={!!data.animated} onToggle={() => onChange({ animated: !data.animated })} />
                </Flex>
            </Flex>
        </div>
    );
}
