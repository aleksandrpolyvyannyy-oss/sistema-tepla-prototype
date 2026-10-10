// llms.txt собирается из данных страниц, чтобы адреса и цены не расходились с сайтом (раньше был статичный файл в public/).
import type { APIRoute } from 'astro';
import { allPages, href } from '../data/pages';
import { NAV, SITE, navIndexFor } from '../data/site';
import { plain } from '../lib/content';

export const GET: APIRoute = () => {
  const pages = allPages();
  const u = (path: string) => `${SITE.url}${path}`;
  const line = (p: (typeof pages)[number]) => `- [${plain(p.h1)}](${u(href(p.slug))}): ${p.priceFrom}`;
  const sections = NAV.filter((n) => n.label !== 'О компании').map((n, i) => {
    const list = pages.filter((p) => NAV[navIndexFor(href(p.slug))] === n);
    return `## ${n.label}\n${list.map(line).join('\n')}`;
  });
  const price = (slug: string) => pages.find((p) => p.slug === slug)?.priceFrom ?? '';
  const text = `# Система тепла

> Инженерные сети частного дома в Санкт-Петербурге и Ленинградской области: монтаж отопления, котельных, водяного тёплого пола и радиаторов, водоснабжение и фильтрация воды, канализация и станции очистки, первый пуск газовых котлов (разрешение есть), сервисное обслуживание систем. Смета за 24 часа после замера, цена и сроки фиксируются в договоре, гарантия на работы 3 года, оплата поэтапная.

Подключение к газу и пуск газа выполняет газораспределительная организация; компания монтирует котельную по проекту газоснабжения, выполняет первый пуск котла и его техническое обслуживание.

Ключевые цены «от» (примерные, обновлены ${SITE.pricesUpdated}): отопление — ${price('otoplenie')}; котельная — ${price('otoplenie/kotelnaya')}; тёплый пол — ${price('otoplenie/teplyj-pol')}; водоснабжение — ${price('vodosnabzhenie')}; канализация — ${price('kanalizaciya')}; запуск газового котла — ${price('zapusk-gazovyh-kotlov')}; сервис — ${price('servis')}.

${sections.join('\n\n')}

## Компания
- [Цены и прайс работ](${u('/ceny/')})
- [Объекты](${u('/obekty/')})
- [Отзывы](${u('/otzyvy/')})
- [О компании и реквизиты](${u('/o-kompanii/')})
- [Контакты](${u('/kontakty/')})
`;
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
