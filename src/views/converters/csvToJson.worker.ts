export type WorkerRequest = { csv: string };
export type WorkerResponse =
    | { type: "chunk"; data: string }
    | { type: "done" }
    | { type: "error"; message: string };

function parseCsvLine(line: string): string[] {
    const fields: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inQuotes) {
            if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
            else if (ch === '"') inQuotes = false;
            else current += ch;
        } else {
            if (ch === '"') inQuotes = true;
            else if (ch === ",") { fields.push(current); current = ""; }
            else current += ch;
        }
    }
    fields.push(current);
    return fields;
}

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
    const { csv } = e.data;

    try {
        const readable = new ReadableStream<string>({
            start(controller) {
                const lines = csv.split(/\r?\n/).filter(l => l.trim() !== "");
                for (const line of lines) controller.enqueue(line);
                controller.close();
            },
        });

        let headers: string[] = [];
        let isFirst = true;
        const rows: Record<string, string>[] = [];

        const transform = new TransformStream<string, Record<string, string> | null>({
            transform(line, controller) {
                const fields = parseCsvLine(line);
                if (isFirst) {
                    headers = fields;
                    isFirst = false;
                    controller.enqueue(null); // header signal
                } else {
                    const obj: Record<string, string> = {};
                    headers.forEach((h, i) => { obj[h] = fields[i] ?? ""; });
                    controller.enqueue(obj);
                }
            },
        });

        const reader = readable.pipeThrough(transform).getReader();

        // Collect all rows then stream JSON output
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value !== null) rows.push(value);
        }

        // Stream output as JSON chunks
        const jsonStr = JSON.stringify(rows, null, 2);
        const chunkSize = 4096;
        for (let i = 0; i < jsonStr.length; i += chunkSize) {
            self.postMessage({ type: "chunk", data: jsonStr.slice(i, i + chunkSize) } satisfies WorkerResponse);
        }

        self.postMessage({ type: "done" } satisfies WorkerResponse);
    } catch (err) {
        self.postMessage({ type: "error", message: String(err) } satisfies WorkerResponse);
    }
};
