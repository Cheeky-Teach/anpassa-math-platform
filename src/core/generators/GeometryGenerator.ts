import { MathUtils } from '../utils/MathUtils.js';

export class GeometryGenerator {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_PerimeterBasic(lang);
            case 2: return this.level2_AreaBasic(lang);
            case 3: return this.level3_Triangles(lang);
            case 4: return this.level4_CombinedFigures(lang);
            case 5: return this.level5_Circles(lang);
            case 6: return this.level6_CompositeAdvanced(lang);
            default: return this.level1_PerimeterBasic(lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    // --- LEVEL 1: PERIMETER ONLY ---
    private level1_PerimeterBasic(lang: string): any {
        const variation = Math.random();
        
        // VARIATION A: Standard Perimeter
        if (variation < 0.4) {
            const type = MathUtils.randomChoice(['rectangle', 'square', 'parallelogram']);
            
            if (type === 'square') {
                const s = MathUtils.randomInt(3, 15);
                const ans = 4 * s;
                return {
                    renderData: {
                        geometry: { type: 'square', width: s, height: s, labels: { b: s, h: s } },
                        description: lang === 'sv' 
                            ? "En kvadrat har sidan " + s + ". Beräkna omkretsen." 
                            : "A square has side " + s + ". Calculate the perimeter.",
                        answerType: 'numeric'
                    },
                    token: this.toBase64(ans.toString()),
                    clues: [
                        { text: lang === 'sv' ? "En kvadrat har fyra sidor som alla är lika långa." : "A square has four sides of equal length.", latex: "" },
                        { text: lang === 'sv' ? "Addera sidan fyra gånger eller multiplicera med 4." : "Add the side four times or multiply by 4.", latex: `O = 4 \\cdot ${s}` }
                    ],
                    metadata: { variation: 'perimeter_square', difficulty: 1 }
                };
            } 
            else if (type === 'rectangle') {
                const b = MathUtils.randomInt(4, 15);
                const h = MathUtils.randomInt(3, 10);
                const ans = 2 * (b + h);
                
                return {
                    renderData: {
                        geometry: { type: 'rectangle', width: b, height: h, labels: { b: b, h: h } },
                        description: lang === 'sv' 
                            ? `En rektangel har basen ${b} och höjden ${h}. Beräkna omkretsen.` 
                            : `A rectangle has base ${b} and height ${h}. Calculate the perimeter.`,
                        answerType: 'numeric'
                    },
                    token: this.toBase64(ans.toString()),
                    clues: [
                        { text: lang === 'sv' ? "Omkretsen är summan av alla sidor. Det finns två baser och två höjder." : "Perimeter is the sum of all sides. There are two bases and two heights.", latex: "" },
                        { text: lang === 'sv' ? "Addera ihop allt." : "Add everything together.", latex: `O = 2(${b} + ${h})` }
                    ],
                    metadata: { variation: 'perimeter_rect', difficulty: 1 }
                };
            }
            else { // Parallelogram
                const b = MathUtils.randomInt(5, 15);
                const s = MathUtils.randomInt(4, 12); 
                const h = MathUtils.randomInt(3, s - 1); 
                const ans = 2 * (b + s);

                return {
                    renderData: {
                        geometry: { type: 'parallelogram', width: b, height: h, labels: { b: b, s: s } }, 
                        description: lang === 'sv' 
                            ? `En parallellogram har sidorna ${b} och ${s}. Beräkna omkretsen.` 
                            : `A parallelogram has sides ${b} and ${s}. Calculate the perimeter.`,
                        answerType: 'numeric'
                    },
                    token: this.toBase64(ans.toString()),
                    clues: [
                        { text: lang === 'sv' ? "Precis som en rektangel har den två par av lika långa sidor." : "Just like a rectangle, it has two pairs of equal sides.", latex: "" },
                        { text: lang === 'sv' ? "Addera alla sidor för att få omkretsen." : "Add all sides to get the perimeter.", latex: `O = 2(${b} + ${s})` }
                    ],
                    metadata: { variation: 'perimeter_parallel', difficulty: 1 }
                };
            }
        }

        // VARIATION B: Inverse Perimeter (Find Side)
        if (variation < 0.7) {
            // "Perimeter is 20. Width is 6. Find height."
            const w = MathUtils.randomInt(3, 10);
            const h = MathUtils.randomInt(2, 8);
            const perim = 2 * (w + h);
            
            return {
                renderData: {
                    geometry: { type: 'rectangle', width: w, height: h, labels: { b: w, h: '?' } },
                    description: lang === 'sv'
                        ? `En rektangel har omkretsen ${perim}. Basen är ${w}. Vad är höjden?`
                        : `A rectangle has perimeter ${perim}. The base is ${w}. What is the height?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(h.toString()),
                clues: [
                    { 
                        text: lang==='sv' ? "Ta bort de två baserna från totalen." : "Subtract the two bases from the total.", 
                        latex: `${perim} - 2(${w}) = ${perim - 2*w}` 
                    },
                    {
                        text: lang==='sv' ? "Dela resten med 2 för att få höjden." : "Divide the remainder by 2 to get the height.",
                        latex: `${perim - 2*w} / 2 = ${h}`
                    }
                ],
                metadata: { variation: 'perimeter_inverse', difficulty: 2 }
            };
        }

        // VARIATION C: Spot the Lie (Perimeter)
        const s = 5;
        const p = 20;
        const a = 25;
        const sTrue1 = lang==='sv' ? "Omkretsen är 20" : "Perimeter is 20";
        const sTrue2 = lang==='sv' ? "Sidan är 5" : "Side is 5";
        const sFalse = lang==='sv' ? "Omkretsen är 25" : "Perimeter is 25";

        return {
            renderData: {
                geometry: { type: 'square', width: 5, height: 5, labels: { b: 5, h: 5 } },
                description: lang==='sv' ? "Vilket påstående är FALSKT?" : "Which statement is FALSE?",
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([sTrue1, sTrue2, sFalse])
            },
            token: this.toBase64(sFalse),
            clues: [{text: "4 * 5 = 20", latex: ""}],
            metadata: { variation: 'perimeter_lie', difficulty: 1 }
        };
    }

    // --- LEVEL 2: AREA ---
    private level2_AreaBasic(lang: string): any {
        const variation = Math.random();

        // VARIATION A: Standard Area
        if (variation < 0.4) {
            const type = MathUtils.randomChoice(['rectangle', 'square', 'parallelogram']);
            
            if (type === 'square') {
                const s = MathUtils.randomInt(3, 12);
                const ans = s * s;
                return {
                    renderData: {
                        geometry: { type: 'square', width: s, height: s, labels: { b: s, h: s } },
                        description: lang === 'sv' 
                            ? `En kvadrat har sidan ${s}. Beräkna arean.` 
                            : `A square has side ${s}. Calculate the area.`,
                        answerType: 'numeric', suffix: 'cm²'
                    },
                    token: this.toBase64(ans.toString()),
                    clues: [{ text: "Area = s²", latex: `${s} \\cdot ${s}` }],
                    metadata: { variation: 'area_square', difficulty: 1 }
                };
            } else {
                const b = MathUtils.randomInt(4, 12);
                const h = MathUtils.randomInt(3, 10);
                const ans = b * h;
                
                const desc = lang === 'sv'
                    ? `Beräkna arean av ${type === 'rectangle' ? 'rektangeln' : 'parallellogrammen'}.`
                    : `Calculate the area of the ${type}.`;

                return {
                    renderData: {
                        geometry: { type: type, width: b, height: h, labels: { b: b, h: h } },
                        description: desc,
                        answerType: 'numeric', suffix: 'cm²'
                    },
                    token: this.toBase64(ans.toString()),
                    clues: [
                        { 
                            text: lang === 'sv' ? "För att hitta arean, multiplicera basen med höjden." : "To find the area, multiply the base by the height.", 
                            latex: `A = \\text{Bas} \\cdot \\text{Höjd}` 
                        },
                        {
                            latex: `${b} \\cdot ${h}`
                        }
                    ],
                    metadata: { variation: type === 'rectangle' ? 'area_rect' : 'area_parallel', difficulty: 1 }
                };
            }
        }

        // VARIATION B: Inverse Area (Find Height)
        if (variation < 0.7) {
            const w = MathUtils.randomInt(3, 10);
            const h = MathUtils.randomInt(3, 10);
            const area = w * h;
            
            return {
                renderData: {
                    geometry: { type: 'rectangle', width: w, height: h, labels: { b: w, h: '?' } }, 
                    description: lang === 'sv' 
                        ? `Arean är ${area} cm². Basen är ${w} cm. Vad är höjden?` 
                        : `The area is ${area} cm². The base is ${w} cm. What is the height?`,
                    answerType: 'numeric',
                    suffix: 'cm'
                },
                token: this.toBase64(h.toString()),
                clues: [
                    { text: lang === 'sv' ? "Eftersom Area = Bas • Höjd, så är Höjd = Area / Bas." : "Since Area = Base • Height, then Height = Area / Base.", latex: `h = ${area} / ${w}` }
                ],
                metadata: { variation: 'area_inverse', difficulty: 2 }
            };
        }

        // VARIATION C: The Slant Trap (Parallelogram)
        const b = MathUtils.randomInt(5, 12);
        const h = MathUtils.randomInt(4, 10);
        const slant = h + MathUtils.randomInt(1, 3);
        const ans = b * h;

        return {
            renderData: {
                geometry: { 
                    type: 'parallelogram', 
                    width: b, 
                    height: h, 
                    labels: { b: b, h: h, s: slant } 
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
            ],
            metadata: { variation: 'area_trap', difficulty: 2 }
        };
    }

    // --- LEVEL 3: TRIANGLES ---
    private level3_Triangles(lang: string): any {
        const variation = Math.random();

        // VARIATION A: Area
        if (variation < 0.4) {
            const b = MathUtils.randomInt(4, 12);
            const h = MathUtils.randomInt(3, 10);
            const ans = (b * h) / 2;
            
            return {
                renderData: {
                    geometry: { type: 'triangle', width: b, height: h, labels: { b: b, h: h } },
                    description: lang === 'sv' 
                        ? `En triangel har basen ${b} och höjden ${h}. Beräkna arean.` 
                        : `A triangle has base ${b} and height ${h}. Calculate the area.`,
                    answerType: 'numeric', suffix: 'cm²'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? "Tänk dig att triangeln är halva rektangeln med samma bas och höjd." : "Imagine the triangle is half of a rectangle with the same base and height.", 
                        latex: "" 
                    },
                    {
                        text: lang === 'sv' ? "Räkna ut basen gånger höjden, och dela sedan med 2." : "Calculate base times height, then divide by 2.",
                        latex: `A = \\frac{${b} \\cdot ${h}}{2}`
                    }
                ],
                metadata: { variation: 'area_triangle', difficulty: 2 }
            };
        } 
        
        // VARIATION B: Inverse Area
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
                ],
                metadata: { variation: 'inverse_triangle', difficulty: 3 }
            };
        }

        // VARIATION C: Perimeter
        const type = MathUtils.randomChoice(['right', 'isosceles', 'scalene']);
        
        if (type === 'right') {
            const triple = MathUtils.randomChoice([{a:3,b:4,c:5}, {a:5,b:12,c:13}, {a:6,b:8,c:10}]);
            return {
                renderData: {
                    geometry: { 
                        type: 'triangle', width: triple.a, height: triple.b, subtype: 'right',
                        labels: { b: triple.a, h: triple.b, hyp: triple.c } 
                    },
                    description: lang === 'sv' ? "Beräkna triangelns omkrets." : "Calculate the triangle's perimeter.",
                    answerType: 'numeric'
                },
                token: this.toBase64((triple.a+triple.b+triple.c).toString()),
                clues: [
                    { text: lang === 'sv' ? "Omkretsen är vägen runt hela figuren. Addera alla tre sidor." : "Perimeter is the path around the shape. Add all three sides.", latex: `${triple.a} + ${triple.b} + ${triple.c}` }
                ],
                metadata: { variation: 'perimeter_triangle_right', difficulty: 2 }
            };
        } else if (type === 'isosceles') {
            const b = MathUtils.randomInt(4, 10);
            const leg = MathUtils.randomInt(b, b+5);
            return {
                renderData: {
                    geometry: { 
                        type: 'triangle', width: b, height: leg, 
                        labels: { b: b, s1: leg, s2: leg } 
                    },
                    description: lang === 'sv' ? "Beräkna omkretsen av den likbenta triangeln." : "Calculate the perimeter of the isosceles triangle.",
                    answerType: 'numeric'
                },
                token: this.toBase64((b + 2*leg).toString()),
                clues: [
                    { text: lang === 'sv' ? "En likbent triangel har två sidor som är lika långa." : "An isosceles triangle has two sides of equal length.", latex: "" },
                    { text: lang === 'sv' ? "Addera basen och de två benen." : "Add the base and the two legs.", latex: `${b} + ${leg} + ${leg}` }
                ],
                metadata: { variation: 'perimeter_triangle_iso', difficulty: 2 }
            };
        } else {
            const s1 = MathUtils.randomInt(3, 8);
            const s2 = MathUtils.randomInt(4, 9);
            const s3 = MathUtils.randomInt(5, 10); 
            return {
                renderData: {
                    geometry: { 
                        type: 'triangle', width: s2, height: s1, 
                        labels: { s1: s1, b: s2, s2: s3 } 
                    },
                    description: lang === 'sv' ? "Beräkna omkretsen." : "Calculate the perimeter.",
                    answerType: 'numeric'
                },
                token: this.toBase64((s1+s2+s3).toString()),
                clues: [
                    { text: lang === 'sv' ? "Addera längden på alla tre sidorna." : "Add the lengths of all three sides.", latex: `${s1} + ${s2} + ${s3}` }
                ],
                metadata: { variation: 'perimeter_triangle_scalene', difficulty: 2 }
            };
        }
    }

    // --- LEVEL 4: COMBINED FIGURES ---
    private level4_CombinedFigures(lang: string): any {
        const type = MathUtils.randomChoice(['rect_right_tri', 'l_shape', 'house_area']);
        
        if (type === 'rect_right_tri') {
            const rectW = MathUtils.randomInt(4, 8);
            const rectH = MathUtils.randomInt(4, 8);
            const triBase = MathUtils.randomInt(3, 5);
            const area = rectW * rectH + (triBase * rectH) / 2;
            
            return {
                renderData: {
                    geometry: { 
                        type: 'composite', 
                        subtype: 'rect_right_tri', 
                        labels: { w: rectW, h: rectH, tri_b: triBase } 
                    },
                    description: lang === 'sv' 
                        ? "Figuren består av en rektangel och en rätvinklig triangel. Beräkna totala arean." 
                        : "The figure consists of a rectangle and a right triangle. Calculate the total area.",
                    answerType: 'numeric', suffix: 'cm²'
                },
                token: this.toBase64(area.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? "Dela upp problemet. Räkna först ut rektangelns area (Bas • Höjd)." : "Split the problem. First calculate the rectangle's area (Base • Height).", 
                        latex: `A_{rect} = ${rectW} \\cdot ${rectH}` 
                    },
                    { 
                        text: lang === 'sv' ? "Räkna sedan ut triangelns area (Bas • Höjd / 2)." : "Then calculate the triangle's area (Base • Height / 2).", 
                        latex: `A_{tri} = \\frac{${triBase} \\cdot ${rectH}}{2}` 
                    },
                    {
                        text: lang === 'sv' ? "Addera de två areorna för att få totalen." : "Add the two areas to get the total.",
                        latex: `${rectW*rectH} + ${(triBase*rectH)/2}`
                    }
                ],
                metadata: { variation: 'combined_rect_tri', difficulty: 3 }
            };
        }
        else if (type === 'l_shape') {
            const vW = MathUtils.randomInt(2, 4);
            const vH = MathUtils.randomInt(6, 10);
            const extensionW = MathUtils.randomInt(4, 8); 
            const hH = MathUtils.randomInt(3, 5);
            
            const totalW = vW + extensionW;
            const area = vW * vH + extensionW * hH;
            
            return {
                renderData: {
                    geometry: {
                        type: 'composite',
                        subtype: 'l_shape',
                        labels: { vW, vH, hW: extensionW, hH, totalW }
                    },
                    description: lang === 'sv' 
                        ? "Figuren är sammansatt av två rektanglar. Beräkna totala arean." 
                        : "The figure is composed of two rectangles. Calculate the total area.",
                    answerType: 'numeric', suffix: 'cm²'
                },
                token: this.toBase64(area.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? "Dela upp figuren. Du vet totala bredden och toppen. Vad är bredden på utsticket?" : "Split the figure. You know total width and top. What is the extension width?", 
                        latex: `\\text{Utstick} = ${totalW} - ${vW} = ${extensionW}` 
                    },
                    {
                        text: lang === 'sv' ? "Räkna nu arean för den stående delen och det liggande utsticket." : "Now calculate area for standing part and lying extension.",
                        latex: `(${vW} \\cdot ${vH}) + (${extensionW} \\cdot ${hH})`
                    }
                ],
                metadata: { variation: 'combined_l_shape', difficulty: 3 }
            };
        }
        else {
            // House Area
            const s = MathUtils.randomInt(4, 8);
            const hTri = MathUtils.randomInt(3, 6);
            const area = s*s + (s*hTri)/2;
            
            return {
                renderData: {
                    geometry: { 
                        type: 'composite', 
                        subtype: 'house_area', 
                        labels: { s: s, h_tri: hTri } 
                    },
                    description: lang === 'sv' 
                        ? "Figuren består av en kvadrat och en triangel. Beräkna totala arean." 
                        : "The figure consists of a square and a triangle. Calculate the total area.",
                    answerType: 'numeric', suffix: 'cm²'
                },
                token: this.toBase64(area.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? "Räkna ut kvadratens area (sidan • sidan)." : "Calculate the square's area (side • side).", 
                        latex: `A_{sq} = ${s} \\cdot ${s}` 
                    },
                    { 
                        text: lang === 'sv' ? "Räkna ut triangelns area (bas • höjd / 2)." : "Calculate the triangle's area (base • height / 2).", 
                        latex: `A_{tri} = \\frac{${s} \\cdot ${hTri}}{2}` 
                    },
                    {
                        text: lang === 'sv' ? "Totalt:" : "Total:",
                        latex: `${s*s} + ${(s*hTri)/2}`
                    }
                ],
                metadata: { variation: 'combined_house', difficulty: 3 }
            };
        }
    }

    // --- LEVEL 5: CIRCLES ---
    private level5_Circles(lang: string): any {
        const variation = Math.random();
        const r = MathUtils.randomInt(3, 10);
        const pi = 3.14;

        if (variation < 0.4) {
            // Circle
            const isArea = MathUtils.randomInt(0, 1) === 1;
            const ans = isArea ? Math.round(pi * r * r * 10) / 10 : Math.round(2 * pi * r * 10) / 10;
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
                        text: isArea ? "Area = pi • r²" : "Omkrets = pi • d", 
                        latex: isArea ? `3.14 \\cdot ${r}^2` : `3.14 \\cdot ${2*r}` 
                    },
                    {
                        text: lang === 'sv' ? "Sätt in värdena:" : "Insert values:",
                        latex: isArea ? `${r} \\cdot ${r} \\cdot 3.14` : `${2*r} \\cdot 3.14`
                    }
                ],
                metadata: { variation: isArea ? 'circle_area' : 'circle_perimeter', difficulty: 2 }
            };
        } else if (variation < 0.7) {
            // Semicircle
            const isArea = MathUtils.randomInt(0, 1) === 1;
            if (isArea) {
                const area = (pi * r * r) / 2;
                const ans = Math.round(area * 10) / 10;
                return {
                    renderData: {
                        geometry: { type: 'semicircle', radius: r, labels: { r: r } },
                        description: lang === 'sv' ? "Beräkna halvcirkelns area." : "Calculate the semicircle's area.",
                        answerType: 'numeric', suffix: 'cm²'
                    },
                    token: this.toBase64(ans.toString()),
                    clues: [
                        { text: lang==='sv' ? "Räkna ut hela cirkelns area först." : "Calculate the full circle area first.", latex: `\\pi \\cdot ${r}^2` },
                        { text: lang==='sv' ? "Eftersom det är en halvcirkel, dela med 2." : "Since it's a semicircle, divide by 2.", latex: `/ 2` }
                    ],
                    metadata: { variation: 'semicircle_area', difficulty: 3 }
                };
            } else {
                const d = 2 * r;
                const arc = (pi * d) / 2;
                const perim = arc + d;
                const ans = Math.round(perim * 10) / 10;
                return {
                    renderData: {
                        geometry: { type: 'semicircle', radius: r, labels: { diameter: d }, show: 'diameter' },
                        description: lang === 'sv' ? "Beräkna halvcirkelns omkrets (bågen + basen)." : "Calculate the semicircle's perimeter (arc + base).",
                        answerType: 'numeric'
                    },
                    token: this.toBase64(ans.toString()),
                    clues: [
                        { text: lang==='sv' ? "Räkna ut bågens längd (halva cirkelns omkrets)." : "Calculate arc length (half circle circumference).", latex: `(\\pi \\cdot ${d}) / 2` },
                        { text: lang==='sv' ? "Glöm inte att addera den raka basen (diametern)!" : "Don't forget to add the straight base (diameter)!", latex: `+ ${d}` }
                    ],
                    metadata: { variation: 'semicircle_perimeter', difficulty: 3 }
                };
            }
        } else {
            // Quarter
            const isArea = MathUtils.randomInt(0, 1) === 1;
            if (isArea) {
                const area = (pi * r * r) / 4;
                const ans = Math.round(area * 10) / 10;
                return {
                    renderData: {
                        geometry: { type: 'quarter_circle', radius: r, labels: { r: r } },
                        description: lang === 'sv' ? "Beräkna kvartscirkelns area." : "Calculate the quarter-circle's area.",
                        answerType: 'numeric', suffix: 'cm²'
                    },
                    token: this.toBase64(ans.toString()),
                    clues: [
                        { text: lang==='sv' ? "Det är en fjärdedel av en cirkel. Räkna ut hela arean och dela med 4." : "It's a quarter circle. Calculate full area and divide by 4.", latex: `(\\pi \\cdot ${r}^2) / 4` }
                    ],
                    metadata: { variation: 'area_quarter', difficulty: 3 }
                };
            } else {
                const circ = 2 * pi * r;
                const arc = circ / 4;
                const perim = arc + 2 * r;
                const ans = Math.round(perim * 10) / 10;
                return {
                    renderData: {
                        geometry: { type: 'quarter_circle', radius: r, labels: { r: r } },
                        description: lang === 'sv' ? "Beräkna kvartscirkelns omkrets." : "Calculate the quarter-circle's perimeter.",
                        answerType: 'numeric'
                    },
                    token: this.toBase64(ans.toString()),
                    clues: [
                        { text: lang==='sv' ? "Bågen är en fjärdedel av cirkelns omkrets." : "The arc is one fourth of the circle's circumference.", latex: `(2 \\cdot \\pi \\cdot ${r}) / 4` },
                        { text: lang==='sv' ? "Lägg till de två raka sidorna (radierna)." : "Add the two straight sides (radii).", latex: `+ ${r} + ${r}` }
                    ],
                    metadata: { variation: 'perimeter_quarter', difficulty: 3 }
                };
            }
        }
    }

    // --- LEVEL 6: COMPOSITE ADVANCED ---
    private level6_CompositeAdvanced(lang: string): any {
        const isHouse = MathUtils.randomInt(0, 1) === 1;
        const w = MathUtils.randomInt(4, 10) * 10; 
        const h = MathUtils.randomInt(4, 8) * 10;
        
        let ans = 0;
        let geom: any = {};
        let desc = "";
        let steps = [];

        if (isHouse) {
            const hRoof = MathUtils.randomInt(2, 5) * 10;
            const slope = Math.sqrt((w/2)**2 + hRoof**2);
            ans = Math.round((w + 2*h + 2*slope) * 10) / 10;
            desc = lang === 'sv' 
                ? `Beräkna husets omkrets (inklusive taket).` 
                : `Calculate the house's perimeter (including the roof).`;
            steps = [
                { text: lang==='sv' ? "Räkna ut takets sneda sida med Pythagoras sats (valfritt, här är längden given som ca X)." : "Calculate roof slope (length approx X).", latex: `s \\approx ${Math.round(slope*10)/10}` },
                { text: lang==='sv' ? "Addera botten, väggarna och taket." : "Add bottom, walls, and roof.", latex: `${w} + 2\\cdot${h} + 2\\cdot${Math.round(slope*10)/10}` }
            ];
            geom = { type: 'composite', subtype: 'house', labels: { w, h, h_roof: hRoof } };
        } else {
            const r = w / 2;
            const arc = 3.14 * r;
            ans = Math.round((w + 2*h + arc) * 10) / 10;
            desc = lang === 'sv' 
                ? `Beräkna portalens omkrets.` 
                : `Calculate the portal's perimeter.`;
            steps = [
                { text: lang==='sv' ? "Bågen är en halvcirkel. Räkna ut dess längd." : "The arch is a semicircle. Calculate its length.", latex: `\\pi \\cdot ${r}` },
                { text: lang==='sv' ? "Addera golvet och väggarna." : "Add the floor and walls.", latex: `+ ${w} + ${h} + ${h}` }
            ];
            geom = { type: 'composite', subtype: 'portal', labels: { w, h } };
        }

        return {
            renderData: { 
                geometry: geom, 
                description: desc, 
                answerType: 'numeric' 
            },
            token: this.toBase64(ans.toString()),
            clues: steps,
            metadata: { variation: isHouse ? 'perimeter_house' : 'perimeter_portal', difficulty: 4 }
        };
    }
}