import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { TERMS, t, Language } from "../utils/i18n";

export class LinearEquationGenerator {
  public static generate(level: number, seed: string, lang: Language = 'sv', multiplier: number = 1): GeneratedQuestion {
    const rng = new Random(seed);
    const formatColor = (val: string | number) => `\\textcolor{#D35400}{\\mathbf{${val}}}`;

    let mode = level;
    // Level 7 is now the Mixed Level for drills
    if (level >= 7) mode = rng.intBetween(1, 4); 

    const s = (val: number) => Math.round(val * multiplier);
    let eq = "", answer = 0, steps: Clue[] = [];

    // --- LEVEL 1: One-Step Equations ---
    if (mode === 1) {
        const type = rng.intBetween(1, 4); 
        
        if (type === 1) { // x / k = res
            const k = rng.intBetween(s(2), s(9));
            const res = rng.intBetween(s(2), s(10)); 
            answer = res * k;
            eq = `\\frac{x}{${k}} = ${res}`;
            
            steps = [
                { text: t(lang, TERMS.algebra.intro(eq)), latex: eq },
                { text: t(lang, TERMS.algebra.multiply(k)), latex: `x = ${res} \\cdot ${k}` },
                { text: t(lang, TERMS.common.result), latex: `x = ${formatColor(answer)}` }
            ];
        } else if (type === 2) { // k * x = res
            const k = rng.intBetween(s(2), s(9));
            answer = rng.intBetween(s(2), s(10)); 
            const res = k * answer;
            eq = `${k}x = ${res}`;
            
            steps = [
                { text: t(lang, TERMS.algebra.intro(eq)), latex: eq },
                { text: t(lang, TERMS.algebra.divide(k)), latex: `x = \\frac{${res}}{${k}}` },
                { text: t(lang, TERMS.common.result), latex: `x = ${formatColor(answer)}` }
            ];
        } else if (type === 3) { // x + k = res
            const k = rng.intBetween(s(1), s(20));
            const res = rng.intBetween(k + 1, k + 20);
            answer = res - k;
            eq = `x + ${k} = ${res}`;
            steps = [
                { text: t(lang, TERMS.algebra.intro(eq)), latex: eq },
                { text: t(lang, TERMS.algebra.subtract(k)), latex: `x = ${res} - ${k}` },
                { text: t(lang, TERMS.common.result), latex: `x = ${formatColor(answer)}` }
            ];
        } else { // x - k = res
            const k = rng.intBetween(s(1), s(20));
            const res = rng.intBetween(s(1), s(20));
            answer = res + k;
            eq = `x - ${k} = ${res}`;
            steps = [
                { text: t(lang, TERMS.algebra.intro(eq)), latex: eq },
                { text: t(lang, TERMS.algebra.add(k)), latex: `x = ${res} + ${k}` },
                { text: t(lang, TERMS.common.result), latex: `x = ${formatColor(answer)}` }
            ];
        }
    }

    // --- LEVEL 2: Two-Step Equations (ax + b = c) ---
    else if (mode === 2) {
        const x = rng.intBetween(s(2), s(10));
        const a = rng.intBetween(s(2), s(9));
        const b = rng.intBetween(s(1), s(15));
        const res = (a * x) + b;
        
        eq = `${a}x + ${b} = ${res}`;
        answer = x;
        steps = [
             { text: t(lang, TERMS.algebra.intro(eq)), latex: eq },
             { text: t(lang, TERMS.algebra.subtract(b)), latex: `${a}x = ${res} - ${b} = ${res - b}` },
             { text: t(lang, TERMS.algebra.divide(a)), latex: `x = ${formatColor(x)}` }
        ];
    }

    // --- LEVEL 3: Variables on Both Sides (ax + b = cx + d) ---
    else if (mode === 3) {
        answer = rng.intBetween(s(2), s(10));
        const c = rng.intBetween(s(2), s(5));
        const diff = rng.intBetween(s(1), s(4));
        const a = c + diff; 
        const b = rng.intBetween(s(1), s(10));
        const leftSide = a * answer + b;
        const d = leftSide - (c * answer);
        
        eq = `${a}x + ${b} = ${c}x + ${d}`;
        
        steps = [
            { text: t(lang, TERMS.algebra.intro(eq)), latex: eq },
            { text: t(lang, TERMS.algebra.sub_var(`${c}x`)), latex: `${diff}x + ${b} = ${d}` },
            { text: t(lang, TERMS.algebra.subtract(b)), latex: `${diff}x = ${d} - ${b} = ${d-b}` },
            { text: t(lang, TERMS.algebra.divide(diff)), latex: `x = ${formatColor(answer)}` }
        ];
    }

    // --- LEVEL 4: Parentheses a(x + b) = c ---
    else {
        const x = rng.intBetween(s(2), s(10));
        const a = rng.intBetween(s(2), s(5));
        const b = rng.intBetween(s(1), s(10));
        const res = a * (x + b);
        
        eq = `${a}(x + ${b}) = ${res}`; 
        answer = x;
        steps = [
            { text: t(lang, TERMS.algebra.intro(eq)), latex: eq },
            { text: t(lang, TERMS.algebra.distribute(a)), latex: `\\textcolor{#3498DB}{${a} \\cdot x} + \\textcolor{#3498DB}{${a} \\cdot ${b}} = ${res}` },
            { text: t(lang, TERMS.common.simplify), latex: `${a}x + ${a*b} = ${res}` },
            { text: t(lang, TERMS.algebra.subtract(a*b)), latex: `${a}x = ${res} - ${a*b} = ${res - (a*b)}` },
            { text: t(lang, TERMS.algebra.divide(a)), latex: `x = ${formatColor(answer)}` }
        ];
    }

    return {
        questionId: `eq-l${level}-${seed}`,
        renderData: {
            text_key: "solve_eq",
            latex: eq,
            answerType: 'numeric'
        },
        serverData: {
            answer: answer,
            solutionSteps: steps
        }
    };
  }
}