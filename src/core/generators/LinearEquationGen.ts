import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { TERMS, t, Language } from "../utils/i18n";

export class LinearEquationGenerator {
  public static generate(level: number, seed: string, lang: Language = 'sv', multiplier: number = 1): GeneratedQuestion {
    const rng = new Random(seed);
    const color = "\\mathbf{\\color{#D35400}"; 

    // Mode logic: Level 1-5 maps directly. Level 6+ mixes previous modes.
    let mode = level;
    if (level >= 6) mode = rng.intBetween(2, 5); 

    const s = (val: number) => Math.round(val * multiplier);

    let eq = "";
    let answer = 0;
    let steps: Clue[] = [];

    // --- LEVEL 1: One-Step Equations (ax = b, x + a = b) ---
    if (mode === 1) {
        const type = rng.intBetween(1, 2);
        if (type === 1) { // ax = b
            const x = rng.intBetween(s(2), s(12));
            const k = rng.intBetween(s(2), s(9));
            const res = x * k;
            eq = `${k}x = ${res}`;
            answer = x;
            steps = [
                { text: t(lang, TERMS.algebra.divide(k)), latex: `x = ${res}/${k} = ${x}` }
            ];
        } else { // x + a = b
            const x = rng.intBetween(s(2), s(20));
            const a = rng.intBetween(s(1), s(10));
            const res = x + a;
            eq = `x + ${a} = ${res}`;
            answer = x;
            steps = [
                { text: t(lang, TERMS.algebra.subtract(a)), latex: `x = ${res} - ${a} = ${x}` }
            ];
        }
    }
    
    // --- LEVEL 2: Two-Step Equations (ax + b = c) ---
    else if (mode === 2) {
        const x = rng.intBetween(s(2), s(12));
        const k = rng.intBetween(s(2), s(9));
        const b = rng.intBetween(s(1), s(20));
        const res = (k * x) + b;
        
        eq = `${k}x + ${b} = ${res}`;
        answer = x;
        
        steps = [
            { text: t(lang, TERMS.algebra.intro(eq)), latex: eq },
            { text: t(lang, TERMS.algebra.subtract(b)), latex: `${k}x = ${res} - ${b} \\implies ${k}x = ${res-b}` },
            { text: t(lang, TERMS.algebra.divide(k)), latex: `x = ${x}` }
        ];
    }

    // --- LEVEL 3: Variables on Both Sides (ax + b = cx + d) ---
    else if (mode === 3) {
        answer = rng.intBetween(s(2), s(10)); // x
        const c = rng.intBetween(s(2), s(5)); // smaller coeff
        const diff = rng.intBetween(s(2), s(6));
        const a = c + diff; // larger coeff (a > c)
        
        const b = rng.intBetween(s(1), s(10));
        const rhsVal = (a * answer) + b; // Total value
        const d = rhsVal - (c * answer); // Adjust d so equation holds
        
        eq = `${a}x + ${b} = ${c}x + ${d}`;
        
        steps = [
            { text: t(lang, TERMS.algebra.intro(eq)), latex: eq },
            { text: t(lang, TERMS.algebra.sub_var(`${c}x`)), latex: `${a}x - ${c}x + ${b} = ${d} \\implies ${diff}x + ${b} = ${d}` },
            { text: t(lang, TERMS.algebra.subtract(b)), latex: `${diff}x = ${d} - ${b} = ${d-b}` },
            { text: t(lang, TERMS.algebra.divide(diff)), latex: `x = ${answer}` }
        ];
    }

    // --- LEVEL 4/5: Parentheses & Complexity (a(x + b) = c) ---
    else {
        const x = rng.intBetween(s(2), s(10));
        const a = rng.intBetween(s(2), s(5));
        const b = rng.intBetween(s(1), s(10));
        const inside = x + b;
        const res = a * inside;
        
        eq = `${a}(x + ${b}) = ${res}`;
        answer = x;
        
        steps = [
            { text: t(lang, TERMS.algebra.intro(eq)), latex: eq },
            { text: t(lang, TERMS.algebra.distribute(a)), latex: `${a}x + ${a*b} = ${res}` },
            { text: t(lang, TERMS.algebra.subtract(a*b)), latex: `${a}x = ${res - (a*b)}` },
            { text: t(lang, TERMS.algebra.divide(a)), latex: `x = ${x}` }
        ];
    }

    return {
        questionId: `eq-l${level}-${seed}`,
        renderData: {
            text_key: "solve",
            latex: eq,
            variables: {},
            answerType: 'numeric'
        },
        serverData: {
            answer: answer,
            solutionSteps: steps
        }
    };
  }
}