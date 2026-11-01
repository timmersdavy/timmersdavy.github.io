// 3D-pijl in de hero van timmersdesign.be (Three.js 0.169.0)
import * as THREE from './three.module.min.js';

const host = document.getElementById('hero3d');
if (host) start(host);

function start(host) {
  const still = new URLSearchParams(location.search).has('still');

  // L-pijl zoals in het logo (stempel): verticale balk, horizontale balk, punt naar rechts
  const s = new THREE.Shape();
  const t = 0.42;
  s.moveTo(-1.3, 1.5);
  s.lineTo(-1.3 + t, 1.5);
  s.lineTo(-1.3 + t, -0.6 + t / 2);
  s.lineTo(0.75, -0.6 + t / 2);
  s.lineTo(0.75, -0.6 + 0.62);
  s.lineTo(1.6, -0.6);
  s.lineTo(0.75, -0.6 - 0.62);
  s.lineTo(0.75, -0.6 - t / 2);
  s.lineTo(-1.3, -0.6 - t / 2);
  s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 6, curveSegments: 4 });
  geo.center();

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: still });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  const canvas = renderer.domElement;
  canvas.style.opacity = '0';
  host.appendChild(canvas);

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  cam.position.set(0, 0, 9);

  const arrow = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xF4762A, roughness: 0.38, metalness: 0.08 }));
  scene.add(arrow);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xC9D0E0, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3, 4, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffd2b0, 1.2); rim.position.set(-5, -2, -3); scene.add(rim);

  // zachte schaduw
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(13,27,62,0.28)'); gr.addColorStop(1, 'rgba(13,27,62,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  shadow.position.set(0, -2.15, -0.5); shadow.rotation.x = -Math.PI / 2.4; scene.add(shadow);

  function size() {
    const r = host.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    cam.aspect = r.width / r.height; cam.updateProjectionMatrix();
  }
  size();
  window.addEventListener('resize', size);

  const base = { x: -0.18, y: -0.55 };
  const target = { ...base }, cur = { ...base };
  let scrollTurn = 0, mouseX = 0, mouseY = 0;
  if (!still) {
    window.addEventListener('pointermove', e => {
      mouseX = e.clientX / window.innerWidth - 0.5;
      mouseY = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });
    window.addEventListener('scroll', () => {
      scrollTurn = Math.min(window.scrollY / window.innerHeight, 1) * Math.PI * 0.9;
    }, { passive: true });
  }

  let visible = true, running = false;
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !running) { running = true; requestAnimationFrame(frame); }
  }).observe(host);

  const t0 = performance.now();
  let shown = false;
  function frame(now) {
    target.y = base.y + mouseX * 1.1 + scrollTurn;
    target.x = base.x + mouseY * 0.6;
    cur.x += (target.x - cur.x) * 0.07; cur.y += (target.y - cur.y) * 0.07;
    arrow.rotation.set(cur.x, cur.y, 0);
    arrow.position.y = still ? 0 : Math.sin((now - t0) / 1000 * 1.2) * 0.06;
    renderer.render(scene, cam);
    if (!shown) { shown = true; canvas.style.opacity = '1'; host.classList.add('is-live'); window.__pijlReady = true; }
    if (visible && !still) requestAnimationFrame(frame); else running = false;
  }
}
