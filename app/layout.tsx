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

const siteUrl = process.env.APP_URL || 'https://monjez.tools';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`),
  title: {
    default: 'مِنْجَز | منصة الأدوات الرقمية الشاملة للـ PDF والصور والملفات',
    template: '%s | مِنْجَز',
  },
  description:
    'أنجز مهامك الرقمية مجاناً وبخصوصية تامة داخل متصفحك: دمج وضغط وتحويل ملفات PDF، تعديل الصور، ضغط ZIP، وأدوات الإنتاجية والمحتوى باللغة العربية.',
  keywords: [
    'أدوات PDF',
    'دمج PDF',
    'ضغط PDF',
    'تحويل الصور',
    'ضغط الصور',
    'إزالة خلفية الصورة',
    'توليد QR',
    'أدوات رقمية عربية',
  ],
  openGraph: {
    title: 'مِنْجَز | منصة الأدوات الرقمية الشاملة للـ PDF والصور والملفات',
    description:
      'أكثر من 30 أداة رقمية عملية تعمل مباشرة في متصفحك لملفات PDF والصور والمستندات والإنتاجية.',
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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'مِنْجَز',
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
      <body className="min-h-screen flex flex-col bg-[#FAFAF9] text-slate-900 antialiased" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
