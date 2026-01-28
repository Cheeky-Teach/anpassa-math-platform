import { MathUtils } from '../utils/MathUtils.js';

export class TenPowersGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_MultDivBig(lang);
            case 2: return this.level2_Concepts(lang);
            case 3: return this.level3_Decimals(lang);
            default: return this.level1_MultDivBig(lang);
        }
    }

    private fixFloat(n: number) { return parseFloat(n.toFixed(6)); }

    // Level 1: Mult/Div by 10, 100, 1000
    private level1_MultDivBig(lang: string): any {
        const power = MathUtils.randomChoice([10, 100, 1000]);
        const isMult = MathUtils.randomInt(0, 1) === 1;
        
        // Generate number (integer or decimal)
        const isDecimal = MathUtils.randomInt(0, 1) === 1;
        let num = 0;
        if (isDecimal) {
            const base = MathUtils.randomInt(1, 9999);
            const div = MathUtils.randomChoice([10, 100, 1000]);
            num = base / div;
        } else {
            num = MathUtils.randomInt(2, 900);
        }

        let ans = 0;
        let latex = "";
        const zeros = power.toString().length - 1;

        if (isMult) {
            ans = this.fixFloat(num * power);
            latex = `${num} \\cdot ${power}`;
            
            const dir = lang === 'sv' ? "HÖGER" : "RIGHT";
            const stepsText = lang === 'sv' ? "steg" : "steps";
            
            return {
                renderData: { latex, description: lang === 'sv' ? "Beräkna." : "Calculate.", answerType: 'text' },
                token: Buffer.from(ans.toString()).toString('base64'),
                clues: [{ 
                    text: lang === 'sv' 
                    ? `Vid multiplikation med ${power}, flytta kommatecknet ${zeros} ${stepsText} åt ${dir}.` 
                    : `When multiplying by ${power}, move the decimal point ${zeros} ${stepsText} to the ${dir}.` 
                }]
            };
        } else {
            // Division
            // Legacy uses horizontal division visual here
            ans = this.fixFloat(num / power);
            latex = `${num} / ${power}`;

            const dir = lang === 'sv' ? "VÄNSTER" : "LEFT";
            const stepsText = lang === 'sv' ? "steg" : "steps";

            return {
                renderData: { latex, description: lang === 'sv' ? "Beräkna." : "Calculate.", answerType: 'text' },
                token: Buffer.from(ans.toString()).toString('base64'),
                clues: [{ 
                    text: lang === 'sv' 
                    ? `Vid division med ${power}, flytta kommatecknet ${zeros} ${stepsText} åt ${dir}.` 
                    : `When dividing by ${power}, move the decimal point ${zeros} ${stepsText} to the ${dir}.` 
                }]
            };
        }
    }

    // Level 2: Conceptual Equivalence (Legacy: Match operations)
    private level2_Concepts(lang: string): any {
        const pairs = [
            { op: 'mul', val: 10, equivOp: 'div', equivVal: 0.1 },
            { op: 'mul', val: 100, equivOp: 'div', equivVal: 0.01 },
            { op: 'mul', val: 1000, equivOp: 'div', equivVal: 0.001 },
            { op: 'mul', val: 0.1, equivOp: 'div', equivVal: 10 },
            { op: 'mul', val: 0.01, equivOp: 'div', equivVal: 100 },
            
            { op: 'div', val: 10, equivOp: 'mul', equivVal: 0.1 },
            { op: 'div', val: 100, equivOp: 'mul', equivVal: 0.01 },
            { op: 'div', val: 0.1, equivOp: 'mul', equivVal: 10 },
            { op: 'div', val: 0.01, equivOp: 'mul', equivVal: 100 }
        ];

        const s = MathUtils.randomChoice(pairs);
        
        const opStr = (op: string) => lang === 'sv' 
            ? (op === 'mul' ? "Att multiplicera med" : "Att dividera med") 
            : (op === 'mul' ? "Multiplying by" : "Dividing by");
            
        const targetOpStr = (op: string) => lang === 'sv'
            ? (op === 'div' ? "dividera med..." : "multiplicera med...")
            : (op === 'div' ? "dividing by..." : "multiplying by...");

        const description = lang === 'sv'
            ? `${opStr(s.op)} ${s.val} är samma sak som att ${targetOpStr(s.equivOp)}`
            : `${opStr(s.op)} ${s.val} is the same as ${targetOpStr(s.equivOp)}`;

        // Valid choices for the answer
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
                { text: lang === 'sv' ? "Tänk på bråkformen: Att dividera med 10 är samma som att multiplicera med 1/10 (0.1)." : "Think fractions: Dividing by 10 is the same as multiplying by 1/10 (0.1)." }
            ]
        };
    }

    // Level 3: Decimal Factors (0.1, 0.01)
    private level3_Decimals(lang: string): any {
        const base = MathUtils.randomInt(5, 500);
        const factor = MathUtils.randomChoice([0.1, 0.01, 0.001]);
        const isMult = MathUtils.randomInt(0, 1) === 1;
        let ans = 0;
        let latex = "";

        // Determine number of decimal steps (0.1->1, 0.01->2)
        const stepsCount = factor.toString().length - 2; 

        if (isMult) {
            // Mult by 0.1 = Left Shift
            ans = this.fixFloat(base * factor);
            latex = `${base} \\cdot ${factor}`;
            return {
                renderData: { latex, description: lang === 'sv' ? "Beräkna." : "Calculate.", answerType: 'text' },
                token: Buffer.from(ans.toString()).toString('base64'),
                clues: [
                    { text: lang === 'sv' ? `Multiplikation med ${factor} är samma som division med ${1/factor}.` : `Multiplying by ${factor} is like dividing by ${1/factor}.` },
                    { text: lang === 'sv' ? `Flytta kommatecknet ${stepsCount} steg åt VÄNSTER.` : `Move decimal ${stepsCount} steps LEFT.` }
                ]
            };
        } else {
            // Div by 0.1 = Right Shift
            ans = this.fixFloat(base / factor);
            latex = `${base} / ${factor}`;
            return {
                renderData: { latex, description: lang === 'sv' ? "Beräkna." : "Calculate.", answerType: 'text' },
                token: Buffer.from(ans.toString()).toString('base64'),
                clues: [
                    { text: lang === 'sv' ? `Division med ${factor} är samma som multiplikation med ${1/factor}.` : `Dividing by ${factor} is like multiplying by ${1/factor}.` },
                    { text: lang === 'sv' ? `Flytta kommatecknet ${stepsCount} steg åt HÖGER.` : `Move decimal ${stepsCount} steps RIGHT.` }
                ]
            };
        }
    }
}