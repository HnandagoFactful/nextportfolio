import * as XLSX from "xlsx";

export type WorkerRequest = { csv: string };
export type WorkerResponse =
    | { type: "done"; buffer: ArrayBuffer }
    | { type: "error"; message: string };

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
    const { csv } = e.data;
    try {
        const wb = XLSX.read(csv, { type: "string", raw: false });
        const buffer = new Uint8Array(XLSX.write(wb, { bookType: "xlsx", type: "array" })).buffer;
        self.postMessage({ type: "done", buffer } satisfies WorkerResponse, { transfer: [buffer] });
    } catch (err) {
        self.postMessage({ type: "error", message: String(err) } satisfies WorkerResponse);
    }
};
