// Порт генератора знака «Термостат» из логотип/logo6.js
const N = '#1E3A5F', O = '#E8662A', RD = '#E2452B', BL = '#2B6CD9', AM = '#F2A23A', W = '#fff';
type Pal = Record<string, any>;
export const PAL: Record<string, Pal> = {
  full: { ring: '#E3E8EF', face: W, tick: '#9AA7B8', grad: [BL, AM, RD], kf: W, ks: RD, disk: N, roof: O, house: W, door: O, deg: N },
  white: { ring: 'rgba(255,255,255,.35)', face: 'none', tick: 'rgba(255,255,255,.6)', solid: W, kf: N, ks: W, disk: W, roof: N, house: N, door: W, deg: W },
  onDark: { ring: 'rgba(255,255,255,.18)', face: 'none', tick: 'rgba(255,255,255,.55)', grad: [BL, AM, RD], kf: W, ks: RD, disk: W, roof: O, house: N, door: O, deg: W },
};
let uid = 0;
const P = (a: number, r: number) => [+(100 + r * Math.cos((a * Math.PI) / 180)).toFixed(2), +(100 + r * Math.sin((a * Math.PI) / 180)).toFixed(2)];
export function logoSvg(attrs = '', p: Pal = PAL.full, deg = true): string {
  const u = 'l6g' + uid++;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" ${attrs}>`;
  if (p.grad) s += `<defs><linearGradient id="${u}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${p.grad[0]}"/><stop offset=".5" stop-color="${p.grad[1]}"/><stop offset="1" stop-color="${p.grad[2]}"/></linearGradient></defs>`;
  s += `<circle cx="100" cy="100" r="92" fill="${p.face}" stroke="${p.ring}" stroke-width="2"/>`;
  for (let i = 0; i <= 27; i++) {
    const a = 135 + i * 10, [x1, y1] = P(a, i % 3 ? 84 : 80), [x2, y2] = P(a, 88);
    s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${p.tick}" stroke-width="${i % 3 ? 1.5 : 2.5}" stroke-linecap="round"/>`;
  }
  s += `<path d="M50.5 149.5 A70 70 0 1 1 149.5 149.5" fill="none" stroke="${p.grad ? `url(#${u})` : p.solid}" stroke-width="14" stroke-linecap="round"/>`;
  s += `<circle cx="149.5" cy="149.5" r="11" fill="${p.kf}" stroke="${p.ks}" stroke-width="5"/>`;
  s += `<circle cx="100" cy="100" r="48" fill="${p.disk}"/>`;
  s += `<path d="M70 104 L100 78 L130 104" fill="none" stroke="${p.roof}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<path d="M78 100 V126 H122 V100 L100 82 Z" fill="${p.house}"/>`;
  s += `<rect x="94" y="108" width="12" height="18" rx="2" fill="${p.door}"/>`;
  if (deg) s += `<text x="100" y="170" text-anchor="middle" font-family="Montserrat,Arial,sans-serif" font-weight="800" font-size="15" fill="${p.deg}">22°</text>`;
  return s + '</svg>';
}
