// Трубы для эскиза C «зигзаг»: ломаная из горизонталей и вертикалей со скруглёнными изгибами,
// как у настоящих отводов. Используется и при сборке (куски схемы), и в браузере (трубы через страницу).
export type Pt = [number, number];
// Отрезок или четверть окружности. Дуга: p(φ) = c - v·r·cos φ + u·r·sin φ, φ от 0 до π/2.
export type Prim =
  | { k: 'L'; a: Pt; b: Pt; len: number }
  | { k: 'A'; c: Pt; r: number; u: Pt; v: Pt; len: number };

const f = (n: number) => String(Math.round(n * 10) / 10);
const P = (p: Pt) => `${f(p[0])} ${f(p[1])}`;

// radius - один радиус на все изгибы или массив по номеру вершины (крайние значения не используются).
export function roundPath(pts: Pt[], radius: number | number[] = 16) {
  const n = pts.length;
  const prims: Prim[] = [];
  let d = `M${P(pts[0])}`;
  let cur: Pt = pts[0];
  let len = 0;
  const line = (b: Pt) => {
    const l = Math.abs(b[0] - cur[0]) + Math.abs(b[1] - cur[1]);
    if (l > 0.01) { prims.push({ k: 'L', a: cur, b, len: l }); d += ` L${P(b)}`; len += l; }
    cur = b;
  };
  for (let i = 1; i < n - 1; i++) {
    const A = pts[i - 1], C = pts[i], B = pts[i + 1];
    const lin = Math.hypot(C[0] - A[0], C[1] - A[1]), lout = Math.hypot(B[0] - C[0], B[1] - C[1]);
    if (lin < 0.01 || lout < 0.01) continue;
    const u: Pt = [(C[0] - A[0]) / lin, (C[1] - A[1]) / lin];
    const v: Pt = [(B[0] - C[0]) / lout, (B[1] - C[1]) / lout];
    const cr = u[0] * v[1] - u[1] * v[0];
    if (Math.abs(cr) < 1e-6) continue;
    const R = Array.isArray(radius) ? (radius[i] ?? 16) : radius;
    const r = Math.max(0, Math.min(R, i === 1 ? lin : lin / 2, i === n - 2 ? lout : lout / 2));
    const T1: Pt = [C[0] - u[0] * r, C[1] - u[1] * r];
    const T2: Pt = [C[0] + v[0] * r, C[1] + v[1] * r];
    line(T1);
    if (r > 0.01) {
      d += ` A${f(r)} ${f(r)} 0 0 ${cr > 0 ? 1 : 0} ${P(T2)}`;
      const l = (Math.PI * r) / 2;
      prims.push({ k: 'A', c: [C[0] - u[0] * r + v[0] * r, C[1] - u[1] * r + v[1] * r], r, u, v, len: l });
      len += l;
    }
    cur = T2;
  }
  line(pts[n - 1]);
  return { d, prims, len };
}

// Точки вдоль трубы с шагом step: [длина от начала, x, y].
export function samples(prims: Prim[], step = 6): [number, number, number][] {
  const out: [number, number, number][] = [];
  let L = 0;
  for (const p of prims) {
    const k = Math.max(1, Math.ceil(p.len / step));
    for (let i = out.length ? 1 : 0; i <= k; i++) {
      const t = i / k;
      if (p.k === 'L') out.push([L + p.len * t, p.a[0] + (p.b[0] - p.a[0]) * t, p.a[1] + (p.b[1] - p.a[1]) * t]);
      else {
        const ph = (t * Math.PI) / 2, c = Math.cos(ph), s = Math.sin(ph);
        out.push([L + p.len * t, p.c[0] - p.v[0] * p.r * c + p.u[0] * p.r * s, p.c[1] - p.v[1] * p.r * c + p.u[1] * p.r * s]);
      }
    }
    L += p.len;
  }
  return out;
}
