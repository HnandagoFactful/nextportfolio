export type WorkerMessageT<T> = {
    type: 'init' | 'file-init' | 'data' | 'error' | 'stop'
    payload?: unknown;
    errorMessage?: string;
}  
export type TJSONFILE  = {
    [key: string]: unknown
}