import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'About',
    description: 'Harikrishna Nandagopal — software developer with experience across full-stack development, mobile apps, and browser tools.',
    keywords: ['Harikrishna Nandagopal', 'software developer', 'portfolio', 'full stack developer', 'mobile developer'],
    openGraph: {
        title: 'About Harikrishna Nandagopal',
        description: 'Software developer — experience, education, and background.',
        url: 'https://factful.dev/en/about',
    },
    alternates: {
        canonical: 'https://factful.dev/en/about',
    },
};

export default function AboutLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
