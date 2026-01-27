import { UI_STRINGS } from '../utils/i18n';

// Interfaces for strict typing
interface Point { x: number; y: number; }
interface ShapeData { points: Point[]; color: string; }
interface LabelData { x: number; y: number; text: string; shapeIndex: number; }

interface VisualData {
  type: 'similarity';
  shapes: ShapeData[];
  labels: LabelData[];
  showAxes: boolean;
}

interface Question {
  text: string; // The raw translation key to be processed by frontend
  correctAnswer: number | string;
  visual: VisualData;
  meta: { topic: string; difficulty: number };
}

export class SimilarityGenerator {
  /**
   * Generates a similarity problem.
   */
  public static getQuestion(difficulty: number): Question {
    // 1. Determine Scale Factor (k)
    let k: number;
    
    if (difficulty === 1) {
      // Level 1: Simple Integer (x2, x3, x4)
      k = Math.floor(Math.random() * 3) + 2; 
    } else {
      // Level 2 & 3: Decimals (1.5, 2.5, 3.5)
      // We ensure base dimensions are even so multiplying by 1.5 results in integer/clean decimal
      k = (Math.floor(Math.random() * 4) * 0.5) + 1.5; 
    }

    // 2. Base Triangle Dimensions
    // Ensure base dimensions are even to play nice with 0.5 scale factors
    const baseW = (Math.floor(Math.random() * 3) + 2) * 2; // 4, 6, 8, 10
    const baseH = (Math.floor(Math.random() * 3) + 2) * 2; // 4, 6, 8, 10

    // 3. Scaled Triangle Dimensions
    const scaledW = Number((baseW * k).toFixed(2));
    const scaledH = Number((baseH * k).toFixed(2));

    // 4. Determine Problem Mode
    const modes = ['find_height_big', 'find_width_big'];
    
    if (difficulty > 1) {
       modes.push('find_height_small', 'find_width_small');
    }
    if (difficulty === 3) {
        modes.push('find_k'); // Level 3 special: Find the scale factor
    }

    const mode = modes[Math.floor(Math.random() * modes.length)];

    let answer: number;
    let questionKey = "geometry.missing_side"; 
    
    const labels: LabelData[] = [];

    // --- Shape Definitions ---
    // Shape 1 (Small)
    const shape1Points: Point[] = [
      { x: 0, y: 0 },
      { x: baseW, y: 0 },
      { x: 0, y: baseH }
    ];

    // Shape 2 (Large)
    const shape2Points: Point[] = [
      { x: 0, y: 0 },
      { x: scaledW, y: 0 },
      { x: 0, y: scaledH }
    ];

    // --- Labeling Logic ---
    // Default: Label small shape fully
    labels.push({ x: baseW / 2, y: -0.5, text: `${baseW}`, shapeIndex: 0 }); // Base
    labels.push({ x: -0.5, y: baseH / 2, text: `${baseH}`, shapeIndex: 0 }); // Height

    if (mode === 'find_k') {
        questionKey = "geometry.scale_factor";
        answer = k;
        // Label everything
        labels.push({ x: scaledW / 2, y: -0.5, text: `${scaledW}`, shapeIndex: 1 });
        labels.push({ x: -0.5, y: scaledH / 2, text: `${scaledH}`, shapeIndex: 1 });
    }
    else if (mode === 'find_height_big') {
      answer = scaledH;
      labels.push({ x: scaledW / 2, y: -0.5, text: `${scaledW}`, shapeIndex: 1 });
      labels.push({ x: -0.5, y: scaledH / 2, text: "?", shapeIndex: 1 });
    } 
    else if (mode === 'find_width_big') {
      answer = scaledW;
      labels.push({ x: scaledW / 2, y: -0.5, text: "?", shapeIndex: 1 });
      labels.push({ x: -0.5, y: scaledH / 2, text: `${scaledH}`, shapeIndex: 1 });
    }
    else if (mode === 'find_height_small') {
      answer = baseH;
      labels[1].text = "?"; // Remove small height label
      labels.push({ x: scaledW / 2, y: -0.5, text: `${scaledW}`, shapeIndex: 1 });
      labels.push({ x: -0.5, y: scaledH / 2, text: `${scaledH}`, shapeIndex: 1 });
    }
    else if (mode === 'find_width_small') {
        answer = baseW;
        labels[0].text = "?"; // Remove small width label
        labels.push({ x: scaledW / 2, y: -0.5, text: `${scaledW}`, shapeIndex: 1 });
        labels.push({ x: -0.5, y: scaledH / 2, text: `${scaledH}`, shapeIndex: 1 });
    } else {
        answer = 0;
    }

    return {
      text: questionKey,
      correctAnswer: answer,
      visual: {
        type: 'similarity',
        shapes: [
          { points: shape1Points, color: '#3B82F6' },
          { points: shape2Points, color: '#F59E0B' }
        ],
        labels: labels,
        showAxes: false
      },
      meta: { topic: 'similarity', difficulty }
    };
  }
}