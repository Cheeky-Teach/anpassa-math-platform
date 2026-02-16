import { MathUtils } from '../utils/MathUtils.js';

export class PythagorasGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_SquaresRoots(lang);
            case 2: return this.level2_Hypotenuse(lang);
            case 3: return this.level3_Leg(lang);
            case 4: return this.level4_Applications(lang);
            case 5: return this.level5_Converse(lang);
            case 6: return this.level6_AdvancedMixed(lang);
            default: return this.level1_SquaresRoots(lang);
        }
    }

    /**
     * Phase 2: Targeted Generation
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

    /**
     * Converts standard numbers into Unicode superscript strings for clear button display.
     */
    private toSup(num: number | string): string {
        const map: any = {
            '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
            '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻'
        };
        return num.toString().split('').map(char => map[char] || char).join('');
    }

    private getTriple(): { a: number, b: number, c: number, k: number } {
        const primitives = [
            [3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29],
            [12, 35, 37], [9, 40, 41], [28, 45, 53], [11, 60, 61], [16, 63, 65]
        ];
        const base = MathUtils.randomChoice(primitives);
        const k = MathUtils.randomChoice([1, 1, 2, 2, 3]); 
        return { a: base[0] * k, b: base[1] * k, c: base[2] * k, k: k };
    }

    // --- LEVEL 1: SQUARES & ROOTS ---
    private level1_SquaresRoots(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['sqrt_calc', 'square_calc', 'missing_square', 'sqrt_estimation']);

        if (v === 'sqrt_calc' || v === 'square_calc') {
            const isRoot = v === 'sqrt_calc';
            const base = MathUtils.randomInt(2, 15);
            const square = base * base;
            const desc = lang === 'sv' 
                ? (isRoot ? "Beräkna kvadratroten ur talet nedan." : "Beräkna kvadraten av talet nedan.")
                : (isRoot ? "Calculate the square root of the number below." : "Calculate the square of the number below.");

            const ans = isRoot ? base.toString() : square.toString();

            return {
                renderData: {
                    description: desc,
                    latex: isRoot ? `\\sqrt{${square}}` : `${base}^2`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans),
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? (isRoot ? `Vi söker ett tal som multiplicerat med sig självt blir ${square}.` : `Kvadrering innebär att man multiplicerar talet med sig självt en gång.`) 
                            : (isRoot ? `We are looking for a number that, when multiplied by itself, equals ${square}.` : `Squaring means multiplying the number by itself once.`), 
                        latex: isRoot ? `? \\cdot ? = ${square}` : `${base} \\cdot ${base} = ${square}` 
                    },
                    { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${ans}` }
                ],
                metadata: { variation_key: v, difficulty: 1 }
            };
        }

        if (v === 'missing_square') {
            const base = MathUtils.randomInt(2, 12);
            const square = base * base;
            return {
                renderData: {
                    description: lang === 'sv' ? "Hitta värdet på x i ekvationen." : "Find the value of x in the equation.",
                    latex: `x^2 = ${square}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(base.toString()),
                clues: [
                    { text: lang === 'sv' ? "För att lösa ut x när det är upphöjt till två använder vi kvadratroten." : "To solve for x when it is squared, we use the square root.", latex: `x = \\sqrt{${square}}` },
                    { text: lang === 'sv' ? "Detta ger oss svaret:" : "This gives us the answer:", latex: `${base}` }
                ],
                metadata: { variation_key: 'missing_square', difficulty: 2 }
            };
        }

        const base = MathUtils.randomInt(4, 10);
        const square = base * base; 
        const offset = MathUtils.randomChoice([-5, 5]);
        const testVal = square + offset; 
        const isGreater = offset > 0;
        const ans = isGreater ? (lang === 'sv' ? "Ja" : "Yes") : (lang === 'sv' ? "Nej" : "No");

        return {
            renderData: {
                description: lang === 'sv' ? `Är $\\sqrt{${testVal}}$ större än ${base}?` : `Is $\\sqrt{${testVal}}$ greater than ${base}?`,
                answerType: 'multiple_choice',
                options: lang === 'sv' ? ["Ja", "Nej"] : ["Yes", "No"]
            },
            token: this.toBase64(ans),
            clues: [
                { text: lang === 'sv' ? `Vi vet att kvadraten av ${base} är ${square}.` : `We know the square of ${base} is ${square}.`, latex: `${base}^2 = ${square}` },
                { text: lang === 'sv' ? `Eftersom ${testVal} är ${isGreater ? 'större' : 'mindre'} än ${square}, så är dess kvadratrot ${isGreater ? 'större' : 'mindre'} än ${base}.` : `Since ${testVal} is ${isGreater ? 'greater' : 'less'} than ${square}, its square root is ${isGreater ? 'greater' : 'less'} than ${base}.`, latex: `\\sqrt{${testVal}} \\text{ vs } \\sqrt{${square}}` },
                { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `\\text{${ans}}` }
            ],
            metadata: { variation_key: 'sqrt_estimation', difficulty: 2 }
        };
    }

    // --- LEVEL 2: HYPOTENUSE ---
    private level2_Hypotenuse(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['hyp_visual', 'hyp_equation', 'hyp_error']);
        const t = this.getTriple();

        if (v === 'hyp_equation') {
            const correct = `${t.a}² + ${t.b}² = x²`;
            const wrong1 = `${t.a}² + x² = ${t.c}²`;
            const wrong2 = `x² - ${t.a}² = ${t.b}²`;
            return {
                renderData: {
                    description: lang === 'sv' ? `Vilken ekvation beräknar hypotenusan x i en triangel med kateterna ${t.a} och ${t.b}?` : `Which equation calculates the hypotenuse x in a triangle with legs ${t.a} and ${t.b}?`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([correct, wrong1, wrong2])
                },
                token: this.toBase64(correct),
                clues: [
                    { text: lang === 'sv' ? "Pythagoras sats säger att summan av kateternas kvadrater är lika med hypotenusans kvadrat." : "Pythagoras' theorem states that the sum of the squares of the legs is equal to the square of the hypotenuse.", latex: "a^2 + b^2 = c^2" },
                    { text: lang === 'sv' ? "Rätt uppställning är:" : "The correct setup is:", latex: `\\text{${correct}}` }
                ],
                metadata: { variation_key: 'hyp_equation', difficulty: 2 }
            };
        }

        if (v === 'hyp_error') {
            const ans = lang === 'sv' ? "Man måste kvadrera sidorna först" : "You must square the sides first";
            return {
                renderData: {
                    description: lang === 'sv' ? `Varför kan man inte bara addera sidorna ${t.a} + ${t.b} för att hitta hypotenusan?` : `Why can't you just add the sides ${t.a} + ${t.b} to find the hypotenuse?`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([ans, lang === 'sv' ? "Man ska använda division" : "One should use division", lang === 'sv' ? "Det är faktiskt rätt" : "It is actually correct"])
                },
                token: this.toBase64(ans),
                clues: [
                    { text: lang === 'sv' ? "Satsen gäller arean av de kvadrater man kan rita på sidorna, inte längden på sidorna direkt." : "The theorem applies to the area of the squares that can be drawn on the sides, not the length of the sides directly.", latex: "a^2 + b^2 = c^2" },
                    { text: lang === 'sv' ? "Rätt svar är:" : "The correct answer is:", latex: `\\text{${ans}}` }
                ],
                metadata: { variation_key: 'hyp_error', difficulty: 1 }
            };
        }

        return {
            renderData: {
                description: lang === 'sv' ? "Beräkna längden på hypotenusan x." : "Calculate the length of the hypotenuse x.",
                answerType: 'numeric',
                geometry: { type: 'triangle', subtype: 'right', width: t.a, height: t.b, labels: { b: t.a, h: t.b, hyp: 'x' } }
            },
            token: this.toBase64(t.c.toString()),
            clues: [
                { text: lang === 'sv' ? "Ställ upp satsen och beräkna kvadraterna först." : "Set up the theorem and calculate the squares first.", latex: `${t.a}^2 + ${t.b}^2 = x^2 \\\\ ${t.a*t.a} + ${t.b*t.b} = x^2` },
                { text: lang === 'sv' ? "Addera areorna och dra sedan kvadratroten ur summan för att hitta x." : "Add the areas and then take the square root of the sum to find x.", latex: `${t.a*t.a + t.b*t.b} = x^2 \\\\ x = \\sqrt{${t.c*t.c}}` },
                { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${t.c}` }
            ],
            metadata: { variation_key: 'hyp_visual', difficulty: 2 }
        };
    }

    // --- LEVEL 3: LEG ---
    private level3_Leg(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['leg_visual', 'leg_concept', 'leg_text']);
        const t = this.getTriple();

        if (v === 'leg_concept') {
            const ans = lang === 'sv' ? "Subtrahera" : "Subtract";
            return {
                renderData: {
                    description: lang === 'sv' ? "Ska man addera eller subtrahera om man söker en katet och redan har hypotenusan?" : "Should you add or subtract if you are looking for a leg and already have the hypotenuse?",
                    answerType: 'multiple_choice',
                    options: [ans, lang === 'sv' ? "Addera" : "Add"]
                },
                token: this.toBase64(ans),
                clues: [
                    { text: lang === 'sv' ? "Hypotenusan är den längsta sidan. För att hitta en av de kortare kateterna måste vi dra bort den kända sidans kvadrat." : "The hypotenuse is the longest side. To find one of the shorter legs, we must subtract the square of the known side.", latex: "b^2 = c^2 - a^2" },
                    { text: lang === 'sv' ? "Man ska alltså:" : "So one should:", latex: `\\text{${ans}}` }
                ],
                metadata: { variation_key: 'leg_concept', difficulty: 2 }
            };
        }

        const isText = v === 'leg_text';
        return {
            renderData: {
                description: lang === 'sv' ? `Hypotenusan är ${t.c} och en katet är ${t.a}. Beräkna den andra kateten x.` : `The hypotenuse is ${t.c} and one leg is ${t.a}. Calculate the other leg x.`,
                answerType: 'numeric',
                geometry: isText ? null : { type: 'triangle', subtype: 'right', width: t.b, height: t.a, labels: { b: 'x', h: t.a, hyp: t.c } }
            },
            token: this.toBase64(t.b.toString()),
            clues: [
                { text: lang === 'sv' ? "När vi söker en katet drar vi bort den kända katetens kvadrat från hypotenusans kvadrat." : "When seeking a leg, we subtract the square of the known leg from the square of the hypotenuse.", latex: `x^2 = ${t.c}^2 - ${t.a}^2 \\\\ x^2 = ${t.c*t.c} - ${t.a*t.a}` },
                { text: lang === 'sv' ? "Beräkna skillnaden och dra sedan kvadratroten ur svaret." : "Calculate the difference and then take the square root of the result.", latex: `x^2 = ${t.b*t.b} \\\\ x = \\sqrt{${t.b*t.b}}` },
                { text: lang === 'sv' ? "Längden på kateten är:" : "The length of the leg is:", latex: `${t.b}` }
            ],
            metadata: { variation_key: v, difficulty: 3 }
        };
    }

    // --- LEVEL 4: APPLICATIONS ---
    private level4_Applications(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['app_ladder', 'app_diagonal', 'app_displacement', 'app_guy_wire', 'app_coords']);
        const t = this.getTriple();

        if (v === 'app_diagonal') {
            return {
                renderData: {
                    description: lang === 'sv' ? `En rektangel har sidorna ${t.a} cm och ${t.b} cm. Hur lång är diagonalen?` : `A rectangle has sides of ${t.a} cm and ${t.b} cm. How long is the diagonal?`,
                    answerType: 'numeric',
                    geometry: { type: 'rectangle', width: t.a, height: t.b, labels: { b: t.a, h: t.b } }
                },
                token: this.toBase64(t.c.toString()),
                clues: [
                    { text: lang === 'sv' ? "Diagonalen delar rektangeln i två rätvinkliga trianglar och fungerar som hypotenusa." : "The diagonal divides the rectangle into two right-angled triangles and acts as the hypotenuse.", latex: `d^2 = ${t.a}^2 + ${t.b}^2` },
                    { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${t.c}` }
                ],
                metadata: { variation_key: 'app_diagonal', difficulty: 3 }
            };
        }

        if (v === 'app_coords') {
            const x1 = MathUtils.randomInt(1, 5), y1 = MathUtils.randomInt(1, 5);
            const x2 = x1 + t.a, y2 = y1 + t.b;
            return {
                renderData: {
                    description: lang === 'sv' ? `Beräkna avståndet mellan punkterna (${x1}, ${y1}) och (${x2}, ${y2}).` : `Calculate the distance between points (${x1}, ${y1}) and (${x2}, ${y2}).`,
                    answerType: 'numeric'
                },
                token: this.toBase64(t.c.toString()),
                clues: [
                    { text: lang === 'sv' ? "Skillnaden i x- och y-led mellan punkterna bildar kateterna i en rätvinklig triangel." : "The difference in x and y between the points forms the legs of a right-angled triangle.", latex: `\\Delta x = ${t.a}, \\Delta y = ${t.b}` },
                    { text: lang === 'sv' ? "Avståndet d är då hypotenusan i triangeln." : "The distance d is then the hypotenuse of the triangle.", latex: `d = \\sqrt{${t.a}^2 + ${t.b}^2} = ${t.c}` },
                    { text: lang === 'sv' ? "Avståndet är:" : "The distance is:", latex: `${t.c}` }
                ],
                metadata: { variation_key: 'app_coords', difficulty: 4 }
            };
        }

        const app_ladder = lang === 'sv' ? `En stege som är ${t.c} m lång lutar mot en vägg och når ${t.b} m upp. Hur långt från väggen står stegen?` : `A ladder ${t.c} m long leans against a wall and reaches ${t.b} m up. How far from the wall is the base?`;
        const ansVal = v === 'app_ladder' ? t.a : t.c;

        return {
            renderData: {
                description: lang === 'sv' ? app_ladder : `A wire is attached to the top of a ${t.b} m pole and anchored ${t.a} m away. How long is the wire?`,
                answerType: 'numeric'
            },
            token: this.toBase64(ansVal.toString()),
            clues: [
                { text: lang === 'sv' ? "Använd Pythagoras sats för att hitta den saknade sidan." : "Use Pythagoras' theorem to find the missing side.", latex: v === 'app_ladder' ? `x = \\sqrt{${t.c}^2 - ${t.b}^2}` : `x = \\sqrt{${t.a}^2 + ${t.b}^2}` },
                { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${ansVal}` }
            ],
            metadata: { variation_key: v, difficulty: 3 }
        };
    }

    // --- LEVEL 5: CONVERSE ---
    private level5_Converse(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['conv_check', 'conv_missing', 'conv_trap']);
        
        if (v === 'conv_trap') {
            return {
                renderData: {
                    description: lang === 'sv' ? "Kan sidorna 2, 2 och 5 bilda en rätvinklig triangel?" : "Can the sides 2, 2 and 5 form a right-angled triangle?",
                    answerType: 'multiple_choice',
                    options: lang === 'sv' ? ["Ja", "Nej"] : ["Yes", "No"]
                },
                token: this.toBase64(lang === 'sv' ? "Nej" : "No"),
                clues: [
                    { text: lang === 'sv' ? "För att bilda en triangel måste summan av de kortare sidorna vara större än den längsta sidan. $2 + 2 < 5$, så detta är inte ens en triangel." : "To form a triangle, the sum of the shorter sides must be greater than the longest side. $2 + 2 < 5$, so this isn't even a triangle." },
                    { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `\\text{${lang === 'sv' ? 'Nej' : 'No'}}` }
                ],
                metadata: { variation_key: 'conv_trap', difficulty: 2 }
            };
        }

        const t = this.getTriple();
        const isRight = Math.random() > 0.5 || v === 'conv_missing';
        const c = isRight ? t.c : t.c + 1;
        const ans = v === 'conv_missing' ? t.c.toString() : (isRight ? (lang === 'sv' ? "Ja" : "Yes") : (lang === 'sv' ? "Nej" : "No"));

        return {
            renderData: {
                description: lang === 'sv' 
                    ? (v === 'conv_missing' ? `Sidorna är ${t.a} och ${t.b}. Vad måste den tredje sidan vara för rät vinkel?` : `Är en triangel med sidorna ${t.a}, ${t.b} och ${c} rätvinklig?`)
                    : (v === 'conv_missing' ? `The sides are ${t.a} and ${t.b}. What must the third side be for a right angle?` : `Is a triangle with sides ${t.a}, ${t.b} and ${c} right-angled?`),
                answerType: v === 'conv_missing' ? 'numeric' : 'multiple_choice',
                options: v === 'conv_missing' ? undefined : (lang === 'sv' ? ["Ja", "Nej"] : ["Yes", "No"])
            },
            token: this.toBase64(ans),
            clues: [
                { text: lang === 'sv' ? "Kontrollera Pythagoras sats: stämmer $a^2 + b^2 = c^2$?" : "Check Pythagoras' theorem: does $a^2 + b^2 = c^2$ hold?", latex: `${t.a}^2 + ${t.b}^2 = ${t.a*t.a + t.b*t.b} \\text{ vs } ${c}^2 = ${c*c}` },
                { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: v === 'conv_missing' ? `${t.c}` : `\\text{${ans}}` }
            ],
            metadata: { variation_key: v, difficulty: 3 }
        };
    }

    // --- LEVEL 6: ADVANCED MIXED ---
    private level6_AdvancedMixed(lang: string): any {
        const t = this.getTriple();
        const x1 = MathUtils.randomInt(-5, 0), y1 = MathUtils.randomInt(-5, 0);
        const x2 = x1 + t.a, y2 = y1 + t.b;

        return {
            renderData: {
                description: lang === 'sv' ? `Beräkna avståndet mellan punkterna (${x1}, ${y1}) och (${x2}, ${y2}).` : `Calculate the distance between points (${x1}, ${y1}) and (${x2}, ${y2}).`,
                answerType: 'numeric'
            },
            token: this.toBase64(t.c.toString()),
            clues: [
                { text: lang === 'sv' ? "Skillnaden i x- och y-led ger oss de två kateterna." : "The difference in x and y gives us the two legs.", latex: `\\Delta x = ${t.a}, \\Delta y = ${t.b}` },
                { text: lang === 'sv' ? "Svaret är hypotenusan:" : "The answer is the hypotenuse:", latex: `\\sqrt{${t.a}^2 + ${t.b}^2} = ${t.c}` },
                { text: lang === 'sv' ? "Avståndet är:" : "The distance is:", latex: `${t.c}` }
            ],
            metadata: { variation_key: 'advanced_mixed', difficulty: 5 }
        };
    }
}