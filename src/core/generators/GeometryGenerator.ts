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

    /**
     * Phase 2: Targeted Generation
     * Allows the Question Studio to request a specific skill bucket.
     */
    public generateByVariation(key: string, lang: string = 'sv'): any {
        switch (key) {
            case 'perimeter_square':
            case 'perimeter_rect':
            case 'perimeter_parallel':
            case 'perimeter_inverse':
            case 'perimeter_lie':
                return this.level1_PerimeterBasic(lang, key);
            
            case 'area_square':
            case 'area_rect':
            case 'area_parallel':
            case 'area_inverse':
            case 'area_trap':
                return this.level2_AreaBasic(lang, key);
            
            case 'area_triangle':
            case 'inverse_triangle':
            case 'perimeter_triangle_right':
            case 'perimeter_triangle_iso':
            case 'perimeter_triangle_scalene':
                return this.level3_Triangles(lang, key);
            
            case 'combined_rect_tri':
            case 'combined_l_shape':
            case 'combined_house':
                return this.level4_CombinedFigures(lang, key);
            
            case 'circle_area':
            case 'circle_perimeter':
            case 'semicircle_area':
            case 'semicircle_perimeter':
            case 'area_quarter':
            case 'perimeter_quarter':
                return this.level5_Circles(lang, key);
            
            case 'perimeter_house':
            case 'perimeter_portal':
            case 'area_house':
            case 'area_portal':
                return this.level6_CompositeAdvanced(lang, key);

            default:
                return this.generate(1, lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    // --- LEVEL 1: PERIMETER BASIC ---
    private level1_PerimeterBasic(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['perimeter_square', 'perimeter_rect', 'perimeter_parallel', 'perimeter_inverse', 'perimeter_lie']);
        
        if (v === 'perimeter_square') {
            const s = MathUtils.randomInt(3, 15);
            const ans = 4 * s;
            return {
                renderData: {
                    geometry: { type: 'square', width: s, height: s, labels: { b: s, h: s } },
                    description: lang === 'sv' ? `En kvadrat har en sida som är ${s} cm lång. Beräkna kvadratens omkrets.` : `A square has a side that is ${s} cm long. Calculate the perimeter of the square.`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang === 'sv' ? "Omkretsen är summan av figurens alla yttersidor. En kvadrat har fyra sidor som alla är lika långa." : "The perimeter is the sum of all the figure's outer sides. A square has four sides that are all the same length.", latex: `O = 4 \\cdot ${s}` },
                    { text: lang === 'sv' ? "Omkretsen blir:" : "The total perimeter is:", latex: `${ans}` }
                ],
                metadata: { variation_key: 'perimeter_square', difficulty: 1 }
            };
        }

        if (v === 'perimeter_rect') {
            const b = MathUtils.randomInt(5, 15), h = MathUtils.randomInt(3, 10);
            const ans = 2 * (b + h);
            return {
                renderData: {
                    geometry: { type: 'rectangle', width: b, height: h, labels: { b: b, h: h } },
                    description: lang === 'sv' ? `En rektangel har basen ${b} cm och höjden ${h} cm. Vad är rektangelns omkrets?` : `A rectangle has a base of ${b} cm and a height of ${h} cm. What is the perimeter of the rectangle?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang === 'sv' ? "Omkretsen är vägen runt hela figuren. En rektangel består av två baser och två höjder." : "Perimeter is the path around the entire figure. A rectangle consists of two bases and two heights.", latex: `O = ${b} + ${h} + ${b} + ${h}` },
                    { text: lang === 'sv' ? "Summan av alla sidor är:" : "The sum of all sides is:", latex: `${ans}` }
                ],
                metadata: { variation_key: 'perimeter_rect', difficulty: 1 }
            };
        }

        if (v === 'perimeter_inverse') {
            const w = MathUtils.randomInt(4, 10), h = MathUtils.randomInt(3, 8);
            const perim = 2 * (w + h);
            return {
                renderData: {
                    geometry: { type: 'rectangle', width: w, height: h, labels: { b: w, h: '?' } },
                    description: lang === 'sv' ? `En rektangel har omkretsen ${perim} cm. Vi vet att basen är ${w} cm. Hur lång är höjden?` : `A rectangle has a perimeter of ${perim} cm. We know the base is ${w} cm. What is the height?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(h.toString()),
                clues: [
                    { text: lang === 'sv' ? "Börja med att dra bort de två kända baserna från den totala omkretsen." : "Step 1: Subtract the two known bases from the total perimeter.", latex: `${perim} - (2 \\cdot ${w}) = ${perim - 2*w}` },
                    { text: lang === 'sv' ? "Dela det som är kvar med 2 för att få fram höjden på en av sidorna." : "Step 2: Divide what remains by 2 to find the height of one of the sides.", latex: `\\frac{${perim - 2*w}}{2} = ${h}` },
                    { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${h}` }
                ],
                metadata: { variation_key: 'perimeter_inverse', difficulty: 2 }
            };
        }

        if (v === 'perimeter_lie') {
            const s = MathUtils.randomInt(4, 10);
            const p = 4 * s;
            const sTrue1 = lang === 'sv' ? `Omkretsen är ${p} cm` : `The perimeter is ${p} cm`;
            const sTrue2 = lang === 'sv' ? `Sidan är ${s} cm` : `The side is ${s} cm`;
            const fakeP = p + MathUtils.randomChoice([-2, 2, 5]);
            const sFalse = lang === 'sv' ? `Omkretsen är ${fakeP} cm` : `The perimeter is ${fakeP} cm`;
            return {
                renderData: {
                    geometry: { type: 'square', width: s, height: s, labels: { b: s, h: s } },
                    description: lang === 'sv' ? "Titta på kvadraten nedan. Vilket av påståendena är FALSKT?" : "Look at the square below. Which of the statements is FALSE?",
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([sTrue1, sTrue2, sFalse])
                },
                token: this.toBase64(sFalse),
                clues: [
                    { text: lang === 'sv' ? `Beräkna kvadratens omkrets genom att multiplicera sidan (${s}) med 4.` : `Calculate the square's perimeter by multiplying the side (${s}) by 4.`, latex: `4 \\cdot ${s} = ${p}` },
                    { text: lang === 'sv' ? "Den felaktiga uträkningen i listan är:" : "The incorrect calculation in the list is:", latex: `\\text{${sFalse}}` }
                ],
                metadata: { variation_key: 'perimeter_lie', difficulty: 1 }
            };
        }

        const b = MathUtils.randomInt(6, 12), s = MathUtils.randomInt(4, 9);
        const ans = 2 * (b + s);
        return {
            renderData: {
                geometry: { type: 'parallelogram', width: b, height: s-1, labels: { b: b, s: s } },
                description: lang === 'sv' ? `En parallellogram har sidorna ${b} cm och ${s} cm. Beräkna omkretsen.` : `A parallelogram has sides of ${b} cm and ${s} cm. Calculate its perimeter.`,
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()),
            clues: [
                { text: lang === 'sv' ? "Precis som en rektangel har en parallellogram två par av lika långa sidor. Addera alla sidor." : "Just like a rectangle, a parallelogram has two pairs of equal sides. Add all the sides together.", latex: `O = 2 \\cdot (${b} + ${s})` },
                { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${ans}` }
            ],
            metadata: { variation_key: 'perimeter_parallel', difficulty: 1 }
        };
    }

    // --- LEVEL 2: AREA BASIC ---
    private level2_AreaBasic(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['area_square', 'area_rect', 'area_parallel', 'area_inverse', 'area_trap']);

        if (v === 'area_square') {
            const s = MathUtils.randomInt(3, 12);
            const ans = s * s;
            return {
                renderData: {
                    geometry: { type: 'square', width: s, height: s, labels: { b: s, h: s } },
                    description: lang === 'sv' ? `En kvadrat har sidan ${s} cm. Beräkna kvadratens area.` : `A square has a side of ${s} cm. Calculate the area of the square.`,
                    answerType: 'numeric', suffix: 'cm²'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang === 'sv' ? "Arean för en kvadrat beräknas genom att multiplicera sidan med sig själv." : "The area of a square is calculated by multiplying the side by itself.", latex: `A = ${s} \\cdot ${s}` },
                    { text: lang === 'sv' ? "Arean blir:" : "The area becomes:", latex: `${ans}` }
                ],
                metadata: { variation_key: 'area_square', difficulty: 1 }
            };
        }

        if (v === 'area_inverse') {
            const b = MathUtils.randomInt(4, 10), h = MathUtils.randomInt(3, 8);
            const area = b * h;
            return {
                renderData: {
                    geometry: { type: 'rectangle', width: b, height: h, labels: { b: b, h: '?' } },
                    description: lang === 'sv' ? `Rektangelns area är ${area} cm². Vi vet att basen är ${b} cm. Vad är rektangelns höjd?` : `The area of the rectangle is ${area} cm². We know the base is ${b} cm. What is the height?`,
                    answerType: 'numeric', suffix: 'cm'
                },
                token: this.toBase64(h.toString()),
                clues: [
                    { text: lang === 'sv' ? "Formeln för area är Bas • Höjd. För att hitta höjden delar vi arean med basen." : "The formula for area is Base • Height. To find the height, we divide the area by the base.", latex: `h = \\frac{${area}}{${b}}` },
                    { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${h}` }
                ],
                metadata: { variation_key: 'area_inverse', difficulty: 2 }
            };
        }

        if (v === 'area_trap') {
            const b = MathUtils.randomInt(5, 12), h = MathUtils.randomInt(4, 9), s = h + 2;
            const ans = b * h;
            return {
                renderData: {
                    geometry: { type: 'parallelogram', width: b, height: h, labels: { b: b, h: h, s: s } },
                    description: lang === 'sv' ? "Beräkna parallellogrammens area." : "Calculate the area of the parallelogram.",
                    answerType: 'numeric', suffix: 'cm²'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang === 'sv' ? "Vid beräkning av area för en parallellogram använder du alltid den vinkelräta höjden, inte den sneda sidan." : "When calculating the area of a parallelogram, you always use the perpendicular height, not the slanted side.", latex: `A = ${b} \\cdot ${h}` },
                    { text: lang === 'sv' ? "Arean är:" : "The area is:", latex: `${ans}` }
                ],
                metadata: { variation_key: 'area_trap', difficulty: 2 }
            };
        }

        const b = MathUtils.randomInt(5, 12), h = MathUtils.randomInt(3, 9);
        const ans = b * h;
        const type = v === 'area_rect' ? 'rectangle' : 'parallelogram';
        return {
            renderData: {
                geometry: { type: type, width: b, height: h, labels: { b: b, h: h } },
                description: lang === 'sv' ? `Beräkna arean av figuren nedan.` : `Calculate the area of the figure below.`,
                answerType: 'numeric', suffix: 'cm²'
            },
            token: this.toBase64(ans.toString()),
            clues: [
                { text: lang === 'sv' ? "Arean beräknas genom att multiplicera basen med den vinkelräta höjden." : "The area is calculated by multiplying the base by the perpendicular height.", latex: `A = ${b} \\cdot ${h}` },
                { text: lang === 'sv' ? "Svaret blir:" : "The answer is:", latex: `${ans}` }
            ],
            metadata: { variation_key: v, difficulty: 1 }
        };
    }

    // --- LEVEL 3: TRIANGLES ---
    private level3_Triangles(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['area_triangle', 'inverse_triangle', 'perimeter_triangle_right', 'perimeter_triangle_iso', 'perimeter_triangle_scalene']);

        if (v === 'area_triangle') {
            const b = MathUtils.randomInt(4, 12), h = MathUtils.randomInt(3, 10);
            const ans = (b * h) / 2;
            return {
                renderData: {
                    geometry: { type: 'triangle', width: b, height: h, labels: { b: b, h: h } },
                    description: lang === 'sv' ? `En triangel har basen ${b} cm och höjden ${h} cm. Beräkna triangelns area.` : `A triangle has a base of ${b} cm and a height of ${h} cm. Calculate the area of the triangle.`,
                    answerType: 'numeric', suffix: 'cm²'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang === 'sv' ? "En triangel motsvarar halva ytan av en rektangel med samma bas och höjd." : "A triangle corresponds to half the area of a rectangle with the same base and height.", latex: `A = \\frac{${b} \\cdot ${h}}{2}` },
                    { text: lang === 'sv' ? "Arean blir därför:" : "The area is therefore:", latex: `${ans}` }
                ],
                metadata: { variation_key: 'area_triangle', difficulty: 2 }
            };
        }

        if (v === 'inverse_triangle') {
            const h = MathUtils.randomInt(4, 10), b = MathUtils.randomInt(4, 10);
            const area = (b * h) / 2;
            return {
                renderData: {
                    geometry: { type: 'triangle', width: b, height: h, labels: { b: b, h: '?' } },
                    description: lang === 'sv' ? `Triangelns area är ${area} cm². Vi vet att basen är ${b} cm. Vad är höjden?` : `The triangle's area is ${area} cm². We know the base is ${b} cm. What is the height?`,
                    answerType: 'numeric', suffix: 'cm'
                },
                token: this.toBase64(h.toString()),
                clues: [
                    { text: lang === 'sv' ? "Eftersom arean är hälften av basen gånger höjden, börjar vi med att dubbla arean." : "Since the area is half of the base times the height, we start by doubling the area.", latex: `2 \\cdot ${area} = ${b} \\cdot h` },
                    { text: lang === 'sv' ? "Dela nu det resultatet med basen för att få höjden." : "Now divide that result by the base to find the height.", latex: `h = \\frac{${area * 2}}{${b}}` },
                    { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${h}` }
                ],
                metadata: { variation_key: 'inverse_triangle', difficulty: 3 }
            };
        }

        // Perimeter Variations - Randomizing values for Right, Iso, Scalene
        const type = v.replace('perimeter_triangle_', '');
        let b = 0, h = 0, s1 = 0, s2 = 0;
        
        if (type === 'right') { 
            // Use Pythagorean triples (3,4,5), (5,12,13), (8,15,17)
            const triple = MathUtils.randomChoice([[3,4,5], [6,8,10], [5,12,13]]);
            b = triple[0]; s1 = triple[1]; s2 = triple[2]; h = s1;
        } else if (type === 'iso') { 
            s1 = MathUtils.randomInt(5, 12); s2 = s1; b = MathUtils.randomInt(4, s1 + s2 - 2); 
        } else { 
            b = MathUtils.randomInt(6, 10); s1 = MathUtils.randomInt(4, 8); s2 = MathUtils.randomInt(5, 9);
        }

        const ans = b + s1 + s2;

        return {
            renderData: {
                geometry: { 
                    type: 'triangle', 
                    subtype: type === 'right' ? 'right' : undefined, 
                    width: b, 
                    height: 8, // visual scaling
                    labels: { b: b, s1: s1, s2: s2 } 
                },
                description: lang === 'sv' ? "Beräkna triangelns omkrets genom att addera alla sidor." : "Calculate the triangle's perimeter by adding all sides.",
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()),
            clues: [
                { text: lang === 'sv' ? "Omkretsen är den totala längden runt figurens ytterkant. Addera de tre sidorna." : "The perimeter is the total length around the outer edge of the figure. Add the three sides.", latex: `O = ${b} + ${s1} + ${s2}` },
                { text: lang === 'sv' ? "Svaret blir:" : "The answer is:", latex: `${ans}` }
            ],
            metadata: { variation_key: v, difficulty: 2 }
        };
    }

    // --- LEVEL 4: COMBINED FIGURES ---
    private level4_CombinedFigures(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['combined_rect_tri', 'combined_l_shape', 'combined_house']);

        if (v === 'combined_rect_tri') {
            const rw = MathUtils.randomInt(5, 10), rh = MathUtils.randomInt(4, 6), tb = MathUtils.randomInt(3, 5);
            const ans = (rw * rh + (tb * rh) / 2);
            return {
                renderData: {
                    geometry: { type: 'composite', subtype: 'rect_right_tri', labels: { w: rw, h: rh, tri_b: tb } },
                    description: lang === 'sv' ? "Figuren består av en rektangel och en triangel. Beräkna arean till figuren." : "The figure consists of a rectangle and a triangle. Calculate the total area.",
                    answerType: 'numeric', suffix: 'cm²'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang === 'sv' ? "Dela upp figuren i två kända former: en rektangel och en triangel." : "Split the figure into two known shapes: a rectangle and a triangle.", latex: "" },
                    { text: lang === 'sv' ? `Rektangel: ${rw} • ${rh}. Triangel: (${tb} • ${rh}) / 2.` : `Rectangle area: ${rw} • ${rh}. Triangle area: (${tb} • ${rh}) / 2.`, latex: `(${rw} \\cdot ${rh}) + \\frac{${tb} \\cdot ${rh}}{2} = ${ans}` },
                    { text: lang === 'sv' ? "Totalarean är:" : "The total area is:", latex: `${ans}` }
                ],
                metadata: { variation_key: 'combined_rect_tri', difficulty: 3 }
            };
        }

        if (v === 'combined_l_shape') {
            const vW = MathUtils.randomInt(2, 4), vH = MathUtils.randomInt(6, 9), hW = MathUtils.randomInt(4, 6), hH = MathUtils.randomInt(2, 4);
            const ans = vW * vH + hW * hH;
            return {
                renderData: {
                    geometry: { type: 'composite', subtype: 'l_shape', labels: { vW, vH, hW, hH, totalW: vW + hW } },
                    description: lang === 'sv' ? "Beräkna arean av den L-formade figuren genom att dela upp den i två rektanglar." : "Calculate the area of the L-shaped figure by splitting it into two rectangles.",
                    answerType: 'numeric', suffix: 'cm²'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang === 'sv' ? "Du kan dela figuren antingen vertikalt eller horisontellt för att få två rektanglar." : "You can split the figure either vertically or horizontally to get two rectangles.", latex: `(${vW} \\cdot ${vH}) + (${hW} \\cdot ${hH})` },
                    { text: lang === 'sv' ? "Slutsvaret blir:" : "The final answer is:", latex: `${ans}` }
                ],
                metadata: { variation_key: 'combined_l_shape', difficulty: 3 }
            };
        }

        const s = MathUtils.randomInt(5, 8), ht = MathUtils.randomInt(3, 5);
        const ans = s * s + (s * ht) / 2;
        return {
            renderData: {
                geometry: { type: 'composite', subtype: 'house_area', labels: { s: s, h_tri: ht } },
                description: lang === 'sv' ? "Figuren består av en kvadrat och en triangel. Vad är arean till figuren?" : "The figure consists of a square and a triangle. What is the total area?",
                answerType: 'numeric', suffix: 'cm²'
            },
            token: this.toBase64(ans.toString()),
            clues: [
                { text: lang === 'sv' ? "Beräkna kvadratens yta först och lägg sedan till triangelns yta." : "Calculate the square's surface first and then add the triangle's surface.", latex: `(${s} \\cdot ${s}) + \\frac{${s} \\cdot ${ht}}{2}` },
                { text: lang === 'sv' ? "Resultatet är:" : "The result is:", latex: `${ans}` }
            ],
            metadata: { variation_key: 'combined_house', difficulty: 3 }
        };
    }

    // --- LEVEL 5: CIRCLES ---
    private level5_Circles(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['circle_area', 'circle_perimeter', 'semicircle_area', 'semicircle_perimeter', 'area_quarter', 'perimeter_quarter']);
        const r = MathUtils.randomInt(4, 10);
        const pi = 3.14;

        if (v === 'circle_area' || v === 'circle_perimeter') {
            const isArea = v === 'circle_area';
            const ansVal = isArea ? pi * r * r : 2 * pi * r;
            const ans = (Math.round(ansVal * 100) / 100).toString();
            return {
                renderData: {
                    geometry: { type: 'circle', radius: r, labels: isArea ? { r: r } : { diameter: 2 * r }, show: isArea ? 'radius' : 'diameter' },
                    description: lang === 'sv' ? (isArea ? `Beräkna cirkelns area ($\pi \approx 3,14$).` : `Beräkna cirkelns omkrets ($\pi \approx 3,14$).`) : (isArea ? `Calculate the area of the circle ($\pi \approx 3.14$).` : `Calculate the perimeter of the circle ($\pi \approx 3.14$).`),
                    answerType: 'numeric'
                },
                token: this.toBase64(ans),
                clues: [
                    { text: isArea ? (lang === 'sv' ? "Formeln för cirkelns area är pi gånger radien i kvadrat." : "The formula for the area of a circle is pi times the radius squared.") : (lang === 'sv' ? "Formeln för cirkelns omkrets är pi gånger diametern." : "The formula for the perimeter of a circle is pi times the diameter."), latex: isArea ? `A = 3,14 \\cdot ${r}^2` : `O = 3,14 \\cdot ${2 * r}` },
                    { text: lang === 'sv' ? "Svaret blir:" : "The answer is:", latex: `${ans}` }
                ],
                metadata: { variation_key: v, difficulty: 2 }
            };
        }

        if (v === 'semicircle_area' || v === 'semicircle_perimeter') {
            const isArea = v === 'semicircle_area';
            const ansVal = isArea ? (pi * r * r) / 2 : (pi * 2 * r) / 2 + (2 * r);
            const ans = (Math.round(ansVal * 100) / 100).toString();
            return {
                renderData: {
                    geometry: { type: 'semicircle', radius: r, labels: { r: r, diameter: 2*r }, show: isArea ? 'radius' : 'diameter' },
                    description: lang === 'sv' ? (isArea ? "Beräkna arean av halvcirkeln." : "Beräkna omkretsen runt hela halvcirkeln (bågen + basen).") : (isArea ? "Calculate the area of the semicircle." : "Calculate the perimeter around the whole semicircle (arc + base)."),
                    answerType: 'numeric'
                },
                token: this.toBase64(ans),
                clues: [
                    { text: isArea ? (lang === 'sv' ? "Räkna ut en hel cirkels area och dela den sedan med 2." : "Calculate a full circle's area and then divide it by 2.") : (lang === 'sv' ? "Beräkna halva omkretsen för bågen och lägg till den raka diametern." : "Calculate half the circumference for the arc and add the straight diameter."), latex: isArea ? `\\frac{3,14 \\cdot ${r}^2}{2}` : `\\frac{3,14 \\cdot ${2 * r}}{2} + ${2 * r}` },
                    { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${ans}` }
                ],
                metadata: { variation_key: v, difficulty: 3 }
            };
        }

        const isArea = v === 'area_quarter';
        const ansVal = isArea ? (pi * r * r) / 4 : (pi * 2 * r) / 4 + (2 * r);
        const ans = (Math.round(ansVal * 100) / 100).toString();
        return {
            renderData: {
                geometry: { type: 'quarter_circle', radius: r, labels: { r: r } },
                description: lang === 'sv' ? (isArea ? "Beräkna arean av kvartscirkeln." : "Beräkna kvartscirkelns omkrets (bågen + de två radierna).") : (isArea ? "Calculate the area of the quarter circle." : "Calculate the quarter circle's perimeter (arc + the two radii)."),
                answerType: 'numeric'
            },
            token: this.toBase64(ans),
            clues: [
                { text: isArea ? (lang === 'sv' ? "Räkna ut arean för en hel cirkel och dela med 4." : "Calculate the area for a full circle and divide by 4.") : (lang === 'sv' ? "Beräkna en fjärdedel av omkretsen för bågen och lägg till de två raka radierna." : "Calculate one-fourth of the circumference for the arc and add the two straight radii."), latex: isArea ? `\\frac{3,14 \\cdot ${r}^2}{4}` : `\\frac{2 \\cdot 3,14 \\cdot ${r}}{4} + ${r} + ${r}` },
                { text: lang === 'sv' ? "Svaret blir:" : "The answer is:", latex: `${ans}` }
            ],
            metadata: { variation_key: v, difficulty: 3 }
        };
    }

    // --- LEVEL 6: COMPOSITE ADVANCED ---
    private level6_CompositeAdvanced(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['perimeter_house', 'perimeter_portal', 'area_house', 'area_portal']);
        const w = MathUtils.randomInt(40, 70), h = MathUtils.randomInt(30, 50);

        if (v === 'area_house') {
            const hr = MathUtils.randomInt(20, 40); 
            const areaSquare = w * h;
            const areaRoof = (w * hr) / 2;
            const total = areaSquare + areaRoof;
            
            return {
                renderData: {
                    geometry: { type: 'composite', subtype: 'house', labels: { w, h, h_roof: hr } },
                    description: lang === 'sv' ? "Beräkna husets area (inklusiv taket)." : "Calculate the total area of the house (square + roof).",
                    answerType: 'numeric', suffix: 'cm²' 
                },
                token: this.toBase64(total.toString()),
                clues: [
                    { text: lang === 'sv' ? "Dela upp figuren i en rektangel och en triangel." : "Split the figure into a rectangle and a triangle.", latex: "" },
                    { text: lang === 'sv' ? `Rektangel: ${w} • ${h}. Tak (triangel): (${w} • ${hr}) / 2.` : `Rectangle: ${w} • ${h}. Roof (triangle): (${w} • ${hr}) / 2.`, latex: `${areaSquare} + ${areaRoof} = ${total}` },
                    { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${total}` }
                ],
                metadata: { variation_key: 'area_house', difficulty: 4 }
            };
        }

        if (v === 'area_portal') {
            const r = w / 2;
            const areaRect = w * h;
            const areaSemi = (3.14 * r * r) / 2;
            const total = Math.round((areaRect + areaSemi) * 10) / 10;

            return {
                renderData: {
                    geometry: { type: 'composite', subtype: 'portal', labels: { w, h } },
                    description: lang === 'sv' ? "Beräkna area till figuren." : "Calculate the total area of the portal (rectangle + semicircle).",
                    answerType: 'numeric', suffix: 'cm²'
                },
                token: this.toBase64(total.toString()),
                clues: [
                    { text: lang === 'sv' ? "Beräkna rektangelns area och halvcirkelns area var för sig." : "Calculate the rectangle's area and the semicircle's area separately.", latex: "" },
                    { text: lang === 'sv' ? `Rektangel: ${w} • ${h}. Halvcirkel: (3,14 • ${r}²) / 2.` : `Rectangle: ${w} • ${h}. Semicircle: (3.14 • ${r}²) / 2.`, latex: `${areaRect} + ${Math.round(areaSemi * 10) / 10} = ${total}` },
                    { text: lang === 'sv' ? "Totalarean blir:" : "The total area is:", latex: `${total}` }
                ],
                metadata: { variation_key: 'area_portal', difficulty: 4 }
            };
        }

        if (v === 'perimeter_house') {
            const hr = MathUtils.randomInt(20, 35);
            const slope = Math.sqrt((w/2)**2 + hr**2);
            const ans = Math.round((w + 2*h + 2*slope) * 10) / 10;
            return {
                renderData: {
                    geometry: { type: 'composite', subtype: 'house', labels: { w, h, h_roof: hr } },
                    description: lang === 'sv' ? "Beräkna omkretsen runt husets ytterkant (inklusive taket)." : "Calculate the total perimeter around the outer edge of the house (including the roof).",
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang === 'sv' ? `Identifiera alla ytterväggar. Botten (${w}) och två sidoväggar (${h} var).` : `Identify all outer walls. The bottom (${w}) and two side walls (${h} each).`, latex: "" },
                    { text: lang === 'sv' ? `Använd Pythagoras för att räkna ut takets sneda sidor (ca ${Math.round(slope*10)/10} var). Addera sedan allt.` : `Use Pythagoras to calculate the slanted sides of the roof (approx ${Math.round(slope*10)/10} each). Then add everything.`, latex: `${w} + ${h} + ${h} + ${Math.round(slope*10)/10} + ${Math.round(slope*10)/10}` },
                    { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${ans}` }
                ],
                metadata: { variation_key: 'perimeter_house', difficulty: 4 }
            };
        }

        const r = w / 2;
        const arc = 3.14 * r;
        const ans = Math.round((w + 2*h + arc) * 10) / 10;
        return {
            renderData: {
                geometry: { type: 'composite', subtype: 'portal', labels: { w, h } },
                description: lang === 'sv' ? "Beräkna omkretsen runt hela portalen." : "Calculate the perimeter around the whole portal.",
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()),
            clues: [
                { text: lang === 'sv' ? "Bågen är en halvcirkel. Räkna ut dess längd (pi • diametern / 2)." : "The arch is a semicircle. Calculate its length (pi • diameter / 2).", latex: `\\frac{3,14 \\cdot ${w}}{2} = ${Math.round(arc*10)/10}` },
                { text: lang === 'sv' ? "Lägg sedan till de raka sidorna: botten och de två vertikala väggarna." : "Then add the straight sides: the bottom and the two vertical walls.", latex: `${Math.round(arc*10)/10} + ${w} + ${h} + ${h} = ${ans}` },
                { text: lang === 'sv' ? "Slutresultatet är:" : "The final result is:", latex: `${ans}` }
            ],
            metadata: { variation_key: 'perimeter_portal', difficulty: 4 }
        };
    }
}