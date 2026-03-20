import { MathUtils } from '../utils/MathUtils.js';

export class UnitConversionGen {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        switch (level) {
            case 1: return this.level1_Length(lang, undefined, options);
            case 2: return this.level2_Weight(lang, undefined, options);
            case 3: return this.level3_Volume(lang, undefined, options);
            case 4: return this.level4_Mixed(lang, options);
            default: return this.level1_Length(lang, undefined, options);
        }
    }

    public generateByVariation(key: string, lang: string = 'sv'): any {
        if (key.startsWith('len_')) return this.level1_Length(lang, key);
        if (key.startsWith('weight_')) return this.level2_Weight(lang, key);
        if (key.startsWith('vol_')) return this.level3_Volume(lang, key);
        return this.generate(1, lang);
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    private getVariation(pool: string[], options: any): string {
        let filtered = pool;
        if (options?.exclude && options.exclude.length > 0) {
            filtered = filtered.filter(v => !options.exclude.includes(v));
        }
        return MathUtils.randomChoice(filtered);
    }

    private generateSmartValue(): number {
        const type = MathUtils.randomInt(1, 3);
        if (type === 1) return MathUtils.randomInt(1, 500); 
        if (type === 2) return MathUtils.randomInt(1, 999) / 10; // e.g. 19.8
        return MathUtils.randomInt(1, 95) * 10; 
    }

    // --- LEVEL 1: LENGTH ---
    private level1_Length(lang: string, variationKey?: string, options: any = {}): any {
        // Standardized: Always define as Big -> Small
        const pool = ['len_km_m', 'len_m_dm', 'len_dm_cm', 'len_cm_mm', 'len_dm_mm', 'len_m_cm', 'len_m_mm'];
        const v = variationKey || this.getVariation(pool, options);
        const isFlipped = Math.random() > 0.5;
        
        let from = "", to = "", factor = 1;
        switch (v) {
            case 'len_km_m': from = "km"; to = "m"; factor = 1000; break;
            case 'len_m_dm': from = "m"; to = "dm"; factor = 10; break;
            case 'len_dm_cm': from = "dm"; to = "cm"; factor = 10; break;
            case 'len_cm_mm': from = "cm"; to = "mm"; factor = 10; break;
            case 'len_dm_mm': from = "dm"; to = "mm"; factor = 100; break;
            case 'len_m_cm': from = "m"; to = "cm"; factor = 100; break;
            case 'len_m_mm': from = "m"; to = "mm"; factor = 1000; break;
        }

        return this.processConversion(lang, v, from, to, factor, isFlipped);
    }

    // --- LEVEL 2: WEIGHT ---
    private level2_Weight(lang: string, variationKey?: string, options: any = {}): any {
        const pool = ['weight_t_kg', 'weight_kg_hg', 'weight_kg_g', 'weight_hg_g', 'weight_g_mg'];
        const v = variationKey || this.getVariation(pool, options);
        const isFlipped = Math.random() > 0.5;
        let from = "", to = "", factor = 1;

        switch (v) {
            case 'weight_t_kg': from = "ton"; to = "kg"; factor = 1000; break;
            case 'weight_kg_hg': from = "kg"; to = "hg"; factor = 10; break;
            case 'weight_kg_g': from = "kg"; to = "g"; factor = 1000; break;
            case 'weight_hg_g': from = "hg"; to = "g"; factor = 100; break;
            case 'weight_g_mg': from = "g"; to = "mg"; factor = 1000; break;
        }

        return this.processConversion(lang, v, from, to, factor, isFlipped);
    }

    // --- LEVEL 3: VOLUME ---
    private level3_Volume(lang: string, variationKey?: string, options: any = {}): any {
        const pool = ['vol_l_dl', 'vol_l_cl', 'vol_l_ml', 'vol_dl_cl', 'vol_dl_ml', 'vol_cl_ml'];
        const v = variationKey || this.getVariation(pool, options);
        const isFlipped = Math.random() > 0.5;
        let from = "", to = "", factor = 1;

        switch (v) {
            case 'vol_l_dl': from = "l"; to = "dl"; factor = 10; break;
            case 'vol_l_cl': from = "l"; to = "cl"; factor = 100; break;
            case 'vol_l_ml': from = "l"; to = "ml"; factor = 1000; break;
            case 'vol_dl_cl': from = "dl"; to = "cl"; factor = 10; break;
            case 'vol_dl_ml': from = "dl"; to = "ml"; factor = 100; break;
            case 'vol_cl_ml': from = "cl"; to = "ml"; factor = 10; break;
        }

        return this.processConversion(lang, v, from, to, factor, isFlipped);
    }

    private level4_Mixed(lang: string, options: any): any {
        return this.generate(MathUtils.randomInt(1, 3), lang, options);
    }

    /**
     * Core logic handler to prevent "backwards" math and "rounding" bugs
     */
    private processConversion(lang: string, v: string, bigUnit: string, smallUnit: string, factor: number, isFlipped: boolean) {
        let from = bigUnit;
        let to = smallUnit;
        let isMultiplying = true;

        // If flipped, we go from Small -> Big (Division)
        if (isFlipped) {
            from = smallUnit;
            to = bigUnit;
            isMultiplying = false;
        }

        const val = this.generateSmartValue();
        
        // Use precision-safe math (Number.EPSILON or toPrecision) to avoid float bugs like 0.0000000001
        const rawAns = isMultiplying ? val * factor : val / factor;
        const ans = Number(rawAns.toPrecision(12)); // Keeps decimals but trims float noise

        return this.formatResponse(lang, v, from, to, val, ans, factor, isMultiplying);
    }

    private formatResponse(lang: string, v: string, from: string, to: string, val: number, ans: number, factor: number, isMultiplying: boolean) {
        const steps = factor === 10 ? 1 : factor === 100 ? 2 : 3;
        const direction = isMultiplying ? (lang === 'sv' ? "höger" : "right") : (lang === 'sv' ? "vänster" : "left");
        
        const valStr = val.toString().replace('.', ',');
        const ansStr = ans.toString().replace('.', ',');

        const desc = lang === 'sv' 
            ? `Omvandla från ${this.getUnitName(from, 'sv')} till ${this.getUnitName(to, 'sv')}.`
            : `Convert from ${this.getUnitName(from, 'en')} to ${this.getUnitName(to, 'en')}.`;

        const factorText = lang === 'sv'
            ? `Det går ${factor} ${this.getUnitName(isMultiplying ? to : from, 'sv')} på varje ${this.getUnitName(isMultiplying ? from : to, 'sv')}.`
            : `There are ${factor} ${this.getUnitName(isMultiplying ? to : from, 'en')} in every ${this.getUnitName(isMultiplying ? from : to, 'en')}.`;

        const moveText = lang === 'sv'
            ? `Vid omvandling till en ${isMultiplying ? 'mindre' : 'större'} enhet ska decimaltecknet flyttas ${steps} steg åt ${direction}.`
            : `When converting to a ${isMultiplying ? 'smaller' : 'larger'} unit, the decimal point should move ${steps} ${steps === 1 ? 'step' : 'steps'} to the ${direction}.`;

        const mathOp = isMultiplying 
            ? `${valStr} · ${factor} = ${ansStr}` 
            : `\\frac{${valStr}}{${factor}} = ${ansStr}`;

        return {
            renderData: {
                description: desc,
                latex: `${valStr} \\text{ ${from}} = ? \\text{ ${to}}`,
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()),
            variationKey: v,
            type: 'calculate',
            clues: [
                { text: `Steg 1: ${factorText}` },
                { text: `Steg 2: ${moveText}`, latex: mathOp },
                { text: `${lang === 'sv' ? 'Svar' : 'Answer'}: ${ansStr} ${to}` }
            ]
        };
    }

    private getUnitName(unit: string, lg: string): string {
        const names: any = {
            km: { sv: "kilometer", en: "kilometers" },
            m: { sv: "meter", en: "meters" },
            dm: { sv: "decimeter", en: "decimeters" },
            cm: { sv: "centimeter", en: "centimeters" },
            mm: { sv: "millimeter", en: "millimeters" },
            ton: { sv: "ton", en: "tonnes" },
            kg: { sv: "kilogram", en: "kilograms" },
            hg: { sv: "hekto", en: "hectograms" },
            g: { sv: "gram", en: "grams" },
            mg: { sv: "milligram", en: "milligrams" },
            l: { sv: "liter", en: "liters" },
            dl: { sv: "deciliter", en: "deciliters" },
            cl: { sv: "centiliter", en: "centiliters" },
            ml: { sv: "milliliter", en: "milliliters" }
        };
        return names[unit]?.[lg] || unit;
    }
}