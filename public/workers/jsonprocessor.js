const fileReader = new FileReader();
const onMessageReader = function (selfVar) {
    return (args) => {
        try {
            selfVar.postMessage({ type: "data", "payload": JSON.parse(args.target.result) });
        }
        catch (e) {
            console.log("error", e);
            selfVar.postMessage({ type: "error", errorMessage: "Failed to parse" });
        }
    };
};
self.onmessage = (e) => {
    fileReader.onload = onMessageReader(self);
    const payload = e.data;
    if (payload.type === "file-init") {
        fileReader.readAsText(payload.payload);
    }
};
export {};
