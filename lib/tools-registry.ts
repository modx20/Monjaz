export type ToolCategoryId = 'pdf' | 'images' | 'files' | 'productivity';

export type ProcessingMode = 'local' | 'server';

export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolDefinition {
  slug: string;
  title: string;
  shortDesc: string;
  longDesc: string;
  category: ToolCategoryId;
  categoryLabel: string;
  iconName: string;
  processingMode: ProcessingMode;
  popular?: boolean;
  batchSupported?: boolean;
  acceptedFormats?: string[];
  keywords: string[];
  howToSteps: string[];
  faqs: ToolFaq[];
  relatedSlugs: string[];
}

export interface ToolCategoryMeta {
  id: ToolCategoryId;
  label: string;
  shortLabel: string;
  description: string;
  anchorId: string;
}

export const TOOL_CATEGORIES: ToolCategoryMeta[] = [
  {
    id: 'pdf',
    label: 'أدوات ملفات PDF',
    shortLabel: 'أدوات PDF',
    description: 'دمج وتقسيم وضغط وتحويل وحماية ومعاينة ملفات PDF بدقة عالية وخصوصية تامة.',
    anchorId: 'pdf-tools',
  },
  {
    id: 'images',
    label: 'أدوات الصور والتصميم',
    shortLabel: 'أدوات الصور',
    description: 'ضغط الصور وتغيير أبعادها وقصها وتحويل صيغها وإزالة الخلفية واستخراج الألوان.',
    anchorId: 'image-tools',
  },
  {
    id: 'files',
    label: 'أدوات الملفات والمستندات',
    shortLabel: 'الملفات والمستندات',
    description: 'ضغط وفك ضغط ZIP وإعادة التسمية الجماعية وفحص الملفات ومعالجة CSV وJSON.',
    anchorId: 'file-tools',
  },
  {
    id: 'productivity',
    label: 'أدوات الإنتاجية والمحتوى',
    shortLabel: 'الإنتاجية والمحتوى',
    description: 'رموز QR والباركود وكلمات المرور القوية وتنسيق النصوص العربية وتحويل الوحدات.',
    anchorId: 'productivity-tools',
  },
];

export const TOOLS_REGISTRY: ToolDefinition[] = [
  // ======================== PDF TOOLS ========================
  {
    slug: 'merge-pdf',
    title: 'دمج ملفات PDF',
    shortDesc: 'اجمع عدة ملفات PDF في مستند واحد مرتب بالترتيب الذي تريده.',
    longDesc:
      'أداة مجانية وسريعة لدمج عدة ملفات PDF في ملف واحد دون فقدان الجودة أو التنسيق. يمكنك سحب الملفات وإعادة ترتيبها ومعاينة عدد صفحات كل ملف قبل الدمج مباشرة داخل متصفحك.',
    category: 'pdf',
    categoryLabel: 'أدوات PDF',
    iconName: 'Layers',
    processingMode: 'local',
    popular: true,
    batchSupported: true,
    acceptedFormats: ['.pdf'],
    keywords: ['دمج', 'جمع', 'توحيد', 'pdf', 'merge', 'combine'],
    howToSteps: [
      'اختر ملفين أو أكثر بصيغة PDF من جهازك أو اسحبها إلى منطقة الرفع.',
      'رتّب الملفات باستخدام أزرار التحريك للأعلى والأسفل حسب التسلسل المطلوب.',
      'اضغط على «دمج الملفات الآن» ثم نزّل المستند الموحد فوراً.',
    ],
    faqs: [
      {
        question: 'هل يتم رفع ملفات PDF إلى خادم خارجي؟',
        answer: 'لا، تتم عملية الدمج بالكامل داخل متصفحك لحماية خصوصية مستنداتك.',
      },
      {
        question: 'كم عدد الملفات التي يمكن دمجها دفعة واحدة؟',
        answer: 'يمكنك دمج حتى 30 ملف PDF دفعة واحدة بحد إجمالي مريح لمتصفحك يصل إلى 150 ميجابايت.',
      },
    ],
    relatedSlugs: ['split-pdf', 'reorder-pdf-pages', 'compress-pdf'],
  },
  {
    slug: 'split-pdf',
    title: 'تقسيم ملفات PDF',
    shortDesc: 'قسّم مستند PDF إلى ملفات منفصلة حسب النطاقات أو كل صفحة على حدة.',
    longDesc:
      'افصل صفحات أي ملف PDF إلى مستندات مستقلة بمرونة كاملة، سواء بتحديد نطاقات صفحات مخصصة أو تقسيم كل صفحة في ملف منفرد وتحميلها مجمعة في ملف ZIP.',
    category: 'pdf',
    categoryLabel: 'أدوات PDF',
    iconName: 'Scissors',
    processingMode: 'local',
    popular: true,
    acceptedFormats: ['.pdf'],
    keywords: ['تقسيم', 'فصل', 'تجزئة', 'pdf', 'split'],
    howToSteps: [
      'ارفع ملف PDF لمعاينة صفحاته ومعرفة العدد الإجمالي للصفحات.',
      'اختر وضع التقسيم: كل صفحة في ملف مستقل أو تحديد نطاقات مثل 1-3, 4-8.',
      'اضغط على «تنفيذ التقسيم» ونزّل الملفات الناتجة أو الأرشيف المضغوط.',
    ],
    faqs: [
      {
        question: 'كيف أكتب نطاقات الصفحات؟',
        answer: 'يمكنك كتابة أرقام ونطاقات مفصولة بفاصلة مثل: 1-3, 5, 7-10.',
      },
    ],
    relatedSlugs: ['extract-pdf-pages', 'delete-pdf-pages', 'merge-pdf'],
  },
  {
    slug: 'compress-pdf',
    title: 'ضغط وتقليل حجم PDF',
    shortDesc: 'قلّل مساحة ملف PDF لتسهيل إرساله عبر البريد والمنصات الإلكترونية.',
    longDesc:
      'أداة ذكية لتقليل حجم ملفات PDF مع خيارات متعددة لمستوى الضغط: ضغط هيكلي يحافظ على النصوص كما هي، أو ضغط متوسط وقوي يقلل حجم الصفحات المصورة والرسوميات بشكل ملحوظ.',
    category: 'pdf',
    categoryLabel: 'أدوات PDF',
    iconName: 'Minimize2',
    processingMode: 'local',
    popular: true,
    acceptedFormats: ['.pdf'],
    keywords: ['ضغط', 'تصغير', 'تقليل حجم', 'pdf', 'compress', 'reduce'],
    howToSteps: [
      'ارفع ملف PDF الذي ترغب في تقليل حجمه.',
      'اختر مستوى الضغط المناسب (تحسين هيكلي، متوازن، أو أقصى توفير).',
      'ابدأ الضغط وقارن الحجم قبل وبعد المعالجة ثم نزّل الملف المضغوط.',
    ],
    faqs: [
      {
        question: 'ما الفرق بين الضغط الهيكلي والضغط المتوازن؟',
        answer:
          'الضغط الهيكلي يحافظ على النصوص قابلة للتحديد مع تنظيف البيانات الزائدة، بينما الضغط المتوازن والقوي يعيدان ضغط الصور والصفحات لتحقيق نسبة تقليص أكبر.',
      },
    ],
    relatedSlugs: ['merge-pdf', 'pdf-to-images', 'compress-image'],
  },
  {
    slug: 'pdf-to-images',
    title: 'تحويل PDF إلى صور JPG وPNG',
    shortDesc: 'حوّل صفحات مستند PDF إلى صور عالية الدقة بصيغتي JPG أو PNG.',
    longDesc:
      'استخرج كل صفحة من ملف PDF كصورة مستقلة بدقة قابلة للتخصيص. مثالي لمشاركة شرائح العروض أو الصفحات عبر الجوال وتطبيقات التواصل، مع إمكانية تنزيل كل صورة أو تحميل الجميع في ملف ZIP.',
    category: 'pdf',
    categoryLabel: 'أدوات PDF',
    iconName: 'Image',
    processingMode: 'local',
    popular: true,
    acceptedFormats: ['.pdf'],
    keywords: ['تحويل', 'pdf الى صور', 'jpg', 'png', 'تصدير صور'],
    howToSteps: [
      'ارفع ملف PDF لمعاينة صفحاته.',
      'اختر صيغة الصور (JPG أو PNG) ومقياس الدقة المطلوب.',
      'حوّل الصفحات ونزّل الصور بشكل فردي أو داخل ملف ZIP واحد.',
    ],
    faqs: [
      {
        question: 'أي صيغة أفضل للنصوص والرسوم البيانية؟',
        answer: 'صيغة PNG تحافظ على حدة النصوص والجداول، بينما JPG مناسبة للمستندات المصورة وحجم ملف أصغر.',
      },
    ],
    relatedSlugs: ['images-to-pdf', 'compress-image', 'ocr-tool'],
  },
  {
    slug: 'images-to-pdf',
    title: 'تحويل الصور إلى PDF',
    shortDesc: 'حوّل مجموعة صور JPG وPNG وWebP إلى مستند PDF منسق بضغطة زر.',
    longDesc:
      'ادمج صورك ومستنداتك المصورة في ملف PDF احترافي واحد، مع التحكم في ترتيب الصور ومقاس الصفحة (A4 أو Letter أو مطابق للصورة) والهوامش والاتجاه.',
    category: 'pdf',
    categoryLabel: 'أدوات PDF',
    iconName: 'FileImage',
    processingMode: 'local',
    popular: true,
    batchSupported: true,
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    keywords: ['صور الى pdf', 'تحويل صور', 'jpg to pdf', 'png to pdf'],
    howToSteps: [
      'اختر صورة واحدة أو عدة صور ورتّب تسلسلها.',
      'حدد مقاس الصفحة والاتجاه وحجم الهوامش.',
      'اضغط على «إنشاء ملف PDF» ونزّل المستند الجاهز.',
    ],
    faqs: [
      {
        question: 'هل تدعم الأداة الصور بصيغة WebP؟',
        answer: 'نعم، تدعم الأداة صيغ JPG وPNG وWebP وتحولها تلقائياً داخل ملف PDF.',
      },
    ],
    relatedSlugs: ['merge-pdf', 'pdf-to-images', 'compress-pdf'],
  },
  {
    slug: 'word-to-pdf',
    title: 'تحويل Word إلى PDF',
    shortDesc: 'حوّل مستندات Word بصيغة DOCX إلى ملفات PDF جاهزة للطباعة والمشاركة.',
    longDesc:
      'حوّل ملفات Microsoft Word (.docx) إلى ملفات PDF عالية الوضوح مع دعم كامل للغة العربية واتجاه RTL والجداول والعناوين والصور المضمنة مباشرة داخل متصفحك.',
    category: 'pdf',
    categoryLabel: 'أدوات PDF',
    iconName: 'FileText',
    processingMode: 'local',
    popular: true,
    acceptedFormats: ['.docx'],
    keywords: ['word to pdf', 'وورد الى pdf', 'تحويل مستند', 'docx'],
    howToSteps: [
      'اختر ملف Word بصيغة .docx من جهازك.',
      'عاين المحتوى المنسق وتأكد من اتجاه النص (عربي RTL أو إنجليزي LTR).',
      'اضغط على «تصدير كملف PDF» لتنزيل النسخة النهائية.',
    ],
    faqs: [
      {
        question: 'ما الصيغ المدعومة من مستندات Word؟',
        answer: 'تدعم الأداة ملفات DOCX الحديثة وتعرضها مع التنسيقات الأساسية والصور والجداول.',
      },
    ],
    relatedSlugs: ['excel-to-pdf', 'powerpoint-to-pdf', 'pdf-viewer'],
  },
  {
    slug: 'excel-to-pdf',
    title: 'تحويل Excel إلى PDF',
    shortDesc: 'حوّل جداول Excel وCSV إلى صفحات PDF منظمة وواضحة.',
    longDesc:
      'استورد جداول البيانات (.xlsx و.xls و.csv) واستعرض أوراق العمل، ثم صدّرها إلى ملف PDF منظم بوضع أفقي أو عمودي مناسب لطباعة التقارير والجداول المالية.',
    category: 'pdf',
    categoryLabel: 'أدوات PDF',
    iconName: 'Table',
    processingMode: 'local',
    acceptedFormats: ['.xlsx', '.xls', '.csv'],
    keywords: ['excel to pdf', 'اكسل الى pdf', 'جداول', 'xlsx', 'csv'],
    howToSteps: [
      'ارفع ملف Excel أو CSV.',
      'اختر ورقة العمل المطلوبة واتجاه الصفحة (أفقي للجداول العريضة أو عمودي).',
      'عاين الجدول ثم صدّره كملف PDF.',
    ],
    faqs: [
      {
        question: 'هل تدعم الأداة الجداول ذات الأعمدة الكثيرة؟',
        answer: 'نعم، يمكنك التبديل إلى الوضع الأفقي (Landscape) لاستيعاب الأعمدة بوضوح.',
      },
    ],
    relatedSlugs: ['word-to-pdf', 'csv-json-converter', 'powerpoint-to-pdf'],
  },
  {
    slug: 'powerpoint-to-pdf',
    title: 'تحويل PowerPoint إلى PDF',
    shortDesc: 'حوّل عروض PowerPoint بصيغة PPTX إلى شرائح PDF قابلة للمشاركة.',
    longDesc:
      'استخرج الشرائح والنصوص والصور من ملفات العروض التقديمية (.pptx) وعاين كل شريحة، ثم حوّل العرض التقديمي بالكامل إلى ملف PDF عالي الوضوح داخل متصفحك.',
    category: 'pdf',
    categoryLabel: 'أدوات PDF',
    iconName: 'Presentation',
    processingMode: 'local',
    acceptedFormats: ['.pptx'],
    keywords: ['powerpoint to pdf', 'بوربوينت الى pdf', 'عروض تقديمية', 'pptx'],
    howToSteps: [
      'ارفع ملف العرض التقديمي بصيغة .pptx.',
      'تصفح معاينة الشرائح المستخرجة تلقائياً.',
      'اضغط على «تحويل إلى PDF» لتنزيل العرض بصيغة PDF.',
    ],
    faqs: [
      {
        question: 'هل تعمل الأداة بدون رفع العرض التقديمي للإنترنت؟',
        answer: 'نعم، يتم فك حزمة PPTX وقراءة الشرائح وتوليد ملف PDF محلياً على جهازك.',
      },
    ],
    relatedSlugs: ['word-to-pdf', 'excel-to-pdf', 'pdf-to-images'],
  },
  {
    slug: 'extract-pdf-pages',
    title: 'استخراج صفحات من PDF',
    shortDesc: 'اختر صفحات محددة من مستند PDF واحفظها في ملف مستقل.',
    longDesc:
      'استعرض مصغرات جميع صفحات ملف PDF وحدد الصفحات التي تحتاجها فقط بالنقر عليها أو بكتابة أرقامها، ثم استخرجها في ملف PDF جديد ونظيف.',
    category: 'pdf',
    categoryLabel: 'أدوات PDF',
    iconName: 'FilePlus2',
    processingMode: 'local',
    acceptedFormats: ['.pdf'],
    keywords: ['استخراج صفحات', 'اختيار صفحات', 'pdf', 'extract'],
    howToSteps: [
      'ارفع ملف PDF لتظهر مصغرات الصفحات.',
      'انقر على الصفحات التي تريد استخراجها أو اكتب أرقامها.',
      'اضغط على «استخراج الصفحات المحددة» ونزّل الملف الجديد.',
    ],
    faqs: [
      {
        question: 'هل يتأثر الملف الأصلي عند استخراج صفحات منه؟',
        answer: 'لا، يتم إنشاء نسخة جديدة تحتوي على الصفحات المختارة فقط دون تعديل ملفك الأصلي.',
      },
    ],
    relatedSlugs: ['delete-pdf-pages', 'split-pdf', 'reorder-pdf-pages'],
  },
  {
    slug: 'delete-pdf-pages',
    title: 'حذف صفحات من PDF',
    shortDesc: 'أزل الصفحات غير المرغوب فيها من ملف PDF بسهولة.',
    longDesc:
      'عاين صفحات المستند بصرياً وحدد الصفحات الفارغة أو غير الضرورية لحذفها، ثم احفظ بقية الصفحات في ملف PDF جديد خلال ثوانٍ.',
    category: 'pdf',
    categoryLabel: 'أدوات PDF',
    iconName: 'Trash2',
    processingMode: 'local',
    acceptedFormats: ['.pdf'],
    keywords: ['حذف صفحات', 'ازالة صفحات', 'pdf', 'delete pages'],
    howToSteps: [
      'ارفع ملف PDF لمعاينة صفحاته.',
      'حدد الصفحات التي ترغب في حذفها.',
      'اضغط على «حذف الصفحات وحفظ الملف» لتنزيل المستند المعدل.',
    ],
    faqs: [
      {
        question: 'هل يمكن التراجع عن تحديد صفحة قبل الحفظ؟',
        answer: 'نعم، يمكنك النقر على الصفحة مرة أخرى لإلغاء تحديدها قبل إنشاء الملف النهائي.',
      },
    ],
    relatedSlugs: ['extract-pdf-pages', 'reorder-pdf-pages', 'split-pdf'],
  },
  {
    slug: 'reorder-pdf-pages',
    title: 'إعادة ترتيب صفحات PDF',
    shortDesc: 'غيّر تسلسل صفحات ملف PDF أو اعكس ترتيبها مع معاينة فورية.',
    longDesc:
      'تنظيم سريع لصفحات ملفات PDF عبر تحريك الصفحات للأمام أو للخلف أو عكس الترتيب بالكامل، مع عرض مصغرات حقيقية لكل صفحة لضمان الدقة.',
    category: 'pdf',
    categoryLabel: 'أدوات PDF',
    iconName: 'ArrowUpDown',
    processingMode: 'local',
    acceptedFormats: ['.pdf'],
    keywords: ['ترتيب صفحات', 'تنظيم pdf', 'عكس الصفحات', 'reorder'],
    howToSteps: [
      'ارفع ملف PDF لتظهر مصغرات الصفحات بالترتيب الحالي.',
      'استخدم أزرار التقديم والتأخير أو زر «عكس الترتيب» لضبط التسلسل.',
      'اضغط على «حفظ الترتيب الجديد» ونزّل المستند.',
    ],
    faqs: [
      {
        question: 'هل تحافظ الأداة على جودة الصفحات بعد إعادة الترتيب؟',
        answer: 'نعم، يتم نسخ الصفحات كما هي دون أي ضغط إضافي أو فقدان في الجودة.',
      },
    ],
    relatedSlugs: ['rotate-pdf', 'merge-pdf', 'delete-pdf-pages'],
  },
  {
    slug: 'rotate-pdf',
    title: 'تدوير صفحات PDF',
    shortDesc: 'عدّل اتجاه صفحات PDF المائلة 90 أو 180 أو 270 درجة بشكل فردي أو جماعي.',
    longDesc:
      'أصلح اتجاه الصفحات الممسوحة ضوئياً بالمقلوب أو بالوضع الأفقي، مع إمكانية تدوير كل صفحة على حدة أو تدوير جميع الصفحات دفعة واحدة ومعاينتها قبل الحفظ.',
    category: 'pdf',
    categoryLabel: 'أدوات PDF',
    iconName: 'RotateCw',
    processingMode: 'local',
    acceptedFormats: ['.pdf'],
    keywords: ['تدوير', 'لف صفحات', 'اتجاه pdf', 'rotate'],
    howToSteps: [
      'ارفع ملف PDF لمعاينة اتجاه كل صفحة.',
      'دوّر صفحات محددة أو اضغط «تدوير الكل» بالزاوية المناسبة.',
      'احفظ الملف ونزّل النسخة المعدلة.',
    ],
    faqs: [
      {
        question: 'هل يمكن تدوير صفحة واحدة فقط دون البقية؟',
        answer: 'نعم، كل صفحة في المعاينة تمتلك أزرار تدوير مستقلة.',
      },
    ],
    relatedSlugs: ['reorder-pdf-pages', 'pdf-viewer', 'watermark-pdf'],
  },
  {
    slug: 'watermark-pdf',
    title: 'إضافة علامة مائية إلى PDF',
    shortDesc: 'ضع نصاً تعريفياً أو علامة حقوق ملكية على صفحات ملف PDF.',
    longDesc:
      'أضف علامة مائية نصية بالعربية أو الإنجليزية على جميع صفحات مستند PDF، مع التحكم الكامل في الشفافية واللون والحجم وزاوية الميل والتموضع، مع ضمان وضوح الخطوط العربية.',
    category: 'pdf',
    categoryLabel: 'أدوات PDF',
    iconName: 'Stamp',
    processingMode: 'local',
    acceptedFormats: ['.pdf'],
    keywords: ['علامة مائية', 'حقوق', 'ختم pdf', 'watermark'],
    howToSteps: [
      'ارفع ملف PDF المطلوب وضع العلامة المائية عليه.',
      'اكتب نص العلامة واضبط اللون والشفافية والحجم والموضع.',
      'طبق العلامة المائية ونزّل المستند المحمي.',
    ],
    faqs: [
      {
        question: 'هل تدعم العلامة المائية النصوص العربية؟',
        answer: 'نعم، يتم رسم النص العربي بدقة عالية وتضمينه بوضوح تام في كل صفحة.',
      },
    ],
    relatedSlugs: ['protect-pdf', 'watermark-image', 'pdf-viewer'],
  },
  {
    slug: 'protect-pdf',
    title: 'حماية PDF بكلمة مرور',
    shortDesc: 'شفّر ملف PDF بكلمة مرور قوية وتحكم في صلاحيات الطباعة والنسخ.',
    longDesc:
      'احمِ مستنداتك السرية بتشفير ملف PDF بكلمة مرور للفتح وكلمة مرور للمالك، مع خيارات تحديد السماح بالطباعة أو نسخ النصوص أو التعديل.',
    category: 'pdf',
    categoryLabel: 'أدوات PDF',
    iconName: 'Lock',
    processingMode: 'local',
    acceptedFormats: ['.pdf'],
    keywords: ['تشفير', 'كلمة مرور', 'حماية pdf', 'قفل', 'protect', 'encrypt'],
    howToSteps: [
      'ارفع ملف PDF الذي تريد حمايته.',
      'أدخل كلمة المرور المطلوبة لفتح الملف وحدد صلاحيات الطباعة والنسخ.',
      'اضغط على «تشفير وتنزيل» لحفظ الملف المحمي.',
    ],
    faqs: [
      {
        question: 'هل يمكنك استعادة كلمة المرور إذا نسيتها؟',
        answer: 'لا، لأن التشفير يتم محلياً داخل متصفحك ولا يتم إرسال كلمة المرور إلى أي خادم.',
      },
    ],
    relatedSlugs: ['watermark-pdf', 'compress-pdf', 'merge-pdf'],
  },
  {
    slug: 'extract-pdf-text',
    title: 'استخراج النصوص من PDF',
    shortDesc: 'استخرج المحتوى النصي من ملفات PDF لنسخه أو حفظه كملف نصي TXT.',
    longDesc:
      'اقرأ واستخرج النصوص المضمنة داخل ملفات PDF صفحة بصفحة، مع إمكانية عرض النص الكامل ونسخه بضغطة زر أو تنزيله كملف TXT. (للمستندات المصورة استخدم أداة OCR).',
    category: 'pdf',
    categoryLabel: 'أدوات PDF',
    iconName: 'FileSearch',
    processingMode: 'local',
    acceptedFormats: ['.pdf'],
    keywords: ['استخراج نص', 'نسخ من pdf', 'pdf to text', 'تحويل نص'],
    howToSteps: [
      'ارفع ملف PDF النصي.',
      'ستظهر النصوص المستخرجة مرتبة حسب أرقام الصفحات.',
      'انسخ النص مباشرة أو نزّله كملف TXT.',
    ],
    faqs: [
      {
        question: 'ماذا لو كان ملف PDF عبارة عن صفحات مصورة (سكانر)؟',
        answer: 'الملفات المصورة لا تحتوي على طبقة نصية؛ استخدم أداة «التعرف على النصوص OCR» لقراءتها.',
      },
    ],
    relatedSlugs: ['ocr-tool', 'pdf-viewer', 'word-counter'],
  },
  {
    slug: 'ocr-tool',
    title: 'التعرف على النصوص داخل الصور وPDF (OCR)',
    shortDesc: 'استخرج النصوص العربية والإنجليزية بدقة عالية من الصور والمستندات المصورة.',
    longDesc:
      'تقنية ذكية للتعرف الضوئي على الحروف (OCR) تدعم اللغة العربية والإنجليزية والمستندات المختلطة والجداول، سواء من صور JPG/PNG/WebP أو من صفحات ملفات PDF المصورة.',
    category: 'pdf',
    categoryLabel: 'أدوات PDF',
    iconName: 'ScanText',
    processingMode: 'server',
    popular: true,
    acceptedFormats: ['.png', '.jpg', '.jpeg', '.webp', '.pdf'],
    keywords: ['ocr', 'استخراج نص من صورة', 'سكانر', 'تحويل صورة لنص', 'تعرف ضوئي'],
    howToSteps: [
      'ارفع صورة أو اختر صفحة محددة من ملف PDF مصور.',
      'راجع إشعار المعالجة الآمنة عبر الخادم ثم اضغط «بدء استخراج النص».',
      'عدّل النص الناتج أو انسخه أو نزّله بصيغة TXT.',
    ],
    faqs: [
      {
        question: 'لماذا تستخدم هذه الأداة الخادم بدلاً من المتصفح فقط؟',
        answer:
          'لضمان دقة استثنائية في قراءة الخطوط العربية المعقدة والتشكيل والجداول من الصور، يتم إرسال الصورة المختارة مؤقتاً عبر اتصال مشفر دون أي تخزين بعد انتهاء القراءة.',
      },
    ],
    relatedSlugs: ['extract-pdf-text', 'pdf-to-images', 'text-formatter'],
  },
  {
    slug: 'pdf-viewer',
    title: 'عرض ومعاينة ملفات PDF',
    shortDesc: 'تصفح ملفات PDF سريعاً مع شريط مصغرات وتكبير وفحص خصائص المستند.',
    longDesc:
      'عارض PDF متكامل وسريع يعمل مباشرة في المتصفح دون الحاجة لتثبيت أي برامج، مع شريط تنقل بين الصفحات وأزرار التكبير والتصغير وعرض بيانات المستند التفصيلية.',
    category: 'pdf',
    categoryLabel: 'أدوات PDF',
    iconName: 'Eye',
    processingMode: 'local',
    acceptedFormats: ['.pdf'],
    keywords: ['عرض pdf', 'قارئ pdf', 'معاينة', 'viewer'],
    howToSteps: [
      'اختر ملف PDF من جهازك أو اسحبه إلى مساحة العرض.',
      'تنقّل بين الصفحات واستخدم أدوات التكبير والتصغير.',
      'اطلع على معلومات المستند وعدد الصفحات والحجم.',
    ],
    faqs: [
      {
        question: 'هل يدعم العارض ملفات PDF الكبيرة؟',
        answer: 'نعم، يتم تصيير الصفحات عند الطلب للحفاظ على سرعة المتصفح وتقليل استهلاك الذاكرة.',
      },
    ],
    relatedSlugs: ['extract-pdf-text', 'split-pdf', 'rotate-pdf'],
  },

  // ======================== IMAGE TOOLS ========================
  {
    slug: 'compress-image',
    title: 'ضغط الصور وتقليل حجمها',
    shortDesc: 'قلّل حجم صور JPG وPNG وWebP بنسبة عالية مع الحفاظ على وضوح التفاصيل.',
    longDesc:
      'أداة معالجة جماعية لضغط الصور محلياً داخل متصفحك. تحكم بدرجة الجودة وأقصى عرض للصورة وشاهد مقارنة الحجم قبل وبعد الضغط مع إمكانية تنزيل كل صورة أو جميعها في ملف ZIP.',
    category: 'images',
    categoryLabel: 'أدوات الصور',
    iconName: 'ImageDown',
    processingMode: 'local',
    popular: true,
    batchSupported: true,
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    keywords: ['ضغط الصور', 'تصغير الصور', 'تقليل حجم الصورة', 'compress image'],
    howToSteps: [
      'اختر صورة واحدة أو عدة صور من جهازك.',
      'حدد نسبة الجودة المطلوبة أو الصيغة الناتجة (WebP يعطي أفضل ضغط).',
      'اضغط «بدء الضغط» ثم عاين النتيجة ونزّل الصور.',
    ],
    faqs: [
      {
        question: 'كيف أحصل على أصغر حجم ممكن للمواقع؟',
        answer: 'اختيار صيغة WebP مع جودة بين 75% و85% يقلل الحجم عادة بنسبة 60% إلى 80% مع وضوح ممتاز.',
      },
    ],
    relatedSlugs: ['resize-image', 'convert-image', 'images-to-pdf'],
  },
  {
    slug: 'resize-image',
    title: 'تغيير أبعاد الصور ومقاسات التواصل الاجتماعي',
    shortDesc: 'غيّر عرض وارتفاع الصور بالبكسل أو النسبة، أو اختر مقاسات منصات التواصل الجاهزة.',
    longDesc:
      'اضبط أبعاد صورك بدقة لتناسب المواقع الإلكترونية ومنصات التواصل الاجتماعي مثل إنستغرام ويوتيوب وX ولينكدإن، مع قفل نسبة العرض إلى الارتفاع ودعم المعالجة الجماعية.',
    category: 'images',
    categoryLabel: 'أدوات الصور',
    iconName: 'Maximize2',
    processingMode: 'local',
    popular: true,
    batchSupported: true,
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    keywords: ['تغيير ابعاد', 'مقاس الصورة', 'انستغرام', 'يوتيوب', 'resize'],
    howToSteps: [
      'ارفع صورة أو مجموعة صور.',
      'أدخل العرض والارتفاع أو اختر أحد القوالب الجاهزة لمنصات التواصل.',
      'طبّق التعديل وعاين الأبعاد الجديدة ثم نزّل الصور.',
    ],
    faqs: [
      {
        question: 'ما المقاسات الجاهزة المتوفرة؟',
        answer: 'تتضمن الأداة مقاسات منشور وستوري إنستغرام، صورة يوتيوب المصغرة، غلاف X، وغلاف لينكدإن.',
      },
    ],
    relatedSlugs: ['crop-image', 'compress-image', 'convert-image'],
  },
  {
    slug: 'crop-image',
    title: 'قص الصور وتحديد الإطار',
    shortDesc: 'قص أجزاء محددة من الصورة بحرية أو بنسب أبعاد قياسية مثل 1:1 و16:9.',
    longDesc:
      'أداة قص تفاعلية تتيح لك تحديد منطقة القص مباشرة فوق الصورة أو اختيار نسب جاهزة (مربع 1:1، شاشة عريضة 16:9، عمودي 9:16، 4:3) مع معاينة فورية للأبعاد بالبكسل.',
    category: 'images',
    categoryLabel: 'أدوات الصور',
    iconName: 'Crop',
    processingMode: 'local',
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    keywords: ['قص الصور', 'اقتصاص', 'crop'],
    howToSteps: [
      'اختر الصورة المراد قصها.',
      'اسحب حدود إطار القص أو اختر نسبة أبعاد ثابتة.',
      'اضغط «تنفيذ القص» وعاين النتيجة ثم نزّل الصورة.',
    ],
    faqs: [
      {
        question: 'هل يفقد القص جودة الصورة الأصلية؟',
        answer: 'لا، يتم القص بدقة البكسل الأصلية للصورة.',
      },
    ],
    relatedSlugs: ['resize-image', 'rotate-flip-image', 'remove-background'],
  },
  {
    slug: 'rotate-flip-image',
    title: 'تدوير وقلب الصور',
    shortDesc: 'دوّر الصور 90 أو 180 درجة أو بزاوية مخصصة، واقلبها أفقياً أو عمودياً.',
    longDesc:
      'أصلح اتجاه الصور المائلة أو اعكسها أفقياً وعمودياً مع دعم معالجة صورة واحدة أو عدة صور دفعة واحدة وتنزيلها مجمعة.',
    category: 'images',
    categoryLabel: 'أدوات الصور',
    iconName: 'RefreshCw',
    processingMode: 'local',
    batchSupported: true,
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    keywords: ['تدوير الصورة', 'قلب الصورة', 'عكس', 'rotate', 'flip'],
    howToSteps: [
      'ارفع صورة أو أكثر.',
      'اختر زاوية التدوير أو اتجاه القلب الأفقي/العمودي.',
      'عاين التغيير ونزّل الصور المعدلة.',
    ],
    faqs: [
      {
        question: 'هل يمكن تدوير عدة صور بنفس الزاوية دفعة واحدة؟',
        answer: 'نعم، تدعم الأداة تطبيق التدوير والقلب على قائمة صور كاملة دفعة واحدة.',
      },
    ],
    relatedSlugs: ['crop-image', 'resize-image', 'rotate-pdf'],
  },
  {
    slug: 'convert-image',
    title: 'تحويل صيغ الصور (JPG / PNG / WebP)',
    shortDesc: 'حوّل الصور بسرعة بين صيغ PNG وJPG وWebP وBMP دفعة واحدة.',
    longDesc:
      'محول صيغ صور فوري يدعم التحويل الجماعي بين الصيغ الشائعة على الويب، مع ضبط مستوى الجودة وتحديد لون الخلفية عند التحويل من PNG شفاف إلى JPG.',
    category: 'images',
    categoryLabel: 'أدوات الصور',
    iconName: 'ArrowLeftRight',
    processingMode: 'local',
    popular: true,
    batchSupported: true,
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif'],
    keywords: ['تحويل صيغ الصور', 'webp الى png', 'png الى jpg', 'convert image'],
    howToSteps: [
      'ارفع الصور المراد تحويل صيغتها.',
      'اختر الصيغة المستهدفة (WebP أو PNG أو JPG) ومستوى الجودة.',
      'اضغط «تحويل الكل» ونزّل الصور فردياً أو كملف ZIP.',
    ],
    faqs: [
      {
        question: 'ما هي أفضل صيغة للويب؟',
        answer: 'صيغة WebP توفر حجماً أصغر بكثير من JPG وPNG مع دعم الشفافية.',
      },
    ],
    relatedSlugs: ['compress-image', 'images-to-pdf', 'remove-background'],
  },
  {
    slug: 'watermark-image',
    title: 'إضافة علامة مائية أو نص على الصور',
    shortDesc: 'احمِ صورك بوضع نص حقوق أو علامة مائية شفافة ومخصصة.',
    longDesc:
      'أضف نصاً عربياً أو إنجليزياً أو شعاراً مخصصاً فوق صورك مع معاينة حية، والتحكم باللون والحجم والشفافية والموضع أو التكرار القطري لحماية أعمالك البصرية.',
    category: 'images',
    categoryLabel: 'أدوات الصور',
    iconName: 'Type',
    processingMode: 'local',
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    keywords: ['علامة مائية للصور', 'كتابة على الصورة', 'حماية الصور', 'watermark'],
    howToSteps: [
      'ارفع الصورة التي تريد إضافة العلامة المائية عليها.',
      'اكتب النص واضبط الموضع والحجم والشفافية وزاوية الميل.',
      'شاهد المعاينة الفورية ثم نزّل الصورة الناتجة.',
    ],
    faqs: [
      {
        question: 'هل تدعم الأداة كتابة نصوص عربية واضحة؟',
        answer: 'نعم، تستخدم الأداة خطوط المنصة العربية لضمان ظهور العلامة المائية بوضوح وتناسق.',
      },
    ],
    relatedSlugs: ['watermark-pdf', 'crop-image', 'compress-image'],
  },
  {
    slug: 'remove-background',
    title: 'إزالة وتفريغ خلفية الصور',
    shortDesc: 'أزل الخلفيات الموحدة أو الملونة وحوّل الصورة إلى PNG بخلفية شفافة.',
    longDesc:
      'أداة ذكية ومحلية لتفريغ خلفيات الصور ذات الألوان المتجانسة أو خلفيات الاستوديو بنقرة واحدة، مع مؤشر حساسية اللون وممحاة يدوية دقيقة للتنقيح والحصول على PNG شفاف.',
    category: 'images',
    categoryLabel: 'أدوات الصور',
    iconName: 'Eraser',
    processingMode: 'local',
    popular: true,
    acceptedFormats: ['.png', '.jpg', '.jpeg', '.webp'],
    keywords: ['ازالة الخلفية', 'تفريغ الصورة', 'خلفية شفافة', 'remove background'],
    howToSteps: [
      'ارفع الصورة التي تريد تفريغ خلفيتها.',
      'انقر على لون الخلفية لإزالته أو استخدم زر «تفريغ تلقائي من الزوايا» واضبط درجة التسامح اللوني.',
      'استخدم أداة الممحاة اليدوية إذا لزم الأمر ثم نزّل الصورة بصيغة PNG شفافة.',
    ],
    faqs: [
      {
        question: 'متى تعطي الأداة أفضل نتيجة؟',
        answer: 'تعطي نتائج ممتازة مع الشعارات، المنتجات، المستندات، والصور ذات الخلفية البيضاء أو الملونة الموحدة.',
      },
    ],
    relatedSlugs: ['convert-image', 'crop-image', 'extract-image-colors'],
  },
  {
    slug: 'extract-image-colors',
    title: 'استخراج لوحة ألوان الصورة',
    shortDesc: 'استخرج الألوان السائدة من أي صورة مع أكواد HEX وRGB وHSL جاهزة للنسخ.',
    longDesc:
      'حلل ألوان أي صورة أو تصميم واستخرج لوحة ألوان متناسقة تضم أبرز الألوان السائدة مع نسب ظهورها وأكوادها البرمجية، وإمكانية نسخها أو تصديرها كملف CSS أو JSON.',
    category: 'images',
    categoryLabel: 'أدوات الصور',
    iconName: 'Palette',
    processingMode: 'local',
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    keywords: ['استخراج الوان', 'باليت الوان', 'اكواد الوان', 'color palette'],
    howToSteps: [
      'ارفع أي صورة لإجراء التحليل اللوني الفوري.',
      'اختر عدد الألوان المطلوب استخراجها (من 4 إلى 10 ألوان).',
      'انقر على أي لون لنسخ كود HEX أو RGB أو صدّر اللوحة كاملة.',
    ],
    faqs: [
      {
        question: 'هل يمكن تصدير الألوان لاستخدامها في التصميم أو البرمجة؟',
        answer: 'نعم، يمكنك نسخ كل لون بصيغة HEX أو RGB أو HSL، أو نسخ متغيرات CSS جاهزة.',
      },
    ],
    relatedSlugs: ['color-tools', 'compress-image', 'remove-background'],
  },

  // ======================== FILES & DOCUMENTS ========================
  {
    slug: 'create-zip',
    title: 'ضغط الملفات وإنشاء أرشيف ZIP',
    shortDesc: 'اجمع عدة ملفات ومستندات في ملف ZIP مضغوط ومنظم للتنزيل والمشاركة.',
    longDesc:
      'أداة إنشاء ملفات ZIP داخل المتصفح لتجميع الصور والمستندات والملفات المتنوعة في أرشيف واحد مضغوط مع عرض حجم كل ملف ونسبة الضغط المحققة.',
    category: 'files',
    categoryLabel: 'الملفات والمستندات',
    iconName: 'FolderArchive',
    processingMode: 'local',
    popular: true,
    batchSupported: true,
    acceptedFormats: ['*'],
    keywords: ['ضغط ملفات', 'انشاء zip', 'ارشفة', 'zip'],
    howToSteps: [
      'اختر أو اسحب الملفات التي تريد تجميعها.',
      'اكتب اسم ملف الأرشيف واضبط مستوى الضغط.',
      'اضغط «إنشاء ملف ZIP» ونزّل الأرشيف الجاهز.',
    ],
    faqs: [
      {
        question: 'هل توجد قيود على أنواع الملفات داخل أرشيف ZIP؟',
        answer: 'يمكنك ضغط أي نوع من الملفات (PDF، صور، نصوص، جداول، أو ملفات برمجية).',
      },
    ],
    relatedSlugs: ['extract-zip', 'batch-rename', 'file-inspector'],
  },
  {
    slug: 'extract-zip',
    title: 'فك ضغط واستعراض ملفات ZIP',
    shortDesc: 'افتح ملفات ZIP وتصفح محتوياتها واستخرج الملفات التي تريدها فوراً.',
    longDesc:
      'استعرض محتويات أي أرشيف ZIP داخل المتصفح دون برامج إضافية، واطلع على أحجام الملفات وعاين النصوص والصور بداخلها، ثم نزّل ملفات محددة أو جميع المحتويات.',
    category: 'files',
    categoryLabel: 'الملفات والمستندات',
    iconName: 'FolderOpen',
    processingMode: 'local',
    acceptedFormats: ['.zip'],
    keywords: ['فك ضغط', 'فتح zip', 'استخراج zip', 'unzip'],
    howToSteps: [
      'ارفع ملف الأرشيف بصيغة .zip.',
      'تصفح قائمة الملفات والمجلدات داخل الأرشيف.',
      'اضغط تنزيل بجانب أي ملف لاستخراجه فوراً.',
    ],
    faqs: [
      {
        question: 'هل يمكن معاينة الصور والنصوص قبل تنزيلها من الـ ZIP؟',
        answer: 'نعم، تتيح الأداة معاينة الملفات النصية والصور مباشرة من داخل قائمة الأرشيف.',
      },
    ],
    relatedSlugs: ['create-zip', 'file-inspector', 'batch-rename'],
  },
  {
    slug: 'batch-rename',
    title: 'تغيير أسماء الملفات جماعياً',
    shortDesc: 'عدّل أسماء عشرات الملفات دفعة واحدة بإضافة بادئة أو ترقيم أو استبدال نص.',
    longDesc:
      'وفّر وقتك في تنظيم الملفات والصور؛ أضف بادئة أو لاحقة، استبدل كلمات، رقّم الملفات تلقائياً (001، 002)، وعاين الأسماء الجديدة قبل تنزيل الملفات مرتبة داخل أرشيف ZIP.',
    category: 'files',
    categoryLabel: 'الملفات والمستندات',
    iconName: 'FilePenLine',
    processingMode: 'local',
    batchSupported: true,
    acceptedFormats: ['*'],
    keywords: ['تغيير اسماء الملفات', 'اعادة تسمية جماعية', 'ترقيم ملفات', 'rename'],
    howToSteps: [
      'ارفع الملفات المراد إعادة تسميتها.',
      'حدد قواعد التسمية (بادئة، لاحقة، بحث واستبدال، أو ترقيم تسلسلي).',
      'راجع جدول المعاينة (الاسم القديم ← الاسم الجديد) ثم نزّل الملفات في أرشيف ZIP.',
    ],
    faqs: [
      {
        question: 'هل تحافظ الأداة على امتداد الملفات الأصلي؟',
        answer: 'نعم، يتم تطبيق التعديل على اسم الملف مع الحفاظ تلقائياً على امتداد كل ملف.',
      },
    ],
    relatedSlugs: ['create-zip', 'file-inspector', 'txt-processor'],
  },
  {
    slug: 'file-inspector',
    title: 'عارض معلومات الملفات والتحقق (Hash)',
    shortDesc: 'اعرف نوع الملف الفعلي وحجمه الدقيق وبصمة SHA-256 وSHA-1 للتحقق من السلامة.',
    longDesc:
      'أداة فحص تقنية دقيقة تعرض البيانات الأساسية لأي ملف: النوع (MIME)، الحجم بالبايت والميجابايت، تاريخ التعديل، أبعاد الصورة إن وجدت، وحساب التوقيع الرقمي SHA-256 وSHA-1 محلياً.',
    category: 'files',
    categoryLabel: 'الملفات والمستندات',
    iconName: 'FileBadge',
    processingMode: 'local',
    acceptedFormats: ['*'],
    keywords: ['معلومات الملف', 'حجم الملف', 'sha256', 'hash', 'فحص ملف'],
    howToSteps: [
      'ارفع أو اسحب أي ملف تريد فحصه.',
      'ستظهر بيانات الملف وبصمة التحقق الرقمية فوراً.',
      'انسخ بصمة SHA-256 أو قارنها مع البصمة المتوقعة للتأكد من سلامة الملف.',
    ],
    faqs: [
      {
        question: 'ما فائدة بصمة SHA-256؟',
        answer: 'تُستخدم للتحقق من أن الملف لم يتلف أو يتغير أثناء النقل أو التحميل.',
      },
    ],
    relatedSlugs: ['extract-zip', 'create-zip', 'csv-json-converter'],
  },
  {
    slug: 'csv-json-converter',
    title: 'تحويل ومعالجة CSV و JSON',
    shortDesc: 'حوّل جداول CSV إلى JSON والعكس مع عرض تفاعلي ودعم كامل للعربية.',
    longDesc:
      'أداة عملية للتعامل مع ملفات البيانات (.csv و.json): استعرض الجداول بوضوح، نظّف الصفوف الفارغة، حوّل بين الصيغتين، وصدّر ملفات CSV بترميز UTF-8 BOM لتفتح باللغة العربية السليمة في Excel.',
    category: 'files',
    categoryLabel: 'الملفات والمستندات',
    iconName: 'FileSpreadsheet',
    processingMode: 'local',
    acceptedFormats: ['.csv', '.json', '.txt'],
    keywords: ['csv', 'json', 'تحويل بيانات', 'اكسل عربي', 'جداول'],
    howToSteps: [
      'ارفع ملف CSV أو JSON أو الصق البيانات النصية مباشرة.',
      'اختر اتجاه التحويل (CSV إلى JSON أو JSON إلى CSV) وعاين الجدول.',
      'انسخ النتيجة أو نزّل الملف المصدّر.',
    ],
    faqs: [
      {
        question: 'لماذا تظهر الحروف العربية غريبة عند فتح CSV في Excel؟',
        answer: 'تضيف أداتنا علامة UTF-8 BOM تلقائياً عند تنزيل CSV لضمان قراءة العربية بشكل سليم في Excel.',
      },
    ],
    relatedSlugs: ['excel-to-pdf', 'json-formatter', 'txt-processor'],
  },
  {
    slug: 'txt-processor',
    title: 'معالج الملفات النصية (TXT / MD)',
    shortDesc: 'ادمج أو نظّف أو رتّب سطور عدة ملفات نصية دفعة واحدة.',
    longDesc:
      'ارفع ملفاً واحداً أو عدة ملفات نصية (.txt و.md و.log) لتنظيف الفراغات والسطور المكررة، أو دمجها مع فواصل، أو فرز سطورها، ثم تنزيل النتيجة فوراً.',
    category: 'files',
    categoryLabel: 'الملفات والمستندات',
    iconName: 'FileCode',
    processingMode: 'local',
    batchSupported: true,
    acceptedFormats: ['.txt', '.md', '.log', '.csv'],
    keywords: ['ملفات نصية', 'txt', 'دمج نصوص', 'تنظيف ملفات'],
    howToSteps: [
      'ارفع ملفاً أو عدة ملفات نصية.',
      'اختر عمليات المعالجة (دمج، إزالة السطور المكررة، فرز أبجدي، إزالة الفراغات).',
      'عاين النص النهائي ونزّله كملف TXT نظيف.',
    ],
    faqs: [
      {
        question: 'هل تدعم الأداة دمج عدة ملفات TXT معاً؟',
        answer: 'نعم، عند رفع أكثر من ملف يمكنك دمجها في ملف واحد مرتب مع الحفاظ على ترميز UTF-8.',
      },
    ],
    relatedSlugs: ['text-formatter', 'word-counter', 'csv-json-converter'],
  },

  // ======================== PRODUCTIVITY & UTILITIES ========================
  {
    slug: 'qr-generator',
    title: 'مولد رموز الاستجابة السريعة (QR Code)',
    shortDesc: 'أنشئ رمز QR مخصصاً للروابط والنصوص وشبكات Wi-Fi وواتساب بجودة PNG وSVG.',
    longDesc:
      'صمّم رموز QR احترافية للروابط، النصوص، بيانات الاتصال بشبكة Wi-Fi، رسائل واتساب، أو البريد الإلكتروني، مع تخصيص الألوان ومستوى تصحيح الأخطاء والتنزيل الفوري بصيغتي PNG وSVG.',
    category: 'productivity',
    categoryLabel: 'الإنتاجية والمحتوى',
    iconName: 'QrCode',
    processingMode: 'local',
    popular: true,
    keywords: ['qr', 'كيو ار', 'باركود مربع', 'رمز استجابة', 'واي فاي'],
    howToSteps: [
      'اختر نوع الرمز (رابط، نص، Wi-Fi، واتساب، بريد إلكتروني) وأدخل البيانات.',
      'خصّص لون الرمز والخلفية وحجم الصورة ومستوى الدقة.',
      'نزّل الرمز بصيغة PNG للويب أو SVG للطباعة عالية الجودة.',
    ],
    faqs: [
      {
        question: 'هل تنتهي صلاحية رموز QR المنشأة؟',
        answer: 'لا، الرموز ثابتة ومباشرة وتعمل للأبد دون أي وسيط أو اشتراك.',
      },
    ],
    relatedSlugs: ['barcode-generator', 'color-tools', 'password-generator'],
  },
  {
    slug: 'barcode-generator',
    title: 'مولد الباركود (Barcode)',
    shortDesc: 'أنشئ ملصقات باركود قياسية بأنظمة CODE128 وEAN-13 وUPC بصيغة PNG وSVG.',
    longDesc:
      'أداة موثوقة لإنشاء رموز الباركود للمنتجات والمخزون والشحن، تدعم معايير CODE128 وEAN-13 وEAN-8 وUPC وCODE39 مع التحكم في عرض الخطوط والارتفاع وإظهار الرقم أسفل الرمز.',
    category: 'productivity',
    categoryLabel: 'الإنتاجية والمحتوى',
    iconName: 'Barcode',
    processingMode: 'local',
    keywords: ['باركود', 'barcode', 'ean13', 'code128', 'منتجات'],
    howToSteps: [
      'اختر معيار الباركود المناسب (مثل CODE128 للأرقام والحروف أو EAN-13 للمنتجات).',
      'أدخل القيمة المطلوبة واضبط الأبعاد وخيارات العرض.',
      'نزّل الباركود بصيغة PNG أو SVG للطباعة.',
    ],
    faqs: [
      {
        question: 'لماذا يطلب EAN-13 عدداً محدداً من الأرقام؟',
        answer: 'معيار EAN-13 العالمي يتكون تحديداً من 12 أو 13 رقماً، وتتحقق الأداة من صحة المدخل تلقائياً.',
      },
    ],
    relatedSlugs: ['qr-generator', 'unit-converter', 'create-zip'],
  },
  {
    slug: 'password-generator',
    title: 'مولد كلمات مرور قوية',
    shortDesc: 'ولّد كلمات مرور عشوائية وآمنة مع حساب قوة التشفير ومعدل الإنتروبيا.',
    longDesc:
      'أنشئ كلمات مرور عشوائية عالية الأمان باستخدام التوليد التشفيري داخل المتصفح، مع التحكم في الطول والأحرف الكبيرة والصغيرة والأرقام والرموز، وإمكانية توليد قائمة كلمات مرور دفعة واحدة.',
    category: 'productivity',
    categoryLabel: 'الإنتاجية والمحتوى',
    iconName: 'KeyRound',
    processingMode: 'local',
    popular: true,
    keywords: ['كلمة مرور', 'باسورد', 'توليد', 'امان', 'password'],
    howToSteps: [
      'حدّد طول كلمة المرور المطلوب (يُنصح بـ 16 حرفاً فأكثر).',
      'اختر المكونات (أحرف كبيرة، صغيرة، أرقام، رموز خاصة).',
      'اضغط «توليد» وانسخ كلمة المرور بضغطة واحدة.',
    ],
    faqs: [
      {
        question: 'هل يتم حفظ كلمات المرور المولدة؟',
        answer: 'مطلقاً؛ تُولد الكلمات محلياً عبر واجهة Web Crypto داخل جهازك ولا تغادره أبداً.',
      },
    ],
    relatedSlugs: ['file-inspector', 'qr-generator', 'json-formatter'],
  },
  {
    slug: 'word-counter',
    title: 'عداد الكلمات والحروف وتحليل النص',
    shortDesc: 'احسب الكلمات والحروف والجمل والفقرات ووقت القراءة المقدر للنصوص العربية والإنجليزية.',
    longDesc:
      'محلل نصوص فوري لصناع المحتوى والكتاب والطلاب: يحسب عدد الكلمات، الحروف مع وبدون مسافات، الجمل، الفقرات، وقت القراءة والحديث، وأكثر الكلمات تكراراً.',
    category: 'productivity',
    categoryLabel: 'الإنتاجية والمحتوى',
    iconName: 'AlignRight',
    processingMode: 'local',
    popular: true,
    keywords: ['عداد الكلمات', 'حساب الحروف', 'تحليل نص', 'وقت القراءة', 'word counter'],
    howToSteps: [
      'اكتب النص أو الصقه في مربع المحرر.',
      'تُحدَّث الإحصائيات لحظياً في الأعلى (الكلمات، الحروف، الفقرات، وقت القراءة).',
      'راجع جدول أكثر الكلمات تكراراً لضبط كثافة المحتوى.',
    ],
    faqs: [
      {
        question: 'هل يحسب العداد الكلمات العربية بدقة؟',
        answer: 'نعم، يدعم التشكيل وعلامات الترقيم العربية والإنجليزية ويحسب الكلمات بدقة.',
      },
    ],
    relatedSlugs: ['text-formatter', 'txt-processor', 'extract-pdf-text'],
  },
  {
    slug: 'text-formatter',
    title: 'منسق ومُنظف النصوص العربية',
    shortDesc: 'أزل المسافات الزائدة والتشكيل والأسطر المكررة ونقّح النصوص بسرعة.',
    longDesc:
      'مجموعة أدوات سريعة لتنظيف وتنسيق النصوص: إزالة الفراغات والأسطر الفارغة الزائدة، إزالة التشكيل العربي، توحيد الهمزات، حذف الأسطر المكررة، والفرز الأبجدي.',
    category: 'productivity',
    categoryLabel: 'الإنتاجية والمحتوى',
    iconName: 'Sparkles',
    processingMode: 'local',
    keywords: ['تنظيف النص', 'ازالة المسافات', 'ازالة التشكيل', 'تنسيق نص', 'ترتيب اسطر'],
    howToSteps: [
      'الصق النص الذي تريد تنظيفه أو إعادة تنسيقه.',
      'اختر الإجراءات المطلوبة مثل إزالة المسافات الزائدة أو التشكيل أو التكرار.',
      'انسخ النص المنسق مباشرة أو نزّله كملف TXT.',
    ],
    faqs: [
      {
        question: 'ماذا يفعل خيار توحيد الألف والهمزات؟',
        answer: 'يحوّل (أ، إ، آ) إلى (ا) لتسهيل البحث والمطابقة في قواعد البيانات والمقالات.',
      },
    ],
    relatedSlugs: ['word-counter', 'txt-processor', 'ocr-tool'],
  },
  {
    slug: 'unit-converter',
    title: 'محول وحدات القياس الشامل',
    shortDesc: 'حوّل فورياً بين وحدات الطول والوزن والحرارة والمساحة والحجم والبيانات.',
    longDesc:
      'محول وحدات ثنائي الاتجاه ودقيق يشمل الطول (متر، ميل، بوصة)، الكتلة (كيلوجرام، رطل، أونصة)، الحرارة (مئوية، فهرنهايت، كلفن)، المساحة، الحجم، السرعة، والبيانات الرقمية.',
    category: 'productivity',
    categoryLabel: 'الإنتاجية والمحتوى',
    iconName: 'Scale',
    processingMode: 'local',
    keywords: ['تحويل وحدات', 'قياس', 'متر', 'كيلو', 'حرارة', 'جيجابايت'],
    howToSteps: [
      'اختر فئة القياس (الطول، الوزن، الحرارة، البيانات...).',
      'أدخل القيمة واختر وحدة المصدر والوحدة المستهدفة.',
      'احصل على النتيجة الفورية مع جدول مقارنة لبقية الوحدات.',
    ],
    faqs: [
      {
        question: 'هل يدعم المحول وحدات التخزين الرقمية؟',
        answer: 'نعم، يدعم البت والبايت والكيلوبايت والميجابايت والجيجابايت والتيرابايت.',
      },
    ],
    relatedSlugs: ['color-tools', 'word-counter', 'barcode-generator'],
  },
  {
    slug: 'color-tools',
    title: 'أداة الألوان وفحص التباين (WCAG)',
    shortDesc: 'حوّل بين HEX وRGB وHSL وCMYK وافحص تباين القراءة بين النص والخلفية.',
    longDesc:
      'مساحة عمل متكاملة للمصممين والمطورين: التقط أي لون وحوّل صيغته فورياً، أنشئ درجات فاتحة وداكنة متناسقة، وتحقق من نسبة التباين (WCAG AA/AAA) لسهولة القراءة.',
    category: 'productivity',
    categoryLabel: 'الإنتاجية والمحتوى',
    iconName: 'Contrast',
    processingMode: 'local',
    keywords: ['الوان', 'hex', 'rgb', 'تباين', 'wcag', 'مصممين'],
    howToSteps: [
      'اختر اللون من المنتقي أو أدخل كود HEX أو قيم RGB.',
      'انسخ الصيغ المحولة أو التدرجات المولدة.',
      'اختبر تباين لون النص مع لون الخلفية للتأكد من وضوح القراءة.',
    ],
    faqs: [
      {
        question: 'ما نسبة التباين المطلوبة للنصوص العادية؟',
        answer: 'يتطلب معيار WCAG AA نسبة تباين لا تقل عن 4.5:1 للنصوص العادية و3:1 للعناوين الكبيرة.',
      },
    ],
    relatedSlugs: ['extract-image-colors', 'qr-generator', 'unit-converter'],
  },
  {
    slug: 'json-formatter',
    title: 'منسق ومُحقق JSON',
    shortDesc: 'رتّب بيانات JSON وتحقق من صحة الصياغة واضغطها بسهولة.',
    longDesc:
      'أداة موجهة للمطورين ومحللي البيانات لتنسيق ملفات وأكواد JSON غير المرتبة، واكتشاف الأخطاء النحوية بدقة، وضغط الأكواد للإنتاج أو ترتيب المفاتيح أبجدياً.',
    category: 'productivity',
    categoryLabel: 'الإنتاجية والمحتوى',
    iconName: 'Braces',
    processingMode: 'local',
    keywords: ['json', 'تنسيق', 'مطورين', 'تحقق', 'minify'],
    howToSteps: [
      'الصق نص JSON أو ارفع ملف .json.',
      'اختر «تنسيق وترتيب» أو «ضغط» أو «ترتيب المفاتيح».',
      'انسخ النتيجة الصحيحة أو نزّلها كملف .json.',
    ],
    faqs: [
      {
        question: 'ماذا يحدث عند وجود خطأ في بنية JSON؟',
        answer: 'تظهر رسالة خطأ واضحة تشير إلى سبب المشكلة لتتمكن من إصلاحها بسرعة.',
      },
    ],
    relatedSlugs: ['csv-json-converter', 'file-inspector', 'text-formatter'],
  },
];

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return TOOLS_REGISTRY.find((tool) => tool.slug === slug);
}

export function getRelatedTools(tool: ToolDefinition): ToolDefinition[] {
  return tool.relatedSlugs
    .map((slug) => getToolBySlug(slug))
    .filter((t): t is ToolDefinition => Boolean(t));
}
