import { MathUtils } from '../utils/MathUtils.js';

export class FractionBasicsGen {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        // Adaptive Fallback: Push from concepts to quantity calculations once mastered
        if (level === 1 && options.hideConcept) {
            return this.level2_PartsOfQuantity(lang, undefined, options);
        }

        switch (level) {
            case 1: return this.level1_Visuals(lang, undefined, options);
            case 2: return this.level2_PartsOfQuantity(lang, undefined, options);
            case 3: return this.level3_MixedImproper(lang, undefined, options);
            case 4: return this.level4_SimplifyExtend(lang, undefined, options);
            case 5: return this.level5_Decimals(lang, undefined, options);
            default: return this.level1_Visuals(lang, undefined, options);
        }
    }

    /**
     * Targeted Generation for Question Studio
     * Maps ALL keys from skillBuckets.js to preserve Studio compatibility.
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

    // --- LEVEL 1: VISUAL CONCEPTS ---
    private level1_Visuals(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'visual_lie', type: 'concept' },
            { key: 'visual_inverse', type: 'calculate' },
            { key: 'visual_calc', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'visual_lie') {
            const p = MathUtils.randomChoice([20, 25, 40, 50, 60, 75, 80]);
            const div = this.gcd(p, 100);
            const sFrac = `${p / div}/${100 / div}`;
            const sLie = p < 50 ? (lang === 'sv' ? "Mer än hälften" : "More than half") : (lang === 'sv' ? "Mindre än hälften" : "Less than half");

            return {
                renderData: {
                    description: lang === 'sv' ? "Titta på figuren. Vilket påstående är FALSKT?" : "Look at the figure. Which statement is FALSE?",
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([`${p}%`, sFrac, sLie]),
                    geometry: { type: 'percent_grid', total: 100, colored: p }
                },
                token: this.toBase64(sLie), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: En hundraruta representerar 'det hela' (100%)." : "Step 1: A hundred-grid represents 'the whole' (100%)." },
                    { text: lang === 'sv' ? `Steg 2: Räkna de färgade rutorna. Det är ${p} stycken.` : `Step 2: Count the colored squares. There are ${p} of them.` },
                    { text: lang === 'sv' ? `Steg 3: ${p} av 100 skrivs som bråket ${p}/100.` : `Step 3: ${p} out of 100 is written as the fraction ${p}/100.`, latex: `\\frac{${p}}{100}` },
                    { text: lang === 'sv' ? `Steg 4: Bråket kan förkortas till ${sFrac}.` : `Step 4: The fraction can be simplified to ${sFrac}.`, latex: `\\frac{${p}}{100} = \\frac{${p/div}}{${100/div}}` },
                    { text: lang === 'sv' ? `Steg 5: Jämför med hälften (50%). ${p}% är ${p < 50 ? 'mindre' : 'mer'} än hälften.` : `Step 5: Compare with half (50%). ${p}% is ${p < 50 ? 'less' : 'more'} than half.` },
                    { text: lang === 'sv' ? `Svar: ${sLie}` : `Answer: ${sLie}` }
                ]
            };
        }

        if (v === 'visual_inverse') {
            const d = MathUtils.randomChoice([3, 4, 5, 8, 10]);
            const count = MathUtils.randomInt(2, 6);
            const total = count * d;
            return {
                renderData: {
                    description: lang === 'sv' ? `Du har ${total} kulor. Hur många kulor motsvarar 1/${d}?` : `You have ${total} marbles. How many marbles correspond to 1/${d}?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(count.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? `Steg 1: Att hitta en ${d}-del innebär att man delar upp det hela i ${d} lika stora grupper.` : `Step 1: Finding one ${d}-th means dividing the whole into ${d} equal groups.` },
                    { text: lang === 'sv' ? `Steg 2: Dela det totala antalet (${total}) med nämnaren (${d}).` : `Step 2: Divide the total number (${total}) by the denominator (${d}).` },
                    { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `${total} / ${d} = ${count}` },
                    { text: lang === 'sv' ? `Svar: ${count}` : `Answer: ${count}` }
                ]
            };
        }

        const r = MathUtils.randomInt(1, 4), b = MathUtils.randomInt(1, 4), g = MathUtils.randomInt(1, 4);
        const tot = r + b + g;
        const color = MathUtils.randomChoice(['red', 'blue', 'green']);
        const cVal = color === 'red' ? r : color === 'blue' ? b : g;
        const cName = color === 'red' ? (lang === 'sv' ? 'röda' : 'red') : color === 'blue' ? (lang === 'sv' ? 'blåa' : 'blue') : (lang === 'sv' ? 'gröna' : 'green');

        return {
            renderData: {
                description: lang === 'sv' ? `Hur stor andel av kulorna är ${cName}?` : `What fraction of the marbles are ${cName}?`,
                answerType: 'fraction',
                geometry: { type: 'probability_marbles', items: { red: r, blue: b, green: g } }
            },
            token: this.toBase64(`${cVal}/${tot}`), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: En andel (ett bråk) skrivs som: 'Delen dividerat med Helheten'." : "Step 1: A share (a fraction) is written as: 'Part divided by Whole'." },
                { text: lang === 'sv' ? `Steg 2: Räkna hur många kulor som är ${cName}. Det finns ${cVal} stycken.` : `Step 2: Count how many marbles are ${cName}. There are ${cVal}.` },
                { text: lang === 'sv' ? `Steg 3: Räkna totala antalet kulor i bilden. Det är ${tot} stycken.` : `Step 3: Count the total number of marbles in the image. There are ${tot}.` },
                { text: lang === 'sv' ? "Steg 4: Ställ upp bråket med antalet sökta kulor i täljaren." : "Step 4: Set up the fraction with the sought number in the numerator.", latex: `\\frac{${cVal}}{${tot}}` },
                { text: lang === 'sv' ? `Svar: ${cVal}/${tot}` : `Answer: ${cVal}/${tot}` }
            ]
        };
    }

    // --- LEVEL 2: PARTS OF QUANTITY ---
    private level2_PartsOfQuantity(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'part_compare', type: 'concept' },
            { key: 'part_inverse', type: 'calculate' },
            { key: 'part_calc', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'part_compare') {
            const d1 = MathUtils.randomChoice([2, 3, 4]), d2 = MathUtils.randomChoice([6, 8, 10]);
            const correct = `1/${d1}`;
            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket bråk representerar den STÖRSTA delen?" : "Which fraction represents the LARGEST part?",
                    answerType: 'multiple_choice', options: MathUtils.shuffle([correct, `1/${d2}`, `1/${d2 + 2}`])
                },
                token: this.toBase64(correct), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Nämnaren talar om i hur många delar vi har delat det hela." : "Step 1: The denominator tells us into how many parts we have divided the whole." },
                    { text: lang === 'sv' ? "Steg 2: Ju FLER delar vi delar något i (större nämnare), desto MINDRE blir varje del." : "Step 2: The MORE parts we divide something into (larger denominator), the SMALLER each part becomes." },
                    { text: lang === 'sv' ? `Steg 3: Eftersom ${d1} är mindre än ${d2}, är bitarna i 1/${d1} större.` : `Step 3: Since ${d1} is smaller than ${d2}, the pieces in 1/${d1} are larger.` },
                    { text: lang === 'sv' ? `Svar: ${correct}` : `Answer: ${correct}` }
                ]
            };
        }

        const d = MathUtils.randomChoice([3, 4, 5, 8, 10]);
        const partVal = MathUtils.randomInt(10, 50);
        const total = d * partVal;

        if (v === 'part_inverse') {
            return {
                renderData: { description: lang === 'sv' ? `Om 1/${d} av ett tal är ${partVal}, vad är då hela talet?` : `If 1/${d} of a number is ${partVal}, what is the whole number?`, answerType: 'numeric' },
                token: this.toBase64(total.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? `Steg 1: Om en del utav ${d} är värd ${partVal}, så består helheten av ${d} sådana delar.` : `Step 1: If one part out of ${d} is worth ${partVal}, then the whole consists of ${d} such parts.` },
                    { text: lang === 'sv' ? "Steg 2: För att hitta totalen multiplicerar vi delens värde med antalet delar." : "Step 2: To find the total, we multiply the value of the part by the number of parts." },
                    { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `${partVal} · ${d} = ${total}` },
                    { text: lang === 'sv' ? `Svar: ${total}` : `Answer: ${total}` }
                ]
            };
        }

        return {
            renderData: { description: lang === 'sv' ? `Beräkna 1/${d} av ${total}.` : `Calculate 1/${d} of ${total}.`, answerType: 'numeric' },
            token: this.toBase64(partVal.toString()), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? `Steg 1: Att hitta 1/${d} innebär att du ska dela ${total} i ${d} lika stora delar.` : `Step 1: Finding 1/${d} means you should divide ${total} into ${d} equal parts.` },
                { text: lang === 'sv' ? "Steg 2: Utför divisionen." : "Step 2: Perform the division." },
                { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `${total} / ${d} = ${partVal}` },
                { text: lang === 'sv' ? `Svar: ${partVal}` : `Answer: ${partVal}` }
            ]
        };
    }

    // --- LEVEL 3: MIXED & IMPROPER ---
    private level3_MixedImproper(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'mixed_bounds', type: 'concept' },
            { key: 'mixed_convert_imp', type: 'calculate' },
            { key: 'mixed_convert_mix', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const w = MathUtils.randomInt(2, 5), d = MathUtils.randomInt(3, 6), n = MathUtils.randomInt(1, d - 1);
        const impN = w * d + n;

        if (v === 'mixed_bounds') {
            const correct = `${w} och ${w + 1}`;
            return {
                renderData: {
                    description: lang === 'sv' ? `Mellan vilka två heltal ligger bråket ${impN}/${d}?` : `Between which two integers does the fraction ${impN}/${d} lie?`,
                    answerType: 'multiple_choice', options: MathUtils.shuffle([correct, `${w - 1} och ${w}`, `${w + 1} och ${w + 2}`])
                },
                token: this.toBase64(correct), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Ta reda på hur många 'hela' som ryms i bråket genom division." : "Step 1: Find out how many 'wholes' fit in the fraction by dividing." },
                    { text: lang === 'sv' ? `${impN} dividerat med ${d} är ${w} med en rest.` : `${impN} divided by ${d} is ${w} with a remainder.`, latex: `${impN} / ${d} = ${w} \\text{ rest } ${n}` },
                    { text: lang === 'sv' ? `Steg 2: Detta betyder att talet är större än ${w} men mindre än nästa heltal (${w+1}).` : `Step 2: This means the number is larger than ${w} but smaller than the next integer (${w+1}).` },
                    { text: lang === 'sv' ? `Svar: ${correct}` : `Answer: ${w} and ${w+1}` }
                ]
            };
        }

        if (v === 'mixed_convert_imp') {
            return {
                renderData: { description: lang === 'sv' ? "Skriv om från blandad form till bråkform." : "Rewrite from mixed form to an improper fraction.", latex: `${w}\\frac{${n}}{${d}}`, answerType: 'fraction' },
                token: this.toBase64(`${impN}/${d}`), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Varje heltal består av nämnarens antal delar." : "Step 1: Each whole consists of the number of parts indicated by the denominator." },
                    { text: lang === 'sv' ? `Steg 2: Multiplicera antalet hela (${w}) med nämnaren (${d}).` : `Step 2: Multiply the number of wholes (${w}) by the denominator (${d}).`, latex: `${w} · ${d} = ${w*d}` },
                    { text: lang === 'sv' ? `Steg 3: Lägg till de extra delarna i täljaren (${n}).` : `Step 3: Add the extra parts in the numerator (${n}).`, latex: `${w*d} + ${n} = ${impN}` },
                    { text: lang === 'sv' ? "Steg 4: Behåll samma nämnare i svaret." : "Step 4: Keep the same denominator in the answer." },
                    { text: lang === 'sv' ? `Svar: ${impN}/${d}` : `Answer: ${impN}/${d}` }
                ]
            };
        }

        return {
            renderData: { description: lang === 'sv' ? "Skriv om bråket till blandad form." : "Rewrite the fraction to mixed form.", latex: `\\frac{${impN}}{${d}}`, answerType: 'fraction' },
            token: this.toBase64(`${w} ${n}/${d}`), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Se hur många hela gånger nämnaren går i täljaren." : "Step 1: See how many whole times the denominator goes into the numerator." },
                { text: lang === 'sv' ? "Steg 2: Utför divisionen." : "Step 2: Perform the division.", latex: `${impN} / ${d} = ${w} \\text{ hela}` },
                { text: lang === 'sv' ? `Steg 3: Räkna ut resten. Det är vad som blir kvar.` : `Step 3: Calculate the remainder. That is what is left over.`, latex: `${impN} - (${w} · ${d}) = ${n}` },
                { text: lang === 'sv' ? "Steg 4: Skriv heltalen först och resten som ett bråk efteråt." : "Step 4: Write the wholes first and the remainder as a fraction after." },
                { text: lang === 'sv' ? `Svar: ${w} ${n}/${d}` : `Answer: ${w} ${n}/${d}` }
            ]
        };
    }

    // --- LEVEL 4: SIMPLIFY & EXTEND ---
    private level4_SimplifyExtend(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'simplify_concept', type: 'concept' },
            { key: 'simplify_missing', type: 'calculate' },
            { key: 'simplify_calc', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        let n = MathUtils.randomInt(1, 5), d = MathUtils.randomInt(n + 1, 10);
        while (this.gcd(n, d) !== 1) { n = MathUtils.randomInt(1, 5); d = MathUtils.randomInt(n + 1, 10); }

        if (v === 'simplify_concept') {
            const opts = lang === 'sv' ? ["Värdet är detsamma", "Värdet blir större", "Värdet blir mindre"] : ["The value remains the same", "The value becomes larger", "The value becomes smaller"];
            return {
                renderData: { description: lang === 'sv' ? "Vad händer med ett bråks värde om vi förlänger det?" : "What happens to a fraction's value if we extend it?", answerType: 'multiple_choice', options: MathUtils.shuffle(opts) },
                token: this.toBase64(opts[0]), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Att förlänga innebär att vi multiplicerar både täljare och nämnare med samma tal." : "Step 1: Extending means multiplying both numerator and denominator by the same number." },
                    { text: lang === 'sv' ? "Steg 2: Vi ändrar hur bråket skrivs (fler bitar, men mindre bitar), men den totala mängden ändras inte." : "Step 2: We change how the fraction is written (more pieces, but smaller pieces), but the total amount does not change." },
                    { text: lang === 'sv' ? `Svar: ${opts[0]}` : `Answer: ${opts[0]}` }
                ]
            };
        }

        const f = MathUtils.randomInt(2, 6);
        if (v === 'simplify_missing') {
            return {
                renderData: { description: lang === 'sv' ? "Hitta det tal som saknas för att likheten ska stämma." : "Find the missing number for the equality to be true.", latex: `\\frac{${n}}{${d}} = \\frac{?}{${d*f}}`, answerType: 'numeric' },
                token: this.toBase64((n*f).toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: För att två bråk ska vara lika värda måste de ha skalats med samma faktor." : "Step 1: For two fractions to be equal, they must have been scaled by the same factor." },
                    { text: lang === 'sv' ? `Steg 2: Titta på nämnarna. Vad har ${d} multiplicerats med för att bli ${d*f}?` : `Step 2: Look at the denominators. What has ${d} been multiplied by to become ${d*f}?` },
                    { text: lang === 'sv' ? "Division:" : "Division:", latex: `${d*f} / ${d} = ${f}` },
                    { text: lang === 'sv' ? `Steg 3: Eftersom nämnaren multiplicerats med ${f}, måste täljaren också multipliceras med ${f}.` : `Step 3: Since the denominator was multiplied by ${f}, the numerator must also be multiplied by ${f}.` },
                    { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `${n} · ${f} = ${n*f}` },
                    { text: lang === 'sv' ? `Svar: ${n*f}` : `Answer: ${n*f}` }
                ]
            };
        }

        return {
            renderData: { description: lang === 'sv' ? "Förkorta bråket så långt som möjligt (enklaste form)." : "Simplify the fraction as much as possible (simplest form).", latex: `\\frac{${n*f}}{${d*f}}`, answerType: 'fraction' },
            token: this.toBase64(`${n}/${d}`), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Att förkorta innebär att vi letar efter ett tal som båda siffrorna kan delas med." : "Step 1: Simplifying means looking for a number that both digits can be divided by." },
                { text: lang === 'sv' ? `Steg 2: Hitta det största talet (största gemensamma delare) för ${n*f} och ${d*f}.` : `Step 2: Find the largest number (greatest common divisor) for ${n*f} and ${d*f}.` },
                { text: lang === 'sv' ? `Steg 3: Dividera både täljare och nämnare med ${f}.` : `Step 3: Divide both the numerator and the denominator by ${f}.` },
                { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `\\frac{${n*f} / ${f}}{${d*f} / ${f}} = \\frac{${n}}{${d}}` },
                { text: lang === 'sv' ? `Svar: ${n}/${d}` : `Answer: ${n}/${d}` }
            ]
        };
    }

    // --- LEVEL 5: DECIMALS (BENCHMARKS & MULTIPLES) ---
    private level5_Decimals(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'decimal_inequality', type: 'concept' },
            { key: 'decimal_to_dec', type: 'calculate' },
            { key: 'decimal_to_frac', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        const benchmarks = [
            { n: 1, d: 2, dec: 0.5 }, { n: 1, d: 4, dec: 0.25 }, { n: 3, d: 4, dec: 0.75 },
            { n: 1, d: 5, dec: 0.2 }, { n: 2, d: 5, dec: 0.4 }, { n: 3, d: 5, dec: 0.6 }, { n: 4, d: 5, dec: 0.8 },
            { n: 1, d: 10, dec: 0.1 }, { n: 7, d: 10, dec: 0.7 }, { n: 1, d: 3, dec: 0.33 }, { n: 2, d: 3, dec: 0.67 }
        ];
        const pair = MathUtils.randomChoice(benchmarks);
        const decStr = pair.dec.toString().replace('.', ',');

        if (v === 'decimal_inequality') {
            const offset = MathUtils.randomChoice([-0.1, 0.05, 0.1]);
            const compareVal = Math.round((pair.dec + offset) * 100) / 100;
            const correct = pair.dec > compareVal ? '>' : '<';
            return {
                renderData: { 
                    description: lang === 'sv' ? "Vilket tecken passar bäst i cirkeln?" : "Which sign fits best in the circle?", 
                    latex: `\\frac{${pair.n}}{${pair.d}} \\quad \\bigcirc \\quad ${compareVal.toString().replace('.', ',')}`, 
                    answerType: 'multiple_choice', options: ['<', '>', '='] 
                },
                token: this.toBase64(correct), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Omvandla bråket till ett decimaltal för att lättare kunna jämföra." : "Step 1: Convert the fraction to a decimal to compare more easily." },
                    { text: lang === 'sv' ? `Steg 2: Bråket ${pair.n}/${pair.d} motsvarar decimaltalet ${decStr}.` : `Step 2: The fraction ${pair.n}/${pair.d} corresponds to the decimal ${decStr}.` },
                    { text: lang === 'sv' ? `Steg 3: Jämför nu ${decStr} med ${compareVal.toString().replace('.', ',')}.` : `Step 3: Now compare ${decStr} with ${compareVal.toString().replace('.', ',')}.` },
                    { text: lang === 'sv' ? `Svar: ${correct}` : `Answer: ${correct}` }
                ]
            };
        }

        if (v === 'decimal_to_dec') {
            return {
                renderData: { description: lang === 'sv' ? "Skriv bråket som ett decimaltal." : "Write the fraction as a decimal.", latex: `\\frac{${pair.n}}{${pair.d}}`, answerType: 'numeric' },
                token: this.toBase64(pair.dec.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Bråkstrecket betyder division. Vi ska dividera täljaren med nämnaren." : "Step 1: The fraction bar means division. We divide the numerator by the denominator." },
                    { text: lang === 'sv' ? `Steg 2: Räkna ut ${pair.n} / ${pair.d}.` : `Step 2: Calculate ${pair.n} / ${pair.d}.` },
                    { text: lang === 'sv' ? "Tips: Vissa bråk är bra att ha memorerade, som detta." : "Tip: Certain fractions are good to have memorized, like this one." },
                    { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `${pair.n} / ${pair.d} = ${pair.dec}` },
                    { text: lang === 'sv' ? `Svar: ${decStr}` : `Answer: ${pair.dec}` }
                ]
            };
        }

        return {
            renderData: { description: lang === 'sv' ? "Skriv decimaltalet som ett bråk i enklaste form." : "Write the decimal as a fraction in simplest form.", latex: decStr, answerType: 'fraction' },
            token: this.toBase64(`${pair.n}/${pair.d}`), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? `Steg 1: Läs ut decimaltalet. ${decStr} motsvarar en viss andel av helheten.` : `Step 1: Read the decimal. ${decStr} corresponds to a certain share of the whole.` },
                { text: lang === 'sv' ? "Steg 2: Skriv decimaltalet som ett bråk med t.ex. 100 som nämnare." : "Step 2: Write the decimal as a fraction with e.g. 100 as the denominator.", latex: `\\frac{${pair.dec * 100}}{100}` },
                { text: lang === 'sv' ? "Steg 3: Förkorta bråket så långt det går." : "Step 3: Simplify the fraction as much as possible." },
                { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `\\frac{${pair.n}}{${pair.d}}` },
                { text: lang === 'sv' ? `Svar: ${pair.n}/${pair.d}` : `Answer: ${pair.n}/${pair.d}` }
            ]
        };
    }
}