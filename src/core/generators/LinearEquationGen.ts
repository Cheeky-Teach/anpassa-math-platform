import { MathUtils } from '../utils/MathUtils.js';
import { LinearEquationProblemGen } from './LinearEquationProblemGen.js';

export class LinearEquationGen {
    private problemGen: LinearEquationProblemGen;

    constructor() {
        this.problemGen = new LinearEquationProblemGen();
    }

    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        // Adaptive Fallback: If Level 1 concepts are mastered, push to Level 2 logic
        if (level === 1 && options.hideConcept && options.exclude?.includes('onestep_calc')) {
            return this.level2_TwoStep(lang, undefined, options);
        }

        // Levels 5 and 6 are delegated to the Word Problem Generator
        if (level === 5 || level === 6) {
            return this.problemGen.generate(level, lang);
        }
        
        if (level === 7) {
            return this.level7_Mixed(lang, options);
        }

        switch (level) {
            case 1: return this.level1_OneStep(lang, undefined, options);
            case 2: return this.level2_TwoStep(lang, undefined, options);
            case 3: return this.level3_Parentheses(lang, undefined, options);
            case 4: return this.level4_BothSides(lang, undefined, options);
            default: return this.level1_OneStep(lang, undefined, options);
        }
    }

    /**
     * Targeted Generation for Question Studio
     * Maps ALL keys from skillBuckets.js to preserve Studio compatibility.
     */
    public generateByVariation(key: string, lang: string = 'sv'): any {
        const wordProblemKeys = [
            'rate_fixed_add_write', 'rate_fixed_add_solve',
            'rate_fixed_sub_write', 'rate_fixed_sub_solve',
            'compare_word_sum_write', 'compare_word_sum_solve',
            'compare_word_diff_write', 'compare_word_diff_solve'
        ];

        if (wordProblemKeys.includes(key)) {
            const level = key.endsWith('_write') ? 5 : 6;
            return this.problemGen.generate(level, lang);
        }

        switch (key) {
            case 'onestep_concept_inverse':
            case 'onestep_spot_lie':
            case 'onestep_calc':
                return this.level1_OneStep(lang, key);
            case 'twostep_concept_order':
            case 'twostep_calc':
                return this.level2_TwoStep(lang, key);
            case 'paren_lie_distribution':
            case 'paren_calc':
                return this.level3_Parentheses(lang, key);
            case 'bothsides_concept_strategy':
            case 'bothsides_calc':
                return this.level4_BothSides(lang, key);
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

    // --- LEVEL 1: ONE-STEP EQUATIONS ---
    private level1_OneStep(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'onestep_concept_inverse', type: 'concept' },
            { key: 'onestep_spot_lie', type: 'concept' },
            { key: 'onestep_calc', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'onestep_concept_inverse') {
            const type = MathUtils.randomInt(1, 4);
            const val1 = MathUtils.randomInt(2, 12);
            const val2 = MathUtils.randomInt(2, 12);
            let q = "", ansVal = "", rule = "", example = "";

            const ops = lang === 'sv' 
                ? ["Addition (+)", "Subtraktion (-)", "Multiplikation (·)", "Division (/)"] 
                : ["Addition (+)", "Subtraction (-)", "Multiplication (·)", "Division (/)"];

            if (type === 1) {
                q = `x + ${val1} = ${val1 + val2}`;
                ansVal = lang === 'sv' ? "Subtraktion (-)" : "Subtraction (-)";
                rule = lang === 'sv' ? "För att få bort en addition (+) använder vi motsatsen." : "To remove an addition (+), we use the opposite.";
                example = `${val1 + val2} - ${val1} = ${val2}`;
            } else if (type === 2) {
                q = `x - ${val1} = ${val2}`;
                ansVal = lang === 'sv' ? "Addition (+)" : "Addition (+)";
                rule = lang === 'sv' ? "För att få bort en subtraktion (-) använder vi motsatsen." : "To remove a subtraction (-), we use the opposite.";
                example = `${val2} + ${val1} = ${val1 + val2}`;
            } else if (type === 3) {
                q = `${val1}x = ${val1 * val2}`;
                ansVal = lang === 'sv' ? "Division (/)" : "Division (/)";
                rule = lang === 'sv' ? "När x är multiplicerat med ett tal, använder vi division för att få x ensamt." : "When x is multiplied by a number, we use division to isolate x.";
                example = `\\frac{${val1 * val2}}{${val1}} = ${val2}`;
            } else {
                q = `\\frac{x}{${val1}} = ${val2}`;
                ansVal = lang === 'sv' ? "Multiplikation (·)" : "Multiplication (·)";
                rule = lang === 'sv' ? "När x är dividerat med ett tal, använder vi multiplikation för att få x ensamt." : "When x is divided by a number, we use multiplication to isolate x.";
                example = `${val2} · ${val1} = ${val1 * val2}`;
            }

            return {
                renderData: {
                    description: lang === 'sv' ? `Vilken operation isolerar x i $${q}$?` : `Which operation isolates x in $${q}$?`,
                    answerType: 'multiple_choice', options: MathUtils.shuffle(ops)
                },
                token: this.toBase64(ansVal), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Målet med att lösa en ekvation är att få variabeln (x) helt ensam på ena sidan." : "Step 1: The goal of solving an equation is to isolate the variable (x) on one side." },
                    { text: lang === 'sv' ? "Steg 2: Vi gör detta genom att utföra 'motsatt operation' på båda sidor om likhetstecknet." : "Step 2: We do this by performing the 'inverse operation' on both sides of the equals sign." },
                    { text: rule },
                    { text: lang === 'sv' ? "Exempel på uträkning:" : "Example calculation:", latex: example },
                    { text: lang === 'sv' ? `Svar: ${ansVal}` : `Answer: ${ansVal}` }
                ]
            };
        }

        if (v === 'onestep_spot_lie') {
            const targetX = MathUtils.randomInt(3, 10);
            const b = MathUtils.randomInt(2, 15);
            const lie = `x - ${b} = ${targetX + b}`; 

            return {
                renderData: {
                    description: lang === 'sv' ? `Om $x = ${targetX}$, vilket påstående är FALSKT?` : `If $x = ${targetX}$, which statement is FALSE?`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([`x + ${b} = ${targetX + b}`, `2x = ${2 * targetX}`, lie])
                },
                token: this.toBase64(lie), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: För att testa om ett påstående är sant, ersätt x med värdet " + targetX + "." : "Step 1: To test if a statement is true, replace x with the value " + targetX + "." },
                    { text: lang === 'sv' ? `Steg 2: Kontrollera $${targetX} - ${b}$.` : `Step 2: Check $${targetX} - ${b}$.` },
                    { text: lang === 'sv' ? `Uträkning: ${targetX} - ${b} = ${targetX - b}.` : `Calculation: ${targetX} - ${b} = ${targetX - b}.` },
                    { text: lang === 'sv' ? `Eftersom ${targetX - b} inte är lika med ${targetX + b}, är påståendet falskt.` : `Since ${targetX - b} is not equal to ${targetX + b}, the statement is false.` },
                    { text: lang === 'sv' ? `Svar: ${lie}` : `Answer: ${lie}` }
                ]
            };
        }

        const type = MathUtils.randomInt(1, 2);
        const x = MathUtils.randomInt(2, 12);
        let latex = '';
        let clues = [];
        
        if (type === 1) {
            const k = MathUtils.randomInt(2, 9);
            const res = k * x;
            latex = `${k}x = ${res}`;
            clues = [
                { text: lang === 'sv' ? `Steg 1: x är multiplicerat med ${k}. För att få x ensamt måste vi dividera båda sidor med ${k}.` : `Step 1: x is multiplied by ${k}. To isolate x, we must divide both sides by ${k}.` },
                { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `\\frac{${res}}{${k}} = ${x}` },
                { text: lang === 'sv' ? `Svar: x = ${x}` : `Answer: x = ${x}` }
            ];
        } else {
            const k = MathUtils.randomInt(1, 20);
            const isPlus = Math.random() > 0.5;
            const res = isPlus ? x + k : x - k;
            latex = isPlus ? `x + ${k} = ${res}` : `x - ${k} = ${res}`;
            clues = [
                { text: lang === 'sv' ? (isPlus ? `Steg 1: Det står +${k} bredvid x. Utför motsatsen (-${k}) på båda sidor.` : `Steg 1: Det står -${k} bredvid x. Utför motsatsen (+${k}) på båda sidor.`) : (isPlus ? `Step 1: It says +${k} next to x. Perform the opposite (-${k}) on both sides.` : `Step 1: It says -${k} next to x. Perform the opposite (+${k}) on both sides.`) },
                { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: isPlus ? `${res} - ${k} = ${x}` : `${res} + ${k} = ${x}` },
                { text: lang === 'sv' ? `Svar: x = ${x}` : `Answer: x = ${x}` }
            ];
        }

        return {
            renderData: { latex, description: lang === 'sv' ? "Lös ekvationen." : "Solve the equation.", answerType: 'text' },
            token: this.toBase64(x.toString()),
            variationKey: v, type: 'calculate',
            clues: clues,
            metadata: { variation_key: v, difficulty: 1 }
        };
    }

    // --- LEVEL 2: TWO-STEP EQUATIONS ---
    private level2_TwoStep(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'twostep_concept_order', type: 'concept' },
            { key: 'twostep_calc', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        
        if (v === 'twostep_concept_order') {
            const a = MathUtils.randomInt(2, 5), b = MathUtils.randomInt(2, 10);
            const correct = lang === 'sv' ? `Subtrahera ${b} först` : `Subtract ${b} first`;
            return {
                renderData: {
                    description: lang === 'sv' ? `För $${a}x + ${b} = 20$, vilket steg är bäst att börja med?` : `For $${a}x + ${b} = 20$, which step is best to start with?`,
                    answerType: 'multiple_choice', options: [correct, lang === 'sv' ? `Dela med ${a}` : `Divide by ${a}`]
                },
                token: this.toBase64(correct), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: I en ekvation med två steg är det oftast lättast att börja med additionen eller subtraktionen." : "Step 1: In a two-step equation, it is usually easiest to start with the addition or subtraction." },
                    { text: lang === 'sv' ? "Steg 2: Genom att 'flytta' siffertermen först får vi variabeltermen ensam på ena sidan." : "Step 2: By 'moving' the constant term first, we isolate the variable term on one side." },
                    { text: lang === 'sv' ? `Svar: ${correct}` : `Answer: ${correct}` }
                ]
            };
        }

        const x = MathUtils.randomInt(2, 10), a = MathUtils.randomInt(2, 6), b = MathUtils.randomInt(1, 15);
        const isPlus = Math.random() > 0.5;
        const c = isPlus ? a * x + b : a * x - b;
        const intermediate = isPlus ? c - b : c + b;

        return {
            renderData: { latex: `${a}x ${isPlus ? '+' : '-'} ${b} = ${c}`, description: lang === 'sv' ? "Lös ekvationen." : "Solve the equation.", answerType: 'text' },
            token: this.toBase64(x.toString()), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "En tvåstegsekvation löses i två tydliga steg." : "A two-step equation is solved in two clear steps." },
                { text: lang === 'sv' ? `Steg 1: Flytta siffran ${b} genom att utföra motsatsen på båda sidor.` : `Step 1: Move the number ${b} by performing the opposite on both sides.` },
                { text: lang === 'sv' ? "Uträkning steg 1:" : "Step 1 calculation:", latex: isPlus ? `${c} - ${b} = ${intermediate}` : `${c} + ${b} = ${intermediate}` },
                { text: lang === 'sv' ? `Nu har vi: ${a}x = ${intermediate}` : `Now we have: ${a}x = ${intermediate}`, latex: `${a}x = ${intermediate}` },
                { text: lang === 'sv' ? `Steg 2: Dela båda sidor med ${a} för att få fram x.` : `Step 2: Divide both sides by ${a} to find x.` },
                { text: lang === 'sv' ? "Uträkning steg 2:" : "Step 2 calculation:", latex: `\\frac{${intermediate}}{${a}} = ${x}` },
                { text: lang === 'sv' ? `Svar: x = ${x}` : `Answer: x = ${x}` }
            ],
            metadata: { variation_key: v, difficulty: 2 }
        };
    }

    // --- LEVEL 3: PARENTHESES ---
    private level3_Parentheses(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'paren_lie_distribution', type: 'concept' },
            { key: 'paren_calc', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const a = MathUtils.randomInt(2, 5), b = MathUtils.randomInt(2, 6);

        if (v === 'paren_lie_distribution') {
            const correct = `${a}(x + ${b}) = ${a}x + ${a*b}`;
            const lie = `${a}(x + ${b}) = ${a}x + ${b}`; 
            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket påstående visar FELAKTIG multiplikation?" : "Which statement shows INCORRECT distribution?",
                    answerType: 'multiple_choice', options: MathUtils.shuffle([correct, lie])
                },
                token: this.toBase64(lie), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Distributiva lagen innebär att faktorn utanför parentesen ska multipliceras med VARJE term inuti." : "Step 1: The distributive law means the factor outside the parentheses must be multiplied by EVERY term inside." },
                    { text: lang === 'sv' ? `Steg 2: Beräkna ${a} · x och ${a} · ${b}.` : `Step 2: Calculate ${a} · x and ${a} · ${b}.` },
                    { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `${a}x + ${a*b}` },
                    { text: lang === 'sv' ? `Eftersom ${b} inte multiplicerats med ${a} i ett av alternativen, är det lögnen.` : `Since ${b} was not multiplied by ${a} in one of the options, that is the lie.` },
                    { text: lang === 'sv' ? `Svar: ${lie}` : `Answer: ${lie}` }
                ]
            };
        }

        const x = MathUtils.randomInt(1, 8);
        const constantSum = a * (x + b);
        const expandedConst = a * b;
        const diff = constantSum - expandedConst;

        return {
            renderData: {
                latex: `${a}(x + ${b}) = ${constantSum}`,
                description: lang === 'sv' ? "Lös ekvationen." : "Solve the equation.",
                answerType: 'text'
            },
            token: this.toBase64(x.toString()), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Multiplicera in faktorn utanför i parentesen först." : "Step 1: First multiply the factor outside into the parentheses." },
                { text: lang === 'sv' ? `Uträkning: ${a} · x + ${a} · ${b}` : `Calculation: ${a} · x + ${a} · ${b}`, latex: `${a}x + ${expandedConst} = ${constantSum}` },
                { text: lang === 'sv' ? `Steg 2: Flytta siffran ${expandedConst} genom att subtrahera den från båda sidor.` : `Step 2: Move the number ${expandedConst} by subtracting it from both sides.` },
                { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `${constantSum} - ${expandedConst} = ${diff} \\\\ ${a}x = ${diff}` },
                { text: lang === 'sv' ? `Steg 3: Dela båda sidor med ${a} för att få x.` : `Step 3: Divide both sides by ${a} to find x.` },
                { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `\\frac{${diff}}{${a}} = ${x}` },
                { text: lang === 'sv' ? `Svar: x = ${x}` : `Answer: x = ${x}` }
            ],
            metadata: { variation_key: v, difficulty: 3 }
        };
    }

    // --- LEVEL 4: BOTH SIDES ---
    private level4_BothSides(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'bothsides_concept_strategy', type: 'concept' },
            { key: 'bothsides_calc', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const x = MathUtils.randomInt(2, 10), a = MathUtils.randomInt(6, 10), c = MathUtils.randomInt(2, 5);
        const b = MathUtils.randomInt(2, 12);
        const d = (a - c) * x + b;
        const eq = `${a}x + ${b} = ${c}x + ${d}`;

        if (v === 'bothsides_concept_strategy') {
            const correct = lang === 'sv' ? `Subtrahera ${c}x` : `Subtract ${c}x`;
            return {
                renderData: {
                    description: lang === 'sv' ? `För $${eq}$, vad är smartast att göra först?` : `For $${eq}$, what is smartest to do first?`,
                    answerType: 'multiple_choice', options: [correct, lang === 'sv' ? `Addera ${a}x` : `Add ${a}x`]
                },
                token: this.toBase64(correct), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: När x finns på båda sidor vill vi samla dem på en och samma sida." : "Step 1: When x is on both sides, we want to gather them on one side." },
                    { text: lang === 'sv' ? "Steg 2: Det är oftast bäst att ta bort den MINSTA x-termen först för att undvika negativa tal." : "Step 2: It is usually best to remove the SMALLEST x-term first to avoid negative numbers." },
                    { text: lang === 'sv' ? `Svar: ${correct}` : `Answer: ${correct}` }
                ]
            };
        }

        const diffX = a - c;
        const diffConst = d - b;

        return {
            renderData: { latex: eq, description: lang === 'sv' ? "Samla x på ena sidan och siffror på den andra." : "Gather x on one side and numbers on the other.", answerType: 'text' },
            token: this.toBase64(x.toString()), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "När x finns på båda sidor löser vi det steg för steg." : "When x is on both sides, we solve it step-by-step." },
                { text: lang === 'sv' ? `Steg 1: Ta bort ${c}x från båda sidor.` : `Step 1: Remove ${c}x from both sides.`, latex: `${a}x - ${c}x = ${diffX}x` },
                { text: lang === 'sv' ? `Nu har vi: ${diffX}x + ${b} = ${d}` : `Now we have: ${diffX}x + ${b} = ${d}`, latex: `${diffX}x + ${b} = ${d}` },
                { text: lang === 'sv' ? `Steg 2: Flytta ${b} genom att subtrahera det från båda sidor.` : `Step 2: Move ${b} by subtracting it from both sides.`, latex: `${d} - ${b} = ${diffConst}` },
                { text: lang === 'sv' ? `Nu har vi: ${diffX}x = ${diffConst}` : `Now we have: ${diffX}x = ${diffConst}`, latex: `${diffX}x = ${diffConst}` },
                { text: lang === 'sv' ? `Steg 3: Dela med ${diffX} för att få fram x.` : `Step 3: Divide by ${diffX} to find x.`, latex: `\\frac{${diffConst}}{${diffX}} = ${x}` },
                { text: lang === 'sv' ? `Svar: x = ${x}` : `Answer: x = ${x}` }
            ],
            metadata: { variation_key: v, difficulty: 4 }
        };
    }

    private level7_Mixed(lang: string, options: any): any {
        const subLevel = MathUtils.randomInt(1, 4);
        const data = this.generate(subLevel, lang, options);
        data.metadata.mixed = true;
        return data;
    }
}