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
     * Allows the Question Studio to request specific "Skill Buckets".
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
                        ? "m-värdet är den punkt där linjen korsar (skär) y-axeln." 
                        : "The m-value is the point where the line crosses (intersects) the y-axis.", 
                    latex: `(0, m)` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Leta upp siffran på den vertikala axeln där linjen går igenom.` 
                        : `Look for the number on the vertical axis where the line passes through.`, 
                    latex: `y = ${m}` 
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
            // Fractional slope: 1/2 or 1/4
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
                        ? "k-värdet beskriver lutningen. Vi mäter 'skillnad i y' delat med 'skillnad i x'." 
                        : "The k-value describes the slope. We measure 'change in y' divided by 'change in x'.", 
                    latex: "k = \\frac{\\Delta y}{\\Delta x}" 
                },
                { 
                    text: v === 'slope_pos_int' 
                        ? (lang === 'sv' ? `Om du går 1 steg åt höger, går linjen upp ${k} steg.` : `If you go 1 step to the right, the line goes up ${k} steps.`)
                        : (lang === 'sv' ? `Här behöver du gå flera steg åt höger för att hamna på en jämn punkt.` : `Here you need to go several steps to the right to hit an even point.`),
                    latex: v === 'slope_pos_frac' ? `k = \\frac{1}{\\text{steg åt höger}}` : `k = ${k}`
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
                { text: lang === 'sv' ? "Eftersom linjen lutar nedåt när vi går åt höger, måste k-värdet vara negativt." : "Since the line slopes downward as we move to the right, the k-value must be negative." },
                { text: lang === 'sv' ? "Använd trappstegsmetoden: Hur många steg går linjen ner för varje steg åt höger?" : "Use the step method: How many steps does the line go down for every step to the right?", latex: `k = ${kDisplay}` }
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
                { text: lang === 'sv' ? "Steg 1: Hitta m (där linjen skär y-axeln)." : "Step 1: Find m (where the line crosses the y-axis).", latex: `m = ${m}` },
                { text: lang === 'sv' ? "Steg 2: Hitta k (lutningen per steg)." : "Step 2: Find k (the slope per step).", latex: `k = ${k}` },
                { text: lang === 'sv' ? "Steg 3: Sätt ihop dem i formeln y = kx + m." : "Step 3: Combine them into the formula y = kx + m.", latex: eq }
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