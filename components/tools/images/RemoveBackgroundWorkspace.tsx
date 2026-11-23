'use client';

import { useRef, useState } from 'react';
import { Download, Eraser, Pipette, RotateCcw, Wand2 } from 'lucide-react';
import FileDropzone from '@/components/tool-ui/FileDropzone';
import ProcessingStatus from '@/components/tool-ui/ProcessingStatus';
import { downloadBlob } from '@/lib/engines/download-helper';
import { loadFileAsImage, removeColorFromImageData } from '@/lib/engines/image-client';

export default function RemoveBackgroundWorkspace() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalDataRef = useRef<ImageData | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [tolerance, setTolerance] = useState(32);
  const [mode, setMode] = useState<'eyedropper' | 'eraser'>('eyedropper');
  const [floodMode, setFloodMode] = useState<'flood-point' | 'global-color'>('flood-point');
  const [brushSize, setBrushSize] = useState(24);
  const [isDrawing, setIsDrawing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleFileSelected = async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setStatus('processing');
    setMessage('جارٍ تحميل الصورة في مساحة العمل...');

    try {
      const img = await loadFileAsImage(f);
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      originalDataRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setStatus('idle');
      setMessage('');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'تعذر تحميل الصورة.');
    }
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: Math.floor((e.clientX - rect.left) * scaleX),
      y: Math.floor((e.clientY - rect.top) * scaleY),
    };
  };

  const autoRemoveFromCorners = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const cornerIdx = 0; // Top-left corner pixel
    const targetRgb = {
      r: imgData.data[cornerIdx],
      g: imgData.data[cornerIdx + 1],
      b: imgData.data[cornerIdx + 2],
    };
    const next = removeColorFromImageData(imgData, targetRgb, tolerance, 'flood-corners');
    ctx.putImageData(next, 0, 0);
    setStatus('success');
    setMessage('تم تفريغ الخلفية المتصلة بالزوايا. يمكنك ضبط الحساسية أو استخدام الممحاة للتنقيح.');
  };

  const handleCanvasPointerDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    const pt = getCanvasCoords(e);
    if (!canvas || !ctx || !pt) return;

    if (mode === 'eyedropper') {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const idx = (pt.y * canvas.width + pt.x) * 4;
      if (imgData.data[idx + 3] === 0) return;
      const targetRgb = {
        r: imgData.data[idx],
        g: imgData.data[idx + 1],
        b: imgData.data[idx + 2],
      };
      const next = removeColorFromImageData(imgData, targetRgb, tolerance, floodMode, pt);
      ctx.putImageData(next, 0, 0);
      setStatus('success');
      setMessage('تمت إزالة اللون المحدد. انقر على أي مناطق متبقية لإزالتها.');
    } else {
      setIsDrawing(true);
      eraseAt(ctx, pt.x, pt.y);
    }
  };

  const eraseAt = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const handleCanvasPointerMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || mode !== 'eraser') return;
    const ctx = canvasRef.current?.getContext('2d');
    const pt = getCanvasCoords(e);
    if (!ctx || !pt) return;
    eraseAt(ctx, pt.x, pt.y);
  };

  const resetOriginal = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx && originalDataRef.current) {
      ctx.putImageData(originalDataRef.current, 0, 0);
      setStatus('idle');
      setMessage('');
    }
  };

  const downloadTransparentPng = () => {
    const canvas = canvasRef.current;
    if (!canvas || !file) return;
    canvas.toBlob((blob) => {
      if (blob) {
        downloadBlob(blob, `${file.name.replace(/\.[^.]+$/, '')}_transparent.png`);
      }
    }, 'image/png');
  };

  return (
    <div className="space-y-6">
      <FileDropzone
        accept={['.png', '.jpg', '.jpeg', '.webp']}
        multiple={false}
        onFilesSelected={handleFileSelected}
        title="اختر الصورة لتفريغ خلفيتها إلى PNG شفاف"
      />

      <div className={file ? 'space-y-4' : 'hidden'}>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={autoRemoveFromCorners}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-800"
            >
              <Wand2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>تفريغ تلقائي من الزوايا</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('eyedropper')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold ${
                mode === 'eyedropper'
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200 bg-white text-slate-700'
              }`}
            >
              <Pipette className="h-3.5 w-3.5" aria-hidden="true" />
              <span>التقاط لون الخلفية</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('eraser')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold ${
                mode === 'eraser'
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200 bg-white text-slate-700'
              }`}
            >
              <Eraser className="h-3.5 w-3.5" aria-hidden="true" />
              <span>ممحاة يدوية</span>
            </button>

            <button
              type="button"
              onClick={resetOriginal}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>استعادة الأصل</span>
            </button>
          </div>

          <button
            type="button"
            onClick={downloadTransparentPng}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>تنزيل PNG شفاف</span>
          </button>
        </div>

        <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
          <label className="text-xs font-medium text-slate-700">
            حساسية إزالة اللون ({tolerance})
            <input
              type="range"
              min={5}
              max={95}
              value={tolerance}
              onChange={(e) => setTolerance(Number(e.target.value))}
              className="mt-2 block w-full accent-blue-700"
            />
          </label>

          <label className="text-xs font-medium text-slate-700">
            نطاق الالتقاط
            <select
              value={floodMode}
              onChange={(e) => setFloodMode(e.target.value as 'flood-point' | 'global-color')}
              className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
            >
              <option value="flood-point">المنطقة المتصلة فقط (موصى به)</option>
              <option value="global-color">كل البكسلات المشابهة في الصورة</option>
            </select>
          </label>

          <label className="text-xs font-medium text-slate-700">
            حجم الممحاة اليدوية ({brushSize}px)
            <input
              type="range"
              min={6}
              max={80}
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="mt-2 block w-full accent-blue-700"
            />
          </label>
        </div>

        <div className="overflow-auto rounded-xl border border-slate-200 p-4 text-center checkerboard-bg">
          <canvas
            ref={canvasRef}
            onMouseDown={handleCanvasPointerDown}
            onMouseMove={handleCanvasPointerMove}
            onMouseUp={() => setIsDrawing(false)}
            onMouseLeave={() => setIsDrawing(false)}
            className={`mx-auto max-h-[480px] max-w-full ${
              mode === 'eyedropper' ? 'cursor-crosshair' : 'cursor-cell'
            }`}
          />
          <p className="mt-2 text-xs text-slate-600">
            {mode === 'eyedropper'
              ? 'انقر على أي جزء من الخلفية لإزالته، أو استخدم «تفريغ تلقائي من الزوايا».'
              : 'اسحب فوق الأجزاء التي تريد مسحها يدوياً.'}
          </p>
        </div>
      </div>

      <ProcessingStatus status={status} message={message} />
    </div>
  );
}
