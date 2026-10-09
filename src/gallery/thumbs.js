// Lightweight, original SVG scene art for every gallery card (160×100 view box).
// All ids are prefixed "t-<world>-" because every thumbnail shares one document.
// Elements with ta-* classes animate only while their card is hovered or focused.

import { createRng } from '../lib/random.js';
import { TAU } from '../lib/math.js';

const svg = (id, body) =>
  `<svg class="ww-thumb ww-thumb--${id}" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" focusable="false" aria-hidden="true">${body}</svg>`;

const f1 = (n) => Math.round(n * 10) / 10;

function particlesDots() {
  const rng = createRng(39);
  let out = '';
  for (let i = 0; i < 90; i++) {
    const t = rng.next();
    const a = t * TAU * 3 + rng.range(-0.3, 0.3);
    const r = 6 + t * 46 + rng.range(-4, 4);
    const x = 80 + Math.cos(a) * r * 1.4;
    const y = 50 + Math.sin(a) * r * 0.8;
    const hue = Math.round(180 + t * 120);
    out += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(0.7 + rng.next() * 1.4)}" fill="hsl(${hue} 90% 68%)"/>`;
  }
  return out;
}

function halftoneDots() {
  let out = '';
  for (let y = 5; y < 100; y += 9) {
    for (let x = 5; x < 160; x += 9) {
      const d = Math.hypot(x - 62, y - 48) / 44;
      const v = Math.max(0, 1 - d) * 0.9 + (Math.sin(x * 0.08 + y * 0.05) * 0.5 + 0.5) * 0.25;
      const r = Math.min(4.6, v * 4.6);
      if (r > 0.4) out += `<circle cx="${x}" cy="${y}" r="${f1(r)}"/>`;
    }
  }
  return out;
}

function decoRays() {
  let out = '';
  const n = 26;
  for (let i = 0; i < n; i += 2) {
    const a0 = Math.PI + (i / n) * Math.PI;
    const a1 = Math.PI + ((i + 1) / n) * Math.PI;
    out += `<path d="M80 92L${f1(80 + Math.cos(a0) * 120)} ${f1(92 + Math.sin(a0) * 120)}L${f1(80 + Math.cos(a1) * 120)} ${f1(92 + Math.sin(a1) * 120)}Z"/>`;
  }
  return out;
}

function asciiRows() {
  const ramp = ' .:-=+*#%@';
  const rows = [];
  for (let j = 0; j < 9; j++) {
    let row = '';
    for (let i = 0; i < 30; i++) {
      const x = (i - 15) / 9;
      const y = (j - 4) / 4.2;
      const d = x * x + y * y;
      let ch = ' ';
      if (d < 1) {
        const z = Math.sqrt(1 - d);
        const light = Math.max(0, x * -0.5 + y * -0.5 + z * 0.7);
        ch = ramp[Math.min(ramp.length - 1, Math.floor(light * ramp.length))];
      } else if ((i * 7 + j * 13) % 23 === 0) ch = '.';
      row += ch;
    }
    rows.push(row);
  }
  return rows
    .map((r, j) => `<text x="6" y="${12 + j * 10}" xml:space="preserve">${r.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`)
    .join('');
}

function gearPath(cx, cy, r, teeth, depth) {
  let d = '';
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * TAU;
    const s = TAU / teeth;
    const pts = [
      [r - depth, a],
      [r, a + s * 0.15],
      [r, a + s * 0.45],
      [r - depth, a + s * 0.6],
    ];
    for (const [rr, aa] of pts) d += `${d ? 'L' : 'M'}${f1(cx + Math.cos(aa) * rr)} ${f1(cy + Math.sin(aa) * rr)}`;
  }
  return `${d}Z`;
}

const THUMBS = {
  claymorphism: () =>
    svg(
      'claymorphism',
      `<defs>
        <radialGradient id="t-clay-a" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff"/><stop offset=".4" stop-color="#ffaccd"/><stop offset="1" stop-color="#e2729f"/></radialGradient>
        <radialGradient id="t-clay-b" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#f4fbff"/><stop offset=".4" stop-color="#93d3ff"/><stop offset="1" stop-color="#5a9fd0"/></radialGradient>
        <radialGradient id="t-clay-c" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fffbe8"/><stop offset=".4" stop-color="#ffd77a"/><stop offset="1" stop-color="#e0ab3e"/></radialGradient>
        <filter id="t-clay-soft"><feGaussianBlur stdDeviation="3"/></filter>
      </defs>
      <rect width="160" height="100" fill="#fde4ef"/>
      <rect x="44" y="28" width="84" height="62" rx="20" fill="#d98fb2" opacity=".5" filter="url(#t-clay-soft)"/>
      <rect x="38" y="20" width="84" height="62" rx="20" fill="#ffd0e3"/>
      <rect x="40" y="22" width="80" height="20" rx="14" fill="#fff" opacity=".35"/>
      <rect x="50" y="32" width="38" height="7" rx="3.5" fill="#4a1d3a" opacity=".6"/>
      <rect x="50" y="48" width="56" height="13" rx="6.5" fill="#f2b3cf"/>
      <circle cx="98" cy="54.5" r="8" fill="url(#t-clay-b)"/>
      <rect x="50" y="66" width="30" height="10" rx="5" fill="url(#t-clay-c)"/>
      <circle class="ta-bob" cx="22" cy="70" r="13" fill="url(#t-clay-a)"/>
      <rect class="ta-bob ta-delay" x="122" y="10" width="30" height="15" rx="7.5" fill="url(#t-clay-b)"/>
      <circle class="ta-pulse" cx="142" cy="80" r="9" fill="url(#t-clay-c)"/>`,
    ),

  cybercore: () =>
    svg(
      'cybercore',
      `<rect width="160" height="100" fill="#050806"/>
      <g stroke="#c8ff3d" fill="none">
        <path d="M110 50h18l8 8h24M80 20V9l9-9M50 50H32l-8-8H0M80 80v10l-8 10M101 29l12-12h22M59 71 47 83H28M101 71l14 14h45M59 29 44 14H18" stroke-width="1" opacity=".7"/>
        <circle class="ta-spin" cx="80" cy="50" r="30" stroke-width="1.4" stroke-dasharray="3 3"/>
        <circle cx="80" cy="50" r="22" stroke-width="2"/>
        <circle class="ta-spin ta-rev" cx="80" cy="50" r="15" stroke-width="1" stroke-dasharray="8 4" opacity=".7"/>
      </g>
      <g fill="#c8ff3d"><rect x="157" y="56" width="3" height="4"/><rect x="0" y="40" width="3" height="4"/><rect x="132" y="15" width="4" height="4"/><rect x="26" y="81" width="4" height="4"/></g>
      <circle class="ta-pulse" cx="80" cy="50" r="7" fill="#c8ff3d"/>
      <path d="M6 92h18l3-7 3 13 3-9 3 3h22" stroke="#2de2c4" fill="none" stroke-width="1.2"/>
      <text x="118" y="94" font-family="ui-monospace, Menlo, monospace" font-size="7" fill="#c8ff3d">SYNC 072</text>`,
    ),

  'neo-brutalism': () =>
    svg(
      'neo-brutalism',
      `<rect width="160" height="100" fill="#fff4d6"/>
      <g stroke="#111" stroke-width="3" stroke-linejoin="miter">
        <rect x="16" y="14" width="74" height="28" fill="#111"/>
        <rect x="12" y="10" width="74" height="28" fill="#ffd23f"/>
        <rect x="26" y="68" width="48" height="24" fill="#111"/>
        <rect x="22" y="64" width="48" height="24" fill="#3ddc97"/>
        <rect class="ta-drop" x="98" y="64" width="44" height="24" fill="#ff7eb6"/>
        <rect class="ta-drop ta-delay" x="108" y="40" width="30" height="24" fill="#3a86ff"/>
        <rect x="96" y="88" width="56" height="4" fill="#111"/>
      </g>
      <text x="18" y="31" font-family="'Arial Black', Impact, sans-serif" font-size="13" font-weight="900" fill="#111">LOUD!</text>
      <polygon class="ta-spin" points="128,10 132,20 143,20 134,27 137,37 128,31 119,37 122,27 113,20 124,20" fill="#ff9f1c" stroke="#111" stroke-width="2"/>`,
    ),

  scrapbook: () =>
    svg(
      'scrapbook',
      `<defs><pattern id="t-scrap-dot" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r=".7" fill="#a67d55"/></pattern></defs>
      <rect width="160" height="100" fill="#c9a27a"/>
      <rect width="160" height="100" fill="url(#t-scrap-dot)" opacity=".5"/>
      <g class="ta-sway" transform="rotate(-8 48 50)">
        <rect x="22" y="16" width="52" height="62" fill="#fffdf6"/>
        <rect x="27" y="21" width="42" height="40" fill="#8ec5d6"/>
        <circle cx="57" cy="32" r="6" fill="#ffd27a"/>
        <path d="M27 50q10-7 21 0t21 0v11H27z" fill="#3c7a8c"/>
      </g>
      <rect x="38" y="10" width="26" height="9" fill="#ff9ec7" opacity=".75" transform="rotate(-14 51 14)"/>
      <g class="ta-sway ta-delay" transform="rotate(6 116 50)">
        <rect x="92" y="28" width="50" height="42" fill="#fff6a8"/>
        <path d="M97 40h40M97 48h36M97 56h38M97 64h22" stroke="#b9a24a" stroke-width="1"/>
      </g>
      <rect x="108" y="22" width="22" height="8" fill="#9fd8c4" opacity=".8" transform="rotate(10 119 26)"/>
      <path d="M86 80h48l4 4-4 4H86l4-4z" fill="#ff7b5c"/>
      <path d="M8 90l4-8 4 8-8-5h8z" fill="none" stroke="#3a2a1e" stroke-width="1.2"/>`,
    ),

  surrealism: () =>
    svg(
      'surrealism',
      `<defs><linearGradient id="t-sur-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f3b4d"/><stop offset=".72" stop-color="#7a9e9f"/><stop offset="1" stop-color="#f2c79b"/></linearGradient>
        <linearGradient id="t-sur-day" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fb7ff"/><stop offset="1" stop-color="#dff1ff"/></linearGradient></defs>
      <rect width="160" height="100" fill="url(#t-sur-sky)"/>
      <circle cx="80" cy="100" r="48" fill="#fff1d6"/>
      <circle cx="66" cy="80" r="5" fill="#efdcb5"/><circle cx="96" cy="70" r="7" fill="#efdcb5"/>
      <rect y="82" width="160" height="18" fill="#b9805a"/>
      <path d="M36 82h6v-4h6v-4h6v-4h6v-4h6v-4h6" fill="none" stroke="#3b2a1e" stroke-width="2"/>
      <g class="ta-bob">
        <rect x="112" y="16" width="20" height="34" fill="url(#t-sur-day)" stroke="#3b2a1e" stroke-width="2"/>
        <rect x="112" y="16" width="6" height="34" fill="#6b4630"/>
      </g>
      <path class="ta-drift" d="M18 34q6-5 12 0q-6 5-12 0zm12 0l5-4v8z" fill="#ffb26b"/>`,
    ),

  'y2k-aesthetic': () =>
    svg(
      'y2k-aesthetic',
      `<defs>
        <linearGradient id="t-y2k-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bfe9ff"/><stop offset="1" stop-color="#f3d1ff"/></linearGradient>
        <linearGradient id="t-y2k-rain" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9ad5"/><stop offset=".3" stop-color="#a5f3ff"/><stop offset=".6" stop-color="#fff7a8"/><stop offset="1" stop-color="#b7a6ff"/></linearGradient>
        <linearGradient id="t-y2k-chrome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="#9aa8bb"/><stop offset=".5" stop-color="#4d5b70"/><stop offset=".6" stop-color="#e9f1ff"/><stop offset="1" stop-color="#7d8aa0"/></linearGradient>
      </defs>
      <rect width="160" height="100" fill="url(#t-y2k-bg)"/>
      <rect x="18" y="16" width="92" height="70" rx="16" fill="#fff" fill-opacity=".45" stroke="#fff"/>
      <g class="ta-spin"><circle cx="54" cy="51" r="27" fill="url(#t-y2k-rain)" opacity=".9"/><path d="M54 24a27 27 0 0 1 24 15" stroke="#fff" stroke-width="4" fill="none" opacity=".7"/></g>
      <circle cx="54" cy="51" r="7" fill="#e9f6ff" stroke="#9aa8bb"/>
      <g fill="#ff6fc2"><rect x="88" y="50" width="4" height="20" rx="2"/><rect x="94" y="42" width="4" height="28" rx="2"/><rect x="100" y="56" width="4" height="14" rx="2"/></g>
      <path class="ta-pulse" d="M132 14c2 10 3 11 13 13c-10 2-11 3-13 13c-2-10-3-11-13-13c10-2 11-3 13-13z" fill="url(#t-y2k-chrome)" stroke="#5d6b80" stroke-width=".6"/>
      <path class="ta-pulse ta-delay" d="M138 62c1.4 7 2 7.6 9 9c-7 1.4-7.6 2-9 9c-1.4-7-2-7.6-9-9c7-1.4 7.6-2 9-9z" fill="url(#t-y2k-chrome)" stroke="#5d6b80" stroke-width=".6"/>`,
    ),

  'pixel-art': () =>
    svg(
      'pixel-art',
      `<g shape-rendering="crispEdges">
        <rect width="160" height="100" fill="#4cc3ff"/>
        <rect y="40" width="160" height="12" fill="#6fd0ff"/>
        <rect x="120" y="10" width="16" height="16" fill="#ffe66b"/><rect x="116" y="14" width="24" height="8" fill="#ffe66b"/>
        <g class="ta-drift"><rect x="18" y="16" width="24" height="6" fill="#fff"/><rect x="22" y="12" width="12" height="4" fill="#fff"/></g>
        <path d="M0 70h20v-8h16v-8h20v8h16v12h88v26H0z" fill="#2f8f4e"/>
        <rect y="78" width="160" height="22" fill="#7a4a2a"/><rect y="78" width="160" height="4" fill="#44b85b"/>
        <rect x="32" y="34" width="20" height="20" fill="#9aa0b4"/><rect x="32" y="30" width="4" height="4" fill="#9aa0b4"/><rect x="40" y="30" width="4" height="4" fill="#9aa0b4"/><rect x="48" y="30" width="4" height="4" fill="#9aa0b4"/><rect x="40" y="44" width="4" height="10" fill="#3b3550"/>
        <g class="ta-hop"><rect x="92" y="62" width="8" height="4" fill="#d6303a"/><rect x="92" y="66" width="8" height="4" fill="#f4c08b"/><rect x="92" y="70" width="8" height="6" fill="#3858d6"/><rect x="92" y="76" width="2" height="2" fill="#5a3a22"/><rect x="98" y="76" width="2" height="2" fill="#5a3a22"/></g>
        <rect class="ta-pulse" x="114" y="56" width="6" height="6" fill="#ffd23f"/><rect x="130" y="60" width="6" height="6" fill="#ffd23f"/>
      </g>`,
    ),

  synthwave: () =>
    svg(
      'synthwave',
      `<defs><linearGradient id="t-syn-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14032b"/><stop offset=".6" stop-color="#5d1466"/><stop offset="1" stop-color="#ff6a3d"/></linearGradient>
        <linearGradient id="t-syn-sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe66b"/><stop offset="1" stop-color="#ff3fa4"/></linearGradient>
        <clipPath id="t-syn-clip"><rect width="160" height="62"/></clipPath></defs>
      <rect width="160" height="62" fill="url(#t-syn-sky)"/>
      <g clip-path="url(#t-syn-clip)"><circle cx="80" cy="58" r="27" fill="url(#t-syn-sun)"/>
        <g fill="#b0315f"><rect x="50" y="46" width="60" height="1.5"/><rect x="50" y="51" width="60" height="2.2"/><rect x="50" y="56" width="60" height="3"/></g></g>
      <path d="M0 62l18-14 12 8 16-12 18 18zM160 62l-22-16-10 8-14-10-20 18z" fill="#2a0838" stroke="#ff3fa4" stroke-width=".8"/>
      <rect y="62" width="160" height="38" fill="#12021f"/>
      <g stroke="#ff3fa4" stroke-width=".9"><path d="M80 62L-80 100M80 62L-40 100M80 62L0 100M80 62L40 100M80 62L80 100M80 62L120 100M80 62L160 100M80 62L200 100M80 62L240 100"/>
        <g class="ta-grid"><path d="M0 64.5H160M0 68H160M0 73H160M0 80H160M0 89H160"/></g></g>`,
    ),

  glassmorphism: () =>
    svg(
      'glassmorphism',
      `<defs><filter id="t-glass-blur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter></defs>
      <rect width="160" height="100" fill="#2a1f5c"/>
      <g filter="url(#t-glass-blur)"><circle class="ta-drift" cx="40" cy="30" r="26" fill="#ff6fb1"/><circle cx="120" cy="72" r="30" fill="#5be0ff"/><circle cx="98" cy="18" r="18" fill="#ffd36b"/><circle cx="30" cy="86" r="18" fill="#8b6bff"/></g>
      <rect x="28" y="20" width="86" height="58" rx="12" fill="#fff" fill-opacity=".24" stroke="#fff" stroke-opacity=".7"/>
      <rect x="38" y="32" width="40" height="6" rx="3" fill="#fff" opacity=".85"/><rect x="38" y="44" width="58" height="4" rx="2" fill="#fff" opacity=".55"/><rect x="38" y="62" width="26" height="8" rx="4" fill="#fff" opacity=".7"/>
      <circle class="ta-bob" cx="128" cy="34" r="15" fill="#fff" fill-opacity=".18" stroke="#fff" stroke-width="1.5"/>`,
    ),

  neumorphism: () =>
    svg(
      'neumorphism',
      `<defs><filter id="t-neu-soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="3.5"/></filter></defs>
      <rect width="160" height="100" fill="#e4e9f0"/>
      <circle cx="66" cy="55" r="28" fill="#b3bfcf" filter="url(#t-neu-soft)"/>
      <circle cx="56" cy="45" r="28" fill="#fff" filter="url(#t-neu-soft)"/>
      <circle cx="61" cy="50" r="28" fill="#e4e9f0"/>
      <circle cx="61" cy="50" r="17" fill="#dfe5ed" stroke="#d2dae5"/>
      <g class="ta-spin"><circle cx="61" cy="50" r="17" fill="none"/><circle cx="61" cy="37" r="2.4" fill="#4f6bed"/></g>
      <rect x="106" y="30" width="38" height="16" rx="8" fill="#b3bfcf" filter="url(#t-neu-soft)" transform="translate(2 2)"/>
      <rect x="104" y="28" width="38" height="16" rx="8" fill="#fff" filter="url(#t-neu-soft)" transform="translate(-2 -2)"/>
      <rect x="104" y="28" width="38" height="16" rx="8" fill="#e4e9f0"/>
      <circle cx="134" cy="36" r="6" fill="#4f6bed"/>
      <rect x="104" y="58" width="38" height="16" rx="8" fill="#dde3eb" stroke="#d2dae5"/>
      <circle cx="112" cy="66" r="6" fill="#f4f6fa"/>`,
    ),

  'bento-grid': () =>
    svg(
      'bento-grid',
      `<rect width="160" height="100" fill="#f3efe8"/>
      <rect x="8" y="8" width="64" height="50" rx="7" fill="#ff8a3d"/>
      <rect x="14" y="16" width="32" height="6" rx="3" fill="#2a1406" opacity=".75"/>
      <rect x="76" y="8" width="36" height="24" rx="7" fill="#1d1d1f"/>
      <circle cx="94" cy="20" r="8" fill="none" stroke="#f3efe8" stroke-width="1.2"/><path class="ta-spin" d="M94 20V14" stroke="#ff8a3d" stroke-width="1.4"/>
      <rect x="116" y="8" width="36" height="24" rx="7" fill="#ffd76b"/>
      <circle class="ta-pulse" cx="134" cy="20" r="6" fill="#fff6d8"/>
      <rect x="76" y="36" width="76" height="22" rx="7" fill="#9ad0ff"/>
      <path d="M82 52l12-6 10 3 14-8 12 4 16-6" fill="none" stroke="#14406b" stroke-width="1.6"/>
      <rect x="8" y="62" width="36" height="30" rx="7" fill="#c5f27a"/>
      <rect x="48" y="62" width="52" height="30" rx="7" fill="#fff" stroke="#e2dccf"/>
      <g fill="#ff8a3d"><rect class="ta-bar" x="56" y="74" width="6" height="12" rx="1"/><rect class="ta-bar ta-delay" x="66" y="70" width="6" height="16" rx="1"/><rect class="ta-bar" x="76" y="78" width="6" height="8" rx="1"/><rect class="ta-bar ta-delay" x="86" y="68" width="6" height="18" rx="1"/></g>
      <rect x="104" y="62" width="48" height="30" rx="7" fill="#b9a6ff"/>`,
    ),

  'editorial-design': () =>
    svg(
      'editorial-design',
      `<rect width="160" height="100" fill="#f6f1e7"/>
      <rect x="10" y="9" width="140" height="1.4" fill="#1a1714"/>
      <text x="10" y="20" font-family="Georgia, 'Times New Roman', serif" font-size="6.5" letter-spacing="1.6" fill="#1a1714">FOLIO &amp; FIELD · No 14</text>
      <text x="10" y="45" font-family="Georgia, 'Times New Roman', serif" font-size="22" font-style="italic" fill="#1a1714">The Quiet</text>
      <text x="10" y="58" font-family="Georgia, 'Times New Roman', serif" font-size="9" fill="#c8321e">Engineering of Tides</text>
      <g fill="#7c746a"><rect x="10" y="66" width="40" height="1.6"/><rect x="10" y="70" width="38" height="1.6"/><rect x="10" y="74" width="40" height="1.6"/><rect x="10" y="78" width="36" height="1.6"/><rect x="10" y="82" width="40" height="1.6"/><rect x="56" y="66" width="40" height="1.6"/><rect x="56" y="70" width="40" height="1.6"/><rect x="56" y="74" width="34" height="1.6"/><rect x="56" y="82" width="40" height="1.6"/><rect x="56" y="86" width="38" height="1.6"/></g>
      <text x="10" y="94" font-family="Georgia, serif" font-size="12" fill="#c8321e">T</text>
      <rect x="104" y="18" width="46" height="56" fill="#e7dccb"/>
      <circle class="ta-pulse" cx="127" cy="40" r="11" fill="#c8321e"/>
      <path d="M104 62q12-10 23 0t23 0v12h-46z" fill="#1a1714"/>
      <rect x="104" y="80" width="46" height="1.4" fill="#1a1714"/>`,
    ),

  'swiss-design': () =>
    svg(
      'swiss-design',
      `<rect width="160" height="100" fill="#f2f0eb"/>
      <g stroke="#d8d4cc" stroke-width=".6"><path d="M13.3 0v100M26.7 0v100M40 0v100M53.3 0v100M66.7 0v100M80 0v100M93.3 0v100M106.7 0v100M120 0v100M133.3 0v100M146.7 0v100"/></g>
      <circle class="ta-slide" cx="122" cy="28" r="28" fill="#e2231a"/>
      <rect x="0" y="62" width="106.7" height="7" fill="#111"/>
      <rect class="ta-slide ta-delay" x="40" y="76" width="66.7" height="4" fill="#111"/>
      <text x="8" y="38" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-weight="700" font-size="24" letter-spacing="-1.4" fill="#111">swiss</text>
      <text x="8" y="92" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="5" fill="#111">raster 26 · grid · type · motion</text>`,
    ),

  minimalism: () =>
    svg(
      'minimalism',
      `<rect width="160" height="100" fill="#f7f6f3"/>
      <circle cx="80" cy="50" r="26" fill="none" stroke="#1a1a1a" stroke-width=".6"/>
      <path d="M80 24a26 26 0 0 1 22 12" fill="none" stroke="#1a1a1a" stroke-width="1.6" opacity=".25"/>
      <g class="ta-orbit"><circle cx="80" cy="24" r="2.6" fill="#1a1a1a"/></g>
      <rect x="12" y="88" width="16" height=".8" fill="#1a1a1a"/>
      <text x="12" y="84" font-family="'Helvetica Neue', Arial, sans-serif" font-size="4.2" letter-spacing="1.4" fill="#1a1a1a">MINIMALISM</text>`,
    ),

  maximalism: () =>
    svg(
      'maximalism',
      `<defs><pattern id="t-max-stripe" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#1b4d3e"/><rect width="5" height="10" fill="#f2c14e"/></pattern>
        <pattern id="t-max-dot" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#ff3d7f"/><circle cx="4" cy="4" r="2" fill="#2b1055"/></pattern>
        <pattern id="t-max-check" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#fff4e0"/><rect width="4" height="4" fill="#5a2fd6"/><rect x="4" y="4" width="4" height="4" fill="#5a2fd6"/></pattern></defs>
      <rect width="160" height="100" fill="url(#t-max-stripe)"/>
      <rect x="8" y="8" width="56" height="70" rx="28" fill="url(#t-max-dot)" stroke="#f2c14e" stroke-width="4"/>
      <rect x="96" y="40" width="56" height="52" fill="url(#t-max-check)" stroke="#ff7a1a" stroke-width="4"/>
      <g class="ta-spin" fill="#ff7a1a" stroke="#2b1055" stroke-width="1"><ellipse cx="110" cy="24" rx="5" ry="15"/><ellipse cx="110" cy="24" rx="5" ry="15" transform="rotate(45 110 24)"/><ellipse cx="110" cy="24" rx="5" ry="15" transform="rotate(90 110 24)"/><ellipse cx="110" cy="24" rx="5" ry="15" transform="rotate(135 110 24)"/></g>
      <circle cx="110" cy="24" r="5" fill="#f2c14e"/>
      <text x="40" y="94" font-family="Georgia, serif" font-style="italic" font-size="16" fill="#fff4e0" stroke="#2b1055" stroke-width=".6">More!</text>
      <polygon class="ta-pulse" points="76,52 80,62 91,62 82,68 85,78 76,72 67,78 70,68 61,62 72,62" fill="#3ddcf5" stroke="#2b1055"/>`,
    ),

  'luxury-typography': () =>
    svg(
      'luxury-typography',
      `<rect width="160" height="100" fill="#0b0a09"/>
      <rect x="20" y="20" width="120" height=".6" fill="#c9a45c"/><rect x="20" y="80" width="120" height=".6" fill="#c9a45c"/>
      <text x="80" y="16" text-anchor="middle" font-family="Didot, 'Bodoni 72', 'Bodoni MT', Georgia, serif" font-size="5" letter-spacing="2.4" fill="#c9a45c">COLLECTION N° 07</text>
      <text class="ta-rise" x="80" y="64" text-anchor="middle" font-family="Didot, 'Bodoni 72', 'Bodoni MT', Georgia, serif" font-size="38" font-style="italic" fill="#f3ece0">Luxe</text>
      <path d="M77 88l3-3 3 3-3 3z" fill="#c9a45c"/>`,
    ),

  'conceptual-sketch': () =>
    svg(
      'conceptual-sketch',
      `<defs><pattern id="t-sketch-grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" fill="none" stroke="#c9d9ea" stroke-width=".5"/></pattern></defs>
      <rect width="160" height="100" fill="#f4f1ea"/><rect width="160" height="100" fill="url(#t-sketch-grid)"/>
      <g stroke="#7aa7d6" stroke-width=".6" fill="none"><path d="M10 84H150M40 10V96"/><circle cx="62" cy="50" r="5"/><path d="M40 84L110 22" stroke-dasharray="2 2"/></g>
      <g class="ta-draw" stroke="#3a3a3a" stroke-width="1.3" fill="none" stroke-linecap="round">
        <ellipse cx="44" cy="84" rx="20" ry="5"/><path d="M44 80L62 50L96 32"/><path d="M90 26l20 10-6 14-22-12z"/>
      </g>
      <text x="106" y="70" font-family="'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive" font-size="8" fill="#3a3a3a">warm light</text>
      <path d="M104 66q-6-6-4-14" stroke="#3a3a3a" fill="none" stroke-width=".8"/>`,
    ),

  ethereal: () =>
    svg(
      'ethereal',
      `<defs>
        <radialGradient id="t-eth-a"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
        <linearGradient id="t-eth-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3dcff"/><stop offset=".6" stop-color="#fbe9f1"/><stop offset="1" stop-color="#e2f6ef"/></linearGradient>
        <radialGradient id="t-eth-b"><stop offset="0" stop-color="#d9ccff" stop-opacity=".9"/><stop offset="1" stop-color="#d9ccff" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="160" height="100" fill="url(#t-eth-bg)"/>
      <ellipse class="ta-drift" cx="50" cy="60" rx="70" ry="22" fill="url(#t-eth-b)"/>
      <path d="M60 0l-30 100h40zM110 0l-10 100h36z" fill="#fff" opacity=".22"/>
      <circle class="ta-bob" cx="44" cy="40" r="9" fill="url(#t-eth-a)"/><circle class="ta-bob ta-delay" cx="98" cy="28" r="6" fill="url(#t-eth-a)"/><circle cx="122" cy="62" r="11" fill="url(#t-eth-a)"/><circle cx="76" cy="74" r="5" fill="url(#t-eth-a)"/><circle cx="20" cy="18" r="4" fill="url(#t-eth-a)"/>`,
    ),

  bohemian: () =>
    svg(
      'bohemian',
      `<rect width="160" height="100" fill="#f3e6d3"/>
      <path d="M44 100V48a36 36 0 0 1 72 0v52z" fill="#f7d8b5"/>
      <g fill="none" stroke-width="7"><path d="M52 100V52a28 28 0 0 1 56 0v48" stroke="#c2643c"/><path d="M60 100V54a20 20 0 0 1 40 0v46" stroke="#d9a441"/><path d="M68 100V56a12 12 0 0 1 24 0v44" stroke="#8a9a6b"/></g>
      <g class="ta-spin"><circle cx="80" cy="30" r="9" fill="#d9a441"/><path d="M80 14v4M80 42v4M64 30h4M92 30h4M69 19l3 3M88 38l3 3M69 41l3-3M88 22l3-3" stroke="#d9a441" stroke-width="2" stroke-linecap="round"/></g>
      <g class="ta-sway" stroke="#a4472a" stroke-width="1.2"><path d="M14 0v40M18 0v46M22 0v42M26 0v48M30 0v40"/></g>
      <path d="M126 100c0-20 8-32 20-40c-4 14-6 26-8 40z" fill="#8a9a6b"/>
      <g fill="#a4472a"><path d="M0 92l6-6 6 6-6 6zM12 92l6-6 6 6-6 6zM24 92l6-6 6 6-6 6z"/></g>`,
    ),

  victorian: () =>
    svg(
      'victorian',
      `<rect width="160" height="100" fill="#16261d"/>
      <rect x="8" y="8" width="84" height="84" fill="none" stroke="#c9a14a" stroke-width="2"/>
      <rect x="12" y="12" width="76" height="76" fill="#efe4c8" stroke="#c9a14a" stroke-width=".8"/>
      <g stroke="#3b2f22" stroke-width=".8" fill="none"><path d="M50 82Q48 50 56 20"/>
        <path d="M49 72l-12-6M49 64l-13-7M50 56l-12-8M51 48l-11-8M52 40l-9-8M54 32l-7-6M50 70l11-7M50 62l12-8M51 54l12-8M52 46l11-8M53 38l9-7M55 30l7-6"/></g>
      <g fill="#c9a14a"><circle cx="12" cy="12" r="3"/><circle cx="88" cy="12" r="3"/><circle cx="12" cy="88" r="3"/><circle cx="88" cy="88" r="3"/></g>
      <path class="ta-spin" d="${gearPath(124, 36, 20, 14, 4)}" fill="#c9a14a"/>
      <circle cx="124" cy="36" r="6" fill="#16261d"/>
      <path class="ta-spin ta-rev" d="${gearPath(132, 72, 13, 10, 3.4)}" fill="#a8823a"/>
      <circle cx="132" cy="72" r="4" fill="#16261d"/>`,
    ),

  cyberpunk: () =>
    svg(
      'cyberpunk',
      `<defs><linearGradient id="t-cp-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07061a"/><stop offset="1" stop-color="#3a0f4d"/></linearGradient></defs>
      <rect width="160" height="100" fill="url(#t-cp-sky)"/>
      <g fill="#120c26"><rect x="0" y="20" width="34" height="80"/><rect x="126" y="12" width="34" height="88"/><rect x="40" y="40" width="22" height="60"/><rect x="100" y="34" width="22" height="66"/></g>
      <g fill="#ffcf5c" opacity=".7"><rect x="6" y="30" width="3" height="3"/><rect x="16" y="40" width="3" height="3"/><rect x="132" y="24" width="3" height="3"/><rect x="146" y="44" width="3" height="3"/><rect x="106" y="50" width="3" height="3"/></g>
      <rect x="4" y="54" width="24" height="10" rx="2" fill="none" stroke="#ff2bd6" stroke-width="1.6"/>
      <rect x="132" y="60" width="10" height="26" rx="2" fill="none" stroke="#2bf0ff" stroke-width="1.6"/>
      <rect y="86" width="160" height="14" fill="#0b0716"/>
      <path d="M8 92h20M132 90v8" stroke="#ff2bd6" stroke-width="2" opacity=".4"/>
      <g class="ta-rain" stroke="#9fd8ff" stroke-width=".7" opacity=".7"><path d="M20 4l-3 9M50 10l-3 9M80 2l-3 9M110 14l-3 9M140 6l-3 9M66 30l-3 9M96 26l-3 9M30 44l-3 9M120 42l-3 9M76 56l-3 9"/></g>`,
    ),

  'wabi-sabi': () =>
    svg(
      'wabi-sabi',
      `<rect width="160" height="100" fill="#ece6da"/>
      <path class="ta-draw" d="M118 18c16 2 26 16 22 32s-20 26-36 22-24-20-18-34c3-8 10-14 18-16" fill="none" stroke="#2b2522" stroke-width="5" stroke-linecap="round" opacity=".88"/>
      <path d="M14 68c2 18 16 26 34 26s32-8 34-26z" fill="#8c8170"/>
      <path d="M14 68h68" stroke="#6f6556" stroke-width="2"/>
      <path d="M40 70l4 8-3 6 5 8" fill="none" stroke="#d4a943" stroke-width="1.4"/>
      <path class="ta-fall" d="M100 30q6-4 10 2q-6 4-10-2z" fill="#b5643c"/>`,
    ),

  particles: () => svg('particles', `<rect width="160" height="100" fill="#06070d"/><g class="ta-spin">${particlesDots()}</g>`),

  'liquid-morph': () =>
    svg(
      'liquid-morph',
      `<defs><linearGradient id="t-liq-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7cffe0"/><stop offset=".5" stop-color="#2ee6c0"/><stop offset="1" stop-color="#2a6cf5"/></linearGradient></defs>
      <rect width="160" height="100" fill="#06222a"/>
      <path class="ta-pulse" d="M52 30c18-14 44-8 54 8s8 34-10 42-40 10-52-4-10-34 8-46z" fill="url(#t-liq-g)"/>
      <path d="M106 52c6-2 12 0 14 4" stroke="url(#t-liq-g)" stroke-width="7" stroke-linecap="round" fill="none"/>
      <circle class="ta-bob" cx="126" cy="60" r="9" fill="url(#t-liq-g)"/>
      <circle cx="36" cy="20" r="6" fill="url(#t-liq-g)"/>
      <ellipse cx="66" cy="40" rx="10" ry="5" fill="#fff" opacity=".35" transform="rotate(-25 66 40)"/>`,
    ),

  holographic: () =>
    svg(
      'holographic',
      `<defs><linearGradient id="t-holo-foil" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9de2"/><stop offset=".25" stop-color="#9dd9ff"/><stop offset=".5" stop-color="#b4ffcf"/><stop offset=".75" stop-color="#fff3a3"/><stop offset="1" stop-color="#c5a3ff"/></linearGradient>
        <linearGradient id="t-holo-beam" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#9dd9ff" stop-opacity=".6"/><stop offset="1" stop-color="#9dd9ff" stop-opacity="0"/></linearGradient></defs>
      <rect width="160" height="100" fill="#0a0a12"/>
      <g class="ta-tilt"><rect x="18" y="16" width="48" height="68" rx="6" fill="url(#t-holo-foil)" transform="rotate(-8 42 50)"/>
      <path d="M42 36l8 14-8 14-8-14z" fill="none" stroke="#fff" stroke-width="1.5" opacity=".8" transform="rotate(-8 42 50)"/></g>
      <path d="M118 88L96 30h44z" fill="url(#t-holo-beam)"/>
      <ellipse cx="118" cy="90" rx="16" ry="4" fill="#3a3a5a"/>
      <g fill="none" stroke="#b5a4ff" stroke-width="1"><ellipse class="ta-bob" cx="118" cy="40" rx="18" ry="5"/><ellipse class="ta-bob ta-delay" cx="118" cy="52" rx="14" ry="4" stroke="#9dffe0"/><ellipse cx="118" cy="64" rx="10" ry="3" stroke="#ff9de2"/></g>`,
    ),

  'neon-glow': () =>
    svg(
      'neon-glow',
      `<defs><pattern id="t-neon-brick" width="20" height="10" patternUnits="userSpaceOnUse"><rect width="20" height="10" fill="#1d1416"/><path d="M0 9.5H20M10 0v5M0 5h20M0 5v5M20 5v5" stroke="#120c0e" stroke-width="1"/></pattern>
        <filter id="t-neon-glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <rect width="160" height="100" fill="url(#t-neon-brick)"/>
      <g filter="url(#t-neon-glow)" fill="none" stroke-linecap="round">
        <rect x="16" y="18" width="128" height="64" rx="12" stroke="#5fd1ff" stroke-width="1.6"/>
        <text class="ta-glow" x="80" y="60" text-anchor="middle" font-family="'Snell Roundhand', 'Brush Script MT', 'Segoe Script', cursive" font-size="30" stroke="#ff4fa3" stroke-width="1.6">open late</text>
      </g>`,
    ),

  'wireframe-3d': () => {
    let lines = '';
    for (let i = 1; i < 6; i++) {
      const y = 50 + (i - 3) * 11;
      const rx = Math.sqrt(Math.max(0, 1 - ((i - 3) / 3.3) ** 2)) * 34;
      lines += `<ellipse cx="80" cy="${y}" rx="${f1(rx)}" ry="${f1(rx * 0.22)}"/>`;
    }
    for (let i = 0; i < 6; i++) lines += `<ellipse cx="80" cy="50" rx="${f1(Math.abs(Math.cos((i / 6) * Math.PI)) * 34 + 0.5)}" ry="36"/>`;
    return svg(
      'wireframe-3d',
      `<rect width="160" height="100" fill="#05060a"/>
      <g stroke="#1b2a3a" stroke-width=".6"><path d="M0 92h160M20 80l-30 20M60 80l-10 20M100 80l10 20M140 80l30 20M0 84h160"/></g>
      <g class="ta-spin" fill="none" stroke="#5cf2ff" stroke-width=".8" opacity=".9">${lines}</g>`,
    );
  },

  'kinetic-type': () =>
    svg(
      'kinetic-type',
      `<rect width="160" height="100" fill="#111"/>
      <g font-family="'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="38" fill="#f5f1e8">
        <text class="ta-bob" x="8" y="56">M</text><text class="ta-bob ta-delay" x="42" y="48" fill="#ff4f1f">O</text><text class="ta-bob" x="78" y="62" transform="rotate(8 92 50)">V</text><text class="ta-bob ta-delay" x="110" y="52">E</text>
      </g>
      <g font-family="'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="12" fill="#f5f1e8" opacity=".55"><text x="10" y="88" letter-spacing="5">EVERY LETTER</text></g>`,
    ),

  isometric: () => {
    const cube = (x, y, h, top, left, right) =>
      `<path d="M${x} ${y - h}l16 -8 16 8 -16 8z" fill="${top}"/><path d="M${x} ${y - h}v${h}l16 8v${-h}z" fill="${left}"/><path d="M${x + 32} ${y - h}v${h}l-16 8v${-h}z" fill="${right}"/>`;
    return svg(
      'isometric',
      `<rect width="160" height="100" fill="#cfe8f3"/>
      <path d="M80 30l64 32-64 32-64-32z" fill="#7bd389"/><path d="M16 62l64 32v6L16 68z" fill="#5a8f4f"/><path d="M144 62L80 94v6l64-32z" fill="#3f6e3b"/>
      <path d="M48 46l64 32" stroke="#6b6f7a" stroke-width="6"/>
      ${cube(58, 52, 22, '#f6f1e4', '#d9cfb8', '#b8ad94')}${cube(86, 62, 34, '#ffd7a1', '#e6a96a', '#c98a4d')}${cube(98, 42, 14, '#c9e3ff', '#94b9e0', '#7598c0')}
      <circle class="ta-drive" cx="60" cy="52" r="2.4" fill="#e2231a"/>`,
    );
  },

  'clay-3d': () =>
    svg(
      'clay-3d',
      `<defs><radialGradient id="t-c3-shell" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#ffd6b0"/><stop offset=".5" stop-color="#e88b5a"/><stop offset="1" stop-color="#9c4a26"/></radialGradient>
        <radialGradient id="t-c3-body" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#e9f7c8"/><stop offset=".5" stop-color="#9ccf6a"/><stop offset="1" stop-color="#5b8a37"/></radialGradient>
        <radialGradient id="t-c3-ground" cx=".5" cy=".2" r=".8"><stop offset="0" stop-color="#f5d7a8"/><stop offset="1" stop-color="#c49260"/></radialGradient></defs>
      <rect width="160" height="100" fill="#8fc7d9"/>
      <ellipse cx="80" cy="92" rx="90" ry="22" fill="url(#t-c3-ground)"/>
      <g class="ta-boil">
        <ellipse cx="82" cy="82" rx="40" ry="5" fill="#000" opacity=".15"/>
        <path d="M46 80c0-8 10-12 24-12h34c8 0 12 4 12 8s-4 6-10 6H52c-4 0-6-1-6-2z" fill="url(#t-c3-body)"/>
        <circle cx="76" cy="58" r="22" fill="url(#t-c3-shell)"/>
        <path d="M76 58m-14 0a14 14 0 1 0 14-14a9 9 0 1 0 6 12" fill="none" stroke="#9c4a26" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M106 70l4-16M112 70l6-14" stroke="#7fae52" stroke-width="3.4" stroke-linecap="round"/>
        <circle cx="110" cy="53" r="3.6" fill="#fff"/><circle cx="118" cy="55" r="3.6" fill="#fff"/><circle cx="111" cy="53" r="1.6" fill="#222"/><circle cx="119" cy="55" r="1.6" fill="#222"/>
      </g>
      <circle cx="132" cy="20" r="10" fill="#ffd36b"/>`,
    ),

  'ascii-art': () =>
    svg(
      'ascii-art',
      `<rect width="160" height="100" fill="#efe6d2"/>
      <g class="ta-type" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="8.6" fill="#2a241c">${asciiRows()}</g>`,
    ),

  'gradient-mesh': () =>
    svg(
      'gradient-mesh',
      `<defs><filter id="t-mesh-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter></defs>
      <rect width="160" height="100" fill="#ffd1b8"/>
      <g filter="url(#t-mesh-blur)"><circle class="ta-drift" cx="30" cy="20" r="36" fill="#ff7a8a"/><circle cx="130" cy="20" r="34" fill="#ffe08a"/><circle cx="120" cy="88" r="40" fill="#b48cff"/><circle class="ta-bob" cx="30" cy="90" r="36" fill="#ff9f7a"/><circle cx="78" cy="52" r="22" fill="#fff0c9"/></g>
      <g fill="none" stroke="#fff" stroke-width=".7" opacity=".6"><path d="M0 34q80-12 160 4M0 68q80 10 160-6M54 0q-8 50 6 100M108 0q10 50-4 100"/></g>
      <g fill="#fff" stroke="#3a2340" stroke-width=".8"><circle cx="56" cy="36" r="2.6"/><circle cx="106" cy="38" r="2.6"/><circle cx="58" cy="68" r="2.6"/><circle cx="106" cy="64" r="2.6"/></g>`,
    ),

  'comic-book': () =>
    svg(
      'comic-book',
      `<defs><pattern id="t-comic-dots" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1.2" fill="#ff9ec7"/></pattern></defs>
      <rect width="160" height="100" fill="#111"/>
      <rect x="4" y="4" width="96" height="44" fill="#ffe9a8"/><rect x="4" y="4" width="96" height="44" fill="url(#t-comic-dots)" opacity=".7"/>
      <rect x="104" y="4" width="52" height="44" fill="#9fd8ff"/>
      <rect x="4" y="52" width="60" height="44" fill="#fff4e0"/>
      <rect x="68" y="52" width="88" height="44" fill="#ffd400"/>
      <path d="M14 10h56a6 6 0 0 1 6 6v8a6 6 0 0 1-6 6H34l-8 7 2-7h-14a6 6 0 0 1-6-6v-8a6 6 0 0 1 6-6z" fill="#fff" stroke="#111" stroke-width="1.4"/>
      <text x="42" y="23" text-anchor="middle" font-family="'Comic Sans MS', 'Chalkboard SE', 'Marker Felt', cursive" font-weight="700" font-size="7" fill="#111">UP, UP!</text>
      <circle cx="130" cy="28" r="12" fill="#ffcf9e" stroke="#111" stroke-width="1.4"/><path d="M124 32q6 5 12 0" stroke="#111" fill="none" stroke-width="1.4"/><circle cx="126" cy="25" r="1.4"/><circle cx="134" cy="25" r="1.4"/>
      <polygon class="ta-pulse" points="112,60 118,68 128,58 128,70 140,68 132,76 144,84 130,84 132,94 122,86 114,94 112,84 98,86 106,78 94,70 108,70" fill="#ff3d3d" stroke="#111" stroke-width="1.4"/>
      <text x="119" y="80" text-anchor="middle" font-family="Impact, 'Arial Black', sans-serif" font-size="9" fill="#fff" stroke="#111" stroke-width=".6">POW!</text>
      <path d="M10 92l20-30M20 94l20-30M30 94l20-30" stroke="#111" stroke-width="1"/>`,
    ),

  'split-flap': () => {
    const word = (y, text, color = '#f2f2f2') =>
      text
        .split('')
        .map(
          (ch, i) =>
            `<rect x="${10 + i * 12}" y="${y}" width="11" height="15" rx="1.5" fill="#262628"/><rect x="${10 + i * 12}" y="${y + 7.2}" width="11" height=".6" fill="#0d0d0e"/><text x="${15.5 + i * 12}" y="${y + 11.6}" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="700" font-size="11" fill="${color}">${ch}</text>`,
        )
        .join('');
    return svg(
      'split-flap',
      `<rect width="160" height="100" fill="#141415"/>
      <text x="10" y="13" font-family="'Helvetica Neue', Arial, sans-serif" font-size="6" letter-spacing="1.6" fill="#ffcf3a">DEPARTURES</text>
      ${word(18, 'LUMEN BAY')}${word(38, 'PORT QUIET')}<g class="ta-flip">${word(58, 'ON TIME', '#ffcf3a')}</g>${word(78, '14:05')}`,
    );
  },

  'retro-vhs': () =>
    svg(
      'retro-vhs',
      `<defs><linearGradient id="t-vhs-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a5bbf"/><stop offset=".6" stop-color="#f29a6b"/><stop offset="1" stop-color="#f2c76b"/></linearGradient>
        <pattern id="t-vhs-scan" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000" opacity=".28"/></pattern></defs>
      <rect width="160" height="100" fill="#1a1a1e"/>
      <rect x="10" y="8" width="140" height="84" rx="14" fill="url(#t-vhs-sky)"/>
      <circle cx="96" cy="58" r="14" fill="#ffe2a0"/>
      <path d="M10 66h140v14a12 12 0 0 1-12 12H22a12 12 0 0 1-12-12z" fill="#22406e"/>
      <path d="M36 92c2-20-2-34 4-46M40 46c-8-4-16-2-20 2M40 46c6-6 14-6 18-2M40 46c-2-8-8-12-14-12" stroke="#1a1020" stroke-width="2.4" fill="none"/>
      <rect class="ta-roll" x="10" y="40" width="140" height="6" fill="#fff" opacity=".18"/>
      <rect x="10" y="8" width="140" height="84" rx="14" fill="url(#t-vhs-scan)"/>
      <text x="20" y="22" font-family="ui-monospace, Menlo, monospace" font-weight="700" font-size="9" fill="#fff">PLAY ▶</text>
      <text x="96" y="84" font-family="ui-monospace, Menlo, monospace" font-weight="700" font-size="8" fill="#fff">0:12:43</text>`,
    ),

  halftone: () =>
    svg(
      'halftone',
      `<rect width="160" height="100" fill="#f5efe2"/>
      <g class="ta-drift" fill="#00a3d9" opacity=".85" transform="rotate(15 80 50)">${halftoneDots()}</g>
      <g fill="#e6007e" opacity=".75" transform="translate(30 4) rotate(75 80 50)">${halftoneDots()}</g>
      <g stroke="#1a1a1a" stroke-width=".6"><path d="M4 10h8M8 6v8M148 90h8M152 86v8"/><circle cx="8" cy="10" r="2.4" fill="none"/><circle cx="152" cy="90" r="2.4" fill="none"/></g>`,
    ),

  bauhaus: () =>
    svg(
      'bauhaus',
      `<rect width="160" height="100" fill="#efe7d6"/>
      <circle class="ta-roll2" cx="58" cy="44" r="26" fill="#d62828"/>
      <polygon class="ta-spin" points="112,14 140,64 84,64" fill="#f2b705"/>
      <rect class="ta-slide" x="96" y="66" width="26" height="26" fill="#1d4e9e"/>
      <rect x="10" y="78" width="74" height="6" fill="#111"/>
      <path d="M18 70a12 12 0 0 1 24 0z" fill="#111"/>
      <text x="10" y="18" font-family="Futura, 'Century Gothic', 'Avenir Next', sans-serif" font-size="9" fill="#111">bauhaus</text>`,
    ),

  blueprint: () =>
    svg(
      'blueprint',
      `<defs><pattern id="t-bp-grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" fill="none" stroke="#ffffff" stroke-opacity=".12" stroke-width=".6"/></pattern></defs>
      <rect width="160" height="100" fill="#0e3a6e"/><rect width="160" height="100" fill="url(#t-bp-grid)"/>
      <g fill="none" stroke="#eaf3ff" stroke-width="1">
        <rect x="52" y="76" width="44" height="8"/><path d="M70 76V40h8v36"/><circle cx="74" cy="34" r="6"/>
        <path class="ta-explode" d="M44 30h60M44 30l-4 4M104 30l4 4"/><circle class="ta-orbit2" cx="44" cy="34" r="4"/><circle cx="104" cy="34" r="5"/>
        <path d="M52 92h44M52 89v6M96 89v6" stroke-opacity=".7"/>
      </g>
      <text x="74" y="98" text-anchor="middle" font-family="ui-monospace, Menlo, monospace" font-size="5" fill="#eaf3ff">Ø 180</text>
      <rect x="112" y="72" width="42" height="22" fill="none" stroke="#eaf3ff" stroke-width=".7"/>
      <text x="115" y="80" font-family="ui-monospace, Menlo, monospace" font-size="4.4" fill="#eaf3ff">DESK ORRERY</text><text x="115" y="88" font-family="ui-monospace, Menlo, monospace" font-size="4.4" fill="#eaf3ff">DWG WW-38</text>`,
    ),

  'art-deco': () =>
    svg(
      'art-deco',
      `<defs><linearGradient id="t-deco-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7e3a1"/><stop offset=".5" stop-color="#d4af37"/><stop offset="1" stop-color="#8a6a1f"/></linearGradient></defs>
      <rect width="160" height="100" fill="#0c0b09"/>
      <g class="ta-pulse" fill="url(#t-deco-gold)" opacity=".85">${decoRays()}</g>
      <path d="M40 100V40h10V28h12V18h36v10h12v12h10v60" fill="#0c0b09" stroke="url(#t-deco-gold)" stroke-width="1.6"/>
      <path d="M50 100V46h8V34h44v12h8v54" fill="none" stroke="#d4af37" stroke-width=".7"/>
      <text x="80" y="62" text-anchor="middle" font-family="Futura, 'Avenir Next Condensed', 'Century Gothic', sans-serif" font-size="9" letter-spacing="2.6" fill="#f7e3a1">AURELIAN</text>
      <path d="M0 100a24 24 0 0 1 24-24v24zM160 100a24 24 0 0 0-24-24v24z" fill="url(#t-deco-gold)"/>`,
    ),
};

export function thumbFor(id) {
  const make = THUMBS[id];
  return make ? make() : '';
}

export const thumbIds = Object.freeze(Object.keys(THUMBS));
