// src/generators/PercentGen.ts

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
            case 3: questionData = this.level3_PercentRate(lang, undefined, options); break;         // 🟢 Swapped to Rate (Delen / Hela)
            case 4: questionData = this.level4_BuildingBlocks(lang, undefined, options); break;      // 🟢 Swapped to Composing / Delen
            case 5: questionData = this.level5_PercentageChange(lang, undefined, options); break;    // 🟢 Swapped to Change & Multiplier
            case 6: questionData = this.level6_ReversePercentage(lang, undefined, options); break;   // 🟢 Swapped to Reverse / Find 100%
            default: questionData = this.level1_ConceptsAndVisuals(lang, undefined, options); break;
        }

        enrichQuestionMetadata(questionData);

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
            // Level 1: Concepts & Visuals
            case 'visual_translation':
            case 'visual_lie':
            case 'equivalence':
            case 'equivalence_basic_frac':
            case 'equivalence_basic_dec':
                return this.level1_ConceptsAndVisuals(lang, key);

            // Level 2: Mental Math & Benchmarks
            case 'benchmark_calc':
            case 'benchmark_inverse':
            case 'benchmark_commutative':
                return this.level2_MentalMath(lang, key);

            // Level 3: Finding the Percentage Rate (Delen / Hela)
            case 'find_percent_basic':
            case 'find_percent_test':
            case 'find_percent_discount':
            case 'find_percent_group':
                return this.level3_PercentRate(lang, key);

            // Level 4: Building Blocks & Calculating the Part
            case 'composition':
            case 'decomposition':
            case 'estimation':
            case 'calc_any_percent':
                return this.level4_BuildingBlocks(lang, key);

            // Level 5: Percentage Change & Multiplier
            case 'change_calc':
            case 'change_multiplier':
            case 'change_trap':
                return this.level5_PercentageChange(lang, key);

            // Level 6: Reverse Percentages (Finding 100%)
            case 'reverse_find_whole':
            case 'reverse_scaling':
            case 'reverse_concept':
                return this.level6_ReversePercentage(lang, key);

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

    private gcd(a: number, b: number): number {
        return b === 0 ? a : this.gcd(b, a % b);
    }

    // =========================================================================
    // LEVEL 1: CONCEPTS & VISUALS
    // =========================================================================
    private level1_ConceptsAndVisuals(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'visual_translation', type: 'calculate' },
            { key: 'visual_lie', type: 'concept' },
            { key: 'equivalence_basic_frac', type: 'concept' },
            { key: 'equivalence_basic_dec', type: 'concept' },
            { key: 'equivalence', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'equivalence_basic_frac') {
            const denominators = [2, 4, 5, 10, 20, 25, 50];
            const d = MathUtils.randomChoice(denominators);
            
            const validNumerators = [];
            for (let n = 1; n < d; n++) {
                if (this.gcd(n, d) === 1) validNumerators.push(n);
            }
            const num = MathUtils.randomChoice(validNumerators);
            const scale = 100 / d;
            const pct = num * scale;
            const fractionStr = `\\frac{${num}}{${d}}`;

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Hur många procent motsvarar bråket $${fractionStr}$?` 
                        : `What percentage corresponds to the fraction $${fractionStr}$?`,
                    answerType: 'numeric',
                    suffix: '%'
                },
                token: this.toBase64(pct.toString()),
                variationKey: v,
                type: 'concept',
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? "Procent betyder hundradelar. Förläng bråket så att nämnaren blir 100." 
                            : "Percent means hundredths. Scale the fraction so the denominator becomes 100.", 
                        latex: fractionStr 
                    },
                    { 
                        text: lang === 'sv' 
                            ? `Multiplicera både täljare och nämnare med ${scale}:` 
                            : `Multiply both numerator and denominator by ${scale}:`, 
                        latex: `\\frac{${num} \\cdot \\mathbf{${scale}}}{${d} \\cdot \\mathbf{${scale}}} = \\frac{\\mathbf{${pct}}}{100}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${pct}%` : `Answer: ${pct}%`, 
                        latex: `${pct}\\%` 
                    }
                ]
            };
        }

        if (v === 'visual_translation') {
            const colored = MathUtils.randomInt(1, 99);
            return {
                renderData: {
                    description: lang === 'sv' ? "Hur många procent av rutnätet är färgat?" : "What percentage of the grid is colored?",
                    answerType: 'numeric',
                    suffix: '%',
                    geometry: { type: 'percent_grid', total: 100, colored: colored }
                },
                token: this.toBase64(colored.toString()),
                variationKey: v,
                type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? "Rutnätet har 100 rutor totalt. Varje ruta motsvarar 1%." 
                            : "The grid has 100 squares total. Each square equals 1%.", 
                        latex: `1 \\text{ ruta} = 1\\%` 
                    },
                    { 
                        text: lang === 'sv' 
                            ? `Eftersom ${colored} rutor är färgade är andelen ${colored}%.` 
                            : `Since ${colored} squares are colored, the share is ${colored}%.`, 
                        latex: `\\frac{${colored}}{100} = \\mathbf{${colored}\\%}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${colored}%` : `Answer: ${colored}%`, 
                        latex: `${colored}\\%` 
                    }
                ]
            };
        }

        // Equivalence (Decimal to Percent or Percent to Decimal)
        const isHalf = Math.random() < 0.2;
        const p = isHalf 
            ? MathUtils.randomChoice([2.5, 7.5, 12.5, 17.5, 37.5, 62.5, 87.5])
            : MathUtils.randomInt(1, 99);
        const decVal = p / 100;
        const decStr = lang === 'sv' ? decVal.toString().replace('.', ',') : decVal.toString();
        const pStr = lang === 'sv' ? p.toString().replace('.', ',') : p.toString();

        return {
            renderData: {
                description: lang === 'sv' ? `Vilket decimaltal motsvarar ${pStr}%?` : `Which decimal corresponds to ${pStr}%?`,
                answerType: 'numeric'
            },
            token: this.toBase64(decVal.toString()),
            variationKey: 'equivalence',
            type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' 
                        ? "Procent betyder hundradelar. Dela procenttalet med 100 för att få decimalform." 
                        : "Percent means hundredths. Divide the percent by 100 to get decimal form.", 
                    latex: `${pStr}\\% = \\frac{${pStr}}{100}` 
                },
                { 
                    text: lang === 'sv' 
                        ? "Att dela med 100 innebär att flytta kommatecknet två steg åt vänster." 
                        : "Dividing by 100 means shifting the decimal point two places to the left.", 
                    latex: `\\frac{${pStr}}{100} = \\mathbf{${decStr}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${decStr}` : `Answer: ${decStr}`, 
                    latex: `${decStr}` 
                }
            ]
        };
    }

    // =========================================================================
    // LEVEL 2: MENTAL MATH & BENCHMARKS
    // =========================================================================
    private level2_MentalMath(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'benchmark_calc', type: 'calculate' },
            { key: 'benchmark_inverse', type: 'calculate' },
            { key: 'benchmark_commutative', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'benchmark_commutative') {
            const anchor = MathUtils.randomChoice([50, 25, 20]);
            const divisor = anchor === 50 ? 2 : (anchor === 25 ? 4 : 5);
            const other = MathUtils.randomInt(2, 24) * divisor;
            const ans = other / divisor;

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Beräkna ${other}% av ${anchor}.` 
                        : `Calculate ${other}% of ${anchor}.`,
                    latex: `${other}\\% \\cdot ${anchor}`,
                    interceptorToken: `${other}% av ${anchor}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                variationKey: v,
                type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? `Ett smart knep är att byta plats på talen: ${other}% av ${anchor} är exakt samma sak som ${anchor}% av ${other}!` 
                            : `A smart trick is swapping the numbers: ${other}% of ${anchor} is the exact same as ${anchor}% of ${other}!`, 
                        latex: `${other}\\% \\cdot ${anchor} = ${anchor}\\% \\cdot ${other}` 
                    },
                    { 
                        text: lang === 'sv' 
                            ? `${anchor}% motsvarar bråket 1/${divisor}. Dela därför ${other} med ${divisor}:` 
                            : `${anchor}% equals 1/${divisor}. Therefore divide ${other} by ${divisor}:`, 
                        latex: `\\frac{${other}}{${divisor}} = \\mathbf{${ans}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, 
                        latex: `${ans}` 
                    }
                ]
            };
        }

        if (v === 'benchmark_calc') {
            const benchmarks = [
                { pct: 1, divisor: 100, labelSv: "en hundradel", labelEn: "one hundredth" },
                { pct: 5, divisor: 20, labelSv: "en tjugondel (eller hälften av 10%)", labelEn: "one twentieth (or half of 10%)" },
                { pct: 10, divisor: 10, labelSv: "en tiondel", labelEn: "one tenth" },
                { pct: 20, divisor: 5, labelSv: "en femtedel", labelEn: "one fifth" },
                { pct: 25, divisor: 4, labelSv: "en fjärdedel", labelEn: "one fourth" },
                { pct: 50, divisor: 2, labelSv: "hälften", labelEn: "half" }
            ];
            const bench = MathUtils.randomChoice(benchmarks);
            
            const mult = MathUtils.randomChoice([1, 10, 100]);
            const k = MathUtils.randomInt(1, 30);
            const base = (k * bench.divisor) * (mult === 100 && bench.divisor >= 20 ? 1 : mult);
            const ans = base / bench.divisor;

            return {
                renderData: {
                    description: lang === 'sv' ? `Beräkna ${bench.pct}% av ${base}.` : `Calculate ${bench.pct}% of ${base}.`,
                    latex: `${bench.pct}\\% \\cdot ${base}`,
                    interceptorToken: `${bench.pct}% av ${base}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                variationKey: v,
                type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? `${bench.pct}% är samma sak som ${bench.labelSv} (dela med ${bench.divisor}).` 
                            : `${bench.pct}% is the same as ${bench.labelEn} (divide by ${bench.divisor}).`, 
                        latex: `${bench.pct}\\% = \\frac{1}{${bench.divisor}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Dela ${base} med ${bench.divisor}:` : `Divide ${base} by ${bench.divisor}:`, 
                        latex: `\\frac{${base}}{${bench.divisor}} = \\mathbf{${ans}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, 
                        latex: `${ans}` 
                    }
                ]
            };
        }

        // benchmark_inverse
        const pctInvChoices = [
            { pct: 1, mult: 100 },
            { pct: 5, mult: 20 },
            { pct: 10, mult: 10 },
            { pct: 20, mult: 5 },
            { pct: 25, mult: 4 },
            { pct: 50, mult: 2 }
        ];
        const inv = MathUtils.randomChoice(pctInvChoices);
        const part = MathUtils.randomInt(3, 80);
        const total = part * inv.mult;

        return {
            renderData: {
                description: lang === 'sv' 
                    ? `Om ${inv.pct}% av ett tal är ${part}, vad är då 100%?` 
                    : `If ${inv.pct}% of a number is ${part}, what is 100%?`,
                latex: `${inv.pct}\\% = ${part}`,
                interceptorToken: `${part} ; ${inv.pct}`,
                answerType: 'numeric'
            },
            token: this.toBase64(total.toString()),
            variationKey: 'benchmark_inverse',
            type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' 
                        ? `Det går ${inv.mult} st bitar av ${inv.pct}% på 100%.` 
                        : `There are ${inv.mult} pieces of ${inv.pct}% in 100%.`, 
                    latex: `${inv.mult} \\cdot ${inv.pct}\\% = 100\\%` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Multiplicera delens värde (${part}) med ${inv.mult}:` 
                        : `Multiply the piece value (${part}) by ${inv.mult}:`, 
                    latex: `${part} \\cdot ${inv.mult} = \\mathbf{${total}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${total}` : `Answer: ${total}`, 
                    latex: `${total}` 
                }
            ]
        };
    }

    // =========================================================================
    // LEVEL 3: ANDELEN (FINDING THE RATE / PERCENTAGE SHARE)
    // =========================================================================
    private level3_PercentRate(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'find_percent_basic', type: 'calculate' },
            { key: 'find_percent_test', type: 'calculate' },
            { key: 'find_percent_discount', type: 'calculate' },
            { key: 'find_percent_group', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        const denominators = [2, 4, 5, 8, 10, 20, 25, 40, 50];
        const d = MathUtils.randomChoice(denominators);
        const num = MathUtils.randomInt(1, d - 1);
        const p = (num / d) * 100;

        const scale = MathUtils.randomChoice([1, 2, 3, 4, 5, 10, 15, 20]);
        const part = num * scale;
        const total = d * scale;

        let desc = '';
        if (v === 'find_percent_test') {
            desc = lang === 'sv' 
                ? `Du fick ${part} rätt av ${total} möjliga poäng på ett prov. Hur många procent rätt hade du?`
                : `You got ${part} correct out of ${total} points on a test. What percentage did you score?`;
        } else if (v === 'find_percent_discount') {
            desc = lang === 'sv'
                ? `En vara sänktes med ${part} kr från ordinarie pris ${total} kr. Vad var rabatten i procent?`
                : `An item was discounted by ${part} kr from the regular price of ${total} kr. What was the discount in percent?`;
        } else if (v === 'find_percent_group') {
            desc = lang === 'sv'
                ? `I en grupp på ${total} personer röstade ${part} ja. Hur många procent röstade ja?`
                : `In a group of ${total} people, ${part} voted yes. What percentage voted yes?`;
        } else {
            desc = lang === 'sv'
                ? `Hur många procent är ${part} av ${total}?`
                : `What percentage is ${part} of ${total}?`;
        }

        const decFormatted = (part / total).toString().replace('.', ',');

        return {
            renderData: {
                description: desc,
                latex: `\\frac{${part}}{${total}}`,
                interceptorToken: `${part} ; ${total}`,
                answerType: 'numeric',
                suffix: '%'
            },
            token: this.toBase64(p.toString()),
            variationKey: v,
            type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' 
                        ? "Andelen beräknas genom att dela delen med det hela." 
                        : "The percentage is calculated by dividing the part by the whole.", 
                    latex: `\\text{Andel} = \\frac{\\text{Delen}}{\\text{Det hela}} = \\frac{${part}}{${total}}` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Utför divisionen: ${part} / ${total} = ${decFormatted}.` 
                        : `Perform the division: ${part} / ${total} = ${decFormatted}.`, 
                    latex: `\\frac{${part}}{${total}} = ${decFormatted}` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Multiplicera med 100 för att få procent:` 
                        : `Multiply by 100 to get percent:`, 
                    latex: `${decFormatted} \\cdot 100 = \\mathbf{${p}\\%}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${p}%` : `Answer: ${p}%`, 
                    latex: `${p}\\%` 
                }
            ],
            metadata: { variation_key: v, difficulty: 3 }
        };
    }

    // =========================================================================
    // LEVEL 4: BYGGSTENAR & BERÄKNA DELEN (CALCULATING PART / COMPOSITION)
    // =========================================================================
    private level4_BuildingBlocks(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'composition', type: 'calculate' },
            { key: 'decomposition', type: 'calculate' },
            { key: 'calc_any_percent', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'decomposition') {
            const strategies = [
                { pct: 15, parts: [10, 5], op: '+' },
                { pct: 20, parts: [10, 10], op: '+' },
                { pct: 30, parts: [10, 10, 10], op: '+' },
                { pct: 35, parts: [25, 10], op: '+' },
                { pct: 45, parts: [50, 5], op: '-' },
                { pct: 55, parts: [50, 5], op: '+' },
                { pct: 60, parts: [50, 10], op: '+' },
                { pct: 75, parts: [50, 25], op: '+' },
                { pct: 90, parts: [100, 10], op: '-' },
                { pct: 95, parts: [100, 5], op: '-' }
            ];
            const strat = MathUtils.randomChoice(strategies);
            const base = MathUtils.randomInt(3, 40) * 20;
            const ans = (base * strat.pct) / 100;
            const tenVal = base / 10;
            const fiveVal = base / 20;

            return {
                renderData: {
                    description: lang === 'sv' ? `Beräkna ${strat.pct}% av ${base}.` : `Calculate ${strat.pct}% of ${base}.`,
                    latex: `${strat.pct}\\% \\cdot ${base}`,
                    interceptorToken: `${strat.pct}% av ${base}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                variationKey: 'decomposition',
                type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? `Dela upp ${strat.pct}% i enkla byggstenar (t.ex. 10% och 5%).` 
                            : `Break ${strat.pct}% into building blocks (e.g., 10% and 5%).`, 
                        latex: `10\\% = ${tenVal}, \\quad 5\\% = ${fiveVal}` 
                    },
                    { 
                        text: lang === 'sv' 
                            ? `Kombinera delarna för att få ${strat.pct}%:` 
                            : `Combine the building blocks to get ${strat.pct}%:`, 
                        latex: `\\text{Resultat} = \\mathbf{${ans}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, 
                        latex: `${ans}` 
                    }
                ],
                metadata: { variation_key: 'decomposition', difficulty: 4 }
            };
        }

        if (v === 'composition') {
            const pct = MathUtils.randomChoice([20, 30, 40, 60, 70, 80, 90]);
            const base = MathUtils.randomInt(3, 85) * 10;
            const ans = (base * pct) / 100;
            const tenVal = base / 10;
            const factor = pct / 10;

            return {
                renderData: {
                    description: lang === 'sv' ? `Beräkna ${pct}% av ${base}.` : `Calculate ${pct}% of ${base}.`,
                    latex: `${pct}\\% \\cdot ${base}`,
                    interceptorToken: `${pct}% av ${base}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                variationKey: v,
                type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? `Steg 1: Räkna ut 10% först genom att dela ${base} med 10.` 
                            : `Step 1: Find 10% first by dividing ${base} by 10.`, 
                        latex: `10\\% = \\frac{${base}}{10} = ${tenVal}` 
                    },
                    { 
                        text: lang === 'sv' 
                            ? `Steg 2: Eftersom ${pct}% är ${factor} gånger så mycket som 10%, multiplicera med ${factor}:` 
                            : `Step 2: Since ${pct}% is ${factor} times 10%, multiply by ${factor}:`, 
                        latex: `${factor} \\cdot ${tenVal} = \\mathbf{${ans}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, 
                        latex: `${ans}` 
                    }
                ],
                metadata: { variation_key: v, difficulty: 4 }
            };
        }

        // calc_any_percent
        const pct = MathUtils.randomInt(2, 98);
        const g = this.gcd(pct, 100);
        const divisor = 100 / g;
        const mult = MathUtils.randomInt(1, Math.floor(600 / divisor));
        const base = divisor * mult;
        const ans = (pct * base) / 100;
        const prod = pct * base;

        return {
            renderData: {
                description: lang === 'sv' ? `Beräkna ${pct}% av ${base}.` : `Calculate ${pct}% of ${base}.`,
                latex: `${pct}\\% \\cdot ${base}`,
                interceptorToken: `${pct}% av ${base}`,
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()),
            variationKey: 'calc_any_percent',
            type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' 
                        ? `Multiplicera procenten med talet och dela med 100:` 
                        : `Multiply the percentage by the number and divide by 100:`, 
                    latex: `\\frac{${pct} \\cdot ${base}}{100} = \\frac{${prod}}{100}` 
                },
                { 
                    text: lang === 'sv' ? `Dela med 100:` : `Divide by 100:`, 
                    latex: `\\frac{${prod}}{100} = \\mathbf{${ans}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, 
                    latex: `${ans}` 
                }
            ],
            metadata: { variation_key: 'calc_any_percent', difficulty: 4 }
        };
    }

    // =========================================================================
    // LEVEL 5: PROCENTUELL FÖRÄNDRING & MULTIPLIER (PERCENTAGE CHANGE)
    // =========================================================================
    private level5_PercentageChange(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'change_calc', type: 'calculate' },
            { key: 'change_multiplier', type: 'calculate' },
            { key: 'change_trap', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'change_multiplier') {
            const isInc = Math.random() > 0.45;
            const p = isInc 
                ? MathUtils.randomChoice([2, 3.5, 5, 8, 12, 15, 20, 25, 35, 50, 75, 100, 150, 200])
                : MathUtils.randomChoice([2, 5, 8, 10, 12, 15, 20, 25, 30, 40, 50, 70, 85]);
            
            const ans = Math.round((isInc ? 1 + p / 100 : 1 - p / 100) * 1000) / 1000;
            const ansStr = lang === 'sv' ? ans.toString().replace('.', ',') : ans.toString();
            const pStr = lang === 'sv' ? p.toString().replace('.', ',') : p.toString();

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Vilken förändringsfaktor motsvarar en ${isInc ? 'ökning' : 'minskning'} med ${pStr}%?` 
                        : `Which change multiplier corresponds to an ${isInc ? 'increase' : 'decrease'} of ${pStr}%?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                variationKey: v,
                type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? "Ursprungsvärdet är alltid 100% = 1,00." 
                            : "The original baseline is always 100% = 1.00.", 
                        latex: `100\\% = 1,00` 
                    },
                    { 
                        text: lang === 'sv' 
                            ? (isInc ? `Vid en ökning adderas förändringen:` : `Vid en minskning dras förändringen bort:`) 
                            : (isInc ? `For an increase, add the change:` : `For a decrease, subtract the change:`), 
                        latex: isInc 
                            ? `1,00 + \\frac{${pStr}}{100} = 1,00 + ${(p / 100).toString().replace('.', ',')} = \\mathbf{${ansStr}}` 
                            : `1,00 - \\frac{${pStr}}{100} = 1,00 - ${(p / 100).toString().replace('.', ',')} = \\mathbf{${ansStr}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${ansStr}` : `Answer: ${ansStr}`, 
                        latex: `\\text{${ansStr}}` 
                    }
                ],
                metadata: { variation_key: v, difficulty: 5 }
            };
        }

        // change_calc
        const oldV = MathUtils.randomChoice([
            15, 20, 25, 30, 40, 50, 60, 75, 80, 90, 120, 150, 160, 200, 250, 300, 400, 500, 800, 1200, 2500
        ]);
        const isInc = Math.random() > 0.45;
        const validPercentages = [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80, 100, 150].filter(
            pct => (oldV * pct) % 100 === 0 && (isInc || pct < 100)
        );
        const p = MathUtils.randomChoice(validPercentages);
        const diff = (oldV * p) / 100;
        const newV = isInc ? oldV + diff : oldV - diff;

        return {
            renderData: {
                description: lang === 'sv' 
                    ? `Ett värde ändrades från ${oldV} till ${newV}. Vad var förändringen i procent?` 
                    : `A value changed from ${oldV} to ${newV}. What was the change in percent?`,
                latex: `\\frac{${diff}}{${oldV}}`,
                interceptorToken: `${diff} ; ${oldV}`,
                answerType: 'numeric',
                suffix: '%'
            },
            token: this.toBase64(p.toString()),
            variationKey: 'change_calc',
            type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' 
                        ? `Räkna först ut skillnaden: |${newV} - ${oldV}| = ${diff}.` 
                        : `First find the difference: |${newV} - ${oldV}| = ${diff}.`, 
                    latex: `\\text{Skillnad} = ${diff}` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Dela alltid skillnaden med det URSPRUNGLIGA värdet (${oldV}):` 
                        : `Always divide the difference by the ORIGINAL value (${oldV}):`, 
                    latex: `\\frac{\\text{Skillnad}}{\\text{Ursprungligt}} = \\frac{${diff}}{${oldV}} = ${(diff / oldV).toString().replace('.', ',')}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${p}%` : `Answer: ${p}%`, 
                    latex: `${p}\\%` 
                }
            ],
            metadata: { variation_key: 'change_calc', difficulty: 5 }
        };
    }

    // =========================================================================
    // LEVEL 6: OMVÄNDA PROBLEM / HITTA DET HELA (REVERSE PERCENTAGES)
    // =========================================================================
    private level6_ReversePercentage(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'reverse_find_whole', type: 'calculate' },
            { key: 'reverse_scaling', type: 'calculate' },
            { key: 'reverse_concept', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        const percentageScenarios = [
            { p: 1, divisor: 1, mult: 100 },
            { p: 2, divisor: 1, mult: 50 },
            { p: 4, divisor: 1, mult: 25 },
            { p: 5, divisor: 1, mult: 20 },
            { p: 10, divisor: 1, mult: 10 },
            { p: 20, divisor: 1, mult: 5 },
            { p: 25, divisor: 1, mult: 4 },
            { p: 50, divisor: 1, mult: 2 },
            { p: 30, divisor: 3, mult: 10 },
            { p: 40, divisor: 4, mult: 10 },
            { p: 60, divisor: 6, mult: 10 },
            { p: 70, divisor: 7, mult: 10 },
            { p: 80, divisor: 8, mult: 10 },
            { p: 8, divisor: 8, mult: 100 },
            { p: 12, divisor: 12, mult: 100 },
            { p: 15, divisor: 15, mult: 100 }
        ];

        const sc = MathUtils.randomChoice(percentageScenarios);
        const k = MathUtils.randomInt(2, 25);
        const part = sc.divisor * k;
        const total = (part / sc.p) * 100;

        return {
            renderData: {
                description: lang === 'sv' 
                    ? `${sc.p}% av ett belopp är ${part} kr. Vad är hela beloppet (100%)?` 
                    : `${sc.p}% of an amount is ${part} kr. What is the full amount (100%)?`,
                latex: `${sc.p}\\% = ${part}`,
                interceptorToken: `${part} ; ${sc.p}`,
                answerType: 'numeric'
            },
            token: this.toBase64(total.toString()),
            variationKey: 'reverse_find_whole',
            type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' 
                        ? `Räkna först ut vad 1% är genom att dela ${part} med ${sc.p}:` 
                        : `First find 1% by dividing ${part} by ${sc.p}:`, 
                    latex: `1\\% = \\frac{${part}}{${sc.p}} = ${part / sc.p}` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Multiplicera med 100 för att få 100%:` 
                        : `Multiply by 100 to get 100%:`, 
                    latex: `100\\% = ${(part / sc.p)} \\cdot 100 = \\mathbf{${total}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${total} kr` : `Answer: ${total} kr`, 
                    latex: `${total}` 
                }
            ],
            metadata: { variation_key: 'reverse_find_whole', difficulty: 6 }
        };
    }
}