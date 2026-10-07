// Модели станций для блока «Подбор станции» (PRAVKI-V2.md, п. 3а).
//
// Источник данных — content/septics.json: его ведёт автор блока канализации (значения сверены с сайтами производителей,
// источник — в поле source каждой модели). Файл читается при сборке, поэтому правка JSON сразу попадает на сайт.
// Правило ТЗ: только проверенные значения; чего нет — null, на карточке будет «уточняем».
// Если JSON отсутствует или повреждён, сайт собирается на трёх моделях-примерах ниже и пишет предупреждение в лог сборки.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export type Septic = {
  brand: 'Юнилос Астра' | 'Топас' | 'Евролос';
  model: string;
  /** на сколько человек рассчитана модель */
  people: number;
  /** производительность, м³/сут */
  capacity: number | null;
  /** залповый сброс, л */
  salvo: number | null;
  /** отвод очищенной воды */
  outlet: 'самотёк' | 'принудительный' | 'оба';
  /** подходит при высоких грунтовых водах */
  highGW: boolean;
  /** подходит для дачи с непостоянным проживанием */
  dacha: boolean;
  /** цена станции «от», ₽ */
  price: number | null;
  /** дата цены, ДД.ММ.ГГГГ */
  priceDate: string;
  /** источник значений (сайт производителя) — на сайт не выводится */
  source: string;
  /** страница бренда на нашем сайте */
  url: string;
};

// Примеры на случай, если content/septics.json недоступен. Значения взяты из того же файла на 07.10.2026.
const EXAMPLES: Septic[] = [
  { brand: 'Юнилос Астра', model: 'Астра 5', people: 5, capacity: 1.0, salvo: 250, outlet: 'оба', highGW: true, dacha: true, price: 172300, priceDate: '07.10.2026', source: 'https://www.uni-los.ru/astra-5.html', url: '/kanalizaciya/yunilos-astra/' },
  { brand: 'Топас', model: 'Топас 5', people: 5, capacity: 1.0, salvo: 220, outlet: 'самотёк', highGW: false, dacha: true, price: 204500, priceDate: '07.10.2026', source: 'https://www.topol-eco.ru/production/topas/', url: '/kanalizaciya/topas/' },
  { brand: 'Евролос', model: 'БИО 5', people: 5, capacity: 1.0, salvo: null, outlet: 'самотёк', highGW: false, dacha: true, price: 157700, priceDate: '07.10.2026', source: 'https://eurolos.ru/septiki/bio/', url: '/kanalizaciya/evrolos/' },
];

const BRANDS = ['Юнилос Астра', 'Топас', 'Евролос'];
const OUTLETS = ['самотёк', 'принудительный', 'оба'];
const numOrNull = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

function load(): Septic[] {
  const file = join(process.cwd(), 'content', 'septics.json');
  if (!existsSync(file)) {
    console.warn('[septics] content/septics.json не найден — подбор собран на моделях-примерах');
    return EXAMPLES;
  }
  try {
    const json = JSON.parse(readFileSync(file, 'utf8').replace(/^﻿/, ''));
    const rows: any[] = Array.isArray(json) ? json : json.models ?? json.septics ?? json.items ?? [];
    const out: Septic[] = [];
    for (const r of rows) {
      if (!r || !BRANDS.includes(r.brand) || typeof r.model !== 'string' || typeof r.people !== 'number') {
        console.warn(`[septics] строка пропущена: ${JSON.stringify(r).slice(0, 80)}`);
        continue;
      }
      out.push({
        brand: r.brand, model: r.model.trim(), people: r.people,
        capacity: numOrNull(r.capacity), salvo: numOrNull(r.salvo),
        outlet: OUTLETS.includes(r.outlet) ? r.outlet : 'самотёк',
        highGW: r.highGW === true, dacha: r.dacha === true,
        price: numOrNull(r.price), priceDate: String(r.priceDate ?? ''), source: String(r.source ?? ''),
        url: typeof r.url === 'string' && r.url.startsWith('/') ? r.url : '/kanalizaciya/',
      });
    }
    if (!out.length) throw new Error('нет ни одной корректной модели');
    return out;
  } catch (e) {
    console.warn(`[septics] content/septics.json не прочитан (${(e as Error).message}) — подбор собран на моделях-примерах`);
    return EXAMPLES;
  }
}

export const SEPTICS: Septic[] = load();
