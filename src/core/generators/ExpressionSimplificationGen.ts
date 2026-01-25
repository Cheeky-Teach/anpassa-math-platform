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
        let description: string | { sv: string, en: string } = { sv: "", en: "" };

        // --- LEVEL 1: Combine like terms (addition) ---
        // 3x + 5x
        if (mode === 1) {
            const v = rng.pick(['x', 'y', 'a', 'b']);
            const c1 = rng.intBetween(2, 9);
            const c2 = rng.intBetween(2, 9);
            
            expr = `${c1}${v} + ${c2}${v}`;
            answer = `${c1+c2}${v}`;
            
            steps.push({
                text: t(lang, { sv: "Addera koefficienterna (siffrorna framför variabeln).", en: "Add the coefficients (numbers in front of the variable)." }),
                latex: `${c1} + ${c2} = ${c1+c2}`
            });
            steps.push({
                text: t(lang, { sv: "Svaret behåller variabeln.", en: "The answer keeps the variable." }),
                latex: formatColor(answer)
            });
        }

        // --- LEVEL 2: Parentheses (Distribution) ---
        // 3(2x + 4)
        else if (mode === 2) {
            const v = 'x';
            const outer = rng.intBetween(2, 5);
            const innerC = rng.intBetween(2, 5);
            const innerK = rng.intBetween(1, 5);
            
            expr = `${outer}(${innerC}${v} + ${innerK})`;
            const resC = outer * innerC;
            const resK = outer * innerK;
            answer = `${resC}${v} + ${resK}`; // e.g. 6x + 12

            steps.push({
                text: t(lang, { sv: "Multiplicera in talet utanför parentesen med båda termerna inuti.", en: "Multiply the number outside the parentheses with both terms inside." }),
                latex: `${outer} \\cdot ${innerC}${v} + ${outer} \\cdot ${innerK}`
            });
            steps.push({
                text: t(lang, { sv: "Beräkna produkterna.", en: "Calculate the products." }),
                latex: formatColor(answer)
            });
        }

        // --- LEVEL 3: Distribute & Combine ---
        // 2(3x + 1) + 4x
        else if (mode === 3) {
            const outer = rng.intBetween(2, 4);
            const inC = rng.intBetween(2, 4);
            const inK = rng.intBetween(1, 5);
            const extraX = rng.intBetween(2, 6);
            
            expr = `${outer}(${inC}x + ${inK}) + ${extraX}x`;
            
            const distX = outer * inC;
            const distK = outer * inK;
            const totalX = distX + extraX;
            
            answer = `${totalX}x + ${distK}`;
            
            steps.push({
                text: t(lang, { sv: "Börja med att multiplicera in i parentesen.", en: "Start by distributing into the parentheses." }),
                latex: `${distX}x + ${distK} + ${extraX}x`
            });
            steps.push({
                text: t(lang, { sv: "Lägg ihop x-termerna.", en: "Combine the x-terms." }),
                latex: `${distX}x + ${extraX}x = ${totalX}x`
            });
            steps.push({
                text: t(lang, { sv: "Sätt ihop allt.", en: "Put it all together." }),
                latex: formatColor(answer)
            });
        }

        // --- LEVEL 4: Subtracting Parentheses ---
        // 5x - (2x + 3)
        else if (mode === 4) {
            const startX = rng.intBetween(5, 10);
            const subX = rng.intBetween(1, startX - 1);
            const subK = rng.intBetween(1, 5);
            
            expr = `${startX}x - (${subX}x + ${subK})`;
            const resX = startX - subX;
            const resK = -subK; // Minus becomes negative
            
            answer = `${resX}x - ${Math.abs(resK)}`;
            
            steps.push({
                text: t(lang, { sv: "Minus framför en parentes ändrar tecken på allt inuti när vi tar bort parentesen.", en: "A minus in front of parentheses changes the sign of everything inside when removed." }),
                latex: `${startX}x - ${subX}x - ${subK}`
            });
            steps.push({
                text: t(lang, { sv: "Förenkla x-termerna.", en: "Simplify the x-terms." }),
                latex: `${startX}x - ${subX}x = ${resX}x`
            });
            steps.push({
                text: t(lang, { sv: "Resultat", en: "Result" }),
                latex: formatColor(answer)
            });
        }

        // --- LEVEL 5: Word Problems (Text) ---
        else if (mode === 5) {
            
            // Constants for the logic: Ax + Cx +/- B
            const A = rng.intBetween(2, 6);  // Variable group 1
            const B = rng.intBetween(5, 30); // Constant
            const C = rng.intBetween(2, 6);  // Variable group 2
            
            const totalX = A + C;

            // Define Scenarios with Subtraction (Loss/Cost) and Addition (Gain/Total)
            const scenarios = [
                // --- ADDITION SCENARIOS (ax + b) ---
                {
                    type: 'add',
                    sv: `Du har ${A} påsar med godis (x) och köper ${C} påsar till. Du har också ${B} lösa godisar.`,
                    en: `You have ${A} bags of candy (x) and buy ${C} more bags. You also have ${B} loose candies.`,
                    unitSv: "godisar", unitEn: "candies", varSv: "påsar", varEn: "bags",
                    explSv: "lösa godisar läggs till (+)", explEn: "loose candies are added (+)"
                },
                {
                    type: 'add',
                    sv: `Du sparar x kr i ${A} veckor och sedan i ${C} veckor till. Du får också ${B} kr i present.`,
                    en: `You save x kr for ${A} weeks and then for ${C} more weeks. You also get ${B} kr as a gift.`,
                    unitSv: "kr", unitEn: "kr", varSv: "veckor", varEn: "weeks",
                    explSv: "presenten läggs till sparandet (+)", explEn: "the gift adds to the savings (+)"
                },
                {
                    type: 'add',
                    sv: `Du bygger ett staket med ${A} sektioner av längden x och ${C} sektioner till. Du har också en grind på ${B} meter.`,
                    en: `You build a fence with ${A} sections of length x and ${C} more sections. You also have a gate of ${B} meters.`,
                    unitSv: "meter", unitEn: "meters", varSv: "sektioner", varEn: "sections",
                    explSv: "grinden lägger till längd (+)", explEn: "the gate adds length (+)"
                },
                // --- SUBTRACTION SCENARIOS (ax - b) ---
                {
                    type: 'sub',
                    sv: `Du köper ${A} tröjor och ${C} byxor som alla kostar x kr styck. Du har en rabattkupong på ${B} kr.`,
                    en: `You buy ${A} shirts and ${C} pants that all cost x kr each. You have a discount coupon for ${B} kr.`,
                    unitSv: "kr", unitEn: "kr", varSv: "plagg", varEn: "items",
                    explSv: "en rabatt dras bort från priset (-)", explEn: "a discount is subtracted from the price (-)"
                },
                {
                    type: 'sub',
                    sv: `Du plockar ${A} korgar med jordgubbar och din kompis plockar ${C} korgar (x liter per korg). Ni råkar spilla ut ${B} liter.`,
                    en: `You pick ${A} baskets of strawberries and your friend picks ${C} baskets (x liters per basket). You accidentally spill ${B} liters.`,
                    unitSv: "liter", unitEn: "liters", varSv: "korgar", varEn: "baskets",
                    explSv: "det utspillda dras bort (-)", explEn: "the spilled amount is subtracted (-)"
                },
                {
                    type: 'sub',
                    sv: `Du har sparat x kr i veckan i ${A} veckor plus ${C} veckor till. Sedan köper du en sak för ${B} kr.`,
                    en: `You saved x kr a week for ${A} weeks plus ${C} more weeks. Then you buy an item for ${B} kr.`,
                    unitSv: "kr", unitEn: "kr", varSv: "veckor", varEn: "weeks",
                    explSv: "kostnaden dras bort från sparandet (-)", explEn: "the cost is subtracted from savings (-)"
                },
                {
                    type: 'sub',
                    sv: `En snickare har ${A} långa plankor och ${C} korta plankor som alla är x meter långa. Han sågar bort totalt ${B} meter spillvirke.`,
                    en: `A carpenter has ${A} long boards and ${C} short boards that are all x meters long. He cuts off a total of ${B} meters waste.`,
                    unitSv: "meter", unitEn: "meters", varSv: "plankor", varEn: "boards",
                    explSv: "spillvirket dras bort (-)", explEn: "the waste is subtracted (-)"
                },
                {
                    type: 'sub',
                    sv: `Du prenumererar på en tjänst (x kr/mån) i ${A} månader åt dig själv och ${C} månader åt en vän. Du får ${B} kr i återbäring.`,
                    en: `You subscribe to a service (x kr/mo) for ${A} months for yourself and ${C} months for a friend. You get ${B} kr cash back.`,
                    unitSv: "kr", unitEn: "kr", varSv: "månader", varEn: "months",
                    explSv: "återbäringen minskar kostnaden (-)", explEn: "cash back reduces the cost (-)"
                }
            ];

            const s = rng.pick(scenarios);
            const isSub = s.type === 'sub';
            const operator = isSub ? "-" : "+";
            
            // Construct Answer: e.g. "8x - 20"
            answer = `${totalX}x ${operator} ${B}`;

            // Adjust the final question text based on type
            const totalTextSv = isSub ? "det som återstår/slutsumman" : "totalen";
            const totalTextEn = isSub ? "what remains/net total" : "the total";
            
            description = {
                sv: `${s.sv} Skriv ett uttryck för ${totalTextSv} och förenkla det.`,
                en: `${s.en} Write an expression for ${totalTextEn} and simplify it.`
            };
            
            // Pedagogical Steps (Explaining how to get each term)
            steps = [
                { 
                    text: t(lang, { 
                        sv: `Steg 1: Hitta x-termerna. Du har ${A} ${s.varSv} och ${C} ${s.varSv}. Det blir ${A}x + ${C}x.`, 
                        en: `Step 1: Find the x-terms. You have ${A} ${s.varEn} and ${C} ${s.varEn}. That makes ${A}x + ${C}x.` 
                    }), 
                    latex: `${A}x + ${C}x` 
                },
                { 
                    text: t(lang, { 
                        sv: `Steg 2: Hantera konstanten (${B} ${s.unitSv}). Eftersom ${s.explSv}, skriver vi ${operator} ${B}.`, 
                        en: `Step 2: Handle the constant (${B} ${s.unitEn}). Since ${s.explEn}, we write ${operator} ${B}.` 
                    }), 
                    latex: isSub ? `- ${B}` : `+ ${B}`
                },
                { 
                    text: t(lang, { 
                        sv: `Steg 3: Sätt ihop och förenkla. ${A}x plus ${C}x blir ${totalX}x.`, 
                        en: `Step 3: Combine and simplify. ${A}x plus ${C}x becomes ${totalX}x.` 
                    }), 
                    latex: `${totalX}x ${operator} ${B} = ${formatColor(answer)}` 
                }
            ];
            
            return {
                questionId: `simp-l${level}-${seed}`,
                renderData: {
                    text_key: "simplify_word",
                    description: description,
                    latex: "", 
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