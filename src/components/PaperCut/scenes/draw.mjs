/**
 * draw.mjs — the drawing kit for scenes drawn from scratch as code (no tracing).
 *
 * Every helper returns an SVG string in the scene's own coordinates (the source artboard,
 * e.g. 1200 × 837 for the hero). The house style, from DESIGN.md's imagery rules:
 *   - flat fills, no gradients, no shadows, no outlines around shapes;
 *   - the only lines are dark detail strokes (folds, creases, glyphs) with round caps;
 *   - limbs are thick round-capped strokes, so a joint is a clean circle and an arm can turn
 *     at the shoulder and the elbow without ever showing a seam.
 * Moving pieces are wrapped in part(): <g class="pt-<id>">, nested the way they hang
 * (shoulder → elbow → hand), which the PaperCut engine animates.
 */

const f = (n) => +n.toFixed(1);

/** Catmull-Rom spline through points → path data (open or closed). */
export function spline(pts, closed = false, tension = 1) {
  const n = pts.length;
  if (n < 2) return '';
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  if (n === 2 && !closed) return `${d}L${f(pts[1][0])},${f(pts[1][1])}`;
  const t = tension / 6;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = pts[closed ? (i - 1 + n) % n : Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[closed ? (i + 1) % n : i + 1];
    const p3 = pts[closed ? (i + 2) % n : Math.min(i + 2, n - 1)];
    d += `C${f(p1[0] + (p2[0] - p0[0]) * t)},${f(p1[1] + (p2[1] - p0[1]) * t)} ${f(p2[0] - (p3[0] - p1[0]) * t)},${f(p2[1] - (p3[1] - p1[1]) * t)} ${f(p2[0])},${f(p2[1])}`;
  }
  return closed ? `${d}Z` : d;
}

/** A filled soft shape through points (closed spline). */
export const blob = (pts, fill, tension = 1) => `<path d="${spline(pts, true, tension)}" fill="${fill}"/>`;

/** A straight-sided polygon. */
export const poly = (pts, fill) => `<path d="M${pts.map(([x, y]) => `${f(x)},${f(y)}`).join('L')}Z" fill="${fill}"/>`;

/** A thick round-capped stroke along points: limbs, rails, glyphs. */
export const stroke = (pts, color, width) =>
  `<path d="${spline(pts)}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;

/** A rounded rectangle, optionally turned `rot` degrees about its centre. */
export function card(cx, cy, w, h, r, fill, rot = 0) {
  return `<rect x="${f(cx - w / 2)}" y="${f(cy - h / 2)}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : ''}/>`;
}

export const circle = (cx, cy, r, fill) => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${r}" fill="${fill}"/>`;
export const ellipse = (cx, cy, rx, ry, fill, rot = 0) =>
  `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${rx}" ry="${ry}" fill="${fill}"${rot ? ` transform="rotate(${rot} ${f(cx)} ${f(cy)})"` : ''}/>`;

/** A moving piece. Children are strings; ids become classes the engine finds. */
export const part = (id, ...children) => `<g class="pt-${id}">${children.join('')}</g>`;

/** Rotate a point about a centre. */
export function turn([x, y], [cx, cy], deg) {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c];
}

/**
 * A mitten hand at (x, y) pointing along `deg` (0 = right), `size` ≈ palm radius: a palm,
 * three finger lobes and a thumb on the `thumb` side (1 or -1).
 */
export function hand(x, y, deg, skin, size = 16, thumb = -1, open = 1) {
  const P = (dx, dy) => turn([x + dx, y + dy], [x, y], deg);
  const parts = [ellipse(x, y, size * 1.05, size * 0.92, skin, deg)];
  for (let i = -1; i <= 1; i++) {
    const [fx, fy] = P(size * (0.9 + 0.35 * open), i * size * 0.52 * (0.8 + 0.4 * open));
    parts.push(`<path d="${spline([P(size * 0.3, i * size * 0.45), [fx, fy]])}" fill="none" stroke="${skin}" stroke-width="${f(size * 0.55)}" stroke-linecap="round"/>`);
  }
  const [tx, ty] = P(size * 0.55, thumb * size * 1.05 * (0.7 + 0.3 * open));
  parts.push(`<path d="${spline([P(0, thumb * size * 0.4), [tx, ty]])}" fill="none" stroke="${skin}" stroke-width="${f(size * 0.55)}" stroke-linecap="round"/>`);
  return parts.join('');
}

/** A rounded shoe at (x, y) (the ankle), toe pointing along `deg`. */
export function shoe(x, y, deg, fill, len = 52, h = 24) {
  const P = (dx, dy) => turn([x + dx, y + dy], [x, y], deg);
  return blob([P(-10, -h * 0.55), P(len * 0.45, -h * 0.5), P(len, -h * 0.05), P(len * 0.92, h * 0.5), P(len * 0.2, h * 0.55), P(-14, h * 0.4)], fill, 0.9);
}

/**
 * A head in profile: face, nose and ear, an eye (its own part `<who>-eye`, for blinks) and a
 * smile, facing `dir` (1 right, -1 left). `hair.back` paints behind the face, `hair.cap` (a
 * colour) adds a crown of hair over its top and back, `hair.front` paints over it; `extra`
 * lands on top (brows). The whole head is part `<who>-head`.
 */
export function profileHead(who, cx, cy, rx, ry, skin, dir, ink, hair = {}, { smile = 1, extra = '', eyes = 1 } = {}) {
  const ex = cx + dir * rx * 0.42, ey = cy - ry * 0.14;
  const eyeDots = eyes === 2
    ? circle(ex, ey, rx * 0.1, ink) + circle(ex + dir * rx * 0.36, ey + ry * 0.02, rx * 0.09, ink)
    : circle(ex, ey, rx * 0.11, ink);
  // hair.cap: a crown of hair over the top and back of the head, seen from the side
  const cap = hair.cap
    ? blob([[150, 1.12], [118, 1.12], [90, 1.14], [55, 1.1], [22, 1.0], [30, 0.72], [70, 0.62], [120, 0.66], [160, 0.86]].map(([deg, k]) => {
        const a = (deg * Math.PI) / 180;
        return [cx + dir * Math.cos(a) * rx * k, cy - Math.sin(a) * ry * k];
      }), hair.cap)
    : '';
  const mouth = [[cx + dir * rx * 0.28, cy + ry * 0.38], [cx + dir * rx * 0.46, cy + ry * (0.38 + 0.13 * smile)], [cx + dir * rx * 0.66, cy + ry * 0.38]];
  return part(
    `${who}-head`,
    hair.back || '',
    ellipse(cx, cy, rx, ry, skin),
    circle(cx + dir * rx * 0.92, cy + ry * 0.08, rx * 0.26, skin), // nose
    circle(cx - dir * rx * 0.55, cy + ry * 0.05, rx * 0.22, skin), // ear
    cap,
    hair.front || '',
    part(`${who}-eye`, eyeDots),
    stroke(mouth, ink, Math.max(3.5, rx * 0.12)),
    extra,
  );
}

/** A four-pointed sparkle star centred on (cx, cy), radius r. */
export function star4(cx, cy, r, fill, deg = 0) {
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const a = ((i * 45 + deg) * Math.PI) / 180 - Math.PI / 2;
    const rr = i % 2 ? r * 0.26 : r;
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return blob(pts, fill, 0.45);
}

/** A folded paper plane flying along `deg`, length `len`: two wings and a darker fold. */
export function plane(cx, cy, len, fill, fold, deg = -30) {
  const P = (dx, dy) => turn([cx + dx, cy + dy], [cx, cy], deg);
  return poly([P(len * 0.5, 0), P(-len * 0.5, -len * 0.32), P(-len * 0.22, 0), P(-len * 0.5, len * 0.12)], fill) +
    poly([P(len * 0.5, 0), P(-len * 0.22, 0), P(-len * 0.32, len * 0.28)], fold);
}

/** Wrap everything in the scene's <svg>. */
export const svg = (w, h, body, label = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" data-k="1"${label ? ` role="img" aria-label="${label}"` : ''}>${body}</svg>`;
