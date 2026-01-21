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

        // --- SCENARIO 4: SAVINGS (Weekly Allowance) ---
        const savingsScenario: Scenario = {
            id: 'savings_goal',
            context: 'shopping', 
            generateMath: (rng, lang) => {
                // Goal = starting + (weekly * weeks)
                const weeks = rng.intBetween(3, 12); // Answer (x)
                const weekly = rng.intBetween(20, 100); // Coefficient
                const start = rng.intBetween(50, 500); // Constant
                const goal = start + (weekly * weeks); // Total

                const vars = {
                    weekly: `$${weekly}$`,
                    start: `$${start}$`,
                    goal: `$${goal}$`
                };

                const steps: Clue[] = [
                    {
                        text: t(lang, {sv: "Låt $x$ vara antal veckor.", en: "Let $x$ be the number of weeks."}),
                        latex: `${weekly}x + ${start} = ${goal}`
                    },
                    {
                        text: t(lang, TERMS.algebra.subtract(start)),
                        latex: `${weekly}x = ${goal - start}`
                    },
                    {
                        text: t(lang, TERMS.algebra.divide(weekly)),
                        latex: `x = ${color}{${weeks}}}`
                    }
                ];

                return { variables: vars, answer: weeks, steps, solutionExpression: `${weekly}x + ${start} = ${goal}` };
            },
            templates: [
                {
                    sv: "Du sparar till en sak som kostar {goal} kr. Du har redan {start} kr och sparar {weekly} kr varje vecka. Hur många veckor tar det?",
                    en: "You are saving for something that costs {goal} kr. You already have {start} kr and save {weekly} kr every week. How many weeks will it take?"
                }
            ]
        };

        // --- SCENARIO 5: AGE RIDDLE (Future) ---
        const ageFutureScenario: Scenario = {
            id: 'age_future',
            context: 'age',
            generateMath: (rng, lang) => {
                // Person A is 'diff' years older than B.
                // In 'years' time, their sum will be 'total'.
                // Current ages: B = x, A = x + diff.
                // Future ages: B = x + years, A = x + diff + years.
                // Sum: (x + years) + (x + diff + years) = total
                // 2x + diff + 2*years = total
                
                const bAge = rng.intBetween(5, 15); // Answer (x)
                const diff = rng.intBetween(2, 5); // Age difference
                const years = rng.intBetween(3, 10); // Years into future
                const totalFutureSum = (bAge + years) + (bAge + diff + years);

                const name1 = TextEngine.getRandomName(rng, 'age');
                let name2 = TextEngine.getRandomName(rng, 'age');
                while(name1 === name2) name2 = TextEngine.getRandomName(rng, 'age');

                const vars = {
                    name1, name2,
                    diff: `$${diff}$`,
                    years: `$${years}$`,
                    total: `$${totalFutureSum}$`
                };

                const steps: Clue[] = [
                    {
                        text: t(lang, {sv: `Låt ${name2}s nuvarande ålder vara $x$.`, en: `Let ${name2}'s current age be $x$.`}),
                        latex: `(x + ${years}) + ((x + ${diff}) + ${years}) = ${totalFutureSum}`
                    },
                    {
                        text: t(lang, TERMS.simplification.group_terms),
                        latex: `2x + ${diff + 2*years} = ${totalFutureSum}`
                    },
                    {
                        text: t(lang, TERMS.algebra.subtract(diff + 2*years)),
                        latex: `2x = ${totalFutureSum - (diff + 2*years)}`
                    },
                    {
                        text: t(lang, TERMS.algebra.divide(2)),
                        latex: `x = ${color}{${bAge}}}`
                    }
                ];

                return { variables: vars, answer: bAge, steps, solutionExpression: `2x + ${diff + 2*years} = ${totalFutureSum}` };
            },
            templates: [
                {
                    sv: "{name1} är {diff} år äldre än {name2}. Om {years} år kommer deras sammanlagda ålder att vara {total}. Hur gammal är {name2} nu?",
                    en: "{name1} is {diff} years older than {name2}. In {years} years, their combined age will be {total}. How old is {name2} now?"
                }
            ]
        };

        // --- SCENARIO 6: PERIMETER (Rectangle) ---
        const perimeterScenario: Scenario = {
            id: 'perimeter_find_side',
            context: 'school', // General context
            generateMath: (rng, lang) => {
                // P = 2(l + w). Find l given w and P.
                // 2(x + w) = P -> 2x + 2w = P
                const length = rng.intBetween(5, 20); // Answer (x)
                const width = rng.intBetween(3, 15);
                const perimeter = 2 * (length + width);

                const vars = {
                    width: `$${width}$`,
                    perimeter: `$${perimeter}$`
                };

                const steps: Clue[] = [
                    {
                        text: t(lang, {sv: "Använd formeln för omkrets. Låt längden vara $x$.", en: "Use the perimeter formula. Let length be $x$."}),
                        latex: `2(x + ${width}) = ${perimeter}`
                    },
                    {
                        text: t(lang, TERMS.algebra.distribute(2)),
                        latex: `2x + ${2*width} = ${perimeter}`
                    },
                    {
                        text: t(lang, TERMS.algebra.subtract(2*width)),
                        latex: `2x = ${perimeter - 2*width}`
                    },
                    {
                        text: t(lang, TERMS.algebra.divide(2)),
                        latex: `x = ${color}{${length}}}`
                    }
                ];

                return { variables: vars, answer: length, steps, solutionExpression: `2(x + ${width}) = ${perimeter}` };
            },
            templates: [
                {
                    sv: "Omkretsen av en rektangel är {perimeter} cm. Bredden är {width} cm. Hur lång är rektangeln?",
                    en: "The perimeter of a rectangle is {perimeter} cm. The width is {width} cm. How long is the rectangle?"
                }
            ]
        };

         // --- SCENARIO 7: CONSECUTIVE NUMBERS ---
         const consecutiveScenario: Scenario = {
            id: 'consecutive_sum',
            context: 'school',
            generateMath: (rng, lang) => {
                // Sum of 3 consecutive numbers: x + (x+1) + (x+2) = Total
                // 3x + 3 = Total
                const startNum = rng.intBetween(5, 30); // Answer (x)
                const total = startNum + (startNum + 1) + (startNum + 2);

                const vars = {
                    total: `$${total}$`
                };

                const steps: Clue[] = [
                    {
                        text: t(lang, {sv: "Låt det minsta talet vara $x$. De andra är $x+1$ och $x+2$.", en: "Let the smallest number be $x$. The others are $x+1$ and $x+2$."}),
                        latex: `x + (x+1) + (x+2) = ${total}`
                    },
                    {
                        text: t(lang, TERMS.simplification.group_terms),
                        latex: `3x + 3 = ${total}`
                    },
                    {
                        text: t(lang, TERMS.algebra.subtract(3)),
                        latex: `3x = ${total - 3}`
                    },
                    {
                        text: t(lang, TERMS.algebra.divide(3)),
                        latex: `x = ${color}{${startNum}}}`
                    }
                ];

                return { variables: vars, answer: startNum, steps, solutionExpression: `3x + 3 = ${total}` };
            },
            templates: [
                {
                    sv: "Summan av tre på varandra följande heltal är {total}. Vilket är det minsta talet?",
                    en: "The sum of three consecutive integers is {total}. What is the smallest number?"
                }
            ]
        };

         // --- SCENARIO 8: TAXI FARE (Fixed + Variable cost) ---
         const taxiScenario: Scenario = {
            id: 'taxi_fare',
            context: 'shopping',
            generateMath: (rng, lang) => {
                // Cost = Start + (PricePerKm * km)
                // Total = S + Px
                const km = rng.intBetween(5, 25); // Answer (x)
                const perKm = rng.intBetween(10, 30);
                const startFee = rng.intBetween(40, 75);
                const total = startFee + (perKm * km);

                const vars = {
                    perKm: `$${perKm}$`,
                    startFee: `$${startFee}$`,
                    total: `$${total}$`
                };

                const steps: Clue[] = [
                    {
                        text: t(lang, {sv: "Låt $x$ vara antal kilometer.", en: "Let $x$ be the number of km."}),
                        latex: `${perKm}x + ${startFee} = ${total}`
                    },
                    {
                        text: t(lang, TERMS.algebra.subtract(startFee)),
                        latex: `${perKm}x = ${total - startFee}`
                    },
                    {
                        text: t(lang, TERMS.algebra.divide(perKm)),
                        latex: `x = ${color}{${km}}}`
                    }
                ];

                return { variables: vars, answer: km, steps, solutionExpression: `${perKm}x + ${startFee} = ${total}` };
            },
            templates: [
                {
                    sv: "En taxiresa kostar {startFee} kr i startavgift plus {perKm} kr per kilometer. En resa kostade totalt {total} kr. Hur många kilometer var resan?",
                    en: "A taxi ride has a start fee of {startFee} kr plus {perKm} kr per km. A trip cost {total} kr in total. How many km was the trip?"
                }
            ]
        };


        // Select scenario randomly since this IS Level 5 (Problem Solving)
        // Includes the original 3 plus the 5 new ones.
        const scenarios = [
            numberRiddleScenario, 
            shoppingScenario, 
            comparisonScenario, 
            savingsScenario, 
            ageFutureScenario, 
            perimeterScenario,
            consecutiveScenario,
            taxiScenario
        ];
        
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