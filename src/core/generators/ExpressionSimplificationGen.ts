import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { TERMS, t, Language } from "../utils/i18n";

export class ExpressionSimplificationGen {
  public static generate(level: number, seed: string, lang: Language = 'sv', multiplier: number = 1): GeneratedQuestion {
    const rng = new Random(seed);
    const color = (text: string | number) => `\\mathbf{\\textcolor{#D35400}{${text}}}`;

    let mode = level;
    if (level >= 6) mode = rng.intBetween(3, 5);

    let expr = "", ansK = 0, ansM = 0, steps: Clue[] = [];
    let descObj = { sv: "Förenkla uttrycket.", en: "Simplify the expression." };

    if (mode === 1) {
        const a = rng.intBetween(2, 9), b = rng.intBetween(1, 10), c = rng.intBetween(2, 9);
        expr = `${a}x + ${b} + ${c}x`; 
        ansK = a + c; ansM = b;
        steps = [
            { text: t(lang, TERMS.simplification.group_terms), latex: `(${a}x + ${c}x) + ${b}` },
            { text: "Result", latex: `${color(`${ansK}x + ${ansM}`)}` }
        ];
    } 
    else if (mode === 2) {
        const a = rng.intBetween(2, 6), b = rng.intBetween(1, 8);
        expr = `${a}(x + ${b})`; 
        ansK = a; ansM = a * b;
        steps = [
            { text: "Distribute", latex: `${a} \\cdot x + ${a} \\cdot ${b}` },
            { text: "Result", latex: `${color(`${ansK}x + ${ansM}`)}` }
        ];
    }
    else if (mode === 3) {
        const a = rng.intBetween(2, 5), b = rng.intBetween(1, 5), c = rng.intBetween(2, 8);
        expr = `${a}(x + ${b}) + ${c}x`; 
        const distM = a * b;
        ansK = a + c; ansM = distM;
        steps = [
            { text: t(lang, TERMS.algebra.distribute(a)), latex: `${a}x + ${distM} + ${c}x` }, 
            { text: t(lang, TERMS.simplification.group_terms), latex: `(${a}x + ${c}x) + ${distM}` }, 
            { text: "Result", latex: `${color(`${ansK}x + ${ansM}`)}` }
        ];
    }
    else {
        const a = rng.intBetween(2, 5), b = rng.intBetween(1, 5), c = rng.intBetween(2, 4), d = rng.intBetween(1, 5);
        expr = `${a}(x + ${b}) - ${c}(x - ${d})`;
        const distM1 = a * b;
        const distM2 = c * d; 
        ansK = a - c; ansM = distM1 + distM2; 
        steps = [
            { text: t(lang, TERMS.simplification.intro(expr)), latex: expr }, 
            { text: "Distribute (careful with negatives)", latex: `${a}x + ${distM1} - ${c}x + ${distM2}` }, 
            { text: t(lang, TERMS.simplification.group_terms), latex: `(${a}x - ${c}x) + (${distM1} + ${distM2})` }, 
            { text: "Result", latex: `${color(`${ansK}x + ${ansM}`)}` }
        ];
    }

    const mSign = ansM >= 0 ? '+' : '-';
    const mVal = Math.abs(ansM);
    const answerStr = ansM === 0 ? `${ansK}x` : `${ansK}x${mSign}${mVal}`;

    return {
        questionId: `simp-l${level}-${seed}`,
        renderData: { text_key: "simplify", description: descObj, latex: expr, answerType: 'algebraic', variables: {} },
        serverData: { answer: answerStr, solutionSteps: steps }
    };
  }
}