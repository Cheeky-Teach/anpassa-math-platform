import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { t, Language } from "../utils/i18n";

export class ExpressionSimplificationGen {
    public static generate(level: number, seed: string, lang: Language = 'sv', multiplier: number = 1): GeneratedQuestion {
        const rng = new Random(seed);
        const formatColor = (val: string | number) => `\\textcolor{#D35400}{\\mathbf{${val}}}`;

        let mode = level;
        if (level === 6) mode = rng.intBetween(1, 5); // Mixed level

        let expr = "";
        let steps: Clue[] = [];
        let answer = "";
        let description = { sv: "Förenkla uttrycket så långt som möjligt.", en: "Simplify the expression as much as possible." };

        // Helper to format terms with signs correctly
        // e.g., (3, 'x') -> "+ 3x", (-3, 'x') -> "- 3x"
        const termStr = (val: number, variable: string = '', isFirst: boolean = false): string => {
            if (val === 0) return "";
            const abs = Math.abs(val);
            const sign = val < 0 ? "-" : (isFirst ? "" : "+");
            const valStr = (abs === 1 && variable) ? "" : abs.toString(); // Don't show '1' in '1x'
            return `${sign} ${valStr}${variable}`.trim();
        };

        // --- LEVEL 1: Combine Like Terms (ax + b + cx + d) ---
        if (mode === 1) {
            const a = rng.intBetween(2, 9);
            const b = rng.intBetween(1, 9);
            const c = rng.intBetween(-8, 8); // Can be negative
            const d = rng.intBetween(-8, 8);

            if (c === 0) return ExpressionSimplificationGen.generate(level, seed + "r", lang, multiplier);
            
            // Raw: 3x + 5 - 2x + 4
            expr = `${termStr(a, 'x', true)} ${termStr(b)} ${termStr(c, 'x')} ${termStr(d)}`;
            
            // Logic
            const finalX = a + c;
            const finalNum = b + d;
            answer = `${termStr(finalX, 'x', true)} ${termStr(finalNum)}`;

            // Step 1: Group visually (The fix requested)
            // Instead of (3-2)x, we show 3x - 2x + 5 + 4
            const groupLatex = `${termStr(a, 'x', true)} ${termStr(c, 'x')} ${termStr(b)} ${termStr(d)}`;
            
            steps = [
                { 
                    text: { 
                        sv: "Samla alla x-termer för sig och alla vanliga tal för sig. Kom ihåg att tecknet framför talet (plus eller minus) alltid följer med!", 
                        en: "Collect all x-terms together and all numbers together. Remember that the sign in front of the number (plus or minus) always moves with it!" 
                    }, 
                    latex: groupLatex 
                },
                { 
                    text: { 
                        sv: `Räkna ut delarna: $${a}x ${c < 0 ? '-' : '+'} ${Math.abs(c)}x$ blir $${finalX}x$, och $${b} ${d < 0 ? '-' : '+'} ${Math.abs(d)}$ blir $${finalNum}$.`, 
                        en: `Calculate the parts: $${a}x ${c < 0 ? '-' : '+'} ${Math.abs(c)}x$ becomes $${finalX}x$, and $${b} ${d < 0 ? '-' : '+'} ${Math.abs(d)}$ becomes $${finalNum}$.` 
                    }, 
                    latex: formatColor(answer) 
                }
            ];
        }

        // --- LEVEL 2: Parentheses a(x + b) ---
        else if (mode === 2) {
            const a = rng.intBetween(2, 9);
            const b = rng.intBetween(1, 9);
            const isSub = rng.bool(); // + or - inside

            expr = `${a}(x ${isSub ? '-' : '+'} ${b})`;
            
            const term1 = `${a}x`;
            const val2 = isSub ? (a * -b) : (a * b);
            answer = `${term1} ${termStr(val2)}`;

            steps = [
                { 
                    text: { 
                        sv: `Multiplicera in $${a}$ i parentesen. $${a} \\cdot x$ och $${a} \\cdot ${isSub ? -b : b}$.`, 
                        en: `Multiply $${a}$ into the parentheses. $${a} \\cdot x$ and $${a} \\cdot ${isSub ? -b : b}$.` 
                    }, 
                    latex: `${a} \\cdot x ${val2 < 0 ? '-' : '+'} ${a} \\cdot ${Math.abs(b)}` 
                },
                { 
                    text: { sv: "Förenkla multiplikationerna.", en: "Simplify the multiplications." }, 
                    latex: formatColor(answer) 
                }
            ];
        }

        // --- LEVEL 3: Distribute & Simplify a(x + b) + cx ---
        else if (mode === 3) {
            const a = rng.intBetween(2, 5);
            const b = rng.intBetween(1, 5);
            const c = rng.intBetween(2, 6);
            
            // a(x + b) + cx
            expr = `${a}(x + ${b}) + ${c}x`;
            
            const distB = a * b;
            const finalX = a + c;

            answer = `${finalX}x + ${distB}`;

            steps = [
                { 
                    text: { sv: "Börja med att multiplicera in i parentesen.", en: "Start by multiplying into the parentheses." }, 
                    latex: `${a}x + ${distB} + ${c}x` 
                },
                { 
                    text: { sv: "Samla x-termerna. Talen står kvar.", en: "Collect the x-terms. The numbers stay." }, 
                    latex: `${a}x + ${c}x + ${distB}` // Visual grouping
                },
                { 
                    text: { sv: "Lägg ihop x-termerna.", en: "Add the x-terms together." }, 
                    latex: formatColor(answer) 
                }
            ];
        }

        // --- LEVEL 4: Subtracting Parentheses a(x+b) - c(x-d) ---
        else if (mode === 4) {
            // This is the specific requested change
            const a = rng.intBetween(2, 5);
            const b = rng.intBetween(1, 5);
            const c = rng.intBetween(2, 4); // Keep numbers reasonable
            const d = rng.intBetween(1, 5);
            
            // a(x + b) - c(x - d)
            // Minus before second parenthesis is key concept here
            expr = `${a}(x + ${b}) - ${c}(x - ${d})`;

            // Step 1 Expansion values
            // 1st part: ax + ab
            const val1 = a * b;
            // 2nd part: -cx + cd (because -c * -d is positive)
            const val2 = -c * d; // This is the raw result of c*d, but we have -c.
            // Wait, logic check: -c * (x - d) -> -cx + cd
            const termX2 = -c;
            const termNum2 = (-c) * (-d); // Positive

            const finalX = a - c;
            const finalNum = val1 + termNum2;

            answer = `${termStr(finalX, 'x', true)} ${termStr(finalNum)}`;

            steps = [
                { 
                    text: { 
                        sv: "Multiplicera in. Var noga med minustecknet framför den andra parentesen! $-" + c + " \\cdot -" + d + "$ blir plus.", 
                        en: "Multiply in. Be careful with the minus sign before the second parenthesis! $-" + c + " \\cdot -" + d + "$ becomes positive." 
                    }, 
                    // Expansion: ax + ab - cx + cd
                    latex: `${a}x + ${val1} - ${c}x + ${termNum2}` 
                },
                { 
                    text: { 
                        sv: "Samla x-termer och vanliga tal. Flytta med tecknen framför varje term.", 
                        en: "Collect x-terms and numbers. Move the signs in front of each term with them." 
                    }, 
                    // Visual Grouping: ax - cx + ab + cd
                    latex: `${a}x - ${c}x + ${val1} + ${termNum2}` 
                },
                { 
                    text: { 
                        sv: `Räkna ut: $${a}x - ${c}x$ är $${finalX}x$. $${val1} + ${termNum2}$ är $${finalNum}$.`, 
                        en: `Calculate: $${a}x - ${c}x$ is $${finalX}x$. $${val1} + ${termNum2}$ is $${finalNum}$.` 
                    }, 
                    latex: formatColor(answer) 
                }
            ];
        }

        // --- LEVEL 5: Word Problems ---
        else if (mode === 5) {
            // Simple logic: "I have 3 bags with x apples and 2 loose ones. My friend has 2 bags..."
            const myBags = rng.intBetween(2, 5);
            const myLoose = rng.intBetween(1, 10);
            const friendBags = rng.intBetween(1, 3);
            
            description = {
                sv: `Du har ${myBags} påsar med godis (x) och ${myLoose} lösa godisar. Din kompis har ${friendBags} påsar. Skriv ett uttryck för hur mycket ni har tillsammans och förenkla det.`,
                en: `You have ${myBags} bags of candy (x) and ${myLoose} loose candies. Your friend has ${friendBags} bags. Write an expression for how much you have together and simplify it.`
            };
            
            expr = "Textuppgift (se ovan)"; // Not used for calculation, just identifier if needed
            
            // (Ax + B) + Cx
            const totalX = myBags + friendBags;
            answer = `${totalX}x + ${myLoose}`;
            
            steps = [
                { 
                    text: { sv: "Skriv uttrycket. Påsarna är x.", en: "Write the expression. The bags are x." }, 
                    latex: `${myBags}x + ${myLoose} + ${friendBags}x` 
                },
                { 
                    text: { sv: "Lägg ihop alla x (påsar) för sig.", en: "Add all x (bags) together." }, 
                    latex: `${myBags}x + ${friendBags}x + ${myLoose}` 
                },
                { 
                    text: { sv: "Resultat", en: "Result" }, 
                    latex: formatColor(answer) 
                }
            ];
            
            // Override renderData latex to be empty so user relies on text
            return {
                questionId: `simp-l${level}-${seed}`,
                renderData: {
                    text_key: "simplify_word",
                    description: description,
                    latex: "", // No latex prompt
                    answerType: "text",
                    variables: {}
                },
                serverData: {
                    answer: answer,
                    solutionSteps: steps
                }
            };
        }

        return {
            questionId: `simp-l${level}-${seed}`,
            renderData: {
                text_key: "simplify",
                description: description,
                latex: expr,
                answerType: "text",
                variables: {}
            },
            serverData: {
                answer: answer,
                solutionSteps: steps
            }
        };
    }
}