import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { TERMS, t, Language } from "../utils/i18n";

export class ExpressionSimplificationGen {
  public static generate(level: number, seed: string, lang: Language = 'sv', multiplier: number = 1): GeneratedQuestion {
    const rng = new Random(seed);
    const formatColor = (val: string | number) => `\\textcolor{#D35400}{\\mathbf{${val}}}`;

    let mode = level;
    if (level >= 6) mode = rng.intBetween(3, 5);

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
            { text: t(lang, TERMS.simplification.intro(expr)), latex: expr }, 
            { text: t(lang, TERMS.simplification.group_terms), latex: `(${a}x + ${c}x) + ${b}` },
            { text: t(lang, TERMS.common.result), latex: formatColor(`${ansK}x + ${ansM}`) }
        ];
    } 
    
    // --- MODE 2: Parentheses k(x + a) ---
    else if (mode === 2) {
        const k = rng.intBetween(2, 9);
        const a = rng.intBetween(1, 9);
        expr = `${k}(x + ${a})`; 
        ansK = k; 
        ansM = k * a;
        
        steps = [
            { text: t(lang, TERMS.simplification.intro(expr)), latex: expr }, 
            { text: t(lang, TERMS.algebra.distribute(k)), latex: `${k} \\cdot x + ${k} \\cdot ${a}` },
            { text: t(lang, TERMS.common.result), latex: formatColor(`${ansK}x + ${ansM}`) }
        ];
    }

    // --- MODE 3: Distribute & Simplify a(x + b) + cx ---
    else if (mode === 3) {
        const a = rng.intBetween(2, 5);
        const b = rng.intBetween(1, 5);
        const c = rng.intBetween(2, 9);
        
        expr = `${a}(x + ${b}) + ${c}x`;
        const distM = a * b; 
        ansK = a + c; 
        ansM = distM;
        
        steps = [
            { text: t(lang, TERMS.simplification.intro(expr)), latex: expr }, 
            { text: t(lang, TERMS.algebra.distribute(a)), latex: `${a}x + ${distM} + ${c}x` }, 
            { text: t(lang, TERMS.simplification.group_terms), latex: `(${a}x + ${c}x) + ${distM}` }, 
            { text: t(lang, TERMS.common.result), latex: formatColor(`${ansK}x + ${ansM}`) }
        ];
    }
    
    // --- MODE 4: Subtracting Parentheses a(x + b) - c(x - d) ---
    else {
        const a = rng.intBetween(2, 5);
        const b = rng.intBetween(1, 5);
        const c = rng.intBetween(2, 4);
        const d = rng.intBetween(1, 5);
        
        expr = `${a}(x + ${b}) - ${c}(x - ${d})`;
        const distM1 = a * b;
        const distM2 = c * d; 
        
        ansK = a - c; 
        ansM = distM1 + distM2; 
        
        steps = [
            { text: t(lang, TERMS.simplification.intro(expr)), latex: expr }, 
            { text: t(lang, TERMS.algebra.distribute(a)), latex: `${a}x + ${distM1} - ${c}x + ${distM2}` }, 
            { text: t(lang, TERMS.simplification.group_terms), latex: `(${a}x - ${c}x) + (${distM1} + ${distM2})` }, 
            { text: t(lang, TERMS.common.result), latex: formatColor(`${ansK}x + ${ansM}`) }
        ];
    }

    const mPart = ansM >= 0 ? `+ ${ansM}` : `- ${Math.abs(ansM)}`;
    const answerStr = `${ansK}x ${mPart}`;

    return {
        questionId: `sim-l${level}-${seed}`,
        renderData: {
            text_key: "simplify",
            description: descObj,
            latex: expr,
            answerType: 'text'
        },
        serverData: {
            answer: answerStr,
            solutionSteps: steps
        }
    };
  }
}