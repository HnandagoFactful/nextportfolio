import { WorkerMessageT, TJSONFILE } from './types'

self.onmessage = (e) => {
  console.log("message recieved", e.data)
  self.postMessage({"status": "received"})
}