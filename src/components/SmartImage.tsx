import { ImgHTMLAttributes } from 'react';
import manifest from '../data/media.json';
import { asset } from '../utils/assets';
type ImageInfo = { width: number; height: number; variants: { src: string; width: number }[] };
export function SmartImage({ src = '', alt, sizes = '(min-width: 1024px) 50vw, 100vw', loading = 'lazy', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const info = (manifest as Record<string, ImageInfo>)[src.replace(/^\.\//, '').replace(/^\//, '')];
  const preferred = info?.variants.find(v => v.width >= 1024) || info?.variants.at(-1);
  return <img {...props} alt={alt} src={asset(preferred?.src || src)} width={props.width || info?.width} height={props.height || info?.height}
    srcSet={info?.variants.map(v => `${asset(v.src)} ${v.width}w`).join(', ')} sizes={info ? sizes : undefined} loading={loading} decoding="async" />;
}
