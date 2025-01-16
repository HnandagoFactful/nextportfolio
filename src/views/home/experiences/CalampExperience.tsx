import DockerIcon from "@/icons/DockerIcon";
import ExpressjsIcon from "@/icons/ExpressjsIcon";
import KubeIcon from "@/icons/KubeIcon";
import ReactIcon from "@/icons/ReactIcon";
import PostgresqlIcon from "@/icons/PostgresqlIcon";
import SpringbootJavaIcon from "@/icons/SpringbootJavaIcon";
import NextJSIcon from "@/icons/NextJSIcon";
import KafkaIcon from "@/icons/KafkaIcon";
import RightAlignedCard from "@/views/RightAlignedCard";

export default function CalampExperience() {
    return (
        <RightAlignedCard dates="Sept 2021 - Feb 2023"
            description="Enterprise Fleet tracking system in iOn Suite applications"
            title="CalAmp Wireless Networks"
            techSTack={(<>
                <NextJSIcon />
                <ReactIcon />
                <ExpressjsIcon />
                <DockerIcon />
                <KubeIcon />
                <KafkaIcon />
                <SpringbootJavaIcon />
                <PostgresqlIcon />
            </>)} />
        // <Card className={clsx("max-w-xl")} style={{
        //     marginLeft: isLesThan600 ? "0px" : "calc(100vw - 620px)"
        // }}>
        //     <Flex direction={"row"} justify={"between"} wrap={"wrap"} gap={"2"}>
        //         <Heading size={"4"} color="lime" style={{ color: "var(--accent-a9)" }}>CalAmp Wireless Networks</Heading>
        //         <Text color="lime" style={{ color: "var(--accent-a9)" }} className={clsx({
        //             "flex justify-end w-[100%]": isLesThan480
        //         })}> Sept 2021 - Feb 2023</Text>
        //     </Flex>
        //     <Flex direction={isLesThan600 ? "column" : "row"} gap={"4"} className="pt-2">
        //         <motion.span initial="hidden" className={clsx("pl-4", {

        //             "w-[65%]": !isLesThan600,
        //             "w-[100%]": isLesThan600
        //         })}
        //             whileInView="visible"
        //             viewport={{ once: true }}
        //             transition={{ duration: 2 }}
        //             variants={{
        //                 visible: { y: 1, opacity: 1 },
        //                 hidden: { y: '-50px', opacity: 0 }
        //             }}>

        //             <Text color="lime">Enterprise Fleet tracking system using iOn Suite</Text>
        //         </motion.span>
        //         <Flex direction={"row"} gap={"5"} style={{ flexWrap: "wrap" }} className={clsx({

        //             "w-[35%]": !isLesThan600,
        //             "w-[100%]": isLesThan600
        //         })}>
        //             <NextJSIcon />
        //             <ReactIcon />
        //             <ExpressjsIcon />
        //             <DockerIcon />
        //             <KubeIcon />
        //             <KafkaIcon />
        //             <SpringbootJavaIcon />
        //             <PostgresqlIcon />
        //         </Flex>
        //     </Flex>
        // </Card>
    )
}