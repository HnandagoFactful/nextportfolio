import { Box, Button, Card, Flex, Grid, Heading, Text, VisuallyHidden } from "@radix-ui/themes";
import { useEffect, useRef, useState } from "react";

import { Cross1Icon } from "@radix-ui/react-icons"


export default function StaticTwoColResponsive() {
    const readerRef = useRef<FileReader | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [rawFile, setRawFile] = useState<File | null>(null);
    const [jsonFile, setJSONFile] = useState<{ [key: string]: any } | null>(null)

    const onReaderLoad = function (event: any) {
        console.log(typeof event.target.result)
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
        return Object.keys(root).map((item) => {
            if (!Array.isArray(root[item]) && typeof root[item] === "object") {
                return buildJSONElements(root[item] as any, depth+1)
            }
            if (Array.isArray(root[item])) {
                return root[item].map((arrItem, index) => {
                    if (typeof (root[item] as any[])[index] !== "object") {

                        console.log('not object in array',(root[item] as any[])[index])
                        return (root[item] as any[])[index]
                    }
                    return buildJSONElements((root[item] as any[])[index], depth + 1)
                })
            }
            return <p key={`${JSON.stringify(root)}${item}-${depth}}`}>{`${item}: ${root[item]} - ${depth}`}</p>;
        })
    }

    return (<Grid columns="50% 50%" gap="3" width="auto">
        <Card>
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
                <>{
        jsonFile && buildJSONElements(jsonFile, 0)}</>
            </Box>
        </Card>
        <Card>
        </Card>
    </Grid>)
}