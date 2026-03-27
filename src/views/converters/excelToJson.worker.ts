import * as XLSX from "xlsx";

export type WorkerRequest = { buffer: ArrayBuffer };
export type WorkerResponse =
    | { type: "chunk"; data: string }
    | { type: "done" }
    | { type: "error"; message: string };

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
    const { buffer } = e.data;
    try {
        const wb = XLSX.read(buffer, { type: "array" });
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(ws);

        const jsonStr = JSON.stringify(data, null, 2);
        const chunkSize = 4096;
        for (let i = 0; i < jsonStr.length; i += chunkSize) {
            self.postMessage({ type: "chunk", data: jsonStr.slice(i, i + chunkSize) } satisfies WorkerResponse);
        }

        self.postMessage({ type: "done" } satisfies WorkerResponse);
    } catch (err) {
        self.postMessage({ type: "error", message: String(err) } satisfies WorkerResponse);
    }
};
