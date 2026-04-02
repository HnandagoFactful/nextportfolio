import * as XLSX from "xlsx";
import { XMLParser } from "fast-xml-parser";

export type WorkerRequest = { xml: string };
export type WorkerResponse =
    | { type: "done"; buffer: ArrayBuffer }
    | { type: "error"; message: string };

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
    const { xml } = e.data;
    try {
        const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@" });
        const parsed = parser.parse(xml);

        const rootKey = Object.keys(parsed)[0];
        const root = parsed[rootKey];
        const rowsKey = Object.keys(root).find(k => Array.isArray(root[k]) || (root[k] !== null && typeof root[k] === "object"));
        const rawRows = rowsKey ? root[rowsKey] : (Array.isArray(root) ? root : root);
        const rows: Record<string, unknown>[] = Array.isArray(rawRows) ? rawRows : [rawRows];

        if (rows.length === 0) throw new Error("No rows found in XML to convert");

        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        const buffer = new Uint8Array(XLSX.write(wb, { bookType: "xlsx", type: "array" })).buffer;
        self.postMessage({ type: "done", buffer } satisfies WorkerResponse, { transfer: [buffer] });
    } catch (err) {
        self.postMessage({ type: "error", message: String(err) } satisfies WorkerResponse);
    }
};
