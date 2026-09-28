import { renderToString } from 'react-dom/server';
import { App } from './App';
import { AppRoute } from './utils/routes';
import { Language } from './types';
export { ROUTES, routePath, BASE } from './utils/routes';
export { metadata, structuredData } from './utils/metadata';
export function render(route: AppRoute, lang: Language) { return renderToString(<App initialRoute={route} initialLang={lang} />); }
