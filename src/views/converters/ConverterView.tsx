"use client";
import { useState } from "react";
import { Box } from "@radix-ui/themes";
import { ConverterContext, type TabValue } from "./ConverterContext";
import ConverterTabs from "./ConverterTabs";

export default function ConverterView() {
    const [activeTab,    setActiveTab]    = useState<TabValue>("json-to-csv");
    const [input,        setInput]        = useState("");
    const [inputBuffer,  setInputBuffer]  = useState<ArrayBuffer | null>(null);
    const [output,       setOutput]       = useState("");
    const [outputBuffer, setOutputBuffer] = useState<ArrayBuffer | null>(null);
    const [fileName,     setFileName]     = useState("");
    const [loading,      setLoading]      = useState(false);
    const [error,        setError]        = useState<string | null>(null);

    const reset = () => {
        setInput("");
        setInputBuffer(null);
        setOutput("");
        setOutputBuffer(null);
        setFileName("");
        setLoading(false);
        setError(null);
    };

    return (
        <ConverterContext.Provider value={{
            activeTab, setActiveTab,
            input,     setInput,
            inputBuffer,  setInputBuffer,
            output,    setOutput,
            outputBuffer, setOutputBuffer,
            fileName,  setFileName,
            loading,   setLoading,
            error,     setError,
            reset,
        }}>
            <Box px="4" pt="4">
                <ConverterTabs />
            </Box>
        </ConverterContext.Provider>
    );
}
