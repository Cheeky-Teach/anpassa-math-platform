import { MathUtils } from '../utils/MathUtils.js';

export class ExpressionSimplificationGen {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        // Adaptive Fallback: If Level 1 concepts are mastered, push to Level 2
        if (level === 1 && options.hideConcept && options.exclude?.includes('combine_standard_mixed')) {
            return this.level2_Parentheses(lang, undefined, options);
        }

        switch (level) {
            case 1: return this.level1_CombineTerms(lang, undefined, options);
            case 2: return this.level2_Parentheses(lang, undefined, options);
            case 3: return this.level3_DistributeAndSimplify(lang, undefined, options);
            case 4: return this.level4_SubtractParentheses(lang, undefined, options);
            case 5: return this.level5_WordProblems(lang, undefined, options);
            case 6: return this.level6_Mixed(lang, options);
            default: return this.level1_CombineTerms(lang, undefined, options);
        }
    }

    /**
     * Targeted Generation for Question Studio
     * Maps ALL keys from skillBuckets.js to preserve Studio compatibility.
     */
    public generateByVariation(key: string, lang: string = 'sv'): any {
        switch (key) {
            case 'combine_lie_exponent':
            case 'combine_concept_id':
            case 'combine_standard_mixed':
                return this.level1_CombineTerms(lang, key);
            case 'distribute_lie_partial':
            case 'distribute_inverse_factor':
            case 'distribute_plus':
            case 'distribute_minus':
                return this.level2_Parentheses(lang, key);
            case 'distribute_double':
            case 'distribute_combine_std':
                return this.level3_DistributeAndSimplify(lang, key);
            case 'sub_concept_plus_logic':
            case 'sub_block_plus':
            case 'sub_block_minus':
                return this.level4_SubtractParentheses(lang, key);
            case 'word_candy':
            case 'word_discount':
            case 'word_combined_age':
            case 'word_combined_age_tri':
            case 'word_rect_perimeter':
            case 'word_savings':
            case 'word_passengers':
            case 'word_garden':
            case 'word_sports':
            case 'word_phone_battery':
                return this.level5_WordProblems(lang, key);
            default:
                return this.generate(1, lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    private toSup(text: string | number): string {
        const str = String(text);
        const map: any = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
        return str.split('').map(c => map[c] || c).join('');
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

    // --- LEVEL 1: COMBINE LIKE TERMS ---
    private level1_CombineTerms(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'combine_lie_exponent', type: 'concept' },
            { key: 'combine_concept_id', type: 'concept' },
            { key: 'combine_standard_mixed', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'combine_lie_exponent') {
            const a = MathUtils.randomInt(2, 6);
            const b = MathUtils.randomInt(2, 6);
            const sum = a + b;
            const sLie = `${a}x + ${b}x = ${sum}x${this.toSup(2)}`; 
            const sTrue = `${a}x + ${b}x = ${sum}x`;

            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket påstående är FALSKT?" : "Which statement is FALSE?",
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([sTrue, sLie, `${a}x + x = ${a+1}x`])
                },
                token: this.toBase64(sLie), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: 'Lika termer' är termer av samma sort (t.ex. x-termer)." : "Step 1: 'Like terms' are terms of the same kind (e.g., x-terms)." },
                    { text: lang === 'sv' ? "Steg 2: Vid addition av lika termer ändras bara antalet (koefficienten)." : "Step 2: When adding like terms, only the count (the coefficient) changes." },
                    { text: lang === 'sv' ? "Steg 3: Själva variabeln (x) eller dess exponent ändras aldrig vid addition." : "Step 3: The variable (x) itself or its exponent never changes during addition." },
                    { text: lang === 'sv' ? `Rätt svar borde vara ${sum}x, inte ${sum}x².` : `The correct answer should be ${sum}x, not ${sum}x².` },
                    { text: lang === 'sv' ? `Svar: ${sLie}` : `Answer: ${sLie}` }
                ]
            };
        }

        if (v === 'combine_standard_mixed') {
            const a = MathUtils.randomInt(10, 20), b = MathUtils.randomInt(10, 20);
            const c = MathUtils.randomInt(2, 8), d = MathUtils.randomInt(2, 8);
            const opX = MathUtils.randomChoice(['+', '-']), opC = MathUtils.randomChoice(['+', '-']);
            const resX = opX === '+' ? a + c : a - c;
            const resC = opC === '+' ? b + d : b - d;
            const ans = `${resX}x ${resC >= 0 ? '+' : ''} ${resC}`;

            return {
                renderData: {
                    latex: `${a}x + ${b} ${opX} ${c}x ${opC} ${d}`,
                    description: lang === 'sv' ? "Förenkla uttrycket genom att samla termer av samma slag." : "Simplify the expression by gathering like terms.",
                    answerType: 'text'
                },
                token: this.toBase64(ans.replace(/\s/g, "")), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Identifiera alla termer som innehåller variabeln x." : "Step 1: Identify all terms that contain the variable x." },
                    { text: lang === 'sv' ? `Steg 2: Beräkna x-termerna: ${a}x ${opX} ${c}x.` : `Step 2: Calculate the x-terms: ${a}x ${opX} ${c}x.`, latex: `${a}x ${opX} ${c}x = ${resX}x` },
                    { text: lang === 'sv' ? "Steg 3: Identifiera alla siffertermer (konstanter)." : "Step 3: Identify all constant terms." },
                    { text: lang === 'sv' ? `Steg 4: Beräkna siffertermerna: ${b} ${opC} ${d}.` : `Step 4: Calculate the constant terms: ${b} ${opC} ${d}.`, latex: `${b} ${opC} ${d} = ${resC}` },
                    { text: lang === 'sv' ? "Steg 5: Sätt ihop de förenklade delarna till ett nytt uttryck." : "Step 5: Put the simplified parts together into a new expression." },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
                ]
            };
        }

        const aVal = MathUtils.randomInt(2, 9);
        const correct = `${MathUtils.randomInt(2, 9)}x`;
        return {
            renderData: {
                description: lang === 'sv' ? `Vilken term kan förenklas ihop med ${aVal}x?` : `Which term can be simplified with ${aVal}x?`,
                answerType: 'multiple_choice', options: MathUtils.shuffle([correct, "5y", "10"])
            },
            token: this.toBase64(correct), variationKey: v, type: 'concept',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Man kan bara förenkla termer som har exakt samma variabelbokstav." : "Step 1: You can only simplify terms that have the exact same variable letter." },
                { text: lang === 'sv' ? `Steg 2: Vi letar efter en annan term som också innehåller variabeln x.` : `Step 2: We are looking for another term that also contains the variable x.` },
                { text: lang === 'sv' ? `Svar: ${correct}` : `Answer: ${correct}` }
            ]
        };
    }

    // --- LEVEL 2: PARENTHESES ---
    private level2_Parentheses(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'distribute_lie_partial', type: 'concept' },
            { key: 'distribute_plus', type: 'calculate' },
            { key: 'distribute_minus', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'distribute_lie_partial') {
            const k = MathUtils.randomInt(2, 5), a = MathUtils.randomInt(2, 5), b = MathUtils.randomInt(2, 5);
            const lie = `${k}(${a}x + ${b}) = ${k*a}x + ${b}`;
            const correct = `${k}(${a}x + ${b}) = ${k*a}x + ${k*b}`;

            return {
                renderData: {
                    description: lang === 'sv' ? "Vilken uträkning är FELAKTIG?" : "Which calculation is INCORRECT?",
                    answerType: 'multiple_choice', options: MathUtils.shuffle([correct, lie, `${k}(x + 1) = ${k}x + ${k}`])
                },
                token: this.toBase64(lie), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Enligt den distributiva lagen ska talet utanför parentesen multipliceras med ALLA termer inuti." : "Step 1: According to the distributive law, the factor outside the parentheses must be multiplied by ALL terms inside." },
                    { text: lang === 'sv' ? `Steg 2: Beräkna först ${k} · ${a}x.` : `Step 2: First calculate ${k} · ${a}x.`, latex: `${k} · ${a}x = ${k*a}x` },
                    { text: lang === 'sv' ? `Steg 3: Beräkna sedan ${k} · ${b}.` : `Step 3: Then calculate ${k} · ${b}.`, latex: `${k} · ${b} = ${k*b}` },
                    { text: lang === 'sv' ? `Eftersom ${b} inte har multiplicerats med ${k} i ett av alternativen, är det felaktigt.` : `Since ${b} was not multiplied by ${k} in one of the options, it is incorrect.` },
                    { text: lang === 'sv' ? `Svar: ${lie}` : `Answer: ${lie}` }
                ]
            };
        }

        const a = MathUtils.randomInt(10, 20), b = MathUtils.randomInt(2, 6), c = MathUtils.randomInt(2, 10);
        const isPlus = v === 'distribute_plus';
        const ans = isPlus ? `${a+b}x + ${c}` : `${a-b}x - ${c}`;

        return {
            renderData: {
                latex: `${a}x ${isPlus ? '+' : '-'} (${b}x + ${c})`,
                description: lang === 'sv' ? "Ta bort parentesen och förenkla." : "Remove the parentheses and simplify.",
                answerType: 'text'
            },
            token: this.toBase64(ans.replace(/\s/g, "")), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? (isPlus ? "Steg 1: Om det står plus framför en parentes kan den tas bort utan att ändra några tecken." : "Steg 1: Om det står minus framför en parentes måste alla tecken inuti ändras när parentesen tas bort.") : (isPlus ? "Step 1: If there is a plus in front of parentheses, they can be removed without changing any signs." : "Step 1: If there is a minus in front of parentheses, all signs inside must be changed when the parentheses are removed.") },
                { text: lang === 'sv' ? "Steg 2: Skriv uttrycket utan parenteser." : "Step 2: Write the expression without parentheses.", latex: isPlus ? `${a}x + ${b}x + ${c}` : `${a}x - ${b}x - ${c}` },
                { text: lang === 'sv' ? "Steg 3: Kombinera x-termerna." : "Step 3: Combine the x-terms.", latex: isPlus ? `${a}x + ${b}x = ${a+b}x` : `${a}x - ${b}x = ${a-b}x` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ]
        };
    }

    // --- LEVEL 3: DISTRIBUTE & SIMPLIFY ---
    private level3_DistributeAndSimplify(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'distribute_double', type: 'calculate' },
            { key: 'distribute_combine_std', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'distribute_double') {
            const k1 = MathUtils.randomInt(2, 4), k2 = MathUtils.randomInt(2, 4);
            const c1 = MathUtils.randomInt(1, 5), c2 = MathUtils.randomInt(1, 5);
            const op = MathUtils.randomChoice(['+', '-']); 
            const termX = op === '+' ? k1 + k2 : k1 - k2;
            const termC = op === '+' ? k1 * c1 + k2 * c2 : k1 * c1 - k2 * c2;
            const ans = `${termX === 1 ? '' : termX === -1 ? '-' : termX}x ${termC >= 0 ? '+' : ''}${termC}`;

            return {
                renderData: {
                    latex: `${k1}(x + ${c1}) ${op} ${k2}(x + ${c2})`,
                    description: lang === 'sv' ? "Förenkla uttrycket genom att expandera båda parenteserna." : "Simplify the expression by expanding both parentheses.",
                    answerType: 'text'
                },
                token: this.toBase64(ans.replace(/\s/g, "")), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Använd distributiva lagen på den första parentesen." : "Step 1: Apply the distributive law to the first set of parentheses.", latex: `${k1} · x + ${k1} · ${c1} = ${k1}x + ${k1*c1}` },
                    { text: lang === 'sv' ? `Steg 2: Använd distributiva lagen på den andra parentesen. Kom ihåg att tecknet är ${op}.` : `Step 2: Apply the distributive law to the second set of parentheses. Remember the sign is ${op}.`, latex: `${op === '-' ? '-' : ''}${k2}x ${op === '-' ? '-' : '+'}${k2*c2}` },
                    { text: lang === 'sv' ? "Steg 3: Skriv ner hela det expanderade uttrycket." : "Step 3: Write down the entire expanded expression.", latex: `${k1}x + ${k1*c1} ${op === '-' ? '-' : '+'} ${k2}x ${op === '-' ? '-' : '+'} ${k2*c2}` },
                    { text: lang === 'sv' ? "Steg 4: Samla x-termerna för sig." : "Step 4: Gather the x-terms together.", latex: `${k1}x ${op} ${k2}x = ${termX}x` },
                    { text: lang === 'sv' ? "Steg 5: Samla siffertermerna för sig." : "Step 5: Gather the constant terms together.", latex: `${k1*c1} ${op} ${k2*c2} = ${termC}` },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
                ]
            };
        }

        const a = MathUtils.randomInt(2, 5), b = MathUtils.randomInt(2, 4), c = MathUtils.randomInt(2, 6);
        const d = MathUtils.randomInt(2, 8), op = MathUtils.randomChoice(['+', '-']); 
        const termX = op === '+' ? a * b + d : a * b - d;
        const ansStr = `${termX === 1 ? '' : termX === -1 ? '-' : termX}x + ${a*c}`;

        return {
            renderData: {
                latex: `${a}(${b}x + ${c}) ${op} ${d}x`,
                description: lang === 'sv' ? "Multiplicera in i parentesen och förenkla sedan." : "Multiply into the parentheses and then simplify.",
                answerType: 'text'
            },
            token: this.toBase64(ansStr.replace(/\s/g, "")), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Börja med att multiplicera in faktorn utanför parentesen." : "Step 1: Start by multiplying the factor outside the parentheses." },
                { text: lang === 'sv' ? `Uträkning: ${a} · ${b}x + ${a} · ${c}` : `Calculation: ${a} · ${b}x + ${a} · ${c}`, latex: `${a*b}x + ${a*c}` },
                { text: lang === 'sv' ? "Steg 2: Lägg till den sista termen i uttrycket." : "Step 2: Add the final term to the expression.", latex: `${a*b}x + ${a*c} ${op} ${d}x` },
                { text: lang === 'sv' ? "Steg 3: Kombinera x-termerna." : "Step 3: Combine the x-terms.", latex: `${a*b}x ${op} ${d}x = ${termX}x` },
                { text: lang === 'sv' ? `Svar: ${ansStr}` : `Answer: ${ansStr}` }
            ]
        };
    }

    // --- LEVEL 4: SUBTRACTING PARENTHESES ---
    private level4_SubtractParentheses(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'sub_concept_plus_logic', type: 'concept' },
            { key: 'sub_block_plus', type: 'calculate' },
            { key: 'sub_block_minus', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'sub_concept_plus_logic') {
            const correct = lang === 'sv' ? "Alla tecken inuti parentesen ändras" : "All signs inside the parentheses change";
            return {
                renderData: {
                    description: lang === 'sv' ? "Vad är huvudregeln när man tar bort en parentes med minus (-) framför?" : "What is the main rule when removing parentheses with a minus (-) in front?",
                    answerType: 'multiple_choice', options: MathUtils.shuffle([correct, lang === 'sv' ? "Inga tecken ändras" : "No signs change"])
                },
                token: this.toBase64(correct), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Minus framför en parentes betyder att vi subtraherar hela gruppen av termer." : "Step 1: A minus in front of parentheses means we are subtracting the entire group of terms." },
                    { text: lang === 'sv' ? "Steg 2: Matematiskt är det som att multiplicera varje term inuti med -1." : "Step 2: Mathematically, it is like multiplying every term inside by -1." },
                    { text: lang === 'sv' ? "Steg 3: Detta gör att plus blir minus, och minus blir plus." : "Step 3: This causes plus to become minus, and minus to become plus.", latex: "-(a + b) \\rightarrow -a - b" },
                    { text: lang === 'sv' ? `Svar: ${correct}` : `Answer: ${correct}` }
                ]
            };
        }

        const startX = MathUtils.randomInt(10, 20), subX = MathUtils.randomInt(2, 6), subK = MathUtils.randomInt(2, 10);
        const inOp = v === 'sub_block_minus' ? '-' : '+';
        const resOp = inOp === '+' ? '-' : '+';
        const ans = `${startX - subX}x ${resOp} ${subK}`;

        return {
            renderData: {
                latex: `${startX}x - (${subX}x ${inOp} ${subK})`,
                description: lang === 'sv' ? "Förenkla uttrycket genom att ta bort parentesen." : "Simplify the expression by removing the parentheses.",
                answerType: 'text'
            },
            token: this.toBase64(ans.replace(/\s/g, "")), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Notera minustecknet framför parentesen. Alla tecken inuti måste bytas." : "Step 1: Note the minus sign in front of the parentheses. All signs inside must be flipped." },
                { text: lang === 'sv' ? `Steg 2: Ta bort parentesen. ${inOp} blir ${resOp}.` : `Step 2: Remove the parentheses. ${inOp} becomes ${resOp}.`, latex: `${startX}x - ${subX}x ${resOp} ${subK}` },
                { text: lang === 'sv' ? "Steg 3: Kombinera x-termerna." : "Step 3: Combine the x-terms.", latex: `${startX}x - ${subX}x = ${startX - subX}x` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ]
        };
    }

    // --- LEVEL 5: WORD PROBLEMS ---
    private level5_WordProblems(lang: string, variationKey?: string, options: any = {}): any {
        const scenarios = ['word_candy', 'word_combined_age_tri', 'word_passengers', 'word_rect_perimeter'];
        const v = variationKey || this.getVariation(scenarios.map(s => ({key: s, type: 'calculate'})), options);
        const A = MathUtils.randomInt(2, 5), B = MathUtils.randomInt(10, 50), C = MathUtils.randomInt(2, 5);

        let desc = "", ans = "", steps: any[] = [];

        if (v === 'word_candy') {
            desc = lang === 'sv' ? `Du har ${A} påsar med x godisar i varje. Du köper ${C} likadana påsar till, men äter upp ${B} godisar själv. Skriv ett förenklat uttryck.` : `You have ${A} bags with x candies each. You buy ${C} more identical bags, but eat ${B} candies yourself. Write a simplified expression.`;
            ans = `${A+C}x - ${B}`;
            steps = [
                { text: lang === 'sv' ? "Steg 1: Skapa ett uttryck för de påsar du hade från början." : "Step 1: Create an expression for the bags you had from the start.", latex: `${A}x` },
                { text: lang === 'sv' ? "Steg 2: Lägg till de nya påsarna du köpte." : "Step 2: Add the new bags you bought.", latex: `${A}x + ${C}x` },
                { text: lang === 'sv' ? "Steg 3: Dra bort de godisar du åt upp." : "Step 3: Subtract the candies you ate.", latex: `${A}x + ${C}x - ${B}` },
                { text: lang === 'sv' ? "Steg 4: Förenkla uttrycket genom att slå ihop x-termerna (påsarna)." : "Step 4: Simplify the expression by combining the x-terms (the bags).", latex: `${A+C}x - ${B}` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ];
        } else if (v === 'word_combined_age_tri') {
            const d = MathUtils.randomInt(2, 6);
            desc = lang === 'sv' ? `Elias är x år gammal. Hans syster är ${d} år äldre. Pappa är 3 gånger så gammal som Elias. Uttryck deras sammanlagda ålder.` : `Elias is x years old. His sister is ${d} years older. His father is 3 times as old as Elias. Express their total age.`;
            ans = `5x + ${d}`;
            steps = [
                { text: lang === 'sv' ? "Steg 1: Skriv Elias ålder som ett uttryck." : "Step 1: Write Elias's age as an expression.", latex: "x" },
                { text: lang === 'sv' ? "Steg 2: Skriv systerns ålder (Elias ålder + " + d + ")." : "Step 2: Write the sister's age (Elias's age + " + d + ").", latex: "x + " + d },
                { text: lang === 'sv' ? "Steg 3: Skriv pappans ålder (3 gånger Elias ålder)." : "Step 3: Write the father's age (3 times Elias's age).", latex: "3x" },
                { text: lang === 'sv' ? "Steg 4: Ställ upp summan av alla åldrar." : "Step 4: Set up the sum of all ages.", latex: `x + (x + ${d}) + 3x` },
                { text: lang === 'sv' ? "Steg 5: Förenkla genom att addera alla x-termer: 1x + 1x + 3x." : "Step 5: Simplify by adding all x-terms: 1x + 1x + 3x.", latex: `5x + ${d}` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ];
        } else {
            // Default generic word problem (Passengers)
            desc = lang === 'sv' ? `Från början finns x passagerare på en buss. ${B} går av, sedan stiger ${A}x passagerare på. Skriv ett uttryck för antalet nu.` : `Initially there are x passengers on a bus. ${B} leave, then ${A}x passengers board. Write an expression for the current count.`;
            ans = `${A+1}x - ${B}`;
            steps = [
                { text: lang === 'sv' ? "Steg 1: Börja med det ursprungliga antalet passagerare." : "Step 1: Start with the original number of passengers.", latex: "x" },
                { text: lang === 'sv' ? `Steg 2: Dra bort de ${B} som gick av.` : `Step 2: Subtract the ${B} who left.`, latex: `x - ${B}` },
                { text: lang === 'sv' ? `Steg 3: Lägg till de ${A}x som steg på.` : `Step 3: Add the ${A}x who boarded.`, latex: `x - ${B} + ${A}x` },
                { text: lang === 'sv' ? "Steg 4: Förenkla genom att kombinera x-termerna (variablerna)." : "Step 4: Simplify by combining the x-terms (the variables).", latex: `${A+1}x - ${B}` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ];
        }

        return {
            renderData: { latex: "", description: desc, answerType: 'text' },
            token: this.toBase64(ans.replace(/\s/g, "")),
            variationKey: v, type: 'calculate',
            clues: steps,
            metadata: { variation_key: v, difficulty: 3 }
        };
    }

    private level6_Mixed(lang: string, options: any): any {
        const lvl = MathUtils.randomInt(1, 5);
        return this.generate(lvl, lang, options);
    }
}