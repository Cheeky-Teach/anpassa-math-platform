import { Presentation, BookOpen, PieChart } from 'lucide-react';

export const SLIDE_LAYOUT_TYPES = {
    CANVAS: 'canvas',
    INSTRUCTION_TEMPLATE: 'instruction_template',
    INTERACTIVE_SANDBOX: 'interactive_sandbox'
};

export const SLIDE_LAYOUT_CONFIG = [
    {
        id: SLIDE_LAYOUT_TYPES.CANVAS,
        icon: Presentation,
        label: {
            sv: 'Fri tavelvy',
            en: 'Freeform Canvas'
        },
        description: {
            sv: 'Klassisk rityta med valfria frågor och frihandsteckning.',
            en: 'Classic canvas board for live drawing and custom question layout.'
        }
    },
    {
        id: SLIDE_LAYOUT_TYPES.INSTRUCTION_TEMPLATE,
        icon: BookOpen,
        label: {
            sv: 'Instruktion & Genomgång',
            en: 'Direct Instruction'
        },
        description: {
            sv: 'Tvådelad genomgång med stegvisa förklaringar och dynamisk matematik.',
            en: 'Two-column breakdown with sequential steps and auto-rendered math.'
        }
    },
    {
        id: SLIDE_LAYOUT_TYPES.INTERACTIVE_SANDBOX,
        icon: PieChart,
        label: {
            sv: 'Laboration & Sandbox',
            en: 'Manipulative Sandbox'
        },
        description: {
            sv: 'Interaktiv laboration för bråk, algebra eller koordinater.',
            en: 'Interactive digital manipulative sandbox.'
        }
    }
];

export const getSlideLayoutDefinition = (layoutId) => {
    return SLIDE_LAYOUT_CONFIG.find(l => l.id === layoutId) || SLIDE_LAYOUT_CONFIG[0];
};