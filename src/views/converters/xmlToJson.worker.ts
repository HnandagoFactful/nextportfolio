import { XMLParser } from "fast-xml-parser";

export type WorkerRequest = { xml: string };
export type WorkerResponse =
    | { type: "chunk"; data: string }
    | { type: "done" }
    | { type: "error"; message: string };

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
    const { xml } = e.data;

    try {
        const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@" });
        const result = parser.parse(xml);

        const jsonStr = JSON.stringify(result, null, 2);
        const chunkSize = 4096;
        for (let i = 0; i < jsonStr.length; i += chunkSize) {
            self.postMessage({ type: "chunk", data: jsonStr.slice(i, i + chunkSize) } satisfies WorkerResponse);
        }

        self.postMessage({ type: "done" } satisfies WorkerResponse);
    } catch (err) {
        self.postMessage({ type: "error", message: String(err) } satisfies WorkerResponse);
    }
};
