import type { Metadata } from 'next';
import { Cairo, IBM_Plex_Sans_Arabic, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['600', '700', '800'],
  variable: '--font-cairo',
  display: 'swap',
});

const ibmArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-arabic',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const rawSiteUrl = process.env.APP_URL || 'https://monjez.tools';
const siteUrl = rawSiteUrl.startsWith('http') ? rawSiteUrl : `https://${rawSiteUrl}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'مِنْجَز | منصة الأدوات الرقمية الشاملة للـ PDF والصور والملفات أونلاين',
    template: '%s | مِنْجَز',
  },
  description:
    'منصة مِنْجَز تضم 39 أداة رقمية مجانية تعمل مباشرة في متصفحك: دمج وتقسيم وضغط PDF، تحويل Word وExcel وPowerPoint إلى PDF، ضغط وقص وإزالة خلفية الصور، ZIP، ورموز QR والباركود.',
  keywords: [
    'مِنْجَز',
    'منجز',
    'أدوات رقمية أونلاين',
    'أدوات PDF مجانية',
    'دمج ملفات PDF',
    'تقسيم PDF',
    'ضغط PDF',
    'تحويل Word إلى PDF',
    'تحويل PDF إلى صور',
    'ضغط الصور أونلاين',
    'تغيير حجم الصور',
    'إزالة خلفية الصورة',
    'تحويل WebP إلى PNG',
    'ضغط وفك ضغط ZIP',
    'إنشاء رمز QR مجاني',
    'مولد باركود',
    'عداد الكلمات والحروف',
    'تنظيف النصوص العربية',
    'التعرف على النصوص OCR',
    'منصة أدوات عربية',
  ],
  authors: [{ name: 'منصة مِنْجَز', url: siteUrl }],
  creator: 'منصة مِنْجَز',
  publisher: 'منصة مِنْجَز',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: 'مِنْجَز | منصة الأدوات الرقمية الشاملة للـ PDF والصور والملفات',
    description:
      '39 أداة رقمية احترافية ومجانية لملفات PDF والصور والمستندات والإنتاجية تعمل بسرعة وخصوصية مباشرة في متصفحك.',
    url: siteUrl,
    type: 'website',
    locale: 'ar_AR',
    siteName: 'مِنْجَز',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'مِنْجَز | منصة الأدوات الرقمية الشاملة',
    description:
      'أدوات PDF والصور والملفات والإنتاجية بسرعة وأمان داخل المتصفح دون تثبيت برامج.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'مِنْجَز',
    alternateName: 'Monjez Online Tools',
    url: siteUrl,
    logo: `${siteUrl}/icon.svg`,
    description:
      'منصة عربية شاملة للأدوات الرقمية المجانية لمعالجة ملفات PDF والصور والمستندات والإنتاجية مباشرة داخل المتصفح.',
  };

  const webSiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'مِنْجَز',
    url: siteUrl,
    inLanguage: 'ar',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const webAppJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'مِنْجَز',
    url: siteUrl,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'All',
    inLanguage: 'ar',
    description:
      'منصة أدوات رقمية شاملة لمعالجة ملفات PDF والصور والمستندات وأدوات الإنتاجية مباشرة في المتصفح.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${ibmArabic.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <meta
          name="google-site-verification"
          content="j1lHc7freUmyTqpEAoy77laWUUP4OdRWiAmPQHKysf4"
        />
        <script
          async
          src="https://www.googletagmanager.com/gtm.js?id=GTM-PXFX7FRJ"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date());`,
          }}
        />
      </head>
      <body
        className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 antialiased"
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
        />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
