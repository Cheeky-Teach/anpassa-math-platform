import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { t, Language, TERMS } from "../utils/i18n";

export class LinearGraphGenerator {
    public static generate(level: number, seed: string, lang: Language = 'sv'): GeneratedQuestion {
        const rng = new Random(seed);
        
        // FIX: Standardize LaTeX color formatting function
        const formatColor = (val: string | number) => `\\textcolor{#D35400}{\\mathbf{${val}}}`;
        
        let mode = level;
        // Level 5 is mixed practice of previous modes
        if (level >= 5) mode = rng.intBetween(1, 4);

        let k = 1, m = 0, steps: Clue[] = [];
        let answer: string | number = 0; 
        let answerType: any = 'numeric';
        let description = { sv: "", en: "" };

        // Helper to get slope including 0
        const getSlope = (min: number, max: number) => {
            return rng.intBetween(min, max);
        };

        // --- LEVEL 1: Find m (intercept) ---
        if (mode === 1) {
            // Slope: -3 to 3 (including 0), Intercept: -5 to 5
            k = getSlope(-3, 3); 
            m = rng.intBetween(-5, 5); 
            
            answer = m;
            description = TERMS.graph.q_intercept;
            
            steps = [
                { text: "Look at x = 0", latex: "(0, y)" }, 
                { text: t(lang, TERMS.graph.step_intercept(m)), latex: `m = ${formatColor(m)}` }
            ];
        } 
        
        // --- LEVEL 2: Find k (positive slope) ---
        else if (mode === 2) {
            k = rng.intBetween(0, 3); // 0, 1, 2, or 3
            m = rng.intBetween(-5, 5); 
            
            answer = k;
            description = TERMS.graph.q_slope;
            
            steps = [
                { text: t(lang, TERMS.graph.step_delta), latex: "k = \\frac{\\Delta y}{\\Delta x}" },
                { text: t(lang, TERMS.graph.step_slope_calc), latex: `k = ${formatColor(k)}` }
            ];
        }

        // --- LEVEL 3: Find k (negative slope) ---
        else if (mode === 3) {
            k = rng.intBetween(-3, 0); // -3, -2, -1, or 0
            m = rng.intBetween(-5, 5); 
            
            answer = k;
            description = TERMS.graph.q_slope;
            
            steps = [
                { text: t(lang, TERMS.graph.step_delta), latex: "k = \\frac{\\Delta y}{\\Delta x}" },
                { text: t(lang, TERMS.graph.step_slope_calc), latex: `k = ${formatColor(k)}` }
            ];
        }

        // --- LEVEL 4: Find Equation (y = kx + m) ---
        else {
            k = getSlope(-3, 3); 
            m = rng.intBetween(-5, 5); 
            
            // Construct the standardized string answer: "y=kx+m" or "y=kx-m"
            // Special handling for k=0 -> "y=m"
            let eqStr = "";
            if (k === 0) {
                eqStr = `y=${m}`;
            } else {
                const mPart = m >= 0 ? `+${m}` : `${m}`; // e.g. "+2" or "-2"
                eqStr = `y=${k}x${mPart}`; // e.g. "y=2x+2" or "y=-1x-2"
            }
            
            answer = eqStr;
            answerType = 'function_model'; 

            description = TERMS.graph.q_func;
            
            const eqDisplay = k === 0 
                ? `y = ${formatColor(m)}` 
                : `y = ${formatColor(k)}x ${m >= 0 ? '+' : ''}${formatColor(m)}`;

            steps = [
                { text: "Find m", latex: `m = ${m}` }, 
                { text: "Find k", latex: `k = ${k}` }, 
                { text: "Equation", latex: eqDisplay }
            ];
        }

        // Generate lines for the graph visual
        const lines = [{ slope: k, intercept: m, color: '#2563eb' }];

        return {
            questionId: `graph-l${level}-${seed}`,
            renderData: {
                text_key: "graph_gen",
                description: description,
                latex: "",
                answerType: answerType,
                graph: {
                    lines: lines,
                    range: 10, // Visual range (-10 to 10) fits the new m/k values well
                    gridStep: 1
                }
            },
            serverData: {
                answer: answer,
                solutionSteps: steps
            }
        };
    }
}