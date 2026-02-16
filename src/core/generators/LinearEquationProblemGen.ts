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

        let clues;
        if (mode === 'write') {
            clues = [
                { 
                    text: lang === 'sv' ? `Först uttrycker vi den rörliga kostnaden. Om varje enhet kostar ${a} kr, så kostar x stycken totalt ${a}x.` : `First, express the variable cost. If each unit costs ${a} kr, then x units cost ${a}x in total.`, 
                    latex: `${a}x` 
                },
                { 
                    text: lang === 'sv' ? `Sedan lägger vi till den fasta kostnaden på ${b} kr som betalas oavsett hur många x man har.` : `Next, add the fixed cost of ${b} kr that is paid regardless of how many x units you have.`, 
                    latex: `${a}x + ${b}` 
                },
                { 
                    text: lang === 'sv' ? `Slutligen sätter vi uttrycket lika med det totala beloppet ${c} kr.` : `Finally, set the expression equal to the total amount of ${c} kr.`, 
                    latex: `${a}x + ${b} = ${c}` 
                }
            ];
        } else {
            clues = [
                { 
                    text: lang === 'sv' ? `För att veta vad bara själva föremålen/kilometrarna kostade, drar vi bort den fasta avgiften (${b} kr) från totalsumman.` : `To find out the cost of just the items/kilometers, subtract the fixed fee (${b} kr) from the total sum.`, 
                    latex: `${a}x = ${c} - ${b} = ${c-b}` 
                },
                { 
                    text: lang === 'sv' ? `Eftersom vi nu vet att ${a} stycken kostar ${c-b} kr, delar vi med ${a} för att få fram värdet på x.` : `Since we now know that ${a} units cost ${c-b} kr, divide by ${a} to find the value of x.`, 
                    latex: `x = \\frac{${c-b}}{${a}} = ${x}` 
                }
            ];
        }

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
        let clues;
        if (mode === 'write') {
            clues = [
                { 
                    text: lang === 'sv' ? `Börja med att räkna ut vad spelen kostar tillsammans (${a} kr gånger x).` : `Start by calculating the cost of the games together (${a} kr times x).`, 
                    latex: `${a}x` 
                },
                { 
                    text: lang === 'sv' ? `Dra sedan bort rabatten på ${b} kr från det priset.` : `Then subtract the discount of ${b} kr from that price.`, 
                    latex: `${a}x - ${b}` 
                },
                { 
                    text: lang === 'sv' ? `Sätt detta lika med slutpriset du betalade (${c} kr).` : `Set this equal to the final price you paid (${c} kr).`, 
                    latex: `${a}x - ${b} = ${c}` 
                }
            ];
        } else {
            clues = [
                { 
                    text: lang === 'sv' ? `För att veta vad spelen kostade innan rabatten, lägger vi tillbaka de ${b} kr som drogs bort.` : `To find out what the games cost before the discount, we add back the ${b} kr that were subtracted.`, 
                    latex: `${a}x = ${c} + ${b} = ${c+b}` 
                },
                { 
                    text: lang === 'sv' ? `Nu när vi har priset utan rabatt, delar vi med styckpriset ${a} kr för att hitta antalet x.` : `Now that we have the price without the discount, divide by the unit price ${a} kr to find the number of x.`, 
                    latex: `x = \\frac{${c+b}}{${a}} = ${x}` 
                }
            ];
        }

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
        let clues;
        if (mode === 'write') {
            clues = [
                { 
                    text: lang === 'sv' ? `${names[0]} har x kr. Eftersom ${names[1]} har ${diff} mer, skriver vi det som (x + ${diff}).` : `${names[0]} has x kr. Since ${names[1]} has ${diff} more, we write that as (x + ${diff}).`, 
                    latex: `x + (x + ${diff})` 
                },
                { 
                    text: lang === 'sv' ? `Slå ihop de två x-termerna (x + x = 2x) och sätt summan lika med ${total}.` : `Combine the two x-terms (x + x = 2x) and set the sum equal to ${total}.`, 
                    latex: `2x + ${diff} = ${total}` 
                }
            ];
        } else {
            clues = [
                { 
                    text: lang === 'sv' ? `Vi börjar med att ta bort "överskottet" på ${diff} kr för att se vad de skulle ha om de hade exakt lika mycket pengar.` : `We start by removing the "excess" of ${diff} kr to see what they would have if they had exactly the same amount of money.`, 
                    latex: `2x = ${total} - ${diff} = ${total-diff}` 
                },
                { 
                    text: lang === 'sv' ? `Eftersom resultatet motsvarar två personers lika stora summor, delar vi med 2 för att hitta värdet på x.` : `Since the result corresponds to two people's equal sums, we divide by 2 to find the value of x.`, 
                    latex: `x = \\frac{${total-diff}}{2} = ${x}` 
                }
            ];
        }

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
        let clues;
        if (mode === 'write') {
            clues = [
                { 
                    text: lang === 'sv' ? `Den långa biten är x. Den korta är ${diff} cm kortare, vilket skrivs som (x - ${diff}).` : `The long piece is x. The short one is ${diff} cm shorter, which is written as (x - ${diff}).`, 
                    latex: `x + (x - ${diff})` 
                },
                { 
                    text: lang === 'sv' ? `Förenkla genom att lägga ihop bitarna (2x) och sätt det lika med den totala längden ${length} cm.` : `Simplify by adding the pieces together (2x) and set it equal to the total length ${length} cm.`, 
                    latex: `2x - ${diff} = ${length}` 
                }
            ];
        } else {
            clues = [
                { 
                    text: lang === 'sv' ? `Om vi "lägger till" de ${diff} cm som saknas på den korta biten, skulle vi ha två bitar som båda är x cm långa.` : `If we "add" the missing ${diff} cm to the short piece, we would have two pieces that are both x cm long.`, 
                    latex: `2x = ${length} + ${diff} = ${length+diff}` 
                },
                { 
                    text: lang === 'sv' ? `Dela nu den nya totala längden med 2 för att få fram längden på den långa biten x.` : `Now divide the new total length by 2 to find the length of the long piece x.`, 
                    latex: `x = \\frac{${length+diff}}{2} = ${x}` 
                }
            ];
        }

        return {
            renderData: { description: desc, answerType: 'text', latex: "" },
            token: this.toBase64(mode === 'write' ? equation : x.toString()),
            clues,
            metadata: { variation_key: `compare_word_diff_${mode}`, difficulty: 4 }
        };
    }
}