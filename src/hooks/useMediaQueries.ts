"use client";

import { useMediaQuery } from "@uidotdev/usehooks";

export default function useMediaQueriues() {

    const isLesThan430 = useMediaQuery("only screen and (max-width:400px)")
    const isLesThan480 = useMediaQuery("only screen and (max-width:480px)")
    const isLesThan600 = useMediaQuery("only screen and (max-width:600px)")
    const isLesThan720 = useMediaQuery("only screen and (max-width: 719px)")

    return {
        isLesThan430,
        isLesThan480,
        isLesThan600,
        isLesThan720
    }
}