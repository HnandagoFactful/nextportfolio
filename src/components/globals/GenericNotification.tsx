import { Callout } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";

export default function GenericNotification({
    message
}: {
    message: string;
}) {
   
    return (
        <Callout.Root  role="alert" color={"lime"} size="2" className="flex flex-row items-center w-[90vw] mx-auto my-0">
            <Callout.Icon>
                <InfoCircledIcon color={"lime"} height={"20px"} width={"20px"} />
            </Callout.Icon>
            <Callout.Text className="inline-block text-base" size={"2"}>
                {message}
            </Callout.Text>
        </Callout.Root>
    )
}