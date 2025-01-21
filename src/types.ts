export type TGenericValue = string | number | boolean

export type TGenericObject = {
    [key: string]: TGenericValue;
}

export type TNavigation =  {
    name: string;
    alias: string;
    path: string;
    isVisible?: boolean;
}

export type TGenericTranslation = {
    pageName: string;
    translation?: {
        global: {
            project: string;
            navigation: TNavigation[]
        },
        sections?: TGenericObject
    }
}