// Готовит dist/ к показу на GitHub Pages в подпапке:
// корневые ссылки "/..." получают префикс BASE_PATH, прототип закрывается от индексации.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = (process.env.BASE_PATH || '').replace(/\/$/, '');
if (!BASE) throw new Error('BASE_PATH не задан');
const DIST = fileURLToPath(new URL('../dist/', import.meta.url));

const files = [];
const walk = (d) => readdirSync(d).forEach((f) => {
  const p = join(d, f);
  statSync(p).isDirectory() ? walk(p) : files.push(p);
});
walk(DIST);

const esc = BASE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// кавычка/скобка/знак = перед путём "/буква…", но не "//" и не уже с префиксом
const re = new RegExp(`(["'\`(=])/(?!/|${esc.slice(1)}/)([A-Za-z0-9_#?-])`, 'g');
const noindex = '<meta name="robots" content="noindex, nofollow">';

let changed = 0;
for (const f of files) {
  const ext = extname(f);
  if (!['.html', '.js', '.css', '.xml', '.webmanifest'].includes(ext)) continue;
  let t = readFileSync(f, 'utf8');
  const before = t;
  if (ext === '.html') {
    // абсолютные адреса сайта (canonical, JSON-LD, og) не трогаем — они на боевой домен
    t = t.replace(re, `$1${BASE}/$2`).replace(/(href|action)="\/"/g, `$1="${BASE}/"`);
    if (!t.includes('name="robots"')) t = t.replace('<head>', `<head>${noindex}`);
    else t = t.replace(/<meta name="robots"[^>]*>/, noindex);
  } else if (ext === '.js') {
    t = t.replace(/(["'`])\/(spasibo|ceny|obekty|kontakty|politika-pdn|soglasie-pdn|cookie)\//g, `$1${BASE}/$2/`);
  }
  if (t !== before) { writeFileSync(f, t); changed++; }
}
writeFileSync(join(DIST, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
writeFileSync(join(DIST, '.nojekyll'), '');
console.log(`Файлов изменено: ${changed}; robots.txt закрыт; base=${BASE}`);
