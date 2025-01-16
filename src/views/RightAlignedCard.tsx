"use client";
import React from "react";
import LeftAlignedCard, { ILeftAlignedCard } from "./LeftAlignedCard";
import useMediaQueriues from "@/hooks/useMediaQueries";

export default function RightAlignedCard(props: ILeftAlignedCard) {

    const { isLesThan600 } = useMediaQueriues()
    return (
        <LeftAlignedCard {...props} baseCardStyles={{
            marginLeft: isLesThan600 ? "0px" : "calc(100vw - 620px)"
        }}/> 
    )
}