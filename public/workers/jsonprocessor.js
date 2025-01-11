self.onmessage = (e) => {
    console.log("message recieved", e.data);
    self.postMessage({ "status": "received" });
};
export {};
