// Загрузчик текстов авторов: content/<ключ>.json (формат — PRAVKI-V2.md, п. 5).
// Ключ = адрес без слэшей по краям, «/» → «__», главная — index.json.
// Файл есть — его поля перекрывают дефолтные данные страницы; файла нет — страница собирается на дефолтах.
// Поля queries и sources на сайт не выводятся (служебные, для проверки текстов).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export type CTable = { head: string[]; rows: string[][] };
export type CSection = { id: string; h2: string; paragraphs: string[]; list: string[]; table?: CTable };
export type CStep = { t: string; d: string; days?: string };
export type CFaq = { q: string; a: string };
export type Content = {
  key: string;
  title?: string; description?: string; h1?: string; eyebrow?: string; offer?: string; priceFrom?: string; answer?: string;
  intro?: string[]; sections?: CSection[];
  prices?: [string, string, string][]; included?: string[]; steps?: CStep[]; faq?: CFaq[];
  related?: string[]; updated?: string;
};

const DIR = join(process.cwd(), 'content');

export const keyOf = (url: string) => url.replace(/^\/+|\/+$/g, '').replace(/\//g, '__') || 'index';
export const urlOfKey = (key: string) => (key === 'index' ? '/' : `/${key.replace(/__/g, '/')}/`);

const str = (v: unknown): string | undefined => {
  if (typeof v === 'number') return String(v);
  if (typeof v !== 'string') return undefined;
  // Схлопываем обычные пробелы и переводы строк, но неразрывный пробел (в ценах) сохраняем.
  const t = v.replace(/[ \t\r\n]+/g, ' ').replace(/^[ ]+|[ ]+$/g, '');
  return t || undefined;
};
const strArr = (v: unknown): string[] => {
  if (typeof v === 'string') return str(v) ? [str(v)!] : [];
  if (!Array.isArray(v)) return [];
  return v.map(str).filter((x): x is string => !!x);
};
const pick = (o: any, ...names: string[]) => { for (const n of names) if (o && o[n] != null) return o[n]; return undefined; };

function table(v: any): CTable | undefined {
  if (!v || typeof v !== 'object') return undefined;
  const head = strArr(pick(v, 'head', 'header', 'headers'));
  const rows = (Array.isArray(v.rows) ? v.rows : []).map((r: unknown) => (Array.isArray(r) ? r.map((c) => str(c) ?? '') : [])).filter((r: string[]) => r.length);
  if (!rows.length) return undefined;
  const cols = Math.max(head.length, ...rows.map((r: string[]) => r.length));
  const pad = (r: string[]) => [...r, ...Array(cols - r.length).fill('')];
  return { head: head.length ? pad(head) : [], rows: rows.map(pad) };
}

const RESERVED = new Set(['main', 'uslugi', 'vybor', 'vidy', 'ceny', 'raschet', 'varianty', 'obekty', 'etapy', 'garantii', 'otzyvy', 'voprosy', 'zayavka', 'perezvonite', 'podrobno', 'po-teme', 'proizvoditeli', 'istoriya', 'main-nav']);

function sections(v: unknown): CSection[] {
  if (!Array.isArray(v)) return [];
  const used = new Set<string>();
  const out: CSection[] = [];
  v.forEach((s: any, i) => {
    if (!s || typeof s !== 'object') return;
    const h2 = str(pick(s, 'h2', 'title', 'heading'));
    const paragraphs = strArr(pick(s, 'paragraphs', 'text', 'p'));
    const list = strArr(pick(s, 'list', 'items'));
    const t = table(s.table);
    if (!h2 || (!paragraphs.length && !list.length && !t)) return;
    let id = (str(s.id) ?? '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
    if (!id || /^\d/.test(id)) id = `razdel-${i + 1}`;
    if (RESERVED.has(id)) id = `o-${id}`;
    while (used.has(id)) id += '-2';
    used.add(id);
    out.push({ id, h2, paragraphs, list, table: t });
  });
  return out;
}

function prices(v: unknown): [string, string, string][] {
  if (!Array.isArray(v)) return [];
  const out: [string, string, string][] = [];
  for (const r of v as any[]) {
    let row: string[] = [];
    if (Array.isArray(r)) row = r.map((c) => str(c) ?? '');
    else if (r && typeof r === 'object') row = [str(pick(r, 'name', 'work', 'title')) ?? '', str(pick(r, 'unit', 'ed')) ?? '', str(pick(r, 'price', 'cost')) ?? ''];
    if (!row[0]) continue;
    if (row.length === 2) row = [row[0], '', row[1]];
    if (row.length > 3) row = [row[0], row[1], row.slice(2).filter(Boolean).join(' · ')];
    out.push([row[0], row[1] ?? '', row[2] ?? '']);
  }
  return out;
}

function normalize(key: string, j: any): Content {
  const c: Content = { key };
  for (const f of ['title', 'description', 'h1', 'eyebrow', 'offer', 'priceFrom', 'answer', 'updated'] as const) {
    const v = str(j[f]);
    if (v) c[f] = v;
  }
  const intro = strArr(j.intro);
  if (intro.length) c.intro = intro;
  const sec = sections(j.sections);
  if (sec.length) c.sections = sec;
  const pr = prices(j.prices);
  if (pr.length) c.prices = pr;
  const inc = strArr(pick(j, 'included', 'includes'));
  if (inc.length) c.included = inc;
  const steps = (Array.isArray(j.steps) ? j.steps : [])
    .map((s: any) => (typeof s === 'string' ? { t: s, d: '' } : { t: str(pick(s, 'title', 't')) ?? '', d: str(pick(s, 'text', 'd')) ?? '', days: str(pick(s, 'days', 'term')) }))
    .filter((s: CStep) => s.t);
  if (steps.length) c.steps = steps;
  const faq = (Array.isArray(j.faq) ? j.faq : [])
    .map((f: any) => ({ q: str(pick(f, 'q', 'question')) ?? '', a: str(pick(f, 'a', 'answer')) ?? '' }))
    .filter((f: CFaq) => f.q && f.a);
  if (faq.length) c.faq = faq;
  const rel = strArr(j.related).map((u) => (u === '/' ? u : `/${u.replace(/^https?:\/\/[^/]+/, '').replace(/^\/+|\/+$/g, '')}/`));
  if (rel.length) c.related = rel;
  return c;
}

type Store = { map: Map<string, Content>; errors: string[]; at: number };
const NBSP = String.fromCharCode(160);
let store: Store | null = null;

function read(): Store {
  const map = new Map<string, Content>();
  const errors: string[] = [];
  if (existsSync(DIR)) {
    for (const f of readdirSync(DIR).sort()) {
      // septics.json — данные моделей для подбора станции, а не текст страницы (его читает src/data/septics.ts).
      if (!f.endsWith('.json') || f === 'septics.json') continue;
      const key = f.slice(0, -5);
      try {
        const raw = readFileSync(join(DIR, f), 'utf8').replace(/^﻿/, '');
        // Числа и цены не должны рваться на перенос строки: «4 000 ₽» держим неразрывными пробелами (URL не трогаем).
        const j = JSON.parse(raw, (k, v) =>
          typeof v === 'string' && k !== 'url' && !/^https?:|^\//.test(v)
            ? v.replace(/(\d)[ ](?=\d{3}(?!\d))/g, '$1' + NBSP).replace(/(\d)[ ](?=₽)/g, '$1' + NBSP)
            : v,
        );
        if (!j || typeof j !== 'object' || Array.isArray(j)) throw new Error('ожидается объект');
        map.set(key, normalize(key, j));
      } catch (e) {
        // Автор мог не дописать файл — страница остаётся на дефолтах, сборка не падает.
        errors.push(`${f}: ${(e as Error).message}`);
        console.warn(`[content] ${f} пропущен: ${(e as Error).message}`);
      }
    }
  }
  return { map, errors, at: Date.now() };
}

// В сборке читаем один раз; в dev перечитываем не чаще раза в секунду, чтобы новые файлы авторов появлялись без перезапуска.
function get(): Store {
  if (!store || (import.meta.env.DEV && Date.now() - store.at > 1000)) store = read();
  return store;
}

export const contentVersion = () => get().at;
export const contentFor = (url: string): Content | undefined => get().map.get(keyOf(url));
export const contentKeys = (): string[] => [...get().map.keys()];
export const contentErrors = (): string[] => get().errors;

/** Число из строки цены «от 45 000 ₽ под ключ» → 45000 (для JSON-LD). */
export function priceNumber(s?: string): number | undefined {
  const m = s?.match(/\d[\d\s  ]*/);
  if (!m) return undefined;
  const n = Number(m[0].replace(/\D/g, ''));
  return n > 0 ? n : undefined;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const MD_LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;
const MD_BOLD = /\*\*([^*]+)\*\*/g;
const isInternal = (url: string) => url.startsWith('/') && !url.startsWith('//');
/** «/otoplenie/kotelnaya» → «/otoplenie/kotelnaya/» (сайт собирается с завершающим слэшем). */
function normHref(url: string) {
  const [path, hash] = url.split('#');
  const fixed = path.endsWith('/') || /\.[a-z0-9]+$/i.test(path) || path.includes('?') ? path : `${path}/`;
  return hash ? `${fixed}#${hash}` : fixed;
}

/**
 * Безопасный вывод авторского текста в HTML (абзацы, списки, ячейки таблиц, прямой ответ, ответы FAQ).
 * Сначала экранируется весь HTML, затем преобразуются только:
 *   [текст](/внутренний/адрес/) → ссылка; **текст** → <strong>.
 * Внешние ссылки кликабельными не делаются — остаётся только их текст.
 * Существование адреса здесь не проверяется: битую ссылку ловит npm run check-links.
 */
export function rich(text: string): string {
  return esc(text)
    .replace(MD_LINK, (_m, label: string, url: string) => (isInternal(url) ? `<a href="${normHref(url)}">${label}</a>` : label))
    .replace(MD_BOLD, '<strong>$1</strong>');
}

/** Тот же текст без разметки — для мета-тегов, JSON-LD, карточек и llms.txt. */
export const plain = (text: string): string => text.replace(MD_LINK, '$1').replace(MD_BOLD, '$1');

/** Внутренние ссылки из текста (для отчётов и проверок). */
export const linksIn = (text: string): string[] => [...text.matchAll(MD_LINK)].map((m) => m[2]).filter(isInternal).map(normHref);
