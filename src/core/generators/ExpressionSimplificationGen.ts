import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { TERMS, t, Language } from "../utils/i18n";

export class ExpressionSimplificationGen {
  public static generate(level: number, seed: string, lang: Language = 'sv', multiplier: number = 1): GeneratedQuestion {
    const rng = new Random(seed);
    const color = "\\mathbf{\\color{#D35400}"; 

    let mode = level;
    if (level >= 6) mode = rng.intBetween(3, 5);

    let expr = "", ansK = 0, ansM = 0, steps: Clue[] = [];
    let descObj = { sv: "Förenkla uttrycket.", en: "Simplify the expression." };

    if (mode === 1) {
        const a = rng.intBetween(2, 9), b = rng.intBetween(1, 10), c = rng.intBetween(2, 9);
        expr = `${a}x + ${b} + ${c}x`; ansK = a + c; ansM = b;
        steps = [{ text: t(lang, TERMS.simplification.group_terms), latex: `(${a}x + ${c}x) + ${b} = ${color}{${ansK}x} + ${b}}` }, { text: "Result", latex: `${ansK}x + ${b}` }];
    } else if (mode === 2) {
        const a = rng.intBetween(2, 6), b = rng.intBetween(1, 9);
        expr = `${a}(x + ${b})`; ansK = a; ansM = a * b;
        steps = [{ text: t(lang, TERMS.algebra.distribute(a)), latex: `${a} \\cdot x + ${a} \\cdot ${b}` }, { text: "Simplify", latex: `${color}{${ansK}x + ${ansM}}}` }];
    } else if (mode === 3) {
        const a = rng.intBetween(2, 5), b = rng.intBetween(1, 5), c = rng.intBetween(2, 8);
        expr = `${a}(x + ${b}) + ${c}x`; ansK = a + c; ansM = a * b;
        steps = [{ text: t(lang, TERMS.algebra.distribute(a)), latex: `${a}x + ${a*b} + ${c}x` }, { text: t(lang, TERMS.simplification.group_terms), latex: `(${a}x + ${c}x) + ${ansM}` }, { text: "Result", latex: `${color}{${ansK}x + ${ansM}}}` }];
    } else {
        const a = rng.intBetween(2, 4), b = rng.intBetween(1, 5), c = rng.intBetween(2, 4), d = rng.intBetween(1, 5);
        expr = `${a}(x + ${b}) - ${c}(x - ${d})`;
        ansK = a - c; ansM = (a * b) + (c * d); 
        const mSign = ansM >= 0 ? '+' : '-'; const mVal = Math.abs(ansM);
        steps = [{ text: t(lang, TERMS.simplification.intro(expr)), latex: expr }, { text: "Distribute (careful with negatives)", latex: `${a}x + ${a*b} - ${c}x + ${c*d}` }, { text: t(lang, TERMS.simplification.group_terms), latex: `(${a}x - ${c}x) + (${a*b} + ${c*d})` }, { text: "Result", latex: `${color}{${ansK}x ${mSign} ${mVal}}}` }];
    }
    
    return {
        questionId: `simp-l${level}-${seed}`,
        renderData: {
            text_key: "simplify",
            description: descObj,
            latex: expr,
            variables: {}, 
            answerType: 'function_model' 
        },
        serverData: { answer: { k: ansK, m: ansM }, solutionSteps: steps }
    };
  }
}