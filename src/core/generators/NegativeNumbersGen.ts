import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { TERMS, t, Language } from "../utils/i18n";

export class NegativeNumbersGen {
    public static generate(level: number, seed: string, lang: Language = 'sv', multiplier: number = 1): GeneratedQuestion {
        const rng = new Random(seed);
        const formatColor = (val: string | number) => `\\textcolor{#D35400}{\\mathbf{${val}}}`;

        let mode = level;
        if (level === 5) mode = rng.intBetween(1, 4);

        let steps: Clue[] = [];
        let answer: number = 0;
        let latex = "";
        let description = { sv: "Beräkna.", en: "Calculate." };

        const p = (n: number) => n < 0 ? `(${n})` : `${n}`;

        // --- LEVELS 1 & 2: Add/Sub ---
        if (mode === 1 || mode === 2) {
            const range = mode === 1 ? 10 : 50;
            const min = mode === 1 ? -10 : -20;
            const numCount = mode === 1 ? rng.intBetween(2, 3) : rng.intBetween(3, 4);
            
            let nums: number[] = [];
            let ops: string[] = [];

            nums.push(rng.intBetween(min, range));
            
            for(let i=1; i<numCount; i++) {
                nums.push(rng.intBetween(min, range));
                ops.push(rng.pick(['+', '-']));
            }

            latex = `${nums[0]}`;
            for(let i=0; i<ops.length; i++) {
                latex += ` ${ops[i]} ${p(nums[i+1])}`;
            }
            latex += " =";

            let runningVal = nums[0];
            
            for(let i=0; i<ops.length; i++) {
                const nextNum = nums[i+1];
                const op = ops[i];
                let stepExpl = "";
                let stepLatex = "";

                if (op === '+') {
                    if (nextNum < 0) {
                        stepExpl = "add_neg";
                        stepLatex = `${runningVal} + (${nextNum}) = ${runningVal} - ${Math.abs(nextNum)}`;
                        runningVal += nextNum;
                    } else {
                        stepExpl = "simple_calc";
                        stepLatex = `${runningVal} + ${nextNum}`;
                        runningVal += nextNum;
                    }
                } else {
                    if (nextNum < 0) {
                        stepExpl = "sub_neg";
                        stepLatex = `${runningVal} - (${nextNum}) = ${runningVal} + ${Math.abs(nextNum)}`;
                        runningVal -= nextNum;
                    } else {
                        stepExpl = "simple_calc";
                        stepLatex = `${runningVal} - ${nextNum}`;
                        runningVal -= nextNum;
                    }
                }

                if (stepExpl) {
                    // Safe access to TERMS
                    const explText = (TERMS.neg_signs as any)[stepExpl] 
                        ? t(lang, (TERMS.neg_signs as any)[stepExpl]) 
                        : "Calculate:";
                    steps.push({ text: explText, latex: stepLatex });
                }
                
                steps.push({ text: t(lang, TERMS.neg_signs.step_calc), latex: `= ${formatColor(runningVal)}` });
            }
            
            answer = runningVal;
        }

        // --- LEVEL 3: Multiplication ---
        else if (mode === 3) {
            const count = rng.intBetween(2, 3);
            const nums: number[] = [];
            for(let i=0; i<count; i++) nums.push(rng.intBetween(-10, 10));
            nums.forEach((n, i) => { if(n===0) nums[i] = 2; });

            latex = nums.map(n => p(n)).join(' \\cdot ') + " =";
            
            let runningVal = nums[0];
            
            for(let i=1; i<nums.length; i++) {
                const prev = runningVal;
                const next = nums[i];
                const isPrevNeg = prev < 0;
                const isNextNeg = next < 0;
                
                let explKey = "";
                if (isPrevNeg && isNextNeg) explKey = "mul_neg_neg";
                else if (isPrevNeg !== isNextNeg) explKey = "mul_pos_neg";
                else explKey = "simple_calc";
                
                runningVal *= next;
                
                const explText = (TERMS.neg_signs as any)[explKey] 
                    ? t(lang, (TERMS.neg_signs as any)[explKey]) 
                    : "";

                steps.push({ 
                    text: explText, 
                    latex: `${p(prev)} \\cdot ${p(next)} = ${formatColor(runningVal)}` 
                });
            }
            answer = runningVal;
        }

        // --- LEVEL 4: Division ---
        else { 
            let b = 0;
            while(b === 0) b = rng.intBetween(-10, 10);
            
            const maxRes = Math.floor(100 / Math.abs(b));
            let res = 0;
            while(res === 0) res = rng.intBetween(-maxRes, maxRes);
            
            const a = res * b;
            answer = res;
            
            latex = `\\frac{${a}}{${b}} =`;

            const sameSign = (a > 0 && b > 0) || (a < 0 && b < 0);
            const explKey = sameSign ? "div_sign_same" : "div_sign_diff";
            
            steps.push({
                text: t(lang, (TERMS.neg_signs as any)[explKey]),
                latex: `${a} / ${b} = ${formatColor(answer)}`
            });
        }

        return {
            questionId: `neg-l${level}-${seed}`,
            renderData: {
                text_key: "arithmetic", 
                description: description,
                latex: latex,
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