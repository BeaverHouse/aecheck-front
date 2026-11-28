/**
 * Style-grid screenshot -> AE Check character ids, by portrait matching. No dependencies.
 * Contributed by GGobugiTheSquirtle under the MIT licence:
 * https://github.com/BeaverHouse/aecheck-front/issues/79
 *
 * The in-game Menu > Records > Styles grid shows the same art as `${CDN}/character/<id>.png`.
 * Once a screenshot is resized to 720 px high, a portrait is that image scaled to 104 px wide.
 * Each cell's centre (60x50, away from the Lv crown / stellar gem / "!" corner badges) is matched
 * against every character image by normalised cross-correlation (= OpenCV TM_CCOEFF_NORMED, colour).
 *
 * A full-size search of all 508 images at every position is too slow in plain JS, so:
 *   1. half resolution, every position, every image -> best TOP_K characters
 *   2. full resolution, a few pixels around the stage-1 position -> the exact score
 *   3. within one screenshot every portrait sits at nearly the same place (measured ±1 px per row /
 *      column), so after one sure cell the others search stage 1 only around it.
 *
 * Thresholds come from an OpenCV reference (2026-11-21): lowest correct score 0.451, the cells below
 * 0.45 were ★3 free allies AE Check does not list, hence 0.45-0.5 = "ask the user".
 * This file matched that reference cell by cell (Node 24 and Chrome 157): same id on every cell >= 0.45
 * (303 labeled cells, 175 phone-screenshot cells), scores within 0.019.
 *
 * Owned or not: the grid lists every style and draws the ones you do not own dimmed.
 * `owned` reads that from the portrait's highlights (owned cells >= 181, dimmed <= 121 measured).
 * A dimmed cell's id can be wrong (similar art); that does not matter, only owned cells get checked.
 *
 * Measured with test/ (30 screenshots of one account covering all 385 slots, 570 cells; answers read
 * per slot from the name panel), Chrome 157 on a desktop:
 *   - owned/dimmed 570/570
 *   - cells to add (status "ok" and owned) 449, wrong id 1 (score 0.502)
 *   - owned cells not added: 5 (3 "ask", 2 below 0.45)
 *   - bank (508 fetches + build) about 5-7 s; 0.3-0.45 s per cell, a screenshot's first cell
 *     (full search) 1.2-1.5 s. Phones not measured. Run it in a Web Worker; createImageBitmap,
 *     OffscreenCanvas and fetch all work there.
 *
 * Limits: ★4 and ★5 share the art, so a ☆4 entry is reported as its NS id
 * (feed the ids through the same path as addSingleInven, which also checks ☆4).
 * Corner badges are not read: stellar awakening, manifest and ★4/★5 stay unknown.
 */

export const ACCEPT_SCORE = 0.5;
export const ASK_SCORE = 0.45;

const SHOT_HEIGHT = 720; // screenshots are normalised to this height
const PITCH = 128.6; // grid cell pitch at that height
const BANK_WIDTH = 104; // AE Check image width that matches the in-game portrait
const CELL = 120; // cell crop size
const PATCH = { x0: 30, y0: 35, x1: 90, y1: 85 }; // centre patch inside the cell crop
const HALF_PATCH = { x0: 15, y0: 17, x1: 45, y1: 42 }; // the same patch on the half-size crop
const TOP_K = 32; // stage-1 survivors (the right answer ranked 12th at worst)
const REFINE = 3; // stage-2 search radius in full-size pixels
const NEAR = 3; // stage-1 search radius (half-size pixels) once a screenshot has a sure cell
const SURE_SCORE = 0.6; // a cell this sure sets that position
const OWNED_MIN = 150; // highlight() at or above = drawn normally = owned (measured: owned >= 181, unowned <= 121)
// Art shared by characters AE Check does not list. A cell matching it is asked, never added:
// the seven ★3 armoured knights (나토레, 닉사, 에무스, 에스타, 이시스, 크토스, 톰) are palette swaps of
// 브리아 ☆4 and score 0.74-0.82 against it (the real 브리아: 0.72-0.79). Colour checks did not separate
// the silver ones from the real one. In the 175 phone-screenshot cells, 7 knights had been read as 브리아.
const ASK_ALWAYS = new Set(["char0228"]);
// PNG as measured (508 images, about 20 MB). WebP (about 5 MB, what the site already shows) gave the
// same ids on every cell, but scores about 0.01 lower: the lowest correct score fell to 0.443 (< ASK_SCORE).
const IMAGE_EXT = "png";

/** 4 bytes per pixel, like ImageData. */
export interface RGBAImage {
  width: number;
  height: number;
  data: Uint8ClampedArray | Uint8Array;
}

/** 3 bytes per pixel. */
interface RGBImage {
  width: number;
  height: number;
  data: Uint8Array;
}

interface BankEntry {
  id: string;
  group: string; // NS id for a ☆4 entry (same art), otherwise id
  full: RGBImage;
  half: { width: number; height: number; data: Float32Array };
  halfVar: Float64Array; // window variance term for every stage-1 position
}

export interface PortraitBank {
  entries: BankEntry[];
}

export interface CellMatch {
  row: number;
  col: number;
  id: string; // best AE Check id (NS id for ☆4)
  score: number;
  status: "ok" | "ask" | "none";
  x: number; // cell centre in the screenshot's pixels
  y: number;
  /** highlight luma 0-255 of the portrait; the game dims styles you do not own */
  brightness: number;
  owned: boolean; // not dimmed. Only owned cells should be checked.
  candidates: { id: string; score: number }[];
}

// ---------------------------------------------------------------------------------------------
// Image helpers (pixel-compatible with the OpenCV reference)

const roundHalfEven = (v: number) => {
  const r = Math.round(v);
  return r - v === 0.5 && r % 2 !== 0 ? r - 1 : r;
};
const clamp8 = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : roundHalfEven(v));

/** Transparent background -> white (the in-game frame is white). */
function compositeOnWhite(img: RGBAImage): RGBImage {
  const { width, height, data } = img;
  const out = new Uint8Array(width * height * 3);
  const f = Math.fround;
  for (let p = 0, q = 0; q < out.length; p += 4, q += 3) {
    const al = f(data[p + 3] / 255);
    const bg = f(255 * f(1 - al));
    out[q] = Math.floor(f(f(data[p] * al) + bg));
    out[q + 1] = Math.floor(f(f(data[p + 1] * al) + bg));
    out[q + 2] = Math.floor(f(f(data[p + 2] * al) + bg));
  }
  return { width, height, data: out };
}

/** Per-axis sample weights of OpenCV INTER_AREA: box filter when shrinking, its linear variant when enlarging. */
function axisWeights(
  ssize: number,
  dsize: number,
): { s: number; w: number }[][] {
  const scale = ssize / dsize;
  const tab: { s: number; w: number }[][] = [];
  for (let d = 0; d < dsize; d++) {
    const cell: { s: number; w: number }[] = [];
    if (scale >= 1) {
      const fs1 = d * scale;
      const fs2 = fs1 + scale;
      const cw = Math.min(scale, ssize - fs1);
      let s2 = Math.floor(fs2);
      let s1 = Math.ceil(fs1);
      s2 = Math.min(s2, ssize - 1);
      s1 = Math.min(s1, s2);
      if (s1 - fs1 > 1e-3) cell.push({ s: s1 - 1, w: (s1 - fs1) / cw });
      for (let s = s1; s < s2; s++) cell.push({ s, w: 1 / cw });
      if (fs2 - s2 > 1e-3)
        cell.push({ s: s2, w: Math.min(fs2 - s2, 1, cw) / cw });
    } else {
      let s = Math.floor(d * scale);
      let fx = d + 1 - (s + 1) / scale;
      fx = fx <= 0 ? 0 : fx - Math.floor(fx);
      if (s >= ssize - 1) {
        s = ssize - 1;
        fx = 0;
      }
      cell.push({ s, w: 1 - fx });
      if (fx > 0) cell.push({ s: s + 1, w: fx });
    }
    tab.push(cell);
  }
  return tab;
}

const isShrinkFactor = (scale: number) => Number.isInteger(scale) && scale >= 1;

/** Shrink by integer factors: plain block average, rounded half up. */
function blockAverage(src: RGBImage, dw: number, dh: number): RGBImage {
  const { width: sw, data } = src;
  const out = new Uint8Array(dw * dh * 3);
  const sx = sw / dw;
  const sy = src.height / dh;
  const area = sx * sy;
  for (let y = 0; y < dh; y++)
    for (let x = 0; x < dw; x++)
      for (let c = 0; c < 3; c++) {
        let s = 0;
        for (let j = 0; j < sy; j++)
          for (let i = 0; i < sx; i++)
            s += data[((y * sy + j) * sw + x * sx + i) * 3 + c];
        out[(y * dw + x) * 3 + c] = Math.floor((s + area / 2) / area);
      }
  return { width: dw, height: dh, data: out };
}

/** OpenCV INTER_AREA resize of an RGB image. */
function resizeArea(src: RGBImage, dw: number, dh: number): RGBImage {
  const { width: sw, height: sh, data } = src;
  if (isShrinkFactor(sw / dw) && isShrinkFactor(sh / dh))
    return blockAverage(src, dw, dh);
  const out = new Uint8Array(dw * dh * 3);
  const wx = axisWeights(sw, dw);
  const wy = axisWeights(sh, dh);
  const rowBuf = new Float64Array(dw * 3);
  const acc = new Float64Array(dw * 3);
  for (let y = 0; y < dh; y++) {
    acc.fill(0);
    for (const { s: srow, w: wyv } of wy[y]) {
      rowBuf.fill(0);
      const base = srow * sw * 3;
      for (let x = 0; x < dw; x++)
        for (const { s, w } of wx[x]) {
          const o = base + s * 3;
          rowBuf[x * 3] += data[o] * w;
          rowBuf[x * 3 + 1] += data[o + 1] * w;
          rowBuf[x * 3 + 2] += data[o + 2] * w;
        }
      for (let k = 0; k < acc.length; k++) acc[k] += rowBuf[k] * wyv;
    }
    for (let k = 0; k < acc.length; k++) out[y * dw * 3 + k] = clamp8(acc[k]);
  }
  return { width: dw, height: dh, data: out };
}

function dropAlpha(img: RGBAImage): RGBImage {
  const out = new Uint8Array(img.width * img.height * 3);
  for (let p = 0, q = 0; q < out.length; p += 4, q += 3) {
    out[q] = img.data[p];
    out[q + 1] = img.data[p + 1];
    out[q + 2] = img.data[p + 2];
  }
  return { width: img.width, height: img.height, data: out };
}

// ---------------------------------------------------------------------------------------------
// Bank

/**
 * Build the bank from decoded character images (id -> RGBA at its original size).
 * Pass every character (allCharacters); a missing image only drops that character.
 */
export function buildPortraitBank(
  characters: CharacterSummary[],
  images: Map<string, RGBAImage>,
): PortraitBank {
  const nsByCode = new Map<string, string>();
  for (const c of characters) if (c.style === "NS") nsByCode.set(c.code, c.id);
  const entries: BankEntry[] = [];
  for (const c of characters) {
    const img = images.get(c.id);
    if (!img) continue;
    const full = resizeArea(
      compositeOnWhite(img),
      BANK_WIDTH,
      Math.round((BANK_WIDTH * img.height) / img.width),
    );
    const halfRGB = resizeArea(
      full,
      BANK_WIDTH / 2,
      Math.round(full.height / 2),
    );
    const half = {
      width: halfRGB.width,
      height: halfRGB.height,
      data: Float32Array.from(halfRGB.data),
    };
    const group = c.style === "☆4" ? (nsByCode.get(c.code) ?? c.id) : c.id;
    entries.push({
      id: c.id,
      group,
      full,
      half,
      halfVar: windowVariance(half),
    });
  }
  return { entries };
}

/** Σ_c (Σ I_c² − (Σ I_c)² / n) of every stage-1 window, via summed-area tables. */
function windowVariance(img: {
  width: number;
  height: number;
  data: Float32Array;
}): Float64Array {
  const tw = HALF_PATCH.x1 - HALF_PATCH.x0;
  const th = HALF_PATCH.y1 - HALF_PATCH.y0;
  const { width: w, height: h, data } = img;
  const W = w + 1;
  const sat = [0, 1, 2].map(() => new Float64Array(W * (h + 1)));
  const sq = new Float64Array(W * (h + 1));
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const o = (y + 1) * W + x + 1;
      let s2 = 0;
      for (let c = 0; c < 3; c++) {
        const v = data[(y * w + x) * 3 + c];
        sat[c][o] = v + sat[c][o - 1] + sat[c][o - W] - sat[c][o - W - 1];
        s2 += v * v;
      }
      sq[o] = s2 + sq[o - 1] + sq[o - W] - sq[o - W - 1];
    }
  const box = (t: Float64Array, x: number, y: number) =>
    t[(y + th) * W + x + tw] -
    t[y * W + x + tw] -
    t[(y + th) * W + x] +
    t[y * W + x];
  const nx = w - tw + 1;
  const ny = h - th + 1;
  const n = tw * th;
  const out = new Float64Array(nx * ny);
  for (let y = 0; y < ny; y++)
    for (let x = 0; x < nx; x++) {
      let v = box(sq, x, y);
      for (let c = 0; c < 3; c++) {
        const s = box(sat[c], x, y);
        v -= (s * s) / n;
      }
      out[y * nx + x] = v;
    }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Grid

/** Brightness-comb phase (0..pitch): where the light gaps between cells sit. */
function phase(profile: Float64Array, pitch: number): number {
  let best = -1;
  let bp = 0;
  for (let p10 = 0; p10 < Math.trunc(pitch * 10); p10++) {
    const p = p10 / 10;
    let s = 0;
    let n = 0;
    for (let k = 0; p + k * pitch < profile.length; k++, n++)
      s += profile[Math.trunc(p + k * pitch)];
    const v = Math.fround(s / n);
    if (v > best) {
      best = v;
      bp = p;
    }
  }
  return bp;
}

const GRID_TOP = 128; // visible grid area below the header
const GRID_BOTTOM = 708;

/** Centres of the 5 grid columns, from the gray image `g` of width `W`. */
function findColumns(g: Float32Array, W: number): number[] {
  const colMean = (x: number, y0: number, y1: number) => {
    let s = 0;
    for (let y = y0; y < y1; y++) s += g[y * W + x];
    return Math.fround(s / (y1 - y0));
  };
  // the grid panel is on the right: search its columns over the right 55 %
  const x0s = Math.trunc(W * 0.45);
  const x1s = W - 10;
  const colProf = new Float64Array(x1s - x0s);
  for (let x = x0s; x < x1s; x++) colProf[x - x0s] = colMean(x, 150, 700);
  const px = phase(colProf, PITCH) + x0s;
  const xs = Array.from({ length: 12 }, (_, k) => px + PITCH * (k + 0.5));
  // keep the 5 consecutive centres whose middles are darkest (portraits are darker than the frames)
  const dark: number[] = [];
  for (const x of xs) {
    if (!(x + 55 < x1s)) break;
    let s = 0;
    for (let y = 150; y < 700; y++)
      for (let i = Math.trunc(x) - 30; i < Math.trunc(x) + 30; i++)
        s += g[y * W + i];
    dark.push(-Math.fround(s / (550 * 60)));
  }
  let k0 = 0;
  let bestDark = -Infinity;
  for (let s = 0; s < dark.length - 4; s++) {
    const v = dark[s] + dark[s + 1] + dark[s + 2] + dark[s + 3] + dark[s + 4];
    if (v > bestDark) {
      bestDark = v;
      k0 = s;
    }
  }
  return xs.slice(k0, k0 + 5);
}

/** Centres of the fully visible grid rows. */
function findRows(g: Float32Array, W: number, cols: number[]): number[] {
  const xa = Math.trunc(cols[0]) - 40;
  const xb = Math.trunc(cols[4]) + 40;
  const rowProf = new Float64Array(GRID_BOTTOM - GRID_TOP);
  for (let y = GRID_TOP; y < GRID_BOTTOM; y++) {
    let s = 0;
    for (let x = xa; x < xb; x++) s += g[y * W + x];
    rowProf[y - GRID_TOP] = Math.fround(s / (xb - xa));
  }
  const py = phase(rowProf, PITCH) + GRID_TOP;
  const rows: number[] = [];
  for (let k = 0; k < 6; k++) {
    const y = py + PITCH * (k + 0.5);
    if (GRID_TOP <= y - 32 && y + 32 <= GRID_BOTTOM) rows.push(y);
  }
  return rows;
}

/** The 120x120 crop centred on one cell. */
function cropCell(img: RGBImage, x: number, y: number): RGBImage {
  const W = img.width;
  const crop = new Uint8Array(CELL * CELL * 3).fill(255); // outside the screenshot = white
  const oy = Math.trunc(y) - CELL / 2;
  const ox = Math.trunc(x) - CELL / 2;
  for (let j = 0; j < CELL; j++) {
    const sy = oy + j;
    if (sy < 0 || sy >= SHOT_HEIGHT) continue;
    for (let i = 0; i < CELL; i++) {
      const sx = ox + i;
      if (sx < 0 || sx >= W) continue;
      for (let ch = 0; ch < 3; ch++)
        crop[(j * CELL + i) * 3 + ch] = img.data[(sy * W + sx) * 3 + ch];
    }
  }
  return { width: CELL, height: CELL, data: crop };
}

/** Cut the visible 5-column grid of a style screenshot (any aspect ratio) into 120x120 cells. */
function findGridCells(
  shot: RGBAImage,
): { row: number; col: number; x: number; y: number; crop: RGBImage }[] {
  const img = resizeArea(
    dropAlpha(shot),
    Math.round((shot.width * SHOT_HEIGHT) / shot.height),
    SHOT_HEIGHT,
  );
  const g = new Float32Array(img.width * SHOT_HEIGHT);
  for (let i = 0; i < g.length; i++) {
    const [r, gg, b] = [
      img.data[i * 3],
      img.data[i * 3 + 1],
      img.data[i * 3 + 2],
    ];
    g[i] = (r * 4899 + gg * 9617 + b * 1868 + 8192) >> 14; // OpenCV RGB->gray
  }
  const cols = findColumns(g, img.width);
  return findRows(g, img.width, cols).flatMap((y, row) =>
    cols.map((x, col) => ({ row, col, x, y, crop: cropCell(img, x, y) })),
  );
}

// ---------------------------------------------------------------------------------------------
// Matching

/** Zero-mean template (per channel) and its energy. */
function template(
  img: RGBImage,
  box: { x0: number; y0: number; x1: number; y1: number },
) {
  const tw = box.x1 - box.x0;
  const th = box.y1 - box.y0;
  const t = new Float64Array(tw * th * 3);
  const mean = [0, 0, 0];
  for (let y = 0; y < th; y++)
    for (let x = 0; x < tw; x++)
      for (let c = 0; c < 3; c++) {
        const v = img.data[((box.y0 + y) * img.width + box.x0 + x) * 3 + c];
        t[(y * tw + x) * 3 + c] = v;
        mean[c] += v;
      }
  for (let c = 0; c < 3; c++) mean[c] /= tw * th;
  let energy = 0;
  for (let i = 0; i < t.length; i++) {
    t[i] -= mean[i % 3];
    energy += t[i] * t[i];
  }
  return { t, tw, th, energy };
}

/** OpenCV's guard for flat windows and rounding overshoot. */
function normalise(
  num: number,
  wvar: number,
  wsq: number,
  tEnergy: number,
): number {
  if (tEnergy < Number.EPSILON) return 1;
  if (wvar <= Math.min(0.5, 10 * 1.1920929e-7 * wsq)) return 0;
  const d = Math.sqrt(wvar * tEnergy);
  if (Math.abs(num) < d) return num / d;
  return Math.abs(num) < d * 1.125 ? Math.sign(num) : 0;
}

/** Exact TM_CCOEFF_NORMED at one position of a full-size bank image. */
function scoreAt(
  tpl: ReturnType<typeof template>,
  img: RGBImage,
  x: number,
  y: number,
): number {
  const { t, tw, th, energy } = tpl;
  const n = tw * th;
  let num = 0;
  let sq = 0;
  const s = [0, 0, 0];
  for (let j = 0; j < th; j++) {
    const ro = ((y + j) * img.width + x) * 3;
    const to = j * tw * 3;
    for (let k = 0; k < tw * 3; k++) {
      const v = img.data[ro + k];
      num += t[to + k] * v;
      sq += v * v;
      s[k % 3] += v;
    }
  }
  const wvar = sq - (s[0] * s[0] + s[1] * s[1] + s[2] * s[2]) / n;
  return normalise(num, wvar, sq, energy);
}

/**
 * Highlights of the portrait: 98th-percentile luma of the upper 35 rows of the centre patch.
 * Unowned styles are drawn dimmed, which takes the highlights away. The lower rows are left out
 * because a half-visible bottom row lets the panel's white border into them.
 */
function highlight(crop: RGBImage): number {
  const v: number[] = [];
  for (let y = PATCH.y0; y < PATCH.y0 + 35; y++)
    for (let x = PATCH.x0; x < PATCH.x1; x++) {
      const o = (y * crop.width + x) * 3;
      v.push(
        0.299 * crop.data[o] +
          0.587 * crop.data[o + 1] +
          0.114 * crop.data[o + 2],
      );
    }
  v.sort((p, q) => p - q);
  return v[Math.floor(v.length * 0.98)];
}

type Position = { x: number; y: number };

/** Stage 1 on one bank image: its best half-size score and where, over every position or only around `near`. */
function bestHalf(
  t: Float32Array,
  q: ReturnType<typeof template>,
  e: BankEntry,
  near?: Position,
) {
  const { width: w, height: h, data } = e.half;
  const tw3 = q.tw * 3;
  const w3 = w * 3;
  const nx = w - q.tw + 1;
  const ny = h - q.th + 1;
  const [x0, x1, y0, y1] = near
    ? [
        Math.max(0, near.x - NEAR),
        Math.min(nx - 1, near.x + NEAR),
        Math.max(0, near.y - NEAR),
        Math.min(ny - 1, near.y + NEAR),
      ]
    : [0, nx - 1, 0, ny - 1];
  let best = -2;
  let at = { x: x0, y: y0 };
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      let num = 0;
      let ro = y * w3 + x * 3;
      for (let to = 0; to < t.length; to += tw3, ro += w3)
        for (let k = 0; k < tw3; k++) num += t[to + k] * data[ro + k];
      const sc = normalise(num, e.halfVar[y * nx + x], Infinity, q.energy);
      if (sc > best) {
        best = sc;
        at = { x, y };
      }
    }
  return { best, at };
}

/** Two-stage match. `near` limits stage 1 to NEAR half-size pixels around a known position. */
function matchAt(crop: RGBImage, bank: PortraitBank, near?: Position) {
  // stage 1: half size
  const q1 = template(resizeArea(crop, CELL / 2, CELL / 2), HALF_PATCH);
  const t = Float32Array.from(q1.t);
  const stage1 = new Map<
    string,
    { score: number; hits: { e: BankEntry; at: Position }[] }
  >();
  for (const e of bank.entries) {
    const { best, at } = bestHalf(t, q1, e, near);
    const g = stage1.get(e.group) ?? { score: -2, hits: [] };
    g.score = Math.max(g.score, best);
    g.hits.push({ e, at });
    stage1.set(e.group, g);
  }
  const survivors = [...stage1.entries()]
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, TOP_K);

  // stage 2: full size, around the stage-1 position (the half-size patch starts one row above the full one)
  const q2 = template(crop, PATCH);
  const scored = survivors.map(([group, { hits }]) => {
    let score = -2;
    let at = hits[0].at;
    let win = { e: hits[0].e };
    for (const hit of hits) {
      const { e } = hit;
      const cx = hit.at.x * 2;
      const cy = hit.at.y * 2 + 1;
      for (
        let yy = Math.max(0, cy - REFINE);
        yy <= Math.min(e.full.height - q2.th, cy + REFINE);
        yy++
      )
        for (
          let xx = Math.max(0, cx - REFINE);
          xx <= Math.min(e.full.width - q2.tw, cx + REFINE);
          xx++
        ) {
          const sc = scoreAt(q2, e.full, xx, yy);
          if (sc > score) {
            score = sc;
            at = hit.at;
            win = { e };
          }
        }
    }
    return { id: group, score, at, image: win.e.id };
  });
  scored.sort((a, b) => b.score - a.score);
  const { id, score, at, image } = scored[0];
  let status: CellMatch["status"] =
    score >= ACCEPT_SCORE ? "ok" : score >= ASK_SCORE ? "ask" : "none";
  if (status === "ok" && ASK_ALWAYS.has(image)) status = "ask";
  const brightness = highlight(crop);
  return {
    id,
    score,
    status,
    brightness,
    owned: brightness >= OWNED_MIN,
    candidates: scored.slice(0, 3).map((s) => ({ id: s.id, score: s.score })),
    at,
  };
}

/**
 * Read every cell of one screenshot.
 * Within one screenshot every portrait sits at nearly the same place in its matching image
 * (measured: ±1 px per row / column), so after one sure cell the others search only around it.
 * A cell that does not reach ACCEPT_SCORE that way is searched in full again.
 */
export function readStyleGrid(
  shot: RGBAImage,
  bank: PortraitBank,
  onCell?: (done: number, total: number) => void,
): CellMatch[] {
  let near: Position | undefined;
  const scale = shot.height / SHOT_HEIGHT; // cell centres back in the screenshot's own pixels
  const cells = findGridCells(shot);
  return cells.map(({ row, col, x, y, crop }, i) => {
    let m = matchAt(crop, bank, near);
    if (near && m.score < ACCEPT_SCORE) m = matchAt(crop, bank);
    if (m.score >= SURE_SCORE) near = m.at;
    onCell?.(i + 1, cells.length);
    const { id, score, status, brightness, owned, candidates } = m;
    return {
      row,
      col,
      x: x * scale,
      y: y * scale,
      id,
      score,
      status,
      brightness,
      owned,
      candidates,
    };
  });
}

// ---------------------------------------------------------------------------------------------
// Browser glue

/** Decode without colour management, so pixels are the file's own values. */
async function decode(blob: Blob): Promise<RGBAImage> {
  const bmp = await createImageBitmap(blob, {
    colorSpaceConversion: "none",
    premultiplyAlpha: "none",
  });
  const { width, height } = bmp;
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bmp, 0, 0);
  bmp.close();
  return { width, height, data: ctx.getImageData(0, 0, width, height).data };
}

/** Fetch every character image from the CDN and build the bank. */
export async function loadPortraitBank(
  characters: CharacterSummary[],
  onProgress?: (done: number, total: number) => void,
): Promise<PortraitBank> {
  const images = new Map<string, RGBAImage>();
  let done = 0;
  await Promise.all(
    characters.map(async (c) => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_CDN_URL}/character/${c.id}.${IMAGE_EXT}`,
          { mode: "cors" },
        );
        if (res.ok) images.set(c.id, await decode(await res.blob()));
      } catch {
        // a missing image only drops that character
      }
      onProgress?.(++done, characters.length);
    }),
  );
  return buildPortraitBank(characters, images);
}

/** Screenshot file -> matches for every visible cell. */
export async function readStyleScreenshot(
  file: Blob,
  bank: PortraitBank,
  onCell?: (done: number, total: number) => void,
): Promise<CellMatch[]> {
  return readStyleGrid(await decode(file), bank, onCell);
}
