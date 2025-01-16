import DockerIcon from "@/icons/DockerIcon";
import ExpressjsIcon from "@/icons/ExpressjsIcon";
import ReactIcon from "@/icons/ReactIcon";
import LeftAlignedCard from "../../LeftAlignedCard";
import SpringbootJavaIcon from "@/icons/SpringbootJavaIcon";
import KafkaIcon from "@/icons/KafkaIcon";
import PostgresqlIcon from "@/icons/PostgresqlIcon";

export default function ThermofisherExperience() {
    return (
        <LeftAlignedCard title="ThermoFisher Scientific"
            dates={"Nov  2016 – August 2018"}
            description="Order processing and tracking for E-Commerce application"
            techSTack={(<>
                <ReactIcon />
                <ExpressjsIcon />
                <DockerIcon />
                <SpringbootJavaIcon />
                <KafkaIcon />
                <PostgresqlIcon />
            </>)} />
    )
}