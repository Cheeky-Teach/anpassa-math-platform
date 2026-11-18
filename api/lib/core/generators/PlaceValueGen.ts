import { MathUtils } from '../utils/MathUtils.js';

export class PlaceValueGen {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        switch (level) {
            case 1: return this.level1_WholeNumbers(lang, undefined, options);
            case 2: return this.level2_Decimals(lang, undefined, options);
            case 3: return this.level3_Rounding(lang, undefined, options);
            default: return this.level1_WholeNumbers(lang, undefined, options);
        }
    }

    public generateByVariation(key: string, lang: string = 'sv'): any {
        if (key.startsWith('pv_whole')) return this.level1_WholeNumbers(lang, key);
        if (key.startsWith('pv_dec')) return this.level2_Decimals(lang, key);
        if (key.startsWith('pv_round')) return this.level3_Rounding(lang, key);
        return this.generate(1, lang);
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    private getVariation(pool: {key: string, type: 'calculate' | 'concept'}[], options: any): string {
        return MathUtils.randomChoice(pool.map(v => v.key));
    }

    // Helper to generate a number with unique digits to avoid ambiguity
    private generateUniqueDigits(length: number): number[] {
        let available = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const digits = [];
        const first = MathUtils.randomChoice(available);
        digits.push(first);
        available = available.filter(d => d !== first);
        available.push(0);

        for (let i = 1; i < length; i++) {
            const next = MathUtils.randomChoice(available);
            digits.push(next);
            available = available.filter(d => d !== next);
        }
        return digits;
    }

    private formatNumber(num: number, lang: string): string {
        return lang === 'sv' ? num.toString().replace('.', ',') : num.toString();
    }

    private getPlaces() {
        return [
            { val: 10000, shortSv: 'TT', shortEn: 'TTh', sv: 'tiotusental', svPlural: 'tiotusental', en: 'ten thousands' },
            { val: 1000,  shortSv: 'T',  shortEn: 'Th',  sv: 'tusental',    svPlural: 'tusental',    en: 'thousands' },
            { val: 100,   shortSv: 'H',  shortEn: 'H',   sv: 'hundratal',   svPlural: 'hundratal',   en: 'hundreds' },
            { val: 10,    shortSv: 'Ti', shortEn: 'T',   sv: 'tiotal',      svPlural: 'tiotal',      en: 'tens' },
            { val: 1,     shortSv: 'E',  shortEn: 'O',   sv: 'ental',       svPlural: 'ental',       en: 'ones' },
            { val: 0.1,   shortSv: 'td', shortEn: 't',   sv: 'tiondel',     svPlural: 'tiondelar',   en: 'tenths' },
            { val: 0.01,  shortSv: 'hd', shortEn: 'h',   sv: 'hundradel',   svPlural: 'hundradelar', en: 'hundredths' },
            { val: 0.001, shortSv: 'tsd',shortEn: 'th',  sv: 'tusendel',    svPlural: 'tusendelar',  en: 'thousandths' }
        ];
    }

    /**
     * Builds a LaTeX \begin{array} place-value grid with column headers (TT, T, H, Ti, E | td, hd, tsd).
     * Supports highlighting a specific place value (targetPlaceVal) and optionally hiding the digit as '?'
     * or showing a pointer row underneath.
     */
    private buildPlaceGridLatex(
        numDisplay: string,
        lang: string,
        targetPlaceVal: number,
        options: { maskTargetAsQuestion?: boolean; showZeroMask?: boolean } = {}
    ): string {
        const sep = lang === 'sv' ? ',' : '.';
        const [wholePart, decPart = ''] = numDisplay.split(sep);

        const wholeHeadersSv = ['TT', 'T', 'H', 'Ti', 'E'];
        const wholeHeadersEn = ['TTh', 'Th', 'H', 'T', 'O'];
        const decHeadersSv = ['td', 'hd', 'tsd'];
        const decHeadersEn = ['t', 'h', 'th'];

        const wHeaders = (lang === 'sv' ? wholeHeadersSv : wholeHeadersEn).slice(5 - wholePart.length);
        const dHeaders = (lang === 'sv' ? decHeadersSv : decHeadersEn).slice(0, decPart.length);

        const cols: { header: string; char: string; placeVal: number | null; isTarget: boolean }[] = [];

        wholePart.split('').forEach((ch, idx) => {
            const pVal = Math.pow(10, wholePart.length - 1 - idx);
            cols.push({
                header: wHeaders[idx] || '',
                char: ch,
                placeVal: pVal,
                isTarget: Math.abs(pVal - targetPlaceVal) < 0.0001
            });
        });

        if (decPart.length > 0) {
            cols.push({ header: '', char: sep, placeVal: null, isTarget: false });
            decPart.split('').forEach((ch, idx) => {
                const pVal = Math.round(Math.pow(10, -(idx + 1)) * 1000) / 1000;
                cols.push({
                    header: dHeaders[idx] || '',
                    char: ch,
                    placeVal: pVal,
                    isTarget: Math.abs(pVal - targetPlaceVal) < 0.0001
                });
            });
        }

        const colSpec = cols.map(c => (c.placeVal === null ? 'c' : 'c')).join(' ');
        const headerRow = cols
            .map(c => (c.header ? `\\scriptstyle\\text{${c.header}}` : ''))
            .join(' & ');

        const digitRow = cols
            .map(c => {
                if (c.placeVal === null) return `\\mathbf{${c.char}}`;
                if (c.isTarget) {
                    const shown = options.maskTargetAsQuestion ? '?' : c.char;
                    return `\\underline{\\mathbf{${shown}}}`;
                }
                return options.showZeroMask ? `\\color{gray}{0}` : c.char;
            })
            .join(' & ');

        const pointerRow = cols
            .map(c => (c.isTarget ? '\\uparrow' : ''))
            .join(' & ');

        return `\\begin{array}{${colSpec}} ${headerRow} \\\\ \\hline ${digitRow} \\\\ ${pointerRow} \\end{array}`;
    }

    /**
     * Builds a clean positional slot template + column-aligned addition for "build the number" tasks.
     */
    private buildSlotTemplateLatex(
        selectedPlaces: { val: number; count: number }[],
        hasDecimals: boolean,
        lang: string
    ): { slotGrid: string; columnAddition: string } {
        const sep = lang === 'sv' ? ',' : '.';
        const maxWhole = Math.max(1, ...selectedPlaces.filter(p => p.val >= 1).map(p => p.val));
        const minDec = hasDecimals
            ? Math.min(...selectedPlaces.filter(p => p.val < 1).map(p => p.val))
            : 1;

        const allOrdered = this.getPlaces().filter(p => {
            if (p.val >= 1) return p.val <= maxWhole;
            return hasDecimals && p.val >= minDec - 0.0001;
        });

        const cols: { header: string; cell: string }[] = [];
        allOrdered.forEach(p => {
            if (p.val === 0.1) {
                cols.push({ header: '', cell: sep });
            }
            const match = selectedPlaces.find(sp => Math.abs(sp.val - p.val) < 0.0001);
            cols.push({
                header: lang === 'sv' ? p.shortSv : p.shortEn,
                cell: match ? `\\mathbf{${match.count}}` : `\\mathbf{0}`
            });
        });

        const colSpec = cols.map(() => 'c').join(' ');
        const headerRow = cols.map(c => (c.header ? `\\scriptstyle\\text{${c.header}}` : '')).join(' & ');
        const valueRow = cols.map(c => c.cell).join(' & ');
        const slotGrid = `\\begin{array}{${colSpec}} ${headerRow} \\\\ \\hline ${valueRow} \\end{array}`;

        const rows = selectedPlaces.map((sp, idx) => {
            const partVal = Math.round(sp.count * sp.val * 1000) / 1000;
            const formatted = this.formatNumber(partVal, lang);
            return idx === 0 ? `& ${formatted}` : `+ & ${formatted}`;
        });

        const totalRaw = Math.round(selectedPlaces.reduce((s, p) => s + p.count * p.val, 0) * 1000) / 1000;
        const totalFormatted = this.formatNumber(totalRaw, lang);
        const columnAddition = `\\begin{array}{rl} ${rows.join(' \\\\ ')} \\\\ \\hline = & \\mathbf{${totalFormatted}} \\end{array}`;

        return { slotGrid, columnAddition };
    }

    // --- LEVEL 1: WHOLE NUMBERS ---
    private level1_WholeNumbers(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'calculate'}[] = [
            { key: 'pv_whole_value', type: 'calculate' },
            { key: 'pv_whole_digit', type: 'calculate' },
            { key: 'pv_whole_build', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const places = this.getPlaces().filter(p => p.val >= 1);

        if (v === 'pv_whole_build') {
            const numPlacesToUse = MathUtils.randomInt(2, 4);
            const shuffledPlaces = MathUtils.shuffle([...places]).slice(0, numPlacesToUse);
            shuffledPlaces.sort((a, b) => b.val - a.val);

            let totalValue = 0;
            const descriptions: string[] = [];
            const selectedParts: { val: number; count: number }[] = [];

            shuffledPlaces.forEach(p => {
                const count = MathUtils.randomInt(1, 9);
                totalValue += count * p.val;
                descriptions.push(lang === 'sv' ? `${count} ${p.svPlural}` : `${count} ${p.en}`);
                selectedParts.push({ val: p.val, count });
            });

            const descString = MathUtils.shuffle([...descriptions]).join(', ');
            const { slotGrid, columnAddition } = this.buildSlotTemplateLatex(selectedParts, false, lang);

            return {
                renderData: {
                    description: lang === 'sv' ? `Skriv talet som beskrivs: ${descString}` : `Write the number described: ${descString}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(totalValue.toString()),
                variationKey: v,
                type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv'
                            ? 'Placera siffrorna i rätt kolumn och fyll tomma positioner med 0.'
                            : 'Place each digit in its column and fill any unmentioned positions with 0.',
                        latex: slotGrid
                    },
                    {
                        text: lang === 'sv'
                            ? 'Summera delvärdena kolumnvis.'
                            : 'Sum the place values column by column.',
                        latex: columnAddition
                    }
                ]
            };
        }

        const numLength = MathUtils.randomInt(3, 5);
        const digits = this.generateUniqueDigits(numLength);
        const numStr = digits.join('');
        const numValue = parseInt(numStr, 10);

        let targetIndex = MathUtils.randomInt(0, numLength - 2);
        while (v === 'pv_whole_value' && digits[targetIndex] === 0) {
            targetIndex = MathUtils.randomInt(0, numLength - 2);
        }

        const targetDigit = digits[targetIndex];
        const placeValueFactor = Math.pow(10, numLength - 1 - targetIndex);
        const actualValue = targetDigit * placeValueFactor;
        const placeWord = places.find(p => p.val === placeValueFactor);

        if (v === 'pv_whole_value') {
            const gridLatex = this.buildPlaceGridLatex(numStr, lang, placeValueFactor);
            const maskedLatex = this.buildPlaceGridLatex(numStr, lang, placeValueFactor, { showZeroMask: true });

            return {
                renderData: {
                    description: lang === 'sv' ? `Vilket värde har siffran ${targetDigit} i talet ${numValue}?` : `What value does the digit ${targetDigit} have in the number ${numValue}?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(actualValue.toString()),
                variationKey: v,
                type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv'
                            ? `Siffran ${targetDigit} står på ${placeWord?.sv}s plats.`
                            : `The digit ${targetDigit} is in the ${placeWord?.en} place.`,
                        latex: gridLatex
                    },
                    {
                        text: lang === 'sv'
                            ? `Nollställ övriga siffror och multiplicera med ${placeValueFactor}.`
                            : `Zero out the other digits and multiply by ${placeValueFactor}.`,
                        latex: `${maskedLatex} \\quad \\Rightarrow \\quad ${targetDigit} \\cdot ${placeValueFactor} = \\mathbf{${actualValue}}`
                    }
                ]
            };
        }

        // pv_whole_digit
        const hiddenGrid = this.buildPlaceGridLatex(numStr, lang, placeValueFactor, { maskTargetAsQuestion: true });
        const revealedGrid = this.buildPlaceGridLatex(numStr, lang, placeValueFactor);

        return {
            renderData: {
                description: lang === 'sv' ? `Vilken siffra står på ${placeWord?.sv}ets plats i talet ${numValue}?` : `Which digit is in the ${placeWord?.en} place in the number ${numValue}?`,
                answerType: 'numeric'
            },
            token: this.toBase64(targetDigit.toString()),
            variationKey: v,
            type: 'calculate',
            clues: [
                {
                    text: lang === 'sv'
                        ? `Hitta kolumnen för ${placeWord?.sv} (${placeValueFactor}).`
                        : `Locate the ${placeWord?.en} (${placeValueFactor}) column.`,
                    latex: hiddenGrid
                },
                {
                    text: lang === 'sv'
                        ? `Läs av siffran i den markerade kolumnen.`
                        : `Read the digit in the highlighted column.`,
                    latex: `${revealedGrid} \\quad \\Rightarrow \\quad \\mathbf{${targetDigit}}`
                }
            ]
        };
    }

    // --- LEVEL 2: DECIMALS ---
    private level2_Decimals(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'calculate'}[] = [
            { key: 'pv_dec_value', type: 'calculate' },
            { key: 'pv_dec_digit', type: 'calculate' },
            { key: 'pv_dec_build', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const allPlaces = this.getPlaces();

        if (v === 'pv_dec_build') {
            const decimalPlaces = allPlaces.filter(p => p.val < 1);
            const wholePlaces = allPlaces.filter(p => p.val >= 1 && p.val <= 100);

            const numPlacesToUse = MathUtils.randomInt(3, 5);
            const shuffledPlaces = MathUtils.shuffle([...wholePlaces, ...decimalPlaces]).slice(0, numPlacesToUse);
            if (!shuffledPlaces.some(p => p.val < 1)) {
                shuffledPlaces[shuffledPlaces.length - 1] = MathUtils.randomChoice(decimalPlaces);
            }
            shuffledPlaces.sort((a, b) => b.val - a.val);

            let totalValue = 0;
            const descriptions: string[] = [];
            const selectedParts: { val: number; count: number }[] = [];

            shuffledPlaces.forEach(p => {
                const count = MathUtils.randomInt(1, 9);
                const partValue = Math.round(count * p.val * 1000) / 1000;
                totalValue += partValue;
                descriptions.push(lang === 'sv' ? `${count} ${p.svPlural}` : `${count} ${p.en}`);
                selectedParts.push({ val: p.val, count });
            });

            totalValue = Math.round(totalValue * 1000) / 1000;
            const descString = MathUtils.shuffle([...descriptions]).join(', ');
            const ansStr = this.formatNumber(totalValue, lang);
            const { slotGrid, columnAddition } = this.buildSlotTemplateLatex(selectedParts, true, lang);

            return {
                renderData: {
                    description: lang === 'sv' ? `Skriv decimaltalet som beskrivs: ${descString}` : `Write the decimal number described: ${descString}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ansStr),
                variationKey: v,
                type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv'
                            ? 'Placera varje siffra på rätt sida om kommat och fyll luckor med 0.'
                            : 'Place each digit around the decimal point and fill missing slots with 0.',
                        latex: slotGrid
                    },
                    {
                        text: lang === 'sv'
                            ? 'Addera delvärdena med kommatecknen rakt under varandra.'
                            : 'Add the place values with decimal points aligned.',
                        latex: columnAddition
                    }
                ]
            };
        }

        const wholeLength = MathUtils.randomInt(2, 3);
        const decLength = MathUtils.randomInt(2, 3);
        const totalLength = wholeLength + decLength;
        const digits = this.generateUniqueDigits(totalLength);

        let numValue = 0;
        let placeMultiplier = Math.pow(10, wholeLength - 1);
        const digitObjects = [];

        for (let i = 0; i < totalLength; i++) {
            numValue += digits[i] * placeMultiplier;
            digitObjects.push({ digit: digits[i], place: Math.round(placeMultiplier * 1000) / 1000 });
            placeMultiplier /= 10;
        }

        numValue = Math.round(numValue * 1000) / 1000;
        // Preserve trailing decimal digits so the grid always shows all generated decimal places
        const wholeStr = digits.slice(0, wholeLength).join('');
        const decStr = digits.slice(wholeLength).join('');
        const sep = lang === 'sv' ? ',' : '.';
        const displayNum = `${wholeStr}${sep}${decStr}`;

        let targetDecimals = digitObjects.filter(d => d.place < 1);
        if (v === 'pv_dec_value') {
            const nonZeroDecimals = targetDecimals.filter(d => d.digit !== 0);
            if (nonZeroDecimals.length > 0) targetDecimals = nonZeroDecimals;
        }

        const targetObj = MathUtils.randomChoice(targetDecimals);
        const placeWord = allPlaces.find(p => Math.abs(p.val - targetObj.place) < 0.0001);
        const actualValueRaw = Math.round(targetObj.digit * targetObj.place * 1000) / 1000;
        const actualValueDisplay = this.formatNumber(actualValueRaw, lang);
        const placeValueDisplay = this.formatNumber(targetObj.place, lang);

        if (v === 'pv_dec_value') {
            const gridLatex = this.buildPlaceGridLatex(displayNum, lang, targetObj.place);
            const maskedLatex = this.buildPlaceGridLatex(displayNum, lang, targetObj.place, { showZeroMask: true });

            return {
                renderData: {
                    description: lang === 'sv' ? `Vilket värde har siffran ${targetObj.digit} i talet ${displayNum}? Svara i decimalform.` : `What value does the digit ${targetObj.digit} have in the number ${displayNum}? Answer in decimal form.`,
                    answerType: 'numeric'
                },
                token: this.toBase64(actualValueDisplay),
                variationKey: v,
                type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv'
                            ? `Siffran ${targetObj.digit} står på ${placeWord?.sv}s plats (${placeValueDisplay}).`
                            : `The digit ${targetObj.digit} is in the ${placeWord?.en} place (${placeValueDisplay}).`,
                        latex: gridLatex
                    },
                    {
                        text: lang === 'sv'
                            ? `Nollställ övriga positioner för att avläsa decimalvärdet.`
                            : `Zero out all other positions to read the decimal value.`,
                        latex: `${maskedLatex} \\quad \\Rightarrow \\quad ${targetObj.digit} \\cdot ${placeValueDisplay} = \\mathbf{${actualValueDisplay}}`
                    }
                ]
            };
        }

        // pv_dec_digit
        const hiddenGrid = this.buildPlaceGridLatex(displayNum, lang, targetObj.place, { maskTargetAsQuestion: true });
        const revealedGrid = this.buildPlaceGridLatex(displayNum, lang, targetObj.place);

        return {
            renderData: {
                description: lang === 'sv' ? `Vilken siffra står på ${placeWord?.sv}ets plats i talet ${displayNum}?` : `Which digit is in the ${placeWord?.en} place in the number ${displayNum}?`,
                answerType: 'numeric'
            },
            token: this.toBase64(targetObj.digit.toString()),
            variationKey: v,
            type: 'calculate',
            clues: [
                {
                    text: lang === 'sv'
                        ? `Räkna stegen till höger om kommat till ${placeWord?.sv} (${placeValueDisplay}).`
                        : `Count right from the decimal point to the ${placeWord?.en} (${placeValueDisplay}) column.`,
                    latex: hiddenGrid
                },
                {
                    text: lang === 'sv'
                        ? `Läs av siffran i den markerade kolumnen.`
                        : `Read the digit in the highlighted column.`,
                    latex: `${revealedGrid} \\quad \\Rightarrow \\quad \\mathbf{${targetObj.digit}}`
                }
            ]
        };
    }

    // --- LEVEL 3: ROUNDING ---
    private level3_Rounding(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'calculate'}[] = [
            { key: 'pv_round_whole', type: 'calculate' },
            { key: 'pv_round_dec', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        let numberToRound = 0;
        let placeToRound = 0;
        let placeWord: any;
        const allPlaces = this.getPlaces();

        if (v === 'pv_round_whole') {
            numberToRound = MathUtils.randomInt(111, 9999) + (MathUtils.randomInt(1, 99) / 100);
            const wholePlaces = [100, 10, 1];
            placeToRound = MathUtils.randomChoice(wholePlaces);
            placeWord = allPlaces.find(p => p.val === placeToRound);
        } else {
            numberToRound = MathUtils.randomInt(1, 99) + (MathUtils.randomInt(111, 999) / 1000);
            const decPlaces = [0.1, 0.01];
            placeToRound = MathUtils.randomChoice(decPlaces);
            placeWord = allPlaces.find(p => Math.abs(p.val - placeToRound) < 0.0001);
        }

        const factor = 1 / placeToRound;
        const roundedRaw = Math.round(numberToRound * factor) / factor;
        const displayOrig = this.formatNumber(numberToRound, lang);
        let ansDisplay = this.formatNumber(roundedRaw, lang);

        const numInt = Math.round(numberToRound * 10000);
        const placeInt = Math.round(placeToRound * 10000);
        const targetDigit = Math.floor(numInt / placeInt) % 10;
        const checkDigit = Math.floor(numInt / (placeInt / 10)) % 10;
        const isRoundingUp = checkDigit >= 5;

        let formatInstruction = "";
        if (v === 'pv_round_whole') {
            formatInstruction = lang === 'sv' ? " (Svara som ett heltal utan kommatecken)" : " (Answer as a whole number without decimals)";
        } else if (placeToRound === 0.1) {
            formatInstruction = lang === 'sv' ? " (Svara med exakt en decimal)" : " (Answer with exactly one decimal place)";
            if (roundedRaw % 1 === 0) ansDisplay += lang === 'sv' ? ',0' : '.0';
        } else if (placeToRound === 0.01) {
            formatInstruction = lang === 'sv' ? " (Svara med exakt två decimaler)" : " (Answer with exactly two decimal places)";
            if (roundedRaw % 1 === 0) {
                ansDisplay += lang === 'sv' ? ',00' : '.00';
            } else if ((roundedRaw * 10) % 1 === 0) {
                ansDisplay += '0';
            }
        }

        // Build annotated rounding LaTeX showing underlined target digit and downward arrow on the decider digit
        const sep = lang === 'sv' ? ',' : '.';
        const [wPart, dPart = ''] = displayOrig.split(sep);
        const annotatedChars: string[] = [];

        wPart.split('').forEach((ch, idx) => {
            const pVal = Math.pow(10, wPart.length - 1 - idx);
            if (Math.abs(pVal - placeToRound) < 0.0001) {
                annotatedChars.push(`\\underline{\\mathbf{${ch}}}`);
            } else if (Math.abs(pVal - placeToRound / 10) < 0.0001) {
                annotatedChars.push(`\\overset{\\downarrow}{\\mathbf{${ch}}}`);
            } else {
                annotatedChars.push(ch);
            }
        });

        if (dPart.length > 0) {
            annotatedChars.push(sep);
            dPart.split('').forEach((ch, idx) => {
                const pVal = Math.round(Math.pow(10, -(idx + 1)) * 1000) / 1000;
                if (Math.abs(pVal - placeToRound) < 0.0001) {
                    annotatedChars.push(`\\underline{\\mathbf{${ch}}}`);
                } else if (Math.abs(pVal - placeToRound / 10) < 0.0001) {
                    annotatedChars.push(`\\overset{\\downarrow}{\\mathbf{${ch}}}`);
                } else {
                    annotatedChars.push(ch);
                }
            });
        }

        const annotatedNumberLatex = annotatedChars.join('');

        const step3Text =
            placeToRound >= 10
                ? (lang === 'sv'
                    ? 'Ersätt siffror efter avrundningsplatsen med nollor och ta bort decimaler.'
                    : 'Replace digits after the rounding place with zeros and drop decimals.')
                : placeToRound === 1
                    ? (lang === 'sv'
                        ? 'Ta bort alla decimaler efter entalssiffran.'
                        : 'Drop all decimal digits after the ones place.')
                    : (lang === 'sv'
                        ? 'Klipp bort alla siffror till höger om den avrundade decimalen.'
                        : 'Drop all digits to the right of the rounded decimal place.');

        return {
            renderData: {
                description: lang === 'sv' ? `Avrunda talet ${displayOrig} till närmaste ${placeWord.sv}.${formatInstruction}` : `Round the number ${displayOrig} to the nearest ${placeWord.en}.${formatInstruction}`,
                answerType: 'numeric'
            },
            token: this.toBase64(ansDisplay),
            variationKey: v,
            type: 'calculate',
            clues: [
                {
                    text: lang === 'sv'
                        ? `Markera ${placeWord.sv}ssiffran (streck under) och grannen till höger (pil).`
                        : `Underline the ${placeWord.en} digit and mark the neighbor to its right (arrow).`,
                    latex: annotatedNumberLatex
                },
                {
                    text: lang === 'sv'
                        ? (isRoundingUp
                            ? `Grannen är ${checkDigit} (5 eller mer) → höj målsiffran ${targetDigit} med 1.`
                            : `Grannen är ${checkDigit} (mindre än 5) → behåll målsiffran ${targetDigit}.`)
                        : (isRoundingUp
                            ? `Neighbor is ${checkDigit} (5 or more) → round target digit ${targetDigit} up by 1.`
                            : `Neighbor is ${checkDigit} (less than 5) → keep target digit ${targetDigit}.`),
                    latex: isRoundingUp
                        ? `${checkDigit} \\ge 5 \\quad \\Rightarrow \\quad ${targetDigit} + 1`
                        : `${checkDigit} < 5 \\quad \\Rightarrow \\quad ${targetDigit} + 0`
                },
                {
                    text: step3Text,
                    latex: `${annotatedNumberLatex} \\quad \\rightarrow \\quad \\mathbf{${ansDisplay}}`
                }
            ]
        };
    }
}