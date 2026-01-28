import { MathUtils } from '../utils/MathUtils.js';

export class LinearEquationProblemGen {
    public generate(level: number, lang: string = 'sv'): any {
        // Level 5 = Write Equation (text input)
        // Level 6 = Solve Equation (numeric input)
        const isWriteMode = level === 5;
        
        // Pick a scenario type
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
            ? (lang === 'sv' ? "Skriv en ekvation för att lösa problemet (du behöver inte lösa den)." : "Write an equation to solve the problem (you don't need to solve it).")
            : (lang === 'sv' ? "Lös problemet. Vilket tal är x?" : "Solve the problem. What number is x?");

        const answer = isWriteMode ? data.equation : data.solution;
        const steps = isWriteMode ? data.stepsWrite : data.stepsSolve;

        return {
            renderData: {
                latex: "", // Text problem, no initial latex
                description: `${data.text} ${taskText}`,
                answerType: isWriteMode ? 'text' : 'text' // Both are text input, but validation differs
            },
            token: Buffer.from(answer.toString()).toString('base64'),
            serverData: { answer: answer, solutionSteps: steps }
        };
    }

    // --- Type A: ax + b = c (e.g. Buying X items + Bag) ---
    private scenarioA_RatePlusFixed(lang: string) {
        const x = MathUtils.randomInt(3, 15); // Quantity
        const a = MathUtils.randomInt(5, 25); // Price per item
        const b = MathUtils.randomChoice([2, 5, 10]); // Fixed cost (bag/shipping)
        const c = a * x + b; // Total

        // Context: Shopping
        const items = lang === 'sv' ? ['äpplen', 'pennor', 'bullar'] : ['apples', 'pencils', 'buns'];
        const container = lang === 'sv' ? 'kasse' : 'bag';
        const item = MathUtils.randomChoice(items);

        const text = lang === 'sv'
            ? `Du köper x stycken ${item} som kostar ${a} kr styck. Du betalar också ${b} kr för en ${container}. Totalt betalar du ${c} kr.`
            : `You buy x ${item} that cost ${a} kr each. You also pay ${b} kr for a ${container}. In total you pay ${c} kr.`;

        const equation = `${a}x+${b}=${c}`;

        const stepsWrite = [
            { text: lang === 'sv' ? "Pris för varorna:" : "Price for items:", latex: `${a} \\cdot x = ${a}x` },
            { text: lang === 'sv' ? "Plus fast kostnad:" : "Plus fixed cost:", latex: `+ ${b}` },
            { text: lang === 'sv' ? "Lika med totalen:" : "Equals total:", latex: `${a}x + ${b} = ${c}` }
        ];

        const stepsSolve = [
            { text: lang === 'sv' ? "Ekvationen är:" : "The equation is:", latex: `${a}x + ${b} = ${c}` },
            { text: lang === 'sv' ? "Subtrahera den fasta kostnaden:" : "Subtract fixed cost:", latex: `${a}x = ${c - b}` },
            { text: lang === 'sv' ? "Dela med styckpriset:" : "Divide by unit price:", latex: `x = ${x}` }
        ];

        return { text, equation, solution: x, stepsWrite, stepsSolve };
    }

    // --- Type B: ax - b = c (e.g. Discount) ---
    private scenarioB_RateMinusFixed(lang: string) {
        const x = MathUtils.randomInt(2, 10); // Items
        const a = MathUtils.randomInt(50, 200); // Price
        const b = MathUtils.randomChoice([20, 50, 100]); // Discount
        const c = a * x - b;

        const text = lang === 'sv'
            ? `Du köper ${x} st tröjor som kostar x kr styck (lite ovanligt, men låt oss säga antalet är känt men priset x okänt för variation). Vänta, standard är x antal. Låt oss köra: Du köper x st datorspel för ${a} kr styck. Du har en rabattkupong på ${b} kr. Du betalar totalt ${c} kr.`
            : `You buy x video games for ${a} kr each. You have a discount coupon of ${b} kr. You pay a total of ${c} kr.`;
        
        // Correcting the variables to match the text above:
        // x is amount of items. a is price. equation is a*x - b = c.
        
        const equation = `${a}x-${b}=${c}`;

        const stepsWrite = [
            { text: lang === 'sv' ? "Kostnad före rabatt:" : "Cost before discount:", latex: `${a}x` },
            { text: lang === 'sv' ? "Minus rabatten:" : "Minus discount:", latex: `- ${b}` },
            { text: lang === 'sv' ? "Totalt att betala:" : "Total to pay:", latex: `${a}x - ${b} = ${c}` }
        ];

        const stepsSolve = [
            { text: lang === 'sv' ? "Addera rabatten till totalen:" : "Add discount to total:", latex: `${a}x = ${c + b}` },
            { text: lang === 'sv' ? "Dela med priset:" : "Divide by price:", latex: `x = ${x}` }
        ];

        return { text, equation, solution: x, stepsWrite, stepsSolve };
    }

    // --- Type C: x + (x + a) = c (Comparison Sum) ---
    private scenarioC_CompareSum(lang: string) {
        const x = MathUtils.randomInt(5, 20); // Person 1
        const a = MathUtils.randomInt(2, 10); // Difference
        const total = x + (x + a);

        const name1 = "Kim";
        const name2 = "Alex";
        
        const text = lang === 'sv'
            ? `${name1} har x kronor. ${name2} har ${a} kronor mer än ${name1}. Tillsammans har de ${total} kronor.`
            : `${name1} has x kr. ${name2} has ${a} kr more than ${name1}. Together they have ${total} kr.`;

        const equation = `2x+${a}=${total}`; // Simplified form usually expected

        const stepsWrite = [
            { text: `${name1}:`, latex: "x" },
            { text: `${name2} (${a} mer):`, latex: `x + ${a}` },
            { text: lang === 'sv' ? "Tillsammans (addera):" : "Together (add):", latex: `x + (x + ${a}) = ${total}` },
            { text: lang === 'sv' ? "Förenkla:" : "Simplify:", latex: `2x + ${a} = ${total}` }
        ];

        const stepsSolve = [
            { text: lang === 'sv' ? "Ta bort skillnaden från totalen:" : "Remove difference from total:", latex: `2x = ${total - a}` },
            { text: lang === 'sv' ? "Dela på två personer:" : "Divide by two people:", latex: `x = ${x}` }
        ];

        return { text, equation, solution: x, stepsWrite, stepsSolve };
    }

    // --- Type D: x + (x - b) = c (Comparison Difference) ---
    private scenarioD_CompareDiff(lang: string) {
        const x = MathUtils.randomInt(10, 30); 
        const b = MathUtils.randomInt(2, 8);
        const total = x + (x - b);

        const text = lang === 'sv'
            ? `I en klass går det x elever. I parallellklassen går det ${b} färre elever. Totalt går det ${total} elever i båda klasserna.`
            : `There are x students in a class. The parallel class has ${b} fewer students. In total there are ${total} students.`;

        const equation = `2x-${b}=${total}`;

        const stepsWrite = [
            { text: lang === 'sv' ? "Klass 1:" : "Class 1:", latex: "x" },
            { text: lang === 'sv' ? "Klass 2 (färre):" : "Class 2 (fewer):", latex: `x - ${b}` },
            { text: lang === 'sv' ? "Summa:" : "Sum:", latex: `2x - ${b} = ${total}` }
        ];

        const stepsSolve = [
            { text: lang === 'sv' ? "Lägg till skillnaden till totalen:" : "Add difference to total:", latex: `2x = ${total + b}` },
            { text: lang === 'sv' ? "Dela på två:" : "Divide by two:", latex: `x = ${x}` }
        ];

        return { text, equation, solution: x, stepsWrite, stepsSolve };
    }
}