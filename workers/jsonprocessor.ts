import { WorkerMessageT, TJSONFILE } from './types'
const fileReader = new FileReader();

const onMessageReader = function(selfVar: any) {
  return (args: any) => {
    try {
      selfVar.postMessage({type: "data", "payload": JSON.parse(args.target.result)})
    } catch(e) {
      console.log("error", e)
      selfVar.postMessage({type: "error", errorMessage: "Failed to parse"})
    }
  }
}

self.onmessage = (e) => {
  fileReader.onload = onMessageReader(self);
  const payload: WorkerMessageT<TJSONFILE> = e.data;
  if (payload.type === "file-init") {
    fileReader.readAsText(payload.payload as File);
  }
}