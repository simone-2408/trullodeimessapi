import * as THREE from 'three';

export type DetailType = 'overview' | 'sphere' | 'chalice' | 'stones';

// Deterministic variation: every visit shows the same architectural model.
function random(seed = 19) {
  return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
}
const smooth = (t: number) => t * t * (3 - 2 * t);

// Tileable value-noise fBm in [0, 1]; shared by every procedural surface.
function tileNoise(size: number, seed: number, octaves: number, base: number) {
  const rand = random(seed), out = new Float32Array(size * size);
  let amplitude = 1, total = 0;
  for (let o = 0, period = base; o < octaves; o++, period *= 2, amplitude *= .5) {
    const lattice = Float32Array.from({ length: period * period }, rand);
    for (let y = 0; y < size; y++) {
      const fy = y / size * period, y0 = Math.floor(fy), ty = smooth(fy - y0), y1 = (y0 + 1) % period;
      for (let x = 0; x < size; x++) {
        const fx = x / size * period, x0 = Math.floor(fx), tx = smooth(fx - x0), x1 = (x0 + 1) % period;
        const a = lattice[y0 * period + x0], b = lattice[y0 * period + x1];
        const c = lattice[y1 * period + x0], d = lattice[y1 * period + x1];
        out[y * size + x] += amplitude * ((a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty);
      }
    }
    total += amplitude;
  }
  for (let i = 0; i < out.length; i++) out[i] /= total;
  return out;
}

type Painter = (x: number, y: number, out: Float32Array) => void;
// Paints albedo (sRGB) and a packed detail map: R = height for bumpMap, G = roughness for roughnessMap.
function surface(width: number, height: number, paint: Painter, repeat: [number, number]) {
  const make = () => { const c = document.createElement('canvas'); c.width = width; c.height = height; return c; };
  const colorCanvas = make(), detailCanvas = make();
  const color = new ImageData(width, height), detail = new ImageData(width, height), o = new Float32Array(5);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    paint(x, y, o);
    const i = (y * width + x) * 4;
    color.data[i] = o[0] * 255; color.data[i + 1] = o[1] * 255; color.data[i + 2] = o[2] * 255; color.data[i + 3] = 255;
    detail.data[i] = o[3] * 255; detail.data[i + 1] = o[4] * 255; detail.data[i + 3] = 255;
  }
  colorCanvas.getContext('2d')!.putImageData(color, 0, 0);
  detailCanvas.getContext('2d')!.putImageData(detail, 0, 0);
  const texture = (canvas: HTMLCanvasElement, space: THREE.ColorSpace) => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = space; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); t.anisotropy = 4;
    return t;
  };
  return { map: texture(colorCanvas, THREE.SRGBColorSpace), detail: texture(detailCanvas, THREE.NoColorSpace) };
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const set = (o: Float32Array, r: number, g: number, b: number, h: number, rough: number) => { o[0] = r; o[1] = g; o[2] = b; o[3] = h; o[4] = rough; };

// Generated in slices (pause between surfaces) so scrolling stays smooth while the scene loads.
async function textures(pause: () => Promise<void>, compact: boolean) {
  const S = 512, fine = tileNoise(S, 3, 6, 8), broad = tileNoise(S, 11, 3, 2), rand = random(5);
  const at = (n: Float32Array, x: number, y: number) => n[(y & (S - 1)) * S + (x & (S - 1))];
  const pores = new Uint8Array(S * S).map(() => (rand() < .007 ? 1 : 0));
  await pause();

  // Weathered grey-ivory limestone (chiancarelle): 1 m tile, pores, ochre stains and faint lichen.
  const stone = surface(S, S, (x, y, o) => {
    const n = at(fine, x, y), m = at(fine, x * 3, y * 3), b = at(broad, x, y), pore = pores[y * S + x];
    const stain = clamp01((b - .6) * 2.4), lichen = clamp01((.34 - b) * 3) * clamp01((m - .52) * 4);
    const l = .83 + (n - .5) * .24 + (m - .5) * .07 - pore * .12 - lichen * .2;
    set(o, clamp01(l * (1 - stain * .06)), clamp01(l * (.97 - stain * .12 + lichen * .02)), clamp01(l * (.91 - stain * .24 - lichen * .02)),
      clamp01(n * .72 + m * .28 - pore * .45), clamp01(.8 + m * .18 + pore * .08));
  }, [1, 1]);
  await pause();

  // Dressed ashlar walls (2.5 m tile): irregular courses, chipped edges, shadowed dry joints.
  // Warm Apulian limestone: cream, honey and pale grey, with one brightness factor per block (no hue drift).
  // Phones get a 512 px wall tile (same layout, scaled) to halve the largest generation slice.
  const W = compact ? 512 : 1024, q = W / 1024, courseRand = random(23), palette = [[.89, .84, .74], [.86, .8, .69], [.9, .87, .8], [.84, .8, .73], [.88, .81, .68], [.83, .78, .7]];
  const rowOf = new Int16Array(W), rows: { y0: number; y1: number; x0: Int16Array; x1: Int16Array; block: Uint8Array; tint: number[][] }[] = [];
  for (let y = 0; y < W;) {
    const h = y > W - 160 * q ? W - y : Math.round((62 + Math.floor(courseRand() * 70)) * q), x0 = new Int16Array(W), x1 = new Int16Array(W), block = new Uint8Array(W), tint: number[][] = [];
    for (let x = Math.floor(courseRand() * 120 * q), start = x; x < start + W;) {
      const w = Math.min(Math.round((70 + Math.floor(courseRand() * 200)) * q), start + W - x), k = .9 + courseRand() * .14;
      tint.push(palette[Math.floor(courseRand() * palette.length)].map(c => c * k));
      // Unwrapped block span for every column it covers (blocks may cross the tile edge).
      for (let i = x; i < x + w; i++) { x0[i % W] = x - (i >= W ? W : 0); x1[i % W] = x + w - (i >= W ? W : 0); block[i % W] = tint.length - 1; }
      x += w;
    }
    const index = rows.length;
    rows.push({ y0: y, y1: y + h, x0, x1, block, tint });
    rowOf.fill(index, y, y + h); y += h;
  }
  const wall = surface(W, W, (x, y, o) => {
    const row = rows[rowOf[y]], tint = row.tint[row.block[x]];
    const X = x / q, Y = y / q, edge = (Math.min(x - row.x0[x], row.x1[x] - x, y - row.y0, row.y1 - y) + (at(fine, X * 2, Y * 2) - .5) * 16 * q) / q;
    const n = at(fine, X, Y), m = at(fine, X * 3, Y * 3);
    if (edge < 2.5) { const l = .5 + n * .14; set(o, l, l * .95, l * .88, 0, 1); return; } // shadowed dry joint
    const b = at(broad, X >> 1, Y >> 1), c = at(broad, (X >> 1) + 200, (Y >> 1) + 90);
    const bevel = smooth(clamp01(edge / 16)), pore = pores[(Y & 511) * S + (X & 511)];
    const l = (.93 + (n - .5) * .3 + (m - .5) * .1 - pore * .22) * (.9 + bevel * .1);
    const ochre = clamp01((b - .58) * 2.6) * .8, grey = clamp01((.36 - c) * 3) * .5;
    set(o, clamp01(tint[0] * l * (1 - grey * .06)), clamp01(tint[1] * l * (1 - ochre * .1 - grey * .03)), clamp01(tint[2] * l * (1 - ochre * .26)),
      clamp01(.3 + bevel * .5 + (n - .5) * .35 - pore * .3), clamp01(.82 + m * .16));
  }, [1 / 2.5, 1 / 2.5]);
  await pause();

  // Coarse lime wash for the pinnacle, like the stippled finish in the estate photograph.
  const lime = surface(256, 256, (x, y, o) => {
    const n = at(fine, x * 2, y * 2), m = at(fine, x * 6, y * 6), pore = pores[(y * 2 & 511) * S + (x * 2 & 511)];
    const l = .95 + (n - .5) * .06 - pore * .1;
    set(o, l * .985, l * .975, l * .945, clamp01(m * .75 + n * .25 - pore * .5), .93);
  }, [3, 2]);

  // Warm chianche paving around the trullo (3 m tile), with per-row nearest-joint lookups.
  const paveRand = random(41), paveOf = new Int16Array(S), pave: { y0: number; y1: number; joint: Float32Array; slab: Int16Array }[] = [];
  for (let y = 0; y < S;) {
    const h = y > S - 110 ? S - y : 60 + Math.floor(paveRand() * 50), cuts = [0];
    for (let x = 0; x < S - 70;) { x += 50 + Math.floor(paveRand() * 110); cuts.push(Math.min(x, S)); }
    const joint = new Float32Array(S), slab = new Int16Array(S);
    for (let x = 0; x < S; x++) {
      joint[x] = cuts.reduce((d, c) => Math.min(d, Math.abs(x - c), S - Math.abs(x - c)), S);
      slab[x] = cuts.findIndex(c => c > x);
    }
    paveOf.fill(pave.length, y, y + h);
    pave.push({ y0: y, y1: y + h, joint, slab }); y += h;
  }
  const ground = surface(S, S, (x, y, o) => {
    const row = pave[paveOf[y]], joint = Math.min(row.joint[x], y - row.y0, row.y1 - y) + (at(fine, x * 2, y * 2) - .5) * 5;
    if (joint < 2) { set(o, .74, .69, .61, .2, 1); return; }
    const n = at(fine, x, y), b = at(broad, x, y), tone = .94 + ((row.y0 * 7 + row.slab[x] * 13) % 9) / 150;
    const l = tone * (.86 + (n - .5) * .2) * (1 - clamp01((b - .6) * 2) * .08);
    set(o, l * .98, l * .91, l * .8, .5 + n * .4, .9);
  }, [1, 1]);

  // Vertical oak planks for the door.
  const wood = surface(128, 256, (x, y, o) => {
    const plank = Math.floor(x / 32), gap = x % 32 < 2 ? .55 : 1, grain = Math.sin((x + at(fine, x * 3 + plank * 90, y) * 20) * .9) * .5 + .5;
    const l = (.85 + plank % 2 * .08 + grain * .12) * gap;
    set(o, .4 * l, .28 * l, .18 * l, gap < 1 ? 0 : .5 + grain * .3, .72);
  }, [1, 1]);

  return { stone, wall, lime, ground, wood };
}

// Rounded rectangle centred at the origin.
function roundedRect<T extends THREE.Path>(half: number, radius: number, shape: T): T {
  const e = half - radius;
  shape.moveTo(-e, -half); shape.lineTo(e, -half); shape.absarc(e, -e, radius, -Math.PI / 2, 0, false);
  shape.lineTo(half, e); shape.absarc(e, e, radius, 0, Math.PI / 2, false);
  shape.lineTo(-e, half); shape.absarc(-e, e, radius, Math.PI / 2, Math.PI, false);
  shape.lineTo(-half, -e); shape.absarc(-e, -e, radius, Math.PI, Math.PI * 1.5, false);
  return shape;
}
// Arched stone surround as one U-shaped contour (outer arch, then inner arch in reverse).
function archRing(outer: number, inner: number, jamb: number) {
  const R = outer / 2, r = inner / 2, shape = new THREE.Shape();
  shape.moveTo(-R, 0); shape.lineTo(-r, 0); shape.lineTo(-r, jamb); shape.absarc(0, jamb, r, Math.PI, 0, true);
  shape.lineTo(r, 0); shape.lineTo(R, 0); shape.lineTo(R, jamb); shape.absarc(0, jamb, R, 0, Math.PI, false); shape.lineTo(-R, 0);
  return shape;
}
// Round-arched opening: straight jambs then a semicircle.
function arch<T extends THREE.Path>(width: number, jamb: number, shape: T): T {
  const r = width / 2;
  shape.moveTo(-r, 0); shape.lineTo(r, 0); shape.lineTo(r, jamb); shape.absarc(0, jamb, r, 0, Math.PI, false); shape.lineTo(-r, 0);
  return shape;
}

// Irregular chiancarella: a rounded slab with chipped, noise-displaced faces.
function slab(seed: number) {
  const rand = random(seed), size = new THREE.Vector3(.27, .066, .3), round = .016;
  const geometry = new THREE.BoxGeometry(size.x, size.y, size.z, 5, 2, 4);
  const p = geometry.attributes.position, v = new THREE.Vector3(), inner = size.clone().multiplyScalar(.5).subScalar(round);
  const phase = [rand() * 9, rand() * 9, rand() * 9];
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const c = v.clone().clamp(inner.clone().negate(), inner), n = v.clone().sub(c).normalize();
    const chip = .006 * Math.sin(v.x * 43 + phase[0]) * Math.cos(v.z * 37 + phase[1]) + .004 * Math.sin(v.y * 90 + v.x * 20 + phase[2]);
    v.copy(c).addScaledVector(n, round + chip);
    if (v.z > 0) v.y += (rand() - .5) * .01; // uneven exposed edge
    p.setXYZ(i, v.x, v.y, v.z);
  }
  // Box-projected UVs in metres with a random offset, so neighbouring slabs never repeat.
  geometry.computeVertexNormals();
  const normal = geometry.attributes.normal, uv = geometry.attributes.uv, ou = rand(), ov = rand();
  for (let i = 0; i < p.count; i++) {
    const nx = Math.abs(normal.getX(i)), ny = Math.abs(normal.getY(i)), nz = Math.abs(normal.getZ(i));
    const [a, b] = nz >= nx && nz >= ny ? [p.getX(i), p.getY(i)] : nx >= ny ? [p.getZ(i), p.getY(i)] : [p.getX(i), p.getZ(i)];
    uv.setXY(i, a + ou, b + ov);
  }
  return geometry;
}

const WALL = 1.35, HALF = 1.9, CORNICE = .085, CONE_BASE = WALL + CORNICE, COURSE = .068, COURSES = 34, R0 = 1.7, R_TOP = .2;
const CONE_TOP = CONE_BASE + COURSES * COURSE;
const coneRadius = (t: number) => R_TOP + (R0 - R_TOP) * Math.pow(1 - t, .8); // slightly ogival, as built
const VIEWS: Record<DetailType, [number, number]> = {
  overview: [2.15, 12.5], sphere: [CONE_TOP + .72, 2.2], chalice: [CONE_TOP + .42, 2.9], stones: [CONE_BASE + .9, 4.4],
};

export class PinnacleScene {
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(34, 1, .1, 60);
  private renderer: THREE.WebGLRenderer;
  private model = new THREE.Group();
  private target = new THREE.Vector3(0, VIEWS.overview[0], 0);
  private desiredTarget = this.target.clone();
  private distance = VIEWS.overview[1];
  private desiredDistance = VIEWS.overview[1];
  private yaw = .42;
  private pitch = .15;
  private velocity = 0;
  private pointer: { id: number; x: number; y: number; t: number } | null = null;
  private lastInteraction = 0;
  private raf = 0;
  private lastFrame = 0;
  private visible = false;
  private disposed = false;
  private built = false;
  private motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  private compact = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches;
  private resize: ResizeObserver;
  private container: HTMLElement;
  private onError: () => void;
  private sun = new THREE.DirectionalLight('#fff0da', 3.5);
  readonly ready: Promise<void>;

  constructor({ container, onError }: { container: HTMLElement; onError: () => void }) {
    this.container = container;
    this.onError = onError;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.compact ? 1.5 : 1.75));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = .95;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    // Only the camera moves: render the shadow map once instead of every frame.
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.shadowMap.needsUpdate = true;
    this.renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;touch-action:pan-y';
    this.renderer.domElement.setAttribute('aria-hidden', 'true');
    this.resize = new ResizeObserver(this.fit);
    // The canvas joins the page only once textures are generated and shaders compiled.
    this.ready = this.build().then(() => {
      if (this.disposed) return;
      this.built = true;
      const canvas = this.renderer.domElement;
      container.appendChild(canvas);
      canvas.addEventListener('pointerdown', this.down);
      canvas.addEventListener('pointermove', this.move);
      canvas.addEventListener('pointerup', this.up);
      canvas.addEventListener('pointercancel', this.up);
      canvas.addEventListener('webglcontextlost', this.contextLost);
      document.addEventListener('visibilitychange', this.sync);
      this.motion.addEventListener('change', this.sync);
      this.resize.observe(container);
      this.fit();
    });
  }

  private environment() {
    // Soft Apulian sky: blue zenith, hazy warm horizon, sunlit paving bounce.
    const pmrem = new THREE.PMREMGenerator(this.renderer), env = new THREE.Scene();
    const geometry = new THREE.SphereGeometry(10, 32, 16), colors: number[] = [], color = new THREE.Color();
    const zenith = new THREE.Color('#9dbfdc'), horizon = new THREE.Color('#f1e9dc'), ground = new THREE.Color('#b8a58a');
    for (let i = 0; i < geometry.attributes.position.count; i++) {
      const y = geometry.attributes.position.getY(i) / 10;
      color.copy(horizon).lerp(y > 0 ? zenith : ground, Math.pow(Math.abs(y), y > 0 ? .7 : .4));
      colors.push(color.r, color.g, color.b);
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const material = new THREE.MeshBasicMaterial({ side: THREE.BackSide, vertexColors: true });
    const sky = new THREE.Mesh(geometry, material), sunDisc = new THREE.Mesh(new THREE.SphereGeometry(.9, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(9, 8.2, 7) }));
    sunDisc.position.copy(this.sun.position).normalize().multiplyScalar(8.5);
    env.add(sky, sunDisc);
    const texture = pmrem.fromScene(env, .035).texture;
    pmrem.dispose(); geometry.dispose(); material.dispose(); sunDisc.geometry.dispose(); (sunDisc.material as THREE.Material).dispose();
    return texture;
  }

  private async build() {
    const pause = () => new Promise<void>(resolve => setTimeout(resolve, 0));
    const t = await textures(pause, this.compact), rand = random(7);
    if (this.disposed) return;
    this.sun.position.set(-5.5, 7.5, 6.5);
    this.sun.target.position.set(0, 1.4, 0);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.setScalar(this.compact ? 1024 : 2048);
    Object.assign(this.sun.shadow.camera, { left: -4.2, right: 4.2, top: 4.6, bottom: -3.6, near: 3, far: 22 });
    this.sun.shadow.normalBias = .02;
    this.sun.shadow.bias = -.0004;
    this.sun.shadow.radius = 3;
    await pause();
    if (this.disposed) return;
    this.scene.environment = this.environment();
    this.scene.environmentIntensity = .62;
    this.scene.add(this.sun, this.sun.target, this.model, new THREE.HemisphereLight('#dfe9f2', '#a08c70', .35));

    const material = (maps: { map: THREE.Texture; detail: THREE.Texture }, bumpScale: number, extra: THREE.MeshStandardMaterialParameters = {}) =>
      new THREE.MeshStandardMaterial({ map: maps.map, bumpMap: maps.detail, roughnessMap: maps.detail, bumpScale, roughness: 1, metalness: 0, ...extra });
    const stone = material(t.stone, 1.4);
    const wall = material(t.wall, 2.2, { vertexColors: true });
    const cornice = material(t.stone, 1.2, { color: '#e6dfd2' });
    const lime = material(t.lime, 2.6);
    const wood = material(t.wood, .8);
    const add = (geometry: THREE.BufferGeometry, mat: THREE.Material | THREE.Material[], position: [number, number, number] = [0, 0, 0], parent: THREE.Object3D = this.model) => {
      const mesh = new THREE.Mesh(geometry, mat);
      mesh.position.set(...position);
      mesh.castShadow = mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    };

    // Square base with softened corners and a slight batter; darker where it meets ground and cornice.
    const walls = new THREE.ExtrudeGeometry(roundedRect(HALF, .42, new THREE.Shape()), { depth: WALL, bevelEnabled: false, steps: 14, curveSegments: 8 });
    walls.rotateX(-Math.PI / 2);
    const wp = walls.attributes.position, occlusion: number[] = [];
    for (let i = 0; i < wp.count; i++) {
      const y = wp.getY(i), batter = 1 - .026 * y / WALL;
      wp.setXYZ(i, wp.getX(i) * batter, y, wp.getZ(i) * batter);
      const ao = 1 - .3 * (1 - smooth(clamp01(y / .32))) - .22 * smooth(clamp01((y - WALL + .16) / .16));
      occlusion.push(ao, ao, ao);
    }
    walls.setAttribute('color', new THREE.Float32BufferAttribute(occlusion, 3));
    walls.computeVertexNormals();
    add(walls, wall);

    // Projecting cornice slab (gronda) on which the cone springs.
    const ledge = new THREE.ExtrudeGeometry(roundedRect(HALF + .07, .5, new THREE.Shape()), { depth: CORNICE - .02, bevelEnabled: true, bevelSize: .012, bevelThickness: .01, bevelSegments: 2, curveSegments: 10 });
    ledge.rotateX(-Math.PI / 2);
    add(ledge, cornice, [0, WALL + .01, 0]);

    // Openings sit on the battered wall face: groups are tilted by the batter angle.
    const batter = Math.atan(.026 * HALF / WALL);
    const onWall = (side: number, y: number, along = 0) => {
      const group = new THREE.Group();
      group.rotation.set(-batter, side, 0, 'YXZ');
      group.position.set(Math.sin(side) * HALF + Math.cos(side) * along, y, Math.cos(side) * HALF - Math.sin(side) * along);
      this.model.add(group);
      return group;
    };
    const plainWall = wall.clone();
    plainWall.vertexColors = false;
    const gableTop = material(t.stone, 1.4, { color: '#cdc5b8' });

    // Entrance: arched stone surround, dark reveal, oak door, threshold and the triangular pediment (timpano) above.
    const entrance = onWall(0, 0);
    add(new THREE.ExtrudeGeometry(archRing(.86, .6, .74), { depth: .07, bevelEnabled: true, bevelSize: .012, bevelThickness: .012, bevelSegments: 2, curveSegments: 20 }), cornice, [0, 0, -.005], entrance);
    add(new THREE.BoxGeometry(.13, .12, .1), cornice, [0, 1.15, .04], entrance); // keystone
    add(new THREE.ExtrudeGeometry(arch(.6, .74, new THREE.Shape()), { depth: .01, bevelEnabled: false, curveSegments: 20 }), new THREE.MeshStandardMaterial({ color: '#2a2521', roughness: 1 }), [0, 0, -.004], entrance);
    t.wood.map.repeat.set(1 / .6, 1 / 1.05); t.wood.map.offset.set(.5, 0);
    t.wood.detail.repeat.copy(t.wood.map.repeat); t.wood.detail.offset.copy(t.wood.map.offset);
    add(new THREE.ExtrudeGeometry(arch(.56, .72, new THREE.Shape()), { depth: .018, bevelEnabled: false, curveSegments: 20 }), wood, [0, .01, 0], entrance);
    add(new THREE.BoxGeometry(.92, .06, .26), cornice, [0, .03, .1], entrance);
    const pediment = new THREE.Shape();
    pediment.moveTo(-.72, 0); pediment.lineTo(.72, 0); pediment.lineTo(0, .78); pediment.lineTo(-.72, 0);
    const front = HALF + .05;
    add(new THREE.ExtrudeGeometry(pediment, { depth: 1.1, bevelEnabled: false }), [plainWall, gableTop], [0, CONE_BASE - .01, front - 1.1]);
    for (const side of [-1, 1]) {
      const coping = add(new THREE.BoxGeometry(1.08, .045, .12), cornice, [side * .36, CONE_BASE + .405, front - .05]);
      coping.rotation.z = -side * Math.atan2(.78, .72);
    }

    // Small square window on the east wall.
    const windowFrame = new THREE.Shape();
    roundedRect(.25, .02, windowFrame);
    windowFrame.holes.push(roundedRect(.17, .01, new THREE.Path()));
    const opening = onWall(Math.PI / 2, .82, .35);
    add(new THREE.ExtrudeGeometry(windowFrame, { depth: .06, bevelEnabled: true, bevelSize: .01, bevelThickness: .01, bevelSegments: 1 }), cornice, [0, 0, -.005], opening);
    add(new THREE.BoxGeometry(.34, .34, .02), wood, [0, 0, 0], opening);

    // Cone of overlapping dry-stone chiancarelle, each course stepped inwards and tilted to shed rain.
    const variants = Array.from({ length: 6 }, (_, i) => slab(101 + i * 17));
    const placements: THREE.Matrix4[][] = variants.map(() => []), tints: THREE.Color[][] = variants.map(() => []);
    const dummy = new THREE.Object3D();
    dummy.rotation.order = 'YXZ';
    for (let row = 0; row < COURSES; row++) {
      const r = coneRadius(row / COURSES), count = Math.max(11, Math.round(Math.PI * 2 * r / .26)), step = Math.PI * 2 / count;
      const offset = (row % 2) * step / 2 + rand() * step * .3, height = row / COURSES;
      for (let j = 0; j < count; j++) {
        const angle = offset + j * step + (rand() - .5) * step * .08, outer = r + (rand() - .5) * .018 * Math.min(1, r);
        const variant = Math.floor(rand() * variants.length), scaleX = (Math.PI * 2 * outer / count) * 1.1 / .27;
        dummy.position.set(Math.sin(angle) * (outer - .14), CONE_BASE + row * COURSE + .032 + (rand() - .5) * .008, Math.cos(angle) * (outer - .14));
        dummy.rotation.set(.05 + rand() * .05, angle + (rand() - .5) * .03, (rand() - .5) * .035);
        dummy.scale.set(scaleX, .95 + rand() * .2, .92 + rand() * .16);
        dummy.updateMatrix();
        placements[variant].push(dummy.matrix.clone());
        // Sun-bleached upper courses, darker splash zone near the cornice, occasional weathered slab.
        const weathered = rand() < .08;
        tints[variant].push(new THREE.Color().setHSL(.1 + rand() * .025, weathered ? .025 : .04 + rand() * .05, (weathered ? .64 : .73) + height * .09 + rand() * .14 - (row < 3 ? .06 : 0), THREE.SRGBColorSpace));
      }
    }
    variants.forEach((geometry, i) => {
      const mesh = new THREE.InstancedMesh(geometry, stone, placements[i].length);
      placements[i].forEach((matrix, j) => { mesh.setMatrixAt(j, matrix); mesh.setColorAt(j, tints[i][j]); });
      mesh.castShadow = mesh.receiveShadow = true;
      mesh.computeBoundingSphere();
      this.model.add(mesh);
    });

    // Lime-washed collar closing the cone, then the flared cup and egg-shaped crown proportioned on the estate's pinnacle.
    const collarBase = coneRadius((COURSES - 3.5) / COURSES) + .06;
    add(new THREE.CylinderGeometry(R_TOP + .045, collarBase, 3.5 * COURSE + .1, 48, 1), lime, [0, CONE_TOP - 1.75 * COURSE + .06, 0]);
    const cupProfile = [[0, 0], [.13, 0], [.14, .02], [.11, .05], [.085, .09], [.09, .16], [.115, .25], [.155, .34], [.2, .41], [.215, .43], [.212, .46], [0, .46]];
    const cup = new THREE.LatheGeometry(cupProfile.map(([x, y]) => new THREE.Vector2(x, y)), 72);
    const egg: THREE.Vector2[] = [];
    for (let i = 0; i <= 28; i++) {
      const a = i / 28 * Math.PI;
      egg.push(new THREE.Vector2(Math.max(0, .15 * Math.sin(a) * (1 + .07 * Math.cos(a))), .2 * (1 - Math.cos(a))));
    }
    const crown = new THREE.LatheGeometry(egg, 64);
    for (const geometry of [cup, crown]) {
      const p = geometry.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = 1 + .012 * Math.sin(x * 47 + y * 31) * Math.cos(z * 53 - y * 17);
        p.setXYZ(i, x * k, y, z * k);
      }
      geometry.computeVertexNormals();
    }
    add(cup, lime, [0, CONE_TOP + .08, 0]);
    add(crown, lime, [0, CONE_TOP + .535, 0]);

    // Paving that fades into the page, plus a soft contact shadow under the base.
    const radius = 6.5, groundGeometry = new THREE.RingGeometry(.001, radius, 72, 10), alpha: number[] = [];
    const gp = groundGeometry.attributes.position;
    for (let i = 0; i < gp.count; i++) {
      const d = Math.hypot(gp.getX(i), gp.getY(i)) / radius;
      alpha.push(1, 1, 1, 1 - smooth(clamp01((d - .38) / .6)));
    }
    groundGeometry.setAttribute('color', new THREE.Float32BufferAttribute(alpha, 4));
    groundGeometry.rotateX(-Math.PI / 2);
    t.ground.map.repeat.set(radius * 2 / 3, radius * 2 / 3); t.ground.detail.repeat.copy(t.ground.map.repeat);
    const ground = new THREE.Mesh(groundGeometry, material(t.ground, 1, { vertexColors: true, transparent: true, depthWrite: false }));
    ground.receiveShadow = true;
    ground.renderOrder = -1;
    this.scene.add(ground);
    const blob = document.createElement('canvas');
    blob.width = blob.height = 128;
    const ctx = blob.getContext('2d')!, gradient = ctx.createRadialGradient(64, 64, 30, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(0,0,0,1)'); gradient.addColorStop(.6, 'rgba(0,0,0,.55)'); gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 128, 128);
    const contact = new THREE.Mesh(new THREE.PlaneGeometry(HALF * 2.7, HALF * 2.7), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(blob), transparent: true, opacity: .32, depthWrite: false, color: '#3b3025' }));
    contact.rotation.x = -Math.PI / 2;
    contact.position.y = .004;
    contact.renderOrder = 0;
    this.scene.add(contact);
    const { width, height } = this.container.getBoundingClientRect();
    if (width && height) { this.camera.aspect = width / height; this.camera.updateProjectionMatrix(); }
    await this.renderer.compileAsync(this.scene, this.camera);
  }

  private fit = () => {
    if (this.disposed) return;
    const { width, height } = this.container.getBoundingClientRect();
    if (!width || !height) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.requestFrame();
  };
  private down = (e: PointerEvent) => {
    this.pointer = { id: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp };
    this.velocity = 0;
    this.renderer.domElement.setPointerCapture(e.pointerId);
    this.lastInteraction = performance.now();
  };
  private move = (e: PointerEvent) => {
    if (!this.pointer || this.pointer.id !== e.pointerId) return;
    const delta = (e.clientX - this.pointer.x) * .006, dt = Math.max(8, e.timeStamp - this.pointer.t);
    this.yaw -= delta;
    this.velocity = THREE.MathUtils.clamp(this.velocity * .6 + (-delta / dt * 16.7) * .4, -.07, .07); // radians per 60 Hz frame
    if (e.pointerType === 'mouse') this.pitch = THREE.MathUtils.clamp(this.pitch + (e.clientY - this.pointer.y) * .003, -.02, .55);
    this.pointer = { id: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp };
    this.lastInteraction = performance.now();
    this.requestFrame();
  };
  private up = () => {
    if (this.pointer && performance.now() - this.lastInteraction > 90) this.velocity = 0;
    if (this.motion.matches) this.velocity = 0;
    this.pointer = null; this.lastInteraction = performance.now(); this.requestFrame();
  };
  private contextLost = (e: Event) => { e.preventDefault(); this.setVisible(false); this.onError(); };
  setVisible(visible: boolean) { this.visible = visible; this.sync(); }
  private sync = () => {
    cancelAnimationFrame(this.raf); this.raf = 0; this.lastFrame = 0;
    this.container.dataset.renderState = this.visible && !document.hidden ? (this.motion.matches ? 'reduced-motion' : 'running') : 'paused';
    this.requestFrame();
  };
  private requestFrame() {
    if (!this.raf && this.built && this.visible && !document.hidden && !this.disposed) this.raf = requestAnimationFrame(this.frame);
  }
  private frame = (now: number) => {
    this.raf = 0;
    if (!this.visible || document.hidden || this.disposed) return;
    const settling = Math.abs(this.distance - this.desiredDistance) > .002 || this.target.distanceTo(this.desiredTarget) > .002;
    const active = this.pointer !== null || Math.abs(this.velocity) > .0002 || settling;
    const elapsed = this.lastFrame ? now - this.lastFrame : 100;
    // Full frame rate while the visitor interacts; ~30 fps for the slow idle turn.
    if (!active && elapsed < 32) { this.requestFrame(); return; }
    this.lastFrame = now;
    const dt = Math.min(elapsed / 1000, .1);
    if (!this.pointer && Math.abs(this.velocity) > .0002) { this.yaw += this.velocity * dt * 60; this.velocity *= Math.exp(-dt * 4.5); }
    else if (!this.pointer && !this.motion.matches && now - this.lastInteraction > 6000) this.yaw += dt * .03;
    const easing = this.motion.matches ? 1 : 1 - Math.exp(-dt * 4.5);
    this.distance = THREE.MathUtils.lerp(this.distance, this.desiredDistance, easing);
    this.target.lerp(this.desiredTarget, easing);
    const responsiveDistance = this.distance * Math.max(1, .82 / this.camera.aspect);
    this.camera.position.set(Math.sin(this.yaw) * responsiveDistance, this.target.y + responsiveDistance * this.pitch, Math.cos(this.yaw) * responsiveDistance);
    this.camera.lookAt(this.target);
    this.renderer.render(this.scene, this.camera);
    if (!this.motion.matches || active) this.requestFrame();
  };
  focusDetail(detail: DetailType) {
    const [y, distance] = VIEWS[detail];
    this.desiredTarget.set(0, y, 0); this.desiredDistance = distance; this.requestFrame();
  }
  zoomIn() { this.desiredDistance = Math.max(2, this.desiredDistance * .83); this.requestFrame(); }
  zoomOut() { this.desiredDistance = Math.min(15, this.desiredDistance * 1.2); this.requestFrame(); }
  resetView() { this.yaw = .42; this.pitch = .15; this.velocity = 0; this.focusDetail('overview'); }
  dispose() {
    this.disposed = true; cancelAnimationFrame(this.raf); this.resize.disconnect();
    document.removeEventListener('visibilitychange', this.sync);
    this.motion.removeEventListener('change', this.sync);
    const canvas = this.renderer.domElement;
    canvas.removeEventListener('pointerdown', this.down); canvas.removeEventListener('pointermove', this.move);
    canvas.removeEventListener('pointerup', this.up); canvas.removeEventListener('pointercancel', this.up);
    canvas.removeEventListener('webglcontextlost', this.contextLost);
    const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>(), textures = new Set<THREE.Texture>();
    this.scene.traverse(object => {
      if (object instanceof THREE.Mesh) {
        geometries.add(object.geometry);
        for (const m of Array.isArray(object.material) ? object.material : [object.material]) materials.add(m);
      }
    });
    materials.forEach(material => { Object.values(material).forEach(value => { if (value instanceof THREE.Texture) textures.add(value); }); material.dispose(); });
    textures.forEach(texture => texture.dispose()); geometries.forEach(geometry => geometry.dispose());
    this.scene.environment?.dispose();
    this.sun.shadow.dispose(); this.renderer.dispose(); this.renderer.forceContextLoss(); canvas.remove();
    this.container.dataset.renderState = 'disposed';
  }
}
