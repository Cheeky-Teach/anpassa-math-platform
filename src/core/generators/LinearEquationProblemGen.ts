import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { TERMS, t, Language } from "../utils/i18n";
import { TextEngine, ContextKey, CONTEXTS } from "../utils/textEngine";

// --- INTERFACES ---

interface ProblemScenario {
    id: string;
    type: 'A' | 'B' | 'C' | 'D';
    logic: (rng: Random) => MathData;
    templates: { sv: string, en: string }[];
    context: ContextKey;
}

interface MathData {
    vars: Record<string, number>;
    solution: number;
    equation: string;
    stepsSolve: (lang: Language, formatColor: (v:any)=>string) => Clue[];
    stepsWrite: (lang: Language, formatColor: (v:any)=>string) => Clue[];
}

export class LinearEquationProblemGen {
    
    // --- SCENARIO DEFINITIONS ---

    private static getScenarios(): ProblemScenario[] {
        return [
            // --- TYPE A: ax + b = c (Taxi / Shopping) ---
            {
                id: 'shopping_bag',
                type: 'A',
                context: 'shopping',
                templates: [ TERMS.problem_solving.a_buy ],
                logic: (rng) => {
                    const x = rng.intBetween(3, 15); // Amount
                    const a = rng.intBetween(5, 25); // Price
                    const b = rng.pick([2, 5, 10]); // Bag cost
                    const c = a * x + b;
                    return {
                        vars: { x, a, b, c },
                        solution: x,
                        equation: `${a}x + ${b} = ${c}`,
                        stepsWrite: (lang, fc) => [
                            { text: t(lang, TERMS.problem_solving.clue_var), latex: "x" },
                            { text: t(lang, TERMS.problem_solving.clue_total), latex: `${a} \\cdot x + ${b} = ${c}` },
                            { text: t(lang, TERMS.common.result), latex: fc(`${a}x + ${b} = ${c}`) }
                        ],
                        stepsSolve: (lang, fc) => [
                            { text: t(lang, TERMS.common.equation), latex: `${a}x + ${b} = ${c}` },
                            { text: t(lang, TERMS.algebra.subtract(b)), latex: `${a}x = ${c - b}` },
                            { text: t(lang, TERMS.algebra.divide(a)), latex: `x = ${fc(x)}` }
                        ]
                    };
                }
            },
            {
                id: 'taxi',
                type: 'A',
                context: 'shopping', // Using shopping items as generic fallback if needed, but text hardcoded in i18n
                templates: [ TERMS.problem_solving.a_taxi ],
                logic: (rng) => {
                    const x = rng.intBetween(5, 30); // km
                    const a = rng.intBetween(10, 50); // cost/km
                    const b = rng.pick([45, 50, 75, 100]); // start fee
                    const c = a * x + b;
                    return {
                        vars: { x, a, b, c },
                        solution: x,
                        equation: `${a}x + ${b} = ${c}`,
                        stepsWrite: (lang, fc) => [
                            { text: "Variable: km", latex: "x" },
                            { text: "Cost", latex: `${a}x + ${b} = ${c}` },
                            { text: t(lang, TERMS.common.result), latex: fc(`${a}x + ${b} = ${c}`) }
                        ],
                        stepsSolve: (lang, fc) => [
                            { text: t(lang, TERMS.common.equation), latex: `${a}x + ${b} = ${c}` },
                            { text: t(lang, TERMS.algebra.subtract(b)), latex: `${a}x = ${c - b}` },
                            { text: t(lang, TERMS.algebra.divide(a)), latex: `x = ${fc(x)}` }
                        ]
                    };
                }
            },

            // --- TYPE B: ax - b = c (Discount / Points Loss) ---
            {
                id: 'shopping_discount',
                type: 'B',
                context: 'shopping',
                templates: [ TERMS.problem_solving.b_discount ],
                logic: (rng) => {
                    const x = rng.intBetween(2, 10); // Items
                    const a = rng.intBetween(50, 200); // Price
                    const b = rng.pick([20, 50, 100]); // Discount
                    const c = a * x - b;
                    return {
                        vars: { x, a, b, c },
                        solution: x,
                        equation: `${a}x - ${b} = ${c}`,
                        stepsWrite: (lang, fc) => [
                            { text: "Variable", latex: "x" },
                            { text: "Total - Discount", latex: `${a}x - ${b} = ${c}` },
                            { text: t(lang, TERMS.common.result), latex: fc(`${a}x - ${b} = ${c}`) }
                        ],
                        stepsSolve: (lang, fc) => [
                            { text: t(lang, TERMS.common.equation), latex: `${a}x - ${b} = ${c}` },
                            { text: t(lang, TERMS.algebra.add(b)), latex: `${a}x = ${c + b}` },
                            { text: t(lang, TERMS.algebra.divide(a)), latex: `x = ${fc(x)}` }
                        ]
                    };
                }
            },

            // --- TYPE C: x + (x + a) = c (Comparative Sum) ---
            {
                id: 'compare_sum',
                type: 'C',
                context: 'hobbies',
                templates: [ TERMS.problem_solving.c_compare ],
                logic: (rng) => {
                    const x = rng.intBetween(5, 20); // Person 1
                    const a = rng.intBetween(2, 10); // Diff
                    const total = x + (x + a);
                    return {
                        vars: { x, a, c: total },
                        solution: x,
                        equation: `2x + ${a} = ${total}`,
                        stepsWrite: (lang, fc) => [
                            { text: "Person 1", latex: "x" },
                            { text: "Person 2", latex: "x + " + a },
                            { text: "Sum", latex: `x + (x + ${a}) = ${total}` },
                            { text: t(lang, TERMS.common.simplify), latex: fc(`2x + ${a} = ${total}`) }
                        ],
                        stepsSolve: (lang, fc) => [
                            { text: "Setup", latex: `x + (x + ${a}) = ${total}` },
                            { text: t(lang, TERMS.common.simplify), latex: `2x + ${a} = ${total}` },
                            { text: t(lang, TERMS.algebra.subtract(a)), latex: `2x = ${total - a}` },
                            { text: t(lang, TERMS.algebra.divide(2)), latex: `x = ${fc(x)}` }
                        ]
                    };
                }
            },

            // --- TYPE D: x + (x - b) = c (Comparative Diff) ---
            {
                id: 'compare_diff',
                type: 'D',
                context: 'hobbies',
                templates: [ TERMS.problem_solving.d_compare ],
                logic: (rng) => {
                    const x = rng.intBetween(10, 30); // Person 1 (larger)
                    const b = rng.intBetween(2, 8);   // Diff
                    const total = x + (x - b);
                    return {
                        vars: { x, b, c: total },
                        solution: x,
                        equation: `2x - ${b} = ${total}`,
                        stepsWrite: (lang, fc) => [
                            { text: "Person 1", latex: "x" },
                            { text: "Person 2", latex: "x - " + b },
                            { text: "Sum", latex: `x + (x - ${b}) = ${total}` },
                            { text: t(lang, TERMS.common.simplify), latex: fc(`2x - ${b} = ${total}`) }
                        ],
                        stepsSolve: (lang, fc) => [
                            { text: "Setup", latex: `x + (x - ${b}) = ${total}` },
                            { text: t(lang, TERMS.common.simplify), latex: `2x - ${b} = ${total}` },
                            { text: t(lang, TERMS.algebra.add(b)), latex: `2x = ${total + b}` },
                            { text: t(lang, TERMS.algebra.divide(2)), latex: `x = ${fc(x)}` }
                        ]
                    };
                }
            }
        ];
    }

    public static generate(level: number, seed: string, lang: Language = 'sv'): GeneratedQuestion {
        const rng = new Random(seed);
        const formatColor = (val: string | number) => `\\textcolor{#D35400}{\\mathbf{${val}}}`;

        // Select Scenario
        const scenarios = this.getScenarios();
        const scenario = rng.pick(scenarios);

        // Generate Math
        const math = scenario.logic(rng);

        // Fill Text Template
        const rawTemplateObj = rng.pick(scenario.templates);
        let text = t(lang, rawTemplateObj);

        // 1. Replace Math Variables ($a$, $b$, $c$...)
        Object.entries(math.vars).forEach(([key, val]) => {
            text = text.replace(new RegExp(`\\$${key}\\$`, 'g'), `$${val}$`); // Replace $a$ with $10$
            text = text.replace(new RegExp(`\\$${key}`, 'g'), `$${val}`);     // Robustness
        });

        // 2. Replace Context Items ({item}, {name1}) using TextEngine manual lookup (since we can't import TextEngine logic fully if not exposed)
        // Using simple replacement for robustness here based on context key
        const ctxData = CONTEXTS[scenario.context];
        if (ctxData) {
            const itemObj = rng.pick(ctxData.items);
            const itemStr = t(lang, itemObj);
            const name1 = rng.pick(ctxData.people);
            let name2 = rng.pick(ctxData.people);
            while (name1 === name2) name2 = rng.pick(ctxData.people);

            text = text.replace(/{item}/g, itemStr);
            text = text.replace(/{name1}/g, name1);
            text = text.replace(/{name2}/g, name2);
        }

        // Determine Mode based on Level
        // Level 5: Write Equation
        // Level 6: Solve for x
        const isWriteMode = level === 5;
        const taskText = isWriteMode ? t(lang, TERMS.problem_solving.task_write) : t(lang, TERMS.problem_solving.task_solve);
        
        const fullDescription = `${text} ${taskText}`;
        const steps = isWriteMode ? math.stepsWrite(lang, formatColor) : math.stepsSolve(lang, formatColor);
        
        return {
            questionId: `prob-l${level}-${seed}`,
            renderData: {
                text_key: "problem_solving",
                description: fullDescription,
                latex: "",
                answerType: isWriteMode ? 'text' : 'numeric', // 'text' enables equation input string check, 'numeric' is integer
                variables: {}
            },
            serverData: {
                answer: isWriteMode ? math.equation : math.solution,
                solutionSteps: steps
            }
        };
    }
}