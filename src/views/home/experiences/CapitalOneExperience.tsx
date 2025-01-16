import AngularIcon from "@/icons/AngularIcon";
import AWSIcon from "@/icons/AWSIcon";
import RightAlignedCard from "@/views/RightAlignedCard";

export default function CapitalOneExperience() {
    return (
        <RightAlignedCard title="CapitalOne"
            dates="June 2020 - Dec 2020"
            description="Dealer Navigator application using Angular 12 micro frontend"
            techSTack={(<>
                <AngularIcon />
                <AWSIcon />
            </>)} />
    )
}