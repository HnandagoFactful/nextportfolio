import * as XLSX from "xlsx";

export type WorkerRequest = { json: string };
export type WorkerResponse =
    | { type: "done"; buffer: ArrayBuffer }
    | { type: "error"; message: string };

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
    const { json } = e.data;
    try {
        const data = JSON.parse(json);
        if (!Array.isArray(data)) throw new Error("JSON root must be an array of objects");

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
        self.postMessage({ type: "done", buffer } satisfies WorkerResponse, { transfer: [buffer] });
    } catch (err) {
        self.postMessage({ type: "error", message: String(err) } satisfies WorkerResponse);
    }
};
