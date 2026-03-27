import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Diagrams',
    description: 'Create and view diagrams in your browser — no installation required.',
    openGraph: {
        title: 'Diagrams',
        description: 'Create and view diagrams in your browser.',
        url: 'https://factful.dev/en/diagrams',
    },
    alternates: {
        canonical: 'https://factful.dev/en/diagrams',
    },
};

export default function DiagramsLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
