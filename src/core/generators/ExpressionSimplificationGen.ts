import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { TERMS, t, Language } from "../utils/i18n";

export class ExpressionSimplificationGen {
  public static generate(level: number, seed: string, lang: Language = 'sv', multiplier: number = 1): GeneratedQuestion {
    const rng = new Random(seed);
    const color = "\\mathbf{\\textcolor{#D35400}}"; 

    let mode = level;
    if (level >= 5) mode = rng.intBetween(1, 4);

    let expr = "", ansK = 0, ansM = 0, steps: Clue[] = [];
    let descObj = { sv: "Förenkla uttrycket.", en: "Simplify the expression." };

    // --- MODE 1: Grouping (ax + b + cx) ---
    if (mode === 1) {
        const a = rng.intBetween(2, 9);
        const b = rng.intBetween(1, 10);
        const c = rng.intBetween(2, 9);
        expr = `${a}x + ${b} + ${c}x`; 
        ansK = a + c; 
        ansM = b;
        
        steps = [
            { text: t(lang, TERMS.simplification.group_terms), latex: `(${a}x + ${c}x) + ${b}` },
            { text: "Result", latex: `${color}{${ansK}x + ${ansM}}` }
        ];
    } 
    
    // --- MODE 2: Distributing a(x + b) ---
    else if (mode === 2) {
        const a = rng.intBetween(2, 6);
        const b = rng.intBetween(1, 8);
        expr = `${a}(x + ${b})`; 
        ansK = a; 
        ansM = a * b;
        
        steps = [
            { text: "Distribute", latex: `${a} \\cdot x + ${a} \\cdot ${b}` },
            { text: "Result", latex: `${color}{${ansK}x + ${ansM}}` }
        ];
    }
    
    // --- MODE 3: Distribute & Group a(x + b) + cx ---
    else if (mode === 3) {
        const a = rng.intBetween(2, 5);
        const b = rng.intBetween(1, 5);
        const c = rng.intBetween(2, 8);
        expr = `${a}(x + ${b}) + ${c}x`; 
        
        const distM = a * b;
        ansK = a + c; 
        ansM = distM;
        
        steps = [
            { text: t(lang, TERMS.algebra.distribute(a)), latex: `${a}x + ${distM} + ${c}x` }, 
            { text: t(lang, TERMS.simplification.group_terms), latex: `(${a}x + ${c}x) + ${distM}` }, 
            { text: "Result", latex: `${color}{${ansK}x + ${ansM}}` }
        ];
    }
    
    // --- MODE 4: Subtracting Parentheses a(x + b) - c(x - d) ---
    else {
        const a = rng.intBetween(2, 5);
        const b = rng.intBetween(1, 5);
        const c = rng.intBetween(2, 4);
        const d = rng.intBetween(1, 5);
        
        // a(x + b) - c(x - d)
        expr = `${a}(x + ${b}) - ${c}(x - ${d})`;
        
        // a*x + a*b - c*x + c*d
        const distM1 = a * b;
        const distM2 = c * d; // double negative becomes positive
        
        ansK = a - c; 
        ansM = distM1 + distM2; 
        
        steps = [
            { text: t(lang, TERMS.simplification.intro(expr)), latex: expr }, 
            { text: "Distribute (careful with negatives)", latex: `${a}x + ${distM1} - ${c}x + ${distM2}` }, 
            { text: t(lang, TERMS.simplification.group_terms), latex: `(${a}x - ${c}x) + (${distM1} + ${distM2})` }, 
            { text: "Result", latex: `${color}{${ansK}x + ${ansM}}` }
        ];
    }

    // Standardize Answer String: "kx+m" or "kx-m"
    // This string is what gets encrypted in the token.
    const mSign = ansM >= 0 ? '+' : '-';
    const mVal = Math.abs(ansM);
    // If m is 0, we can technically just say "kx", but "kx+0" is safer for simple parsing unless we want to be strict.
    // For this level, let's keep it simple: if M is 0, just show Kx
    const answerStr = ansM === 0 ? `${ansK}x` : `${ansK}x${mSign}${mVal}`;

    return {
        questionId: `simp-l${level}-${seed}`,
        renderData: {
            text_key: "simplify",
            description: descObj,
            latex: expr,
            answerType: 'algebraic', // Frontend should expect kx+m input
            variables: {}
        },
        serverData: {
            answer: answerStr, // Returns string "5x+10"
            solutionSteps: steps
        }
    };
  }
}