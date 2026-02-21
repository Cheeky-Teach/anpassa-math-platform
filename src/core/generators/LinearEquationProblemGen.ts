import { MathUtils } from '../utils/MathUtils.js';

export class LinearEquationProblemGen {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        // Mode 5: Writing the equation | Mode 6: Solving the equation
        const mode = level === 5 ? 'write' : 'solve';
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'rate_fixed_add', type: 'calculate' },
            { key: 'rate_fixed_sub', type: 'calculate' },
            { key: 'compare_word_sum', type: 'calculate' },
            { key: 'compare_word_diff', type: 'calculate' }
        ];
        
        const v = this.getVariation(pool, options);
        
        switch (v) {
            case 'rate_fixed_add': return this.scenarioA_RatePlusFixed(lang, mode);
            case 'rate_fixed_sub': return this.scenarioB_RateMinusFixed(lang, mode);
            case 'compare_word_sum': return this.scenarioC_CompareSum(lang, mode);
            case 'compare_word_diff': return this.scenarioD_CompareDiff(lang, mode);
            default: return this.scenarioA_RatePlusFixed(lang, mode);
        }
    }

    public generateByVariation(key: string, lang: string = 'sv'): any {
        const mode = key.endsWith('_write') ? 'write' : 'solve';
        const baseKey = key.replace('_write', '').replace('_solve', '');

        switch (baseKey) {
            case 'rate_fixed_add': return this.scenarioA_RatePlusFixed(lang, mode);
            case 'rate_fixed_sub': return this.scenarioB_RateMinusFixed(lang, mode);
            case 'compare_word_sum': return this.scenarioC_CompareSum(lang, mode);
            case 'compare_word_diff': return this.scenarioD_CompareDiff(lang, mode);
            default: return this.generate(mode === 'write' ? 5 : 6, lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    private getVariation(pool: {key: string, type: 'concept' | 'calculate'}[], options: any): string {
        let filtered = pool;
        if (options?.exclude && options.exclude.length > 0) {
            filtered = filtered.filter(v => !options.exclude.includes(v.key + (options.level === 5 ? "_write" : "_solve")));
        }
        return MathUtils.randomChoice(filtered.map(v => v.key));
    }

    private getTaskText(lang: string, mode: 'write' | 'solve'): string {
        if (mode === 'write') {
            return lang === 'sv' 
                ? "Skriv en ekvation som beskriver detta problem (du behöver inte lösa ut x)." 
                : "Write an equation that describes this problem (you do not need to solve for x).";
        }
        return lang === 'sv' 
            ? "Lös problemet och ta reda på vilket värde variabeln x har." 
            : "Solve the problem and find the value of the variable x.";
    }

    // --- Scenario A: ax + b = c (Rate + Fixed Cost) ---
    private scenarioA_RatePlusFixed(lang: string, mode: 'write' | 'solve') {
        const x = MathUtils.randomInt(5, 25);
        const a = MathUtils.randomInt(5, 35);
        const b = MathUtils.randomChoice([19, 29, 39, 49, 59]);
        const c = a * x + b;

        const scenarios = [
            {   
                textSv: `Du köper x kg äpplen för ${a} kr/kg och en bärkasse för ${b} kr. Totalt betalar du ${c} kr.`,
                textEn: `You buy x kg of apples for ${a} kr/kg and a shopping bag for ${b} kr. In total you pay ${c} kr.`
            },
            {   
                textSv: `En hyrbil kostar ${b} kr i fast avgift plus ${a} kr per mil. Den totala kostnaden blev ${c} kr för x körda mil.`,
                textEn: `A rental car costs a fixed fee of ${b} kr plus ${a} kr per mile. The total cost was ${c} kr for x miles driven.`
            }
        ];

        const s = MathUtils.randomChoice(scenarios);
        const desc = (lang === 'sv' ? s.textSv : s.textEn) + " " + this.getTaskText(lang, mode);
        const equation = `${a}x+${b}=${c}`;

        let clues = [];
        if (mode === 'write') {
            clues = [
                { text: lang === 'sv' ? "Steg 1: Identifiera den rörliga delen (kostnad per styck/mil)." : "Step 1: Identify the variable part (cost per unit/mile)." },
                { text: lang === 'sv' ? `Om varje enhet kostar ${a} kr, så kostar x stycken totalt ${a}x.` : `If each unit costs ${a} kr, then x units cost ${a}x total.`, latex: `${a}x` },
                { text: lang === 'sv' ? `Steg 2: Lägg till den fasta kostnaden på ${b} kr.` : `Step 2: Add the fixed cost of ${b} kr.`, latex: `${a}x + ${b}` },
                { text: lang === 'sv' ? `Steg 3: Sätt hela uttrycket lika med det totala beloppet ${c} kr.` : `Step 3: Set the whole expression equal to the total amount of ${c} kr.` },
                { text: lang === 'sv' ? "Svar:" : "Answer:", latex: `${a}x + ${b} = ${c}` }
            ];
        } else {
            clues = [
                { text: lang === 'sv' ? "Steg 1: Vi vill veta vad den rörliga delen kostade utan den fasta avgiften." : "Step 1: We want to know the cost of the variable part without the fixed fee." },
                { text: lang === 'sv' ? `Dra bort ${b} från totalsumman ${c}.` : `Subtract ${b} from the total sum ${c}.`, latex: `${c} - ${b} = ${c-b}` },
                { text: lang === 'sv' ? `Nu vet vi att ${a}x = ${c-b}.` : `Now we know that ${a}x = ${c-b}.`, latex: `${a}x = ${c-b}` },
                { text: lang === 'sv' ? `Steg 2: För att hitta x delar vi resultatet med ${a}.` : `Step 2: To find x, divide the result by ${a}.` },
                { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `x = \\frac{${c-b}}{${a}}` },
                { text: lang === 'sv' ? `Svar: x = ${x}` : `Answer: x = ${x}` }
            ];
        }

        return {
            renderData: { description: desc, answerType: 'text', latex: "" },
            token: this.toBase64(mode === 'write' ? equation : x.toString()),
            clues, metadata: { variation_key: `rate_fixed_add_${mode}`, difficulty: mode === 'write' ? 3 : 4 }
        };
    }

    // --- Scenario B: ax - b = c (Rate - Discount) ---
    private scenarioB_RateMinusFixed(lang: string, mode: 'write' | 'solve') {
        const x = MathUtils.randomInt(3, 8);
        const a = MathUtils.randomInt(150, 400);
        const b = MathUtils.randomChoice([50, 100, 150]);
        const c = a * x - b;

        const desc = lang === 'sv'
            ? `Du köper x st tröjor för ${a} kr/st. Du använder en rabattcheck på ${b} kr. Totalt betalar du ${c} kr. ${this.getTaskText(lang, mode)}`
            : `You buy x sweaters for ${a} kr/each. You use a discount coupon of ${b} kr. In total you pay ${c} kr. ${this.getTaskText(lang, mode)}`;

        const equation = `${a}x-${b}=${c}`;
        let clues = [];
        if (mode === 'write') {
            clues = [
                { text: lang === 'sv' ? "Steg 1: Beräkna totalpriset för tröjorna innan rabatten." : "Step 1: Calculate the total price for the sweaters before the discount." },
                { text: lang === 'sv' ? `Det blir priset per styck (${a}) gånger antalet (x).` : `That is the price per unit (${a}) times the number (x).`, latex: `${a}x` },
                { text: lang === 'sv' ? `Steg 2: Eftersom du fick rabatt drar vi bort ${b} kr från priset.` : `Step 2: Since you got a discount, subtract ${b} kr from the price.`, latex: `${a}x - ${b}` },
                { text: lang === 'sv' ? `Steg 3: Sätt detta uttryck lika med slutpriset ${c} kr.` : `Step 3: Set this expression equal to the final price of ${c} kr.` },
                { text: lang === 'sv' ? "Svar:" : "Answer:", latex: `${a}x - ${b} = ${c}` }
            ];
        } else {
            clues = [
                { text: lang === 'sv' ? "Steg 1: Vi vill veta vad tröjorna kostade innan rabatten drogs bort." : "Step 1: We want to know what the sweaters cost before the discount was subtracted." },
                { text: lang === 'sv' ? `Lägg tillbaka rabatten (${b} kr) på slutpriset.` : `Add the discount (${b} kr) back to the final price.`, latex: `${c} + ${b} = ${c+b}` },
                { text: lang === 'sv' ? `Nu har vi: ${a}x = ${c+b}.` : `Now we have: ${a}x = ${c+b}.`, latex: `${a}x = ${c+b}` },
                { text: lang === 'sv' ? `Steg 2: Dela summan med styckpriset ${a} kr.` : `Step 2: Divide the sum by the unit price ${a} kr.` },
                { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `x = \\frac{${c+b}}{${a}}` },
                { text: lang === 'sv' ? `Svar: x = ${x}` : `Answer: x = ${x}` }
            ];
        }

        return {
            renderData: { description: desc, answerType: 'text', latex: "" },
            token: this.toBase64(mode === 'write' ? equation : x.toString()),
            clues, metadata: { variation_key: `rate_fixed_sub_${mode}`, difficulty: 4 }
        };
    }

    // --- Scenario C: Compare Sum (x + (x+a) = c) ---
    private scenarioC_CompareSum(lang: string, mode: 'write' | 'solve') {
        const names = MathUtils.shuffle(lang === 'sv' ? ["Lukas", "Maja", "Sam", "Linnea"] : ["Lucas", "Maya", "Sam", "Lily"]);
        const diff = MathUtils.randomInt(5, 20);
        const x = MathUtils.randomInt(10, 50);
        const total = 2 * x + diff;

        const desc = lang === 'sv'
            ? `${names[0]} har x kr. ${names[1]} har ${diff} kr mer än ${names[0]}. Tillsammans har de ${total} kr. ${this.getTaskText(lang, mode)}`
            : `${names[0]} has x kr. ${names[1]} has ${diff} kr more than ${names[0]}. Together they have ${total} kr. ${this.getTaskText(lang, mode)}`;

        const equation = `2x+${diff}=${total}`;
        let clues = [];
        if (mode === 'write') {
            clues = [
                { text: lang === 'sv' ? `Steg 1: Skriv ett uttryck för ${names[0]}s pengar.` : `Step 1: Write an expression for ${names[0]}'s money.`, latex: "x" },
                { text: lang === 'sv' ? `Steg 2: Skriv ett uttryck för ${names[1]}s pengar (${names[0]} + ${diff}).` : `Step 2: Write an expression for ${names[1]}'s money (${names[0]} + ${diff}).`, latex: `x + ${diff}` },
                { text: lang === 'sv' ? "Steg 3: Summera personernas pengar." : "Step 3: Sum the people's money.", latex: `x + (x + ${diff})` },
                { text: lang === 'sv' ? "Steg 4: Förenkla (x + x = 2x) och sätt lika med totalen." : "Step 4: Simplify (x + x = 2x) and set equal to the total.", latex: `2x + ${diff} = ${total}` },
                { text: lang === 'sv' ? "Svar:" : "Answer:", latex: `2x + ${diff} = ${total}` }
            ];
        } else {
            clues = [
                { text: lang === 'sv' ? "Steg 1: Identifiera att totalen består av 2 stycken x och en skillnad." : "Step 1: Identify that the total consists of 2 units of x and a difference." },
                { text: lang === 'sv' ? `Steg 2: Dra bort skillnaden (${diff} kr) från totalen för att få jämna x-delar.` : `Step 2: Subtract the difference (${diff} kr) from the total to get even x-parts.`, latex: `${total} - ${diff} = ${total-diff}` },
                { text: lang === 'sv' ? `Nu vet vi att två stycken x är lika med ${total-diff}.` : `Now we know that two x are equal to ${total-diff}.`, latex: `2x = ${total-diff}` },
                { text: lang === 'sv' ? "Steg 3: Dela resultatet med 2 för att hitta värdet på ett x." : "Step 3: Divide the result by 2 to find the value of one x." },
                { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `x = \\frac{${total-diff}}{2}` },
                { text: lang === 'sv' ? `Svar: x = ${x}` : `Answer: x = ${x}` }
            ];
        }

        return {
            renderData: { description: desc, answerType: 'text', latex: "" },
            token: this.toBase64(mode === 'write' ? equation : x.toString()),
            clues, metadata: { variation_key: `compare_word_sum_${mode}`, difficulty: 4 }
        };
    }

    // --- Scenario D: Compare Diff (x + (x-b) = c) ---
    private scenarioD_CompareDiff(lang: string, mode: 'write' | 'solve') {
        const diff = MathUtils.randomInt(10, 30);
        const x = MathUtils.randomInt(40, 80);
        const total = 2 * x - diff;

        const desc = lang === 'sv'
            ? `En planka är ${total} cm lång. Den kapas i två bitar. Den långa biten är x cm. Den korta biten är ${diff} cm kortare. ${this.getTaskText(lang, mode)}`
            : `A plank is ${total} cm long. It is cut into two pieces. The long piece is x cm. The short piece is ${diff} cm shorter. ${this.getTaskText(lang, mode)}`;

        const equation = `2x-${diff}=${total}`;
        let clues = [];
        if (mode === 'write') {
            clues = [
                { text: lang === 'sv' ? "Steg 1: Skriv uttryck för de två bitarna." : "Step 1: Write expressions for the two pieces." },
                { text: lang === 'sv' ? `Lång bit: x. Kort bit: (x - ${diff}).` : `Long piece: x. Short piece: (x - ${diff}).`, latex: `x + (x - ${diff})` },
                { text: lang === 'sv' ? "Steg 2: Förenkla uttrycket genom att slå ihop x-termerna." : "Step 2: Simplify the expression by combining the x-terms.", latex: `2x - ${diff}` },
                { text: lang === 'sv' ? `Steg 3: Sätt uttrycket lika med plankans hela längd (${total}).` : `Step 3: Set the expression equal to the plank's total length (${total}).` },
                { text: lang === 'sv' ? "Svar:" : "Answer:", latex: `2x - ${diff} = ${total}` }
            ];
        } else {
            clues = [
                { text: lang === 'sv' ? "Steg 1: Vi vet att den totala längden är summan av en lång och en kort bit." : "Step 1: We know the total length is the sum of a long and a short piece." },
                { text: lang === 'sv' ? `Steg 2: Om vi lägger till ${diff} cm till den korta biten, får vi två lika långa bitar (x).` : `Step 2: If we add ${diff} cm to the short piece, we get two pieces of equal length (x).`, latex: `${total} + ${diff} = ${total+diff}` },
                { text: lang === 'sv' ? `Då blir 2x = ${total+diff}.` : `Then 2x = ${total+diff}.`, latex: `2x = ${total+diff}` },
                { text: lang === 'sv' ? "Steg 3: Dela den nya summan med 2 för att hitta x." : "Step 3: Divide the new sum by 2 to find x." },
                { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `x = \\frac{${total+diff}}{2}` },
                { text: lang === 'sv' ? `Svar: x = ${x}` : `Answer: x = ${x}` }
            ];
        }

        return {
            renderData: { description: desc, answerType: 'text', latex: "" },
            token: this.toBase64(mode === 'write' ? equation : x.toString()),
            clues, metadata: { variation_key: `compare_word_diff_${mode}`, difficulty: 4 }
        };
    }
}