import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { t, Language, TERMS } from "../utils/i18n";

export class LinearGraphGenerator {
    public static generate(level: number, seed: string, lang: Language = 'sv'): GeneratedQuestion {
        const rng = new Random(seed);
        const color = "\\mathbf{\\color{#D35400}";
        
        let mode = level;
        if (level >= 5) mode = rng.intBetween(3, 4);

        let k = 1, m = 0;
        let questionKey = "";
        let latexInstruction = "";
        let steps: Clue[] = [];
        let answer: any = 0;
        let answerType: any = 'numeric';

        // --- LEVEL 1: Find Intercept (m) ---
        if (mode === 1) {
            k = rng.pick([1, 2, -1, -2]);
            m = rng.intBetween(-3, 3);
            answer = m;
            questionKey = "q_intercept";
            latexInstruction = t(lang, TERMS.graph.q_intercept);
            answerType = 'numeric';
            steps = [
                { text: "Look at x = 0", latex: "(0, y)" },
                { text: t(lang, TERMS.graph.step_intercept(m)), latex: `m = ${color}{${m}}` }
            ];
        }

        // --- LEVEL 2: Find Slope (k) - Positive/Simple ---
        else if (mode === 2) {
            k = rng.intBetween(1, 4);
            m = rng.intBetween(-3, 1);
            answer = k;
            questionKey = "q_slope";
            latexInstruction = t(lang, TERMS.graph.q_slope);
            answerType = 'numeric';
            steps = [
                { text: "Slope Formula", latex: "k = \\frac{\\Delta y}{\\Delta x}" },
                { text: "Step 1 Right", latex: `(0, ${m}) \\to (1, ${m+k})` },
                { text: "Change in height", latex: `\\Delta y = ${k}` }
            ];
        }

        // --- LEVEL 3: Find Slope (k) - Negative/Steep ---
        else if (mode === 3) {
            k = rng.pick([-1, -2, -3, 2, 3]);
            m = rng.intBetween(-2, 4);
            answer = k;
            questionKey = "q_slope";
            latexInstruction = t(lang, TERMS.graph.q_slope);
            answerType = 'numeric';
            steps = [
                { text: "Slope Formula", latex: "k = \\frac{\\Delta y}{\\Delta x}" },
                { text: "Identify direction", latex: k < 0 ? "\\text{Downwards (Negative)}" : "\\text{Upwards (Positive)}" },
                { text: "Result", latex: `k = ${color}{${k}}` }
            ];
        }

        // --- LEVEL 4: Find Equation (y = kx + m) ---
        else {
            k = rng.pick([1, 2, -1, -2]);
            m = rng.intBetween(-2, 2);
            answer = { k, m }; // Object for validation
            questionKey = "q_func";
            latexInstruction = t(lang, TERMS.graph.q_func);
            answerType = 'function_model';
            steps = [
                { text: "Find m", latex: `m = ${m}` },
                { text: "Find k", latex: `k = ${k}` },
                { text: t(lang, TERMS.graph.step_func(k, m)), latex: `y = ${color}{${k}}x ${m >= 0 ? '+' : ''}${color}{${m}}` }
            ];
        }

        return {
            questionId: `graph-l${level}-${seed}`,
            renderData: {
                text_key: questionKey,
                latex: latexInstruction,
                answerType: answerType,
                graph: { 
                    type: 'linear', 
                    range: 10, 
                    gridStep: 1, 
                    labelStep: 2, 
                    lines: [{ slope: k, intercept: m, color: '#dc2626' }] 
                }
            },
            serverData: { answer: answer, solutionSteps: steps }
        };
    }
}