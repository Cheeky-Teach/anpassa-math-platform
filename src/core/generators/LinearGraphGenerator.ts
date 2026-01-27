import { UI_STRINGS } from '../utils/i18n';

interface Point { x: number; y: number; label?: string; }
interface Line { x1: number; y1: number; x2: number; y2: number; color: string; width: number; }

interface VisualData {
    type: 'graph';
    lines: Line[];
    points: Point[];
    showGrid: boolean;
    showAxes: boolean;
}

interface Question {
    text: string;
    correctAnswer: number | string;
    visual: VisualData;
    meta: { topic: string; difficulty: number };
}

export class LinearGraphGenerator {
    /**
     * Generates a linear graph problem.
     * Level 1: Find m (y-intercept).
     * Level 2: Find k (slope).
     * Level 3: Find the full equation y = kx + m.
     */
    public static getQuestion(difficulty: number): Question {
        let k: number, m: number;
        let questionKey = "";
        let answer: number | string = "";

        // --- Difficulty Logic ---
        if (difficulty === 1) {
            // Level 1: Find m (intercept)
            // We use simple slopes (+/- 1 or 2) to keep the graph readable
            // m ranges from -4 to 4 to stay well within the standard -10 to 10 grid
            k = (Math.random() < 0.5 ? -1 : 1) * (Math.floor(Math.random() * 2) + 1);
            m = Math.floor(Math.random() * 9) - 4; // -4 to 4
            
            questionKey = "graph.q_intercept";
            answer = m;
        } 
        else if (difficulty === 2) {
            // Level 2: Find k (slope)
            // m is strictly integer, k is integer
            k = (Math.random() < 0.5 ? -1 : 1) * (Math.floor(Math.random() * 3) + 1);
            m = Math.floor(Math.random() * 7) - 3;
            
            questionKey = "graph.q_slope";
            answer = k;
        } 
        else {
            // Level 3: Find Equation y = kx + m
            // Slopes can be steeper here
            k = (Math.random() < 0.5 ? -1 : 1) * (Math.floor(Math.random() * 3) + 1);
            m = Math.floor(Math.random() * 7) - 3;

            questionKey = "graph.q_func";
            
            // Format answer string: y = kx + m
            // We handle the edge cases for x (1x) and sign formatting
            let kStr = `${k}`;
            if (k === 1) kStr = "";
            if (k === -1) kStr = "-";
            
            const sign = m >= 0 ? '+' : '';
            
            answer = `y=${kStr}x${sign}${m}`;
            
            // Cleanup: if m is 0, we don't usually write +0
            if (m === 0) answer = `y=${kStr}x`;
        }

        // --- Visuals ---
        // Generate line points that extend across the typical view (-10 to 10)
        // Calculating y at x=-10 and x=10 ensures the line spans the canvas
        const x1 = -10;
        const y1 = k * x1 + m;
        const x2 = 10;
        const y2 = k * x2 + m;

        const visual: VisualData = {
            type: 'graph',
            lines: [
                { x1, y1, x2, y2, color: '#4F46E5', width: 3 } // Indigo-600
            ],
            points: [],
            showGrid: true,
            showAxes: true
        };

        // For Level 1, some pedagogical designs place a point at the intercept to focus attention.
        // We add it as a visual aid without a label to avoid giving the answer explicitly.
        if (difficulty === 1) {
            visual.points.push({ x: 0, y: m, label: '' });
        }

        return {
            text: questionKey,
            correctAnswer: answer,
            visual: visual,
            meta: { topic: 'linear_graph', difficulty }
        };
    }
}