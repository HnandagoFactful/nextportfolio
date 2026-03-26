import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'Privacy policy for Factful tools. All processing happens in your browser — no data is collected or transmitted.',
    openGraph: {
        title: 'Privacy Policy',
        description: 'How Factful tools handle your data — spoiler: they don\'t.',
        url: 'https://factful.dev/en/privacy',
    },
    robots: {
        index: true,
        follow: false,
    },
    alternates: {
        canonical: 'https://factful.dev/en/privacy',
    },
};

export default function PrivacyLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
