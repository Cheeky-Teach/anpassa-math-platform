import { MathUtils } from '../utils/MathUtils.js';

export class PatternsGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_Sequences(lang);
            case 2: return this.level2_HighTerm(lang);
            case 3: return this.level3_VisualFormula(lang);
            case 4: return this.level4_TableToFormula(lang);
            case 5: return this.level5_ReverseEngineering(lang);
            default: return this.level1_Sequences(lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    // --- LEVEL 1: Sequences ---
    private level1_Sequences(lang: string): any {
        const variation = Math.random();

        // VARIATION A: Spot the Lie (Properties)
        if (variation < 0.25) {
            const start = MathUtils.randomInt(2, 10);
            const diff = MathUtils.randomInt(2, 5);
            const seq = [start, start + diff, start + diff * 2, start + diff * 3];
            
            const sTrue1 = lang==='sv' ? `Ökningen är ${diff}` : `Increase is ${diff}`;
            const sTrue2 = lang==='sv' ? `Starttalet är ${start}` : `Starting number is ${start}`;
            
            const lieType = MathUtils.randomInt(0, 1);
            let sFalse = "";
            if (lieType === 0) {
                const wrongNext = seq[3] + diff + MathUtils.randomChoice([1, -1]);
                sFalse = lang==='sv' ? `Nästa tal är ${wrongNext}` : `Next number is ${wrongNext}`;
            } else {
                sFalse = lang==='sv' ? "Mönstret minskar" : "The pattern is decreasing";
            }

            return {
                renderData: {
                    description: lang==='sv' 
                        ? `Mönster: ${seq.join(', ')}... Vilket påstående är FALSKT?` 
                        : `Pattern: ${seq.join(', ')}... Which statement is FALSE?`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([sTrue1, sTrue2, sFalse]),
                    geometry: { type: 'pattern', subtype: 'sequence', sequence: [...seq, '...'] }
                },
                token: this.toBase64(sFalse),
                clues: [
                    {
                        text: lang === 'sv' ? `Kolla mönstret själv. Om du plussar på ${diff} till det sista talet (${seq[3]}), vad får du då?` : `Check the pattern yourself. If you add ${diff} to the last number (${seq[3]}), what do you get?`,
                        latex: ""
                    }
                ]
            };
        }

        // VARIATION B: Concept Check (Arith vs Geo)
        if (variation < 0.5) {
            const isGeo = Math.random() > 0.5;
            const start = MathUtils.randomInt(2, 5);
            const factor = MathUtils.randomInt(2, 3);
            
            let seq: number[] = [];
            if (isGeo) {
                seq = [start, start*factor, start*factor*factor, start*factor*factor*factor];
            } else {
                seq = [start, start+factor, start+factor*2, start+factor*3];
            }

            const q = lang==='sv' 
                ? "Är mönstret Aritmetiskt (+/-) eller Geometriskt (* /)?" 
                : "Is the pattern Arithmetic (+/-) or Geometric (* /)?";
            
            const ans = isGeo ? (lang==='sv'?"Geometriskt":"Geometric") : (lang==='sv'?"Aritmetiskt":"Arithmetic");
            const wrong = isGeo ? (lang==='sv'?"Aritmetiskt":"Arithmetic") : (lang==='sv'?"Geometriskt":"Geometric");

            return {
                renderData: {
                    description: q,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([ans, wrong]),
                    geometry: { type: 'pattern', subtype: 'sequence', sequence: [...seq, '...'] }
                },
                token: this.toBase64(ans),
                clues: [
                    {
                        text: lang === 'sv' ? "Titta på hur talen ändras. Hoppar de lika mycket varje steg (addera), eller fördubblas de (multiplicera)?" : "Look at how numbers change. Do they jump by the same amount (adding) or do they double/triple (multiplying)?",
                        latex: ""
                    }
                ]
            };
        }

        // VARIATION C: Find Difference
        if (variation < 0.75) {
            const diff = MathUtils.randomInt(2, 9);
            const start = MathUtils.randomInt(1, 15);
            const seq = [start, start+diff, start+diff*2, start+diff*3];
            
            return {
                renderData: {
                    description: lang==='sv' ? "Vad är skillnaden (ökningen) mellan talen?" : "What is the difference (increase) between the numbers?",
                    answerType: 'numeric',
                    geometry: { type: 'pattern', subtype: 'sequence', sequence: [...seq, '...'] }
                },
                token: this.toBase64(diff.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? "Hur stort är hoppet från det första talet till det andra?" : "How big is the jump from the first number to the second?",
                        latex: `${seq[1]} - ${seq[0]} = ?` 
                    }
                ]
            };
        }

        // VARIATION D: Standard Next Number
        const diff = MathUtils.randomInt(2, 8);
        const start = MathUtils.randomInt(1, 12);
        const s = [start, start+diff, start+diff*2, start+diff*3];
        return {
            renderData: {
                description: lang==='sv' ? "Vad är nästa tal?" : "What is the next number?",
                answerType: 'numeric',
                geometry: { type: 'pattern', subtype: 'sequence', sequence: [...s, '?'] }
            },
            token: this.toBase64((s[3]+diff).toString()),
            clues: [
                {
                    text: lang === 'sv' ? "Mönstret ökar lika mycket varje gång. Lägg till ökningen på det sista talet." : "The pattern increases by the same amount each time. Add that increase to the last number.",
                    latex: `${s[3]} + ${diff} = ?`
                }
            ]
        };
    }

    // --- LEVEL 2: High Term ---
    private level2_HighTerm(lang: string): any {
        const diff = MathUtils.randomInt(3, 9);
        const start = MathUtils.randomInt(2, 15); 
        const targetN = MathUtils.randomChoice([10, 20, 50, 100]);
        const ans = start + (targetN - 1) * diff;

        return {
            renderData: { 
                description: lang==='sv' ? `Vilket tal är nummer ${targetN} i mönstret?` : `What is number ${targetN} in the pattern?`, 
                answerType: 'numeric', 
                geometry: { type: 'pattern', subtype: 'sequence', sequence: [start, start+diff, start+diff*2, '...'] } 
            },
            token: this.toBase64(ans.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? "Istället för att plussa hela vägen, ta en genväg. Vi startar på det första talet och gör sedan ett visst antal hopp." : "Instead of adding all the way, take a shortcut. Start at the first number, then take a specific number of jumps.",
                    latex: "" 
                },
                {
                    text: lang === 'sv' ? `För att komma till nummer ${targetN} behöver du göra ${targetN-1} hopp.` : `To get to number ${targetN}, you need to make ${targetN-1} jumps.`,
                    latex: `${start} + (${targetN}-1) \\cdot ${diff}`
                }
            ]
        };
    }

    // --- LEVEL 3: Visual Formulas ---
    private level3_VisualFormula(lang: string): any {
        const variation = Math.random();
        const a = MathUtils.randomInt(2, 5);
        const b = MathUtils.randomInt(1, 4);

        // VARIATION A: Missing Coefficient
        if (variation < 0.3) {
            const val1 = a + b;
            return {
                renderData: {
                    description: lang==='sv' 
                        ? `Formeln är ?n + ${b}. Figur 1 har värdet ${val1}. Vad är det saknade talet?`
                        : `The formula is ?n + ${b}. Figure 1 has value ${val1}. What is the missing number?`,
                    answerType: 'numeric',
                    geometry: null
                },
                token: this.toBase64(a.toString()),
                clues: [
                    { 
                        text: lang==='sv' ? "Talet framför 'n' berättar hur mycket mönstret växer med. Hur mycket större är Figur 1 än den fasta delen?" : "The number before 'n' tells you how much the pattern grows. How much bigger is Figure 1 than the fixed part?", 
                        latex: `${val1} - ${b} = ?` 
                    }
                ]
            };
        }

        // VARIATION B: Inverse Visual
        if (variation < 0.6) {
            const target = MathUtils.randomChoice([10, 20, 50]);
            const ans = a * target + b;
            return {
                renderData: {
                    description: lang==='sv'
                        ? `Formeln för ett mönster är ${a}n + ${b}. Hur många stickor har Figur ${target}?`
                        : `The pattern formula is ${a}n + ${b}. How many sticks are in Figure ${target}?`,
                    answerType: 'numeric',
                    geometry: null
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    {
                        text: lang === 'sv' ? `Formeln är som ett recept. Byt ut 'n' mot ${target} och räkna ut.` : `The formula is like a recipe. Swap 'n' for ${target} and calculate.`,
                        latex: `${a} \\cdot ${target} + ${b}`
                    }
                ]
            };
        }

        // VARIATION C: Standard Formula
        const seq = [a+b, a*2+b, a*3+b];
        return {
            renderData: {
                description: lang==='sv' ? "Vilken formel (an+b) beskriver mönstret?" : "Which formula (an+b) describes the pattern?",
                answerType: 'text',
                geometry: { type: 'pattern', subtype: 'sequence', sequence: seq } 
            },
            token: this.toBase64(`${a}n+${b}`),
            clues: [
                {
                    text: lang === 'sv' ? "Talet som står med 'n' är alltid ökningen mellan talen." : "The number with 'n' is always the increase between the numbers.",
                    latex: `\\text{Ökning} = ${a}`
                },
                {
                    text: lang === 'sv' ? "Talet som står ensamt är det vi startar med (innan steg 1). Ta första talet minus ökningen." : "The lone number is what we start with (before step 1). Take the first number minus the increase.",
                    latex: `${seq[0]} - ${a} = ${b}`
                }
            ]
        };
    }

    // --- LEVEL 4: Table to Formula ---
    private level4_TableToFormula(lang: string): any {
        const variation = Math.random();
        const a = MathUtils.randomInt(2, 6);
        const b = MathUtils.randomInt(0, 5);
        const rows = [
            { n: 1, v: a+b }, { n: 2, v: a*2+b }, { n: 3, v: a*3+b }, { n: 4, v: a*4+b }
        ];

        // VARIATION A: Find Formula
        if (variation < 0.5) {
            return {
                renderData: {
                    description: lang==='sv' ? "Hitta formeln för tabellen (an+b):" : "Find the formula for the table (an+b):",
                    answerType: 'text',
                    geometry: { type: 'frequency_table', headers: ['n', 'Val'], rows: rows.map(r => [r.n, r.v]) }
                },
                token: this.toBase64(b === 0 ? `${a}n` : `${a}n+${b}`),
                clues: [
                    { text: lang==='sv' ? "Kolla hur mycket värdet ökar för varje steg n. Det är talet som ska stå före n." : "Check how much the value increases for each step n. That's the number that goes before n.", latex: `+${a}` }
                ]
            };
        }

        // VARIATION B: Fill Missing Value
        const targetN = 5;
        const targetVal = a * targetN + b;
        return {
            renderData: {
                description: lang==='sv' ? `Vad är värdet när n=${targetN}?` : `What is the value when n=${targetN}?`,
                answerType: 'numeric',
                geometry: { type: 'frequency_table', headers: ['n', 'Val'], rows: rows.map(r => [r.n, r.v]) }
            },
            token: this.toBase64(targetVal.toString()),
            clues: [
                { text: lang==='sv' ? "Du vet att mönstret ökar med samma tal varje gång. Lägg till ökningen på det sista värdet i tabellen." : "You know the pattern increases by the same number each time. Add the increase to the last value in the table.", latex: `${rows[3].v} + ${a} = ?` }
            ]
        };
    }

    // --- LEVEL 5: Reverse Engineering ---
    private level5_ReverseEngineering(lang: string): any {
        const a = MathUtils.randomInt(3, 8);
        const b = MathUtils.randomInt(2, 10);
        const n = MathUtils.randomInt(10, 50);
        const total = a * n + b;
        const formula = `${a}n + ${b}`;

        return {
            renderData: {
                description: lang === 'sv'
                    ? `Ett mönster följer formeln $V = ${formula}$. Vilket nummer ($n$) har figuren med värdet ${total}?`
                    : `A pattern follows the formula $V = ${formula}$. Which figure number ($n$) has the value ${total}?`,
                answerType: 'numeric',
                geometry: null
            },
            token: this.toBase64(n.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? "Jobba baklänges som en detektiv. Börja med totalen och ta bort den fasta delen." : "Work backwards like a detective. Start with the total and remove the fixed part.",
                    latex: `${total} - ${b} = ${total-b}` 
                },
                {
                    text: lang === 'sv' ? "Nu delar du resten med ökningen för att se vilket nummer det är." : "Now divide the remainder by the increase to see which number it is.",
                    latex: `${total-b} / ${a} = n`
                }
            ]
        };
    }
}