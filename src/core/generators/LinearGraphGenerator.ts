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

    /**
     * Phase 2: Targeted Generation
     * Allows the Question Studio to request a specific "Skill Buckets".
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

    // --- LEVEL 1: Intercept (m) ---
    private level1_FindM(lang: string, variationKey?: string): any {
        const m = MathUtils.randomInt(-5, 5);
        const k = MathUtils.randomChoice([1, -1, 2]); // Simple slopes for intercept focus

        return {
            renderData: {
                graph: { range: 10, lines: [{ slope: k, intercept: m, color: '#2563eb' }] },
                description: lang === 'sv' 
                    ? "Studera linjen i koordinatsystemet. Vilket är linjens m-värde?" 
                    : "Study the line in the coordinate system. What is the m-value (y-intercept)?",
                answerType: 'numeric'
            },
            token: this.toBase64(m.toString()),
            clues: [
                { 
                    text: lang === 'sv' 
                        ? "m-värdet är den punkt på den vertikala y-axeln där linjen skär axeln." 
                        : "The m-value is the point on the vertical y-axis where the line intersects the axis.", 
                    latex: `(0, m)` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Leta upp koordinaten där x är 0. Siffran på y-axeln är ditt svar.` 
                        : `Locate the coordinate where x is 0. The number on the y-axis is your answer.`, 
                    latex: `m = ${m}` 
                }
            ],
            metadata: { variation_key: 'intercept_id', difficulty: 1 }
        };
    }

    // --- LEVEL 2: Positive Slope (k) ---
    private level2_FindK_Pos(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['slope_pos_int', 'slope_pos_frac']);
        let k = 1;
        let kDisplay = "1";
        
        if (v === 'slope_pos_int') {
            k = MathUtils.randomInt(1, 4);
            kDisplay = k.toString();
        } else {
            const den = MathUtils.randomChoice([2, 4]);
            k = 1 / den;
            kDisplay = `1/${den}`;
        }

        const m = MathUtils.randomInt(-2, 2);

        return {
            renderData: {
                graph: { range: 10, lines: [{ slope: k, intercept: m, color: '#16a34a' }] },
                description: lang === 'sv' 
                    ? "Beräkna linjens lutning (k-värde). Hur mycket stiger linjen för varje steg åt höger?" 
                    : "Calculate the slope (k-value) of the line. How much does the line rise for every step to the right?",
                answerType: 'text'
            },
            token: this.toBase64(kDisplay),
            clues: [
                { 
                    text: lang === 'sv' 
                        ? "k-värdet beskriver hur brant linjen lutar. Vi mäter skillnaden i höjd (y) delat med skillnaden i sidled (x)." 
                        : "The k-value describes how steep the line is. We measure the change in height (y) divided by the change in horizontal distance (x).", 
                    latex: "k = \\frac{\\Delta y}{\\Delta x}" 
                },
                { 
                    text: lang === 'sv' 
                        ? `Se hur många steg linjen går uppåt när du går åt höger i systemet.` 
                        : `See how many steps the line moves upward as you move to the right in the system.`,
                    latex: `k = ${kDisplay}`
                }
            ],
            metadata: { variation_key: v, difficulty: v === 'slope_pos_frac' ? 3 : 2 }
        };
    }

    // --- LEVEL 3: Negative Slope (k) ---
    private level3_FindK_Neg(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['slope_neg_int', 'slope_neg_frac']);
        let k = -1;
        let kDisplay = "-1";

        if (v === 'slope_neg_int') {
            k = MathUtils.randomInt(-4, -1);
            kDisplay = k.toString();
        } else {
            const den = MathUtils.randomChoice([2, 3]);
            k = -1 / den;
            kDisplay = `-1/${den}`;
        }

        const m = MathUtils.randomInt(-2, 4);

        return {
            renderData: {
                graph: { range: 10, lines: [{ slope: k, intercept: m, color: '#dc2626' }] },
                description: lang === 'sv' 
                    ? "Bestäm linjens lutning (k-värdet). Tänk på om linjen stiger eller sjunker!" 
                    : "Determine the slope (k-value) of the line. Consider if the line rises or falls!",
                answerType: 'text'
            },
            token: this.toBase64(kDisplay),
            clues: [
                { 
                    text: lang === 'sv' 
                        ? "Eftersom linjen går nedåt när vi läser den från vänster till höger är lutningen negativ." 
                        : "Since the line goes downward when read from left to right, the slope is negative.",
                    latex: "k < 0"
                },
                { 
                    text: lang === 'sv' 
                        ? "Använd 'trappstegsmetoden' för att se hur många steg linjen sjunker per steg åt höger." 
                        : "Use the 'staircase method' to see how many steps the line falls per step to the right.", 
                    latex: `k = ${kDisplay}` 
                }
            ],
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

        // Equation Builder
        let eq = "y=";
        if (k !== 0) {
            if (k === 1) eq += "x";
            else if (k === -1) eq += "-x";
            else eq += `${k}x`;
        }
        
        if (m !== 0) {
            if (m > 0 && k !== 0) eq += `+${m}`;
            else eq += `${m}`;
        } else if (k === 0) {
            eq += "0";
        }

        return {
            renderData: {
                graph: { range: 10, lines: [{ slope: k, intercept: m, color: '#7c3aed' }] },
                description: lang === 'sv' 
                    ? "Skriv den fullständiga räta linjens ekvation på formen y = kx + m." 
                    : "Write the complete equation of the line in the form y = kx + m.",
                answerType: 'text'
            },
            token: this.toBase64(eq),
            clues: [
                { 
                    text: lang === 'sv' 
                        ? "Hitta först var linjen skär y-axeln (m) och bestäm därefter lutningen (k)." 
                        : "First find where the line intersects the y-axis (m) and then determine the slope (k).", 
                    latex: `m = ${m}, \\; k = ${k}` 
                },
                { 
                    text: lang === 'sv' 
                        ? "Sätt in värdena i mallen y = kx + m för att få fram ekvationen." 
                        : "Insert the values into the template y = kx + m to produce the equation.", 
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