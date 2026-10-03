export interface FontItem {
  name: string;
  family: string;
  category: 'Display' | '3D & Gaming' | 'Handwritten' | 'Serif' | 'Sans';
  previewText?: string;
}

export const FONTS_LIST: FontItem[] = [
  { name: 'Anton (Impact/Bold)', family: 'Anton, sans-serif', category: 'Display', previewText: 'IMPACT 3D' },
  { name: 'Bebas Neue (Thumbnail)', family: 'Bebas Neue, cursive', category: 'Display', previewText: 'THUMBNAIL' },
  { name: 'Bangers (Comic/Pop)', family: 'Bangers, cursive', category: '3D & Gaming', previewText: 'BOOM!' },
  { name: 'Righteous (Retro Wave)', family: 'Righteous, cursive', category: 'Display', previewText: 'RETRO WAVE' },
  { name: 'Orbitron (Sci-Fi/Tech)', family: 'Orbitron, sans-serif', category: '3D & Gaming', previewText: 'CYBER TECH' },
  { name: 'Russo One (Esports/Heavy)', family: 'Russo One, sans-serif', category: '3D & Gaming', previewText: 'WARRIOR' },
  { name: 'Montserrat (Ultra Bold)', family: 'Montserrat, sans-serif', category: 'Sans', previewText: 'MONTSERRAT' },
  { name: 'Cinzel (Royal/Roman)', family: 'Cinzel, serif', category: 'Serif', previewText: 'EMPIRE' },
  { name: 'Playfair Display (Luxury)', family: 'Playfair Display, serif', category: 'Serif', previewText: 'ELEGANCE' },
  { name: 'Permanent Marker (Street)', family: 'Permanent Marker, cursive', category: 'Handwritten', previewText: 'STREET ART' },
  { name: 'Pacifico (Brush Script)', family: 'Pacifico, cursive', category: 'Handwritten', previewText: 'Creative' },
  { name: 'Space Grotesk (Modern)', family: 'Space Grotesk, sans-serif', category: 'Sans', previewText: 'MODERN' },
  { name: 'Plus Jakarta Sans (Clean)', family: 'Plus Jakarta Sans, sans-serif', category: 'Sans', previewText: 'Clean UI' },
];

export const GRADIENT_PRESETS = [
  {
    name: 'Gold Chrome',
    stops: [
      { offset: 0, color: '#FFF4B8' },
      { offset: 0.3, color: '#F59E0B' },
      { offset: 0.7, color: '#D97706' },
      { offset: 1, color: '#78350F' },
    ],
  },
  {
    name: 'Fire Sunset',
    stops: [
      { offset: 0, color: '#FDE047' },
      { offset: 0.5, color: '#EF4444' },
      { offset: 1, color: '#7F1D1D' },
    ],
  },
  {
    name: 'Cyber Neon',
    stops: [
      { offset: 0, color: '#06B6D4' },
      { offset: 0.5, color: '#3B82F6' },
      { offset: 1, color: '#8B5CF6' },
    ],
  },
  {
    name: 'Electric Purple',
    stops: [
      { offset: 0, color: '#F472B6' },
      { offset: 0.5, color: '#A855F7' },
      { offset: 1, color: '#4C1D95' },
    ],
  },
  {
    name: 'Emerald Mint',
    stops: [
      { offset: 0, color: '#6EE7B7' },
      { offset: 0.5, color: '#10B981' },
      { offset: 1, color: '#064E3B' },
    ],
  },
  {
    name: 'Silver Metallic',
    stops: [
      { offset: 0, color: '#FFFFFF' },
      { offset: 0.4, color: '#CBD5E1' },
      { offset: 0.7, color: '#64748B' },
      { offset: 1, color: '#334155' },
    ],
  },
  {
    name: 'Candy Pop',
    stops: [
      { offset: 0, color: '#F43F5E' },
      { offset: 0.5, color: '#FB923C' },
      { offset: 1, color: '#FACC15' },
    ],
  },
  {
    name: 'Deep Oceanic',
    stops: [
      { offset: 0, color: '#38BDF8' },
      { offset: 0.5, color: '#0284C7' },
      { offset: 1, color: '#0F172A' },
    ],
  },
];

export const CANVAS_SIZE_PRESETS = [
  { name: 'YouTube Thumbnail', width: 1280, height: 720, ratio: '16:9' },
  { name: 'YouTube Channel Banner', width: 2560, height: 1440, ratio: '16:9' },
  { name: 'Instagram Square Post', width: 1080, height: 1080, ratio: '1:1' },
  { name: 'Instagram Story / Reel', width: 1080, height: 1920, ratio: '9:16' },
  { name: 'Facebook Cover', width: 820, height: 312, ratio: '2.6:1' },
  { name: 'Twitter / X Header', width: 1500, height: 500, ratio: '3:1' },
  { name: 'Profile Picture / Logo', width: 800, height: 800, ratio: '1:1' },
  { name: 'Standard HD Landscape', width: 1920, height: 1080, ratio: '16:9' },
];

export const POPULAR_QUOTES = [
  { quote: 'DO SOMETHING TODAY THAT YOUR FUTURE SELF WILL THANK YOU FOR', author: 'Sean Patrick Flanery' },
  { quote: 'CREATIVITY IS INTELLIGENCE HAVING FUN', author: 'Albert Einstein' },
  { quote: 'EVERY GREAT DESIGN BEGINS WITH AN EVEN BETTER STORY', author: 'Lorinda Mamo' },
  { quote: 'DON’T WATCH THE CLOCK; DO WHAT IT DOES. KEEP GOING.', author: 'Sam Levenson' },
  { quote: 'SIMPLICITY IS THE ULTIMATE SOPHISTICATION', author: 'Leonardo da Vinci' },
  { quote: 'BELIEVE YOU CAN AND YOU’RE HALFWAY THERE', author: 'Theodore Roosevelt' },
  { quote: 'MAKE IT SIMPLE, BUT SIGNIFICANT', author: 'Don Draper' },
  { quote: 'DISCIPLINE EQUALS FREEDOM', author: 'Jocko Willink' },
];
