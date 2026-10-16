// Данные для эскизов стиля (/eskiz/a/, /eskiz/b/): одна и та же информация страницы
// «Водяной тёплый пол» из content/otoplenie__teplyj-pol.json, урезанная и разложенная по шести разделам.
// Тексты не придумываем: только перегруппировка. Знак рубля заменяем на «руб.», длинные тире на дефис.
import raw from '../../content/otoplenie__teplyj-pol.json';
import { OBJECTS } from '../data/objects';
import { PHOTOS, PHOTO_ALT } from './photos';

// Типографика: число не отрывается от единицы (неразрывный пробел), диапазон «1-2» не рвётся на строки.
export const clean = (s: string) =>
  s.replace(/\s*₽/g, ' руб.').replace(/[—–]/g, '-').replace(/\s+/g, ' ').trim()
    .replace(/(\d) (?=(м²|м|мм|°C|бар|дн|руб|тыс|контур|шт))/g, '$1\u00a0')
    .replace(/(\d) (\d{3})\b/g, '$1\u00a0$2')
    .replace(/(\d)-(\d)/g, '$1\u2060-\u2060$2');

const sec = (id: string) => raw.sections.find((s) => s.id === id)!;
const paras = (id: string) => sec(id).paragraphs.map(clean);

// Цены за м² (из answer/priceFrom): работа и с материалами, без стяжки.
export const RATE_WORK = 700;
export const RATE_FULL = 2400;

export const ESKIZ = {
  title: 'Водяной тёплый пол: монтаж и цена за м² в СПб и ЛО',
  description: clean(raw.description),
  h1: raw.h1,
  area: 'Монтаж в Санкт-Петербурге и Ленинградской области',
  offer: clean(raw.offer),
  answer: clean(raw.answer),
  intro: raw.intro.map(clean),
  // 01 Что делаем: коротко по пунктам, полный текст раздела свёрнут в «Подробнее».
  what: ([
    { t: 'Раскладка трубы', d: 'Шаг 150 мм в комнатах, 100 мм у наружных стен и в санузлах. Контур не длиннее 90 м.', more: paras('kak-ukladyvaem') },
    { t: 'Коллектор и смесительный узел', d: 'Расходомер на каждую петлю. Смеситель держит воду в полу 35-45 °C.', more: paras('kollektory') },
    { t: 'Опрессовка и запуск', d: '6 бар до стяжки, давление держим на время заливки. Прогреваем плавно.', more: paras('stazhka') },
    { t: 'Фотоотчёт по слоям', d: 'Снимаем каждый слой, пока пол открыт. Фото передаём вместе с актами.', more: paras('sloi') },
    { t: 'Автоматика', d: 'Термостат в комнате и привод на коллекторе: пол греется по расписанию.', more: paras('avtomatika') },
  ]).map((w) => ({ ...w, d: clean(w.d) })),
  notFor: {
    t: sec('kogda-ne-podhodit').h2,
    lead: clean(sec('kogda-ne-podhodit').paragraphs[0]),
    list: (sec('kogda-ne-podhodit').list ?? []).map(clean),
    after: (sec('kogda-ne-podhodit').after ?? []).map(clean),
  },
  // 02 Цены
  priceMain: [
    { v: clean(`от ${RATE_WORK} руб./м²`), n: 'работа' },
    { v: clean('от 2 400 руб./м²'), n: 'с материалами, без стяжки' },
  ],
  included: raw.included.map(clean),
  prices: raw.prices.map(([n, u, p]) => [clean(n), u, clean(p)] as [string, string, string]),
  // 03 Как работаем
  speed: clean('Бригада укладывает 100 м² за 3-5 дней.'),
  steps: raw.steps.map((s) => ({ t: clean(s.title), d: clean(s.text) })),
  // 05 Вопросы
  faq: raw.faq.map((f) => ({ q: clean(f.q), a: clean(f.a) })),
  updated: raw.updated,
};

// 04 Объекты: фото с объектов и карточка объекта из data/objects.ts.
const o = OBJECTS.find((x) => x.slug === 'teplyj-pol-dom-210-gatchina')!;
export const OBJ = {
  href: `/obekty/${o.slug}/`,
  title: clean(o.title),
  place: o.place,
  facts: [
    { n: 'Площадь', v: `${o.area} м²` },
    { n: 'Срок', v: clean(o.term) },
    { n: 'Бюджет', v: clean(o.budget) },
  ],
  text: clean(o.task[1] ?? o.task[0]),
};

export const photo = (id: string) => ({ src: PHOTOS[id], alt: PHOTO_ALT[id] });
export const HERO = photo('s37');
export const GALLERY = ['s22', 's06', 's24', 's36', 's31'].map(photo);

// Разделы страницы: номер и название одинаковые в обоих вариантах.
export const SECTIONS = [
  { n: '01', id: 'chto-delaem', t: 'Что делаем' },
  { n: '02', id: 'ceny', t: 'Цены' },
  { n: '03', id: 'kak-rabotaem', t: 'Как работаем' },
  { n: '04', id: 'obekty', t: 'Объекты' },
  { n: '05', id: 'voprosy', t: 'Вопросы' },
  { n: '06', id: 'zayavka', t: 'Заявка' },
];

// Шкала по разделам: синий → янтарный → оранжевый → красный ступенями, как деления термостата.
// Синий и янтарный не смешиваем плавно: их середина получается серой (это и давало «грязь»).
export const SCALE6 = ['#1F57C3', '#2B6CD9', '#F2A23A', '#EE8432', '#E8662A', '#E2452B'];
