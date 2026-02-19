import { MathUtils } from '../utils/MathUtils.js';

export class LinearGraphGenerator {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_FindM(lang);
            case 2: return this.level2_FindK_Pos(lang);
            case 3: return this.level3_FindK_Neg(lang);
            case 4: return this.level4_FindFunction(lang);
            case 5: return this.level5_Mixed(lang);
            default: return this.level1_FindM(lang);
        }
    }

    public generateByVariation(key: string, lang: string = 'sv'): any {
        switch (key) {
            case 'intercept_id': return this.level1_FindM(lang, key);
            case 'slope_pos_int':
            case 'slope_pos_frac': return this.level2_FindK_Pos(lang, key);
            case 'slope_neg_int':
            case 'slope_neg_frac': return this.level3_FindK_Neg(lang, key);
            case 'eq_standard':
            case 'eq_no_m':
            case 'eq_horizontal': return this.level4_FindFunction(lang, key);
            default: return this.generate(1, lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    // --- HELPER: Detailed Slope Clues ---
    private getSlopeClues(k: number, kDisplay: string, lang: string) {
        const isPositive = k > 0;
        const directionWord = isPositive 
            ? (lang === 'sv' ? "uppåt" : "upward") 
            : (lang === 'sv' ? "nedåt" : "downward");

        return [
            {
                text: lang === 'sv'
                    ? "Hitta två punkter där linjen går exakt genom ett hörn i rutnätet. Börja vid en av dem."
                    : "Find two points where the line passes exactly through a corner in the grid. Start at one of them.",
                latex: "\\text{Leta efter 'kryss' i rutnätet}"
            },
            {
                text: lang === 'sv'
                    ? `Gå ett steg åt höger. Hur många steg måste du gå ${directionWord} för att hamna på linjen igen?`
                    : `Move one step to the right. How many steps must you move ${directionWord} to land on the line again?`,
                latex: lang === 'sv' ? "\\text{Trappstegsmetoden}" : "\\text{The Staircase Method}"
            },
            {
                text: lang === 'sv'
                    ? `Lutningen (k) är ändringen i höjd delat med ändringen åt höger. Här: ${kDisplay}.`
                    : `The slope (k) is the change in height divided by the change to the right. In this case: ${kDisplay}.`,
                latex: `k = \\frac{\\Delta y}{\\Delta x} = ${kDisplay}`
            }
        ];
    }

    // --- LEVEL 1: Intercept (m) ---
    private level1_FindM(lang: string, variationKey?: string): any {
        const m = MathUtils.randomInt(-5, 5);
        const k = MathUtils.randomChoice([1, -1, 2]);

        return {
            renderData: {
                graph: { range: 10, lines: [{ slope: k, intercept: m, color: '#2563eb' }] },
                description: lang === 'sv' 
                    ? "Var skär linjen den vertikala y-axeln? Detta kallas linjens m-värde." 
                    : "Where does the line intersect the vertical y-axis? This is called the m-value.",
                answerType: 'numeric'
            },
            token: this.toBase64(m.toString()),
            clues: [
                { 
                    text: lang === 'sv' 
                        ? "Titta på den vertikala linjen i mitten (y-axeln). Hitta punkten där den blå linjen korsar den." 
                        : "Look at the vertical line in the center (y-axis). Find the point where the blue line crosses it.", 
                    latex: "(0, y)" 
                },
                { 
                    text: lang === 'sv' 
                        ? `Värdet på y-axeln i denna punkt är ${m}.` 
                        : `The value on the y-axis at this point is ${m}.`, 
                    latex: `m = ${m}` 
                }
            ],
            metadata: { variation_key: 'intercept_id', difficulty: 1 }
        };
    }

    // --- LEVEL 2: Positive Slope (k) ---
    private level2_FindK_Pos(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['slope_pos_int', 'slope_pos_frac']);
        let k: number;
        let kDisplay: string;
        
        if (v === 'slope_pos_int') {
            k = MathUtils.randomInt(1, 4);
            kDisplay = k.toString();
        } else {
            const den = MathUtils.randomChoice([2, 4, 5]);
            k = 1 / den;
            kDisplay = `1/${den}`;
        }

        return {
            renderData: {
                graph: { range: 10, lines: [{ slope: k, intercept: MathUtils.randomInt(-2, 2), color: '#16a34a' }] },
                description: lang === 'sv' 
                    ? "Beräkna linjens lutning (k-värde). Hur brant stiger linjen?" 
                    : "Calculate the slope (k-value) of the line. How steeply does it rise?",
                answerType: 'text'
            },
            token: this.toBase64(kDisplay),
            clues: this.getSlopeClues(k, kDisplay, lang),
            metadata: { variation_key: v, difficulty: v === 'slope_pos_frac' ? 3 : 2 }
        };
    }

    // --- LEVEL 3: Negative Slope (k) ---
    private level3_FindK_Neg(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['slope_neg_int', 'slope_neg_frac']);
        let k: number;
        let kDisplay: string;

        if (v === 'slope_neg_int') {
            k = MathUtils.randomInt(-4, -1);
            kDisplay = k.toString();
        } else {
            const den = MathUtils.randomChoice([2, 3]);
            k = -1 / den;
            kDisplay = `-1/${den}`;
        }

        return {
            renderData: {
                graph: { range: 10, lines: [{ slope: k, intercept: MathUtils.randomInt(-2, 4), color: '#dc2626' }] },
                description: lang === 'sv' 
                    ? "Bestäm linjens lutning (k-värdet). Tänk på att linjen sjunker!" 
                    : "Determine the slope (k-value) of the line. Remember that the line is falling!",
                answerType: 'text'
            },
            token: this.toBase64(kDisplay),
            clues: this.getSlopeClues(k, kDisplay, lang),
            metadata: { variation_key: v, difficulty: 3 }
        };
    }

    // --- LEVEL 4: Full Function (y = kx + m) ---
    private level4_FindFunction(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['eq_standard', 'eq_no_m', 'eq_horizontal']);
        let k = MathUtils.randomInt(-2, 2);
        let m = MathUtils.randomInt(-3, 3);

        if (v === 'eq_no_m') m = 0;
        if (v === 'eq_horizontal') { k = 0; if (m === 0) m = 2; }
        if (v === 'eq_standard' && k === 0) k = 1;

        let eq = "y=";
        if (k !== 0) {
            if (k === 1) eq += "x";
            else if (k === -1) eq += "-x";
            else eq += `${k}x`;
        }
        if (m !== 0) {
            if (m > 0 && k !== 0) eq += `+${m}`;
            else eq += `${m}`;
        } else if (k === 0) eq += "0";

        return {
            renderData: {
                graph: { range: 10, lines: [{ slope: k, intercept: m, color: '#7c3aed' }] },
                description: lang === 'sv' 
                    ? "Skriv linjens ekvation på formen y = kx + m." 
                    : "Write the equation of the line in the form y = kx + m.",
                answerType: 'text'
            },
            token: this.toBase64(eq),
            clues: [
                { 
                    text: lang === 'sv' 
                        ? `1. Hitta m (där x=0): m = ${m}. 2. Använd trappsteg för k: k = ${k}.` 
                        : `1. Find m (where x=0): m = ${m}. 2. Use steps for k: k = ${k}.`, 
                    latex: `y = ${k}x + ${m}` 
                },
                { 
                    text: lang === 'sv' 
                        ? "Pussla ihop värdena. Om k=1 skriver vi bara x. Om m=0 skriver vi ingenting." 
                        : "Put the values together. If k=1 we just write x. If m=0 we write nothing.", 
                    latex: eq 
                }
            ],
            metadata: { variation_key: v, difficulty: 4 }
        };
    }

    private level5_Mixed(lang: string): any {
        const subLevel = MathUtils.randomInt(1, 4);
        const res = this.generate(subLevel, lang);
        res.metadata.mixed = true;
        return res;
    }
}