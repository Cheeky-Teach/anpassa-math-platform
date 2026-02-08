import { MathUtils } from '../utils/MathUtils.js';

export class LinearEquationProblemGen {
    public generate(level: number, lang: string = 'sv'): any {
        const mode = level === 5 ? 'write' : 'solve';
        const type = MathUtils.randomChoice(['A', 'B', 'C', 'D']);
        
        switch (type) {
            case 'A': return this.scenarioA_RatePlusFixed(lang, mode);
            case 'B': return this.scenarioB_RateMinusFixed(lang, mode);
            case 'C': return this.scenarioC_CompareSum(lang, mode);
            case 'D': return this.scenarioD_CompareDiff(lang, mode);
            default: return this.scenarioA_RatePlusFixed(lang, mode);
        }
    }

    /**
     * Phase 2: Targeted Generation
     * Allows the Question Studio to request a specific skill bucket.
     */
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

    // --- Type A: ax + b = c (Rate + Fixed Cost) ---
    private scenarioA_RatePlusFixed(lang: string, mode: 'write' | 'solve') {
        const scenarios = [
            {   
                fixedName: lang === 'sv' ? "kasse" : "bag",
                textSv: (a:number, b:number, c:number) => `Du köper x stycken äpplen för ${a} kr/st och en papperskasse för ${b} kr. Totalt betalar du ${c} kr.`,
                textEn: (a:number, b:number, c:number) => `You buy x apples for ${a} kr each and a paper bag for ${b} kr. In total you pay ${c} kr.`
            },
            {   
                fixedName: lang === 'sv' ? "startavgift" : "start fee",
                textSv: (a:number, b:number, c:number) => `En taxiresa kostar ${a} kr per kilometer plus en startavgift på ${b} kr. Hela resan kostade totalt ${c} kr. Du åkte x km.`,
                textEn: (a:number, b:number, c:number) => `A taxi trip costs ${a} kr per kilometer plus a start fee of ${b} kr. The entire trip cost ${c} kr in total. You traveled x km.`
            }
        ];

        const s = MathUtils.randomChoice(scenarios);
        const x = MathUtils.randomInt(5, 20);
        const a = MathUtils.randomInt(5, 40);
        const b = MathUtils.randomChoice([15, 25, 45, 50]);
        const c = a * x + b;

        const equation = `${a}x+${b}=${c}`;
        const desc = (lang === 'sv' ? s.textSv(a,b,c) : s.textEn(a,b,c)) + " " + this.getTaskText(lang, mode);

        const clues = mode === 'write' ? [
            { text: lang === 'sv' ? `Steg 1: Identifiera den rörliga kostnaden (${a} kr för varje x).` : `Step 1: Identify the variable cost (${a} kr for each x).`, latex: `${a} \\cdot x = ${a}x` },
            { text: lang === 'sv' ? `Steg 2: Lägg till den fasta kostnaden för ${s.fixedName} (${b} kr).` : `Step 2: Add the fixed cost for the ${s.fixedName} (${b} kr).`, latex: `${a}x + ${b}` },
            { text: lang === 'sv' ? `Steg 3: Sätt hela uttrycket lika med det totala beloppet ${c} kr.` : `Step 3: Set the entire expression equal to the total amount of ${c} kr.`, latex: `${equation}` }
        ] : [
            { text: lang === 'sv' ? `Börja med att ta bort den fasta avgiften (${b}) från totalsumman.` : `Start by removing the fixed fee (${b}) from the total amount.`, latex: `${a}x = ${c} - ${b} = ${c-b}` },
            { text: lang === 'sv' ? `Dela nu resultatet med priset per enhet (${a}) för att få fram x.` : `Now divide the result by the price per unit (${a}) to find x.`, latex: `x = \\frac{${c-b}}{${a}} = ${x}` }
        ];

        return {
            renderData: { description: desc, answerType: 'text', latex: "" },
            token: this.toBase64(mode === 'write' ? equation : x.toString()),
            clues,
            metadata: { variation_key: `rate_fixed_add_${mode}`, difficulty: mode === 'write' ? 3 : 4 }
        };
    }

    // --- Type B: ax - b = c (Rate - Discount) ---
    private scenarioB_RateMinusFixed(lang: string, mode: 'write' | 'solve') {
        const x = MathUtils.randomInt(2, 6);
        const a = MathUtils.randomInt(150, 450);
        const b = MathUtils.randomChoice([100, 200, 300]);
        const c = a * x - b;

        const desc = lang === 'sv'
            ? `Du köper x stycken datorspel som kostar ${a} kr styck. Eftersom du har ett presentkort får du ${b} kr rabatt på hela köpet. Du betalar till slut ${c} kr. ${this.getTaskText(lang, mode)}`
            : `You buy x computer games that cost ${a} kr each. Since you have a gift card, you get a ${b} kr discount on the total. You end up paying ${c} kr. ${this.getTaskText(lang, mode)}`;

        const equation = `${a}x-${b}=${c}`;
        const clues = mode === 'write' ? [
            { text: lang === 'sv' ? `Steg 1: Beräkna vad spelen kostar tillsammans utan rabatt.` : `Step 1: Calculate what the games cost together without the discount.`, latex: `${a}x` },
            { text: lang === 'sv' ? `Steg 2: Subtrahera rabatten på ${b} kr från uttrycket.` : `Step 2: Subtract the discount of ${b} kr from the expression.`, latex: `${a}x - ${b}` },
            { text: lang === 'sv' ? `Steg 3: Sätt detta lika med vad du faktiskt betalade (${c} kr).` : `Step 3: Set this equal to what you actually paid (${c} kr).`, latex: `${equation}` }
        ] : [
            { text: lang === 'sv' ? `Addera rabatten (${b}) till summan för att se vad det kostade före rabatten.` : `Add the discount (${b}) to the total to see the cost before the discount.`, latex: `${a}x = ${c} + ${b} = ${c+b}` },
            { text: lang === 'sv' ? `Dela det beloppet med styckpriset (${a}) för att hitta antalet spel.` : `Divide that amount by the unit price (${a}) to find the number of games.`, latex: `x = ${x}` }
        ];

        return {
            renderData: { description: desc, answerType: 'text', latex: "" },
            token: this.toBase64(mode === 'write' ? equation : x.toString()),
            clues,
            metadata: { variation_key: `rate_fixed_sub_${mode}`, difficulty: mode === 'write' ? 3 : 4 }
        };
    }

    // --- Type C: Compare Sum (x + (x+a) = c) ---
    private scenarioC_CompareSum(lang: string, mode: 'write' | 'solve') {
        const names = lang === 'sv' ? ["Lukas", "Maja"] : ["Lucas", "Maya"];
        const diff = MathUtils.randomInt(5, 15);
        const x = MathUtils.randomInt(10, 40);
        const total = 2 * x + diff;

        const desc = lang === 'sv'
            ? `${names[0]} har x kr. ${names[1]} har ${diff} kr mer än ${names[0]}. Tillsammans har de ${total} kr. ${this.getTaskText(lang, mode)}`
            : `${names[0]} has x kr. ${names[1]} has ${diff} kr more than ${names[0]}. Together they have ${total} kr. ${this.getTaskText(lang, mode)}`;

        const equation = `2x+${diff}=${total}`;
        const clues = mode === 'write' ? [
            { text: lang === 'sv' ? `${names[0]}s pengar: x. ${names[1]}s pengar: (x + ${diff}).` : `${names[0]}'s money: x. ${names[1]}'s money: (x + ${diff}).`, latex: "" },
            { text: lang === 'sv' ? `Summera dem: x + (x + ${diff}) = 2x + ${diff}.` : `Sum them up: x + (x + ${diff}) = 2x + ${diff}.`, latex: `${equation}` }
        ] : [
            { text: lang === 'sv' ? `Ta bort skillnaden (${diff}) från totalen för att få reda på vad de har om de hade haft lika mycket.` : `Subtract the difference (${diff}) from the total to find out what they have if they were equal.`, latex: `2x = ${total} - ${diff} = ${total-diff}` },
            { text: lang === 'sv' ? "Dela nu resultatet med 2 för att hitta värdet på x." : "Now divide the result by 2 to find the value of x.", latex: `x = ${x}` }
        ];

        return {
            renderData: { description: desc, answerType: 'text', latex: "" },
            token: this.toBase64(mode === 'write' ? equation : x.toString()),
            clues,
            metadata: { variation_key: `compare_word_sum_${mode}`, difficulty: 4 }
        };
    }

    // --- Type D: Compare Diff (x + (x-b) = c) ---
    private scenarioD_CompareDiff(lang: string, mode: 'write' | 'solve') {
        const length = MathUtils.randomInt(60, 150);
        const diff = MathUtils.randomInt(10, 30);
        const x = (length + diff) / 2;
        if (!Number.isInteger(x)) return this.scenarioD_CompareDiff(lang, mode);

        const desc = lang === 'sv'
            ? `En planka som är ${length} cm lång kapas i två bitar. Den långa biten är x cm. Den korta biten är ${diff} cm kortare än den långa. ${this.getTaskText(lang, mode)}`
            : `A plank that is ${length} cm long is cut into two pieces. The long piece is x cm. The short piece is ${diff} cm shorter than the long one. ${this.getTaskText(lang, mode)}`;

        const equation = `2x-${diff}=${length}`;
        const clues = mode === 'write' ? [
            { text: lang === 'sv' ? `Lång bit: x. Kort bit: (x - ${diff}).` : `Long piece: x. Short piece: (x - ${diff}).`, latex: "" },
            { text: lang === 'sv' ? `Lägg ihop bitarna: x + (x - ${diff}) = 2x - ${diff}.` : `Add the pieces: x + (x - ${diff}) = 2x - ${diff}.`, latex: `${equation}` }
        ] : [
            { text: lang === 'sv' ? `Lägg till skillnaden (${diff}) till plankans längd för att göra bitarna lika långa i din beräkning.` : `Add the difference (${diff}) to the plank's length to make the pieces equal in your calculation.`, latex: `2x = ${length} + ${diff} = ${length+diff}` },
            { text: lang === 'sv' ? "Dela totalen med 2 för att hitta den längsta biten x." : "Divide the total by 2 to find the longest piece x.", latex: `x = ${x}` }
        ];

        return {
            renderData: { description: desc, answerType: 'text', latex: "" },
            token: this.toBase64(mode === 'write' ? equation : x.toString()),
            clues,
            metadata: { variation_key: `compare_word_diff_${mode}`, difficulty: 4 }
        };
    }
}