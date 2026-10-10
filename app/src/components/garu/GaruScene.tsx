'use client';
// GARU — the Garuda baby-eagle mascot, live in a tiny 3D desk-world.
// Pure Three.js (no loaders/external models), so it works offline and deploys anywhere.
// Garu stands on the desk, hops, flaps, pecks at a laptop, jumps on books —
// and speaks via the speech-bubble overlay driven by the tips prop.
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function GaruScene({ tips = [], height = 260, onPoke }: { tips?: string[]; height?: number; onPoke?: () => void }) {
  const mount = useRef<HTMLDivElement>(null);
  const [tipIndex, setTipIndex] = useState(0);
  const [bubble, setBubble] = useState<string | null>(null);

  // speech bubble cycling
  useEffect(() => {
    if (!tips.length) return;
    setBubble(tips[0]);
    const iv = setInterval(() => {
      setTipIndex(i => { const n = (i + 1) % tips.length; setBubble(tips[n]); return n; });
    }, 6000);
    return () => clearInterval(iv);
  }, [tips]);

  useEffect(() => {
    const el = mount.current;
    if (!el) return;

    const W = el.clientWidth || 480, H = height;
    const scene = new THREE.Scene();
    scene.background = null;
    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 100);
    camera.position.set(0, 2.4, 7.4);
    camera.lookAt(0, 1.15, 0);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xfff4e0, 1.15));
    const key = new THREE.DirectionalLight(0xffe9c4, 1.6); key.position.set(3, 6, 4); scene.add(key);
    const rim = new THREE.DirectionalLight(0xffd27a, 0.7); rim.position.set(-4, 3, -3); scene.add(rim);

    const GOLD = 0xd4a017, CREAM = 0xf7e7c3, BROWN = 0x8a5a2b, DARK = 0x2b2117, WOOD = 0xb98a4f;

    // ===== THE DESK WORLD =====
    const world = new THREE.Group(); scene.add(world);
    const table = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.22, 3.1), new THREE.MeshStandardMaterial({ color: WOOD, roughness: 0.85 }));
    table.position.y = 1.0; world.add(table);
    [[-2.55, 0], [2.55, 0]].forEach(([x]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.0, 0.16), new THREE.MeshStandardMaterial({ color: WOOD }));
      leg.position.set(x, 0.5, 1.2); world.add(leg);
      const leg2 = leg.clone(); leg2.position.z = -1.2; world.add(leg2);
    });
    // laptop
    const lapBase = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.06, 0.72), new THREE.MeshStandardMaterial({ color: 0x3a3a44 }));
    lapBase.position.set(1.35, 1.14, 0.15); world.add(lapBase);
    const lapScreen = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.68, 0.05), new THREE.MeshStandardMaterial({ color: 0x55555f }));
    lapScreen.position.set(1.35, 1.48, -0.19); lapScreen.rotation.x = -0.28; world.add(lapScreen);
    const lapGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 0.56), new THREE.MeshStandardMaterial({ color: 0xf6c453, emissive: 0xb97e12, emissiveIntensity: 0.75 }));
    lapGlow.position.set(1.35, 1.48, -0.16); lapGlow.rotation.x = -0.28; lapGlow.position.z -= 0.001; world.add(lapGlow);
    // mug
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.24, 20), new THREE.MeshStandardMaterial({ color: 0xb3541e }));
    mug.position.set(-1.6, 1.22, 0.35); world.add(mug);
    const mugHandle = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.03, 10, 18), new THREE.MeshStandardMaterial({ color: 0xb3541e }));
    mugHandle.position.set(-1.42, 1.22, 0.35); mugHandle.rotation.y = Math.PI / 2; world.add(mugHandle);
    // books stack (left)
    const books = new THREE.Group();
    [[0x9c2f2f, 0.16], [0x2f5d9c, 0.15], [0x3f7a3f, 0.14]].forEach(([c, h], i) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.75, h, 0.52), new THREE.MeshStandardMaterial({ color: c as number }));
      b.position.y = i * 0.16 + 0.08; b.rotation.y = i * 0.12; books.add(b);
    });
    books.position.set(-0.85, 1.11, 0.75); world.add(books);
    // tiny plant
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.18, 14), new THREE.MeshStandardMaterial({ color: 0xa25b37 }));
    pot.position.set(-2.0, 1.2, -0.6); world.add(pot);
    for (let i = 0; i < 5; i++) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), new THREE.MeshStandardMaterial({ color: 0x4c8a4c }));
      leaf.position.set(-2.0 + Math.cos(i * 2.2) * 0.09, 1.38 + i * 0.05, -0.6 + Math.sin(i * 2.2) * 0.09);
      leaf.scale.set(1, 1.6, 1); world.add(leaf);
    }
    // mini billboard (for fun)
    const board = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.55, 0.05), new THREE.MeshStandardMaterial({ color: 0xf0e6d2 }));
    board.position.set(2.1, 1.5, -1.0); board.rotation.y = -0.3; world.add(board);
    const boardStand = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.45, 8), new THREE.MeshStandardMaterial({ color: 0x777 }));
    boardStand.position.set(2.1, 1.22, -1.0); world.add(boardStand);

    // ===== GARU (baby eagle) =====
    const garu = new THREE.Group(); scene.add(garu);
    const bodyMat = new THREE.MeshStandardMaterial({ color: GOLD, roughness: 0.55 });
    const creamMat = new THREE.MeshStandardMaterial({ color: CREAM, roughness: 0.7 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 20), bodyMat);
    body.scale.set(1, 1.12, 0.95); garu.add(body);
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.34, 20, 16), creamMat);
    belly.position.set(0, -0.04, 0.16); belly.scale.set(1, 1.05, 0.62); garu.add(belly);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 22, 18), bodyMat);
    head.position.set(0, 0.52, 0.06); garu.add(head);
    // hair tuft feathers
    [[-0.07, 0.79, 0.02], [0, 0.82, 0.06], [0.07, 0.79, 0.02]].forEach(([x, y, z]) => {
      const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.16, 8), bodyMat);
      tuft.position.set(x, y, z); tuft.rotation.z = x * -2.4; tuft.rotation.x = -0.25; garu.add(tuft);
    });
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 12), new THREE.MeshStandardMaterial({ color: 0xf0a830 }));
    beak.rotation.x = Math.PI / 2; beak.position.set(0, 0.5, 0.36); garu.add(beak);
    const eyeMat = new THREE.MeshStandardMaterial({ color: DARK });
    [-1, 1].forEach(s => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), eyeMat);
      eye.position.set(0.115 * s, 0.58, 0.28); garu.add(eye);
      const shine = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      shine.position.set(0.115 * s + 0.018, 0.6, 0.318); garu.add(shine);
    });
    // wings
    const wingGeo = new THREE.SphereGeometry(0.24, 16, 12);
    const wings: THREE.Mesh[] = [];
    [-1, 1].forEach(s => {
      const w = new THREE.Mesh(wingGeo, bodyMat);
      w.position.set(0.4 * s, 0.05, 0); w.scale.set(0.55, 1.05, 0.8); garu.add(w); wings.push(w);
    });
    // tail
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.3, 8), bodyMat);
    tail.position.set(0, -0.1, -0.42); tail.rotation.x = 1.9; garu.add(tail);
    // feet
    const footMat = new THREE.MeshStandardMaterial({ color: 0xe8920c });
    const feet: THREE.Mesh[] = [];
    [-1, 1].forEach(s => {
      const f = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.2), footMat);
      f.position.set(0.14 * s, -0.46, 0.05); garu.add(f); feet.push(f);
    });

    garu.position.set(0, 1.13, -0.15); // stands on the table
    garu.scale.setScalar(0.92);

    // ===== ANIMATION BEHAVIORS =====
    const clock = new THREE.Clock();
    let t = 0, hopT = -1, flapBurst = 0, poke = 0;
    let mood = 'idle'; // idle | peck | hop | celebrate
    let nextEvent = 2.2;
    const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2();
    let wobbleTarget = 0, wobble = 0;

    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObject(garu, true).length > 0;
      el.style.cursor = hit ? 'pointer' : 'default';
    });
    el.addEventListener('pointerdown', (e) => {
      const r = el.getBoundingClientRect();
      pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      if (raycaster.intersectObject(garu, true).length > 0) {
        mood = 'celebrate'; poke = 1; hopT = 0; flapBurst = 2.2;
        wobbleTarget = Math.PI * 2;
        onPoke?.();
      }
    });

    function animate() {
      requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05); t += dt;

      // behavior scheduler
      nextEvent -= dt;
      if (nextEvent <= 0) {
        const roll = Math.random();
        mood = roll < 0.45 ? 'peck' : roll < 0.8 ? 'hop' : 'idle';
        nextEvent = mood === 'peck' ? 2.4 : mood === 'hop' ? 1.8 : 3.0;
      }

      // base breathing + bobbing
      let y = 1.13 + Math.sin(t * 2.1) * 0.018;
      body.scale.y = 1.12 + Math.sin(t * 2.1) * 0.02;
      let zRot = 0, flap = 0;

      if (mood === 'peck') {
        // lean toward the laptop and tap-tap
        const phase = Math.sin(t * 5.5);
        garu.rotation.y = THREE.MathUtils.lerp(garu.rotation.y, 0.65, dt * 3);
        head.position.y = 0.52 + Math.max(0, phase) * 0.02;
        head.rotation.x = Math.max(0, phase) * 0.5;
        flap = Math.max(0, phase) * 0.35;
      } else if (mood === 'hop') {
        if (hopT < 0) hopT = 0;
        hopT += dt * 3.4;
        const h = Math.abs(Math.sin(hopT * Math.PI));
        y += h * 0.16;
        flap = h * 1.3;
        garu.rotation.y = THREE.MathUtils.lerp(garu.rotation.y, Math.sin(t * 0.7) * 0.5, dt * 2);
        if (hopT >= 2) { hopT = -1; }
      } else {
        garu.rotation.y = THREE.MathUtils.lerp(garu.rotation.y, Math.sin(t * 0.4) * 0.35, dt * 1.5);
      }
      if (mood === 'celebrate') {
        poke -= dt;
        y += Math.abs(Math.sin(t * 9)) * 0.1;
        flap = 1.2 + Math.sin(t * 12) * 0.6;
        zRot = Math.sin(t * 10) * 0.08;
        if (poke <= 0) { mood = 'idle'; nextEvent = 1.5; }
      }
      flap = Math.max(flap, flapBurst); flapBurst = Math.max(0, flapBurst - dt * 2);

      // wings flap
      wings.forEach((w, i) => {
        const s = i === 0 ? -1 : 1;
        w.rotation.z = s * (0.35 + flap * 0.9);
        w.position.y = 0.05 + flap * 0.08;
      });
      // feet tuck in the air
      const inAir = y > 1.2;
      feet.forEach(f => { f.rotation.x = inAir ? -0.6 : 0; });

      // gentle table wobble on poke
      wobble = THREE.MathUtils.lerp(wobble, wobbleTarget, dt * 6);
      if (Math.abs(wobble - wobbleTarget) < 0.01) wobbleTarget = 0;
      world.rotation.z = wobble * 0.012;

      garu.position.y = y;
      garu.rotation.z = zRot;
      // head slightly tracks camera
      head.rotation.y = Math.sin(t * 0.5) * 0.15;
      // blinking
      const blink = Math.sin(t * 1.7) > 0.98 ? 0.2 : 1;

      renderer.render(scene, camera);
      void blink;
    }
    animate();

    const onResize = () => {
      const w2 = el.clientWidth || W;
      camera.aspect = w2 / height; camera.updateProjectionMatrix();
      renderer.setSize(w2, height);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      scene.traverse(o => { const m = o as THREE.Mesh; if (m.geometry) m.geometry.dispose(); });
      if (renderer.domElement.parentElement === el) el.removeChild(renderer.domElement);
    };
  }, [height]);

  return (
    <div className="relative" style={{ height }}>
      <div ref={mount} className="w-full" style={{ height }} />
      {bubble && (
        <div className="absolute left-1/2 top-2 -translate-x-1/2 max-w-[88%] bg-white/95 border border-amber-300 rounded-xl px-3 py-2 text-xs text-zinc-800 shadow-lg pointer-events-none">
          <span className="font-semibold text-amber-800">Garu:</span> {bubble}
        </div>
      )}
    </div>
  );
}
