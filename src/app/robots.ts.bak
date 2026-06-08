import { MetadataRoute } from 'next'

/**
 * @fileOverview Search Engine Intelligence Node
 * Protects sensitive administrative hubs while enabling marketplace discovery.
 */

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/reseller/',
          '/dashboard/',
          '/profile/',
          '/wallet/',
          '/orders/',
          '/api/',
          '/kyc/'
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/'],
      },
    ],
    sitemap: 'https://aatmahub.com/sitemap.xml',
  }
}
