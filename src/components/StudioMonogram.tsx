import { studioTint, getInitials } from '../lib/studioUtils';

interface Props {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZE_CLASSES: Record<NonNullable<Props['size']>, string> = {
  sm:  'h-10 w-10 text-xs',
  md:  'h-14 w-14 text-sm',
  lg:  'h-20 w-20 text-lg',
  xl:  'h-28 w-28 text-2xl',
};

export default function StudioMonogram({ name, size = 'md' }: Props) {
  const tint = studioTint(name);
  const initials = getInitials(name);
  return (
    <div
      className={`${SIZE_CLASSES[size]} ${tint} flex-none relative flex items-center justify-center rounded-full ring-1 ring-white/10 shadow-lg`}
    >
      {/* Subtle inner decorative ring */}
      <div className="absolute inset-[3px] rounded-full ring-1 ring-white/5" />
      <span className="relative font-bold tracking-wide text-white select-none">{initials}</span>
    </div>
  );
}
