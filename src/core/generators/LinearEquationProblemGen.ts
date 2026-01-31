import { MathUtils } from '../utils/MathUtils.js';

export class LinearEquationProblemGen {
    public generate(level: number, lang: string = 'sv'): any {
        const isWriteMode = level === 5;
        const type = MathUtils.randomChoice(['A', 'B', 'C', 'D']);
        
        let data: any;

        switch (type) {
            case 'A': data = this.scenarioA_RatePlusFixed(lang); break; // ax + b = c
            case 'B': data = this.scenarioB_RateMinusFixed(lang); break; // ax - b = c
            case 'C': data = this.scenarioC_CompareSum(lang); break; // x + (x+a) = c
            case 'D': data = this.scenarioD_CompareDiff(lang); break; // x + (x-b) = c
            default: data = this.scenarioA_RatePlusFixed(lang);
        }

        const taskText = isWriteMode 
            ? (lang === 'sv' ? "Skriv en ekvation som beskriver problemet (du behöver inte lösa den)." : "Write an equation that describes the problem (you don't need to solve it).")
            : (lang === 'sv' ? "Lös problemet. Vilket tal är x?" : "Solve the problem. What number is x?");

        const answer = isWriteMode ? data.equation : data.solution;
        const steps = isWriteMode ? data.stepsWrite : data.stepsSolve;

        return {
            renderData: {
                latex: "",
                description: `${data.text} ${taskText}`,
                answerType: 'text' // Both modes expect text input (equation or number)
            },
            token: Buffer.from(answer.toString()).toString('base64'),
            // FIX: Added 'clues' at the top level so the frontend App.jsx can find them
            clues: steps,
            serverData: { answer: answer, solutionSteps: steps }
        };
    }

    // --- Type A: ax + b = c (Rate + Fixed Cost) ---
    private scenarioA_RatePlusFixed(lang: string) {
        // Expanded Scenarios
        const scenarios = [
            {   // Shopping
                item: lang === 'sv' ? "äpplen" : "apples",
                unit: lang === 'sv' ? "st" : "each",
                fixed: lang === 'sv' ? "kasse" : "bag",
                textSv: (a:number, b:number, c:number) => `Du köper x äpplen för ${a} kr/st och en kasse för ${b} kr. Totalt betalar du ${c} kr.`,
                textEn: (a:number, b:number, c:number) => `You buy x apples for ${a} kr each and a bag for ${b} kr. In total you pay ${c} kr.`
            },
            {   // Taxi
                item: "km",
                unit: "km",
                fixed: lang === 'sv' ? "startavgift" : "start fee",
                textSv: (a:number, b:number, c:number) => `En taxi kostar ${a} kr/km plus ${b} kr i startavgift. Resan kostade totalt ${c} kr. Du åkte x km.`,
                textEn: (a:number, b:number, c:number) => `A taxi costs ${a} kr/km plus a ${b} kr start fee. The trip cost ${c} kr in total. You traveled x km.`
            },
            {   // Rental
                item: "min",
                unit: "min",
                fixed: lang === 'sv' ? "upplåsningsavgift" : "unlock fee",
                textSv: (a:number, b:number, c:number) => `Att hyra en elscooter kostar ${b} kr i startavgift och ${a} kr per minut. Du betalade ${c} kr för x minuter.`,
                textEn: (a:number, b:number, c:number) => `Renting an e-scooter costs ${b} kr to unlock and ${a} kr per minute. You paid ${c} kr for x minutes.`
            },
            {   // Subscription
                item: lang === 'sv' ? "månader" : "months",
                unit: lang === 'sv' ? "mån" : "mo",
                fixed: lang === 'sv' ? "startavgift" : "signup fee",
                textSv: (a:number, b:number, c:number) => `Ett gymkort kostar ${a} kr i månaden och ${b} kr i startavgift. Du har betalat totalt ${c} kr. Hur många månader (x) har du tränat?`,
                textEn: (a:number, b:number, c:number) => `A gym membership costs ${a} kr/month plus a ${b} kr signup fee. You have paid ${c} kr in total. For how many months (x)?`
            }
        ];

        const s = MathUtils.randomChoice(scenarios);
        const x = MathUtils.randomInt(3, 15);
        const a = MathUtils.randomInt(5, 30);
        const b = MathUtils.randomChoice([10, 20, 49, 50, 99]);
        const c = a * x + b;

        const equation = `${a}x+${b}=${c}`;
        const text = lang === 'sv' ? s.textSv(a,b,c) : s.textEn(a,b,c);

        const stepsWrite = [
            { text: lang === 'sv' ? `1. Den rörliga kostnaden är priset per ${s.unit} gånger antalet (x).` : `1. The variable cost is the price per ${s.unit} times the quantity (x).`, latex: `${a} \\cdot x = ${a}x` },
            { text: lang === 'sv' ? `2. Lägg till den fasta avgiften (${s.fixed}).` : `2. Add the fixed fee (${s.fixed}).`, latex: `+ ${b}` },
            { text: lang === 'sv' ? `3. Summan ska bli totalbeloppet ${c}.` : `3. The sum must equal the total ${c}.`, latex: `${a}x + ${b} = ${c}` }
        ];

        const stepsSolve = [
            { text: lang === 'sv' ? `Ta bort den fasta avgiften (${b}) från totalen.` : `Subtract the fixed fee (${b}) from the total.`, latex: `${a}x = ${c} - ${b} = ${c-b}` },
            { text: lang === 'sv' ? `Dela det som är kvar med priset per ${s.unit} (${a}).` : `Divide the remainder by the price per ${s.unit} (${a}).`, latex: `x = \\frac{${c-b}}{${a}} = ${x}` }
        ];

        return { text, equation, solution: x, stepsWrite, stepsSolve };
    }

    // --- Type B: ax - b = c (Discount) ---
    private scenarioB_RateMinusFixed(lang: string) {
        const scenarios = [
            {
                textSv: (a:number, b:number, c:number) => `Du köper x datorspel för ${a} kr/st. Du har en rabattkupong på ${b} kr. Totalt betalar du ${c} kr.`,
                textEn: (a:number, b:number, c:number) => `You buy x video games for ${a} kr each. You have a discount coupon for ${b} kr. You pay ${c} kr total.`
            },
            {
                textSv: (a:number, b:number, c:number) => `En grupp på x personer går på bio. Biljetten kostar ${a} kr. Gruppen får en grupprabatt på ${b} kr. De betalar totalt ${c} kr.`,
                textEn: (a:number, b:number, c:number) => `A group of x people go to the cinema. Tickets are ${a} kr. The group gets a ${b} kr discount. They pay ${c} kr total.`
            },
            {
                textSv: (a:number, b:number, c:number) => `Du köper x tröjor som kostar ${a} kr styck. Eftersom du är medlem får du ${b} kr rabatt på hela köpet. Du betalar ${c} kr.`,
                textEn: (a:number, b:number, c:number) => `You buy x shirts costing ${a} kr each. As a member, you get ${b} kr off the total purchase. You pay ${c} kr.`
            }
        ];

        const s = MathUtils.randomChoice(scenarios);
        const x = MathUtils.randomInt(2, 8);
        const a = MathUtils.randomInt(50, 150);
        const b = MathUtils.randomChoice([20, 50, 100]);
        const c = a * x - b;

        const equation = `${a}x-${b}=${c}`;
        const text = lang === 'sv' ? s.textSv(a,b,c) : s.textEn(a,b,c);

        const stepsWrite = [
            { text: lang === 'sv' ? "1. Börja med vad det hade kostat utan rabatt (pris gånger antal)." : "1. Start with the cost without discount (price times quantity).", latex: `${a}x` },
            { text: lang === 'sv' ? `2. Rabatten minskar priset, så vi subtraherar ${b}.` : `2. The discount reduces the price, so subtract ${b}.`, latex: `- ${b}` },
            { text: lang === 'sv' ? "3. Sätt uttrycket lika med det du faktiskt betalade." : "3. Set the expression equal to what you actually paid.", latex: `${a}x - ${b} = ${c}` }
        ];

        const stepsSolve = [
            { text: lang === 'sv' ? "Lägg tillbaka rabatten på totalen för att se vad ordinarie pris var." : "Add the discount back to the total to find the original price.", latex: `${a}x = ${c} + ${b} = ${c+b}` },
            { text: lang === 'sv' ? `Dela med styckpriset (${a}) för att se hur många du köpte.` : `Divide by the unit price (${a}) to see how many you bought.`, latex: `x = \\frac{${c+b}}{${a}} = ${x}` }
        ];

        return { text, equation, solution: x, stepsWrite, stepsSolve };
    }

    // --- Type C: Compare Sum (x + (x+a) = c) ---
    private scenarioC_CompareSum(lang: string) {
        const scenarios = [
            {   // Money
                textSv: (a:number, c:number) => `Kim har x kr. Alex har ${a} kr mer än Kim. Tillsammans har de ${c} kr.`,
                textEn: (a:number, c:number) => `Kim has x kr. Alex has ${a} kr more than Kim. Together they have ${c} kr.`
            },
            {   // Age
                textSv: (a:number, c:number) => `Leo är x år. Hans syster är ${a} år äldre. Tillsammans är de ${c} år.`,
                textEn: (a:number, c:number) => `Leo is x years old. His sister is ${a} years older. Together they are ${c} years old.`
            },
            {   // Election/Votes
                textSv: (a:number, c:number) => `I ett val fick Parti A x röster. Parti B fick ${a} fler röster. Totalt fick de ${c} röster.`,
                textEn: (a:number, c:number) => `In an election, Party A got x votes. Party B got ${a} more votes. In total they got ${c} votes.`
            }
        ];

        const s = MathUtils.randomChoice(scenarios);
        const x = MathUtils.randomInt(5, 25);
        const a = MathUtils.randomInt(2, 10);
        const total = x + (x + a);
        
        const equation = `2x+${a}=${total}`;
        const text = lang === 'sv' ? s.textSv(a, total) : s.textEn(a, total);

        const stepsWrite = [
            { text: lang === 'sv' ? "Person/Sak 1:" : "Person/Item 1:", latex: "x" },
            { text: lang === 'sv' ? `Person/Sak 2 (som har ${a} mer):` : `Person/Item 2 (has ${a} more):`, latex: `x + ${a}` },
            { text: lang === 'sv' ? "Addera dem för att få summan:" : "Add them to get the sum:", latex: `x + (x + ${a}) = ${total} \\implies 2x + ${a} = ${total}` }
        ];

        const stepsSolve = [
            { text: lang === 'sv' ? "Ta bort det extra (skillnaden) från totalen." : "Remove the extra difference from the total.", latex: `2x = ${total} - ${a} = ${total-a}` },
            { text: lang === 'sv' ? "Dela resten lika på två." : "Divide the remainder equally by two.", latex: `x = \\frac{${total-a}}{2} = ${x}` }
        ];

        return { text, equation, solution: x, stepsWrite, stepsSolve };
    }

    // --- Type D: Compare Diff (x + (x-b) = c) ---
    private scenarioD_CompareDiff(lang: string) {
        const scenarios = [
            {   // Class size
                textSv: (b:number, c:number) => `I klass 7A går det x elever. I 7B går det ${b} färre elever. Totalt går det ${c} elever i årskursen.`,
                textEn: (b:number, c:number) => `Class 7A has x students. 7B has ${b} fewer students. There are ${c} students in total.`
            },
            {   // Lengths
                textSv: (b:number, c:number) => `En planka delas i två bitar. Den första är x cm. Den andra är ${b} cm kortare. Hela plankan var ${c} cm.`,
                textEn: (b:number, c:number) => `A plank is cut in two. The first piece is x cm. The second is ${b} cm shorter. The whole plank was ${c} cm.`
            },
            {   // Weight
                textSv: (b:number, c:number) => `Hundvalpen väger x kg. Katten väger ${b} kg mindre. Tillsammans väger de ${c} kg.`,
                textEn: (b:number, c:number) => `The puppy weighs x kg. The cat weighs ${b} kg less. Together they weigh ${c} kg.`
            }
        ];

        const s = MathUtils.randomChoice(scenarios);
        const x = MathUtils.randomInt(10, 50);
        const b = MathUtils.randomInt(2, 9);
        const total = x + (x - b);

        const equation = `2x-${b}=${total}`;
        const text = lang === 'sv' ? s.textSv(b, total) : s.textEn(b, total);

        const stepsWrite = [
            { text: lang === 'sv' ? "Del 1:" : "Part 1:", latex: "x" },
            { text: lang === 'sv' ? `Del 2 (som är ${b} mindre):` : `Part 2 (which is ${b} less):`, latex: `x - ${b}` },
            { text: lang === 'sv' ? "Summan av delarna:" : "Sum of the parts:", latex: `x + (x - ${b}) = ${total} \\implies 2x - ${b} = ${total}` }
        ];

        const stepsSolve = [
            { text: lang === 'sv' ? "Lägg till skillnaden till totalen för att 'jämna ut' det." : "Add the difference to the total to 'even it out'.", latex: `2x = ${total} + ${b} = ${total+b}` },
            { text: lang === 'sv' ? "Dela resultatet på två." : "Divide the result by two.", latex: `x = \\frac{${total+b}}{2} = ${x}` }
        ];

        return { text, equation, solution: x, stepsWrite, stepsSolve };
    }
}