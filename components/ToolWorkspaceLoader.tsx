'use client';

import dynamic from 'next/dynamic';

function WorkspaceSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8">
      <div className="h-44 animate-pulse rounded-xl bg-slate-100" />
      <div className="mt-4 h-4 w-48 animate-pulse rounded bg-slate-100" />
    </div>
  );
}

const PdfCoreWorkspace = dynamic(() => import('./tools/pdf/PdfCoreWorkspace'), {
  ssr: false,
  loading: () => <WorkspaceSkeleton />,
});

const PdfPagesWorkspace = dynamic(() => import('./tools/pdf/PdfPagesWorkspace'), {
  ssr: false,
  loading: () => <WorkspaceSkeleton />,
});

const OfficeAndOcrWorkspace = dynamic(() => import('./tools/pdf/OfficeAndOcrWorkspace'), {
  ssr: false,
  loading: () => <WorkspaceSkeleton />,
});

const ImageToolsWorkspace = dynamic(() => import('./tools/images/ImageToolsWorkspace'), {
  ssr: false,
  loading: () => <WorkspaceSkeleton />,
});

const RemoveBackgroundWorkspace = dynamic(
  () => import('./tools/images/RemoveBackgroundWorkspace'),
  {
    ssr: false,
    loading: () => <WorkspaceSkeleton />,
  }
);

const FileToolsWorkspace = dynamic(() => import('./tools/files/FileToolsWorkspace'), {
  ssr: false,
  loading: () => <WorkspaceSkeleton />,
});

const ProductivityWorkspace = dynamic(
  () => import('./tools/productivity/ProductivityWorkspace'),
  {
    ssr: false,
    loading: () => <WorkspaceSkeleton />,
  }
);

const PDF_CORE_SLUGS = new Set([
  'merge-pdf',
  'split-pdf',
  'compress-pdf',
  'images-to-pdf',
  'watermark-pdf',
  'protect-pdf',
]);

const PDF_PAGES_SLUGS = new Set([
  'extract-pdf-pages',
  'delete-pdf-pages',
  'reorder-pdf-pages',
  'rotate-pdf',
  'pdf-to-images',
  'extract-pdf-text',
  'pdf-viewer',
]);

const OFFICE_OCR_SLUGS = new Set([
  'word-to-pdf',
  'excel-to-pdf',
  'powerpoint-to-pdf',
  'ocr-tool',
]);

const FILE_SLUGS = new Set([
  'create-zip',
  'extract-zip',
  'batch-rename',
  'file-inspector',
  'csv-json-converter',
  'txt-processor',
]);

export default function ToolWorkspaceLoader({ slug }: { slug: string }) {
  if (PDF_CORE_SLUGS.has(slug)) {
    return <PdfCoreWorkspace slug={slug} />;
  }
  if (PDF_PAGES_SLUGS.has(slug)) {
    return <PdfPagesWorkspace slug={slug} />;
  }
  if (OFFICE_OCR_SLUGS.has(slug)) {
    return <OfficeAndOcrWorkspace slug={slug} />;
  }
  if (slug === 'remove-background') {
    return <RemoveBackgroundWorkspace />;
  }
  if (FILE_SLUGS.has(slug)) {
    return <FileToolsWorkspace slug={slug} />;
  }
  if (
    [
      'compress-image',
      'resize-image',
      'crop-image',
      'rotate-flip-image',
      'convert-image',
      'watermark-image',
      'extract-image-colors',
    ].includes(slug)
  ) {
    return <ImageToolsWorkspace slug={slug} />;
  }
  return <ProductivityWorkspace slug={slug} />;
}
