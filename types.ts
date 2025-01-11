export type WorkerMessageT<T> = {
    type: 'init' | 'data' | 'error' | 'stop'
    payload?: {
      id?: string
      data: T
    }
  }
  
  export type TJSONFILE = {
    [key: string]: unknown
  }