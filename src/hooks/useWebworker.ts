import { useEffect, useRef } from "react";

const useWebworkers = function () {
    const workerRef = useRef<Worker | null>(null);

    const initializeWorker = function (path: string) {
        workerRef.current = new Worker(path, {
            type: 'module',
        })
        workerRef.current.onmessage = (event) => {
            console.log("on message received", event)
        }
        workerRef.current.onerror = (error) => {
            console.error('Worker error:', error)
        }
    }

    const sendMessage = function(value: unknown) {
        workerRef.current?.postMessage({
            type:  'file-init',
            payload: value
        });
    }

    const terminateWorker = function() {
        workerRef?.current?.terminate();
        workerRef.current = null;
    }

    useEffect(function() {
        () => {
            terminateWorker();
        }
    }, [])

    return {
        sendMessage,
        initializeWorker
    }
}

export default useWebworkers;