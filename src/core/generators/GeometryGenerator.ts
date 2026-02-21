import { MathUtils } from '../utils/MathUtils.js';

export class GeometryGenerator {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        // Adaptive Level Jump: If Level 1 concepts are mastered, push to Level 2
        if (level === 1 && options.hideConcept) {
            return this.level2_AreaBasic(lang, undefined, options);
        }

        switch (level) {
            case 1: return this.level1_PerimeterBasic(lang, undefined, options);
            case 2: return this.level2_AreaBasic(lang, undefined, options);
            case 3: return this.level3_Triangles(lang, undefined, options);
            case 4: return this.level4_CombinedFigures(lang, undefined, options);
            case 5: return this.level5_Circles(lang, undefined, options);
            case 6: return this.level6_CompositeAdvanced(lang, undefined, options);
            default: return this.level1_PerimeterBasic(lang, undefined, options);
        }
    }

    /**
     * Targeted Generation for Question Studio
     * Must match skillBuckets.js exactly to maintain studio/visual communication.
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

    // --- LEVEL 1: PERIMETER BASIC ---
    private level1_PerimeterBasic(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'perimeter_square', type: 'calculate' },
            { key: 'perimeter_rect', type: 'calculate' },
            { key: 'perimeter_parallel', type: 'calculate' },
            { key: 'perimeter_inverse', type: 'calculate' },
            { key: 'perimeter_lie', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'perimeter_square') {
            const s = MathUtils.randomInt(4, 15);
            const ans = 4 * s;
            return {
                renderData: {
                    geometry: { type: 'square', width: s, height: s, labels: { b: s, h: s } },
                    description: lang === 'sv' ? "Beräkna kvadratens omkrets." : "Calculate the perimeter of the square.",
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Omkretsen är den totala sträckan runt en figurs alla sidor." : "Perimeter is the total distance around all sides of a figure." },
                    { text: lang === 'sv' ? "En kvadrat har fyra sidor som alla är lika långa." : "A square has four sides that are all the same length." },
                    { text: lang === 'sv' ? `Eftersom sidan är ${s} cm, multiplicerar vi längden med 4.` : `Since the side is ${s} cm, we multiply the length by 4.`, latex: `4 · ${s}` },
                    { text: lang === 'sv' ? `Uträkning: ${s} + ${s} + ${s} + ${s} = ${ans}` : `Calculation: ${s} + ${s} + ${s} + ${s} = ${ans}` },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
                ]
            };
        }

        if (v === 'perimeter_inverse') {
            const b = MathUtils.randomInt(6, 15), h = MathUtils.randomInt(3, 8);
            const p = 2 * (b + h);
            return {
                renderData: {
                    geometry: { type: 'rectangle', width: b, height: h, labels: { b, h: '?' } },
                    description: lang === 'sv' ? `En rektangel har omkretsen ${p} cm. Basen är ${b} cm. Hur lång är höjden?` : `A rectangle has a perimeter of ${p} cm. The base is ${b} cm. What is the height?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(h.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "En rektangel har två baser och två höjder." : "A rectangle has two bases and two heights." },
                    { text: lang === 'sv' ? "Börja med att dra bort de två kända baserna från den totala omkretsen." : "Start by subtracting the two known bases from the total perimeter.", latex: `2 · ${b} = ${2 * b}` },
                    { text: lang === 'sv' ? `Subtrahera: ${p} - ${2 * b} = ${p - 2 * b}` : `Subtract: ${p} - ${2 * b} = ${p - 2 * b}` },
                    { text: lang === 'sv' ? "Det som är kvar motsvarar de två höjderna tillsammans." : "What remains corresponds to the two heights combined." },
                    { text: lang === 'sv' ? "Dela det resultatet med 2 för att hitta längden på en höjd." : "Divide that result by 2 to find the length of one height.", latex: `\\frac{${p - 2 * b}}{2} = ${h}` },
                    { text: lang === 'sv' ? `Svar: ${h}` : `Answer: ${h}` }
                ]
            };
        }

        // Default: Rectangle/Parallelogram Perimeter
        const b = MathUtils.randomInt(6, 12), h = MathUtils.randomInt(3, 8);
        const isParallel = v === 'perimeter_parallel';
        const ans = 2 * (b + h);
        return {
            renderData: {
                geometry: { type: isParallel ? 'parallelogram' : 'rectangle', width: b, height: h, labels: { b, h } },
                description: lang === 'sv' ? "Beräkna omkretsen." : "Calculate the perimeter.",
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Omkretsen beräknas genom att addera alla ytterkanter." : "Perimeter is calculated by adding all outer edges." },
                { text: lang === 'sv' ? "Figuren har två baser och två sidor." : "The figure has two bases and two sides." },
                { text: lang === 'sv' ? `Summera: ${b} + ${h} + ${b} + ${h}` : `Sum: ${b} + ${h} + ${b} + ${h}`, latex: `2 · (${b} + ${h})` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ]
        };
    }

    // --- LEVEL 2: AREA BASIC ---
    private level2_AreaBasic(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'area_square', type: 'calculate' },
            { key: 'area_rect', type: 'calculate' },
            { key: 'area_trap', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const b = MathUtils.randomInt(5, 12), h = MathUtils.randomInt(3, 8);

        return {
            renderData: {
                geometry: { type: v === 'area_trap' ? 'parallelogram' : 'rectangle', width: b, height: h, labels: { b, h } },
                description: lang === 'sv' ? "Beräkna figurens area (avrunda till en decimal)." : "Calculate the area of the figure.",
                answerType: 'numeric'
            },
            token: this.toBase64((b * h).toString()), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Arean är storleken på ytan inuti en figur." : "Area is the size of the surface inside a figure." },
                { text: lang === 'sv' ? "För en fyrhörning beräknas arean genom att multiplicera basen med den vinkelräta höjden." : "For a quadrilateral, area is calculated by multiplying the base by the perpendicular height.", latex: "A = b · h" },
                { text: lang === 'sv' ? `Multiplicera: ${b} · ${h}` : `Multiply: ${b} · ${h}`, latex: `${b} · ${h} \\rightarrow ${b * h}` },
                { text: lang === 'sv' ? `Svar: ${b * h}` : `Answer: ${b * h}` }
            ]
        };
    }

    // --- LEVEL 3: TRIANGLES ---
    private level3_Triangles(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'area_triangle', type: 'calculate' },
            { key: 'perimeter_triangle_right', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'perimeter_triangle_right') {
            // Randomize sides using Pythagorean Triple Logic (non-hardcoded)
            const m = MathUtils.randomInt(2, 5), n = 1;
            const a = m*m - n*n, b = 2*m*n, c = m*m + n*n;
            const ans = a + b + c;
            return {
                renderData: {
                    geometry: { type: 'triangle', subtype: 'right', width: a, height: b, labels: { b: a, h: b, hyp: c } },
                    description: lang === 'sv' ? "Beräkna triangelns omkrets." : "Calculate the perimeter of the triangle.",
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Omkretsen är den sammanlagda längden av triangelns tre sidor." : "Perimeter is the combined length of the triangle's three sides." },
                    { text: lang === 'sv' ? "Identifiera de tre sidorna: basen, höjden och hypotenusan." : "Identify the three sides: base, height, and hypotenuse." },
                    { text: lang === 'sv' ? `Addera sidorna: ${a} + ${b} + ${c}` : `Add the sides: ${a} + ${b} + ${c}`, latex: `${a} + ${b} + ${c} \\rightarrow ${ans}` },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
                ]
            };
        }

        const base = MathUtils.randomInt(6, 12), height = MathUtils.randomInt(4, 10);
        const area = (base * height) / 2;
        return {
            renderData: {
                geometry: { type: 'triangle', width: base, height: height, labels: { b: base, h: height } },
                description: lang === 'sv' ? "Beräkna triangelns area." : "Calculate the area of the triangle.",
                answerType: 'numeric'
            },
            token: this.toBase64(area.toString()), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Arean av en triangel är alltid hälften av en rektangel med samma bas och höjd." : "The area of a triangle is always half of a rectangle with the same base and height.", latex: "A = \\frac{b · h}{2}" },
                { text: lang === 'sv' ? "Steg 1: Multiplicera basen med höjden." : "Step 1: Multiply the base by the height.", latex: `${base} · ${height} = ${base * height}` },
                { text: lang === 'sv' ? "Steg 2: Dela resultatet med 2." : "Step 2: Divide the result by 2.", latex: `\\frac{${base * height}}{2} = ${area}` },
                { text: lang === 'sv' ? `Svar: ${area}` : `Answer: ${area}` }
            ]
        };
    }

    // --- LEVEL 4: COMBINED FIGURES ---
    private level4_CombinedFigures(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'combined_l_shape', type: 'calculate' },
            { key: 'combined_rect_tri', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'combined_l_shape') {
            const vW = MathUtils.randomInt(3, 5), vH = MathUtils.randomInt(8, 12);
            const hW = MathUtils.randomInt(4, 7), hH = MathUtils.randomInt(3, 5);
            const totalW = vW + hW; // Critical visual parameter
            const area1 = vW * vH;
            const area2 = hW * hH;
            const ans = area1 + area2;

            return {
                renderData: {
                    geometry: { type: 'composite', subtype: 'l_shape', labels: { vW, vH, hW, hH, totalW } },
                    description: lang === 'sv' ? "Beräkna arean av den sammansatta figuren." : "Calculate the area of the composite figure.",
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Sammansatta figurer kan delas upp i mindre rektanglar." : "Composite figures can be divided into smaller rectangles." },
                    { text: lang === 'sv' ? "Steg 1: Dela figuren i två delar. Beräkna arean för den vertikala rektangeln." : "Step 1: Divide the figure into two parts. Calculate the area for the vertical rectangle.", latex: `${vW} · ${vH} = ${area1}` },
                    { text: lang === 'sv' ? "Steg 2: Beräkna arean för den horisontella rektangeln." : "Step 2: Calculate the area for the horizontal rectangle.", latex: `${hW} · ${hH} = ${area2}` },
                    { text: lang === 'sv' ? "Steg 3: Addera de två delarna för att få hela figurens yta." : "Step 3: Add the two parts to get the total area of the figure.", latex: `${area1} + ${area2} = ${ans}` },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
                ]
            };
        }

        const rw = MathUtils.randomInt(6, 12), rh = MathUtils.randomInt(4, 8), tb = MathUtils.randomInt(3, 6);
        const rectA = rw * rh;
        const triA = (tb * rh) / 2;
        const ans = rectA + triA;
        return {
            renderData: {
                geometry: { type: 'composite', subtype: 'rect_right_tri', labels: { w: rw, h: rh, tri_b: tb } },
                description: lang === 'sv' ? "Figuren består av en rektangel och en triangel. Vad är totalarean?" : "The figure consists of a rectangle and a triangle. What is the total area?",
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Dela upp uppgiften genom att räkna ut varje form för sig." : "Split the task by calculating each shape separately." },
                { text: lang === 'sv' ? "Steg 1: Beräkna rektangelns area (bas · höjd)." : "Step 1: Calculate the area of the rectangle (base · height).", latex: `${rw} · ${rh} = ${rectA}` },
                { text: lang === 'sv' ? "Steg 2: Beräkna triangelns area (bas · höjd / 2)." : "Step 2: Calculate the area of the triangle (base · height / 2).", latex: `\\frac{${tb} · ${rh}}{2} = ${triA}` },
                { text: lang === 'sv' ? "Steg 3: Summera ytorna." : "Step 3: Sum the areas.", latex: `${rectA} + ${triA} = ${ans}` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ]
        };
    }

    // --- LEVEL 5: CIRCLES ---
    private level5_Circles(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'circle_area', type: 'calculate' },
            { key: 'semicircle_area', type: 'calculate' },
            { key: 'semicircle_perimeter', type: 'calculate' },
            { key: 'perimeter_quarter', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const r = MathUtils.randomInt(5, 12);
        const pi = 3.14;

        if (v === 'semicircle_area') {
            const fullArea = pi * r * r;
            const ans = Math.round((fullArea / 2) * 100) / 100;
            return {
                renderData: {
                    geometry: { type: 'semicircle', radius: r, labels: { r }, show: 'radius' },
                    description: lang === 'sv' ? "Beräkna halvcirkelns area." : "Calculate the area of the semicircle.",
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "En halvcirkel är hälften av en hel cirkel." : "A semicircle is half of a full circle." },
                    { text: lang === 'sv' ? "Steg 1: Räkna ut arean för en hel cirkel med radien " + r + " cm." : "Step 1: Calculate the area of a full circle with radius " + r + " cm.", latex: `3,14 · ${r}^2 = ${fullArea}` },
                    { text: lang === 'sv' ? "Steg 2: Dela hela cirkelns area med 2 för att få halvcirkeln." : "Step 2: Divide the full circle's area by 2 to get the semicircle.", latex: `\\frac{${fullArea}}{2} = ${ans}` },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
                ]
            };
        }

        if (v === 'semicircle_perimeter') {
            const diameter = 2 * r;
            const arc = (pi * diameter) / 2;
            const ans = Math.round((arc + diameter) * 100) / 100;
            return {
                renderData: {
                    geometry: { type: 'semicircle', radius: r, labels: { diameter }, show: 'diameter' },
                    description: lang === 'sv' ? "Beräkna halvcirkelns omkrets." : "Calculate the perimeter of the semicircle.",
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Omkretsen runt en halvcirkel består av två delar: den runda bågen och den raka diametern." : "The perimeter around a semicircle consists of two parts: the curved arc and the straight diameter." },
                    { text: lang === 'sv' ? "Steg 1: Beräkna halva omkretsen av en hel cirkel (bågen)." : "Step 1: Calculate half the circumference of a full circle (the arc).", latex: `\\frac{3,14 · ${diameter}}{2} = ${arc}` },
                    { text: lang === 'sv' ? "Steg 2: För att stänga figuren måste vi lägga till den raka diametern." : "Step 2: To close the figure, we must add the straight diameter.", latex: `${arc} + ${diameter} = ${ans}` },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
                ]
            };
        }

        if (v === 'perimeter_quarter') {
            const arc = (2 * pi * r) / 4;
            const ans = Math.round((arc + r + r) * 100) / 100;
            return {
                renderData: {
                    geometry: { type: 'quarter_circle', radius: r, labels: { r } },
                    description: lang === 'sv' ? "Beräkna kvartscirkelns omkrets." : "Calculate the perimeter of the quarter circle.",
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Omkretsen på en kvartscirkel består av bågen plus de två raka radierna." : "The perimeter of a quarter circle consists of the arc plus the two straight radii." },
                    { text: lang === 'sv' ? "Steg 1: Räkna ut bågens längd (en fjärdedel av en hel cirkels omkrets)." : "Step 1: Calculate the arc length (one fourth of a full circle's circumference).", latex: `\\frac{2 · 3,14 · ${r}}{4} = ${arc}` },
                    { text: lang === 'sv' ? "Steg 2: Addera de två radierna för att få hela sträckan runt figuren." : "Step 2: Add the two radii to get the total distance around the figure.", latex: `${arc} + ${r} + ${r} = ${ans}` },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
                ]
            };
        }

        const fullArea = Math.round((pi * r * r) * 100) / 100;
        return {
            renderData: {
                geometry: { type: 'circle', radius: r, labels: { r }, show: 'radius' },
                description: lang === 'sv' ? "Beräkna cirkelns area." : "Calculate the area of the circle.",
                answerType: 'numeric'
            },
            token: this.toBase64(fullArea.toString()), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Formeln för en cirkels area är pi multiplicerat med radien i kvadrat." : "The formula for a circle's area is pi multiplied by the radius squared.", latex: "A = \\pi · r^2" },
                { text: lang === 'sv' ? "Uträkning: 3,14 · " + r + " · " + r : "Calculation: 3.14 · " + r + " · " + r, latex: `3,14 · ${r * r} = ${fullArea}` },
                { text: lang === 'sv' ? `Svar: ${fullArea}` : `Answer: ${fullArea}` }
            ]
        };
    }

    // --- LEVEL 6: COMPOSITE ADVANCED ---
    private level6_CompositeAdvanced(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'area_house', type: 'calculate' },
            { key: 'area_portal', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const w = MathUtils.randomInt(40, 60), h = MathUtils.randomInt(30, 45), hr = MathUtils.randomInt(20, 30);

        if (v === 'area_house') {
            const rectA = w * h;
            const roofA = (w * hr) / 2;
            const total = rectA + roofA;
            return {
                renderData: {
                    geometry: { type: 'composite', subtype: 'house', labels: { w, h, h_roof: hr } },
                    description: lang === 'sv' ? "Beräkna husets totala area." : "Calculate the total area of the house.",
                    answerType: 'numeric'
                },
                token: this.toBase64(total.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Dela upp huset i en rektangel (väggarna) och en triangel (taket)." : "Divide the house into a rectangle (walls) and a triangle (roof)." },
                    { text: lang === 'sv' ? "Steg 1: Beräkna rektangelns yta." : "Step 1: Calculate the rectangle's surface.", latex: `${w} · ${h} = ${rectA}` },
                    { text: lang === 'sv' ? "Steg 2: Beräkna triangelns yta." : "Step 2: Calculate the triangle's surface.", latex: `\\frac{${w} · ${hr}}{2} = ${roofA}` },
                    { text: lang === 'sv' ? "Steg 3: Lägg ihop areorna för att få totalsvaret." : "Step 3: Add the areas together to get the final total.", latex: `${rectA} + ${roofA} = ${total}` },
                    { text: lang === 'sv' ? `Svar: ${total}` : `Answer: ${total}` }
                ]
            };
        }

        const r = w / 2;
        const rectA = w * h;
        const semiA = (3.14 * r * r) / 2;
        const total = Math.round((rectA + semiA) * 10) / 10;
        return {
            renderData: {
                geometry: { type: 'composite', subtype: 'portal', labels: { w, h } },
                description: lang === 'sv' ? "Beräkna figurens totala area." : "Calculate the total area of the figure.",
                answerType: 'numeric'
            },
            token: this.toBase64(total.toString()), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Figuren består av en rektangel nertill och en halvcirkel upptill." : "The figure consists of a rectangle at the bottom and a semicircle on top." },
                { text: lang === 'sv' ? "Steg 1: Beräkna rektangelns area." : "Step 1: Calculate the area of the rectangle.", latex: `${w} · ${h} = ${rectA}` },
                { text: lang === 'sv' ? "Steg 2: Beräkna halvcirkelns area." : "Step 2: Calculate the area of the semicircle.", latex: `\\frac{3,14 · ${r}^2}{2} = ${semiA}` },
                { text: lang === 'sv' ? "Steg 3: Summera ytorna." : "Step 3: Sum the areas.", latex: `${rectA} + ${semiA} = ${total}` },
                { text: lang === 'sv' ? `Svar: ${total}` : `Answer: ${total}` }
            ]
        };
    }
}