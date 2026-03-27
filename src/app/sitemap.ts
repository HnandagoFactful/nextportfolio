import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const base = 'https://factful.dev';
    const now = new Date();

    return [
        { url: `${base}/en/home`,          lastModified: now, changeFrequency: 'monthly', priority: 1.0 },
        { url: `${base}/en/about`,         lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${base}/en/canvas`,        lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
        { url: `${base}/en/diagrams`,      lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
        { url: `${base}/en/image-process`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
        { url: `${base}/en/knowble`,       lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${base}/en/privacy`,       lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    ];
}
