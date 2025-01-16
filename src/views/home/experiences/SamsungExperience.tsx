import DockerIcon from "@/icons/DockerIcon";
import ExpressjsIcon from "@/icons/ExpressjsIcon";
import MongoIcon from "@/icons/MongoIcon";
import ReactIcon from "@/icons/ReactIcon";
import AWSIcon from "@/icons/AWSIcon";
import RightAlignedCard from "@/views/RightAlignedCard";
import PythonIcon from "@/icons/PythonIcon";

export default function SamsungExperience() {
    return (
        <RightAlignedCard title="Samsung Electronics America"
            dates={" August 2018 - October 2019"}
            description="Enterprise industrial communication and tracking using Samsung galaxy watch, Samsung podcast backend application"
            techSTack={(<>
                <PythonIcon />
                <ReactIcon />
                <ExpressjsIcon />
                <DockerIcon />
                <MongoIcon />
                <AWSIcon />
            </>)} />
    )
}