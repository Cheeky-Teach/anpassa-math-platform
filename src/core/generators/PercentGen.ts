import { MathUtils } from '../utils/MathUtils.js';

export class PercentGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_ConceptsAndVisuals(lang);
            case 2: return this.level2_MentalMath(lang);
            case 3: return this.level3_BuildingBlocks(lang);
            case 4: return this.level4_PercentEquation(lang);
            case 5: return this.level5_ReversePercentage(lang);
            case 6: return this.level6_PercentageChange(lang);
            default: return this.level1_ConceptsAndVisuals(lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    // --- LEVEL 1: Concepts & Visuals ---
    private level1_ConceptsAndVisuals(lang: string): any {
        const variation = Math.random();

        // VARIATION A: Dynamic Visual Translation
        if (variation < 0.35) {
            const colored = MathUtils.randomInt(1, 99);
            const targetType = MathUtils.randomChoice(['fraction', 'decimal', 'percent']);
            
            let answer = "";
            let desc = "";
            let type = "";

            if (targetType === 'fraction') {
                desc = lang === 'sv' ? "Hur stor andel är färgad? Svara i bråkform." : "What fraction is colored?";
                type = 'fraction';
                answer = `${colored}/100`;
            } else if (targetType === 'decimal') {
                desc = lang === 'sv' ? "Hur stor andel är färgad? Svara i decimalform." : "What decimal part is colored?";
                type = 'numeric';
                answer = (colored / 100).toString();
            } else {
                desc = lang === 'sv' ? "Hur många procent är färgat?" : "What percent is colored?";
                type = 'numeric';
                answer = colored.toString();
            }

            return {
                renderData: {
                    description: desc,
                    answerType: type,
                    suffix: targetType === 'percent' ? '%' : '',
                    geometry: { type: 'percent_grid', total: 100, colored: colored }
                },
                token: this.toBase64(answer),
                clues: [
                    { 
                        text: lang === 'sv' ? "Räkna först hur många rutor som finns totalt (det är 100 st)." : "First count how many squares there are in total (there are 100).", 
                        latex: "" 
                    },
                    { 
                        text: lang === 'sv' ? `Det är ${colored} färgade rutor. Eftersom det är av 100, så är det ${colored} hundradelar.` : `There are ${colored} colored squares. Since it is out of 100, it is ${colored} hundredths.`, 
                        latex: `${colored}/100` 
                    }
                ],
                metadata: { variation: 'visual_translation', difficulty: 1 }
            };
        }

        // VARIATION B: Spot the Lie (Dynamic)
        if (variation < 0.7) {
            const colored = MathUtils.randomInt(10, 90);
            
            const sTrue1 = `${colored}%`;
            const sTrue2 = (colored > 50) 
                ? (lang==='sv' ? "Mer än hälften" : "More than half") 
                : (lang==='sv' ? "Mindre än hälften" : "Less than half");
            
            let sFalse = "";
            if (MathUtils.randomInt(0, 1) === 0) {
                sFalse = `1/${colored}`; 
            } else {
                sFalse = (colored / 10).toString(); 
            }

            return {
                renderData: {
                    description: lang==='sv' ? "Titta på figuren. Vilket påstående är FALSKT?" : "Look at the figure. Which statement is FALSE?",
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([sTrue1, sTrue2, sFalse]),
                    geometry: { type: 'percent_grid', total: 100, colored: colored }
                },
                token: this.toBase64(sFalse),
                clues: [
                    { 
                        text: lang === 'sv' ? "Procent betyder 'per hundra'. Tänk på hur många hundradelar som är färgade." : "Percent means 'per hundred'. Think about how many hundredths are colored.", 
                        latex: "" 
                    },
                    {
                        text: lang === 'sv' ? `Eftersom ${colored} rutor är färgade är det ${colored}%. Jämför detta med alternativen.` : `Since ${colored} squares are colored, it is ${colored}%. Compare this with the options.`,
                        latex: ""
                    }
                ],
                metadata: { variation: 'visual_lie', difficulty: 1 }
            };
        }

        // VARIATION C: Equivalence Check
        const p = MathUtils.randomChoice([10, 20, 25, 50, 75]);
        const dec = p / 100;
        const frac = `${p}/100`;
        const wrong = (p / 10).toString(); 

        return {
            renderData: {
                description: lang==='sv' ? `Vilket alternativ är INTE lika med ${p}%?` : `Which option is NOT equal to ${p}%?`,
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([dec.toString(), frac, wrong, `${p/25}/${100/25}`]) 
            },
            token: this.toBase64(wrong),
            clues: [
                { 
                    text: lang === 'sv' ? "För att göra om procent till decimaltal, dela med 100 (flytta kommat två steg)." : "To convert percent to decimal, divide by 100 (move the decimal two steps).", 
                    latex: `${p} / 100 = ${dec}` 
                },
                {
                    text: lang === 'sv' ? "För att göra om procent till bråk, sätt talet över 100." : "To convert percent to fraction, put the number over 100.",
                    latex: `\\frac{${p}}{100}`
                }
            ],
            metadata: { variation: 'equivalence', difficulty: 1 }
        };
    }

    // --- LEVEL 2: Mental Math Benchmarks ---
    private level2_MentalMath(lang: string): any {
        const variation = Math.random();
        const benchmark = MathUtils.randomChoice([10, 20, 25, 50]);

        // VARIATION A: Standard Calculation
        if (variation < 0.35) {
            let step = 10;
            if (benchmark === 50) step = 2;
            else if (benchmark === 25) step = 4;
            else if (benchmark === 20) step = 5;

            const base = MathUtils.randomInt(2, 20) * step; 
            const ans = (base * benchmark) / 100;
            
            return {
                renderData: {
                    description: lang==='sv' ? `Beräkna ${benchmark}% av ${base}.` : `Calculate ${benchmark}% of ${base}.`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? `Tänk på bråket för ${benchmark}%.` : `Think of the fraction for ${benchmark}%.`, 
                        latex: benchmark === 50 ? "\\text{Halvan} (1/2)" : (benchmark === 25 ? "\\text{Fjärdedelen} (1/4)" : "\\text{Tiondelen} (1/10)")
                    },
                    {
                        text: lang === 'sv' ? "Dela talet med nämnaren." : "Divide the number by the denominator.",
                        latex: benchmark === 50 ? `${base} / 2` : (benchmark === 25 ? `${base} / 4` : `${base} / 10`)
                    }
                ],
                metadata: { variation: 'benchmark_calc', difficulty: 2 }
            };
        }

        // VARIATION B: Inverse Logic
        if (variation < 0.7) {
            const ans = MathUtils.randomInt(2, 20); 
            let whole = 0;
            if (benchmark === 50) whole = ans * 2;
            else if (benchmark === 25) whole = ans * 4;
            else if (benchmark === 10) whole = ans * 10;
            else whole = ans * 5; 

            return {
                renderData: {
                    description: lang==='sv' 
                        ? `${benchmark}% av ett tal är ${ans}. Vilket är talet?` 
                        : `${benchmark}% of a number is ${ans}. What is the number?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(whole.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? `Vi vet att en liten del (${benchmark}%) är värd ${ans}.` : `We know that a small part (${benchmark}%) is worth ${ans}.`, 
                        latex: ""
                    },
                    { 
                        text: lang === 'sv' ? "Multiplicera upp delen för att få hela kakan (100%)." : "Multiply the part up to get the whole cake (100%).", 
                        latex: benchmark === 50 ? `${ans} \\cdot 2` : (benchmark === 25 ? `${ans} \\cdot 4` : `${ans} \\cdot 10`)
                    }
                ],
                metadata: { variation: 'benchmark_inverse', difficulty: 2 }
            };
        }

        // VARIATION C: Commutative Trick
        const n1 = MathUtils.randomChoice([25, 50]);
        const step = n1 === 25 ? 4 : 2;
        const n2 = MathUtils.randomInt(2, 10) * step; 
        
        const q = MathUtils.randomInt(0, 1) === 0 
            ? `${n1}% av ${n2}` 
            : `${n2}% av ${n1}`;
        
        const ans = (n1 * n2) / 100;

        return {
            renderData: {
                description: lang==='sv' ? `Beräkna: ${q}` : `Calculate: ${q}`,
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? "Ett smart trick: Du kan byta plats på talen! Det är samma sak som att räkna ut den 'enkla' procenten." : "A smart trick: You can swap the numbers! It is the same as calculating the 'easy' percent.", 
                    latex: "" 
                },
                {
                    text: lang === 'sv' ? `Räkna ut ${n1}% av ${n2} istället.` : `Calculate ${n1}% of ${n2} instead.`,
                    latex: n1 === 50 ? `${n2} / 2` : `${n2} / 4`
                }
            ],
            metadata: { variation: 'benchmark_commutative', difficulty: 2 }
        };
    }

    // --- LEVEL 3: Building Blocks ---
    private level3_BuildingBlocks(lang: string): any {
        const variation = Math.random();

        // VARIATION A: Standard Composition
        if (variation < 0.4) {
            const base = MathUtils.randomInt(2, 10) * 10;
            const pct = MathUtils.randomChoice([30, 40, 60, 70, 80, 90]);
            const ans = (base * pct) / 100;

            return {
                renderData: {
                    description: lang==='sv' ? `Beräkna ${pct}% av ${base}.` : `Calculate ${pct}% of ${base}.`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? "Börja med att räkna ut vad 10% är (dela med 10)." : "Start by calculating what 10% is (divide by 10).", 
                        latex: `10\\% = ${base/10}` 
                    },
                    { 
                        text: lang === 'sv' ? `Du vill ha ${pct}%, vilket är ${pct/10} gånger så mycket.` : `You want ${pct}%, which is ${pct/10} times as much.`, 
                        latex: `${base/10} \\cdot ${pct/10}` 
                    }
                ],
                metadata: { variation: 'composition', difficulty: 2 }
            };
        }

        // VARIATION B: Decomposition (15%)
        if (variation < 0.7) {
            const base = MathUtils.randomInt(4, 20) * 10; 
            const ans = (base * 5) / 100;

            return {
                renderData: {
                    description: lang==='sv'
                        ? `För att räkna ut 15% av ${base} kan man ta 10% och addera hälften av det. Vad är 5% av ${base}?`
                        : `To find 15% of ${base}, you can find 10% and add half of it. What is 5% of ${base}?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? "Först, vad är 10%? (Dela med 10)." : "First, what is 10%? (Divide by 10).", 
                        latex: `${base} / 10 = ${base/10}` 
                    },
                    { 
                        text: lang === 'sv' ? "5% är hälften av 10%. Dela ditt svar med 2." : "5% is half of 10%. Divide your answer by 2.", 
                        latex: `${base/10} / 2` 
                    }
                ],
                metadata: { variation: 'decomposition', difficulty: 2 }
            };
        }

        // VARIATION C: Estimation
        const base = MathUtils.randomInt(10, 50) * 2;
        const target = 10; 
        const exactPct = (target / base) * 100;
        const testPct = MathUtils.randomInt(Math.floor(exactPct) - 5, Math.ceil(exactPct) + 5);
        
        if (testPct === exactPct) return this.level3_BuildingBlocks(lang);

        const isGreater = (base * testPct / 100) > target;
        const ans = isGreater ? (lang==='sv'?"Större":"Greater") : (lang==='sv'?"Mindre":"Smaller");
        const wrong = isGreater ? (lang==='sv'?"Mindre":"Smaller") : (lang==='sv'?"Större":"Greater");

        return {
            renderData: {
                description: lang==='sv' 
                    ? `Är ${testPct}% av ${base} större eller mindre än ${target}?`
                    : `Is ${testPct}% of ${base} greater or smaller than ${target}?`,
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([ans, wrong])
            },
            token: this.toBase64(ans),
            clues: [
                { 
                    text: lang === 'sv' ? "Använd 10% som riktmärke. Vad är 10% av talet?" : "Use 10% as a benchmark. What is 10% of the number?", 
                    latex: `10\\% = ${base/10}` 
                },
                { 
                    text: lang === 'sv' ? "Jämför nu. Verkar det rimligt?" : "Now compare. Does it seem reasonable?", 
                    latex: "" 
                }
            ],
            metadata: { variation: 'estimation', difficulty: 3 }
        };
    }

    // --- LEVEL 4: Percent Equation ---
    private level4_PercentEquation(lang: string): any {
        const variation = Math.random();

        const wholes = [4, 5, 10, 20, 25, 40, 50, 100, 200];
        const w = MathUtils.randomChoice(wholes);
        const p = MathUtils.randomChoice([5, 10, 20, 25, 30, 40, 50, 60, 75, 80, 90]);
        const part = (p * w) / 100; 
        
        if (!Number.isInteger(part)) return this.level4_PercentEquation(lang);

        // VARIATION A: Standard Context-Free
        if (variation < 0.25) {
            const k = 100 / w; 
            const opText = k > 1 ? (lang==='sv' ? "Förläng" : "Extend") : (lang==='sv' ? "Förkorta" : "Simplify");
            const opSymbol = k > 1 ? "\\cdot" : "/";
            const kDisp = k > 1 ? k : (1/k); 

            return {
                renderData: {
                    description: lang==='sv' 
                        ? `${part} är hur många procent av ${w}?` 
                        : `${part} is what percent of ${w}?`,
                    answerType: 'numeric', suffix: '%'
                },
                token: this.toBase64(p.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? "Ställ upp det som ett bråk: Delen genom Det Hela." : "Set it up as a fraction: Part over Whole.", 
                        latex: `\\frac{${part}}{${w}}` 
                    },
                    { 
                        text: lang === 'sv' ? `${opText} bråket med ${kDisp} så att nämnaren blir 100.` : `${opText} the fraction by ${kDisp} so the denominator becomes 100.`, 
                        latex: `\\frac{${part} ${opSymbol} ${kDisp}}{${w} ${opSymbol} ${kDisp}} = \\frac{${p}}{100}` 
                    },
                    {
                        text: lang === 'sv' ? "Hundradelar är samma sak som procent." : "Hundredths are the same as percent.",
                        latex: `${p}\\%`
                    }
                ],
                metadata: { variation: 'find_percent_basic', difficulty: 3 }
            };
        }

        // VARIATION B: Real World (Score/Test)
        if (variation < 0.5) {
            const desc = lang === 'sv'
                ? `Du fick ${part} poäng av ${w} möjliga på ett prov. Hur många procent är det?`
                : `You scored ${part} out of ${w} on a test. What percent is that?`;
            
            const k = 100 / w;
            const kDisp = k > 1 ? k : (1/k);
            const opSymbol = k > 1 ? "\\cdot" : "/";

            return {
                renderData: { description: desc, answerType: 'numeric', suffix: '%' },
                token: this.toBase64(p.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? "Andelen är:" : "The fraction is:", 
                        latex: `\\frac{${part}}{${w}}` 
                    },
                    { 
                        text: lang === 'sv' ? "Vi vill ha 100 i nämnaren. Vad ska vi multiplicera nämnaren med för att få 100?" : "We want 100 in the denominator. What should we multiply the denominator by to get 100?", 
                        latex: `${w} \\cdot ? = 100 \\implies ${kDisp}`
                    },
                    { 
                        text: lang === 'sv' ? "Gör samma sak med täljaren." : "Do the same to the numerator.", 
                        latex: `${part} ${opSymbol} ${kDisp} = ${p}` 
                    }
                ],
                metadata: { variation: 'find_percent_test', difficulty: 3 }
            };
        }

        // VARIATION C: Real World (Discount/Savings)
        if (variation < 0.75) {
            const desc = lang === 'sv'
                ? `Priset sänktes med ${part} kr. Det kostade ${w} kr från början. Hur stor var rabatten i procent?`
                : `The price was lowered by ${part} kr. It originally cost ${w} kr. What was the discount percent?`;

            return {
                renderData: { description: desc, answerType: 'numeric', suffix: '%' },
                token: this.toBase64(p.toString()),
                clues: [
                    { 
                        text: lang==='sv' ? "Räkna ut andelen: Rabatten delat med ordinarie pris." : "Calculate the share: Discount divided by original price.", 
                        latex: `\\frac{${part}}{${w}}` 
                    },
                    {
                        text: lang === 'sv' ? "Omvandla till procent." : "Convert to percent.",
                        latex: `${p}\\%`
                    }
                ],
                metadata: { variation: 'find_percent_discount', difficulty: 3 }
            };
        }

        // VARIATION D: Visual Logic (Groups)
        const desc = lang === 'sv'
            ? `I en grupp på ${w} personer har ${part} personer keps. Hur många procent har keps?`
            : `In a group of ${w} people, ${part} have caps. What percent have caps?`;

        return {
            renderData: { description: desc, answerType: 'numeric', suffix: '%' },
            token: this.toBase64(p.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? "Delen genom det hela ger oss andelen." : "Part divided by whole gives us the share.", 
                    latex: `\\frac{${part}}{${w}}` 
                },
                {
                    text: lang === 'sv' ? "För att få procent, tänk 'hur många av 100?'" : "To get percent, think 'how many out of 100?'",
                    latex: `${p}\\%`
                }
            ],
            metadata: { variation: 'find_percent_group', difficulty: 3 }
        };
    }

    // --- LEVEL 5: Reverse Percentage ---
    private level5_ReversePercentage(lang: string): any {
        const variation = Math.random();

        // VARIATION A: Find Whole
        if (variation < 0.4) {
            const p = MathUtils.randomChoice([10, 20, 25, 40, 50]);
            const w = MathUtils.randomInt(2, 10) * 10; 
            const part = (p * w) / 100;

            return {
                renderData: {
                    description: lang==='sv' ? `${p}% av ett tal är ${part}. Vilket är talet?` : `${p}% of a number is ${part}. What is the number?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(w.toString()),
                clues: [
                    { text: lang==='sv' ? "Hitta 1% först." : "Find 1% first.", latex: `${part} / ${p} = ${part/p}` },
                    { text: lang==='sv' ? "Gångra med 100." : "Multiply by 100.", latex: `${part/p} \\cdot 100` }
                ],
                metadata: { variation: 'reverse_find_whole', difficulty: 3 }
            };
        }

        // VARIATION B: Scaling
        if (variation < 0.8) {
            const smallP = 10;
            const smallVal = MathUtils.randomInt(2, 9);
            const targetP = MathUtils.randomChoice([20, 30, 40, 50, 60]);
            const factor = targetP / smallP;
            const ans = smallVal * factor;

            return {
                renderData: {
                    description: lang==='sv' 
                        ? `10% av ett pris är ${smallVal} kr. Vad är ${targetP}% av priset?` 
                        : `10% of a price is ${smallVal} kr. What is ${targetP}% of the price?`,
                    answerType: 'numeric', suffix: 'kr'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang==='sv' ? `Hur många gånger större är ${targetP}% än 10%?` : `How many times bigger is ${targetP}% than 10%?`, latex: `${targetP} / 10 = ${factor}` },
                    { text: lang==='sv' ? "Multiplicera värdet med den faktorn." : "Multiply the value by that factor.", latex: `${smallVal} \\cdot ${factor}` }
                ],
                metadata: { variation: 'reverse_scaling', difficulty: 3 }
            };
        }

        // VARIATION C: Concept
        return {
            renderData: {
                description: lang==='sv' ? "Om du dubblerar procenten, vad händer med delen?" : "If you double the percentage, what happens to the part?",
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([
                    lang==='sv' ? "Den dubblas" : "It doubles",
                    lang==='sv' ? "Den halveras" : "It halves",
                    lang==='sv' ? "Ingen skillnad" : "No change"
                ])
            },
            token: this.toBase64(lang==='sv' ? "Den dubblas" : "It doubles"),
            clues: [{text: "20% is 2x 10%", latex: ""}],
            metadata: { variation: 'reverse_concept', difficulty: 2 }
        };
    }

    // --- LEVEL 6: Percentage Change ---
    private level6_PercentageChange(lang: string): any {
        const variation = Math.random();

        // VARIATION A: Calculate Change
        if (variation < 0.35) {
            const oldVal = MathUtils.randomInt(2, 10) * 100;
            const p = MathUtils.randomInt(1, 5) * 10;
            const isInc = MathUtils.randomInt(0, 1) === 1;
            const diff = (oldVal * p) / 100;
            const newVal = isInc ? oldVal + diff : oldVal - diff;

            return {
                renderData: {
                    description: lang==='sv' 
                        ? `Priset ändras från ${oldVal} till ${newVal}. Hur många procent ${isInc?'ökade':'minskade'} det?`
                        : `Price changed from ${oldVal} to ${newVal}. What percent did it ${isInc?'increase':'decrease'}?`,
                    answerType: 'numeric', suffix: '%'
                },
                token: this.toBase64(p.toString()),
                clues: [
                    { text: lang==='sv' ? "Räkna ut skillnaden." : "Calc difference.", latex: `${newVal} - ${oldVal}` },
                    { text: lang==='sv' ? "Dela skillnaden med ursprungsvärdet." : "Divide difference by original.", latex: `\\frac{\\text{Skillnad}}{${oldVal}}` }
                ],
                metadata: { variation: 'change_calc', difficulty: 4 }
            };
        }

        // VARIATION B: Multiplier
        if (variation < 0.7) {
            const p = MathUtils.randomInt(5, 95);
            const ans = 1 + (p/100);
            return {
                renderData: {
                    description: lang==='sv' ? `Vilket tal ska du multiplicera med för att öka något med ${p}%?` : `What number do you multiply by to increase something by ${p}%?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang==='sv' ? "Hela talet (1) + ökningen." : "Whole number (1) + increase.", latex: `1 + ${p/100}` }
                ],
                metadata: { variation: 'change_multiplier', difficulty: 3 }
            };
        }

        // VARIATION C: The Trap
        const p = 10;
        const ans = lang==='sv' ? "Lägre" : "Lower";
        const wrong1 = lang==='sv' ? "Högre" : "Higher";
        const wrong2 = lang==='sv' ? "Samma" : "Same";

        return {
            renderData: {
                description: lang==='sv' 
                    ? `Ett pris höjs med ${p}% och sänks sedan med ${p}%. Är nya priset högre, lägre eller samma som startpriset?` 
                    : `A price increases by ${p}% and then decreases by ${p}%. Is the new price higher, lower, or same as start?`,
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([ans, wrong1, wrong2])
            },
            token: this.toBase64(ans),
            clues: [
                { text: lang==='sv' ? "Testa med 100 kr." : "Test with 100 kr.", latex: `100 \\cdot 1.1 = 110` },
                { text: lang==='sv' ? "Sänk nu 110 med 10%." : "Now decrease 110 by 10%.", latex: `110 \\cdot 0.9 = 99` }
            ],
            metadata: { variation: 'change_trap', difficulty: 4 }
        };
    }
}