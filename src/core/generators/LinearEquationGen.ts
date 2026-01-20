import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { TERMS, t, Language } from "../utils/i18n";

export class LinearEquationGenerator {
  public static generate(level: number, seed: string, lang: Language = 'sv', multiplier: number = 1): GeneratedQuestion {
    const rng = new Random(seed);
    const color = "\\mathbf{\\color{#D35400}"; 

    let mode = level;
    if (level >= 6) mode = rng.intBetween(2, 5); 

    const s = (val: number) => Math.round(val * multiplier);

    let eq = "";
    let answer = 0;
    let steps: Clue[] = [];

    // --- LEVEL 1: One-Step Equations (All 4 Operations) ---
    if (mode === 1) {
        const type = rng.intBetween(1, 4); 
        
        // Type 1: Multiplication (ax = b)
        if (type === 1) { 
            const x = rng.intBetween(s(2), s(12));
            const k = rng.intBetween(s(2), s(9));
            const res = x * k;
            eq = `${k}x = ${res}`;
            answer = x;
            steps = [
                { text: t(lang, TERMS.algebra.divide(k)), latex: `x = \\frac{${res}}{${k}} = ${color}{${x}}}` }
            ];
        } 
        // Type 2: Division (x / a = b)
        else if (type === 2) { 
            const res = rng.intBetween(s(2), s(10));
            const a = rng.intBetween(s(2), s(10));
            const x = res * a;
            eq = `\\frac{x}{${a}} = ${res}`;
            answer = x;
            steps = [
                { text: t(lang, TERMS.algebra.multiply(a)), latex: `x = ${res} \\cdot ${a} = ${color}{${x}}}` }
            ];
        }
        // Type 3: Addition (x + a = b)
        else if (type === 3) { 
            const x = rng.intBetween(s(2), s(20));
            const a = rng.intBetween(s(1), s(10));
            const res = x + a;
            eq = `x + ${a} = ${res}`;
            answer = x;
            steps = [
                { text: t(lang, TERMS.algebra.subtract(a)), latex: `x = ${res} - ${a} = ${color}{${x}}}` }
            ];
        }
        // Type 4: Subtraction (x - a = b)
        else { 
            const x = rng.intBetween(s(2), s(20));
            const a = rng.intBetween(s(1), s(10));
            const res = x - a;
            eq = `x - ${a} = ${res}`;
            answer = x;
            steps = [
                { text: t(lang, TERMS.algebra.add(a)), latex: `x = ${res} + ${a} = ${color}{${x}}}` }
            ];
        }
    }
    
    // --- LEVEL 2: Two-Step Equations (ax +/- b = c OR x/a +/- b = c) ---
    else if (mode === 2) {
        // Decide if term is multiplication (kx) or division (x/k)
        // 0 = Multiplication, 1 = Division
        const isDivision = rng.intBetween(0, 1) === 1;
        
        if (!isDivision) {
            // Standard: ax +/- b = c
            const x = rng.intBetween(s(2), s(12));
            const k = rng.intBetween(s(2), s(9));
            const b = rng.intBetween(s(1), s(20));
            const isSubtraction = rng.intBetween(0, 1) === 1;

            let res = 0;
            let inverseOpText = "";
            let inverseCalc = "";
            let intermediate = k * x;

            if (isSubtraction) {
                // ax - b = res
                res = intermediate - b;
                eq = `${k}x - ${b} = ${res}`;
                inverseOpText = t(lang, TERMS.algebra.add(b));
                inverseCalc = `${res} + ${b}`;
            } else {
                // ax + b = res
                res = intermediate + b;
                eq = `${k}x + ${b} = ${res}`;
                inverseOpText = t(lang, TERMS.algebra.subtract(b));
                inverseCalc = `${res} - ${b}`;
            }

            answer = x;
            steps = [
                { text: t(lang, TERMS.algebra.intro(eq)), latex: eq },
                { text: inverseOpText, latex: `${k}x = ${inverseCalc} \\implies ${k}x = ${intermediate}` },
                { text: t(lang, TERMS.algebra.divide(k)), latex: `x = ${color}{${x}}}` }
            ];
        } else {
            // New Division Logic: x/k +/- b = c
            const k = rng.intBetween(s(2), s(9));
            const intermediate = rng.intBetween(s(2), s(12)); // value of x/k
            const x = intermediate * k; // answer
            const b = rng.intBetween(s(1), s(20));
            const isSubtraction = rng.intBetween(0, 1) === 1;

            let res = 0;
            let inverseOpText = "";
            let inverseCalc = "";

            if (isSubtraction) {
                // x/k - b = res
                res = intermediate - b;
                eq = `\\frac{x}{${k}} - ${b} = ${res}`;
                inverseOpText = t(lang, TERMS.algebra.add(b));
                inverseCalc = `${res} + ${b}`;
            } else {
                // x/k + b = res
                res = intermediate + b;
                eq = `\\frac{x}{${k}} + ${b} = ${res}`;
                inverseOpText = t(lang, TERMS.algebra.subtract(b));
                inverseCalc = `${res} - ${b}`;
            }

            answer = x;
            steps = [
                { text: t(lang, TERMS.algebra.intro(eq)), latex: eq },
                { text: inverseOpText, latex: `\\frac{x}{${k}} = ${inverseCalc} \\implies \\frac{x}{${k}} = ${intermediate}` },
                { text: t(lang, TERMS.algebra.multiply(k)), latex: `x = ${intermediate} \\cdot ${k} = ${color}{${x}}}` }
            ];
        }
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
            { text: t(lang, TERMS.algebra.sub_var(`${c}x`)), latex: `${a}x ${color}{- ${c}x}} + ${b} = ${d} \\implies ${diff}x + ${b} = ${d}` },
            { text: t(lang, TERMS.algebra.subtract(b)), latex: `${diff}x = ${d} - ${b} = ${d-b}` },
            { text: t(lang, TERMS.algebra.divide(diff)), latex: `x = ${color}{${answer}}}` }
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
            { text: t(lang, TERMS.algebra.distribute(a)), latex: `${color}{${a}x + ${a*b}}} = ${res}` },
            { text: t(lang, TERMS.algebra.subtract(a*b)), latex: `${a}x = ${res - (a*b)}` },
            { text: t(lang, TERMS.algebra.divide(a)), latex: `x = ${color}{${x}}}` }
        ];
    }

    return {
        questionId: `eq-l${level}-${seed}`,
        renderData: {
            text_key: "solve",
            description: lang === 'sv' ? "Lös ekvationen." : "Solve the equation.",
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