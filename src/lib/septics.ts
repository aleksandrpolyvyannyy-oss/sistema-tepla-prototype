// Логика блока «Подбор станции» (PRAVKI-V2.md, п. 3а). Данные моделей — в src/data/septics.ts (их наполняет автор).
// Три фильтра: число жильцов, режим проживания, грунтовые воды. Значения фильтров — это ещё и адреса посадочных страниц:
// чип фильтра на странице — обычная ссылка, которую видит поисковик; скрипт перехватывает клик и фильтрует на месте.
import * as data from '../data/septics';
import type { Septic } from '../data/septics';

export type { Septic };
// Автор может назвать экспорт по-своему — берём SEPTICS, septics, default или первый экспортированный массив.
const d = data as Record<string, unknown>;
const raw = (d.SEPTICS ?? d.septics ?? d.default ?? Object.values(d).find(Array.isArray) ?? []) as Septic[];

export type PeopleKey = '3' | '4-5' | '6-8' | '10';
export type ModeKey = 'dom' | 'dacha';
export type GwKey = 'low' | 'high';
export type PickerFilter = { people?: PeopleKey; mode?: ModeKey; gw?: GwKey };

export const HUB = '/kanalizaciya/';
export const PICKER_ID = 'podbor';
/** Цена монтажа станции «от», ₽ — одна для всех моделей, уточняется сметой. */
export const MONTAGE_FROM = 38000;
/** Сколько карточек показываем сразу; остальные — по кнопке «Показать ещё». */
export const PICKER_LIMIT = 6;

export const PEOPLE: { key: PeopleKey; label: string; long: string; min: number; max: number; href: string }[] = [
  { key: '3', label: 'до 3', long: 'до 3 человек', min: 0, max: 3, href: '/kanalizaciya/na-3-cheloveka/' },
  { key: '4-5', label: '4–5', long: '4–5 человек', min: 4, max: 5, href: '/kanalizaciya/na-4-5-chelovek/' },
  { key: '6-8', label: '6–8', long: '6–8 человек', min: 6, max: 8, href: '/kanalizaciya/na-6-8-chelovek/' },
  { key: '10', label: '10 и больше', long: '10 человек и больше', min: 9, max: 9999, href: '/kanalizaciya/na-10-chelovek/' },
];
export const MODE: { key: ModeKey; label: string; href: string }[] = [
  { key: 'dom', label: 'постоянно', href: '/kanalizaciya/dlya-chastnogo-doma/' },
  { key: 'dacha', label: 'дача, наездами', href: '/kanalizaciya/dlya-dachi/' },
];
// У значения «низко» своей посадочной нет: ссылка ведёт на общий подбор.
export const GW: { key: GwKey; label: string; href: string }[] = [
  { key: 'low', label: 'низко', href: `${HUB}#${PICKER_ID}` },
  { key: 'high', label: 'высоко / не знаю', href: '/kanalizaciya/vysokie-gruntovye-vody/' },
];

export const peopleKey = (n: number): PeopleKey => PEOPLE.find((p) => n >= p.min && n <= p.max)?.key ?? '10';

export function matches(s: Septic, f: PickerFilter): boolean {
  if (f.people && peopleKey(s.people) !== f.people) return false;
  if (f.mode === 'dacha' && !s.dacha) return false;
  if (f.gw === 'high' && !s.highGW) return false;
  return true;
}

/** Все модели по возрастанию цены; модели без цены — в конце. */
export const SEPTICS: Septic[] = [...raw].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity) || a.people - b.people);
export const pick = (f: PickerFilter = {}) => SEPTICS.filter((s) => matches(s, f));
export const minPrice = (list: Septic[]) => list.reduce<number | null>((m, s) => (s.price != null && (m == null || s.price < m) ? s.price : m), null);
export const priceDate = () => raw.map((s) => s.priceDate).filter(Boolean).sort((a, b) => b.split('.').reverse().join('').localeCompare(a.split('.').reverse().join('')))[0] ?? '';

/** Полное название для таблиц: «Юнилос Астра 5», «Евролос БИО 5», «Топас 4 Пр». */
export function fullName(s: Septic) {
  const words = s.brand.split(' ');
  const rest = s.model.split(' ').filter((w) => !words.includes(w)).join(' ');
  return `${s.brand} ${rest}`.trim();
}

/** Короткие факты о линейке бренда для плитки и первого экрана: считаются из данных моделей. */
export function brandFacts(brand: Septic['brand']): [string, string][] {
  const list = SEPTICS.filter((s) => s.brand === brand);
  if (!list.length) return [];
  const ppl = list.map((s) => s.people);
  const caps = list.map((s) => s.capacity).filter((n): n is number => n != null);
  const f = (n: number) => String(n).replace('.', ',');
  return [
    ['Для кого', `семья от ${Math.min(...ppl)} до ${Math.max(...ppl)} человек`],
    ['Производительность', caps.length ? `${f(Math.min(...caps))}–${f(Math.max(...caps))} м³ в сутки` : 'уточняем'],
    ['Цена станции', rub(minPrice(list))],
  ];
}
export const brandPrice = (brand: Septic['brand']) => minPrice(SEPTICS.filter((s) => s.brand === brand));

export const rub = (n: number | null | undefined) => (n == null ? 'уточняем' : `от ${n.toLocaleString('ru-RU').replace(/ | /g, ' ')} ₽`);
export const num = (n: number | null | undefined, unit: string) => (n == null ? 'уточняем' : `${String(n).replace('.', ',')} ${unit}`);
export const outletText = (o: Septic['outlet']) => (o === 'оба' ? 'самотёк или принудительный' : o);
export function modelsWord(n: number) {
  const a = n % 10, b = n % 100;
  if (a === 1 && b !== 11) return 'модель';
  if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return 'модели';
  return 'моделей';
}
export const fitWord = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? 'Подходит' : 'Подходят');
