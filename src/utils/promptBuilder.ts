export interface StyleTemplate {
  id: string;
  name: string;
  category: 'Cinematic' | 'Anime & Art' | 'Sci-Fi' | 'Vintage' | 'Commercial';
  description: string;
  badge: string;
  promptModifier: string;
  colorGrade: string;
  defaultLens: string;
  defaultLighting: string;
  defaultCameraMotion: string;
  thumbnailGradient: string;
}

export const BUILTIN_STYLE_TEMPLATES: StyleTemplate[] = [
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neo-Tokyo',
    category: 'Sci-Fi',
    badge: 'Trending',
    description: 'Dystopian futuristic rain-slicked streets, vibrant neon holograms, anamorphic cyan and magenta lens flares.',
    promptModifier: 'cyberpunk aesthetic, futuristic mega-city, rain puddles reflecting vibrant pink and neon cyan signage, holographic billboards, highly detailed 8k render, octane render style',
    colorGrade: 'cyberpunk',
    defaultLens: '35mm anamorphic',
    defaultLighting: 'Neon street glow & holographic rim light',
    defaultCameraMotion: 'Drone Glide',
    thumbnailGradient: 'from-pink-600 via-purple-700 to-cyan-500',
  },
  {
    id: 'cinematic-imax',
    name: 'IMAX 70mm Cinematic',
    category: 'Cinematic',
    badge: 'Hollywood',
    description: 'Ultra-wide dynamic range, authentic film texture, shallow depth of field, dramatic moody color grading.',
    promptModifier: 'shot on 70mm IMAX camera, masterpiece, dramatic cinematic lighting, shallow depth of field, subtle film grain, 8k resolution, award-winning cinematography, photorealistic',
    colorGrade: 'teal-orange',
    defaultLens: '50mm prime',
    defaultLighting: 'Dramatic volumetric chiaroscuro',
    defaultCameraMotion: 'Slow Push-in',
    thumbnailGradient: 'from-amber-600 via-orange-800 to-slate-900',
  },
  {
    id: 'anime-ghibli',
    name: 'Studio Ghibli Watercolor',
    category: 'Anime & Art',
    badge: 'Anime',
    description: 'Hand-painted pastoral lush backgrounds, warm nostalgic sunlight, soft cloud volumetrics, peaceful fantasy emotion.',
    promptModifier: 'Studio Ghibli style, hand-drawn anime animation, lush vibrant watercolor textures, golden hour sunlight through lush trees, whimsical pastoral serenity, Makoto Shinkai sky detail',
    colorGrade: 'golden-hour',
    defaultLens: '35mm wide',
    defaultLighting: 'Warm golden sunlight & soft ambient glow',
    defaultCameraMotion: 'Pedestal Up',
    thumbnailGradient: 'from-emerald-500 via-teal-600 to-sky-400',
  },
  {
    id: '3d-pixar',
    name: '3D Pixar Whimsical',
    category: 'Anime & Art',
    badge: '3D Animation',
    description: 'Stylized high-end 3D character design, subsurface scattering, expressive lighting, playful vivid colors.',
    promptModifier: 'Pixar 3D animation style, modern Disney animation render, rich subsurface scattering skin, expressive stylized characters, ray-traced soft shadows, vibrant cheerful color palette, 4k render',
    colorGrade: 'vibrant',
    defaultLens: '50mm',
    defaultLighting: 'Bouncy warm three-point key light',
    defaultCameraMotion: 'Orbit 360',
    thumbnailGradient: 'from-blue-500 via-indigo-600 to-purple-600',
  },
  {
    id: 'vintage-70s',
    name: '1970s Retro Super 8',
    category: 'Vintage',
    badge: 'Retro',
    description: 'Authentic 16mm film jitter, sepia warmth, nostalgic dust specks, light leaks, and vintage optical halation.',
    promptModifier: '1970s vintage film stock, 16mm kodachrome, warm nostalgic sepia tones, film grain, subtle light leaks on edges, retro aesthetic, organic imperfections, archival documentary feel',
    colorGrade: 'sepia',
    defaultLens: '28mm vintage lens',
    defaultLighting: 'Sun-drenched natural haze',
    defaultCameraMotion: 'Handheld organic shake',
    thumbnailGradient: 'from-yellow-700 via-amber-800 to-stone-900',
  },
  {
    id: 'drone-nature',
    name: 'Epic FPV Drone Aerial',
    category: 'Commercial',
    badge: 'Aerial',
    description: 'High-speed sweeping landscape traversal, mountain peaks, coastal breakers, ultra-smooth horizon stabilization.',
    promptModifier: 'sweeping cinematic FPV drone footage, breathtaking high altitude landscape, golden hour mist rolling through mountains, ultra-smooth gimbal motion, hyper-detailed nature documentary, National Geographic quality',
    colorGrade: 'teal-orange',
    defaultLens: '16mm ultra-wide',
    defaultLighting: 'Sunrise atmospheric backlighting',
    defaultCameraMotion: 'FPV Dive & Fly-through',
    thumbnailGradient: 'from-sky-600 via-blue-800 to-emerald-900',
  },
  {
    id: 'dark-noir',
    name: 'Dark Noir Mystery',
    category: 'Cinematic',
    badge: 'Noir',
    description: 'Venetian blind shadows, high-contrast monochrome, foggy cobblestone alleyways, single spotlight highlights.',
    promptModifier: 'classic film noir, deep dramatic shadows, high contrast black and white with subtle metallic undertones, smoky atmospheric mist, rain slicked cobblestone, dramatic silhouettes, mystery thriller',
    colorGrade: 'noir',
    defaultLens: '85mm portrait telephoto',
    defaultLighting: 'Harsh side key light & Venetian blind cuts',
    defaultCameraMotion: 'Slow Tracking Shot',
    thumbnailGradient: 'from-zinc-900 via-neutral-800 to-slate-900',
  },
  {
    id: 'claymation-stopmotion',
    name: 'Claymation Artisan',
    category: 'Anime & Art',
    badge: 'Artisan',
    description: 'Textured plasticine fingerprints, tactile stop-motion 12fps cadence, miniature diorama craftsmanship.',
    promptModifier: 'stop motion animation, handcrafted claymation, visible plasticine thumbprint textures, miniature set lighting, tactile organic frame rate, Aardman and Laika animation aesthetic',
    colorGrade: 'vibrant',
    defaultLens: '40mm macro',
    defaultLighting: 'Miniature studio tabletop lighting',
    defaultCameraMotion: 'Subtle Step Motion',
    thumbnailGradient: 'from-amber-700 via-rose-800 to-orange-950',
  },
];

export interface PromptOptions {
  userPrompt: string;
  templateId?: string;
  customTemplateModifier?: string;
  cameraMotion?: string;
  lighting?: string;
  lens?: string;
  fps?: number;
  mood?: string;
}

export function compileVideoPrompt(options: PromptOptions): string {
  const parts: string[] = [];

  // Core user prompt
  const cleanPrompt = options.userPrompt.trim();
  if (cleanPrompt) {
    parts.push(cleanPrompt);
  }

  // Camera motion
  if (options.cameraMotion && options.cameraMotion !== 'Auto' && options.cameraMotion !== 'Static') {
    parts.push(`camera motion: ${options.cameraMotion}`);
  }

  // Camera lens
  if (options.lens && options.lens !== 'Standard') {
    parts.push(`lens: ${options.lens}`);
  }

  // Lighting
  if (options.lighting && options.lighting !== 'Natural') {
    parts.push(`lighting: ${options.lighting}`);
  }

  // Mood
  if (options.mood && options.mood !== 'Neutral') {
    parts.push(`mood: ${options.mood}`);
  }

  // Style template modifier
  if (options.templateId) {
    const template = BUILTIN_STYLE_TEMPLATES.find((t) => t.id === options.templateId);
    if (template) {
      parts.push(template.promptModifier);
    }
  }

  if (options.customTemplateModifier) {
    parts.push(options.customTemplateModifier.trim());
  }

  return parts.join(', ');
}
