import { MathUtils } from '../utils/MathUtils.js';

export class TenPowersGen {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        // Adaptive Fallback: If Level 1 is mastered, push to conceptual logic
        if (level === 1 && options.hideConcept && options.exclude?.includes('big_mult_std')) {
            return this.level2_Concepts(lang, undefined, options);
        }

        switch (level) {
            case 1: return this.level1_MultDivBig(lang, undefined, options);
            case 2: return this.level2_Concepts(lang, undefined, options);
            case 3: return this.level3_DecimalPowers(lang, undefined, options);
            default: return this.level1_MultDivBig(lang, undefined, options);
        }
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

            return {
                renderData: {
                    latex: isMult ? `${numStr} · ${power}` : `${numStr} / ${power}`,
                    description: lang === 'sv' ? "Beräkna uttryckets värde." : "Calculate the value of the expression.",
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? `Steg 1: Titta på tiopotensen (${power}). Räkna hur många nollor den har.` : `Step 1: Look at the power of ten (${power}). Count how many zeros it has.` },
                    { text: lang === 'sv' ? `Det finns ${zeros} nollor. Det betyder att vi ska flytta kommatecknet ${zeros} steg.` : `There are ${zeros} zeros. This means we should move the decimal point ${zeros} places.` },
                    { text: lang === 'sv' ? (isMult ? "Steg 2: Vid multiplikation blir talet större. Flytta kommat åt HÖGER." : "Steg 2: Vid division blir talet mindre. Flytta kommat åt VÄNSTER.") : (isMult ? "Step 2: In multiplication, the number gets larger. Move the decimal to the RIGHT." : "Step 2: In division, the number gets smaller. Move the decimal to the LEFT.") },
                    { text: lang === 'sv' ? `Steg 3: Flytta kommat i ${numStr} exakt ${zeros} steg.` : `Step 3: Move the decimal in ${numStr} exactly ${zeros} places.` },
                    { text: lang === 'sv' ? `Svar: ${ansStr}` : `Answer: ${ans}` }
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

            return {
                renderData: {
                    latex: isMult ? `${numStr} · ? = ${resStr}` : `${numStr} / ? = ${resStr}`,
                    description: lang === 'sv' ? "Vilken tiopotens (10, 100, 1000 eller 10000) saknas?" : "Which power of ten (10, 100, 1000, or 10000) is missing?",
                    answerType: 'numeric'
                },
                token: this.toBase64(power.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? `Steg 1: Jämför talet ${numStr} med resultatet ${resStr}.` : `Step 1: Compare the number ${numStr} with the result ${resStr}.` },
                    { text: lang === 'sv' ? "Steg 2: Räkna hur många steg kommatecknet har flyttats mellan de två talen." : "Step 2: Count how many places the decimal point has been moved between the two numbers." },
                    { text: lang === 'sv' ? `Kommat har flyttats ${Math.abs(Math.round(Math.log10(res/num)))} steg.` : `The decimal point has moved ${Math.abs(Math.round(Math.log10(res/num)))} places.` },
                    { text: lang === 'sv' ? `Steg 3: Eftersom det är ${Math.abs(Math.round(Math.log10(res/num)))} steg, är tiopotensen en etta följt av ${Math.abs(Math.round(Math.log10(res/num)))} nollor.` : `Step 3: Since it moved ${Math.abs(Math.round(Math.log10(res/num)))} places, the power of ten is a one followed by ${Math.abs(Math.round(Math.log10(res/num)))} zeros.` },
                    { text: lang === 'sv' ? `Svar: ${power}` : `Answer: ${power}` }
                ]
            };
        }

        const exp = MathUtils.randomInt(2, 5);
        const val = Math.pow(10, exp);
        return {
            renderData: {
                description: lang === 'sv' ? `Skriv talet ${val.toLocaleString('sv-SE')} som en tiopotens.` : `Write the number ${val.toLocaleString()} as a power of ten.`,
                latex: `${val.toLocaleString('sv-SE')} = 10^{?}`,
                answerType: 'structured_power'
            },
            token: this.toBase64(`10^${exp}`), variationKey: 'power_discovery', type: 'concept',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Räkna antalet nollor som står efter siffran 1." : "Step 1: Count the number of zeros that follow the digit 1." },
                { text: lang === 'sv' ? `Det finns ${exp} nollor.` : `There are ${exp} zeros.` },
                { text: lang === 'sv' ? `Steg 2: Antalet nollor motsvarar direkt exponenten i tiopotensen.` : `Step 2: The number of zeros corresponds directly to the exponent in the power of ten.` },
                { text: lang === 'sv' ? `Svar: 10${this.toSup(exp)}` : `Answer: 10${this.toSup(exp)}` }
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

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Att ${isMult ? 'multiplicera' : 'dividera'} med ${s.val.toString().replace('.', ',')} ger samma resultat som att ${isMult ? 'dividera' : 'multiplicera'} med...` 
                        : `Multiplying by ${s.val} gives the same result as dividing by...`,
                    answerType: 'multiple_choice', options: MathUtils.shuffle(["10", "100", "1000", "0,1", "0,01", "0,001"])
                },
                token: this.toBase64(s.equiv.toString()), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? `Steg 1: Kom ihåg att ${s.nameSv} är samma sak som 1/${s.equiv}.` : `Step 1: Remember that ${s.nameEn} is the same as 1/${s.equiv}.`, latex: `${s.val.toString().replace('.', ',')} = \\frac{1}{${s.equiv}}` },
                    { text: lang === 'sv' ? `Steg 2: Att multiplicera med en ${s.nameSv} är matematiskt identiskt med att dividera med ${s.equiv}.` : `Step 2: Multiplying by ${s.nameEn} is mathematically identical to dividing by ${s.equiv}.` },
                    { text: lang === 'sv' ? `Svar: ${s.equiv}` : `Answer: ${s.equiv}` }
                ]
            };
        }

        const num = MathUtils.randomChoice([10, 50, 100, 1000]);
        const sLie = `${num} · 0,1 = ${num * 10}`;
        return {
            renderData: {
                description: lang === 'sv' ? "Vilket påstående om tiopotenser är FALSKT?" : "Which statement about powers of ten is FALSE?",
                answerType: 'multiple_choice', 
                options: MathUtils.shuffle([sLie, `${num} · 0,1 = ${num/10}`, `${num} / 0,1 = ${num*10}`])
            },
            token: this.toBase64(sLie), variationKey: v, type: 'concept',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Analysera påståendet: talet multipliceras med 0,1." : "Step 1: Analyze the statement: the number is multiplied by 0.1." },
                { text: lang === 'sv' ? "Steg 2: När vi multiplicerar med ett tal mindre än 1, ska resultatet bli mindre än ursprungstalet." : "Step 2: When we multiply by a number less than 1, the result should be smaller than the starting number." },
                { text: lang === 'sv' ? `Multiplikation med 0,1 innebär att man tar en tiondel. ${num} · 0,1 ska bli ${num/10}.` : `Multiplication by 0.1 means taking one tenth. ${num} · 0.1 should be ${num/10}.` },
                { text: lang === 'sv' ? `Svar: ${sLie}` : `Answer: ${sLie}` }
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
        const factor = MathUtils.randomChoice([0.1, 0.01, 0.001]);
        const num = this.generateNum();
        const isMult = v === 'decimal_mult_std';
        const ans = isMult ? this.fixFloat(num * factor) : this.fixFloat(num / factor);
        const steps = Math.abs(Math.round(Math.log10(factor)));

        const numStr = num.toString().replace('.', ',');
        const factorStr = factor.toString().replace('.', ',');
        const ansStr = ans.toString().replace('.', ',');

        return {
            renderData: {
                latex: isMult ? `${numStr} · ${factorStr}` : `${numStr} / ${factorStr}`,
                description: lang === 'sv' ? "Beräkna värdet." : "Calculate the value.",
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? `Steg 1: Identifiera faktorn (${factorStr}). Den har ${steps} decimalplatser.` : `Step 1: Identify the factor (${factorStr}). It has ${steps} decimal places.` },
                { text: lang === 'sv' ? (isMult ? "Steg 2: Vid multiplikation med 0,1/0,01/0,001 blir talet mindre. Flytta kommat åt VÄNSTER." : "Steg 2: Vid division med 0,1/0,01/0,001 blir talet större. Flytta kommat åt HÖGER.") : (isMult ? "Step 2: In multiplication by 0.1/0.01/0.001, the number gets smaller. Move the decimal to the LEFT." : "Step 2: In division by 0.1/0.01/0.001, the number gets larger. Move the decimal to the RIGHT.") },
                { text: lang === 'sv' ? `Steg 3: Flytta kommat i ${numStr} exakt ${steps} steg.` : `Step 3: Move the decimal in ${numStr} exactly ${steps} places.` },
                { text: lang === 'sv' ? `Uträkning: ${numStr} blir ${ansStr}.` : `Calculation: ${numStr} becomes ${ansStr}.` },
                { text: lang === 'sv' ? `Svar: ${ansStr}` : `Answer: ${ansStr}` }
            ]
        };
    }
}