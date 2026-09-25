// Сквозные данные компании. Всё, что помечено «заглушка», заменяется реальными сведениями перед запуском.
export const SITE = {
  name: 'Система тепла',
  legalName: 'ООО «Система тепла»', // заглушка
  tagline: 'Монтаж и автоматика отопления',
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
  pricesUpdated: '25.09.2026',
  prototypeNote: 'Прототип. Фото объектов — до финальной обработки.',
};

export type NavLink = { href: string; label: string; note?: string };
export type NavItem = { label: string; href?: string; children?: NavLink[] };

export const NAV: NavItem[] = [
  {
    label: 'Отопление',
    children: [
      { href: '/otoplenie/', label: 'Монтаж отопления под ключ', note: 'весь раздел' },
      { href: '/otoplenie/kotelnaya/', label: 'Котельная под ключ' },
      { href: '/otoplenie/kotelnaya/ustanovka-gazovogo-kotla/', label: 'Установка газового котла' },
      { href: '/otoplenie/teplyj-pol/', label: 'Водяной тёплый пол' },
      { href: '/otoplenie/radiatory/', label: 'Монтаж радиаторов' },
      { href: '/otoplenie/gazovoe/', label: 'Газовое отопление' },
      { href: '/otoplenie/bez-gaza/', label: 'Отопление без газа' },
      { href: '/otoplenie/leningradskaya-oblast/', label: 'Отопление в Ленобласти' },
    ],
  },
  {
    label: 'Внутренние сети',
    children: [
      { href: '/vnutrennie-seti/', label: 'Вода и канализация по дому', note: 'весь раздел' },
      { href: '/vnutrennie-seti/razvodka-vody/', label: 'Разводка воды' },
      { href: '/vnutrennie-seti/vnutrennyaya-kanalizaciya/', label: 'Внутренняя канализация' },
      { href: '/kompleks-pod-klyuch/', label: 'Отопление и вода под ключ' },
    ],
  },
  {
    label: 'Запуск отопления',
    children: [
      { href: '/zapusk-otopleniya/', label: 'Запуск и наладка отопления', note: 'весь раздел' },
      { href: '/zapusk-otopleniya/pusk-gazovogo-kotla/', label: 'Первый пуск газового котла' },
      { href: '/zapusk-otopleniya/opressovka/', label: 'Опрессовка системы' },
      { href: '/zapusk-otopleniya/balansirovka/', label: 'Балансировка и настройка' },
    ],
  },
  { label: 'Канализация / ЛОС / септик', href: '/kanalizaciya/' },
  { label: 'Водоснабжение', href: '/naruzhnoe-vodosnabzhenie/' },
  { label: 'Отмостка / дренаж', href: '/drenazh-i-vodootvod/' },
  { label: 'Цены', href: '/ceny/' },
  { label: 'Объекты', href: '/obekty/' },
  { label: 'О компании', href: '/o-kompanii/' },
];

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
