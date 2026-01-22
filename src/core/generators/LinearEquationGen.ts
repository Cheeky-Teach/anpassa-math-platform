import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { TERMS, t, Language } from "../utils/i18n";

export class LinearEquationGenerator {
  public static generate(level: number, seed: string, lang: Language = 'sv', multiplier: number = 1): GeneratedQuestion {
    const rng = new Random(seed);
    // Fixed LaTeX color syntax
    const color = "\\mathbf{\\textcolor{#D35400}}"; 

    let mode = level;
    if (level >= 6) mode = rng.intBetween(1, 4); // Mixed Level checks L1-L4

    const s = (val: number) => Math.round(val * multiplier);
    let eq = "", answer = 0, steps: Clue[] = [];

    // --- LEVEL 1: One-Step Equations ---
    if (mode === 1) {
        const type = rng.intBetween(1, 4); 
        
        if (type === 1) { 
            // x / k = res
            const x = rng.intBetween(s(2), s(12));
            const k = rng.intBetween(s(2), s(9));
            eq = `\\frac{x}{${k}} = ${x}`; 
            // Wait, logic check: if eq is x/k = x, then x = k*x -> k=1. Incorrect.
            // Should be x / k = res -> x = res * k.
            // Let's fix the math generation to be deterministic.
            
            const res = rng.intBetween(s(2), s(10)); 
            answer = res * k;
            eq = `\\frac{x}{${k}} = ${res}`;
            
            steps = [
                { text: t(lang, TERMS.algebra.intro(eq)), latex: eq },
                { text: "Multiply", latex: `x = ${res} \\cdot ${k} = ${color}{${answer}}` }
            ];
        }
        else if (type === 2) { 
            // k * x = res
            const x = rng.intBetween(s(2), s(12));
            const k = rng.intBetween(s(2), s(9));
            const res = x * k;
            eq = `${k}x = ${res}`; 
            answer = x; 
            steps = [
                { text: t(lang, TERMS.algebra.intro(eq)), latex: eq },
                { text: t(lang, TERMS.algebra.divide(k)), latex: `x = \\frac{${res}}{${k}} = ${color}{${answer}}` }
            ]; 
        }
        else if (type === 3) { 
            // x + a = b
            const x = rng.intBetween(s(1), s(20));
            const a = rng.intBetween(s(1), s(20));
            const b = x + a;
            eq = `x + ${a} = ${b}`;
            answer = x;
            steps = [
                { text: t(lang, TERMS.algebra.intro(eq)), latex: eq },
                { text: t(lang, TERMS.algebra.subtract(a)), latex: `x = ${b} - ${a} = ${color}{${answer}}` }
            ];
        }
        else {
            // x - a = b
            const x = rng.intBetween(s(2), s(20));
            const a = rng.intBetween(s(1), s(20));
            const b = x - a;
            eq = `x - ${a} = ${b}`;
            answer = x;
            steps = [
                { text: t(lang, TERMS.algebra.intro(eq)), latex: eq },
                { text: "Add", latex: `x = ${b} + ${a} = ${color}{${answer}}` }
            ];
        }
    }

    // --- LEVEL 2: Two-Step Equations (ax + b = c) ---
    else if (mode === 2) {
        const x = rng.intBetween(s(2), s(10));
        const a = rng.intBetween(s(2), s(9));
        const b = rng.intBetween(s(1), s(20));
        const type = rng.bool(); // Plus or Minus
        
        if (type) { // ax + b = c
            const c = (a * x) + b;
            eq = `${a}x + ${b} = ${c}`;
            steps = [
                { text: t(lang, TERMS.algebra.intro(eq)), latex: eq },
                { text: t(lang, TERMS.algebra.subtract(b)), latex: `${a}x = ${c} - ${b} = ${c-b}` },
                { text: t(lang, TERMS.algebra.divide(a)), latex: `x = \\frac{${c-b}}{${a}} = ${color}{${x}}` }
            ];
        } else { // ax - b = c
            const c = (a * x) - b;
            eq = `${a}x - ${b} = ${c}`;
            steps = [
                { text: t(lang, TERMS.algebra.intro(eq)), latex: eq },
                { text: "Add", latex: `${a}x = ${c} + ${b} = ${c+b}` },
                { text: t(lang, TERMS.algebra.divide(a)), latex: `x = \\frac{${c+b}}{${a}} = ${color}{${x}}` }
            ];
        }
        answer = x;
    }

    // --- LEVEL 3: Variables on Both Sides (ax + b = cx + d) ---
    else if (mode === 3) {
        // x must be integer. 
        // a*x + b = c*x + d  =>  (a-c)x = d-b
        answer = rng.intBetween(s(2), s(10));
        const c = rng.intBetween(s(2), s(5));
        const diff = rng.intBetween(s(2), s(6));
        const a = c + diff; // Ensure a > c so x is positive coefficient
        const b = rng.intBetween(s(1), s(10));
        const d = (a * answer) + b - (c * answer);

        eq = `${a}x + ${b} = ${c}x + ${d}`;
        steps = [
            { text: t(lang, TERMS.algebra.intro(eq)), latex: eq },
            { text: t(lang, TERMS.algebra.sub_var(`${c}x`)), latex: `${a}x ${color}{- ${c}x} + ${b} = ${d} \\implies ${diff}x + ${b} = ${d}` },
            { text: t(lang, TERMS.algebra.subtract(b)), latex: `${diff}x = ${d} - ${b} = ${d-b}` },
            { text: t(lang, TERMS.algebra.divide(diff)), latex: `x = ${color}{${answer}}` }
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
            { text: t(lang, TERMS.algebra.distribute(a)), latex: `${color}{${a} \\cdot x} + ${color}{${a} \\cdot ${b}} = ${res}` },
            { text: "Simplify", latex: `${a}x + ${a*b} = ${res}` },
            { text: t(lang, TERMS.algebra.subtract(a*b)), latex: `${a}x = ${res} - ${a*b} = ${res - (a*b)}` },
            { text: t(lang, TERMS.algebra.divide(a)), latex: `x = ${color}{${answer}}` }
        ];
    }

    return {
        questionId: `eq-l${level}-${seed}`,
        renderData: {
            text_key: "solve_eq",
            description: { sv: "Lös ekvationen", en: "Solve the equation" },
            latex: eq,
            answerType: 'numeric',
            variables: {}
        },
        serverData: {
            answer: answer,
            solutionSteps: steps
        }
    };
  }
}