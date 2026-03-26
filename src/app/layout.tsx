import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import AppThemeProvider from "@/components/theme/AppThemeProvider";
import QueryProvider from "@/providers/QueryProvider";
import FirebaseAnalytics from "@/components/analytics/FirebaseAnalytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
    metadataBase: new URL('https://factful.dev'),
    title: {
        default: 'Factful',
        template: '%s | Factful',
    },
    description: 'No-ads browser and mobile tools by Harikrishna Nandagopal — Image Manipulator, Canvas Editor, and Directflow offline reader.',
    keywords: ['factful', 'image editor', 'canvas editor', 'epub reader', 'pdf reader', 'drawing tool', 'Harikrishna Nandagopal', 'offline tools'],
    authors: [{ name: 'Harikrishna Nandagopal', url: 'https://www.linkedin.com/in/harikrishna-n-79349121/' }],
    creator: 'Harikrishna Nandagopal',
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://factful.dev',
        siteName: 'Factful',
        title: 'Factful',
        description: 'No-ads browser and mobile tools — Image Manipulator, Canvas Editor, and Directflow offline EPub/PDF reader.',
        images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Factful' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Factful',
        description: 'No-ads browser and mobile tools — no installation required.',
        images: ['/og-image.png'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
        },
    },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <AppThemeProvider>
              <FirebaseAnalytics />
              {children}
            </AppThemeProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
