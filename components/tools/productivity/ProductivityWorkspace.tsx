'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy, Download, RefreshCw } from 'lucide-react';
import {
  analyzeText,
  convertUnit,
  formatAndCleanText,
  generatePassword,
  getContrastRatio,
  hexToRgb,
  processJsonText,
  rgbToCmyk,
  rgbToHsl,
  TextCleanOptions,
  UNIT_CATEGORIES,
  UnitCategory,
} from '@/lib/core/productivity';
import { copyToClipboard, downloadBlob } from '@/lib/engines/download-helper';

export default function ProductivityWorkspace({ slug }: { slug: string }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyFeedback = async (id: string, text: string) => {
    await copyToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1600);
  };

  // ======================== 1. QR GENERATOR ========================
  const [qrMode, setQrMode] = useState<'url' | 'wifi' | 'whatsapp' | 'email'>('url');
  const [qrText, setQrText] = useState('https://monjazz.netlify.app');
  const [wifiSsid, setWifiSsid] = useState('Monjez_WiFi');
  const [wifiPass, setWifiPass] = useState('12345678');
  const [wifiSec, setWifiSec] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [waPhone, setWaPhone] = useState('966500000000');
  const [waMsg, setWaMsg] = useState('مرحباً، أود الاستفسار عن...');
  const [qrFg, setQrFg] = useState('#0F172A');
  const [qrBg, setQrBg] = useState('#FFFFFF');
  const [qrSize, setQrSize] = useState(320);
  const [qrPngUrl, setQrPngUrl] = useState('');
  const [qrSvgStr, setQrSvgStr] = useState('');

  const qrPayload = useMemo(() => {
    if (qrMode === 'wifi') {
      return `WIFI:T:${wifiSec};S:${wifiSsid};P:${wifiPass};;`;
    }
    if (qrMode === 'whatsapp') {
      return `https://wa.me/${waPhone.replace(/\D/g, '')}?text=${encodeURIComponent(waMsg)}`;
    }
    if (qrMode === 'email') {
      return `mailto:${qrText}`;
    }
    return qrText || ' ';
  }, [qrMode, qrText, wifiSec, wifiSsid, wifiPass, waPhone, waMsg]);

  useEffect(() => {
    if (slug !== 'qr-generator') return;
    let active = true;
    import('qrcode').then(async (QRCode) => {
      try {
        const pngUrl = await QRCode.toDataURL(qrPayload, {
          width: qrSize,
          margin: 2,
          color: { dark: qrFg, light: qrBg },
        });
        const svgStr = await QRCode.toString(qrPayload, {
          type: 'svg',
          margin: 2,
          color: { dark: qrFg, light: qrBg },
        });
        if (active) {
          setQrPngUrl(pngUrl);
          setQrSvgStr(svgStr);
        }
      } catch {
        // Ignore transient empty input
      }
    });
    return () => {
      active = false;
    };
  }, [slug, qrPayload, qrFg, qrBg, qrSize]);

  // ======================== 2. BARCODE GENERATOR ========================
  const barcodeSvgRef = useRef<SVGSVGElement>(null);
  const [bcValue, setBcValue] = useState('MONJEZ-2026');
  const [bcFormat, setBcFormat] = useState<'CODE128' | 'EAN13' | 'CODE39' | 'UPC'>('CODE128');
  const [bcWidth, setBcWidth] = useState(2);
  const [bcHeight, setBcHeight] = useState(90);
  const [bcShowText, setBcShowText] = useState(true);
  const [bcError, setBcError] = useState<string | null>(null);

  useEffect(() => {
    if (slug !== 'barcode-generator') return;
    let mounted = true;
    import('jsbarcode').then((mod) => {
      if (!mounted || !barcodeSvgRef.current) return;
      const JsBarcode = mod.default;
      try {
        setBcError(null);
        JsBarcode(barcodeSvgRef.current, bcValue || ' ', {
          format: bcFormat,
          width: bcWidth,
          height: bcHeight,
          displayValue: bcShowText,
          lineColor: '#0f172a',
          background: '#ffffff',
          margin: 12,
        });
      } catch {
        setBcError(
          bcFormat === 'EAN13'
            ? 'يتطلب معيار EAN-13 إدخال 12 أو 13 رقماً صحيحاً.'
            : bcFormat === 'UPC'
              ? 'يتطلب معيار UPC إدخال 11 أو 12 رقماً.'
              : 'القيمة المدخلة غير متوافقة مع صيغة الباركود المختارة.'
        );
      }
    });
    return () => {
      mounted = false;
    };
  }, [slug, bcValue, bcFormat, bcWidth, bcHeight, bcShowText]);

  const downloadBarcodePng = () => {
    const svg = barcodeSvgRef.current;
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new window.Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) downloadBlob(blob, `barcode-${bcFormat}.png`);
        }, 'image/png');
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  // ======================== 3. PASSWORD GENERATOR ========================
  const [pwConfig, setPwConfig] = useState({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
    count: 1,
  });

  const buildPasswordBatch = (cfg: typeof pwConfig) =>
    Array.from({ length: cfg.count }, () =>
      generatePassword({
        length: cfg.length,
        uppercase: cfg.uppercase,
        lowercase: cfg.lowercase,
        numbers: cfg.numbers,
        symbols: cfg.symbols,
        excludeAmbiguous: cfg.excludeAmbiguous,
      })
    );

  const [pwBatch, setPwBatch] = useState<
    { password: string; entropyBits: number; strengthLabel: string }[]
  >(() => buildPasswordBatch(pwConfig));

  const updatePwConfig = (patch: Partial<typeof pwConfig>) => {
    const next = { ...pwConfig, ...patch };
    setPwConfig(next);
    setPwBatch(buildPasswordBatch(next));
  };

  const regeneratePasswords = () => {
    setPwBatch(buildPasswordBatch(pwConfig));
  };

  // ======================== 4 & 5. WORD COUNTER & TEXT FORMATTER ========================
  const [textInput, setTextInput] = useState(
    'أَهْلاً بِكُمْ في مَنَصَّةِ مِنْجَز لِلأَدَواتِ الرَّقَمِيَّةِ.\n\nاكتب النص أو الصقه هنا للحصول على تحليل فوري للكلمات والحروف ووقت القراءة.'
  );
  const textStats = useMemo(() => analyzeText(textInput), [textInput]);
  const [cleanOpts, setCleanOpts] = useState<TextCleanOptions>({
    trimLines: true,
    collapseSpaces: true,
    removeEmptyLines: false,
    removeTashkeel: false,
    normalizeAlef: false,
    deduplicateLines: false,
    sortLines: 'none',
  });

  // ======================== 6. UNIT CONVERTER ========================
  const [unitCat, setUnitCat] = useState<UnitCategory>('length');
  const activeUnitCategory = UNIT_CATEGORIES.find((c) => c.id === unitCat) ?? UNIT_CATEGORIES[0];
  const [fromUnit, setFromUnit] = useState('km');
  const [toUnit, setToUnit] = useState('m');
  const [unitValue, setUnitValue] = useState('1');

  const convertedVal = useMemo(() => {
    const num = parseFloat(unitValue);
    if (Number.isNaN(num)) return 0;
    return convertUnit(num, fromUnit, toUnit, unitCat);
  }, [unitValue, fromUnit, toUnit, unitCat]);

  // ======================== 7. COLOR TOOLS ========================
  const [pickedHex, setPickedHex] = useState('#1D4ED8');
  const [bgContrastHex, setBgContrastHex] = useState('#FFFFFF');
  const colorBreakdown = useMemo(() => {
    const rgb = hexToRgb(pickedHex) ?? { r: 29, g: 78, b: 216 };
    const hsl = rgbToHsl(rgb);
    const cmyk = rgbToCmyk(rgb);
    const ratio = getContrastRatio(pickedHex, bgContrastHex);
    return { rgb, hsl, cmyk, ratio };
  }, [pickedHex, bgContrastHex]);

  // ======================== 8. JSON FORMATTER ========================
  const [jsonInput, setJsonInput] = useState('{"platform":"مِنْجَز","tools":33,"privacy":"local"}');
  const [jsonMode, setJsonMode] = useState<'format' | 'minify' | 'sort'>('format');
  const jsonResult = useMemo(() => processJsonText(jsonInput, jsonMode), [jsonInput, jsonMode]);

  // ======================== RENDER BY SLUG ========================
  if (slug === 'qr-generator') {
    return (
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'url', label: 'رابط أو نص' },
              { id: 'wifi', label: 'شبكة Wi-Fi' },
              { id: 'whatsapp', label: 'رابط واتساب' },
              { id: 'email', label: 'بريد إلكتروني' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setQrMode(tab.id as 'url' | 'wifi' | 'whatsapp' | 'email')}
                className={`rounded-lg px-3.5 py-2 text-xs font-semibold ${
                  qrMode === tab.id
                    ? 'bg-blue-700 text-white'
                    : 'border border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {qrMode === 'url' && (
            <label className="block text-sm font-medium text-slate-800">
              الرابط أو النص
              <textarea
                value={qrText}
                onChange={(e) => setQrText(e.target.value)}
                rows={3}
                placeholder="https://example.com"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          )}

          {qrMode === 'email' && (
            <label className="block text-sm font-medium text-slate-800">
              عنوان البريد الإلكتروني
              <input
                type="email"
                value={qrText}
                onChange={(e) => setQrText(e.target.value)}
                placeholder="name@domain.com"
                dir="ltr"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          )}

          {qrMode === 'wifi' && (
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-xs font-semibold text-slate-700">
                اسم الشبكة (SSID)
                <input
                  type="text"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                كلمة المرور
                <input
                  type="text"
                  value={wifiPass}
                  onChange={(e) => setWifiPass(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                التشفير
                <select
                  value={wifiSec}
                  onChange={(e) => setWifiSec(e.target.value as 'WPA' | 'WEP' | 'nopass')}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="WPA">WPA / WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">بدون كلمة مرور</option>
                </select>
              </label>
            </div>
          )}

          {qrMode === 'whatsapp' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                رقم الهاتف مع رمز الدولة (بدون +)
                <input
                  type="text"
                  value={waPhone}
                  onChange={(e) => setWaPhone(e.target.value)}
                  dir="ltr"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                الرسالة الافتراضية
                <input
                  type="text"
                  value={waMsg}
                  onChange={(e) => setWaMsg(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
            </div>
          )}

          <div className="grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3">
            <label className="text-xs font-semibold text-slate-700">
              لون الرمز
              <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                <input
                  type="color"
                  value={qrFg}
                  onChange={(e) => setQrFg(e.target.value)}
                  className="h-7 w-9 shrink-0 cursor-pointer rounded border border-slate-300 bg-white p-0.5"
                />
                <span dir="ltr" className="font-mono text-xs font-medium text-slate-700">
                  {qrFg.toUpperCase()}
                </span>
              </div>
            </label>
            <label className="text-xs font-semibold text-slate-700">
              لون الخلفية
              <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                <input
                  type="color"
                  value={qrBg}
                  onChange={(e) => setQrBg(e.target.value)}
                  className="h-7 w-9 shrink-0 cursor-pointer rounded border border-slate-300 bg-white p-0.5"
                />
                <span dir="ltr" className="font-mono text-xs font-medium text-slate-700">
                  {qrBg.toUpperCase()}
                </span>
              </div>
            </label>
            <label className="text-xs font-semibold text-slate-700">
              الدقة ({qrSize}px)
              <input
                type="range"
                min={180}
                max={720}
                step={20}
                value={qrSize}
                onChange={(e) => setQrSize(Number(e.target.value))}
                className="mt-4 block w-full accent-blue-700"
              />
            </label>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-6">
          {qrPngUrl && (
            <img
              src={qrPngUrl}
              alt="رمز الاستجابة السريعة QR"
              data-testid="qr-preview-image"
              className="h-56 w-56 rounded-lg border border-slate-100 object-contain"
            />
          )}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <a
              href={qrPngUrl || '#'}
              download="qr-monjez.png"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-800"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>تنزيل PNG</span>
            </a>
            <button
              type="button"
              onClick={() =>
                downloadBlob(new Blob([qrSvgStr], { type: 'image/svg+xml' }), 'qr-monjez.svg')
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>تنزيل SVG</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (slug === 'barcode-generator') {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <label className="block text-sm font-medium text-slate-800">
            القيمة المراد ترميزها
            <input
              type="text"
              value={bcValue}
              onChange={(e) => setBcValue(e.target.value)}
              dir="ltr"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-700">
              معيار الباركود
              <select
                value={bcFormat}
                onChange={(e) => {
                  const fmt = e.target.value as 'CODE128' | 'EAN13' | 'CODE39' | 'UPC';
                  setBcFormat(fmt);
                  if (fmt === 'EAN13' && !/^\d{12,13}$/.test(bcValue)) setBcValue('6281000000018');
                  if (fmt === 'UPC' && !/^\d{11,12}$/.test(bcValue)) setBcValue('123456789012');
                }}
                className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="CODE128">CODE128 (حروف وأرقام)</option>
                <option value="EAN13">EAN-13 (13 رقماً للمنتجات)</option>
                <option value="UPC">UPC (12 رقماً)</option>
                <option value="CODE39">CODE39</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-700">
              سمك الخط ({bcWidth})
              <input
                type="range"
                min={1}
                max={4}
                step={0.5}
                value={bcWidth}
                onChange={(e) => setBcWidth(Number(e.target.value))}
                className="mt-3 block w-full accent-blue-700"
              />
            </label>
            <label className="text-xs font-semibold text-slate-700">
              الارتفاع ({bcHeight}px)
              <input
                type="range"
                min={40}
                max={160}
                value={bcHeight}
                onChange={(e) => setBcHeight(Number(e.target.value))}
                className="mt-3 block w-full accent-blue-700"
              />
            </label>
            <label className="inline-flex items-center gap-2 self-end pb-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={bcShowText}
                onChange={(e) => setBcShowText(e.target.checked)}
                className="h-4 w-4 accent-blue-700"
              />
              <span>إظهار النص أسفل الباركود</span>
            </label>
          </div>
          {bcError && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              {bcError}
            </p>
          )}
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-6">
          <svg ref={barcodeSvgRef} className="max-w-full" />
          {!bcError && (
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={downloadBarcodePng}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>تنزيل PNG</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!barcodeSvgRef.current) return;
                  const svgStr = new XMLSerializer().serializeToString(barcodeSvgRef.current);
                  downloadBlob(new Blob([svgStr], { type: 'image/svg+xml' }), `barcode-${bcFormat}.svg`);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>تنزيل SVG</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (slug === 'password-generator') {
    const primary = pwBatch[0];
    return (
      <div className="space-y-6">
        {primary && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500">
                  القوة: <span className="font-bold text-slate-900">{primary.strengthLabel}</span> ·{' '}
                  <span className="font-mono tabular-nums">{primary.entropyBits} بت</span>
                </p>
                <p
                  data-testid="generated-password"
                  dir="ltr"
                  className="mt-2 break-all font-mono text-xl sm:text-2xl font-bold text-slate-950 select-all"
                >
                  {primary.password}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={regeneratePasswords}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  <span>توليد جديد</span>
                </button>
                <button
                  type="button"
                  onClick={() => copyFeedback('pw-main', primary.password)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-800"
                >
                  {copiedId === 'pw-main' ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span>{copiedId === 'pw-main' ? 'تم النسخ' : 'نسخ'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-medium text-slate-800">
            طول كلمة المرور ({pwConfig.length} حرف)
            <input
              type="range"
              min={8}
              max={64}
              value={pwConfig.length}
              onChange={(e) => updatePwConfig({ length: Number(e.target.value) })}
              className="mt-2 block w-full accent-blue-700"
            />
          </label>
          <label className="text-sm font-medium text-slate-800">
            عدد الكلمات المولدة ({pwConfig.count})
            <input
              type="range"
              min={1}
              max={12}
              value={pwConfig.count}
              onChange={(e) => updatePwConfig({ count: Number(e.target.value) })}
              className="mt-2 block w-full accent-blue-700"
            />
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-800">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={pwConfig.uppercase}
                onChange={(e) => updatePwConfig({ uppercase: e.target.checked })}
                className="h-4 w-4 accent-blue-700"
              />
              <span>أحرف كبيرة (A-Z)</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={pwConfig.lowercase}
                onChange={(e) => updatePwConfig({ lowercase: e.target.checked })}
                className="h-4 w-4 accent-blue-700"
              />
              <span>أحرف صغيرة (a-z)</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={pwConfig.numbers}
                onChange={(e) => updatePwConfig({ numbers: e.target.checked })}
                className="h-4 w-4 accent-blue-700"
              />
              <span>أرقام (0-9)</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={pwConfig.symbols}
                onChange={(e) => updatePwConfig({ symbols: e.target.checked })}
                className="h-4 w-4 accent-blue-700"
              />
              <span>رموز (!@#$)</span>
            </label>
            <label className="col-span-2 inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={pwConfig.excludeAmbiguous}
                onChange={(e) => updatePwConfig({ excludeAmbiguous: e.target.checked })}
                className="h-4 w-4 accent-blue-700"
              />
              <span>استبعاد الأحرف المتشابهة (0, O, I, l)</span>
            </label>
          </div>
        </div>

        {pwBatch.length > 1 && (
          <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {pwBatch.map((item, idx) => (
              <li key={idx} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <span dir="ltr" className="truncate font-mono text-sm text-slate-900">
                  {item.password}
                </span>
                <button
                  type="button"
                  onClick={() => copyFeedback(`pw-${idx}`, item.password)}
                  className="text-xs font-semibold text-blue-700 hover:underline shrink-0"
                >
                  {copiedId === `pw-${idx}` ? 'نُسخ' : 'نسخ'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  if (slug === 'word-counter') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: 'الكلمات', val: textStats.words, testId: 'stat-words' },
            { label: 'الحروف (مع المسافات)', val: textStats.charsWithSpaces, testId: 'stat-chars' },
            { label: 'الحروف (بدون مسافات)', val: textStats.charsWithoutSpaces },
            { label: 'الجمل', val: textStats.sentences },
            { label: 'الفقرات', val: textStats.paragraphs },
            { label: 'وقت القراءة (دقيقة)', val: textStats.readingMinutes },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">{s.label}</p>
              <p
                data-testid={s.testId}
                className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-950"
              >
                {s.val}
              </p>
            </div>
          ))}
        </div>

        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          rows={10}
          aria-label="محرر النص لحساب الكلمات"
          placeholder="اكتب أو الصق النص هنا..."
          className="w-full rounded-xl border border-slate-300 bg-white p-4 text-sm leading-relaxed text-slate-900 focus:border-blue-600 focus:outline-none"
        />

        {textStats.topWords.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-bold text-slate-900">أكثر الكلمات تكراراً</h3>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {textStats.topWords.map((w) => (
                <div key={w.word} className="flex items-center gap-2">
                  <span className="font-medium text-slate-800">{w.word}</span>
                  <span className="font-mono text-xs tabular-nums text-slate-500">({w.count})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (slug === 'text-formatter') {
    const formatted = formatAndCleanText(textInput, cleanOpts);
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs font-medium text-slate-800">
          {[
            { key: 'trimLines', label: 'إزالة الفراغات من بداية ونهاية السطر' },
            { key: 'collapseSpaces', label: 'دمج المسافات المتكررة' },
            { key: 'removeEmptyLines', label: 'حذف الأسطر الفارغة' },
            { key: 'removeTashkeel', label: 'إزالة التشكيل العربي' },
            { key: 'normalizeAlef', label: 'توحيد الهمزات (أ إ آ ← ا)' },
            { key: 'deduplicateLines', label: 'حذف الأسطر المكررة' },
          ].map((opt) => (
            <label key={opt.key} className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(cleanOpts[opt.key as keyof TextCleanOptions])}
                onChange={(e) =>
                  setCleanOpts((prev) => ({ ...prev, [opt.key]: e.target.checked }))
                }
                className="h-4 w-4 accent-blue-700"
              />
              <span>{opt.label}</span>
            </label>
          ))}
          <select
            value={cleanOpts.sortLines}
            onChange={(e) =>
              setCleanOpts((p) => ({ ...p, sortLines: e.target.value as 'none' | 'asc' | 'desc' }))
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
          >
            <option value="none">الترتيب الأصلي</option>
            <option value="asc">فرز أبجدي (أ - ي)</option>
            <option value="desc">فرز عكسي (ي - أ)</option>
          </select>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows={12}
            aria-label="النص الأصلي"
            className="w-full rounded-xl border border-slate-300 bg-white p-4 text-sm leading-relaxed text-slate-900"
          />
          <div className="space-y-2">
            <textarea
              readOnly
              value={formatted}
              rows={12}
              aria-label="النص المنسق"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-900"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => copyFeedback('fmt-txt', formatted)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
              >
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{copiedId === 'fmt-txt' ? 'تم النسخ' : 'نسخ النص المنقح'}</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadBlob(
                    new Blob([formatted], { type: 'text/plain;charset=utf-8' }),
                    'formatted-text.txt'
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span>تنزيل TXT</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (slug === 'unit-converter') {
    const numVal = parseFloat(unitValue);
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {UNIT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setUnitCat(cat.id);
                setFromUnit(cat.units[0].id);
                setToUnit(cat.units[1]?.id ?? cat.units[0].id);
              }}
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                unitCat === cat.id
                  ? 'bg-blue-700 text-white'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-3">
          <label className="text-xs font-semibold text-slate-700">
            القيمة
            <input
              type="number"
              value={unitValue}
              onChange={(e) => setUnitValue(e.target.value)}
              dir="ltr"
              className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base font-mono tabular-nums"
            />
          </label>
          <label className="text-xs font-semibold text-slate-700">
            من وحدة
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
            >
              {activeUnitCategory.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-700">
            إلى وحدة
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
            >
              {activeUnitCategory.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-5">
          <p className="text-xs text-blue-800">النتيجة المحولة</p>
          <p dir="ltr" className="mt-1 font-mono text-3xl font-bold tabular-nums text-blue-950">
            {Number.isNaN(numVal) ? '0' : Number(convertedVal.toPrecision(8))}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {activeUnitCategory.units.map((u) => {
            const val = Number.isNaN(numVal) ? 0 : convertUnit(numVal, fromUnit, u.id, unitCat);
            return (
              <div key={u.id} className="rounded-xl border border-slate-200 bg-white p-3.5">
                <p className="text-xs text-slate-500">{u.label}</p>
                <p dir="ltr" className="mt-1 font-mono text-base font-bold tabular-nums text-slate-900">
                  {Number(val.toPrecision(7))}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (slug === 'color-tools') {
    const { rgb, hsl, cmyk, ratio } = colorBreakdown;
    const formats = [
      { label: 'HEX', val: pickedHex.toUpperCase() },
      { label: 'RGB', val: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
      { label: 'HSL', val: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
      { label: 'CMYK', val: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` },
    ];
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={pickedHex}
              onChange={(e) => setPickedHex(e.target.value)}
              aria-label="اختيار اللون"
              className="h-16 w-20 cursor-pointer rounded-lg border border-slate-300 p-1"
            />
            <label className="flex-1 text-xs font-semibold text-slate-700">
              كود HEX
              <input
                type="text"
                value={pickedHex}
                onChange={(e) => setPickedHex(e.target.value)}
                dir="ltr"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
              />
            </label>
          </div>
          <div className="space-y-2">
            {formats.map((f) => (
              <div
                key={f.label}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5"
              >
                <span className="text-xs font-bold text-slate-600">{f.label}</span>
                <div className="flex items-center gap-2">
                  <span dir="ltr" className="font-mono text-xs text-slate-900">
                    {f.val}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyFeedback(f.label, f.val)}
                    className="text-xs font-semibold text-blue-700 hover:underline"
                  >
                    {copiedId === f.label ? 'نُسخ' : 'نسخ'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-bold text-slate-900">فحص تباين القراءة (WCAG)</h3>
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-700">
              لون الخلفية للمقارنة
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  value={bgContrastHex}
                  onChange={(e) => setBgContrastHex(e.target.value)}
                  className="h-9 w-12 rounded border border-slate-300 p-0.5"
                />
                <span dir="ltr" className="font-mono text-xs">
                  {bgContrastHex}
                </span>
              </div>
            </label>
          </div>
          <div
            className="rounded-xl border border-slate-200 p-6 text-center"
            style={{ backgroundColor: bgContrastHex, color: pickedHex }}
          >
            <p className="text-xl font-bold">نموذج نص عربي لاختبار وضوح القراءة</p>
            <p className="mt-1 text-sm">Sample readable body text at standard size</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 p-3 text-sm">
            <span>
              نسبة التباين:{' '}
              <strong className="font-mono tabular-nums">{ratio}:1</strong>
            </span>
            <span
              className={`font-semibold ${
                ratio >= 4.5 ? 'text-emerald-700' : ratio >= 3 ? 'text-amber-700' : 'text-red-700'
              }`}
            >
              {ratio >= 7
                ? 'ممتاز (AAA)'
                : ratio >= 4.5
                  ? 'مقبول للنصوص العادية (AA)'
                  : ratio >= 3
                    ? 'مقبول للعناوين الكبيرة فقط'
                    : 'تباين ضعيف — غير مناسب للقراءة'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // JSON Formatter
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'format', label: 'تنسيق وترتيب (Pretty)' },
          { id: 'sort', label: 'ترتيب المفاتيح أبجدياً' },
          { id: 'minify', label: 'ضغط السطر (Minify)' },
        ].map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setJsonMode(m.id as 'format' | 'minify' | 'sort')}
            className={`rounded-lg px-4 py-2 text-xs font-semibold ${
              jsonMode === m.id
                ? 'bg-blue-700 text-white'
                : 'border border-slate-200 bg-white text-slate-700'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <textarea
          dir="ltr"
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          rows={14}
          aria-label="إدخال JSON"
          className="w-full rounded-xl border border-slate-300 bg-white p-4 font-mono text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
        />

        <div className="space-y-2">
          {!jsonResult.valid ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"
            >
              {jsonResult.error}
            </div>
          ) : (
            <>
              <textarea
                dir="ltr"
                readOnly
                value={jsonResult.output}
                rows={14}
                aria-label="مخرجات JSON المنسقة"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-slate-900"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => copyFeedback('json-out', jsonResult.output)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
                >
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{copiedId === 'json-out' ? 'تم النسخ' : 'نسخ JSON'}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    downloadBlob(
                      new Blob([jsonResult.output], { type: 'application/json' }),
                      'formatted.json'
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>تنزيل .json</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
