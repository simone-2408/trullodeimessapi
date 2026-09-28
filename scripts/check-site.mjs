import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { ROUTES, routePath, BASE, metadata } from '../dist-ssr/entry-server.js';
let count = 0;
for (const lang of ['it','en']) for (const route of ROUTES) {
  const path = `dist/${routePath(route,lang).slice(BASE.length)}index.html`;
  const html = await readFile(path, 'utf8');
  assert.ok(html.includes(`<html lang="${lang}"`), path);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, path);
  assert.ok(html.includes(`rel="canonical" href="${metadata(route,lang).canonical}"`));
  assert.ok(html.includes('hreflang="en"'));
  assert.ok(!/<link[^>]+modulepreload[^>]+three-/.test(html), 'Three.js must remain lazy');
  for (const match of html.matchAll(/(?:src|poster|href)="([^"#]+)"/g)) {
    const value = match[1];
    if (!value.startsWith(BASE)) continue;
    const local = value.slice(BASE.length).split(/[?#]/)[0];
    await access(`dist/${local}${local.endsWith('/') || !local ? 'index.html' : ''}`);
  }
  count++;
}
console.log(`${count} static pages: language, headings, canonical, hreflang, lazy 3D and local assets/links verified.`);
