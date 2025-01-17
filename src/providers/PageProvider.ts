import { createContext } from "react";

export interface IPageProvider {
    pageName: string;
    alert: undefined | string;
    alertType: 'success' | 'error' | 'warning' | undefined;
    setAlertContentType: (value: string, type: 'success' | 'error' | 'warning') => void;
    resetAlert: () => void
}

const pageProvider = createContext<IPageProvider>({
    pageName: '',
    alert: undefined,
    alertType: undefined,
    setAlertContentType: () => {},
    resetAlert: () => {}
});

export default pageProvider;