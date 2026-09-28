import { RefObject, useEffect, useRef } from 'react';

// A stack keeps keyboard control with the topmost dialog (gallery over suite).
const dialogs: HTMLElement[] = [];
let originalOverflow = '';

export function useDialog(ref: RefObject<HTMLDivElement | null>, open: boolean, onClose: () => void) {
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);
  useEffect(() => {
    const el = ref.current;
    if (!open || !el) return;
    const previous = document.activeElement as HTMLElement | null;
    if (!dialogs.length) originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogs.push(el);
    const focusables = () => Array.from(el.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), textarea, select, [tabindex="0"]')).filter(e => e.getClientRects().length);
    (focusables()[0] || el).focus({ preventScroll: true });
    const key = (event: KeyboardEvent) => {
      if (dialogs.at(-1) !== el) return;
      if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); close.current(); }
      if (event.key === 'Tab') {
        const items = focusables();
        const first = items[0] || el, last = items.at(-1) || el;
        if (event.shiftKey && (document.activeElement === first || !el.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || !el.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
      }
    };
    const focus = (event: FocusEvent) => {
      if (dialogs.at(-1) === el && !el.contains(event.target as Node)) (focusables()[0] || el).focus();
    };
    document.addEventListener('keydown', key, true);
    document.addEventListener('focusin', focus);
    return () => {
      dialogs.splice(dialogs.indexOf(el), 1);
      document.removeEventListener('keydown', key, true);
      document.removeEventListener('focusin', focus);
      if (!dialogs.length) document.body.style.overflow = originalOverflow;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [open, ref]);
}
