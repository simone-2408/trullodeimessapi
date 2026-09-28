import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { ROUTES, render, routePath, metadata, structuredData, BASE } from '../dist-ssr/entry-server.js';
const template = await readFile('dist/index.html', 'utf8');
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const locations = [];
for (const lang of ['it','en']) for (const route of ROUTES) {
  const meta = metadata(route, lang);
  const head = `<title>${escape(meta.title)}</title>
<meta name="description" content="${escape(meta.description)}" />
<link rel="canonical" href="${meta.canonical}" />
<link rel="alternate" hreflang="it" href="${meta.it}" />
<link rel="alternate" hreflang="en" href="${meta.en}" />
<link rel="alternate" hreflang="x-default" href="${meta.it}" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${escape(meta.title)}" />
<meta property="og:description" content="${escape(meta.description)}" />
<meta property="og:url" content="${meta.canonical}" />
<meta property="og:image" content="${meta.image}" />
<meta property="og:locale" content="${lang === 'it' ? 'it_IT' : 'en_GB'}" />
<script type="application/ld+json" id="lodging-data">${JSON.stringify(structuredData(route, lang)).replaceAll('<', '\\u003c')}</script>`;
  const html = template.replace('lang="it"', `lang="${lang}"`).replace('<!-- PAGE_META -->', head).replace('<div id="root"></div>', `<div id="root">${render(route, lang)}</div>`);
  const file = resolve('dist', routePath(route, lang).slice(BASE.length), 'index.html');
  await mkdir(dirname(file), { recursive: true }); await writeFile(file, html);
  locations.push(`<url><loc>${meta.canonical}</loc><xhtml:link rel="alternate" hreflang="it" href="${meta.it}"/><xhtml:link rel="alternate" hreflang="en" href="${meta.en}"/></url>`);
}
const home = metadata('home', 'it').canonical;
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${locations.join('\n')}</urlset>`);
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${home}sitemap.xml\n`);
await writeFile('dist/.nojekyll', '');
console.log(`Generated ${locations.length} HTML pages, sitemap and robots.txt.`);
