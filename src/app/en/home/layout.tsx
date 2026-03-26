import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Tools',
    description: 'No-ads browser and mobile tools by Harikrishna — Image Manipulator, Canvas Editor, and Directflow offline EPub/PDF reader.',
    keywords: ['factful tools', 'image manipulator', 'canvas editor', 'directflow reader', 'epub reader', 'pdf reader', 'browser tools'],
    openGraph: {
        title: 'Factful Tools',
        description: 'No-ads browser and mobile tools — Image Manipulator, Canvas Editor, and Directflow offline EPub/PDF reader.',
        url: 'https://factful.dev/en/home',
    },
    alternates: {
        canonical: 'https://factful.dev',
    },
};

export default function HomeLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
