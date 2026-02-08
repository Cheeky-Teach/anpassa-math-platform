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
     * Allows the Question Studio to request a specific skill bucket.
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

    // Helper: Get a scaled triple to ensure integer solutions
    private getTriple(): { a: number, b: number, c: number, k: number } {
        const primitives = [
            [3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29],
            [12, 35, 37], [9, 40, 41], [28, 45, 53], [11, 60, 61], [16, 63, 65]
        ];
        const base = MathUtils.randomChoice(primitives);
        const k = MathUtils.randomChoice([1, 1, 2, 2, 3, 5]); 
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

            return {
                renderData: {
                    description: desc,
                    latex: isRoot ? `\\sqrt{${square}}` : `${base}^2`,
                    answerType: 'numeric'
                },
                token: this.toBase64(isRoot ? base.toString() : square.toString()),
                clues: [{ 
                    text: lang === 'sv' 
                        ? (isRoot ? `Vilket tal multiplicerat med sig självt blir ${square}?` : `Att kvadrera ett tal innebär att man multiplicerar det med sig självt en gång.`) 
                        : (isRoot ? `Which number multiplied by itself results in ${square}?` : `Squaring a number means multiplying it by itself once.`), 
                    latex: isRoot ? `? \\cdot ? = ${square}` : `${base} \\cdot ${base} = ${square}` 
                }],
                metadata: { variation_key: v, difficulty: 1 }
            };
        }

        if (v === 'missing_square') {
            const base = MathUtils.randomInt(2, 12);
            const square = base * base;
            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket värde på x gör att ekvationen stämmer?" : "What value of x makes the equation true?",
                    latex: `x^2 = ${square}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(base.toString()),
                clues: [{ text: lang === 'sv' ? "För att få x ensamt när det är upphöjt till två använder vi den motsatta räkneoperationen: kvadratroten." : "To get x alone when it is raised to the power of two, we use the opposite operation: the square root.", latex: `x = \\sqrt{${square}}` }],
                metadata: { variation_key: 'missing_square', difficulty: 2 }
            };
        }

        const base = MathUtils.randomInt(4, 10);
        const square = base * base; 
        const offset = MathUtils.randomChoice([-5, -3, 3, 5]);
        const testVal = square + offset; 
        const isGreater = offset > 0;
        const q = lang === 'sv' 
            ? `Är värdet av $\\sqrt{${testVal}}$ större än ${base}?` 
            : `Is the value of $\\sqrt{${testVal}}$ greater than ${base}?`;
        const ans = isGreater ? (lang === 'sv' ? "Ja" : "Yes") : (lang === 'sv' ? "Nej" : "No");

        return {
            renderData: {
                description: q,
                answerType: 'multiple_choice',
                options: lang === 'sv' ? ["Ja", "Nej"] : ["Yes", "No"]
            },
            token: this.toBase64(ans),
            clues: [
                { text: lang === 'sv' ? `Vi vet att $${base}^2$ är ${square}.` : `We know that $${base}^2$ is ${square}.`, latex: `${base}^2 = ${square}` },
                { text: lang === 'sv' ? `Eftersom ${testVal} är ${isGreater ? 'större' : 'mindre'} än ${square}, så måste dess kvadratrot vara ${isGreater ? 'större' : 'mindre'} än ${base}.` : `Since ${testVal} is ${isGreater ? 'greater' : 'less'} than ${square}, its square root must be ${isGreater ? 'greater' : 'less'} than ${base}.` }
            ],
            metadata: { variation_key: 'sqrt_estimation', difficulty: 2 }
        };
    }

    // --- LEVEL 2: HYPOTENUSE ---
    private level2_Hypotenuse(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['hyp_visual', 'hyp_equation', 'hyp_error']);
        const t = this.getTriple();

        if (v === 'hyp_equation') {
            const options = MathUtils.shuffle([`${t.a}^2 + ${t.b}^2 = x^2`, `${t.a}^2 + x^2 = ${t.c}^2`, `x^2 - ${t.a}^2 = ${t.b}^2`]);
            return {
                renderData: {
                    description: lang === 'sv' ? `En rätvinklig triangel har kateterna ${t.a} och ${t.b}. Vilken ekvation ska man använda för att beräkna hypotenusan x?` : `A right-angled triangle has legs ${t.a} and ${t.b}. Which equation should be used to calculate the hypotenuse x?`,
                    answerType: 'multiple_choice',
                    options
                },
                token: this.toBase64(`${t.a}^2 + ${t.b}^2 = x^2`),
                clues: [{ text: lang === 'sv' ? "Pythagoras sats säger att summan av kvadraterna på kateterna är lika med kvadraten på hypotenusan." : "Pythagoras' theorem states that the sum of the squares of the legs is equal to the square of the hypotenuse.", latex: "a^2 + b^2 = c^2" }],
                metadata: { variation_key: 'hyp_equation', difficulty: 2 }
            };
        }

        if (v === 'hyp_error') {
            const wrongSum = t.a + t.b;
            const ans = lang === 'sv' ? "Man måste kvadrera sidorna först" : "One must square the sides first";
            return {
                renderData: {
                    description: lang === 'sv' ? `En person räknade ut hypotenusan som ${t.a} + ${t.b} = ${wrongSum}. Varför är detta uträkningssätt FEL?` : `A person calculated the hypotenuse as ${t.a} + ${t.b} = ${wrongSum}. Why is this method INCORRECT?`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([ans, lang === 'sv' ? "Man ska använda subtraktion" : "One should use subtraction", lang === 'sv' ? "Det är faktiskt rätt" : "It is actually correct"])
                },
                token: this.toBase64(ans),
                clues: [{ text: lang === 'sv' ? "Man kan aldrig addera längderna direkt. Man måste först räkna ut arean av kvadraterna på sidorna." : "You can never add the lengths directly. You must first calculate the area of the squares on the sides." }],
                metadata: { variation_key: 'hyp_error', difficulty: 1 }
            };
        }

        return {
            renderData: {
                description: lang === 'sv' ? "Beräkna hypotenusans längd (x) i triangeln nedan." : "Calculate the length of the hypotenuse (x) in the triangle below.",
                answerType: 'numeric',
                geometry: { type: 'triangle', subtype: 'right', width: t.a, height: t.b, labels: { b: t.a, h: t.b, hyp: 'x' } }
            },
            token: this.toBase64(t.c.toString()),
            clues: [
                { text: lang === 'sv' ? "Steg 1: Ställ upp Pythagoras sats med de kända värdena." : "Step 1: Set up Pythagoras' theorem with the known values.", latex: `${t.a}^2 + ${t.b}^2 = x^2` },
                { text: lang === 'sv' ? "Steg 2: Räkna ut summan av kvadraterna och dra sedan kvadratroten ur resultatet." : "Step 2: Calculate the sum of the squares and then take the square root of the result.", latex: `x = \\sqrt{${t.a*t.a} + ${t.b*t.b}}` }
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
                    description: lang === 'sv' ? "Om du redan vet längden på hypotenusan och en katet, ska du då addera eller subtrahera kvadraterna för att hitta den saknade sidan?" : "If you already know the length of the hypotenuse and one leg, should you add or subtract the squares to find the missing side?",
                    answerType: 'multiple_choice',
                    options: [ans, lang === 'sv' ? "Addera" : "Add"]
                },
                token: this.toBase64(ans),
                clues: [{ text: lang === 'sv' ? "Eftersom hypotenusan är den längsta sidan ($c^2$), måste den andra kateten ($a^2$) vara skillnaden mellan hypotenusans kvadrat och den kända katetens kvadrat." : "Since the hypotenuse is the longest side ($c^2$), the other leg ($a^2$) must be the difference between the square of the hypotenuse and the square of the known leg.", latex: "b^2 = c^2 - a^2" }],
                metadata: { variation_key: 'leg_concept', difficulty: 2 }
            };
        }

        const isText = v === 'leg_text';
        return {
            renderData: {
                description: lang === 'sv' ? `I en rätvinklig triangel är hypotenusan ${t.c} cm och en av kateterna är ${t.a} cm. Beräkna längden på den okända kateten x.` : `In a right-angled triangle, the hypotenuse is ${t.c} cm and one of the legs is ${t.a} cm. Calculate the length of the unknown leg x.`,
                answerType: 'numeric',
                geometry: isText ? null : { type: 'triangle', subtype: 'right', width: t.b, height: t.a, labels: { b: 'x', h: t.a, hyp: t.c } }
            },
            token: this.toBase64(t.b.toString()),
            clues: [
                { text: lang === 'sv' ? "När man söker en katet ställer man upp sambandet som en subtraktion." : "When seeking a leg, the relationship is set up as a subtraction.", latex: `x^2 = ${t.c}^2 - ${t.a}^2` },
                { text: lang === 'sv' ? `Beräkna skillnaden: $${t.c*t.c} - ${t.a*t.a} = ${t.b*t.b}$, och dra sedan roten ur svaret.` : `Calculate the difference: $${t.c*t.c} - ${t.a*t.a} = ${t.b*t.b}$, and then take the square root of the answer.` }
            ],
            metadata: { variation_key: v, difficulty: 3 }
        };
    }

    // --- LEVEL 4: APPLICATIONS ---
    private level4_Applications(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['app_ladder', 'app_diagonal', 'app_coords', 'app_displacement', 'app_guy_wire']);
        const t = this.getTriple();

        if (v === 'app_diagonal') {
            const scenario = MathUtils.randomChoice([
                { sv: `En rektangulär park är ${t.a} m lång och ${t.b} m bred. Om du går diagonalt från ett hörn till det motsatta, hur långt går du då?`, en: `A rectangular park is ${t.a} m long and ${t.b} m wide. If you walk diagonally from one corner to the opposite, how far do you walk?` },
                { sv: `En TV-skärm har bredden ${t.a} cm och höjden ${t.b} cm. Hur lång är skärmens diagonal?`, en: `A TV screen has a width of ${t.a} cm and a height of ${t.b} cm. How long is the screen's diagonal?` }
            ]);
            return {
                renderData: {
                    description: lang === 'sv' ? scenario.sv : scenario.en,
                    answerType: 'numeric',
                    geometry: { type: 'rectangle', width: t.a, height: t.b, labels: { b: t.a, h: t.b } }
                },
                token: this.toBase64(t.c.toString()),
                clues: [{ text: lang === 'sv' ? "Diagonalen i en rektangel fungerar som hypotenusa i en rätvinklig triangel." : "The diagonal of a rectangle acts as the hypotenuse in a right-angled triangle.", latex: `d = \\sqrt{${t.a}^2 + ${t.b}^2}` }],
                metadata: { variation_key: 'app_diagonal', difficulty: 3 }
            };
        }

        if (v === 'app_displacement') {
            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `En cyklist cyklar ${t.a} km rakt norrut och sedan ${t.b} km rakt österut. Hur fågelvägen (närmaste avstånd) är cyklisten från startpunkten?` 
                        : `A cyclist rides ${t.a} km straight north and then ${t.b} km straight east. What is the displacement (shortest distance) from the starting point?`,
                    answerType: 'numeric', suffix: 'km'
                },
                token: this.toBase64(t.c.toString()),
                clues: [
                    { text: lang === 'sv' ? "Vägen norrut och vägen österut bildar en rät vinkel. Avståndet från startpunkten är hypotenusan." : "The path north and the path east form a right angle. The distance from the start is the hypotenuse.", latex: `d = \\sqrt{${t.a}^2 + ${t.b}^2}` }
                ],
                metadata: { variation_key: 'app_displacement', difficulty: 3 }
            };
        }

        if (v === 'app_guy_wire') {
            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Ett tält hålls uppe av en lina fäst i marken ${t.a} m från tältstången. Tältstången är ${t.b} m hög. Hur lång är linan från markfästet till toppen?` 
                        : `A tent is held up by a guy wire attached to the ground ${t.a} m from the pole. The pole is ${t.b} m high. How long is the wire from the ground to the top?`,
                    answerType: 'numeric', suffix: 'm'
                },
                token: this.toBase64(t.c.toString()),
                clues: [
                    { text: lang === 'sv' ? "Marken och stången är kateter, och linan är hypotenusan." : "The ground and the pole are legs, and the wire is the hypotenuse.", latex: `l = \\sqrt{${t.a}^2 + ${t.b}^2}` }
                ],
                metadata: { variation_key: 'app_guy_wire', difficulty: 3 }
            };
        }

        if (v === 'app_coords') {
            const x1 = MathUtils.randomInt(1, 5), y1 = MathUtils.randomInt(1, 5);
            const x2 = x1 + t.a, y2 = y1 + t.b;
            return {
                renderData: {
                    description: lang === 'sv' ? `Beräkna det kortaste avståndet mellan punkterna (${x1}, ${y1}) och (${x2}, ${y2}) i ett koordinatsystem.` : `Calculate the shortest distance between the points (${x1}, ${y1}) and (${x2}, ${y2}) in a coordinate system.`,
                    answerType: 'numeric'
                },
                token: this.toBase64(t.c.toString()),
                clues: [
                    { text: lang === 'sv' ? "Skillnaden i x-led och y-led mellan punkterna bildar de två kateterna i en rätvinklig triangel." : "The difference in x and y between the points forms the two legs of a right-angled triangle.", latex: `\\Delta x = ${t.a}, \\Delta y = ${t.b}` },
                    { text: lang === 'sv' ? "Använd Pythagoras sats för att hitta avståndet (hypotenusan)." : "Use Pythagoras' theorem to find the distance (the hypotenuse).", latex: `d = \\sqrt{${t.a}^2 + ${t.b}^2}` }
                ],
                metadata: { variation_key: 'app_coords', difficulty: 4 }
            };
        }

        return {
            renderData: {
                description: lang === 'sv' ? `En stege som är ${t.c} meter lång lutar mot en husvägg. Stegen når ${t.b} meter upp på väggen. Hur långt från väggen står stegens fot?` : `A ladder that is ${t.c} meters long leans against a house wall. The ladder reaches ${t.b} meters up the wall. How far from the wall is the base of the ladder?`,
                answerType: 'numeric', suffix: 'm'
            },
            token: this.toBase64(t.a.toString()),
            clues: [{ text: lang === 'sv' ? "Stegen fungerar som hypotenusan i en triangel. Husväggen och marken är de två kateterna." : "The ladder acts as the hypotenuse in a triangle. The wall and the ground are the two legs.", latex: `x = \\sqrt{${t.c}^2 - ${t.b}^2}` }],
            metadata: { variation_key: 'app_ladder', difficulty: 3 }
        };
    }

    // --- LEVEL 5: CONVERSE ---
    private level5_Converse(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['conv_check', 'conv_missing', 'conv_trap']);
        
        if (v === 'conv_trap') {
            const s1 = 2, s2 = 2, s3 = 5;
            const ans = lang === 'sv' ? "Nej" : "No";
            return {
                renderData: {
                    description: lang === 'sv' ? `Kan en triangel med sidorna ${s1}, ${s2} och ${s3} vara rätvinklig?` : `Can a triangle with sides ${s1}, ${s2} and ${s3} be right-angled?`,
                    answerType: 'multiple_choice',
                    options: lang === 'sv' ? ["Ja", "Nej"] : ["Yes", "No"]
                },
                token: this.toBase64(ans),
                clues: [{ text: lang === 'sv' ? "Det här är en kuggfråga! Dessa sidlängder kan inte ens bilda en triangel, eftersom summan av de två kortaste sidorna ($2+2=4$) är mindre än den längsta sidan (5)." : "This is a trick question! These side lengths cannot even form a triangle, as the sum of the two shortest sides ($2+2=4$) is less than the longest side (5)." }],
                metadata: { variation_key: 'conv_trap', difficulty: 2 }
            };
        }

        const t = this.getTriple();
        if (v === 'conv_missing') {
            return {
                renderData: {
                    description: lang === 'sv' ? `Sidorna i en triangel är ${t.a} cm och ${t.b} cm. Hur lång måste den tredje sidan vara för att triangeln ska bli rätvinklig?` : `The sides of a triangle are ${t.a} cm and ${t.b} cm. How long must the third side be for the triangle to be right-angled?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(t.c.toString()),
                clues: [{ text: lang === 'sv' ? "Använd Pythagoras sats för att beräkna vad den hypotenusa som krävs är." : "Use Pythagoras' theorem to calculate what the required hypotenuse is.", latex: `\\sqrt{${t.a}^2 + ${t.b}^2}` }],
                metadata: { variation_key: 'conv_missing', difficulty: 3 }
            };
        }

        const isRight = Math.random() > 0.5;
        const c = isRight ? t.c : t.c + 1;
        const ans = isRight ? (lang === 'sv' ? "Ja" : "Yes") : (lang === 'sv' ? "Nej" : "No");

        return {
            renderData: {
                description: lang === 'sv' ? `Är en triangel med sidorna ${t.a}, ${t.b} och ${c} rätvinklig?` : `Is a triangle with sides ${t.a}, ${t.b} and ${c} right-angled?`,
                answerType: 'multiple_choice',
                options: lang === 'sv' ? ["Ja", "Nej"] : ["Yes", "No"]
            },
            token: this.toBase64(ans),
            clues: [{ text: lang === 'sv' ? "Kontrollera om likheten $a^2 + b^2 = c^2$ stämmer för sidorna." : "Check if the equality $a^2 + b^2 = c^2$ holds for the sides.", latex: `${t.a}^2 + ${t.b}^2 = ${t.a*t.a + t.b*t.b} \\text{ vs } ${c}^2 = ${c*c}` }],
            metadata: { variation_key: 'conv_check', difficulty: 3 }
        };
    }

    // --- LEVEL 6: ADVANCED MIXED ---
    private level6_AdvancedMixed(lang: string): any {
        const t = this.getTriple();
        const x1 = MathUtils.randomInt(-5, 0), y1 = MathUtils.randomInt(-5, 0);
        const x2 = x1 + t.a, y2 = y1 + t.b;

        return {
            renderData: {
                description: lang === 'sv' 
                    ? `Beräkna avståndet mellan punkterna (${x1}, ${y1}) och (${x2}, ${y2}) i ett koordinatsystem.`
                    : `Calculate the distance between points (${x1}, ${y1}) and (${x2}, ${y2}) in a coordinate system.`,
                answerType: 'numeric'
            },
            token: this.toBase64(t.c.toString()),
            clues: [
                { text: lang === 'sv' ? "Skillnaden i x-koordinater och y-koordinater mellan punkterna bildar kateterna i en tänkt rätvinklig triangel." : "The difference in x-coordinates and y-coordinates between the points forms the legs of an imaginary right-angled triangle.", latex: `\\Delta x = ${t.a}, \\Delta y = ${t.b}` },
                { text: lang === 'sv' ? "Avståndet mellan punkterna är då hypotenusan i denna triangel." : "The distance between the points is then the hypotenuse of this triangle.", latex: `d = \\sqrt{${t.a}^2 + ${t.b}^2}` }
            ],
            metadata: { variation_key: 'advanced_mixed', difficulty: 5 }
        };
    }
}