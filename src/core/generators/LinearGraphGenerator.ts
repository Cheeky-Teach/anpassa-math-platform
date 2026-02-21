import { MathUtils } from '../utils/MathUtils.js';

export class LinearGraphGenerator {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        // Adaptive Fallback: If Level 1 concepts are mastered, push to Level 2
        if (level === 1 && options.hideConcept && options.exclude?.includes('intercept_id')) {
            return this.level2_FindK_Pos(lang, undefined, options);
        }

        switch (level) {
            case 1: return this.level1_FindM(lang, undefined, options);
            case 2: return this.level2_FindK_Pos(lang, undefined, options);
            case 3: return this.level3_FindK_Neg(lang, undefined, options);
            case 4: return this.level4_FindFunction(lang, undefined, options);
            case 5: return this.level5_Mixed(lang, options);
            default: return this.level1_FindM(lang, undefined, options);
        }
    }

    /**
     * Targeted Generation for Question Studio
     */
    public generateByVariation(key: string, lang: string = 'sv'): any {
        switch (key) {
            case 'intercept_id':
                return this.level1_FindM(lang, key);
            case 'slope_pos_int':
            case 'slope_pos_frac':
                return this.level2_FindK_Pos(lang, key);
            case 'slope_neg_int':
            case 'slope_neg_frac':
                return this.level3_FindK_Neg(lang, key);
            case 'eq_standard':
            case 'eq_no_m':
            case 'eq_horizontal':
                return this.level4_FindFunction(lang, key);
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

    // --- LEVEL 1: Intercept (m) ---
    private level1_FindM(lang: string, variationKey?: string, options: any = {}): any {
        const v = variationKey || 'intercept_id';
        const m = MathUtils.randomInt(-6, 6);
        const k = MathUtils.randomChoice([1, -1, 2, 0.5]);

        return {
            renderData: {
                graph: { range: 10, lines: [{ slope: k, intercept: m, color: '#2563eb' }] },
                description: lang === 'sv' 
                    ? "Var skär linjen den vertikala y-axeln? Bestäm linjens m-värde." 
                    : "Where does the line intersect the vertical y-axis? Determine the m-value.",
                answerType: 'numeric'
            },
            token: this.toBase64(m.toString()),
            variationKey: v, type: 'concept',
            clues: [
                { text: lang === 'sv' ? "Steg 1: m-värdet är y-koordinaten där linjen korsar y-axeln." : "Step 1: The m-value is the y-coordinate where the line crosses the y-axis." },
                { text: lang === 'sv' ? "Hitta den vertikala linjen i mitten av koordinatsystemet (y-axeln)." : "Find the vertical line in the center of the coordinate system (the y-axis)." },
                { text: lang === 'sv' ? "Följ y-axeln tills du ser var den blå linjen skär den." : "Follow the y-axis until you see where the blue line intersects it.", latex: "(0, m)" },
                { text: lang === 'sv' ? `Linjen skär axeln vid värdet ${m}.` : `The line intersects the axis at the value ${m}.` },
                { text: lang === 'sv' ? `Svar: m = ${m}` : `Answer: m = ${m}` }
            ],
            metadata: { variation_key: v, difficulty: 1 }
        };
    }

    // --- LEVEL 2 & 3: Slope (k) ---
    private getDetailedSlopeClues(k: number, kDisplay: string, lang: string, dy: number, dx: number) {
        const isPos = k > 0;
        const dir = isPos ? (lang === 'sv' ? "uppåt" : "upward") : (lang === 'sv' ? "nedåt" : "downward");
        
        return [
            { text: lang === 'sv' ? "Steg 1: k-värdet (lutningen) beskriver hur mycket linjen förändras i höjdled för varje steg åt höger." : "Step 1: The k-value (slope) describes how much the line changes vertically for every step to the right." },
            { text: lang === 'sv' ? "Välj en punkt på linjen som ligger exakt i ett hörn i rutnätet." : "Pick a point on the line that lies exactly on a corner in the grid." },
            { text: lang === 'sv' ? `Gå ${dx} steg åt höger i rutnätet.` : `Move ${dx} steps to the right in the grid.`, latex: `\\Delta x = ${dx}` },
            { text: lang === 'sv' ? `Räkna hur många steg du måste gå ${dir} för att hamna på linjen igen.` : `Count how many steps you must move ${dir} to land on the line again.` },
            { text: lang === 'sv' ? `Förändringen i höjdled är ${Math.abs(dy)} steg.` : `The vertical change is ${Math.abs(dy)} steps.`, latex: `\\Delta y = ${dy}` },
            { text: lang === 'sv' ? "Använd formeln för lutning: k = Δy / Δx." : "Use the formula for slope: k = Δy / Δx.", latex: `k = \\frac{${dy}}{${dx}}` },
            { text: lang === 'sv' ? `Svar: k = ${kDisplay}` : `Answer: k = ${kDisplay}` }
        ];
    }

    private level2_FindK_Pos(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'slope_pos_int', type: 'calculate' },
            { key: 'slope_pos_frac', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        
        let dy: number, dx: number, kDisplay: string;
        if (v === 'slope_pos_int') {
            dy = MathUtils.randomInt(1, 3);
            dx = 1;
            kDisplay = dy.toString();
        } else {
            dx = MathUtils.randomChoice([2, 4, 5]);
            dy = 1;
            kDisplay = `1/${dx}`;
        }

        return {
            renderData: {
                graph: { range: 10, lines: [{ slope: dy/dx, intercept: MathUtils.randomInt(-3, 1), color: '#16a34a' }] },
                description: lang === 'sv' ? "Bestäm linjens lutning (k-värde)." : "Determine the slope (k-value) of the line.",
                answerType: 'text'
            },
            token: this.toBase64(kDisplay),
            variationKey: v, type: 'calculate',
            clues: this.getDetailedSlopeClues(dy/dx, kDisplay, lang, dy, dx),
            metadata: { variation_key: v, difficulty: 2 }
        };
    }

    private level3_FindK_Neg(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'slope_neg_int', type: 'calculate' },
            { key: 'slope_neg_frac', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        
        let dy: number, dx: number, kDisplay: string;
        if (v === 'slope_neg_int') {
            dy = MathUtils.randomInt(-3, -1);
            dx = 1;
            kDisplay = dy.toString();
        } else {
            dx = MathUtils.randomChoice([2, 3, 5]);
            dy = -1;
            kDisplay = `-1/${dx}`;
        }

        return {
            renderData: {
                graph: { range: 10, lines: [{ slope: dy/dx, intercept: MathUtils.randomInt(0, 4), color: '#dc2626' }] },
                description: lang === 'sv' ? "Vad är linjens k-värde? Tänk på att linjen lutar nedåt!" : "What is the k-value of the line? Remember that it slopes downward!",
                answerType: 'text'
            },
            token: this.toBase64(kDisplay),
            variationKey: v, type: 'calculate',
            clues: this.getDetailedSlopeClues(dy/dx, kDisplay, lang, dy, dx),
            metadata: { variation_key: v, difficulty: 3 }
        };
    }

    // --- LEVEL 4: Full Function (y = kx + m) ---
    private level4_FindFunction(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'eq_standard', type: 'calculate' },
            { key: 'eq_no_m', type: 'calculate' },
            { key: 'eq_horizontal', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        
        let k = MathUtils.randomInt(-2, 2);
        let m = MathUtils.randomInt(-4, 4);

        if (v === 'eq_no_m') m = 0;
        if (v === 'eq_horizontal') { k = 0; if (m === 0) m = 3; }
        if (v === 'eq_standard' && k === 0) k = 1;

        // Assembly logic for y = kx + m
        let eq = "y=";
        if (k !== 0) {
            if (k === 1) eq += "x";
            else if (k === -1) eq += "-x";
            else eq += `${k}x`;
            
            if (m > 0) eq += `+${m}`;
            else if (m < 0) eq += `${m}`;
        } else {
            eq += `${m}`;
        }

        return {
            renderData: {
                graph: { range: 10, lines: [{ slope: k, intercept: m, color: '#7c3aed' }] },
                description: lang === 'sv' ? "Bestäm linjens ekvation på formen y = kx + m." : "Determine the equation of the line in the form y = kx + m.",
                answerType: 'text'
            },
            token: this.toBase64(eq.replace(/\s/g, "")),
            variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Hitta m-värdet (där linjen korsar y-axeln)." : "Step 1: Find the m-value (where the line crosses the y-axis)." },
                { text: lang === 'sv' ? `Linjen skär y-axeln i ${m}, så m = ${m}.` : `The line cuts the y-axis at ${m}, so m = ${m}.`, latex: `m = ${m}` },
                { text: lang === 'sv' ? "Steg 2: Beräkna k-värdet (lutningen) genom att gå ett steg åt höger." : "Step 2: Calculate the k-value (slope) by moving one step to the right." },
                { text: lang === 'sv' ? `För varje steg åt höger ändras y med ${k}.` : `For every step to the right, y changes by ${k}.`, latex: `k = ${k}` },
                { text: lang === 'sv' ? "Steg 3: Sätt in värdena i formeln y = kx + m." : "Step 3: Insert the values into the formula y = kx + m." },
                { text: lang === 'sv' ? `Svar: ${eq}` : `Answer: ${eq}` }
            ],
            metadata: { variation_key: v, difficulty: 4 }
        };
    }

    private level5_Mixed(lang: string, options: any): any {
        const lvl = MathUtils.randomInt(1, 4);
        const res = this.generate(lvl, lang, options);
        res.metadata.mixed = true;
        return res;
    }
}