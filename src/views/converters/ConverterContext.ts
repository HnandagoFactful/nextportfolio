import { createContext, useContext } from "react";

export const CONVERSION_TABS = [
    { value: "json-to-csv",   label: "JSON → CSV",   from: "json",  to: "csv"   },
    { value: "csv-to-json",   label: "CSV → JSON",   from: "csv",   to: "json"  },
    { value: "xml-to-json",   label: "XML → JSON",   from: "xml",   to: "json"  },
    { value: "xml-to-csv",    label: "XML → CSV",    from: "xml",   to: "csv"   },
    { value: "csv-to-excel",  label: "CSV → Excel",  from: "csv",   to: "excel" },
    { value: "json-to-excel", label: "JSON → Excel", from: "json",  to: "excel" },
    { value: "xml-to-excel",  label: "XML → Excel",  from: "xml",   to: "excel" },
    { value: "excel-to-json", label: "Excel → JSON", from: "excel", to: "json"  },
] as const;

export type ConversionTab = typeof CONVERSION_TABS[number];
export type TabValue      = ConversionTab["value"];
export type Format        = ConversionTab["from"] | ConversionTab["to"];

export interface ConverterState {
    activeTab:    TabValue;
    input:        string;
    inputBuffer:  ArrayBuffer | null;
    output:       string;
    outputBuffer: ArrayBuffer | null;
    fileName:     string;
    loading:      boolean;
    error:        string | null;
}

export interface ConverterContextValue extends ConverterState {
    setActiveTab:    (tab: TabValue) => void;
    setInput:        (value: string) => void;
    setInputBuffer:  (buf: ArrayBuffer | null) => void;
    setOutput:       (value: string) => void;
    setOutputBuffer: (buf: ArrayBuffer | null) => void;
    setFileName:     (name: string) => void;
    setLoading:      (v: boolean) => void;
    setError:        (msg: string | null) => void;
    reset:           () => void;
}

export const ConverterContext = createContext<ConverterContextValue>({
    activeTab:    "json-to-csv",
    input:        "",
    inputBuffer:  null,
    output:       "",
    outputBuffer: null,
    fileName:     "",
    loading:      false,
    error:        null,
    setActiveTab:    () => {},
    setInput:        () => {},
    setInputBuffer:  () => {},
    setOutput:       () => {},
    setOutputBuffer: () => {},
    setFileName:     () => {},
    setLoading:      () => {},
    setError:        () => {},
    reset:           () => {},
});

export function useConverter() {
    return useContext(ConverterContext);
}
