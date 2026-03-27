function escapeCsv(val: unknown): string {
    const s = val == null ? "" : String(val);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export type WorkerRequest = { json: string };
export type WorkerResponse =
    | { type: "chunk"; data: string }
    | { type: "done" }
    | { type: "error"; message: string };

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
    const { json } = e.data;

    let data: Record<string, unknown>[];
    try {
        const parsed = JSON.parse(json);
        if (!Array.isArray(parsed)) throw new Error("JSON root must be an array of objects");
        data = parsed;
    } catch (err) {
        self.postMessage({ type: "error", message: String(err) } satisfies WorkerResponse);
        return;
    }

    if (data.length === 0) {
        self.postMessage({ type: "done" } satisfies WorkerResponse);
        return;
    }

    const headers = Object.keys(data[0]);

    const readable = new ReadableStream<Record<string, unknown>>({
        start(controller) {
            for (const row of data) controller.enqueue(row);
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

    try {
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
