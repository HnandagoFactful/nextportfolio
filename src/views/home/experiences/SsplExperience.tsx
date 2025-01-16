import HTMLIcon from "@/icons/HTMLIcon";
import RightAlignedCard from "@/views/RightAlignedCard";
import CSSIcon from "@/icons/CSSIcon";
import SpringbootJavaIcon from "@/icons/SpringbootJavaIcon";

export default function SsplExperience() {
    return (
        <RightAlignedCard title="SSPL Wealth, India"
            dates="Jan 2013 - August 2013"
            description="Report generation for financial services."
            techSTack={(<>
                <HTMLIcon />
                <CSSIcon />
                <SpringbootJavaIcon />
            </>)} />
    )
}