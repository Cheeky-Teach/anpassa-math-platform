import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { TERMS, t, Language } from "../utils/i18n";
import { TextEngine, ContextKey } from "../utils/textEngine";

interface Scenario {
    id: string;
    context: ContextKey;
    // Returns variables for the text, the answer, and the steps
    generateMath: (rng: Random, lang: Language) => { 
        variables: Record<string, string | number>; 
        answer: number; 
        steps: Clue[];
        solutionExpression: string;
    };
    templates: { sv: string; en: string }[];
}

export class LinearEquationProblemGen {
    public static generate(level: number, seed: string, lang: Language = 'sv'): GeneratedQuestion {
        const rng = new Random(seed);
        const color = "\\mathbf{\\color{#D35400}";

        // --- SCENARIO 1: NUMBER RIDDLES ---
        const numberRiddleScenario: Scenario = {
            id: 'number_riddle',
            context: 'school', 
            generateMath: (rng, lang) => {
                // Logic: (x * mul) + add = res
                const x = rng.intBetween(2, 12); 
                const mul = rng.intBetween(2, 5);
                const add = rng.intBetween(1, 10);
                const res = (x * mul) + add;

                const vars = {
                    mul: `$${mul}$`,
                    add: `$${add}$`,
                    res: `$${res}$`
                };

                const steps: Clue[] = [
                    { 
                        text: t(lang, {sv: "Ställ upp en ekvation. Låt talet vara x.", en: "Set up an equation. Let the number be x."}), 
                        latex: `${mul}x + ${add} = ${res}` 
                    },
                    { 
                        text: t(lang, TERMS.algebra.subtract(add)), 
                        latex: `${mul}x = ${res - add}` 
                    },
                    { 
                        text: t(lang, TERMS.algebra.divide(mul)), 
                        latex: `x = ${color}{${x}}}` 
                    }
                ];

                return { variables: vars, answer: x, steps, solutionExpression: `${mul}x + ${add} = ${res}` };
            },
            templates: [
                { 
                    sv: "Jag tänker på ett tal. Om jag multiplicerar det med {mul} och lägger till {add} får jag {res}. Vilket är talet?", 
                    en: "I'm thinking of a number. If I multiply it by {mul} and add {add}, I get {res}. What is the number?" 
                }
            ]
        };

        // --- SCENARIO 2: SHOPPING ---
        const shoppingScenario: Scenario = {
            id: 'shopping_basic',
            context: 'shopping',
            generateMath: (rng, lang) => {
                const count = rng.intBetween(2, 8); 
                const price = rng.intBetween(5, 15);
                const fixed = rng.intBetween(10, 50); 
                const total = (price * count) + fixed;

                const item = TextEngine.getRandomContextItem(rng, 'shopping', lang);
                
                const vars = {
                    item: item,
                    price: `$${price}$`,
                    fixed: `$${fixed}$`,
                    total: `$${total}$`
                };

                const steps: Clue[] = [
                    {
                        text: t(lang, {sv: `Låt $x$ vara antal ${item}.`, en: `Let $x$ be the number of ${item}.`}),
                        latex: `${price}x + ${fixed} = ${total}`
                    },
                    {
                        text: t(lang, TERMS.algebra.subtract(fixed)),
                        latex: `${price}x = ${total - fixed}`
                    },
                    {
                        text: t(lang, TERMS.algebra.divide(price)),
                        latex: `x = ${color}{${count}}}`
                    }
                ];

                return { variables: vars, answer: count, steps, solutionExpression: `${price}x + ${fixed} = ${total}` };
            },
            templates: [
                {
                    sv: "Du köper {item} som kostar {price} kr styck och en påse för {fixed} kr. Totalt betalar du {total} kr. Hur många {item} köpte du?",
                    en: "You buy {item} costing {price} kr each and a bag for {fixed} kr. In total you pay {total} kr. How many {item} did you buy?"
                }
            ]
        };

        // --- SCENARIO 3: COMPARISONS ---
        const comparisonScenario: Scenario = {
            id: 'comparison_two_people',
            context: 'hobbies',
            generateMath: (rng, lang) => {
                const x = rng.intBetween(5, 20); 
                const diff = rng.intBetween(2, 10);
                const total = 2 * x + diff;

                const item = TextEngine.getRandomContextItem(rng, 'hobbies', lang);
                const name1 = TextEngine.getRandomName(rng, 'hobbies');
                let name2 = TextEngine.getRandomName(rng, 'hobbies');
                while(name1 === name2) name2 = TextEngine.getRandomName(rng, 'hobbies');

                const vars = {
                    name1: name1,
                    name2: name2,
                    item: item,
                    diff: `$${diff}$`,
                    total: `$${total}$`
                };

                const step1Res = total - diff;

                const steps: Clue[] = [
                    {
                        text: t(lang, {sv: `Kalla ${name2}s antal för $x$. Då har ${name1} $x + ${diff}$.`, en: `Let ${name2}'s amount be $x$. Then ${name1} has $x + ${diff}$.`}),
                        latex: `x + (x + ${diff}) = ${total}`
                    },
                    {
                        text: t(lang, TERMS.simplification.group_terms),
                        latex: `2x + ${diff} = ${total}`
                    },
                    {
                        text: t(lang, TERMS.algebra.subtract(diff)),
                        latex: `2x = ${step1Res}`
                    },
                    {
                        text: t(lang, TERMS.algebra.divide(2)),
                        latex: `x = ${color}{${x}}}`
                    }
                ];

                return { variables: vars, answer: x, steps, solutionExpression: `2x + ${diff} = ${total}` };
            },
            templates: [
                {
                    sv: "{name1} har {diff} fler {item} än {name2}. Tillsammans har de {total} stycken. Hur många har {name2}?",
                    en: "{name1} has {diff} more {item} than {name2}. Together they have {total}. How many does {name2} have?"
                }
            ]
        };

        // Select scenario randomly since this IS Level 5 (Problem Solving)
        // We can add sub-levels later if needed, but for now "Problem Solving" encompasses all these types.
        const scenarios = [numberRiddleScenario, shoppingScenario, comparisonScenario];
        const scenario = rng.pick(scenarios);
        
        // Generate math
        const mathData = scenario.generateMath(rng, lang);
        
        // Pick a template and fill it
        const templateObj = rng.pick(scenario.templates);
        const rawTemplate = lang === 'sv' ? templateObj.sv : templateObj.en;
        const questionText = TextEngine.fillTemplate(rawTemplate, mathData.variables);

        return {
            questionId: `prob-l5-${seed}`,
            renderData: {
                text_key: "problem_solving",
                description: questionText,
                latex: "", 
                answerType: 'numeric',
                variables: {}
            },
            serverData: {
                answer: mathData.answer,
                solutionSteps: mathData.steps
            }
        };
    }
}