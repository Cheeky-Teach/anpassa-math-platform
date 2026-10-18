import { MathUtils } from '../utils/MathUtils.js';
import { enrichQuestionMetadata } from '../utils/WordProblemDecorator.js';

export class PythagorasGen {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        // Adaptive Fallback: If Level 1 is mastered, push to Hypotenuse calculations
        if (level === 1 && options.hideConcept && options.exclude?.includes('missing_square')) {
            return this.level2_Hypotenuse(lang, undefined, options);
        }

        let questionData: any;

        switch (level) {
            case 1: questionData = this.level1_SquaresRoots(lang, undefined, options); break;
            case 2: questionData = this.level2_Hypotenuse(lang, undefined, options); break;
            case 3: questionData = this.level3_Leg(lang, undefined, options); break;
            case 4: questionData = this.level4_Applications(lang, undefined, options); break;
            case 5: questionData = this.level5_Converse(lang, undefined, options); break;
            case 6: questionData = this.level6_AdvancedMixed(lang, options); break;
            default: questionData = this.level1_SquaresRoots(lang, undefined, options); break;
        }

        // 🟢 Run through the decorator
        enrichQuestionMetadata(questionData);

        // 🟢 Practice Mode Level-Wide Override
        const WORD_PROBLEM_ELIGIBLE_LEVELS = [2, 3, 4, 6];
        if (WORD_PROBLEM_ELIGIBLE_LEVELS.includes(level)) {
            if (!questionData.metadata) questionData.metadata = {};
            questionData.metadata.levelSupportsWordProblems = true;
        }

        return questionData;
    }

    /**
     * Targeted Generation for Question Studio
     * Maps ALL keys from skillBuckets.js to maintain visual/studio compatibility.
     */
    public generateByVariation(key: string, lang: string = 'sv', options: any = {}): any {
        switch (key) {
            case 'sqrt_calc':
            case 'square_calc':
            case 'missing_square':
            case 'sqrt_estimation':
                return this.level1_SquaresRoots(lang, key, options);
            case 'hyp_visual':
            case 'hyp_equation':
            case 'hyp_error':
                return this.level2_Hypotenuse(lang, key, options);
            case 'leg_visual':
            case 'leg_concept':
            case 'leg_text':
                return this.level3_Leg(lang, key, options);
            case 'app_ladder':
            case 'app_diagonal':
            case 'app_displacement':
            case 'app_guy_wire':
            case 'app_coords':
                return this.level4_Applications(lang, key, options);
            case 'conv_check':
            case 'conv_missing':
            case 'conv_trap':
                return this.level5_Converse(lang, key, options);
            case 'advanced_mixed':
                return this.level6_AdvancedMixed(lang, options);
            default:
                return this.generate(1, lang, options);
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
                    { 
                        text: lang === 'sv' ? (isRoot ? `Kvadratroten ur ${square} är talet som gånger sig självt blir ${square}.` : `Att kvadrera ett tal innebär att du tar talet gånger sig självt.`) : (isRoot ? `The square root of ${square} is the number that times itself equals ${square}.` : `Squaring a number means multiplying it by itself.`), 
                        latex: isRoot ? `\\sqrt{${square}} = x \\rightarrow x \\cdot x = ${square}` : `${base}^2 = ${base} \\cdot ${base}` 
                    },
                    { 
                        text: lang === 'sv' ? `Räkna ut: ${base} gånger ${base}.` : `Calculate: ${base} times ${base}.`, 
                        latex: `${base} \\cdot ${base} = \\mathbf{${ans}}` 
                    },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, latex: `${ans}` }
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
                    { 
                        text: lang === 'sv' ? `För att jämföra räknar vi ut vad ${base} blir om vi gångrar det med sig självt (kvadrerar det).` : `To compare easily, let's find out what ${base} equals when multiplied by itself (squared).`, 
                        latex: `${base}^2 = ${base} \\cdot ${base} = \\mathbf{${sq}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Det betyder att talet ${base} exakt motsvarar uttrycket \\sqrt{${sq}}.` : `This means that the number ${base} perfectly matches the expression \\sqrt{${sq}}.`, 
                        latex: `${base} = \\sqrt{${sq}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Nu jämför vi rötterna under taket: Är roten ur ${test} större än roten ur ${sq}?` : `Now let's compare the square roots: Is the root of ${test} larger than the root of ${sq}?`, 
                        latex: `\\sqrt{${test}} \\quad \\text{vs} \\quad \\sqrt{${sq}}` 
                    },
                    { 
                        text: lang === 'sv' ? (isGreater ? `Ja! Eftersom ${test} är ett större tal än ${sq}, blir dess rot också större.` : `Nej! Eftersom ${test} är ett mindre tal än ${sq}, blir dess rot mindre.`) : (isGreater ? `Yes! Since ${test} is a larger number than ${sq}, its root will also be larger.` : `No! Since ${test} is a smaller number than ${sq}, its root will be smaller.`), 
                        latex: isGreater ? `\\mathbf{\\sqrt{${test}} > \\sqrt{${sq}}}` : `\\mathbf{\\sqrt{${test}} < \\sqrt{${sq}}}` 
                    },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, latex: `\\text{${ans}}` }
                ]
            };
        }

        const b = MathUtils.randomInt(4, 11);
        return {
            renderData: { description: lang === 'sv' ? "Lös ekvationen och hitta värdet på x." : "Solve the equation and find the value of x.", latex: `x^2 = ${b*b}`, answerType: 'numeric' },
            token: this.toBase64(b.toString()), variationKey: 'missing_square', type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? "Det lilla två-talet däruppe betyder 'gånger sig själv'. Vi söker alltså ett okänt tal som gånger sig självt blir " + (b*b) + "." : "The small exponent 2 means 'multiplied by itself'. We are looking for an unknown number that times itself equals " + (b*b) + ".", 
                    latex: `x^2 = ${b*b}` 
                },
                { 
                    text: lang === 'sv' ? "För att trolla bort upphöjt till 2 gör vi det motsatta på andra sidan, vilket är att ta kvadratroten." : "To undo the power of 2, we perform the opposite operation on the other side, which is taking the square root.", 
                    latex: `x = \\mathbf{\\sqrt{${b*b}}}` 
                },
                { 
                    text: lang === 'sv' ? `Kolla i multiplikationstabellen: Vilket tal gånger sig självt blir ${b*b}? Det är ${b}.` : `Think of your multiplication facts: What number times itself equals ${b*b}? That is ${b}.`, 
                    latex: `x = \\mathbf{${b}}` 
                },
                { text: lang === 'sv' ? `Svar: ${b}` : `Answer: ${b}`, latex: `${b}` }
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
                    interceptorToken: `${t.a} ; ${t.b} ; ${t.c}`,
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
                interceptorToken: `${t.a} ; ${t.b} ; ${t.c}`,
                answerType: 'numeric',
                geometry: { type: 'triangle', subtype: 'right', width: t.a, height: t.b, labels: { b: t.a, h: t.b, hyp: 'x' } }
            },
            token: this.toBase64(t.c.toString()), variationKey: 'hyp_visual', type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? "Vi tänker oss att vi bygger en kvadrat på varje sida. Summan av de två små rutorna blir lika med den stora rutan på den sneda sidan." : "Imagine building a square on each side. The sum of the two small squares equals the big square on the slanted side.", 
                    latex: `${t.a}^2 + ${t.b}^2 = x^2` 
                },
                { 
                    text: lang === 'sv' ? `Räkna ut arean på de två raka sidorna: ${t.a} gånger ${t.a} och ${t.b} gånger ${t.b}.` : `Calculate the area of the two straight sides: ${t.a} times ${t.a} and ${t.b} times ${t.b}.`, 
                    latex: `${t.a*t.a} + ${t.b*t.b} = x^2` 
                },
                { 
                    text: lang === 'sv' ? `Plussa ihop de två areorna: ${t.a*t.a} + ${t.b*t.b} blir ${t.a*t.a + t.b*t.b}.` : `Add the two areas: ${t.a*t.a} + ${t.b*t.b} equals ${t.a*t.a + t.b*t.b}.`, 
                    latex: `x^2 = \\mathbf{${t.a*t.a + t.b*t.b}}` 
                },
                { 
                    text: lang === 'sv' ? "Dra nu kvadratroten ur svaret för att hitta längden på den sneda sidan x." : "Now take the square root of the result to find the length of the slanted side x.", 
                    latex: `x = \\sqrt{${t.c*t.c}} = \\mathbf{${t.c}}` 
                },
                { text: lang === 'sv' ? `Svar: ${t.c}` : `Answer: ${t.c}`, latex: `${t.c}` }
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
                interceptorToken: `${t.a} ; ${t.b} ; ${t.c}`,
                answerType: 'numeric',
                geometry: { type: 'triangle', subtype: 'right', width: t.b, height: t.a, labels: { b: 'x', h: t.a, hyp: t.c } }
            },
            token: this.toBase64(t.b.toString()), variationKey: 'leg_visual', type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? "När vi vill hitta en kort sida (en rak vägg), tar vi den långa sneda sidan minus den korta väggen." : "When we want to find a short side (a straight wall), we take the long slanted side minus the short wall.", 
                    latex: `x^2 = ${t.c}^2 - ${t.a}^2` 
                },
                { 
                    text: lang === 'sv' ? `Beräkna kvadraterna: ${t.c} gånger ${t.c} och ${t.a} gånger ${t.a}.` : `Calculate the squares: ${t.c} times ${t.c} and ${t.a} times ${t.a}.`, 
                    latex: `x^2 = ${t.c*t.c} - ${t.a*t.a}` 
                },
                { 
                    text: lang === 'sv' ? `Räkna ut skillnaden: ${t.c*t.c} minus ${t.a*t.a} blir ${t.b*t.b}.` : `Calculate the difference: ${t.c*t.c} minus ${t.a*t.a} equals ${t.b*t.b}.`, 
                    latex: `x^2 = \\mathbf{${t.b*t.b}}` 
                },
                { 
                    text: lang === 'sv' ? "Dra kvadratroten ur svaret för att hitta längden x." : "Take the square root of the result to find the length x.", 
                    latex: `x = \\sqrt{${t.b*t.b}} = \\mathbf{${t.b}}` 
                },
                { text: lang === 'sv' ? `Svar: ${t.b}` : `Answer: ${t.b}`, latex: `${t.b}` }
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
                    interceptorToken: `${t.a} ; ${t.b} ; ${t.c}`,
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
                { 
                    text: lang === 'sv' ? `När stegen lutar mot väggen bildas en rätvinklig triangel. Den långa sneda stegen (${t.c} m) är hypotenusan, och den höga väggen (${t.b} m) är en rak sida.` : `When the ladder leans against the wall, it forms a right-angled triangle. The long slanted ladder (${t.c} m) is the hypotenuse, and the vertical wall (${t.b} m) is one straight side.`, 
                    latex: `\\text{Formel}: x^2 = \\text{sneda sidan}^2 - \\text{raka väggen}^2` 
                },
                { 
                    text: lang === 'sv' ? `Eftersom vi söker avståndet på marken (en kort rak sida x), tar vi den sneda stegen i kvadrat minus väggen i kvadrat.` : `Since we are looking for the distance on the ground (a short straight side x), we take the slanted ladder squared minus the wall squared.`, 
                    latex: `x^2 = ${t.c}^2 - ${t.b}^2` 
                },
                { 
                    text: lang === 'sv' ? `Räkna ut areorna: ${t.c} · ${t.c} blir ${t.c*t.c}, och ${t.b} · ${t.b} blir ${t.b*t.b}.` : `Compute the squared values: ${t.c} · ${t.c} equals ${t.c*t.c}, and ${t.b} · ${t.b} equals ${t.b*t.b}.`, 
                    latex: `x^2 = ${t.c*t.c} - ${t.b*t.b}` 
                },
                { 
                    text: lang === 'sv' ? `Räkna ut skillnaden: ${t.c*t.c} minus ${t.b*t.b} lämnar kvar arean ${t.a*t.a}.` : `Calculate the difference: ${t.c*t.c} minus ${t.b*t.b} leaves the area ${t.a*t.a}.`, 
                    latex: `x^2 = \\mathbf{${t.a*t.a}}` 
                },
                { 
                    text: lang === 'sv' ? `Ta nu kvadratroten ur ${t.a*t.a} för att hitta avståndet x längs marken.` : `Now take the square root of ${t.a*t.a} to find the actual distance x along the ground.`, 
                    latex: `x = \\sqrt{${t.a*t.a}} = \\mathbf{${t.a}}` 
                },
                { text: lang === 'sv' ? `Svar: ${t.a}` : `Answer: ${t.a}`, latex: `${t.a}` }
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
                { 
                    text: lang === 'sv' ? "För att kolla om en triangel är rätvinklig testar vi om kvadraten av de två korta sidorna blir lika med kvadraten av den längsta sidan." : "To check if a triangle is right-angled, we test if the square of the two short sides equals the square of the longest side.", 
                    latex: `? : ${t.a}^2 + ${t.b}^2 = ${c}^2` 
                },
                { 
                    text: lang === 'sv' ? `Räkna ut de korta sidorna: ${t.a*t.a} + ${t.b*t.b} blir ${t.a*t.a + t.b*t.b}.` : `Calculate the short sides: ${t.a*t.a} + ${t.b*t.b} equals ${t.a*t.a + t.b*t.b}.`, 
                    latex: `${t.a*t.a + t.b*t.b} \\quad \\dots` 
                },
                { 
                    text: lang === 'sv' ? `Räkna ut den långa sidan: ${c} gånger ${c} blir ${c*c}.` : `Calculate the long side: ${c} times ${c} equals ${c*c}.`, 
                    latex: `\\dots \\quad ${c*c}` 
                },
                { 
                    text: lang === 'sv' ? (isRight ? "Eftersom båda sidorna blev samma tal, så stämmer det: Triangeln är rätvinklig!" : "Eftersom sidorna inte blev samma tal, stämmer det inte: Triangeln är INTE rätvinklig.") : (isRight ? "Since both sides became the same number, it matches: The triangle is right-angled!" : "Since the sides did not match, it does not match: The triangle is NOT right-angled."), 
                    latex: isRight ? `\\mathbf{${t.a*t.a + t.b*t.b} = ${c*c}}` : `\\mathbf{${t.a*t.a + t.b*t.b} \\neq ${c*c}}` 
                },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, latex: `\\text{${ans}}` }
            ]
        };
    }

    private level6_AdvancedMixed(lang: string, options: any): any {
        const subLevel = MathUtils.randomInt(2, 4);
        return this.generate(subLevel, lang, options);
    }
}