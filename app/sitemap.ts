import { MetadataRoute } from 'next';
import { INITIAL_PRODUTOS } from '@/lib/supabase/mock-data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://centralphones.com.br';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/produtos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  const productRoutes: MetadataRoute.Sitemap = INITIAL_PRODUTOS.map((prod) => ({
    url: `${baseUrl}/produtos/${prod.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
