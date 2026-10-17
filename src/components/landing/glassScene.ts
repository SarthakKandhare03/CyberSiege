// ============================================================
// glassScene — WebGL hero: iridescent glass ribbons (three.js)
// Loaded lazily by HeroCanvas so three.js never blocks first paint.
// Colors shift from calm blue to hostile magenta as threat rises.
// ============================================================
import * as THREE from 'three';

export interface GlassSceneHandle {
  setThreat(level: number): void;
  dispose(): void;
}

interface Options {
  reducedMotion: boolean;
  onFirstFrame?: () => void;
}

const CALM = {
  ribbon: new THREE.Color('#3f7dff'),
  ring: new THREE.Color('#6cc8ff'),
  key: new THREE.Color('#2b6bff'),
  rim: new THREE.Color('#38e1ff'),
  accent: new THREE.Color('#ff8a3d'),
};
const HOSTILE = {
  ribbon: new THREE.Color('#ff1f6a'),
  ring: new THREE.Color('#ff5a3d'),
  key: new THREE.Color('#ff2d55'),
  rim: new THREE.Color('#ffb03a'),
  accent: new THREE.Color('#a259ff'),
};

// Studio-like environment built from glowing panels — gives the glass
// those long blue/cyan/orange reflections without loading an HDR file.
function buildEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const env = new THREE.Scene();
  env.background = new THREE.Color('#02030a');
  const panel = (color: string, intensity: number, w: number, h: number, pos: [number, number, number], rotY = 0) => {
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    mesh.position.set(...pos);
    mesh.lookAt(0, 0, 0);
    mesh.rotateZ(rotY);
    env.add(mesh);
  };
  panel('#2f6bff', 6, 14, 1.2, [0, 6, -6]);
  panel('#40e0ff', 8, 1.6, 14, [-8, 0, 2]);
  panel('#9fdcff', 6, 1, 14, [8, 1, 3]);
  panel('#7a5cff', 3, 10, 1, [6, -4, -4], 0.4);
  panel('#ff8a3d', 3.2, 3, 3, [7, 3, 5]);
  panel('#ffffff', 2.5, 6, 0.6, [0, -6, 6]);
  panel('#0b2bff', 4, 8, 8, [0, 0, 10]);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const texture = pmrem.fromScene(env, 0.035).texture;
  pmrem.dispose();
  env.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.geometry.dispose();
      (o.material as THREE.Material).dispose();
    }
  });
  return texture;
}

// Flat glass band swept along a closed, gently twisting path
function buildRibbon(): THREE.BufferGeometry {
  const points: THREE.Vector3[] = [];
  const N = 12;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    points.push(new THREE.Vector3(
      Math.cos(a) * 5.2,
      Math.sin(a * 2) * 0.9 + Math.sin(a) * 0.4,
      Math.sin(a) * 2.6,
    ));
  }
  const path = new THREE.CatmullRomCurve3(points, true, 'centripetal');
  const shape = new THREE.Shape();
  shape.absellipse(0, 0, 0.16, 1.05, 0, Math.PI * 2, false, 0);
  return new THREE.ExtrudeGeometry(shape, { steps: 360, curveSegments: 24, bevelEnabled: false, extrudePath: path });
}

export function createGlassScene(canvas: HTMLCanvasElement, { reducedMotion, onFirstFrame }: Options): GlassSceneHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.4;

  const scene = new THREE.Scene();
  scene.environment = buildEnvironment(renderer);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 1.2, 15);

  // ── Materials ───────────────────────────────────────────
  const ribbonMat = new THREE.MeshPhysicalMaterial({
    color: CALM.ribbon.clone(),
    metalness: 0.25,
    roughness: 0.06,
    transmission: 0.55,
    thickness: 1.4,
    ior: 1.45,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    iridescence: 0.85,
    iridescenceIOR: 1.35,
    iridescenceThicknessRange: [180, 620],
    envMapIntensity: 3,
    attenuationColor: new THREE.Color('#0a1cff'),
    attenuationDistance: 2.5,
  });
  const ringMat = ribbonMat.clone();
  ringMat.color = CALM.ring.clone();
  ringMat.transmission = 0.75;
  ringMat.iridescence = 1;

  // ── Meshes ──────────────────────────────────────────────
  const group = new THREE.Group();
  scene.add(group);

  const ribbon = new THREE.Mesh(buildRibbon(), ribbonMat);
  ribbon.rotation.set(0.35, 0, -0.18);
  ribbon.position.set(0, -1.9, 0);
  group.add(ribbon);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(4.6, 0.32, 48, 220), ringMat);
  ring.scale.set(1, 1, 0.45);
  ring.rotation.set(1.25, 0.15, 0.3);
  ring.position.set(-4.2, -2.6, -2.5);
  group.add(ring);

  const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 8), ringMat);
  orb.position.set(5.8, -2.4, 0.5);
  group.add(orb);

  // ── Lights ──────────────────────────────────────────────
  const key = new THREE.PointLight(CALM.key.clone(), 120, 30);
  key.position.set(-4, 4, 6);
  const rim = new THREE.PointLight(CALM.rim.clone(), 90, 30);
  rim.position.set(6, -1, 4);
  const accent = new THREE.PointLight(CALM.accent.clone(), 18, 20);
  accent.position.set(3, 3, -3);
  scene.add(key, rim, accent, new THREE.AmbientLight('#0b1030', 0.6));

  // ── State ───────────────────────────────────────────────
  let threat = 0;
  let threatShown = 0;
  let pointerX = 0;
  let pointerY = 0;
  let visible = true;
  let running = false;
  let frame = 0;
  let first = true;
  const clock = new THREE.Clock();
  let elapsed = 0;

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Pull back on narrow screens so the ribbon still frames the headline
    camera.position.z = w / h < 1 ? 22 : 15;
    camera.updateProjectionMatrix();
    if (!running) render(0);
  };

  const applyPalette = () => {
    const t = threatShown;
    ribbonMat.color.copy(CALM.ribbon).lerp(HOSTILE.ribbon, t);
    ringMat.color.copy(CALM.ring).lerp(HOSTILE.ring, t);
    ribbonMat.attenuationColor.copy(CALM.ribbon).lerp(HOSTILE.ribbon, t);
    key.color.copy(CALM.key).lerp(HOSTILE.key, t);
    rim.color.copy(CALM.rim).lerp(HOSTILE.rim, t);
    accent.color.copy(CALM.accent).lerp(HOSTILE.accent, t);
  };

  function render(dt: number) {
    threatShown += (threat - threatShown) * Math.min(1, dt * 2.5);
    applyPalette();

    const speed = 0.12 + threatShown * 0.35;
    elapsed += dt * speed;
    ribbon.rotation.y = elapsed;
    ring.rotation.z = 0.3 + elapsed * 0.6;
    orb.position.y = -2.4 + Math.sin(elapsed * 4) * 0.25;

    // Hostile jitter — subtle instability when the city is under attack
    const jitter = threatShown > 0.5 ? (Math.random() - 0.5) * 0.02 * threatShown : 0;
    group.rotation.x += ((pointerY * 0.12) - group.rotation.x) * Math.min(1, dt * 3) + jitter;
    group.rotation.y += ((pointerX * 0.18) - group.rotation.y) * Math.min(1, dt * 3);

    renderer.render(scene, camera);
    if (first) {
      first = false;
      onFirstFrame?.();
    }
  }

  const loop = () => {
    frame = requestAnimationFrame(loop);
    render(Math.min(clock.getDelta(), 0.05));
  };

  const start = () => {
    if (running || reducedMotion || !visible || document.hidden) return;
    running = true;
    clock.getDelta();
    loop();
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(frame);
  };

  // ── Observers ───────────────────────────────────────────
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start(); else stop();
  });
  io.observe(canvas);

  const onVisibility = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', onVisibility);

  const onPointer = (e: PointerEvent) => {
    pointerX = (e.clientX / window.innerWidth) * 2 - 1;
    pointerY = (e.clientY / window.innerHeight) * 2 - 1;
  };
  if (!reducedMotion) window.addEventListener('pointermove', onPointer, { passive: true });

  resize();
  render(0);
  start();

  return {
    setThreat(level: number) {
      threat = Math.min(1, Math.max(0, level));
      if (reducedMotion) {
        threatShown = threat;
        render(0);
      }
    },
    dispose() {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointer);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) o.geometry.dispose();
      });
      ribbonMat.dispose();
      ringMat.dispose();
      scene.environment?.dispose();
      renderer.dispose();
    },
  };
}
