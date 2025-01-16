"use client";
import { Card, Flex, Heading, Text } from "@radix-ui/themes";
import clsx from "clsx";
import { motion } from "motion/react";
import React, { CSSProperties } from "react";
import useMediaQueries from "@/hooks/useMediaQueries";

export interface ILeftAlignedCard {
    title: string;
    dates: string;
    description: string;
    techSTack: React.ReactNode;
    baseCardStyles?: CSSProperties
}

export default function LeftAlignedCard({
    title,
    dates,
    description,
    techSTack,
    baseCardStyles = {}
}: ILeftAlignedCard) {

    const {isLesThan480 , isLesThan600} = useMediaQueries();
    return (
        <Card className="max-w-xl" style={baseCardStyles}>
            <Flex direction={"row"} justify={"between"} wrap={"wrap"} gap={"2"}>
                <Heading size={"4"} color="lime" style={{ color: "var(--accent-a9)" }}>{title}</Heading>
                <Text color="lime" style={{ color: "var(--accent-a9)" }} className={clsx({
                    "flex justify-end w-[100%]": isLesThan480
                })}>{dates}</Text>
            </Flex>
            <Flex direction={isLesThan600 ? "column" : "row"} gap={"4"} className="pt-2">
                <motion.span initial="hidden" className={clsx("pl-4", {

                    "w-[65%]": !isLesThan600,
                    "w-[100%]": isLesThan600
                })}
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ duration: 2 }}
                    variants={{
                        visible: { y: 1, opacity: 1 },
                        hidden: { y: '-50px', opacity: 0 }
                    }}>

                    <Text color="lime">{description}</Text>
                </motion.span>
                <Flex direction={"row"} gap={"5"} style={{ flexWrap: "wrap" }} className={clsx({

                    "w-[35%]": !isLesThan600,
                    "w-[100%]": isLesThan600
                })}>
                    {techSTack}
                </Flex>
            </Flex>
        </Card>
    )
}