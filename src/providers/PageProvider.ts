import { createContext } from "react";

export interface IPageProvider {
    pageName: string;
}

const pageProvider = createContext<IPageProvider>({
    pageName: ''
});

export default pageProvider;