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

    public generateByVariation(key: string, lang: string = 'sv'): any {
        switch (key) {
            case 'visual_lie':
            case 'visual_inverse':
            case 'visual_calc':
                return this.level1_Visuals(lang, key);
            case 'part_inverse':
            case 'part_compare':
            case 'part_calc':
                return this.level2_PartsOfQuantity(lang, key);
            case 'mixed_bounds':
            case 'mixed_missing':
            case 'mixed_convert_imp':
            case 'mixed_convert_mix':
                return this.level3_MixedImproper(lang, key);
            case 'simplify_missing':
            case 'simplify_concept':
            case 'simplify_calc':
                return this.level4_SimplifyExtend(lang, key);
            case 'decimal_inequality':
            case 'decimal_to_dec':
            case 'decimal_to_frac':
                return this.level5_Decimals(lang, key);
            default:
                return this.generate(1, lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    private gcd(a: number, b: number): number {
        return MathUtils.gcd(a, b);
    }

    // --- LEVEL 1: VISUAL CONCEPTS ---
    private level1_Visuals(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['visual_lie', 'visual_inverse', 'visual_calc']);

        if (v === 'visual_lie') {
            const p = MathUtils.randomChoice([10, 20, 25, 40, 50, 60, 75, 80, 90]);
            const div = this.gcd(p, 100);
            const simpleN = p / div;
            const simpleD = 100 / div;

            const statementPercent = `${p}%`;
            const statementFraction = `${simpleN}/${simpleD}`;
            
            let statementFalse = "";
            if (p < 50) statementFalse = lang === 'sv' ? "Mer än hälften" : "More than half";
            else if (p === 50) statementFalse = lang === 'sv' ? "Mindre än 1/4" : "Less than 1/4";
            else statementFalse = lang === 'sv' ? "Mindre än hälften" : "Less than half";

            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket påstående om den färgade andelen är FALSKT?" : "Which statement about the colored part is FALSE?",
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([statementPercent, statementFraction, statementFalse]),
                    geometry: { type: 'percent_grid', total: 100, colored: p }
                },
                token: this.toBase64(statementFalse),
                clues: [
                    { text: lang === 'sv' ? `Det finns totalt 100 rutor och ${p} av dem är färgade.` : `There are 100 squares total and ${p} of them are colored.`, latex: `\\frac{${p}}{100} = ${p}\\%` },
                    { text: lang === 'sv' ? "Därför är detta påstående lögnen:" : "Therefore, this statement is the lie:", latex: `\\text{${statementFalse}}` }
                ],
                metadata: { variation_key: 'visual_lie', difficulty: 1 }
            };
        }

        if (v === 'visual_inverse') {
            const fractionD = MathUtils.randomInt(3, 8);
            const countPerPart = MathUtils.randomInt(2, 6);
            const total = countPerPart * fractionD;
            
            return {
                renderData: {
                    description: lang === 'sv' ? `Du har ${total} kulor. Om 1/${fractionD} är röda, hur många är röda?` : `You have ${total} marbles. If 1/${fractionD} are red, how many are red?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(countPerPart.toString()),
                clues: [
                    { text: lang === 'sv' ? `Att hitta 1/${fractionD} innebär att du delar upp hela antalet i ${fractionD} lika stora delar.` : `Finding 1/${fractionD} means you divide the whole number into ${fractionD} equal parts.`, latex: `\\frac{${total}}{${fractionD}}` },
                    { text: lang === 'sv' ? "Antalet röda kulor blir:" : "The number of red marbles is:", latex: `${countPerPart}` }
                ],
                metadata: { variation_key: 'visual_inverse', difficulty: 2 }
            };
        }

        const red = MathUtils.randomInt(1, 5), blue = MathUtils.randomInt(1, 5), green = MathUtils.randomInt(1, 5);
        const totalItems = red + blue + green;
        const target = MathUtils.randomChoice(['red', 'blue', 'green']);
        let count = (target === 'red') ? red : (target === 'blue' ? blue : green);
        let colorName = (target === 'red') ? (lang === 'sv' ? 'röda' : 'red') : (target === 'blue' ? (lang === 'sv' ? 'blåa' : 'blue') : (lang === 'sv' ? 'gröna' : 'green'));

        return {
            renderData: {
                description: lang === 'sv' ? `Hur stor andel av kulorna är ${colorName}?` : `What fraction of the marbles are ${colorName}?`,
                answerType: 'fraction',
                geometry: { type: 'probability_marbles', items: { red, blue, green } }
            },
            token: this.toBase64(`${count}/${totalItems}`),
            clues: [
                { text: lang === 'sv' ? "Ett bråk består av 'delen' dividerat med 'det hela'." : "A fraction consists of the 'part' divided by the 'whole'.", latex: `\\frac{\\text{${colorName}}}{\\text{totalt}}` },
                { text: lang === 'sv' ? `Vi har ${count} st ${colorName} kulor av totalt ${totalItems} st.` : `We have ${count} ${colorName} marbles out of ${totalItems} total.`, latex: `\\frac{${count}}{${totalItems}}` }
            ],
            metadata: { variation_key: 'visual_calc', difficulty: 1 }
        };
    }

    // --- LEVEL 2: PARTS OF QUANTITY ---
    private level2_PartsOfQuantity(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['part_inverse', 'part_calc']);

        if (v === 'part_inverse') {
            const denom = MathUtils.randomChoice([4, 5, 8, 10]);
            const partValue = MathUtils.randomChoice([10, 20, 50]);
            const total = partValue * denom;

            return {
                renderData: {
                    description: lang === 'sv' ? `Om 1/${denom} av ett belopp är ${partValue} kr, vad är hela beloppet?` : `If 1/${denom} of an amount is ${partValue} kr, what is the whole amount?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(total.toString()),
                clues: [
                    { text: lang === 'sv' ? `Eftersom en del av ${denom} är värd ${partValue} kr, multiplicerar vi delens värde med antalet delar.` : `Since one part out of ${denom} is worth ${partValue} kr, we multiply the part's value by the number of parts.`, latex: `${partValue} \\cdot ${denom}` },
                    { text: lang === 'sv' ? "Det totala beloppet är:" : "The total amount is:", latex: `${total}` }
                ],
                metadata: { variation_key: 'part_inverse', difficulty: 2 }
            };
        }

        const denom = MathUtils.randomChoice([3, 4, 5, 10]);
        const mult = MathUtils.randomInt(2, 10);
        const total = denom * mult;

        return {
            renderData: {
                description: lang === 'sv' ? `Beräkna 1/${denom} av ${total}.` : `Calculate 1/${denom} of ${total}.`,
                answerType: 'numeric'
            },
            token: this.toBase64(mult.toString()),
            clues: [
                { text: lang === 'sv' ? "För att hitta en del av ett tal dividerar vi talet med bråkets nämnare." : "To find a part of a number, we divide the number by the fraction's denominator.", latex: `\\frac{${total}}{${denom}}` },
                { text: lang === 'sv' ? "Resultatet blir:" : "The result is:", latex: `${mult}` }
            ],
            metadata: { variation_key: 'part_calc', difficulty: 1 }
        };
    }

    // --- LEVEL 3: MIXED & IMPROPER ---
    private level3_MixedImproper(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['mixed_convert_imp', 'mixed_convert_mix']);
        const w = MathUtils.randomInt(1, 4), d = MathUtils.randomInt(3, 5), n = MathUtils.randomInt(1, d - 1);
        const imp = w * d + n;

        if (v === 'mixed_convert_imp') {
            return {
                renderData: {
                    description: lang === 'sv' ? "Skriv om från blandadform till bråkform." : "Rewrite the mixed number as an improper fraction.",
                    latex: `${w}\\frac{${n}}{${d}}`,
                    answerType: 'fraction'
                },
                token: this.toBase64(`${imp}/${d}`),
                clues: [
                    { text: lang === 'sv' ? `Multiplicera heltalet (${w}) med nämnaren (${d}) och lägg till täljaren (${n}).` : `Multiply the whole number (${w}) by the denominator (${d}) and add the numerator (${n}).`, latex: `\\frac{(${w} \\cdot ${d}) + ${n}}{${d}}` },
                    { text: lang === 'sv' ? "I bråkform blir det:" : "In fraction form, it is:", latex: `\\frac{${imp}}{${d}}` }
                ],
                metadata: { variation_key: 'mixed_convert_imp', difficulty: 2 }
            };
        } else {
            return {
                renderData: {
                    description: lang === 'sv' ? "Skriv om till blandad form." : "Rewrite in mixed form.",
                    latex: `\\frac{${imp}}{${d}}`,
                    answerType: 'fraction'
                },
                token: this.toBase64(`${w} ${n}/${d}`),
                clues: [
                    { text: lang === 'sv' ? `Se hur många gånger ${d} får plats i ${imp}. Resten blir den nya täljaren.` : `See how many times ${d} fits into ${imp}. The remainder becomes the new numerator.`, latex: `${imp} / ${d} = ${w} \\text{ rest } ${n}` },
                    { text: lang === 'sv' ? "I blandad form blir det:" : "In mixed form, it is:", latex: `${w}\\frac{${n}}{${d}}` }
                ],
                metadata: { variation_key: 'mixed_convert_mix', difficulty: 2 }
            };
        }
    }

    // --- LEVEL 4: SIMPLIFY & EXTEND ---
    private level4_SimplifyExtend(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['simplify_missing', 'simplify_calc', 'simplify_concept']);

        // Base fraction logic: Ensure we start with a reduced fraction n/d where n < d
        let baseN = MathUtils.randomInt(1, 5);
        let baseD = MathUtils.randomInt(baseN + 1, 12);
        while (this.gcd(baseN, baseD) !== 1) {
            baseN = MathUtils.randomInt(1, 5);
            baseD = MathUtils.randomInt(baseN + 1, 12);
        }

        if (v === 'simplify_missing') {
            const f = MathUtils.randomInt(2, 10);
            const targetD = baseD * f;
            const targetN = baseN * f; 

            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket tal saknas för att likheten ska stämma?" : "What number is missing for the equality to be true?",
                    latex: `\\frac{${baseN}}{${baseD}} = \\frac{?}{${targetD}}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(targetN.toString()),
                clues: [
                    { text: lang === 'sv' ? "För att bråken ska vara lika värda måste täljaren och nämnaren multipliceras med samma tal." : "For the fractions to have the same value, the numerator and denominator must be multiplied by the same number." },
                    { text: lang === 'sv' ? `Vi ser att nämnaren har multiplicerats med ${f}.` : `We see that the denominator has been multiplied by ${f}.`, latex: `${baseD} \\cdot ${f} = ${targetD} \\rightarrow ${baseN} \\cdot ${f} = ${targetN}` },
                    { text: lang === 'sv' ? "Den saknade täljaren är:" : "The missing numerator is:", latex: `${targetN}` }
                ],
                metadata: { variation_key: 'simplify_missing', difficulty: 3 }
            };
        }

        if (v === 'simplify_concept') {
            const f = MathUtils.randomInt(2, 5);
            const sLie = lang === 'sv' ? "Värdet ändras om vi förkortar" : "The value changes if we simplify";
            const sTrue = lang === 'sv' ? "Värdet är detsamma" : "The value is the same";
            
            return {
                renderData: {
                    description: lang === 'sv' ? `Vad händer med ett bråks värde om vi förlänger det med ${f}?` : `What happens to a fraction's value if we extend it by ${f}?`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([sTrue, sLie, lang === 'sv' ? "Det blir hälften så stort" : "It becomes half as large"])
                },
                token: this.toBase64(sTrue),
                clues: [
                    { text: lang === 'sv' ? "Förlängning och förkortning ändrar hur bråket skrivs, men inte hur stor andel det representerar." : "Extending and simplifying changes how the fraction is written, but not the share it represents.", latex: `\\frac{a}{b} = \\frac{a \\cdot k}{b \\cdot k}` },
                    { text: lang === 'sv' ? "Rätt svar är:" : "The correct answer is:", latex: `\\text{${sTrue}}` }
                ],
                metadata: { variation_key: 'simplify_concept', difficulty: 2 }
            };
        }

        // simplify_calc (Förkortning)
        const factor = MathUtils.randomInt(2, 9);
        const startN = baseN * factor;
        const startD = baseD * factor;

        return {
            renderData: {
                description: lang === 'sv' ? "Förkorta bråket så långt det går (enklaste form)." : "Simplify the fraction as much as possible (simplest form).",
                latex: `\\frac{${startN}}{${startD}}`,
                answerType: 'fraction'
            },
            token: this.toBase64(`${baseN}/${baseD}`),
            clues: [
                { text: lang === 'sv' ? "Hitta det största talet som både täljaren och nämnaren kan delas med." : "Find the largest number that both the numerator and the denominator can be divided by." },
                { text: lang === 'sv' ? `Här kan båda talen divideras med ${factor}.` : `Here, both numbers can be divided by ${factor}.`, latex: `\\frac{${startN} / ${factor}}{${startD} / ${factor}} = \\frac{${baseN}}{${baseD}}` },
                { text: lang === 'sv' ? "Svaret i enklaste form är:" : "The answer in simplest form is:", latex: `\\frac{${baseN}}{${baseD}}` }
            ],
            metadata: { variation_key: 'simplify_calc', difficulty: 3 }
        };
    }

    // --- LEVEL 5: DECIMALS ---
    private level5_Decimals(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['decimal_to_dec', 'decimal_to_frac']);
        const pairs = [{ f: "1/2", d: 0.5 }, { f: "1/4", d: 0.25 }, { f: "1/5", d: 0.2 }, { f: "1/10", d: 0.1 }];
        const pair = MathUtils.randomChoice(pairs);
        const isToDec = v === 'decimal_to_dec';

        return {
            renderData: {
                description: lang === 'sv' ? (isToDec ? "Skriv bråket som ett decimaltal." : "Skriv decimaltalet som ett bråk.") : (isToDec ? "Write the fraction as a decimal." : "Write the decimal as a fraction."),
                latex: isToDec ? pair.f : pair.d.toString().replace('.', ','),
                answerType: isToDec ? 'numeric' : 'fraction'
            },
            token: this.toBase64(isToDec ? pair.d.toString() : pair.f),
            clues: [
                { text: lang === 'sv' ? "Bråkstrecket betyder division. Räkna ut täljaren dividerat med nämnaren." : "The fraction bar means division. Calculate the numerator divided by the denominator.", latex: isToDec ? `1 / ${pair.f.split('/')[1]} = ${pair.d}` : `\\frac{${pair.d * 10}}{10} = ${pair.f}` },
                { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: isToDec ? `${pair.d}` : `\\frac{${pair.f.split('/')[0]}}{${pair.f.split('/')[1]}}` }
            ],
            metadata: { variation_key: v, difficulty: 3 }
        };
    }
}