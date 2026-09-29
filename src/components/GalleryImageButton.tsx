import { Language } from '../types';

interface GalleryImageButtonProps {
  lang: Language;
  subject: string;
  photoIndex: number;
  onOpen: () => void;
}

// Covers only the photo. Sibling arrows, thumbnails and corner controls stay above it.
export function GalleryImageButton({ lang, subject, photoIndex, onOpen }: GalleryImageButtonProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-label={lang === 'it'
        ? `Ingrandisci foto ${photoIndex + 1} — ${subject}`
        : `Enlarge photo ${photoIndex + 1} — ${subject}`}
      className="absolute inset-0 w-full h-full cursor-zoom-in rounded-[inherit]"
      style={{ outlineOffset: '-4px' }}
    />
  );
}
