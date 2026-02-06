import { MathUtils } from '../utils/MathUtils.js';

export class GeometryGenerator {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_RectanglesSquaresParallelograms(lang);
            case 2: return this.level2_Triangles(lang);
            case 3: return this.level3_Circles(lang);
            case 4: return this.level4_PolygonsAndTraps(lang); // Renamed for clarity
            case 5: return this.level5_Composite(lang);
            default: return this.level1_RectanglesSquaresParallelograms(lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    // --- LEVEL 1: Rectangles, Squares & Parallelograms (Area & Perimeter) ---
    private level1_RectanglesSquaresParallelograms(lang: string): any {
        const variation = Math.random();

        // VARIATION A: Standard Calculation (Rectangle/Square) - 30%
        if (variation < 0.3) {
            const isSquare = Math.random() > 0.6;
            const w = MathUtils.randomInt(3, 12);
            const h = isSquare ? w : MathUtils.randomInt(3, 12);
            const isArea = Math.random() > 0.5;
            const ans = isArea ? w * h : 2 * (w + h);
            
            const shapeType = isSquare ? 'square' : 'rectangle';
            const desc = lang === 'sv' 
                ? (isArea ? "Beräkna arean." : "Beräkna omkretsen.") 
                : (isArea ? "Calculate the area." : "Calculate the perimeter.");

            return {
                renderData: { 
                    geometry: { type: shapeType, width: w, height: h, labels: { b: w, h: h } }, 
                    description: desc, 
                    answerType: 'numeric' 
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { 
                        text: isArea 
                            ? (lang==='sv' ? "Area = Bas • Höjd" : "Area = Base • Height") 
                            : (lang==='sv' ? "Omkrets = 2 • (Bas + Höjd)" : "Perimeter = 2 • (Base + Height)"),
                        latex: isArea ? `A = ${w} \\cdot ${h}` : `O = 2(${w} + ${h})`
                    }
                ]
            };
        }

        // VARIATION B: Parallelogram Area - 30%
        if (variation < 0.6) {
            const b = MathUtils.randomInt(4, 12);
            const h = MathUtils.randomInt(3, 10);
            const ans = b * h;

            return {
                renderData: {
                    geometry: { type: 'parallelogram', width: b, height: h, labels: { b: b, h: h } },
                    description: lang === 'sv' ? "Beräkna parallellogrammens area." : "Calculate the area of the parallelogram.",
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? "Formeln är samma som för en rektangel: Bas • Höjd." : "The formula is the same as for a rectangle: Base • Height.",
                        latex: `A = b \\cdot h = ${b} \\cdot ${h}`
                    }
                ]
            };
        }

        // VARIATION C: Inverse Logic (Find Height/Width) - 20%
        if (variation < 0.8) {
            const w = MathUtils.randomInt(3, 10);
            const h = MathUtils.randomInt(3, 10);
            const area = w * h;
            
            return {
                renderData: {
                    geometry: { type: 'rectangle', width: w, height: h, labels: { b: w, h: '?' } }, // Draw visually correct but hide label
                    description: lang === 'sv' 
                        ? `Arean är ${area} cm². Basen är ${w} cm. Vad är höjden?` 
                        : `The area is ${area} cm². The base is ${w} cm. What is the height?`,
                    answerType: 'numeric',
                    suffix: 'cm'
                },
                token: this.toBase64(h.toString()),
                clues: [
                    { text: lang === 'sv' ? "Eftersom Area = Bas • Höjd, så är Höjd = Area / Bas." : "Since Area = Base • Height, then Height = Area / Base.", latex: `h = ${area} / ${w}` }
                ]
            };
        }

        // VARIATION D: Spot the Lie / Concept - 20%
        const w = 5;
        const h = 5;
        // Square 5x5. Area 25, Perim 20.
        const sTrue1 = lang==='sv' ? "Det är en kvadrat" : "It is a square";
        const sTrue2 = lang==='sv' ? "Arean är 25" : "Area is 25";
        const sFalse = lang==='sv' ? "Omkretsen är 25" : "Perimeter is 25"; // Lie

        return {
            renderData: {
                geometry: { type: 'square', width: 5, height: 5, labels: { b: 5, h: 5 } },
                description: lang === 'sv' ? "Vilket påstående är FALSKT?" : "Which statement is FALSE?",
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([sTrue1, sTrue2, sFalse])
            },
            token: this.toBase64(sFalse),
            clues: [
                { text: lang==='sv' ? "Räkna ut omkretsen: 5+5+5+5." : "Calculate perimeter: 5+5+5+5.", latex: "O = 20" }
            ]
        };
    }

    // --- LEVEL 2: Triangles (Area) ---
    private level2_Triangles(lang: string): any {
        const variation = Math.random();

        // VARIATION A: Standard Area - 40%
        if (variation < 0.4) {
            const b = MathUtils.randomInt(4, 12);
            const h = MathUtils.randomInt(2, 8); // Ensure h is even often for clean div? Or not necessarily.
            // Area = b*h/2. If b*h is odd, we get .5. That is fine.
            const ans = (b * h) / 2;
            const isRight = MathUtils.randomInt(0, 1) === 1;

            return {
                renderData: { 
                    geometry: { 
                        type: 'triangle', 
                        width: b, 
                        height: h, 
                        subtype: isRight ? 'right' : undefined,
                        labels: { b: b, h: h } 
                    }, 
                    description: lang === 'sv' ? "Beräkna arean." : "Calculate the area.", 
                    answerType: 'numeric' 
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang === 'sv' ? "Area = (Bas • Höjd) / 2" : "Area = (Base • Height) / 2", latex: `A = \\frac{${b} \\cdot ${h}}{2}` }
                ]
            };
        }

        // VARIATION B: Inverse (Find Height) - 30%
        if (variation < 0.7) {
            const h = MathUtils.randomInt(2, 10);
            const b = MathUtils.randomInt(2, 10);
            const area = (b * h) / 2;
            
            return {
                renderData: {
                    geometry: { type: 'triangle', width: b, height: h, labels: { b: b, h: '?' } },
                    description: lang === 'sv' 
                        ? `Triangelns area är ${area} cm². Basen är ${b} cm. Vad är höjden?` 
                        : `The triangle's area is ${area} cm². The base is ${b} cm. What is the height?`,
                    answerType: 'numeric',
                    suffix: 'cm'
                },
                token: this.toBase64(h.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? "Formeln är A = (b • h) / 2. Dubbla arean först." : "Formula is A = (b • h) / 2. Double the area first.", 
                        latex: `2 \\cdot ${area} = ${b} \\cdot h` 
                    },
                    {
                        text: lang === 'sv' ? "Dela sedan med basen." : "Then divide by the base.",
                        latex: `${b*h} / ${b} = ${h}`
                    }
                ]
            };
        }

        // VARIATION C: Comparison (Which is bigger?) - 30%
        const t1 = { b: 4, h: 6, area: 12 };
        const t2 = { b: 8, h: 3, area: 12 }; // Equal
        
        // Randomize logic to sometimes be unequal
        if (Math.random() > 0.5) t2.h = 4; // Area 16 (Bigger)

        const ans = t1.area > t2.area 
            ? (lang==='sv'?"Triangel A":"Triangle A") 
            : (t2.area > t1.area ? (lang==='sv'?"Triangel B":"Triangle B") : (lang==='sv'?"Lika stora":"Equal"));

        return {
            renderData: {
                description: lang === 'sv' 
                    ? `Vilken triangel har störst area? A (b=${t1.b}, h=${t1.h}) eller B (b=${t2.b}, h=${t2.h})?` 
                    : `Which triangle has the largest area? A (b=${t1.b}, h=${t1.h}) or B (b=${t2.b}, h=${t2.h})?`,
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([lang==='sv'?"Triangel A":"Triangle A", lang==='sv'?"Triangel B":"Triangle B", lang==='sv'?"Lika stora":"Equal"]),
                geometry: { 
                    type: 'compare_shapes_area', 
                    shapeType: 'triangle',
                    left: { width: t1.b*10, height: t1.h*10, labels: { b: t1.b, h: t1.h } }, // Scaling for visibility
                    right: { width: t2.b*10, height: t2.h*10, labels: { b: t2.b, h: t2.h } }
                }
            },
            token: this.toBase64(ans),
            clues: [
                { latex: `A_1 = (${t1.b} \\cdot ${t1.h})/2 = ${t1.area}` },
                { latex: `A_2 = (${t2.b} \\cdot ${t2.h})/2 = ${t2.area}` }
            ]
        };
    }

    // --- LEVEL 3: Circles ---
    private level3_Circles(lang: string): any {
        const variation = Math.random();
        const r = MathUtils.randomInt(3, 10);

        // VARIATION A: Standard Area/Circumference - 40%
        if (variation < 0.4) {
            const isArea = MathUtils.randomInt(0, 1) === 1;
            const ans = isArea ? Math.round(3.14 * r * r * 10) / 10 : Math.round(2 * 3.14 * r * 10) / 10;
            
            return {
                renderData: { 
                    geometry: { 
                        type: 'circle', 
                        radius: r, 
                        show: isArea ? 'radius' : 'diameter', 
                        labels: isArea ? { r: r } : { diameter: 2*r } 
                    }, 
                    description: lang === 'sv' 
                        ? (isArea ? "Beräkna arean (pi = 3.14)." : "Beräkna omkretsen (pi = 3.14).")
                        : (isArea ? "Calculate area (pi = 3.14)." : "Calculate perimeter (pi = 3.14)."), 
                    answerType: 'numeric' 
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { 
                        text: isArea ? "Area = pi • r²" : "Omkrets = pi • d (eller 2 • pi • r)", 
                        latex: isArea ? `A \\approx 3.14 \\cdot ${r}^2` : `O \\approx 3.14 \\cdot ${2*r}` 
                    }
                ]
            };
        }

        // VARIATION B: Estimation - 30%
        if (variation < 0.7) {
            const area = 3.14 * r * r;
            const target = Math.round(area * (MathUtils.randomChoice([0.8, 1.2]))); // Pick a number close by
            const correct = area > target ? (lang==='sv'?"Ja":"Yes") : (lang==='sv'?"Nej":"No");
            const wrong = area > target ? (lang==='sv'?"Nej":"No") : (lang==='sv'?"Ja":"Yes");

            return {
                renderData: {
                    geometry: { type: 'circle', radius: r, labels: { r: r } },
                    description: lang === 'sv' 
                        ? `Är cirkelns area större än ${target}?` 
                        : `Is the circle's area greater than ${target}?`,
                    answerType: 'multiple_choice',
                    options: [correct, wrong]
                },
                token: this.toBase64(correct),
                clues: [
                    { text: lang==='sv' ? "Uppskatta arean: 3 • r • r" : "Estimate area: 3 • r • r", latex: `3 \\cdot ${r*r} = ${3*r*r}` }
                ]
            };
        }

        // VARIATION C: Concept (Diameter vs Circumference) - 30%
        const q = lang==='sv' ? "Om diametern tredubblas, vad händer med omkretsen?" : "If the diameter triples, what happens to the circumference?";
        const ans = lang==='sv' ? "Den tredubblas" : "It triples";
        const w1 = lang==='sv' ? "Den nio-dubblas" : "It increases 9x"; // Squared error
        const w2 = lang==='sv' ? "Den blir samma" : "It stays the same";

        return {
            renderData: {
                description: q,
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([ans, w1, w2])
            },
            token: this.toBase64(ans),
            clues: [{ text: "O = pi • d. Det är ett linjärt samband.", latex: "" }]
        };
    }

    // --- LEVEL 4: Polygons & Traps ---
    private level4_PolygonsAndTraps(lang: string): any {
        // VARIATION: The Slant Trap (Parallelogram)
        const b = MathUtils.randomInt(5, 12);
        const h = MathUtils.randomInt(4, 10);
        const slant = h + MathUtils.randomInt(1, 3); // Slant must be > height
        const ans = b * h;

        return {
            renderData: {
                geometry: { 
                    type: 'parallelogram', 
                    width: b, 
                    height: h, 
                    labels: { b: b, h: h, s: slant } // Passing 's' (slant) as a distractor
                },
                description: lang === 'sv' 
                    ? "Beräkna arean. Se upp med vilket mått du använder!" 
                    : "Calculate the area. Be careful which dimension you use!",
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? "För area ska du alltid använda den vinkelräta höjden, inte den sneda sidan." : "For area, always use the perpendicular height, not the slanted side.",
                    latex: `A = ${b} \\cdot ${h}`
                }
            ]
        };
    }

    // --- LEVEL 5: Composite Shapes ---
    private level5_Composite(lang: string): any {
        const isHouse = MathUtils.randomInt(0, 1) === 1;
        const w = MathUtils.randomInt(4, 10) * 10; 
        const h = MathUtils.randomInt(4, 8) * 10;
        
        let ans = 0;
        let geom: any = {};
        let desc = "";
        let steps = [];

        if (isHouse) {
            const hRoof = MathUtils.randomInt(2, 5) * 10;
            const isArea = MathUtils.randomInt(0, 1) === 1;
            
            if (isArea) {
                const aRect = w * h;
                const aTri = (w * hRoof) / 2;
                ans = aRect + aTri;
                desc = lang === 'sv' ? `Beräkna totala arean.` : `Calculate total area.`;
                steps = [{ latex: `${w}\\cdot${h} + \\frac{${w}\\cdot${hRoof}}{2} = \\mathbf{${ans}}` }];
            } else {
                const slope = Math.sqrt((w/2)**2 + hRoof**2);
                ans = Math.round((w + 2*h + 2*slope) * 10) / 10;
                desc = lang === 'sv' ? `Beräkna omkretsen.` : `Calculate perimeter.`;
                steps = [{ latex: `${w} + 2\\cdot${h} + 2\\cdot${Math.round(slope*10)/10} \\approx \\mathbf{${ans}}` }];
            }
            geom = { type: 'composite', subtype: 'house', labels: { w, h, h_roof: hRoof } };
        } else {
            const r = w / 2;
            const isArea = MathUtils.randomInt(0, 1) === 1;
            
            if (isArea) {
                const aRect = w * h;
                const aSemi = Math.round(3.14 * r * r / 2 * 10) / 10;
                ans = Math.round((aRect + aSemi)*10)/10;
                desc = lang === 'sv' ? `Beräkna arean av portalen.` : `Calculate portal area.`;
                steps = [{ latex: `${w}\\cdot${h} + \\frac{3.14\\cdot${r}^2}{2} \\approx \\mathbf{${ans}}` }];
            } else {
                const arc = 3.14 * r;
                ans = Math.round((w + 2*h + arc) * 10) / 10;
                desc = lang === 'sv' ? `Beräkna omkretsen.` : `Calculate perimeter.`;
                steps = [{ latex: `${w} + 2\\cdot${h} + 3.14\\cdot${r} \\approx \\mathbf{${ans}}` }];
            }
            geom = { type: 'composite', subtype: 'portal', labels: { w, h } };
        }

        return {
            renderData: { 
                geometry: geom, 
                description: desc, 
                answerType: 'numeric' 
            },
            token: this.toBase64(ans.toString()),
            clues: steps
        };
    }
}