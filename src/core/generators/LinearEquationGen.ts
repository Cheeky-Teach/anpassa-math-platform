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
    let eq = "", answer = 0, steps: Clue[] = [];

    // L1-L4 Logic (same as before, condensed for brevity)
    if (mode === 1) {
        const type = rng.intBetween(1, 4); 
        if (type === 1) { const x=rng.intBetween(s(2),s(12)), k=rng.intBetween(s(2),s(9)); eq=`${k}x = ${x*k}`; answer=x; steps=[{ text: t(lang, TERMS.algebra.divide(k)), latex: `x = \\frac{${x*k}}{${k}} = ${color}{${x}}}` }]; }
        else if (type === 2) { const res=rng.intBetween(s(2),s(10)), a=rng.intBetween(s(2),s(10)); eq=`\\frac{x}{${a}} = ${res}`; answer=res*a; steps=[{ text: t(lang, TERMS.algebra.multiply(a)), latex: `x = ${res} \\cdot ${a} = ${color}{${answer}}}` }]; }
        else if (type === 3) { const x=rng.intBetween(s(2),s(20)), a=rng.intBetween(s(1),s(10)); eq=`x + ${a} = ${x+a}`; answer=x; steps=[{ text: t(lang, TERMS.algebra.subtract(a)), latex: `x = ${x+a} - ${a} = ${color}{${x}}}` }]; }
        else { const x=rng.intBetween(s(2),s(20)), a=rng.intBetween(s(1),s(10)); eq=`x - ${a} = ${x-a}`; answer=x; steps=[{ text: t(lang, TERMS.algebra.add(a)), latex: `x = ${x-a} + ${a} = ${color}{${x}}}` }]; }
    } else if (mode === 2) {
        const isDivision = rng.intBetween(0, 1) === 1;
        if (!isDivision) {
            const x=rng.intBetween(s(2),s(12)), k=rng.intBetween(s(2),s(9)), b=rng.intBetween(s(1),s(20)), isSub=rng.intBetween(0,1)===1;
            const res = isSub ? (k*x)-b : (k*x)+b; answer=x; eq = isSub ? `${k}x - ${b} = ${res}` : `${k}x + ${b} = ${res}`;
            steps=[{ text: t(lang, TERMS.algebra.intro(eq)), latex: eq }, { text: isSub ? t(lang, TERMS.algebra.add(b)) : t(lang, TERMS.algebra.subtract(b)), latex: `${k}x = ${res} ${isSub?'+':'-'} ${b} \\implies ${k}x = ${k*x}` }, { text: t(lang, TERMS.algebra.divide(k)), latex: `x = ${color}{${x}}}` }];
        } else {
            const k=rng.intBetween(s(2),s(9)), inter=rng.intBetween(s(2),s(12)), x=inter*k, b=rng.intBetween(s(1),s(20)), isSub=rng.intBetween(0,1)===1;
            const res = isSub ? inter-b : inter+b; answer=x; eq = isSub ? `\\frac{x}{${k}} - ${b} = ${res}` : `\\frac{x}{${k}} + ${b} = ${res}`;
            steps=[{ text: t(lang, TERMS.algebra.intro(eq)), latex: eq }, { text: isSub ? t(lang, TERMS.algebra.add(b)) : t(lang, TERMS.algebra.subtract(b)), latex: `\\frac{x}{${k}} = ${res} ${isSub?'+':'-'} ${b} \\implies \\frac{x}{${k}} = ${inter}` }, { text: t(lang, TERMS.algebra.multiply(k)), latex: `x = ${inter} \\cdot ${k} = ${color}{${x}}}` }];
        }
    } else if (mode === 3) {
        answer = rng.intBetween(s(2), s(10)); const c = rng.intBetween(s(2), s(5)), diff = rng.intBetween(s(2), s(6)), a = c + diff, b = rng.intBetween(s(1), s(10)), d = (a * answer) + b - (c * answer);
        eq = `${a}x + ${b} = ${c}x + ${d}`;
        steps = [{ text: t(lang, TERMS.algebra.intro(eq)), latex: eq }, { text: t(lang, TERMS.algebra.sub_var(`${c}x`)), latex: `${a}x ${color}{- ${c}x}} + ${b} = ${d} \\implies ${diff}x + ${b} = ${d}` }, { text: t(lang, TERMS.algebra.subtract(b)), latex: `${diff}x = ${d} - ${b} = ${d-b}` }, { text: t(lang, TERMS.algebra.divide(diff)), latex: `x = ${color}{${answer}}}` }];
    } else {
        const x = rng.intBetween(s(2), s(10)), a = rng.intBetween(s(2), s(5)), b = rng.intBetween(s(1), s(10)), res = a * (x + b);
        eq = `${a}(x + ${b}) = ${res}`; answer = x;
        steps = [{ text: t(lang, TERMS.algebra.intro(eq)), latex: eq }, { text: t(lang, TERMS.algebra.distribute(a)), latex: `${color}{${a}x + ${a*b}}} = ${res}` }, { text: t(lang, TERMS.algebra.subtract(a*b)), latex: `${a}x = ${res - (a*b)}` }, { text: t(lang, TERMS.algebra.divide(a)), latex: `x = ${color}{${x}}}` }];
    }

    return {
        questionId: `eq-l${level}-${seed}`,
        renderData: {
            text_key: "solve",
            description: { sv: "Lös ekvationen.", en: "Solve the equation." },
            latex: eq,
            variables: {}, 
            answerType: 'numeric'
        },
        serverData: { answer: answer, solutionSteps: steps }
    };
  }
}