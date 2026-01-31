import { MathUtils } from '../utils/MathUtils.js';

export class PythagorasGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_SquaresRoots(lang);
            case 2: return this.level2_Hypotenuse(lang);
            case 3: return this.level3_Leg(lang);
            case 4: return this.level4_Applications(lang);
            case 5: return this.level5_Coordinates(lang);
            case 6: return this.level6_Converse(lang);
            default: return this.level1_SquaresRoots(lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    // Helper: Get a scaled triple
    private getTriple(): { a: number, b: number, c: number, k: number } {
        const primitives = [[3,4,5], [5,12,13], [8,15,17], [7,24,25], [20,21,29]];
        const base = MathUtils.randomChoice(primitives);
        
        // Random multiplier to ensure variety
        const k = MathUtils.randomChoice([1, 1, 1, 2, 2, 3, 4, 5, 10]); 
        
        return { a: base[0]*k, b: base[1]*k, c: base[2]*k, k: k };
    }

    // Level 1: Squares & Roots (Mental Math)
    private level1_SquaresRoots(lang: string): any {
        const isRoot = MathUtils.randomInt(0, 1) === 1;
        const base = MathUtils.randomInt(1, 15);
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
                    { 
                        text: lang === 'sv' ? "Vilket tal gånger sig självt blir det här?" : "Which number times itself equals this?", 
                        latex: `? \\cdot ? = ${square}` 
                    }
                ]
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
                    { 
                        text: lang === 'sv' ? "Multiplicera talet med sig självt." : "Multiply the number by itself.", 
                        latex: `${base} \\cdot ${base}` 
                    }
                ]
            };
        }
    }

    // Level 2: Find Hypotenuse (Simple Algebra Logic)
    private level2_Hypotenuse(lang: string): any {
        const t = this.getTriple();
        // Randomize which leg is base vs height for visual variety
        const swap = MathUtils.randomInt(0, 1) === 1;
        const width = swap ? t.b : t.a;
        const height = swap ? t.a : t.b;

        const desc = lang === 'sv' 
            ? "Triangeln är rätvinklig. Beräkna den längsta sidan (hypotenusan x)." 
            : "The triangle is right-angled. Calculate the longest side (hypotenuse x).";

        return {
            renderData: {
                description: desc,
                answerType: 'numeric',
                geometry: { 
                    type: 'triangle', subtype: 'right', 
                    width: width, height: height, 
                    // UPDATED: Explicitly map 'b' and 'h' so GeometryComponents renders them.
                    // Added 'hyp' for future compatibility, though current component may not render it.
                    labels: { b: width, h: height, hyp: 'x', c: 'x' } 
                }
            },
            token: this.toBase64(t.c.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? "Använd Pythagoras sats: a² + b² = c²." : "Use Pythagoras theorem: a² + b² = c².", 
                    latex: `${width}^2 + ${height}^2 = x^2` 
                },
                { 
                    text: lang === 'sv' ? "Räkna ut summan och ta sedan roten ur." : "Calculate the sum, then take the square root.",
                    latex: `x = \\sqrt{${t.c*t.c}}` 
                }
            ]
        };
    }

    // Level 3: Find Leg (Subtraction Logic)
    private level3_Leg(lang: string): any {
        const t = this.getTriple();
        
        // Decide if we are solving for the base (b) or the height (h)
        const solveForBase = MathUtils.randomInt(0, 1) === 1;

        let labels: any = {};
        let missingVar = 'x';
        
        if (solveForBase) {
            // We know Height (h) and Hypotenuse (c). We need Base (b).
            // NOTE: GeometryComponents uses 'h' and 'b' keys.
            labels = { h: t.a, b: 'x', hyp: t.c, c: t.c };
            missingVar = 'b';
        } else {
            // We know Base (b) and Hypotenuse (c). We need Height (h).
            labels = { b: t.b, h: 'x', hyp: t.c, c: t.c };
            missingVar = 'a';
        }

        // UPDATED: Added hypotenuse length to description because GeometryComponents 
        // does not currently render the label on the hypotenuse.
        const desc = lang === 'sv' 
            ? `Hypotenusan är ${t.c}. Beräkna den okända sidan (x).` 
            : `The hypotenuse is ${t.c}. Calculate the unknown side (x).`;

        const knownLeg = solveForBase ? t.a : t.b;

        return {
            renderData: {
                description: desc,
                answerType: 'numeric',
                geometry: { 
                    type: 'triangle', subtype: 'right', 
                    width: solveForBase ? t.b : t.b, // keep visual width proportional-ish
                    height: solveForBase ? t.a : t.a,
                    labels: labels 
                }
            },
            token: this.toBase64((solveForBase ? t.b : t.a).toString()),
            clues: [
                { 
                    text: lang === 'sv' ? "Du vet den längsta sidan. Då ska du subtrahera (ta minus)." : "You know the longest side. So you must subtract.", 
                    latex: `c^2 - ${missingVar === 'a' ? 'b' : 'a'}^2 = ${missingVar}^2` 
                },
                { 
                    text: lang === 'sv' ? "Ta stora kvadraten minus lilla kvadraten." : "Take the big square minus the small square.",
                    latex: `${t.c}^2 - ${knownLeg}^2 = x^2` 
                }
            ]
        };
    }

    // Level 4: Applications (7 Scenarios)
    private level4_Applications(lang: string): any {
        const s = MathUtils.randomChoice([
            { id: 'ladder', type: 'find_c', txtSv: "En stege lutar mot en vägg. Stegen når {a} m upp och står {b} m från väggen. Hur lång är stegen?", txtEn: "A ladder leans against a wall. It reaches {a} m up and stands {b} m out. How long is the ladder?" },
            { id: 'map', type: 'find_c', txtSv: "Du går {a} km norrut och sedan {b} km österut. Hur långt är du från starten (fågelvägen)?", txtEn: "You walk {a} km North and then {b} km East. How far are you from the start?" },
            { id: 'tv', type: 'find_c', txtSv: "En TV-skärm är {a} cm bred och {b} cm hög. Hur lång är diagonalen?", txtEn: "A TV screen is {a} cm wide and {b} cm high. How long is the diagonal?" },
            { id: 'mast', type: 'find_c', txtSv: "En mast är {a} m hög. En stödvajer fästs i marken {b} m från masten. Hur lång är vajern?", txtEn: "A mast is {a} m tall. A wire is attached to the ground {b} m away. How long is the wire?" },
            // Find Leg Scenarios
            { id: 'kite', type: 'find_a', txtSv: "Ett snöre till en drake är {c} m långt. Draken svävar rakt ovanför en punkt {b} m bort. Hur högt är draken?", txtEn: "A kite string is {c} m long. The kite is above a spot {b} m away. How high is the kite?" },
            { id: 'ramp', type: 'find_a', txtSv: "En ramp är {c} m lång. Den når en höjd på {b} m. Hur långt sträcker den sig längs marken?", txtEn: "A ramp is {c} m long. It reaches a height of {b} m. How far does it stretch along the ground?" },
            { id: 'envelope', type: 'find_a', txtSv: "Diagonalen på ett kuvert är {c} cm. Höjden är {b} cm. Hur brett är kuvertet?", txtEn: "The diagonal of an envelope is {c} cm. The height is {b} cm. How wide is it?" }
        ]);

        const t = this.getTriple();
        const k = MathUtils.randomInt(1, 3);
        const primitive = MathUtils.randomChoice([[3,4,5], [5,12,13], [8,15,17]]);
        const a = primitive[0] * k; 
        const b = primitive[1] * k; 
        const c = primitive[2] * k;

        let desc = "";
        let ans = 0;
        let hintFormula = "";

        if (s.type === 'find_c') {
            desc = lang === 'sv' ? s.txtSv.replace('{a}', a).replace('{b}', b) : s.txtEn.replace('{a}', a).replace('{b}', b);
            ans = c;
            hintFormula = `\\sqrt{${a}^2 + ${b}^2}`;
        } else {
            desc = lang === 'sv' ? s.txtSv.replace('{c}', c).replace('{b}', b) : s.txtEn.replace('{c}', c).replace('{b}', b);
            ans = a;
            hintFormula = `\\sqrt{${c}^2 - ${b}^2}`;
        }

        return {
            renderData: {
                description: desc,
                answerType: 'numeric',
                geometry: null 
            },
            token: this.toBase64(ans.toString()),
            clues: [
                { text: lang === 'sv' ? "Rita en triangel och använd Pythagoras." : "Draw a triangle and use Pythagoras." },
                { latex: hintFormula }
            ]
        };
    }

    // Level 5: Coordinate Distance
    private level5_Coordinates(lang: string): any {
        const t = this.getTriple();
        const dx = t.a;
        const dy = t.b;
        const dist = t.c;

        const x1 = MathUtils.randomInt(0, 10);
        const y1 = MathUtils.randomInt(0, 10);
        const x2 = x1 + dx;
        const y2 = y1 + dy;

        const desc = lang === 'sv'
            ? `Beräkna avståndet mellan punkterna (${x1}, ${y1}) och (${x2}, ${y2}).`
            : `Calculate the distance between points (${x1}, ${y1}) and (${x2}, ${y2}).`;

        return {
            renderData: {
                description: desc,
                answerType: 'numeric',
                geometry: null
            },
            token: this.toBase64(dist.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? "Skillnaden i x är basen. Skillnaden i y är höjden." : "The difference in x is the base. The difference in y is the height.",
                    latex: `\\Delta x = ${dx}, \\quad \\Delta y = ${dy}`
                },
                { 
                    text: lang === 'sv' ? "Använd Pythagoras på skillnaderna." : "Use Pythagoras on the differences.",
                    latex: `\\sqrt{${dx}^2 + ${dy}^2}` 
                }
            ]
        };
    }

    // Level 6: Converse Theorem (Yes/No)
    private level6_Converse(lang: string): any {
        const isRight = MathUtils.randomInt(0, 1) === 1;
        let a=0, b=0, c=0;

        if (isRight) {
            const t = this.getTriple();
            a=t.a; b=t.b; c=t.c;
        } else {
            const base = MathUtils.randomChoice([[3,4,5], [5,12,13]]);
            const k = MathUtils.randomInt(1, 3);
            a = base[0]*k; 
            b = base[1]*k; 
            c = (base[2]*k) + 1; // Incorrect hypotenuse
        }

        const desc = lang === 'sv'
            ? `En triangel har sidorna ${a}, ${b} och ${c}. Är den rätvinklig?`
            : `A triangle has sides ${a}, ${b}, and ${c}. Is it a right-angled triangle?`;

        const correct = lang === 'sv' ? (isRight ? "Ja" : "Nej") : (isRight ? "Yes" : "No");
        const wrong = lang === 'sv' ? (isRight ? "Nej" : "Ja") : (isRight ? "No" : "Yes");

        // UPDATED: Added explicit geometry: null to avoid crash if frontend tries to render undefined geometry.
        // Also ensuring shuffle logic is safe.
        return {
            renderData: {
                description: desc,
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([correct, wrong]),
                geometry: null
            },
            token: this.toBase64(correct),
            clues: [
                { 
                    text: lang === 'sv' ? "Testa om ekvationen stämmer:" : "Test if the equation holds:", 
                    latex: `${a}^2 + ${b}^2 = ${c}^2 ?` 
                }
            ]
        };
    }
}