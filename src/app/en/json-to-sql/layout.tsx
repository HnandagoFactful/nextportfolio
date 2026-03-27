import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Data Converter — JSON, CSV, XML, Excel',
    description: 'Free browser-based data converter. Convert between JSON, CSV, XML, and Excel formats instantly — no upload, no sign-up, all processing done locally.',
    keywords: [
        'json to csv', 'csv to json', 'xml to json', 'xml to csv',
        'json to excel', 'csv to excel', 'excel to json', 'xml to excel',
        'data converter', 'file converter', 'online converter', 'free converter',
    ],
    openGraph: {
        title: 'Data Converter — JSON, CSV, XML, Excel',
        description: 'Convert between JSON, CSV, XML and Excel in your browser. No upload, no sign-up.',
        url: 'https://factful.dev/en/json-to-sql',
    },
    alternates: {
        canonical: 'https://factful.dev/en/json-to-sql',
    },
};

export default function ConverterLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
