import { MathUtils } from '../utils/MathUtils.js';

export class FractionBasicsGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_Visuals(lang);
            case 2: return this.level2_PartsOfQuantity(lang);
            case 3: return this.level3_MixedImproper(lang);
            case 4: return this.level4_SimplifyExtend(lang);
            case 5: return this.level5_Decimals(lang);
            default: return this.level1_Visuals(lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    private gcd(a: number, b: number): number {
        return b === 0 ? a : this.gcd(b, a % b);
    }

    // Level 1: Visual Fractions (Marbles & Shapes)
    private level1_Visuals(lang: string): any {
        const type = MathUtils.randomChoice(['marbles', 'grid']);

        if (type === 'marbles') {
            const red = MathUtils.randomInt(1, 5);
            const blue = MathUtils.randomInt(1, 5);
            const green = MathUtils.randomInt(1, 5);
            const total = red + blue + green;
            
            const targetColor = MathUtils.randomChoice(['red', 'blue', 'green']);
            const count = targetColor === 'red' ? red : (targetColor === 'blue' ? blue : green);
            
            const colorNameSv = targetColor === 'red' ? 'röda' : (targetColor === 'blue' ? 'blåa' : 'gröna');
            const colorNameEn = targetColor;

            const desc = lang === 'sv' 
                ? `Hur stor andel av kulorna är ${colorNameSv}? Svara i bråkform.` 
                : `What fraction of the marbles are ${colorNameEn}? Answer as a fraction.`;

            return {
                renderData: {
                    description: desc,
                    answerType: 'fraction',
                    geometry: {
                        type: 'probability_marbles',
                        items: { red, blue, green }
                    }
                },
                token: this.toBase64(`${count}/${total}`),
                clues: [
                    { 
                        text: lang === 'sv' ? "Räkna först hur många kulor det finns totalt (nämnaren)." : "First count how many marbles there are in total (the denominator).",
                        latex: `\\text{Total} = ${total}`
                    },
                    { 
                        text: lang === 'sv' ? `Räkna sedan hur många som är ${colorNameSv} (täljaren).` : `Then count how many are ${colorNameEn} (the numerator).`,
                        latex: `\\text{${colorNameEn}} = ${count}`
                    }
                ]
            };
        } else {
            const niceNumbers = [10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90];
            const colored = MathUtils.randomInt(0, 1) === 1 
                ? MathUtils.randomChoice(niceNumbers) 
                : MathUtils.randomInt(1, 99);
            
            const desc = lang === 'sv'
                ? "Hur stor andel av rutan är färgad? Svara i bråkform (gärna enklaste form)."
                : "What fraction of the grid is colored? Answer as a fraction (simplest form preferred).";

            return {
                renderData: {
                    description: desc,
                    answerType: 'fraction',
                    geometry: {
                        type: 'percent_grid',
                        total: 100,
                        colored: colored
                    }
                },
                token: this.toBase64(`${colored}/100`), 
                clues: [
                    {
                        text: lang === 'sv' ? "Hela rutan består av 100 små rutor." : "The grid consists of 100 small squares.",
                        latex: `\\text{Nämnare} = 100`
                    },
                    {
                        text: lang === 'sv' ? `Det är ${colored} färgade rutor.` : `There are ${colored} colored squares.`,
                        latex: `\\text{Täljare} = ${colored}`
                    }
                ]
            };
        }
    }

    // Level 2: Parts of Quantity (1/n of X)
    private level2_PartsOfQuantity(lang: string): any {
        const denom = MathUtils.randomChoice([2, 3, 4, 5, 10, 100]);
        const multiplier = MathUtils.randomInt(2, 12);
        const total = denom * multiplier; 
        
        const desc = lang === 'sv'
            ? `Beräkna $\\frac{1}{${denom}}$ av ${total} kr.`
            : `Calculate $\\frac{1}{${denom}}$ of ${total} kr.`;

        return {
            renderData: {
                description: desc,
                answerType: 'numeric',
                geometry: null
            },
            token: this.toBase64(multiplier.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? `Att ta en ${denom}-del är samma sak som att dela med ${denom}.` : `Finding a ${denom}-th is the same as dividing by ${denom}.`,
                    latex: `\\frac{1}{${denom}} \\cdot ${total} = \\frac{${total}}{${denom}}`
                },
                { 
                    text: lang === 'sv' ? "Utför divisionen." : "Perform the division.",
                    latex: `${total} / ${denom} = ${multiplier}`
                }
            ]
        };
    }

    // Level 3: Mixed <-> Improper
    private level3_MixedImproper(lang: string): any {
        const isMixedToImproper = MathUtils.randomInt(0, 1) === 1;
        const whole = MathUtils.randomInt(1, 5);
        const den = MathUtils.randomChoice([3, 4, 5, 6, 8]);
        const num = MathUtils.randomInt(1, den - 1); 
        
        const improperNum = whole * den + num;

        if (isMixedToImproper) {
            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Skriv ${whole} $\\frac{${num}}{${den}}$ i bråkform (utan heltal).` 
                        : `Write ${whole} $\\frac{${num}}{${den}}$ as an improper fraction.`,
                    // UPDATED: 'fraction' triggers the vertical stack input
                    answerType: 'fraction',
                    geometry: null
                },
                token: this.toBase64(`${improperNum}/${den}`),
                clues: [
                    { 
                        text: lang === 'sv' ? "Multiplicera heltalet med nämnaren och addera täljaren." : "Multiply the whole number by the denominator and add the numerator.",
                        latex: `${whole} \\cdot ${den} + ${num} = ${improperNum}`
                    },
                    {
                        latex: `\\frac{${improperNum}}{${den}}`
                    }
                ]
            };
        } else {
            return {
                renderData: {
                    description: lang === 'sv'
                        ? `Skriv $\\frac{${improperNum}}{${den}}$ i blandad form (heltal och bråk).`
                        : `Write $\\frac{${improperNum}}{${den}}$ as a mixed number.`,
                    // UPDATED: 'mixed_fraction' triggers the 3-box input
                    answerType: 'fraction', 
                    geometry: null
                },
                token: this.toBase64(`${whole} ${num}/${den}`),
                clues: [
                    { 
                        text: lang === 'sv' ? `Hur många gånger får ${den} plats i ${improperNum}?` : `How many times does ${den} fit into ${improperNum}?`,
                        latex: `${improperNum} / ${den} = ${whole} \\text{ rest } ${num}`
                    },
                    {
                        latex: `${whole} \\frac{${num}}{${den}}`
                    }
                ]
            };
        }
    }

    // Level 4: Expand & Simplify
    private level4_SimplifyExtend(lang: string): any {
        const isSimplify = MathUtils.randomInt(0, 1) === 1;

        if (isSimplify) {
            const baseN = MathUtils.randomInt(1, 9);
            const baseD = MathUtils.randomInt(baseN + 1, 12);
            const factor = MathUtils.randomChoice([2, 3, 4, 5]);
            const n = baseN * factor;
            const d = baseD * factor;
            
            const divisor = this.gcd(n, d);
            const simpleN = n / divisor;
            const simpleD = d / divisor;

            return {
                renderData: {
                    description: lang === 'sv' ? `Förkorta $\\frac{${n}}{${d}}$ så långt det går.` : `Simplify $\\frac{${n}}{${d}}$ to its lowest terms.`,
                    answerType: 'fraction',
                    geometry: null
                },
                token: this.toBase64(`${simpleN}/${simpleD}`),
                clues: [
                    { 
                        text: lang === 'sv' ? `Hitta ett tal som både ${n} och ${d} kan delas med (största gemensamma delare).` : `Find a number that divides both ${n} and ${d} (GCD).`,
                        latex: `\\text{GCD} = ${divisor}`
                    },
                    {
                        latex: `\\frac{${n} / ${divisor}}{${d} / ${divisor}} = \\frac{${simpleN}}{${simpleD}}`
                    }
                ]
            };
        } else {
            const n = MathUtils.randomInt(1, 5);
            const d = MathUtils.randomChoice([2, 3, 4, 5]);
            const factor = MathUtils.randomInt(2, 5);
            const targetD = d * factor;
            const targetN = n * factor;

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Förläng $\\frac{${n}}{${d}}$ så att nämnaren blir ${targetD}.` 
                        : `Extend $\\frac{${n}}{${d}}$ so the denominator becomes ${targetD}.`,
                    answerType: 'fraction',
                    geometry: null
                },
                token: this.toBase64(`${targetN}/${targetD}`),
                clues: [
                    { 
                        text: lang === 'sv' ? `Vad måste du multiplicera ${d} med för att få ${targetD}?` : `What must you multiply ${d} by to get ${targetD}?`,
                        latex: `${d} \\cdot ? = ${targetD} \\rightarrow ${factor}`
                    },
                    { 
                        text: lang === 'sv' ? "Multiplicera både täljare och nämnare med det talet." : "Multiply both top and bottom by that number.",
                        latex: `\\frac{${n} \\cdot ${factor}}{${d} \\cdot ${factor}} = \\frac{${targetN}}{${targetD}}`
                    }
                ]
            };
        }
    }

    // Level 5: Benchmark Translations
    private level5_Decimals(lang: string): any {
        const type = MathUtils.randomInt(1, 2); 
        
        // Benchmark data with "Base Unit" for clue generation
        const benchmarks = [
            { n: 1, d: 2, dec: 0.5, baseN: 1, baseD: 2, baseDec: 0.5 },
            { n: 1, d: 4, dec: 0.25, baseN: 1, baseD: 4, baseDec: 0.25 },
            { n: 3, d: 4, dec: 0.75, baseN: 1, baseD: 4, baseDec: 0.25 },
            { n: 1, d: 5, dec: 0.2, baseN: 1, baseD: 5, baseDec: 0.2 },
            { n: 2, d: 5, dec: 0.4, baseN: 1, baseD: 5, baseDec: 0.2 },
            { n: 3, d: 5, dec: 0.6, baseN: 1, baseD: 5, baseDec: 0.2 },
            { n: 4, d: 5, dec: 0.8, baseN: 1, baseD: 5, baseDec: 0.2 },
            { n: 1, d: 10, dec: 0.1, baseN: 1, baseD: 10, baseDec: 0.1 },
            { n: 3, d: 10, dec: 0.3, baseN: 1, baseD: 10, baseDec: 0.1 },
            { n: 1, d: 100, dec: 0.01, baseN: 1, baseD: 100, baseDec: 0.01 },
            { n: 5, d: 100, dec: 0.05, baseN: 1, baseD: 100, baseDec: 0.01 }
        ];

        if (Math.random() < 0.1) benchmarks.push({ n: 1, d: 8, dec: 0.125, baseN: 1, baseD: 8, baseDec: 0.125 });

        const item = MathUtils.randomChoice(benchmarks);

        if (type === 1) {
            // Fraction -> Decimal
            const isBase = item.n === item.baseN;
            const multiplier = item.n;
            
            let clueText1 = "";
            let latex1 = "";

            if (isBase) {
                // Direct mapping
                clueText1 = lang === 'sv' 
                    ? `Minns att 1/${item.d} är samma sak som ${item.dec}.`
                    : `Remember that 1/${item.d} is equal to ${item.dec}.`;
                latex1 = `\\frac{1}{${item.d}} = ${item.dec}`;
            } else {
                // Multiplier logic
                clueText1 = lang === 'sv'
                    ? `Kom ihåg att 1/${item.d} är ${item.baseDec}. Om du har ${item.n} stycken sådana, blir det:`
                    : `Remember that 1/${item.d} is ${item.baseDec}. If you have ${item.n} of them, it becomes:`;
                latex1 = `${item.n} \\cdot ${item.baseDec} = ${item.dec}`;
            }

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Skriv $\\frac{${item.n}}{${item.d}}$ som decimaltal.` 
                        : `Write $\\frac{${item.n}}{${item.d}}$ as a decimal.`,
                    answerType: 'numeric',
                    geometry: null
                },
                token: this.toBase64(item.dec.toString()),
                clues: [
                    { 
                        text: clueText1,
                        latex: latex1
                    }
                ]
            };
        } else {
            // Decimal -> Fraction
            // Use reverse logic: 0.2 -> 1/5
            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Skriv ${item.dec} som ett bråk (enklaste form).` 
                        : `Write ${item.dec} as a fraction (simplest form).`,
                    answerType: 'fraction',
                    geometry: null
                },
                token: this.toBase64(`${item.n}/${item.d}`),
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? `Kom ihåg att ${item.baseDec} kan skrivas som 1/${item.baseD}.`
                            : `Remember that ${item.baseDec} can be written as 1/${item.baseD}.`,
                        latex: `${item.dec} = ${item.n} \\cdot \\frac{1}{${item.baseD}}` 
                    },
                    {
                        text: lang === 'sv' ? "Multiplicera och svara:" : "Multiply and answer:",
                        latex: `\\frac{${item.n}}{${item.d}}`
                    }
                ]
            };
        }
    }
}