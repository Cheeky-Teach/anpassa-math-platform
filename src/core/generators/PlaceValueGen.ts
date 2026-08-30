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
        // First digit shouldn't be 0
        const first = MathUtils.randomChoice(available);
        digits.push(first);
        available = available.filter(d => d !== first);
        available.push(0); // Add 0 for remaining digits

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
            { val: 10000, sv: 'tiotusental', svPlural: 'tiotusental', en: 'ten thousands' },
            { val: 1000, sv: 'tusental', svPlural: 'tusental', en: 'thousands' },
            { val: 100, sv: 'hundratal', svPlural: 'hundratal', en: 'hundreds' },
            { val: 10, sv: 'tiotal', svPlural: 'tiotal', en: 'tens' },
            { val: 1, sv: 'ental', svPlural: 'ental', en: 'ones' },
            { val: 0.1, sv: 'tiondel', svPlural: 'tiondelar', en: 'tenths' },
            { val: 0.01, sv: 'hundradel', svPlural: 'hundradelar', en: 'hundredths' },
            { val: 0.001, sv: 'tusendel', svPlural: 'tusendelar', en: 'thousandths' }
        ];
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
            // Sort by descending value to make the pedagogical breakdown sequential
            shuffledPlaces.sort((a, b) => b.val - a.val); 
            
            let totalValue = 0;
            const descriptions = [];
            const latexSteps = [];

            shuffledPlaces.forEach(p => {
                const count = MathUtils.randomInt(1, 9);
                const partValue = count * p.val;
                totalValue += partValue;
                descriptions.push(lang === 'sv' ? `${count} ${p.svPlural}` : `${count} ${p.en}`);
                latexSteps.push(`${count} \\cdot ${p.val} = ${partValue}`);
            });

            // Scramble the text description so the user still has to figure out the order
            const descString = MathUtils.shuffle([...descriptions]).join(', ');
            const additionLatex = latexSteps.join(' \\\\ ');

            return {
                renderData: { 
                    description: lang === 'sv' ? `Skriv talet som beskrivs: ${descString}` : `Write the number described: ${descString}`,
                    answerType: 'numeric' 
                },
                token: this.toBase64(totalValue.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        // 🟢 TWEAK: Original description injected directly into the first clue
                        text: lang === 'sv' ? `Uppgift: ${descString}. Steg 1: Skriv ut vad varje enskild del faktiskt är värd som ett tal.` : `Task: ${descString}. Step 1: Write out what each individual part is actually worth as a number.`, 
                        latex: `\\begin{aligned} ${additionLatex} \\end{aligned}` 
                    },
                    { 
                        text: lang === 'sv' ? "Steg 2: Addera (plussa ihop) alla dessa värden för att bygga det slutgiltiga talet." : "Step 2: Add all these individual values together to build the final number.", 
                        latex: `\\text{Totalt} = \\mathbf{${totalValue}}` 
                    },
                    { 
                        text: lang === 'sv' ? "Tips: Om en position (som tiotal eller ental) saknas i texten, betyder det att den platsen ska vara en nolla!" : "Tip: If a place value (like tens or ones) is missing from the text, it means that spot gets a zero!", 
                        latex: `` 
                    }
                ]
            };
        }

        const numLength = MathUtils.randomInt(3, 5);
        const digits = this.generateUniqueDigits(numLength);
        const numStr = digits.join('');
        const numValue = parseInt(numStr);
        
        // Pick a random digit to ask about
        let targetIndex = MathUtils.randomInt(0, numLength - 2);
        
        // Prevent 0 from being the target digit when asking for its value
        while (v === 'pv_whole_value' && digits[targetIndex] === 0) {
            targetIndex = MathUtils.randomInt(0, numLength - 2);
        }
        
        const targetDigit = digits[targetIndex];
        const placeValueFactor = Math.pow(10, numLength - 1 - targetIndex);
        const actualValue = targetDigit * placeValueFactor;
        const placeWord = places.find(p => p.val === placeValueFactor);

        if (v === 'pv_whole_value') {
            return {
                renderData: { 
                    description: lang === 'sv' ? `Vilket värde har siffran ${targetDigit} i talet ${numValue}?` : `What value does the digit ${targetDigit} have in the number ${numValue}?`,
                    answerType: 'numeric' 
                },
                token: this.toBase64(actualValue.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        // 🟢 TWEAK: Original number injected directly into the first clue
                        text: lang === 'sv' ? `Vi utgår från talet ${numValue}. Steg 1: Lokalisera siffran ${targetDigit} i talet och identifiera vilken position den står på.` : `We start with the number ${numValue}. Step 1: Locate the digit ${targetDigit} in the number and identify its position.`, 
                        latex: `\\text{Tal: } ${numValue} \\quad \\rightarrow \\quad \\text{Siffran } ${targetDigit} \\text{ står på } \\mathbf{${placeWord?.sv}}\\text{s plats.}` 
                    },
                    { 
                        text: lang === 'sv' ? `Steg 2: Eftersom platsen är värd ${placeValueFactor}, multiplicerar vi siffran med detta värde.` : `Step 2: Since the place is worth ${placeValueFactor}, we multiply the digit by this value.`, 
                        latex: `${targetDigit} \\cdot ${placeValueFactor} = \\mathbf{${actualValue}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${actualValue}` : `Answer: ${actualValue}`, 
                        latex: `${actualValue}` 
                    }
                ]
            };
        }

        // pv_whole_digit
        return {
            renderData: { 
                description: lang === 'sv' ? `Vilken siffra står på ${placeWord?.sv}ets plats i talet ${numValue}?` : `Which digit is in the ${placeWord?.en} place in the number ${numValue}?`,
                answerType: 'numeric' 
            },
            token: this.toBase64(targetDigit.toString()), variationKey: v, type: 'calculate',
            clues: [
                { 
                    // 🟢 TWEAK: Original number injected directly into the first clue
                    text: lang === 'sv' ? `Vi tittar på talet ${numValue}. Steg 1: Kom ihåg att platsen för ${placeWord?.sv} har värdet ${placeValueFactor}.` : `We look at the number ${numValue}. Step 1: Remember that the ${placeWord?.en} place has a value of ${placeValueFactor}.`, 
                    latex: `\\text{Tal: } ${numValue} \\quad \\rightarrow \\quad \\text{Sökt värde: } ${placeValueFactor}` 
                },
                { 
                    text: lang === 'sv' ? `Steg 2: Räkna från höger till vänster (ental, tiotal, hundratal...) tills du når rätt plats.` : `Step 2: Count from right to left (ones, tens, hundreds...) until you reach the correct spot.`, 
                    latex: `\\text{Rätt siffra är } \\mathbf{${targetDigit}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${targetDigit}` : `Answer: ${targetDigit}`, 
                    latex: `${targetDigit}` 
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
            shuffledPlaces.sort((a, b) => b.val - a.val); 
            
            let totalValue = 0;
            const descriptions = [];
            const latexSteps = [];

            shuffledPlaces.forEach(p => {
                const count = MathUtils.randomInt(1, 9);
                const partValue = Math.round(count * p.val * 1000) / 1000;
                totalValue += partValue;
                descriptions.push(lang === 'sv' ? `${count} ${p.svPlural}` : `${count} ${p.en}`);
                latexSteps.push(`${count} \\cdot ${this.formatNumber(p.val, lang)} = ${this.formatNumber(partValue, lang)}`);
            });

            totalValue = Math.round(totalValue * 1000) / 1000;
            const descString = MathUtils.shuffle([...descriptions]).join(', ');
            const ansStr = this.formatNumber(totalValue, lang);
            const additionLatex = latexSteps.join(' \\\\ ');

            return {
                renderData: { 
                    description: lang === 'sv' ? `Skriv decimaltalet som beskrivs: ${descString}` : `Write the decimal number described: ${descString}`,
                    answerType: 'numeric' 
                },
                token: this.toBase64(ansStr), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        // 🟢 TWEAK: Original description injected directly into the first clue
                        text: lang === 'sv' ? `Uppgift: ${descString}. Steg 1: Börja med att översätta varje del i texten till dess siffervärde.` : `Task: ${descString}. Step 1: Start by translating each part of the text into its number value.`, 
                        latex: `\\begin{aligned} ${additionLatex} \\end{aligned}` 
                    },
                    { 
                        text: lang === 'sv' ? "Steg 2: Addera (plussa ihop) alla dessa värden. Glöm inte var decimalkommat ska sitta!" : "Step 2: Add all these values together. Don't forget where the decimal point belongs!", 
                        latex: `\\text{Totalt} = \\mathbf{${ansStr}}` 
                    },
                    { 
                        text: lang === 'sv' ? "Tips: Saknas till exempel tiondelar men du har hundradelar? Då måste du sätta en nolla på tiondelens plats!" : "Tip: Missing tenths but you have hundredths? You must put a zero in the tenths place!", 
                        latex: `` 
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
            digitObjects.push({ digit: digits[i], place: placeMultiplier });
            placeMultiplier /= 10;
        }

        numValue = Math.round(numValue * 1000) / 1000; // floating point fix
        const displayNum = this.formatNumber(numValue, lang);

        // Pick a random DECIMAL digit to focus on
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
            return {
                renderData: { 
                    description: lang === 'sv' ? `Vilket värde har siffran ${targetObj.digit} i talet ${displayNum}? Svara i decimalform.` : `What value does the digit ${targetObj.digit} have in the number ${displayNum}? Answer in decimal form.`,
                    answerType: 'numeric' 
                },
                token: this.toBase64(actualValueDisplay), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        // 🟢 TWEAK: Original number injected directly into the first clue
                        text: lang === 'sv' ? `Vi utgår från talet ${displayNum}. Steg 1: Lokalisera siffran ${targetObj.digit}. Eftersom den står till höger om kommatecknet, är det en decimal.` : `We start with the number ${displayNum}. Step 1: Locate the digit ${targetObj.digit}. Since it is to the right of the decimal point, it is a decimal fraction.`, 
                        latex: `\\text{Tal: } ${displayNum} \\quad \\rightarrow \\quad \\text{Siffran står på } \\mathbf{${placeWord?.sv}}\\text{s plats.}` 
                    },
                    { 
                        text: lang === 'sv' ? `Steg 2: Platsen är värd ${placeValueDisplay}. Multiplicera siffran med platsens värde.` : `Step 2: The place is worth ${placeValueDisplay}. Multiply the digit by the place's value.`, 
                        latex: `${targetObj.digit} \\cdot ${placeValueDisplay} = \\mathbf{${actualValueDisplay}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${actualValueDisplay}` : `Answer: ${actualValueDisplay}`, 
                        latex: `${actualValueDisplay}` 
                    }
                ]
            };
        }

        // pv_dec_digit
        return {
            renderData: { 
                description: lang === 'sv' ? `Vilken siffra står på ${placeWord?.sv}ets plats i talet ${displayNum}?` : `Which digit is in the ${placeWord?.en} place in the number ${displayNum}?`,
                answerType: 'numeric' 
            },
            token: this.toBase64(targetObj.digit.toString()), variationKey: v, type: 'calculate',
            clues: [
                { 
                    // 🟢 TWEAK: Original number injected directly into the first clue
                    text: lang === 'sv' ? `Vi tittar på talet ${displayNum}. Steg 1: Leta upp kommatecknet. Det fungerar som väggen mellan hela tal och decimaler.` : `We look at the number ${displayNum}. Step 1: Locate the decimal point. It acts as the wall between whole numbers and decimals.`, 
                    latex: `\\text{Tal: } ${displayNum} \\quad \\rightarrow \\quad \\text{Sökt plats: } ${placeWord?.sv} (${placeValueDisplay})` 
                },
                { 
                    text: lang === 'sv' ? `Steg 2: Räkna stegen åt höger från kommatecknet (tiondel, hundradel, tusendel) tills du hittar rätt position.` : `Step 2: Count steps to the right from the decimal point (tenths, hundredths, thousandths) until you find the right position.`, 
                    latex: `\\text{Rätt siffra är } \\mathbf{${targetObj.digit}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${targetObj.digit}` : `Answer: ${targetObj.digit}`, 
                    latex: `${targetObj.digit}` 
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

        // Calculate Rounded Answer safely avoiding floating point weirdness
        const factor = 1 / placeToRound;
        const roundedRaw = Math.round(numberToRound * factor) / factor;
        const displayOrig = this.formatNumber(numberToRound, lang);
        let ansDisplay = this.formatNumber(roundedRaw, lang);

        // Robust mathematical extraction of the specific digits for the clue
        const numInt = Math.round(numberToRound * 10000);
        const placeInt = Math.round(placeToRound * 10000);
        const targetDigit = Math.floor(numInt / placeInt) % 10;
        const checkDigit = Math.floor(numInt / (placeInt / 10)) % 10;
        const isRoundingUp = checkDigit >= 5;

        // Dynamic formatting instructions
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

        return {
            renderData: { 
                description: lang === 'sv' ? `Avrunda talet ${displayOrig} till närmaste ${placeWord.sv}.${formatInstruction}` : `Round the number ${displayOrig} to the nearest ${placeWord.en}.${formatInstruction}`,
                answerType: 'numeric' 
            },
            token: this.toBase64(ansDisplay), variationKey: v, type: 'calculate',
            clues: [
                { 
                    // 🟢 TWEAK: Original number injected directly into the first clue
                    text: lang === 'sv' ? `Vi ska avrunda talet ${displayOrig}. Steg 1: Identifiera "målsiffran". Vi ska avrunda till ${placeWord.sv}, vilket betyder att siffran ${targetDigit} är vår målsiffra.` : `We will round the number ${displayOrig}. Step 1: Identify the "target digit". We are rounding to the nearest ${placeWord.en}, meaning the digit ${targetDigit} is our target.`, 
                    latex: `\\text{Tal: } ${displayOrig} \\quad \\rightarrow \\quad \\text{Målsiffra: } \\mathbf{${targetDigit}}` 
                },
                { 
                    text: lang === 'sv' ? `Steg 2: Titta på "grannen" precis till höger om målsiffran. Det är den som bestämmer vad som ska hända.` : `Step 2: Look at the "neighbor" directly to the right of the target digit. This digit decides what happens.`, 
                    latex: `\\text{Siffran till höger: } \\mathbf{${checkDigit}}` 
                },
                { 
                    text: lang === 'sv' ? `Steg 3: Följ avrundningsregeln. Är grannen 5 eller mer avrundar vi uppåt (+1). Är den 4 eller mindre stannar målsiffran kvar.` : `Step 3: Follow the rounding rule. If the neighbor is 5 or more, round up (+1). If it's 4 or less, the target digit stays the same.`, 
                    latex: isRoundingUp 
                        ? `${checkDigit} \\ge 5 \\rightarrow \\mathbf{\\text{Avrunda uppåt}}` 
                        : `${checkDigit} \\le 4 \\rightarrow \\mathbf{\\text{Behåll siffran}}` 
                },
                { 
                    text: lang === 'sv' ? `Steg 4: Applicera regeln på talet. ${v === 'pv_round_whole' ? 'Nollställ' : 'Ta bort'} alla siffror efter målsiffran.` : `Step 4: Apply the rule to the number. ${v === 'pv_round_whole' ? 'Turn all digits after the target to zero' : 'Remove all digits after the target'}.`, 
                    latex: `\\text{Svar: } \\mathbf{${ansDisplay}}` 
                }
            ]
        };
    }
}