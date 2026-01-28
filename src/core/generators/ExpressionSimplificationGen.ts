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

    // --- LEVEL 1: Combine Like Terms ---
    private level1_CombineTerms(lang: string): any {
        // Subtypes:
        // 1. ax + bx (Simple)
        // 2. ax + b + cx (Interleaved constant)
        // 3. ax + b + cx + d (Full mix)
        // 4. a - bx + cx + d (Negative start var, or const first)

        const subType = MathUtils.randomInt(1, 4);
        const v = 'x'; // Keep it simple for lower levels
        let latex = "";
        let answer = "";
        let clues: any[] = [];
        let desc = lang === 'sv' ? "Förenkla uttrycket." : "Simplify the expression.";

        if (subType === 1) {
            // ax + bx
            const c1 = MathUtils.randomInt(2, 9);
            const c2 = MathUtils.randomInt(2, 9);
            latex = `${c1}${v} + ${c2}${v}`;
            answer = `${c1+c2}${v}`;
            clues.push({ 
                text: lang === 'sv' ? "Addera koefficienterna (siffrorna framför x)." : "Add the coefficients.",
                latex: `${c1} + ${c2} = ${c1+c2}`
            });
            clues.push({
                text: lang === 'sv' ? "Svaret behåller variabeln." : "Keep the variable.",
                latex: `\\mathbf{${answer}}`
            });
        } 
        else if (subType === 2) {
            // ax + b + cx
            const c1 = MathUtils.randomInt(2, 9);
            const k1 = MathUtils.randomInt(2, 9);
            const c2 = MathUtils.randomInt(2, 9);
            
            // Random order: ax + b + cx OR b + ax + cx
            if (Math.random() > 0.5) latex = `${c1}${v} + ${k1} + ${c2}${v}`;
            else latex = `${k1} + ${c1}${v} + ${c2}${v}`;

            answer = `${c1+c2}${v} + ${k1}`;
            
            clues.push({
                text: lang === 'sv' ? "Hitta termerna med x och lägg ihop dem." : "Find the x-terms and add them.",
                latex: `${c1}${v} + ${c2}${v} = ${c1+c2}${v}`
            });
            clues.push({
                text: lang === 'sv' ? "Konstanten (siffran utan x) är kvar." : "The constant remains.",
                latex: `+ ${k1}`
            });
            clues.push({
                text: lang === 'sv' ? "Sätt ihop uttrycket." : "Combine them.",
                latex: `\\mathbf{${answer}}`
            });
        }
        else if (subType === 3) {
            // ax + b + cx + d
            const c1 = MathUtils.randomInt(2, 6);
            const k1 = MathUtils.randomInt(2, 9);
            const c2 = MathUtils.randomInt(2, 6);
            const k2 = MathUtils.randomInt(2, 9);

            latex = `${c1}${v} + ${k1} + ${c2}${v} + ${k2}`;
            answer = `${c1+c2}${v} + ${k1+k2}`;

            clues.push({
                text: lang === 'sv' ? "Steg 1: Addera x-termerna." : "Step 1: Add the x-terms.",
                latex: `${c1}${v} + ${c2}${v} = ${c1+c2}${v}`
            });
            clues.push({
                text: lang === 'sv' ? "Steg 2: Addera siffrorna (konstanterna)." : "Step 2: Add the constants.",
                latex: `${k1} + ${k2} = ${k1+k2}`
            });
            clues.push({
                text: lang === 'sv' ? "Resultat:" : "Result:",
                latex: `\\mathbf{${answer}}`
            });
        }
        else {
            // a - bx + cx + d (Negative handling)
            // Ensure result x is positive for simplicity in L1
            const k1 = MathUtils.randomInt(5, 15);
            const c_neg = MathUtils.randomInt(2, 5); // -bx
            const c_pos = c_neg + MathUtils.randomInt(1, 5); // cx, ensuring sum > 0
            const k2 = MathUtils.randomInt(2, 9);

            latex = `${k1} - ${c_neg}${v} + ${c_pos}${v} + ${k2}`;
            // (c_pos - c_neg)x + (k1 + k2)
            answer = `${c_pos - c_neg}${v} + ${k1+k2}`;

            clues.push({
                text: lang === 'sv' ? "Steg 1: Hantera x-termerna. Tänk på minustecknet." : "Step 1: Handle x-terms. Mind the minus sign.",
                latex: `-${c_neg}${v} + ${c_pos}${v} = ${c_pos - c_neg}${v}`
            });
            clues.push({
                text: lang === 'sv' ? "Steg 2: Addera siffrorna." : "Step 2: Add the numbers.",
                latex: `${k1} + ${k2} = ${k1+k2}`
            });
            clues.push({
                text: lang === 'sv' ? "Sätt ihop delarna." : "Combine parts.",
                latex: `\\mathbf{${answer}}`
            });
        }

        return {
            renderData: { latex, description: desc, answerType: 'text' },
            token: Buffer.from(answer).toString('base64'),
            clues: clues
        };
    }

    // --- LEVEL 2: Parentheses (Distribution) ---
    private level2_Parentheses(lang: string): any {
        const v = 'x';
        const outer = MathUtils.randomInt(2, 5);
        const innerC = MathUtils.randomInt(2, 5);
        const innerK = MathUtils.randomInt(1, 5);
        
        const latex = `${outer}(${innerC}${v} + ${innerK})`;
        const resC = outer * innerC;
        const resK = outer * innerK;
        const answer = `${resC}${v} + ${resK}`;

        return {
            renderData: { latex, description: lang === 'sv' ? "Förenkla uttrycket." : "Simplify the expression.", answerType: 'text' },
            token: Buffer.from(answer).toString('base64'),
            clues: [
                { 
                    text: lang === 'sv' ? "Multiplicera talet utanför med BÅDA termerna inuti." : "Multiply the number outside with BOTH terms inside.", 
                    latex: `${outer} \\cdot ${innerC}${v} + ${outer} \\cdot ${innerK}` 
                },
                { 
                    text: lang === 'sv' ? "Beräkna produkterna." : "Calculate the products.", 
                    latex: `\\mathbf{${answer}}`
                }
            ]
        };
    }

    // --- LEVEL 3: Distribute & Combine ---
    private level3_DistributeAndSimplify(lang: string): any {
        const outer = MathUtils.randomInt(2, 4);
        const inC = MathUtils.randomInt(2, 4);
        const inK = MathUtils.randomInt(1, 5);
        const extraX = MathUtils.randomInt(2, 6);
        
        const latex = `${outer}(${inC}x + ${inK}) + ${extraX}x`;
        
        const distX = outer * inC;
        const distK = outer * inK;
        const totalX = distX + extraX;
        
        const answer = `${totalX}x + ${distK}`;

        return {
            renderData: { latex, description: lang === 'sv' ? "Förenkla uttrycket." : "Simplify the expression.", answerType: 'text' },
            token: Buffer.from(answer).toString('base64'),
            clues: [
                { 
                    text: lang === 'sv' ? "Börja med att ta bort parentesen." : "Start by removing the parentheses.", 
                    latex: `${distX}x + ${distK} + ${extraX}x` 
                },
                { 
                    text: lang === 'sv' ? "Lägg ihop x-termerna." : "Combine the x-terms.", 
                    latex: `${distX}x + ${extraX}x = ${totalX}x` 
                },
                {
                    text: lang === 'sv' ? "Resultat:" : "Result:",
                    latex: `\\mathbf{${answer}}`
                }
            ]
        };
    }

    // --- LEVEL 4: Subtracting Parentheses ---
    private level4_SubtractParentheses(lang: string): any {
        const startX = MathUtils.randomInt(5, 10);
        const subX = MathUtils.randomInt(1, startX - 1);
        const subK = MathUtils.randomInt(1, 5);
        
        const latex = `${startX}x - (${subX}x + ${subK})`;
        const resX = startX - subX;
        const resK = -subK; 
        
        const answer = `${resX}x - ${Math.abs(resK)}`;

        return {
            renderData: { latex, description: lang === 'sv' ? "Förenkla uttrycket." : "Simplify the expression.", answerType: 'text' },
            token: Buffer.from(answer).toString('base64'),
            clues: [
                { 
                    text: lang === 'sv' ? "Minus framför en parentes ändrar tecken på allt inuti." : "A minus in front of parentheses changes the sign of everything inside.", 
                    latex: `${startX}x - ${subX}x - ${subK}` 
                },
                { 
                    text: lang === 'sv' ? "Förenkla x-termerna." : "Simplify the x-terms.",
                    latex: `${startX}x - ${subX}x = ${resX}x`
                },
                {
                    text: lang === 'sv' ? "Resultat:" : "Result:",
                    latex: `\\mathbf{${answer}}`
                }
            ]
        };
    }

    // --- LEVEL 5: Word Problems ---
    private level5_WordProblems(lang: string): any {
        const A = MathUtils.randomInt(2, 6);  
        const B = MathUtils.randomInt(5, 30); 
        const C = MathUtils.randomInt(2, 6);  
        
        const scenarios = [
            {
                type: 'add',
                sv: `Du har ${A} påsar med godis (x) och köper ${C} påsar till. Du har också ${B} lösa godisar.`,
                en: `You have ${A} bags of candy (x) and buy ${C} more bags. You also have ${B} loose candies.`,
                op: '+', expl: '+'
            },
            {
                type: 'sub',
                sv: `Du köper ${A} tröjor och ${C} byxor som alla kostar x kr styck. Du har en rabattkupong på ${B} kr.`,
                en: `You buy ${A} shirts and ${C} pants that all cost x kr each. You have a discount coupon for ${B} kr.`,
                op: '-', expl: '-'
            },
            {
                type: 'add',
                sv: `Du betalar x kr/månad i ${A} månader, sen ${C} månader till. Startavgiften var ${B} kr.`,
                en: `You pay x kr/mo for ${A} months, then ${C} months. Start fee was ${B} kr.`,
                op: '+', expl: '+'
            },
            {
                type: 'add',
                sv: `En triangel har sidorna x, ${A}x och ${C}x. Plus en extra sträcka på ${B} cm.`,
                en: `A triangle has sides x, ${A}x, and ${C}x. Plus an extra length of ${B} cm.`,
                op: '+', expl: '+'
            },
            {
                type: 'sub',
                sv: `Du sparar x kr i ${A} veckor och ${C} veckor. Sen köper du något för ${B} kr.`,
                en: `You save x kr for ${A} weeks and ${C} weeks. Then you spend ${B} kr.`,
                op: '-', expl: '-'
            },
            {
                type: 'add',
                sv: `Ett lag köper x biljetter till ${A} spelare och ${C} ledare. Bokningsavgiften är ${B} kr.`,
                en: `A team buys x tickets for ${A} players and ${C} coaches. Booking fee is ${B} kr.`,
                op: '+', expl: '+'
            },
            {
                type: 'sub',
                sv: `En lastbil lastar ${A} lådor och ${C} paket (vikt x). Man lastar av ${B} kg skräp.`,
                en: `A truck loads ${A} boxes and ${C} packages (weight x). Unloads ${B} kg trash.`,
                op: '-', expl: '-'
            },
            {
                type: 'add',
                sv: `I ett spel får du x poäng i runda 1. Runda 2 ger ${A} gånger mer, runda 3 ger ${C} gånger mer. Bonus ${B} poäng.`,
                en: `Game: x points round 1. Round 2 is ${A}x, Round 3 is ${C}x. Bonus ${B} points.`,
                op: '+', expl: '+'
            }
        ];

        const s = MathUtils.randomChoice(scenarios);
        const totalX = A + C; // Simplified logic assuming 1x is implied or adjusted in prompt if A/C not 1
        // Note: Scenarios assume "A bags" means "Ax", "C bags" means "Cx". 
        // If A or C represents "times more", logic holds.
        
        const answer = `${totalX}x ${s.op} ${B}`;
        
        const desc = lang === 'sv' 
            ? `${s.sv} Skriv ett uttryck för totalen och förenkla.` 
            : `${s.en} Write an expression for the total and simplify.`;

        return {
            renderData: { latex: "", description: desc, answerType: 'text' },
            token: Buffer.from(answer).toString('base64'),
            clues: [
                { 
                    text: lang === 'sv' ? `1. Hitta x-termerna: ${A}x + ${C}x.` : `1. Find x-terms: ${A}x + ${C}x.`,
                    latex: `${totalX}x`
                },
                { 
                    text: lang === 'sv' ? `2. Lägg till konstanten (${B}).` : `2. Add the constant (${B}).`, 
                    latex: `${totalX}x ${s.op} ${B}` 
                }
            ]
        };
    }

    private level6_Mixed(lang: string): any {
        const lvl = MathUtils.randomInt(1, 4);
        return this.generate(lvl, lang);
    }
}