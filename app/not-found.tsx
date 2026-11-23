import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-mono text-sm font-bold text-blue-700">404</p>
      <h1 className="mt-2 text-3xl font-extrabold text-slate-950">الصفحة غير موجودة</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        عذراً، لم يتم العثور على الصفحة أو الأداة المطلوبة. يمكنك العودة إلى دليل الأدوات الشامل لاختيار ما يناسبك.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
      >
        العودة إلى جميع الأدوات
      </Link>
    </div>
  );
}
