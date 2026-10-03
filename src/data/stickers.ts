export interface StickerItem {
  id: string;
  name: string;
  category: 'Gaming' | 'Badges & Ribbons' | 'Sale & Promo' | 'Symbols & Accents';
  svg: string;
}

export const STICKER_LIBRARY: StickerItem[] = [
  {
    id: 'flame_fire',
    name: 'Fire Flame',
    category: 'Gaming',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="flameGrad" x1="50" y1="90" x2="50" y2="10" gradientUnits="userSpaceOnUse">
          <stop stop-color="#EA580C"/>
          <stop offset="0.5" stop-color="#F59E0B"/>
          <stop offset="1" stop-color="#FEF08A"/>
        </linearGradient>
      </defs>
      <path d="M50 5C50 5 62 25 55 42C62 33 72 38 72 50C72 65 58 78 50 82C42 78 28 65 28 50C28 35 40 28 42 18C44 26 48 30 50 5Z" fill="url(#flameGrad)" stroke="#C2410C" stroke-width="2"/>
      <path d="M50 35C50 35 56 46 52 56C56 50 62 54 62 60C62 69 54 75 50 78C46 75 38 69 38 60C38 51 44 47 46 41C47 46 49 48 50 35Z" fill="#FFFBEB"/>
    </svg>`,
  },
  {
    id: 'crown_gold',
    name: 'King Crown',
    category: 'Gaming',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="crownGrad" x1="10" y1="20" x2="90" y2="80" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FBBF24"/>
          <stop offset="1" stop-color="#B45309"/>
        </linearGradient>
      </defs>
      <path d="M15 70L22 30L40 55L50 20L60 55L78 30L85 70H15Z" fill="url(#crownGrad)" stroke="#78350F" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="22" cy="28" r="4" fill="#FDE68A"/>
      <circle cx="50" cy="18" r="5" fill="#EF4444"/>
      <circle cx="78" cy="28" r="4" fill="#FDE68A"/>
      <rect x="15" y="68" width="70" height="8" rx="2" fill="#78350F"/>
    </svg>`,
  },
  {
    id: 'lightning_bolt',
    name: 'Lightning Zap',
    category: 'Gaming',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="boltGrad" x1="30" y1="5" x2="70" y2="95" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FEF08A"/>
          <stop offset="0.6" stop-color="#EAB308"/>
          <stop offset="1" stop-color="#CA8A04"/>
        </linearGradient>
      </defs>
      <polygon points="56,5 24,52 48,52 40,95 76,44 52,44" fill="url(#boltGrad)" stroke="#854D0E" stroke-width="3" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    id: 'starburst_badge',
    name: 'Starburst Badge',
    category: 'Sale & Promo',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="badgeGrad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop stop-color="#EF4444"/>
          <stop offset="1" stop-color="#991B1B"/>
        </linearGradient>
      </defs>
      <path d="M50 5L58 20L75 12L76 30L94 33L86 50L94 67L76 70L75 88L58 80L50 95L42 80L25 88L24 70L6 67L14 50L6 33L24 30L25 12L42 20Z" fill="url(#badgeGrad)" stroke="#FEF2F2" stroke-width="2.5"/>
      <circle cx="50" cy="50" r="28" fill="#FFFFFF" fill-opacity="0.2"/>
    </svg>`,
  },
  {
    id: 'ribbon_banner',
    name: 'Golden Ribbon',
    category: 'Badges & Ribbons',
    svg: `<svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ribbonGrad" x1="10" y1="20" x2="110" y2="60" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FCD34D"/>
          <stop offset="0.5" stop-color="#F59E0B"/>
          <stop offset="1" stop-color="#D97706"/>
        </linearGradient>
      </defs>
      <path d="M15 25L5 40L15 55L30 55L30 25H15Z" fill="#92400E"/>
      <path d="M105 25L115 40L105 55L90 55L90 25H105Z" fill="#92400E"/>
      <path d="M22 22H98V58H22Z" fill="url(#ribbonGrad)" stroke="#78350F" stroke-width="2"/>
      <path d="M22 22L30 30V50L22 58Z" fill="#B45309"/>
      <path d="M98 22L90 30V50L98 58Z" fill="#B45309"/>
    </svg>`,
  },
  {
    id: 'verified_badge',
    name: 'Verified Checkmark',
    category: 'Badges & Ribbons',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 8L59 15L70 14L76 23L87 27L89 38L97 45L95 56L99 66L92 75L92 86L81 90L76 99L65 98L57 104L47 99L37 101L32 92L21 89L18 79L10 73L12 62L6 53L12 43L11 32L21 28L25 18L36 17L44 9Z" fill="#3B82F6"/>
      <path d="M38 52L46 60L64 42" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    id: 'dynamic_arrow',
    name: 'Thumbnail Red Arrow',
    category: 'Symbols & Accents',
    svg: `<svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="arrowGrad" x1="10" y1="30" x2="110" y2="70" gradientUnits="userSpaceOnUse">
          <stop stop-color="#EF4444"/>
          <stop offset="1" stop-color="#DC2626"/>
        </linearGradient>
      </defs>
      <path d="M10 38H65V18L110 50L65 82V62H10V38Z" fill="url(#arrowGrad)" stroke="#FFFFFF" stroke-width="4" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    id: 'sale_tag',
    name: 'Sale Tag',
    category: 'Sale & Promo',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tagGrad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stop-color="#EC4899"/>
          <stop offset="1" stop-color="#BE185D"/>
        </linearGradient>
      </defs>
      <path d="M20 20H55L85 50L55 80L20 50V20Z" fill="url(#tagGrad)" stroke="#FDF2F8" stroke-width="3"/>
      <circle cx="34" cy="34" r="6" fill="#FFFFFF"/>
    </svg>`,
  },
  {
    id: 'sparkle_stars',
    name: 'Sparkle Burst',
    category: 'Symbols & Accents',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5C50 30 70 50 95 50C70 50 50 70 50 95C50 70 30 50 5 50C30 50 50 30 50 5Z" fill="#FACC15" stroke="#FFFFFF" stroke-width="2"/>
      <circle cx="78" cy="22" r="6" fill="#FDE047"/>
      <circle cx="22" cy="78" r="4" fill="#FDE047"/>
    </svg>`,
  },
  {
    id: 'shield_emblem',
    name: 'Esports Shield',
    category: 'Gaming',
    svg: `<svg viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shieldGrad" x1="10" y1="10" x2="90" y2="100" gradientUnits="userSpaceOnUse">
          <stop stop-color="#1E293B"/>
          <stop offset="1" stop-color="#0F172A"/>
        </linearGradient>
        <linearGradient id="shieldBorder" x1="10" y1="10" x2="90" y2="100" gradientUnits="userSpaceOnUse">
          <stop stop-color="#38BDF8"/>
          <stop offset="1" stop-color="#2563EB"/>
        </linearGradient>
      </defs>
      <path d="M50 10L88 24V56C88 80 50 100 50 100C50 100 12 80 12 56V24L50 10Z" fill="url(#shieldGrad)" stroke="url(#shieldBorder)" stroke-width="5"/>
      <path d="M50 20L78 31V54C78 72 50 88 50 88C50 88 22 72 22 54V31L50 20Z" fill="#1E1B4B" fill-opacity="0.4"/>
    </svg>`,
  },
];
