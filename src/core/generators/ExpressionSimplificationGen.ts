import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { TERMS, t, Language } from "../utils/i18n";

export class ExpressionSimplificationGen {
  public static generate(level: number, seed: string, lang: Language = 'sv', multiplier: number = 1): GeneratedQuestion {
    const rng = new Random(seed);
    const color = "\\mathbf{\\color{#D35400}"; 

    let mode = level;
    if (level >= 6) mode = rng.intBetween(3, 5);

    let expr = "";
    let ansK = 0;
    let ansM = 0;
    let steps: Clue[] = [];

    // --- LEVEL 1: Combine Like Terms (ax + b + cx) ---
    if (mode === 1) {
        const a = rng.intBetween(2, 9);
        const b = rng.intBetween(1, 10);
        const c = rng.intBetween(2, 9);
        expr = `${a}x + ${b} + ${c}x`;
        ansK = a + c;
        ansM = b;
        steps = [
            { text: t(lang, TERMS.simplification.group_terms), latex: `(${a}x + ${c}x) + ${b}` },
            { text: "Add coefficients", latex: `${ansK}x + ${b}` }
        ];
    }

    // --- LEVEL 2: Simple Distribution a(x + b) ---
    else if (mode === 2) {
        const a = rng.intBetween(2, 6);
        const b = rng.intBetween(1, 9);
        expr = `${a}(x + ${b})`;
        ansK = a;
        ansM = a * b;
        steps = [
            { text: t(lang, TERMS.algebra.distribute(a)), latex: `${a} \\cdot x + ${a} \\cdot ${b}` },
            { text: "Simplify", latex: `${ansK}x + ${ansM}` }
        ];
    }

    // --- LEVEL 3: Distribute and Combine a(x + b) + cx ---
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
            { text: "Result", latex: `${ansK}x + ${ansM}` }
        ];
    }

    // --- LEVEL 4: Subtraction Logic a(x + b) - c(x - d) ---
    else {
        const a = rng.intBetween(2, 4);
        const b = rng.intBetween(1, 5);
        const c = rng.intBetween(2, 4);
        const d = rng.intBetween(1, 5);
        
        expr = `${a}(x + ${b}) - ${c}(x - ${d})`;
        
        // a*x + a*b - c*x - c*(-d)
        // a*x + ab - cx + cd
        ansK = a - c;
        ansM = (a * b) + (c * d); // minus times minus is plus
        
        steps = [
            { text: t(lang, TERMS.simplification.intro(expr)), latex: expr },
            { text: "Distribute (careful with negatives)", latex: `${a}x + ${a*b} - ${c}x + ${c*d}` },
            { text: t(lang, TERMS.simplification.group_terms), latex: `(${a}x - ${c}x) + (${a*b} + ${c*d})` },
            { text: "Result", latex: `${ansK}x + ${ansM}` }
        ];
    }
    
    // Formatting the answer string for standard display
    const mSign = ansM >= 0 ? '+' : '-';
    const answerStr = `${ansK}x ${mSign} ${Math.abs(ansM)}`;

    return {
        questionId: `simp-l${level}-${seed}`,
        renderData: {
            text_key: "simplify",
            latex: expr,
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