'use client';
// MOTION ENGINE — random interactive mascot behaviors.
// Every 7 seconds one random mascot instance jumps or tilts, so the
// page feels alive without any single element constantly demanding attention.
import { useEffect } from 'react';

export default function MascotBehaviors() {
  useEffect(() => {
    const actions = ['jump-action', 'tilt-left', 'tilt-right'];
    const timer = setInterval(() => {
      const mascots = document.querySelectorAll('.mascot-interactive');
      if (!mascots.length) return;
      const m = mascots[Math.floor(Math.random() * mascots.length)];
      const a = actions[Math.floor(Math.random() * actions.length)];
      if (m) {
        m.classList.add(a);
        setTimeout(() => m.classList.remove(a), 1000);
      }
    }, 7000);
    return () => clearInterval(timer);
  }, []);
  return null;
}
