import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { TERMS, t, Language } from "../utils/i18n";
import { TextEngine, ContextKey } from "../utils/textEngine";

// Define the Scenario interface here locally, same as LinearEquationProblemGen
interface Scenario {
    id: string;
    context: ContextKey;
    generateMath: (rng: Random, lang: Language) => { 
        variables: Record<string, string | number>; 
        answer: { k: number, m: number }; 
        steps: Clue[];
        rawExpr: string;
    };
    templates: { sv: string; en: string }[];
}

export class ExpressionSimplificationGen {
  public static generate(level: number, seed: string, lang: Language = 'sv', multiplier: number = 1): GeneratedQuestion {
    const rng = new Random(seed);
    const color = "\\mathbf{\\color{#D35400}"; 

    let mode = level;
    if (level === 6) mode = rng.intBetween(1, 5); 

    let expr = "";
    let ansK = 0;
    let ansM = 0;
    let steps: Clue[] = [];
    // Default description, overridden for Level 5
    let descObj = { sv: "Förenkla uttrycket.", en: "Simplify the expression." };
    let questionText = "";

    // Helper to format polynomial: 2x + 3
    const formatPoly = (k: number, m: number) => {
        if (k === 0) return `${m}`;
        const kStr = k === 1 ? 'x' : (k === -1 ? '-x' : `${k}x`);
        if (m === 0) return kStr;
        const sign = m > 0 ? '+' : '-';
        return `${kStr} ${sign} ${Math.abs(m)}`;
    };

    // --- LEVEL 1: Combine Like Terms ---
    if (mode === 1) {
        const a = rng.intBetween(2, 9);
        const b = rng.intBetween(1, 10);
        const c = rng.intBetween(2, 9);
        expr = `${a}x + ${b} + ${c}x`;
        ansK = a + c;
        ansM = b;
        steps = [
            { text: t(lang, TERMS.simplification.group_terms), latex: `(${a}x + ${c}x) + ${b} = ${color}{${ansK}x} + ${b}}` },
            { text: "Result", latex: formatPoly(ansK, ansM) }
        ];
    }

    // --- LEVEL 2: Simple Distribution ---
    else if (mode === 2) {
        const a = rng.intBetween(2, 6);
        const b = rng.intBetween(1, 9);
        expr = `${a}(x + ${b})`;
        ansK = a;
        ansM = a * b;
        steps = [
            { text: t(lang, TERMS.algebra.distribute(a)), latex: `${a} \\cdot x + ${a} \\cdot ${b}` },
            { text: "Simplify", latex: `${color}{${formatPoly(ansK, ansM)}}}` }
        ];
    }

    // --- LEVEL 3: Distribute and Combine ---
    else if (mode === 3) {
        const a = rng.intBetween(2, 5);
        const b = rng.intBetween(1, 5);
        const c = rng.intBetween(2, 8);
        expr = `${a}(x + ${b}) + ${c}x`;
        ansK = a + c;
        ansM = a * b;
        
        steps = [
            { text: t(lang, TERMS.algebra.distribute(a)), latex: `${a}x + ${a*b} + ${c}x` },
            { text: t(lang, TERMS.simplification.group_terms), latex: `(${a}x + ${c}x) + ${ansM}` },
            { text: "Result", latex: `${color}{${formatPoly(ansK, ansM)}}}` }
        ];
    }

    // --- LEVEL 4: Subtraction Logic ---
    else if (mode === 4) {
        const a = rng.intBetween(2, 4);
        const b = rng.intBetween(1, 5);
        const c = rng.intBetween(2, 4);
        const d = rng.intBetween(1, 5);
        
        expr = `${a}(x + ${b}) - ${c}(x - ${d})`;
        ansK = a - c;
        ansM = (a * b) + (c * d); 
        
        const mSign = ansM >= 0 ? '+' : '-';
        const mVal = Math.abs(ansM);
        
        steps = [
            { text: t(lang, TERMS.simplification.intro(expr)), latex: expr },
            { text: "Distribute (careful with negatives)", latex: `${a}x + ${a*b} - ${c}x + ${c*d}` },
            { text: t(lang, TERMS.simplification.group_terms), latex: `(${a}x - ${c}x) + (${a*b} + ${c*d})` },
            { text: "Result", latex: `${color}{${ansK}x ${mSign} ${mVal}}}` }
        ];
    }

    // --- LEVEL 5: TEXT PROBLEMS (SCENARIO BASED) ---
    else if (mode === 5) {
        // Define Scenarios
        const numberScenario: Scenario = {
            id: 'number_op',
            context: 'school', // General context
            generateMath: (rng, lang) => {
                const mul = rng.intBetween(2, 5);
                const add = rng.intBetween(3, 15);
                const sub = rng.intBetween(1, 5);
                const k = mul;
                const m = add - sub;

                const steps: Clue[] = [
                    {
                        text: t(lang, TERMS.simplification.start_unknown),
                        latex: `\\text{Start} = x`
                    },
                    { 
                        text: t(lang, TERMS.simplification.translate_math), 
                        latex: `${mul} \\cdot x + ${add} - ${sub}` 
                    },
                    { 
                        text: t(lang, TERMS.simplification.simplify_const),
                        latex: `${add} - ${sub} = ${m}` 
                    },
                    { 
                        text: t(lang, TERMS.simplification.final_expr), 
                        latex: `${color}{${formatPoly(k, m)}}}` 
                    }
                ];

                return {
                    variables: { mul: `$${mul}$`, add: `$${add}$`, sub: `$${sub}$` },
                    answer: { k, m },
                    steps,
                    rawExpr: ""
                };
            },
            templates: [
                {
                    sv: "Tänk på ett tal $x$. Multiplicera det med {mul}, addera {add} och dra sedan bort {sub}. Skriv ett förenklat uttryck för detta.",
                    en: "Think of a number $x$. Multiply it by {mul}, add {add}, and then subtract {sub}. Write a simplified expression for this."
                }
            ]
        };

        const shoppingScenario: Scenario = {
            id: 'shopping_expr',
            context: 'shopping',
            generateMath: (rng, lang) => {
                const count = rng.intBetween(2, 5);
                const fixed = rng.intBetween(10, 50);
                const item = TextEngine.getRandomContextItem(rng, 'shopping', lang);
                
                const k = count;
                const m = fixed;

                const steps: Clue[] = [
                    { 
                        text: t(lang, TERMS.simplification.cost_unknown(item)), 
                        latex: `\\text{Pris} = ${count} \\cdot x` 
                    },
                    { 
                        text: t(lang, {sv: `Lägg till den fasta avgiften på ${fixed} kr.`, en: `Add the fixed fee of ${fixed} kr.`}), 
                        latex: `${count}x + ${fixed}` 
                    },
                    { 
                        text: t(lang, TERMS.simplification.final_expr), 
                        latex: `${color}{${formatPoly(k, m)}}}` 
                    }
                ];

                return {
                    variables: { count: `$${count}$`, fixed: `$${fixed}$`, item },
                    answer: { k, m },
                    steps,
                    rawExpr: ""
                };
            },
            templates: [
                {
                    sv: "Du köper {count} st {item}. Varje {item} kostar $x$ kr. Du betalar också en fast avgift på {fixed} kr. Teckna ett uttryck för totala kostnaden.",
                    en: "You buy {count} {item}. Each {item} costs $x$ kr. You also pay a fixed fee of {fixed} kr. Write an expression for the total cost."
                }
            ]
        };

        // Select Scenario
        const scenarios = [numberScenario, shoppingScenario];
        const scenario = rng.pick(scenarios);
        const mathData = scenario.generateMath(rng, lang);
        
        // Fill Template
        const templateObj = rng.pick(scenario.templates);
        const rawTemplate = lang === 'sv' ? templateObj.sv : templateObj.en;
        questionText = TextEngine.fillTemplate(rawTemplate, mathData.variables);
        
        // Assign to scope variables
        ansK = mathData.answer.k;
        ansM = mathData.answer.m;
        steps = mathData.steps;

        // Override description object with the generated text string
        // We use a trick: assigning the string to both SV/EN because the TextEngine 
        // already handled the translation selection above.
        descObj = { sv: questionText, en: questionText };
    }
    
    return {
        questionId: `simp-l${level}-${seed}`,
        renderData: {
            text_key: "simplify",
            description: descObj,
            latex: mode === 5 ? "" : expr, // No main latex for word problems
            variables: {}, 
            answerType: 'function_model' 
        },
        serverData: {
            answer: { k: ansK, m: ansM }, 
            solutionSteps: steps
        }
    };
  }
}