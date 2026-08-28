// clauded up bruh

// Port of the "Clouds" GLSL shader to TypeScript.
// Original shader uses vec2/vec3/mat2 GLSL types; here we use plain
// number tuples and small helper functions to keep things dependency-free.
 
type Vec2 = [number, number];
type Vec3 = [number, number, number];
type Mat2 = [number, number, number, number]; // [a, b, c, d] column-major like GLSL mat2(a,b,c,d)
 
// ---- Constants (mirrors the `const` values in the shader) ----
const cloudscale = 0.5;
const speed = 0.01;
const clouddark = 0.5;
const cloudlight = 0.1;
const cloudcover = 0.2;
const cloudalpha = 2.0;
const skytint = 0.5;
const skycolour1: Vec3 = [0.2, 0.4, 0.6];
const skycolour2: Vec3 = [0.4, 0.7, 1.0];
const m: Mat2 = [1.6, 1.2, -1.2, 1.6];
 
// ---- Small vector/math helpers ----
function fract(x: number): number {
  return x - Math.floor(x);
}
 
function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}
 
function mix(a: number, b: number, t: number): number {
  return a * (1 - t) + b * t;
}
 
function mixVec3(a: Vec3, b: Vec3, t: number): Vec3 {
  return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
}
 
function dot2(a: Vec2, b: Vec2): number {
  return a[0] * b[0] + a[1] * b[1];
}
 
// GLSL mat2 * vec2, where m = [a, b, c, d] represents:
//   | a  c |   | x |
//   | b  d | * | y |
// (GLSL matrices are column-major: mat2(a,b,c,d) has columns (a,b) and (c,d))
function mat2MulVec2(mm: Mat2, v: Vec2): Vec2 {
  const [a, b, c, d] = mm;
  return [a * v[0] + c * v[1], b * v[0] + d * v[1]];
}
 
// ---- hash / noise / fbm (direct translations) ----
function hash(p: Vec2): Vec2 {
  const px = dot2(p, [127.1, 311.7]);
  const py = dot2(p, [269.5, 183.3]);
  return [
    -1.0 + 2.0 * fract(Math.sin(px) * 43758.5453123),
    -1.0 + 2.0 * fract(Math.sin(py) * 43758.5453123),
  ];
}
 
function noise(p: Vec2): number {
  const K1 = 0.366025404; // (sqrt(3)-1)/2
  const K2 = 0.211324865; // (3-sqrt(3))/6
 
  const s = (p[0] + p[1]) * K1;
  const i: Vec2 = [Math.floor(p[0] + s), Math.floor(p[1] + s)];
 
  const t = (i[0] + i[1]) * K2;
  const a: Vec2 = [p[0] - i[0] + t, p[1] - i[1] + t];
 
  const o: Vec2 = a[0] > a[1] ? [1.0, 0.0] : [0.0, 1.0];
 
  const b: Vec2 = [a[0] - o[0] + K2, a[1] - o[1] + K2];
  const c: Vec2 = [a[0] - 1.0 + 2.0 * K2, a[1] - 1.0 + 2.0 * K2];
 
  const h0 = Math.max(0.5 - dot2(a, a), 0.0);
  const h1 = Math.max(0.5 - dot2(b, b), 0.0);
  const h2 = Math.max(0.5 - dot2(c, c), 0.0);
 
  const ha = hash([i[0] + 0.0, i[1] + 0.0]);
  const hb = hash([i[0] + o[0], i[1] + o[1]]);
  const hc = hash([i[0] + 1.0, i[1] + 1.0]);
 
  const n0 = h0 * h0 * h0 * h0 * dot2(a, ha);
  const n1 = h1 * h1 * h1 * h1 * dot2(b, hb);
  const n2 = h2 * h2 * h2 * h2 * dot2(c, hc);
 
  return (n0 + n1 + n2) * 70.0;
}
 
function fbm(nIn: Vec2): number {
  let n: Vec2 = [nIn[0], nIn[1]];
  let total = 0.0;
  let amplitude = 0.1;
  for (let i = 0; i < 7; i++) {
    total += noise(n) * amplitude;
    n = mat2MulVec2(m, n);
    amplitude *= 0.4;
  }
  return total;
}
 
/**
 * Computes the cloud shader colour for a single pixel.
 *
 * @param fragCoordX  pixel x coordinate (e.g. 0..width)
 * @param fragCoordY  pixel y coordinate (e.g. 0..height)
 * @param resolutionX viewport width (iResolution.x)
 * @param resolutionY viewport height (iResolution.y)
 * @param iTime       elapsed time in seconds (iTime)
 * @returns [r, g, b, a] each in range [0, 1]
 */
export function cloudsShader(
  fragCoordX: number,
  fragCoordY: number,
  resolutionX: number,
  resolutionY: number,
  iTime: number
): [number, number, number, number] {
  const p: Vec2 = [fragCoordX / resolutionX, fragCoordY / resolutionY];
  const aspect = resolutionX / resolutionY;
 
  let uv: Vec2 = [p[0] * aspect, p[1] * 1.0];
  let time = iTime * speed;
 
  const q = fbm([uv[0] * cloudscale * 0.5, uv[1] * cloudscale * 0.5]);
 
  // ridged noise shape
  let r = 0.0;
  uv = [uv[0] * cloudscale, uv[1] * cloudscale];
  uv = [uv[0] - (q - time), uv[1] - (q - time)];
  let weight = 0.8;
  for (let i = 0; i < 8; i++) {
    r += Math.abs(weight * noise(uv));
    uv = mat2MulVec2(m, uv);
    uv = [uv[0] + time, uv[1] + time];
    weight *= 0.7;
  }
 
  // noise shape
  let f = 0.0;
  uv = [p[0] * aspect, p[1] * 1.0];
  uv = [uv[0] * cloudscale, uv[1] * cloudscale];
  uv = [uv[0] - (q - time), uv[1] - (q - time)];
  weight = 0.7;
  for (let i = 0; i < 8; i++) {
    f += weight * noise(uv);
    uv = mat2MulVec2(m, uv);
    uv = [uv[0] + time, uv[1] + time];
    weight *= 0.6;
  }
 
  f *= r + f;
 
  // noise colour
  let c = 0.0;
  time = iTime * speed * 2.0;
  uv = [p[0] * aspect, p[1] * 1.0];
  uv = [uv[0] * cloudscale * 2.0, uv[1] * cloudscale * 2.0];
  uv = [uv[0] - (q - time), uv[1] - (q - time)];
  weight = 0.4;
  for (let i = 0; i < 7; i++) {
    c += weight * noise(uv);
    uv = mat2MulVec2(m, uv);
    uv = [uv[0] + time, uv[1] + time];
    weight *= 0.6;
  }
 
  // noise ridge colour
  let c1 = 0.0;
  time = iTime * speed * 3.0;
  uv = [p[0] * aspect, p[1] * 1.0];
  uv = [uv[0] * cloudscale * 3.0, uv[1] * cloudscale * 3.0];
  uv = [uv[0] - (q - time), uv[1] - (q - time)];
  weight = 0.4;
  for (let i = 0; i < 7; i++) {
    c1 += Math.abs(weight * noise(uv));
    uv = mat2MulVec2(m, uv);
    uv = [uv[0] + time, uv[1] + time];
    weight *= 0.6;
  }
 
  c += c1;
 
  const skycolour = mixVec3(skycolour2, skycolour1, p[1]);
  const cShade = clamp(clouddark + cloudlight * c, 0.0, 1.0);
  const cloudcolour: Vec3 = [1.1 * cShade, 1.1 * cShade, 0.9 * cShade];
 
  f = cloudcover + cloudalpha * f * r;
 
  const tinted: Vec3 = [
    clamp(skytint * skycolour[0] + cloudcolour[0], 0.0, 1.0),
    clamp(skytint * skycolour[1] + cloudcolour[1], 0.0, 1.0),
    clamp(skytint * skycolour[2] + cloudcolour[2], 0.0, 1.0),
  ];
 
  const t = clamp(f + c, 0.0, 1.0);
  const result = mixVec3(skycolour, tinted, t);
 
  return [result[0], result[1], result[2], 1.0];
}
 
// ---- Example usage: render into a canvas ImageData ----
//
// function render(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
//   const img = ctx.createImageData(width, height);
//   for (let y = 0; y < height; y++) {
//     for (let x = 0; x < width; x++) {
//       const [r, g, b, a] = cloudsShader(x, height - y, width, height, time);
//       const idx = (y * width + x) * 4;
//       img.data[idx] = clamp(r, 0, 1) * 255;
//       img.data[idx + 1] = clamp(g, 0, 1) * 255;
//       img.data[idx + 2] = clamp(b, 0, 1) * 255;
//       img.data[idx + 3] = clamp(a, 0, 1) * 255;
//     }
//   }
//   ctx.putImageData(img, 0, 0);
// }
 
