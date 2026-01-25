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
            
            // Constants for the logic: Ax + B + Cx
            const A = rng.intBetween(2, 6);  // Variable group 1
            const B = rng.intBetween(2, 20); // Constant
            const C = rng.intBetween(2, 6);  // Variable group 2
            
            const totalX = A + C;
            answer = `${totalX}x + ${B}`;

            // Define Scenarios
            const scenarios = [
                {
                    id: 'candy',
                    sv: `Du har ${A} påsar med godis (x) och ${B} lösa godisar. Din kompis har ${C} påsar.`,
                    en: `You have ${A} bags of candy (x) and ${B} loose candies. Your friend has ${C} bags.`,
                    unitSv: "godisar", unitEn: "candies", varSv: "påse", varEn: "bag"
                },
                {
                    id: 'money_saving',
                    sv: `Du sparar x kr i veckan i ${A} veckor och får sedan ${B} kr i present. Sedan sparar du i ${C} veckor till.`,
                    en: `You save x kr per week for ${A} weeks, then get a ${B} kr gift. Then you save for ${C} more weeks.`,
                    unitSv: "kronor", unitEn: "kr", varSv: "vecka", varEn: "week"
                },
                {
                    id: 'running',
                    sv: `Du springer x km varje träningspass. Vecka 1 springer du ${A} pass. Vecka 2 springer du ${C} pass plus ett extra lopp på ${B} km.`,
                    en: `You run x km every session. Week 1 you run ${A} sessions. Week 2 you run ${C} sessions plus an extra ${B} km race.`,
                    unitSv: "km", unitEn: "km", varSv: "pass", varEn: "session"
                },
                {
                    id: 'apples',
                    sv: `En låda innehåller x äpplen. I butiken finns en hög med ${A} lådor och ${B} lösa äpplen, samt en annan hög med ${C} lådor.`,
                    en: `A box contains x apples. The shop has a pile of ${A} boxes and ${B} loose apples, and another pile of ${C} boxes.`,
                    unitSv: "äpplen", unitEn: "apples", varSv: "låda", varEn: "box"
                },
                {
                    id: 'subscription',
                    sv: `En streamingtjänst kostar x kr/månad. Du betalar för ${A} månader. Startavgiften är ${B} kr. Din vän betalar för ${C} månader.`,
                    en: `A streaming service costs x kr/month. You pay for ${A} months. The signup fee is ${B} kr. Your friend pays for ${C} months.`,
                    unitSv: "kr", unitEn: "kr", varSv: "månad", varEn: "month"
                },
                {
                    id: 'construction',
                    sv: `Du bygger ett staket. Du använder ${A} sektioner av längden x meter, en grind på ${B} meter, och sedan ${C} sektioner till.`,
                    en: `You build a fence. You use ${A} sections of length x meters, a gate of ${B} meters, and then ${C} more sections.`,
                    unitSv: "meter", unitEn: "meters", varSv: "sektion", varEn: "section"
                },
                {
                    id: 'points',
                    sv: `I ett spel får du x poäng per träff. Du får ${A} träffar i första rundan, ${B} bonuspoäng, och ${C} träffar i andra rundan.`,
                    en: `In a game you get x points per hit. You get ${A} hits in round 1, ${B} bonus points, and ${C} hits in round 2.`,
                    unitSv: "poäng", unitEn: "points", varSv: "träff", varEn: "hit"
                },
                {
                    id: 'weight',
                    sv: `En lastpall väger x kg. En lastbil lastar ${A} pallar plus en låda på ${B} kg. En annan lastbil lastar ${C} pallar.`,
                    en: `A pallet weighs x kg. A truck loads ${A} pallets plus a box of ${B} kg. Another truck loads ${C} pallets.`,
                    unitSv: "kg", unitEn: "kg", varSv: "pall", varEn: "pallet"
                },
                {
                    id: 'pencils',
                    sv: `En ask innehåller x pennor. Läraren köper ${A} askar till 7A, ${C} askar till 7B och har ${B} pennor sedan tidigare.`,
                    en: `A box contains x pencils. The teacher buys ${A} boxes for 7A, ${C} boxes for 7B and has ${B} pencils from before.`,
                    unitSv: "pennor", unitEn: "pencils", varSv: "ask", varEn: "box"
                },
                {
                    id: 'cards',
                    sv: `Ett paket samlarkort innehåller x kort. Du köper ${A} paket på måndagen, får ${B} kort av en vän, och köper ${C} paket på tisdagen.`,
                    en: `A booster pack contains x cards. You buy ${A} packs on Monday, get ${B} cards from a friend, and buy ${C} packs on Tuesday.`,
                    unitSv: "kort", unitEn: "cards", varSv: "paket", varEn: "pack"
                },
                {
                    id: 'baking',
                    sv: `Ett recept kräver x dl mjöl. Du bakar ${A} satser till festen och ${C} satser till familjen. Du spiller ut ${B} dl mjöl på golvet (räkna med det också).`,
                    en: `A recipe needs x dl flour. You bake ${A} batches for the party and ${C} batches for the family. You spill ${B} dl flour on the floor (count that too).`,
                    unitSv: "dl", unitEn: "dl", varSv: "sats", varEn: "batch"
                }
            ];

            const s = rng.pick(scenarios);

            description = {
                sv: `${s.sv} Skriv ett uttryck för totalen och förenkla det.`,
                en: `${s.en} Write an expression for the total and simplify it.`
            };
            
            steps = [
                { 
                    text: t(lang, { 
                        sv: `Variabeln x representerar varje ${s.varSv}. Det fasta värdet är ${s.unitSv}.`, 
                        en: `The variable x represents each ${s.varEn}. The fixed value is ${s.unitEn}.` 
                    }), 
                    latex: "" 
                },
                { 
                    text: t(lang, { sv: "Ställ upp uttrycket (x-termer + konstant).", en: "Set up the expression (x-terms + constant)." }), 
                    latex: `${A}x + ${C}x + ${B}` 
                },
                { 
                    text: t(lang, { sv: "Förenkla genom att addera x-termerna.", en: "Simplify by adding the x-terms." }), 
                    latex: formatColor(answer) 
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