/* eslint-disable react-hooks/exhaustive-deps */
import { use, useEffect } from "react";
import { Callout } from "@radix-ui/themes";
import pageProvider from "@/providers/PageProvider";
import AnimatedCounter from "../AnimatedCounter";
import { InfoCircledIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";
import delay from "lodash.delay";

export default function Alert({
    isTimer,
    isInfo,
    isWarningIcon
}: {
    isTimer?: boolean;
    isWarningIcon?: boolean;
    isInfo?: boolean;
}) {
    const pageContext = use(pageProvider);

    useEffect(function() {
        if (!isTimer && pageContext.alert) {
            delay(function() {
                pageContext.resetAlert()
            }, 5000)
        }
    }, [isTimer, pageContext.alert])

    if (!pageContext.alert) {
        return null
    }
    const color = pageContext.alertType === "error" ? "red" : pageContext.alertType === "success" ? "green" : pageContext.alertType === "warning" ? "orange" : "lime";
    return (
        <Callout.Root  role="alert" color={color} size="2" >
            <Callout.Icon  className="!h-[32px] !gap-4">
                {isTimer && (<AnimatedCounter timeLimit={5} color={color} onComplete={() => {
                    pageContext.resetAlert()
                }} />)}
                {isInfo && (<InfoCircledIcon color={color} height={"24px"} width={"24px"} />)}
                {isWarningIcon && (<ExclamationTriangleIcon color={color}  height={"24px"} width={"24px"} />)}
            </Callout.Icon>
            <Callout.Text className="inline-block text-xl" size={"4"}>
                {pageContext.alert}
            </Callout.Text>
        </Callout.Root>
    )
}