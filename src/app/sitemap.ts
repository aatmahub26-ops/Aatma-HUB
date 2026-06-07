import { MetadataRoute } from 'next'
import { GAMES } from '@/lib/data'

/**
 * @fileOverview Dynamic Sitemap Generator
 * Indexes core sectors and categorical marketplace nodes.
 */

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://aatmahub.com'

  const routes = [
    '',
    '/catalog',
    '/community',
    '/tools/mlbb',
    '/about',
    '/contact',
    '/terms',
    '/privacy',
    '/refund-policy',
    '/leaderboard'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  const catalogRoutes = GAMES.map((game) => ({
    url: `${baseUrl}/catalog/${game.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...routes, ...catalogRoutes]
}
