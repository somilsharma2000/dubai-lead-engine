'use client';
// STAGE 4 ENGINE — dynamic scroll-targeting & interactive cursor physics.
// Garu glides between page-section anchor positions (parked strictly in side
// margins / card-border edges, 32px clear of all text), follows the cursor
// with subtle parallax, and jumps on click. Mobile (<768px): parked bottom-
// right at 80px, engine disabled to preserve screen real estate.

import { useEffect, useRef } from 'react';
import { GaruHero } from './Assets';

const ANCHORS = [
  { trigger: '#heroAnchor', x: 80, y: 60 },
  { trigger: '#problemAnchor', x: 0.2, y: 50 },
  { trigger: '#workflowAnchor', x: 0.2, y: 45 },
  { trigger: '#featureAnchor', x: 90, y: 60 },
  { trigger: '#pricingAnchor', x: 0.2, y: 55 },
];

export default function MascotCompanion() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current, img = imgRef.current;
    if (!el || !img) return;
    if (window.matchMedia('(max-width: 767px)').matches) return; // CSS parks it bottom-right

    let gsap: any, ScrollTrigger: any, triggers: any[] = [];
    let alive = true;
    (async () => {
      ({ gsap } = await import('gsap'));
      ({ ScrollTrigger } = await import('gsap/ScrollTrigger'));
      if (!alive) return;
      gsap.registerPlugin(ScrollTrigger);

      gsap.set(el, { left: '80vw', top: '60vh' });

      // 1. dynamic scroll-bound anchor movement
      const moveToAnchor = (t: { x: number; y: number }) =>
        gsap.to(el, { left: `${t.x}vw`, top: `${t.y}vh`, duration: 1.4, ease: 'power2.out', overwrite: 'auto' });
      triggers = ANCHORS.map(a => ScrollTrigger.create({
        trigger: a.trigger, start: 'top center', end: 'bottom center',
        onEnter: () => moveToAnchor(a), onEnterBack: () => moveToAnchor(a),
      }));

      // 2. parallax cursor reaction
      const onMove = (e: MouseEvent) => {
        gsap.to(el, {
          x: (e.clientX / window.innerWidth - 0.5) * 30,
          y: (e.clientY / window.innerHeight - 0.5) * 30,
          duration: 0.6, ease: 'power1.out',
        });
      };
      window.addEventListener('mousemove', onMove);

      // 3. interactive click reaction: jump & spin
      const onClick = () => gsap.timeline()
        .to(img, { y: -30, scale: 1.15, rotation: -8, duration: 0.25, ease: 'power2.out' })
        .to(img, { y: 0, scale: 1, rotation: 0, duration: 0.4, ease: 'bounce.out' });
      el.addEventListener('click', onClick);

      (el as any)._cleanup = () => {
        window.removeEventListener('mousemove', onMove);
        el.removeEventListener('click', onClick);
        triggers.forEach(t => t.kill());
      };
    })();
    return () => { alive = false; (el as any)._cleanup?.(); };
  }, []);

  return (
    <div ref={wrapRef} id="mascotInteractiveContainer" className="mascot-floating-wrapper" aria-hidden="true" title="Garu — say hi!">
      <div ref={imgRef} className="mascot-element mascot-element-accel">
        <GaruHero size={120} />
      </div>
    </div>
  );
}
