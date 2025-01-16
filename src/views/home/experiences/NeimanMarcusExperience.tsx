import ElasticSearchIcon from "@/icons/ElasticSearchIcon";
import ReactIcon from "@/icons/ReactIcon";
import SpringbootJavaIcon from "@/icons/SpringbootJavaIcon";
import LeftAlignedCard from "@/views/LeftAlignedCard";

export default function NeimanMarcusExperience() {

    return (
        <LeftAlignedCard dates="October 2019 - June 2020"
            description="E-Commerce web application. Primary work was focused on refining search on web and server."
            title="Neiman Marcus"
            techSTack={(<>
                <ReactIcon />
                <SpringbootJavaIcon />
                <ElasticSearchIcon />
            </>)} />
    )
}