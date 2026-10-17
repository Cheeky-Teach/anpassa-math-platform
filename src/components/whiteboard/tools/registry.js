// src/components/whiteboard/tools/registry.js
import { VolumeCueTool } from './widgets/VolumeCueTool';
import { RealClockTool } from './widgets/RealClockTool';
import { TimerTool } from './widgets/TimerTool';
import { CalculatorTool } from './widgets/CalculatorTool';
import { DynamicCluesTool } from './widgets/DynamicCluesTool';
import { PracticeClockTool } from './widgets/PracticeClockTool';

import { DiceTool } from './analysis/DiceTool';
import { CoordinatePlaneTool } from './analysis/CoordinatePlaneTool';
import { TChartTool } from './analysis/TChartTool';

import { FractionShapesTool } from './geometry/FractionShapesTool';
import { BasicShapesTool } from './geometry/BasicShapesTool';
import { RulerTool } from './geometry/RulerTool';
import { ProtractorTool } from './geometry/ProtractorTool';
import { Shapes3DTool } from './geometry/Shapes3DTool';
import { AlgebraTileTool } from './manipulatives/AlgebraTileTool';

export const TOOL_REGISTRY = {
    // Widgets
    volume_cue: VolumeCueTool,
    realClock: RealClockTool,
    timer: TimerTool,
    calculator: CalculatorTool,
    dynamicClues: DynamicCluesTool,
    clock: PracticeClockTool,

    // Analysis
    dice: DiceTool,
    coord: CoordinatePlaneTool,
    tchart: TChartTool,

    // Geometry & Fractions
    ruler: RulerTool,
    protractor: ProtractorTool,
    shapes_3d: Shapes3DTool,
    
    // Basic Shapes
    rect: BasicShapesTool,
    circle: BasicShapesTool,
    triangle: BasicShapesTool,

    // Fraction Shapes & Spinners
    frac_rect: FractionShapesTool,
    frac_circle: FractionShapesTool,
    spinner: FractionShapesTool,

    // Manipulative Sandboxes
    algebra_tile: AlgebraTileTool
};

export const getToolDefinition = (type) => {
    return TOOL_REGISTRY[type] || null;
};