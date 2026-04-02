import { XMLParser } from "fast-xml-parser";

export type WorkerRequest = { xml: string };
export type WorkerResponse =
    | { type: "chunk"; data: string }
    | { type: "done" }
    | { type: "error"; message: string };

function escapeCsv(val: unknown): string {
    const s = val == null ? "" : String(val);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
    const { xml } = e.data;

    try {
        const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@" });
        const parsed = parser.parse(xml);

        // Find the first array of objects in the parsed result
        const rootKey = Object.keys(parsed)[0];
        const root = parsed[rootKey];
        const rowsKey = Object.keys(root).find(k => Array.isArray(root[k]) || (root[k] !== null && typeof root[k] === "object"));
        const rawRows = rowsKey ? root[rowsKey] : (Array.isArray(root) ? root : root);
        const rows: Record<string, unknown>[] = Array.isArray(rawRows) ? rawRows : [rawRows];

        if (rows.length === 0) throw new Error("No rows found in XML to convert to CSV");

        const headers = Array.from(new Set(rows.flatMap(r => Object.keys(r))));

        const readable = new ReadableStream<Record<string, unknown>>({
            start(controller) {
                for (const row of rows) controller.enqueue(row);
                controller.close();
            },
        });

        const transform = new TransformStream<Record<string, unknown>, string>({
            start(controller) {
                controller.enqueue(headers.map(escapeCsv).join(",") + "\n");
            },
            transform(row, controller) {
                controller.enqueue(headers.map(h => escapeCsv(row[h])).join(",") + "\n");
            },
        });

        const reader = readable.pipeThrough(transform).getReader();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            self.postMessage({ type: "chunk", data: value } satisfies WorkerResponse);
        }

        self.postMessage({ type: "done" } satisfies WorkerResponse);
    } catch (err) {
        self.postMessage({ type: "error", message: String(err) } satisfies WorkerResponse);
    }
};
