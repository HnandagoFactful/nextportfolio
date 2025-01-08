import { useEffect, useState } from "react";

export default function useIsClient() {

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    return isMounted;
}