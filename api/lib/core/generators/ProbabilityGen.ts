import { MathUtils } from '../utils/MathUtils.js';
import { enrichQuestionMetadata } from '../utils/WordProblemDecorator.js';

export class ProbabilityGen {
    // --- PRIVATE HELPER METHODS ---

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    private gcd(a: number, b: number): number {
        let x = Math.abs(a);
        let y = Math.abs(b);
        while (y) {
            const t = y;
            y = x % y;
            x = t;
        }
        return x || 1;
    }

    // Reduces fractions to simplest form for validation tokens
    private reduceFraction(num: number, den: number): { n: number; d: number; str: string } {
        if (den === 0) return { n: 0, d: 1, str: "0/1" };
        const g = this.gcd(num, den);
        const n = num / g;
        const d = den / g;
        return { n, d, str: `${n}/${d}` };
    }

    private formatDecimal(val: number, lang: string): string {
        const clean = parseFloat(val.toFixed(4));
        return lang === 'sv' ? clean.toString().replace('.', ',') : clean.toString();
    }

    private getVariation(pool: { key: string; type: 'concept' | 'calculate' }[], options: any): string {
        let filtered = pool;
        if (options?.exclude) filtered = filtered.filter(v => !options.exclude.includes(v.key));
        if (options?.hideConcept) filtered = filtered.filter(v => v.type !== 'concept');
        if (filtered.length === 0) return pool[0].key;
        return MathUtils.randomChoice(filtered.map(v => v.key));
    }

    // --- MAIN GENERATE ENTRYPOINT ---

    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        let questionData: any;

        switch (level) {
            case 1: questionData = this.level1_ScaleAndVisuals(lang, undefined, options); break;
            case 2: questionData = this.level2_ThreeRepresentations(lang, undefined, options); break;
            case 3: questionData = this.level3_StandardModels(lang, undefined, options); break;
            case 4: questionData = this.level4_ComplementAndOr(lang, undefined, options); break;
            case 5: questionData = this.level5_CombinatoricsAndPaths(lang, undefined, options); break;
            case 6: questionData = this.level6_IndependentChains(lang, undefined, options); break;
            case 7: questionData = this.level7_DependentTrees(lang, undefined, options); break;
            default: questionData = this.level1_ScaleAndVisuals(lang, undefined, options); break;
        }

        enrichQuestionMetadata(questionData);

        const WORD_PROBLEM_ELIGIBLE_LEVELS = [1, 2, 3, 4, 5, 6, 7];
        if (WORD_PROBLEM_ELIGIBLE_LEVELS.includes(level)) {
            if (!questionData.metadata) questionData.metadata = {};
            questionData.metadata.levelSupportsWordProblems = true;
        }

        return questionData;
    }

    // --- VARIATION DISPATCHER (For Question Studio / Targeted Practice) ---

    public generateByVariation(key: string, lang: string = 'sv', options: any = {}): any {
        let questionData: any;

        switch (key) {
            // Level 1
            case 'prob_scale_vocab':
            case 'prob_visual_spinner':
            case 'prob_visual_marbles':
                questionData = this.level1_ScaleAndVisuals(lang, key, options);
                break;

            // Level 2
            case 'prob_rep_to_percent':
            case 'prob_rep_to_decimal':
            case 'prob_rep_to_fraction':
                questionData = this.level2_ThreeRepresentations(lang, key, options);
                break;

            // Level 3
            case 'prob_dice_single':
            case 'prob_dice_parity':
            case 'prob_dice_threshold':
            case 'prob_cards_suit':
            case 'prob_cards_face':
            case 'prob_cards_rank':
                questionData = this.level3_StandardModels(lang, key, options);
                break;

            // Level 4
            case 'prob_comp_lottery':
            case 'prob_comp_cards_dice':
            case 'prob_or_disjoint':
            case 'prob_ternary_remainder':
                questionData = this.level4_ComplementAndOr(lang, key, options);
                break;

            // Level 5
            case 'prob_comb_multiplication':
            case 'prob_comb_pathways':
                questionData = this.level5_CombinatoricsAndPaths(lang, key, options);
                break;

            // Level 6
            case 'prob_indep_coins':
            case 'prob_indep_dice_sum':
            case 'prob_indep_with_replacement':
                questionData = this.level6_IndependentChains(lang, key, options);
                break;

            // Level 7
            case 'prob_dep_tree_branch':
            case 'prob_dep_one_of_each':
            case 'prob_dep_at_least_one':
                questionData = this.level7_DependentTrees(lang, key, options);
                break;

            default:
                questionData = this.generate(1, lang, options);
                break;
        }

        return enrichQuestionMetadata(questionData);
    }

    // =========================================================================
    // LEVEL 1: Sannolikhetsskalan & Visuella Modeller (Bråk)
    // =========================================================================
    private level1_ScaleAndVisuals(lang: string, variationKey?: string, options: any = {}): any {
        const pool: { key: string; type: 'concept' | 'calculate' }[] = [
            { key: 'prob_scale_vocab', type: 'concept' },
            { key: 'prob_visual_spinner', type: 'calculate' },
            { key: 'prob_visual_marbles', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'prob_scale_vocab') {
            const scenarios = [
                {
                    text: lang === 'sv' ? "att slå en 7:a med en vanlig sexsidig tärning" : "rolling a 7 on a standard six-sided die",
                    answer: lang === 'sv' ? "Omöjligt" : "Impossible",
                    val: 0,
                    reason: lang === 'sv' ? "En tärning har bara sidorna 1 till 6. Det finns ingen 7:a." : "A die only has numbers 1 through 6. A 7 does not exist."
                },
                {
                    text: lang === 'sv' ? "att få krona eller klave vid ett vanligt myntkast" : "getting heads or tails on a standard coin toss",
                    answer: lang === 'sv' ? "Säkert" : "Certain",
                    val: 1,
                    reason: lang === 'sv' ? "Ett mynt har bara två sidor. Det måste landa på en av dem." : "A coin only has two sides. It is guaranteed to land on one of them."
                },
                {
                    text: lang === 'sv' ? "att få krona när du kastar ett vanligt mynt" : "getting heads when tossing a standard coin",
                    answer: lang === 'sv' ? "Hälften/hälften" : "Even chance",
                    val: 0.5,
                    reason: lang === 'sv' ? "Det finns 1 krona av 2 sidor (1/2 = 50%)." : "There is 1 head out of 2 sides (1/2 = 50%)."
                }
            ];

            const item = MathUtils.randomChoice(scenarios);
            const optionsArr = lang === 'sv'
                ? ["Omöjligt", "Hälften/hälften", "Säkert"]
                : ["Impossible", "Even chance", "Certain"];

            return {
                renderData: {
                    description: lang === 'sv'
                        ? `Hur sannolikt är det: "${item.text}"?`
                        : `How likely is the event: "${item.text}"?`,
                    answerType: 'multiple_choice',
                    options: optionsArr
                },
                token: this.toBase64(item.answer),
                variationKey: v,
                type: 'concept',
                clues: [
                    {
                        text: lang === 'sv'
                            ? "Sannolikhet mäts på en skala från 0 (omöjligt) till 1 (säkert)."
                            : "Probability is measured on a scale from 0 (impossible) to 1 (certain).",
                        latex: `0 \\le P \\le 1`
                    },
                    {
                        text: item.reason,
                        latex: `P = ${item.val}`
                    },
                    {
                        text: lang === 'sv' ? `Svar: ${item.answer}` : `Answer: ${item.answer}`,
                        latex: `\\text{${item.answer}}`
                    }
                ]
            };
        }

        if (v === 'prob_visual_spinner') {
            const sections = MathUtils.randomChoice([6, 8, 10, 12]);
            const targetColor = MathUtils.randomChoice(['red', 'blue', 'green'] as const);
            const colorNames = {
                red: { sv: "röd", en: "red" },
                blue: { sv: "blå", en: "blue" },
                green: { sv: "grön", en: "green" }
            };

            const favorable = MathUtils.randomInt(1, Math.floor(sections / 2));
            const reduced = this.reduceFraction(favorable, sections);

            const counts = { red: 0, blue: 0, green: 0 };
            counts[targetColor] = favorable;

            return {
                renderData: {
                    description: lang === 'sv'
                        ? `Hjulet har ${sections} lika stora fält. ${favorable} av fälten är ${colorNames[targetColor].sv}. Vad är sannolikheten att pilen stannar på ${colorNames[targetColor].sv}? Svar med bråk i enklaste form.`
                        : `The wheel has ${sections} equal sectors. ${favorable} of the sectors are ${colorNames[targetColor].en}. What is the probability of the pointer landing on ${colorNames[targetColor].en}? Answer with a fraction in simplest form.`,
                    answerType: 'fraction',
                    geometry: { type: 'spinner', sections, counts }
                },
                token: this.toBase64(reduced.str),
                variationKey: v,
                type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv'
                            ? "Sannolikhet beräknas som antalet gynnsamma fält dividerat med det totala antalet fält."
                            : "Probability is calculated as favorable sectors divided by total sectors.",
                        latex: `P = \\frac{\\text{Gynnsamma utfall}}{\\text{Möjliga utfall}}`
                    },
                    {
                        text: lang === 'sv'
                            ? `Det finns ${favorable} önskade fält av totalt ${sections} fält.`
                            : `There are ${favorable} favorable sectors out of ${sections} total sectors.`,
                        latex: `P = \\frac{${favorable}}{${sections}}`
                    },
                    ...(reduced.n !== favorable ? [{
                        text: lang === 'sv'
                            ? `Förkorta bråket genom att dividera täljare och nämnare med ${this.gcd(favorable, sections)}.`
                            : `Simplify the fraction by dividing the numerator and denominator by ${this.gcd(favorable, sections)}.`,
                        latex: `\\frac{${favorable}}{${sections}} = \\frac{${reduced.n}}{${reduced.d}}`
                    }] : []),
                    {
                        text: lang === 'sv' ? `Svar: ${reduced.str}` : `Answer: ${reduced.str}`,
                        latex: `\\frac{${reduced.n}}{${reduced.d}}`
                    }
                ]
            };
        }

        // prob_visual_marbles
        const r = MathUtils.randomInt(2, 5);
        const b = MathUtils.randomInt(2, 5);
        const g = MathUtils.randomInt(1, 4);
        const total = r + b + g;

        const target = MathUtils.randomChoice([
            { name: { sv: "röd", en: "red" }, count: r },
            { name: { sv: "blå", en: "blue" }, count: b },
            { name: { sv: "grön", en: "green" }, count: g }
        ]);

        const reduced = this.reduceFraction(target.count, total);

        return {
            renderData: {
                description: lang === 'sv'
                    ? `I skålen finns ${r} röda, ${b} blåa och ${g} gröna kulor. Du drar en kula slumpmässigt. Vad är sannolikheten att den är ${target.name.sv}? Svar med bråk i enklaste form.`
                    : `In the bowl there are ${r} red, ${b} blue, and ${g} green marbles. You pick one at random. What is the probability that it is ${target.name.en}? Answer with a fraction in simplest form.`,
                interceptorToken: `${target.count} ; ${total}`,
                answerType: 'fraction',
                geometry: { type: 'marbles', items: { red: r, blue: b, green: g } }
            },
            token: this.toBase64(reduced.str),
            variationKey: v,
            type: 'calculate',
            clues: [
                {
                    text: lang === 'sv'
                        ? "Räkna först ihop det totala antalet kulor i skålen."
                        : "First, sum up the total count of marbles in the bowl.",
                    latex: `\\text{Totalt} = ${r} + ${b} + ${g} = ${total}`
                },
                {
                    text: lang === 'sv'
                        ? `Ställ upp bråket: ${target.count} gynnsamma kulor av ${total} möjliga.`
                        : `Set up the fraction: ${target.count} favorable marbles out of ${total} possible.`,
                    latex: `P = \\frac{${target.count}}{${total}}`
                },
                ...(reduced.n !== target.count ? [{
                    text: lang === 'sv'
                        ? `Förkorta bråket till enklaste form.`
                        : `Simplify the fraction to simplest form.`,
                    latex: `\\frac{${target.count}}{${total}} = \\frac{${reduced.n}}{${reduced.d}}`
                }] : []),
                {
                    text: lang === 'sv' ? `Svar: ${reduced.str}` : `Answer: ${reduced.str}`,
                    latex: `\\frac{${reduced.n}}{${reduced.d}}`
                }
            ]
        };
    }

    // =========================================================================
    // LEVEL 2: De Tre Uttrycksformerna (Bråk ↔ Decimal ↔ Procent)
    // =========================================================================
    private level2_ThreeRepresentations(lang: string, variationKey?: string, options: any = {}): any {
        const pool: { key: string; type: 'calculate' }[] = [
            { key: 'prob_rep_to_percent', type: 'calculate' },
            { key: 'prob_rep_to_decimal', type: 'calculate' },
            { key: 'prob_rep_to_fraction', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        const friendlyFractions = [
            { n: 1, d: 2, dec: 0.5, pct: 50 },
            { n: 1, d: 4, dec: 0.25, pct: 25 },
            { n: 3, d: 4, dec: 0.75, pct: 75 },
            { n: 1, d: 5, dec: 0.2, pct: 20 },
            { n: 2, d: 5, dec: 0.4, pct: 40 },
            { n: 3, d: 5, dec: 0.6, pct: 60 },
            { n: 4, d: 5, dec: 0.8, pct: 80 },
            { n: 1, d: 10, dec: 0.1, pct: 10 },
            { n: 3, d: 10, dec: 0.3, pct: 30 },
            { n: 7, d: 10, dec: 0.7, pct: 70 },
            { n: 1, d: 20, dec: 0.05, pct: 5 }
        ];

        const item = MathUtils.randomChoice(friendlyFractions);

        if (v === 'prob_rep_to_percent') {
            return {
                renderData: {
                    description: lang === 'sv'
                        ? `Sannolikheten för en vinst i ett lotteri är ${item.n}/${item.d}. Vad är sannolikheten uttryckt i procent?`
                        : `The probability of winning a lottery is ${item.n}/${item.d}. What is the probability expressed as a percentage?`,
                    answerType: 'numeric',
                    suffix: '%',
                },
                token: this.toBase64(item.pct.toString()),
                variationKey: v,
                type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv'
                            ? "Förläng bråket så att nämnaren blir 100, eftersom procent betyder hundradel."
                            : "Expand the fraction so the denominator becomes 100, since percent means per hundred.",
                        latex: `\\frac{${item.n}}{${item.d}} = \\frac{${item.n} \\cdot ${100 / item.d}}{${item.d} \\cdot ${100 / item.d}} = \\frac{${item.pct}}{100}`
                    },
                    {
                        text: lang === 'sv'
                            ? `${item.pct} hundradelar motsvarar ${item.pct}%.`
                            : `${item.pct} hundredths corresponds to ${item.pct}%.`,
                        latex: `\\frac{${item.pct}}{100} = ${item.pct}\\%`
                    },
                    {
                        text: lang === 'sv' ? `Svar: ${item.pct}%` : `Answer: ${item.pct}%`,
                        latex: `${item.pct}\\%`
                    }
                ]
            };
        }

        if (v === 'prob_rep_to_decimal') {
            const decFormatted = this.formatDecimal(item.dec, lang);
            return {
                renderData: {
                    description: lang === 'sv'
                        ? `Sannolikheten för en händelse är ${item.n}/${item.d}. Skriv sannolikheten i decimalform.`
                        : `The probability of an event is ${item.n}/${item.d}. Write the probability as a decimal.`,
                    answerType: 'numeric',
                },
                token: this.toBase64(item.dec.toString()),
                variationKey: v,
                type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv'
                            ? `Dela täljaren med nämnaren (${item.n} / ${item.d}).`
                            : `Divide the numerator by the denominator (${item.n} / ${item.d}).`,
                        latex: `${item.n} / ${item.d}`
                    },
                    {
                        text: lang === 'sv'
                            ? `Beräkningen ger ${decFormatted}.`
                            : `The division gives ${item.dec}.`,
                        latex: `\\frac{${item.n}}{${item.d}} = ${decFormatted}`
                    },
                    {
                        text: lang === 'sv' ? `Svar: ${decFormatted}` : `Answer: ${item.dec}`,
                        latex: decFormatted
                    }
                ]
            };
        }

        // prob_rep_to_fraction
        return {
            renderData: {
                description: lang === 'sv'
                    ? `Sannolikheten för ett utfall är ${item.pct}%. Ange sannolikheten som ett förkortat bråk.`
                    : `The probability of an outcome is ${item.pct}%. Provide the probability as a fraction in simplest form.`,
                answerType: 'fraction',
            },
            token: this.toBase64(`${item.n}/${item.d}`),
            variationKey: v,
            type: 'calculate',
            clues: [
                {
                    text: lang === 'sv'
                        ? `Skriv först ${item.pct}% som ett bråk med 100 i nämnaren.`
                        : `First write ${item.pct}% as a fraction with 100 in the denominator.`,
                    latex: `${item.pct}\\% = \\frac{${item.pct}}{100}`
                },
                {
                    text: lang === 'sv'
                        ? `Förkorta bråket genom att dividera med ${this.gcd(item.pct, 100)}.`
                        : `Simplify the fraction by dividing numerator and denominator by ${this.gcd(item.pct, 100)}.`,
                    latex: `\\frac{${item.pct}}{100} = \\frac{${item.n}}{${item.d}}`
                },
                {
                    text: lang === 'sv' ? `Svar: ${item.n}/${item.d}` : `Answer: ${item.n}/${item.d}`,
                    latex: `\\frac{${item.n}}{${item.d}}`
                }
            ]
        };
    }

    // =========================================================================
    // LEVEL 3: Likformiga Slumpförsök (Tärning & 52-Korts Kortlek)
    // =========================================================================
    private level3_StandardModels(lang: string, variationKey?: string, options: any = {}): any {
        const pool: { key: string; type: 'calculate' }[] = [
            { key: 'prob_dice_single', type: 'calculate' },
            { key: 'prob_dice_parity', type: 'calculate' },
            { key: 'prob_dice_threshold', type: 'calculate' },
            { key: 'prob_cards_suit', type: 'calculate' },
            { key: 'prob_cards_face', type: 'calculate' },
            { key: 'prob_cards_rank', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'prob_dice_single') {
            const target = MathUtils.randomInt(1, 6);
            return {
                renderData: {
                    description: lang === 'sv'
                        ? `Vad är sannolikheten att få en ${target}:a vid ett kast med en vanlig sexsidig tärning? Svar med bråk i enklaste form.`
                        : `What is the probability of rolling a ${target} with a standard six-sided die? Answer with a fraction in simplest form.`,
                    answerType: 'fraction',
                },
                token: this.toBase64("1/6"),
                variationKey: v,
                type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv'
                            ? "En sexsidig tärning har 6 lika sannolika sidor (1, 2, 3, 4, 5, 6)."
                            : "A six-sided die has 6 equally likely faces (1, 2, 3, 4, 5, 6).",
                        latex: `\\text{Möjliga utfall} = 6`
                    },
                    {
                        text: lang === 'sv'
                            ? `Det finns bara 1 sida med siffran ${target}.`
                            : `There is only 1 face showing the number ${target}.`,
                        latex: `P = \\frac{1}{6}`
                    },
                    {
                        text: lang === 'sv' ? "Svar: 1/6" : "Answer: 1/6",
                        latex: `\\frac{1}{6}`
                    }
                ]
            };
        }

        if (v === 'prob_dice_parity') {
            const isEven = MathUtils.randomChoice([true, false]);
            const label = isEven ? (lang === 'sv' ? "jämnt" : "even") : (lang === 'sv' ? "udda" : "odd");
            const outcomes = isEven ? "2, 4, 6" : "1, 3, 5";

            return {
                renderData: {
                    description: lang === 'sv'
                        ? `Vad är sannolikheten att slå ett ${label} tal med en sexsidig tärning? Svar med bråk i enklaste form.`
                        : `What is the probability of rolling an ${label} number on a six-sided die? Answer with a fraction in simplest form.`,
                    interceptorToken: `${label}`,
                    answerType: 'fraction',
                },
                token: this.toBase64("1/2"),
                variationKey: v,
                type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv'
                            ? `De gynnsamma ${label} talen är: ${outcomes}. Det är 3 gynnsamma utfall.`
                            : `The favorable ${label} numbers are: ${outcomes}. That gives 3 favorable outcomes.`,
                        latex: `\\text{Gynnsamma utfall} = 3`
                    },
                    {
                        text: lang === 'sv'
                            ? "Ställ upp bråket och förkorta med 3."
                            : "Set up the fraction and simplify by 3.",
                        latex: `\\frac{3}{6} = \\frac{1}{2}`
                    },
                    {
                        text: lang === 'sv' ? "Svar: 1/2" : "Answer: 1/2",
                        latex: `\\frac{1}{2}`
                    }
                ]
            };
        }

        if (v === 'prob_dice_threshold') {
            const threshold = MathUtils.randomChoice([2, 3, 4, 5]);
            const isGreater = MathUtils.randomChoice([true, false]);
            const conditionText = isGreater
                ? (lang === 'sv' ? `större än ${threshold}` : `greater than ${threshold}`)
                : (lang === 'sv' ? `mindre än ${threshold}` : `less than ${threshold}`);

            let favCount = 0;
            const favList: number[] = [];
            for (let i = 1; i <= 6; i++) {
                if ((isGreater && i > threshold) || (!isGreater && i < threshold)) {
                    favCount++;
                    favList.push(i);
                }
            }

            const reduced = this.reduceFraction(favCount, 6);

            return {
                renderData: {
                    description: lang === 'sv'
                        ? `Vad är sannolikheten att slå ett tal som är ${conditionText} med en tärning? Svar med bråk i enklaste form.`
                        : `What is the probability of rolling a number ${conditionText} on a die? Answer with a fraction in simplest form.`,
                    answerType: 'fraction',
                },
                token: this.toBase64(reduced.str),
                variationKey: v,
                type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv'
                            ? `Räkna upp de utfall som uppfyller villkoret: ${favList.join(', ')} (${favCount} st).`
                            : `List the outcomes meeting the condition: ${favList.join(', ')} (${favCount} total).`,
                        latex: `\\text{Gynnsamma} = ${favCount}`
                    },
                    {
                        text: lang === 'sv'
                            ? `Bråket blir ${favCount}/6. Förkorta till enklaste form.`
                            : `The fraction is ${favCount}/6. Simplify to simplest form.`,
                        latex: `\\frac{${favCount}}{6} = \\frac{${reduced.n}}{${reduced.d}}`
                    },
                    {
                        text: lang === 'sv' ? `Svar: ${reduced.str}` : `Answer: ${reduced.str}`,
                        latex: `\\frac{${reduced.n}}{${reduced.d}}`
                    }
                ]
            };
        }

        // Standard 52-card deck
        if (v === 'prob_cards_suit') {
            const suit = MathUtils.randomChoice([
                { sv: "ett hjärter", en: "a heart" },
                { sv: "ett spader", en: "a spade" },
                { sv: "en ruter", en: "a diamond" },
                { sv: "en klöver", en: "a club" }
            ]);

            return {
                renderData: {
                    description: lang === 'sv'
                        ? `Du drar ett kort slumpmässigt ur en vanlig kortlek med 52 kort (utan jokrar). Vad är sannolikheten att du drar ${suit.sv}? Svar med bråk i enklaste form.`
                        : `You draw a card at random from a standard 52-card deck (no jokers). What is the probability of drawing ${suit.en}? Answer with a fraction in simplest form.`,
                    answerType: 'fraction',
                },
                token: this.toBase64("1/4"),
                variationKey: v,
                type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv'
                            ? "En standardkortlek har 52 kort fördelade på 4 färger med 13 kort i varje färg."
                            : "A standard deck has 52 cards divided across 4 suits with 13 cards in each suit.",
                        latex: `\\text{Totalt} = 52, \\quad \\text{Per färg} = 13`
                    },
                    {
                        text: lang === 'sv'
                            ? "13 gynnsamma kort av 52 möjliga förkortas med 13."
                            : "13 favorable cards out of 52 total simplifies by 13.",
                        latex: `\\frac{13}{52} = \\frac{1}{4}`
                    },
                    {
                        text: lang === 'sv' ? "Svar: 1/4" : "Answer: 1/4",
                        latex: `\\frac{1}{4}`
                    }
                ]
            };
        }

        if (v === 'prob_cards_face') {
            return {
                renderData: {
                    description: lang === 'sv'
                        ? "Du drar ett kort ur en hel kortlek (52 kort). Vad är sannolikheten att dra ett klätt kort (knekt, dam eller kung)? Svar med bråk i enklaste form."
                        : "You draw a card from a standard deck (52 cards). What is the probability of drawing a face card (Jack, Queen, or King)? Answer with a fraction in simplest form.",
                    answerType: 'fraction',
                },
                token: this.toBase64("3/13"),
                variationKey: v,
                type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv'
                            ? "Det finns 3 klädda kort i varje färg (knekt, dam, kung). Med 4 färger blir det 3 · 4 = 12 klädda kort."
                            : "There are 3 face cards per suit (Jack, Queen, King). With 4 suits, that gives 3 · 4 = 12 face cards.",
                        latex: `\\text{Klädda kort} = 3 \\cdot 4 = 12`
                    },
                    {
                        text: lang === 'sv'
                            ? "Ställ upp bråket och förkorta med 4."
                            : "Set up the fraction and simplify by 4.",
                        latex: `\\frac{12}{52} = \\frac{3}{13}`
                    },
                    {
                        text: lang === 'sv' ? "Svar: 3/13" : "Answer: 3/13",
                        latex: `\\frac{3}{13}`
                    }
                ]
            };
        }

        // prob_cards_rank
        const rank = MathUtils.randomChoice([
            { sv: "ett ess", en: "an Ace" },
            { sv: "en kung", en: "a King" },
            { sv: "en tia", en: "a 10" },
            { sv: "en sjua", en: "a 7" }
        ]);

        return {
            renderData: {
                description: lang === 'sv'
                    ? `Vad är sannolikheten att dra ${rank.sv} ur en vanlig kortlek på 52 kort? Svar med bråk i enklaste form.`
                    : `What is the probability of drawing ${rank.en} from a standard 52-card deck? Answer with a fraction in simplest form.`,
                answerType: 'fraction',
            },
            token: this.toBase64("1/13"),
            variationKey: v,
            type: 'calculate',
            clues: [
                {
                    text: lang === 'sv'
                        ? `Det finns 4 kort av varje valör i kortleken (ett i varje färg).`
                        : `There are 4 cards of every rank in the deck (one in each suit).`,
                    latex: `\\text{Antal} = 4`
                },
                {
                    text: lang === 'sv'
                        ? "Ställ upp bråket 4/52 och förkorta med 4."
                        : "Set up the fraction 4/52 and simplify by 4.",
                    latex: `\\frac{4}{52} = \\frac{1}{13}`
                },
                {
                    text: lang === 'sv' ? "Svar: 1/13" : "Answer: 1/13",
                    latex: `\\frac{1}{13}`
                }
            ]
        };
    }

    // =========================================================================
    // LEVEL 4: Komplementhändelse & Disjunkta Utfall (INTE och ELLER)
    // =========================================================================
    private level4_ComplementAndOr(lang: string, variationKey?: string, options: any = {}): any {
        const pool: { key: string; type: 'calculate' }[] = [
            { key: 'prob_comp_lottery', type: 'calculate' },
            { key: 'prob_comp_cards_dice', type: 'calculate' },
            { key: 'prob_or_disjoint', type: 'calculate' },
            { key: 'prob_ternary_remainder', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'prob_comp_lottery') {
            const pWin = MathUtils.randomInt(1, 9) * 5;
            const pLose = 100 - pWin;

            return {
                renderData: {
                    description: lang === 'sv'
                        ? `Chansen att vinna i ett lotteri är ${pWin}%. Vad är sannolikheten att man INTE vinner?`
                        : `The chance of winning a lottery is ${pWin}%. What is the probability of NOT winning?`,
                    interceptorToken: `${pWin}`,
                    answerType: 'numeric',
                    suffix: '%',
                },
                token: this.toBase64(pLose.toString()),
                variationKey: v,
                type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv'
                            ? "Den totala sannolikheten för alla möjliga utfall är alltid 100% (eller 1)."
                            : "The total probability for all possible outcomes combined is always 100% (or 1).",
                        latex: `P(\\text{Händelse}) + P(\\text{Komplement}) = 100\\%`
                    },
                    {
                        text: lang === 'sv'
                            ? `Subtrahera vinstchansen (${pWin}%) från 100%.`
                            : `Subtract the win probability (${pWin}%) from 100%.`,
                        latex: `100\\% - ${pWin}\\% = ${pLose}\\%`
                    },
                    {
                        text: lang === 'sv' ? `Svar: ${pLose}%` : `Answer: ${pLose}%`,
                        latex: `${pLose}\\%`
                    }
                ]
            };
        }

        if (v === 'prob_comp_cards_dice') {
            const isDice = MathUtils.randomChoice([true, false]);
            if (isDice) {
                const num = MathUtils.randomInt(1, 6);
                return {
                    renderData: {
                        description: lang === 'sv'
                            ? `Du kastar en vanlig tärning. Vad är sannolikheten att du INTE slår en ${num}:a? Svar med bråk i enklaste form.`
                            : `You roll a standard die. What is the probability of NOT rolling a ${num}? Answer with a fraction in simplest form.`,
                        answerType: 'fraction',
                    },
                    token: this.toBase64("5/6"),
                    variationKey: v,
                    type: 'calculate',
                    clues: [
                        {
                            text: lang === 'sv'
                                ? `Chansen att slå en ${num}:a är 1/6.`
                                : `The chance of rolling a ${num} is 1/6.`,
                            latex: `P(${num}) = \\frac{1}{6}`
                        },
                        {
                            text: lang === 'sv'
                                ? `Komplementhändelsen är 1 - P(${num}).`
                                : `The complement is 1 - P(${num}).`,
                            latex: `1 - \\frac{1}{6} = \\frac{5}{6}`
                        },
                        {
                            text: lang === 'sv' ? "Svar: 5/6" : "Answer: 5/6",
                            latex: `\\frac{5}{6}`
                        }
                    ]
                };
            }

            // Cards: not a heart
            return {
                renderData: {
                    description: lang === 'sv'
                        ? "Du drar ett kort ur en vanlig kortlek (52 kort). Vad är sannolikheten att kortet INTE är hjärter? Svar med bråk i enklaste form."
                        : "You draw a card from a standard 52-card deck. What is the probability that the card is NOT a heart? Answer with a fraction in simplest form.",
                    answerType: 'fraction',
                },
                token: this.toBase64("3/4"),
                variationKey: v,
                type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv'
                            ? "Sannolikheten för hjärter är 13/52 = 1/4."
                            : "The probability of drawing a heart is 13/52 = 1/4.",
                        latex: `P(\\text{Hjärter}) = \\frac{1}{4}`
                    },
                    {
                        text: lang === 'sv'
                            ? "Komplementhändelsen beräknas som 1 - 1/4."
                            : "The complement is calculated as 1 - 1/4.",
                        latex: `1 - \\frac{1}{4} = \\frac{3}{4}`
                    },
                    {
                        text: lang === 'sv' ? "Svar: 3/4" : "Answer: 3/4",
                        latex: `\\frac{3}{4}`
                    }
                ]
            };
        }

        if (v === 'prob_or_disjoint') {
            // Picking heart OR spade from deck
            return {
                renderData: {
                    description: lang === 'sv'
                        ? "Vad är sannolikheten att dra ett hjärter ELLER ett spader ur en kortlek på 52 kort? Svar med bråk i enklaste form."
                        : "What is the probability of drawing a heart OR a spade from a 52-card deck? Answer with a fraction in simplest form.",
                    answerType: 'fraction',
                },
                token: this.toBase64("1/2"),
                variationKey: v,
                type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv'
                            ? "Eftersom ett kort inte kan vara både hjärter och spader samtidigt, adderar vi sannolikheterna."
                            : "Because a card cannot be both a heart and a spade at the same time, we add the probabilities.",
                        latex: `P(A \\text{ eller } B) = P(A) + P(B)`
                    },
                    {
                        text: lang === 'sv'
                            ? "Det finns 13 hjärter och 13 spader, alltså totalt 26 kort."
                            : "There are 13 hearts and 13 spades, giving 26 favorable cards in total.",
                        latex: `\\frac{13 + 13}{52} = \\frac{26}{52}`
                    },
                    {
                        text: lang === 'sv'
                            ? "Förkorta bråket med 26."
                            : "Simplify the fraction by dividing by 26.",
                        latex: `\\frac{26}{52} = \\frac{1}{2}`
                    },
                    {
                        text: lang === 'sv' ? "Svar: 1/2" : "Answer: 1/2",
                        latex: `\\frac{1}{2}`
                    }
                ]
            };
        }

        // prob_ternary_remainder
        const total = MathUtils.randomChoice([20, 25, 30, 40]);
        const a = MathUtils.randomInt(4, Math.floor(total / 3));
        const b = MathUtils.randomInt(4, Math.floor(total / 3));
        const rem = total - a - b;
        const reduced = this.reduceFraction(rem, total);

        return {
            renderData: {
                description: lang === 'sv'
                    ? `I en ask med ${total} kulor är ${a} vita och ${b} svarta. Resten är röda. Vad är sannolikheten att dra en röd kula? Svar med bråk i enklaste form.`
                    : `In a box of ${total} marbles, ${a} are white and ${b} are black. The remainder are red. What is the probability of picking a red marble? Answer with a fraction in simplest form.`,
                answerType: 'fraction',
            },
            token: this.toBase64(reduced.str),
            variationKey: v,
            type: 'calculate',
            clues: [
                {
                    text: lang === 'sv'
                        ? `Räkna först ut antalet röda kulor: ${total} - ${a} - ${b}.`
                        : `First find the count of red marbles: ${total} - ${a} - ${b}.`,
                    latex: `\\text{Röda} = ${total} - (${a} + ${b}) = ${rem}`
                },
                {
                    text: lang === 'sv'
                        ? `Ställ upp bråket: ${rem}/${total}. Förkorta till enklaste form.`
                        : `Set up the fraction: ${rem}/${total}. Simplify to simplest form.`,
                    latex: `\\frac{${rem}}{${total}} = \\frac{${reduced.n}}{${reduced.d}}`
                },
                {
                    text: lang === 'sv' ? `Svar: ${reduced.str}` : `Answer: ${reduced.str}`,
                    latex: `\\frac{${reduced.n}}{${reduced.d}}`
                }
            ]
        };
    }

    // =========================================================================
    // LEVEL 5: Kombinatorik & Multiplikationsprincipen (Träd & Vägval)
    // =========================================================================
    private level5_CombinatoricsAndPaths(lang: string, variationKey?: string, options: any = {}): any {
        const pool: { key: string; type: 'calculate' }[] = [
            { key: 'prob_comb_multiplication', type: 'calculate' },
            { key: 'prob_comb_pathways', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'prob_comb_multiplication') {
            const starters = MathUtils.randomInt(3, 5);
            const mains = MathUtils.randomInt(4, 7);
            const desserts = MathUtils.randomInt(2, 4);
            const ans = starters * mains * desserts;

            return {
                renderData: {
                    description: lang === 'sv'
                        ? `En restaurangmeny erbjuder ${starters} förrätter, ${mains} varmrätter och ${desserts} efterrätter. På hur många olika sätt kan du komponera en trerättersmiddag?`
                        : `A restaurant menu offers ${starters} starters, ${mains} main dishes, and ${desserts} desserts. In how many different ways can you compose a three-course dinner?`,
                    interceptorToken: `${starters} ; ${mains} ; ${desserts}`,
                    answerType: 'numeric',
                },
                token: this.toBase64(ans.toString()),
                variationKey: v,
                type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv'
                            ? "Enligt multiplikationsprincipen multiplicerar vi antalet val i varje steg."
                            : "According to the multiplication principle, we multiply the number of choices at each stage.",
                        latex: `\\text{Kombinationer} = \\text{val}_1 \\cdot \\text{val}_2 \\cdot \\text{val}_3`
                    },
                    {
                        text: lang === 'sv'
                            ? `Multiplicera alternativen: ${starters} · ${mains} · ${desserts}.`
                            : `Multiply the options: ${starters} · ${mains} · ${desserts}.`,
                        latex: `${starters} \\cdot ${mains} \\cdot ${desserts} = ${ans}`
                    },
                    {
                        text: lang === 'sv' ? `Svar: ${ans} sätt` : `Answer: ${ans} ways`,
                        latex: `${ans}`
                    }
                ]
            };
        }

        // prob_comb_pathways
        const l1 = MathUtils.randomInt(2, 3);
        const l2 = MathUtils.randomInt(2, 4);
        const totalPaths = l1 * l2;

        const obstacles: any[] = [];
        const numObs = MathUtils.randomInt(1, Math.min(2, totalPaths - 1));
        while (obstacles.length < numObs) {
            const obs = { layer: 1, from: MathUtils.randomInt(0, l1 - 1), to: MathUtils.randomInt(0, l2 - 1) };
            if (!obstacles.some(o => o.from === obs.from && o.to === obs.to)) {
                obstacles.push(obs);
            }
        }

        const workingPaths = totalPaths - obstacles.length;

        return {
            renderData: {
                description: lang === 'sv'
                    ? "Hur många olika framkomliga vägar finns det från Start (A) till Mål (B)? Röda spärrar visar blockerade vägar."
                    : "How many passable paths are there from Start (A) to Finish (B)? Red barrier marks indicate blocked paths.",
                answerType: 'numeric',
                geometry: {
                    type: 'pathway',
                    subtype: 'pathway',
                    layers: [1, l1, l2, 1],
                    obstacles
                }
            },
            token: this.toBase64(workingPaths.toString()),
            variationKey: v,
            type: 'calculate',
            clues: [
                {
                    text: lang === 'sv'
                        ? `Beräkna först totalt antal möjliga vägar om inga vore spärrade: ${l1} · ${l2}.`
                        : `First calculate the total possible paths if none were blocked: ${l1} · ${l2}.`,
                    latex: `\\text{Möjliga vägar} = ${l1} \\cdot ${l2} = ${totalPaths}`
                },
                {
                    text: lang === 'sv'
                        ? `Dra bort de ${obstacles.length} blockerade vägarna från totalen.`
                        : `Subtract the ${obstacles.length} blocked routes from the total.`,
                    latex: `${totalPaths} - ${obstacles.length} = ${workingPaths}`
                },
                {
                    text: lang === 'sv' ? `Svar: ${workingPaths}` : `Answer: ${workingPaths}`,
                    latex: `${workingPaths}`
                }
            ]
        };
    }

    // =========================================================================
    // LEVEL 6: Flerstegsförsök – Med återläggning (Oberoende Händelser)
    // =========================================================================
    private level6_IndependentChains(lang: string, variationKey?: string, options: any = {}): any {
        const pool: { key: string; type: 'calculate' }[] = [
            { key: 'prob_indep_coins', type: 'calculate' },
            { key: 'prob_indep_dice_sum', type: 'calculate' },
            { key: 'prob_indep_with_replacement', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'prob_indep_coins') {
            const tosses = MathUtils.randomChoice([2, 3]);
            const targetSide = MathUtils.randomChoice([
                { sv: "krona", en: "heads" },
                { sv: "klave", en: "tails" }
            ]);

            const den = Math.pow(2, tosses);

            return {
                renderData: {
                    description: lang === 'sv'
                        ? `Du kastar ett mynt ${tosses} gånger. Vad är sannolikheten att få ${targetSide.sv} alla ${tosses} gånger? Svar med bråk i enklaste form.`
                        : `You flip a coin ${tosses} times. What is the probability of getting ${targetSide.en} all ${tosses} times? Answer with a fraction in simplest form.`,
                    answerType: 'fraction',
                },
                token: this.toBase64(`1/${den}`),
                variationKey: v,
                type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv'
                            ? "Kasten är oberoende av varandra. Sannolikheten vid varje enskilt kast är 1/2."
                            : "The flips are independent of each other. The probability at each individual toss is 1/2.",
                        latex: `P(\\text{Kast}) = \\frac{1}{2}`
                    },
                    {
                        text: lang === 'sv'
                            ? `Multiplicera sannolikheterna för alla ${tosses} kasten.`
                            : `Multiply the probabilities across all ${tosses} tosses.`,
                        latex: `${Array(tosses).fill('\\frac{1}{2}').join(' \\cdot ')} = \\frac{1}{${den}}`
                    },
                    {
                        text: lang === 'sv' ? `Svar: 1/${den}` : `Answer: 1/${den}`,
                        latex: `\\frac{1}{${den}}`
                    }
                ]
            };
        }

        if (v === 'prob_indep_dice_sum') {
            const targetSum = MathUtils.randomChoice([7, 10, 11]);
            let favWays = 0;
            const pairs: string[] = [];

            for (let d1 = 1; d1 <= 6; d1++) {
                for (let d2 = 1; d2 <= 6; d2++) {
                    if (d1 + d2 === targetSum) {
                        favWays++;
                        pairs.push(`(${d1}, ${d2})`);
                    }
                }
            }

            const reduced = this.reduceFraction(favWays, 36);

            return {
                renderData: {
                    description: lang === 'sv'
                        ? `Du kastar två vanliga tärningar. Vad är sannolikheten att summan av tärningarna blir ${targetSum}? Svar med bråk i enklaste form.`
                        : `You roll two standard dice. What is the probability that the sum of the dice is ${targetSum}? Answer with a fraction in simplest form.`,
                    answerType: 'fraction',
                },
                token: this.toBase64(reduced.str),
                variationKey: v,
                type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv'
                            ? "Totalt antal utfall vid kast med två tärningar är 6 · 6 = 36."
                            : "Total possible outcomes when rolling two dice is 6 · 6 = 36.",
                        latex: `\\text{Möjliga utfall} = 6 \\cdot 6 = 36`
                    },
                    {
                        text: lang === 'sv'
                            ? `Gynnsamma kombinationer som ger summan ${targetSum}: ${pairs.join(', ')} (${favWays} st).`
                            : `Favorable combinations giving sum ${targetSum}: ${pairs.join(', ')} (${favWays} total).`,
                        latex: `P = \\frac{${favWays}}{36}`
                    },
                    {
                        text: lang === 'sv'
                            ? `Förkorta bråket till enklaste form.`
                            : `Simplify the fraction to simplest form.`,
                        latex: `\\frac{${favWays}}{36} = \\frac{${reduced.n}}{${reduced.d}}`
                    },
                    {
                        text: lang === 'sv' ? `Svar: ${reduced.str}` : `Answer: ${reduced.str}`,
                        latex: `\\frac{${reduced.n}}{${reduced.d}}`
                    }
                ]
            };
        }

        // prob_indep_with_replacement
        const red = MathUtils.randomInt(3, 6);
        const blue = MathUtils.randomInt(4, 7);
        const total = red + blue;

        const num = red * blue;
        const den = total * total;
        const reduced = this.reduceFraction(num, den);

        return {
            renderData: {
                description: lang === 'sv'
                    ? `En påse innehåller ${red} röda och ${blue} blåa kulor. Du drar en kula, lägger tillbaka den (med återläggning), och drar sedan en kula till. Vad är sannolikheten att först få en röd och sedan en blå? Svar med bråk i enklaste form.`
                    : `A bag contains ${red} red and ${blue} blue marbles. You pick one, replace it (with replacement), and then pick another. What is the probability of picking a red first and then a blue? Answer with a fraction in simplest form.`,
                answerType: 'fraction',
            },
            token: this.toBase64(reduced.str),
            variationKey: v,
            type: 'calculate',
            clues: [
                {
                    text: lang === 'sv'
                        ? "Eftersom kulan läggs tillbaka förändras inte antalet kulor inför det andra draget."
                        : "Because the marble is replaced, the number of marbles remains unchanged for the second pick.",
                    latex: `\\text{Totalt båda gångerna} = ${total}`
                },
                {
                    text: lang === 'sv'
                        ? `Multiplicera sannolikheten för röd (${red}/${total}) med sannolikheten för blå (${blue}/${total}).`
                        : `Multiply the probability of red (${red}/${total}) by the probability of blue (${blue}/${total}).`,
                    latex: `\\frac{${red}}{${total}} \\cdot \\frac{${blue}}{${total}} = \\frac{${num}}{${den}}`
                },
                ...(reduced.n !== num ? [{
                    text: lang === 'sv'
                        ? "Förkorta bråket till enklaste form."
                        : "Simplify the fraction to simplest form.",
                    latex: `\\frac{${num}}{${den}} = \\frac{${reduced.n}}{${reduced.d}}`
                }] : []),
                {
                    text: lang === 'sv' ? `Svar: ${reduced.str}` : `Answer: ${reduced.str}`,
                    latex: `\\frac{${reduced.n}}{${reduced.d}}`
                }
            ]
        };
    }

    // =========================================================================
    // LEVEL 7: Flerstegsförsök – Utan återläggning & Sammansatta Grenar
    // =========================================================================
    private level7_DependentTrees(lang: string, variationKey?: string, options: any = {}): any {
        const pool: { key: string; type: 'calculate' }[] = [
            { key: 'prob_dep_tree_branch', type: 'calculate' },
            { key: 'prob_dep_one_of_each', type: 'calculate' },
            { key: 'prob_dep_at_least_one', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        const r = MathUtils.randomInt(3, 6);
        const b = MathUtils.randomInt(4, 7);
        const total = r + b;

        if (v === 'prob_dep_tree_branch') {
            // Specified path: Red then Blue without replacement
            const num = r * b;
            const den = total * (total - 1);
            const reduced = this.reduceFraction(num, den);

            return {
                renderData: {
                    description: lang === 'sv'
                        ? `I en påse finns ${r} röda och ${b} blåa kulor. Du drar två kulor utan återläggning. Vad är sannolikheten att få en röd först och sedan en blå? Svar med bråk i enklaste form.`
                        : `In a bag there are ${r} red and ${b} blue marbles. You pick two marbles without replacement. What is the probability of getting a red first and then a blue? Answer with a fraction in simplest form.`,
                    interceptorToken: `${r} ; ${b} ; ${total}`,
                    answerType: 'fraction',
                    geometry: {
                        type: 'probability_tree',
                        groups: lang === 'sv' ? ['Röd', 'Blå'] : ['Red', 'Blue'],
                        initialCounts: [r, b],
                        targetBranch: 's2_1'
                    }
                },
                token: this.toBase64(reduced.str),
                variationKey: v,
                type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv'
                            ? `Vid första draget finns ${r} röda av totalt ${total} kulor.`
                            : `On the first draw there are ${r} red out of ${total} total marbles.`,
                        latex: `P(\\text{Röd}_1) = \\frac{${r}}{${total}}`
                    },
                    {
                        text: lang === 'sv'
                            ? `Vid andra draget finns bara ${total - 1} kulor kvar. Antalet blå kulor är fortfarande ${b}.`
                            : `On the second draw only ${total - 1} marbles remain. The count of blue marbles is still ${b}.`,
                        latex: `P(\\text{Blå}_2) = \\frac{${b}}{${total - 1}}`
                    },
                    {
                        text: lang === 'sv'
                            ? `Multiplicera sannolikheterna längs grenen: (${r}/${total}) · (${b}/${total - 1}).`
                            : `Multiply the probabilities along the branch: (${r}/${total}) · (${b}/${total - 1}).`,
                        latex: `\\frac{${r}}{${total}} \\cdot \\frac{${b}}{${total - 1}} = \\frac{${num}}{${den}}`
                    },
                    ...(reduced.n !== num ? [{
                        text: lang === 'sv'
                            ? "Förkorta bråket till enklaste form."
                            : "Simplify the fraction to simplest form.",
                        latex: `\\frac{${num}}{${den}} = \\frac{${reduced.n}}{${reduced.d}}`
                    }] : []),
                    {
                        text: lang === 'sv' ? `Svar: ${reduced.str}` : `Answer: ${reduced.str}`,
                        latex: `\\frac{${reduced.n}}{${reduced.d}}`
                    }
                ]
            };
        }

        if (v === 'prob_dep_one_of_each') {
            // One of each in any order: P(R, B) + P(B, R)
            const p1 = r * b;
            const p2 = b * r;
            const den = total * (total - 1);
            const totalNum = p1 + p2;
            const reduced = this.reduceFraction(totalNum, den);

            return {
                renderData: {
                    description: lang === 'sv'
                        ? `I en skål finns ${r} röda och ${b} blåa kulor. Du drar två kulor utan återläggning. Vad är sannolikheten att få en av varje färg? Svar med bråk i enklaste form.`
                        : `In a bowl there are ${r} red and ${b} blue marbles. You pick two marbles without replacement. What is the probability of getting one of each color? Answer with a fraction in simplest form.`,
                    answerType: 'fraction',
                },
                token: this.toBase64(reduced.str),
                variationKey: v,
                type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv'
                            ? "Det finns två gynnsamma grenar: (Röd först, sedan Blå) ELLER (Blå först, sedan Röd)."
                            : "There are two favorable branches: (Red first, then Blue) OR (Blue first, then Red).",
                        latex: `P(\\text{En av varje}) = P(R, B) + P(B, R)`
                    },
                    {
                        text: lang === 'sv'
                            ? `Beräkna båda grenarna: (${r}/${total} · ${b}/${total - 1}) + (${b}/${total} · ${r}/${total - 1}).`
                            : `Calculate both branches: (${r}/${total} · ${b}/${total - 1}) + (${b}/${total} · ${r}/${total - 1}).`,
                        latex: `\\frac{${p1}}{${den}} + \\frac{${p2}}{${den}} = \\frac{${totalNum}}{${den}}`
                    },
                    ...(reduced.n !== totalNum ? [{
                        text: lang === 'sv'
                            ? "Förkorta bråket till enklaste form."
                            : "Simplify the fraction to simplest form.",
                        latex: `\\frac{${totalNum}}{${den}} = \\frac{${reduced.n}}{${reduced.d}}`
                    }] : []),
                    {
                        text: lang === 'sv' ? `Svar: ${reduced.str}` : `Answer: ${reduced.str}`,
                        latex: `\\frac{${reduced.n}}{${reduced.d}}`
                    }
                ]
            };
        }

        // prob_dep_at_least_one
        // Rolling two dice, probability of at least one 6
        const den = 36;
        const noSixWays = 5 * 5; // 25
        const atLeastOneSixWays = den - noSixWays; // 11
        const reduced = this.reduceFraction(atLeastOneSixWays, den);

        return {
            renderData: {
                description: lang === 'sv'
                    ? "Du kastar två vanliga tärningar. Vad är sannolikheten att få minst en sexa? Svar med bråk i enklaste form."
                    : "You roll two standard dice. What is the probability of rolling at least one 6? Answer with a fraction in simplest form.",
                answerType: 'fraction',
            },
            token: this.toBase64(reduced.str),
            variationKey: v,
            type: 'calculate',
            clues: [
                {
                    text: lang === 'sv'
                        ? 'Vid problem med "minst en" är det smartast att använda komplementhändelsen: 1 - P(ingen sexa).'
                        : 'For problems with "at least one", the smartest strategy is the complement: 1 - P(no sixes).',
                    latex: `P(\\text{Minst en 6:a}) = 1 - P(\\text{Ingen 6:a})`
                },
                {
                    text: lang === 'sv'
                        ? "Chansen att INTE få en sexa på en tärning är 5/6. För två tärningar blir det (5/6) · (5/6) = 25/36."
                        : "The chance of NOT rolling a six on one die is 5/6. For two dice that is (5/6) · (5/6) = 25/36.",
                    latex: `P(\\text{Ingen 6:a}) = \\frac{5}{6} \\cdot \\frac{5}{6} = \\frac{25}{36}`
                },
                {
                    text: lang === 'sv'
                        ? "Dra bort komplementet från 1 (36/36)."
                        : "Subtract the complement from 1 (36/36).",
                    latex: `1 - \\frac{25}{36} = \\frac{36 - 25}{36} = \\frac{11}{36}`
                },
                {
                    text: lang === 'sv' ? `Svar: ${reduced.str}` : `Answer: ${reduced.str}`,
                    latex: `\\frac{${reduced.n}}{${reduced.d}}`
                }
            ]
        };
    }
}