// Проверка внутренних ссылок и якорей по собранному dist/.
// Запуск: npm run build && npm run check-links
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const files = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.html')) files.push(p);
  }
})(DIST);

const urlOf = (file) => {
  let r = '/' + relative(DIST, file).split(sep).join('/');
  return r.replace(/index\.html$/, '');
};
const ids = new Map();
const pages = new Map();
for (const f of files) {
  const html = readFileSync(f, 'utf8');
  pages.set(urlOf(f), html);
  ids.set(urlOf(f), new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
}
const exists = (path) => {
  if (pages.has(path)) return true;
  const p = join(DIST, decodeURIComponent(path));
  return existsSync(p) && statSync(p).isFile();
};

let bad = 0, checked = 0;
const report = [];
for (const [page, html] of pages) {
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    let link = m[1].replace(/&amp;/g, '&');
    if (/^(https?:|mailto:|tel:|data:|#$)/.test(link) || link === '#') continue;
    checked++;
    let [path, hash] = link.split('#');
    if (!path) path = page;
    path = path.split('?')[0];
    if (!exists(path)) { bad++; report.push(`[нет страницы] ${page} → ${link}`); continue; }
    if (hash && ids.has(path) && !ids.get(path).has(decodeURIComponent(hash))) { bad++; report.push(`[нет якоря] ${page} → ${link}`); }
  }
}
// внешние ресурсы: не должно быть ни одного запроса к чужим доменам в src/link rel=stylesheet/script
const external = [];
for (const [page, html] of pages) {
  for (const m of html.matchAll(/<(?:script|link|img|iframe)[^>]+(?:src|href)="(https?:\/\/[^"]+)"/g)) {
    if (!m[1].startsWith('https://sistema-tepla.ru')) external.push(`${page} → ${m[1]}`);
  }
}
console.log(`Страниц: ${pages.size}. Проверено ссылок: ${checked}. Битых: ${bad}. Внешних ресурсов: ${external.length}.`);
report.slice(0, 50).forEach((r) => console.log(r));
external.slice(0, 20).forEach((r) => console.log('[внешний ресурс] ' + r));
process.exit(bad || external.length ? 1 : 0);
