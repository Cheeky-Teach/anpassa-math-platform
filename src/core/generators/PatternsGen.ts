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
                    description: lang === 'sv' ? `Studera talföljden: ${seq.join(', ')}... Vilket påstående är FALSKT?` : `Examine the sequence: ${seq.join(', ')}... Which statement is FALSE?`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([sTrue1, sTrue2, sFalse]),
                    geometry: { type: 'pattern', subtype: 'sequence', sequence: [...seq, '...'] }
                },
                token: this.toBase64(sFalse),
                clues: [
                    { text: lang === 'sv' ? `Kontrollera skillnaden mellan talen.` : `Check the difference between the numbers.`, latex: `${seq[1]} - ${seq[0]} = ${diff}` },
                    { text: lang === 'sv' ? `Ett av dessa påståenden stämmer inte med mönstret:` : `One of these statements does not fit the pattern:`, latex: `\\text{${sFalse}}` }
                ],
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

            return {
                renderData: {
                    description: lang === 'sv' ? `Titta på talföljden: ${seq.join(', ')}... Är detta ett aritmetiskt eller geometriskt mönster?` : `Look at the sequence: ${seq.join(', ')}... Is this an arithmetic or geometric pattern?`,
                    answerType: 'multiple_choice',
                    options: lang === 'sv' ? ["Aritmetiskt", "Geometriskt"] : ["Arithmetic", "Geometric"],
                    geometry: { type: 'pattern', subtype: 'sequence', sequence: [...seq, '...'] }
                },
                token: this.toBase64(ans),
                clues: [
                    { text: lang === 'sv' ? `Ökar mönstret med samma summa (+/-) eller med samma faktor (multiplikation)?` : `Does the pattern increase by the same sum (+/-) or by the same factor (multiplication)?`, latex: isGeo ? `${seq[0]} \\cdot ${factor} = ${seq[1]}` : `${seq[0]} + ${factor} = ${seq[1]}` },
                    { text: lang === 'sv' ? `Mönstret är:` : `The pattern is:`, latex: `\\text{${ans}}` }
                ],
                metadata: { variation_key: 'seq_type', difficulty: 2 }
            };
        }

        const diff = MathUtils.randomInt(2, 9);
        const start = MathUtils.randomInt(1, 15);
        const seq = [start, start + diff, start + diff * 2, start + diff * 3];

        if (v === 'seq_diff') {
            return {
                renderData: {
                    description: lang === 'sv' ? `Hur stor är ökningen (differensen) i talföljden: ${seq.join(', ')}?` : `What is the increase (difference) in the sequence: ${seq.join(', ')}?`,
                    answerType: 'numeric',
                    geometry: { type: 'pattern', subtype: 'sequence', sequence: [...seq, '...'] }
                },
                token: this.toBase64(diff.toString()),
                clues: [
                    { text: lang === 'sv' ? `Räkna ut skillnaden mellan två tal som står bredvid varandra.` : `Calculate the difference between two adjacent numbers.`, latex: `${seq[1]} - ${seq[0]}` },
                    { text: lang === 'sv' ? "Differensen är:" : "The difference is:", latex: `${diff}` }
                ],
                metadata: { variation_key: 'seq_diff', difficulty: 1 }
            };
        }

        const nextVal = seq[3] + diff;
        return {
            renderData: {
                description: lang === 'sv' ? `Vilket tal kommer härnäst: ${seq.join(', ')}?` : `What is the next number: ${seq.join(', ')}?`,
                answerType: 'numeric',
                geometry: { type: 'pattern', subtype: 'sequence', sequence: [...seq, '?'] }
            },
            token: this.toBase64(nextVal.toString()),
            clues: [
                { text: lang === 'sv' ? `Eftersom ökningen är ${diff}, addera ${diff} till det sista talet i följden.` : `Since the increase is ${diff}, add ${diff} to the last number in the sequence.`, latex: `${seq[3]} + ${diff}` },
                { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${nextVal}` }
            ],
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
                description: lang === 'sv' ? `I mönstret ${start}, ${start + diff}, ${start + diff * 2}... vilket tal är nummer ${targetN}?` : `In the pattern ${start}, ${start + diff}, ${start + diff * 2}... what is number ${targetN}?`, 
                answerType: 'numeric', 
                geometry: { type: 'pattern', subtype: 'sequence', sequence: [start, start + diff, start + diff * 2, '...'] } 
            },
            token: this.toBase64(ans.toString()),
            clues: [
                { text: lang === 'sv' ? `För att nå tal nummer ${targetN} från starttalet måste du göra ${targetN - 1} stycken hopp.` : `To reach number ${targetN} from the start, you need to make ${targetN - 1} jumps.`, latex: `n - 1 = ${targetN - 1}` },
                { text: lang === 'sv' ? `Varje hopp är värt ${diff}. Multiplicera antalet hopp med ökningen och lägg till starttalet.` : `Each jump is worth ${diff}. Multiply the number of jumps by the increase and add the starting number.`, latex: `${start} + ${targetN - 1} \\cdot ${diff}` },
                { text: lang === 'sv' ? "Resultatet blir:" : "The result is:", latex: `${ans}` }
            ],
            metadata: { variation_key: 'high_term', difficulty: 2 }
        };
    }

    // --- LEVEL 3: VISUAL FORMULA ---
    private level3_VisualFormula(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['formula_missing', 'visual_calc', 'find_formula']);
        const scenarios = [
            { type: 'squares', diff: 3, unitConst: 1, nameSv: "kvadrater", nameEn: "squares" },
            { type: 'triangles', diff: 2, unitConst: 1, nameSv: "trianglar", nameEn: "triangles" },
            { type: 'houses', diff: 5, unitConst: 1, nameSv: "hus", nameEn: "houses" }
        ];
        const s = MathUtils.randomChoice(scenarios);
        const offset = MathUtils.randomInt(0, 1);
        const a = s.diff;
        const b = s.diff * offset + s.unitConst;
        const objName = lang === 'sv' ? s.nameSv : s.nameEn;

        const figures = [
            this.generateMatchstickData(s.type as any, 1 + offset),
            this.generateMatchstickData(s.type as any, 2 + offset),
            this.generateMatchstickData(s.type as any, 3 + offset)
        ];
        const val1 = a * 1 + b;
        const val2 = a * 2 + b;

        if (v === 'formula_missing') {
            return {
                renderData: {
                    description: lang === 'sv' ? `Formeln är $V = ?n + ${b}$. Om figur 1 har ${val1} stickor, vad är talet framför n?` : `The formula is $V = ?n + ${b}$. If figure 1 has ${val1} sticks, what is the number in front of n?`,
                    answerType: 'numeric',
                    geometry: { type: 'pattern', subtype: 'matchsticks', figures: [figures[0], figures[1]] }
                },
                token: this.toBase64(a.toString()),
                clues: [
                    { text: lang === 'sv' ? `Talet framför n är ökningen mellan figurerna. Beräkna skillnaden.` : `The number in front of n is the increase between the figures. Calculate the difference.`, latex: `${val2} - ${val1}` },
                    { text: lang === 'sv' ? "Det saknade talet är:" : "The missing number is:", latex: `${a}` }
                ],
                metadata: { variation_key: 'formula_missing', difficulty: 3 }
            };
        }

        if (v === 'visual_calc') {
            const target = 10;
            const ans = a * target + b;
            return {
                renderData: {
                    description: lang === 'sv' ? `Formeln är $V = ${a}n + ${b}$. Hur många stickor behövs till figur nummer ${target}?` : `The formula is $V = ${a}n + ${b}$. How many sticks are needed for figure number ${target}?`,
                    answerType: 'numeric',
                    geometry: { type: 'pattern', subtype: 'matchsticks', figures }
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang === 'sv' ? `Ersätt n med ${target} i formeln och räkna ut värdet.` : `Replace n with ${target} in the formula and calculate the value.`, latex: `V = ${a} \\cdot ${target} + ${b}` },
                    { text: lang === 'sv' ? "Antalet stickor är:" : "The number of sticks is:", latex: `${ans}` }
                ],
                metadata: { variation_key: 'visual_calc', difficulty: 2 }
            };
        }

        const formulaAns = `${a}n+${b}`;
        return {
            renderData: {
                description: lang === 'sv' ? `Vilken formel $an + b$ beskriver antalet stickor i mönstret?` : `Which formula $an + b$ describes the number of sticks in the pattern?`,
                answerType: 'text',
                geometry: { type: 'pattern', subtype: 'matchsticks', figures } 
            },
            token: this.toBase64(formulaAns),
            clues: [
                { text: lang === 'sv' ? `Hitta först ökningen (a) mellan figurerna.` : `First find the increase (a) between the figures.`, latex: `a = ${val2} - ${val1} = ${a}` },
                { text: lang === 'sv' ? `Hitta sedan startvärdet (b) genom att se vad som återstår när n = 0.` : `Then find the starting value (b) by seeing what remains when n = 0.`, latex: `b = ${val1} - ${a} = ${b}` },
                { text: lang === 'sv' ? "Formeln är:" : "The formula is:", latex: `${a}n + ${b}` }
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
                    description: lang === 'sv' ? "Vilken formel på formen $an + b$ beskriver tabellen?" : "Which formula of the form $an + b$ describes the table?",
                    answerType: 'text',
                    geometry: { type: 'frequency_table', headers: ['n', 'Värde'], rows }
                },
                token: this.toBase64(`${a}n+${b}`),
                clues: [
                    { text: lang === 'sv' ? `Ökningen för varje steg (n) ger dig värdet på a.` : `The increase for each step (n) gives you the value of a.`, latex: `a = ${rows[1][1]} - ${rows[0][1]} = ${a}` },
                    { text: lang === 'sv' ? `Värdet b hittar du genom att dra bort ökningen från det första värdet.` : `You find the value b by subtracting the increase from the first value.`, latex: `b = ${rows[0][1]} - ${a} = ${b}` },
                    { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${a}n + ${b}` }
                ],
                metadata: { variation_key: 'table_formula', difficulty: 3 }
            };
        }

        const targetN = 5;
        const targetVal = a * targetN + b;
        return {
            renderData: {
                description: lang === 'sv' ? `Vilket värde hör till n = ${targetN}?` : `Which value corresponds to n = ${targetN}?`,
                answerType: 'numeric',
                geometry: { type: 'frequency_table', headers: ['n', 'Värde'], rows }
            },
            token: this.toBase64(targetVal.toString()),
            clues: [
                { text: lang === 'sv' ? `Mönstret ökar med ${a} för varje steg. Addera ${a} till sista kända värdet.` : `The pattern increases by ${a} for each step. Add ${a} to the last known value.`, latex: `${rows[3][1]} + ${a}` },
                { text: lang === 'sv' ? "Värdet blir:" : "The value is:", latex: `${targetVal}` }
            ],
            metadata: { variation_key: 'table_fill', difficulty: 2 }
        };
    }

    // --- LEVEL 5: REVERSE ENGINEERING ---
    private level5_ReverseEngineering(lang: string, variationKey?: string): any {
        const a = MathUtils.randomInt(3, 8);
        const b = MathUtils.randomInt(2, 10);
        const n = MathUtils.randomInt(10, 30);
        const total = a * n + b;

        return {
            renderData: {
                description: lang === 'sv' ? `I mönstret $V = ${a}n + ${b}$, vilket figurnummer (n) har värdet ${total}?` : `In the pattern $V = ${a}n + ${b}$, which figure number (n) has the value ${total}?`,
                answerType: 'numeric'
            },
            token: this.toBase64(n.toString()),
            clues: [
                { text: lang === 'sv' ? `Börja med att dra bort det fasta startvärdet (${b}) från totalen.` : `Start by subtracting the fixed starting value (${b}) from the total.`, latex: `${total} - ${b} = ${total - b}` },
                { text: lang === 'sv' ? `Dela nu resultatet med den konstanta ökningen (${a}).` : `Now divide the result by the constant increase (${a}).`, latex: `\\frac{${total - b}}{${a}}` },
                { text: lang === 'sv' ? "Figurnumret är:" : "The figure number is:", latex: `${n}` }
            ],
            metadata: { variation_key: 'reverse_calc', difficulty: 4 }
        };
    }
}