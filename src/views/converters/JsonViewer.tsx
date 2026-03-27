"use client";
import { Text } from "@radix-ui/themes";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function JsonNode({ value, depth = 0 }: { value: JsonValue; depth?: number }) {
    if (value === null) return <span style={{ color: "var(--red-9)" }}>null</span>;
    if (typeof value === "boolean") return <span style={{ color: "var(--lime-9)" }}>{String(value)}</span>;
    if (typeof value === "number") return <span style={{ color: "var(--blue-9)" }}>{value}</span>;
    if (typeof value === "string") return <span style={{ color: "var(--amber-9)" }}>&quot;{value}&quot;</span>;

    if (Array.isArray(value)) {
        if (value.length === 0) return <span style={{ color: "var(--gray-11)" }}>[]</span>;
        return (
            <span>
                <span style={{ color: "var(--gray-11)" }}>[</span>
                {value.map((item, i) => (
                    <div key={i} style={{ paddingLeft: 16 }}>
                        <JsonNode value={item} depth={depth + 1} />
                        {i < value.length - 1 && <span style={{ color: "var(--gray-8)" }}>,</span>}
                    </div>
                ))}
                <span style={{ color: "var(--gray-11)" }}>]</span>
            </span>
        );
    }

    const entries = Object.entries(value as { [key: string]: JsonValue });
    if (entries.length === 0) return <span style={{ color: "var(--gray-11)" }}>{"{}"}</span>;

    return (
        <span>
            <span style={{ color: "var(--gray-11)" }}>{"{"}</span>
            {entries.map(([k, v], i) => (
                <div key={k} style={{ paddingLeft: 16 }}>
                    <span style={{ color: "var(--lime-11)" }}>&quot;{k}&quot;</span>
                    <span style={{ color: "var(--gray-8)" }}>: </span>
                    <JsonNode value={v} depth={depth + 1} />
                    {i < entries.length - 1 && <span style={{ color: "var(--gray-8)" }}>,</span>}
                </div>
            ))}
            <span style={{ color: "var(--gray-11)" }}>{"}"}</span>
        </span>
    );
}

export default function JsonViewer({ raw }: { raw: string }) {
    let parsed: JsonValue;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return (
            <Text size="2" color="red" style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
                Invalid JSON
            </Text>
        );
    }

    return (
        <div style={{
            fontFamily: "monospace",
            fontSize: 13,
            lineHeight: 1.6,
            overflowY: "auto",
            height: "100%",
            padding: "12px 16px",
        }}>
            <JsonNode value={parsed} />
        </div>
    );
}
