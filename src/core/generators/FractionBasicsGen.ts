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
            const sLie = p < 50 ? (lang === 'sv' ? "Mer än hälften" : "More than half") : (lang === 'sv' ? "More than half" : "Less than half");

            return {
                renderData: {
                    description: lang === 'sv' ? "Titta på rutan. Vilket påstående stämmer INTE?" : "Look at the grid. Which statement is NOT correct?",
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([`${p}\\%`, `\\frac{${p / div}}{${100 / div}}`, sLie]),
                    geometry: { type: 'percent_grid', total: 100, colored: p }
                },
                token: this.toBase64(sLie), variationKey: v, type: 'concept',
                clues: [
                    { 
                        text: lang === 'sv' ? "Hela stora rutan har 100 småbitar totalt, vilket motsvarar 100%." : "The whole large grid has 100 small squares in total, matching 100%.", 
                        latex: `\\text{Totalt} = 100\\%` 
                    },
                    { 
                        text: lang === 'sv' ? `Räknar vi de färgade rutorna får vi det till ${p} stycken, vilket kan skrivas som bråket \\frac{${p}}{100}.` : `Counting the colored squares gives us exactly ${p}, which can be written as the fraction \\frac{${p}}{100}.`, 
                        latex: `\\text{Färgade} = \\frac{${p}}{100}` 
                    },
                    { 
                        text: lang === 'sv' ? `Dela (förkorta) bråket uppe och nere med ${div} för att göra det lättare att läsa: det blir \\frac{${p/div}}{${100/div}}.` : `Divide the fraction top and bottom by ${div} to make it simpler: it becomes \\frac{${p/div}}{${100/div}}.`, 
                        latex: `\\frac{${p}}{100} = \\frac{${p} \\div ${div}}{100 \\div ${div}} = \\frac{${p/div}}{${100/div}}` 
                    },
                    { 
                        // Bytte 'pct' mot 'p'
                        text: lang === 'sv' ? (p < 50 ? `Eftersom ${p}% är mindre än hälften (50%), blir påståendet "${sLie}" helt felaktigt.` : `Eftersom ${p}% är mer än hälften (50%), blir påståendet "${sLie}" helt felaktigt.`) : (p < 50 ? `Since ${p}% is less than half (50%), the statement "${sLie}" is completely wrong.` : `Since ${p}% is more than half (50%), the statement "${sLie}" is completely wrong.`), 
                        latex: p < 50 ? `${p}\\% < 50\\% \\rightarrow \\mathbf{\\text{Fel: ${sLie}}}` : `${p}\\% > 50\\% \\rightarrow \\mathbf{\\text{Fel: ${sLie}}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${sLie}` : `Answer: ${sLie}`, 
                        latex: `\\text{${sLie}}` 
                    }
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
                    { 
                        text: lang === 'sv' ? `Att hitta en ${d}-del av någonting betyder helt enkelt att vi delar upp hela högen i ${d} lika stora grupper.` : `Finding a ${d}-th of something simply means dividing the whole pile into ${d} equal groups.`, 
                        latex: `\\text{Totalt} = ${total}` 
                    },
                    { 
                        text: lang === 'sv' ? `Dela startantalet (${total}) med siffran där nere (${d}) för att få reda på storleken på en grupp.` : `Divide the starting number (${total}) by the bottom number (${d}) to find out the size of one single group.`, 
                        latex: `\\frac{${total}}{\\mathbf{${d}}} = \\mathbf{${count}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${count}` : `Answer: ${count}`, 
                        latex: `${count}` 
                    }
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
                { 
                    text: lang === 'sv' ? "Bråk handlar om andelar. Vi skriver det alltid som: Siffran vi söker däruppe, och Alla bitar totalt där nere." : "Fractions are about shares. We always write it as: The count we are looking for on top, and All pieces in total on the bottom.", 
                    latex: `\\text{Andel} = \\frac{\\text{Delen}}{\\text{Hela totalt}}` 
                },
                { 
                    text: lang === 'sv' ? `Räkna först hur många kulor som är ${cName}. Det finns exakt ${cVal} stycken.` : `First, count how many marbles are ${cName}. There are exactly ${cVal} of them.`, 
                    latex: `\\text{Sökta delar} = \\mathbf{${cVal}}` 
                },
                { 
                    text: lang === 'sv' ? `Räkna sedan ut hur många kulor det finns i bilden totalt: ${r} + ${b} + ${g} blir ${tot}.` : `Next, figure out how many marbles there are in the image in total: ${r} + ${b} + ${g} equals ${tot}.`, 
                    latex: `\\text{Hela totalt} = ${r} + ${b} + ${g} = \\mathbf{${tot}}` 
                },
                { 
                    text: lang === 'sv' ? "Ställ upp bråkstrecket med dina två räknade siffror:" : "Set up the fraction bar with your two calculated numbers:", 
                    latex: `\\text{Andel} = \\frac{\\mathbf{${cVal}}}{\\mathbf{${tot}}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${cVal}/${tot}` : `Answer: ${cVal}/${tot}`, 
                    latex: `\\frac{${cVal}}{${tot}}` 
                }
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
                    description: lang === 'sv' ? "Vilket bråk ger dig den STÖRSTA tårtbiten?" : "Which fraction gives you the LARGEST slice of cake?",
                    answerType: 'multiple_choice', options: MathUtils.shuffle([`\\frac{1}{${d1}}`, `\\frac{1}{${d2}}`, `\\frac{1}{${d2 + 2}}`])
                },
                token: this.toBase64(correct), variationKey: v, type: 'concept',
                clues: [
                    { 
                        text: lang === 'sv' ? "Siffran där nere berättar hur många bitar vi har delat tårtan i totalt." : "The number at the bottom tells us how many pieces we divided the cake into in total.", 
                        latex: `\\text{Botten} = \\text{Antal delningar}` 
                    },
                    { 
                        text: lang === 'sv' ? "Tänk efter själv: Ju FLER kompisar du delar tårtan med (större siffra i botten), desto MINDRE blir varje enskild bit!" : "Think about it: The MORE friends you share the cake with (larger number at the bottom), the SMALLER each individual slice becomes!", 
                        latex: `\\frac{1}{${d1}} \\quad \\text{vs} \\quad \\frac{1}{${d2}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Eftersom talet ${d1} är mindre än ${d2}, betyder det att tårtan delas i färre bitar. Därför är bitarna i det här bråket mycket större:` : `Since the number ${d1} is smaller than ${d2}, it means the cake is split into fewer pieces. Therefore, the slices in this fraction are much larger:`, 
                        latex: `\\mathbf{\\frac{1}{${d1}}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: 1/${d1}` : `Answer: 1/${d1}`, 
                        latex: `\\frac{1}{${d1}}` 
                    }
                ]
            };
        }

        const d = MathUtils.randomChoice([3, 4, 5, 8, 10]);
        const partVal = MathUtils.randomInt(10, 50);
        const total = d * partVal;

        if (v === 'part_inverse') {
            return {
                renderData: { description: lang === 'sv' ? `Om en ${d}-del (1/${d}) av ett dolt tal är ${partVal}, vad är då hela talet totalt?` : `If one ${d}-th (1/${d}) of a hidden number is ${partVal}, what is the whole number in total?`, answerType: 'numeric' },
                token: this.toBase64(total.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? `Om en enda ensam bit är värd ${partVal}, och hela figuren består av totalt ${d} likadana bitar:` : `If one single piece is worth ${partVal}, and the entire figure consists of a total of ${d} identical pieces:`, 
                        latex: `\\frac{1}{${d}} = ${partVal}` 
                    },
                    { 
                        text: lang === 'sv' ? `Då hittar vi hela talet genom att köra baklänges och gångra bitens värde med det totala antalet bitar (${d}).` : `Then we find the whole number by working backwards and multiplying the piece value by the total number of parts (${d}).`, 
                        latex: `\\text{Hela talet} = ${partVal} \\mathbf{\\cdot ${d}}` 
                    },
                    { 
                        text: lang === 'sv' ? "Räkna ut gångertalet för att få fram slutsvar." : "Calculate the multiplication to reach your final answer total.", 
                        latex: `\\text{Hela talet} = \\mathbf{${total}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${total}` : `Answer: ${total}`, 
                        latex: `${total}` 
                    }
                ]
            };
        }

        return {
            renderData: { description: lang === 'sv' ? `Beräkna 1/${d} av ${total}.` : `Calculate 1/${d} of ${total}.`, answerType: 'numeric' },
            token: this.toBase64(partVal.toString()), variationKey: v, type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? `Att räkna ut 1/${d} av ett värde betyder helt enkelt att du ska dela upp talet ${total} i ${d} lika stora bitar.` : `Calculating 1/${d} of a value simply means you should divide the number ${total} into ${d} equal pieces.`, 
                    latex: `\\frac{1}{${d}} \\cdot ${total}` 
                },
                { 
                    text: lang === 'sv' ? `Utför divisionen direkt genom att ta talet delat med ${d}:` : `Perform the division directly by taking the value divided by ${d}:`, 
                    latex: `= \\frac{${total}}{\\mathbf{${d}}}` 
                },
                { 
                    text: lang === 'sv' ? "Räkna ut bråket för att få fram svaret." : "Calculate the fraction result to reach your answer.", 
                    latex: `= \\mathbf{${partVal}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${partVal}` : `Answer: ${partVal}`, 
                    latex: `${partVal}` 
                }
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
                    description: lang === 'sv' ? `Mellan vilka två hela siffror ligger bråket \\frac{${impN}}{${d}}?` : `Between which two whole numbers does the fraction \\frac{${impN}}{${d}} lie?`,
                    answerType: 'multiple_choice', options: MathUtils.shuffle([correct, `${w - 1} och ${w}`, `${w + 1} och ${w + 2}`])
                },
                token: this.toBase64(correct), variationKey: v, type: 'concept',
                clues: [
                    { 
                        text: lang === 'sv' ? `Ett tungt bråk betyder division. Vi kollar helt enkelt hur många hela pajer vi kan pussla ihop av ${impN} bitar om varje paj har ${d} bitar.` : `A top-heavy fraction means division. Let's see how many whole pies we can build out of ${impN} slices if each pie contains ${d} slices.`, 
                        latex: `\\frac{${impN}}{${d}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Dela täljaren med ${d}: Det går ${w} hela gånger, och sedan får vi några småbitar kvar över (en rest på ${n}).` : `Divide the top by ${d}: It goes ${w} whole times, and then we have a few loose slices left over (a remainder of ${n}).`, 
                        latex: `\\frac{${impN}}{${d}} = \\mathbf{${w}} \\quad \\text{med rest } ${n}` 
                    },
                    { 
                        text: lang === 'sv' ? `Eftersom talet är lite mer än ${w} hela pajer, men inte tillräckligt för en till paj, ligger det mellan:` : `Since the value represents slightly more than ${w} whole pies, but not enough to make another full pie, it lies between:`, 
                        latex: `\\mathbf{${w} \\text{ och } ${w + 1}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${w} och ${w + 1}` : `Answer: ${w} and ${w + 1}`, 
                        latex: `\\text{${correct}}` 
                    }
                ]
            };
        }

        if (v === 'mixed_convert_imp') {
            return {
                renderData: { description: lang === 'sv' ? "Skriv om det här talet så att det bara blir ett enda rent bråk." : "Rewrite this expression as a single pure fraction.", latex: `${w}\\frac{${n}}{${d}}`, answerType: 'fraction' },
                token: this.toBase64(`${impN}/${d}`), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? `Vi vill göra om hela det här blandade paketet till lösa bitar. Varje hel (${w}) består av exakt ${d} stycken bitar.` : `We want to change this mixed package entirely into loose slices. Every single whole (${w}) consists of exactly ${d} individual slices.`, 
                        latex: `${w}\\frac{${n}}{${d}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Gångra antalet hela med bottensiffran för att räkna ihop bitarna: ${w} · ${d} blir ${w * d} bitar.` : `Multiply the number of wholes by the bottom number to count up those slices: ${w} · ${d} equals ${w * d} slices.`, 
                        latex: `= \\frac{\\mathbf{${w} \\cdot ${d}} + ${n}}{${d}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Plussa nu på de extra ${n} bitarna som redan stod där uppe på bråkstrecket:` : `Now add the extra ${n} slices that were already sitting on top of the fraction bar:`, 
                        latex: `= \\frac{${w * d} \\mathbf{+ ${n}}}{${d}}` 
                    },
                    { 
                        text: lang === 'sv' ? "Förenkla täljaren för att få det färdiga bråket. Bottensiffran ändras aldrig!" : "Simplify the top to reveal the final fraction. The bottom number never changes!", 
                        latex: `= \\frac{\\mathbf{${impN}}}{${d}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${impN}/${d}` : `Answer: ${impN}/${d}`, 
                        latex: `\\frac{${impN}}{${d}}` 
                    }
                ]
            };
        }

        return {
            renderData: { description: lang === 'sv' ? "Plocka ut alla hela pajer och skriv om till blandad form." : "Extract all whole pies and rewrite in mixed form.", latex: `\\frac{${impN}}{${d}}`, answerType: 'fraction' },
            token: this.toBase64(`${w} ${n}/${d}`), variationKey: v, type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? `Det här bråket är tungt i toppen. Vi letar efter hur många hela paket (${d}/${d}) som gömmer sig inuti ${impN}.` : `This fraction is heavy on top. Let's find out how many whole packages (${d}/${d}) are hiding inside ${impN}.`, 
                    latex: `\\frac{${impN}}{${d}}` 
                },
                { 
                    text: lang === 'sv' ? `Kolla hur många gånger ${d} går jämnt upp i ${impN}. Det går exakt ${w} hela gånger.` : `See how many whole times ${d} divides evenly into ${impN}. It goes exactly ${w} whole times.`, 
                    latex: `= \\mathbf{${w}} \\text{ hela} + \\text{resten}` 
                },
                { 
                    text: lang === 'sv' ? `Räkna ut hur många småbitar som blir över som en rest: ${impN} minus de använda (${w} · ${d}) lämnar ${n} bitar kvar.` : `Calculate how many small slices are left over as a remainder: ${impN} minus the used ones (${w} · ${d}) leaves ${n} slices.`, 
                    latex: `\\text{Rest} = ${impN} - \\mathbf{(${w} \\cdot ${d})} = \\mathbf{${n}}` 
                },
                { 
                    text: lang === 'sv' ? "Skriv ut de stora hela siffrorna först och sätt resten som ett litet bråk precis efteråt:" : "Write down the large whole numbers first and attach the remaining slices as a small fraction right after:", 
                    latex: `= \\mathbf{${w}\\frac{${n}}{${d}}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${w} ${n}/${d}` : `Answer: ${w} ${n}/${d}`, 
                    latex: `${w}\\frac{${n}}{${d}}` 
                }
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
            const opts = lang === 'sv' ? ["Storleken förblir exakt densamma", "Värdet blir mycket större", "Värdet blir mycket mindre"] : ["The value remains exactly the same", "The value becomes larger", "The value becomes smaller"];
            return {
                renderData: { description: lang === 'sv' ? "Vad händer med ett bråks verkliga värde om vi förlänger det?" : "What happens to a fraction's actual value if we extend it?", answerType: 'multiple_choice', options: MathUtils.shuffle(opts) },
                token: this.toBase64(opts[0]), variationKey: v, type: 'concept',
                clues: [
                    { 
                        text: lang === 'sv' ? "Att förlänga betyder bara att vi skär tårtan i FLER bitar, men varje bit blir samtidigt på motsvarande sätt MINDRE." : "Extending simply means cutting the pie into MORE pieces, but each slice simultaneously becomes correspondingly SMALLER.", 
                        latex: `\\frac{1}{2} = \\frac{1 \\cdot 2}{2 \\cdot 2} = \\frac{2}{4}` 
                    },
                    { 
                        text: lang === 'sv' ? "Eftersom vi har fler bitar men mindre storlek, ändras aldrig mängden mat på tallriken. Värdet är ständigt detsamma!" : "Since we have more pieces but a smaller size, the total amount of food on the plate never changes. The value remains exactly identical!", 
                        latex: `\\frac{1}{2} = \\mathbf{\\frac{2}{4}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${opts[0]}` : `Answer: ${opts[0]}`, 
                        latex: `\\text{${opts[0]}}` 
                    }
                ]
            };
        }

        const f = MathUtils.randomInt(2, 6);
        if (v === 'simplify_missing') {
            return {
                renderData: { description: lang === 'sv' ? "Hitta den siffra som saknas på platsen för frågetecknet." : "Find the missing digit in place of the question mark.", latex: `\\frac{${n}}{${d}} = \\frac{?}{${d * f}}`, answerType: 'numeric' },
                token: this.toBase64((n * f).toString()), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? "För att två bråk ska ha exakt samma värde, måste de ha skalats upp eller ner med samma dolda faktor." : "For two fractions to carry exactly the same value, they must be scaled up or down by the same hidden scaling factor.", 
                        latex: `\\frac{${n}}{${d}} = \\frac{?}{${d * f}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Kika på bottensiffrorna. Vad har ${d} gångrats med för att förvandlas till ${d * f}? Det har gångrats med ${f}.` : `Look closely at the bottom digits. What has ${d} been multiplied by to turn into ${d * f}? It was multiplied by ${f}.`, 
                        latex: `${d} \\cdot \\mathbf{${f}} = ${d * f}` 
                    },
                    { 
                        text: lang === 'sv' ? `Eftersom botten har skalats upp med ${f}, måste vi göra exakt samma sak där uppe och gångra ${n} med ${f}.` : `Since the bottom has been scaled up by ${f}, we must execute exactly the same step on top and multiply ${n} by ${f}.`, 
                        latex: `? = ${n} \\cdot \\mathbf{${f}}` 
                    },
                    { 
                        text: lang === 'sv' ? "Räkna ut multiplikationen för att avslöja det saknade talet." : "Compute the multiplication to reveal the missing number.", 
                        latex: `? = \\mathbf{${n * f}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${n * f}` : `Answer: ${n * f}`, 
                        latex: `${n * f}` 
                    }
                ]
            };
        }

        return {
            renderData: { description: lang === 'sv' ? "Gör bråket så enkelt som möjligt genom att förkorta bort gemensamma gånger-faktorer." : "Make the fraction as simple as possible by dividing away common multiplier factors.", latex: `\\frac{${n * f}}{${d * f}}`, answerType: 'fraction' },
            token: this.toBase64(`${n}/${d}`), variationKey: v, type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? "Att förkorta betyder att vi letar efter en siffra som vi kan dela (dividera) både täljaren och nämnaren med." : "Simplifying means searching for a number that we can cleanly divide both the top and bottom digits by.", 
                    latex: `\\frac{${n * f}}{${d * f}}` 
                },
                { 
                    text: lang === 'sv' ? `Vi ser att både ${n * f} och ${d * f} finns med i ${f}-ans multiplikationstabell. Vi kan dela båda sidor med ${f}.` : `We spot that both ${n * f} and ${d * f} belong to the ${f}-times multiplication table. We can divide both positions by ${f}.`, 
                    latex: `= \\frac{${n * f} \\mathbf{\\div ${f}}}{${d * f} \\mathbf{\\div ${f}}}` 
                },
                { 
                    text: lang === 'sv' ? "Räkna ut divisionerna för att skala ner bråket till sin allra enklaste form:" : "Compute the divisions to scale down the fraction to its absolute simplest form:", 
                    latex: `= \\mathbf{\\frac{${n}}{${d}}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${n}/${d}` : `Answer: ${n}/${d}`, 
                    latex: `\\frac{${n}}{${d}}` 
                }
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
            const compStr = compareVal.toString().replace('.', ',');

            return {
                renderData: { 
                    description: lang === 'sv' ? "Vilken näbb eller tecken passar bäst i cirkeln?" : "Which inequality sign fits best inside the circle?", 
                    latex: `\\frac{${pair.n}}{${pair.d}} \\quad \\bigcirc \\quad ${compStr}`, 
                    answerType: 'multiple_choice', options: ['<', '>', '='] 
                },
                token: this.toBase64(correct), variationKey: v, type: 'concept',
                clues: [
                    { 
                        text: lang === 'sv' ? "För att enkelt kunna jämföra bråket med decimaltalet gör vi om bråkbiten till vanliga fula decimalsiffror först." : "To easily compare the fraction against the decimal value, let's convert the fraction slice into regular decimal format first.", 
                        latex: `\\frac{${pair.n}}{${pair.d}} \\quad \\bigcirc \\quad ${compStr}` 
                    },
                    { 
                        text: lang === 'sv' ? `Kom ihåg tabellvärdet: Bråket \\frac{${pair.n}}{${pair.d}} motsvarar decimaltalet ${decStr}.` : `Recall the standard grid value: The fraction \\frac{${pair.n}}{${pair.d}} corresponds exactly to the decimal ${decStr}.`, 
                        latex: `\\mathbf{${decStr}} \\quad \\bigcirc \\quad ${compStr}` 
                    },
                    { 
                        text: lang === 'sv' ? `Jämför nu siffrorna precis som kronor och ören: Är ${decStr} kr mer eller mindre än ${compStr} kr?` : `Now compare those tracking values just like cash: Is ${decStr} larger or smaller than ${compStr}?`, 
                        latex: `${decStr} \\mathbf{${correct}} ${compStr}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${correct}` : `Answer: ${correct}`, 
                        latex: `\\text{${correct}}` 
                    }
                ]
            };
        }

        if (v === 'decimal_to_dec') {
            return {
                renderData: { description: lang === 'sv' ? "Gör om det här bråket till ett decimaltal." : "Convert this fraction into a decimal number.", latex: `\\frac{${pair.n}}{${pair.d}}`, answerType: 'numeric' },
                token: this.toBase64(pair.dec.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? "Kom ihåg att bråkstrecket egentligen bara betyder delat med (division). Vi ska dela täljaren med nämnaren." : "Remember that a fraction bar actually just means divided by (division). We simply divide the top number by the bottom number.", 
                        latex: `\\frac{${pair.n}}{${pair.d}} = ${pair.n} \\div ${pair.d}` 
                    },
                    { 
                        // Bytte 'b' mot 'pair.d' i den engelska texten
                        text: lang === 'sv' ? `Utför divisionen: ${pair.n} delat med ${pair.d} ger oss decimalvärdet:` : `Perform the division: ${pair.n} divided by ${pair.d} yields the decimal value:`, 
                        latex: `${pair.n} \\div ${pair.d} = \\mathbf{${decStr}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${decStr}` : `Answer: ${pair.dec}`, 
                        latex: `${decStr}` 
                    }
                ]
            };
        }

        return {
            renderData: { description: lang === 'sv' ? "Gör om det här decimaltalet till ett bråk i sin allra enklaste form." : "Convert this decimal value into a fraction in its absolute simplest form.", latex: decStr, answerType: 'fraction' },
            token: this.toBase64(`${pair.n}/${pair.d}`), variationKey: v, type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? `Vi läser ut decimaltalet: Siffran ${decStr} betyder ${pair.dec * 100} hundradelar av en helhet.` : `Let's read the decimal value aloud: The layout ${decStr} represents exactly ${pair.dec * 100} hundredths of a whole piece.`, 
                    latex: `${decStr} = \\frac{${pair.dec * 100}}{100}` 
                },
                { 
                    text: lang === 'sv' ? `Nu ska vi skala ner (förkorta) det här bråket så långt det bara går genom att dela uppe och nere tills det blir helt stopp.` : `Now we must scale down (simplify) this fraction as far as possible by dividing top and bottom positions until it cannot reduce further.`, 
                    latex: `\\frac{${pair.dec * 100}}{100} = \\frac{${pair.dec * 100} \\div \\mathbf{${100 / pair.d}}}{100 \\div \\mathbf{${100 / pair.d}}}` 
                },
                { 
                    text: lang === 'sv' ? "Förenkla divisionerna för att få fram det slutgiltiga bråket:" : "Simplify the division calculations to yield the final targeted fraction mapping:", 
                    latex: `= \\mathbf{\\frac{${pair.n}}{${pair.d}}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${pair.n}/${pair.d}` : `Answer: ${pair.n}/${pair.d}`, 
                    latex: `\\frac{${pair.n}}{${pair.d}}` 
                }
            ]
        };
    }
}