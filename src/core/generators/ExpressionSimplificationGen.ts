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
            const options = [sTrue, sLie, `${a}x + x = ${a+1}x`];

            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket av följande påståenden är FALSKT?" : "Which of the following statements is FALSE?",
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle(options)
                },
                token: this.toBase64(sLie),
                clues: [
                    { 
                        text: lang === 'sv' ? "När vi lägger ihop termer av samma sort ändras bara antalet (koefficienten), inte själva sorten (exponenten)." : "When we add terms of the same kind, only the count (coefficient) changes, not the kind itself (exponent).", 
                        latex: `${a}x + ${b}x = ${sum}x` 
                    },
                    {
                        text: lang === 'sv' ? "Därför är detta påstående felaktigt:" : "Therefore, this statement is incorrect:",
                        latex: sLie
                    }
                ],
                metadata: { variation_key: 'combine_lie_exponent', difficulty: 2 }
            };
        }

        if (v === 'combine_concept_id') {
            const a = MathUtils.randomInt(2, 9);
            const correct = `${MathUtils.randomInt(2, 9)}x`;
            return {
                renderData: {
                    description: lang === 'sv' ? `Vilken term kan förenklas ihop med ${a}x?` : `Which term can be simplified with ${a}x?`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([correct, "5y", "7"])
                },
                token: this.toBase64(correct),
                clues: [
                    { text: lang === 'sv' ? "Man kan bara förenkla termer som har exakt samma variabel." : "You can only simplify terms that have the exact same variable." },
                    { text: lang === 'sv' ? "Rätt svar är:" : "The correct answer is:", latex: correct }
                ],
                metadata: { variation_key: 'combine_concept_id', difficulty: 1 }
            };
        }

        const a = MathUtils.randomInt(2, 8), b = MathUtils.randomInt(2, 12), c = MathUtils.randomInt(2, 8), d = MathUtils.randomInt(2, 12);
        const ans = `${a + c}x + ${b + d}`;

        return {
            renderData: {
                latex: `${a}x + ${b} + ${c}x + ${d}`,
                description: lang === 'sv' ? "Förenkla uttrycket genom att samla termer av samma slag." : "Simplify the expression by gathering like terms.",
                answerType: 'text'
            },
            token: this.toBase64(ans),
            clues: [
                { text: lang === 'sv' ? "Börja med att samla x-termerna för sig." : "Start by gathering the x-terms together.", latex: `${a}x + ${c}x = ${a+c}x \\\\ ${a+c}x + ${b} + ${d}` },
                { text: lang === 'sv' ? "Samla sedan siffertermerna för sig." : "Then gather the constant terms together.", latex: `${b} + ${d} = ${b+d} \\\\ ${a+c}x + ${b+d}` },
                { text: lang === 'sv' ? "Det färdigförenklade uttrycket är:" : "The fully simplified expression is:", latex: ans }
            ],
            metadata: { variation_key: 'combine_standard_mixed', difficulty: 2 }
        };
    }

    // --- LEVEL 2: Parentheses (Addition Rule) ---
    private level2_Parentheses(lang: string, variationKey?: string): any {
        const scenario = MathUtils.randomInt(1, 5);
        const a = MathUtils.randomInt(2, 9), b = MathUtils.randomInt(2, 9), c = MathUtils.randomInt(1, 12), d = MathUtils.randomInt(1, 12);
        
        let problemLatex = "", finalAnswer = "", step1Latex = "", groupingXText = "", groupingXVal = "", groupingNumText = "", groupingNumVal = "";
        let reducedAfterX = "", reducedAfterNum = "";

        const ruleText = lang === 'sv' 
            ? "Eftersom det står plus (+) framför parentesen kan den tas bort utan att ändra tecken inuti." 
            : "Since there is a plus (+) in front of the parentheses, they can be removed without changing signs.";

        switch (scenario) {
            case 1: // ax + (bx + c)
                problemLatex = `${a}x + (${b}x + ${c})`;
                step1Latex = `${a}x + ${b}x + ${c}`;
                groupingXText = lang === 'sv' ? "Kombinera x-termerna." : "Combine the x-terms.";
                groupingXVal = `${a}x + ${b}x = ${a+b}x`;
                reducedAfterX = `${a+b}x + ${c}`;
                finalAnswer = reducedAfterX;
                break;
            case 2: // ax + (x - c)
                problemLatex = `${a}x + (x - ${c})`;
                step1Latex = `${a}x + x - ${c}`;
                groupingXText = lang === 'sv' ? "Kombinera x-termerna (x är samma sak som 1x)." : "Combine the x-terms (x is the same as 1x).";
                groupingXVal = `${a}x + 1x = ${a+1}x`;
                reducedAfterX = `${a+1}x - ${c}`;
                finalAnswer = reducedAfterX;
                break;
            case 3: // a + (bx + c) - d
                problemLatex = `${a} + (${b}x + ${c}) - ${d}`;
                step1Latex = `${a} + ${b}x + ${c} - ${d}`;
                groupingNumText = lang === 'sv' ? "Slå ihop siffertermerna." : "Combine the constant terms.";
                const res3 = a + c - d;
                groupingNumVal = `${a} + ${c} - ${d} = ${res3}`;
                reducedAfterNum = `${b}x ${res3 >= 0 ? '+' : ''} ${res3}`;
                finalAnswer = reducedAfterNum;
                break;
            case 4: // a + bx + (x - c) + d
                problemLatex = `${a} + ${b}x + (x - ${c}) + ${d}`;
                step1Latex = `${a} + ${b}x + x - ${c} + ${d}`;
                groupingXText = lang === 'sv' ? "Slå ihop x-termerna." : "Combine the x-terms.";
                groupingXVal = `${b}x + 1x = ${b+1}x`;
                reducedAfterX = `${a} + ${b+1}x - ${c} + ${d}`;
                const res4 = a - c + d;
                groupingNumText = lang === 'sv' ? "Slå ihop siffertermerna." : "Combine the constant terms.";
                groupingNumVal = `${a} - ${c} + ${d} = ${res4}`;
                reducedAfterNum = `${b+1}x ${res4 >= 0 ? '+' : ''} ${res4}`;
                finalAnswer = reducedAfterNum;
                break;
            default: // ax + (b + cx) + dx
                problemLatex = `${a}x + (${b} + ${c}x) + ${d}x`;
                step1Latex = `${a}x + ${b} + ${c}x + ${d}x`;
                groupingXText = lang === 'sv' ? "Kombinera alla x-termer." : "Combine all the x-terms.";
                groupingXVal = `${a}x + ${c}x + ${d}x = ${a+c+d}x`;
                reducedAfterX = `${a+c+d}x + ${b}`;
                finalAnswer = reducedAfterX;
                break;
        }

        const clues = [{ text: ruleText, latex: `${problemLatex} \\\\ ${step1Latex}` }];
        if (groupingXText) clues.push({ text: groupingXText, latex: `${groupingXVal} \\\\ ${reducedAfterX}` });
        if (groupingNumText) clues.push({ text: groupingNumText, latex: `${groupingNumVal} \\\\ ${reducedAfterNum}` });
        clues.push({ text: lang === 'sv' ? "Svaret blir:" : "The answer is:", latex: finalAnswer });

        return {
            renderData: { latex: problemLatex, description: lang === 'sv' ? "Förenkla uttrycket." : "Simplify the expression.", answerType: 'text' },
            token: this.toBase64(finalAnswer.replace(/\s/g, "")),
            clues,
            metadata: { variation_key: 'distribute_plus', difficulty: 2 }
        };
    }

    // --- LEVEL 3: Distribute & Combine ---
    private level3_DistributeAndSimplify(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['distribute_double', 'distribute_combine_std']);

        if (v === 'distribute_double') {
            const k1 = MathUtils.randomInt(2, 4), k2 = MathUtils.randomInt(2, 4), c1 = MathUtils.randomInt(1, 5), c2 = MathUtils.randomInt(1, 5);
            const expanded = `${k1}x + ${k1 * c1} + ${k2}x + ${k2 * c2}`;
            const final = `${k1 + k2}x + ${k1 * c1 + k2 * c2}`;

            return {
                renderData: { latex: `${k1}(x + ${c1}) + ${k2}(x + ${c2})`, description: lang === 'sv' ? "Förenkla uttrycket." : "Simplify the expression.", answerType: 'text' },
                token: this.toBase64(final.replace(/\s/g, "")),
                clues: [
                    { 
                        text: lang === 'sv' ? "Multiplicera in talet utanför i varje term inuti parenteserna." : "Multiply the number outside into every term inside the parentheses.", 
                        latex: `${k1}(x + ${c1}) + ${k2}(x + ${c2}) \\\\ ${expanded}` 
                    },
                    { 
                        text: lang === 'sv' ? "Samla x-termer och siffertermer var för sig." : "Gather x-terms and constant terms separately.", 
                        latex: `${k1}x + ${k2}x = ${k1+k2}x, \\; ${k1*c1} + ${k2*c2} = ${k1*c1+k2*c2} \\\\ ${final}` 
                    },
                    { text: lang === 'sv' ? "Det förenklade uttrycket är:" : "The simplified expression is:", latex: final }
                ],
                metadata: { variation_key: 'distribute_double', difficulty: 4 }
            };
        }

        const a = MathUtils.randomInt(2, 5), b = MathUtils.randomInt(2, 4), c = MathUtils.randomInt(2, 6), d = MathUtils.randomInt(2, 8);
        const final = `${a*b + d}x + ${a*c}`;
        return {
            renderData: { latex: `${a}(${b}x + ${c}) + ${d}x`, description: lang === 'sv' ? "Expandera parentesen och förenkla." : "Expand the parentheses and simplify.", answerType: 'text' },
            token: this.toBase64(final.replace(/\s/g, "")),
            clues: [
                { 
                    text: lang === 'sv' ? `Använd distributiva lagen: Multiplicera in ${a} i parentesen.` : `Use the distributive law: Multiply ${a} into the parentheses.`, 
                    latex: `${a}(${b}x + ${c}) \\\\ ${a*b}x + ${a*c} \\\\ ${a*b}x + ${a*c} + ${d}x` 
                },
                { 
                    text: lang === 'sv' ? "Kombinera nu de termer som är av samma slag." : "Now combine the terms that are of the same kind.", 
                    latex: `${a*b}x + ${d}x = ${a*b+d}x \\\\ ${final}` 
                },
                { text: lang === 'sv' ? "Resultatet blir:" : "The result is:", latex: final }
            ],
            metadata: { variation_key: 'distribute_combine_std', difficulty: 3 }
        };
    }

    // --- LEVEL 4: Subtracting Parentheses ---
    private level4_SubtractParentheses(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['sub_concept_plus_logic', 'sub_block_plus', 'sub_block_minus']);
        const startX = MathUtils.randomInt(8, 20), subX = MathUtils.randomInt(2, 6), subK = MathUtils.randomInt(2, 10);
        const inOp = (v === 'sub_block_minus') ? '-' : (v === 'sub_block_plus' ? '+' : Math.random() > 0.5 ? '+' : '-');
        const resOp = inOp === '+' ? '-' : '+';

        if (v === 'sub_concept_plus_logic') {
            const ans = lang === 'sv' ? "Alla tecken inuti parentesen ändras" : "All signs inside the parentheses change";
            return {
                renderData: {
                    description: lang === 'sv' ? "Vad händer med tecknen inuti en parentes om det står minus (-) framför?" : "What happens to signs inside parentheses if there is a minus (-) in front?",
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([ans, lang === 'sv' ? "Inga tecken ändras" : "No signs change"])
                },
                token: this.toBase64(ans),
                clues: [
                    { text: lang === 'sv' ? "Minus framför en parentes betyder att vi subtraherar hela innehållet. Det motsvarar att multiplicera med -1." : "Minus in front of a parenthesis means we subtract the whole content. It corresponds to multiplying by -1." },
                    { text: lang === 'sv' ? "Svaret är därför:" : "The answer is therefore:", latex: `\\text{${ans}}` }
                ],
                metadata: { variation_key: 'sub_concept_plus_logic', difficulty: 2 }
            };
        }

        const final = `${startX - subX}x ${resOp} ${subK}`;
        return {
            renderData: { latex: `${startX}x - (${subX}x ${inOp} ${subK})`, description: lang === 'sv' ? "Förenkla uttrycket." : "Simplify the expression.", answerType: 'text' },
            token: this.toBase64(final.replace(/\s/g, "")),
            clues: [
                { 
                    text: lang === 'sv' ? `Ta bort parentesen och byt tecken på alla termer inuti: ${inOp} blir ${resOp}.` : `Remove the parentheses and flip the sign of all terms inside: ${inOp} becomes ${resOp}.`, 
                    latex: `${startX}x - (${subX}x ${inOp} ${subK}) \\\\ ${startX}x - ${subX}x ${resOp} ${subK}` 
                },
                { 
                    text: lang === 'sv' ? "Kombinera nu x-termerna för att slutföra förenklingen." : "Now combine the x-terms to complete the simplification.", 
                    latex: `${startX}x - ${subX}x = ${startX - subX}x \\\\ ${final}` 
                },
                { text: lang === 'sv' ? "Färdigt uttryck:" : "Final expression:", latex: final }
            ],
            metadata: { variation_key: v, difficulty: 4 }
        };
    }

    // --- LEVEL 5: Word Problems ---
    private level5_WordProblems(lang: string, variationKey?: string): any {
        const scenarios = ['word_candy', 'word_discount', 'word_combined_age_tri', 'word_rect_perimeter', 'word_passengers', 'word_savings', 'word_phone_battery', 'word_garden'];
        const v = variationKey || MathUtils.randomChoice(scenarios);
        const A = MathUtils.randomInt(2, 5), B = MathUtils.randomInt(10, 50), C = MathUtils.randomInt(2, 5);

        let desc = "", ans = "", steps = [];

        if (v === 'word_candy') {
            desc = lang === 'sv' ? `Du har ${A} påsar med x godisar. Du köper ${C} likadana påsar till, men äter upp ${B} stycken. Skriv ett förenklat uttryck.` : `You have ${A} bags with x candies. You buy ${C} more, but eat ${B}. Write a simplified expression.`;
            ans = `${A+C}x - ${B}`;
            steps = [
                { text: lang === 'sv' ? "Ställ upp uttrycket baserat på texten." : "Set up the expression based on the text.", latex: `${A}x + ${C}x - ${B}` },
                { text: lang === 'sv' ? "Slå ihop påsarna (x-termerna)." : "Combine the bags (x-terms).", latex: `${A}x + ${C}x = ${A+C}x \\\\ ${ans}` },
                { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: ans }
            ];
        } else if (v === 'word_combined_age_tri') {
            const diff = MathUtils.randomInt(2, 6);
            desc = lang === 'sv' ? `Elias är x år. Syster är ${diff} år äldre. Pappa är 3 gånger så gammal som Elias. Uttryck deras sammanlagda ålder.` : `Elias is x. Sister is ${diff} years older. Father is 3x Elias's age. Express total age.`;
            ans = `5x + ${diff}`;
            steps = [
                { text: lang === 'sv' ? "Skapa uttryck för varje person: x, (x + ${diff}) och 3x." : "Create expressions for each person: x, (x + ${diff}), and 3x.", latex: `x + (x + ${diff}) + 3x` },
                { text: lang === 'sv' ? "Kombinera x-termerna: 1x + 1x + 3x = 5x." : "Combine the x-terms: 1x + 1x + 3x = 5x.", latex: `5x + ${diff}` },
                { text: lang === 'sv' ? "Svaret blir:" : "The answer is:", latex: ans }
            ];
        } else {
            // Generic Fallback for other scenarios to ensure pedagogical consistency
            desc = lang === 'sv' ? `x passagerare på en buss. ${B} går av, sedan stiger ${A}x på. Uttryck antalet passagerare nu.` : `x passengers. ${B} leave, then ${A}x board. Express the count.`;
            ans = `${A+1}x - ${B}`;
            steps = [
                { text: lang === 'sv' ? "Skriv uttrycket steg för steg: x - ${B} + ${A}x." : "Write the expression step by step: x - ${B} + ${A}x.", latex: `x - ${B} + ${A}x` },
                { text: lang === 'sv' ? "Samla variablerna för att förenkla." : "Gather the variables to simplify.", latex: `x + ${A}x = ${A+1}x \\\\ ${ans}` },
                { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: ans }
            ];
        }

        return {
            renderData: { latex: "", description: desc, answerType: 'text' },
            token: this.toBase64(ans.replace(/\s/g, "")),
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