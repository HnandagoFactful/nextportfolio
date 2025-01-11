"use client";
import { Box, Button, Code, Flex, Heading, Text, VisuallyHidden } from "@radix-ui/themes";
import { useEffect, useRef, useState } from "react";

import { Cross1Icon } from "@radix-ui/react-icons"
import TwoColResizableLayout from "./TwoColResizableLayout";

import useWebworkers from "@/hooks/useWebworker";
import { useIsClient } from "@uidotdev/usehooks";

export default function StaticTwoColResponsive({
    initWidths = [50, 50],
    isDragResize = true
}: {
    initWidths?: [number, number],
    isDragResize?: boolean;
}) {
    const isClient = useIsClient()
    const {
        initializeWorker,
        sendMessage
    } = useWebworkers();
    const readerRef = useRef<FileReader | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [rawFile, setRawFile] = useState<File | null>(null);
    const [jsonFile, setJSONFile] = useState<{ [key: string]: any } | null>(null);
    const onReaderLoad = function (event: any) {
        setJSONFile(JSON.parse(event.target.result));
        buildJSONElements(JSON.parse(event.target.result), 0)
    }

    useEffect(function() {
        initializeWorker("/workers/jsonprocessor.js");
    }, [isClient])

    useEffect(function () {
        readerRef.current = new FileReader();
        readerRef.current.onload = onReaderLoad;
    }, []);

    const buildJSONElements: any = function (root: { [key: string]: unknown | unknown[] }, depth: number) {
        if (!root) {
            return;
        }
        const rootKeys = Object.keys(root);
        return rootKeys.map((item, rootKeyIndex: number) => {
            if (!Array.isArray(root[item]) && typeof root[item] === "object" && ![null, undefined].includes(root[item] as any)) {
                return (<Box key={`${JSON.stringify(root[item])}-${item}`}>
                    <Text color="lime" as="p" style={{
                        textIndent: `${(depth + 1) * 12}px`,
                    }}>{item}
                        <Text color="yellow">{":"}</Text> {"{"}</Text>
                    {buildJSONElements(root[item] as any, depth + 1)}
                    <Text as="p" style={{
                        textIndent: `${(depth + 1) * 12}px`,
                    }}>{"}"}{rootKeys.length - 1 === rootKeyIndex ? "" : ","}</Text>
                </Box>)
            }
            if (Array.isArray(root[item])) {
                const arrayTypeItemValues = root[item];
                return (
                    <Box key={`${JSON.stringify(root)}${item}-${depth}-arrayroot`} style={{
                        paddingLeft: `${(depth + 1) * 12}px`,
                    }}>
                        <Text as="p"> <Text color="lime">{item}</Text><Text color="yellow">{":"}</Text>{"["}</Text>
                        {arrayTypeItemValues.map((arrItem, arrayTypeItemValuesIndex: number) => {
                            if (typeof (root[item] as any[])[arrayTypeItemValuesIndex] !== "object") {
                                return (<p key={`${JSON.stringify(root)}${item}-${depth}-${arrayTypeItemValuesIndex}`} style={{
                                    textIndent: `${(depth + 1) * 12}px`,
                                }}>{(root[item] as any[])[arrayTypeItemValuesIndex]}{arrayTypeItemValuesIndex === arrayTypeItemValues.length - 1 ? "" : ","}</p>)
                            }
                            return (
                                <Box key={`${JSON.stringify(root)}${item}-${depth}-${arrayTypeItemValuesIndex}`}>
                                    <Text as="p" style={{
                                        textIndent: `${(depth + 1) * 12}px`,
                                    }} onClick={() => {
                                        console.log("minimize")
                                    }}>{"{"}</Text>
                                    {buildJSONElements((root[item] as any[])[arrayTypeItemValuesIndex], depth + 1)}
                                    <Text as="p" style={{
                                        textIndent: `${(depth + 1) * 12}px`,
                                    }}>{"}"}{arrayTypeItemValuesIndex === arrayTypeItemValues.length - 1 ? "" : ","}</Text>
                                </Box>
                            )
                        })}
                        <Text as="p">{"],"}</Text>
                    </Box>)
            }
            return <Text as="p" key={`${JSON.stringify(root)}${item}-${depth}`} style={{
                textIndent: `${(depth + 1) * 12}px`,
            }}>
                <Text color="lime">{item}</Text><Text color="yellow">{`:`}</Text>{" "}{`${root[item]}`}{rootKeyIndex === rootKeys.length - 1 ? "" : ","}
            </Text>;
        })
    }

    return (<>
        <Flex direction={"row"} justify={"start"} align={"baseline"} gap={"4"}>
            <Heading color="lime" size={"4"}>Upload JSON</Heading>
            <Flex direction={"column"} gap={"2"}>
                <Button color="lime" variant="outline" size={"1"} onClick={() => inputRef.current?.click()}>Upload JSON</Button>
                {rawFile && (<Button variant="ghost" color="blue" size={"2"} onClick={() => {
                    setRawFile(null)
                    setJSONFile(null)
                }}>{rawFile?.name}
                    <Cross1Icon className="mt-[2px]" height={12} width={12} /></Button>)}
            </Flex>
            <VisuallyHidden>
                <input type="file" accept=".json" ref={inputRef} onChange={(event: any) => {
                    setRawFile(event.target.files[0]);
                    sendMessage({"uploaded": "file"})
                    readerRef.current && readerRef.current.readAsText(event.target.files[0]);
                }} />
            </VisuallyHidden>
        </Flex>
        <TwoColResizableLayout initialWidths={[8, 4]}>
            <Box id={"json-display"} className="overscroll-y-auto overflow-y-auto h-[90%]">
                <Code>
                    <Text as="p">{"{"}</Text>
                    {
                        jsonFile && buildJSONElements(jsonFile, 0)
                    }

                    <Text as="p">{"}"}</Text>
                </Code>
            </Box>
            <Box id={"json-input"}>
                <Heading>Conversions</Heading>
            </Box>
        </TwoColResizableLayout>
    </>)
}