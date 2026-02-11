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

    /**
     * Phase 2: Targeted Generation
     * Maps specific mastery buckets to internal randomized generators.
     */
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

        // VARIATION A: Spot the Lie (Percent Grid)
        if (v === 'visual_lie') {
            const p = MathUtils.randomChoice([10, 20, 25, 40, 50, 60, 75, 80, 90]);
            const div = this.gcd(p, 100);
            const simpleN = p / div;
            const simpleD = 100 / div;

            const statementPercent = `${p}%`;
            const statementFraction = `${simpleN}/${simpleD}`;
            
            let statementFalse = "";
            if (p < 50) {
                statementFalse = lang === 'sv' ? "Mer än hälften" : "More than half";
            } else if (p === 50) {
                statementFalse = lang === 'sv' ? "Mindre än 1/4" : "Less than 1/4";
            } else {
                statementFalse = lang === 'sv' ? "Mindre än hälften" : "Less than half";
            }

            const options = MathUtils.shuffle([statementPercent, statementFraction, statementFalse]);

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? "Studera figuren nedan noga. Vilket av påståendena om den färgade andelen är FALSKT?" 
                        : "Study the figure below carefully. Which statement about the colored part is FALSE?",
                    answerType: 'multiple_choice',
                    options: options,
                    geometry: { type: 'percent_grid', total: 100, colored: p }
                },
                token: this.toBase64(statementFalse),
                clues: [
                    { text: lang === 'sv' ? "Hela rutnätet består av 100 rutor. Hälften av 100 är 50 rutor." : "The whole grid consists of 100 squares. Half of 100 is 50 squares.", latex: "\\frac{50}{100} = 50\\%" },
                    { text: lang === 'sv' ? `Räkna antalet färgade rutor. Det är ${p} stycken. Jämför detta antal med de olika påståendena.` : `Count the number of colored squares. There are ${p}. Compare this count with the different statements.`, latex: "" }
                ],
                metadata: { variation_key: 'visual_lie', difficulty: 1 }
            };
        }

        // VARIATION B: Inverse Logic (Word Problem)
        if (v === 'visual_inverse') {
            const fractionD = MathUtils.randomInt(3, 8);
            const countPerPart = MathUtils.randomInt(2, 6);
            const total = countPerPart * fractionD;
            
            return {
                renderData: {
                    description: lang === 'sv'
                        ? `Du har en samling med ${total} kulor. Om exakt 1/${fractionD} av dem är röda, hur många röda kulor har du då?`
                        : `You have a collection of ${total} marbles. If exactly 1/${fractionD} of them are red, how many red marbles do you have?`,
                    answerType: 'numeric',
                    geometry: null 
                },
                token: this.toBase64(countPerPart.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? `Att söka 1/${fractionD} innebär att du delar upp hela antalet i ${fractionD} lika stora grupper.` : `Finding 1/${fractionD} means you divide the whole number into ${fractionD} equal groups.`, 
                        latex: `\\frac{${total}}{${fractionD}} = ${countPerPart}` 
                    }
                ],
                metadata: { variation_key: 'visual_inverse', difficulty: 2 }
            };
        }

        // VARIATION C: Standard Visuals (Marbles)
        const red = MathUtils.randomInt(1, 5);
        const blue = MathUtils.randomInt(1, 5);
        const green = MathUtils.randomInt(1, 5);
        const totalItems = red + blue + green;
        const target = MathUtils.randomChoice(['red', 'blue', 'green']);
        
        let count = 0;
        let colorName = "";
        if (target === 'red') { count = red; colorName = lang === 'sv' ? 'röda' : 'red'; }
        else if (target === 'blue') { count = blue; colorName = lang === 'sv' ? 'blåa' : 'blue'; }
        else { count = green; colorName = lang === 'sv' ? 'gröna' : 'green'; }

        return {
            renderData: {
                description: lang === 'sv' 
                    ? `Hur stor andel av kulorna i behållaren är ${colorName}? Svara i bråkform.` 
                    : `What fraction of the marbles in the container are ${colorName}? Answer as a fraction.`,
                answerType: 'fraction',
                geometry: { type: 'probability_marbles', items: { red, blue, green } }
            },
            token: this.toBase64(`${count}/${totalItems}`),
            clues: [
                { text: lang === 'sv' ? `Räkna antalet ${colorName} kulor (${count}) och dela det med det totala antalet kulor i behållaren (${totalItems}).` : `Count the number of ${colorName} marbles (${count}) and divide it by the total number of marbles in the container (${totalItems}).`, latex: `\\frac{\\text{Andel ${colorName}}}{\\text{Totalt antal}}` }
            ],
            metadata: { variation_key: 'visual_calc', difficulty: 1 }
        };
    }

    // --- LEVEL 2: PARTS OF QUANTITY ---
    private level2_PartsOfQuantity(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['part_inverse', 'part_compare', 'part_calc']);

        if (v === 'part_inverse') {
            const denom = MathUtils.randomChoice([3, 4, 5, 8, 10]);
            const partValue = MathUtils.randomChoice([5, 10, 20, 25, 50, 100]);
            const total = partValue * denom;

            return {
                renderData: {
                    description: lang === 'sv'
                        ? `Om 1/${denom} av ett totalt belopp motsvarar ${partValue} kr, hur mycket är då hela beloppet värt?`
                        : `If 1/${denom} of a total amount corresponds to ${partValue} kr, how much is the entire amount worth?`,
                    answerType: 'numeric',
                    suffix: 'kr'
                },
                token: this.toBase64(total.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? `Eftersom en av ${denom} delar är ${partValue} kr, måste vi multiplicera delens värde med antalet delar för att få helheten.` : `Since one of ${denom} parts is ${partValue} kr, we must multiply the part's value by the number of parts to get the whole.`,
                        latex: `${partValue} \\cdot ${denom} = ${total}` 
                    }
                ],
                metadata: { variation_key: 'part_inverse', difficulty: 2 }
            };
        }

        if (v === 'part_compare') {
            const d1 = MathUtils.randomInt(2, 5);
            const mult1 = MathUtils.randomInt(2, 6);
            const t1 = d1 * mult1;
            
            const d2 = MathUtils.randomInt(2, 5);
            const mult2 = MathUtils.randomInt(2, 6);
            const t2 = d2 * mult2;

            if (mult1 === mult2) return this.level2_PartsOfQuantity(lang, v);

            const isFirstLarger = mult1 > mult2;
            const winningOpt = isFirstLarger 
                ? `1/${d1} ${lang==='sv'?'av':'of'} ${t1}`
                : `1/${d2} ${lang==='sv'?'av':'of'} ${t2}`;
            const losingOpt = isFirstLarger
                ? `1/${d2} ${lang==='sv'?'av':'of'} ${t2}`
                : `1/${d1} ${lang==='sv'?'av':'of'} ${t1}`;

            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket av alternativen nedan representerar det största värdet?" : "Which of the options below represents the largest value?",
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([winningOpt, losingOpt])
                },
                token: this.toBase64(winningOpt),
                clues: [
                    { text: lang === 'sv' ? "Beräkna värdet för varje alternativ genom att dela talet med nämnaren." : "Calculate the value for each option by dividing the number by the denominator.", latex: `${t1} / ${d1} = ${mult1} \\quad \\text{vs} \\quad ${t2} / ${d2} = ${mult2}` }
                ],
                metadata: { variation_key: 'part_compare', difficulty: 2 }
            };
        }

        const denom = MathUtils.randomChoice([3, 4, 5, 6, 8, 10]);
        const mult = MathUtils.randomInt(2, 12);
        const total = denom * mult;

        return {
            renderData: {
                description: lang === 'sv' ? "Beräkna hur stor del av talet som andelen motsvarar." : "Calculate how large a part of the number the fraction represents.",
                latex: `\\frac{1}{${denom}} \\text{ ${lang==='sv'?'av':'of'} } ${total}`,
                answerType: 'numeric'
            },
            token: this.toBase64(mult.toString()),
            clues: [
                { text: lang === 'sv' ? "Dela helheten med nämnaren för att ta reda på vad en del är värd." : "Divide the whole by the denominator to find out what one part is worth.", latex: `\\frac{${total}}{${denom}} = ${mult}` }
            ],
            metadata: { variation_key: 'part_calc', difficulty: 1 }
        };
    }

    // --- LEVEL 3: MIXED & IMPROPER ---
    private level3_MixedImproper(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['mixed_bounds', 'mixed_missing', 'mixed_convert_imp', 'mixed_convert_mix']);

        if (v === 'mixed_bounds') {
            const w = MathUtils.randomInt(2, 6);
            const den = MathUtils.randomInt(3, 8);
            const num = MathUtils.randomInt(1, den - 1);
            const improper = w * den + num; 
            const isGreater = Math.random() > 0.5;
            const compareVal = isGreater ? w : w + 1; 
            
            const correctAnswer = (improper/den > compareVal) ? (lang==='sv'?'Ja':'Yes') : (lang==='sv'?'Nej':'No');
            const wrongAnswer = (improper/den > compareVal) ? (lang==='sv'?'Nej':'No') : (lang==='sv'?'Ja':'Yes');

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Är bråket nedan större än heltalet ${compareVal}?` 
                        : `Is the improper fraction below greater than the integer ${compareVal}?`,
                    latex: `\\frac{${improper}}{${den}}`,
                    answerType: 'multiple_choice',
                    options: [correctAnswer, wrongAnswer]
                },
                token: this.toBase64(correctAnswer),
                clues: [
                    { 
                        text: lang === 'sv' ? `Tänk på heltalet ${compareVal} som ett bråk med nämnaren ${den}.` : `Think of the integer ${compareVal} as a fraction with the denominator ${den}.`,
                        latex: `${compareVal} = \\frac{${compareVal} \\cdot ${den}}{${den}} = \\frac{${compareVal*den}}{${den}}`
                    },
                    { text: lang === 'sv' ? `Jämför täljarna för att se vilket bråk som är störst.` : `Compare the numerators to see which fraction is largest.`, latex: `${improper} \\text{ vs } ${compareVal*den}` }
                ],
                metadata: { variation_key: 'mixed_bounds', difficulty: 2 }
            };
        }

        if (v === 'mixed_missing') {
            const w = MathUtils.randomInt(1, 5);
            const d = MathUtils.randomInt(3, 9);
            const n = MathUtils.randomInt(1, d - 1);
            const imp = w * d + n;

            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket tal saknas i täljaren för att likheten ska stämma?" : "What number is missing in the numerator for the equality to be correct?",
                    latex: `${w}\\frac{?}{${d}} = \\frac{${imp}}{${d}}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(n.toString()),
                clues: [
                    { text: lang === 'sv' ? `Ett heltal (${w}) motsvarar ${w} gånger nämnaren (${d}) i delar.` : `A whole number (${w}) corresponds to ${w} times the denominator (${d}) in parts.`, latex: `${w} \\cdot ${d} = ${w*d}` },
                    { text: lang === 'sv' ? `Räkna ut skillnaden mellan totala antalet delar (${imp}) och heltalets delar.` : `Calculate the difference between the total number of parts (${imp}) and the whole number's parts.`, latex: `${imp} - ${w*d} = ${n}` }
                ],
                metadata: { variation_key: 'mixed_missing', difficulty: 2 }
            };
        }

        const isToImp = v === 'mixed_convert_imp' || (v === undefined && Math.random() > 0.5);
        const w = MathUtils.randomInt(1, 6);
        const d = MathUtils.randomInt(3, 9);
        const n = MathUtils.randomInt(1, d - 1);
        const imp = w * d + n;

        if (isToImp) {
            return {
                renderData: {
                    description: lang === 'sv' ? "Skriv om det blandade talet till bråkform (osammansatt form)." : "Rewrite the mixed number as an improper fraction.",
                    latex: `${w}\\frac{${n}}{${d}}`,
                    answerType: 'fraction'
                },
                token: this.toBase64(`${imp}/${d}`),
                clues: [
                    { text: lang === 'sv' ? `Multiplicera heltalet (${w}) med nämnaren (${d}) och lägg sedan till täljaren (${n}).` : `Multiply the whole number (${w}) by the denominator (${d}) and then add the numerator (${n}).`, latex: `(${w} \\cdot ${d}) + ${n} = ${imp}` }
                ],
                metadata: { variation_key: 'mixed_convert_imp', difficulty: 2 }
            };
        } else {
            return {
                renderData: {
                    description: lang === 'sv' ? "Skriv om från bråkform till blandad form." : "Rewrite the improper fraction as a mixed number.",
                    latex: `\\frac{${imp}}{${d}}`,
                    answerType: 'mixed_fraction'
                },
                token: this.toBase64(`${w} ${n}/${d}`),
                clues: [
                    { text: lang === 'sv' ? `Se hur många hela gånger nämnaren går i täljaren för att få heltalet, och behåll resten som täljare.` : `See how many whole times the denominator fits into the numerator to get the whole number, and keep the remainder as the numerator.`, latex: `${imp} / ${d} = ${w} \\text{ rest } ${n}` }
                ],
                metadata: { variation_key: 'mixed_convert_mix', difficulty: 2 }
            };
        }
    }

    // --- LEVEL 4: SIMPLIFY & EXTEND ---
    private level4_SimplifyExtend(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['simplify_missing', 'simplify_concept', 'simplify_calc']);

        if (v === 'simplify_missing') {
            const baseN = MathUtils.randomInt(1, 5);
            const baseD = MathUtils.randomInt(baseN + 1, 9);
            const f = MathUtils.randomInt(2, 6);
            const targetD = baseD * f;
            const targetN = baseN * f; 

            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket tal saknas i täljaren för att de två bråken ska ha samma värde (vara likvärdiga)?" : "What number is missing in the numerator for the two fractions to have the same value (be equivalent)?",
                    latex: `\\frac{${baseN}}{${baseD}} = \\frac{?}{${targetD}}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(targetN.toString()),
                clues: [
                    { text: lang === 'sv' ? `Börja med att se vad nämnaren har multiplicerats med för att bli ${targetD}.` : `Start by seeing what the denominator has been multiplied by to become ${targetD}.`, latex: `${baseD} \\cdot ${f} = ${targetD}` },
                    { text: lang === 'sv' ? "Gör nu exakt samma sak med täljaren." : "Now do exactly the same to the numerator.", latex: `${baseN} \\cdot ${f} = ${targetN}` }
                ],
                metadata: { variation_key: 'simplify_missing', difficulty: 3 }
            };
        }

        if (v === 'simplify_concept') {
            const k = MathUtils.randomInt(2, 5);
            const q = lang === 'sv' 
                ? `Vad händer med ett bråks totala värde om du multiplicerar både täljaren och nämnaren med ${k}?`
                : `What happens to a fraction's total value if you multiply both the numerator and the denominator by ${k}?`;
            const ans = lang === 'sv' ? "Värdet förblir detsamma" : "The value stays the same";
            const wrong = lang === 'sv' ? `Värdet blir ${k} gånger större` : `The value becomes ${k} times larger`;

            return {
                renderData: {
                    description: q,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([ans, wrong, lang==='sv'?"Värdet minskar":"The value decreases"])
                },
                token: this.toBase64(ans),
                clues: [
                    { text: lang === 'sv' ? "Att förlänga eller förkorta ett bråk ändrar bara hur många bitar vi ser, men inte den totala andelen." : "Extending or simplifying a fraction only changes how many pieces we see, but not the total share.", latex: "1/2 = 2/4 = 3/6" }
                ],
                metadata: { variation_key: 'simplify_concept', difficulty: 3 }
            };
        }

        const factor = MathUtils.randomInt(2, 5);
        const sn = MathUtils.randomInt(1, 5);
        const sd = MathUtils.randomInt(sn + 1, 10);
        if (this.gcd(sn, sd) !== 1) return this.level4_SimplifyExtend(lang, v);

        return {
            renderData: {
                description: lang === 'sv' ? "Förkorta bråket så långt det går genom att hitta den största gemensamma delaren." : "Simplify the fraction as much as possible by finding the greatest common divisor.",
                latex: `\\frac{${sn * factor}}{${sd * factor}}`,
                answerType: 'fraction'
            },
            token: this.toBase64(`${sn}/${sd}`),
            clues: [
                { text: lang === 'sv' ? `Hitta ett tal som både ${sn*factor} och ${sd*factor} kan delas med. Här kan båda delas med ${factor}.` : `Find a number that both ${sn*factor} and ${sd*factor} can be divided by. Here, both can be divided by ${factor}.`, latex: `\\frac{${sn*factor} / ${factor}}{${sd*factor} / ${factor}} = \\frac{${sn}}{${sd}}` }
            ],
            metadata: { variation_key: 'simplify_calc', difficulty: 3 }
        };
    }

    // --- LEVEL 5: DECIMALS ---
    private level5_Decimals(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['decimal_inequality', 'decimal_to_dec', 'decimal_to_frac']);

        if (v === 'decimal_inequality') {
            const d = MathUtils.randomChoice([2, 4, 5, 10]);
            const n = MathUtils.randomInt(1, d - 1);
            const fracVal = n / d;
            let compareDec = MathUtils.randomFloat(0.1, 0.9, 1);
            if (compareDec === fracVal) compareDec += 0.1;

            const correct = fracVal > compareDec ? ">" : "<";
            
            return {
                renderData: {
                    description: lang === 'sv' ? "Välj det tecken som gör att påståendet nedan stämmer." : "Choose the sign that makes the statement below correct.",
                    latex: `\\frac{${n}}{${d}} \\text{ [ ? ] } ${compareDec.toString().replace('.', ',')}`,
                    answerType: 'multiple_choice',
                    options: [">", "<", "="]
                },
                token: this.toBase64(correct),
                clues: [
                    { text: lang === 'sv' ? `Gör om bråket till ett decimaltal för att kunna jämföra: ${n} delat med ${d}.` : `Convert the fraction to a decimal to be able to compare: ${n} divided by ${d}.`, latex: `\\frac{${n}}{${d}} = ${fracVal}` }
                ],
                metadata: { variation_key: 'decimal_inequality', difficulty: 3 }
            };
        }

        const pairs = [
            { f: "1/2", d: 0.5 }, { f: "1/4", d: 0.25 }, { f: "3/4", d: 0.75 },
            { f: "1/5", d: 0.2 }, { f: "2/5", d: 0.4 }, { f: "4/5", d: 0.8 },
            { f: "1/10", d: 0.1 }, { f: "7/10", d: 0.7 }
        ];
        const pair = MathUtils.randomChoice(pairs);
        const isToDec = v === 'decimal_to_dec';

        return {
            renderData: {
                description: lang === 'sv' 
                    ? (isToDec ? "Skriv bråket som ett decimaltal." : "Skriv decimaltalet som ett bråk i enklaste form.") 
                    : (isToDec ? "Write the fraction as a decimal number." : "Write the decimal number as a fraction in its simplest form."),
                latex: isToDec ? pair.f : pair.d.toString().replace('.', ','),
                answerType: isToDec ? 'numeric' : 'fraction'
            },
            token: this.toBase64(isToDec ? pair.d.toString() : pair.f),
            clues: [
                { text: lang === 'sv' ? "Kom ihåg positionssystemet. Första decimalen är tiondelar, andra är hundradelar." : "Remember the place value system. The first decimal is tenths, the second is hundredths.", latex: "" }
            ],
            metadata: { variation_key: v, difficulty: 3 }
        };
    }
}