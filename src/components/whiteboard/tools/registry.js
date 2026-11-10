// src/components/whiteboard/tools/registry.js
import { VolumeCueTool } from './widgets/VolumeCueTool';
import { RealClockTool } from './widgets/RealClockTool';
import { TimerTool } from './widgets/TimerTool';
import { CalculatorTool } from './widgets/CalculatorTool';
import { DynamicCluesTool } from './widgets/DynamicCluesTool';
import { PracticeClockTool } from './widgets/PracticeClockTool';
import { RichTextTool } from './widgets/RichTextTool';

import { DiceTool } from './analysis/DiceTool';
import { CoordinatePlaneTool } from './analysis/CoordinatePlaneTool';
import { TChartTool } from './analysis/TChartTool';

import { FractionShapesTool } from './geometry/FractionShapesTool';
import { BasicShapesTool } from './geometry/BasicShapesTool';
import { RulerTool } from './geometry/RulerTool';
import { ProtractorTool } from './geometry/ProtractorTool';
import { Shapes3DTool } from './geometry/Shapes3DTool';
import { AlgebraTileTool } from './manipulatives/AlgebraTileTool';
import { IntegerCounterTool } from './manipulatives/IntegerCounterTool';
import AngleArcTool from './geometry/AngleArcTool';
import BaseTenBlocksTool from './manipulatives/BaseTenBlocksTool';

import { 
    Clock, Timer, Calculator, MessageCircle, FileText, 
    Dices, LineChart, Table2, Ruler, Compass, Box, CircleDot,
    Square, Circle, Triangle, Hexagon, PieChart, Layers
} from 'lucide-react';

export const CATEGORY_DEFINITIONS = {
    fractions: {
        id: 'fractions',
        label: { sv: 'Bråk & Sannolikhet', en: 'Fractions & Chance' },
        icon: PieChart,
        color: 'text-amber-600',
        activeBg: 'bg-amber-500'
    },
    shapes: {
        id: 'shapes',
        label: { sv: 'Figurer & 3D', en: 'Shapes & 3D' },
        icon: Box,
        color: 'text-emerald-600',
        activeBg: 'bg-emerald-600'
    },
    data: {
        id: 'data',
        label: { sv: 'Grafer & Verktyg', en: 'Data & Tools' },
        icon: LineChart,
        color: 'text-blue-600',
        activeBg: 'bg-blue-600'
    },
    arithmetic: {
        id: 'arithmetic',
        label: { sv: 'Tal & Räkning', en: 'Numbers & Arithmetic' },
        icon: Dices,
        color: 'text-rose-600',
        activeBg: 'bg-rose-600',
        modes: ['counters', 'base10', 'algebra']
    }
};

export const TOOL_REGISTRY = {
    // --- Widgets ---
    volume_cue: {
        id: 'volume_cue',
        category: 'widgets',
        name: { sv: 'Arbetsro', en: 'Work Mode' },
        icon: MessageCircle,
        tool: VolumeCueTool
    },
    realClock: {
        id: 'realClock',
        category: 'data',
        name: { sv: 'Realtidsklocka', en: 'Real Clock' },
        icon: Clock,
        tool: RealClockTool
    },
    clock: {
        id: 'clock',
        category: 'data',
        name: { sv: 'Övningsklocka', en: 'Practice Clock' },
        icon: Clock,
        tool: PracticeClockTool
    },
    timer: {
        id: 'timer',
        category: 'widgets',
        name: { sv: 'Timer', en: 'Timer' },
        icon: Timer,
        tool: TimerTool
    },
    calculator: {
        id: 'calculator',
        category: 'data',
        name: { sv: 'Miniräknare', en: 'Calculator' },
        icon: Calculator,
        tool: CalculatorTool
    },
    dynamicClues: {
        id: 'dynamicClues',
        category: 'widgets',
        name: { sv: 'Dynamisk ledtråd', en: 'Dynamic Clue' },
        icon: FileText,
        tool: DynamicCluesTool
    },
    richText: {
        id: 'richText',
        category: 'widgets',
        name: { sv: 'Textruta', en: 'Rich Text' },
        icon: FileText,
        tool: RichTextTool
    },
    math: {
        id: 'math',
        category: 'widgets',
        name: { sv: 'LaTeX Ruta', en: 'Math Box' },
        icon: FileText,
        tool: RichTextTool
    },

    // --- Analysis & Data ---
    dice: {
        id: 'dice',
        category: 'data',
        name: { sv: 'Tärningar', en: 'Dice' },
        icon: Dices,
        tool: DiceTool
    },
    coord: {
        id: 'coord',
        category: 'data',
        name: { sv: 'Koordinatsystem', en: 'Coordinate Plane' },
        icon: LineChart,
        tool: CoordinatePlaneTool
    },
    tchart: {
        id: 'tchart',
        category: 'data',
        name: { sv: 'Värdetabell', en: 'T-Chart' },
        icon: Table2,
        tool: TChartTool
    },

    // --- Geometry & Measurements ---
    ruler: {
        id: 'ruler',
        category: 'data',
        name: { sv: 'Tallinje / Linjal', en: 'Number Line / Ruler' },
        icon: Ruler,
        tool: RulerTool
    },
    protractor: {
        id: 'protractor',
        category: 'data',
        name: { sv: 'Gradskiva', en: 'Protractor' },
        icon: Compass,
        tool: ProtractorTool
    },
    angle_arc: {
        id: 'angle_arc',
        category: 'shapes',
        name: { sv: 'Vinkel', en: 'Angle' },
        icon: Compass,
        tool: AngleArcTool
    },
    shapes_3d: {
        id: 'shapes_3d',
        category: 'shapes',
        name: { sv: '3D Kroppar', en: '3D Shapes' },
        icon: Box,
        tool: Shapes3DTool
    },

    // --- 2D Basic Shapes ---
    rect: {
        id: 'rect',
        category: 'shapes',
        name: { sv: 'Rektangel', en: 'Rectangle' },
        icon: Square,
        tool: BasicShapesTool
    },
    circle: {
        id: 'circle',
        category: 'shapes',
        name: { sv: 'Cirkel', en: 'Circle' },
        icon: Circle,
        tool: BasicShapesTool
    },
    triangle: {
        id: 'triangle',
        category: 'shapes',
        name: { sv: 'Triangel', en: 'Triangle' },
        icon: Triangle,
        tool: BasicShapesTool
    },
    polygon: {
        id: 'polygon',
        category: 'shapes',
        name: { sv: 'Polygon (n)', en: 'Polygon (n)' },
        icon: Hexagon,
        tool: BasicShapesTool
    },

    // --- Fraction Shapes & Spinners ---
    frac_rect: {
        id: 'frac_rect',
        category: 'fractions',
        name: { sv: 'Bråkstav (Rektangel)', en: 'Fraction Bar' },
        icon: Layers,
        tool: FractionShapesTool
    },
    frac_circle: {
        id: 'frac_circle',
        category: 'fractions',
        name: { sv: 'Bråkcirkel', en: 'Fraction Circle' },
        icon: PieChart,
        tool: FractionShapesTool
    },
    spinner: {
        id: 'spinner',
        category: 'fractions',
        name: { sv: 'Lyckohjul (Spinner)', en: 'Chance Spinner' },
        icon: PieChart,
        tool: FractionShapesTool
    },

    // --- Manipulatives ---
    algebra_tile: {
        id: 'algebra_tile',
        category: 'arithmetic',
        name: { sv: 'Algebrabrickor', en: 'Algebra Tiles' },
        icon: Layers,
        tool: AlgebraTileTool
    },
    integer_counter: {
        id: 'integer_counter',
        category: 'arithmetic',
        name: { sv: 'Räknemarkörer (+/−)', en: 'Integer Counters (+/−)' },
        icon: CircleDot,
        tool: IntegerCounterTool
    },
    base_ten_block: {
        id: 'base_ten_block',
        category: 'arithmetic',
        name: { sv: 'Bas-10 block', en: 'Base-10 Blocks' },
        icon: Box,
        tool: BaseTenBlocksTool
    }
};

/**
 * Returns the underlying tool definition module (with createDefault, render, renderContextMenu).
 * Backwards compatible with existing code expecting the raw tool module.
 */
export const getToolDefinition = (type) => {
    const entry = TOOL_REGISTRY[type];
    if (!entry) return null;
    return entry.tool || entry;
};

/**
 * Returns the metadata object for a registered tool.
 */
export const getToolMetadata = (type) => {
    return TOOL_REGISTRY[type] || null;
};

/**
 * Returns all tools belonging to a specific drawer category.
 */
export const getToolsByCategory = (category) => {
    return Object.values(TOOL_REGISTRY).filter(entry => entry.category === category);
};
