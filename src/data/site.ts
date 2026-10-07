// Сквозные данные компании. Всё, что помечено «заглушка», заменяется реальными сведениями перед запуском.
export const SITE = {
  name: 'Система тепла',
  legalName: 'ООО «Система тепла»', // заглушка
  tagline: 'Инженерные сети',
  url: 'https://sistema-tepla.ru', // заглушка
  phone: '+7 (812) 000-00-00',
  phoneHref: 'tel:+78120000000',
  email: 'info@sistema-tepla.ru', // заглушка
  max: '#', // ссылка на MAX — появится после регистрации
  vk: '#',
  hours: 'Пн–Сб 9:00–20:00',
  hoursSchema: ['Mo-Sa 09:00-20:00'],
  address: 'Санкт-Петербург, ул. Примерная, д. 1, офис 1', // заглушка
  city: 'Санкт-Петербург',
  ogrn: '0000000000000', // заглушка
  inn: '7800000000', // заглушка
  kpp: '780000000', // заглушка
  area: 'Санкт-Петербург и Ленинградская область',
  pricesUpdated: '07.10.2026',
  prototypeNote: 'Прототип. Фото объектов — до финальной обработки.',
};

export type NavLink = { href: string; label: string; note?: string };
// match — префиксы адресов, которые относятся к вкладке (в т. ч. SEO-страницы вне меню): по ним подсвечивается вкладка.
// children — обычный выпадающий список; groups — компактный блок в несколько колонок с кнопкой cta (вкладка «Канализация»).
export type NavGroup = { title: string; links: NavLink[] };
export type NavItem = { label: string; href?: string; children?: NavLink[]; groups?: NavGroup[]; cta?: NavLink; match: string[] };

// Основное меню (PRAVKI-V2.md, п. 1–2). Порядок вкладок менять нельзя.
export const NAV: NavItem[] = [
  {
    label: 'Отопление', match: ['/otoplenie/', '/otoplenie-i-vodosnabzhenie/'],
    children: [
      { href: '/otoplenie/', label: 'Отопление частного дома', note: 'весь раздел' },
      { href: '/otoplenie/kotelnaya/', label: 'Котельная' },
      { href: '/otoplenie/teplyj-pol/', label: 'Тёплые полы' },
      { href: '/otoplenie/radiatory/', label: 'Радиаторы' },
      { href: '/otoplenie/avtomatika/', label: 'Автоматика' },
    ],
  },
  {
    label: 'Водоснабжение', match: ['/vodosnabzhenie/'],
    children: [
      { href: '/vodosnabzhenie/', label: 'Водоснабжение дома', note: 'весь раздел' },
      { href: '/vodosnabzhenie/vnutrennee/', label: 'Внутреннее водоснабжение и водоотведение' },
      { href: '/vodosnabzhenie/naruzhnoe/', label: 'Наружное водоснабжение' },
      { href: '/vodosnabzhenie/filtraciya/', label: 'Система фильтрации' },
    ],
  },
  {
    // PRAVKI-V2.md, п. 3а: компактный блок в 3 короткие колонки + кнопка «Подобрать станцию», без мега-меню.
    label: 'Канализация', href: '/kanalizaciya/', match: ['/kanalizaciya/'],
    groups: [
      { title: 'Производитель', links: [
        { href: '/kanalizaciya/yunilos-astra/', label: 'Юнилос Астра' },
        { href: '/kanalizaciya/topas/', label: 'Топас' },
        { href: '/kanalizaciya/evrolos/', label: 'Евролос' },
      ] },
      { title: 'Число жильцов', links: [
        { href: '/kanalizaciya/na-3-cheloveka/', label: 'До 3 человек' },
        { href: '/kanalizaciya/na-4-5-chelovek/', label: '4–5 человек' },
        { href: '/kanalizaciya/na-6-8-chelovek/', label: '6–8 человек' },
        { href: '/kanalizaciya/na-10-chelovek/', label: '10 и больше' },
      ] },
      { title: 'Условия', links: [
        { href: '/kanalizaciya/dlya-chastnogo-doma/', label: 'Для частного дома' },
        { href: '/kanalizaciya/dlya-dachi/', label: 'Для дачи' },
        { href: '/kanalizaciya/vysokie-gruntovye-vody/', label: 'Высокие грунтовые воды' },
      ] },
    ],
    cta: { href: '/kanalizaciya/#podbor', label: 'Подобрать станцию' },
  },
  { label: 'Запуск газовых котлов', href: '/zapusk-gazovyh-kotlov/', match: ['/zapusk-gazovyh-kotlov/'] },
  {
    label: 'Сервис', match: ['/servis/'],
    children: [
      { href: '/servis/', label: 'Сервисное обслуживание', note: 'весь раздел' },
      { href: '/servis/obsluzhivanie-kotelnyh/', label: 'Обслуживание котельных' },
      { href: '/servis/obsluzhivanie-vodosnabzheniya/', label: 'Обслуживание водоснабжения' },
      { href: '/servis/obsluzhivanie-otopleniya/', label: 'Обслуживание систем отопления' },
      { href: '/servis/obsluzhivanie-septikov/', label: 'Обслуживание септиков' },
    ],
  },
  { label: 'О компании', href: '/o-kompanii/', match: ['/o-kompanii/'] },
];

// Страницы вне основного меню: верхняя тонкая строка, низ мобильного меню и подвал.
export const TOP_LINKS: NavLink[] = [
  { href: '/ceny/', label: 'Цены' },
  { href: '/obekty/', label: 'Объекты' },
  { href: '/otzyvy/', label: 'Отзывы' },
  { href: '/kontakty/', label: 'Контакты' },
];

// Адрес страницы без префикса подпапки (сборка под GitHub Pages идёт с BASE_PATH).
export function cleanPath(pathname: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  let p = base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  if (!p.startsWith('/')) p = '/' + p;
  if (!p.endsWith('/') && !/\.[a-z0-9]+$/i.test(p)) p += '/';
  return p;
}
export const inSection = (path: string, prefix: string) => path === prefix || path.startsWith(prefix);
export const navIndexFor = (path: string) => NAV.findIndex((n) => n.match.some((m) => inSection(path, m)));

export const LEGAL: NavLink[] = [
  { href: '/politika-pdn/', label: 'Политика обработки персональных данных' },
  { href: '/soglasie-pdn/', label: 'Согласие на обработку персональных данных' },
  { href: '/soglasie-na-rassylku/', label: 'Согласие на получение рассылки' },
  { href: '/cookie/', label: 'Политика cookie' },
  { href: '/polzovatelskoe-soglashenie/', label: 'Пользовательское соглашение' },
];

export const GEO_AREAS = [
  'Всеволожский район', 'Гатчинский район', 'Ломоносовский район', 'Тосненский район',
  'Выборгский район', 'Приозерский район', 'Кировский район', 'Курортный район СПб', 'Пушкинский район СПб',
];
