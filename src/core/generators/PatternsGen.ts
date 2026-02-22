import { MathUtils } from '../utils/MathUtils.js';

export class PatternsGen {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        // Adaptive Fallback: If Level 1 is mastered, push to Level 2
        if (level === 1 && options.hideConcept && options.exclude?.includes('seq_next')) {
            return this.level2_HighTerm(lang, undefined, options);
        }

        switch (level) {
            case 1: return this.level1_Sequences(lang, undefined, options);
            case 2: return this.level2_HighTerm(lang, undefined, options);
            case 3: return this.level3_VisualFormula(lang, undefined, options);
            case 4: return this.level4_TableToFormula(lang, undefined, options);
            case 5: return this.level5_ReverseEngineering(lang, undefined, options);
            default: return this.level1_Sequences(lang, undefined, options);
        }
    }

    /**
     * Targeted Generation for Question Studio
     * Maps ALL keys from skillBuckets.js to maintain visual/studio compatibility.
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

    private getVariation(pool: {key: string, type: 'concept' | 'calculate'}[], options: any): string {
        let filtered = pool;
        if (options?.exclude && options.exclude.length > 0) {
            filtered = filtered.filter(v => !options.exclude.includes(v.key));
        }
        if (options?.hideConcept) {
            filtered = filtered.filter(v => v.type !== 'concept');
        }
        if (filtered.length === 0) return pool[pool.length - 1].key;
        return MathUtils.randomChoice(filtered.map(v => v.key));
    }

    /**
     * Internal Logic for Matchstick Rendering
     * Dynamically generates stick coordinates for PatternComponents.jsx
     */
    private generateMatchstickData(type: 'squares' | 'triangles' | 'houses', count: number) {
        const sticks: { x1: number, y1: number, x2: number, y2: number }[] = [];
        const unitW = 40;
        const padding = 10;
        for (let i = 0; i < count; i++) {
            const xOffset = padding + (i * unitW);
            if (type === 'squares') {
                sticks.push({ x1: xOffset, y1: 40, x2: xOffset + unitW, y2: 40 });
                sticks.push({ x1: xOffset, y1: 80, x2: xOffset + unitW, y2: 80 });
                sticks.push({ x1: xOffset + unitW, y1: 40, x2: xOffset + unitW, y2: 80 });
                if (i === 0) sticks.push({ x1: xOffset, y1: 40, x2: xOffset, y2: 80 });
            } 
            else if (type === 'triangles') {
                sticks.push({ x1: xOffset, y1: 80, x2: xOffset + unitW, y2: 80 });
                sticks.push({ x1: xOffset + unitW / 2, y1: 40, x2: xOffset + unitW, y2: 80 });
                if (i === 0) sticks.push({ x1: xOffset, y1: 80, x2: xOffset + unitW / 2, y2: 40 });
            }
            else if (type === 'houses') {
                if (i === 0) sticks.push({ x1: xOffset, y1: 50, x2: xOffset, y2: 90 });
                sticks.push({ x1: xOffset, y1: 90, x2: xOffset + unitW, y2: 90 });
                sticks.push({ x1: xOffset + unitW, y1: 50, x2: xOffset + unitW, y2: 90 });
                sticks.push({ x1: xOffset, y1: 50, x2: xOffset + unitW / 2, y2: 20 });
                sticks.push({ x1: xOffset + unitW / 2, y1: 20, x2: xOffset + unitW, y2: 50 });
                sticks.push({ x1: xOffset, y1: 50, x2: xOffset + unitW, y2: 50 });
            }
        }
        return { width: (count * unitW) + (padding * 2), height: 100, sticks };
    }

    // --- LEVEL 1: SEQUENCES ---
    private level1_Sequences(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'seq_lie', type: 'concept' },
            { key: 'seq_type', type: 'concept' },
            { key: 'seq_diff', type: 'calculate' },
            { key: 'seq_next', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'seq_lie') {
            const start = MathUtils.randomInt(2, 8), diff = MathUtils.randomInt(3, 6);
            const seq = [start, start + diff, start + diff * 2, start + diff * 3];
            const lie = lang === 'sv' ? `Ökningen är ${diff + 1}` : `The increase is ${diff + 1}`;
            const sTrue1 = lang === 'sv' ? `Ökningen är ${diff}` : `The increase is ${diff}`;
            const sTrue2 = lang === 'sv' ? `Starttalet är ${start}` : `The starting number is ${start}`;

            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket påstående om talföljden är FALSKT?" : "Which statement about the sequence is FALSE?",
                    answerType: 'multiple_choice', options: MathUtils.shuffle([sTrue1, sTrue2, lie]),
                    geometry: { type: 'pattern', subtype: 'sequence', sequence: [...seq, '...'] }
                },
                token: this.toBase64(lie), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Beräkna skillnaden mellan de första talen." : "Step 1: Calculate the difference between the first numbers.", latex: `${seq[1]} - ${seq[0]} = ${diff}` },
                    { text: lang === 'sv' ? "Steg 2: Kontrollera om samma skillnad gäller för resten av följden." : "Step 2: Check if the same difference applies to the rest of the sequence.", latex: `${seq[2]} - ${seq[1]} = ${diff}` },
                    { text: lang === 'sv' ? `Eftersom ökningen är ${diff}, är påståendet "${lie}" lögnen.` : `Since the increase is ${diff}, the statement "${lie}" is the lie.` },
                    { text: lang === 'sv' ? `Svar: ${lie}` : `Answer: ${lie}` }
                ]
            };
        }

        const d = MathUtils.randomInt(3, 8), s = MathUtils.randomInt(1, 15);
        const seq = [s, s + d, s + d * 2, s + d * 3];

        if (v === 'seq_diff') {
            return {
                renderData: {
                    description: lang === 'sv' ? "Hur stor är skillnaden (differensen) mellan talen i mönstret?" : "How large is the difference between the numbers in the pattern?",
                    answerType: 'numeric',
                    geometry: { type: 'pattern', subtype: 'sequence', sequence: [...seq, '...'] }
                },
                token: this.toBase64(d.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Välj två tal som står bredvid varandra i mönstret." : "Step 1: Pick two numbers that stand next to each other in the pattern." },
                    { text: lang === 'sv' ? `Steg 2: Ta det senare talet (${seq[1]}) och subtrahera det tidigare talet (${seq[0]}).` : `Step 2: Take the later number (${seq[1]}) and subtract the earlier number (${seq[0]}).` },
                    { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `${seq[1]} - ${seq[0]} = ${d}` },
                    { text: lang === 'sv' ? `Svar: ${d}` : `Answer: ${d}` }
                ]
            };
        }

        const next = seq[3] + d;
        return {
            renderData: {
                description: lang === 'sv' ? "Vilket tal saknas i slutet av följden?" : "Which number is missing at the end of the sequence?",
                answerType: 'numeric',
                geometry: { type: 'pattern', subtype: 'sequence', sequence: [...seq, '?'] }
            },
            token: this.toBase64(next.toString()), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Hitta differensen mellan talen först." : "Step 1: Find the difference between the numbers first.", latex: `${seq[1]} - ${seq[0]} = ${d}` },
                { text: lang === 'sv' ? `Steg 2: För att hitta nästa tal, addera differensen (${d}) till det sista kända talet (${seq[3]}).` : `Step 2: To find the next number, add the difference (${d}) to the last known number (${seq[3]}).` },
                { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `${seq[3]} + ${d} = ${next}` },
                { text: lang === 'sv' ? `Svar: ${next}` : `Answer: ${next}` }
            ]
        };
    }

    // --- LEVEL 2: HIGH TERM ---
    private level2_HighTerm(lang: string, variationKey?: string, options: any = {}): any {
        const d = MathUtils.randomInt(4, 9), s = MathUtils.randomInt(2, 10);
        const targetN = MathUtils.randomChoice([10, 20, 50, 100]);
        const ans = s + (targetN - 1) * d;

        return {
            renderData: {
                description: lang === 'sv' ? `Vilket värde har tal nummer ${targetN} i mönstret: ${s}, ${s+d}, ${s+d*2}... ?` : `What is the value of number ${targetN} in the pattern: ${s}, ${s+d}, ${s+d*2}... ?`,
                answerType: 'numeric',
                geometry: { type: 'pattern', subtype: 'sequence', sequence: [s, s + d, s + d * 2, '...'] }
            },
            token: this.toBase64(ans.toString()), variationKey: 'high_term', type: 'calculate',
            clues: [
                { text: lang === 'sv' ? `Steg 1: Hitta ökningen (differensen) för varje steg.` : `Step 1: Find the increase (difference) for each step.`, latex: `${s+d} - ${s} = ${d}` },
                { text: lang === 'sv' ? `Steg 2: För att nå tal nummer ${targetN} från starttalet måste du göra ${targetN - 1} stycken hopp.` : `Step 2: To reach number ${targetN} from the start, you need to make ${targetN - 1} jumps.`, latex: `${targetN} - 1 = ${targetN - 1}` },
                { text: lang === 'sv' ? `Steg 3: Beräkna det totala värdet av alla hopp genom att multiplicera antalet hopp (${targetN-1}) med ökningen (${d}).` : `Step 3: Calculate the total value of all jumps by multiplying the number of jumps (${targetN-1}) by the increase (${d}).`, latex: `${targetN-1} · ${d} = ${(targetN-1)*d}` },
                { text: lang === 'sv' ? `Steg 4: Addera detta till starttalet (${s}) för att få slutsvaret.` : `Step 4: Add this to the starting number (${s}) to get the final answer.`, latex: `${s} + ${(targetN-1)*d} = ${ans}` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ]
        };
    }

    // --- LEVEL 3: VISUAL FORMULA ---
    private level3_VisualFormula(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'formula_missing', type: 'calculate' },
            { key: 'visual_calc', type: 'calculate' },
            { key: 'find_formula', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        
        // Configuration map for shapes and their "per-unit" stick costs
        const shapeConfigs = [
            { type: 'squares', diff: 3, unitBase: 1 },
            { type: 'triangles', diff: 2, unitBase: 1 },
            { type: 'houses', diff: 5, unitBase: 1 }
        ];
        const config = MathUtils.randomChoice(shapeConfigs);
        
        // REFACTOR: Randomize the starting number of shapes (1, 2, or 3)
        const startShapes = MathUtils.randomInt(1, 3);
        
        // Calculate the an + b formula parameters
        // a = increase per figure (constant)
        // b = startShapes calculation: V = a(n + startShapes - 1) + unitBase
        // This simplifies to V = an + (a * (startShapes - 1) + unitBase)
        const a = config.diff;
        const b = (a * (startShapes - 1)) + config.unitBase;

        // Generate visual data for Figures 1, 2, and 3
        const figs = [
            this.generateMatchstickData(config.type as any, startShapes),
            this.generateMatchstickData(config.type as any, startShapes + 1),
            this.generateMatchstickData(config.type as any, startShapes + 2)
        ];

        // Actual stick counts for clues
        const counts = [a*1 + b, a*2 + b, a*3 + b];

        if (v === 'visual_calc') {
            const target = MathUtils.randomInt(5, 12);
            const ans = a * target + b;
            return {
                renderData: {
                    description: lang === 'sv' ? `Mönstret följer formeln $V = ${a}n + ${b}$. Hur många stickor behövs till figur nummer ${target}?` : `The pattern follows the formula $V = ${a}n + ${b}$. How many sticks are needed for figure number ${target}?`,
                    answerType: 'numeric',
                    geometry: { type: 'pattern', subtype: 'matchsticks', figures: figs }
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? `Steg 1: I formeln representerar n figurnumret. Vi ersätter n med ${target}.` : `Step 1: In the formula, n represents the figure number. We replace n with ${target}.` },
                    { text: lang === 'sv' ? "Steg 2: Utför multiplikationen först." : "Step 2: Perform the multiplication first.", latex: `${a} · ${target} = ${a*target}` },
                    { text: lang === 'sv' ? `Steg 3: Addera det fasta talet ${b} till resultatet.` : `Step 3: Add the fixed number ${b} to the result.`, latex: `${a*target} + ${b} = ${ans}` },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
                ]
            };
        }

        const formula = `${a}n+${b}`;
        return {
            renderData: {
                description: lang === 'sv' ? "Vilken formel på formen $an + b$ beskriver antalet stickor i mönstret?" : "Which formula of the form $an + b$ describes the number of sticks in the pattern?",
                answerType: 'text',
                geometry: { type: 'pattern', subtype: 'matchsticks', figures: figs }
            },
            token: this.toBase64(formula), variationKey: 'find_formula', type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Räkna stickorna i de första figurerna." : "Step 1: Count the sticks in the first figures.", latex: `F_1 = ${counts[0]}, F_2 = ${counts[1]}, F_3 = ${counts[2]}` },
                { text: lang === 'sv' ? "Steg 2: Beräkna ökningen mellan figurerna. Detta är talet framför n (a)." : "Step 2: Calculate the increase between figures. This is the number in front of n (a).", latex: `a = ${counts[1]} - ${counts[0]} = ${a}` },
                { text: lang === 'sv' ? "Steg 3: Hitta starttalet (b) genom att se vad som skulle finnas innan figur 1." : "Step 3: Find the starting value (b) by seeing what would exist before figure 1.", latex: `b = ${counts[0]} - ${a} = ${b}` },
                { text: lang === 'sv' ? `Steg 4: Sätt ihop värdena till formeln ${a}n + ${b}.` : `Step 4: Put the values together into the formula ${a}n + ${b}.` },
                { text: lang === 'sv' ? `Svar: ${a}n + ${b}` : `Answer: ${a}n + ${b}` }
            ]
        };
    }

    // --- LEVEL 4: TABLE TO FORMULA ---
    private level4_TableToFormula(lang: string, variationKey?: string, options: any = {}): any {
        const v = variationKey || MathUtils.randomChoice(['table_formula', 'table_fill']);
        const a = MathUtils.randomInt(3, 7), b = MathUtils.randomInt(1, 10);
        const rows = [[1, a+b], [2, a*2+b], [3, a*3+b], [4, a*4+b]];

        if (v === 'table_fill') {
            const nextVal = a * 5 + b;
            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket värde saknas i tabellen för n = 5?" : "Which value is missing in the table for n = 5?",
                    answerType: 'numeric',
                    geometry: { type: 'frequency_table', headers: ['n', 'Värde'], rows }
                },
                token: this.toBase64(nextVal.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Hitta ökningen i tabellen genom att jämföra värdena." : "Step 1: Find the increase in the table by comparing the values.", latex: `${rows[1][1]} - ${rows[0][1]} = ${a}` },
                    { text: lang === 'sv' ? `Steg 2: Addera ökningen (${a}) till det sista kända värdet (${rows[3][1]}).` : `Step 2: Add the increase (${a}) to the last known value (${rows[3][1]}).` },
                    { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `${rows[3][1]} + ${a} = ${nextVal}` },
                    { text: lang === 'sv' ? `Svar: ${nextVal}` : `Answer: ${nextVal}` }
                ]
            };
        }

        return {
            renderData: {
                description: lang === 'sv' ? "Bestäm formeln $an + b$ som beskriver sambandet i tabellen." : "Determine the formula $an + b$ that describes the relationship in the table.",
                answerType: 'text',
                geometry: { type: 'frequency_table', headers: ['n', 'Värde'], rows }
            },
            token: this.toBase64(`${a}n+${b}`), variationKey: 'table_formula', type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Beräkna differensen (a) genom att se hur mycket 'Värde' ökar för varje steg i n." : "Step 1: Calculate the difference (a) by seeing how much 'Value' increases for each step in n.", latex: `a = ${rows[1][1]} - ${rows[0][1]} = ${a}` },
                { text: lang === 'sv' ? "Steg 2: Hitta det fasta värdet (b) genom att backa ett steg från n = 1." : "Step 2: Find the fixed value (b) by going back one step from n = 1.", latex: `b = ${rows[0][1]} - ${a} = ${b}` },
                { text: lang === 'sv' ? "Steg 3: Konstruera formeln." : "Step 3: Construct the formula.", latex: `an + b \\rightarrow ${a}n + ${b}` },
                { text: lang === 'sv' ? `Svar: ${a}n + ${b}` : `Answer: ${a}n + ${b}` }
            ]
        };
    }

    // --- LEVEL 5: REVERSE ENGINEERING ---
    private level5_ReverseEngineering(lang: string, variationKey?: string, options: any = {}): any {
        const a = MathUtils.randomInt(4, 9), b = MathUtils.randomInt(2, 12);
        const n = MathUtils.randomInt(10, 40);
        const total = a * n + b;

        return {
            renderData: {
                description: lang === 'sv' ? `I ett mönster med formeln $V = ${a}n + ${b}$, vilken figur (n) består av ${total} stycken delar?` : `In a pattern with the formula $V = ${a}n + ${b}$, which figure (n) consists of ${total} parts?`,
                answerType: 'numeric'
            },
            token: this.toBase64(n.toString()), variationKey: 'reverse_calc', type: 'calculate',
            clues: [
                { text: lang === 'sv' ? `Steg 1: Vi vet att ${a}n + ${b} = ${total}. Vi börjar med att dra bort det fasta värdet (${b}).` : `Step 1: We know that ${a}n + ${b} = ${total}. We start by subtracting the fixed value (${b}).`, latex: `${total} - ${b} = ${total - b}` },
                { text: lang === 'sv' ? `Steg 2: Nu har vi ${a}n = ${total - b}.` : `Step 2: Now we have ${a}n = ${total - b}.`, latex: `${a}n = ${total - b}` },
                { text: lang === 'sv' ? `Steg 3: Dela resultatet med ökningen per steg (${a}) för att hitta n.` : `Step 3: Divide the result by the increase per step (${a}) to find n.` },
                { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `n = \\frac{${total - b}}{${a}} = ${n}` },
                { text: lang === 'sv' ? `Svar: ${n}` : `Answer: ${n}` }
            ]
        };
    }
}