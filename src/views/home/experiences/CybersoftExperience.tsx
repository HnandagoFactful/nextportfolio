import AzureDevops from "@/icons/AzureDevops";
import AzureTables from "@/icons/AzureTables";
import DockerIcon from "@/icons/DockerIcon";
import ExpressjsIcon from "@/icons/ExpressjsIcon";
import KeycloakIcon from "@/icons/KeycloakIcon";
import ReactIcon from "@/icons/ReactIcon";
import SQLIcon from "@/icons/SQLIcon";
import LeftAlignedCard from "../../LeftAlignedCard";

export default function CyberSoftExperience({ customDates }: { customDates?: string }) {
    return (
        <LeftAlignedCard title="CyberSoft Technologies"
            dates={customDates ?? "Feb 2023 - Present"}
            description="School nutrition application with web and mobile application."
            techSTack={(<>
                <ReactIcon />
                <ExpressjsIcon />
                <DockerIcon />
                <KeycloakIcon />
                <SQLIcon />
                <AzureTables />
                <AzureDevops />
            </>)} />
    )
}