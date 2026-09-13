export interface StripPreset {
  id: string;
  name: string;
  category: 'lifestyle' | 'pirates' | 'tech' | 'classic' | 'vintage';
  shotCount: number;
  aspectRatio: number; // width / height ratio
  defaultHeader: string;
  defaultSubtitle: string;
  badgeText: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
  frameRadius: number;
  pattern?: 'hearts' | 'floral' | 'celestial' | 'nature' | 'sparkles' | 'cyber' | 'pirate' | 'korean' | 'none';
  fontStyle?: 'cursive' | 'sans' | 'serif' | 'mono';
  hasFrameNumbers?: boolean;
  hasBarcode?: boolean;
  decorationType:
    | 'family'
    | 'hearts'
    | 'sparkles'
    | 'star'
    | 'crown'
    | 'lock'
    | 'korean'
    | 'film'
    | 'classic'
    | 'pirate'
    | 'bounty'
    | 'terminal'
    | 'hacker'
    | 'shield'
    | 'neon'
    | 'y2k'
    | 'gothic'
    | 'fairy'
    | 'minimal';
  description: string;
}

export interface LayoutFormatOption {
  id: string;
  name: string;
  shotCount: number;
  aspectRatio: number;
  icon: string;
}

export const LAYOUT_FORMAT_OPTIONS: LayoutFormatOption[] = [
  { id: 'vertical-3', name: '3-Shot Strip', shotCount: 3, aspectRatio: 1, icon: 'layout-list' },
  { id: 'vertical-4', name: '4-Shot Strip', shotCount: 4, aspectRatio: 1, icon: 'layout-list' },
  { id: 'classic-4', name: '4-Shot Classic', shotCount: 4, aspectRatio: 4 / 3, icon: 'columns' },
  { id: 'grid-2x2', name: '2x2 Grid', shotCount: 4, aspectRatio: 1, icon: 'grid' },
  { id: 'grid-2x3', name: '6-Shot 2x3 Grid', shotCount: 6, aspectRatio: 1, icon: 'grid' },
  { id: 'polaroid', name: 'Polaroid', shotCount: 1, aspectRatio: 1, icon: 'square' },
];

export interface ThemePatternOption {
  id: 'none' | 'hearts' | 'celestial' | 'nature' | 'floral' | 'sparkles' | 'cyber' | 'pirate' | 'korean' | 'cherries' | 'bows' | 'stars' | 'leopard' | 'clouds' | 'checkered' | 'butterflies' | 'strawberry' | 'stripes' | 'polka' | 'waves' | 'filmstrip' | 'disco';
  name: string;
  icon: string;
  defaultBg: string;
  defaultBorder: string;
  defaultText: string;
  defaultAccent: string;
}

export const THEME_PATTERN_OPTIONS: ThemePatternOption[] = [
  { id: 'none', name: 'Clean Minimal', icon: 'ban', defaultBg: '#FFFFFF', defaultBorder: '#18181B', defaultText: '#18181B', defaultAccent: '#52525B' },
  { id: 'hearts', name: 'Red Hearts', icon: 'heart', defaultBg: '#0F0F12', defaultBorder: '#EF4444', defaultText: '#FFFFFF', defaultAccent: '#EF4444' },
  { id: 'cherries', name: 'Sweet Cherries', icon: 'cherry', defaultBg: '#FFF1F2', defaultBorder: '#E11D48', defaultText: '#881337', defaultAccent: '#F43F5E' },
  { id: 'strawberry', name: 'Berry Sweet', icon: 'cherry', defaultBg: '#FFF1F2', defaultBorder: '#DC2626', defaultText: '#991B1B', defaultAccent: '#EF4444' },
  { id: 'bows', name: 'Coquette Bows', icon: 'ribbon', defaultBg: '#FCE7F3', defaultBorder: '#EC4899', defaultText: '#831843', defaultAccent: '#F472B6' },
  { id: 'butterflies', name: 'Soft Butterflies', icon: 'sparkles', defaultBg: '#F5F3FF', defaultBorder: '#8B5CF6', defaultText: '#4C1D95', defaultAccent: '#A78BFA' },
  { id: 'stars', name: 'Y2K Stars', icon: 'star', defaultBg: '#0F172A', defaultBorder: '#F59E0B', defaultText: '#FEF3C7', defaultAccent: '#FBBF24' },
  { id: 'leopard', name: 'Wild Leopard', icon: 'paw-print', defaultBg: '#FEF3C7', defaultBorder: '#78350F', defaultText: '#451A03', defaultAccent: '#D97706' },
  { id: 'clouds', name: 'Dreamy Clouds', icon: 'cloud', defaultBg: '#E0F2FE', defaultBorder: '#0284C7', defaultText: '#075985', defaultAccent: '#38BDF8' },
  { id: 'waves', name: 'Ocean Waves', icon: 'cloud', defaultBg: '#F0FDFA', defaultBorder: '#0D9488', defaultText: '#134E4A', defaultAccent: '#2DD4BF' },
  { id: 'checkered', name: 'Retro Checkered', icon: 'grid-3x3', defaultBg: '#18181B', defaultBorder: '#FAFAFA', defaultText: '#FFFFFF', defaultAccent: '#E4E4E7' },
  { id: 'stripes', name: 'Candy Stripes', icon: 'grid-3x3', defaultBg: '#FDF2F8', defaultBorder: '#F472B6', defaultText: '#831843', defaultAccent: '#FB7185' },
  { id: 'polka', name: 'Retro Polka', icon: 'sparkles', defaultBg: '#FEF2F2', defaultBorder: '#EF4444', defaultText: '#991B1B', defaultAccent: '#F87171' },
  { id: 'celestial', name: 'Moon & Stars', icon: 'moon', defaultBg: '#0B0F19', defaultBorder: '#38BDF8', defaultText: '#F0F9FF', defaultAccent: '#38BDF8' },
  { id: 'nature', name: 'Sun & Trees', icon: 'sun', defaultBg: '#064E3B', defaultBorder: '#34D399', defaultText: '#ECFDF5', defaultAccent: '#34D399' },
  { id: 'floral', name: 'Floral Garden', icon: 'flower', defaultBg: '#A5B4FC', defaultBorder: '#6366F1', defaultText: '#FFFFFF', defaultAccent: '#F43F5E' },
  { id: 'sparkles', name: 'Magic Sparkles', icon: 'sparkles', defaultBg: '#F3E8FF', defaultBorder: '#A855F7', defaultText: '#4C1D95', defaultAccent: '#A855F7' },
  { id: 'disco', name: 'Y2K Disco', icon: 'star', defaultBg: '#312E81', defaultBorder: '#818CF8', defaultText: '#EEF2FF', defaultAccent: '#A5B4FC' },
  { id: 'filmstrip', name: 'Film Sprockets', icon: 'film', defaultBg: '#18181B', defaultBorder: '#E4E4E7', defaultText: '#FFFFFF', defaultAccent: '#A1A1AA' },
  { id: 'cyber', name: 'Cyber Terminal', icon: 'terminal', defaultBg: '#0D1117', defaultBorder: '#00FF66', defaultText: '#00FF66', defaultAccent: '#22C55E' },
  { id: 'pirate', name: 'Pirate Wanted', icon: 'skull', defaultBg: '#EED9B3', defaultBorder: '#3D2008', defaultText: '#2E1503', defaultAccent: '#854D0E' },
  { id: 'korean', name: 'Korean Studio', icon: 'camera', defaultBg: '#EEF2FF', defaultBorder: '#312E81', defaultText: '#1E1B4B', defaultAccent: '#6366F1' },
];

export const COLOR_PALETTE_PRESETS = [
  { name: 'White', bg: '#FFFFFF', border: '#18181B' },
  { name: 'Noir', bg: '#0F0F12', border: '#3F3F46' },
  { name: 'Pink', bg: '#FCE7F3', border: '#EC4899' },
  { name: 'Sky Blue', bg: '#E0F2FE', border: '#0284C7' },
  { name: 'Lavender', bg: '#F3E8FF', border: '#7C3AED' },
  { name: 'Cream', bg: '#FEF3C7', border: '#D97706' },
  { name: 'Mint', bg: '#ECFCCB', border: '#65A30D' },
  { name: 'Parchment', bg: '#EED9B3', border: '#3D2008' },
];

export interface ThemeCategoryTab {
  id: string;
  name: string;
  icon: string;
}

export const THEME_CATEGORY_TABS: ThemeCategoryTab[] = [
  { id: 'all', name: 'All Themes', icon: 'grid' },
  { id: 'pirates', name: 'Pirates & Bounty', icon: 'skull' },
  { id: 'tech', name: 'Tech & Hackers', icon: 'terminal' },
  { id: 'lifestyle', name: 'Aesthetics & Romance', icon: 'heart' },
  { id: 'classic', name: 'Photobooth & Studio', icon: 'camera' },
  { id: 'vintage', name: 'Vintage & Film', icon: 'film' },
];

export const STRIP_PRESETS: StripPreset[] = [
  // --- PETS & PATTERNS (Matched from User Reference Photos) ---
  {
    id: 'red-hearts-black',
    name: 'Red Hearts Noir',
    category: 'lifestyle',
    shotCount: 3,
    aspectRatio: 1,
    defaultHeader: '',
    defaultSubtitle: 'meow',
    badgeText: '',
    backgroundColor: '#0F0F12',
    borderColor: '#EF4444',
    textColor: '#FFFFFF',
    accentColor: '#EF4444',
    frameRadius: 4,
    pattern: 'hearts',
    fontStyle: 'cursive',
    decorationType: 'hearts',
    description: 'Black strip with bold red hearts pattern and handwritten meow tagline',
  },
  {
    id: 'red-hearts-pink',
    name: 'Pink Hearts',
    category: 'lifestyle',
    shotCount: 3,
    aspectRatio: 1,
    defaultHeader: '',
    defaultSubtitle: '#fishinlove',
    badgeText: '',
    backgroundColor: '#FBCFE8',
    borderColor: '#E11D48',
    textColor: '#881337',
    accentColor: '#EF4444',
    frameRadius: 4,
    pattern: 'hearts',
    fontStyle: 'cursive',
    decorationType: 'hearts',
    description: 'Soft pink strip with bold red hearts pattern and cursive hashtag tagline',
  },
  {
    id: 'pastel-floral',
    name: 'Pastel Floral Garden',
    category: 'lifestyle',
    shotCount: 3,
    aspectRatio: 1,
    defaultHeader: '',
    defaultSubtitle: 'Woof Woof',
    badgeText: '',
    backgroundColor: '#A5B4FC',
    borderColor: '#6366F1',
    textColor: '#FFFFFF',
    accentColor: '#F43F5E',
    frameRadius: 4,
    pattern: 'floral',
    fontStyle: 'sans',
    decorationType: 'sparkles',
    description: 'Pastel periwinkle strip with floral pattern and pet tagline',
  },
  {
    id: 'periwinkle-sky',
    name: 'Periwinkle Sky',
    category: 'lifestyle',
    shotCount: 3,
    aspectRatio: 1,
    defaultHeader: '',
    defaultSubtitle: 'Tweet Tweet',
    badgeText: '',
    backgroundColor: '#93C5FD',
    borderColor: '#2563EB',
    textColor: '#1E3A8A',
    accentColor: '#3B82F6',
    frameRadius: 4,
    pattern: 'celestial',
    fontStyle: 'sans',
    decorationType: 'star',
    description: 'Sky blue strip with celestial pattern',
  },
  // --- PIRATES & BOUNTY ---
  {
    id: 'pirate-wanted',
    name: 'Pirate Wanted Poster',
    category: 'pirates',
    shotCount: 3,
    aspectRatio: 4 / 3,
    defaultHeader: 'WANTED',
    defaultSubtitle: 'DEAD OR ALIVE',
    badgeText: 'REWARD: ฿ 3,000,000,000',
    backgroundColor: '#EED9B3',
    borderColor: '#3D2008',
    textColor: '#2E1503',
    accentColor: '#854D0E',
    frameRadius: 4,
    decorationType: 'pirate',
    description: 'Iconic anime/pirate wanted poster with grand line bounty reward',
  },
  {
    id: 'bounty-hunter',
    name: 'Bounty Hunter Wanted',
    category: 'pirates',
    shotCount: 4,
    aspectRatio: 4 / 3,
    defaultHeader: 'MOST WANTED',
    defaultSubtitle: 'DEAD OR ALIVE • APPREHEND',
    badgeText: 'BOUNTY CLAIM: $1,000,000',
    backgroundColor: '#1C1917',
    borderColor: '#D97706',
    textColor: '#FEF3C7',
    accentColor: '#F59E0B',
    frameRadius: 8,
    decorationType: 'bounty',
    description: 'Wild West & cyberpunk bounty hunter wanted poster',
  },

  // --- TECH & DEVELOPER TITLES ---
  {
    id: 'software-engineer',
    name: 'Software Engineer',
    category: 'tech',
    shotCount: 4,
    aspectRatio: 4 / 3,
    defaultHeader: 'SOFTWARE ENGINEER',
    defaultSubtitle: 'git commit -m "ship it" • 10x Dev',
    badgeText: 'STATUS: 200 OK • DEPLOYED',
    backgroundColor: '#0D1117',
    borderColor: '#388BFD',
    textColor: '#F0F6FC',
    accentColor: '#58A6FF',
    frameRadius: 8,
    decorationType: 'terminal',
    description: 'Dark terminal IDE aesthetics with git commit tags and status badges',
  },
  {
    id: 'black-hat',
    name: 'Black Hat Hacker',
    category: 'tech',
    shotCount: 4,
    aspectRatio: 4 / 3,
    defaultHeader: 'BLACK HAT HACKER',
    defaultSubtitle: 'SYSTEM OVERRIDE • ROOT ACCESS',
    badgeText: '0xDEADBEEF • UNTRACEABLE',
    backgroundColor: '#050505',
    borderColor: '#00FF66',
    textColor: '#00FF66',
    accentColor: '#22C55E',
    frameRadius: 4,
    decorationType: 'hacker',
    description: 'Matrix green terminal override layout with hex memory dump detailing',
  },
  {
    id: 'red-hat',
    name: 'Red Hat Security',
    category: 'tech',
    shotCount: 4,
    aspectRatio: 4 / 3,
    defaultHeader: 'RED HAT DEFENDER',
    defaultSubtitle: 'CYBERSECURITY & THREAT INTEL',
    badgeText: 'FIREWALL ACTIVE • 0 BREACHES',
    backgroundColor: '#0F172A',
    borderColor: '#DC2626',
    textColor: '#FEE2E2',
    accentColor: '#EF4444',
    frameRadius: 8,
    decorationType: 'shield',
    description: 'Red team/blue team cybersecurity defense badge with threat monitoring',
  },
  {
    id: 'neon-cyberpunk',
    name: 'Neon Cyberpunk',
    category: 'tech',
    shotCount: 4,
    aspectRatio: 4 / 3,
    defaultHeader: 'NIGHT CITY',
    defaultSubtitle: 'NEON DREAMS • EDGERUNNER',
    badgeText: 'CYBER ENHANCED • 2077',
    backgroundColor: '#09090B',
    borderColor: '#D946EF',
    textColor: '#2DD4BF',
    accentColor: '#F0ABFC',
    frameRadius: 0,
    decorationType: 'neon',
    description: 'High contrast cyberpunk aesthetic with neon magenta and cyan highlights',
  },

  // --- AESTHETICS & TRENDS ---
  {
    id: 'y2k-aesthetic',
    name: 'Y2K Aesthetic',
    category: 'lifestyle',
    shotCount: 4,
    aspectRatio: 4 / 3,
    defaultHeader: 'Y2K VIBES',
    defaultSubtitle: 'Dial-Up Internet • Flip Phones',
    badgeText: 'STRICTLY 2000s • BLING',
    backgroundColor: '#FCE7F3',
    borderColor: '#EC4899',
    textColor: '#831843',
    accentColor: '#F472B6',
    frameRadius: 20,
    decorationType: 'y2k',
    description: 'Nostalgic 2000s era hot pink with metallic accents and curvy borders',
  },
  {
    id: 'gothic-dark',
    name: 'Gothic Noir',
    category: 'vintage',
    shotCount: 3,
    aspectRatio: 16 / 10,
    defaultHeader: 'NOCTURNE',
    defaultSubtitle: 'Midnight Shadows • Dark Academia',
    badgeText: 'ETERNAL NIGHT • 1899',
    backgroundColor: '#18181B',
    borderColor: '#3F3F46',
    textColor: '#E4E4E7',
    accentColor: '#71717A',
    frameRadius: 4,
    decorationType: 'gothic',
    description: 'Moody, dark gothic frames with silver accents and high contrast',
  },
  {
    id: 'fairycore',
    name: 'Fairycore Magic',
    category: 'lifestyle',
    shotCount: 4,
    aspectRatio: 4 / 3,
    defaultHeader: 'ENCHANTED FOREST',
    defaultSubtitle: 'Fairy Dust • Botanical Dreams',
    badgeText: 'ETHEREAL GLOW • WINGS',
    backgroundColor: '#ECFCCB',
    borderColor: '#84CC16',
    textColor: '#365314',
    accentColor: '#A3E635',
    frameRadius: 16,
    decorationType: 'fairy',
    description: 'Soft ethereal green with botanical elements and magical sparkles',
  },
  {
    id: 'minimalist-beige',
    name: 'Clean Minimalist',
    category: 'classic',
    shotCount: 4,
    aspectRatio: 4 / 3,
    defaultHeader: 'GALLERY STANDARD',
    defaultSubtitle: 'Less is More • Pure Aesthetic',
    badgeText: 'MUSEUM ARCHIVE • 01',
    backgroundColor: '#F5F5F4',
    borderColor: '#E7E5E4',
    textColor: '#44403C',
    accentColor: '#D6D3D1',
    frameRadius: 0,
    decorationType: 'minimal',
    description: 'Ultra-clean beige aesthetic focusing entirely on the photography',
  },

  // --- LIFESTYLE & RELATIONSHIPS ---
  {
    id: 'family',
    name: 'Family Memories',
    category: 'lifestyle',
    shotCount: 4,
    aspectRatio: 4 / 3,
    defaultHeader: 'FAMILY MEMORIES',
    defaultSubtitle: 'Together Is Our Favorite Place',
    badgeText: 'EST. 2026 • FAMILY FIRST',
    backgroundColor: '#FDFBF7',
    borderColor: '#1E293B',
    textColor: '#0F172A',
    accentColor: '#D97706',
    frameRadius: 14,
    decorationType: 'family',
    description: 'Warm cream aesthetic with gold accents and family crest detailing',
  },
  {
    id: 'couple',
    name: 'Couple & Romance',
    category: 'lifestyle',
    shotCount: 4,
    aspectRatio: 4 / 3,
    defaultHeader: 'YOU & ME FOREVER',
    defaultSubtitle: 'Two Hearts • One Story',
    badgeText: 'LOCKED IN LOVE • ALWAYS',
    backgroundColor: '#FFF1F2',
    borderColor: '#E11D48',
    textColor: '#881337',
    accentColor: '#FB7185',
    frameRadius: 16,
    decorationType: 'hearts',
    description: 'Romantic rose pink frame with delicate double-heart emblems',
  },
  {
    id: 'besties',
    name: 'Best Friends / BFF',
    category: 'lifestyle',
    shotCount: 4,
    aspectRatio: 4 / 3,
    defaultHeader: 'PARTNERS IN CRIME',
    defaultSubtitle: 'BFF Studio • Forever & Always',
    badgeText: 'BESTIES 4EVER • SQUAD',
    backgroundColor: '#F3E8FF',
    borderColor: '#7C3AED',
    textColor: '#4C1D95',
    accentColor: '#A855F7',
    frameRadius: 16,
    decorationType: 'sparkles',
    description: 'Vibrant lavender frame with sparkle graphics and BFF stamp',
  },
  {
    id: 'solo',
    name: 'Solo Studio',
    category: 'lifestyle',
    shotCount: 4,
    aspectRatio: 4 / 3,
    defaultHeader: 'PORTRAIT STUDIO',
    defaultSubtitle: 'Self Love & Editorial Vibes',
    badgeText: 'SOLO EDITION • VOL. 01',
    backgroundColor: '#09090B',
    borderColor: '#FAFAFA',
    textColor: '#FAFAFA',
    accentColor: '#E4E4E7',
    frameRadius: 8,
    decorationType: 'star',
    description: 'Sleek dark magazine editorial layout with crisp white typography',
  },
  {
    id: 'single',
    name: 'Single & Fabulous',
    category: 'lifestyle',
    shotCount: 3,
    aspectRatio: 4 / 3,
    defaultHeader: 'MAIN CHARACTER',
    defaultSubtitle: 'Single, Thriving & Fabulous',
    badgeText: '100% INDEPENDENT • CROWNED',
    backgroundColor: '#FEF3C7',
    borderColor: '#D97706',
    textColor: '#78350F',
    accentColor: '#F59E0B',
    frameRadius: 14,
    decorationType: 'crown',
    description: 'Bright golden yellow style celebrating independence and confidence',
  },
  {
    id: 'taken',
    name: 'Taken With Love',
    category: 'lifestyle',
    shotCount: 4,
    aspectRatio: 4 / 3,
    defaultHeader: 'OFF THE MARKET',
    defaultSubtitle: 'Taken & Deeply Loved',
    badgeText: 'MATCH MADE IN HEAVEN',
    backgroundColor: '#18181B',
    borderColor: '#991B1B',
    textColor: '#FECDD3',
    accentColor: '#F43F5E',
    frameRadius: 14,
    decorationType: 'lock',
    description: 'Luxurious dark velvet red frame with relationship lock stamp',
  },

  // --- PHOTOBOOTH & VINTAGE ---
  {
    id: 'korean-vintage',
    name: 'Korean Photobooth',
    category: 'classic',
    shotCount: 4,
    aspectRatio: 4 / 3,
    defaultHeader: 'LIFE MEMORIES',
    defaultSubtitle: '人生四片 • Life Four Cuts Studio',
    badgeText: 'K-BOOTH • 01/04 MEMORIES',
    backgroundColor: '#EEF2FF',
    borderColor: '#312E81',
    textColor: '#1E1B4B',
    accentColor: '#6366F1',
    frameRadius: 10,
    hasFrameNumbers: true,
    hasBarcode: true,
    decorationType: 'korean',
    description: 'Authentic Life Four Cuts Korean studio strip with frame numbers & barcode',
  },
  {
    id: 'vintage-3',
    name: 'Vintage 35mm Film',
    category: 'vintage',
    shotCount: 3,
    aspectRatio: 16 / 10,
    defaultHeader: 'RETRO FILM LAB',
    defaultSubtitle: '35mm Analog • ISO 400 Film Grain',
    badgeText: 'ANALOG ARCHIVE • 1984',
    backgroundColor: '#F5EBE0',
    borderColor: '#44403C',
    textColor: '#292524',
    accentColor: '#78716C',
    frameRadius: 4,
    decorationType: 'film',
    description: 'Authentic retro analog 3-shot film strip with sepia warmth and grain',
  },
  {
    id: 'classic-4',
    name: 'Classic 4-Shot',
    category: 'classic',
    shotCount: 4,
    aspectRatio: 4 / 3,
    defaultHeader: 'PHOTO BOOTH',
    defaultSubtitle: 'Official Studio Memory',
    badgeText: 'ORIGINAL STRIP',
    backgroundColor: '#FFFFFF',
    borderColor: '#18181B',
    textColor: '#18181B',
    accentColor: '#52525B',
    frameRadius: 8,
    decorationType: 'classic',
    description: 'The iconic black and white photobooth vertical 4-shot layout',
  },
  {
    id: 'grid-2x2',
    name: '2x2 Photocard Grid',
    category: 'classic',
    shotCount: 4,
    aspectRatio: 1,
    defaultHeader: 'MEMORIES COLLAGE',
    defaultSubtitle: '2x2 Grid Edition',
    badgeText: 'QUAD MEMORY',
    backgroundColor: '#F4F4F5',
    borderColor: '#27272A',
    textColor: '#18181B',
    accentColor: '#3F3F46',
    frameRadius: 12,
    decorationType: 'classic',
    description: 'Square 2x2 grid collage format perfect for social media sharing',
  },
  {
    id: 'polaroid',
    name: 'Polaroid Instant',
    category: 'vintage',
    shotCount: 1,
    aspectRatio: 1,
    defaultHeader: 'INSTANT MEMORY',
    defaultSubtitle: 'Captured Live',
    badgeText: 'POLAROID IMPRESSION',
    backgroundColor: '#FAFAFA',
    borderColor: '#E4E4E7',
    textColor: '#27272A',
    accentColor: '#71717A',
    frameRadius: 4,
    decorationType: 'film',
    description: 'Classic physical instant polaroid frame with handwritten margin space',
  },
];

export function getStripPreset(presetId: string): StripPreset {
  return STRIP_PRESETS.find((p) => p.id === presetId) || STRIP_PRESETS[0];
}
