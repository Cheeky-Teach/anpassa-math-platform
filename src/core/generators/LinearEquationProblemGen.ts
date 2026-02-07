import { MathUtils } from '../utils/MathUtils.js';

export class LinearEquationProblemGen {
    public generate(level: number, lang: string = 'sv'): any {
        const isWriteMode = level === 5;
        const types = ['A', 'B', 'C', 'D'];
        const type = MathUtils.randomChoice(types);
        
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
                answerType: 'text' 
            },
            token: Buffer.from(answer.toString()).toString('base64'),
            clues: steps,
            metadata: { 
                variation: `${data.variation}_${isWriteMode ? 'write' : 'solve'}`, 
                difficulty: isWriteMode ? 3 : 4,
                schema: data.variation
            }
        };
    }

    // --- Type A: ax + b = c (Rate + Fixed Cost) ---
    private scenarioA_RatePlusFixed(lang: string) {
        const scenarios = [
            {   
                item: lang === 'sv' ? "äpplen" : "apples",
                unit: lang === 'sv' ? "st" : "each",
                fixed: lang === 'sv' ? "kasse" : "bag",
                textSv: (a:number, b:number, c:number) => `Du köper x äpplen för ${a} kr/st och en kasse för ${b} kr. Totalt betalar du ${c} kr.`,
                textEn: (a:number, b:number, c:number) => `You buy x apples for ${a} kr each and a bag for ${b} kr. In total you pay ${c} kr.`
            },
            {   
                item: "km",
                unit: "km",
                fixed: lang === 'sv' ? "startavgift" : "start fee",
                textSv: (a:number, b:number, c:number) => `En taxi kostar ${a} kr/km plus ${b} kr i startavgift. Resan kostade totalt ${c} kr. Du åkte x km.`,
                textEn: (a:number, b:number, c:number) => `A taxi costs ${a} kr/km plus a ${b} kr start fee. The trip cost ${c} kr in total. You traveled x km.`
            }
        ];

        const s = MathUtils.randomChoice(scenarios);
        const x = MathUtils.randomInt(3, 15);
        const a = MathUtils.randomInt(5, 30);
        const b = MathUtils.randomChoice([10, 15, 20, 25, 50]);
        const c = a * x + b;

        const equation = `${a}x+${b}=${c}`;
        const text = lang === 'sv' ? s.textSv(a,b,c) : s.textEn(a,b,c);

        const stepsWrite = [
            { text: lang === 'sv' ? `Steg 1: Identifiera den rörliga delen. Det kostar ${a} kr för varje x.` : `Step 1: Identify the variable part. It costs ${a} kr for each x.`, latex: `${a} \\cdot x = ${a}x` },
            { text: lang === 'sv' ? `Steg 2: Lägg till den fasta kostnaden (${s.fixed}) på ${b} kr.` : `Step 2: Add the fixed cost (${s.fixed}) of ${b} kr.`, latex: `${a}x + ${b}` },
            { text: lang === 'sv' ? `Steg 3: Sätt uttrycket lika med det totala beloppet ${c}.` : `Step 3: Set the expression equal to the total amount ${c}.`, latex: `${a}x + ${b} = ${c}` }
        ];

        const stepsSolve = [
            { text: lang === 'sv' ? `Börja med att ta bort den fasta avgiften (${b}) från båda sidor.` : `Start by removing the fixed fee (${b}) from both sides.`, latex: `${a}x = ${c} - ${b} = ${c-b}` },
            { text: lang === 'sv' ? `Dela nu resultatet med priset per enhet (${a}).` : `Now divide the result by the price per unit (${a}).`, latex: `x = \\frac{${c-b}}{${a}} = ${x}` }
        ];

        return { text, equation, solution: x, stepsWrite, stepsSolve, variation: 'rate_fixed_add' };
    }

    // --- Type B: ax - b = c (Rate - Fixed/Discount) ---
    private scenarioB_RateMinusFixed(lang: string) {
        const scenarios = [
            {
                fixed: lang === 'sv' ? "rabatt" : "discount",
                textSv: (a:number, b:number, c:number) => `Du köper x spel för ${a} kr styck. Du får en rabatt på ${b} kr på hela köpet. Totalt betalar du ${c} kr.`,
                textEn: (a:number, b:number, c:number) => `You buy x games for ${a} kr each. You get a ${b} kr discount on the total. You pay ${c} kr in total.`
            }
        ];

        const s = MathUtils.randomChoice(scenarios);
        const x = MathUtils.randomInt(2, 8);
        const a = MathUtils.randomInt(100, 400);
        const b = MathUtils.randomChoice([50, 100, 150, 200]);
        const c = a * x - b;

        const equation = `${a}x-${b}=${c}`;
        const text = lang === 'sv' ? s.textSv(a,b,c) : s.textEn(a,b,c);

        const stepsWrite = [
            { text: lang === 'sv' ? `Steg 1: Beräkna priset utan rabatt (${a} kr per styck).` : `Step 1: Calculate the price without discount (${a} kr each).`, latex: `${a}x` },
            { text: lang === 'sv' ? `Steg 2: Subtrahera rabatten på ${b} kr.` : `Step 2: Subtract the discount of ${b} kr.`, latex: `${a}x - ${b}` },
            { text: lang === 'sv' ? `Steg 3: Sätt detta lika med summan du betalade (${c} kr).` : `Step 3: Set this equal to the amount you paid (${c} kr).`, latex: `${a}x - ${b} = ${c}` }
        ];

        const stepsSolve = [
            { text: lang === 'sv' ? `Lägg till rabatten (${b}) till summan för att se vad det kostade innan rabatten.` : `Add the discount (${b}) to the sum to see what it cost before the discount.`, latex: `${a}x = ${c} + ${b} = ${c+b}` },
            { text: lang === 'sv' ? `Dela med styckpriset (${a}) för att hitta antalet x.` : `Divide by the unit price (${a}) to find the number x.`, latex: `x = \\frac{${c+b}}{${a}} = ${x}` }
        ];

        return { text, equation, solution: x, stepsWrite, stepsSolve, variation: 'rate_fixed_sub' };
    }

    // --- Type C: Compare Sum (x + (x+a) = c) ---
    private scenarioC_CompareSum(lang: string) {
        const scenarios = [
            {   
                name1: "Kim", name2: "Alex",
                textSv: (a:number, c:number, n1:string, n2:string) => `${n1} har x kr. ${n2} har ${a} kr mer än ${n1}. Tillsammans har de ${c} kr.`,
                textEn: (a:number, c:number, n1:string, n2:string) => `${n1} has x kr. ${n2} has ${a} kr more than ${n1}. Together they have ${c} kr.`
            },
            {   
                name1: lang === 'sv' ? "Lilla hunden" : "Small dog", 
                name2: lang === 'sv' ? "Stora hunden" : "Big dog",
                textSv: (a:number, c:number, n1:string, n2:string) => `${n1} väger x kg. ${n2} väger ${a} kg mer än ${n1}. Tillsammans väger de ${c} kg.`,
                textEn: (a:number, c:number, n1:string, n2:string) => `${n1} weighs x kg. ${n2} weighs ${a} kg more than ${n1}. Together they weigh ${c} kg.`
            }
        ];

        const s = MathUtils.randomChoice(scenarios);
        const x = MathUtils.randomInt(5, 30);
        const a = MathUtils.randomInt(2, 15);
        const total = 2 * x + a;
        
        const equation = `2x+${a}=${total}`;
        const text = lang === 'sv' ? s.textSv(a, total, s.name1, s.name2) : s.textEn(a, total, s.name1, s.name2);

        const stepsWrite = [
            { text: lang === 'sv' ? `Steg 1: Den första (${s.name1}) har x.` : `Step 1: The first (${s.name1}) has x.`, latex: "x" },
            { text: lang === 'sv' ? `Steg 2: Den andra (${s.name2}) har ${a} mer.` : `Step 2: The second (${s.name2}) has ${a} more.`, latex: "x + " + a },
            { text: lang === 'sv' ? `Steg 3: Lägg ihop dem. x + (x + ${a}) blir 2x + ${a}.` : `Step 3: Add them up. x + (x + ${a}) becomes 2x + ${a}.`, latex: `2x + ${a} = ${total}` }
        ];

        const stepsSolve = [
            { text: lang === 'sv' ? `Ta bort skillnaden (${a}) från det totala för att se vad de har om de hade haft lika mycket.` : `Remove the difference (${a}) from the total to see what they would have if they were equal.`, latex: `2x = ${total} - ${a} = ${total-a}` },
            { text: lang === 'sv' ? "Dela nu resultatet på 2 för att få fram x." : "Now divide the result by 2 to find x.", latex: `x = \\frac{${total-a}}{2} = ${x}` }
        ];

        return { text, equation, solution: x, stepsWrite, stepsSolve, variation: 'compare_word_sum' };
    }

    // --- Type D: Compare Diff (x + (x-b) = c) ---
    private scenarioD_CompareDiff(lang: string) {
        const scenarios = [
            {   
                textSv: (b:number, c:number) => `En planka är ${c} cm lång. Den delas i två bitar. Den ena är x cm. Den andra är ${b} cm kortare.`,
                textEn: (b:number, c:number) => `A plank is ${c} cm long. It is cut in two pieces. One is x cm. The other is ${b} cm shorter.`
            }
        ];

        const s = MathUtils.randomChoice(scenarios);
        const x = MathUtils.randomInt(20, 60);
        const b = MathUtils.randomInt(5, 15);
        const total = 2 * x - b;

        const equation = `2x-${b}=${total}`;
        const text = lang === 'sv' ? s.textSv(b, total) : s.textEn(b, total);

        const stepsWrite = [
            { text: lang === 'sv' ? `Steg 1: Den första delen är x.` : `Step 1: The first part is x.`, latex: "x" },
            { text: lang === 'sv' ? `Steg 2: Den andra delen är ${b} mindre.` : `Step 2: The second part is ${b} less.`, latex: "x - " + b },
            { text: lang === 'sv' ? `Steg 3: Summan av x och (x - ${b}) ska bli ${total}.` : `Step 3: The sum of x and (x - ${b}) must be ${total}.`, latex: `2x - ${b} = ${total}` }
        ];

        const stepsSolve = [
            { text: lang === 'sv' ? `Lägg till de ${b} cm som fattas till totalen för att göra delarna lika stora.` : `Add the missing ${b} cm to the total to make the parts equal.`, latex: `2x = ${total} + ${b} = ${total+b}` },
            { text: lang === 'sv' ? "Dela på 2 för att få fram x." : "Divide by 2 to find x.", latex: `x = \\frac{${total+b}}{2} = ${x}` }
        ];

        return { text, equation, solution: x, stepsWrite, stepsSolve, variation: 'compare_word_diff' };
    }
}