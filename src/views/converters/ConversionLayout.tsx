"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Flex, Text, Dialog, Button, TextField } from "@radix-ui/themes";
import { useMediaQuery } from "@uidotdev/usehooks";
import { ChevronDown, ChevronRight, Download, RefreshCw, Upload } from "lucide-react";
import JsonViewer from "./JsonViewer";
import { useConverter, CONVERSION_TABS } from "./ConverterContext";
import type { WorkerResponse as JsonToCsvResponse } from "./jsonToCsv.worker";
import type { WorkerResponse as CsvToJsonResponse } from "./csvToJson.worker";
import type { WorkerResponse as XmlToJsonResponse } from "./xmlToJson.worker";
import type { WorkerResponse as XmlToCsvResponse }  from "./xmlToCsv.worker";
import type { WorkerResponse as ExcelResponse }      from "./jsonToExcel.worker";

function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    return (
        <div style={{
            background: "var(--color-panel-solid)",
            border: "1px solid var(--lime-6)",
            borderRadius: 8,
            overflow: "hidden",
            ...style,
        }}>
            {children}
        </div>
    );
}

function PanelHeader({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
    return (
        <div style={{
            padding: "6px 12px 6px 16px",
            borderBottom: "1px solid var(--lime-6)",
            background: "var(--lime-2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
        }}>
            <Text size="1" style={{ color: "var(--lime-11)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {children}
            </Text>
            {action}
        </div>
    );
}

const EXT_MAP: Partial<Record<string, string>> = {
    "json-to-csv":   "csv",
    "csv-to-json":   "json",
    "xml-to-json":   "json",
    "xml-to-csv":    "csv",
    "csv-to-excel":  "xlsx",
    "json-to-excel": "xlsx",
    "xml-to-excel":  "xlsx",
    "excel-to-json": "json",
};

function DownloadDialog() {
    const { output, outputBuffer, fileName, activeTab } = useConverter();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");

    const ext = EXT_MAP[activeTab] ?? "txt";
    const defaultName = fileName
        ? fileName.replace(/\.[^.]+$/, "") + "." + ext
        : "output." + ext;

    const hasOutput = outputBuffer ? outputBuffer.byteLength > 0 : output.length > 0;

    function handleOpen() {
        setName(defaultName);
        setOpen(true);
    }

    function handleDownload() {
        const safeName = name.trim() || defaultName;
        const blob = outputBuffer
            ? new Blob([outputBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
            : new Blob([output], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = safeName;
        a.click();
        URL.revokeObjectURL(url);
        setOpen(false);
    }

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger disabled={!hasOutput}>
                <button
                    onClick={handleOpen}
                    disabled={!hasOutput}
                    title="Download output"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "4px 10px",
                        background: "var(--lime-4)",
                        border: "1px solid var(--lime-7)",
                        borderRadius: 6,
                        cursor: hasOutput ? "pointer" : "not-allowed",
                        color: "var(--lime-11)",
                        fontSize: 12,
                        fontWeight: 500,
                        opacity: hasOutput ? 1 : 0.4,
                    }}
                >
                    <Download size={13} />
                    Download
                </button>
            </Dialog.Trigger>

            <Dialog.Content maxWidth="400px">
                <Dialog.Title>Download file</Dialog.Title>
                <Dialog.Description size="2" color="gray" mb="4">
                    Choose a name for the downloaded file.
                </Dialog.Description>

                <TextField.Root
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleDownload()}
                    autoFocus
                    placeholder={defaultName}
                />

                <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                        <Button variant="soft" color="gray">Cancel</Button>
                    </Dialog.Close>
                    <Button color="lime" onClick={handleDownload}>
                        Download
                    </Button>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
}

function OutputArea() {
    const { output, outputBuffer, loading, error } = useConverter();

    if (loading) {
        return (
            <Flex align="center" justify="center" style={{ height: "100%", minHeight: 200 }}>
                <Text size="2" color="gray">Converting…</Text>
            </Flex>
        );
    }
    if (error) {
        return (
            <Flex align="center" justify="center" style={{ height: "100%", minHeight: 200 }}>
                <Text size="2" color="red">{error}</Text>
            </Flex>
        );
    }
    if (outputBuffer && outputBuffer.byteLength > 0) {
        return (
            <Flex align="center" justify="center" style={{ height: "100%", minHeight: 200 }}>
                <Text size="2" style={{ color: "var(--lime-11)" }}>Excel file ready — click Download to save</Text>
            </Flex>
        );
    }
    if (!output) {
        return (
            <Flex align="center" justify="center" style={{ height: "100%", minHeight: 200 }}>
                <Text size="2" color="gray">Converted output will appear here</Text>
            </Flex>
        );
    }
    return (
        <pre style={{
            margin: 0,
            padding: "12px 16px",
            fontFamily: "monospace",
            fontSize: 13,
            lineHeight: 1.6,
            overflowY: "auto",
            height: "100%",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            color: "var(--gray-12)",
        }}>
            {output}
        </pre>
    );
}

const FORMAT_LABELS: Record<string, string> = {
    json: "JSON", csv: "CSV", xml: "XML", excel: "Excel",
};

function RawViewer() {
    const { input, inputBuffer, activeTab } = useConverter();
    const fromFormat = CONVERSION_TABS.find(t => t.value === activeTab)?.from ?? "json";

    if (fromFormat === "excel") {
        return (
            <Flex align="center" justify="center" style={{ height: "100%", minHeight: 100 }}>
                <Text size="2" color="gray">{inputBuffer ? "Excel file loaded" : "No file"}</Text>
            </Flex>
        );
    }

    if (fromFormat === "json") {
        return <JsonViewer raw={input} />;
    }

    return (
        <pre style={{
            margin: 0,
            padding: "12px 16px",
            fontFamily: "monospace",
            fontSize: 13,
            lineHeight: 1.6,
            overflowY: "auto",
            height: "100%",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            color: "var(--gray-12)",
        }}>
            {input}
        </pre>
    );
}

function RawAccordion() {
    const { activeTab } = useConverter();
    const fromFormat = CONVERSION_TABS.find(t => t.value === activeTab)?.from ?? "json";
    const label = `Raw ${FORMAT_LABELS[fromFormat] ?? fromFormat}`;
    const [open, setOpen] = useState(false);

    return (
        <Panel>
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    width: "100%",
                    background: "var(--lime-2)",
                    border: "none",
                    cursor: "pointer",
                    padding: "10px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    borderBottom: open ? "1px solid var(--lime-6)" : "none",
                }}
            >
                {open
                    ? <ChevronDown size={14} color="var(--lime-11)" />
                    : <ChevronRight size={14} color="var(--lime-11)" />}
                <Text size="1" style={{ color: "var(--lime-11)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {label}
                </Text>
            </button>
            {open && (
                <div style={{ maxHeight: 300, overflowY: "auto" }}>
                    <RawViewer />
                </div>
            )}
        </Panel>
    );
}

function useRawLabel() {
    const { activeTab } = useConverter();
    const fromFormat = CONVERSION_TABS.find(t => t.value === activeTab)?.from ?? "json";
    return `Raw ${FORMAT_LABELS[fromFormat] ?? fromFormat}`;
}

type TextResponse = JsonToCsvResponse | CsvToJsonResponse | XmlToJsonResponse | XmlToCsvResponse;

function useConversionWorker() {
    const { input, inputBuffer, activeTab, retrigger, setOutput, setOutputBuffer, setLoading, setError } = useConverter();
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        const hasInput = activeTab === "excel-to-json" ? !!inputBuffer : !!input;
        if (!hasInput) return;

        workerRef.current?.terminate();

        const WORKER_MAP: Record<string, () => Worker> = {
            "json-to-csv":   () => new Worker(new URL("./jsonToCsv.worker.ts",   import.meta.url)),
            "csv-to-json":   () => new Worker(new URL("./csvToJson.worker.ts",   import.meta.url)),
            "xml-to-json":   () => new Worker(new URL("./xmlToJson.worker.ts",   import.meta.url)),
            "xml-to-csv":    () => new Worker(new URL("./xmlToCsv.worker.ts",    import.meta.url)),
            "csv-to-excel":  () => new Worker(new URL("./csvToExcel.worker.ts",  import.meta.url)),
            "json-to-excel": () => new Worker(new URL("./jsonToExcel.worker.ts", import.meta.url)),
            "xml-to-excel":  () => new Worker(new URL("./xmlToExcel.worker.ts",  import.meta.url)),
            "excel-to-json": () => new Worker(new URL("./excelToJson.worker.ts", import.meta.url)),
        };

        const createWorker = WORKER_MAP[activeTab];
        if (!createWorker) return;

        const worker = createWorker();
        workerRef.current = worker;

        setLoading(true);
        setError(null);
        setOutput("");
        setOutputBuffer(null);

        const isExcelOutput = activeTab === "csv-to-excel" || activeTab === "json-to-excel" || activeTab === "xml-to-excel";

        if (isExcelOutput) {
            worker.onmessage = (e: MessageEvent<ExcelResponse>) => {
                const msg = e.data;
                if (msg.type === "done") {
                    setOutputBuffer(msg.buffer);
                    setLoading(false);
                    worker.terminate();
                } else if (msg.type === "error") {
                    setError(msg.message);
                    setLoading(false);
                    worker.terminate();
                }
            };
        } else {
            const chunks: string[] = [];
            worker.onmessage = (e: MessageEvent<TextResponse>) => {
                const msg = e.data;
                if (msg.type === "chunk") {
                    chunks.push(msg.data);
                    setOutput(chunks.join(""));
                } else if (msg.type === "done") {
                    setLoading(false);
                    worker.terminate();
                } else if (msg.type === "error") {
                    setError(msg.message);
                    setLoading(false);
                    worker.terminate();
                }
            };
        }

        worker.onerror = (err) => {
            setError(err.message);
            setLoading(false);
            worker.terminate();
        };

        // Send correct payload per worker type
        if (activeTab === "excel-to-json") {
            worker.postMessage({ buffer: inputBuffer }, { transfer: [inputBuffer!] });
        } else if (activeTab === "csv-to-json" || activeTab === "csv-to-excel") {
            worker.postMessage({ csv: input });
        } else if (activeTab.startsWith("xml-")) {
            worker.postMessage({ xml: input });
        } else {
            worker.postMessage({ json: input });
        }

        return () => { worker.terminate(); };
    }, [input, inputBuffer, activeTab, retrigger]);
}

function InputPanelActions() {
    const { activeTab, fileName, loading, triggerRetry, setInput, setInputBuffer, setFileName, setOutput, setOutputBuffer, setError } = useConverter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const fromFormat = CONVERSION_TABS.find(t => t.value === activeTab)?.from ?? "json";
    const isExcelInput = fromFormat === "excel";

    const ACCEPT_MAP: Record<string, string> = {
        json:  ".json,application/json",
        csv:   ".csv,text/csv",
        xml:   ".xml,text/xml,application/xml",
        excel: ".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel",
    };

    const handleFile = useCallback(async (file: File) => {
        try {
            setFileName(file.name);
            setError(null);
            setOutput("");
            setOutputBuffer(null);
            if (isExcelInput) {
                const buf = await new Promise<ArrayBuffer>((res, rej) => {
                    const r = new FileReader();
                    r.onload  = e => res(e.target?.result as ArrayBuffer);
                    r.onerror = () => rej(r.error);
                    r.readAsArrayBuffer(file);
                });
                setInputBuffer(buf);
                setInput("");
            } else {
                const text = await new Promise<string>((res, rej) => {
                    const r = new FileReader();
                    r.onload  = e => res(e.target?.result as string ?? "");
                    r.onerror = () => rej(r.error);
                    r.readAsText(file);
                });
                setInput(text);
                setInputBuffer(null);
            }
        } catch {
            setError(`Failed to read file: ${file.name}`);
        }
    }, [isExcelInput, setFileName, setError, setOutput, setOutputBuffer, setInput, setInputBuffer]);

    return (
        <Flex align="center" gap="2">
            {fileName && (
                <span style={{ fontSize: 11, color: "var(--lime-10)", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {fileName}
                </span>
            )}
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                title="Upload new file"
                style={{
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "4px 10px",
                    background: "var(--lime-4)", border: "1px solid var(--lime-7)",
                    borderRadius: 6, cursor: loading ? "not-allowed" : "pointer",
                    color: "var(--lime-11)", fontSize: 12, fontWeight: 500,
                    opacity: loading ? 0.4 : 1,
                }}
            >
                <Upload size={12} /> Upload
            </button>
            <button
                onClick={triggerRetry}
                disabled={loading}
                title="Re-run conversion"
                style={{
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "4px 10px",
                    background: "var(--lime-4)", border: "1px solid var(--lime-7)",
                    borderRadius: 6, cursor: loading ? "not-allowed" : "pointer",
                    color: "var(--lime-11)", fontSize: 12, fontWeight: 500,
                    opacity: loading ? 0.4 : 1,
                }}
            >
                <RefreshCw size={12} /> Retry
            </button>
            <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT_MAP[fromFormat]}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
                style={{ display: "none" }}
            />
        </Flex>
    );
}

export default function ConversionLayout() {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const rawLabel = useRawLabel();

    useConversionWorker();

    if (isDesktop) {
        return (
            <div style={{
                display: "grid",
                gridTemplateColumns: "40% 60%",
                gap: 12,
                height: "calc(100vh - 160px)",
                padding: "12px 0",
            }}>
                <Panel style={{ display: "flex", flexDirection: "column" }}>
                    <PanelHeader action={<InputPanelActions />}>{rawLabel}</PanelHeader>
                    <div style={{ flex: 1, overflow: "hidden" }}>
                        <RawViewer />
                    </div>
                </Panel>
                <Panel style={{ display: "flex", flexDirection: "column" }}>
                    <PanelHeader action={<DownloadDialog />}>Converted Output</PanelHeader>
                    <div style={{ flex: 1, overflow: "hidden" }}>
                        <OutputArea />
                    </div>
                </Panel>
            </div>
        );
    }

    return (
        <Flex direction="column" gap="3" style={{ padding: "12px 0" }}>
            <RawAccordion />
            <Panel style={{ minHeight: 300, display: "flex", flexDirection: "column" }}>
                <PanelHeader action={<DownloadDialog />}>Converted Output</PanelHeader>
                <div style={{ flex: 1 }}>
                    <OutputArea />
                </div>
            </Panel>
            <InputPanelActions />
        </Flex>
    );
}
