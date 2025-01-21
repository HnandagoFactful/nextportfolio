import { TGenericTranslation } from "@/types";
import { createContext } from "react";

export const TranslationProvider= createContext<TGenericTranslation>({
    pageName: '',
    translation: undefined
})