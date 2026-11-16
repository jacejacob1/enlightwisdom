/**
 * "Spark" — the Enlight Wisdom hero robot.
 * Pure Three.js, built from primitives so it stays light and on-brand.
 *
 * Moving parts: cursor-tracking head + eyes, blinking, equaliser mouth that talks,
 * spring-loaded antenna, spinning ear gears and neck ring, swinging arms with claw hands,
 * thruster flame + sparks, orbiting artifacts (gears, books, chips, atoms),
 * a graduation cap (teach mode) and shoulder gears (automate mode).
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type Mode = "idle" | "automate" | "teach";

type Opts = {
  bubble?: HTMLElement | null;
  onSay?: (text: string) => void;
  reducedMotion?: boolean;
};

const C = {
  shell: 0xf4ede4,
  orange: 0xf28c0f,
  amber: 0xffb22e,
  copper: 0xc8622a,
  dark: 0x0e0b09,
  gun: 0x2b2520,
  glow: 0xffb43a,
};

const damp = (a: number, b: number, l: number, dt: number) => a + (b - a) * (1 - Math.exp(-l * dt));
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function gearShape(teeth: number, rOuter: number, rInner: number, hole: number) {
  const s = new THREE.Shape();
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const pts: [number, number][] = [
      [rInner, a],
      [rOuter, a + step * 0.18],
      [rOuter, a + step * 0.42],
      [rInner, a + step * 0.6],
    ];
    pts.forEach(([r, an], j) => {
      const x = Math.cos(an) * r;
      const y = Math.sin(an) * r;
      if (i === 0 && j === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    });
  }
  s.closePath();
  const h = new THREE.Path();
  h.absarc(0, 0, hole, 0, Math.PI * 2, true);
  s.holes.push(h);
  return s;
}

function gearGeo(teeth: number, r: number, depth: number) {
  const g = new THREE.ExtrudeGeometry(gearShape(teeth, r, r * 0.8, r * 0.32), {
    depth,
    bevelEnabled: true,
    bevelThickness: depth * 0.2,
    bevelSize: r * 0.03,
    bevelSegments: 1,
    curveSegments: 6,
  });
  g.center();
  return g;
}

export class Robot {
  private container: HTMLElement;
  private opts: Opts;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private lastFrame = 0;
  private raf = 0;
  private running = false;
  private disposed = false;
  private ro?: ResizeObserver;
  private io?: IntersectionObserver;

  // rig
  private root = new THREE.Group();
  private body = new THREE.Group();
  private torso = new THREE.Group();
  private head = new THREE.Group();
  private eyes = new THREE.Group();
  private eyeL!: THREE.Mesh;
  private eyeR!: THREE.Mesh;
  private happyL!: THREE.Mesh;
  private happyR!: THREE.Mesh;
  private mouthBars: THREE.Mesh[] = [];
  private antenna = new THREE.Group();
  private antennaBulb!: THREE.Mesh;
  private earGears: THREE.Mesh[] = [];
  private neckRing!: THREE.Mesh;
  private arms: { side: number; shoulder: THREE.Group; elbow: THREE.Group; hand: THREE.Group; fingers: THREE.Group[] }[] = [];
  private core!: THREE.Mesh;
  private flame!: THREE.Group;
  private padRing!: THREE.Mesh;
  private cap = new THREE.Group();
  private tassel = new THREE.Group();
  private shoulderGears: THREE.Group[] = [];
  private orbit = new THREE.Group();
  private orbitItems: THREE.Object3D[] = [];
  private screenCanvas: HTMLCanvasElement;
  private screenCtx: CanvasRenderingContext2D;
  private screenTex: THREE.CanvasTexture;
  private sparks!: THREE.Points;
  private sparkData: { p: Float32Array; v: Float32Array; life: Float32Array; next: number };
  private pickables: THREE.Object3D[] = [];
  private raycaster = new THREE.Raycaster();

  // state
  private mode: Mode = "idle";
  private pointer = new THREE.Vector2(0, 0);
  private lastPointerMove = 0;
  private look = { yaw: 0, pitch: 0, eyeX: 0, eyeY: 0 };
  private antennaVel = { x: 0, z: 0, ax: 0, az: 0 };
  private prevHeadYaw = 0;
  private prevHeadPitch = 0;
  private blinkT = 0;
  private nextBlink = 2;
  private waveT = -1;
  private talkT = 0;
  private happyT = 0;
  private capT = 0;
  private gearT = 0;
  private spin = { angle: 0, vel: 0, dragging: false, startX: 0, lastX: 0, moved: 0 };
  private scroll = 0;
  private pokeCount = 0;
  private screenText = "";
  private screenTimer = 0;
  private time = 0;

  private lines = [
    "Hi! I'm Spark, the Enlight Wisdom robot.",
    "I was built by engineers in Chennai.",
    "The same engineers teach in classrooms!",
    "Hover the buttons below. I change gear.",
    "Drag me sideways to spin me around.",
    "That tickles! Scroll down to see what we do.",
  ];

  constructor(container: HTMLElement, opts: Opts = {}) {
    this.container = container;
    this.opts = opts;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.domElement.style.touchAction = "pan-y";
    this.renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    this.camera.position.set(0, 0.8, 10.8);
    this.camera.lookAt(0, 0.5, 0);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // chest screen canvas
    this.screenCanvas = document.createElement("canvas");
    this.screenCanvas.width = 512;
    this.screenCanvas.height = 256;
    this.screenCtx = this.screenCanvas.getContext("2d")!;
    this.screenTex = new THREE.CanvasTexture(this.screenCanvas);
    this.screenTex.colorSpace = THREE.SRGBColorSpace;
    this.screenTex.anisotropy = 4;

    this.sparkData = { p: new Float32Array(160 * 3), v: new Float32Array(160 * 3), life: new Float32Array(160), next: 0 };

    this.buildLights();
    this.buildRobot();
    this.scene.add(this.root);

    this.resize();
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(container);
    this.io = new IntersectionObserver(([e]) => (e.isIntersecting ? this.start() : this.stop()), { threshold: 0.01 });
    this.io.observe(container);

    this.bindEvents();
    this.drawScreen(0);
    this.start();
  }

  // ───────────────────────── build ─────────────────────────
  private buildLights() {
    this.scene.add(new THREE.HemisphereLight(0xfff1e0, 0x2a1406, 0.7));
    const key = new THREE.DirectionalLight(0xfff4e8, 2.2);
    key.position.set(4, 6, 6);
    this.scene.add(key);
    const rimL = new THREE.PointLight(0xff8a1a, 40, 14, 1.6);
    rimL.position.set(-4, 2.5, -2.5);
    this.scene.add(rimL);
    const rimR = new THREE.PointLight(0xffb347, 28, 14, 1.6);
    rimR.position.set(4.5, -1, -2);
    this.scene.add(rimR);
    const under = new THREE.PointLight(0xff7a00, 14, 6, 2);
    under.position.set(0, -2.2, 1);
    this.scene.add(under);
  }

  private buildRobot() {
    const shell = new THREE.MeshPhysicalMaterial({ color: C.shell, roughness: 0.3, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.18 });
    const orange = new THREE.MeshPhysicalMaterial({ color: C.orange, roughness: 0.32, metalness: 0.35, clearcoat: 0.7, clearcoatRoughness: 0.2 });
    const copper = new THREE.MeshStandardMaterial({ color: C.copper, roughness: 0.28, metalness: 0.9 });
    const dark = new THREE.MeshPhysicalMaterial({ color: C.dark, roughness: 0.12, metalness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05 });
    const gun = new THREE.MeshStandardMaterial({ color: C.gun, roughness: 0.35, metalness: 0.85 });
    const glow = new THREE.MeshBasicMaterial({ color: C.glow, toneMapped: false });
    const glowSoft = new THREE.MeshBasicMaterial({ color: 0xff8a1a, toneMapped: false, transparent: true, opacity: 0.85 });

    this.root.add(this.body);
    this.body.add(this.torso);

    // torso: egg-shaped shell
    const torsoMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), shell);
    torsoMesh.scale.set(0.95, 1.05, 0.8);
    this.torso.add(torsoMesh);
    this.pickables.push(torsoMesh);

    // copper belt + core
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.06, 16, 80), copper);
    belt.rotation.x = Math.PI / 2;
    belt.scale.set(1, 0.84, 1);
    belt.position.y = -0.48;
    this.torso.add(belt);
    const coreRing = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.035, 12, 40), gun);
    coreRing.position.set(0, -0.48, 0.7);
    this.torso.add(coreRing);
    this.core = new THREE.Mesh(new THREE.CircleGeometry(0.11, 32), glow.clone());
    this.core.position.set(0, -0.48, 0.715);
    this.torso.add(this.core);

    // curved chest screen
    const bezel = new THREE.Mesh(new THREE.CylinderGeometry(0.835, 0.835, 0.6, 40, 1, true, -0.58, 1.16), dark);
    bezel.position.y = 0.14;
    this.torso.add(bezel);
    const screen = new THREE.Mesh(
      new THREE.CylinderGeometry(0.842, 0.842, 0.5, 40, 1, true, -0.52, 1.04),
      new THREE.MeshBasicMaterial({ map: this.screenTex, toneMapped: false, transparent: true })
    );
    screen.position.y = 0.14;
    this.torso.add(screen);

    // shoulder plates
    for (const side of [-1, 1]) {
      const plate = new THREE.Mesh(new THREE.SphereGeometry(0.34, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), orange);
      plate.position.set(side * 0.86, 0.5, 0);
      plate.rotation.z = -side * 0.5;
      this.torso.add(plate);
    }

    // neck + spinning ring
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.3, 24), gun);
    neck.position.y = 1.08;
    this.torso.add(neck);
    this.neckRing = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.035, 8, 6), copper);
    this.neckRing.rotation.x = Math.PI / 2;
    this.neckRing.position.y = 1.1;
    this.torso.add(this.neckRing);

    // ── head ──
    this.head.position.y = 1.2;
    this.torso.add(this.head);
    const headMesh = new THREE.Mesh(new RoundedBoxGeometry(1.55, 1.08, 1.15, 6, 0.34), shell);
    headMesh.position.y = 0.56;
    this.head.add(headMesh);
    this.pickables.push(headMesh);

    const brow = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.08, 0.08, 2, 0.03), orange);
    brow.position.set(0, 1.12, 0.32);
    this.head.add(brow);

    const visor = new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.74, 0.12, 6, 0.1), dark);
    visor.position.set(0, 0.56, 0.55);
    this.head.add(visor);
    this.pickables.push(visor);

    // eyes
    this.eyes.position.set(0, 0.6, 0.625);
    this.head.add(this.eyes);
    const eyeGeo = new THREE.CapsuleGeometry(0.085, 0.13, 8, 16);
    this.eyeL = new THREE.Mesh(eyeGeo, glow);
    this.eyeR = new THREE.Mesh(eyeGeo, glow);
    this.eyeL.position.x = -0.28;
    this.eyeR.position.x = 0.28;
    this.eyeL.scale.z = this.eyeR.scale.z = 0.3;
    const happyGeo = new THREE.TorusGeometry(0.1, 0.03, 8, 24, Math.PI);
    this.happyL = new THREE.Mesh(happyGeo, glow);
    this.happyR = new THREE.Mesh(happyGeo, glow);
    this.happyL.position.set(-0.28, -0.03, 0);
    this.happyR.position.set(0.28, -0.03, 0);
    this.happyL.visible = this.happyR.visible = false;
    this.eyes.add(this.eyeL, this.eyeR, this.happyL, this.happyR);

    // equaliser mouth
    const barGeo = new THREE.BoxGeometry(0.035, 0.1, 0.02);
    for (let i = 0; i < 7; i++) {
      const b = new THREE.Mesh(barGeo, glowSoft);
      b.position.set((i - 3) * 0.06, 0.36, 0.625);
      b.scale.y = 0.3;
      this.head.add(b);
      this.mouthBars.push(b);
    }

    // ears with spinning gears
    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.14, 32), gun);
      ear.rotation.z = Math.PI / 2;
      ear.position.set(side * 0.8, 0.56, 0);
      this.head.add(ear);
      const g = new THREE.Mesh(gearGeo(10, 0.2, 0.05), orange);
      g.rotation.y = Math.PI / 2;
      g.position.set(side * 0.89, 0.56, 0);
      this.head.add(g);
      this.earGears.push(g);
      const dot = new THREE.Mesh(new THREE.CircleGeometry(0.05, 20), glow);
      dot.rotation.y = side * Math.PI / 2;
      dot.position.set(side * 0.925, 0.56, 0);
      this.head.add(dot);
    }

    // antenna (spring physics)
    this.antenna.position.set(0.32, 1.1, -0.1);
    this.head.add(this.antenna);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.5, 8), gun);
    rod.position.y = 0.25;
    this.antenna.add(rod);
    this.antennaBulb = new THREE.Mesh(new THREE.SphereGeometry(0.075, 20, 16), glow.clone());
    this.antennaBulb.position.y = 0.53;
    this.antenna.add(this.antennaBulb);
    const antBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.06, 16), orange);
    this.antenna.add(antBase);

    // ── graduation cap (teach mode) — echoes the logo ──
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.06, 1.45), orange);
    board.rotation.y = Math.PI / 4;
    board.position.y = 0.26;
    const skull = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.58, 0.3, 32), copper);
    skull.position.y = 0.1;
    const button = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 12), copper);
    button.position.y = 0.31;
    this.tassel.position.set(0, 0.3, 0);
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.72, 6), copper);
    cord.rotation.z = Math.PI / 2;
    cord.position.x = 0.36;
    const drop = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.42, 6), copper);
    drop.position.set(0.72, -0.21, 0);
    const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 10), new THREE.MeshStandardMaterial({ color: C.amber, roughness: 0.6 }));
    tuft.position.set(0.72, -0.48, 0);
    this.tassel.add(cord, drop, tuft);
    this.cap.add(board, skull, button, this.tassel);
    this.cap.position.set(0, 1.08, 0);
    this.cap.rotation.z = -0.08;
    this.cap.scale.setScalar(0.001);
    this.cap.visible = false;
    this.head.add(this.cap);

    // ── arms ──
    for (const side of [-1, 1]) {
      const shoulder = new THREE.Group();
      shoulder.position.set(side * 1.02, 0.4, 0);
      this.torso.add(shoulder);
      const joint = new THREE.Mesh(new THREE.SphereGeometry(0.19, 24, 16), gun);
      shoulder.add(joint);
      const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.36, 8, 16), shell);
      upper.position.y = -0.34;
      shoulder.add(upper);
      this.pickables.push(upper);
      const elbow = new THREE.Group();
      elbow.position.y = -0.68;
      shoulder.add(elbow);
      const elbowJ = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 14), orange);
      elbow.add(elbowJ);
      const fore = new THREE.Mesh(new THREE.CapsuleGeometry(0.135, 0.32, 8, 16), shell);
      fore.position.y = -0.3;
      elbow.add(fore);
      this.pickables.push(fore);
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.025, 8, 24), copper);
      band.rotation.x = Math.PI / 2;
      band.position.y = -0.42;
      elbow.add(band);
      const hand = new THREE.Group();
      hand.position.y = -0.62;
      elbow.add(hand);
      const palm = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 14), gun);
      hand.add(palm);
      const fingers: THREE.Group[] = [];
      for (const f of [-1, 1]) {
        const fg = new THREE.Group();
        fg.position.set(0, -0.06, f * 0.07);
        const seg = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.14, 4, 8), orange);
        seg.position.y = -0.1;
        fg.add(seg);
        hand.add(fg);
        fingers.push(fg);
      }
      this.arms.push({ side, shoulder, elbow, hand, fingers });

      // automate-mode gears behind the shoulders
      const sg = new THREE.Group();
      sg.position.set(side * 0.72, 0.62, -0.62);
      const gA = new THREE.Mesh(gearGeo(12, 0.34, 0.07), copper);
      const gB = new THREE.Mesh(gearGeo(8, 0.2, 0.07), orange);
      gB.position.set(side * 0.42, 0.28, 0.02);
      gB.userData.ratio = -1.6;
      gA.userData.ratio = 1;
      sg.add(gA, gB);
      sg.scale.setScalar(0.001);
      sg.visible = false;
      this.torso.add(sg);
      this.shoulderGears.push(sg);
    }

    // ── thruster ──
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 0.26, 32, 1, true), gun);
    nozzle.position.y = -1.08;
    (nozzle.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
    this.torso.add(nozzle);
    this.flame = new THREE.Group();
    this.flame.position.y = -1.22;
    const outer = new THREE.Mesh(
      new THREE.ConeGeometry(0.3, 0.9, 24, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xff7a00, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false })
    );
    outer.rotation.x = Math.PI;
    outer.position.y = -0.45;
    const inner = new THREE.Mesh(
      new THREE.ConeGeometry(0.16, 0.55, 20, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xfff0c0, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })
    );
    inner.rotation.x = Math.PI;
    inner.position.y = -0.27;
    this.flame.add(outer, inner);
    this.torso.add(this.flame);

    // ── hover pad ──
    const padTex = this.radialTexture("rgba(255,150,40,0.9)", "rgba(255,120,0,0)");
    const pad = new THREE.Mesh(
      new THREE.CircleGeometry(1.5, 48),
      new THREE.MeshBasicMaterial({ map: padTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })
    );
    pad.rotation.x = -Math.PI / 2;
    pad.position.y = -2.45;
    this.scene.add(pad);
    this.padRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.15, 0.018, 8, 96),
      new THREE.MeshBasicMaterial({ color: C.amber, transparent: true, opacity: 0.7, toneMapped: false })
    );
    this.padRing.rotation.x = Math.PI / 2;
    this.padRing.position.y = -2.44;
    this.scene.add(this.padRing);

    // ── orbiting artifacts ──
    this.orbit.position.y = 0.2;
    this.orbit.rotation.x = 0.32;
    this.orbit.rotation.z = -0.12;
    this.root.add(this.orbit);
    const pageMat = new THREE.MeshStandardMaterial({ color: 0xfff3e4, roughness: 0.7 });
    const makeBook = () => {
      const g = new THREE.Group();
      const cover = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.08, 0.26), orange);
      const pages = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.06, 0.24), pageMat);
      pages.position.x = 0.02;
      g.add(cover, pages);
      return g;
    };
    const makeChip = () => {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new RoundedBoxGeometry(0.26, 0.05, 0.26, 2, 0.02), dark));
      const die = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.12), copper);
      die.position.y = 0.035;
      g.add(die);
      for (let i = 0; i < 4; i++)
        for (const s of [-1, 1]) {
          const pin = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.015, 0.06), copper);
          pin.position.set(-0.09 + i * 0.06, 0, s * 0.15);
          g.add(pin);
        }
      return g;
    };
    const makeAtom = () => {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), glow));
      for (let i = 0; i < 3; i++) {
        const r = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.01, 6, 40), copper);
        r.rotation.set(i * 1.05, i * 0.6, 0);
        g.add(r);
      }
      return g;
    };
    const makeGear = () => new THREE.Mesh(gearGeo(9, 0.16, 0.05), copper);
    const makers = [makeGear, makeBook, makeChip, makeAtom];
    const n = 8;
    for (let i = 0; i < n; i++) {
      const item = makers[i % makers.length]();
      const a = (i / n) * Math.PI * 2;
      item.position.set(Math.cos(a) * 2.35, Math.sin(i * 1.7) * 0.25, Math.sin(a) * 2.35);
      item.userData = { a, spin: 0.6 + (i % 3) * 0.4, bob: i * 0.9 };
      this.orbit.add(item);
      this.orbitItems.push(item);
    }

    // ── sparks ──
    const sg = new THREE.BufferGeometry();
    sg.setAttribute("position", new THREE.BufferAttribute(this.sparkData.p, 3));
    this.sparks = new THREE.Points(
      sg,
      new THREE.PointsMaterial({
        size: 0.09,
        map: this.radialTexture("rgba(255,220,150,1)", "rgba(255,120,0,0)"),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        color: 0xffc070,
        toneMapped: false,
      })
    );
    this.sparks.frustumCulled = false;
    for (let i = 0; i < 160; i++) this.sparkData.p[i * 3 + 1] = -99;
    this.scene.add(this.sparks);
  }

  private radialTexture(inner: string, outer: string) {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, inner);
    grd.addColorStop(1, outer);
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  // ───────────────────────── screen ─────────────────────────
  private drawScreen(t: number) {
    const g = this.screenCtx;
    const W = 512;
    const H = 256;
    g.clearRect(0, 0, W, H);
    g.fillStyle = "#120b05";
    g.fillRect(0, 0, W, H);
    // scanlines
    g.fillStyle = "rgba(255,150,40,0.05)";
    for (let y = 0; y < H; y += 4) g.fillRect(0, y, W, 1);
    g.shadowColor = "#ff9a1f";
    g.shadowBlur = 16;
    g.fillStyle = "#ffb43a";
    g.textAlign = "center";
    g.textBaseline = "middle";

    const label = this.screenText;
    if (label) {
      // largest font that fits in at most two lines
      const words = label.split(" ");
      let fs = 96;
      let lines: string[] = [];
      for (; fs >= 34; fs -= 6) {
        g.font = `700 ${fs}px ui-monospace, Menlo, monospace`;
        lines = [];
        let cur = "";
        for (const w of words) {
          const test = cur ? cur + " " + w : w;
          if (g.measureText(test).width > 460 && cur) {
            lines.push(cur);
            cur = w;
          } else cur = test;
        }
        if (cur) lines.push(cur);
        if (lines.length <= 2 && lines.every((l) => g.measureText(l).width <= 470)) break;
      }
      lines.slice(0, 2).forEach((l, i, arr) => g.fillText(l, W / 2, H / 2 + (i - (arr.length - 1) / 2) * (fs + 10)));
    } else if (this.mode === "automate") {
      g.font = "700 50px ui-monospace, Menlo, monospace";
      g.fillText("AUTOMATE", W / 2, 92);
      const p = (t * 0.35) % 1;
      g.shadowBlur = 0;
      g.strokeStyle = "#ffb43a";
      g.lineWidth = 4;
      g.strokeRect(86, 150, 340, 34);
      g.fillRect(94, 158, 324 * p, 18);
      g.font = "500 22px ui-monospace, Menlo, monospace";
      g.fillText(`${Math.floor(p * 100)}% busywork handed to robots`, W / 2, 218);
    } else if (this.mode === "teach") {
      g.font = "700 50px ui-monospace, Menlo, monospace";
      g.fillText("LEARN · BUILD", W / 2, 96);
      g.font = "500 24px ui-monospace, Menlo, monospace";
      const items = ["ROBOTICS", "AI", "CODING", "IoT", "DRONES"];
      g.fillText(`> ${items[Math.floor(t * 1.2) % items.length]}_`, W / 2, 168);
    } else {
      g.font = "700 54px ui-monospace, Menlo, monospace";
      g.fillText(Math.floor(t * 2) % 2 ? "HELLO_" : "HELLO ", W / 2, 96);
      // live equaliser graph
      g.shadowBlur = 8;
      for (let i = 0; i < 22; i++) {
        const h = 10 + Math.abs(Math.sin(t * 3 + i * 0.6) * Math.cos(t * 1.3 + i)) * 60;
        g.fillRect(70 + i * 17, 215 - h, 10, h);
      }
    }
    this.screenTex.needsUpdate = true;
  }

  // ───────────────────────── events ─────────────────────────
  private onPointerMove = (e: PointerEvent) => {
    const r = this.container.getBoundingClientRect();
    this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.lastPointerMove = this.time;

    if (this.spin.dragging) {
      const dx = e.clientX - this.spin.lastX;
      this.spin.vel = dx * 0.012;
      this.spin.angle += dx * 0.012;
      this.spin.moved += Math.abs(dx);
      this.spin.lastX = e.clientX;
    } else if (e.pointerType === "mouse") {
      this.renderer.domElement.style.cursor = this.hit(e) ? "grab" : "default";
    }
  };

  private hit(e: PointerEvent) {
    const r = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(ndc, this.camera);
    return this.raycaster.intersectObjects(this.pickables, false).length > 0;
  }

  private onPointerDown = (e: PointerEvent) => {
    if (!this.hit(e)) return;
    this.spin.dragging = true;
    this.spin.startX = this.spin.lastX = e.clientX;
    this.spin.moved = 0;
    this.renderer.domElement.style.cursor = "grabbing";
    this.renderer.domElement.setPointerCapture?.(e.pointerId);
  };

  private onPointerUp = (e: PointerEvent) => {
    if (!this.spin.dragging) return;
    this.spin.dragging = false;
    this.renderer.domElement.style.cursor = "grab";
    if (this.spin.moved < 6) this.poke();
    else if (Math.abs(this.spin.vel) > 0.05) this.say("Wheee! 360° of engineering.", 2.2);
    this.renderer.domElement.releasePointerCapture?.(e.pointerId);
  };

  private bindEvents() {
    window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    const el = this.renderer.domElement;
    el.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("pointercancel", this.onPointerUp);
  }

  // ───────────────────────── public API ─────────────────────────
  setMode(mode: Mode) {
    if (mode === this.mode) return;
    this.mode = mode;
    if (mode === "automate") this.say("Let's hand the repetitive work to robots.", 2.6, false);
    else if (mode === "teach") this.say("Class is in session! Robotics, AI and coding.", 2.6, false);
    this.burst(mode === "teach" ? new THREE.Vector3(0, 2.6, 0) : new THREE.Vector3(0, 0.6, 0.6), 26);
  }

  setScroll(p: number) {
    this.scroll = clamp(p, 0, 1);
  }

  poke() {
    const line = this.lines[this.pokeCount % this.lines.length];
    this.pokeCount++;
    this.waveT = 0;
    this.happyT = 1.8;
    this.say(line, 3.2);
    this.burst(new THREE.Vector3(0, 1.9, 0.5), 34);
  }

  private say(text: string, seconds: number, screen = true) {
    this.talkT = Math.min(seconds, text.length * 0.06 + 0.6);
    if (screen) {
      const short = text.length > 26 ? text.split(/[.!?,]/)[0].slice(0, 28) : text;
      this.screenText = short.toUpperCase();
      this.screenTimer = seconds;
    }
    this.opts.onSay?.(text);
  }

  private burst(origin: THREE.Vector3, count: number) {
    const d = this.sparkData;
    const wp = origin.clone().applyMatrix4(this.root.matrixWorld);
    for (let k = 0; k < count; k++) {
      const i = d.next;
      d.next = (d.next + 1) % 160;
      d.p[i * 3] = wp.x;
      d.p[i * 3 + 1] = wp.y;
      d.p[i * 3 + 2] = wp.z;
      const a = Math.random() * Math.PI * 2;
      const s = 1.5 + Math.random() * 2.5;
      d.v[i * 3] = Math.cos(a) * s;
      d.v[i * 3 + 1] = 1 + Math.random() * 3;
      d.v[i * 3 + 2] = Math.sin(a) * s * 0.6;
      d.life[i] = 0.8 + Math.random() * 0.6;
    }
  }

  private emitThrust(dt: number) {
    const d = this.sparkData;
    if (Math.random() > dt * 30) return;
    const i = d.next;
    d.next = (d.next + 1) % 160;
    const o = new THREE.Vector3(0, -1.75, 0);
    this.torso.localToWorld(o);
    d.p[i * 3] = o.x + (Math.random() - 0.5) * 0.15;
    d.p[i * 3 + 1] = o.y;
    d.p[i * 3 + 2] = o.z + (Math.random() - 0.5) * 0.15;
    d.v[i * 3] = (Math.random() - 0.5) * 0.6;
    d.v[i * 3 + 1] = -1.5 - Math.random() * 1.5;
    d.v[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
    d.life[i] = 0.4 + Math.random() * 0.3;
  }

  // ───────────────────────── loop ─────────────────────────
  private start() {
    if (this.running || this.disposed) return;
    this.running = true;
    this.lastFrame = performance.now();
    const loop = (now: number) => {
      if (!this.running) return;
      this.raf = requestAnimationFrame(loop);
      const dt = Math.min((now - this.lastFrame) / 1000, 0.05);
      this.lastFrame = now;
      this.update(Math.max(0, dt));
      this.renderer.render(this.scene, this.camera);
    };
    this.raf = requestAnimationFrame(loop);
  }

  private stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private resize() {
    const w = this.container.clientWidth || 1;
    const h = this.container.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.renderer.domElement.style.width = "100%";
    this.renderer.domElement.style.height = "100%";
    this.camera.aspect = w / h;
    // keep the whole robot in frame on narrow screens
    this.camera.fov = w / h < 0.8 ? 38 : 30;
    this.camera.updateProjectionMatrix();
  }

  private screenFrame = 0;
  private update(dt: number) {
    const rm = this.opts.reducedMotion;
    this.time += dt;
    const t = this.time;

    // float + scroll drift
    this.root.position.y = (rm ? 0 : Math.sin(t * 1.4) * 0.09) + this.scroll * 0.8;
    this.root.rotation.x = this.scroll * 0.25;

    // drag-to-spin with inertia; returns to front
    if (!this.spin.dragging) {
      this.spin.angle += this.spin.vel;
      this.spin.vel *= Math.pow(0.04, dt);
      if (Math.abs(this.spin.vel) < 0.002) {
        const target = Math.round(this.spin.angle / (Math.PI * 2)) * Math.PI * 2;
        this.spin.angle = damp(this.spin.angle, target, 3, dt);
      }
    }
    this.body.rotation.y = this.spin.angle;

    // look target: ray through the pointer onto a plane in front of the robot
    const idle = t - this.lastPointerMove > 5;
    let px = this.pointer.x;
    let py = this.pointer.y;
    if (idle) {
      px = Math.sin(t * 0.5) * 0.7;
      py = Math.sin(t * 0.37) * 0.25 + 0.1;
    }
    this.raycaster.setFromCamera(new THREE.Vector2(px, py), this.camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -3.2);
    const target = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(plane, target);
    const headWorld = new THREE.Vector3(0, 1.75, 0).applyMatrix4(this.root.matrixWorld);
    const dx = target.x - headWorld.x;
    const dy = target.y - headWorld.y;
    const dz = Math.max(0.5, target.z - headWorld.z);
    const yaw = clamp(Math.atan2(dx, dz), -0.95, 0.95);
    const pitch = clamp(-Math.atan2(dy, Math.hypot(dx, dz)), -0.45, 0.5);
    this.look.yaw = damp(this.look.yaw, yaw, 6, dt);
    this.look.pitch = damp(this.look.pitch, pitch, 6, dt);
    this.head.rotation.y = this.look.yaw * 0.75;
    this.head.rotation.x = this.look.pitch * 0.7;
    this.head.rotation.z = -this.look.yaw * 0.08;
    this.torso.rotation.y = this.look.yaw * 0.25;
    this.torso.rotation.z = -this.look.yaw * 0.04 + (rm ? 0 : Math.sin(t * 0.9) * 0.015);
    this.look.eyeX = damp(this.look.eyeX, clamp(yaw * 0.16, -0.12, 0.12), 12, dt);
    this.look.eyeY = damp(this.look.eyeY, clamp(-pitch * 0.18, -0.07, 0.07), 12, dt);
    this.eyes.position.x = this.look.eyeX;
    this.eyes.position.y = 0.6 + this.look.eyeY;

    // blink / squint / happy
    this.blinkT += dt;
    if (this.blinkT > this.nextBlink) {
      this.blinkT = 0;
      this.nextBlink = 2 + Math.random() * 3;
    }
    const blink = this.blinkT < 0.14 ? Math.abs(Math.cos((this.blinkT / 0.14) * Math.PI)) : 1;
    this.happyT = Math.max(0, this.happyT - dt);
    const happy = this.happyT > 0 || this.mode === "teach";
    this.happyL.visible = this.happyR.visible = happy;
    this.eyeL.visible = this.eyeR.visible = !happy;
    const squint = this.mode === "automate" ? 0.55 : 1;
    this.eyeL.scale.y = this.eyeR.scale.y = Math.max(0.08, blink * squint);

    // talking mouth
    this.talkT = Math.max(0, this.talkT - dt);
    this.mouthBars.forEach((b, i) => {
      const talking = this.talkT > 0;
      const target = talking ? 0.35 + Math.abs(Math.sin(t * 18 + i * 1.3)) * 1.4 : 0.3 + (i === 3 ? 0.15 : 0);
      b.scale.y = damp(b.scale.y, target, 20, dt);
    });

    // antenna spring: reacts to head motion
    const hv = (this.head.rotation.y - this.prevHeadYaw) / Math.max(dt, 0.001);
    const pv = (this.head.rotation.x - this.prevHeadPitch) / Math.max(dt, 0.001);
    this.prevHeadYaw = this.head.rotation.y;
    this.prevHeadPitch = this.head.rotation.x;
    const a = this.antennaVel;
    a.az += (-a.z * 60 - a.az * 6 + hv * 0.9) * dt;
    a.ax += (-a.x * 60 - a.ax * 6 - pv * 0.9) * dt;
    a.z += a.az * dt;
    a.x += a.ax * dt;
    this.antenna.rotation.z = clamp(a.z, -0.7, 0.7);
    this.antenna.rotation.x = clamp(a.x, -0.7, 0.7);
    const bulbPulse = 0.6 + 0.4 * Math.sin(t * 4);
    (this.antennaBulb.material as THREE.MeshBasicMaterial).color.setRGB(1, 0.55 + bulbPulse * 0.3, 0.15 + bulbPulse * 0.1);
    (this.core.material as THREE.MeshBasicMaterial).color.setRGB(1, 0.5 + 0.25 * Math.sin(t * 3), 0.1);

    // gears & ring
    const gearSpeed = this.mode === "automate" ? 6 : 1.5;
    this.earGears.forEach((g, i) => (g.rotation.z += dt * gearSpeed * (i ? -1 : 1)));
    this.neckRing.rotation.z += dt * (this.mode === "automate" ? 4 : 0.8);

    // arms: idle sway, wave on poke, gesture per mode
    if (this.waveT >= 0) this.waveT += dt;
    if (this.waveT > 2.4) this.waveT = -1;
    for (const arm of this.arms) {
      const s = arm.side;
      let sz = s * 0.16 + (rm ? 0 : Math.sin(t * 1.2 + s) * 0.04);
      let sx = rm ? 0 : Math.sin(t * 1.1 + s * 2) * 0.06;
      let ez = 0;
      let ex = -0.35;
      let grip = 0.25 + Math.sin(t * 2 + s) * 0.08;
      if (this.mode === "automate") {
        // both arms forward, "working"
        sx = -0.9 + Math.sin(t * 5 + s) * 0.12;
        ex = -0.9 + Math.cos(t * 5 + s) * 0.15;
        grip = 0.4 + Math.abs(Math.sin(t * 5)) * 0.4;
      } else if (this.mode === "teach" && s === 1) {
        // raises a hand like a teacher pointing to the board
        sz = s * 2.3;
        ex = 0;
        ez = s * -0.4 + Math.sin(t * 2.2) * 0.08;
      }
      if (this.waveT >= 0 && s === -1) {
        const k = Math.min(1, this.waveT * 4) * Math.min(1, (2.4 - this.waveT) * 4);
        sz = sz * (1 - k) + s * 2.55 * k;
        sx = sx * (1 - k);
        ex = ex * (1 - k);
        ez = Math.sin(this.waveT * 11) * 0.55 * k;
        grip = 0.1;
      }
      arm.shoulder.rotation.z = damp(arm.shoulder.rotation.z, sz, 9, dt);
      arm.shoulder.rotation.x = damp(arm.shoulder.rotation.x, sx, 9, dt);
      arm.elbow.rotation.z = damp(arm.elbow.rotation.z, ez, 12, dt);
      arm.elbow.rotation.x = damp(arm.elbow.rotation.x, ex, 9, dt);
      arm.fingers.forEach((f, i) => (f.rotation.x = (i ? 1 : -1) * grip));
    }

    // graduation cap
    this.capT = damp(this.capT, this.mode === "teach" ? 1 : 0, 7, dt);
    this.cap.visible = this.capT > 0.01;
    const drop = 1 - this.capT;
    this.cap.position.y = 1.08 + drop * 1.8;
    this.cap.scale.setScalar(Math.max(0.001, Math.min(1, this.capT * 1.15)));
    this.cap.rotation.y = drop * 2.5;
    this.tassel.rotation.y = Math.sin(t * 2.4) * 0.5 - this.look.yaw * 0.6;
    this.tassel.rotation.z = Math.sin(t * 3.1) * 0.08;

    // shoulder gears
    this.gearT = damp(this.gearT, this.mode === "automate" ? 1 : 0, 8, dt);
    this.shoulderGears.forEach((sg, i) => {
      sg.visible = this.gearT > 0.01;
      sg.scale.setScalar(Math.max(0.001, this.gearT));
      sg.children.forEach((c) => (c.rotation.z += dt * 3 * (c.userData.ratio as number) * (i ? 1 : -1)));
    });

    // orbit
    const orbitSpeed = this.mode === "automate" ? 0.9 : this.mode === "teach" ? 0.45 : 0.25;
    const radius = this.mode === "idle" ? 2.35 : 2.55;
    this.orbitItems.forEach((it) => {
      const u = it.userData as { a: number; spin: number; bob: number };
      u.a += dt * (rm ? 0.05 : orbitSpeed);
      const r = damp(Math.hypot(it.position.x, it.position.z), radius, 3, dt);
      it.position.x = Math.cos(u.a) * r;
      it.position.z = Math.sin(u.a) * r;
      it.position.y = Math.sin(t * 1.3 + u.bob) * 0.22;
      it.rotation.x += dt * u.spin;
      it.rotation.y += dt * u.spin * 0.7;
    });

    // thruster flicker + pad pulse
    const f = 1 + Math.sin(t * 40) * 0.06 + Math.sin(t * 23) * 0.05 + (this.mode === "automate" ? 0.25 : 0);
    this.flame.scale.set(1, f, 1);
    const pr = 1 + Math.sin(t * 2.8) * 0.04;
    this.padRing.scale.set(pr, pr, pr);

    // sparks
    if (!rm) this.emitThrust(dt);
    const d = this.sparkData;
    for (let i = 0; i < 160; i++) {
      if (d.life[i] <= 0) continue;
      d.life[i] -= dt;
      d.v[i * 3 + 1] -= 4.5 * dt;
      d.p[i * 3] += d.v[i * 3] * dt;
      d.p[i * 3 + 1] += d.v[i * 3 + 1] * dt;
      d.p[i * 3 + 2] += d.v[i * 3 + 2] * dt;
      if (d.life[i] <= 0) d.p[i * 3 + 1] = -99;
    }
    (this.sparks.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;

    // chest screen (~20 fps)
    this.screenTimer = Math.max(0, this.screenTimer - dt);
    if (this.screenTimer === 0) this.screenText = "";
    this.screenFrame += dt;
    if (this.screenFrame > 0.05) {
      this.screenFrame = 0;
      this.drawScreen(t);
    }

    // speech bubble anchor: above the head, projected to screen
    const bubble = this.opts.bubble;
    if (bubble) {
      this.root.updateMatrixWorld();
      const p = new THREE.Vector3(0, this.mode === "teach" ? 1.7 : 1.35, 0);
      this.head.localToWorld(p);
      p.project(this.camera);
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      const bw = bubble.offsetWidth || 220;
      // keep the bubble inside the stage on narrow screens
      const x = clamp((p.x * 0.5 + 0.5) * w - bw * 0.1, 8, Math.max(8, w - bw - 8));
      const y = Math.max(0, (-p.y * 0.5 + 0.5) * h);
      bubble.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translateY(calc(-100% - 14px))`;
    }
  }

  dispose() {
    this.disposed = true;
    this.stop();
    this.ro?.disconnect();
    this.io?.disconnect();
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointercancel", this.onPointerUp);
    this.renderer.domElement.removeEventListener("pointerdown", this.onPointerDown);
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose?.();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose?.();
    });
    this.screenTex.dispose();
    this.scene.environment?.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
