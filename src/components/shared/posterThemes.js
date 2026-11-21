// src/components/shared/posterThemes.js

export const POSTER_LAYOUTS = [
  {
    id: 'wave-columns',
    sv: 'Vågor & Pelare',
    en: 'Wave & Pillars',
    descSv: 'Vågformat sidhuvud & upphöjda stegmedaljonger',
    descEn: 'Wavy header & protruding step medallions'
  },
  {
    id: 'diagonal-split',
    sv: 'Diagonal Split',
    en: 'Diagonal Slash',
    descSv: 'Heldiagonal färgdelning & snedställda stegbrickor',
    descEn: 'Full-poster diagonal slash & angled step badges'
  },
  {
    id: 'tilted-collage',
    sv: 'Kollage & Djup',
    en: 'Tilted Collage',
    descSv: 'Färgad bakgrund med vinklat lager under kortet',
    descEn: 'Full-color canvas with rotated backing layer'
  },
  {
    id: 'step-flow',
    sv: 'Flödesschema (01 → 02)',
    en: 'Step Flowchart (01 → 02)',
    descSv: 'Stora numrerade stegkort med riktningspilar',
    descEn: 'Oversized step cards connected by directional arrows'
  },
  {
    id: 'editorial',
    sv: 'Minimalistisk Affisch',
    en: 'Clean Editorial',
    descSv: 'Luftig typografi & fokus på formler',
    descEn: 'Generous whitespace & crisp formulas'
  },
  {
    id: 'classic',
    sv: 'Klassisk (Standard)',
    en: 'Classic (Standard)',
    descSv: 'Sida vid sida eller staplad',
    descEn: 'Side-by-side or stacked'
  }
];

export const THEME_SKINS = [
  {
    id: 'classic',
    sv: 'Standard',
    en: 'Standard'
  },
  {
    id: 'modern-clean',
    sv: 'Modern & Ren',
    en: 'Modern Clean'
  },
  {
    id: 'playful-pop',
    sv: 'Lekfull Pop',
    en: 'Playful Pop'
  },
  {
    id: 'neo-brutalist',
    sv: 'Neo-Brutalist',
    en: 'Neo-Brutalist'
  },
  {
    id: 'soft-pastel',
    sv: 'Mjuk Pastell',
    en: 'Soft Pastel'
  },
  {
    id: 'ink-saver',
    sv: 'Bläcksnål (S/V)',
    en: 'Ink-Saver (B&W)'
  }
];

export const COLOR_PALETTES = [
  {
    id: 'amber',
    sv: 'Bärnsten',
    en: 'Amber',
    swatch: 'bg-amber-500',
    badgeBg: 'bg-amber-500',
    badgeText: 'text-slate-950',
    softBg: 'bg-amber-50/40',
    softTint: 'bg-amber-50',
    border: 'border-amber-400',
    subtleBorder: 'border-amber-200',
    titleText: 'text-amber-950',
    accentText: 'text-amber-800',
    stepCircleBg: 'bg-amber-100',
    stepCircleText: 'text-amber-950',
    stepCircleBorder: 'border-amber-300',
    heroHeaderBg: 'bg-amber-500',
    heroHeaderText: 'text-slate-950',
    calloutBg: 'bg-amber-100/80',
    calloutBorder: 'border-amber-500',
    shadowColor: '#f59e0b',
    hexPrimary: '#f59e0b',
    hexDark: '#b45309',
    lightHex: '#fef3c7'
  },
  {
    id: 'emerald',
    sv: 'Smaragd',
    en: 'Emerald',
    swatch: 'bg-emerald-600',
    badgeBg: 'bg-emerald-600',
    badgeText: 'text-white',
    softBg: 'bg-emerald-50/40',
    softTint: 'bg-emerald-50',
    border: 'border-emerald-500',
    subtleBorder: 'border-emerald-200',
    titleText: 'text-emerald-950',
    accentText: 'text-emerald-800',
    stepCircleBg: 'bg-emerald-100',
    stepCircleText: 'text-emerald-950',
    stepCircleBorder: 'border-emerald-300',
    heroHeaderBg: 'bg-emerald-600',
    heroHeaderText: 'text-white',
    calloutBg: 'bg-emerald-50',
    calloutBorder: 'border-emerald-600',
    shadowColor: '#059669',
    hexPrimary: '#059669',
    hexDark: '#065f46',
    lightHex: '#d1fae5'
  },
  {
    id: 'indigo',
    sv: 'Kobolt',
    en: 'Cobalt',
    swatch: 'bg-indigo-600',
    badgeBg: 'bg-indigo-600',
    badgeText: 'text-white',
    softBg: 'bg-indigo-50/40',
    softTint: 'bg-indigo-50',
    border: 'border-indigo-500',
    subtleBorder: 'border-indigo-200',
    titleText: 'text-indigo-950',
    accentText: 'text-indigo-800',
    stepCircleBg: 'bg-indigo-100',
    stepCircleText: 'text-indigo-950',
    stepCircleBorder: 'border-indigo-300',
    heroHeaderBg: 'bg-indigo-600',
    heroHeaderText: 'text-white',
    calloutBg: 'bg-indigo-50',
    calloutBorder: 'border-indigo-600',
    shadowColor: '#4f46e5',
    hexPrimary: '#4f46e5',
    hexDark: '#3730a3',
    lightHex: '#e0e7ff'
  },
  {
    id: 'coral',
    sv: 'Korall',
    en: 'Coral',
    swatch: 'bg-rose-600',
    badgeBg: 'bg-rose-600',
    badgeText: 'text-white',
    softBg: 'bg-rose-50/40',
    softTint: 'bg-rose-50',
    border: 'border-rose-500',
    subtleBorder: 'border-rose-200',
    titleText: 'text-rose-950',
    accentText: 'text-rose-800',
    stepCircleBg: 'bg-rose-100',
    stepCircleText: 'text-rose-950',
    stepCircleBorder: 'border-rose-300',
    heroHeaderBg: 'bg-rose-600',
    heroHeaderText: 'text-white',
    calloutBg: 'bg-rose-50',
    calloutBorder: 'border-rose-600',
    shadowColor: '#e11d48',
    hexPrimary: '#e11d48',
    hexDark: '#9f1239',
    lightHex: '#ffe4e6'
  },
  {
    id: 'violet',
    sv: 'Plommon',
    en: 'Violet',
    swatch: 'bg-violet-600',
    badgeBg: 'bg-violet-600',
    badgeText: 'text-white',
    softBg: 'bg-violet-50/40',
    softTint: 'bg-violet-50',
    border: 'border-violet-500',
    subtleBorder: 'border-violet-200',
    titleText: 'text-violet-950',
    accentText: 'text-violet-800',
    stepCircleBg: 'bg-violet-100',
    stepCircleText: 'text-violet-950',
    stepCircleBorder: 'border-violet-300',
    heroHeaderBg: 'bg-violet-600',
    heroHeaderText: 'text-white',
    calloutBg: 'bg-violet-50',
    calloutBorder: 'border-violet-600',
    shadowColor: '#7c3aed',
    hexPrimary: '#7c3aed',
    hexDark: '#5b21b6',
    lightHex: '#ede9fe'
  },
  {
    id: 'teal',
    sv: 'Turkos',
    en: 'Teal',
    swatch: 'bg-teal-600',
    badgeBg: 'bg-teal-600',
    badgeText: 'text-white',
    softBg: 'bg-teal-50/40',
    softTint: 'bg-teal-50',
    border: 'border-teal-500',
    subtleBorder: 'border-teal-200',
    titleText: 'text-teal-950',
    accentText: 'text-teal-800',
    stepCircleBg: 'bg-teal-100',
    stepCircleText: 'text-teal-950',
    stepCircleBorder: 'border-teal-300',
    heroHeaderBg: 'bg-teal-600',
    heroHeaderText: 'text-white',
    calloutBg: 'bg-teal-50',
    calloutBorder: 'border-teal-600',
    shadowColor: '#0d9488',
    hexPrimary: '#0d9488',
    hexDark: '#115e59',
    lightHex: '#ccfbf1'
  },
  {
    id: 'slate',
    sv: 'Svart / Vit',
    en: 'Monochrome',
    swatch: 'bg-slate-900',
    badgeBg: 'bg-slate-900',
    badgeText: 'text-white',
    softBg: 'bg-slate-50/60',
    softTint: 'bg-slate-100',
    border: 'border-slate-900',
    subtleBorder: 'border-slate-300',
    titleText: 'text-slate-950',
    accentText: 'text-slate-800',
    stepCircleBg: 'bg-slate-900',
    stepCircleText: 'text-white',
    stepCircleBorder: 'border-slate-900',
    heroHeaderBg: 'bg-slate-900',
    heroHeaderText: 'text-white',
    calloutBg: 'bg-slate-100',
    calloutBorder: 'border-slate-900',
    shadowColor: '#0f172a',
    hexPrimary: '#0f172a',
    hexDark: '#020617',
    lightHex: '#f1f5f9'
  }
];

export function resolveCardTheme(themeSkin = 'classic', colorPalette = 'amber') {
  const effectivePaletteId = themeSkin === 'ink-saver' ? 'slate' : colorPalette;
  const palette =
    COLOR_PALETTES.find((p) => p.id === effectivePaletteId) || COLOR_PALETTES[0];

  if (themeSkin === 'ink-saver') {
    return {
      skin: 'ink-saver',
      palette,
      containerClass: 'rounded-xl border-2 border-slate-900 bg-white',
      containerStyle: {},
      headerDivider: 'border-b-2 border-slate-900',
      badgeClass: 'bg-slate-900 text-white rounded',
      titleText: 'text-slate-950',
      accentText: 'text-slate-800',
      subtleBorder: 'border-slate-400',
      stepCircleClass: 'bg-white text-slate-950 border-2 border-slate-900',
      heroHeaderClass: 'bg-white text-slate-950 border-b-2 border-slate-900',
      calloutClass: 'bg-white border-2 border-dashed border-slate-900 text-slate-950',
      stepCardClass: 'bg-white border-2 border-slate-800 rounded-xl'
    };
  }

  if (themeSkin === 'neo-brutalist') {
    return {
      skin: 'neo-brutalist',
      palette,
      containerClass: 'rounded-none border-[3px] border-slate-950 bg-white',
      containerStyle: {
        boxShadow: `6px 6px 0px #09090b, 11px 11px 0px ${palette.shadowColor}`
      },
      headerDivider: 'border-b-[3px] border-slate-950',
      badgeClass: `${palette.badgeBg} ${palette.badgeText} rounded-none border-2 border-slate-950 font-mono`,
      titleText: 'text-slate-950',
      accentText: palette.accentText,
      subtleBorder: 'border-slate-950',
      stepCircleClass: `${palette.badgeBg} ${palette.badgeText} rounded-none border-2 border-slate-950`,
      heroHeaderClass: `${palette.heroHeaderBg} ${palette.heroHeaderText} border-b-[3px] border-slate-950`,
      calloutClass: `${palette.calloutBg} rounded-none border-[3px] border-slate-950 shadow-[4px_4px_0px_#09090b] text-slate-950`,
      stepCardClass: 'bg-white rounded-none border-2 border-slate-950 shadow-[4px_4px_0px_#09090b]'
    };
  }

  if (themeSkin === 'playful-pop') {
    return {
      skin: 'playful-pop',
      palette,
      containerClass: `rounded-2xl border-[3px] border-slate-900 ${palette.softBg}`,
      containerStyle: { boxShadow: `5px 5px 0px ${palette.shadowColor}` },
      headerDivider: 'border-b-2 border-slate-900',
      badgeClass: `${palette.badgeBg} ${palette.badgeText} rounded-full border-2 border-slate-900`,
      titleText: 'text-slate-950',
      accentText: palette.accentText,
      subtleBorder: 'border-slate-900/25',
      stepCircleClass: `${palette.badgeBg} ${palette.badgeText} border-2 border-slate-900`,
      heroHeaderClass: `${palette.heroHeaderBg} ${palette.heroHeaderText} border-b-[3px] border-slate-900`,
      calloutClass: `${palette.calloutBg} border-[2.5px] border-slate-900 text-slate-950`,
      stepCardClass: 'bg-white border-2 border-slate-900 rounded-2xl shadow-[3px_3px_0px_#0f172a]'
    };
  }

  if (themeSkin === 'soft-pastel') {
    return {
      skin: 'soft-pastel',
      palette,
      containerClass: `rounded-3xl border ${palette.subtleBorder} ${palette.softTint}`,
      containerStyle: {
        backgroundImage: `linear-gradient(145deg, ${palette.lightHex}88 0%, #ffffff 100%)`
      },
      headerDivider: `border-b ${palette.subtleBorder}`,
      badgeClass: `${palette.badgeBg} ${palette.badgeText} rounded-full px-3`,
      titleText: palette.titleText,
      accentText: palette.accentText,
      subtleBorder: palette.subtleBorder,
      stepCircleClass: `${palette.badgeBg} ${palette.badgeText} border border-white shadow-xs`,
      heroHeaderClass: `${palette.heroHeaderBg} ${palette.heroHeaderText}`,
      calloutClass: `bg-white/90 border ${palette.subtleBorder} rounded-2xl shadow-xs text-slate-900`,
      stepCardClass: 'bg-white/95 border border-white rounded-2xl shadow-xs'
    };
  }

  if (themeSkin === 'modern-clean') {
    return {
      skin: 'modern-clean',
      palette,
      containerClass: `rounded-2xl border ${palette.subtleBorder} bg-white shadow-sm`,
      containerStyle: {},
      headerDivider: `border-b ${palette.subtleBorder}`,
      badgeClass: `${palette.badgeBg} ${palette.badgeText} rounded-lg`,
      titleText: palette.titleText,
      accentText: palette.accentText,
      subtleBorder: palette.subtleBorder,
      stepCircleClass: `${palette.stepCircleBg} ${palette.stepCircleText} border ${palette.stepCircleBorder}`,
      heroHeaderClass: `${palette.heroHeaderBg} ${palette.heroHeaderText}`,
      calloutClass: `${palette.calloutBg} border-l-4 ${palette.calloutBorder} text-slate-900`,
      stepCardClass: `bg-slate-50/70 border ${palette.subtleBorder} rounded-xl`
    };
  }

  // Default: 'classic'
  return {
    skin: 'classic',
    palette,
    containerClass: `rounded-xl border-2 ${palette.border} ${palette.softBg}`,
    containerStyle: {},
    headerDivider: `border-b ${palette.subtleBorder}`,
    badgeClass: `${palette.badgeBg} ${palette.badgeText} rounded`,
    titleText: palette.titleText,
    accentText: palette.accentText,
    subtleBorder: palette.subtleBorder,
    stepCircleClass: `${palette.stepCircleBg} ${palette.stepCircleText} border ${palette.stepCircleBorder}`,
    heroHeaderClass: `${palette.heroHeaderBg} ${palette.heroHeaderText}`,
    calloutClass: `${palette.calloutBg} border-2 ${palette.calloutBorder} text-slate-950`,
    stepCardClass: 'bg-white border border-slate-200/90 rounded-xl shadow-2xs'
  };
}