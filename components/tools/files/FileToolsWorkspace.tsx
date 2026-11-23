'use client';

import { useState } from 'react';
import JSZip from 'jszip';
import { Check, Copy, Download, File as FileIcon, FolderOpen, Trash2 } from 'lucide-react';
import FileDropzone from '@/components/tool-ui/FileDropzone';
import ProcessingStatus from '@/components/tool-ui/ProcessingStatus';
import {
  BatchRenameOptions,
  computeRenamedFileName,
  csvRowsToJsonObjects,
  formatBytes,
  getSavingsPercent,
  jsonObjectsToCsv,
  parseCsvToRows,
} from '@/lib/core/file-utils';
import { formatAndCleanText } from '@/lib/core/productivity';
import { copyToClipboard, downloadBlob } from '@/lib/engines/download-helper';

interface ZipEntryItem {
  name: string;
  dir: boolean;
  size: number;
  entry: JSZip.JSZipObject;
}

export default function FileToolsWorkspace({ slug }: { slug: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');

  // Create ZIP
  const [zipName, setZipName] = useState('monjez-archive');
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);

  // Extract ZIP
  const [zipEntries, setZipEntries] = useState<ZipEntryItem[]>([]);
  const [zipPreviewText, setZipPreviewText] = useState<{ name: string; content: string } | null>(null);

  // Batch rename
  const [renameOpts, setRenameOpts] = useState<BatchRenameOptions>({
    prefix: '',
    suffix: '',
    findText: '',
    replaceText: '',
    useNumbering: true,
    startNumber: 1,
    padDigits: 3,
    caseMode: 'keep',
  });

  // File inspector
  const [inspectedInfo, setInspectedInfo] = useState<{
    name: string;
    size: number;
    type: string;
    lastModified: string;
    sha256: string;
    sha1: string;
    dimensions?: string;
  } | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // CSV <-> JSON
  const [dataInput, setDataInput] = useState(
    'الاسم,الدور,المدينة\nخالد,مصمم منتجات,الرياض\nنورة,مهندسة برمجيات,جدة'
  );
  const [dataOutput, setDataOutput] = useState('');
  const [parsedTable, setParsedTable] = useState<string[][]>([]);

  // TXT Processor
  const [txtOutput, setTxtOutput] = useState('');
  const [txtRemoveDup, setTxtRemoveDup] = useState(true);
  const [txtRemoveEmpty, setTxtRemoveEmpty] = useState(true);
  const [txtSort, setTxtSort] = useState<'none' | 'asc' | 'desc'>('none');

  const computeHash = async (buffer: ArrayBuffer, algo: 'SHA-256' | 'SHA-1'): Promise<string> => {
    const hashBuffer = await crypto.subtle.digest(algo, buffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const handleFilesSelected = async (incoming: File[]) => {
    setStatus('idle');
    setMessage('');
    setZipBlob(null);
    setZipPreviewText(null);

    if (slug === 'extract-zip') {
      const f = incoming[0];
      setFiles([f]);
      setStatus('processing');
      setMessage('جارٍ قراءة محتويات الأرشيف...');
      try {
        const zip = await JSZip.loadAsync(await f.arrayBuffer());
        const list: ZipEntryItem[] = [];
        zip.forEach((relativePath, entry) => {
          // @ts-expect-error internal _data holds uncompressedSize in JSZip
          const size = entry._data?.uncompressedSize ?? 0;
          list.push({ name: relativePath, dir: entry.dir, size, entry });
        });
        setZipEntries(list);
        setStatus('success');
        setMessage(`تم فتح الأرشيف وعرض ${list.filter((e) => !e.dir).length} ملفاً.`);
      } catch {
        setStatus('error');
        setMessage('ملف ZIP غير صالح أو تالف.');
      }
      return;
    }

    if (slug === 'file-inspector') {
      const f = incoming[0];
      setFiles([f]);
      setStatus('processing');
      setMessage('جارٍ فحص الملف وحساب البصمات الرقمية...');
      try {
        const buf = await f.arrayBuffer();
        const [sha256, sha1] = await Promise.all([
          computeHash(buf, 'SHA-256'),
          computeHash(buf, 'SHA-1'),
        ]);
        let dimensions: string | undefined;
        if (f.type.startsWith('image/')) {
          const url = URL.createObjectURL(f);
          dimensions = await new Promise<string | undefined>((resolve) => {
            const img = new window.Image();
            img.onload = () => {
              URL.revokeObjectURL(url);
              resolve(`${img.naturalWidth} × ${img.naturalHeight} بكسل`);
            };
            img.onerror = () => {
              URL.revokeObjectURL(url);
              resolve(undefined);
            };
            img.src = url;
          });
        }
        setInspectedInfo({
          name: f.name,
          size: f.size,
          type: f.type || 'غير محدد (application/octet-stream)',
          lastModified: new Date(f.lastModified).toLocaleString('ar-EG'),
          sha256,
          sha1,
          dimensions,
        });
        setStatus('success');
        setMessage('اكتمل فحص الملف وحساب التوقيع الرقمي.');
      } catch {
        setStatus('error');
        setMessage('تعذر فحص الملف.');
      }
      return;
    }

    if (slug === 'csv-json-converter') {
      const f = incoming[0];
      const text = await f.text();
      setDataInput(text);
      setFiles([f]);
      return;
    }

    setFiles((prev) =>
      slug === 'create-zip' || slug === 'batch-rename' || slug === 'txt-processor'
        ? [...prev, ...incoming]
        : incoming.slice(0, 1)
    );
  };

  const handleCreateZip = async () => {
    if (files.length === 0) return;
    setStatus('processing');
    setProgress(10);
    setMessage('جارٍ ضغط الملفات وإنشاء أرشيف ZIP...');

    try {
      const zip = new JSZip();
      for (const f of files) {
        zip.file(f.name, await f.arrayBuffer());
      }
      const blob = await zip.generateAsync(
        { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
        (meta) => setProgress(meta.percent)
      );
      setZipBlob(blob);
      setStatus('success');
      const totalOriginal = files.reduce((s, f) => s + f.size, 0);
      const saved = Math.max(0, getSavingsPercent(totalOriginal, blob.size));
      setMessage(`تم إنشاء الأرشيف بنجاح (${formatBytes(blob.size)} · توفير ${saved}%).`);
    } catch {
      setStatus('error');
      setMessage('تعذر إنشاء ملف ZIP.');
    }
  };

  const handleBatchRenameZip = async () => {
    if (files.length === 0) return;
    setStatus('processing');
    setMessage('جارٍ إعادة تسمية الملفات وتجميعها...');
    try {
      const zip = new JSZip();
      const usedNames = new Set<string>();
      for (let i = 0; i < files.length; i++) {
        let newName = computeRenamedFileName(files[i].name, i, renameOpts);
        if (usedNames.has(newName)) {
          newName = `${i + 1}_${newName}`;
        }
        usedNames.add(newName);
        zip.file(newName, await files[i].arrayBuffer());
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(blob, 'renamed-files-monjez.zip');
      setStatus('success');
      setMessage(`تمت إعادة تسمية ${files.length} ملفات وتنزيلها في أرشيف ZIP.`);
    } catch {
      setStatus('error');
      setMessage('حدث خطأ أثناء إعادة التسمية الجماعية.');
    }
  };

  const handleProcessTxtFiles = async () => {
    if (files.length === 0) return;
    setStatus('processing');
    try {
      const texts = await Promise.all(files.map((f) => f.text()));
      const merged = texts.join('\n');
      const cleaned = formatAndCleanText(merged, {
        trimLines: true,
        collapseSpaces: true,
        removeEmptyLines: txtRemoveEmpty,
        removeTashkeel: false,
        normalizeAlef: false,
        deduplicateLines: txtRemoveDup,
        sortLines: txtSort,
      });
      setTxtOutput(cleaned);
      setStatus('success');
      setMessage(`تمت معالجة ${files.length} ملف نصي بنجاح.`);
    } catch {
      setStatus('error');
      setMessage('تعذرت قراءة الملفات النصية.');
    }
  };

  const convertCsvToJson = () => {
    const rows = parseCsvToRows(dataInput);
    if (rows.length === 0) {
      setStatus('error');
      setMessage('لم يتم العثور على بيانات CSV صالحة.');
      return;
    }
    setParsedTable(rows.slice(0, 50));
    const objs = csvRowsToJsonObjects(rows);
    setDataOutput(JSON.stringify(objs, null, 2));
    setStatus('success');
    setMessage(`تم تحويل ${objs.length} سجل إلى صيغة JSON.`);
  };

  const convertJsonToCsv = () => {
    try {
      const parsed = JSON.parse(dataInput);
      if (!Array.isArray(parsed)) {
        throw new Error('يجب أن يكون JSON عبارة عن مصفوفة من الكائنات [ { ... } ].');
      }
      const csv = jsonObjectsToCsv(parsed, true);
      if (!csv) throw new Error('المصفوفة فارغة أو لا تحتوي على حقول.');
      setDataOutput(csv);
      setParsedTable(parseCsvToRows(csv).slice(0, 50));
      setStatus('success');
      setMessage(`تم تحويل ${parsed.length} سجل إلى CSV جاهز لبرنامج Excel.`);
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'صيغة JSON غير صالحة.');
    }
  };

  return (
    <div className="space-y-6">
      {slug !== 'csv-json-converter' && (
        <FileDropzone
          accept={slug === 'extract-zip' ? ['.zip'] : slug === 'txt-processor' ? ['.txt', '.md', '.log', '.csv'] : ['*']}
          multiple={slug === 'create-zip' || slug === 'batch-rename' || slug === 'txt-processor'}
          onFilesSelected={handleFilesSelected}
          title={
            slug === 'extract-zip'
              ? 'اختر ملف ZIP لاستعراضه وفك ضغطه'
              : slug === 'file-inspector'
                ? 'اختر أي ملف لفحص بياناته وبصمة SHA-256'
                : 'اختر ملفاً أو مجموعة ملفات'
          }
        />
      )}

      {/* Create ZIP */}
      {slug === 'create-zip' && files.length > 0 && (
        <div className="space-y-4">
          <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {files.map((f, idx) => (
              <li key={`${f.name}-${idx}`} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <FileIcon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                  <span className="truncate font-medium text-slate-900">{f.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-xs tabular-nums text-slate-500">
                    {formatBytes(f.size)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                    aria-label={`إزالة ${f.name}`}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <label className="text-sm font-medium text-slate-800">
              اسم الأرشيف
              <input
                type="text"
                value={zipName}
                onChange={(e) => setZipName(e.target.value)}
                className="mt-1.5 block rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </label>
            <button
              type="button"
              onClick={handleCreateZip}
              className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
            >
              إنشاء ملف ZIP
            </button>
            {zipBlob && (
              <button
                type="button"
                onClick={() => downloadBlob(zipBlob, `${zipName || 'archive'}.zip`)}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>تنزيل ({formatBytes(zipBlob.size)})</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Extract ZIP */}
      {slug === 'extract-zip' && zipEntries.length > 0 && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <ul className="divide-y divide-slate-100">
              {zipEntries
                .filter((e) => !e.dir)
                .map((item) => {
                  const isText = /\.(txt|md|json|csv|xml|html|css|js|ts|log)$/i.test(item.name);
                  return (
                    <li
                      key={item.name}
                      className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FolderOpen className="h-4 w-4 shrink-0 text-blue-700" aria-hidden="true" />
                        <span className="truncate font-mono text-xs text-slate-900" dir="ltr">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs tabular-nums text-slate-500">
                          {formatBytes(item.size)}
                        </span>
                        {isText && (
                          <button
                            type="button"
                            onClick={async () => {
                              const content = await item.entry.async('string');
                              setZipPreviewText({ name: item.name, content: content.slice(0, 8000) });
                            }}
                            className="text-xs font-semibold text-slate-700 hover:underline"
                          >
                            معاينة
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={async () => {
                            const blob = await item.entry.async('blob');
                            const filename = item.name.split('/').pop() || 'extracted-file';
                            downloadBlob(blob, filename);
                          }}
                          className="inline-flex items-center gap-1 rounded-md bg-blue-700 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-800"
                        >
                          <Download className="h-3 w-3" aria-hidden="true" />
                          <span>استخراج</span>
                        </button>
                      </div>
                    </li>
                  );
                })}
            </ul>
          </div>

          {zipPreviewText && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="mb-2 font-mono text-xs font-bold text-slate-700" dir="ltr">
                {zipPreviewText.name}
              </p>
              <pre
                dir="ltr"
                className="max-h-64 overflow-auto rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-800"
              >
                {zipPreviewText.content}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Batch Rename */}
      {slug === 'batch-rename' && files.length > 0 && (
        <div className="space-y-4">
          <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-xs font-semibold text-slate-800">
              بادئة (Prefix)
              <input
                type="text"
                value={renameOpts.prefix}
                onChange={(e) => setRenameOpts((p) => ({ ...p, prefix: e.target.value }))}
                placeholder="مثال: doc_"
                className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs font-semibold text-slate-800">
              لاحقة (Suffix)
              <input
                type="text"
                value={renameOpts.suffix}
                onChange={(e) => setRenameOpts((p) => ({ ...p, suffix: e.target.value }))}
                placeholder="مثال: _final"
                className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs font-semibold text-slate-800">
              استبدال نص
              <input
                type="text"
                value={renameOpts.findText}
                onChange={(e) => setRenameOpts((p) => ({ ...p, findText: e.target.value }))}
                placeholder="ابحث عن..."
                className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs font-semibold text-slate-800">
              بالنص الجديد
              <input
                type="text"
                value={renameOpts.replaceText}
                onChange={(e) => setRenameOpts((p) => ({ ...p, replaceText: e.target.value }))}
                placeholder="استبدل بـ..."
                className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={renameOpts.useNumbering}
                onChange={(e) => setRenameOpts((p) => ({ ...p, useNumbering: e.target.checked }))}
                className="h-4 w-4 accent-blue-700"
              />
              <span>إضافة ترقيم تسلسلي</span>
            </label>
            <label className="text-xs font-semibold text-slate-800">
              بدء الترقيم من
              <input
                type="number"
                min={0}
                value={renameOpts.startNumber}
                onChange={(e) =>
                  setRenameOpts((p) => ({ ...p, startNumber: Number(e.target.value) || 0 }))
                }
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-mono tabular-nums"
              />
            </label>
            <label className="text-xs font-semibold text-slate-800">
              حالة الأحرف الإنجليزية
              <select
                value={renameOpts.caseMode}
                onChange={(e) =>
                  setRenameOpts((p) => ({
                    ...p,
                    caseMode: e.target.value as 'keep' | 'lower' | 'upper',
                  }))
                }
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
              >
                <option value="keep">كما هي</option>
                <option value="lower">أحرف صغيرة (lowercase)</option>
                <option value="upper">أحرف كبيرة (UPPERCASE)</option>
              </select>
            </label>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-right text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-2.5 font-bold">الاسم الحالي</th>
                  <th className="px-4 py-2.5 font-bold">الاسم الجديد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {files.map((f, idx) => (
                  <tr key={`${f.name}-${idx}`}>
                    <td className="px-4 py-2 font-mono text-slate-500">{f.name}</td>
                    <td className="px-4 py-2 font-mono font-semibold text-blue-700">
                      {computeRenamedFileName(f.name, idx, renameOpts)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={handleBatchRenameZip}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>تنفيذ وتنزيل الملفات (ZIP)</span>
          </button>
        </div>
      )}

      {/* File Inspector */}
      {slug === 'file-inspector' && inspectedInfo && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <h3 className="text-base font-bold text-slate-900">تفاصيل الملف وبصمات التحقق</h3>
          <dl className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-xs text-slate-500">اسم الملف</dt>
              <dd className="mt-1 font-semibold text-slate-900 break-all">{inspectedInfo.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">الحجم الدقيق</dt>
              <dd className="mt-1 font-mono tabular-nums text-slate-900">
                {formatBytes(inspectedInfo.size)} ({inspectedInfo.size.toLocaleString('en-US')} بايت)
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">نوع الملف (MIME)</dt>
              <dd className="mt-1 font-mono text-xs text-slate-800">{inspectedInfo.type}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">تاريخ آخر تعديل</dt>
              <dd className="mt-1 text-slate-900">{inspectedInfo.lastModified}</dd>
            </div>
            {inspectedInfo.dimensions && (
              <div>
                <dt className="text-xs text-slate-500">أبعاد الصورة</dt>
                <dd className="mt-1 font-mono tabular-nums text-slate-900">
                  {inspectedInfo.dimensions}
                </dd>
              </div>
            )}
          </dl>

          <div className="space-y-3 border-t border-slate-100 pt-4">
            {[
              { label: 'SHA-256', val: inspectedInfo.sha256 },
              { label: 'SHA-1', val: inspectedInfo.sha1 },
            ].map((h) => (
              <div key={h.label} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 p-3">
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-700">{h.label}</span>
                  <p className="mt-0.5 truncate font-mono text-xs text-slate-800" dir="ltr">
                    {h.val}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await copyToClipboard(h.val);
                    setCopiedHash(h.label);
                    setTimeout(() => setCopiedHash(null), 1500);
                  }}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  {copiedHash === h.label ? (
                    <Check className="h-3.5 w-3.5 text-emerald-700" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>{copiedHash === h.label ? 'نُسخ' : 'نسخ'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CSV & JSON Converter */}
      {slug === 'csv-json-converter' && (
        <div className="space-y-4">
          <FileDropzone
            accept={['.csv', '.json', '.txt']}
            multiple={false}
            onFilesSelected={handleFilesSelected}
            title="ارفع ملف CSV أو JSON، أو الصق البيانات مباشرة بالأسفل"
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-900">
                البيانات المدخلة (CSV أو JSON)
                <textarea
                  value={dataInput}
                  onChange={(e) => setDataInput(e.target.value)}
                  rows={10}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={convertCsvToJson}
                  className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
                >
                  تحويل CSV إلى JSON
                </button>
                <button
                  type="button"
                  onClick={convertJsonToCsv}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100"
                >
                  تحويل JSON إلى CSV
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">النتيجة</span>
                {dataOutput && (
                  <button
                    type="button"
                    onClick={() => {
                      const isJson = dataOutput.trim().startsWith('[') || dataOutput.trim().startsWith('{');
                      downloadBlob(
                        new Blob([dataOutput], { type: 'text/plain;charset=utf-8' }),
                        isJson ? 'converted.json' : 'converted.csv'
                      );
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>تنزيل الملف</span>
                  </button>
                )}
              </div>
              <textarea
                readOnly
                value={dataOutput}
                rows={10}
                placeholder="ستظهر النتيجة المحولة هنا..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-900"
              />
            </div>
          </div>

          {parsedTable.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-right text-xs">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    {parsedTable[0].map((cell, i) => (
                      <th key={i} className="px-3 py-2 font-bold text-slate-900">
                        {cell}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedTable.slice(1).map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3 py-2 text-slate-700">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TXT Processor */}
      {slug === 'txt-processor' && files.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={txtRemoveDup}
                onChange={(e) => setTxtRemoveDup(e.target.checked)}
                className="h-4 w-4 accent-blue-700"
              />
              <span>إزالة الأسطر المكررة</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={txtRemoveEmpty}
                onChange={(e) => setTxtRemoveEmpty(e.target.checked)}
                className="h-4 w-4 accent-blue-700"
              />
              <span>حذف الأسطر الفارغة</span>
            </label>
            <select
              value={txtSort}
              onChange={(e) => setTxtSort(e.target.value as 'none' | 'asc' | 'desc')}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
            >
              <option value="none">بدون فرز</option>
              <option value="asc">ترتيب تصاعدي</option>
              <option value="desc">ترتيب تنازلي</option>
            </select>
            <button
              type="button"
              onClick={handleProcessTxtFiles}
              className="rounded-lg bg-blue-700 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-800"
            >
              دمج وتنظيف ({files.length} ملف)
            </button>
          </div>

          {txtOutput && (
            <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">الملف النصي الناتج</span>
                <button
                  type="button"
                  onClick={() =>
                    downloadBlob(
                      new Blob([txtOutput], { type: 'text/plain;charset=utf-8' }),
                      'processed-text.txt'
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>تنزيل TXT</span>
                </button>
              </div>
              <textarea
                readOnly
                value={txtOutput}
                rows={12}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900"
              />
            </div>
          )}
        </div>
      )}

      <ProcessingStatus status={status} progress={progress} message={message} />
    </div>
  );
}
