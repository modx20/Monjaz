import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'مِنْجَز | منصة الأدوات الرقمية الشاملة',
    short_name: 'مِنْجَز',
    description:
      'منصة عربية شاملة تضم 39 أداة رقمية مجانية لمعالجة ملفات PDF والصور والملفات والإنتاجية مباشرة في المتصفح.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#1D4ED8',
    lang: 'ar',
    dir: 'rtl',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
