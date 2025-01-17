import { useState } from "react";

export default function useAlerts() {
    const [alert, setAlert] = useState<{
        alert: undefined | string;
        alertType: 'success' | 'error' | 'warning' | undefined;
    }>({
        alert: undefined,
        alertType: undefined,
    })
    const setAlertContentType =(value: string, type: 'success' | 'error' | 'warning' | undefined) => {
        console.log("set alert")
        setAlert({
            alert: value,
            alertType: type
        })
    }

    const resetAlert = function() {
        setAlert({
            alert: undefined,
            alertType: undefined
        })
    }

    return {
        alert,
        resetAlert,
        setAlertContentType
    }
}