import { MathUtils } from '../utils/MathUtils.js';
import { enrichQuestionMetadata } from '../utils/WordProblemDecorator.js';

export class ExpressionSimplificationGen {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        // Adaptive Fallback: If Level 1 concepts are mastered, push to Level 2
        if (level === 1 && options.hideConcept && options.exclude?.includes('combine_standard_mixed')) {
            return this.level3_Parentheses(lang, undefined, options);
        }

        let questionData: any;

        switch (level) {
            case 1: questionData = this.level1_CombineTerms(lang, undefined, options); break;
            case 2: questionData = this.level2_OrderOfOps(lang, undefined, options); break;
            case 3: questionData = this.level3_Parentheses(lang, undefined, options); break;
            case 4: questionData = this.level4_DistributeAndSimplify(lang, undefined, options); break;
            case 5: questionData = this.level5_SubtractParentheses(lang, undefined, options); break;
            case 6: questionData = this.level6_Mixed(lang, options); break;
            default: questionData = this.level1_CombineTerms(lang, undefined, options); break;
        }

        // Run through the decorator
        enrichQuestionMetadata(questionData);

        // Practice Mode Level-Wide Override
        const WORD_PROBLEM_ELIGIBLE_LEVELS = [1, 2, 3, 4, 5];
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
            case 'combine_lie_exponent':
            case 'combine_concept_id':
            case 'combine_standard_mixed':
                return this.level1_CombineTerms(lang, key);
            
            case 'combine_mult_mixed':
            case 'combine_div_mixed':
            case 'combine_mult_div_boss':
                return this.level2_OrderOfOps(lang, key);

            case 'distribute_lie_partial':
            case 'distribute_plus':
            case 'distribute_minus':
                return this.level3_Parentheses(lang, key);
            
            case 'distribute_double':
            case 'distribute_combine_std':
                return this.level4_DistributeAndSimplify(lang, key);
            
            case 'sub_concept_plus_logic':
            case 'sub_block_plus':
            case 'sub_block_minus':
                return this.level5_SubtractParentheses(lang, key);
            
            default:
                return this.level1_CombineTerms(lang, 'combine_standard_mixed');
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
            const sLie = `${a}x + ${b}x = ${sum}x^2`; 
            const sTrue = `${a}x + ${b}x = ${sum}x`;

            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket påstående är FALSKT?" : "Which statement is FALSE?",
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([sTrue, sLie, `${a}x + x = ${(a+1)}x`])
                },
                token: this.toBase64(sLie), variationKey: v, type: 'concept',
                clues: [
                    { 
                        text: lang === 'sv' ? "När vi adderar ihop x-termer ändras bara ANTALET x. Vi rör aldrig den lilla tvåan däruppe!" : "When we add x-terms together, only the COUNT of x changes. We never touch or change the small exponent on top!", 
                        latex: `${a}x + ${b}x` 
                    },
                    { 
                        text: lang === 'sv' ? `Tänk på det som frukter: ${a} äpplen + ${b} äpplen blir ${sum} äpplen. Det blir inte ${sum} "äpplen i kvadrat".` : `Think of it like items: ${a} apples + ${b} apples equals ${sum} apples. It doesn't suddenly become ${sum} "squared apples".`, 
                        latex: `${a}x + ${b}x = \\mathbf{${sum}x}` 
                    },
                    { 
                        text: lang === 'sv' ? `Det betyder att det här påståendet är en lögn och helt felaktigt:` : `This means that this specific calculation statement is a lie and completely incorrect:`, 
                        latex: `\\mathbf{${a}x + ${b}x = ${sum}x^2}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${sLie}` : `Answer: ${sLie}`, 
                        latex: `\\text{${sLie}}` 
                    }
                ]
            };
        }

        if (v === 'combine_standard_mixed') {
            const a = MathUtils.randomInt(10, 20);
            const b = MathUtils.randomInt(10, 20);
            const c = MathUtils.randomInt(2, 8);
            const d = MathUtils.randomInt(2, 8);
            
            const op1 = Math.random() > 0.5 ? '+' : '-';
            const op2 = Math.random() > 0.5 ? '+' : '-';
            const op3 = Math.random() > 0.5 ? '+' : '-';
            
            const resX = op2 === '+' ? a + c : a - c;
            const resC = op1 === '+' ? (op3 === '+' ? b + d : b - d) : (op3 === '+' ? -b + d : -b - d);
            
            const ans = `${resX}x ${resC >= 0 ? '+' : '-'} ${Math.abs(resC)}`;
            const expressionStr = `${a}x ${op1} ${b} ${op2} ${c}x ${op3} ${d}`;

            return {
                renderData: {
                    latex: expressionStr,
                    description: lang === 'sv' ? "Förenkla uttrycket genom att sortera och slå ihop sorterna för sig." : "Simplify the expression by sorting and grouping matching types together.",
                    answerType: 'text'
                },
                token: this.toBase64(ans.replace(/\s/g, "")), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? "Sortera uttrycket så att x-kompisarna står först och de vanliga lösa siffrorna står sist." : "Rearrange the expression so the x-terms stand first and the loose numbers stand at the end.", 
                        latex: expressionStr 
                    },
                    { 
                        text: lang === 'sv' ? "Kom ihåg att plustecknet eller minustecknet framför en siffra alltid hör ihop med den siffran!" : "Remember that the plus or minus sign in front of a number always belongs to that specific number!", 
                        latex: `\\mathbf{${a}x ${op2} ${c}x} ${op1} ${b} ${op3} ${d}` 
                    },
                    { 
                        text: lang === 'sv' ? `Räkna ut x-sorterna för sig: ${a}x ${op2} ${c}x blir ${resX}x.` : `Calculate the x-terms on their own: ${a}x ${op2} ${c}x equals ${resX}x.`, 
                        latex: `\\mathbf{${resX}x} ${op1} ${b} ${op3} ${d}` 
                    },
                    { 
                        text: lang === 'sv' ? `Räkna sedan ut siffer-sorterna för sig: ${op1}${b} ${op3} ${d} blir ${resC >= 0 ? '+' : '-'}${Math.abs(resC)}.` : `Next, calculate the loose number terms on their own: ${op1}${b} ${op3} ${d} equals ${resC >= 0 ? '+' : '-'}${Math.abs(resC)}.`, 
                        latex: `${resX}x \\mathbf{${resC >= 0 ? '+ ' : '- '}${Math.abs(resC)}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, 
                        latex: `${ans}` 
                    }
                ],
                metadata: { variation_key: v, difficulty: 1 }
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

    // --- LEVEL 2: ORDER OF OPERATIONS WITH ALGEBRA ---
    private level2_OrderOfOps(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'combine_mult_mixed', type: 'calculate' },
            { key: 'combine_div_mixed', type: 'calculate' },
            { key: 'combine_mult_div_boss', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        // Helper to format terms gracefully (avoids "1x" or "+ -5")
        const fmtX = (coef: number) => coef === 1 ? 'x' : coef === -1 ? '-x' : `${coef}x`;
        const fmtOp = (val: number) => val < 0 ? `- ${Math.abs(val)}` : `+ ${val}`;

        if (v === 'combine_mult_mixed') {
            const a = MathUtils.randomInt(2, 6);
            const b = MathUtils.randomInt(2, 6);
            const p = a * b; // product
            
            let c = MathUtils.randomInt(2, 8);
            const op1 = Math.random() > 0.5 ? '+' : '-';
            const isMultFirst = Math.random() > 0.5;
            
            // 🟢 FIXED: Calculate finalX based on the random visual order
            let finalX = isMultFirst ? (op1 === '+' ? p + c : p - c) : (op1 === '+' ? c + p : c - p);
            
            if (finalX === 0) {
                c += 2; // Prevent 0x
                finalX = isMultFirst ? (op1 === '+' ? p + c : p - c) : (op1 === '+' ? c + p : c - p);
            }

            const d = MathUtils.randomInt(2, 10);
            const op2 = Math.random() > 0.5 ? '+' : '-';
            const signD = op2 === '+' ? 1 : -1;

            const exprLatex = isMultFirst 
                ? `${a} \\cdot ${b}x ${op1} ${c}x ${op2} ${d}`
                : `${c}x ${op1} ${a} \\cdot ${b}x ${op2} ${d}`;
            
            const ansLatex = `${fmtX(finalX)} ${fmtOp(signD * d)}`;

            return {
                renderData: { latex: exprLatex, description: lang === 'sv' ? "Förenkla uttrycket." : "Simplify the expression.", answerType: 'text' },
                token: this.toBase64(ansLatex.replace(/\s+/g, '')), variationKey: v, type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv' ? "Enligt prioriteringsreglerna måste vi multiplicera före vi adderar eller subtraherar." : "According to the order of operations, we must multiply before adding or subtracting.",
                        latex: exprLatex
                    },
                    {
                        text: lang === 'sv' ? `Multiplicera siffrorna i den termen först: ${a} · ${b}x = ${p}x.` : `Multiply the numbers in that term first: ${a} · ${b}x = ${p}x.`,
                        latex: isMultFirst ? `\\mathbf{${p}x} ${op1} ${c}x ${op2} ${d}` : `${c}x ${op1} \\mathbf{${p}x} ${op2} ${d}`
                    },
                    {
                        text: lang === 'sv' ? `Samla nu ihop alla x-termer för sig: ${isMultFirst ? `${p}x ${op1}${c}x` : `${c}x ${op1}${p}x`} = ${finalX}x.` : `Now combine all x-terms together: ${isMultFirst ? `${p}x ${op1}${c}x` : `${c}x ${op1}${p}x`} = ${finalX}x.`,
                        latex: `${fmtX(finalX)} ${op2} ${d}`
                    },
                    { text: lang === 'sv' ? "Svar:" : "Answer:", latex: ansLatex }
                ]
            };
        }

        if (v === 'combine_div_mixed') {
            const q = MathUtils.randomInt(2, 6);
            const b = MathUtils.randomInt(2, 5);
            const a = q * b; // ensures a/b is a clean integer q
            
            let c = MathUtils.randomInt(2, 8);
            const op1 = Math.random() > 0.5 ? '+' : '-';
            const isDivFirst = Math.random() > 0.5;
            
            // 🟢 FIXED: Calculate finalX based on the random visual order
            let finalX = isDivFirst ? (op1 === '+' ? q + c : q - c) : (op1 === '+' ? c + q : c - q);
            
            if (finalX === 0) {
                c += 2; // Prevent 0x
                finalX = isDivFirst ? (op1 === '+' ? q + c : q - c) : (op1 === '+' ? c + q : c - q);
            }

            const d = MathUtils.randomInt(2, 10);
            const op2 = Math.random() > 0.5 ? '+' : '-';
            const signD = op2 === '+' ? 1 : -1;

            const exprLatex = isDivFirst 
                ? `\\frac{${a}x}{${b}} ${op1} ${c}x ${op2} ${d}`
                : `${c}x ${op1} \\frac{${a}x}{${b}} ${op2} ${d}`;
            
            const ansLatex = `${fmtX(finalX)} ${fmtOp(signD * d)}`;

            return {
                renderData: { latex: exprLatex, description: lang === 'sv' ? "Förenkla uttrycket." : "Simplify the expression.", answerType: 'text' },
                token: this.toBase64(ansLatex.replace(/\s+/g, '')), variationKey: v, type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv' ? "Bråkstrecket fungerar som division, vilket alltid går före addition och subtraktion." : "The fraction bar acts as division, which always comes before addition and subtraction.",
                        latex: exprLatex
                    },
                    {
                        text: lang === 'sv' ? `Börja med att förenkla bråket: ${a}x / ${b} = ${q}x.` : `Start by simplifying the fraction: ${a}x / ${b} = ${q}x.`,
                        latex: isDivFirst ? `\\mathbf{${q}x} ${op1} ${c}x ${op2} ${d}` : `${c}x ${op1} \\mathbf{${q}x} ${op2} ${d}`
                    },
                    {
                        text: lang === 'sv' ? `Samla nu x-termerna: ${isDivFirst ? `${q}x ${op1}${c}x` : `${c}x ${op1}${q}x`} = ${finalX}x.` : `Now combine the x-terms: ${isDivFirst ? `${q}x ${op1}${c}x` : `${c}x ${op1}${q}x`} = ${finalX}x.`,
                        latex: `${fmtX(finalX)} ${op2} ${d}`
                    },
                    { text: lang === 'sv' ? "Svar:" : "Answer:", latex: ansLatex }
                ]
            };
        }

        // v === 'combine_mult_div_boss'
        const a = MathUtils.randomInt(2, 5);
        const b = MathUtils.randomInt(2, 5);
        const p = a * b; // product

        const q = MathUtils.randomInt(2, 6);
        const d = MathUtils.randomInt(2, 4);
        const c = q * d; // fraction top

        // The order here is fixed (multiplication always first), so the finalX calculation is naturally safe
        const op = Math.random() > 0.5 ? '+' : '-';
        let finalX = op === '+' ? p + q : p - q;
        
        if (finalX === 0) {
            finalX = p + q; // force addition to avoid 0x
        }

        const exprLatex = `${a} \\cdot ${b}x ${op === '+' ? '+' : '-'} \\frac{${c}x}{${d}}`;
        const ansLatex = fmtX(finalX);

        return {
            renderData: { latex: exprLatex, description: lang === 'sv' ? "Förenkla uttrycket." : "Simplify the expression.", answerType: 'text' },
            token: this.toBase64(ansLatex.replace(/\s+/g, '')), variationKey: v, type: 'calculate',
            clues: [
                {
                    text: lang === 'sv' ? "Här har vi både multiplikation och division (bråket). Vi måste lösa båda dessa före vi plussar eller minusar." : "Here we have both multiplication and division (the fraction). We must solve both of these before adding or subtracting.",
                    latex: exprLatex
                },
                {
                    text: lang === 'sv' ? `Börja med multiplikationen: ${a} · ${b}x = ${p}x.` : `Start with the multiplication: ${a} · ${b}x = ${p}x.`,
                    latex: `\\mathbf{${p}x} ${op === '+' ? '+' : '-'} \\frac{${c}x}{${d}}`
                },
                {
                    text: lang === 'sv' ? `Beräkna sedan divisionen: ${c}x / ${d} = ${q}x.` : `Then calculate the division: ${c}x / ${d} = ${q}x.`,
                    latex: `${p}x ${op === '+' ? '+' : '-'} \\mathbf{${q}x}`
                },
                {
                    text: lang === 'sv' ? `Samla ihop dina x-termer för att få fram slutsvaret.` : `Combine your x-terms to get the final answer.`,
                    latex: `\\mathbf{${finalX}x}`
                },
                { text: lang === 'sv' ? "Svar:" : "Answer:", latex: ansLatex }
            ]
        };
    }

    // --- LEVEL 3: PARENTHESES ---
    private level3_Parentheses(lang: string, variationKey?: string, options: any = {}): any {
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
                    { 
                        text: lang === 'sv' ? "När en siffra står direkt utanför en parentes måste den gångras med ALLA kompisar på insidan." : "When a number stands right outside a parenthesis, it must be multiplied by EVERY single item on the inside.", 
                        latex: `${k}(${a}x + ${b})` 
                    },
                    { 
                        text: lang === 'sv' ? `Siffran ${k} ska sprutas in och gångras med både ${a}x och med ${b}.` : `The outer number ${k} must be distributed and multiplied by both ${a}x and ${b}.`, 
                        latex: `\\mathbf{${k} \\cdot ${a}x + ${k} \\cdot ${b}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Det rätta svaret ska alltså bli ${k*a}x + ${k*b}. Det är ett vanligt fuskfel att glömma bort att gångra den sista siffran!` : `The correct answer must therefore turn into ${k*a}x + ${k*b}. It's a common mistake to forget to multiply the last number!`, 
                        latex: `\\mathbf{${k*a}x + ${k*b}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Därför är den här raden en lögn eftersom sista siffran lämnades helt orörd:` : `Therefore, this specific option row is a lie because the last number was left completely untouched:`, 
                        latex: `\\mathbf{${lie}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${lie}` : `Answer: ${lie}`, 
                        latex: `\\text{${lie}}` 
                    }
                ]
            };
        }

        const a = MathUtils.randomInt(10, 20), b = MathUtils.randomInt(2, 6), c = MathUtils.randomInt(2, 10);
        const isPlus = v === 'distribute_plus';
        const ans = isPlus ? `${a+b}x + ${c}` : `${a-b}x - ${c}`;
        const baseExpr = `${a}x ${isPlus ? '+' : '-'} (${b}x + ${c})`;

        return {
            renderData: {
                latex: baseExpr,
                description: lang === 'sv' ? "Ta bort parentesen och förenkla uttrycket." : "Remove the parentheses and simplify the expression.",
                answerType: 'text'
            },
            token: this.toBase64(ans.replace(/\s/g, "")), variationKey: v, type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? (isPlus ? "När det står ett plustecken framför en parentes kan du bara sudda bort parenteserna direkt utan att ändra någonting." : "Varning! När det står ett minustecken framför en parentes måste ALLA tecken på insidan vändas och bytas ut när parentesen suddas bort.") : (isPlus ? "When there is a plus sign in front of a parenthesis, you can simply erase the brackets directly without changing anything." : "Warning! When there is a minus sign in front of a parenthesis, EVERY sign on the inside must flip and change when the brackets are erased."), 
                    latex: baseExpr 
                },
                { 
                    text: lang === 'sv' ? (isPlus ? "Vi skriver raden på nytt utan parentesväggar:" : "Vi plockar bort parentesen och byter plustecknet på insidan till ett minus:") : (isPlus ? "We rewrite the line without the parenthesis walls:" : "We remove the parenthesis and flip the internal plus sign into a minus sign:"), 
                    latex: isPlus ? `${a}x + ${b}x + ${c}` : `${a}x - ${b}x - ${c}` 
                },
                { 
                    text: lang === 'sv' ? `Slå nu ihop x-kompisarna: ${a}x ${isPlus ? '+' : '-'} ${b}x.` : `Now group and calculate the matching x-terms: ${a}x ${isPlus ? '+' : '-'} ${b}x.`, 
                    latex: isPlus ? `\\mathbf{${a}x + ${b}x} + ${c}` : `\\mathbf{${a}x - ${b}x} - ${c}` 
                },
                { 
                    text: lang === 'sv' ? "Förenkla färdigt för att nå det sista uttrycket." : "Simplify completely to reach the final expression result.", 
                    latex: isPlus ? `\\mathbf{${a+b}x} + ${c}` : `\\mathbf{${a-b}x} - ${c}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, 
                    latex: `${ans}` 
                }
            ]
        };
    }

    // --- LEVEL 4: DISTRIBUTE & SIMPLIFY ---
    private level4_DistributeAndSimplify(lang: string, variationKey?: string, options: any = {}): any {
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
            const baseExpr = `${k1}(x + ${c1}) ${op} ${k2}(x + ${c2})`;

            return {
                renderData: {
                    latex: baseExpr,
                    description: lang === 'sv' ? "Öppna upp båda parenteserna och förenkla uttrycket." : "Open up both sets of parentheses and simplify the expression.",
                    answerType: 'text'
                },
                token: this.toBase64(ans.replace(/\s/g, "")), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? "Här har vi två olika parenteser. Vi öppnar dem en i taget genom att multiplicera in siffran utanför." : "Here we have two separate sets of brackets. Let's open them one at a time by multiplying the outer number inside.", 
                        latex: baseExpr 
                    },
                    { 
                        text: lang === 'sv' ? `Gångra in ${k1} i den första parentesen: ${k1} · x och ${k1} · ${c1}.` : `Multiply ${k1} inside the first parenthesis: ${k1} · x and ${k1} · ${c1}.`, 
                        latex: `\\mathbf{(${k1}x + ${k1 * c1})} ${op} ${k2}(x + ${c2})` 
                    },
                    { 
                        text: lang === 'sv' ? `Gångra nu in ${k2} i den andra parentesen. Kom ihåg minustecknet om det står ett minus emellan!` : `Now multiply ${k2} inside the second parenthesis. Watch out if there is a minus sign in between!`, 
                        latex: `${k1}x + ${k1 * c1} \\mathbf{${op} ${k2}x ${op === '-' ? '-' : '+'} ${k2 * c2}}` 
                    },
                    { 
                        text: lang === 'sv' ? "Sortera raden så att x-termerna hamnar först och vanliga siffror hamnar sist." : "Rearrange the row so that x-terms are placed first and regular numbers are at the end.", 
                        latex: `\\mathbf{${k1}x ${op} ${k2}x} + \\mathbf{${k1 * c1} ${op === '-' ? '-' : '+'} ${k2 * c2}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Räkna ut x-biten för sig (${termX}x) och siffer-biten för sig (${termC >= 0 ? '+' : ''}${termC}).` : `Calculate the x-part on its own (${termX}x) and the number part on its own (${termC >= 0 ? '+' : ''}${termC}).`, 
                        latex: `\\mathbf{${ans}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, 
                        latex: `${ans}` 
                    }
                ]
            };
        }

        const a = MathUtils.randomInt(2, 5), b = MathUtils.randomInt(2, 4), c = MathUtils.randomInt(2, 6);
        const d = MathUtils.randomInt(2, 8), op = MathUtils.randomChoice(['+', '-']); 
        const termX = op === '+' ? a * b + d : a * b - d;
        const ansStr = `${termX === 1 ? '' : termX === -1 ? '-' : termX}x + ${a*c}`;
        const baseExpr = `${a}(${b}x + ${c}) ${op} ${d}x`;

        return {
            renderData: {
                latex: baseExpr,
                description: lang === 'sv' ? "Gångra in i parentesen och slå sedan ihop lika sorter." : "Multiply into the parentheses and then combine like terms.",
                answerType: 'text'
            },
            token: this.toBase64(ansStr.replace(/\s/g, "")), variationKey: v, type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? `Börja alltid med att öppna upp parentesen. Siffran ${a} ska gångras med både ${b}x och med ${c}.` : `Always start by opening up the parenthesis block. The outer factor ${a} must be multiplied by both ${b}x and ${c}.`, 
                    latex: baseExpr 
                },
                { 
                    text: lang === 'sv' ? `Förenkla parentesmultiplikationen: ${a} · ${b}x blir ${a*b}x, och ${a} · ${c} blir ${a*c}.` : `Simplify the expanded multiplication steps: ${a} · ${b}x becomes ${a*b}x, and ${a} · ${c} becomes ${a*c}.`, 
                    latex: `\\mathbf{${a*b}x + ${a*c}} ${op} ${d}x` 
                },
                { 
                    text: lang === 'sv' ? `Flytta om och samla x-kompisarna bredvid varandra: ${a*b}x ${op} ${d}x.` : `Rearrange and group the matching x-terms right next to each other: ${a*b}x ${op} ${d}x.`, 
                    latex: `\\mathbf{${a*b}x ${op} ${d}x} + ${a*c}` 
                },
                { 
                    text: lang === 'sv' ? `Räkna ut x-subtraktionen eller x-additionen för att få det färdiga uttrycket.` : `Calculate the final x-term total to complete the clean expression layout.`, 
                    latex: `\\mathbf{${termX}x} + ${a*c}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${ansStr}` : `Answer: ${ansStr}`, 
                    latex: `${ansStr}` 
                }
            ]
        };
    }

    // --- LEVEL 5: SUBTRACTING PARENTHESES ---
    private level5_SubtractParentheses(lang: string, variationKey?: string, options: any = {}): any {
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
        const baseExpr = `${startX}x - (${subX}x ${inOp} ${subK})`;

        return {
            renderData: {
                latex: baseExpr,
                description: lang === 'sv' ? "Ta bort parentesväggarna och förenkla uttrycket." : "Remove the parenthesis walls and simplify the expression.",
                answerType: 'text'
            },
            token: this.toBase64(ans.replace(/\s/g, "")), variationKey: v, type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? `Se upp! Det står ett minustecken (-) precis framför parentesen. Det tvingar ALLA tecken på insidan att byta plats och vändas.` : `Watch out! There is a minus sign (-) right in front of the parenthesis. This forces EVERY single sign on the inside to flip and invert.`, 
                    latex: baseExpr 
                },
                { 
                    text: lang === 'sv' ? `När vi tar bort parenteserna förvandlas det invändiga tecknet ${inOp} till ett ${resOp}:` : `When we remove the brackets, the internal operator sign ${inOp} flips over into a ${resOp}:`, 
                    latex: `${startX}x - ${subX}x \\mathbf{${resOp} ${subK}}` 
                },
                { 
                    text: lang === 'sv' ? `Slå nu ihop x-termerna längst fram på raden: ${startX}x minus ${subX}x blir ${startX - subX}x.` : `Now calculate the matching x-terms sitting at the front of the row: ${startX}x minus ${subX}x equals ${startX - subX}x.`, 
                    latex: `\\mathbf{${startX - subX}x} ${resOp} ${subK}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, 
                    latex: `${ans}` 
                }
            ]
        };
    }

    private level6_Mixed(lang: string, options: any): any {
        const lvl = MathUtils.randomInt(1, 5);
        return this.generate(lvl, lang, options);
    }
}