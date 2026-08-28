import { ComicBook, ComicMetadataInfo, ComicPage } from '../types';

// Helper to create high-resolution SVG comic panels converted to Blob URLs
function createComicSvgPage(options: {
  pageNumber: number;
  totalPages: number;
  title: string;
  theme: 'cyber' | 'cosmic';
  contentSvg: string;
}): string {
  const { pageNumber, totalPages, title, theme, contentSvg } = options;
  const isCyber = theme === 'cyber';
  const bgColor = isCyber ? '#090d16' : '#0c0714';
  const primaryAccent = isCyber ? '#00e5ff' : '#ff007f';
  const secondaryAccent = isCyber ? '#ffd600' : '#7928ca';
  const frameBorder = isCyber ? '#1e293b' : '#2e1065';

  const svgString = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1750" width="1200" height="1750">
  <defs>
    <!-- Comic halftone dot pattern -->
    <pattern id="halftone-${theme}" width="16" height="16" patternUnits="userSpaceOnUse">
      <circle cx="8" cy="8" r="2" fill="${isCyber ? 'rgba(0,229,255,0.06)' : 'rgba(255,0,127,0.06)'}" />
    </pattern>
    <radialGradient id="sunburst-${theme}" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="${isCyber ? '#1e3a8a' : '#581c87'}" stop-opacity="0.8" />
      <stop offset="100%" stop-color="${bgColor}" stop-opacity="1" />
    </radialGradient>
    <linearGradient id="metal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#818cf8" />
      <stop offset="100%" stop-color="#c084fc" />
    </linearGradient>
    <filter id="comic-shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="8" dy="8" stdDeviation="0" flood-color="#000000" flood-opacity="0.9" />
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="1200" height="1750" fill="${bgColor}" />
  <rect width="1200" height="1750" fill="url(#sunburst-${theme})" />
  <rect width="1200" height="1750" fill="url(#halftone-${theme})" />

  <!-- Outer Comic Page Frame & Trim Margin -->
  <rect x="40" y="40" width="1120" height="1670" fill="none" stroke="${frameBorder}" stroke-width="4" rx="12" />

  <!-- Header Banner on interior pages -->
  ${
    pageNumber > 1
      ? `
    <rect x="60" y="60" width="1080" height="40" fill="#0f172a" rx="4" />
    <text x="80" y="86" font-family="'Impact', 'Arial Black', sans-serif" font-size="20" fill="${primaryAccent}" letter-spacing="2">
      ${title.toUpperCase()}
    </text>
    <text x="1120" y="86" font-family="'Impact', 'Arial Black', sans-serif" font-size="18" fill="#94a3b8" text-anchor="end">
      ISSUE #1 • PAGE ${pageNumber} OF ${totalPages}
    </text>
  `
      : ''
  }

  <!-- Comic Panel Artwork & Story -->
  ${contentSvg}

  <!-- Footer page indicator -->
  <text x="600" y="1685" font-family="'Courier New', monospace" font-weight="bold" font-size="16" fill="#64748b" text-anchor="middle" letter-spacing="3">
    — [ PAGE ${pageNumber} / ${totalPages} ] —
  </text>
</svg>
`;

  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  return URL.createObjectURL(blob);
}

// Sample Comic 1: "CYBER GUARDIAN: DAWN OF THE GRID" (6 Action-Packed Illustrated Pages)
export function getCyberGuardianPages(): ComicPage[] {
  const title = 'Cyber Guardian: Dawn of the Grid';
  const total = 6;

  const pagesData: string[] = [
    // Page 1: Dynamic Vintage Comic Cover
    `
    <g transform="translate(60, 60)">
      <!-- Top Comic Title Box -->
      <rect x="0" y="0" width="1080" height="230" fill="#0284c7" stroke="#000" stroke-width="8" filter="url(#comic-shadow)" rx="8" />
      <text x="30" y="55" font-family="'Arial Black', Impact, sans-serif" font-weight="900" font-size="26" fill="#fef08a" letter-spacing="4">
        PREMIERE COLLECTOR'S EDITION • ALL-NEW SCI-FI ACTION!
      </text>
      <text x="540" y="170" font-family="'Impact', sans-serif" font-size="110" fill="#ffffff" stroke="#000000" stroke-width="6" text-anchor="middle" letter-spacing="6">
        CYBER GUARDIAN
      </text>

      <!-- Issue Number Badge -->
      <g transform="translate(930, 20)">
        <polygon points="60,0 120,30 120,90 60,120 0,90 0,30" fill="#dc2626" stroke="#000" stroke-width="4" />
        <text x="60" y="45" font-family="'Impact', sans-serif" font-size="24" fill="#ffffff" text-anchor="middle">NO.</text>
        <text x="60" y="90" font-family="'Impact', sans-serif" font-size="48" fill="#ffffff" text-anchor="middle">#1</text>
      </g>

      <!-- Main Cover Art Artboard -->
      <rect x="0" y="260" width="1080" height="1100" fill="#030712" stroke="#000" stroke-width="8" filter="url(#comic-shadow)" rx="8" />
      
      <!-- Neon Grid Background -->
      <line x1="0" y1="1000" x2="1080" y2="1000" stroke="#06b6d4" stroke-width="4" opacity="0.6"/>
      <line x1="0" y1="1100" x2="1080" y2="1100" stroke="#06b6d4" stroke-width="6" opacity="0.8"/>
      <line x1="540" y1="600" x2="100" y2="1360" stroke="#06b6d4" stroke-width="3" opacity="0.4"/>
      <line x1="540" y1="600" x2="300" y2="1360" stroke="#06b6d4" stroke-width="3" opacity="0.4"/>
      <line x1="540" y1="600" x2="780" y2="1360" stroke="#06b6d4" stroke-width="3" opacity="0.4"/>
      <line x1="540" y1="600" x2="980" y2="1360" stroke="#06b6d4" stroke-width="3" opacity="0.4"/>

      <!-- Giant Holographic Threat Silhouette -->
      <circle cx="540" cy="560" r="220" fill="none" stroke="#f43f5e" stroke-width="8" stroke-dasharray="16,8" opacity="0.7"/>
      <polygon points="540,380 620,530 460,530" fill="#be123c" opacity="0.6" />
      <circle cx="500" cy="500" r="18" fill="#fb7185" />
      <circle cx="580" cy="500" r="18" fill="#fb7185" />

      <!-- Hero Cyber Guardian Figure (Stylized Mech/Hero) -->
      <g transform="translate(540, 920)">
        <!-- Energy aura -->
        <ellipse cx="0" cy="0" rx="200" ry="180" fill="#00e5ff" opacity="0.2" filter="blur(20px)" />
        
        <!-- Hero Body / Armor -->
        <polygon points="-80,80 -120,20 -70,-80 0,-120 70,-80 120,20 80,80 0,60" fill="#0284c7" stroke="#38bdf8" stroke-width="6" />
        <!-- Glowing Visor -->
        <polygon points="-50,-30 50,-30 40,-10 -40,-10" fill="#34d399" stroke="#ffffff" stroke-width="3" />
        <!-- Energy Core Chest -->
        <polygon points="0,0 -30,40 30,40" fill="#fbbf24" stroke="#d97706" stroke-width="4" />
        <!-- Power Blade Right Arm -->
        <polygon points="120,10 260,-120 280,-100 140,50" fill="#00e5ff" stroke="#ffffff" stroke-width="5" />
        <!-- Power Shield Left Arm -->
        <polygon points="-120,10 -220,-20 -250,60 -150,90" fill="#6366f1" stroke="#a5b4fc" stroke-width="5" />
      </g>

      <!-- Giant Sound Effect Banner -->
      <g transform="translate(180, 780) rotate(-8)">
        <text x="0" y="0" font-family="'Impact', sans-serif" font-size="95" fill="#facc15" stroke="#000000" stroke-width="8" filter="url(#comic-shadow)">
          KRAAAK-THOOM!
        </text>
      </g>

      <!-- Floating Subtitle Tagline Banner -->
      <g transform="translate(40, 1260)">
        <rect x="0" y="0" width="1000" height="75" fill="#dc2626" stroke="#000" stroke-width="6" filter="url(#comic-shadow)" rx="4" />
        <text x="500" y="50" font-family="'Impact', sans-serif" font-size="36" fill="#ffffff" text-anchor="middle" letter-spacing="3">
          WHEN THE SYSTEM FALLS, WHO PROTECTS THE MATRIX?
        </text>
      </g>
    </g>
    `,

    // Page 2: Act I - The Anomaly in Sector 7 (3 Panels)
    `
    <g transform="translate(60, 120)">
      <!-- Panel 1 (Top Wide) -->
      <g transform="translate(0, 0)">
        <rect width="1080" height="420" fill="#0f172a" stroke="#000000" stroke-width="8" filter="url(#comic-shadow)" rx="6" />
        <!-- City Skyline -->
        <path d="M 0,380 L 100,200 L 180,200 L 220,280 L 320,150 L 400,150 L 450,380 L 600,180 L 700,180 L 780,380 L 900,120 L 1000,120 L 1080,380 Z" fill="#1e293b" />
        <line x1="0" y1="380" x2="1080" y2="380" stroke="#0284c7" stroke-width="4" />
        <!-- Caption Box -->
        <rect x="20" y="20" width="460" height="70" fill="#fef08a" stroke="#000" stroke-width="4" filter="url(#comic-shadow)" />
        <text x="35" y="48" font-family="'Impact', sans-serif" font-size="20" fill="#000">NEO-METROPOLIS • MIDNIGHT CYCLE</text>
        <text x="35" y="72" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#334155">A catastrophic firewall breach triggers in Sub-Grid 9...</text>
        <!-- Dialogue Bubble -->
        <path d="M 620,160 Q 750,120 880,160 Q 940,200 880,250 Q 820,290 730,280 L 700,340 L 710,280 Q 600,270 620,160 Z" fill="#ffffff" stroke="#000" stroke-width="4" filter="url(#comic-shadow)" />
        <text x="760" y="200" font-family="'Arial Black', sans-serif" font-size="18" fill="#000" text-anchor="middle">"COMMAND! WE HAVE AN UNKNOWN</text>
        <text x="760" y="230" font-family="'Arial Black', sans-serif" font-size="18" fill="#dc2626" text-anchor="middle">SIGNATURE OVERRIDING CORE POWER!"</text>
      </g>

      <!-- Panel 2 (Bottom Left) -->
      <g transform="translate(0, 460)">
        <rect width="520" height="980" fill="#1e1b4b" stroke="#000000" stroke-width="8" filter="url(#comic-shadow)" rx="6" />
        <!-- Tech Console Glow -->
        <circle cx="260" cy="500" r="180" fill="#4338ca" opacity="0.4" />
        <polygon points="120,700 260,300 400,700" fill="#312e81" stroke="#6366f1" stroke-width="4" />
        <!-- Operator Silhouette -->
        <circle cx="260" cy="420" r="60" fill="#020617" />
        <path d="M 180,600 Q 260,480 340,600 Z" fill="#020617" />
        <!-- Screaming SFX -->
        <text x="260" y="200" font-family="'Impact', sans-serif" font-size="70" fill="#f43f5e" stroke="#000" stroke-width="6" text-anchor="middle" filter="url(#comic-shadow)">
          BZZZZZT!
        </text>
        <!-- Speech Bubble -->
        <rect x="40" y="740" width="440" height="150" fill="#ffffff" stroke="#000" stroke-width="5" rx="8" filter="url(#comic-shadow)" />
        <text x="260" y="780" font-family="'Arial Black', sans-serif" font-size="18" fill="#000" text-anchor="middle">OPERATOR VEX:</text>
        <text x="260" y="815" font-family="Arial, sans-serif" font-size="17" font-weight="bold" fill="#1e293b" text-anchor="middle">"It's mutating! The virus isn't code...</text>
        <text x="260" y="845" font-family="Arial, sans-serif" font-size="17" font-weight="bold" fill="#dc2626" text-anchor="middle">IT'S SENTIENT QUANTUM ENERGY!"</text>
      </g>

      <!-- Panel 3 (Bottom Right) -->
      <g transform="translate(560, 460)">
        <rect width="520" height="980" fill="#042f2e" stroke="#000000" stroke-width="8" filter="url(#comic-shadow)" rx="6" />
        <!-- Guardian Chamber Ignition -->
        <circle cx="260" cy="400" r="190" fill="#0d9488" opacity="0.5" />
        <line x1="260" y1="100" x2="260" y2="700" stroke="#2dd4bf" stroke-width="12" stroke-dasharray="20,10" />
        
        <!-- Cyber Guardian Awakening Eye -->
        <polygon points="160,380 260,310 360,380 260,450" fill="#0f766e" stroke="#14b8a6" stroke-width="6" />
        <circle cx="260" cy="380" r="40" fill="#5eead4" />
        <circle cx="260" cy="380" r="16" fill="#ffffff" />
        
        <!-- Awakening text -->
        <text x="260" y="600" font-family="'Impact', sans-serif" font-size="44" fill="#5eead4" stroke="#000" stroke-width="4" text-anchor="middle" filter="url(#comic-shadow)">
          PROTOCOL 0-ALPHA:
        </text>
        <text x="260" y="660" font-family="'Impact', sans-serif" font-size="52" fill="#facc15" stroke="#000" stroke-width="4" text-anchor="middle" filter="url(#comic-shadow)">
          GUARDIAN ONLINE!
        </text>

        <!-- Bubble -->
        <rect x="50" y="780" width="420" height="120" fill="#0f172a" stroke="#14b8a6" stroke-width="4" rx="8" />
        <text x="260" y="825" font-family="'Courier New', monospace" font-size="20" font-weight="bold" fill="#2dd4bf" text-anchor="middle">
          &gt; BIOMETRICS MATCHED.
        </text>
        <text x="260" y="865" font-family="'Courier New', monospace" font-size="20" font-weight="bold" fill="#2dd4bf" text-anchor="middle">
          &gt; ENGAGING VECTOR THRUSTERS.
        </text>
      </g>
    </g>
    `,

    // Page 3: Act II - The Breach at Reactor Core (4 Dynamic Panels)
    `
    <g transform="translate(60, 120)">
      <!-- Panel 1 (Top Left) -->
      <g transform="translate(0, 0)">
        <rect width="520" height="660" fill="#450a0a" stroke="#000" stroke-width="8" filter="url(#comic-shadow)" rx="6" />
        <circle cx="260" cy="300" r="180" fill="#991b1b" opacity="0.6" />
        <!-- Shadow Entity Tentacles -->
        <path d="M 100,500 Q 200,200 400,250 Q 500,400 300,550" fill="none" stroke="#000000" stroke-width="32" stroke-linecap="round" />
        <path d="M 450,150 Q 250,100 150,350 Q 100,500 200,580" fill="none" stroke="#18181b" stroke-width="26" stroke-linecap="round" />
        <circle cx="280" cy="240" r="24" fill="#f87171" />
        <circle cx="340" cy="220" r="24" fill="#f87171" />
        <text x="260" y="100" font-family="'Impact', sans-serif" font-size="56" fill="#fca5a5" stroke="#000" stroke-width="6" text-anchor="middle" filter="url(#comic-shadow)">
          SHADOW-NEXUS!
        </text>
        <!-- Dialogue -->
        <rect x="30" y="480" width="460" height="130" fill="#000000" stroke="#ef4444" stroke-width="4" rx="6" />
        <text x="260" y="525" font-family="'Arial Black', sans-serif" font-size="18" fill="#fca5a5" text-anchor="middle">"YOUR CRUDE DATA WILL FEED US!</text>
        <text x="260" y="565" font-family="'Arial Black', sans-serif" font-size="18" fill="#ffffff" text-anchor="middle">THERE IS NO ESCAPE FROM EXTINCTION!"</text>
      </g>

      <!-- Panel 2 (Top Right - Hero Arrival Splash) -->
      <g transform="translate(560, 0)">
        <rect width="520" height="660" fill="#082f49" stroke="#000" stroke-width="8" filter="url(#comic-shadow)" rx="6" />
        <!-- Flash Blast -->
        <polygon points="260,0 320,240 520,260 340,360 400,600 260,420 120,600 180,360 0,260 200,240" fill="#38bdf8" opacity="0.6" />
        <!-- Hero in mid-air strike -->
        <polygon points="260,180 200,320 320,320" fill="#0284c7" stroke="#ffffff" stroke-width="5" />
        <line x1="260" y1="180" x2="450" y2="100" stroke="#facc15" stroke-width="12" stroke-linecap="round" />
        <!-- Sound Effect -->
        <text x="260" y="440" font-family="'Impact', sans-serif" font-size="80" fill="#fde047" stroke="#000" stroke-width="7" text-anchor="middle" filter="url(#comic-shadow)">
          SHHRRRK!
        </text>
        <!-- Hero speech -->
        <rect x="40" y="520" width="440" height="100" fill="#ffffff" stroke="#000" stroke-width="4" rx="6" />
        <text x="260" y="560" font-family="'Arial Black', sans-serif" font-size="17" fill="#0369a1" text-anchor="middle">CYBER GUARDIAN:</text>
        <text x="260" y="595" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#0f172a" text-anchor="middle">"Stand down, parasite. Sector 7 is guarded."</text>
      </g>

      <!-- Panel 3 (Bottom Full Width Clash) -->
      <g transform="translate(0, 700)">
        <rect width="1080" height="740" fill="#020617" stroke="#000" stroke-width="8" filter="url(#comic-shadow)" rx="6" />
        <!-- Clash Energy Ring -->
        <circle cx="540" cy="370" r="280" fill="none" stroke="#38bdf8" stroke-width="16" opacity="0.4" />
        <circle cx="540" cy="370" r="160" fill="none" stroke="#f43f5e" stroke-width="20" opacity="0.5" />
        
        <!-- Energy Beams Colliding -->
        <path d="M 100,500 L 540,370" stroke="#00e5ff" stroke-width="28" stroke-linecap="round" />
        <path d="M 980,240 L 540,370" stroke="#ef4444" stroke-width="34" stroke-linecap="round" />

        <!-- Massive Sound Effect -->
        <g transform="translate(540, 380)">
          <text x="0" y="20" font-family="'Impact', sans-serif" font-size="110" fill="#ffffff" stroke="#000000" stroke-width="10" text-anchor="middle" filter="url(#comic-shadow)">
            KABOOOM!
          </text>
        </g>

        <!-- Captions -->
        <rect x="40" y="40" width="400" height="60" fill="#fef08a" stroke="#000" stroke-width="4" />
        <text x="240" y="78" font-family="'Impact', sans-serif" font-size="22" fill="#000" text-anchor="middle">
          ENERGY AT 99% THRESHOLD!
        </text>
      </g>
    </g>
    `,

    // Page 4: Act III - The Overdrive Protocol
    `
    <g transform="translate(60, 120)">
      <!-- Panel 1 (Top Half) -->
      <g transform="translate(0, 0)">
        <rect width="1080" height="680" fill="#172554" stroke="#000" stroke-width="8" filter="url(#comic-shadow)" rx="6" />
        <!-- Radial Speed Lines -->
        <g opacity="0.3">
          <line x1="540" y1="340" x2="0" y2="0" stroke="#ffffff" stroke-width="4"/>
          <line x1="540" y1="340" x2="270" y2="0" stroke="#ffffff" stroke-width="4"/>
          <line x1="540" y1="340" x2="810" y2="0" stroke="#ffffff" stroke-width="4"/>
          <line x1="540" y1="340" x2="1080" y2="0" stroke="#ffffff" stroke-width="4"/>
          <line x1="540" y1="340" x2="0" y2="680" stroke="#ffffff" stroke-width="4"/>
          <line x1="540" y1="340" x2="1080" y2="680" stroke="#ffffff" stroke-width="4"/>
        </g>
        <!-- Hero Charging Super Move -->
        <circle cx="540" cy="340" r="140" fill="#38bdf8" />
        <polygon points="540,160 460,340 620,340" fill="#ffffff" />
        <text x="540" y="420" font-family="'Impact', sans-serif" font-size="72" fill="#facc15" stroke="#000" stroke-width="6" text-anchor="middle" filter="url(#comic-shadow)">
          PHOTON OVERCHARGE!
        </text>
        <rect x="60" y="520" width="960" height="100" fill="#ffffff" stroke="#000" stroke-width="5" rx="8" filter="url(#comic-shadow)" />
        <text x="540" y="565" font-family="'Arial Black', sans-serif" font-size="22" fill="#000" text-anchor="middle">
          "RE-ROUTING NEURAL NETWORK TO SUB-LIGHT EMISSION!"
        </text>
        <text x="540" y="600" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#0284c7" text-anchor="middle">
          Target locked: Core node of the shadow singularity.
        </text>
      </g>

      <!-- Panel 2 (Bottom Left) -->
      <g transform="translate(0, 720)">
        <rect width="520" height="720" fill="#311042" stroke="#000" stroke-width="8" filter="url(#comic-shadow)" rx="6" />
        <circle cx="260" cy="320" r="180" fill="#581c87" opacity="0.6" />
        <!-- Disintegrating Villain -->
        <path d="M 120,450 Q 260,180 400,450" fill="none" stroke="#ec4899" stroke-width="24" stroke-dasharray="14,14" />
        <text x="260" y="240" font-family="'Impact', sans-serif" font-size="64" fill="#f43f5e" stroke="#000" stroke-width="6" text-anchor="middle" filter="url(#comic-shadow)">
          IMPOSSIBLE!
        </text>
        <rect x="40" y="520" width="440" height="140" fill="#0f172a" stroke="#ec4899" stroke-width="4" rx="6" />
        <text x="260" y="570" font-family="'Arial Black', sans-serif" font-size="18" fill="#f472b6" text-anchor="middle">SHADOW NEXUS:</text>
        <text x="260" y="610" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#fdf2f8" text-anchor="middle">"This city will burn in the next wave!"</text>
      </g>

      <!-- Panel 3 (Bottom Right) -->
      <g transform="translate(560, 720)">
        <rect width="520" height="720" fill="#022c22" stroke="#000" stroke-width="8" filter="url(#comic-shadow)" rx="6" />
        <circle cx="260" cy="360" r="160" fill="#059669" opacity="0.4" />
        <polygon points="260,160 360,400 160,400" fill="#10b981" stroke="#34d399" stroke-width="6" />
        <text x="260" y="480" font-family="'Impact', sans-serif" font-size="52" fill="#a7f3d0" stroke="#000" stroke-width="4" text-anchor="middle" filter="url(#comic-shadow)">
          GRID RESTORED!
        </text>
        <rect x="40" y="540" width="440" height="120" fill="#ffffff" stroke="#000" stroke-width="4" rx="6" />
        <text x="260" y="585" font-family="'Arial Black', sans-serif" font-size="18" fill="#047857" text-anchor="middle">SYSTEM STATUS:</text>
        <text x="260" y="620" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#0f172a" text-anchor="middle">100% Integrity • All Subsystems Online.</text>
      </g>
    </g>
    `,

    // Page 5: Act IV - Dawn Breaks over Neo-Metropolis
    `
    <g transform="translate(60, 120)">
      <!-- Panel 1 (Top Heroic Skyline) -->
      <g transform="translate(0, 0)">
        <rect width="1080" height="780" fill="#1e1b4b" stroke="#000" stroke-width="8" filter="url(#comic-shadow)" rx="6" />
        <!-- Golden Sunrise Gradient -->
        <rect width="1080" height="400" fill="#ea580c" opacity="0.8" />
        <circle cx="540" cy="350" r="220" fill="#facc15" />
        
        <!-- Cyber City Silhouette -->
        <polygon points="0,600 120,420 200,420 280,600 400,320 520,320 620,600 780,380 900,380 1080,600 1080,780 0,780" fill="#0f172a" />

        <!-- Guardian Standing Vigil on Skyscraper -->
        <g transform="translate(540, 480)">
          <!-- Cloak billowing -->
          <path d="M -30,40 Q -100,120 -140,200 L 0,80" fill="#0284c7" opacity="0.9" />
          <polygon points="-30,0 30,0 20,80 -20,80" fill="#38bdf8" />
          <circle cx="0" cy="-20" r="20" fill="#ffffff" />
        </g>

        <!-- Narrative Box -->
        <rect x="40" y="40" width="560" height="110" fill="#fef08a" stroke="#000" stroke-width="5" filter="url(#comic-shadow)" />
        <text x="60" y="80" font-family="'Impact', sans-serif" font-size="22" fill="#000">THE MORNING LIGHT RETURNS.</text>
        <text x="60" y="115" font-family="Arial, sans-serif" font-size="17" font-weight="bold" fill="#334155">
          The threat is neutralized... but the shadows have tasted power.
        </text>
      </g>

      <!-- Panel 2 (Bottom Wide - Cliffhanger Teaser) -->
      <g transform="translate(0, 820)">
        <rect width="1080" height="620" fill="#030712" stroke="#000" stroke-width="8" filter="url(#comic-shadow)" rx="6" />
        <!-- Deep Space Telescope Monitor -->
        <circle cx="540" cy="300" r="180" fill="#1e1b4b" stroke="#7c3aed" stroke-width="6" />
        <!-- Fleet of Shadow Ships approaching -->
        <polygon points="500,260 540,230 580,260 540,250" fill="#ef4444" />
        <polygon points="440,320 470,290 500,320 470,310" fill="#ef4444" />
        <polygon points="580,330 610,300 640,330 610,320" fill="#ef4444" />

        <text x="540" y="120" font-family="'Impact', sans-serif" font-size="44" fill="#f43f5e" stroke="#000" stroke-width="4" text-anchor="middle" filter="url(#comic-shadow)">
          DEEP SPACE RADAR: 10,000 WARPS DETECTED
        </text>
        
        <rect x="180" y="480" width="720" height="90" fill="#dc2626" stroke="#000" stroke-width="5" filter="url(#comic-shadow)" rx="6" />
        <text x="540" y="538" font-family="'Impact', sans-serif" font-size="34" fill="#ffffff" text-anchor="middle" letter-spacing="2">
          TO BE CONTINUED IN ISSUE #2: WAR OF THE STARS!
        </text>
      </g>
    </g>
    `,

    // Page 6: Collector Back Page & Fan Pinup Art
    `
    <g transform="translate(60, 60)">
      <rect width="1080" height="1630" fill="#0f172a" stroke="#000" stroke-width="8" filter="url(#comic-shadow)" rx="8" />
      
      <!-- Back Page Header -->
      <rect x="40" y="40" width="1000" height="120" fill="#0284c7" stroke="#000" stroke-width="5" rx="6" />
      <text x="540" y="115" font-family="'Impact', sans-serif" font-size="52" fill="#ffffff" text-anchor="middle" letter-spacing="4">
        CYBER GUARDIAN CLASSIFIED FILES
      </text>

      <!-- Tech Specs Diagram Box -->
      <rect x="40" y="190" width="1000" height="880" fill="#020617" stroke="#38bdf8" stroke-width="4" rx="8" />
      
      <!-- Wireframe Schematic Hero -->
      <g transform="translate(540, 560)">
        <circle cx="0" cy="0" r="220" fill="none" stroke="#0284c7" stroke-width="2" stroke-dasharray="10,5" />
        <polygon points="-80,-140 80,-140 120,40 -120,40" fill="none" stroke="#38bdf8" stroke-width="4" />
        <line x1="-120" y1="-140" x2="-220" y2="-200" stroke="#facc15" stroke-width="2" />
        <text x="-230" y="-205" font-family="'Courier New', monospace" font-size="18" fill="#facc15" text-anchor="end">HYPER-ION VISOR (360° SPECTRAL)</text>

        <line x1="120" y1="40" x2="220" y2="100" stroke="#facc15" stroke-width="2" />
        <text x="230" y="105" font-family="'Courier New', monospace" font-size="18" fill="#facc15">QUANTUM BLADE (100K VOLTS)</text>

        <line x1="0" y1="40" x2="0" y2="160" stroke="#34d399" stroke-width="2" />
        <text x="0" y="190" font-family="'Courier New', monospace" font-size="18" fill="#34d399" text-anchor="middle">SUB-ATOMIC CORE REACTOR</text>
      </g>

      <!-- Reader Club / Editorial Box -->
      <rect x="40" y="1100" width="1000" height="480" fill="#1e293b" stroke="#000" stroke-width="5" rx="6" />
      <text x="540" y="1160" font-family="'Impact', sans-serif" font-size="34" fill="#38bdf8" text-anchor="middle">
        JOIN THE COMIC READERS GUILD!
      </text>
      <text x="540" y="1220" font-family="Arial, sans-serif" font-size="20" fill="#e2e8f0" text-anchor="middle">
        Enjoy reading CBR & CBZ archives directly in your browser with high-fidelity spreads,
      </text>
      <text x="540" y="1260" font-family="Arial, sans-serif" font-size="20" fill="#e2e8f0" text-anchor="middle">
        continuous webtoon scrolling, customizable filters, and smart page tracking.
      </text>
      
      <!-- Vintage Stamp -->
      <g transform="translate(540, 1420)">
        <circle cx="0" cy="0" r="70" fill="#dc2626" stroke="#ffffff" stroke-width="4" />
        <text x="0" y="-15" font-family="'Impact', sans-serif" font-size="20" fill="#ffffff" text-anchor="middle">APPROVED BY</text>
        <text x="0" y="15" font-family="'Impact', sans-serif" font-size="24" fill="#ffffff" text-anchor="middle">COMICS CODE</text>
        <text x="0" y="42" font-family="'Impact', sans-serif" font-size="18" fill="#ffffff" text-anchor="middle">AUTHORITY</text>
      </g>
    </g>
    `,
  ];

  return pagesData.map((contentSvg, idx) => ({
    pageNumber: idx + 1,
    fileName: `Cyber_Guardian_01_Page_${String(idx + 1).padStart(3, '0')}.svg`,
    blobUrl: createComicSvgPage({
      pageNumber: idx + 1,
      totalPages: total,
      title,
      theme: 'cyber',
      contentSvg,
    }),
    mimeType: 'image/svg+xml',
  }));
}

// Sample Comic 2: "CHRONICLES OF NEBULA: THE STARFALL VOYAGE" (5 Pages)
export function getCosmicVoyagePages(): ComicPage[] {
  const title = 'Chronicles of Nebula: The Starfall Voyage';
  const total = 5;

  const pagesData: string[] = [
    // Page 1: Cosmic Cover
    `
    <g transform="translate(60, 60)">
      <rect x="0" y="0" width="1080" height="230" fill="#701a75" stroke="#000" stroke-width="8" filter="url(#comic-shadow)" rx="8" />
      <text x="30" y="55" font-family="'Arial Black', Impact, sans-serif" font-weight="900" font-size="26" fill="#fbcfe8" letter-spacing="4">
        EPIC SPACE OPERA • DELUXE ISSUE
      </text>
      <text x="540" y="170" font-family="'Impact', sans-serif" font-size="95" fill="#fdf4ff" stroke="#000" stroke-width="6" text-anchor="middle" letter-spacing="4">
        CHRONICLES OF NEBULA
      </text>

      <!-- Main Cover Art Artboard -->
      <rect x="0" y="260" width="1080" height="1100" fill="#0f051d" stroke="#000" stroke-width="8" filter="url(#comic-shadow)" rx="8" />
      
      <!-- Starlight & Galaxies -->
      <circle cx="200" cy="400" r="140" fill="#a21caf" opacity="0.3" filter="blur(30px)" />
      <circle cx="800" cy="700" r="180" fill="#ec4899" opacity="0.3" filter="blur(30px)" />
      <circle cx="540" cy="800" r="260" fill="#4c1d95" opacity="0.4" filter="blur(40px)" />

      <!-- Spaceship Stellar-X Starship -->
      <g transform="translate(540, 800) rotate(-25)">
        <polygon points="0,-180 -70,120 0,80 70,120" fill="#e2e8f0" stroke="#000" stroke-width="6" />
        <polygon points="-70,120 -160,180 -70,150" fill="#3b82f6" stroke="#000" stroke-width="4" />
        <polygon points="70,120 160,180 70,150" fill="#3b82f6" stroke="#000" stroke-width="4" />
        <polygon points="0,-60 -20,20 20,20" fill="#f43f5e" />
        <!-- Thruster Fire -->
        <polygon points="-30,100 0,220 30,100" fill="#facc15" />
      </g>

      <!-- Cosmic Ring Planet -->
      <circle cx="240" cy="500" r="100" fill="#831843" stroke="#f472b6" stroke-width="4" />
      <ellipse cx="240" cy="500" rx="160" ry="30" fill="none" stroke="#fbcfe8" stroke-width="6" transform="rotate(-20 240 500)" />

      <g transform="translate(180, 1140)">
        <rect x="0" y="0" width="720" height="80" fill="#be185d" stroke="#000" stroke-width="6" filter="url(#comic-shadow)" rx="6" />
        <text x="360" y="52" font-family="'Impact', sans-serif" font-size="34" fill="#ffffff" text-anchor="middle" letter-spacing="3">
          EPISODE 1: THE STARFALL ANOMALY
        </text>
      </g>
    </g>
    `,

    // Page 2: Inside the Starlight Cockpit
    `
    <g transform="translate(60, 120)">
      <rect width="1080" height="1440" fill="#180b2b" stroke="#000" stroke-width="8" filter="url(#comic-shadow)" rx="6" />
      <rect x="40" y="40" width="1000" height="120" fill="#fef08a" stroke="#000" stroke-width="4" filter="url(#comic-shadow)" />
      <text x="70" y="85" font-family="'Impact', sans-serif" font-size="24" fill="#000">DEEP SPACE CO-ORDINATES: SECTOR OMEGA</text>
      <text x="70" y="125" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#334155">
        Captain Lyra tracks the ancient alien beacon emitting from the nebula's core.
      </text>

      <!-- Cockpit Window View -->
      <rect x="40" y="190" width="1000" height="680" fill="#030712" stroke="#701a75" stroke-width="6" rx="8" />
      <circle cx="540" cy="530" r="220" fill="#db2777" opacity="0.4" filter="blur(30px)" />
      <polygon points="540,380 620,530 460,530" fill="#f472b6" opacity="0.8" />
      
      <!-- Speech Bubbles -->
      <g transform="translate(80, 920)">
        <rect width="920" height="180" fill="#ffffff" stroke="#000" stroke-width="5" rx="8" filter="url(#comic-shadow)" />
        <text x="460" y="60" font-family="'Arial Black', sans-serif" font-size="22" fill="#831843" text-anchor="middle">CAPTAIN LYRA:</text>
        <text x="460" y="105" font-family="Arial, sans-serif" font-size="19" font-weight="bold" fill="#0f172a" text-anchor="middle">
          "The sensor readings are off the charts! It's not a stellar phenomenon..."
        </text>
        <text x="460" y="145" font-family="Arial, sans-serif" font-size="19" font-weight="bold" fill="#db2777" text-anchor="middle">
          "IT'S AN ANCIENT JUMP GATE POWERING UP!"
        </text>
      </g>
    </g>
    `,

    // Page 3: The Gateway Opens
    `
    <g transform="translate(60, 120)">
      <rect width="1080" height="1440" fill="#090514" stroke="#000" stroke-width="8" filter="url(#comic-shadow)" rx="6" />
      
      <!-- Massive Swirling Warp Portal -->
      <circle cx="540" cy="600" r="380" fill="none" stroke="#f472b6" stroke-width="18" stroke-dasharray="24,12" />
      <circle cx="540" cy="600" r="280" fill="none" stroke="#c084fc" stroke-width="24" />
      <circle cx="540" cy="600" r="160" fill="#fdf2f8" opacity="0.8" />

      <!-- Massive Sound Effect -->
      <text x="540" y="240" font-family="'Impact', sans-serif" font-size="95" fill="#facc15" stroke="#000" stroke-width="8" text-anchor="middle" filter="url(#comic-shadow)">
        WHOOOOSH-ZAAAP!
      </text>

      <rect x="60" y="1120" width="960" height="180" fill="#0f172a" stroke="#a855f7" stroke-width="5" rx="8" filter="url(#comic-shadow)" />
      <text x="540" y="1180" font-family="'Arial Black', sans-serif" font-size="22" fill="#e879f9" text-anchor="middle">NAV-COMPUTER AI:</text>
      <text x="540" y="1225" font-family="Arial, sans-serif" font-size="19" font-weight="bold" fill="#f8fafc" text-anchor="middle">
        "Warning: Dimensional rift active. Estimated transit time: Instantaneous."
      </text>
      <text x="540" y="1265" font-family="Arial, sans-serif" font-size="19" font-weight="bold" fill="#38bdf8" text-anchor="middle">
        "Initiating jump drive sequence NOW."
      </text>
    </g>
    `,

    // Page 4: Jump Drive Flash
    `
    <g transform="translate(60, 120)">
      <rect width="1080" height="1440" fill="#ffffff" stroke="#000" stroke-width="8" filter="url(#comic-shadow)" rx="6" />
      <!-- Starburst explosion -->
      <polygon points="540,100 620,480 1000,540 640,680 800,1060 540,800 280,1060 440,680 80,540 460,480" fill="#ec4899" opacity="0.8" />
      
      <text x="540" y="580" font-family="'Impact', sans-serif" font-size="120" fill="#ffffff" stroke="#000" stroke-width="12" text-anchor="middle" filter="url(#comic-shadow)">
        WARP-SPEED!
      </text>

      <rect x="140" y="1200" width="800" height="90" fill="#000000" stroke="#f43f5e" stroke-width="4" rx="6" />
      <text x="540" y="1255" font-family="'Impact', sans-serif" font-size="32" fill="#ffffff" text-anchor="middle">
        ENTER THE UNCHARTED COSMOS...
      </text>
    </g>
    `,

    // Page 5: Epilogue & Credits
    `
    <g transform="translate(60, 60)">
      <rect width="1080" height="1630" fill="#0f071b" stroke="#000" stroke-width="8" filter="url(#comic-shadow)" rx="8" />
      
      <rect x="60" y="60" width="960" height="160" fill="#701a75" stroke="#000" stroke-width="6" rx="8" />
      <text x="540" y="130" font-family="'Impact', sans-serif" font-size="44" fill="#ffffff" text-anchor="middle" letter-spacing="3">
        CHRONICLES OF NEBULA #1 • COMPLETE
      </text>
      <text x="540" y="180" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#fbcfe8" text-anchor="middle">
        Thank you for reading with Comic Reader!
      </text>

      <!-- Feature Card Showcase -->
      <g transform="translate(60, 260)">
        <rect width="960" height="840" fill="#180b2b" stroke="#a21caf" stroke-width="4" rx="8" />
        
        <text x="480" y="70" font-family="'Impact', sans-serif" font-size="32" fill="#f472b6" text-anchor="middle">
          READER FEATURES AT YOUR FINGERTIPS:
        </text>

        <!-- Feature bullets -->
        <g transform="translate(60, 130)">
          <circle cx="20" cy="20" r="14" fill="#ec4899" />
          <text x="55" y="27" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">
            Full CBR & CBZ Support: Instant decompression of RAR and ZIP comic archives.
          </text>

          <circle cx="20" cy="80" r="14" fill="#ec4899" />
          <text x="55" y="87" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">
            Double Page Spreads & Manga Mode: Read 2 pages side-by-side or switch to RTL.
          </text>

          <circle cx="20" cy="140" r="14" fill="#ec4899" />
          <text x="55" y="147" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">
            Continuous Webtoon Scroll: Fluid vertical reading for modern manhwa.
          </text>

          <circle cx="20" cy="200" r="14" fill="#ec4899" />
          <text x="55" y="207" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">
            Visual Filters: Dark Onyx, Sepia, OLED Black, and Brightness/Contrast controls.
          </text>

          <circle cx="20" cy="260" r="14" fill="#ec4899" />
          <text x="55" y="267" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">
            Interactive Magnifier Loupe: Zoom in on fine comic details and speech balloons.
          </text>

          <circle cx="20" cy="320" r="14" fill="#ec4899" />
          <text x="55" y="327" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">
            Progress Tracking: Automatically saves your exact reading spot across sessions.
          </text>
        </g>
      </g>

      <!-- Back Stamp -->
      <g transform="translate(540, 1340)">
        <rect x="-300" y="-50" width="600" height="100" fill="#be185d" stroke="#000" stroke-width="5" rx="8" filter="url(#comic-shadow)" />
        <text x="0" y="12" font-family="'Impact', sans-serif" font-size="34" fill="#ffffff" text-anchor="middle">
          READY FOR YOUR OWN COMICS!
        </text>
      </g>
    </g>
    `,
  ];

  return pagesData.map((contentSvg, idx) => ({
    pageNumber: idx + 1,
    fileName: `Chronicles_Nebula_01_Page_${String(idx + 1).padStart(3, '0')}.svg`,
    blobUrl: createComicSvgPage({
      pageNumber: idx + 1,
      totalPages: total,
      title,
      theme: 'cosmic',
      contentSvg,
    }),
    mimeType: 'image/svg+xml',
  }));
}

export const SAMPLE_COMIC_BOOKS: ComicBook[] = [
  {
    id: 'sample-cyber-guardian-01',
    title: 'Cyber Guardian: Dawn of the Grid',
    fileName: 'Cyber_Guardian_#1.cbz',
    fileSize: 1024 * 720,
    format: 'sample',
    pageCount: 6,
    coverUrl: '', // generated on load
    currentPage: 1,
    lastRead: Date.now() - 1000 * 60 * 30,
    addedAt: Date.now() - 1000 * 60 * 60 * 24,
    isFinished: false,
    bookmarks: [],
    rating: 5,
    tags: ['Sci-Fi', 'Action', 'Cyberpunk', 'Sample'],
    metadata: {
      title: 'Cyber Guardian: Dawn of the Grid',
      series: 'Cyber Guardian',
      number: '1',
      volume: '1',
      summary: 'In the sprawling cybernetic megacity of Neo-Metropolis, a sentient quantum virus breaks free. Only the Cyber Guardian can prevent total grid collapse.',
      year: '2026',
      writer: 'Antigravity Studio',
      penciller: 'Digital Vectors',
      publisher: 'Nexus Comic Publishing',
      genre: 'Cyberpunk / Superhero',
    },
  },
  {
    id: 'sample-cosmic-voyage-01',
    title: 'Chronicles of Nebula: The Starfall Voyage',
    fileName: 'Chronicles_Nebula_#1.cbr',
    fileSize: 1024 * 560,
    format: 'sample',
    pageCount: 5,
    coverUrl: '',
    currentPage: 1,
    lastRead: Date.now() - 1000 * 60 * 120,
    addedAt: Date.now() - 1000 * 60 * 60 * 48,
    isFinished: false,
    bookmarks: [],
    rating: 5,
    tags: ['Space Opera', 'Sci-Fi', 'Cosmic', 'Sample'],
    metadata: {
      title: 'Chronicles of Nebula: The Starfall Voyage',
      series: 'Chronicles of Nebula',
      number: '1',
      volume: '1',
      summary: 'Captain Lyra discovers an ancient dimensional beacon that alters the destiny of the galaxy forever.',
      year: '2026',
      writer: 'Deep Space Guild',
      publisher: 'Starlight Comics',
      genre: 'Space Opera',
    },
  },
];
