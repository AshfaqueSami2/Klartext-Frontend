import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KlarText - Learn German Through Reading',
    short_name: 'KlarText',
    description: 'Master German through comprehensible input. Interactive lessons, vocabulary building, and live practice.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#8B5CF6',
    icons: [
      {
        src: '/logo/main logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logo/main logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    categories: ['education', 'languages'],
    orientation: 'portrait',
    scope: '/',
    lang: 'en',
  };
}
