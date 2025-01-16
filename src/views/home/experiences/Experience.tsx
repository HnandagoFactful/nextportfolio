import CalampExperience from "./CalampExperience";
import CapitalOneExperience from "./CapitalOneExperience";
import CyberSoftExperience from "./CybersoftExperience";
import NeimanMarcusExperience from "./NeimanMarcusExperience";
import SamsungExperience from "./SamsungExperience";
import SsplExperience from "./SsplExperience";
import ThermofisherExperience from "./ThermofisherExperience";
import BlockTitle from "../BlockTitle";

export default function Experience() {
    return (
        <BlockTitle title="Experience">
            <>
                <CyberSoftExperience />
                <CalampExperience />
                <CyberSoftExperience customDates="Dec 2020 - Sept 2021" />
                <CapitalOneExperience />
                <NeimanMarcusExperience />
                <SamsungExperience />
                <ThermofisherExperience />
                <SsplExperience />
            </>
        </BlockTitle>
    )
}