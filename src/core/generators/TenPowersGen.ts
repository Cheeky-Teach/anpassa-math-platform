import { MathUtils } from '../utils/MathUtils.js';
import { enrichQuestionMetadata } from '../utils/WordProblemDecorator.js';

export class TenPowersGen {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        // Adaptive Fallback: If Level 1 is mastered, push to conceptual logic
        if (level === 1 && options.hideConcept && options.exclude?.includes('big_mult_std')) {
            return this.level2_Concepts(lang, undefined, options);
        }

        let questionData: any;

        switch (level) {
            case 1: questionData = this.level1_MultDivBig(lang, undefined, options); break;
            case 2: questionData = this.level2_Concepts(lang, undefined, options); break;
            case 3: questionData = this.level3_DecimalPowers(lang, undefined, options); break;
            default: questionData = this.level1_MultDivBig(lang, undefined, options); break;
        }

        // 🟢 Run through the decorator
        enrichQuestionMetadata(questionData);

        // 🟢 Practice Mode Level-Wide Override
        const WORD_PROBLEM_ELIGIBLE_LEVELS = [1, 3];
        if (WORD_PROBLEM_ELIGIBLE_LEVELS.includes(level)) {
            if (!questionData.metadata) questionData.metadata = {};
            questionData.metadata.levelSupportsWordProblems = true;
        }

        return questionData;
    }

    /**
     * Targeted Generation for Question Studio
     * Maps ALL keys from skillBuckets.js to preserve Studio compatibility.
     */
    public generateByVariation(key: string, lang: string = 'sv'): any {
        switch (key) {
            case 'big_mult_std':
            case 'big_div_std':
            case 'big_missing_factor':
            case 'power_discovery':
                return this.level1_MultDivBig(lang, key);
            case 'reciprocal_equivalence':
            case 'concept_spot_lie':
                return this.level2_Concepts(lang, key);
            case 'decimal_div_std':
            case 'decimal_mult_std':
            case 'decimal_logic_trap':
                return this.level3_DecimalPowers(lang, key);
            default:
                return this.generate(1, lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    private fixFloat(n: number) { 
        return parseFloat(n.toFixed(8)); 
    }

    /**
     * Generates a randomized number with 0, 1, or 2 decimal places.
     */
    private generateNum(): number {
        const type = MathUtils.randomInt(0, 2); 
        const base = MathUtils.randomInt(11, 99);
        if (type === 0) return base;
        if (type === 1) return base / 10;
        return base / 100;
    }

    private toSup(num: number | string): string {
        const map: any = {
            '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
            '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻'
        };
        return num.toString().split('').map(char => map[char] || char).join('');
    }

    private getVariation(pool: {key: string, type: 'concept' | 'calculate'}[], options: any): string {
        let filtered = pool;
        if (options?.exclude && options.exclude.length > 0) {
            filtered = filtered.filter(v => !options.exclude.includes(v.key));
        }
        if (options?.hideConcept) {
            filtered = filtered.filter(v => v.type !== 'concept');
        }
        if (filtered.length === 0) return pool[pool.length - 1].key;
        return MathUtils.randomChoice(filtered.map(v => v.key));
    }

    // --- LEVEL 1: MULT/DIV BY 10, 100, 1000, 10000 ---
    private level1_MultDivBig(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'big_mult_std', type: 'calculate' },
            { key: 'big_div_std', type: 'calculate' },
            { key: 'big_missing_factor', type: 'calculate' },
            { key: 'power_discovery', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'big_mult_std' || v === 'big_div_std') {
            const power = MathUtils.randomChoice([10, 100, 1000, 10000]);
            const isMult = v === 'big_mult_std';
            const num = this.generateNum();
            const ans = isMult ? num * power : this.fixFloat(num / power);
            const zeros = Math.round(Math.log10(power));

            const numStr = num.toString().replace('.', ',');
            const ansStr = ans.toString().replace('.', ',');
            const currentLatex = isMult ? `${numStr} \\cdot ${power}` : `\\frac{${numStr}}{${power}}`;

            return {
            renderData: {
                latex: currentLatex,
                description: lang === 'sv' ? "Räkna ut värdet genom att flytta kommatecknet." : "Calculate the value by shifting the decimal point.",
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? `Kolla på nollorna i talet ${power}. Det har exakt ${zeros} nollor i slutet, vilket betyder att vi ska hoppa med kommatecknet ${zeros} steg.` : `Look at the zeroes in the number ${power}. It has exactly ${zeros} zeroes at the end, which means we will jump with the decimal point ${zeros} steps.`, 
                    latex: `\\text{Antal nollor} = \\mathbf{${zeros}}` 
                },
                { 
                    text: lang === 'sv' 
                        ? (isMult ? `Eftersom vi gångrar (multiplicerar) ska talet bli mycket STÖRRE. Vi flyttar kommatecknet åt HÖGER.` : `Eftersom vi delar (dividerar) ska talet bli mycket MINDRE. Vi flyttar kommatecknet åt VÄNSTER.`)
                        : (isMult ? `Since we are multiplying, the number needs to get much LARGER. We move the decimal point to the RIGHT.` : `Since we are dividing, the number needs to get much SMALLER. We move the decimal point to the LEFT.`), 
                    latex: isMult ? `\\text{Riktning} = \\mathbf{\\rightarrow \\text{ HÖGER}}` : `\\text{Riktning} = \\mathbf{\\leftarrow \\text{ VÄNSTER}}` 
                },
                { 
                    text: lang === 'sv' ? `Ta starttalet ${numStr} och låt kommatecknet hoppa exakt ${zeros} steg åt ${isMult ? 'höger' : 'vänster'}. Fyll i med extra nollor om platserna tar slut.` : `Take the starting number ${numStr} and let the decimal point jump exactly ${zeros} steps to the ${isMult ? 'right' : 'left'}. Fill in with extra zeroes if you run out of spaces.`, 
                    latex: `${currentLatex} = \\mathbf{${ansStr}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${ansStr}` : `Answer: ${ansStr}`, 
                    latex: `${ansStr}` 
                }
            ]
        };
        }

        if (v === 'big_missing_factor') {
            const power = MathUtils.randomChoice([10, 100, 1000, 10000]);
            const num = this.generateNum();
            const isMult = Math.random() > 0.5;
            const res = isMult ? num * power : this.fixFloat(num / power);

            const numStr = num.toString().replace('.', ',');
            const resStr = res.toString().replace('.', ',');
            const currentLatex = isMult ? `${numStr} \\cdot ? = ${resStr}` : `\\frac{${numStr}}{?} = ${resStr}`;
            const steps = Math.abs(Math.round(Math.log10(res / num)));

            return {
                renderData: {
                    latex: currentLatex,
                    description: lang === 'sv' ? "Vilket tal (10, 100, 1000 eller 10000) gömmer sig bakom frågetecknet?" : "Which number (10, 100, 1000, or 10000) hides behind the question mark?",
                    answerType: 'numeric'
                },
                token: this.toBase64(power.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? `Jämför starttalet ${numStr} med det färdiga svaret ${resStr} och räkna hur många steg kommatecknet har tvingats hoppa.` : `Compare the starting number ${numStr} with the final result ${resStr} and count how many steps the decimal point had to jump.`, 
                        latex: `\\text{Mät avståndet mellan kommatecknen}` 
                    },
                    { 
                        text: lang === 'sv' ? `Vi ser att kommatecknet har flyttat på sig exakt ${steps} steg för att förvandla ${numStr} till ${resStr}.` : `We can see that the decimal point has shifted exactly ${steps} steps to transform ${numStr} into ${resStr}.`, 
                        latex: `\\text{Hopp} = \\mathbf{${steps} \\text{ steg}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Det dolda talet måste därför vara en etta följt av exakt ${steps} nollor.` : `The hidden number must therefore be a one followed by exactly ${steps} zeroes.`, 
                        latex: `\\text{Det gömda talet} = \\mathbf{${power}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${power}` : `Answer: ${power}`, 
                        latex: `${power}` 
                    }
                ]
            };
        }

        const exp = MathUtils.randomInt(2, 5);
        const val = Math.pow(10, exp);
        const formattedVal = val.toLocaleString('sv-SE');

        return {
            renderData: {
                description: lang === 'sv' ? `Skriv talet ${formattedVal} i formen $10^{?}$ genom att hitta den lilla upphöjda siffran.` : `Write the number ${val.toLocaleString()} in the form $10^{?}$ by finding the small upper exponent index.`,
                latex: `${formattedVal} = 10^{?}`,
                answerType: 'structured_power'
            },
            token: this.toBase64(`10^${exp}`), variationKey: 'power_discovery', type: 'concept',
            clues: [
                { 
                    text: lang === 'sv' ? `Det lilla upphöjda talet över tian fungerar som en direkt räknare. Den talar helt enkelt om hur många nollor som ska ritas efter ettan.` : `The small raised number above the ten acts as a direct counter. It simply tells us how many zeroes should be drawn right after the digit one.`, 
                    latex: `10^{\\mathbf{?}} = 1 \\text{ följt av (?) nollor}` 
                },
                { 
                    text: lang === 'sv' ? `Räkna antalet nollor i talet ${formattedVal}. Det finns exakt ${exp} nollor på rad.` : `Count the number of zeroes inside the value ${formattedVal}. There are exactly ${exp} zeroes in a row.`, 
                    latex: `\\text{Antal nollor i } ${formattedVal} = \\mathbf{${exp}}` 
                },
                { 
                    text: lang === 'sv' ? `Eftersom det finns ${exp} nollor ska den lilla upphöjda siffran vara just en ${exp}:a.` : `Since there are ${exp} zeroes, that small raised digit must be exactly a ${exp}.`, 
                    latex: `${formattedVal} = 10^{\\mathbf{${exp}}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: 10${this.toSup(exp)}` : `Answer: 10${this.toSup(exp)}`, 
                    latex: `10^{${exp}}` 
                }
            ]
        };
    }

    // --- LEVEL 2: CONCEPTUAL RECIPROCALS (0.1, 0.01, 0.001) ---
    private level2_Concepts(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'reciprocal_equivalence', type: 'concept' },
            { key: 'concept_spot_lie', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'reciprocal_equivalence') {
            const scenarios = [
                { val: 0.1, equiv: 10, nameSv: "en tiondel (0,1)", nameEn: "one tenth (0.1)" },
                { val: 0.01, equiv: 100, nameSv: "en hundradel (0,01)", nameEn: "one hundredth (0.01)" },
                { val: 0.001, equiv: 1000, nameSv: "en tusendel (0,001)", nameEn: "one thousandth (0.001)" }
            ];
            const s = MathUtils.randomChoice(scenarios);
            const isMult = Math.random() > 0.5;
            const valFormatted = s.val.toString().replace('.', ',');

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Att ${isMult ? 'multiplicera' : 'dividera'} med ${valFormatted} ger exakt samma svar som att ${isMult ? 'dividera' : 'multiplicera'} med...` 
                        : `Multiplying by ${s.val} gives the same result as dividing by...`,
                    answerType: 'multiple_choice', options: MathUtils.shuffle(["10", "100", "1000", "0,1", "0,01", "0,001"])
                },
                token: this.toBase64(s.equiv.toString()), variationKey: v, type: 'concept',
                clues: [
                    { 
                        text: lang === 'sv' ? `Kom ihåg att ett decimaltal som ${valFormatted} är exakt samma sak som en bråkdel delat med ${s.equiv}.` : `Remember that a decimal value like ${s.val} is exactly the same as a fraction split shared by ${s.equiv}.`, 
                        latex: `${valFormatted} = \\frac{1}{${s.equiv}}` 
                    },
                    { 
                        text: lang === 'sv' 
                            ? (isMult ? `Att ta något gånger en ${s.nameSv} (delat med ${s.equiv}) är därför precis samma sak som att göra en vanlig division med ${s.equiv}.` : `Att dela med en ${s.nameSv} fungerar baklänges, och ger samma lyftande effekt som att göra en vanlig multiplikation med ${s.equiv}.`) 
                            : (isMult ? `Multiplying something by ${s.nameEn} (divided by ${s.equiv}) is therefore exactly the same as performing a regular division by ${s.equiv}.` : `Dividing something by ${s.nameEn} runs backwards, and delivers the same magnifying effect as performing a standard multiplication by ${s.equiv}.`), 
                        latex: isMult ? `\\text{Gångra med } ${valFormatted} \\iff \\text{Dela med } \\mathbf{${s.equiv}}` : `\\text{Dela med } ${valFormatted} \\iff \\text{Gångra med } \\mathbf{${s.equiv}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Det betyder att rätt svar i rutan är ${s.equiv}.` : `This means the correct answer token inside the block is ${s.equiv}.`, 
                        latex: `\\text{Svar} = \\mathbf{${s.equiv}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${s.equiv}` : `Answer: ${s.equiv}`, 
                        latex: `${s.equiv}` 
                    }
                ]
            };
        }

        const num = MathUtils.randomChoice([10, 50, 100, 1000]);
        const sLie = `${num} · 0,1 = ${num * 10}`;
        return {
            renderData: {
                description: lang === 'sv' ? "Vilket påstående stämmer INTE?" : "Which statement is NOT correct?",
                answerType: 'multiple_choice', 
                options: MathUtils.shuffle([sLie, `${num} · 0,1 = ${num/10}`, `${num} / 0,1 = ${num*10}`])
            },
            token: this.toBase64(sLie), variationKey: v, type: 'concept',
            clues: [
                { 
                    text: lang === 'sv' ? "Leta efter den rad som har räknat helt fel. Kolla vad som händer när vi tar ett tal gånger 0,1." : "Look for the row that calculated completely incorrectly. Let's look at what happens when multiplying a number by 0.1.", 
                    latex: `${num} \\cdot 0,1` 
                },
                { 
                    text: lang === 'sv' ? "Att gångra med 0,1 är som en hemlig instruktion att ta en tiondel av talet (dela med 10). Svaret ska alltså bli mindre, inte större!" : "Multiplying by 0.1 is like a secret instruction to take one-tenth of the number (divide by 10). The result should get smaller, not larger!", 
                    latex: `${num} \\cdot 0,1 = \\frac{${num}}{10} = \\mathbf{${num / 10}}` 
                },
                { 
                    text: lang === 'sv' ? `Att påstå att svaret skulle blåsas upp och bli till ${num * 10} är därför en ren lögn. Den här raden stämmer inte:` : `Claiming that the result would explode into ${num * 10} is therefore a total lie. This statement is the error choice row:`, 
                    latex: `\\mathbf{${num} \\cdot 0,1 = ${num * 10}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${sLie}` : `Answer: ${sLie}`, 
                    latex: `\\text{Lögn: } ${num} \\cdot 0,1 = ${num * 10}` 
                }
            ]
        };
    }

    // --- LEVEL 3: DECIMAL POWERS (0.1, 0.01, 0.001) ---
    private level3_DecimalPowers(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'decimal_mult_std', type: 'calculate' },
            { key: 'decimal_div_std', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        
        // Hantera fällan dynamiskt om nyckeln skickas in, annars slumpa 0.1, 0.01, 0.001
        const factor = v === 'decimal_logic_trap' ? 0.1 : MathUtils.randomChoice([0.1, 0.01, 0.001]);
        const num = this.generateNum();
        
        // Om det är en fälla låtsas vi att det är multiplikation men sätter upp en klurig text
        const isMult = v === 'decimal_logic_trap' ? true : v === 'decimal_mult_std';
        const ans = isMult ? this.fixFloat(num * factor) : this.fixFloat(num / factor);
        const steps = Math.abs(Math.round(Math.log10(factor)));

        const numStr = num.toString().replace('.', ',');
        const factorStr = factor.toString().replace('.', ',');
        const ansStr = ans.toString().replace('.', ',');

        const currentLatex = isMult ? `${numStr} \\cdot ${factorStr}` : `\\frac{${numStr}}{${factorStr}}`;

        return {
            renderData: {
                latex: currentLatex,
                description: lang === 'sv' ? "Räkna ut värdet genom att flytta kommatecknet." : "Calculate the value by shifting the decimal point.",
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? `Kolla på det lilla decimalnumret ${factorStr}. Det hat exakt ${steps} stycken nollor och decimalsteg gömda i sig, vilket talar om hur många kliv kommatecknet ska ta.` : `Look closely at the small decimal number ${factorStr}. It features exactly ${steps} zeroes and decimal places hidden inside, which tells us how many steps our decimal point should take.`, 
                    latex: `\\text{Hopp} = \\mathbf{${steps} \\text{ steg}}` 
                },
                { 
                    text: lang === 'sv' 
                        ? (isMult ? `Att gångra (multiplicera) med småbitar som ${factorStr} gör att talet blir MINDRE. Vi flyttar kommatecknet åt VÄNSTER.` : `Att dela (dividerar) med småbitar som ${factorStr} gör baklänges att talet blir mycket STÖRRE. Vi flyttar kommatecknet åt HÖGER.`)
                        : (isMult ? `Multiplying by small parts like ${factorStr} makes the number SMALLER. We move the decimal point to the LEFT.` : `Dividing by small parts like ${factorStr} does the opposite and makes the number LARGER. We move the decimal point to the RIGHT.`), 
                    latex: isMult ? `\\text{Riktning} = \\mathbf{\\leftarrow \\text{ VÄNSTER}}` : `\\text{Riktning} = \\mathbf{\\rightarrow \\text{ HÖGER}}` 
                },
                { 
                    text: lang === 'sv' ? `Ta nu startnumret ${numStr} och hoppa med kommatecknet exakt ${steps} steg åt ${isMult ? 'vänster' : 'höger'} på tavlan.` : `Now take the starting number ${numStr} and shift the decimal point exactly ${steps} steps to the ${isMult ? 'left' : 'right'} across the board.`, 
                    latex: `${currentLatex} = \\mathbf{${ansStr}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${ansStr}` : `Answer: ${ansStr}`, 
                    latex: `${ansStr}` 
                }
            ]
        };
    }
}