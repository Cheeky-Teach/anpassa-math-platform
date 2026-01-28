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
        const dir = isMult 
            ? (lang === 'sv' ? "HÖGER" : "RIGHT") 
            : (lang === 'sv' ? "VÄNSTER" : "LEFT");

        if (isMult) {
            ans = num * power;
            latex = `${num} \\cdot ${power}`;
        } else {
            ans = this.fixFloat(num / power);
            latex = `${num} / ${power}`;
        }

        return {
            renderData: { latex, description: lang === 'sv' ? "Beräkna." : "Calculate.", answerType: 'text' },
            token: Buffer.from(ans.toString()).toString('base64'),
            clues: [{ 
                text: lang === 'sv' 
                ? `Flytta kommatecknet ${zeros} ${stepsText} åt ${dir}.` 
                : `Move decimal ${zeros} ${stepsText} ${dir}.`,
                latex: "" 
            }]
        };
    }

    // Level 2: Conceptual Equivalence
    // "Att dela med 0.1 är samma sak som att multiplicera med..."
    private level2_Concepts(lang: string): any {
        // Pairs of [Operation, Value, Equivalent Operation, Equivalent Value]
        const pairs = [
            // Mult X = Div Y
            { op: 'mul', val: 0.1, equivOp: 'div', equivVal: 10 },
            { op: 'mul', val: 0.01, equivOp: 'div', equivVal: 100 },
            { op: 'mul', val: 0.001, equivOp: 'div', equivVal: 1000 },
            { op: 'mul', val: 10, equivOp: 'div', equivVal: 0.1 },
            { op: 'mul', val: 100, equivOp: 'div', equivVal: 0.01 },
            { op: 'mul', val: 1000, equivOp: 'div', equivVal: 0.001 },
            
            // Div X = Mult Y
            { op: 'div', val: 0.1, equivOp: 'mul', equivVal: 10 },
            { op: 'div', val: 0.01, equivOp: 'mul', equivVal: 100 },
            { op: 'div', val: 0.001, equivOp: 'mul', equivVal: 1000 },
            { op: 'div', val: 10, equivOp: 'mul', equivVal: 0.1 },
            { op: 'div', val: 100, equivOp: 'mul', equivVal: 0.01 },
            { op: 'div', val: 1000, equivOp: 'mul', equivVal: 0.001 }
        ];

        const s = MathUtils.randomChoice(pairs);
        
        // Construct the sentence
        let description = "";
        
        if (lang === 'sv') {
            const opStr = s.op === 'mul' ? "multiplicera med" : "dela med";
            const targetOpStr = s.equivOp === 'mul' ? "multiplicera med..." : "dela med...";
            description = `Att ${opStr} ${s.val} är samma sak som att ${targetOpStr}`;
        } else {
            const opStr = s.op === 'mul' ? "multiplying by" : "dividing by";
            const targetOpStr = s.equivOp === 'mul' ? "multiplying by..." : "dividing by...";
            description = `To ${opStr} ${s.val} is the same as ${targetOpStr}`;
        }

        // Fixed set of answer choices
        const choices = ["10", "100", "1000", "0.1", "0.01", "0.001"];

        return {
            renderData: { 
                latex: "", 
                description, 
                answerType: 'multiple_choice', 
                choices 
            },
            token: Buffer.from(s.equivVal.toString()).toString('base64'),
            clues: [
                { 
                    text: lang === 'sv' 
                    ? "Tänk på bråkformen (inversen). Division är motsatsen till multiplikation." 
                    : "Think of the inverse. Division is the opposite of multiplication." 
                }
            ]
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
        else steps = factor.toString().length - 2; // 0.1 -> 1, 0.01 -> 2

        if (isMult) {
            ans = this.fixFloat(num * factor);
            latex = `${num} \\cdot ${factor}`;
            const isRight = factor >= 10;
            direction = isRight ? (lang === 'sv' ? "HÖGER" : "RIGHT") : (lang === 'sv' ? "VÄNSTER" : "LEFT");
        } else {
            ans = this.fixFloat(num / factor);
            latex = `${num} / ${factor}`;
            const isRight = factor < 1;
            direction = isRight ? (lang === 'sv' ? "HÖGER" : "RIGHT") : (lang === 'sv' ? "VÄNSTER" : "LEFT");
        }

        const clueText = lang === 'sv' 
            ? `Flytta kommatecknet ${steps} steg åt ${direction}.` 
            : `Move decimal ${steps} steps ${direction}.`;

        return {
            renderData: { latex, description: lang === 'sv' ? "Beräkna." : "Calculate.", answerType: 'text' },
            token: Buffer.from(ans.toString()).toString('base64'),
            clues: [{ text: clueText, latex: `\\mathbf{${ans}}` }]
        };
    }
}