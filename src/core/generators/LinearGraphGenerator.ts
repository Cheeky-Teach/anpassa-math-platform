import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { t, Language, TERMS } from "../utils/i18n";

export class LinearGraphGenerator {
    public static generate(level: number, seed: string, lang: Language = 'sv'): GeneratedQuestion {
        const rng = new Random(seed);
        const color = "\\mathbf{\\textcolor{#D35400}}";
        
        let mode = level;
        if (level >= 5) mode = rng.intBetween(3, 4);

        let k = 1, m = 0, steps: Clue[] = [];
        let answer: string | number = 0; // Standardized
        let answerType: any = 'numeric';
        let description = { sv: "", en: "" };

        if (mode === 1) {
            // Find m
            k = rng.pick([1, 2, -1, -2]); m = rng.intBetween(-3, 3); 
            answer = m;
            description = { sv: "Hitta m-värdet (skärning med y-axeln):", en: "Find the Y-Intercept (m):" };
            steps = [{ text: "Look at x = 0", latex: "(0, y)" }, { text: t(lang, TERMS.graph.step_intercept(m)), latex: `m = ${color}{${m}}}` }];
        } else if (mode === 2 || mode === 3) {
            // Find k
            k = mode === 2 ? rng.intBetween(1, 4) : rng.pick([-1, -2, -3]);
            m = rng.intBetween(-2, 4); 
            answer = k;
            description = { sv: "Beräkna lutningen (k):", en: "Calculate the slope (k):" };
            steps = [{ text: "Slope Formula", latex: "k = \\frac{\\Delta y}{\\Delta x}" }, { text: "Result", latex: `k = ${color}{${k}}}` }];
        } else {
            // Find Equation y = kx + m
            k = rng.pick([1, 2, -1, -2]); 
            m = rng.intBetween(-2, 2); 
            
            // Construct the standardized string answer: "y=kx+m" or "y=kx-m"
            const mPart = m >= 0 ? `+${m}` : `${m}`; // e.g. "+2" or "-2"
            const eqStr = `y=${k}x${mPart}`; // e.g. "y=2x+2" or "y=-1x-2"
            
            answer = eqStr;
            answerType = 'function_model'; 

            description = { sv: "Skriv funktionen på formen y = kx + m", en: "Write the function as y = kx + m" };
            steps = [
                { text: "Find m", latex: `m = ${m}` }, 
                { text: "Find k", latex: `k = ${k}` }, 
                { text: "Equation", latex: `y = ${color}{${k}}}x ${m >= 0 ? '+' : ''}${color}{${m}}}` }
            ];
        }

        // Generate lines for the graph visual
        const lines = [{ slope: k, intercept: m, color: '#2563eb' }];

        return {
            questionId: `graph-l${level}-${seed}`,
            renderData: {
                text_key: "graph",
                description: description,
                latex: "",
                answerType: answerType,
                graph: { lines, range: 10, gridStep: 1, labelStep: 2 },
                variables: {}
            },
            serverData: {
                answer: answer, // Now a string for level 4
                solutionSteps: steps
            }
        };
    }
}