import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
]);

const MAX_BASE64_LENGTH = 12 * 1024 * 1024; // ~9 MB raw image

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return NextResponse.json(
        {
          error:
            'خدمة التعرف الضوئي على النصوص (OCR) غير مفعّلة حالياً لأن مفتاح الخدمة غير مهيأ على الخادم.',
        },
        { status: 503 }
      );
    }

    const body = (await req.json()) as {
      imageBase64?: string;
      mimeType?: string;
      languageHint?: 'auto' | 'ar' | 'en';
      preserveLayout?: boolean;
    };

    const { imageBase64, mimeType = 'image/png', languageHint = 'auto', preserveLayout = true } = body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json({ error: 'لم يتم إرسال صورة صالحة للمعالجة.' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(mimeType.toLowerCase())) {
      return NextResponse.json(
        { error: 'نوع الصورة غير مدعوم. يُرجى استخدام PNG أو JPG أو WebP.' },
        { status: 400 }
      );
    }

    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '').trim();
    if (cleanBase64.length > MAX_BASE64_LENGTH) {
      return NextResponse.json(
        { error: 'حجم الصورة كبير جداً لعملية التعرف الضوئي. يُرجى تقليص الحجم أو الدقة.' },
        { status: 413 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const langInstruction =
      languageHint === 'ar'
        ? 'Focus on Arabic script accurately (including numbers and punctuation).'
        : languageHint === 'en'
          ? 'Focus on English/Latin text accurately.'
          : 'Detect Arabic, English, or mixed text automatically and preserve original script.';

    const layoutInstruction = preserveLayout
      ? 'Preserve paragraphs, line breaks, lists, and Markdown tables when structured tables are visible.'
      : 'Extract clean continuous paragraphs without unnecessary line breaks.';

    const prompt = `Extract all visible text from this image verbatim without translating, summarizing, or adding commentary. ${langInstruction} ${layoutInstruction} If no text is visible, respond with exactly: [NO_TEXT_FOUND]`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType === 'image/jpg' ? 'image/jpeg' : mimeType,
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const extractedText = (response.text ?? '').trim();
    if (!extractedText || extractedText === '[NO_TEXT_FOUND]') {
      return NextResponse.json({
        text: '',
        empty: true,
        message: 'لم يتم العثور على نص مقروء داخل هذه الصورة.',
      });
    }

    return NextResponse.json({
      text: extractedText,
      empty: false,
    });
  } catch (err) {
    console.error('OCR route error:', err);
    return NextResponse.json(
      {
        error: 'تعذّر إتمام التعرف الضوئي على النصوص حالياً. تأكد من سلامة الصورة أو حاول مرة أخرى.',
      },
      { status: 500 }
    );
  }
}
