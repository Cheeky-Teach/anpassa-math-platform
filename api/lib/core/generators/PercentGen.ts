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
            case 3: questionData = this.level3_PercentRate(lang, undefined, options); break;
            case 4: questionData = this.level4_BuildingBlocks(lang, undefined, options); break;
            case 5: questionData = this.level5_PercentageChange(lang, undefined, options); break;
            case 6: questionData = this.level6_ReversePercentage(lang, undefined, options); break;
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

    private formatNum(num: number, lang: string): string {
        const clean = Math.round(num * 10000) / 10000;
        return lang === 'sv' ? clean.toString().replace('.', ',') : clean.toString();
    }

    private getVariation(pool: { key: string; type: 'concept' | 'calculate' }[], options: any): string {
        let filtered = pool;
        if (options?.exclude && options.exclude.length > 0) {
            filtered = filtered.filter(v => !options.exclude.includes(v.key));
        }
        if (options?.hideConcept) {
            filtered = filtered.filter(v => v.type !== 'concept');
        }
        const isWP = options?.wordProblem === 'true' || options?.wordProblem === true;
        if (isWP) {
            filtered = filtered.filter(v => v.type !== 'concept');
        }
        if (filtered.length === 0) return pool[pool.length - 1].key;
        return MathUtils.randomChoice(filtered.map(v => v.key));
    }

    private gcd(a: number, b: number): number {
        return b === 0 ? a : this.gcd(b, a % b);
    }

    // =========================================================================
    // LEVEL 1: CONCEPTS & VISUALS (LGR22 Åk 4–6)
    // =========================================================================
    private level1_ConceptsAndVisuals(lang: string, variationKey?: string, options: any = {}): any {
        const pool: { key: string; type: 'concept' | 'calculate' }[] = [
            { key: 'visual_translation', type: 'calculate' },
            { key: 'visual_lie', type: 'concept' },
            { key: 'equivalence_basic_frac', type: 'concept' },
            { key: 'equivalence_basic_dec', type: 'concept' },
            { key: 'equivalence', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'visual_lie') {
            const total = MathUtils.randomChoice([10, 20, 25, 50]);
            const colored = MathUtils.randomInt(1, total - 1);
            const truePct = (colored / total) * 100;
            const lieText = lang === 'sv'
                ? `${colored}% av figuren är färgad.`
                : `${colored}% of the figure is colored.`;
            const truth1 = lang === 'sv'
                ? `${truePct}% av figuren är färgad.`
                : `${truePct}% of the figure is colored.`;
            const truth2 = lang === 'sv'
                ? `${colored} av ${total} rutor är färgade ($\\frac{${colored}}{${total}}$).`
                : `${colored} out of ${total} squares are colored ($\\frac{${colored}}{${total}}$).`;

            return {
                renderData: {
                    description: lang === 'sv'
                        ? "Studera rutnätet. Vilket påstående är FALSKT?"
                        : "Examine the grid. Which statement is FALSE?",
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([lieText, truth1, truth2]),
                    geometry: { type: 'percent_grid', total, colored }
                },
                token: this.toBase64(lieText),
                variationKey: v,
                type: 'concept',
                clues: [
                    {
                        text: lang === 'sv'
                            ? `Räkna det totala antalet rutor: figuren har ${total} rutor (inte 100).`
                            : `Count the total squares: the figure has ${total} squares (not 100).`,
                        latex: `\\frac{${colored}}{${total}}`
                    },
                    {
                        text: lang === 'sv'
                            ? `Förläng bråket till hundradelar genom att multiplicera med ${100 / total}:`
                            : `Scale the fraction to hundredths by multiplying by ${100 / total}:`,
                        latex: `\\frac{${colored} \\cdot ${100 / total}}{${total} \\cdot ${100 / total}} = \\frac{\\mathbf{${truePct}}}{100} = \\mathbf{${truePct}\\%}`
                    },
                    {
                        text: lang === 'sv'
                            ? `Alltså är påståendet "${lieText}" falskt.`
                            : `Therefore, the statement "${lieText}" is false.`,
                        latex: `\\mathbf{${truePct}\\%} \\neq ${colored}\\%`
                    }
                ]
            };
        }

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
                        latex: `\\mathbf{${pct}\\%}`
                    }
                ]
            };
        }

        if (v === 'equivalence_basic_dec') {
            const p = MathUtils.randomChoice([5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80, 90, 12.5, 2.5]);
            const decVal = p / 100;
            const decStr = this.formatNum(decVal, lang);
            const pStr = this.formatNum(p, lang);

            return {
                renderData: {
                    description: lang === 'sv'
                        ? `Skriv decimaltalet ${decStr} i procentform.`
                        : `Write the decimal ${decStr} as a percentage.`,
                    answerType: 'numeric',
                    suffix: '%'
                },
                token: this.toBase64(pStr),
                variationKey: v,
                type: 'concept',
                clues: [
                    {
                        text: lang === 'sv'
                            ? "Multiplicera decimaltalet med 100 för att omvandla till procent."
                            : "Multiply the decimal by 100 to convert to percent.",
                        latex: `${decStr} \\cdot 100`
                    },
                    {
                        text: lang === 'sv'
                            ? "Flytta kommatecknet två steg åt höger:"
                            : "Shift the decimal point two places to the right:",
                        latex: `${decStr} \\cdot 100 = \\mathbf{${pStr}\\%}`
                    },
                    {
                        text: lang === 'sv' ? `Svar: ${pStr}%` : `Answer: ${pStr}%`,
                        latex: `\\mathbf{${pStr}\\%}`
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
                        latex: `\\mathbf{${colored}\\%}`
                    }
                ]
            };
        }

        // equivalence (Percent to Decimal)
        const isHalf = Math.random() < 0.2;
        const p = isHalf
            ? MathUtils.randomChoice([2.5, 7.5, 12.5, 17.5, 37.5, 62.5, 87.5])
            : MathUtils.randomInt(1, 99);
        const decVal = p / 100;
        const decStr = this.formatNum(decVal, lang);
        const pStr = this.formatNum(p, lang);

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
                        ? "Flytta kommatecknet två steg åt vänster:"
                        : "Shift the decimal point two places to the left:",
                    latex: `\\frac{${pStr}}{100} = \\mathbf{${decStr}}`
                },
                {
                    text: lang === 'sv' ? `Svar: ${decStr}` : `Answer: ${decStr}`,
                    latex: `\\mathbf{${decStr}}`
                }
            ]
        };
    }

    // =========================================================================
    // LEVEL 2: MENTAL MATH & BENCHMARKS (LGR22 Åk 4–6)
    // =========================================================================
    private level2_MentalMath(lang: string, variationKey?: string, options: any = {}): any {
        const pool: { key: string; type: 'concept' | 'calculate' }[] = [
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
                            ? `Byt plats på talen: ${other}% av ${anchor} är lika mycket som ${anchor}% av ${other}.`
                            : `Swap the numbers: ${other}% of ${anchor} equals ${anchor}% of ${other}.`,
                        latex: `${other}\\% \\cdot ${anchor} = ${anchor}\\% \\cdot ${other}`
                    },
                    {
                        text: lang === 'sv'
                            ? `${anchor}% är samma sak som 1/${divisor}. Dela ${other} med ${divisor}:`
                            : `${anchor}% equals 1/${divisor}. Divide ${other} by ${divisor}:`,
                        latex: `\\frac{${other}}{${divisor}} = \\mathbf{${ans}}`
                    },
                    {
                        text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`,
                        latex: `\\mathbf{${ans}}`
                    }
                ]
            };
        }

        if (v === 'benchmark_calc') {
            const benchmarks = [
                { pct: 1, divisor: 100, labelSv: "en hundradel", labelEn: "one hundredth" },
                { pct: 5, divisor: 20, labelSv: "en tjugondel (hälften av 10%)", labelEn: "one twentieth (half of 10%)" },
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
                            ? `${bench.pct}% motsvarar ${bench.labelSv} (dela med ${bench.divisor}).`
                            : `${bench.pct}% corresponds to ${bench.labelEn} (divide by ${bench.divisor}).`,
                        latex: `${bench.pct}\\% = \\frac{1}{${bench.divisor}}`
                    },
                    {
                        text: lang === 'sv' ? `Dela ${base} med ${bench.divisor}:` : `Divide ${base} by ${bench.divisor}:`,
                        latex: `\\frac{${base}}{${bench.divisor}} = \\mathbf{${ans}}`
                    },
                    {
                        text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`,
                        latex: `\\mathbf{${ans}}`
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
                        ? `Det går ${inv.mult} stycken ${inv.pct}% på 100%.`
                        : `There are ${inv.mult} pieces of ${inv.pct}% in 100%.`,
                    latex: `${inv.mult} \\cdot ${inv.pct}\\% = 100\\%`
                },
                {
                    text: lang === 'sv'
                        ? `Multiplicera ${part} med ${inv.mult} för att få hela talet:`
                        : `Multiply ${part} by ${inv.mult} to get the whole number:`,
                    latex: `${part} \\cdot ${inv.mult} = \\mathbf{${total}}`
                },
                {
                    text: lang === 'sv' ? `Svar: ${total}` : `Answer: ${total}`,
                    latex: `\\mathbf{${total}}`
                }
            ]
        };
    }

    // =========================================================================
    // LEVEL 3: ANDELEN (FINDING THE RATE / PERCENTAGE SHARE — LGR22 Åk 6–7)
    // =========================================================================
    private level3_PercentRate(lang: string, variationKey?: string, options: any = {}): any {
        const pool: { key: string; type: 'concept' | 'calculate' }[] = [
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

        const decFormatted = this.formatNum(part / total, lang);
        const pFormatted = this.formatNum(p, lang);

        return {
            renderData: {
                description: desc,
                latex: `\\frac{${part}}{${total}}`,
                interceptorToken: `${part} ; ${total}`,
                answerType: 'numeric',
                suffix: '%'
            },
            token: this.toBase64(pFormatted),
            variationKey: v,
            type: 'calculate',
            clues: [
                {
                    text: lang === 'sv'
                        ? "Ställ upp andelen som bråket Delen / Det hela:"
                        : "Write the share as the fraction Part / Whole:",
                    latex: `\\text{Andel} = \\frac{\\text{Delen}}{\\text{Det hela}} = \\frac{${part}}{${total}}`
                },
                {
                    text: lang === 'sv'
                        ? "Dividera täljaren med nämnaren för att få decimalform:"
                        : "Divide numerator by denominator to get decimal form:",
                    latex: `\\frac{${part}}{${total}} = ${decFormatted}`
                },
                {
                    text: lang === 'sv'
                        ? "Multiplicera decimaltalet med 100 för att få procent:"
                        : "Multiply the decimal by 100 to convert to percent:",
                    latex: `${decFormatted} \\cdot 100 = \\mathbf{${pFormatted}\\%}`
                },
                {
                    text: lang === 'sv' ? `Svar: ${pFormatted}%` : `Answer: ${pFormatted}%`,
                    latex: `\\mathbf{${pFormatted}\\%}`
                }
            ],
            metadata: { variation_key: v, difficulty: 3 }
        };
    }

    // =========================================================================
    // LEVEL 4: BYGGSTENAR & BERÄKNA DELEN (LGR22 Åk 6–8)
    // =========================================================================
    private level4_BuildingBlocks(lang: string, variationKey?: string, options: any = {}): any {
        const pool: { key: string; type: 'concept' | 'calculate' }[] = [
            { key: 'composition', type: 'calculate' },
            { key: 'decomposition', type: 'calculate' },
            { key: 'estimation', type: 'concept' },
            { key: 'calc_any_percent', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'estimation') {
            const scenarios = [
                { pct: 49, base: 198, estPct: 50, estBase: 200, ans: 100, wrong: [20, 50, 150] },
                { pct: 24, base: 396, estPct: 25, estBase: 400, ans: 100, wrong: [40, 200, 25] },
                { pct: 19, base: 495, estPct: 20, estBase: 500, ans: 100, wrong: [50, 10, 250] },
                { pct: 11, base: 790, estPct: 10, estBase: 800, ans: 80, wrong: [8, 400, 160] },
                { pct: 76, base: 398, estPct: 75, estBase: 400, ans: 300, wrong: [75, 100, 200] }
            ];
            const sc = MathUtils.randomChoice(scenarios);
            const correctLabel = `≈ ${sc.ans}`;
            const opts = MathUtils.shuffle([correctLabel, ...sc.wrong.map(w => `≈ ${w}`)]);

            return {
                renderData: {
                    description: lang === 'sv'
                        ? `Uppskatta ungefär hur mycket ${sc.pct}% av ${sc.base} är.`
                        : `Estimate approximately how much ${sc.pct}% of ${sc.base} is.`,
                    answerType: 'multiple_choice',
                    options: opts
                },
                token: this.toBase64(correctLabel),
                variationKey: v,
                type: 'concept',
                clues: [
                    {
                        text: lang === 'sv'
                            ? `Avrunda till enkla referenstal: ${sc.pct}% ≈ ${sc.estPct}% och ${sc.base} ≈ ${sc.estBase}.`
                            : `Round to clean benchmark numbers: ${sc.pct}% ≈ ${sc.estPct}% and ${sc.base} ≈ ${sc.estBase}.`,
                        latex: `${sc.pct}\\% \\text{ av } ${sc.base} \\approx ${sc.estPct}\\% \\text{ av } ${sc.estBase}`
                    },
                    {
                        text: lang === 'sv'
                            ? `Beräkna det avrundade uttrycket:`
                            : `Calculate the rounded benchmark expression:`,
                        latex: `\\frac{${sc.estPct}}{100} \\cdot ${sc.estBase} = \\mathbf{${sc.ans}}`
                    },
                    {
                        text: lang === 'sv' ? `Svar: ${correctLabel}` : `Answer: ${correctLabel}`,
                        latex: `\\approx \\mathbf{${sc.ans}}`
                    }
                ],
                metadata: { variation_key: v, difficulty: 4 }
            };
        }

        if (v === 'decomposition') {
            const strategies = [
                { pct: 15, blocks: [10, 5], op: '+' },
                { pct: 35, blocks: [25, 10], op: '+' },
                { pct: 45, blocks: [50, 5], op: '-' },
                { pct: 55, blocks: [50, 5], op: '+' },
                { pct: 65, blocks: [50, 10, 5], op: '+' },
                { pct: 75, blocks: [50, 25], op: '+' },
                { pct: 95, blocks: [100, 5], op: '-' }
            ];
            const strat = MathUtils.randomChoice(strategies);
            const base = MathUtils.randomInt(3, 40) * 20;
            const ans = (base * strat.pct) / 100;

            const blockVals = strat.blocks.map(b => (base * b) / 100);
            const blockDefs = strat.blocks
                .map((b, i) => `${b}\\% = ${blockVals[i]}`)
                .join(', \\quad ');

            const exprExpr = strat.op === '-'
                ? `${blockVals[0]} - ${blockVals[1]}`
                : blockVals.join(' + ');

            const pctBreakdown = strat.op === '-'
                ? `${strat.blocks[0]}\\% - ${strat.blocks[1]}\\%`
                : strat.blocks.map(b => `${b}\\%`).join(' + ');

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
                            ? `Dela upp ${strat.pct}% i enkla byggstenar (${pctBreakdown}):`
                            : `Break ${strat.pct}% into benchmark blocks (${pctBreakdown}):`,
                        latex: blockDefs
                    },
                    {
                        text: lang === 'sv'
                            ? `Sätt ihop byggstenarna för att få ${strat.pct}%:`
                            : `Combine the blocks to calculate ${strat.pct}%:`,
                        latex: `${exprExpr} = \\mathbf{${ans}}`
                    },
                    {
                        text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`,
                        latex: `\\mathbf{${ans}}`
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
                            ? `Räkna ut 10% först genom att dela ${base} med 10:`
                            : `Find 10% first by dividing ${base} by 10:`,
                        latex: `10\\% = \\frac{${base}}{10} = ${tenVal}`
                    },
                    {
                        text: lang === 'sv'
                            ? `${pct}% är ${factor} gånger så mycket som 10%. Multiplicera med ${factor}:`
                            : `${pct}% is ${factor} times 10%. Multiply by ${factor}:`,
                        latex: `${factor} \\cdot ${tenVal} = \\mathbf{${ans}}`
                    },
                    {
                        text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`,
                        latex: `\\mathbf{${ans}}`
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
        const decRate = this.formatNum(pct / 100, lang);

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
                        ? `Skriv ${pct}% i decimalform (dela med 100):`
                        : `Write ${pct}% in decimal form (divide by 100):`,
                    latex: `${pct}\\% = \\frac{${pct}}{100} = ${decRate}`
                },
                {
                    text: lang === 'sv'
                        ? `Multiplicera andelen (${decRate}) med det hela (${base}):`
                        : `Multiply the decimal rate (${decRate}) by the whole (${base}):`,
                    latex: `${decRate} \\cdot ${base} = \\mathbf{${ans}}`
                },
                {
                    text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`,
                    latex: `\\mathbf{${ans}}`
                }
            ],
            metadata: { variation_key: 'calc_any_percent', difficulty: 4 }
        };
    }

    // =========================================================================
    // LEVEL 5: PROCENTUELL FÖRÄNDRING & MULTIPLIER (LGR22 Åk 8–9)
    // =========================================================================
    private level5_PercentageChange(lang: string, variationKey?: string, options: any = {}): any {
        const pool: { key: string; type: 'concept' | 'calculate' }[] = [
            { key: 'change_calc', type: 'calculate' },
            { key: 'change_multiplier', type: 'calculate' },
            { key: 'change_trap', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'change_trap') {
            const p = MathUtils.randomChoice([10, 20, 25, 50]);
            const startPrice = 200;
            const afterUp = startPrice * (1 + p / 100);
            const finalPrice = afterUp * (1 - p / 100);
            const wrongSame = lang === 'sv'
                ? `Priset är tillbaka på ${startPrice} kr eftersom +${p}% och -${p}% tar ut varandra.`
                : `The price is back to ${startPrice} kr because +${p}% and -${p}% cancel out.`;
            const correctLower = lang === 'sv'
                ? `Priset blir lägre (${finalPrice} kr) eftersom sänkningen räknas på det högre priset (${afterUp} kr).`
                : `The price ends up lower (${finalPrice} kr) because the decrease is taken from the higher price (${afterUp} kr).`;
            const wrongHigher = lang === 'sv'
                ? `Priset blir högre än ${startPrice} kr.`
                : `The price ends up higher than ${startPrice} kr.`;

            return {
                renderData: {
                    description: lang === 'sv'
                        ? `En jacka kostar ${startPrice} kr. Priset höjs först med ${p}% och sänks sedan med ${p}%. Vad händer med priset?`
                        : `A jacket costs ${startPrice} kr. Its price increases by ${p}% and then decreases by ${p}%. What happens to the price?`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([correctLower, wrongSame, wrongHigher])
                },
                token: this.toBase64(correctLower),
                variationKey: v,
                type: 'concept',
                clues: [
                    {
                        text: lang === 'sv'
                            ? `Efter höjningen med ${p}% kostar jackan ${afterUp} kr:`
                            : `After the ${p}% increase, the jacket costs ${afterUp} kr:`,
                        latex: `${startPrice} \\cdot ${this.formatNum(1 + p / 100, lang)} = ${afterUp}\\text{ kr}`
                    },
                    {
                        text: lang === 'sv'
                            ? `Sänkningen med ${p}% beräknas nu på det NYA priset (${afterUp} kr), inte ${startPrice} kr:`
                            : `The ${p}% decrease is now calculated on the NEW price (${afterUp} kr), not ${startPrice} kr:`,
                        latex: `${afterUp} \\cdot ${this.formatNum(1 - p / 100, lang)} = \\mathbf{${finalPrice}\\text{ kr}}`
                    },
                    {
                        text: lang === 'sv'
                            ? `Eftersom ${finalPrice} kr < ${startPrice} kr blir slutpriset lägre.`
                            : `Since ${finalPrice} kr < ${startPrice} kr, the final price is lower.`,
                        latex: `${finalPrice} < ${startPrice}`
                    }
                ],
                metadata: { variation_key: v, difficulty: 5 }
            };
        }

        if (v === 'change_multiplier') {
            const isInc = Math.random() > 0.45;
            const p = isInc
                ? MathUtils.randomChoice([2, 3.5, 5, 8, 12, 15, 20, 25, 35, 50, 75, 100, 150, 200])
                : MathUtils.randomChoice([2, 5, 8, 10, 12, 15, 20, 25, 30, 40, 50, 70, 85]);

            const ans = Math.round((isInc ? 1 + p / 100 : 1 - p / 100) * 1000) / 1000;
            const ansStr = this.formatNum(ans, lang);
            const pStr = this.formatNum(p, lang);
            const deltaStr = this.formatNum(p / 100, lang);
            const baseOne = lang === 'sv' ? '1,00' : '1.00';

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
                            ? `Ursprungsvärdet är alltid 100% = ${baseOne}.`
                            : `The original baseline is always 100% = ${baseOne}.`,
                        latex: `100\\% = ${baseOne}`
                    },
                    {
                        text: lang === 'sv'
                            ? (isInc ? `Vid en ökning adderar vi ${pStr}% (${deltaStr}):` : `Vid en minskning drar vi bort ${pStr}% (${deltaStr}):`)
                            : (isInc ? `For an increase, add ${pStr}% (${deltaStr}):` : `For a decrease, subtract ${pStr}% (${deltaStr}):`),
                        latex: isInc
                            ? `${baseOne} + \\frac{${pStr}}{100} = ${baseOne} + ${deltaStr} = \\mathbf{${ansStr}}`
                            : `${baseOne} - \\frac{${pStr}}{100} = ${baseOne} - ${deltaStr} = \\mathbf{${ansStr}}`
                    },
                    {
                        text: lang === 'sv' ? `Svar: ${ansStr}` : `Answer: ${ansStr}`,
                        latex: `\\mathbf{${ansStr}}`
                    }
                ],
                metadata: { variation_key: v, difficulty: 5 }
            };
        }

        // change_calc
        const oldV = MathUtils.randomChoice([
            20, 25, 40, 50, 60, 75, 80, 120, 150, 160, 200, 250, 300, 400, 500, 800, 1200, 2500
        ]);
        const isInc = Math.random() > 0.45;
        const validPercentages = [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80, 100, 150].filter(
            pct => (oldV * pct) % 100 === 0 && (isInc || pct < 100)
        );
        const p = MathUtils.randomChoice(validPercentages);
        const diff = (oldV * p) / 100;
        const newV = isInc ? oldV + diff : oldV - diff;
        const decShare = this.formatNum(diff / oldV, lang);

        return {
            renderData: {
                description: lang === 'sv'
                    ? `Ett värde ändrades från ${oldV} till ${newV}. Vad var förändringen i procent?`
                    : `A value changed from ${oldV} to ${newV}. What was the change in percent?`,
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
                        ? "Räkna först ut själva förändringen (skillnaden mellan nytt och gammalt värde):"
                        : "First calculate the change (difference between new and old value):",
                    latex: isInc
                        ? `${newV} - ${oldV} = \\mathbf{${diff}}`
                        : `${oldV} - ${newV} = \\mathbf{${diff}}`
                },
                {
                    text: lang === 'sv'
                        ? `Dela förändringen (${diff}) med det URSPRUNGLIGA värdet (${oldV}):`
                        : `Divide the change (${diff}) by the ORIGINAL value (${oldV}):`,
                    latex: `\\frac{\\text{Förändring}}{\\text{Ursprungsvärde}} = \\frac{${diff}}{${oldV}} = ${decShare}`
                },
                {
                    text: lang === 'sv'
                        ? "Multiplicera med 100 för att få svaret i procent:"
                        : "Multiply by 100 to convert to percent:",
                    latex: `${decShare} \\cdot 100 = \\mathbf{${p}\\%}`
                },
                {
                    text: lang === 'sv' ? `Svar: ${p}%` : `Answer: ${p}%`,
                    latex: `\\mathbf{${p}\\%}`
                }
            ],
            metadata: { variation_key: 'change_calc', difficulty: 5 }
        };
    }

    // =========================================================================
    // LEVEL 6: OMVÄNDA PROBLEM / HITTA DET HELA (LGR22 Åk 7–9)
    // =========================================================================
    private level6_ReversePercentage(lang: string, variationKey?: string, options: any = {}): any {
        const pool: { key: string; type: 'concept' | 'calculate' }[] = [
            { key: 'reverse_find_whole', type: 'calculate' },
            { key: 'reverse_scaling', type: 'calculate' },
            { key: 'reverse_concept', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'reverse_concept') {
            const p = MathUtils.randomChoice([10, 20, 25, 50]);
            const mult = 100 / p;
            const part = MathUtils.randomInt(3, 15) * 10;
            const correct = lang === 'sv'
                ? `Multiplicera ${part} med ${mult}`
                : `Multiply ${part} by ${mult}`;
            const wrong1 = lang === 'sv'
                ? `Dela ${part} med ${mult}`
                : `Divide ${part} by ${mult}`;
            const wrong2 = lang === 'sv'
                ? `Multiplicera ${part} med ${p}`
                : `Multiply ${part} by ${p}`;

            return {
                renderData: {
                    description: lang === 'sv'
                        ? `Du vet att ${p}% av ett tal är ${part}. Hur räknar du snabbast ut vad 100% är?`
                        : `You know that ${p}% of a number is ${part}. What is the fastest way to find 100%?`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([correct, wrong1, wrong2])
                },
                token: this.toBase64(correct),
                variationKey: v,
                type: 'concept',
                clues: [
                    {
                        text: lang === 'sv'
                            ? `Eftersom ${p}% är en ${mult}-del av 100% behöver vi ${mult} stycken sådana delar.`
                            : `Since ${p}% is 1/${mult} of 100%, we need ${mult} of those parts.`,
                        latex: `${p}\\% \\cdot ${mult} = 100\\%`
                    },
                    {
                        text: lang === 'sv'
                            ? `Alltså multiplicerar vi ${part} med ${mult} (vilket ger ${part * mult}).`
                            : `Therefore we multiply ${part} by ${mult} (giving ${part * mult}).`,
                        latex: `${part} \\cdot ${mult} = \\mathbf{${part * mult}}`
                    }
                ],
                metadata: { variation_key: v, difficulty: 6 }
            };
        }

        if (v === 'reverse_scaling') {
            const scalingScenarios = [
                { p: 20, mult: 5 },
                { p: 25, mult: 4 },
                { p: 50, mult: 2 },
                { p: 10, mult: 10 },
                { p: 5, mult: 20 }
            ];
            const sc = MathUtils.randomChoice(scalingScenarios);
            const part = MathUtils.randomInt(4, 45);
            const total = part * sc.mult;

            return {
                renderData: {
                    description: lang === 'sv'
                        ? `${sc.p}% av en sträcka är ${part} m. Hur lång är hela sträckan (100%)?`
                        : `${sc.p}% of a distance is ${part} m. How long is the whole distance (100%)?`,
                    latex: `${sc.p}\\% = ${part}`,
                    interceptorToken: `${part} ; ${sc.p}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(total.toString()),
                variationKey: v,
                type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv'
                            ? `Skala upp från ${sc.p}% till 100% genom att multiplicera med ${sc.mult}:`
                            : `Scale up from ${sc.p}% to 100% by multiplying by ${sc.mult}:`,
                        latex: `${sc.p}\\% \\cdot \\mathbf{${sc.mult}} = 100\\%`
                    },
                    {
                        text: lang === 'sv'
                            ? `Gör samma multiplikation med ${part} m:`
                            : `Apply the same multiplication to ${part} m:`,
                        latex: `${part} \\cdot \\mathbf{${sc.mult}} = \\mathbf{${total}}`
                    },
                    {
                        text: lang === 'sv' ? `Svar: ${total} m` : `Answer: ${total} m`,
                        latex: `\\mathbf{${total}}`
                    }
                ],
                metadata: { variation_key: v, difficulty: 6 }
            };
        }

        // reverse_find_whole (1%-metoden with guaranteed clean integer 1%)
        const pctChoices = [2, 3, 4, 5, 6, 8, 12, 15, 20, 25, 30, 40, 60, 75, 80];
        const p = MathUtils.randomChoice(pctChoices);
        const onePctVal = MathUtils.randomInt(2, 25);
        const part = p * onePctVal;
        const total = onePctVal * 100;

        return {
            renderData: {
                description: lang === 'sv'
                    ? `${p}% av ett belopp är ${part} kr. Vad är hela beloppet (100%)?`
                    : `${p}% of an amount is ${part} kr. What is the full amount (100%)?`,
                latex: `${p}\\% = ${part}`,
                interceptorToken: `${part} ; ${p}`,
                answerType: 'numeric'
            },
            token: this.toBase64(total.toString()),
            variationKey: 'reverse_find_whole',
            type: 'calculate',
            clues: [
                {
                    text: lang === 'sv'
                        ? `Räkna först ut vad 1% är genom att dela ${part} med ${p}:`
                        : `First find 1% by dividing ${part} by ${p}:`,
                    latex: `1\\% = \\frac{${part}}{${p}} = \\mathbf{${onePctVal}}`
                },
                {
                    text: lang === 'sv'
                        ? `Multiplicera värdet av 1% (${onePctVal}) med 100 för att få 100%:`
                        : `Multiply the 1% value (${onePctVal}) by 100 to get 100%:`,
                    latex: `100\\% = ${onePctVal} \\cdot 100 = \\mathbf{${total}}`
                },
                {
                    text: lang === 'sv' ? `Svar: ${total} kr` : `Answer: ${total} kr`,
                    latex: `\\mathbf{${total}}`
                }
            ],
            metadata: { variation_key: 'reverse_find_whole', difficulty: 6 }
        };
    }
}