"use client";
import useMediaQueriues from "@/hooks/useMediaQueries";
import LinkedInIcon from "@/icons/LinkedInIcon";
import { Flex, Heading, Box, Button } from "@radix-ui/themes";
import clsx from "clsx";
import { motion } from "motion/react";

export default function HomeHeader() {

    const { isLesThan600, isLesThan430 } = useMediaQueriues()
    return (
        <Flex justify={"between"}>
            <motion.div initial="hidden" className="overflow-hidden"
                style={{
                    height: "120px",
                }}
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 3 }}
                variants={{
                    visible: { opacity: 1, x: 1 },
                    hidden: { opacity: 0, x: -200 }
                }}>
                <Heading color="lime" style={{ color: "var(--accent-a11)" }} size="8">Harikrishna</Heading>
                <Heading color="lime" style={{ color: "var(--accent-a12)", textIndent: '80px' }} size="7">Nandagopal</Heading>
            </motion.div>
            {(<Box className={clsx("!flex flex-col gap-3 items-end pr-4", {
                "w-[30%]": !isLesThan600,
                "w-[100px": isLesThan600,
                "fixed right-0 top-[94vh] z-50": isLesThan430
            })}>
                <Button variant="soft"
                    onClick={() => {
                        window.open("https://www.linkedin.com/in/harikrishna-n-79349121/", "_blank")
                    }}
                    className="cursor-pointer"
                    style={{ backgroundColor: "#005e93", color: "white" }}
                    size={"4"}>
                    {
                        isLesThan430 ? <LinkedInIcon /> : "LinkedIn"
                    }
                </Button>
            </Box>)}
        </Flex>
    )
}