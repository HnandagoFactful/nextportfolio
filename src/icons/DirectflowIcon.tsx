export default function DirectflowIcon({ size = 32 }: { size?: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 32 32" fill="none">
            {/* Arrow flowing right */}
            <circle cx="6" cy="16" r="3" fill="var(--lime-9)" />
            <line x1="9" y1="16" x2="19" y2="16" stroke="var(--lime-9)" strokeWidth="2" strokeLinecap="round" />
            <polyline points="16,12 21,16 16,20" fill="none" stroke="var(--lime-9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Second parallel flow line */}
            <circle cx="6" cy="24" r="2" fill="var(--lime-7)" />
            <line x1="8" y1="24" x2="17" y2="24" stroke="var(--lime-7)" strokeWidth="1.5" strokeLinecap="round" />
            <polyline points="14.5,21 18,24 14.5,27" fill="none" stroke="var(--lime-7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Small top flow */}
            <circle cx="6" cy="9" r="2" fill="var(--lime-7)" />
            <line x1="8" y1="9" x2="17" y2="9" stroke="var(--lime-7)" strokeWidth="1.5" strokeLinecap="round" />
            <polyline points="14.5,6 18,9 14.5,12" fill="none" stroke="var(--lime-7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
