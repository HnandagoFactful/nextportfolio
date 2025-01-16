/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";

const useWebworkers = function () {
    const workerRef = useRef<Worker | null>(null);

    const initializeWorker = function (
        path: string,
        successCallback?: (payload: any) => void,
        errorCallback?: (errorPayload?: any) => void) {
        workerRef.current = new Worker(path, {
            type: 'module',
        })
        workerRef.current.onmessage = (event) => {
            successCallback?.(event.data)
        }
        workerRef.current.onerror = (error) => {
            console.log('Worker error:', error)
            errorCallback?.(error)
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
        return () => {
            terminateWorker();
        }
    }, [])

    return {
        sendMessage,
        initializeWorker
    }
}

export default useWebworkers;