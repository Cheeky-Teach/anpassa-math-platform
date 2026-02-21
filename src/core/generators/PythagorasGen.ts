import { MathUtils } from '../utils/MathUtils.js';

export class PythagorasGen {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        // Adaptive Fallback: If Level 1 is mastered, push to Hypotenuse calculations
        if (level === 1 && options.hideConcept && options.exclude?.includes('missing_square')) {
            return this.level2_Hypotenuse(lang, undefined, options);
        }

        switch (level) {
            case 1: return this.level1_SquaresRoots(lang, undefined, options);
            case 2: return this.level2_Hypotenuse(lang, undefined, options);
            case 3: return this.level3_Leg(lang, undefined, options);
            case 4: return this.level4_Applications(lang, undefined, options);
            case 5: return this.level5_Converse(lang, undefined, options);
            case 6: return this.level6_AdvancedMixed(lang, options);
            default: return this.level1_SquaresRoots(lang, undefined, options);
        }
    }

    /**
     * Targeted Generation for Question Studio
     * Maps ALL keys from skillBuckets.js to maintain visual/studio compatibility.
     */
    public generateByVariation(key: string, lang: string = 'sv'): any {
        switch (key) {
            case 'sqrt_calc':
            case 'square_calc':
            case 'missing_square':
            case 'sqrt_estimation':
                return this.level1_SquaresRoots(lang, key);
            case 'hyp_visual':
            case 'hyp_equation':
            case 'hyp_error':
                return this.level2_Hypotenuse(lang, key);
            case 'leg_visual':
            case 'leg_concept':
            case 'leg_text':
                return this.level3_Leg(lang, key);
            case 'app_ladder':
            case 'app_diagonal':
            case 'app_displacement':
            case 'app_guy_wire':
            case 'app_coords':
                return this.level4_Applications(lang, key);
            case 'conv_check':
            case 'conv_missing':
            case 'conv_trap':
                return this.level5_Converse(lang, key);
            case 'advanced_mixed':
                return this.level6_AdvancedMixed(lang);
            default:
                return this.generate(1, lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    private toSup(num: number | string): string {
        const map: any = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
        return num.toString().split('').map(char => map[char] || char).join('');
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
     * Internal Logic: Pythagorean Triple Generator
     * Generates clean integer triples to avoid complex decimals in foundation levels.
     */
    private getTriple(): { a: number, b: number, c: number } {
        const primitives = [
            [3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [9, 40, 41]
        ];
        const base = MathUtils.randomChoice(primitives);
        const k = MathUtils.randomChoice([1, 2, 3]); 
        return { a: base[0] * k, b: base[1] * k, c: base[2] * k };
    }

    // --- LEVEL 1: SQUARES & ROOTS ---
    private level1_SquaresRoots(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'sqrt_calc', type: 'calculate' },
            { key: 'square_calc', type: 'calculate' },
            { key: 'missing_square', type: 'calculate' },
            { key: 'sqrt_estimation', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'sqrt_calc' || v === 'square_calc') {
            const isRoot = v === 'sqrt_calc';
            const base = MathUtils.randomInt(3, 12);
            const square = base * base;
            const ans = isRoot ? base : square;

            return {
                renderData: {
                    description: lang === 'sv' ? (isRoot ? "Beräkna kvadratroten." : "Beräkna kvadraten.") : (isRoot ? "Calculate the square root." : "Calculate the square."),
                    latex: isRoot ? `\\sqrt{${square}}` : `${base}^2`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? (isRoot ? `Steg 1: Kvadratroten ur ${square} är det tal som multiplicerat med sig självt blir ${square}.` : `Steg 1: Att kvadrera ett tal innebär att man multiplicerar det med sig självt en gång.`) : (isRoot ? `Step 1: The square root of ${square} is the number that, when multiplied by itself, equals ${square}.` : `Step 1: Squaring a number means multiplying it by itself once.`) },
                    { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: isRoot ? `${base} · ${base} = ${square}` : `${base} · ${base} = ${ans}` },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
                ]
            };
        }

        if (v === 'sqrt_estimation') {
            const base = MathUtils.randomInt(5, 9);
            const sq = base * base;
            const test = sq + MathUtils.randomChoice([-3, 3]);
            const isGreater = test > sq;
            const ans = isGreater ? (lang === 'sv' ? "Ja" : "Yes") : (lang === 'sv' ? "Nej" : "No");

            return {
                renderData: {
                    description: lang === 'sv' ? `Är $\\sqrt{${test}}$ större än ${base}?` : `Is $\\sqrt{${test}}$ greater than ${base}?`,
                    answerType: 'multiple_choice', options: lang === 'sv' ? ["Ja", "Nej"] : ["Yes", "No"]
                },
                token: this.toBase64(ans), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? `Steg 1: Beräkna kvadraten av ${base} för att ha något att jämföra med.` : `Step 1: Calculate the square of ${base} to have a comparison point.`, latex: `${base}^2 = ${sq}` },
                    { text: lang === 'sv' ? `Steg 2: Jämför ${test} med ${sq}.` : `Step 2: Compare ${test} with ${sq}.` },
                    { text: lang === 'sv' ? `Eftersom ${test} är ${isGreater ? 'större' : 'mindre'} än ${sq}, så är dess kvadratrot också ${isGreater ? 'större' : 'mindre'} än ${base}.` : `Since ${test} is ${isGreater ? 'greater' : 'less'} than ${sq}, its square root is also ${isGreater ? 'greater' : 'less'} than ${base}.` },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
                ]
            };
        }

        const b = MathUtils.randomInt(4, 11);
        return {
            renderData: { description: lang === 'sv' ? "Lös ekvationen." : "Solve the equation.", latex: `x^2 = ${b*b}`, answerType: 'numeric' },
            token: this.toBase64(b.toString()), variationKey: 'missing_square', type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: För att lösa ut x när det är upphöjt till 2, använder vi kvadratroten på båda sidor." : "Step 1: To solve for x when it is squared, we use the square root on both sides.", latex: `x = \\sqrt{${b*b}}` },
                { text: lang === 'sv' ? `Svar: ${b}` : `Answer: ${b}` }
            ]
        };
    }

    // --- LEVEL 2: HYPOTENUSE ---
    private level2_Hypotenuse(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'hyp_visual', type: 'calculate' },
            { key: 'hyp_equation', type: 'concept' },
            { key: 'hyp_error', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const t = this.getTriple();

        if (v === 'hyp_equation') {
            const correct = `${t.a}² + ${t.b}² = x²`;
            return {
                renderData: {
                    description: lang === 'sv' ? `Vilken ekvation är rätt uppställd för att hitta hypotenusan x?` : `Which equation is correctly set up to find the hypotenuse x?`,
                    answerType: 'multiple_choice', options: MathUtils.shuffle([correct, `${t.a}² + x² = ${t.c}²`, `${t.a} + ${t.b} = x`]),
                    geometry: { type: 'triangle', subtype: 'right', width: t.a, height: t.b, labels: { b: t.a, h: t.b, hyp: 'x' } }
                },
                token: this.toBase64(correct), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Pythagoras sats säger att summan av kateternas kvadrater är lika med hypotenusans kvadrat." : "Step 1: Pythagoras' theorem states that the sum of the squares of the legs is equal to the square of the hypotenuse.", latex: "a^2 + b^2 = c^2" },
                    { text: lang === 'sv' ? `Här är kateterna ${t.a} och ${t.b}, och hypotenusan är x.` : `Here the legs are ${t.a} and ${t.b}, and the hypotenuse is x.` },
                    { text: lang === 'sv' ? `Svar: ${correct}` : `Answer: ${correct}` }
                ]
            };
        }

        return {
            renderData: {
                description: lang === 'sv' ? "Beräkna hypotenusan x." : "Calculate the hypotenuse x.",
                answerType: 'numeric',
                geometry: { type: 'triangle', subtype: 'right', width: t.a, height: t.b, labels: { b: t.a, h: t.b, hyp: 'x' } }
            },
            token: this.toBase64(t.c.toString()), variationKey: 'hyp_visual', type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Ställ upp Pythagoras sats." : "Step 1: Set up Pythagoras' theorem.", latex: `${t.a}^2 + ${t.b}^2 = x^2` },
                { text: lang === 'sv' ? "Steg 2: Beräkna kvadraterna för de två kända sidorna." : "Step 2: Calculate the squares for the two known sides.", latex: `${t.a*t.a} + ${t.b*t.b} = x^2` },
                { text: lang === 'sv' ? "Steg 3: Addera areorna." : "Step 3: Add the areas.", latex: `${t.a*t.a + t.b*t.b} = x^2` },
                { text: lang === 'sv' ? "Steg 4: Dra kvadratroten ur summan för att hitta längden x." : "Step 4: Take the square root of the sum to find the length x.", latex: `x = \\sqrt{${t.c*t.c}}` },
                { text: lang === 'sv' ? `Svar: ${t.c}` : `Answer: ${t.c}` }
            ]
        };
    }

    // --- LEVEL 3: LEG ---
    private level3_Leg(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'leg_visual', type: 'calculate' },
            { key: 'leg_concept', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const t = this.getTriple();

        if (v === 'leg_concept') {
            const ans = lang === 'sv' ? "Subtraktion" : "Subtraction";
            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket räknesätt använder du för att hitta en katet om du vet hypotenusan och den andra kateten?" : "Which operation do you use to find a leg if you know the hypotenuse and the other leg?",
                    answerType: 'multiple_choice', options: [ans, lang === 'sv' ? "Addition" : "Addition"]
                },
                token: this.toBase64(ans), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Utgå från formeln $a^2 + b^2 = c^2$." : "Step 1: Start from the formula $a^2 + b^2 = c^2$." },
                    { text: lang === 'sv' ? "Steg 2: För att isolera en katet ($a^2$) måste vi flytta över den andra kateten till andra sidan likhetstecknet." : "Step 2: To isolate a leg ($a^2$), we must move the other leg to the other side of the equals sign.", latex: "a^2 = c^2 - b^2" },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
                ]
            };
        }

        return {
            renderData: {
                description: lang === 'sv' ? "Beräkna den saknade kateten x." : "Calculate the missing leg x.",
                answerType: 'numeric',
                geometry: { type: 'triangle', subtype: 'right', width: t.b, height: t.a, labels: { b: 'x', h: t.a, hyp: t.c } }
            },
            token: this.toBase64(t.b.toString()), variationKey: 'leg_visual', type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Ställ upp ekvationen. Katet² + Katet² = Hypotenusa²." : "Step 1: Set up the equation. Leg² + Leg² = Hypotenuse².", latex: `x^2 + ${t.a}^2 = ${t.c}^2` },
                { text: lang === 'sv' ? "Steg 2: Beräkna de kända kvadraterna." : "Step 2: Calculate the known squares.", latex: `x^2 + ${t.a*t.a} = ${t.c*t.c}` },
                { text: lang === 'sv' ? "Steg 3: Subtrahera den kända arean från hypotenusans area." : "Step 3: Subtract the known area from the hypotenuse area.", latex: `x^2 = ${t.c*t.c} - ${t.a*t.a}` },
                { text: lang === 'sv' ? "Steg 4: Beräkna skillnaden." : "Step 4: Calculate the difference.", latex: `x^2 = ${t.b*t.b}` },
                { text: lang === 'sv' ? "Steg 5: Dra kvadratroten ur svaret." : "Step 5: Take the square root of the answer.", latex: `x = \\sqrt{${t.b*t.b}}` },
                { text: lang === 'sv' ? `Svar: ${t.b}` : `Answer: ${t.b}` }
            ]
        };
    }

    // --- LEVEL 4: APPLICATIONS ---
    private level4_Applications(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'app_ladder', type: 'calculate' },
            { key: 'app_diagonal', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const t = this.getTriple();

        if (v === 'app_diagonal') {
            return {
                renderData: {
                    description: lang === 'sv' ? `En rektangel har sidorna ${t.a} cm och ${t.b} cm. Hur lång är diagonalen?` : `A rectangle has sides of ${t.a} cm and ${t.b} cm. How long is the diagonal?`,
                    answerType: 'numeric',
                    geometry: { type: 'rectangle', width: t.a, height: t.b, labels: { b: t.a, h: t.b } }
                },
                token: this.toBase64(t.c.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Diagonalen i en rektangel bildar hypotenusan i en rätvinklig triangel." : "Step 1: The diagonal in a rectangle forms the hypotenuse in a right-angled triangle." },
                    { text: lang === 'sv' ? "Steg 2: Beräkna sidornas kvadrater och addera dem." : "Step 2: Calculate the squares of the sides and add them.", latex: `${t.a}^2 + ${t.b}^2 = d^2` },
                    { text: lang === 'sv' ? "Steg 3: Dra kvadratroten ur summan." : "Step 3: Take the square root of the sum.", latex: `\\sqrt{${t.c*t.c}} = ${t.c}` },
                    { text: lang === 'sv' ? `Svar: ${t.c}` : `Answer: ${t.c}` }
                ]
            };
        }

        // app_ladder
        return {
            renderData: {
                description: lang === 'sv' ? `En ${t.c} meter lång stege lutar mot en vägg. Den når ${t.b} meter upp på väggen. Hur långt från väggen står stegen?` : `A ${t.c} meter long ladder leans against a wall. It reaches ${t.b} meters up the wall. How far from the wall is the base?`,
                answerType: 'numeric'
            },
            token: this.toBase64(t.a.toString()), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Stegen är hypotenusan och väggen är en katet." : "Step 1: The ladder is the hypotenuse and the wall is one leg." },
                { text: lang === 'sv' ? "Steg 2: Använd formeln för att hitta den saknade kateten." : "Step 2: Use the formula to find the missing leg.", latex: `x^2 = ${t.c}^2 - ${t.b}^2` },
                { text: lang === 'sv' ? `Svar: ${t.a}` : `Answer: ${t.a}` }
            ]
        };
    }

    // --- LEVEL 5: CONVERSE ---
    private level5_Converse(lang: string, variationKey?: string, options: any = {}): any {
        const t = this.getTriple();
        const isRight = Math.random() > 0.5;
        const c = isRight ? t.c : t.c + 2;
        const ans = isRight ? (lang === 'sv' ? "Ja" : "Yes") : (lang === 'sv' ? "Nej" : "No");

        return {
            renderData: {
                description: lang === 'sv' ? `Är en triangel med sidorna ${t.a}, ${t.b} och ${c} rätvinklig?` : `Is a triangle with sides ${t.a}, ${t.b} and ${c} right-angled?`,
                answerType: 'multiple_choice', options: lang === 'sv' ? ["Ja", "Nej"] : ["Yes", "No"]
            },
            token: this.toBase64(ans), variationKey: 'conv_check', type: 'concept',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Testa om Pythagoras sats stämmer för dessa sidor." : "Step 1: Test if Pythagoras' theorem holds for these sides.", latex: `${t.a}^2 + ${t.b}^2 = ${c}^2` },
                { text: lang === 'sv' ? `Steg 2: Beräkna vänsterledet: ${t.a*t.a} + ${t.b*t.b} = ${t.a*t.a + t.b*t.b}.` : `Step 2: Calculate the left side: ${t.a*t.a} + ${t.b*t.b} = ${t.a*t.a + t.b*t.b}.` },
                { text: lang === 'sv' ? `Steg 3: Beräkna högerledet: ${c}^2 = ${c*c}.` : `Step 3: Calculate the right side: ${c}^2 = ${c*c}.` },
                { text: lang === 'sv' ? (isRight ? "Då sidorna stämmer med formeln är den rätvinklig." : "Då sidorna INTE stämmer med formeln är den inte rätvinklig.") : (isRight ? "Since the sides match the formula, it is right-angled." : "Since the sides do NOT match the formula, it is not right-angled.") },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ]
        };
    }

    private level6_AdvancedMixed(lang: string, options: any): any {
        const subLevel = MathUtils.randomInt(2, 4);
        return this.generate(subLevel, lang, options);
    }
}