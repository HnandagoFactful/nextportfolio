import { Box, Flex, FlexProps, Heading } from "@radix-ui/themes";

export type TBlockTitleProps = FlexProps & {
    title: string;
    children: React.ReactNode;
    direction?: "row" | "column";
}

export default function BlockTitle({
    title,
    children,
    direction="column",
    ...restContainerProps
}: TBlockTitleProps) {

    return (
        <Box className="mt-4 pl-4 pr-4">
        <Heading size={"7"} color="lime" style={{ color: "var(--accent-10)" }}>{title}</Heading>
        <Flex direction={direction} className="mt-4 pl-4" gap="4" {...restContainerProps}>
            {children}
        </Flex>
        </Box>
    )
}