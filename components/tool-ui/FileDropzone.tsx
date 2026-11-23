'use client';

import { useId, useRef, useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { formatBytes, MAX_SINGLE_FILE_BYTES, validateFile } from '@/lib/core/file-utils';

interface FileDropzoneProps {
  accept: string[];
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  title?: string;
  hint?: string;
  maxBytes?: number;
  disabled?: boolean;
}

export default function FileDropzone({
  accept,
  multiple = false,
  onFilesSelected,
  title = 'اسحب الملفات وأفلتها هنا أو انقر للاختيار',
  hint,
  maxBytes = MAX_SINGLE_FILE_BYTES,
  disabled = false,
}: FileDropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const acceptAttr = accept.includes('*') ? undefined : accept.join(',');

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMsg(null);

    const incoming = Array.from(fileList);
    const toProcess = multiple ? incoming : [incoming[0]];
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of toProcess) {
      const check = validateFile(file, accept, maxBytes);
      if (check.valid) {
        validFiles.push(file);
      } else if (check.error) {
        errors.push(check.error);
      }
    }

    if (errors.length > 0) {
      setErrorMsg(errors[0]);
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (!disabled) handleFiles(e.dataTransfer.files);
        }}
        className={`relative rounded-xl border-2 border-dashed transition-colors p-6 sm:p-8 text-center ${
          isDragging
            ? 'border-blue-600 bg-blue-50/70'
            : 'border-slate-300 bg-slate-50/60 hover:border-slate-400 hover:bg-slate-50'
        } ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={acceptAttr}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => handleFiles(e.target.files)}
          className="sr-only"
        />

        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-blue-700">
          <Upload className="h-5 w-5" aria-hidden="true" />
        </div>

        <p className="text-base font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm text-slate-600">
          {hint ||
            (accept.includes('*')
              ? `يدعم جميع أنواع الملفات · الحد الأقصى للملف ${formatBytes(maxBytes, 0)}`
              : `الصيغ المدعومة: ${accept.join(' ، ')} · الحد الأقصى ${formatBytes(maxBytes, 0)}`)}
        </p>

        <div className="mt-4">
          <label
            htmlFor={inputId}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 focus-within:ring-2 focus-within:ring-blue-600"
          >
            <span>{multiple ? 'اختيار الملفات' : 'اختيار ملف'}</span>
          </label>
        </div>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
