import test from 'node:test';
import assert from 'node:assert/strict';
import { ROUTES, parsePath, routePath } from '../src/utils/routes';
test('every localized route survives direct URLs under GitHub Pages and a custom domain', () => {
  for (const base of ['/trullodeimessapi/', '/']) for (const lang of ['it','en'] as const) for (const route of ROUTES) {
    assert.deepEqual(parsePath(routePath(route, lang, base), base), { route, lang });
  }
});
test('normal CTA colors meet WCAG AA against white', () => {
  const luminance = (hex: string) => hex.match(/\w\w/g)!.map(channel => parseInt(channel,16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4).reduce((sum,value,index) => sum + value * [.2126,.7152,.0722][index], 0);
  for (const color of ['87613F','715033','137A42','106537']) assert.ok(1.05 / (luminance(color) + .05) >= 4.5, color);
});
