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
        const colored = MathUtils.randomChoice([1, 5, 10, 20, 25, 50, 75, 99]);
        
        return {
            renderData: {
                description: lang === 'sv' 
                    ? "Hur många procent av rutan är färgad? (Hela rutan är 100%)" 
                    : "What percent of the grid is colored? (The whole grid is 100%)",
                answerType: 'numeric',
                suffix: '%',
                geometry: { type: 'percent_grid', total: 100, colored: colored }
            },
            token: this.toBase64(colored.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? "Ordet procent betyder 'av 100'. Räkna de färgade rutorna." : "Percent means 'out of 100'. Count the colored squares.",
                    latex: `\\text{Antal} = ${colored}`
                }
            ]
        };
    }

    // Level 2: Benchmarks (Mental Math)
    private level2_Benchmarks(lang: string): any {
        const pct = MathUtils.randomChoice([10, 25, 50, 100]);
        // Base is carefully chosen to be cleanly divisible
        const base = MathUtils.randomInt(2, 40) * (pct === 25 ? 4 : 10); 
        
        const ans = (base * pct) / 100;
        
        let clueText = "";
        let clueLatex = "";

        if (pct === 50) {
            clueText = lang === 'sv' ? "50% är exakt hälften. För att hitta hälften, dela med 2." : "50% is exactly half. To find half, divide by 2.";
            clueLatex = `\\frac{${base}}{2}`;
        }
        else if (pct === 25) {
            clueText = lang === 'sv' ? "25% är en fjärdedel. För att hitta en fjärdedel, dela med 4." : "25% is a quarter. To find a quarter, divide by 4.";
            clueLatex = `\\frac{${base}}{4}`;
        }
        else if (pct === 10) {
            clueText = lang === 'sv' ? "10% är en tiondel. För att hitta en tiondel, flytta kommatecknet ett steg åt vänster." : "10% is a tenth. To find a tenth, move the decimal one step left.";
            clueLatex = `${base} \\to ${base/10}`;
        }
        else {
            clueText = lang === 'sv' ? "100% är hela talet. Inget ändras." : "100% is the whole number. Nothing changes.";
            clueLatex = `${base}`;
        }

        return {
            renderData: {
                description: lang === 'sv' ? `Beräkna ${pct}% av ${base}.` : `Calculate ${pct}% of ${base}.`,
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()),
            clues: [{ text: clueText, latex: clueLatex }]
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
                    text: lang === 'sv' ? "Börja med att räkna ut vad 10% är (en tiondel)." : "Start by figuring out what 10% is (one tenth).", 
                    latex: `10\\% \\text{ av } ${base} = ${oneTenth}` 
                },
                { 
                    text: lang === 'sv' ? `Nu har du 10%. Du vill ha ${pct}%. Multiplicera din tiondel med ${pct/10}.` : `Now you have 10%. You want ${pct}%. Multiply your tenth by ${pct/10}.`, 
                    latex: `${oneTenth} \\cdot ${pct/10} = ${ans}` 
                }
            ]
        };
    }

    // Level 4: General Calculation (Decimal Method)
    private level4_GeneralCalculation(lang: string): any {
        const pct = MathUtils.randomInt(1, 19) * 5; 
        const base = MathUtils.randomInt(2, 20) * 4; 
        
        const ans = (base * pct) / 100;
        const fixedAns = Math.round(ans * 100) / 100;

        return {
            renderData: {
                description: lang === 'sv' ? `Beräkna ${pct}% av ${base}.` : `Calculate ${pct}% of ${base}.`,
                answerType: 'numeric'
            },
            token: this.toBase64(fixedAns.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? "För att räkna med procent kan du göra om det till decimalform. Dela procenten med 100." : "To calculate with percent, convert it to decimal. Divide the percent by 100.", 
                    latex: `${pct}\\% = ${pct/100}` 
                },
                { 
                    text: lang === 'sv' ? "Multiplicera decimaltalet med det hela talet." : "Multiply the decimal by the whole number.", 
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
                    text: lang === 'sv' ? `Vi vet att ${pct}% är värt ${part}. Först, ta reda på vad 1% är värt genom att dela.` : `We know that ${pct}% is worth ${part}. First, find out what 1% is worth by dividing.`,
                    latex: `1\\% = \\frac{${part}}{${pct}} = ${part/pct}` 
                },
                { 
                    text: lang === 'sv' ? "Det hela talet är alltid 100%. Multiplicera ditt värde för 1% med 100." : "The whole number is always 100%. Multiply your value for 1% by 100.", 
                    latex: `${part/pct} \\cdot 100 = ${whole}` 
                }
            ]
        };
    }

    // Level 6: Real World Change (Whole Numbers Constraint)
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
        
        // --- WHOLE NUMBER LOGIC ---
        // To ensure the answer is an integer, (base * pct) must be divisible by 100.
        // We pick 'pct' first (any 1-99), then calculate a valid 'base'.
        
        let pct = MathUtils.randomInt(1, 50); // Use 1-50 range for realism (99% tax is rare)
        if (Math.random() > 0.8) pct = MathUtils.randomInt(50, 99); // Occasional high percent

        // Find a base that makes (base * pct) / 100 an integer.
        // Simplified: base must be a multiple of (100 / GCD(pct, 100)).
        // Or just iterate multiples of 100/50/25/20/10/5/4/2 depending on pct divisibility.
        // Brute force is fast enough: Pick a random multiplier 'k', let base = (100 * k) / GCD(pct, 100)?
        // Easier: Just make base a multiple of 100. Always safe.
        // To allow smaller bases (like 50), check divisibility.
        
        const possibleBases = [];
        // Generate candidate bases suitable for the context
        const minBase = s.id === 'salary' ? 20000 : (s.id === 'rent' ? 5000 : 50);
        const maxBase = s.id === 'salary' ? 40000 : (s.id === 'rent' ? 15000 : 500);
        const step = s.id === 'salary' || s.id === 'rent' ? 100 : 10;

        // Try 20 random bases, pick first valid one
        let base = 100;
        for(let i=0; i<20; i++) {
            let candidate = MathUtils.randomInt(minBase/step, maxBase/step) * step;
            if ((candidate * pct) % 100 === 0) {
                base = candidate;
                break;
            }
        }
        // Fallback: multiple of 100 always works
        if ((base * pct) % 100 !== 0) base = MathUtils.randomInt(1, 10) * 100;

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
                    text: lang === 'sv' ? `Först måste vi räkna ut hur mycket ${pct}% är i kronor/antal. Multiplicera:` : `First we calculate how much ${pct}% is in value. Multiply:`,
                    latex: `${pct}\\% \\cdot ${base} = ${change}`
                },
                {
                    text: lang === 'sv' 
                        ? (s.inc ? "Eftersom det är en ökning, plussar vi på ändringen." : "Eftersom det är en minskning, drar vi av ändringen.") 
                        : (s.inc ? "Since it's an increase, add the change." : "Since it's a decrease, subtract the change."),
                    latex: s.inc ? `${base} + ${change} = ${final}` : `${base} - ${change} = ${final}`
                }
            ]
        };
    }
}