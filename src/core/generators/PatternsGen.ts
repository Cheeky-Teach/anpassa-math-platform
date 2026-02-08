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

    /**
     * Phase 2: Targeted Generation
     * Allows the Question Studio to request a specific skill bucket.
     */
    public generateByVariation(key: string, lang: string = 'sv'): any {
        switch (key) {
            case 'seq_lie':
            case 'seq_type':
            case 'seq_diff':
            case 'seq_next':
                return this.level1_Sequences(lang, key);
            
            case 'high_term':
                return this.level2_HighTerm(lang, key);
            
            case 'formula_missing':
            case 'visual_calc':
            case 'find_formula':
                return this.level3_VisualFormula(lang, key);
            
            case 'table_formula':
            case 'table_fill':
                return this.level4_TableToFormula(lang, key);
            
            case 'reverse_calc':
                return this.level5_ReverseEngineering(lang, key);

            default:
                return this.generate(1, lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    /**
     * Internal helper to generate matchstick figure data for PatternVisual.jsx
     */
    private generateMatchstickData(type: 'squares' | 'triangles' | 'houses', count: number) {
        const sticks: { x1: number, y1: number, x2: number, y2: number }[] = [];
        const unitW = 40;
        const padding = 10;

        for (let i = 0; i < count; i++) {
            const xOffset = padding + (i * unitW);
            
            if (type === 'squares') {
                // Top
                sticks.push({ x1: xOffset, y1: 40, x2: xOffset + unitW, y2: 40 });
                // Bottom
                sticks.push({ x1: xOffset, y1: 80, x2: xOffset + unitW, y2: 80 });
                // Right
                sticks.push({ x1: xOffset + unitW, y1: 40, x2: xOffset + unitW, y2: 80 });
                // Left (only for the first one)
                if (i === 0) sticks.push({ x1: xOffset, y1: 40, x2: xOffset, y2: 80 });
            } 
            else if (type === 'triangles') {
                // Bottom
                sticks.push({ x1: xOffset, y1: 80, x2: xOffset + unitW, y2: 80 });
                // Right Slant Down
                sticks.push({ x1: xOffset + unitW / 2, y1: 40, x2: xOffset + unitW, y2: 80 });
                // Left Slant Up (only for the first one)
                if (i === 0) sticks.push({ x1: xOffset, y1: 80, x2: xOffset + unitW / 2, y2: 40 });
            }
            else if (type === 'houses') {
                // Square Base: Left, Bottom, Right
                if (i === 0) sticks.push({ x1: xOffset, y1: 50, x2: xOffset, y2: 90 }); // Left
                sticks.push({ x1: xOffset, y1: 90, x2: xOffset + unitW, y2: 90 }); // Bottom
                sticks.push({ x1: xOffset + unitW, y1: 50, x2: xOffset + unitW, y2: 90 }); // Right
                
                // Roof Slants
                sticks.push({ x1: xOffset, y1: 50, x2: xOffset + unitW / 2, y2: 20 });
                sticks.push({ x1: xOffset + unitW / 2, y1: 20, x2: xOffset + unitW, y2: 50 });
                
                // Horizontal separator (ceiling)
                sticks.push({ x1: xOffset, y1: 50, x2: xOffset + unitW, y2: 50 });
            }
        }

        return {
            width: (count * unitW) + (padding * 2),
            height: 100,
            sticks
        };
    }

    // --- LEVEL 1: SEQUENCES ---
    private level1_Sequences(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['seq_lie', 'seq_type', 'seq_diff', 'seq_next']);

        if (v === 'seq_lie') {
            const start = MathUtils.randomInt(2, 10);
            const diff = MathUtils.randomInt(2, 5);
            const seq = [start, start + diff, start + diff * 2, start + diff * 3];
            
            const sTrue1 = lang === 'sv' ? `Ökningen är ${diff}` : `The increase is ${diff}`;
            const sTrue2 = lang === 'sv' ? `Starttalet är ${start}` : `The starting number is ${start}`;
            const sFalse = lang === 'sv' ? `Nästa tal är ${seq[3] + diff + 1}` : `The next number is ${seq[3] + diff + 1}`;

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Studera noga hur talföljden förändras: ${seq.join(', ')}... Vilket av påståendena nedan är FALSKT?` 
                        : `Examine how the sequence changes: ${seq.join(', ')}... Which of the statements below is FALSE?`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([sTrue1, sTrue2, sFalse]),
                    geometry: { type: 'pattern', subtype: 'sequence', sequence: [...seq, '...'] }
                },
                token: this.toBase64(sFalse),
                clues: [{ text: lang === 'sv' ? "Kontrollera skillnaden mellan talen och beräkna vad nästa steg logiskt borde bli." : "Check the difference between the numbers and calculate what the next step logically should be." }],
                metadata: { variation_key: 'seq_lie', difficulty: 1 }
            };
        }

        if (v === 'seq_type') {
            const isGeo = Math.random() > 0.5;
            const start = MathUtils.randomInt(2, 5);
            const factor = MathUtils.randomInt(2, 3);
            const seq = isGeo 
                ? [start, start * factor, start * Math.pow(factor, 2), start * Math.pow(factor, 3)]
                : [start, start + factor, start + factor * 2, start + factor * 3];

            const ans = isGeo ? (lang === 'sv' ? "Geometriskt" : "Geometric") : (lang === 'sv' ? "Aritmetiskt" : "Arithmetic");
            const wrong = isGeo ? (lang === 'sv' ? "Aritmetiskt" : "Arithmetic") : (lang === 'sv' ? "Geometriskt" : "Geometric");

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Titta på talföljden: ${seq.join(', ')}... Är detta ett aritmetiskt mönster (plus/minus) eller ett geometriskt mönster (gånger/delat)?` 
                        : `Look at the sequence: ${seq.join(', ')}... Is this an arithmetic pattern (plus/minus) or a geometric pattern (times/divide)?`,
                    answerType: 'multiple_choice',
                    options: [ans, wrong],
                    geometry: { type: 'pattern', subtype: 'sequence', sequence: [...seq, '...'] }
                },
                token: this.toBase64(ans),
                clues: [{ text: lang === 'sv' ? "Aritmetiska mönster ökar eller minskar med samma summa varje gång. Geometriska mönster förändras genom multiplikation eller division." : "Arithmetic patterns increase or decrease by the same sum each time. Geometric patterns change through multiplication or division." }],
                metadata: { variation_key: 'seq_type', difficulty: 2 }
            };
        }

        const diff = MathUtils.randomInt(2, 9);
        const start = MathUtils.randomInt(1, 15);
        const seq = [start, start + diff, start + diff * 2, start + diff * 3];

        if (v === 'seq_diff') {
            return {
                renderData: {
                    description: lang === 'sv' ? `Här är en talföljd: ${seq.join(', ')}... Hur stor är den konstanta ökningen (differensen) i mönstret?` : `Here is a sequence: ${seq.join(', ')}... What is the constant increase (difference) in the pattern?`,
                    answerType: 'numeric',
                    geometry: { type: 'pattern', subtype: 'sequence', sequence: [...seq, '...'] }
                },
                token: this.toBase64(diff.toString()),
                clues: [{ text: lang === 'sv' ? "Ta ett tal i följden och dra ifrån talet som står precis före." : "Take a number in the sequence and subtract the number that stands just before it.", latex: `${seq[1]} - ${seq[0]} = ${diff}` }],
                metadata: { variation_key: 'seq_diff', difficulty: 1 }
            };
        }

        return {
            renderData: {
                description: lang === 'sv' ? `Vilket tal kommer härnäst i mönstret: ${seq.join(', ')}?` : `What is the next number in the pattern: ${seq.join(', ')}?`,
                answerType: 'numeric',
                geometry: { type: 'pattern', subtype: 'sequence', sequence: [...seq, '?'] }
            },
            token: this.toBase64((seq[3] + diff).toString()),
            clues: [{ text: lang === 'sv' ? `Mönstret ökar med ${diff} i varje steg. Addera ${diff} till det sista kända talet i följden.` : `The pattern increases by ${diff} for each step. Add ${diff} to the last known number in the sequence.`, latex: `${seq[3]} + ${diff} = ${seq[3] + diff}` }],
            metadata: { variation_key: 'seq_next', difficulty: 1 }
        };
    }

    // --- LEVEL 2: HIGH TERM ---
    private level2_HighTerm(lang: string, variationKey?: string): any {
        const diff = MathUtils.randomInt(3, 9);
        const start = MathUtils.randomInt(2, 15); 
        const targetN = MathUtils.randomChoice([10, 20, 50, 100]);
        const ans = start + (targetN - 1) * diff;

        return {
            renderData: { 
                description: lang === 'sv' ? `I ett mönster som startar med ${start}, ${start + diff}, ${start + diff * 2}... vilket tal är nummer ${targetN} i ordningen?` : `In a pattern starting with ${start}, ${start + diff}, ${start + diff * 2}... what is the ${targetN}th number in the sequence?`, 
                answerType: 'numeric', 
                geometry: { type: 'pattern', subtype: 'sequence', sequence: [start, start + diff, start + diff * 2, '...'] } 
            },
            token: this.toBase64(ans.toString()),
            clues: [
                { text: lang === 'sv' ? `Använd en genväg: För att nå nummer ${targetN} från det första talet behöver du göra ${targetN - 1} hopp.` : `Use a shortcut: To reach number ${targetN} from the first number, you need to make ${targetN - 1} jumps.`, latex: "" },
                { text: lang === 'sv' ? "Multiplicera antalet hopp med ökningen och lägg till starttalet." : "Multiply the number of jumps by the increase and add the starting number.", latex: `${start} + (${targetN} - 1) \\cdot ${diff} = ${ans}` }
            ],
            metadata: { variation_key: 'high_term', difficulty: 2 }
        };
    }

    // --- LEVEL 3: VISUAL FORMULAS (With Matchstick Logic) ---
    private level3_VisualFormula(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['formula_missing', 'visual_calc', 'find_formula']);
        
        // Scenario definitions for matchstick growth
        const scenarios = [
            { type: 'squares', diff: 3, unitConst: 1, nameSv: "kvadrater", nameEn: "squares" },
            { type: 'triangles', diff: 2, unitConst: 1, nameSv: "trianglar", nameEn: "triangles" },
            { type: 'houses', diff: 5, unitConst: 1, nameSv: "hus", nameEn: "houses" }
        ];

        const s = MathUtils.randomChoice(scenarios);
        const offset = MathUtils.randomInt(0, 2); // Random offset for starting count (e.g. Fig 1 has 2 houses)
        
        // n is figure index. x is actual object count.
        // x = n + offset
        // Sticks = diff * (n + offset) + unitConst
        // Sticks = (diff)n + (diff * offset + unitConst)
        const a = s.diff;
        const b = s.diff * offset + s.unitConst;
        const objName = lang === 'sv' ? s.nameSv : s.nameEn;

        // Generate visuals for Fig 1, Fig 2, Fig 3
        const figures = [
            this.generateMatchstickData(s.type as any, 1 + offset),
            this.generateMatchstickData(s.type as any, 2 + offset),
            this.generateMatchstickData(s.type as any, 3 + offset)
        ];

        const val1 = a * 1 + b;

        if (v === 'formula_missing') {
            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Mönstret av ${objName} följer formeln $V = ?n + ${b}$. Om figur 1 består av ${val1} stickor, vilket tal saknas då i formeln?` 
                        : `The pattern of ${objName} follows the formula $V = ?n + ${b}$. If figure 1 consists of ${val1} sticks, what number is missing in the formula?`,
                    answerType: 'numeric',
                    geometry: { type: 'pattern', subtype: 'matchsticks', figures: [figures[0], figures[1]] }
                },
                token: this.toBase64(a.toString()),
                clues: [{ text: lang === 'sv' ? "Talet som står framför n motsvarar mönstrets ökning. Hur många nya stickor tillkommer för varje ny figur?" : "The number in front of n corresponds to the pattern's increase. How many new sticks are added for each new figure?", latex: `${a * 2 + b} - ${a * 1 + b} = ${a}` }],
                metadata: { variation_key: 'formula_missing', difficulty: 3 }
            };
        }

        if (v === 'visual_calc') {
            const target = MathUtils.randomChoice([10, 20]);
            const ans = a * target + b;
            return {
                renderData: {
                    description: lang === 'sv' ? `Mönstret för ${objName} beskrivs av formeln $V = ${a}n + ${b}$. Hur många stickor behövs för att bygga figur nummer ${target}?` : `The pattern for ${objName} is described by the formula $V = ${a}n + ${b}$. How many sticks are needed to build figure number ${target}?`,
                    answerType: 'numeric',
                    geometry: { type: 'pattern', subtype: 'matchsticks', figures }
                },
                token: this.toBase64(ans.toString()),
                clues: [{ text: lang === 'sv' ? `Sätt in figurnumret ${target} istället för n i formeln.` : `Insert the figure number ${target} instead of n in the formula.`, latex: `${a} \\cdot ${target} + ${b} = ${ans}` }],
                metadata: { variation_key: 'visual_calc', difficulty: 2 }
            };
        }

        // find_formula
        return {
            renderData: {
                description: lang === 'sv' ? `Vilken formel på formen $an + b$ beskriver antalet stickor i mönstret av ${objName}?` : `Which formula of the form $an + b$ describes the number of sticks in the pattern of ${objName}?`,
                answerType: 'text',
                geometry: { type: 'pattern', subtype: 'matchsticks', figures } 
            },
            token: this.toBase64(`${a}n+${b}`),
            clues: [
                { text: lang === 'sv' ? `Steg 1: Hitta ökningen 'a' genom att se hur många nya stickor som läggs till per figur.` : `Step 1: Find the increase 'a' by seeing how many new sticks are added per figure.`, latex: `a = ${a}` },
                { text: lang === 'sv' ? "Steg 2: Hitta startvärdet 'b' genom att ta värdet i figur 1 minus ökningen." : "Step 2: Find the starting value 'b' by taking the value in figure 1 minus the increase.", latex: `${val1} - ${a} = ${b}` }
            ],
            metadata: { variation_key: 'find_formula', difficulty: 3 }
        };
    }

    // --- LEVEL 4: TABLE TO FORMULA ---
    private level4_TableToFormula(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['table_formula', 'table_fill']);
        const a = MathUtils.randomInt(2, 6);
        const b = MathUtils.randomInt(1, 5);
        const rows = [[1, a + b], [2, a * 2 + b], [3, a * 3 + b], [4, a * 4 + b]];

        if (v === 'table_formula') {
            return {
                renderData: {
                    description: lang === 'sv' ? "Studera värdena i tabellen noggrant. Vilken formel på formen $an + b$ beskriver sambandet mellan n och värdet?" : "Study the values in the table carefully. Which formula of the form $an + b$ describes the relationship between n and the value?",
                    answerType: 'text',
                    geometry: { type: 'frequency_table', headers: ['n', 'Värde'], rows }
                },
                token: this.toBase64(`${a}n+${b}`),
                clues: [{ text: lang === 'sv' ? `Titta på hur mycket värdet ökar för varje steg n. Det är din 'a'-koefficient.` : `Look at how much the value increases for each step n. That is your 'a' coefficient.`, latex: `a = ${a}` }],
                metadata: { variation_key: 'table_formula', difficulty: 3 }
            };
        }

        const targetN = 5;
        const targetVal = a * targetN + b;
        return {
            renderData: {
                description: lang === 'sv' ? `Använd det mönster som tabellen visar för att räkna ut vilket värde som hör till figurnummer n = ${targetN}.` : `Use the pattern shown in the table to calculate which value corresponds to figure number n = ${targetN}.`,
                answerType: 'numeric',
                geometry: { type: 'frequency_table', headers: ['n', 'Värde'], rows }
            },
            token: this.toBase64(targetVal.toString()),
            clues: [{ text: lang === 'sv' ? `Mönstret i tabellen har en konstant ökning på ${a}. Addera detta till det sista kända värdet.` : `The pattern in the table has a constant increase of ${a}. Add this to the last known value.`, latex: `${rows[3][1]} + ${a} = ${targetVal}` }],
            metadata: { variation_key: 'table_fill', difficulty: 2 }
        };
    }

    // --- LEVEL 5: REVERSE ENGINEERING ---
    private level5_ReverseEngineering(lang: string, variationKey?: string): any {
        const a = MathUtils.randomInt(3, 8);
        const b = MathUtils.randomInt(2, 10);
        const n = MathUtils.randomInt(10, 50);
        const total = a * n + b;
        const formula = `${a}n + ${b}`;

        return {
            renderData: {
                description: lang === 'sv'
                    ? `Ett växande mönster beskrivs av formeln $V = ${formula}$. Vilket figurnummer (n) har mönstret när det totala värdet är uppe i ${total}?`
                    : `A growing pattern is described by the formula $V = ${formula}$. Which figure number (n) does the pattern have when the total value reaches ${total}?`,
                answerType: 'numeric'
            },
            token: this.toBase64(n.toString()),
            clues: [
                { text: lang === 'sv' ? `Arbeta baklänges: Börja med att dra bort det fasta värdet (${b}) från det totala värdet.` : `Work backwards: Start by subtracting the fixed value (${b}) from the total value.`, latex: `${total} - ${b} = ${total - b}` },
                { text: lang === 'sv' ? `Dela sedan det kvarvarande värdet med den konstanta ökningen (${a}) för att hitta n.` : `Then divide the remaining value by the constant increase (${a}) to find n.`, latex: `\\frac{${total - b}}{${a}} = ${n}` }
            ],
            metadata: { variation_key: 'reverse_calc', difficulty: 4 }
        };
    }
}