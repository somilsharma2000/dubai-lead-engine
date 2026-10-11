// BRAND ASSET MATRIX — Garu the ceramic eagle (3 poses) + 6 module stickers.
// Unified style: claymorphic ceramic white + chrome joints, deep emerald / electric
// mint gradients, soft directional shadows, isolated on transparent background.
// Replaces raster renders when image credits reset; same geometry/slots.

import type { ReactNode } from 'react';

const S = ({ size = 220, children, className = '' }: { size?: number; children: ReactNode; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">{children}</svg>
);

const DEFS = (
  <defs>
    <linearGradient id="ceramic" x1="40" y1="30" x2="180" y2="200" gradientUnits="userSpaceOnUse">
      <stop offset="0" stopColor="#FFFFFF" /><stop offset="0.55" stopColor="#F4F7FA" /><stop offset="1" stopColor="#DCE4EC" />
    </linearGradient>
    <linearGradient id="chrome" x1="60" y1="80" x2="150" y2="160" gradientUnits="userSpaceOnUse">
      <stop offset="0" stopColor="#F1F5F9" /><stop offset="0.5" stopColor="#94A3B8" /><stop offset="1" stopColor="#475569" />
    </linearGradient>
    <radialGradient id="mintGlow" cx="0.5" cy="0.45" r="0.65">
      <stop offset="0" stopColor="#7CFFD4" /><stop offset="0.45" stopColor="#00E699" /><stop offset="1" stopColor="#059669" />
    </radialGradient>
    <radialGradient id="mintHalo" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#00E699" stopOpacity="0.9" /><stop offset="1" stopColor="#00E699" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="emerald" x1="30" y1="30" x2="190" y2="190" gradientUnits="userSpaceOnUse">
      <stop offset="0" stopColor="#0A5C36" /><stop offset="1" stopColor="#064E3B" />
    </linearGradient>
    <filter id="soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="6" /></filter>
    <filter id="glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
  </defs>
);

// ─── GARU — primary hero pose (proud, wings half-raised, breaking bounding box)
export function GaruHero({ size = 220, className = '' }: { size?: number; className?: string }) {
  return (
    <S size={size} className={`mascot ${className}`}>
      {DEFS}
      <ellipse cx="110" cy="196" rx="58" ry="10" fill="#0F172A" opacity="0.12" filter="url(#soft)" />
      {/* crest feathers */}
      <path d="M96 28c2-10 8-16 14-18-3 8-3 14-2 20z" fill="url(#ceramic)" stroke="#CBD5E1" strokeWidth="1" />
      <path d="M112 24c4-9 11-13 18-14-4 7-6 13-6 19z" fill="url(#ceramic)" stroke="#CBD5E1" strokeWidth="1" />
      {/* wings */}
      <path d="M44 118c-14 4-24 14-26 26 12 2 24-2 34-10z" fill="url(#ceramic)" stroke="#CBD5E1" strokeWidth="1.5" />
      <path d="M176 118c14 4 24 14 26 26-12 2-24-2-34-10z" fill="url(#ceramic)" stroke="#CBD5E1" strokeWidth="1.5" />
      {/* body */}
      <path d="M110 44c-30 0-48 24-48 58 0 36 20 62 48 62s48-26 48-62c0-34-18-58-48-58z" fill="url(#ceramic)" stroke="#CBD5E1" strokeWidth="1.5" />
      {/* chest emblem — mint OS ring */}
      <circle cx="110" cy="118" r="20" fill="none" stroke="url(#emerald)" strokeWidth="2.5" opacity="0.9" />
      <circle cx="110" cy="118" r="8" fill="url(#mintGlow)" filter="url(#glow)" />
      {/* head sheen */}
      <ellipse cx="90" cy="72" rx="20" ry="10" fill="#FFFFFF" opacity="0.7" transform="rotate(-18 90 72)" />
      {/* eyes */}
      <circle cx="92" cy="82" r="26" fill="url(#mintHalo)" opacity="0.35" />
      <circle cx="128" cy="82" r="26" fill="url(#mintHalo)" opacity="0.35" />
      <ellipse cx="92" cy="82" rx="9" ry="11" fill="#0B1220" />
      <ellipse cx="128" cy="82" rx="9" ry="11" fill="#0B1220" />
      <ellipse cx="92" cy="82" rx="6" ry="8" fill="url(#mintGlow)" filter="url(#glow)" />
      <ellipse cx="128" cy="82" rx="6" ry="8" fill="url(#mintGlow)" filter="url(#glow)" />
      <circle cx="94" cy="78" r="2" fill="#FFFFFF" /><circle cx="130" cy="78" r="2" fill="#FFFFFF" />
      {/* beak */}
      <path d="M104 96l12 0-6 12z" fill="url(#chrome)" stroke="#94A3B8" strokeWidth="0.5" />
      {/* chrome feet */}
      <ellipse cx="92" cy="182" rx="12" ry="6" fill="url(#chrome)" />
      <ellipse cx="128" cy="182" rx="12" ry="6" fill="url(#chrome)" />
    </S>
  );
}

// ─── GARU — sweeping pose (problem section: clearing away spreadsheets)
export function GaruSweep({ size = 180, className = '' }: { size?: number; className?: string }) {
  return (
    <S size={size} className={`mascot ${className}`}>
      {DEFS}
      <ellipse cx="112" cy="200" rx="52" ry="9" fill="#0F172A" opacity="0.10" filter="url(#soft)" />
      {/* broom — futuristic */}
      <path d="M138 92l44 58" stroke="url(#chrome)" strokeWidth="7" strokeLinecap="round" />
      <path d="M178 146l16 22-30 6z" fill="url(#mintGlow)" opacity="0.85" />
      <path d="M176 152l20 14M172 158l16 16" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
      {/* swept-away papers */}
      <g opacity="0.5">
        <rect x="150" y="96" width="34" height="42" rx="4" fill="#E2E8F0" transform="rotate(18 167 117)" />
        <path d="M158 106h18M158 114h18M158 122h12" stroke="#94A3B8" strokeWidth="2.5" />
        <rect x="176" y="80" width="28" height="36" rx="4" fill="#EDF2F7" transform="rotate(30 190 98)" />
        <path d="M182 90h14M182 97h14M182 104h9" stroke="#94A3B8" strokeWidth="2" />
      </g>
      {/* body (leaning into the sweep) */}
      <path d="M96 58c-28 2-44 26-40 58 4 34 24 58 52 56 26-2 42-26 40-58-2-32-22-58-52-56z" fill="url(#ceramic)" stroke="#CBD5E1" strokeWidth="1.5" />
      {/* eyes squinting with effort */}
      <ellipse cx="82" cy="96" rx="8" ry="9" fill="#0B1220" /><ellipse cx="116" cy="94" rx="8" ry="9" fill="#0B1220" />
      <ellipse cx="82" cy="96" rx="5" ry="6.5" fill="url(#mintGlow)" filter="url(#glow)" /><ellipse cx="116" cy="94" rx="5" ry="6.5" fill="url(#mintGlow)" filter="url(#glow)" />
      <path d="M74 82q8-6 16-2M108 80q8-4 16 0" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
      <path d="M94 110l10 0-5 10z" fill="url(#chrome)" />
      {/* wing on broom */}
      <path d="M118 122c14-4 26 0 34 10-12 6-26 6-36 0z" fill="url(#ceramic)" stroke="#CBD5E1" strokeWidth="1.5" />
      <ellipse cx="88" cy="180" rx="11" ry="5" fill="url(#chrome)" /><ellipse cx="122" cy="180" rx="11" ry="5" fill="url(#chrome)" />
    </S>
  );
}

// ─── GARU — peeking pose (nav/CTA bars: half-visible, waving)
export function GaruPeek({ size = 120, className = '' }: { size?: number; className?: string }) {
  return (
    <S size={size} className={`mascot ${className}`}>
      {DEFS}
      {/* only top half visible — bottom cropped by bar edge */}
      <path d="M110 40c-30 0-46 24-46 56v30h92V96c0-32-16-56-46-56z" fill="url(#ceramic)" stroke="#CBD5E1" strokeWidth="1.5" />
      <ellipse cx="90" cy="66" rx="18" ry="9" fill="#FFFFFF" opacity="0.7" transform="rotate(-18 90 66)" />
      <circle cx="93" cy="78" r="24" fill="url(#mintHalo)" opacity="0.3" /><circle cx="127" cy="78" r="24" fill="url(#mintHalo)" opacity="0.3" />
      <ellipse cx="93" cy="78" rx="8" ry="10" fill="#0B1220" /><ellipse cx="127" cy="78" rx="8" ry="10" fill="#0B1220" />
      <ellipse cx="93" cy="78" rx="5.5" ry="7" fill="url(#mintGlow)" filter="url(#glow)" /><ellipse cx="127" cy="78" rx="5.5" ry="7" fill="url(#mintGlow)" filter="url(#glow)" />
      <circle cx="95" cy="74" r="1.8" fill="#FFFFFF" /><circle cx="129" cy="74" r="1.8" fill="#FFFFFF" />
      <path d="M105 92l10 0-5 10z" fill="url(#chrome)" />
      {/* waving wing */}
      <path d="M168 60c16-12 30-12 40-2-10 12-24 18-38 16z" fill="url(#ceramic)" stroke="#CBD5E1" strokeWidth="1.5" className="mascot-wave" />
      <path d="M156 108c10-2 16 4 16 4M160 116c8 0 14 4 14 4" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
    </S>
  );
}

// ─── STICKERS (unified: clay emerald/mint, soft shadows) ───────────────────

// 1. Core module / OS box — open cube, mint energy inside
export function StickerOS({ size = 96, className = '' }: { size?: number; className?: string }) {
  return (
    <S size={size} className={className}>
      {DEFS}
      <ellipse cx="110" cy="188" rx="56" ry="10" fill="#0F172A" opacity="0.12" filter="url(#soft)" />
      <path d="M110 44l56 26v70l-56 26-56-26V70z" fill="url(#emerald)" opacity="0.92" />
      <path d="M110 44v96l-56-26V70z" fill="#FFFFFF" opacity="0.14" />
      <path d="M54 70l56 26 56-26-56-26z" fill="#0A5C36" opacity="0.55" />
      <path d="M110 96l56-26M110 96L54 70M110 96v70" stroke="#FFFFFF" strokeWidth="2" opacity="0.25" />
      <circle cx="110" cy="106" r="26" fill="url(#mintHalo)" opacity="0.8" />
      <circle cx="110" cy="106" r="12" fill="url(#mintGlow)" filter="url(#glow)" />
      <circle cx="110" cy="106" r="20" fill="none" stroke="#00E699" strokeWidth="1.5" opacity="0.5" />
    </S>
  );
}

// 2. AI specialist engine — microchip with glowing brain
export function StickerAI({ size = 96, className = '' }: { size?: number; className?: string }) {
  return (
    <S size={size} className={className}>
      {DEFS}
      <ellipse cx="110" cy="186" rx="50" ry="9" fill="#0F172A" opacity="0.12" filter="url(#soft)" />
      <rect x="62" y="62" width="96" height="96" rx="18" fill="url(#emerald)" />
      <rect x="62" y="62" width="96" height="42" rx="18" fill="#FFFFFF" opacity="0.10" />
      {[0,1,2,3].map(i => (
        <g key={i} stroke="#00E699" strokeWidth="3" strokeLinecap="round" opacity="0.8">
          <path d={`M${74+i*24} 62V44`} /><path d={`M${74+i*24} 158v18`} />
          <path d={`M62 ${74+i*24}H44`} /><path d={`M158 ${74+i*24}h18`} />
        </g>
      ))}
      <circle cx="110" cy="110" r="30" fill="url(#mintHalo)" opacity="0.7" />
      {/* brain silhouette */}
      <path d="M110 92c-8-6-18-2-18 6-6 2-8 10-2 14-2 8 6 14 12 10 8 4 16-2 14-10 6-4 4-12-2-14 2-8-6-12-14-6z" fill="url(#mintGlow)" filter="url(#glow)" />
      <path d="M110 96v20M102 104h16M104 112h12" stroke="#059669" strokeWidth="1.6" strokeLinecap="round" />
    </S>
  );
}

// 3. Growth & revenue — trend arrow on coin stacks
export function StickerGrowth({ size = 96, className = '' }: { size?: number; className?: string }) {
  return (
    <S size={size} className={className}>
      {DEFS}
      <ellipse cx="110" cy="192" rx="52" ry="9" fill="#0F172A" opacity="0.12" filter="url(#soft)" />
      {/* coin stacks */}
      <g>
        <ellipse cx="80" cy="168" rx="20" ry="7" fill="url(#emerald)" />
        <rect x="60" y="150" width="40" height="18" fill="#0A5C36" />
        <ellipse cx="80" cy="150" rx="20" ry="7" fill="url(#mintGlow)" opacity="0.9" />
        <ellipse cx="140" cy="176" rx="16" ry="6" fill="url(#emerald)" />
        <rect x="124" y="152" width="32" height="24" fill="#064E3B" />
        <ellipse cx="140" cy="152" rx="16" ry="6" fill="url(#mintGlow)" opacity="0.9" />
        <ellipse cx="112" cy="158" rx="17" ry="6" fill="url(#emerald)" />
        <rect x="95" y="130" width="34" height="28" fill="#0A5C36" />
        <ellipse cx="112" cy="130" rx="17" ry="6" fill="url(#mintGlow)" />
      </g>
      {/* arrow */}
      <path d="M56 116L100 78l24 22 34-44" stroke="url(#mintGlow)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />
      <path d="M148 40l14 4-6 14" stroke="url(#mintGlow)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />
    </S>
  );
}

// 4. Data loss — fragmented spreadsheet
export function StickerBroken({ size = 96, className = '' }: { size?: number; className?: string }) {
  return (
    <S size={size} className={className}>
      {DEFS}
      <ellipse cx="110" cy="190" rx="54" ry="9" fill="#0F172A" opacity="0.12" filter="url(#soft)" />
      {/* left fragment (tilted away) */}
      <g transform="rotate(-14 80 120)">
        <rect x="42" y="62" width="62" height="102" rx="10" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2" />
        <rect x="42" y="62" width="62" height="24" rx="10" fill="#E2E8F0" />
        <path d="M54 98h38M54 110h38M54 122h24M54 134h38M54 146h18" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
        {/* torn edge */}
        <path d="M104 62l-6 12 8 10-6 12 8 10-6 12 8 10-6 12 8 10-6 12 8 12" stroke="#E2E8F0" strokeWidth="4" fill="none" />
      </g>
      {/* right fragment (falling) */}
      <g transform="rotate(10 140 130)">
        <rect x="116" y="70" width="62" height="98" rx="10" fill="#EDF2F7" stroke="#CBD5E1" strokeWidth="2" />
        <rect x="116" y="70" width="62" height="24" rx="10" fill="#E2E8F0" />
        <path d="M128 106h38M128 118h30M128 130h38M128 142h22" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
      </g>
      {/* mint warning sparks at the tear */}
      <path d="M110 96l-6-10M114 120l8-8M108 146l-4-10" stroke="#00E699" strokeWidth="4" strokeLinecap="round" filter="url(#glow)" />
    </S>
  );
}

// 5. Lost time — winged alarm clock
export function StickerClock({ size = 96, className = '' }: { size?: number; className?: string }) {
  return (
    <S size={size} className={className}>
      {DEFS}
      <ellipse cx="110" cy="192" rx="48" ry="9" fill="#0F172A" opacity="0.12" filter="url(#soft)" />
      {/* wings */}
      <g className="mascot-float">
        <path d="M52 102c-18-8-30-2-32 12 12 4 22 2 30-4z" fill="url(#ceramic)" stroke="#CBD5E1" strokeWidth="1.5" />
        <path d="M168 102c18-8 30-2 32 12-12 4-22 2-30-4z" fill="url(#ceramic)" stroke="#CBD5E1" strokeWidth="1.5" />
      </g>
      {/* bells */}
      <path d="M70 54a16 16 0 0 1 24-8" stroke="url(#chrome)" strokeWidth="8" strokeLinecap="round" />
      <path d="M150 54a16 16 0 0 0-24-8" stroke="url(#chrome)" strokeWidth="8" strokeLinecap="round" />
      {/* body */}
      <circle cx="110" cy="120" r="52" fill="url(#emerald)" />
      <circle cx="110" cy="120" r="52" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.15" />
      <circle cx="110" cy="120" r="40" fill="#F8FAFC" />
      <path d="M110 120V98M110 120l16 12" stroke="#0A5C36" strokeWidth="5" strokeLinecap="round" />
      <circle cx="110" cy="120" r="5" fill="url(#mintGlow)" filter="url(#glow)" />
      {/* feet */}
      <path d="M92 172l-8 10M128 172l8 10" stroke="url(#chrome)" strokeWidth="7" strokeLinecap="round" />
    </S>
  );
}

// 6. Real-time alerts — golden bell with pulse rings
export function StickerBell({ size = 96, className = '' }: { size?: number; className?: string }) {
  return (
    <S size={size} className={className}>
      {DEFS}
      <ellipse cx="110" cy="190" rx="44" ry="8" fill="#0F172A" opacity="0.12" filter="url(#soft)" />
      {/* pulse rings */}
      <circle cx="110" cy="106" r="52" fill="none" stroke="#00E699" strokeWidth="2" opacity="0.25" />
      <circle cx="110" cy="106" r="64" fill="none" stroke="#00E699" strokeWidth="1.5" opacity="0.12" />
      <circle cx="110" cy="106" r="40" fill="url(#mintHalo)" opacity="0.25" />
      {/* bell */}
      <linearGradient id="gold" x1="70" y1="60" x2="150" y2="160" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#FDE68A" /><stop offset="0.5" stopColor="#F59E0B" /><stop offset="1" stopColor="#B45309" />
      </linearGradient>
      <path d="M110 52c-24 0-38 20-38 44v22l-12 18h100l-12-18V96c0-24-14-44-38-44z" fill="url(#gold)" />
      <path d="M78 118h64l6 12H72z" fill="#B45309" opacity="0.4" />
      <ellipse cx="110" cy="146" rx="10" ry="8" fill="#92400E" />
      <path d="M100 66c6-8 14-10 20-8" stroke="#FEF3C7" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
      <circle cx="110" cy="48" r="7" fill="url(#chrome)" />
    </S>
  );
}

// ─── GARU — workflow pose (integrations & ecosystem: juggling orbiting app icons)
export function GaruJuggle({ size = 200, className = '' }: { size?: number; className?: string }) {
  return (
    <S size={size} className={`mascot ${className}`}>
      {DEFS}
      <ellipse cx="110" cy="204" rx="48" ry="8" fill="#0F172A" opacity="0.10" filter="url(#soft)" />
      {/* orbit ring */}
      <ellipse cx="110" cy="96" rx="86" ry="26" fill="none" stroke="url(#mintGlow)" strokeWidth="2" opacity="0.5" strokeDasharray="6 8" />
      {/* orbiting app bubbles */}
      <g className="mascot-orbit-slow">
        <g transform="translate(30 88)">
          <rect x="-14" y="-12" width="28" height="24" rx="7" fill="url(#ceramic)" stroke="#CBD5E1" strokeWidth="1.5" />
          <path d="M-8 0h16M-8 6h10" stroke="#00E699" strokeWidth="2" strokeLinecap="round" />
        </g>
      </g>
      <g transform="translate(186 82)">
        <circle r="14" fill="url(#ceramic)" stroke="#CBD5E1" strokeWidth="1.5" />
        <path d="M-6-2h12M-6 3h7" stroke="#0A5C36" strokeWidth="2" strokeLinecap="round" />
      </g>
      <g transform="translate(156 58)">
        <path d="M-13 2l8-10 5 6 8-9-3 12z" fill="url(#mintGlow)" stroke="#059669" strokeWidth="1" />
      </g>
      <g transform="translate(58 52)">
        <circle r="6" fill="url(#mintGlow)" filter="url(#glow)" />
        <circle cx="9" cy="-7" r="4" fill="#00E699" opacity="0.6" />
      </g>
      {/* Garu body — same model, energetic float, both wings raised */}
      <path d="M110 66c-28 0-44 22-44 54 0 34 18 56 44 56s44-22 44-56c0-32-16-54-44-54z" fill="url(#ceramic)" stroke="#CBD5E1" strokeWidth="1.5" />
      <ellipse cx="92" cy="92" rx="18" ry="8" fill="#FFFFFF" opacity="0.7" transform="rotate(-18 92 92)" />
      {/* raised wings (juggling) */}
      <path d="M70 118c-16-8-24-22-20-34 12 2 24 12 30 24z" fill="url(#ceramic)" stroke="#CBD5E1" strokeWidth="1.5" />
      <path d="M150 118c16-8 24-22 20-34-12 2-24 12-30 24z" fill="url(#ceramic)" stroke="#CBD5E1" strokeWidth="1.5" />
      {/* eyes — happy */}
      <circle cx="94" cy="102" r="24" fill="url(#mintHalo)" opacity="0.3" /><circle cx="126" cy="102" r="24" fill="url(#mintHalo)" opacity="0.3" />
      <ellipse cx="94" cy="102" rx="8" ry="10" fill="#0B1220" /><ellipse cx="126" cy="102" rx="8" ry="10" fill="#0B1220" />
      <ellipse cx="94" cy="102" rx="5.5" ry="7" fill="url(#mintGlow)" filter="url(#glow)" /><ellipse cx="126" cy="102" rx="5.5" ry="7" fill="url(#mintGlow)" filter="url(#glow)" />
      <path d="M86 88q8-5 14-2M120 86q8-4 14 0" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
      <circle cx="96" cy="98" r="1.8" fill="#FFFFFF" /><circle cx="128" cy="98" r="1.8" fill="#FFFFFF" />
      <path d="M104 116l12 0-6 10z" fill="url(#chrome)" />
      {/* mint OS emblem on chest */}
      <circle cx="110" cy="136" r="14" fill="none" stroke="url(#emerald)" strokeWidth="2" opacity="0.85" />
      <circle cx="110" cy="136" r="6" fill="url(#mintGlow)" filter="url(#glow)" />
      <ellipse cx="92" cy="180" rx="11" ry="5" fill="url(#chrome)" /><ellipse cx="128" cy="180" rx="11" ry="5" fill="url(#chrome)" />
    </S>
  );
}
