import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Canvas Editor',
    description: 'A browser-based drawing editor with shapes, connected arrows, text on path, freehand brush, layers, and animations. No sign-up, no data upload.',
    keywords: ['canvas editor', 'drawing tool', 'diagram maker', 'shapes', 'connected arrows', 'Fabric.js', 'online drawing', 'free canvas tool'],
    openGraph: {
        title: 'Canvas Editor',
        description: 'Create diagrams and illustrations in your browser — shapes, arrows, text, layers, and animations.',
        url: 'https://canvas.factful.dev',
    },
    alternates: {
        canonical: 'https://canvas.factful.dev',
    },
};

export default function CanvasLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
