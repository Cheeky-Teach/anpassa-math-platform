import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { TERMS, t, Language } from "../utils/i18n";
import { TextEngine, ContextKey } from "../utils/textEngine";

interface Scenario {
    id: string;
    context: ContextKey;
    generateMath: (rng: Random, lang: Language) => { 
        variables: Record<string, string | number>; 
        answer: number; 
        steps: Clue[];
    };
    templates: { sv: string; en: string }[];
}

export class LinearEquationProblemGen {
    public static generate(level: number, seed: string, lang: Language = 'sv'): GeneratedQuestion {
        const rng = new Random(seed);
        // Fixed LaTeX color syntax
        const color = "\\mathbf{\\textcolor{#D35400}}";

        // --- SCENARIO 1: NUMBER RIDDLES ---
        const numberRiddleScenario: Scenario = {
            id: 'number_riddle',
            context: 'school', 
            generateMath: (rng, lang) => {
                const x = rng.intBetween(2, 12); 
                const mul = rng.intBetween(2, 5);
                const add = rng.intBetween(1, 10);
                const res = (x * mul) + add;

                const vars = {
                    mul: `$${mul}$`,
                    add: `$${add}$`,
                    res: `$${res}$`
                };
                
                const eq = `${mul}x + ${add} = ${res}`;
                const steps = [
                    { text: t(lang, {sv: "Skriv ekvationen", en: "Write the equation"}), latex: eq },
                    { text: t(lang, TERMS.algebra.subtract(add)), latex: `${mul}x = ${res} - ${add} = ${res-add}` },
                    { text: t(lang, TERMS.algebra.divide(mul)), latex: `x = ${color}{${x}}` }
                ];

                return { variables: vars, answer: x, steps };
            },
            templates: [
                { 
                    sv: "Om jag tänker på ett tal, multiplicerar det med {mul} och lägger till {add}, får jag {res}. Vilket är talet?",
                    en: "If I think of a number, multiply it by {mul} and add {add}, I get {res}. What is the number?" 
                }
            ]
        };

        // --- SCENARIO 2: SHOPPING (Fixed Cost + Variable Cost) ---
        const shoppingScenario: Scenario = {
            id: 'shopping',
            context: 'shopping',
            generateMath: (rng, lang) => {
                const count = rng.intBetween(3, 8); // x
                const price = rng.intBetween(5, 15); // price per item
                const bag = rng.pick([2, 3, 4, 5]); // fixed cost
                const total = (count * price) + bag;

                const vars = {
                    price: `${price}`,
                    bag: `${bag}`,
                    total: `${total}`,
                    item: t(lang, {sv: "saker", en: "items"}) // Placeholder, TextEngine usually handles items
                };

                const eq = `${price}x + ${bag} = ${total}`;
                const steps = [
                    { text: t(lang, {sv: "Ekvation (Pris · Antal + Påse = Totalt)", en: "Equation (Price · Count + Bag = Total)"}), latex: eq },
                    { text: t(lang, TERMS.algebra.subtract(bag)), latex: `${price}x = ${total} - ${bag} = ${total-bag}` },
                    { text: t(lang, TERMS.algebra.divide(price)), latex: `x = ${color}{${count}}` }
                ];

                return { variables: vars, answer: count, steps };
            },
            templates: [
                {
                    sv: "Du köper några {item} som kostar {price} kr styck och en påse för {bag} kr. Totalt betalar du {total} kr. Hur många {item} köpte du?",
                    en: "You buy some {item} costing {price} kr each and a bag for {bag} kr. In total you pay {total} kr. How many {item} did you buy?"
                }
            ]
        };

        // --- SCENARIO 3: TAXI (Start fee + km fee) ---
        const taxiScenario: Scenario = {
            id: 'taxi',
            context: 'shopping',
            generateMath: (rng, lang) => {
                const km = rng.intBetween(5, 25); // x
                const startFee = rng.pick([45, 50, 75]);
                const perKm = rng.pick([10, 15, 20]);
                const total = startFee + (perKm * km);

                const vars = { startFee: `${startFee}`, perKm: `${perKm}`, total: `${total}` };
                
                const eq = `${startFee} + ${perKm}x = ${total}`;
                const steps = [
                    { text: "Equation", latex: eq },
                    { text: "Subtract start fee", latex: `${perKm}x = ${total - startFee}` },
                    { text: "Divide by km cost", latex: `x = ${color}{${km}}` }
                ];

                return { variables: vars, answer: km, steps };
            },
            templates: [
                {
                    sv: "En taxiresa har en startavgift på {startFee} kr plus {perKm} kr per km. En resa kostade totalt {total} kr. Hur många km var resan?",
                    en: "A taxi ride has a start fee of {startFee} kr plus {perKm} kr per km. A trip cost {total} kr in total. How many km was the trip?"
                }
            ]
        };

        // --- SCENARIO 4: CONSECUTIVE NUMBERS ---
        const consecutiveScenario: Scenario = {
            id: 'consecutive',
            context: 'school',
            generateMath: (rng, lang) => {
                const start = rng.intBetween(5, 20); // x
                // Sum of 3 consecutive numbers: x + (x+1) + (x+2) = 3x + 3
                const sum = start + (start + 1) + (start + 2);
                
                const vars = { sum: `${sum}` };
                const eq = `x + (x+1) + (x+2) = ${sum}`;
                const simplified = `3x + 3 = ${sum}`;
                
                const steps = [
                    { text: t(lang, {sv: "Summan av x, x+1, x+2", en: "Sum of x, x+1, x+2"}), latex: eq },
                    { text: "Simplify", latex: simplified },
                    { text: "Solve", latex: `3x = ${sum-3} \\implies x = ${color}{${start}}` }
                ];

                return { variables: vars, answer: start, steps };
            },
            templates: [
                {
                    sv: "Summan av tre på varandra följande heltal är {sum}. Vilket är det minsta talet?",
                    en: "The sum of three consecutive integers is {sum}. What is the smallest number?"
                }
            ]
        };

        // --- SCENARIO 5: AGE COMPARISON ---
        const ageScenario: Scenario = {
            id: 'age',
            context: 'age',
            generateMath: (rng, lang) => {
                const kidAge = rng.intBetween(8, 15); // x
                const diff = rng.intBetween(20, 30); // Parent is older by diff
                const sum = kidAge + (kidAge + diff);
                
                const vars = { diff: `${diff}`, sum: `${sum}` };
                
                const eq = `x + (x + ${diff}) = ${sum}`;
                const steps = [
                    { text: "Equation (Kid + Parent = Sum)", latex: eq },
                    { text: "Simplify", latex: `2x + ${diff} = ${sum}` },
                    { text: "Solve", latex: `2x = ${sum - diff} \\implies x = ${color}{${kidAge}}` }
                ];

                return { variables: vars, answer: kidAge, steps };
            },
            templates: [
                {
                    sv: "En förälder är {diff} år äldre än sitt barn. Tillsammans är de {sum} år. Hur gammalt är barnet?",
                    en: "A parent is {diff} years older than their child. Together they are {sum} years old. How old is the child?"
                }
            ]
        };

        // Select scenario randomly
        const scenarios = [numberRiddleScenario, shoppingScenario, taxiScenario, consecutiveScenario, ageScenario];
        const scenario = rng.pick(scenarios);
        
        // Generate math
        const mathData = scenario.generateMath(rng, lang);
        
        // Pick a template and fill it
        const templateObj = rng.pick(scenario.templates);
        const rawTemplate = lang === 'sv' ? templateObj.sv : templateObj.en;
        
        // Use TextEngine to fill specific items (like "apples" or names) if needed, then math vars
        // Note: For this simplified version, we assume TextEngine exists or we do simple replacement.
        // If TextEngine is complex, we stick to basic string replacement here.
        let questionText = rawTemplate;
        
        // 1. Fill random items/people from TextEngine if applicable
        if (scenario.context === 'shopping') {
            const item = TextEngine.getContextItem(rng, 'shopping', lang);
            questionText = questionText.replace(/{item}/g, item);
        }
        
        // 2. Fill Math Variables
        questionText = TextEngine.fillTemplate(questionText, mathData.variables);

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
                answer: mathData.answer, // Numeric Answer
                solutionSteps: mathData.steps
            }
        };
    }
}