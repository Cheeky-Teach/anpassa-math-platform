import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { t, Language, TERMS } from "../utils/i18n";

export class LinearGraphGenerator {
    public static generate(level: number, seed: string, lang: Language = 'sv'): GeneratedQuestion {
        const rng = new Random(seed);
        const formatColor = (val: string | number) => `\\textcolor{#D35400}{\\mathbf{${val}}}`;
        
        let mode = level;
        if (level >= 5) mode = rng.intBetween(1, 4);

        let k = 1, m = 0, steps: Clue[] = [];
        let answer: string | number = 0; 
        let answerType: any = 'numeric';
        let description = { sv: "", en: "" };

        const getSlope = (min: number, max: number) => rng.intBetween(min, max);

        // --- LEVEL 1: Find m (intercept) ---
        if (mode === 1) {
            k = getSlope(-3, 3); 
            m = rng.intBetween(-5, 5); 
            
            answer = m;
            description = TERMS.graph.q_intercept;
            
            steps = [
                { text: t(lang, TERMS.graph.look_x0), latex: "(0, y)" }, 
                { text: t(lang, TERMS.graph.step_intercept(m)), latex: `m = ${formatColor(m)}` }
            ];
        } 
        
        // --- LEVEL 2: Find k (positive slope) ---
        else if (mode === 2) {
            k = rng.intBetween(0, 3); 
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
            k = rng.intBetween(-3, 0);
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
            
            let eqStr = "";
            if (k === 0) {
                eqStr = `y=${m}`;
            } else {
                const mPart = m >= 0 ? `+${m}` : `${m}`; 
                eqStr = `y=${k}x${mPart}`; 
            }
            
            answer = eqStr;
            answerType = 'function_model'; 

            description = TERMS.graph.q_func;
            
            const eqDisplay = k === 0 
                ? `y = ${formatColor(m)}` 
                : `y = ${formatColor(k)}x ${m >= 0 ? '+' : ''}${formatColor(m)}`;

            steps = [
                { text: t(lang, TERMS.graph.find_m), latex: `m = ${m}` }, 
                { text: t(lang, TERMS.graph.find_k), latex: `k = ${k}` }, 
                { text: t(lang, TERMS.graph.q_func), latex: eqDisplay }
            ];
        }

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
                    range: 10, 
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