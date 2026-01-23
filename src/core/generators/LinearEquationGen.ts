import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { TERMS, t, Language } from "../utils/i18n";

export class LinearEquationGenerator {
  public static generate(level: number, seed: string, lang: Language = 'sv', multiplier: number = 1): GeneratedQuestion {
    const rng = new Random(seed);
    const formatColor = (val: string | number) => `\\textcolor{#D35400}{\\mathbf{${val}}}`;

    // Handling Mixed Levels (Level 7)
    let mode = level;
    if (level >= 7) mode = rng.intBetween(1, 4); 

    const s = (val: number) => Math.round(val * multiplier);
    let eq = "", answer = 0, steps: Clue[] = [];
    let description = { sv: "Lös ekvationen", en: "Solve the equation" };

    // --- LEVEL 1: One-Step Equations (Unchanged) ---
    if (mode === 1) {
        const type = rng.intBetween(1, 4); 
        
        if (type === 1) { // x / k = res
            const k = rng.intBetween(s(2), s(9));
            const res = rng.intBetween(s(2), s(10)); 
            answer = res * k;
            eq = `\\frac{x}{${k}} = ${res}`;
            
            steps = [
                { text: t(lang, TERMS.algebra.intro(eq)), latex: eq },
                { text: t(lang, TERMS.algebra.multiply(k)), latex: `x = ${res} \\cdot ${k} = ${formatColor(answer)}` }
            ];
        } else if (type === 2) { // k * x = res
            const k = rng.intBetween(s(2), s(9));
            const x = rng.intBetween(s(2), s(10));
            answer = x;
            const res = k * x;
            eq = `${k}x = ${res}`;
            steps = [
                { text: t(lang, TERMS.algebra.intro(eq)), latex: eq },
                { text: t(lang, TERMS.algebra.divide(k)), latex: `x = \\frac{${res}}{${k}} = ${formatColor(answer)}` }
            ];
        } else if (type === 3) { // x + k = res
            const k = rng.intBetween(s(1), s(20));
            const x = rng.intBetween(s(1), s(20));
            answer = x;
            eq = `x + ${k} = ${x + k}`;
            steps = [
                { text: t(lang, TERMS.algebra.intro(eq)), latex: eq },
                { text: t(lang, TERMS.algebra.subtract(k)), latex: `x = ${x+k} - ${k} = ${formatColor(answer)}` }
            ];
        } else { // x - k = res
            const k = rng.intBetween(s(1), s(20));
            const x = rng.intBetween(s(1), s(20));
            answer = x;
            eq = `x - ${k} = ${x - k}`;
            steps = [
                { text: t(lang, TERMS.algebra.intro(eq)), latex: eq },
                { text: t(lang, TERMS.algebra.add(k)), latex: `x = ${x-k} + ${k} = ${formatColor(answer)}` }
            ];
        }
    }

    // --- LEVEL 2: Two-Step Equations ---
    // Variations: ax+b=c, ax-b=c, x/a+b=c, x/a-b=c
    else if (mode === 2) {
        const type = rng.intBetween(1, 4);
        const x = rng.intBetween(2, 12); // Solution

        if (type === 1) { // ax + b = c
            const a = rng.intBetween(2, 9);
            const b = rng.intBetween(1, 15);
            const c = a * x + b;
            answer = x;
            eq = `${a}x + ${b} = ${c}`;
            steps = [
                { text: t(lang, TERMS.algebra.subtract(b)), latex: `${a}x = ${c} - ${b} = ${c-b}` },
                { text: t(lang, TERMS.algebra.divide(a)), latex: `x = \\frac{${c-b}}{${a}} = ${formatColor(answer)}` }
            ];
        } 
        else if (type === 2) { // ax - b = c
            const a = rng.intBetween(2, 9);
            const b = rng.intBetween(1, 15);
            const c = a * x - b;
            answer = x;
            eq = `${a}x - ${b} = ${c}`;
            steps = [
                { text: t(lang, TERMS.algebra.add(b)), latex: `${a}x = ${c} + ${b} = ${c+b}` },
                { text: t(lang, TERMS.algebra.divide(a)), latex: `x = \\frac{${c+b}}{${a}} = ${formatColor(answer)}` }
            ];
        }
        else if (type === 3) { // x/a + b = c
            const a = rng.intBetween(2, 8);
            const b = rng.intBetween(1, 10);
            // x must be divisible by a for clean display, so we actually generate x as a multiple
            const realX = x * a; 
            answer = realX;
            const c = x + b; // since (realX/a) = x
            eq = `\\frac{x}{${a}} + ${b} = ${c}`;
            steps = [
                { text: t(lang, TERMS.algebra.subtract(b)), latex: `\\frac{x}{${a}} = ${c} - ${b} = ${c-b}` },
                { text: t(lang, TERMS.algebra.multiply(a)), latex: `x = ${c-b} \\cdot ${a} = ${formatColor(answer)}` }
            ];
        }
        else { // x/a - b = c
            const a = rng.intBetween(2, 8);
            const b = rng.intBetween(1, 10);
            const realX = x * a;
            answer = realX;
            const c = x - b; 
            eq = `\\frac{x}{${a}} - ${b} = ${c}`;
            steps = [
                { text: t(lang, TERMS.algebra.add(b)), latex: `\\frac{x}{${a}} = ${c} + ${b} = ${c+b}` },
                { text: t(lang, TERMS.algebra.multiply(a)), latex: `x = ${c+b} \\cdot ${a} = ${formatColor(answer)}` }
            ];
        }
    }

    // --- LEVEL 3: Parentheses (Moved from Level 4) ---
    // Variations: a(x+b)=c, a(x-b)=c, a(bx-c)=d, a(bx+c)=d
    else if (mode === 3) {
        const type = rng.intBetween(1, 4);
        const a = rng.intBetween(2, 6);
        
        if (type === 1) { // a(x + b) = c
            const x = rng.intBetween(1, 10);
            const b = rng.intBetween(1, 9);
            const c = a * (x + b);
            answer = x;
            eq = `${a}(x + ${b}) = ${c}`;
            steps = [
                { text: t(lang, TERMS.algebra.distribute(a)), latex: `${a}x + ${a*b} = ${c}` },
                { text: t(lang, TERMS.algebra.subtract(a*b)), latex: `${a}x = ${c - a*b}` },
                { text: t(lang, TERMS.algebra.divide(a)), latex: `x = ${formatColor(answer)}` }
            ];
        }
        else if (type === 2) { // a(x - b) = c
            const x = rng.intBetween(5, 15);
            const b = rng.intBetween(1, x - 1); // Ensure x-b > 0 for simpler arithmetic
            const c = a * (x - b);
            answer = x;
            eq = `${a}(x - ${b}) = ${c}`;
            steps = [
                { text: t(lang, TERMS.algebra.distribute(a)), latex: `${a}x - ${a*b} = ${c}` },
                { text: t(lang, TERMS.algebra.add(a*b)), latex: `${a}x = ${c + a*b}` },
                { text: t(lang, TERMS.algebra.divide(a)), latex: `x = ${formatColor(answer)}` }
            ];
        }
        else if (type === 3) { // a(bx - c) = d
            const bVar = rng.intBetween(2, 5);
            const x = rng.intBetween(2, 8);
            const cVar = rng.intBetween(1, bVar * x - 1);
            const d = a * (bVar * x - cVar);
            answer = x;
            eq = `${a}(${bVar}x - ${cVar}) = ${d}`;
            steps = [
                { text: t(lang, TERMS.algebra.distribute(a)), latex: `${a*bVar}x - ${a*cVar} = ${d}` },
                { text: t(lang, TERMS.algebra.add(a*cVar)), latex: `${a*bVar}x = ${d + a*cVar}` },
                { text: t(lang, TERMS.algebra.divide(a*bVar)), latex: `x = ${formatColor(answer)}` }
            ];
        }
        else { // a(bx + c) = d
            const bVar = rng.intBetween(2, 5);
            const x = rng.intBetween(1, 8);
            const cVar = rng.intBetween(1, 9);
            const d = a * (bVar * x + cVar);
            answer = x;
            eq = `${a}(${bVar}x + ${cVar}) = ${d}`;
            steps = [
                { text: t(lang, TERMS.algebra.distribute(a)), latex: `${a*bVar}x + ${a*cVar} = ${d}` },
                { text: t(lang, TERMS.algebra.subtract(a*cVar)), latex: `${a*bVar}x = ${d - a*cVar}` },
                { text: t(lang, TERMS.algebra.divide(a*bVar)), latex: `x = ${formatColor(answer)}` }
            ];
        }
    }

    // --- LEVEL 4: X on Both Sides (Moved from Level 3) ---
    // Constraints: x > 0.
    // Variations: ax+b=cx+d, ax-b=cx+d, ax+b=cx-d, ax-b=cx-d
    else if (mode === 4) {
        const type = rng.intBetween(1, 4);
        const x = rng.intBetween(1, 10); // x > 0 constraint
        let a = rng.intBetween(3, 9);
        let c = rng.intBetween(2, a - 1); // Ensure a > c to keep x positive
        
        // Ensure a != c
        if (a === c) a++;
        
        if (type === 1) { // ax + b = cx + d
            const b = rng.intBetween(1, 15);
            // Calculate d
            // ax + b = cx + d => d = ax + b - cx
            const d = a*x + b - c*x;
            
            // Retry if d isn't suitable (e.g. d <= 0 would change the visual type)
            if (d <= 0) return LinearEquationGenerator.generate(level, seed + "retry", lang, multiplier);

            answer = x;
            eq = `${a}x + ${b} = ${c}x + ${d}`;
            steps = [
                { text: t(lang, TERMS.algebra.sub_var(`${c}x`)), latex: `${a-c}x + ${b} = ${d}` },
                { text: t(lang, TERMS.algebra.subtract(b)), latex: `${a-c}x = ${d-b}` },
                { text: t(lang, TERMS.algebra.divide(a-c)), latex: `x = ${formatColor(answer)}` }
            ];
        }
        else if (type === 2) { // ax - b = cx + d
            const b = rng.intBetween(1, 15);
            // ax - b = cx + d => d = ax - b - cx
            const d = a*x - b - c*x;
            
            if (d <= 0) return LinearEquationGenerator.generate(level, seed + "retry", lang, multiplier);

            answer = x;
            eq = `${a}x - ${b} = ${c}x + ${d}`;
            steps = [
                { text: t(lang, TERMS.algebra.sub_var(`${c}x`)), latex: `${a-c}x - ${b} = ${d}` },
                { text: t(lang, TERMS.algebra.add(b)), latex: `${a-c}x = ${d+b}` },
                { text: t(lang, TERMS.algebra.divide(a-c)), latex: `x = ${formatColor(answer)}` }
            ];
        }
        else if (type === 3) { // ax + b = cx - d
            const b = rng.intBetween(1, 15);
            // ax + b = cx - d => -d = ax + b - cx => d = cx - ax - b
            // Wait, if a > c and x > 0 and b > 0, then cx - ax - b is negative.
            // This type is only possible if c > a (resulting in positive d on LHS but negative coeff for x)
            // Or if result is negative x. But we want x > 0.
            
            // Let's swap coefficients so LHS is smaller x, move x to RHS?
            // Standard approach: Keep x on LHS. If ax + b = cx - d, and a > c, then (a-c)x + b = -d.
            // (a-c)x = -d - b. Since x>0, LHS > 0. RHS < 0. Impossible for positive x.
            
            // Therefore, for this form with x > 0, we need a < c.
            // Let's regenerate a and c such that c > a.
            const temp = a; a = c; c = temp; // Now c > a.
            
            // ax + b = cx - d => d = cx - ax - b
            const d = c*x - a*x - b;
            
            if (d <= 0) return LinearEquationGenerator.generate(level, seed + "retry", lang, multiplier);

            answer = x;
            eq = `${a}x + ${b} = ${c}x - ${d}`;
            // Strategy: Move ax to right (to keep coeff positive) or move cx to left (negative coeff)
            // Let's move ax to right: b + d = (c-a)x
            steps = [
                { text: t(lang, TERMS.algebra.sub_var(`${a}x`)), latex: `${b} = ${c-a}x - ${d}` },
                { text: t(lang, TERMS.algebra.add(d)), latex: `${b+d} = ${c-a}x` },
                { text: t(lang, TERMS.algebra.divide(c-a)), latex: `x = ${formatColor(answer)}` }
            ];
        }
        else { // ax - b = cx - d
            // ax - b = cx - d
            // Case 1: a > c. (a-c)x - b = -d => (a-c)x = b - d. Need b > d.
            // Case 2: c > a. -b = (c-a)x - d => d - b = (c-a)x. Need d > b.
            
            // Let's stick to a > c for standard left-side solving
            if (a < c) { const t = a; a = c; c = t; }
            
            const b = rng.intBetween(5, 20);
            // d = cx - ax + b (derived from: ax - b = cx - d => d = cx + b - ax ? No)
            // ax - b = cx - d => ax - cx - b = -d => (a-c)x - b = -d => d = b - (a-c)x
            const d = b - (a*x - c*x);
            
            if (d <= 0) return LinearEquationGenerator.generate(level, seed + "retry", lang, multiplier);

            answer = x;
            eq = `${a}x - ${b} = ${c}x - ${d}`;
            steps = [
                { text: t(lang, TERMS.algebra.sub_var(`${c}x`)), latex: `${a-c}x - ${b} = -${d}` },
                { text: t(lang, TERMS.algebra.add(b)), latex: `${a-c}x = ${b} - ${d} = ${b-d}` },
                { text: t(lang, TERMS.algebra.divide(a-c)), latex: `x = ${formatColor(answer)}` }
            ];
        }
    }

    return {
        questionId: `leq-l${level}-${seed}`,
        renderData: {
            text_key: "solve_eq",
            description: description,
            latex: eq,
            answerType: "numeric",
            variables: {}
        },
        serverData: {
            answer: answer,
            solutionSteps: steps
        }
    };
  }
}