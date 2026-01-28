import { MathUtils } from '../utils/MathUtils.js';

export class TenPowersGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_MultDivBig(lang);
            case 2: return this.level2_Concepts(lang);
            case 3: return this.level3_MixedFactors(lang);
            default: return this.level1_MultDivBig(lang);
        }
    }

    private fixFloat(n: number) { return parseFloat(n.toFixed(6)); }

    // Level 1: Mult/Div by 10, 100, 1000
    private level1_MultDivBig(lang: string): any {
        const power = MathUtils.randomChoice([10, 100, 1000]);
        const isMult = MathUtils.randomInt(0, 1) === 1;
        const num = MathUtils.randomInt(2, 900);
        let ans = 0, latex = "";
        
        const zeros = power.toString().length - 1;
        const stepsText = lang === 'sv' ? "steg" : "steps";

        if (isMult) {
            ans = num * power;
            latex = `${num} \\cdot ${power}`;
            const dir = lang === 'sv' ? "HÖGER" : "RIGHT";
            return {
                renderData: { latex, description: lang === 'sv' ? "Beräkna." : "Calculate.", answerType: 'text' },
                token: Buffer.from(ans.toString()).toString('base64'),
                serverData: { answer: ans, solutionSteps: [{ text: lang === 'sv' ? `Flytta kommatecknet ${zeros} ${stepsText} åt ${dir} (lägg till nollor).` : `Move decimal ${zeros} ${stepsText} ${dir} (add zeros).`, latex: "" }] }
            };
        } else {
            ans = this.fixFloat(num / power);
            latex = `${num} / ${power}`;
            const dir = lang === 'sv' ? "VÄNSTER" : "LEFT";
            return {
                renderData: { latex, description: lang === 'sv' ? "Beräkna." : "Calculate.", answerType: 'text' },
                token: Buffer.from(ans.toString()).toString('base64'),
                serverData: { answer: ans, solutionSteps: [{ text: lang === 'sv' ? `Flytta kommatecknet ${zeros} ${stepsText} åt ${dir}.` : `Move decimal ${zeros} ${stepsText} ${dir}.`, latex: "" }] }
            };
        }
    }

    // Level 2: Conceptual Equivalence
    private level2_Concepts(lang: string): any {
        const pairs = [
            { op: 'mul', val: 10, equivOp: 'div', equivVal: 0.1 },
            { op: 'mul', val: 0.1, equivOp: 'div', equivVal: 10 },
            { op: 'div', val: 10, equivOp: 'mul', equivVal: 0.1 },
            { op: 'div', val: 0.1, equivOp: 'mul', equivVal: 10 }
        ];
        const s = MathUtils.randomChoice(pairs);
        
        const opStr = s.op === 'mul' ? '\\cdot' : '/';
        const targetOpStr = s.equivOp === 'div' ? '/' : '\\cdot';
        
        const desc = lang === 'sv' 
            ? `Att räkna $x ${opStr} ${s.val}$ är samma sak som $x ${targetOpStr} ...$`
            : `Calculating $x ${opStr} ${s.val}$ is the same as $x ${targetOpStr} ...$`;

        return {
            renderData: { description: desc, latex: "", answerType: 'multiple_choice', choices: ["10", "100", "0.1", "0.01"] },
            token: Buffer.from(s.equivVal.toString()).toString('base64'),
            serverData: { answer: s.equivVal.toString(), solutionSteps: [{ text: lang === 'sv' ? "Multiplikation och division är motsatser (inverser)." : "Multiplication and division are inverses.", latex: "" }] }
        };
    }

    // Level 3: Mixed Factors (0.1...1000)
    private level3_MixedFactors(lang: string): any {
        const factor = MathUtils.randomChoice([0.1, 0.01, 0.001, 10, 100, 1000]);
        const isMult = MathUtils.randomInt(0, 1) === 1;
        const num = MathUtils.randomFloat(2, 50, 1);
        
        let ans = 0, latex = "";
        let direction = "";
        let steps = 0;
        
        // Count decimal shift
        if (factor >= 10) steps = factor.toString().length - 1;
        else steps = factor.toString().length - 2;

        if (isMult) {
            ans = this.fixFloat(num * factor);
            latex = `${num} \\cdot ${factor}`;
            // Rule: Mult by >1 = Right, Mult by <1 = Left
            const isRight = factor >= 10;
            direction = isRight ? (lang === 'sv' ? "HÖGER" : "RIGHT") : (lang === 'sv' ? "VÄNSTER" : "LEFT");
        } else {
            ans = this.fixFloat(num / factor);
            latex = `${num} / ${factor}`;
            // Rule: Div by >1 = Left, Div by <1 = Right
            const isRight = factor < 1;
            direction = isRight ? (lang === 'sv' ? "HÖGER" : "RIGHT") : (lang === 'sv' ? "VÄNSTER" : "LEFT");
        }

        const clue = lang === 'sv' 
            ? `Flytta kommatecknet ${steps} steg åt ${direction}.` 
            : `Move decimal ${steps} steps ${direction}.`;

        return {
            renderData: { latex, description: lang === 'sv' ? "Beräkna." : "Calculate.", answerType: 'text' },
            token: Buffer.from(ans.toString()).toString('base64'),
            serverData: { answer: ans, solutionSteps: [{ text: clue, latex: `\\mathbf{${ans}}` }] }
        };
    }
}