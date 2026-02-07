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

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    // --- LEVEL 1: Combine Like Terms ---
    private level1_CombineTerms(lang: string): any {
        const variation = Math.random();

        // Variation A: Spot the Lie (The x^2 Trap)
        if (variation < 0.3) {
            const a = MathUtils.randomInt(2, 6);
            const b = MathUtils.randomInt(2, 6);
            const sum = a + b;
            
            const sTrue = `${a}x + ${b}x = ${sum}x`;
            const sLie = `${a}x + ${b}x = ${sum}x^2`; 
            const sTrue2 = `${a}x + x = ${a+1}x`;

            const options = [sTrue, sLie, sTrue2];
            const q = lang === 'sv' ? "Vilket påstående är FEL?" : "Which statement is WRONG?";

            return {
                renderData: {
                    description: q,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle(options)
                },
                token: this.toBase64(sLie),
                clues: [
                    { text: lang === 'sv' ? "När vi adderar termer ändras inte variabeln. Det är som att addera äpplen." : "When adding terms, the variable doesn't change. It's like adding apples.", latex: "3x + 2x = 5x" },
                    { text: lang === 'sv' ? "Variabeln blir bara x^2 vid multiplikation (x * x)." : "The variable only becomes x^2 during multiplication (x * x).", latex: "" }
                ],
                metadata: { variation: 'combine_lie_exponent', difficulty: 2 }
            };
        }

        // Variation B: Concept Check
        if (variation < 0.5) {
            const a = MathUtils.randomInt(2, 9);
            const q = lang === 'sv' ? `Vilken term kan kombineras med ${a}x?` : `Which term can be combined with ${a}x?`;
            const correct = `${MathUtils.randomInt(2, 9)}x`;
            const wrong1 = `${MathUtils.randomInt(2, 9)}y`;
            const wrong2 = `${MathUtils.randomInt(2, 9)}`;

            return {
                renderData: {
                    description: q,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([correct, wrong1, wrong2])
                },
                token: this.toBase64(correct),
                clues: [{ text: lang === 'sv' ? "Man kan bara lägga ihop termer som har exakt samma variabel." : "You can only combine terms that have the exact same variable." }],
                metadata: { variation: 'combine_concept_id', difficulty: 1 }
            };
        }

        // Variation C: Standard Multi-term
        const a = MathUtils.randomInt(2, 8);
        const b = MathUtils.randomInt(2, 12);
        const c = MathUtils.randomInt(2, 8);
        const d = MathUtils.randomInt(2, 12);
        
        const latex = `${a}x + ${b} + ${c}x + ${d}`;
        const ans = `${a + c}x + ${b + d}`;

        return {
            renderData: {
                latex,
                description: lang === 'sv' ? "Förenkla uttrycket genom att kombinera likadana termer." : "Simplify by combining like terms.",
                answerType: 'text'
            },
            token: this.toBase64(ans),
            clues: [
                { text: lang === 'sv' ? "Steg 1: Samla alla x-termer." : "Step 1: Collect all x-terms.", latex: `${a}x + ${c}x = ${a+c}x` },
                { text: lang === 'sv' ? "Steg 2: Samla alla siffror (konstanter)." : "Step 2: Collect all numbers (constants).", latex: `${b} + ${d} = ${b+d}` },
                { text: lang === 'sv' ? "Resultat:" : "Result:", latex: `\\mathbf{${ans}}` }
            ],
            metadata: { variation: 'combine_standard_mixed', difficulty: 2 }
        };
    }

    // --- LEVEL 2: Parentheses (Distribution) ---
    private level2_Parentheses(lang: string): any {
        const variation = Math.random();
        const a = MathUtils.randomInt(2, 5);
        const b = MathUtils.randomInt(2, 5);
        const c = MathUtils.randomInt(1, 6);
        const inOp = Math.random() > 0.5 ? '+' : '-';

        // Variation A: Spot the Lie (Standard error check)
        if (variation < 0.3) {
            const correct = `${a}(x ${inOp} ${c}) = ${a}x ${inOp} ${a*c}`;
            const lie = `${a}(x ${inOp} ${c}) = ${a}x ${inOp} ${c}`; 
            const options = [correct, lie, `${a}(x ${inOp} ${c}) = ${a}(x) ${inOp} ${a}(${c})`];

            return {
                renderData: {
                    description: lang === 'sv' ? "Vilken förenkling är FELAKTIG?" : "Which simplification is INCORRECT?",
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle(options)
                },
                token: this.toBase64(lie),
                clues: [
                    { text: lang === 'sv' ? "Talet utanför parentesen måste multipliceras med ALLA termer inuti." : "The number outside the parentheses must be multiplied by ALL terms inside." },
                    { text: lang === 'sv' ? `Här glömdes multiplikationen ${a} · ${c}.` : `The multiplication ${a} · ${c} was forgotten here.`, latex: `${a} \\cdot ${c} = ${a*c}` }
                ],
                metadata: { variation: 'distribute_lie_partial', difficulty: 2 }
            };
        }

        // Variation B: Inverse Factor
        if (variation < 0.5) {
            const targetC = a * b;
            const targetK = a * c;
            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket tal saknas utanför parentesen?" : "What number is missing outside the parentheses?",
                    latex: `?(${b}x ${inOp} ${c}) = ${targetC}x ${inOp} ${targetK}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(a.toString()),
                clues: [
                    { text: lang === 'sv' ? `Dela ${targetC} med ${b} för att hitta faktorn utanför.` : `Divide ${targetC} by ${b} to find the factor outside.`, latex: `${targetC} / ${b} = ${a}` }
                ],
                metadata: { variation: 'distribute_inverse_factor', difficulty: 3 }
            };
        }

        // Variation C: Standard Distribution (Now includes Subtraction inside)
        const latex = `${a}(${b}x ${inOp} ${c})`;
        const ans = `${a*b}x ${inOp} ${a*c}`;

        return {
            renderData: {
                latex,
                description: lang === 'sv' ? "Multiplicera in i parentesen." : "Multiply into the parentheses.",
                answerType: 'text'
            },
            token: this.toBase64(ans),
            clues: [
                { text: lang === 'sv' ? `Multiplicera ${a} med båda termerna. Behåll tecknet ${inOp} mellan dem.` : `Multiply ${a} with both terms. Keep the ${inOp} sign between them.`, latex: `${a} \\cdot ${b}x ${inOp} ${a} \\cdot ${c}` },
                { text: lang === 'sv' ? "Beräkna resultaten." : "Calculate results.", latex: `\\mathbf{${ans}}` }
            ],
            metadata: { variation: inOp === '+' ? 'distribute_plus' : 'distribute_minus', difficulty: 2 }
        };
    }

    // --- LEVEL 3: Distribute & Combine ---
    private level3_DistributeAndSimplify(lang: string): any {
        const variation = Math.random();
        const a = MathUtils.randomInt(2, 4);
        const b = MathUtils.randomInt(2, 4);
        const c = MathUtils.randomInt(1, 5);
        const d = MathUtils.randomInt(2, 6);
        const inOp = Math.random() > 0.5 ? '+' : '-';

        // Variation A: Double Distribution
        if (variation < 0.4) {
            const k1 = MathUtils.randomInt(2, 3);
            const k2 = MathUtils.randomInt(2, 3);
            const latex = `${k1}(x + 2) + ${k2}(x + 3)`;
            const ans = `${k1+k2}x + ${k1*2 + k2*3}`;

            return {
                renderData: {
                    latex,
                    description: lang === 'sv' ? "Förenkla uttrycket med två parenteser." : "Simplify the expression with two parentheses.",
                    answerType: 'text'
                },
                token: this.toBase64(ans),
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Expandera båda parenteserna först." : "Step 1: Expand both parentheses first.", latex: `${k1}x + ${k1*2} + ${k2}x + ${k2*3}` },
                    { text: lang === 'sv' ? "Steg 2: Samla ihop x-termer och siffror." : "Step 2: Combine x-terms and constants." }
                ],
                metadata: { variation: 'distribute_double', difficulty: 4 }
            };
        }

        // Variation B: Standard Distribute + Extra Term
        const latex = `${a}(${b}x ${inOp} ${c}) + ${d}x`;
        // (a*b + d)x [inOp] (a*c)
        const ans = `${a*b + d}x ${inOp} ${a*c}`;

        return {
            renderData: {
                latex,
                description: lang === 'sv' ? "Expandera och förenkla." : "Expand and simplify.",
                answerType: 'text'
            },
            token: this.toBase64(ans),
            clues: [
                { text: lang === 'sv' ? "Steg 1: Ta bort parentesen genom multiplikation." : "Step 1: Remove parentheses through multiplication.", latex: `${a*b}x ${inOp} ${a*c} + ${d}x` },
                { text: lang === 'sv' ? "Steg 2: Lägg ihop x-termerna." : "Step 2: Combine the x-terms.", latex: `${a*b}x + ${d}x = ${a*b+d}x` }
            ],
            metadata: { variation: 'distribute_combine_std', difficulty: 3 }
        };
    }

    // --- LEVEL 4: Subtracting Parentheses ---
    private level4_SubtractParentheses(lang: string): any {
        const variation = Math.random();
        const startX = MathUtils.randomInt(7, 15);
        const subX = MathUtils.randomInt(2, 5);
        const subK = MathUtils.randomInt(2, 8);
        const inOp = Math.random() > 0.5 ? '+' : '-';

        // Variation A: New Conceptual Check (Plus vs Minus in front)
        if (variation < 0.1) {
            const q = lang === 'sv' 
                ? "Om det står ett PLUSTECKEN (+) framför en parentes, ändras tecknen inuti när du tar bort den?" 
                : "If there is a PLUS SIGN (+) in front of parentheses, do the signs inside change when you remove them?";
            const ans = lang === 'sv' ? "Nej, de förblir desamma" : "No, they stay the same";
            const wrong = lang === 'sv' ? "Ja, alla tecken ändras" : "Yes, all signs change";

            return {
                renderData: {
                    description: q,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([ans, wrong])
                },
                token: this.toBase64(ans),
                clues: [
                    { text: lang === 'sv' ? "Bara minustecken framför parentesen 'vänder' på tecknen inuti." : "Only a minus sign in front of parentheses 'flips' the signs inside.", latex: "x + (y - z) = x + y - z" }
                ],
                metadata: { variation: 'sub_concept_plus_logic', difficulty: 2 }
            };
        }

        // Variation B: Standard Subtraction (Now with Minus inside option)
        const latex = `${startX}x - (${subX}x ${inOp} ${subK})`;
        // If inOp is '+', result is -subK. If inOp is '-', result is +subK.
        const resX = startX - subX;
        const resOp = inOp === '+' ? '-' : '+';
        const ans = `${resX}x ${resOp} ${subK}`;

        return {
            renderData: {
                latex,
                description: lang === 'sv' ? "Förenkla uttrycket. Var extra noga med tecknen!" : "Simplify the expression. Be extra careful with the signs!",
                answerType: 'text'
            },
            token: this.toBase64(ans),
            clues: [
                { 
                    text: lang === 'sv' 
                        ? `Steg 1: Ta bort parentesen. Eftersom det är minus framför, ändras ${inOp} till ${resOp}.` 
                        : `Step 1: Remove parentheses. Since there is a minus in front, ${inOp} changes to ${resOp}.`, 
                    latex: `${startX}x - ${subX}x ${resOp} ${subK}` 
                },
                { 
                    text: lang === 'sv' ? "Steg 2: Förenkla x-termerna." : "Step 2: Simplify the x-terms.", 
                    latex: `${startX}x - ${subX}x = ${resX}x` 
                },
                { text: lang === 'sv' ? "Slutresultat:" : "Final Result:", latex: `\\mathbf{${ans}}` }
            ],
            metadata: { variation: inOp === '+' ? 'sub_block_plus' : 'sub_block_minus', difficulty: 4 }
        };
    }

    // --- LEVEL 5: Word Problems ---
    private level5_WordProblems(lang: string): any {
        const A = MathUtils.randomInt(2, 6);  
        const B = MathUtils.randomInt(5, 30); 
        const C = MathUtils.randomInt(2, 6);  
        
        const scenarios = [
            {
                id: 'candy',
                sv: `Du har ${A} påsar med godis (x) och köper ${C} påsar till. Du har också ${B} lösa godisar.`,
                en: `You have ${A} bags of candy (x) and buy ${C} more bags. You also have ${B} loose candies.`,
                op: '+', metadata: 'word_candy'
            },
            {
                id: 'clothing',
                sv: `Du köper ${A} tröjor och ${C} byxor som alla kostar x kr styck. Du har en rabatt på ${B} kr.`,
                en: `You buy ${A} shirts and ${C} pants that all cost x kr each. You have a discount of ${B} kr.`,
                op: '-', metadata: 'word_discount'
            }
        ];

        const s = MathUtils.randomChoice(scenarios);
        const totalX = A + C;
        const answer = `${totalX}x ${s.op} ${B}`;

        return {
            renderData: {
                latex: "",
                description: lang === 'sv' ? `${s.sv} Skriv ett uttryck och förenkla.` : `${s.en} Write an expression and simplify.`,
                answerType: 'text'
            },
            token: this.toBase64(answer),
            clues: [
                { text: lang === 'sv' ? `1. Identifiera x-termerna: ${A}x och ${C}x.` : `1. Identify x-terms: ${A}x and ${C}x.`, latex: `${A}x + ${C}x = ${totalX}x` },
                { text: lang === 'sv' ? `2. Lägg till den fasta siffran (${B}) med rätt tecken.` : `2. Add the constant (${B}) with the correct sign.`, latex: `${totalX}x ${s.op} ${B}` }
            ],
            metadata: { variation: s.metadata, difficulty: 3 }
        };
    }

    private level6_Mixed(lang: string): any {
        const lvl = MathUtils.randomInt(1, 5);
        const data = this.generate(lvl, lang);
        data.metadata.mixed = true;
        return data;
    }
}