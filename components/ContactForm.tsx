'use client';

import { useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('اقتراح أداة جديدة');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (name.trim().length < 2) {
      setError('يرجى إدخال اسمك الكامل (حرفان على الأقل).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('يرجى إدخال بريد إلكتروني صحيح.');
      return;
    }

    if (message.trim().length < 10) {
      setError('يرجى كتابة تفاصيل رسالتك (10 أحرف على الأقل).');
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-950">تم استلام رسالتك بنجاح</h2>
        <p className="mt-2 text-sm text-slate-700">
          شكراً لتواصلك مع فريق منصة <strong>مِنْجَز</strong> بخصوص «{topic}». نراجع جميع المقترحات والملاحظات التقنية بعناية.
        </p>
        <button
          type="button"
          onClick={() => {
            setName('');
            setEmail('');
            setMessage('');
            setSubmitted(false);
          }}
          className="mt-6 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
        >
          إرسال رسالة أخرى
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="block text-sm font-semibold text-slate-900">
            الاسم
          </label>
          <input
            id="contact-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: أحمد محمد"
            required
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/15"
          />
        </div>

        <div>
          <label htmlFor="contact-email" className="block text-sm font-semibold text-slate-900">
            البريد الإلكتروني
          </label>
          <input
            id="contact-email"
            type="email"
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-left text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/15"
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-topic" className="block text-sm font-semibold text-slate-900">
          موضوع الرسالة
        </label>
        <select
          id="contact-topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/15"
        >
          <option value="اقتراح أداة جديدة">اقتراح أداة جديدة</option>
          <option value="الإبلاغ عن مشكلة تقنية">الإبلاغ عن مشكلة تقنية</option>
          <option value="استفسار حول الخصوصية أو الأمان">استفسار حول الخصوصية أو الأمان</option>
          <option value="تعاون أو استفسار عام">تعاون أو استفسار عام</option>
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-semibold text-slate-900">
          تفاصيل الرسالة
        </label>
        <textarea
          id="contact-message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="اكتب اقتراحك أو وصف المشكلة بوضوح..."
          required
          className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/15"
        />
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 pt-1">
        <p className="text-xs text-slate-500">
          نراجع جميع الرسائل الواردة لتحسين جودة المنصة وأدواتها.
        </p>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 whitespace-nowrap shrink-0"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          <span>إرسال الرسالة</span>
        </button>
      </div>
    </form>
  );
}
