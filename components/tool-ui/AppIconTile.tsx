import { ToolCategoryId } from '@/lib/tools-registry';
import { ToolIcon } from './ToolIcon';

interface AppIconTileProps {
  iconName: string;
  category: ToolCategoryId;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const CATEGORY_STYLE: Record<
  ToolCategoryId,
  { shape: string; surface: string; innerRing: string }
> = {
  pdf: {
    shape: 'rounded-[18px]',
    surface: 'bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white shadow-sm shadow-rose-900/15',
    innerRing: 'ring-1 ring-inset ring-white/25',
  },
  images: {
    shape: 'rounded-2xl',
    surface: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white shadow-sm shadow-indigo-900/15',
    innerRing: 'ring-1 ring-inset ring-white/25',
  },
  files: {
    shape: 'rounded-tl-[20px] rounded-br-[20px] rounded-tr-[9px] rounded-bl-[9px]',
    surface: 'bg-gradient-to-br from-emerald-500 via-teal-600 to-teal-700 text-white shadow-sm shadow-teal-900/15',
    innerRing: 'ring-1 ring-inset ring-white/25',
  },
  productivity: {
    shape: 'rounded-full',
    surface: 'bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 text-white shadow-sm shadow-amber-900/15',
    innerRing: 'ring-1 ring-inset ring-white/30',
  },
};

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg', { box: string; icon: string }> = {
  sm: { box: 'h-9 w-9', icon: 'h-4 w-4' },
  md: { box: 'h-12 w-12', icon: 'h-6 w-6' },
  lg: { box: 'h-14 w-14', icon: 'h-7 w-7' },
};

export function AppIconTile({
  iconName,
  category,
  size = 'md',
  className = '',
}: AppIconTileProps) {
  const catStyle = CATEGORY_STYLE[category];
  const sizeStyle = SIZE_CLASSES[size];

  // Adjust smaller border radius proportionally for 'sm'
  const adjustedShape =
    size === 'sm'
      ? category === 'pdf'
        ? 'rounded-xl'
        : category === 'images'
          ? 'rounded-lg'
          : category === 'files'
            ? 'rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md'
            : 'rounded-full'
      : catStyle.shape;

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center transition-transform duration-150 ${sizeStyle.box} ${adjustedShape} ${catStyle.surface} ${catStyle.innerRing} ${className}`}
    >
      <ToolIcon name={iconName} className={sizeStyle.icon} />
    </div>
  );
}
