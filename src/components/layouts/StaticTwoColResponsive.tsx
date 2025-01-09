import { Box, Button, Card, Code, Flex, Grid, Heading, Text, VisuallyHidden } from "@radix-ui/themes";
import { useEffect, useRef, useState } from "react";

import { Cross1Icon, DragHandleDots2Icon } from "@radix-ui/react-icons"


export default function StaticTwoColResponsive({
    initWidths = [50, 50],
    isDragResize = true
}: {
    initWidths?: [number, number],
    isDragResize?: boolean;
}) {
    const containerRef = useRef<HTMLDivElement | null>(null);

    const readerRef = useRef<FileReader | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [rawFile, setRawFile] = useState<File | null>(null);
    const [jsonFile, setJSONFile] = useState<{ [key: string]: any } | null>(null)

    const onReaderLoad = function (event: any) {
        setJSONFile(JSON.parse(event.target.result));
        buildJSONElements(JSON.parse(event.target.result), 0)
    }

    useEffect(function () {
        readerRef.current = new FileReader();
        readerRef.current.onload = onReaderLoad;
    }, [])

    const buildJSONElements: any = function (root: { [key: string]: unknown | unknown[] }, depth: number) {
        if (!root) {
            return;
        }
        const rootKeys = Object.keys(root);
        return rootKeys.map((item) => {
            if (!Array.isArray(root[item]) && typeof root[item] === "object" && ![null, undefined].includes(root[item] as any)) {
                return (<Box key={`${JSON.stringify(root[item])}-${item}`} style={{
                    paddingLeft: `${(depth + 1) * 12}px`,
                }}>
                    <Text>{item}{": {"}</Text>
                    {buildJSONElements(root[item] as any, depth + 1)}
                    <Text>{"},"}</Text>
                </Box>)
            }
            if (Array.isArray(root[item])) {
                return (
                    <Box key={`${JSON.stringify(root)}${item}-${depth}-arrayroot`} style={{
                        paddingLeft: `${(depth + 1) * 12}px`,
                    }}>
                        <Text>{item} {": ["}</Text>
                        {root[item].map((arrItem, index) => {
                            if (typeof (root[item] as any[])[index] !== "object") {
                                return (<p key={`${JSON.stringify(root)}${item}-${depth}-${index}`} style={{
                                    textIndent: `${(depth + 1) * 12}px`,
                                }}>{(root[item] as any[])[index]}{","}</p>)
                            }
                            return (
                                <Box key={`${JSON.stringify(root)}${item}-${depth}-${index}`}>
                                    <Text>{"{"}</Text>
                                    {buildJSONElements((root[item] as any[])[index], depth + 1)}
                                    <Text>{"},"}</Text>
                                </Box>
                            )
                        })}
                        <Text>{"],"}</Text>
                    </Box>)
            }
            return <p key={`${JSON.stringify(root)}${item}-${depth}`} style={{
                textIndent: `${(depth + 1) * 12}px`,
            }}>{`${item}: ${root[item]}`}{depth === 0 ? "" : ","}</p>;
        })
    }

    return (<Grid ref={containerRef} columns="50% 50%" gap="3" width="auto">
        <Card className="relative">
            <Flex direction={"row"} justify={"between"} align={"center"}>
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
                        readerRef.current && readerRef.current.readAsText(event.target.files[0]);
                    }} />
                </VisuallyHidden>
            </Flex>
            <Box>
                <Code>
                    <Text>{"{"}</Text>
                    {
                        jsonFile && buildJSONElements(jsonFile, 0)
                    }

                    <Text>{"}"}</Text>
                </Code>
            </Box>
        </Card>
        <Card>
        </Card>
    </Grid>)
}