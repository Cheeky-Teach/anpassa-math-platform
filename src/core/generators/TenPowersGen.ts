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

    // Level 1: Mult/Div by 10, 100, 1000
    private level1_MultDivBig(lang: string): any {
        const isMult = Math.random() > 0.5;
        const base = MathUtils.randomFloat(1.1, 99.9, 1);
        const power = MathUtils.randomChoice([10, 100, 1000]);
        
        let ans, latex;
        
        if (isMult) {
            ans = Math.round(base * power * 100) / 100; // avoid floating point errors
            latex = `${base} \\cdot ${power}`;
        } else {
            // Ensure clean division for simple visual
            const mult = Math.round(base * power * 100) / 100;
            latex = `\\frac{${mult}}{${power}}`;
            ans = base;
        }

        return {
            renderData: { latex, description: lang === 'sv' ? "Beräkna" : "Calculate", answerType: 'text' },
            token: Buffer.from(ans.toString()).toString('base64'),
            clues: [
                { 
                    text: isMult 
                    ? (lang === 'sv' ? "Flytta decimaltecknet till HÖGER." : "Move the decimal point to the RIGHT.") 
                    : (lang === 'sv' ? "Flytta decimaltecknet till VÄNSTER." : "Move the decimal point to the LEFT.") 
                },
                { 
                    text: lang === 'sv' 
                    ? `Antal nollor i ${power} avgör hur många steg.` 
                    : `The number of zeros in ${power} determines how many steps.` 
                }
            ]
        };
    }

    // Level 2: Conceptual (Multiple Choice)
    private level2_Concepts(lang: string): any {
        // Concept: 10^3 = 1000, 10^-2 = 0.01
        const power = MathUtils.randomInt(-3, 4);
        if (power === 0) return this.level2_Concepts(lang); // Skip 0 for now to keep it interesting

        const isPositive = power > 0;
        const latex = `10^{${power}}`;
        
        let correctStr = "";
        if (isPositive) {
            correctStr = "1" + "0".repeat(power);
        } else {
            correctStr = "0." + "0".repeat(Math.abs(power) - 1) + "1";
        }

        // Generate distractors
        const choices = new Set<string>();
        choices.add(correctStr);
        
        while(choices.size < 4) {
            const fakePower = MathUtils.randomInt(-4, 5);
            if (fakePower === 0) continue;
            let fakeStr = "";
            if (fakePower > 0) fakeStr = "1" + "0".repeat(fakePower);
            else fakeStr = "0." + "0".repeat(Math.abs(fakePower) - 1) + "1";
            choices.add(fakeStr);
        }

        return {
            renderData: { 
                latex, 
                description: lang === 'sv' ? "Vad är detta tal?" : "What is this number?", 
                answerType: 'multiple_choice',
                choices: Array.from(choices).sort() 
            },
            token: Buffer.from(correctStr).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Exponenten visar antalet nollor (eller decimalsteg)." : "The exponent shows the number of zeros (or decimal steps)." }
            ]
        };
    }

    // Level 3: Decimal Factors (0.1, 0.01)
    private level3_Decimals(lang: string): any {
        const base = MathUtils.randomInt(5, 500);
        const factor = MathUtils.randomChoice([0.1, 0.01, 0.001]);
        
        // Multiplication by 0.1 is same as div by 10
        const ans = Math.round(base * factor * 10000) / 10000;
        
        return {
            renderData: { 
                latex: `${base} \\cdot ${factor}`, 
                description: lang === 'sv' ? "Beräkna" : "Calculate", 
                answerType: 'text' 
            },
            token: Buffer.from(ans.toString()).toString('base64'),
            clues: [
                { 
                    text: lang === 'sv' 
                    ? `Att multiplicera med ${factor} är samma som att dividera med ${1/factor}.` 
                    : `Multiplying by ${factor} is the same as dividing by ${1/factor}.` 
                },
                { text: lang === 'sv' ? "Flytta decimaltecknet åt VÄNSTER." : "Move the decimal point to the LEFT." }
            ]
        };
    }
}