import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/*', '/login'],
      },
    ],
    sitemap: 'https://centralphones.com.br/sitemap.xml',
  };
}
