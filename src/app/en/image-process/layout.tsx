import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Image Manipulator',
    description: 'Upload and edit images in your browser — crop, scale, rotate, and reposition. No server uploads, no data collection.',
    keywords: ['image editor', 'crop image', 'resize image', 'rotate image', 'browser image editor', 'free image tool', 'image manipulator', 'aspect ratio crop'],
    openGraph: {
        title: 'Image Manipulator',
        description: 'Crop, scale, rotate, and reposition images — all in your browser, nothing uploaded to a server.',
        url: 'https://images.factful.dev',
    },
    alternates: {
        canonical: 'https://images.factful.dev',
    },
};

export default function ImageProcessLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
