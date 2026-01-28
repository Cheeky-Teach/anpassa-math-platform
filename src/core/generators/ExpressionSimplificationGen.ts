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
    // Legacy style: "3x + 5x"
    private level1_CombineTerms(lang: string): any {
        const v = MathUtils.randomChoice(['x', 'y', 'a', 'b']);
        const c1 = MathUtils.randomInt(2, 9);
        const c2 = MathUtils.randomInt(2, 9);
        
        const latex = `${c1}${v} + ${c2}${v}`;
        const answer = `${c1+c2}${v}`;

        return {
            renderData: { 
                latex, 
                description: lang === 'sv' ? "Förenkla uttrycket." : "Simplify the expression.", 
                answerType: 'text' 
            },
            token: Buffer.from(answer).toString('base64'),
            clues: [
                { 
                    text: lang === 'sv' ? "Addera koefficienterna (siffrorna framför variabeln)." : "Add the coefficients (numbers in front of the variable).", 
                    latex: `${c1} + ${c2} = ${c1+c2}` 
                },
                { 
                    text: lang === 'sv' ? "Svaret behåller variabeln." : "The answer keeps the variable.", 
                    latex: `\\mathbf{${answer}}` 
                }
            ]
        };
    }

    // --- LEVEL 2: Parentheses (Distribution) ---
    // Legacy style: "3(2x + 4)"
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
                    text: lang === 'sv' ? "Beräkna produkterna." : "Calculate the products." 
                }
            ]
        };
    }

    // --- LEVEL 3: Distribute & Combine ---
    // Legacy style: "2(3x + 1) + 4x"
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
                }
            ]
        };
    }

    // --- LEVEL 4: Subtracting Parentheses ---
    // Legacy style: "5x - (2x + 3)"
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
                    text: lang === 'sv' ? "Förenkla x-termerna." : "Simplify the x-terms." 
                }
            ]
        };
    }

    // --- LEVEL 5: Word Problems (Restored Legacy Scenarios) ---
    private level5_WordProblems(lang: string): any {
        const A = MathUtils.randomInt(2, 6);  // Var group 1
        const B = MathUtils.randomInt(5, 30); // Constant
        const C = MathUtils.randomInt(2, 6);  // Var group 2
        const totalX = A + C;

        const scenarios = [
            {
                type: 'add',
                sv: `Du har ${A} påsar med godis (x) och köper ${C} påsar till. Du har också ${B} lösa godisar.`,
                en: `You have ${A} bags of candy (x) and buy ${C} more bags. You also have ${B} loose candies.`,
                explSv: "lösa godisar läggs till (+)",
                operator: "+",
                unit: "godisar"
            },
            {
                type: 'sub',
                sv: `Du köper ${A} tröjor och ${C} byxor som alla kostar x kr styck. Du har en rabattkupong på ${B} kr.`,
                en: `You buy ${A} shirts and ${C} pants that all cost x kr each. You have a discount coupon for ${B} kr.`,
                explSv: "rabatten dras bort (-)",
                operator: "-",
                unit: "kr"
            }
        ];

        const s = MathUtils.randomChoice(scenarios);
        const answer = `${totalX}x ${s.operator} ${B}`;
        
        const description = lang === 'sv' 
            ? `${s.sv} Skriv ett uttryck för totalen och förenkla.` 
            : `${s.en} Write an expression for the total and simplify.`;

        return {
            renderData: { latex: "", description, answerType: 'text' },
            token: Buffer.from(answer).toString('base64'),
            clues: [
                { 
                    text: lang === 'sv' ? `Steg 1: Hitta x-termerna (${A}x + ${C}x).` : `Step 1: Find x-terms (${A}x + ${C}x).`,
                    latex: `${totalX}x`
                },
                { 
                    text: lang === 'sv' ? `Steg 2: Hantera konstanten (${B}). Eftersom det är ${s.explSv}, skriver vi ${s.operator} ${B}.` : `Step 2: Handle the constant (${B}). Since it's ${s.operator}, write ${s.operator} ${B}.` 
                }
            ]
        };
    }

    private level6_Mixed(lang: string): any {
        const lvl = MathUtils.randomInt(1, 4);
        return this.generate(lvl, lang);
    }
}