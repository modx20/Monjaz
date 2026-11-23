import Link from 'next/link';
import { TOOL_CATEGORIES } from '@/lib/tools-registry';

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="text-xl font-extrabold text-slate-950">
              مِنْجَز
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
              مكتبة رقمية عربية متكاملة للأدوات العملية. جميع عمليات معالجة ملفات PDF والصور والمستندات تتم داخل متصفحك مباشرة للحفاظ على خصوصيتك وسرعة الإنجاز.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900">أقسام الأدوات</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {TOOL_CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/#${cat.anchorId}`} className="hover:text-slate-950">
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900">عن المنصة والقانونية</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/about" className="hover:text-slate-950">
                  من نحن
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-slate-950">
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-slate-950">
                  شروط الاستخدام
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-slate-950">
                  اتصل بنا
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900">الأمان والخصوصية</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>معالجة محلية في المتصفح لـ 38 أداة دون رفع الملفات.</li>
              <li>توضيح صريح ومباشر قبل أي معالجة سحابية مثل OCR.</li>
              <li>لا يتم تخزين ملفاتك أو الاحتفاظ بها بعد إتمام العملية.</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} منصة مِنْجَز للأدوات الرقمية. جميع الحقوق محفوظة.</p>
          <p>صُممت للعمل بسلاسة على الحاسوب والأجهزة اللوحية والهواتف.</p>
        </div>
      </div>
    </footer>
  );
}
