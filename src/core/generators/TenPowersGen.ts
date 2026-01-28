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
                ? `Flytta kommatecknet ${zeros} ${stepsText} åt ${dir} (lägg till nollor).` 
                : `Move decimal ${zeros} ${stepsText} ${dir} (add zeros).`,
                latex: "" 
            }]
        };
    }

    // Level 2: Conceptual Equivalence
    private level2_Concepts(lang: string): any {
        const scenarios = [
            // --- DECIMALS (0.1, 0.01, 0.001) ---
            { 
                op: 'mul', val: 0.1, equivOp: 'div', equivVal: 10,
                clueSv: "Att multiplicera med 0.1 är som att ta en tiondel av kakan. Det blir mindre, precis som när man delar med 10.",
                clueEn: "Multiplying by 0.1 is like taking one tenth of a cake. It gets smaller, just like dividing by 10."
            },
            { 
                op: 'div', val: 0.1, equivOp: 'mul', equivVal: 10,
                clueSv: "Att dela med 0.1 betyder: 'Hur många små 0.1-bitar får plats i 1?' Det får plats 10 stycken. Svaret blir stort.",
                clueEn: "Dividing by 0.1 means: 'How many small 0.1 pieces fit into 1?' It fits 10 times. The answer becomes large."
            },
            { 
                op: 'mul', val: 0.01, equivOp: 'div', equivVal: 100,
                clueSv: "Att multiplicera med 0.01 är som att ta en hundradel. Det är samma som att dela på 100.",
                clueEn: "Multiplying by 0.01 is like taking one hundredth. That's the same as dividing by 100."
            },
            { 
                op: 'div', val: 0.01, equivOp: 'mul', equivVal: 100,
                clueSv: "Att dela med en hundradel (0.01) gör talet mycket större. Hur många hundradelar går det på en hel? Jo, 100.",
                clueEn: "Dividing by one hundredth (0.01) makes the number much bigger. How many hundredths fit in a whole? 100."
            },
            { 
                op: 'mul', val: 0.001, equivOp: 'div', equivVal: 1000,
                clueSv: "En tusendel är väldigt litet. Att multiplicera med 0.001 är som att dela med 1000.",
                clueEn: "A thousandth is very small. Multiplying by 0.001 is like dividing by 1000."
            },
            { 
                op: 'div', val: 0.001, equivOp: 'mul', equivVal: 1000,
                clueSv: "Att dela med en tusendel betyder att vi ser hur många pyttesmå bitar som får plats. Det blir 1000 gånger fler.",
                clueEn: "Dividing by a thousandth means seeing how many tiny pieces fit. It becomes 1000 times more."
            },
            // --- INTEGERS (10, 100, 1000) ---
            { 
                op: 'mul', val: 10, equivOp: 'div', equivVal: 0.1,
                clueSv: "Att göra något 10 gånger större är samma som att se hur många tiondelar som ryms i det (division med 0.1).",
                clueEn: "Making something 10 times bigger is like seeing how many tenths fit inside it (dividing by 0.1)."
            },
            { 
                op: 'div', val: 10, equivOp: 'mul', equivVal: 0.1,
                clueSv: "Att dela upp i 10 högar är samma sak som att ta en tiondel (0.1) av högen.",
                clueEn: "Splitting into 10 piles is the same as taking one tenth (0.1) of the pile."
            },
            { 
                op: 'mul', val: 100, equivOp: 'div', equivVal: 0.01,
                clueSv: "Gånger 100 är en stor ökning. Det är matematiskt samma som att dela med det lilla talet 0.01.",
                clueEn: "Times 100 is a big increase. Mathematically, it's the same as dividing by the tiny number 0.01."
            },
            { 
                op: 'div', val: 100, equivOp: 'mul', equivVal: 0.01,
                clueSv: "Att dela med 100 är samma som att ta en hundradel (0.01).",
                clueEn: "Dividing by 100 is the same as taking one hundredth (0.01)."
            },
             { 
                op: 'mul', val: 1000, equivOp: 'div', equivVal: 0.001,
                clueSv: "Gånger 1000 är samma som att dela med en tusendel.",
                clueEn: "Times 1000 is the same as dividing by a thousandth."
            },
            { 
                op: 'div', val: 1000, equivOp: 'mul', equivVal: 0.001,
                clueSv: "Att dela med 1000 är samma som att ta en tusendel (0.001).",
                clueEn: "Dividing by 1000 is the same as taking one thousandth (0.001)."
            }
        ];

        const s = MathUtils.randomChoice(scenarios);
        
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
        const clueText = lang === 'sv' ? (s.clueSv || "") : (s.clueEn || "");

        return {
            renderData: { 
                latex: "", 
                description, 
                answerType: 'multiple_choice', 
                choices 
            },
            token: Buffer.from(s.equivVal.toString()).toString('base64'),
            clues: [
                { text: clueText, latex: "" }
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
        else steps = factor.toString().length - 2;

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