import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { TERMS, t, Language } from "../utils/i18n";
import { TextEngine, ContextKey, CONTEXTS } from "../utils/textEngine";

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
    
    private static getScenarios(): ProblemScenario[] {
        return [
            // --- TYPE A: ax + b = c ---
            {
                id: 'shopping_bag',
                type: 'A',
                context: 'shopping',
                templates: [ TERMS.problem_solving.a_buy ],
                logic: (rng) => {
                    const x = rng.intBetween(3, 15); 
                    const a = rng.intBetween(5, 25); 
                    const b = rng.pick([2, 5, 10]); 
                    const c = a * x + b;
                    return {
                        vars: { x, a, b, c },
                        solution: x,
                        equation: `${a}x + ${b} = ${c}`,
                        stepsWrite: (lang, fc) => [
                            { text: t(lang, TERMS.problem_solving.expl_rate_val), latex: `\\text{Pris} \\cdot \\text{Antal} = ${a} \\cdot x` },
                            { text: t(lang, TERMS.problem_solving.expl_fixed_val), latex: `+ ${b}` },
                            { text: t(lang, TERMS.problem_solving.clue_total), latex: `${a}x + ${b} = ${c}` }
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
                context: 'shopping',
                templates: [ TERMS.problem_solving.a_taxi ],
                logic: (rng) => {
                    const x = rng.intBetween(5, 30); 
                    const a = rng.intBetween(10, 50); 
                    const b = rng.pick([45, 50, 75, 100]); 
                    const c = a * x + b;
                    return {
                        vars: { x, a, b, c },
                        solution: x,
                        equation: `${a}x + ${b} = ${c}`,
                        stepsWrite: (lang, fc) => [
                            { text: t(lang, TERMS.problem_solving.expl_rate_val), latex: `${a} \\cdot x` },
                            { text: t(lang, TERMS.problem_solving.expl_fixed_val), latex: `+ ${b}` },
                            { text: t(lang, TERMS.problem_solving.clue_total), latex: `${a}x + ${b} = ${c}` }
                        ],
                        stepsSolve: (lang, fc) => [
                            { text: t(lang, TERMS.common.equation), latex: `${a}x + ${b} = ${c}` },
                            { text: t(lang, TERMS.algebra.subtract(b)), latex: `${a}x = ${c - b}` },
                            { text: t(lang, TERMS.algebra.divide(a)), latex: `x = ${fc(x)}` }
                        ]
                    };
                }
            },
            // --- TYPE B: ax - b = c ---
            {
                id: 'shopping_discount',
                type: 'B',
                context: 'shopping',
                templates: [ TERMS.problem_solving.b_discount ],
                logic: (rng) => {
                    const x = rng.intBetween(2, 10); 
                    const a = rng.intBetween(50, 200); 
                    const b = rng.pick([20, 50, 100]); 
                    const c = a * x - b;
                    return {
                        vars: { x, a, b, c },
                        solution: x,
                        equation: `${a}x - ${b} = ${c}`,
                        stepsWrite: (lang, fc) => [
                            { text: t(lang, TERMS.problem_solving.expl_rate_val), latex: `${a} \\cdot x` },
                            { text: t(lang, TERMS.simplification.expl_discount), latex: `-${b}` },
                            { text: t(lang, TERMS.problem_solving.clue_total), latex: `${a}x - ${b} = ${c}` }
                        ],
                        stepsSolve: (lang, fc) => [
                            { text: t(lang, TERMS.common.equation), latex: `${a}x - ${b} = ${c}` },
                            { text: t(lang, TERMS.algebra.add(b)), latex: `${a}x = ${c + b}` },
                            { text: t(lang, TERMS.algebra.divide(a)), latex: `x = ${fc(x)}` }
                        ]
                    };
                }
            },
             // --- TYPE C: x + (x + a) = c ---
            {
                id: 'compare_sum',
                type: 'C',
                context: 'hobbies',
                templates: [ TERMS.problem_solving.c_compare ],
                logic: (rng) => {
                    const x = rng.intBetween(5, 20); 
                    const a = rng.intBetween(2, 10); 
                    const total = x + (x + a);
                    return {
                        vars: { x, a, c: total },
                        solution: x,
                        equation: `2x + ${a} = ${total}`,
                        stepsWrite: (lang, fc) => [
                            { text: t(lang, TERMS.problem_solving.expl_person1), latex: "x" },
                            { text: t(lang, TERMS.problem_solving.expl_person2_more), latex: `x + ${a}` },
                            { text: t(lang, TERMS.simplification.group_terms), latex: `x + (x + ${a}) = 2x + ${a}` }
                        ],
                        stepsSolve: (lang, fc) => [
                            { text: t(lang, TERMS.common.equation), latex: `2x + ${a} = ${total}` },
                            { text: t(lang, TERMS.algebra.subtract(a)), latex: `2x = ${total - a}` },
                            { text: t(lang, TERMS.algebra.divide(2)), latex: `x = ${fc(x)}` }
                        ]
                    };
                }
            },
            // --- TYPE D: x + (x - b) = c ---
            {
                id: 'compare_diff',
                type: 'D',
                context: 'hobbies',
                templates: [ TERMS.problem_solving.d_compare ],
                logic: (rng) => {
                    const x = rng.intBetween(10, 30); 
                    const b = rng.intBetween(2, 8);   
                    const total = x + (x - b);
                    return {
                        vars: { x, b, c: total },
                        solution: x,
                        equation: `2x - ${b} = ${total}`,
                        stepsWrite: (lang, fc) => [
                            { text: t(lang, TERMS.problem_solving.expl_person1), latex: "x" },
                            { text: t(lang, TERMS.problem_solving.expl_person2_less), latex: `x - ${b}` },
                            { text: t(lang, TERMS.simplification.group_terms), latex: `x + (x - ${b}) = 2x - ${b}` }
                        ],
                        stepsSolve: (lang, fc) => [
                            { text: t(lang, TERMS.common.equation), latex: `2x - ${b} = ${total}` },
                            { text: t(lang, TERMS.algebra.add(b)), latex: `2x = ${total + b}` },
                            { text: t(lang, TERMS.algebra.divide(2)), latex: `x = ${fc(x)}` }
                        ]
                    };
                }
            }
        ];
    }
    // ... (rest of class remains standard static generate method calling these scenarios)
    public static generate(level: number, seed: string, lang: Language = 'sv'): GeneratedQuestion {
        const rng = new Random(seed);
        const formatColor = (val: string | number) => `\\textcolor{#D35400}{\\mathbf{${val}}}`;
        
        const scenarios = this.getScenarios();
        const scenario = rng.pick(scenarios);
        const math = scenario.logic(rng);
        const templateObj = rng.pick(scenario.templates);
        let text = t(lang, templateObj);

        Object.entries(math.vars).forEach(([key, val]) => {
            text = text.replace(new RegExp(`\\$${key}\\$`, 'g'), `$${val}$`);
            text = text.replace(new RegExp(`\\$${key}`, 'g'), `$${val}`);
        });

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

        const isWriteMode = level === 5;
        const taskText = isWriteMode ? t(lang, TERMS.problem_solving.task_write) : t(lang, TERMS.problem_solving.task_solve);
        
        return {
            questionId: `prob-l${level}-${seed}`,
            renderData: {
                text_key: "problem_solving",
                description: `${text} ${taskText}`,
                latex: "",
                answerType: isWriteMode ? 'text' : 'numeric', 
                variables: {}
            },
            serverData: {
                answer: isWriteMode ? math.equation : math.solution,
                solutionSteps: isWriteMode ? math.stepsWrite(lang, formatColor) : math.stepsSolve(lang, formatColor)
            }
        };
    }
}