"use client";
import { useRef, useState, useCallback } from "react";
import { Flex, Text, Heading } from "@radix-ui/themes";
import { CONVERSION_TABS, useConverter, type Format, type TabValue } from "./ConverterContext";

const ACCEPT_MAP: Record<Format, string> = {
    json:  ".json,application/json",
    csv:   ".csv,text/csv",
    xml:   ".xml,text/xml,application/xml",
    excel: ".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel",
};

const FORMAT_LABEL: Record<Format, string> = {
    json:  "JSON",
    csv:   "CSV",
    xml:   "XML",
    excel: "Excel (.xlsx / .xls)",
};

function readAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = (e) => resolve(e.target?.result as string ?? "");
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}

function readAsBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = (e) => resolve(e.target?.result as ArrayBuffer);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
}

const EXCEL_TABS = new Set<TabValue>(["excel-to-json"]);

export default function FileUploadZone() {
    const { activeTab, setInput, setInputBuffer, setFileName, setError } = useConverter();
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const currentTab = CONVERSION_TABS.find((t) => t.value === activeTab)!;
    const fromFormat = currentTab.from as Format;
    const accept     = ACCEPT_MAP[fromFormat];

    const handleFile = useCallback(async (file: File) => {
        try {
            setFileName(file.name);
            setError(null);
            if (EXCEL_TABS.has(activeTab)) {
                const buffer = await readAsBuffer(file);
                setInputBuffer(buffer);
                setInput("");
            } else {
                const content = await readAsText(file);
                setInput(content);
                setInputBuffer(null);
            }
        } catch {
            setError(`Failed to read file: ${file.name}`);
        }
    }, [activeTab, setFileName, setInput, setInputBuffer, setError]);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
        e.target.value = "";
    }, [handleFile]);

    return (
        <Flex align="center" justify="center" style={{ height: "65vh" }}>
            <Flex
                direction="column"
                align="center"
                justify="center"
                gap="4"
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                style={{
                    width: 420,
                    height: 260,
                    borderRadius: 12,
                    border: `2px dashed ${dragOver ? "var(--lime-8)" : "var(--lime-6)"}`,
                    background: dragOver ? "var(--lime-2)" : "var(--color-panel-solid)",
                    cursor: "pointer",
                    transition: "border-color 0.15s, background 0.15s",
                    userSelect: "none",
                    padding: 32,
                }}>

                {/* Upload icon */}
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                    stroke={dragOver ? "var(--lime-9)" : "var(--lime-7)"}
                    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transition: "stroke 0.15s" }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                </svg>

                <Flex direction="column" align="center" gap="1">
                    <Heading size="4" style={{ color: "var(--lime-11)" }}>
                        Drop your file here
                    </Heading>
                    <Text size="2" color="gray">
                        or click to browse
                    </Text>
                </Flex>

                <Flex
                    align="center"
                    justify="center"
                    style={{
                        background: "var(--lime-3)",
                        border: "1px solid var(--lime-6)",
                        borderRadius: 6,
                        padding: "4px 14px",
                    }}>
                    <Text size="1" style={{ color: "var(--lime-11)", fontWeight: 500 }}>
                        Accepts: {FORMAT_LABEL[fromFormat]}
                    </Text>
                </Flex>

                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    onChange={onFileChange}
                    style={{ display: "none" }}
                />
            </Flex>
        </Flex>
    );
}
