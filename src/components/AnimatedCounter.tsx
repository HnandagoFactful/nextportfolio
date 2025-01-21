"use client"
import * as motion from "motion/react-client"

export default function AnimatedCounter({
    timeLimit = 5,
    color,
    onComplete
}: {
    timeLimit?: number;
    color: string;
    onComplete?: () => void
}) {
    const shape: React.CSSProperties = {
        strokeWidth: 4,
        strokeLinecap: "round",
        stroke: color,
        fill: "var(--lime-a10)",
    }

    const draw = {
        hidden: { pathLength: 0, },
        visible: () => {
            return {
                pathLength: 1,
                opacity: 1,
                duration: timeLimit,
                transition: {
                    pathLength: {type: "easein", duration: timeLimit, bounce: 0,  },
                },
            }
        },
    }
    return (
        <motion.svg
            width="36px"
            height="36px"
            viewBox="0 0 24 24"
            initial="hidden"
            animate="visible"
            onAnimationComplete={() => {
                onComplete?.()
            }}
        >
            <motion.circle
                className="circle-path"
                cx="12"
                cy="12"
                r="9"
                stroke="red"
                variants={draw}
                custom={1}
                style={shape}
            />
        </motion.svg>
    )

}