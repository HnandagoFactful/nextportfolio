"use client";
import { Box, Flex, Separator, Text } from "@radix-ui/themes";
import Image from "next/image"
import BlockTitle from "../BlockTitle";
import useMediaQueries from "@/hooks/useMediaQueries";

export default function Education() {
    const { isLesThan720 } = useMediaQueries();

    return (
        <BlockTitle title="Education" direction={isLesThan720 ? "column" : "row"} justify={"between"} className="max-w-[900px] pt-4">
            <Flex align={"baseline"} gap="2" direction={"column"} wrap={"wrap"} className="max-w-[420px]">
                <Flex align={"baseline"} gap="2" direction={"row"} wrap={"wrap"} className="w-full justify-between">
                    <Image width={100} height={100}
                        src={"https://uh.edu/images/uh-primary.svg"}
                        alt="University of houston"
                    />
                    <Text as="p" color="lime">May 2016</Text>
                </Flex>
                <Box>
                    <Text as="p" color="lime">Master of Science</Text>
                    <Text as="p" color="lime">Electronics and Computer Engineering</Text>
                </Box>
            </Flex>
            {isLesThan720 && (<Separator orientation="horizontal" size="2" className="w-full max-w-[420px]" />)}
            <Flex align={"baseline"} gap="2" direction={"column"} wrap={"wrap"} className="max-w-[420px]">
                <Flex align={"baseline"} gap="2" direction={"row"} wrap={"wrap"} className="w-full justify-between">
                    <Text as="p" color="lime" className="flex flex-row items-baseline gap-1">
                        <Image width={20} height={20}
                            src={"/annauniversity.png"}
                            alt="Anna University"
                        />
                        <span className="!text-white">Anna University</span>
                    </Text>
                    <Text as="p" color="lime">May 2013</Text>
                </Flex>
                <Box>
                    <Text as="p" color="lime">Bachelors in Engineering</Text>
                    <Text as="p" color="lime">Instrumentation and Control Engineering</Text>
                </Box>
            </Flex>
        </BlockTitle>
    )
}