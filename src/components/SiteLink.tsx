import { AnchorHTMLAttributes } from 'react';
import { AppRoute, routePath } from '../utils/routes';
import { Language } from '../types';
interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  route: AppRoute;
  lang: Language;
  onNavigate?: (route: AppRoute) => void;
  query?: string;
}
export function SiteLink({ route, lang, onNavigate, query = '', onClick, children, ...props }: Props) {
  return <a {...props} href={routePath(route, lang) + query} onClick={event => {
    onClick?.(event);
    if (!event.defaultPrevented && onNavigate && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault(); onNavigate(route);
    }
  }}>{children}</a>;
}
