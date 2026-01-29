import { MathUtils } from '../utils/MathUtils.js';

export class PercentGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_Visuals(lang);
            case 2: return this.level2_Benchmarks(lang);
            case 3: return this.level3_MultiplesOfTen(lang);
            case 4: return this.level4_GeneralCalculation(lang);
            case 5: return this.level5_FindWhole(lang);
            case 6: return this.level6_RealWorldChange(lang);
            default: return this.level1_Visuals(lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    // Level 1: Visuals (The 100-Grid)
    private level1_Visuals(lang: string): any {
        // Concept: 100-grid visualization
        const colored = MathUtils.randomChoice([1, 5, 10, 20, 25, 50, 75, 99]);
        
        return {
            renderData: {
                description: lang === 'sv' 
                    ? "Hur många procent av rutan är färgad?" 
                    : "What percent of the grid is colored?",
                answerType: 'numeric',
                suffix: '%',
                geometry: { 
                    type: 'percent_grid', 
                    total: 100, 
                    colored: colored 
                }
            },
            token: this.toBase64(colored.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? "Rutan har 100 delar." : "The grid has 100 parts.",
                    latex: `\\frac{${colored}}{100} = ${colored}\\%`
                }
            ]
        };
    }

    // Level 2: Benchmarks (Mental Math)
    private level2_Benchmarks(lang: string): any {
        const pct = MathUtils.randomChoice([10, 25, 50, 100]);
        const base = MathUtils.randomInt(2, 40) * (pct === 25 ? 4 : 10); 
        
        const ans = (base * pct) / 100;
        
        let clueText = "";
        if (pct === 50) clueText = lang === 'sv' ? "50% är hälften. Dela med 2." : "50% is half. Divide by 2.";
        if (pct === 25) clueText = lang === 'sv' ? "25% är en fjärdedel. Dela med 4." : "25% is a quarter. Divide by 4.";
        if (pct === 10) clueText = lang === 'sv' ? "10% är en tiondel. Flytta kommatecknet." : "10% is a tenth. Move the decimal.";
        if (pct === 100) clueText = lang === 'sv' ? "100% är allt." : "100% is everything.";

        return {
            renderData: {
                description: lang === 'sv' ? `Beräkna ${pct}% av ${base}.` : `Calculate ${pct}% of ${base}.`,
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()),
            clues: [{ text: clueText, latex: `${base} / ${100/pct} = ${ans}` }]
        };
    }

    // Level 3: Building Blocks (Multiples of 10)
    private level3_MultiplesOfTen(lang: string): any {
        const pct = MathUtils.randomChoice([20, 30, 40, 60, 70, 80, 90]);
        const base = MathUtils.randomInt(2, 20) * 10;
        
        const oneTenth = base / 10;
        const ans = (base * pct) / 100;

        return {
            renderData: {
                description: lang === 'sv' ? `Beräkna ${pct}% av ${base}.` : `Calculate ${pct}% of ${base}.`,
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? "Räkna ut 10% först." : "Find 10% first.", 
                    latex: `10\\% = ${oneTenth}` 
                },
                { 
                    text: lang === 'sv' ? `Multiplicera sedan med ${pct/10}.` : `Then multiply by ${pct/10}.`, 
                    latex: `${oneTenth} \\cdot ${pct/10} = ${ans}` 
                }
            ]
        };
    }

    // Level 4: General Calculation (Decimal Method)
    private level4_GeneralCalculation(lang: string): any {
        const pct = MathUtils.randomInt(1, 19) * 5; // 5, 10, 15... 95
        const base = MathUtils.randomInt(2, 20) * 4; 
        
        const ans = (base * pct) / 100;
        // Fix float precision
        const fixedAns = Math.round(ans * 100) / 100;

        return {
            renderData: {
                description: lang === 'sv' ? `Beräkna ${pct}% av ${base}.` : `Calculate ${pct}% of ${base}.`,
                answerType: 'numeric'
            },
            token: this.toBase64(fixedAns.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? "Gör om procent till decimaltal." : "Convert percent to decimal.", 
                    latex: `${pct}\\% = ${pct/100}` 
                },
                { 
                    text: lang === 'sv' ? "Multiplicera:" : "Multiply:", 
                    latex: `${pct/100} \\cdot ${base} = ${fixedAns}` 
                }
            ]
        };
    }

    // Level 5: Find the Whole
    private level5_FindWhole(lang: string): any {
        const pct = MathUtils.randomChoice([10, 20, 25, 50]);
        const part = MathUtils.randomInt(2, 20);
        const whole = (part * 100) / pct;

        return {
            renderData: {
                description: lang === 'sv' 
                    ? `${pct}% av ett tal är ${part}. Vilket är talet?` 
                    : `${pct}% of a number is ${part}. What is the number?`,
                answerType: 'numeric'
            },
            token: this.toBase64(whole.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? `Om ${pct}% är ${part}, vad är 1%?` : `If ${pct}% is ${part}, what is 1%?`,
                    latex: `1\\% = ${part} / ${pct} = ${part/pct}` 
                },
                { 
                    text: lang === 'sv' ? "100% är 100 gånger större." : "100% is 100 times larger.", 
                    latex: `${part/pct} \\cdot 100 = ${whole}` 
                }
            ]
        };
    }

    // Level 6: Real World Change (10+ Scenarios)
    private level6_RealWorldChange(lang: string): any {
        // Scenarios: type, isIncrease, text templates
        const scenarios = [
            { id: 'salary', inc: true, sv: (b,p) => `Din lön är ${b} kr. Den höjs med ${p}%. Vad blir din nya lön?`, en: (b,p) => `Your salary is ${b} kr. It raises by ${p}%. What is your new salary?` },
            { id: 'sale', inc: false, sv: (b,p) => `En jacka kostar ${b} kr. Det är ${p}% rea. Vad kostar jackan nu?`, en: (b,p) => `A jacket costs ${b} kr. It is ${p}% off. What is the price now?` },
            { id: 'tax', inc: false, sv: (b,p) => `Du vinner ${b} kr. Skatten är ${p}%. Hur mycket får du behålla?`, en: (b,p) => `You win ${b} kr. Tax is ${p}%. How much do you keep?` },
            { id: 'pop', inc: true, sv: (b,p) => `En by har ${b} invånare. Befolkningen ökar med ${p}%. Hur många bor där nu?`, en: (b,p) => `A village has ${b} people. Population grows by ${p}%. How many live there now?` },
            { id: 'battery', inc: false, sv: (b,p) => `Ett batteri har ${b} mAh. Det tappar ${p}% kapacitet. Vad är kvar?`, en: (b,p) => `A battery has ${b} mAh. It loses ${p}% capacity. What is left?` },
            { id: 'speed', inc: true, sv: (b,p) => `En bil kör ${b} km/h. Farten ökar med ${p}%. Vad är nya hastigheten?`, en: (b,p) => `A car goes ${b} km/h. Speed increases by ${p}%. What is the new speed?` },
            { id: 'rent', inc: true, sv: (b,p) => `Hyran är ${b} kr. Den höjs med ${p}%. Vad blir nya hyran?`, en: (b,p) => `Rent is ${b} kr. It goes up by ${p}%. What is the new rent?` },
            { id: 'ticket', inc: true, sv: (b,p) => `En biljett kostar ${b} kr. En avgift på ${p}% tillkommer. Totalt pris?`, en: (b,p) => `A ticket costs ${b} kr. A fee of ${p}% is added. Total price?` },
            { id: 'storage', inc: true, sv: (b,p) => `En hårddisk rymmer ${b} GB. Du uppgraderar med ${p}%. Ny storlek?`, en: (b,p) => `A drive holds ${b} GB. You upgrade by ${p}%. New size?` },
            { id: 'weight', inc: false, sv: (b,p) => `En säck väger ${b} kg. Den torkar och tappar ${p}% vikt. Ny vikt?`, en: (b,p) => `A sack weighs ${b} kg. It dries and loses ${p}% weight. New weight?` }
        ];

        const s = MathUtils.randomChoice(scenarios);
        
        // Logical numbers based on scenario context
        let base = 0;
        let pct = MathUtils.randomChoice([5, 10, 20, 25, 50]);

        if (s.id === 'salary') base = MathUtils.randomInt(20, 40) * 1000;
        if (s.id === 'sale') base = MathUtils.randomInt(5, 20) * 100;
        if (s.id === 'tax') base = MathUtils.randomInt(1, 10) * 1000;
        if (s.id === 'pop') base = MathUtils.randomInt(10, 100) * 100;
        if (s.id === 'battery') base = MathUtils.randomInt(20, 50) * 100;
        if (s.id === 'speed') base = MathUtils.randomInt(5, 12) * 10;
        if (s.id === 'rent') base = MathUtils.randomInt(50, 150) * 100;
        if (s.id === 'ticket') base = MathUtils.randomInt(10, 50) * 10;
        if (s.id === 'storage') base = MathUtils.randomChoice([250, 500, 1000]);
        if (s.id === 'weight') base = MathUtils.randomInt(10, 50) * 2;

        const change = (base * pct) / 100;
        const final = s.inc ? base + change : base - change;

        return {
            renderData: {
                description: lang === 'sv' ? s.sv(base, pct) : s.en(base, pct),
                answerType: 'numeric'
            },
            token: this.toBase64(final.toString()),
            clues: [
                {
                    text: lang === 'sv' ? "Räkna ut ändringen först." : "Calculate the change first.",
                    latex: `${pct}\\% \\cdot ${base} = ${change}`
                },
                {
                    text: lang === 'sv' ? (s.inc ? "Addera." : "Subtrahera.") : (s.inc ? "Add." : "Subtract."),
                    latex: s.inc ? `${base} + ${change} = ${final}` : `${base} - ${change} = ${final}`
                }
            ]
        };
    }
}