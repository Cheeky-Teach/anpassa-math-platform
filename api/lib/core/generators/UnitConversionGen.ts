// src/core/generators/UnitConversionGen.ts
import { MathUtils } from '../utils/MathUtils.js';
import { enrichQuestionMetadata } from '../utils/WordProblemDecorator.js';

export class UnitConversionGen {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        let questionData: any;

        switch (level) {
            case 1: questionData = this.level1_Length(lang, undefined, options); break;
            case 2: questionData = this.level2_Weight(lang, undefined, options); break;
            case 3: questionData = this.level3_Volume(lang, undefined, options); break;
            case 4: questionData = this.level4_Mixed(lang, options); break;
            default: questionData = this.level1_Length(lang, undefined, options); break;
        }

        enrichQuestionMetadata(questionData);
        if (!questionData.metadata) questionData.metadata = {};
        questionData.metadata.levelSupportsWordProblems = true;

        return questionData;
    }

    public generateByVariation(key: string, lang: string = 'sv', options: any = {}): any {
        let questionData: any;

        if (key.startsWith('len_')) questionData = this.level1_Length(lang, key, options);
        else if (key.startsWith('weight_')) questionData = this.level2_Weight(lang, key, options);
        else if (key.startsWith('vol_')) questionData = this.level3_Volume(lang, key, options);
        else questionData = this.generate(1, lang, options);

        return enrichQuestionMetadata(questionData);
    }

    private toBase64(str: string): string {
        if (typeof Buffer !== 'undefined') {
            return Buffer.from(str).toString('base64');
        }
        return btoa(unescape(encodeURIComponent(str)));
    }

    private getVariation(pool: string[], options: any): string {
        let filtered = pool;
        if (options?.exclude && options.exclude.length > 0) {
            filtered = filtered.filter(v => !options.exclude.includes(v));
        }
        if (filtered.length === 0) return pool[0];
        return MathUtils.randomChoice(filtered);
    }

    private generateSmartValue(forceDecimal: boolean = false): number {
        if (forceDecimal) {
            return MathUtils.randomInt(10, 999) / 10; // e.g. 19.8, 44.5
        }
        const type = MathUtils.randomInt(1, 3);
        if (type === 1) return MathUtils.randomInt(1, 500);
        if (type === 2) return MathUtils.randomInt(1, 999) / 10;
        return MathUtils.randomInt(1, 95) * 10;
    }

    private toPlainDecimalString(num: number): string {
        const rounded = Math.round(num * 1e6) / 1e6;
        const str = rounded.toString();
        if (!str.includes('e') && !str.includes('E')) {
            return str;
        }
        const [coeff, expStr] = str.split(/[eE]/);
        const exp = parseInt(expStr, 10);
        const [intPart, fracPart = ''] = coeff.split('.');
        const digits = intPart + fracPart;
        const decimalPos = intPart.length + exp;

        if (decimalPos <= 0) {
            return '0.' + '0'.repeat(Math.abs(decimalPos)) + digits;
        }
        if (decimalPos >= digits.length) {
            return digits + '0'.repeat(decimalPos - digits.length);
        }
        return digits.slice(0, decimalPos) + '.' + digits.slice(decimalPos);
    }

    // --- LEVEL 1: LENGTH ---
    private level1_Length(lang: string, variationKey?: string, options: any = {}): any {
        const unitPairs = ['len_km_m', 'len_m_dm', 'len_dm_cm', 'len_cm_mm', 'len_dm_mm', 'len_m_cm', 'len_m_mm'];
        const bucketPool = ['len_basic', 'len_decimals'];

        // When called via generate(level), pick a registered SKILL_BUCKETS variation key first
        const bucketKey = variationKey || this.getVariation(bucketPool, options);
        const isDecimalVariant = bucketKey === 'len_decimals';

        // Pick specific unit pair (unless a specific pair like 'len_km_m' was explicitly requested)
        const pairKey = (bucketKey === 'len_basic' || bucketKey === 'len_decimals')
            ? this.getVariation(unitPairs, options)
            : bucketKey;

        const isFlipped = Math.random() > 0.5;
        let from = "", to = "", factor = 1;
        switch (pairKey) {
            case 'len_km_m': from = "km"; to = "m"; factor = 1000; break;
            case 'len_m_dm': from = "m"; to = "dm"; factor = 10; break;
            case 'len_dm_cm': from = "dm"; to = "cm"; factor = 10; break;
            case 'len_cm_mm': from = "cm"; to = "mm"; factor = 10; break;
            case 'len_dm_mm': from = "dm"; to = "mm"; factor = 100; break;
            case 'len_m_cm': from = "m"; to = "cm"; factor = 100; break;
            case 'len_m_mm': from = "m"; to = "mm"; factor = 1000; break;
            default: from = "m"; to = "cm"; factor = 100; break;
        }

        return this.processConversion(lang, bucketKey, 'units_length', from, to, factor, isFlipped, isDecimalVariant);
    }

    // --- LEVEL 2: WEIGHT ---
    private level2_Weight(lang: string, variationKey?: string, options: any = {}): any {
        const unitPairs = ['weight_t_kg', 'weight_kg_hg', 'weight_kg_g', 'weight_hg_g', 'weight_g_mg'];
        const bucketPool = ['weight_basic', 'weight_decimals'];

        const bucketKey = variationKey || this.getVariation(bucketPool, options);
        const isDecimalVariant = bucketKey === 'weight_decimals';

        const pairKey = (bucketKey === 'weight_basic' || bucketKey === 'weight_decimals')
            ? this.getVariation(unitPairs, options)
            : bucketKey;

        const isFlipped = Math.random() > 0.5;
        let from = "", to = "", factor = 1;

        switch (pairKey) {
            case 'weight_t_kg':
            case 'weight_ton_kg': from = "ton"; to = "kg"; factor = 1000; break;
            case 'weight_kg_hg': from = "kg"; to = "hg"; factor = 10; break;
            case 'weight_kg_g': from = "kg"; to = "g"; factor = 1000; break;
            case 'weight_hg_g': from = "hg"; to = "g"; factor = 100; break;
            case 'weight_g_mg': from = "g"; to = "mg"; factor = 1000; break;
            default: from = "kg"; to = "g"; factor = 1000; break;
        }

        return this.processConversion(lang, bucketKey, 'units_weight', from, to, factor, isFlipped, isDecimalVariant);
    }

    // --- LEVEL 3: VOLUME ---
    private level3_Volume(lang: string, variationKey?: string, options: any = {}): any {
        const unitPairs = ['vol_l_dl', 'vol_l_cl', 'vol_l_ml', 'vol_dl_cl', 'vol_dl_ml', 'vol_cl_ml'];
        const bucketPool = ['vol_basic', 'vol_decimals'];

        const bucketKey = variationKey || this.getVariation(bucketPool, options);
        const isDecimalVariant = bucketKey === 'vol_decimals';

        const pairKey = (bucketKey === 'vol_basic' || bucketKey === 'vol_decimals')
            ? this.getVariation(unitPairs, options)
            : bucketKey;

        const isFlipped = Math.random() > 0.5;
        let from = "", to = "", factor = 1;

        switch (pairKey) {
            case 'vol_l_dl': from = "l"; to = "dl"; factor = 10; break;
            case 'vol_l_cl': from = "l"; to = "cl"; factor = 100; break;
            case 'vol_l_ml': from = "l"; to = "ml"; factor = 1000; break;
            case 'vol_dl_cl': from = "dl"; to = "cl"; factor = 10; break;
            case 'vol_dl_ml': from = "dl"; to = "ml"; factor = 100; break;
            case 'vol_cl_ml': from = "cl"; to = "ml"; factor = 10; break;
            default: from = "l"; to = "dl"; factor = 10; break;
        }

        return this.processConversion(lang, bucketKey, 'units_volume', from, to, factor, isFlipped, isDecimalVariant);
    }

    private level4_Mixed(lang: string, options: any): any {
        return this.generate(MathUtils.randomInt(1, 3), lang, options);
    }

    private processConversion(
        lang: string,
        v: string,
        contextType: string,
        bigUnit: string,
        smallUnit: string,
        factor: number,
        isFlipped: boolean,
        forceDecimal: boolean = false
    ) {
        let from = bigUnit;
        let to = smallUnit;
        let isMultiplying = true;

        if (isFlipped) {
            from = smallUnit;
            to = bigUnit;
            isMultiplying = false;
        }

        const val = this.generateSmartValue(forceDecimal);
        const rawAns = isMultiplying ? val * factor : val / factor;
        const ans = Number(rawAns.toPrecision(12));

        return this.formatResponse(lang, v, contextType, from, to, val, ans, factor, isMultiplying);
    }

    private formatMark(lang: string): string {
        return lang === 'sv' ? ',' : '.';
    }

    private formatLatexMark(lang: string): string {
        return lang === 'sv' ? '{,}' : '.';
    }

    private formatDisplayNumber(num: number, lang: string): string {
        return this.toPlainDecimalString(num).replace('.', this.formatMark(lang));
    }

    private formatLatexNumber(num: number, lang: string): string {
        return this.toPlainDecimalString(num).replace('.', this.formatLatexMark(lang));
    }

    private buildCommaJumpClue(
        lang: string,
        val: number,
        ans: number,
        places: number,
        isMultiplying: boolean
    ): { text: string; latex: string } {
        const markText = this.formatMark(lang);
        const markLatex = this.formatLatexMark(lang);
        const rawStr = this.toPlainDecimalString(val);
        const [intPartRaw, decPartRaw = ''] = rawStr.split('.');
        const ansLatex = this.formatLatexNumber(ans, lang);
        const ansText = this.formatDisplayNumber(ans, lang);

        const stepWordSv = 'steg';
        const stepWordEn = places === 1 ? 'step' : 'steps';

        if (isMultiplying) {
            const neededZeros = Math.max(0, places - decPartRaw.length);
            const paddedDec = decPartRaw + '0'.repeat(neededZeros);
            const paddedLatex = decPartRaw.length > 0 || neededZeros > 0
                ? `${intPartRaw}${markLatex}${paddedDec}`
                : `${intPartRaw}${markLatex}`;
            const paddedText = decPartRaw.length > 0 || neededZeros > 0
                ? `${intPartRaw}${markText}${paddedDec}`
                : `${intPartRaw}${markText}`;

            const digitsForJump = paddedDec.length > 0 ? paddedDec : '0'.repeat(places);
            const jumpedChunk = digitsForJump.slice(0, places).split('').join('\\,');
            const tailChunk = digitsForJump.slice(places);
            const prefixPart = neededZeros > 0
                ? `${intPartRaw}${tailChunk ? `${markLatex}${tailChunk}` : ''}`
                : `${intPartRaw}${decPartRaw.slice(0, Math.max(0, decPartRaw.length - places))}`;

            const arrowLatex = `${prefixPart}\\underbrace{${jumpedChunk}}_{\\mathbf{${places}\\text{ ${lang === 'sv' ? stepWordSv : stepWordEn} }\\rightarrow}}`;

            const text = lang === 'sv'
                ? neededZeros > 0
                    ? `Skriv ${paddedText} med nollor så det finns ${places} decimalplatser. Flytta kommat ${places} ${stepWordSv} åt höger till ${ansText}.`
                    : `Flytta kommat ${places} ${stepWordSv} åt höger i ${paddedText} så får du ${ansText}.`
                : neededZeros > 0
                    ? `Write ${paddedText} with zeros so there are ${places} decimal places. Move the decimal point ${places} ${stepWordEn} right to ${ansText}.`
                    : `Move the decimal point ${places} ${stepWordEn} right in ${paddedText} to get ${ansText}.`;

            return {
                text,
                latex: `${paddedLatex} \\rightarrow ${arrowLatex} = \\mathbf{${ansLatex}}`
            };
        }

        const startWithCommaLatex = decPartRaw.length > 0
            ? `${intPartRaw}${markLatex}${decPartRaw}`
            : `${intPartRaw}${markLatex}`;
        const startWithCommaText = decPartRaw.length > 0
            ? `${intPartRaw}${markText}${decPartRaw}`
            : `${intPartRaw}${markText}`;

        const availableLeftDigits = intPartRaw.length;
        const missingLeadingZeros = Math.max(0, places - availableLeftDigits);
        const paddedInt = '0'.repeat(missingLeadingZeros) + intPartRaw;

        const jumpStartIdx = Math.max(0, paddedInt.length - places);
        const leftPrefix = paddedInt.slice(0, jumpStartIdx);
        const jumpedLeftChunk = paddedInt.slice(jumpStartIdx).split('').join('\\,');
        const rightAfterComma = decPartRaw ? `${markLatex}${decPartRaw}` : '';

        const jumpLatex = missingLeadingZeros > 0
            ? `\\mathbf{0${markLatex}}${leftPrefix}\\underbrace{${jumpedLeftChunk}}_{\\mathbf{\\leftarrow ${places}\\text{ ${lang === 'sv' ? stepWordSv : stepWordEn}}}}`
            : `${leftPrefix}\\mathbf{${markLatex}}\\underbrace{${jumpedLeftChunk}}_{\\mathbf{\\leftarrow ${places}\\text{ ${lang === 'sv' ? stepWordSv : stepWordEn}}}}${rightAfterComma}`;

        const text = lang === 'sv'
            ? missingLeadingZeros > 0
                ? `Börja vid kommat i ${startWithCommaText} och flytta det ${places} ${stepWordSv} åt vänster. Fyll på med en nolla före kommat: ${ansText}.`
                : `Börja vid kommat i ${startWithCommaText} och flytta det ${places} ${stepWordSv} åt vänster till ${ansText}.`
            : missingLeadingZeros > 0
                ? `Start at the decimal point in ${startWithCommaText} and move it ${places} ${stepWordEn} left. Add a leading zero before the decimal point: ${ansText}.`
                : `Start at the decimal point in ${startWithCommaText} and move it ${places} ${stepWordEn} left to ${ansText}.`;

        return {
            text,
            latex: `${startWithCommaLatex} \\rightarrow ${jumpLatex} = \\mathbf{${ansLatex}}`
        };
    }

    private formatResponse(
        lang: string,
        v: string,
        contextType: string,
        from: string,
        to: string,
        val: number,
        ans: number,
        factor: number,
        isMultiplying: boolean
    ) {
        const places = factor === 10 ? 1 : factor === 100 ? 2 : 3;
        const valPlain = this.toPlainDecimalString(val);
        const ansPlain = this.toPlainDecimalString(ans);
        const valText = this.formatDisplayNumber(val, lang);
        const ansText = this.formatDisplayNumber(ans, lang);
        const valLatex = this.formatLatexNumber(val, lang);
        const ansLatex = this.formatLatexNumber(ans, lang);
        const factorLatex = factor.toLocaleString(lang === 'sv' ? 'sv-SE' : 'en-US').replace(/\s+/g, '\\,');

        const fromName = this.getUnitName(from, lang);
        const toName = this.getUnitName(to, lang);
        const bigName = this.getUnitName(isMultiplying ? from : to, lang);
        const smallName = this.getUnitName(isMultiplying ? to : from, lang);
        const bigUnit = isMultiplying ? from : to;
        const smallUnit = isMultiplying ? to : from;

        const desc = lang === 'sv'
            ? `Omvandla från ${fromName} till ${toName}.`
            : `Convert from ${fromName} to ${toName}.`;

        const opLatex = isMultiplying
            ? `${valLatex} \\cdot ${factorLatex}`
            : `\\frac{${valLatex}}{${factorLatex}}`;

        const jumpClue = this.buildCommaJumpClue(lang, val, ans, places, isMultiplying);

        const clues = lang === 'sv' ? [
            {
                text: `1 ${bigName} är ${factor} ${smallName}.`,
                latex: `1 \\text{ ${bigUnit}} = ${factorLatex} \\text{ ${smallUnit}}`
            },
            {
                text: isMultiplying
                    ? `${toName.charAt(0).toUpperCase() + toName.slice(1)} är mindre än ${fromName}, så talet blir större. Multiplicera med ${factor}.`
                    : `${toName.charAt(0).toUpperCase() + toName.slice(1)} är större än ${fromName}, så talet blir mindre. Dividera med ${factor}.`,
                latex: opLatex
            },
            jumpClue,
            {
                text: `Svar: ${ansText} ${to}`,
                latex: `\\mathbf{${ansLatex} \\text{ ${to}}}`
            }
        ] : [
            {
                text: `1 ${bigName} equals ${factor} ${smallName}.`,
                latex: `1 \\text{ ${bigUnit}} = ${factorLatex} \\text{ ${smallUnit}}`
            },
            {
                text: isMultiplying
                    ? `${toName.charAt(0).toUpperCase() + toName.slice(1)} is smaller than ${fromName}, so the number gets bigger. Multiply by ${factor}.`
                    : `${toName.charAt(0).toUpperCase() + toName.slice(1)} is larger than ${fromName}, so the number gets smaller. Divide by ${factor}.`,
                latex: opLatex
            },
            jumpClue,
            {
                text: `Answer: ${ansText} ${to}`,
                latex: `\\mathbf{${ansLatex} \\text{ ${to}}}`
            }
        ];

        const interceptorToken = `${valPlain} ; ${from} ; ${to} ; ${ansPlain}`;

        return {
            renderData: {
                description: desc,
                latex: `${valLatex} \\text{ ${from}} = \\text{\\_\\_\\_} \\text{ ${to}}`,
                interceptorToken,
                contextType,
                fromUnit: from,
                toUnit: to,
                val,
                ans,
                answerType: 'numeric'
            },
            token: this.toBase64(ansPlain),
            variationKey: v,
            type: 'calculate',
            clues,
            metadata: {
                topic: 'unit_conversion',
                variation_key: v,
                contextType,
                levelSupportsWordProblems: true
            }
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