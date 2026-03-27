"use client";
import * as Popover from "@radix-ui/react-popover";
import { Box, Flex, Text } from "@radix-ui/themes";
import type { NodeData } from "./FlowNode";

interface NodeEditPopoverProps {
    data: NodeData;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onChange: (patch: Partial<NodeData>) => void;
    children: React.ReactNode;
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

export default function NodeEditPopover({ data, open, onOpenChange, onChange, children }: NodeEditPopoverProps) {
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
                        width: 320,
                        zIndex: 1000,
                        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                    }}>
                    <Flex direction="column" gap="3">

                        {/* Label textarea */}
                        <Box>
                            <Text size="1" color="gray" mb="1" as="p">Label</Text>
                            <textarea
                                value={data.label}
                                onChange={(e) => onChange({ label: e.target.value })}
                                placeholder="Node label"
                                rows={3}
                                style={{
                                    ...inputStyle,
                                    resize: "vertical",
                                    lineHeight: 1.5,
                                }}
                            />
                        </Box>

                        {/* Width / Height */}
                        <Flex className="mt-4" gap="3" justify={"between"}>
                            <Box style={{  width: '40%' }}>
                                <Text size="1" color="gray" mb="1" as="p">Width</Text>
                                <input
                                    type="number"
                                    min={40}
                                    max={600}
                                    value={data.width}
                                    onChange={(e) => onChange({ width: Number(e.target.value) })}
                                    style={{ ...inputStyle, height: 32 }}
                                />
                            </Box>
                            <Box style={{  width: '40%' }}>
                                <Text size="1" color="gray" mb="1" as="p">Height</Text>
                                <input
                                    type="number"
                                    min={40}
                                    max={600}
                                    value={data.height}
                                    onChange={(e) => onChange({ height: Number(e.target.value) })}
                                    style={{ ...inputStyle, height: 32 }}
                                />
                            </Box>
                        </Flex>

                        {/* Background color + transparent toggle */}
                        <Box className="mt-4">
                            <Flex align="center" justify="between" className="mb-1">
                                <Text size="1" color="gray">Background</Text>
                                <Flex align="center" gap="2">
                                    <Text size="1" color="gray" className="mr-2">Transparent</Text>
                                    <input
                                        type="checkbox"
                                        checked={data.bgTransparent}
                                        onChange={(e) => onChange({ bgTransparent: e.target.checked })}
                                        style={{ accentColor: "var(--lime-9)", cursor: "pointer", width: 14, height: 14 }}
                                    />
                                </Flex>
                            </Flex>
                            <input
                                type="color"
                                value={data.bgColor}
                                disabled={data.bgTransparent}
                                onChange={(e) => onChange({ bgColor: e.target.value })}
                                style={{ width: "100%", height: 32, borderRadius: 4, border: "1px solid var(--lime-6)", cursor: data.bgTransparent ? "not-allowed" : "pointer", padding: 2, opacity: data.bgTransparent ? 0.4 : 1 }}
                            />
                        </Box>

                        {/* Border color + disable toggle */}
                        <Box className="mt-4">
                            <Flex align="center" justify="between" className="mb-1">
                                <Text size="1" color="gray">Border</Text>
                                <Flex align="center" gap="2">
                                    <Text size="1" color="gray" className="mr-2">Disable</Text>
                                    <input
                                        type="checkbox"
                                        checked={data.borderDisabled}
                                        onChange={(e) => onChange({ borderDisabled: e.target.checked })}
                                        style={{ accentColor: "var(--lime-9)", cursor: "pointer", width: 14, height: 14 }}
                                    />
                                </Flex>
                            </Flex>
                            <Flex gap="2" justify={"between"}>
                                <input
                                    type="color"
                                    value={data.borderColor}
                                    disabled={data.borderDisabled}
                                    onChange={(e) => onChange({ borderColor: e.target.value })}
                                    style={{ width: "60%", height: 32, borderRadius: 4, border: "1px solid var(--lime-6)", cursor: data.borderDisabled ? "not-allowed" : "pointer", padding: 2, opacity: data.borderDisabled ? 0.4 : 1 }}
                                />
                                <input
                                    type="number"
                                    min={1}
                                    max={20}
                                    value={data.borderWidth}
                                    disabled={data.borderDisabled}
                                    onChange={(e) => onChange({ borderWidth: Number(e.target.value) })}
                                    title="Border thickness"
                                    style={{ ...inputStyle, width: 54, height: 32, opacity: data.borderDisabled ? 0.4 : 1 }}
                                />
                            </Flex>
                        </Box>
                    </Flex>
                    <Popover.Arrow style={{ fill: "var(--lime-6)" }} />
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
