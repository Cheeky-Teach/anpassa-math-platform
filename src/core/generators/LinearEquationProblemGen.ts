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
                        text: t(lang, {
                            sv: `Frågan handlar om ett "hemligt tal". Vi vet inte vilket tal det är, så vi kallar det för $x$.`,
                            en: `The question is about a "secret number". We don't know what it is, so we call it $x$.`
                        }), 
                        latex: `\\text{Talet} = x` 
                    },
                    { 
                        text: t(lang, {
                            sv: `Vi multiplicerar talet med ${mul} och lägger till ${add}. Resultatet ska bli ${res}.`,
                            en: `We multiply the number by ${mul} and add ${add}. The result should be ${res}.`
                        }), 
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
                        text: t(lang, {
                            sv: `Vi vill ta reda på hur många ${item} du köpte. Eftersom antalet är okänt kallar vi det för $x$.`,
                            en: `We want to find out how many ${item} you bought. Since the quantity is unknown, we call it $x$.`
                        }),
                        latex: `\\text{Antal ${item}} = x`
                    },
                    {
                        text: t(lang, {
                            sv: `Varje sak kostar ${price} kr. Priset för $x$ stycken blir då ${price} gånger $x$. Sedan lägger vi till den fasta kostnaden på ${fixed} kr.`,
                            en: `Each item costs ${price} kr. The price for $x$ items is ${price} times $x$. Then we add the fixed cost of ${fixed} kr.`
                        }),
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
                        text: t(lang, {
                            sv: `Vi vet inte hur många ${item} ${name2} har. Därför kallar vi ${name2}s antal för $x$.`,
                            en: `We don't know how many ${item} ${name2} has. So we call ${name2}'s amount $x$.`
                        }),
                        latex: `\\text{${name2}} = x`
                    },
                    {
                        text: t(lang, {
                            sv: `${name1} har ${diff} fler än ${name2}. Det betyder att ${name1} har $x + ${diff}$. Tillsammans har de ${total}.`,
                            en: `${name1} has ${diff} more than ${name2}. This means ${name1} has $x + ${diff}$. Together they have ${total}.`
                        }),
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
                const weeks = rng.intBetween(3, 12); 
                const weekly = rng.intBetween(20, 100); 
                const start = rng.intBetween(50, 500); 
                const goal = start + (weekly * weeks); 

                const vars = {
                    weekly: `$${weekly}$`,
                    start: `$${start}$`,
                    goal: `$${goal}$`
                };

                const steps: Clue[] = [
                    {
                        text: t(lang, {
                            sv: `Frågan är "hur många veckor". Vi vet inte antalet veckor, så vi kallar det för $x$.`,
                            en: `The question is "how many weeks". We don't know the number of weeks, so we call it $x$.`
                        }),
                        latex: `\\text{Veckor} = x`
                    },
                    {
                        text: t(lang, {
                            sv: `Du sparar ${weekly} kr varje vecka. På $x$ veckor blir det ${weekly} gånger $x$. Du har redan ${start} kr.`,
                            en: `You save ${weekly} kr each week. In $x$ weeks that becomes ${weekly} times $x$. You already have ${start} kr.`
                        }),
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
                const bAge = rng.intBetween(5, 15); 
                const diff = rng.intBetween(2, 5); 
                const years = rng.intBetween(3, 10); 
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
                        text: t(lang, {
                            sv: `Vi söker ${name2}s nuvarande ålder. Låt den åldern vara $x$.`,
                            en: `We are looking for ${name2}'s current age. Let that age be $x$.`
                        }),
                        latex: `\\text{${name2}} = x`
                    },
                    {
                        text: t(lang, {
                            sv: `${name1} är ${diff} år äldre, alltså $x + ${diff}$. Om ${years} år har båda blivit ${years} år äldre.`,
                            en: `${name1} is ${diff} years older, so $x + ${diff}$. In ${years} years, both will be ${years} years older.`
                        }),
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
                const length = rng.intBetween(5, 20); 
                const width = rng.intBetween(3, 15);
                const perimeter = 2 * (length + width);

                const vars = {
                    width: `$${width}$`,
                    perimeter: `$${perimeter}$`
                };

                const steps: Clue[] = [
                    {
                        text: t(lang, {
                            sv: `Vi söker rektangelns längd. Vi kallar längden för $x$.`,
                            en: `We are looking for the length of the rectangle. We call the length $x$.`
                        }),
                        latex: `\\text{Längd} = x`
                    },
                    {
                        text: t(lang, {
                            sv: `Formeln för omkrets är $2 \\cdot (\\text{längd} + \\text{bredd})$. Vi vet att bredden är ${width} och totalen är ${perimeter}.`,
                            en: `The formula for perimeter is $2 \\cdot (\\text{length} + \\text{width})$. We know width is ${width} and total is ${perimeter}.`
                        }),
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
                const startNum = rng.intBetween(5, 30); 
                const total = startNum + (startNum + 1) + (startNum + 2);

                const vars = {
                    total: `$${total}$`
                };

                const steps: Clue[] = [
                    {
                        text: t(lang, {
                            sv: `Vi söker det minsta talet. Låt det vara $x$.`,
                            en: `We are looking for the smallest number. Let it be $x$.`
                        }),
                        latex: `\\text{Minsta talet} = x`
                    },
                    {
                        text: t(lang, {
                            sv: `Eftersom talen följer på varandra är nästa tal $x+1$ och talet efter det $x+2$. Summan ska bli ${total}.`,
                            en: `Since the numbers are consecutive, the next is $x+1$ and the one after is $x+2$. The sum should be ${total}.`
                        }),
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
                const km = rng.intBetween(5, 25); 
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
                        text: t(lang, {
                            sv: `Vi vill veta hur lång resan var. Låt $x$ vara antalet kilometer.`,
                            en: `We want to know how long the trip was. Let $x$ be the number of kilometers.`
                        }),
                        latex: `\\text{Kilometer} = x`
                    },
                    {
                        text: t(lang, {
                            sv: `Det kostar ${perKm} kr per kilometer, alltså ${perKm} gånger $x$. Plus startavgiften på ${startFee} kr.`,
                            en: `It costs ${perKm} kr per kilometer, so ${perKm} times $x$. Plus the start fee of ${startFee} kr.`
                        }),
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