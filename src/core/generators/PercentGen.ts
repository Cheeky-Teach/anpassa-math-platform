import { MathUtils } from '../utils/MathUtils.js';
import { enrichQuestionMetadata } from '../utils/WordProblemDecorator.js';

export class PercentGen {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        // Adaptive Fallback: If Level 1 concepts are mastered, push to Level 2 Mental Math
        if (level === 1 && options.hideConcept && options.exclude?.includes('visual_translation')) {
            return this.level2_MentalMath(lang, undefined, options);
        }

        let questionData: any;

        switch (level) {
            case 1: questionData = this.level1_ConceptsAndVisuals(lang, undefined, options); break;
            case 2: questionData = this.level2_MentalMath(lang, undefined, options); break;
            case 3: questionData = this.level3_BuildingBlocks(lang, undefined, options); break;
            case 4: questionData = this.level4_PercentEquation(lang, undefined, options); break;
            case 5: questionData = this.level5_ReversePercentage(lang, undefined, options); break;
            case 6: questionData = this.level6_PercentageChange(lang, undefined, options); break;
            default: questionData = this.level1_ConceptsAndVisuals(lang, undefined, options); break;
        }

        // 🟢 Run through the decorator
        enrichQuestionMetadata(questionData);

        // 🟢 Practice Mode Level-Wide Override
        const WORD_PROBLEM_ELIGIBLE_LEVELS = [2, 3, 4, 5, 6];
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
            case 'visual_translation':
            case 'visual_lie':
            case 'equivalence':
            case 'equivalence_basic_frac':
            case 'equivalence_basic_dec':
                return this.level1_ConceptsAndVisuals(lang, key);
            case 'benchmark_calc':
            case 'benchmark_inverse':
            case 'benchmark_commutative':
                return this.level2_MentalMath(lang, key);
            case 'composition':
            case 'decomposition':
            case 'estimation':
                return this.level3_BuildingBlocks(lang, key);
            case 'find_percent_basic':
            case 'find_percent_test':
            case 'find_percent_discount':
            case 'find_percent_group':
                return this.level4_PercentEquation(lang, key);
            case 'reverse_find_whole':
            case 'reverse_scaling':
            case 'reverse_concept':
                return this.level5_ReversePercentage(lang, key);
            case 'change_calc':
            case 'change_multiplier':
            case 'change_trap':
                return this.level6_PercentageChange(lang, key);
            default:
                return this.generate(1, lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
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

    // --- LEVEL 1: CONCEPTS & VISUALS ---
    private level1_ConceptsAndVisuals(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'visual_translation', type: 'calculate' },
            { key: 'visual_lie', type: 'concept' },
            { key: 'equivalence_basic_frac', type: 'concept' },
            { key: 'equivalence', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'equivalence_basic_frac') {
            const facts = [
                { f: "1/2", p: "50", d: 2 }, { f: "1/3", p: "33", d: 3 }, { f: "1/4", p: "25", d: 4 },
                { f: "1/5", p: "20", d: 5 }, { f: "1/10", p: "10", d: 10 }, { f: "1/100", p: "1", d: 100 },
            ];
            const item = MathUtils.randomChoice(facts);
            return {
                renderData: {
                    description: lang === 'sv' ? `Hur många procent motsvarar bråket $${item.f}$?` : `What percentage corresponds to the fraction $${item.f}$?`,
                    answerType: 'numeric', suffix: '%'
                },
                token: this.toBase64(item.p), variationKey: v, type: 'concept',
                clues: [
                    { 
                        text: lang === 'sv' ? "Procent betyder hundradelar. Vi vill ändra bråket så att det står 100 i botten." : "Percent means hundredths. We want to change the fraction so that it has 100 at the bottom.", 
                        latex: `\\frac{1}{${item.d}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Gångra (förläng) både uppe och nere med ${100 / item.d} för att få 100 i botten.` : `Multiply both top and bottom by ${100 / item.d} to get 100 at the bottom.`, 
                        latex: `\\frac{1 \\mathbf{\\cdot ${100 / item.d}}}{${item.d} \\mathbf{\\cdot ${100 / item.d}}} = \\frac{\\mathbf{${item.p}}}{100}` 
                    },
                    { 
                        text: lang === 'sv' ? `Nu ser vi att vi har ${item.p} hundradelar, vilket är exakt ${item.p}%.` : `Now we can see we have ${item.p} hundredths, which is exactly ${item.p}%.`, 
                        latex: `\\frac{${item.p}}{100} = \\mathbf{${item.p}\\%}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${item.p}%` : `Answer: ${item.p}%`, 
                        latex: `${item.p}\\%` 
                    }
                ]
            };
        }

        if (v === 'visual_translation') {
            const colored = MathUtils.randomInt(5, 95);
            return {
                renderData: {
                    description: lang === 'sv' ? "Hur många procent av rutnätet är färgat?" : "What percentage of the grid is colored?",
                    answerType: 'numeric', suffix: '%',
                    geometry: { type: 'percent_grid', total: 100, colored: colored }
                },
                token: this.toBase64(colored.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? "Hela det stora nätet har exakt 100 små rutor totalt." : "The entire large grid has exactly 100 small squares in total.", 
                        latex: `\\text{Hela nätet} = 100 \\text{ rutor}` 
                    },
                    { 
                        text: lang === 'sv' ? "Eftersom det finns 100 rutor totalt, är varje enskild färgad ruta värd exakt 1%." : "Since there are 100 squares in total, each individual colored square is worth exactly 1%.", 
                        latex: `1 \\text{ ruta} = 1\\%` 
                    },
                    { 
                        text: lang === 'sv' ? `Räknar vi de färgade rutorna får vi det till ${colored} stycken. Det betyder ${colored} hundradelar.` : `Counting the colored squares gives us exactly ${colored}. That means ${colored} hundredths.`, 
                        latex: `\\text{Andel färgade} = \\frac{\\mathbf{${colored}}}{100} = \\mathbf{${colored}\\%}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${colored}%` : `Answer: ${colored}%`, 
                        latex: `${colored}\\%` 
                    }
                ]
            };
        }

        // Default equivalence (fraction/decimal/percent mapping)
        const p = MathUtils.randomChoice([10, 20, 25, 50, 75]);
        const dec = (p / 100).toString().replace('.', ',');
        return {
            renderData: {
                description: lang === 'sv' ? `Vilket decimaltal motsvarar ${p}%?` : `Which decimal corresponds to ${p}%?`,
                answerType: 'numeric'
            },
            token: this.toBase64(dec), variationKey: 'equivalence', type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? "Procent betyder hundradelar. Vi skriver om procentsatsen som ett bråk delat med 100." : "Percent means hundredths. We rewrite the percentage as a fraction divided by 100.", 
                    latex: `${p}\\% = \\frac{${p}}{100}` 
                },
                { 
                    text: lang === 'sv' ? `Dela ${p} med 100 genom att flytta kommatecknet två steg åt vänster.` : `Divide ${p} by 100 by moving the decimal point two places to the left.`, 
                    latex: `${p}\\% = \\mathbf{${(p / 100).toString().replace('.', ',')}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${dec}` : `Answer: ${(p / 100).toString().replace('.', ',')}`, 
                    latex: `${dec}` 
                }
            ]
        };
    }

    // --- LEVEL 2: MENTAL MATH ---
    private level2_MentalMath(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'benchmark_calc', type: 'calculate' },
            { key: 'benchmark_inverse', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        
        if (v === 'benchmark_calc') {
            const pct = MathUtils.randomChoice([10, 25, 50]);
            const divisor = pct === 10 ? 10 : (pct === 25 ? 4 : 2);
            const base = MathUtils.randomInt(4, 20) * divisor;
            const ans = base / divisor;

            return {
                renderData: {
                    description: lang === 'sv' ? `Beräkna ${pct}% av ${base}.` : `Calculate ${pct}% of ${base}.`,
                    latex: `${pct}\\% \\cdot ${base}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? (pct === 10 ? "Ett enkelt trick: 10% är exakt samma sak som en tiondel." : pct === 25 ? "Ett enkelt trick: 25% är exakt samma sak som en fjärdedel." : "Ett enkelt trick: 50% är exakt samma sak som hälften.") : (pct === 10 ? "A simple trick: 10% is exactly the same as one tenth." : pct === 25 ? "A simple trick: 25% is exactly the same as one fourth." : "A simple trick: 50% is exactly the same as half."), 
                        latex: `${pct}\\% = \\frac{1}{${divisor}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Dela därför bara hela talet ${base} med ${divisor} för att hitta svaret.` : `Therefore, just divide the total number ${base} by ${divisor} to find the answer.`, 
                        latex: `\\text{Resultat} = \\frac{${base}}{\\mathbf{${divisor}}}` 
                    },
                    { 
                        text: lang === 'sv' ? "Räkna ut divisionen:" : "Calculate the division:", 
                        latex: `\\text{Resultat} = \\mathbf{${ans}}` 
                    },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, latex: `${ans}` }
                ]
            };
        }

        const pctInv = MathUtils.randomChoice([10, 20, 25, 50]);
        const mult = pctInv === 10 ? 10 : (pctInv === 20 ? 5 : (pctInv === 25 ? 4 : 2));
        const part = MathUtils.randomInt(5, 25);
        const total = part * mult;

        return {
            renderData: {
                description: lang === 'sv' ? `Om ${pctInv}% av ett tal är ${part}, vad är då 100%?` : `If ${pctInv}% of a number is ${part}, what is 100%?`,
                latex: `${pctInv}\\% = ${part}`,
                answerType: 'numeric'
            },
            token: this.toBase64(total.toString()), variationKey: 'benchmark_inverse', type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? `Vi vet att en liten bit på ${pctInv}% är värd ${part}.` : `We know that a small piece of ${pctInv}% is worth ${part}.`, 
                    latex: `${pctInv}\\% = ${part}` 
                },
                { 
                    text: lang === 'sv' ? `Räkna ut hur många sådana bitar det går på hela talet (100%). Det går exakt ${mult} stycken bitar.` : `Find out how many such pieces fit into the whole number (100%). Exactly ${mult} pieces fit inside.`, 
                    latex: `${mult} \\cdot ${pctInv}\\% = 100\\%` 
                },
                { 
                    text: lang === 'sv' ? `Gångra (multiplicera) därför bitens värde (${part}) med ${mult} för att hitta hela talet.` : `Therefore, multiply the piece value (${part}) by ${mult} to find the full whole number total.`, 
                    latex: `100\\% = ${part} \\cdot \\mathbf{${mult}}` 
                },
                { 
                    text: lang === 'sv' ? "Räkna ut gångertalet:" : "Calculate the multiplication:", 
                    latex: `100\\% = \\mathbf{${total}}` 
                },
                { text: lang === 'sv' ? `Svar: ${total}` : `Answer: ${total}`, latex: `${total}` }
            ]
        };
    }

    // --- LEVEL 3: BUILDING BLOCKS ---
    private level3_BuildingBlocks(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'composition', type: 'calculate' },
            { key: 'decomposition', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const base = MathUtils.randomInt(2, 8) * 100;

        if (v === 'composition') {
            const pct = MathUtils.randomChoice([30, 40, 70, 80]);
            const ans = (base * pct) / 100;
            return {
                renderData: {
                    description: lang === 'sv' ? `Beräkna ${pct}% av ${base} genom att först hitta 10%.` : `Calculate ${pct}% of ${base} by first finding 10%.`,
                    latex: `${pct}\\% \\cdot ${base}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? `Hitta en smidig hjälp-byggsten på 10% först genom att dela hela talet ${base} med 10.` : `Find a convenient 10% helper building block first by dividing the full number ${base} by 10.`, 
                        latex: `10\\% = \\frac{${base}}{10} = \\mathbf{${base / 10}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Eftersom du söker ${pct}%, behöver vi exakt ${pct / 10} stycken sådana byggstenar. Gångra därför värdet med ${pct / 10}.` : `Since you are looking for ${pct}%, we need exactly ${pct / 10} of those building blocks. Therefore, multiply the value by ${pct / 10}.`, 
                        latex: `${pct}\\% = ${base / 10} \\cdot \\mathbf{${pct / 10}}` 
                    },
                    { 
                        text: lang === 'sv' ? "Räkna ut gångertalet för att hitta slutsvaret." : "Calculate the multiplication to find the final total answer.", 
                        latex: `${pct}\\% = \\mathbf{${ans}}` 
                    },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, latex: `${ans}` }
                ]
            };
        }

        const ans5 = (base * 5) / 100;
        return {
            renderData: {
                description: lang === 'sv' ? `Beräkna 5% av ${base} med hjälp av 10%.` : `Calculate 5% of ${base} using 10%.`,
                answerType: 'numeric'
            },
            token: this.toBase64(ans5.toString()), variationKey: 'decomposition', type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Hitta värdet för 10% först." : "Step 1: Find the value of 10% first.", latex: `10\\% = \\frac{${base}}{10} = ${base/10}` },
                { text: lang === 'sv' ? "Steg 2: Eftersom 5% är hälften av 10%, delar vi 10-procentsvärdet med 2." : "Step 2: Since 5% is half of 10%, we divide the 10-percent value by 2.", latex: `\\frac{${base/10}}{2} = ${ans5}` },
                { text: lang === 'sv' ? `Svar: ${ans5}` : `Answer: ${ans5}` }
            ]
        };
    }

    // --- LEVEL 4: PERCENT EQUATION ---
    private level4_PercentEquation(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'find_percent_test', type: 'calculate' },
            { key: 'find_percent_discount', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        
        const w = MathUtils.randomChoice([20, 25, 40, 50, 200]);
        const p = MathUtils.randomChoice([10, 20, 25, 40, 60]);
        const part = (p * w) / 100;

        const isTest = v === 'find_percent_test';
        const desc = lang === 'sv' 
            ? (isTest ? `Du fick ${part} rätt av ${w} på ett prov. Hur många procent rätt hade du?` : `En vara sänktes med ${part} kr från priset ${w} kr. Vad var sänkningen i procent?`)
            : (isTest ? `You got ${part} correct out of ${w} on a test. What percentage did you get right?` : `An item was reduced by ${part} kr from the price ${w} kr. What was the reduction in percent?`);

        return {
            renderData: { 
                description: desc, 
                latex: `\\frac{${part}}{${w}}`,
                answerType: 'numeric', 
                suffix: '%' 
            },            
            token: this.toBase64(p.toString()), variationKey: v, type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? "För att hitta andelen i procent sätter vi alltid delen där uppe på bråkstrecket, och det hela totalt där nere." : "To find the percentage rate, we always place the smaller part on top of the fraction line, and the full total at the bottom.", 
                    latex: `\\text{Andel} = \\frac{\\text{Delen}}{\\text{Hela totalt}}` 
                },
                { 
                    text: lang === 'sv' ? `Ställ upp bitarna: delen är ${part} och hela utgångsvärdet är ${w}.` : `Set up the pieces: the part is ${part} and the full baseline total is ${w}.`, 
                    latex: `\\text{Andel} = \\frac{\\mathbf{${part}}}{\\mathbf{${w}}}` 
                },
                { 
                    text: lang === 'sv' ? "Dela (dividera) täljaren med nämnaren för att räkna ut talet i vanlig decimalform." : "Divide the top number by the bottom number to compute the value in regular decimal format.", 
                    latex: `\\text{Andel} = \\mathbf{${(part / w).toString().replace('.', ',')}}` 
                },
                { 
                    text: lang === 'sv' ? "Gör om till procent genom att flytta kommatecknet två steg åt höger (vilket är samma sak som att gångra med 100)." : "Convert to percent by shifting the decimal point two steps to the right (which is exactly the same as multiplying by 100).", 
                    latex: `${(part / w).toString().replace('.', ',')} \\cdot 100 = \\mathbf{${p}\\%}` 
                },
                { text: lang === 'sv' ? `Svar: ${p}%` : `Answer: ${p}%`, latex: `${p}\\%` }
            ]
        };
    }

    // --- LEVEL 5: REVERSE PERCENTAGE (Scaling Strategy Refactor) ---
    private level5_ReversePercentage(lang: string, variationKey?: string, options: any = {}): any {
        const p = MathUtils.randomChoice([5, 10, 20, 25]);
        const w = MathUtils.randomInt(10, 50) * 10;
        const part = (p * w) / 100;
        const multiplier = 100 / p;

        return {
            renderData: {
                description: lang === 'sv' ? `${p}% av en summa pengar är ${part} kr. Vad är hela summan (100%)?` : `${p}% of a sum of money is ${part} kr. What is the total sum (100%)?`,
                answerType: 'numeric'
            },
            token: this.toBase64(w.toString()), variationKey: 'reverse_find_whole', type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? `Vi vet att en liten bit på ${p}% är värd exakt ${part} kr.` : `We know that a small piece of ${p}% is worth exactly ${part} kr.`, 
                    latex: `${p}\\% = ${part}` 
                },
                { 
                    text: lang === 'sv' ? `Räkna ut hur många sådana bitar det går på hela talet (100%). Det går exakt ${multiplier} stycken bitar.` : `Find out how many such pieces fit into the full total (100%). Exactly ${multiplier} pieces fit inside.`, 
                    latex: `${multiplier} \\cdot ${p}\\% = 100\\%` 
                },
                { 
                    text: lang === 'sv' ? `Gångra (multiplicera) därför delens värde (${part}) med ${multiplier} för att hitta vad hela summan var från början.` : `Therefore, multiply the piece value (${part}) by ${multiplier} to calculate what the full total sum was at the start.`, 
                    latex: `100\\% = ${part} \\cdot \\mathbf{${multiplier}}` 
                },
                { 
                    text: lang === 'sv' ? "Räkna ut gångertalet för att få fram slutsvar." : "Calculate the multiplication to reach your final answer total.", 
                    latex: `100\\% = \\mathbf{${w}}` 
                },
                { text: lang === 'sv' ? `Svar: ${w} kr` : `Answer: ${w} kr`, latex: `${w}` }
            ]
        };
    }

    // --- LEVEL 6: PERCENTAGE CHANGE ---
    private level6_PercentageChange(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'change_calc', type: 'calculate' },
            { key: 'change_multiplier', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'change_multiplier') {
            const p = MathUtils.randomInt(5, 50);
            const isInc = Math.random() > 0.5;
            const ans = isInc ? (1 + p/100) : (1 - p/100);
            const ansStr = ans.toString().replace('.', ',');

            return {
                renderData: {
                    description: lang === 'sv' ? `Vilken förändringsfaktor motsvarar en ${isInc ? 'ökning' : 'minskning'} med ${p}%?` : `Which change factor corresponds to an ${isInc ? 'increase' : 'decrease'} of ${p}%?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ansStr), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? "Vi utgår alltid från 100%, vilket betyder hela ursprungsvärdet (1,00 i decimalform)." : "We always start with 100%, which represents the full original value (1.00 in decimal form).", 
                        latex: `100\\% = 1,00` 
                    },
                    { 
                        text: lang === 'sv' ? `Gör om procentsatsen ${p}% till decimalform genom att dela med 100. Det blir ${(p / 100).toString().replace('.', ',')}.` : `Convert the percentage ${p}% to decimal form by dividing it by 100. That equals ${(p / 100).toString().replace('.', ',')}.`, 
                        latex: `${p}\\% = \\frac{${p}}{100} = \\mathbf{${(p / 100).toString().replace('.', ',')}}` 
                    },
                    { 
                        text: lang === 'sv' ? (isInc ? `Eftersom värdet ökar plussar vi på decimalen till basen 1,00.` : `Eftersom värdet minskar drar vi bort decimalen från basen 1,00.`) : (isInc ? `Since the value increases, add the decimal to the base 1.00.` : `Since the value decreases, subtract the decimal from the base 1.00.`), 
                        latex: isInc ? `\\text{Förändringsfaktor} = 1,00 + \\mathbf{${(p / 100).toString().replace('.', ',')}}` : `\\text{Förändringsfaktor} = 1,00 - \\mathbf{${(p / 100).toString().replace('.', ',')}}` 
                    },
                    { 
                        text: lang === 'sv' ? "Räkna ut plusset eller minusset för att få fram det färdiga decimaltalet." : "Calculate the addition or subtraction to determine the final decimal answer.", 
                        latex: `\\text{Förändringsfaktor} = \\mathbf{${ansStr}}` 
                    },
                    { text: lang === 'sv' ? `Svar: ${ansStr}` : `Answer: ${ansStr}`, latex: `\\text{${ansStr}}` }
                ]
            };
        }

        const oldV = MathUtils.randomInt(4, 15) * 100;
        const p = MathUtils.randomChoice([10, 20, 25, 50]);
        const isInc = Math.random() > 0.5;
        const diff = (oldV * p) / 100;
        const newV = isInc ? oldV + diff : oldV - diff;

        return {
            renderData: {
                description: lang === 'sv' ? `Ett pris ändrades från ${oldV} kr till ${newV} kr. Vad var förändringen i procent?` : `A price changed from ${oldV} kr to ${newV} kr. What was the change in percent?`,
                latex: `\\frac{${diff}}{${oldV}}`,
                answerType: 'numeric', 
                suffix: '%'
            },
            token: this.toBase64(p.toString()), variationKey: 'change_calc', type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? `Ta först reda på prisskillnaden i kronor genom att ta det stora priset minus det lilla priset.` : `First, find the price difference in money by subtracting the smaller price from the larger price.`, 
                    latex: `\\text{Skillnad} = ${Math.max(oldV, newV)} - ${Math.min(oldV, newV)} = \\mathbf{${diff}}` 
                },
                { 
                    text: lang === 'sv' ? `Dela alltid den uträknade prisskillnaden (${diff}) med vad varan kostade FRÅN BÖRJAN (${oldV} kr).` : `Always divide the calculated difference (${diff}) by what the item cost ORIGINALLY at the start (${oldV} kr).`, 
                    latex: `\\text{Andel} = \\frac{\\mathbf{${diff}}}{\\mathbf{${oldV}}}` 
                },
                { 
                    text: lang === 'sv' ? "Räkna ut divisionen för att få fram förändringen i vanlig decimalform." : "Calculate the division to find the change in regular decimal format.", 
                    latex: `\\text{Andel} = \\mathbf{${(diff / oldV).toString().replace('.', ',')}}` 
                },
                { 
                    text: lang === 'sv' ? "Gör om decimaltalet till procent genom att flytta kommatecknet två steg åt höger (gånger 100)." : "Convert the decimal value to a percentage by moving the decimal point two steps to the right (multiply by 100).", 
                    latex: `${(diff / oldV).toString().replace('.', ',')} \\cdot 100 = \\mathbf{${p}\\%}` 
                },
                { text: lang === 'sv' ? `Svar: ${p}%` : `Answer: ${p}%`, latex: `${p}\\%` }
            ]
        };
    }
}