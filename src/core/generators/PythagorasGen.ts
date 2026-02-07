import { MathUtils } from '../utils/MathUtils.js';

export class PythagorasGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_SquaresRoots(lang);
            case 2: return this.level2_Hypotenuse(lang);
            case 3: return this.level3_Leg(lang);
            case 4: return this.level4_Applications(lang);
            case 5: return this.level5_Converse(lang); // Renamed/Moved to match plan
            case 6: return this.level6_AdvancedMixed(lang); // Updated to match plan
            default: return this.level1_SquaresRoots(lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    // Helper: Get a scaled triple
    private getTriple(): { a: number, b: number, c: number, k: number } {
        const primitives = [
            // Classics
            [3, 4, 5], 
            [5, 12, 13], 
            [8, 15, 17], 
            [7, 24, 25], 
            [20, 21, 29],
            [12, 35, 37],
            [9, 40, 41],
            [28, 45, 53],
            [11, 60, 61],
            [16, 63, 65],
            [33, 56, 65],
            [48, 55, 73],
            [13, 84, 85],
            [36, 77, 85],
            [39, 80, 89]
        ];
        const base = MathUtils.randomChoice(primitives);
        const k = MathUtils.randomChoice([1, 1, 1, 2, 2, 3, 4, 5, 10]); 
        return { a: base[0]*k, b: base[1]*k, c: base[2]*k, k: k };
    }

    // --- LEVEL 1: Squares & Roots (Mental Math) ---
    private level1_SquaresRoots(lang: string): any {
        const variation = Math.random();

        // VARIATION A: Standard Calculation
        if (variation < 0.3) {
            const isRoot = MathUtils.randomInt(0, 1) === 1;
            const base = MathUtils.randomInt(2, 15);
            const square = base * base;

            if (isRoot) {
                return {
                    renderData: {
                        description: lang === 'sv' ? "Beräkna roten ur:" : "Calculate the square root:",
                        latex: `\\sqrt{${square}}`,
                        answerType: 'numeric',
                        geometry: null
                    },
                    token: this.toBase64(base.toString()),
                    clues: [
                        { text: lang === 'sv' ? "Vilket tal gånger sig självt blir det här?" : "Which number times itself equals this?", latex: `? \\cdot ? = ${square}` }
                    ],
                    metadata: { variation: 'sqrt_calc', difficulty: 1 }
                };
            } else {
                return {
                    renderData: {
                        description: lang === 'sv' ? "Beräkna kvadraten:" : "Calculate the square:",
                        latex: `${base}^2`,
                        answerType: 'numeric',
                        geometry: null
                    },
                    token: this.toBase64(square.toString()),
                    clues: [
                        { text: lang === 'sv' ? "Multiplicera talet med sig självt." : "Multiply the number by itself.", latex: `${base} \\cdot ${base}` }
                    ],
                    metadata: { variation: 'square_calc', difficulty: 1 }
                };
            }
        }

        // VARIATION B: Inverse / Missing Variable
        if (variation < 0.6) {
            const base = MathUtils.randomInt(2, 12);
            const square = base * base;
            return {
                renderData: {
                    description: lang === 'sv' ? "Lös ekvationen:" : "Solve the equation:",
                    latex: `x \\cdot x = ${square}`,
                    answerType: 'numeric',
                    geometry: null
                },
                token: this.toBase64(base.toString()),
                clues: [
                    { text: lang === 'sv' ? "Hitta ett tal som multiplicerat med sig självt blir produkten." : "Find a number that multiplied by itself equals the product.", latex: `\\sqrt{${square}}` }
                ],
                metadata: { variation: 'missing_square', difficulty: 2 }
            };
        }

        // VARIATION C: Estimation / Bounds (True/False)
        const base = MathUtils.randomInt(3, 10);
        const square = base * base; 
        const offset = MathUtils.randomInt(1, 5) * (MathUtils.randomInt(0, 1) === 0 ? 1 : -1);
        const testVal = square + offset; 
        
        // Question: Is sqrt(testVal) > base?
        // If offset > 0, testVal > square, so sqrt(testVal) > base. TRUE.
        // If offset < 0, testVal < square, so sqrt(testVal) < base. FALSE.
        const isGreater = offset > 0;
        const q = lang === 'sv' 
            ? `Är \\sqrt{${testVal}} \\ större \\ än \\ ${base}?` 
            : `Is \\sqrt{${testVal}} \\ greater \\ than \\ ${base}?`;
        
        const ans = isGreater ? (lang==='sv'?"Ja":"Yes") : (lang==='sv'?"Nej":"No");
        const wrong = isGreater ? (lang==='sv'?"Nej":"No") : (lang==='sv'?"Ja":"Yes");

        return {
            renderData: {
                description: q,
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([ans, wrong]),
                geometry: null
            },
            token: this.toBase64(ans),
            clues: [
                { text: lang==='sv' ? `Vad är ${base} i kvadrat?` : `What is ${base} squared?`, latex: `${base}^2 = ${square}` },
                { text: lang==='sv' ? "Jämför talen under rottecknet." : "Compare the numbers under the root.", latex: `${testVal} \\text{ vs } ${square}` }
            ],
            metadata: { variation: 'sqrt_estimation', difficulty: 2 }
        };
    }

    // --- LEVEL 2: Finding Hypotenuse ---
    private level2_Hypotenuse(lang: string): any {
        const t = this.getTriple();
        const variation = Math.random();

        // VARIATION A: Standard Visual
        if (variation < 0.4) {
            const swap = MathUtils.randomInt(0, 1) === 1;
            const width = swap ? t.b : t.a;
            const height = swap ? t.a : t.b;

            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna hypotenusan (x)." : "Calculate hypotenuse (x).",
                    answerType: 'numeric',
                    geometry: { type: 'triangle', subtype: 'right', width, height, labels: { b: width, h: height, hyp: 'x', c: 'x' } }
                },
                token: this.toBase64(t.c.toString()),
                clues: [
                    { text: lang === 'sv' ? "Använd Pythagoras sats: a² + b² = c²." : "Use Pythagoras theorem: a² + b² = c².", latex: `${width}^2 + ${height}^2 = x^2` },
                    { latex: `x = \\sqrt{${t.c*t.c}}` }
                ],
                metadata: { variation: 'hyp_visual', difficulty: 2 }
            };
        }

        // VARIATION B: Equation Match
        if (variation < 0.7) {
            const a = t.a; 
            const b = t.b;
            const c = t.c;
            
            const correctEq = `${a}^2 + ${b}^2 = x^2`;
            const wrongEq1 = `${a}^2 + x^2 = ${b}^2`;
            const wrongEq2 = `x^2 - ${a}^2 = ${b}^2`; // Algebraically equiv to wrong1
            
            return {
                renderData: {
                    description: lang==='sv' 
                        ? `Triangeln har kateterna ${a} och ${b}. Vilken ekvation ger hypotenusan x?`
                        : `Triangle has legs ${a} and ${b}. Which equation finds hypotenuse x?`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([correctEq, wrongEq1, wrongEq2]),
                    geometry: null
                },
                token: this.toBase64(correctEq),
                clues: [
                    { text: lang==='sv' ? "Hypotenusan är alltid ensam på ena sidan likhetstecknet (eller summan av kvadraterna)." : "The hypotenuse is always alone on one side (or the sum of squares).", latex: "a^2 + b^2 = c^2" }
                ],
                metadata: { variation: 'hyp_equation', difficulty: 2 }
            };
        }

        // VARIATION C: Error Analysis
        const wrongSum = t.a + t.b; // Common error: adding lengths directly
        const q = lang==='sv'
            ? `Eleven räknade ut hypotenusan som ${t.a} + ${t.b} = ${wrongSum}. Varför är det fel?`
            : `Student calculated hypotenuse as ${t.a} + ${t.b} = ${wrongSum}. Why is this wrong?`;
        
        const ans = lang==='sv' ? "Man måste kvadrera först" : "Must square first";
        const w1 = lang==='sv' ? "Det är rätt" : "It is correct";
        const w2 = lang==='sv' ? "Man ska subtrahera" : "Should subtract";

        return {
            renderData: {
                description: q,
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([ans, w1, w2]),
                geometry: { type: 'triangle', subtype: 'right', width: t.a, height: t.b, labels: { b: t.a, h: t.b, hyp: '?' } }
            },
            token: this.toBase64(ans),
            clues: [{ text: "a + b != sqrt(a^2 + b^2)", latex: "" }],
            metadata: { variation: 'hyp_error', difficulty: 1 }
        };
    }

    // --- LEVEL 3: Finding Leg ---
    private level3_Leg(lang: string): any {
        const t = this.getTriple();
        const variation = Math.random();
        
        const solveForBase = MathUtils.randomInt(0, 1) === 1;
        const knownLeg = solveForBase ? t.a : t.b;
        const missingLeg = solveForBase ? t.b : t.a;
        const hyp = t.c;

        // VARIATION A: Standard Visual
        if (variation < 0.4) {
            let labels = solveForBase ? { h: t.a, b: 'x', hyp: t.c } : { b: t.b, h: 'x', hyp: t.c };
            
            return {
                renderData: {
                    description: lang==='sv' ? "Beräkna den okända kateten (x)." : "Calculate the unknown leg (x).",
                    answerType: 'numeric',
                    geometry: { 
                        type: 'triangle', subtype: 'right', 
                        width: t.b, height: t.a, labels 
                    }
                },
                token: this.toBase64(missingLeg.toString()),
                clues: [
                    { text: lang==='sv' ? "När du söker en katet, ska du subtrahera." : "When finding a leg, you subtract.", latex: `c^2 - a^2 = b^2` },
                    { latex: `${hyp}^2 - ${knownLeg}^2 = x^2` }
                ],
                metadata: { variation: 'leg_visual', difficulty: 3 }
            };
        }

        // VARIATION B: Concept Check
        if (variation < 0.7) {
            const q = lang==='sv' 
                ? "Om du vet hypotenusan och en katet, ska du addera eller subtrahera kvadraterna?" 
                : "If you know the hypotenuse and one leg, do you add or subtract the squares?";
            
            const ans = lang==='sv' ? "Subtrahera" : "Subtract";
            const wrong = lang==='sv' ? "Addera" : "Add";
            
            return {
                renderData: {
                    description: q,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([ans, wrong]),
                    geometry: null
                },
                token: this.toBase64(ans),
                clues: [{ text: "c^2 - a^2 = b^2", latex: "" }],
                metadata: { variation: 'leg_concept', difficulty: 2 }
            };
        }

        // VARIATION C: Missing Variable Text
        return {
            renderData: {
                description: lang==='sv'
                    ? `Hypotenusan är ${hyp}. En katet är ${knownLeg}. Vad är den andra kateten?`
                    : `The hypotenuse is ${hyp}. One leg is ${knownLeg}. What is the other leg?`,
                answerType: 'numeric',
                geometry: null
            },
            token: this.toBase64(missingLeg.toString()),
            clues: [
                { latex: `x = \\sqrt{${hyp}^2 - ${knownLeg}^2}` }
            ],
            metadata: { variation: 'leg_text', difficulty: 3 }
        };
    }

    // --- LEVEL 4: Applications ---
    private level4_Applications(lang: string): any {
        const variation = Math.random();
        
        // VARIATION A: Standard Word Problem (Ladder/Ramp)
        if (variation < 0.4) {
            const s = MathUtils.randomChoice([
                { id: 'ladder', type: 'find_c', txtSv: "En stege når {a} m upp och står {b} m ut. Längd?", txtEn: "Ladder reaches {a} m up, stands {b} m out. Length?" },
                { id: 'mast', type: 'find_c', txtSv: "Mast är {a} m hög. Vajer fästs {b} m bort. Vajerns längd?", txtEn: "Mast {a} m tall. Wire attached {b} m away. Wire length?" }
            ]);
            
            const t = this.getTriple();
            const a = t.a; const b = t.b; const c = t.c;
            
            return {
                renderData: {
                    description: lang==='sv' ? s.txtSv.replace('{a}', a.toString()).replace('{b}', b.toString()) : s.txtEn.replace('{a}', a.toString()).replace('{b}', b.toString()),
                    answerType: 'numeric',
                    geometry: null
                },
                token: this.toBase64(c.toString()),
                clues: [{latex: `\\sqrt{${a}^2 + ${b}^2}`}],
                metadata: { variation: 'app_ladder', difficulty: 3 }
            };
        }

        // VARIATION B: Spot the Triangle (Rectangle Diagonal)
        if (variation < 0.7) {
            const t = this.getTriple();
            const w = t.a; const h = t.b; const d = t.c;

            return {
                renderData: {
                    description: lang==='sv' 
                        ? `En rektangel är ${w} bred och ${h} hög. Hur lång är diagonalen?` 
                        : `A rectangle is ${w} wide and ${h} high. How long is the diagonal?`,
                    answerType: 'numeric',
                    geometry: { type: 'rectangle', width: w, height: h, labels: {b:w, h:h} } // Visual helps spot the triangle
                },
                token: this.toBase64(d.toString()),
                clues: [
                    { text: lang==='sv' ? "Diagonalen delar rektangeln i två rätvinkliga trianglar." : "The diagonal splits the rectangle into two right triangles.", latex: "" },
                    { latex: `d = \\sqrt{${w}^2 + ${h}^2}` }
                ],
                metadata: { variation: 'app_diagonal', difficulty: 3 }
            };
        }

        // VARIATION C: Coordinate Distance
        const t = this.getTriple();
        const x1 = MathUtils.randomInt(0, 5);
        const y1 = MathUtils.randomInt(0, 5);
        const x2 = x1 + t.a;
        const y2 = y1 + t.b;
        
        return {
            renderData: {
                description: lang==='sv' 
                    ? `Avstånd mellan (${x1}, ${y1}) och (${x2}, ${y2})?` 
                    : `Distance between (${x1}, ${y1}) and (${x2}, ${y2})?`,
                answerType: 'numeric',
                geometry: null
            },
            token: this.toBase64(t.c.toString()),
            clues: [
                { latex: `\\Delta x = ${t.a}, \\Delta y = ${t.b}` },
                { latex: `d = \\sqrt{${t.a}^2 + ${t.b}^2}` }
            ],
            metadata: { variation: 'app_coords', difficulty: 4 }
        };
    }

    // --- LEVEL 5: The Converse (Logic) ---
    private level5_Converse(lang: string): any {
        const variation = Math.random();

        // VARIATION A: Standard Check
        if (variation < 0.4) {
            const isRight = MathUtils.randomInt(0, 1) === 1;
            let a, b, c;
            if (isRight) {
                const t = this.getTriple();
                a=t.a; b=t.b; c=t.c;
            } else {
                const base = MathUtils.randomChoice([[3,4,5], [5,12,13]]);
                const k = MathUtils.randomInt(1, 3);
                a = base[0]*k; b = base[1]*k; c = (base[2]*k) + 1; 
            }
            
            const q = lang==='sv' ? `Är en triangel med sidorna ${a}, ${b}, ${c} rätvinklig?` : `Is a triangle with sides ${a}, ${b}, ${c} right-angled?`;
            const ans = isRight ? (lang==='sv'?"Ja":"Yes") : (lang==='sv'?"Nej":"No");
            const wrong = isRight ? (lang==='sv'?"Nej":"No") : (lang==='sv'?"Ja":"Yes");

            return {
                renderData: {
                    description: q,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([ans, wrong])
                },
                token: this.toBase64(ans),
                clues: [{ text: `Check ${a}^2 + ${b}^2 = ${c}^2`, latex: "" }],
                metadata: { variation: 'conv_check', difficulty: 3 }
            };
        }

        // VARIATION B: Missing Value for Truth
        if (variation < 0.7) {
            const t = this.getTriple();
            // Sides a, b, x. Find x to make it right angled.
            const findC = true; // Simpler to always find hyp for this logic check
            const q = lang==='sv' 
                ? `Sidorna är ${t.a}, ${t.b} och x. Vad måste x vara för att den ska vara rätvinklig?`
                : `Sides are ${t.a}, ${t.b} and x. What must x be to make it right-angled?`;
            
            return {
                renderData: { description: q, answerType: 'numeric' },
                token: this.toBase64(t.c.toString()),
                clues: [{ latex: `x = \\sqrt{${t.a}^2 + ${t.b}^2}` }],
                metadata: { variation: 'conv_missing', difficulty: 3 }
            };
        }

        // VARIATION C: Logic Trap
        const s1 = 2, s2 = 2, s3 = 5; // Impossible triangle
        const q = lang==='sv' ? `Sidorna är 2, 2, 5. Är den rätvinklig?` : `Sides are 2, 2, 5. Is it right-angled?`;
        const ans = lang==='sv'?"Nej":"No";
        const wrong = lang==='sv'?"Ja":"Yes";
        
        return {
            renderData: {
                description: q,
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([ans, wrong])
            },
            token: this.toBase64(ans),
            clues: [
                { text: lang==='sv' ? "Det är inte ens en triangel! (2+2 < 5)" : "It's not even a triangle! (2+2 < 5)", latex: "" }
            ],
            metadata: { variation: 'conv_trap', difficulty: 2 }
        };
    }

    // --- LEVEL 6: Advanced/Mixed ---
    private level6_AdvancedMixed(lang: string): any {
        // Just linking to an advanced app for now, e.g. Coords
        const base = this.level5_Coordinates(lang);
        base.metadata = { variation: 'advanced_mixed', difficulty: 5 };
        return base;
    }
}