import { MathUtils } from '../utils/MathUtils.js';

export class ExpressionSimplificationGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_CombineTerms(lang);
            case 2: return this.level2_Parentheses(lang);
            case 3: return this.level3_DistributeAndSimplify(lang);
            case 4: return this.level4_SubtractParentheses(lang);
            case 5: return this.level5_WordProblems(lang);
            case 6: return this.level6_Mixed(lang);
            default: return this.level1_CombineTerms(lang);
        }
    }

    /**
     * Phase 2: Targeted Generation
     * Allows the Question Studio to request a specific skill bucket.
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

    // --- LEVEL 1: Combine Like Terms ---
    private level1_CombineTerms(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['combine_lie_exponent', 'combine_concept_id', 'combine_standard_mixed']);

        if (v === 'combine_lie_exponent') {
            const a = MathUtils.randomInt(2, 6);
            const b = MathUtils.randomInt(2, 6);
            const sum = a + b;
            const sTrue = `${a}x + ${b}x = ${sum}x`;
            const sLie = `${a}x + ${b}x = ${sum}x^2`; 
            const sTrue2 = `${a}x + x = ${a+1}x`;
            const options = [sTrue, sLie, sTrue2];

            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket av följande påståenden om förenkling är FALSKT?" : "Which of the following statements about simplification is FALSE?",
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle(options)
                },
                token: this.toBase64(sLie),
                clues: [
                    { text: lang === 'sv' ? "När vi adderar termer av samma slag (som x) ändras inte variabelns exponent. Det är som att lägga ihop frukter." : "When we add terms of the same kind (like x), the variable's exponent does not change. It is like adding fruit.", latex: "3x + 2x = 5x" },
                    { text: lang === 'sv' ? "Variabeln får bara en tvåa (x²) om vi multiplicerar x med x." : "The variable only gets a two (x²) if we multiply x by x.", latex: "x \\cdot x = x^2" }
                ],
                metadata: { variation_key: 'combine_lie_exponent', difficulty: 2 }
            };
        }

        if (v === 'combine_concept_id') {
            const a = MathUtils.randomInt(2, 9);
            const correct = `${MathUtils.randomInt(2, 9)}x`;
            const wrong1 = `${MathUtils.randomInt(2, 9)}y`;
            const wrong2 = `${MathUtils.randomInt(2, 9)}`;

            return {
                renderData: {
                    description: lang === 'sv' ? `Vilken av dessa termer kan du lägga ihop med ${a}x genom förenkling?` : `Which of these terms can you add to ${a}x through simplification?`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([correct, wrong1, wrong2])
                },
                token: this.toBase64(correct),
                clues: [{ text: lang === 'sv' ? "Du kan bara kombinera termer som har exakt samma bokstav (variabel)." : "You can only combine terms that have the exact same letter (variable)." }],
                metadata: { variation_key: 'combine_concept_id', difficulty: 1 }
            };
        }

        const a = MathUtils.randomInt(2, 8);
        const b = MathUtils.randomInt(2, 12);
        const c = MathUtils.randomInt(2, 8);
        const d = MathUtils.randomInt(2, 12);
        const ans = `${a + c}x + ${b + d}`;

        return {
            renderData: {
                latex: `${a}x + ${b} + ${c}x + ${d}`,
                description: lang === 'sv' ? "Förenkla uttrycket genom att samla ihop termer av samma slag." : "Simplify the expression by gathering like terms.",
                answerType: 'text'
            },
            token: this.toBase64(ans),
            clues: [
                { text: lang === 'sv' ? "Steg 1: Samla ihop alla x-termer." : "Step 1: Gather all x-terms.", latex: `${a}x + ${c}x = ${a+c}x` },
                { text: lang === 'sv' ? "Steg 2: Samla ihop alla siffror." : "Step 2: Gather all numbers.", latex: `${b} + ${d} = ${b+d}` }
            ],
            metadata: { variation_key: 'combine_standard_mixed', difficulty: 2 }
        };
    }

    // --- LEVEL 2: Parentheses (Distribution) ---
    private level2_Parentheses(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['distribute_lie_partial', 'distribute_inverse_factor', 'distribute_plus', 'distribute_minus']);
        const a = MathUtils.randomInt(2, 5);
        const b = MathUtils.randomInt(2, 5);
        const c = MathUtils.randomInt(1, 6);
        const inOp = (v === 'distribute_minus') ? '-' : (v === 'distribute_plus' ? '+' : Math.random() > 0.5 ? '+' : '-');

        if (v === 'distribute_lie_partial') {
            const correct = `${a}(x ${inOp} ${c}) = ${a}x ${inOp} ${a*c}`;
            const lie = `${a}(x ${inOp} ${c}) = ${a}x ${inOp} ${c}`; 

            return {
                renderData: {
                    description: lang === 'sv' ? "Vilken av förenklingarna nedan är FELAKTIG?" : "Which of the simplifications below is INCORRECT?",
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([correct, lie, `${a}(x ${inOp} ${c}) = ${a} \cdot x ${inOp} ${a} \cdot ${c}`])
                },
                token: this.toBase64(lie),
                clues: [
                    { text: lang === 'sv' ? "Siffran utanför parentesen måste multipliceras med VARJE del inuti parentesen." : "The number outside the parentheses must be multiplied by EVERY part inside the parentheses." },
                    { text: lang === 'sv' ? `Man måste alltså även räkna ut ${a} gånger ${c}.` : `So you must also calculate ${a} times ${c}.`, latex: `${a} \\cdot ${c} = ${a*c}` }
                ],
                metadata: { variation_key: 'distribute_lie_partial', difficulty: 2 }
            };
        }

        const latex = `${a}(${b}x ${inOp} ${c})`;
        const ans = `${a*b}x ${inOp} ${a*c}`;

        return {
            renderData: {
                latex,
                description: lang === 'sv' ? "Förenkla uttrycket genom att multiplicera in siffran i parentesen." : "Simplify the expression by distributing the number into the parentheses.",
                answerType: 'text'
            },
            token: this.toBase64(ans),
            clues: [
                { text: lang === 'sv' ? `Multiplicera ${a} med båda termerna inuti parentesen.` : `Multiply ${a} with both terms inside the parentheses.`, latex: `${a} \\cdot ${b}x ${inOp} ${a} \\cdot ${c}` }
            ],
            metadata: { variation_key: v, difficulty: 2 }
        };
    }

    // --- LEVEL 3: Distribute & Combine ---
    private level3_DistributeAndSimplify(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['distribute_double', 'distribute_combine_std']);
        const a = MathUtils.randomInt(2, 4);
        const b = MathUtils.randomInt(2, 4);
        const c = MathUtils.randomInt(1, 5);
        const d = MathUtils.randomInt(2, 6);

        if (v === 'distribute_double') {
            const k1 = MathUtils.randomInt(2, 3);
            const k2 = MathUtils.randomInt(2, 3);
            const ans = `${k1+k2}x + ${k1*c + k2*d}`;

            return {
                renderData: {
                    latex: `${k1}(x + ${c}) + ${k2}(x + ${d})`,
                    description: lang === 'sv' ? "Förenkla uttrycket genom att först expandera båda parenteserna." : "Simplify the expression by first expanding both parentheses.",
                    answerType: 'text'
                },
                token: this.toBase64(ans),
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Multiplicera in i båda parenteserna." : "Step 1: Distribute into both parentheses.", latex: `${k1}x + ${k1*c} + ${k2}x + ${k2*d}` },
                    { text: lang === 'sv' ? "Steg 2: Samla ihop x-termer och siffror var för sig." : "Step 2: Collect x-terms and numbers separately." }
                ],
                metadata: { variation_key: 'distribute_double', difficulty: 4 }
            };
        }

        const ans = `${a*b + d}x + ${a*c}`;
        return {
            renderData: {
                latex: `${a}(${b}x + ${c}) + ${d}x`,
                description: lang === 'sv' ? "Expandera parentesen och förenkla sedan uttrycket." : "Expand the parentheses and then simplify the expression.",
                answerType: 'text'
            },
            token: this.toBase64(ans),
            clues: [
                { text: lang === 'sv' ? "Steg 1: Ta bort parentesen genom att multiplicera med " + a + "." : "Step 1: Remove parentheses by multiplying with " + a + ".", latex: `${a*b}x + ${a*c} + ${d}x` },
                { text: lang === 'sv' ? "Steg 2: Lägg ihop alla termer som har x i sig." : "Step 2: Add all terms that contain x together.", latex: `${a*b}x + ${d}x = ${a*b+d}x` }
            ],
            metadata: { variation_key: 'distribute_combine_std', difficulty: 3 }
        };
    }

    // --- LEVEL 4: Subtracting Parentheses ---
    private level4_SubtractParentheses(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['sub_concept_plus_logic', 'sub_block_plus', 'sub_block_minus']);
        const startX = MathUtils.randomInt(7, 15);
        const subX = MathUtils.randomInt(2, 5);
        const subK = MathUtils.randomInt(2, 8);
        const inOp = (v === 'sub_block_minus') ? '-' : (v === 'sub_block_plus' ? '+' : Math.random() > 0.5 ? '+' : '-');

        if (v === 'sub_concept_plus_logic') {
            const q = lang === 'sv' ? "Om det står ett PLUSTECKEN (+) framför en parentes, ändras tecknen inuti när du tar bort parentesen?" : "If there is a PLUS SIGN (+) in front of a pair of parentheses, do the signs inside change when you remove them?";
            const ans = lang === 'sv' ? "Nej, de förblir desamma" : "No, they stay the same";
            const wrong = lang === 'sv' ? "Ja, alla tecken ändras" : "Yes, all signs change";

            return {
                renderData: {
                    description: q,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([ans, wrong])
                },
                token: this.toBase64(ans),
                clues: [{ text: lang === 'sv' ? "Bara ett minustecken (-) framför parentesen tvingar oss att byta tecken på termerna inuti." : "Only a minus sign (-) in front of the parentheses forces us to change the signs of the terms inside." }],
                metadata: { variation_key: 'sub_concept_plus_logic', difficulty: 2 }
            };
        }

        const resX = startX - subX;
        const resOp = inOp === '+' ? '-' : '+';
        const ans = `${resX}x ${resOp} ${subK}`;

        return {
            renderData: {
                latex: `${startX}x - (${subX}x ${inOp} ${subK})`,
                description: lang === 'sv' ? "Förenkla uttrycket. Var extra noga med minustecknet framför parentesen!" : "Simplify the expression. Be extra careful with the minus sign in front of the parentheses!",
                answerType: 'text'
            },
            token: this.toBase64(ans),
            clues: [
                { text: lang === 'sv' ? `Eftersom det är minus framför parentesen ändras ${inOp} till ${resOp} när parentesen tas bort.` : `Since there is a minus in front of the parentheses, ${inOp} changes to ${resOp} when the parentheses are removed.`, latex: `${startX}x - ${subX}x ${resOp} ${subK}` },
                { text: lang === 'sv' ? "Förenkla nu x-termerna." : "Now simplify the x-terms.", latex: `${startX}x - ${subX}x = ${resX}x` }
            ],
            metadata: { variation_key: v, difficulty: 4 }
        };
    }

    // --- LEVEL 5: Word Problems ---
    private level5_WordProblems(lang: string, variationKey?: string): any {
        const scenarios = [
            'word_candy', 'word_discount', 'word_combined_age', 'word_combined_age_tri',
            'word_rect_perimeter', 'word_savings', 'word_passengers', 'word_garden',
            'word_sports', 'word_phone_battery'
        ];
        const v = variationKey || MathUtils.randomChoice(scenarios);

        const A = MathUtils.randomInt(2, 5);  
        const B = MathUtils.randomInt(10, 50); 
        const C = MathUtils.randomInt(2, 5);  

        let description = "";
        let answer = "";
        let steps = [];

        if (v === 'word_candy') {
            description = lang === 'sv' 
                ? `Du har ${A} påsar med godis där varje påse innehåller x bitar. Du köper sedan ${C} likadana påsar till, men äter upp ${B} stycken lösa godisar. Skriv ett förenklat uttryck för totalt antal godisar.` 
                : `You have ${A} bags of candy where each bag contains x pieces. You then buy ${C} more identical bags, but you eat ${B} loose candies. Write a simplified expression for the total number of candies.`;
            answer = `${A+C}x - ${B}`;
            steps = [
                { text: lang === 'sv' ? `Steg 1: Räkna ihop alla påsar med x bitar.` : `Step 1: Add up all the bags with x pieces.`, latex: `${A}x + ${C}x = ${A+C}x` },
                { text: lang === 'sv' ? `Steg 2: Dra ifrån de ${B} godisarna du åt upp.` : `Step 2: Subtract the ${B} candies you ate.`, latex: `${A+C}x - ${B}` }
            ];
        } 
        else if (v === 'word_discount') {
            description = lang === 'sv'
                ? `Du köper ${A} tröjor som kostar x kr styck. Du hittar även en jacka som kostar ${B} kr mer än en tröja. Skriv ett förenklat uttryck för din totala kostnad.`
                : `You buy ${A} shirts that cost x kr each. You also find a jacket that costs ${B} kr more than a shirt. Write a simplified expression for your total cost.`;
            answer = `${A+1}x + ${B}`;
            steps = [
                { text: lang === 'sv' ? `Tröjorna kostar ${A}x. Jackan kostar (x + ${B}).` : `The shirts cost ${A}x. The jacket costs (x + ${B}).`, latex: `${A}x + (x + ${B})` },
                { text: lang === 'sv' ? "Förenkla genom att lägga ihop alla x." : "Simplify by adding all x's together.", latex: `${A+1}x + ${B}` }
            ];
        }
        else if (v === 'word_combined_age_tri') {
            const diff = MathUtils.randomInt(2, 6);
            description = lang === 'sv'
                ? `Elias är x år. Hans syster är ${diff} år äldre än Elias, och deras pappa är tre gånger så gammal som Elias. Skriv ett förenklat uttryck för deras sammanlagda ålder.`
                : `Elias is x years old. His sister is ${diff} years older than Elias, and their father is three times as old as Elias. Write a simplified expression for their combined age.`;
            answer = `5x + ${diff}`;
            steps = [
                { text: lang === 'sv' ? `Elias: x. Syster: (x + ${diff}). Pappa: 3x.` : `Elias: x. Sister: (x + ${diff}). Father: 3x.`, latex: `x + (x + ${diff}) + 3x` },
                { text: lang === 'sv' ? "Addera alla x-termer: 1 + 1 + 3 = 5." : "Add all the x-terms: 1 + 1 + 3 = 5.", latex: `5x + ${diff}` }
            ];
        }
        else if (v === 'word_rect_perimeter') {
            const isShorter = Math.random() > 0.5;
            const diff = MathUtils.randomInt(2, 10);
            description = lang === 'sv'
                ? `En rektangel har bredden x cm. Längden är ${diff} cm ${isShorter ? 'kortare' : 'längre'} än bredden. Skriv ett förenklat uttryck för rektangelns omkrets.`
                : `A rectangle has a width of x cm. The length is ${diff} cm ${isShorter ? 'shorter' : 'longer'} than the width. Write a simplified expression for the rectangle's perimeter.`;
            answer = isShorter ? `4x - ${diff * 2}` : `4x + ${diff * 2}`;
            steps = [
                { text: lang === 'sv' ? "Omkretsen är summan av fyra sidor: två bredder (x) och två längder (x " + (isShorter ? '-' : '+') + " " + diff + ")." : "The perimeter is the sum of four sides: two widths (x) and two lengths (x " + (isShorter ? '-' : '+') + " " + diff + ").", latex: `2(x) + 2(x ${isShorter ? '-' : '+'} ${diff})` },
                { text: lang === 'sv' ? "Expandera och förenkla resultatet." : "Expand and simplify the result.", latex: `${answer}` }
            ];
        }
        else if (v === 'word_passengers') {
            const off = MathUtils.randomInt(5, 15);
            description = lang === 'sv'
                ? `En buss har x passagerare. Vid första hållplatsen går ${off} personer av. Vid nästa hållplats går ${A} gånger så många som ursprungligen var på bussen (x) på. Skriv ett uttryck för antalet passagerare nu.`
                : `A bus has x passengers. At the first stop, ${off} people get off. At the next stop, ${A} times as many people as were originally on the bus (x) get on. Write an expression for the number of passengers now.`;
            answer = `${A+1}x - ${off}`;
            steps = [
                { text: lang === 'sv' ? `Börja med x. Ta bort ${off} och lägg till ${A}x.` : `Start with x. Remove ${off} and add ${A}x.`, latex: `x - ${off} + ${A}x` },
                { text: lang === 'sv' ? "Kombinera x-termerna." : "Combine the x-terms.", latex: `${A+1}x - ${off}` }
            ];
        }
        else if (v === 'word_savings') {
            description = lang === 'sv'
                ? `Du har x kr på ett konto. Du tar ut ${B} kr för att fika. Senare sätter du in dubbelt så mycket som du hade från början (x). Skriv ett förenklat uttryck för ditt nya saldo.`
                : `You have x kr in an account. You withdraw ${B} kr for coffee. Later, you deposit twice as much as you originally had (x). Write a simplified expression for your new balance.`;
            answer = `3x - ${B}`;
            steps = [
                { text: lang === 'sv' ? `Saldo-förändring: x - ${B} + 2x.` : `Balance change: x - ${B} + 2x.`, latex: `3x - ${B}` }
            ];
        }
        else if (v === 'word_phone_battery') {
            const usage = MathUtils.randomInt(10, 30);
            description = lang === 'sv'
                ? `Din telefon har x% batteri. Du använder telefonen så att nivån sjunker med ${usage} procentenheter. Sedan laddar du den så att den ökar med ${A}x procentenheter. Skriv ett förenklat uttryck för batterinivån.`
                : `Your phone has x% battery. You use the phone so the level drops by ${usage} percentage points. Then you charge it so it increases by ${A}x percentage points. Write a simplified expression for the battery level.`;
            answer = `${A+1}x - ${usage}`;
            steps = [
                { text: lang === 'sv' ? `Starta med x, dra bort ${usage} och lägg till ${A}x.` : `Start with x, subtract ${usage}, and add ${A}x.`, latex: `x - ${usage} + ${A}x` }
            ];
        }
        else {
            // Default: word_garden
            const died = MathUtils.randomInt(3, 8);
            description = lang === 'sv'
                ? `I en trädgård finns x blommor. Tyvärr vissnar ${died} stycken bort. Sedan planterar du ${C} rader med x blommor i varje rad. Skriv ett förenklat uttryck för totalt antal blommor.`
                : `In a garden there are x flowers. Unfortunately, ${died} of them wither away. Then you plant ${C} rows with x flowers in each row. Write a simplified expression for the total number of flowers.`;
            answer = `${C+1}x - ${died}`;
            steps = [
                { text: lang === 'sv' ? `Börja med x. Dra bort ${died} och lägg till ${C}x blommor.` : `Start with x. Subtract ${died} and add ${C}x flowers.`, latex: `x - ${died} + ${C}x` }
            ];
        }

        return {
            renderData: {
                latex: "",
                description: description,
                answerType: 'text'
            },
            token: this.toBase64(answer),
            clues: steps,
            metadata: { variation_key: v, difficulty: 3 }
        };
    }

    private level6_Mixed(lang: string): any {
        const lvl = MathUtils.randomInt(1, 5);
        const data = this.generate(lvl, lang);
        data.metadata.mixed = true;
        return data;
    }
}