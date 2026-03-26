import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Knowble',
    description: 'Knowble — a knowledge-sharing Q&A platform with voice recording, categories, and tags.',
    keywords: ['knowble', 'knowledge sharing', 'Q&A platform', 'voice recording', 'questions and answers'],
    openGraph: {
        title: 'Knowble',
        description: 'Ask questions, share knowledge, and record voice moments.',
        url: 'https://factful.dev/en/knowble',
    },
    alternates: {
        canonical: 'https://factful.dev/en/knowble',
    },
};

export default function KnowbleLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
