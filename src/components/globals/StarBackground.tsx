"use client";
import { useEffect, useMemo } from "react";

export default function StarBackground() {
    const small  = useMemo(() => Array.from({ length: 600 }, () => `${(Math.random() * 100).toFixed(2)}vw ${(Math.random() * 100).toFixed(2)}vh rgba(255,255,255,${(0.3 + Math.random() * 0.5).toFixed(2)})`).join(","), []);
    const medium = useMemo(() => Array.from({ length: 180 }, () => `${(Math.random() * 100).toFixed(2)}vw ${(Math.random() * 100).toFixed(2)}vh rgba(255,255,255,${(0.4 + Math.random() * 0.5).toFixed(2)})`).join(","), []);
    const large  = useMemo(() => Array.from({ length: 60  }, () => `${(Math.random() * 100).toFixed(2)}vw ${(Math.random() * 100).toFixed(2)}vh rgba(${Math.random() > 0.5 ? "180,255,120" : "255,255,255"},${(0.5 + Math.random() * 0.5).toFixed(2)})`).join(","), []);

    useEffect(() => {
        const prev = document.body.style.backgroundColor;
        document.body.style.backgroundColor = "transparent";
        return () => { document.body.style.backgroundColor = prev; };
    }, []);

    return (
        <>
            <style>{`
                @keyframes twinkle-s { 0%,100% { opacity:.45 } 50% { opacity:1 } }
                @keyframes twinkle-m { 0%,100% { opacity:.5  } 50% { opacity:1 } }
                @keyframes twinkle-l { 0%,100% { opacity:.55 } 50% { opacity:1 } }
            `}</style>
            <div style={{
                position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none",
                background: "radial-gradient(ellipse at 50% 100%, #0a1a0f 0%, #050d10 40%, #000008 100%)",
            }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: 1, height: 1, boxShadow: small,  animation: "twinkle-s 3s infinite" }} />
                <div style={{ position: "absolute", top: 0, left: 0, width: 2, height: 2, boxShadow: medium, animation: "twinkle-m 5s infinite", borderRadius: "50%" }} />
                <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: 3, boxShadow: large,  animation: "twinkle-l 7s infinite", borderRadius: "50%" }} />
            </div>
        </>
    );
}
