'use client';

import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface ProcessingStatusProps {
  status: 'idle' | 'processing' | 'success' | 'error';
  progress?: number; // 0 - 100
  message?: string;
}

export default function ProcessingStatus({
  status,
  progress,
  message,
}: ProcessingStatusProps) {
  if (status === 'idle') return null;

  if (status === 'processing') {
    const pct = typeof progress === 'number' ? Math.max(0, Math.min(100, Math.round(progress))) : null;
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-xl border border-blue-200 bg-blue-50/80 p-4 text-blue-950"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Loader2 className="h-4 w-4 animate-spin text-blue-700" aria-hidden="true" />
            <span className="text-sm font-semibold">
              {message || 'جارٍ تنفيذ المعالجة...'}
            </span>
          </div>
          {pct !== null && (
            <span className="font-mono text-xs font-semibold tabular-nums text-blue-800">
              {pct}%
            </span>
          )}
        </div>
        {pct !== null && (
          <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-blue-100">
            <div
              className="h-full bg-blue-700 transition-all duration-200"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div
        role="alert"
        className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"
      >
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
        <span>{message || 'حدث خطأ غير متوقع أثناء المعالجة.'}</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
    >
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
      <span>{message || 'تمت المعالجة بنجاح وأصبح الملف جاهزاً للتنزيل.'}</span>
    </div>
  );
}
