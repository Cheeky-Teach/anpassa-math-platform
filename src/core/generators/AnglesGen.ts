import { MathUtils } from '../utils/MathUtils.js';

export class AnglesGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_Terminology(lang);
            case 2: return this.level2_CompSupp(lang);
            case 3: return this.level3_Vertical(lang);
            case 4: return this.level4_TriangleSum(lang);
            case 5: return this.level5_Polygons(lang);
            case 6: return this.level6_Parallel(lang);
            default: return this.level1_Terminology(lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    // --- LEVEL 1: TERMINOLOGY & CLASSIFICATION ---
    private level1_Terminology(lang: string): any {
        const variation = Math.random();

        // Variation A: Standard Visual Identification
        if (variation < 0.4) {
            const type = MathUtils.randomChoice(['acute', 'right', 'obtuse', 'straight']);
            let angle = 0;
            let labelSv = "";
            let labelEn = "";

            if (type === 'acute') { angle = MathUtils.randomInt(20, 80); labelSv = "Spetsig"; labelEn = "Acute"; }
            else if (type === 'right') { angle = 90; labelSv = "Rät"; labelEn = "Right"; }
            else if (type === 'obtuse') { angle = MathUtils.randomInt(100, 170); labelSv = "Trubbig"; labelEn = "Obtuse"; }
            else { angle = 180; labelSv = "Rak"; labelEn = "Straight"; }

            const cx = 150, cy = 200;
            const len = 100;
            const x2 = cx + len * Math.cos(-angle * Math.PI / 180);
            const y2 = cy + len * Math.sin(-angle * Math.PI / 180);

            return {
                renderData: {
                    description: lang === 'sv' ? "Vad kallas denna typ av vinkel?" : "What is this type of angle called?",
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle(lang === 'sv' ? ["Spetsig", "Rät", "Trubbig", "Rak"] : ["Acute", "Right", "Obtuse", "Straight"]),
                    geometry: {
                        type: 'angle',
                        lines: [{x1: cx, y1: cy, x2: cx + len, y2: cy}, {x1: cx, y1: cy, x2: x2, y2: y2}],
                        arcs: [{ center: {x: cx, y: cy}, startAngle: 0, endAngle: angle, radius: 40, label: `${angle}°` }]
                    }
                },
                token: this.toBase64(lang === 'sv' ? labelSv : labelEn),
                clues: [{ text: lang === 'sv' ? "En rät vinkel är exakt $90^\\circ$. Vinklar mindre än det är spetsiga, och vinklar större är trubbiga." : "A right angle is exactly $90^\\circ$. Smaller angles are acute, and larger angles are obtuse." }],
                metadata: { variation: "classification_visual", difficulty: 1 }
            };
        }

        // Variation B: Numeric Categorization (Inverse)
        if (variation < 0.7) {
            const angle = MathUtils.randomChoice([45, 90, 135, 180]);
            let correct = "";
            if (angle < 90) correct = lang === 'sv' ? "Spetsig" : "Acute";
            else if (angle === 90) correct = lang === 'sv' ? "Rät" : "Right";
            else if (angle < 180) correct = lang === 'sv' ? "Trubbig" : "Obtuse";
            else correct = lang === 'sv' ? "Rak" : "Straight";

            return {
                renderData: {
                    description: lang === 'sv' ? `En vinkel är ${angle}°. Vilken kategori tillhör den?` : `An angle is ${angle}°. Which category does it belong to?`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle(lang === 'sv' ? ["Spetsig", "Rät", "Trubbig", "Rak"] : ["Acute", "Right", "Obtuse", "Straight"])
                },
                token: this.toBase64(correct),
                clues: [{ text: lang === 'sv' ? "Titta på gradtalet. Är det mindre än, exakt eller större än $90^\\circ$?" : "Look at the degrees. Is it less than, exactly, or more than $90^\\circ$?" }],
                metadata: { variation: "classification_inverse_numeric", difficulty: 1 }
            };
        }

        // Variation C: Spot the Lie (Dynamic Randomization)
        const getAngleTypePair = (isCorrect: boolean) => {
            const type = MathUtils.randomChoice(['acute', 'right', 'obtuse', 'straight']);
            let angle = 0;
            if (isCorrect) {
                if (type === 'acute') angle = MathUtils.randomInt(10, 89);
                else if (type === 'right') angle = 90;
                else if (type === 'obtuse') angle = MathUtils.randomInt(91, 179);
                else angle = 180;
            } else {
                // Generate a wrong pair
                if (type === 'acute') angle = MathUtils.randomInt(91, 180);
                else if (type === 'right') angle = MathUtils.randomChoice([45, 135]);
                else if (type === 'obtuse') angle = MathUtils.randomInt(10, 89);
                else angle = 90;
            }
            const names: any = { 
                acute: { sv: "spetsig", en: "acute" }, 
                right: { sv: "rät", en: "right" }, 
                obtuse: { sv: "trubbig", en: "obtuse" }, 
                straight: { sv: "rak", en: "straight" } 
            };
            return lang === 'sv' 
                ? `${angle}° är en ${names[type].sv} vinkel` 
                : `${angle}° is an ${names[type].en} angle`;
        };

        const sTrue1 = getAngleTypePair(true);
        const sTrue2 = getAngleTypePair(true);
        const sFalse = getAngleTypePair(false);

        return {
            renderData: {
                description: lang === 'sv' ? "Vilket påstående är FALSKT?" : "Which statement is FALSE?",
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([sTrue1, sTrue2, sFalse])
            },
            token: this.toBase64(sFalse),
            clues: [{ text: lang === 'sv' ? "Gå igenom varje gradtal och se om det matchar namnet på vinkeltypen." : "Check each degree measure to see if it matches the name of the angle type." }],
            metadata: { variation: "classification_lie", difficulty: 1 }
        };
    }

    // --- LEVEL 2: COMPLEMENTARY & SUPPLEMENTARY (90/180) ---
    private level2_CompSupp(lang: string): any {
        const variation = Math.random();

        // Variation A: Standard Visual
        if (variation < 0.5) {
            const isSupp = Math.random() > 0.5;
            const total = isSupp ? 180 : 90;
            const known = MathUtils.randomInt(20, total - 20);
            const unknown = total - known;
            const cx = 150, cy = 200, len = 120;

            const lines = isSupp ? [{x1: cx - len, y1: cy, x2: cx + len, y2: cy}] : [{x1: cx, y1: cy, x2: cx + len, y2: cy}, {x1: cx, y1: cy, x2: cx, y2: cy - len}];
            const xCut = cx + len * Math.cos(-known * Math.PI / 180);
            const yCut = cy + len * Math.sin(-known * Math.PI / 180);
            lines.push({x1: cx, y1: cy, x2: xCut, y2: yCut});

            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna vinkeln x." : "Calculate angle x.",
                    answerType: 'numeric',
                    geometry: {
                        type: 'angle', lines,
                        arcs: [
                            { center: {x: cx, y: cy}, startAngle: 0, endAngle: known, radius: 40, label: `${known}°` },
                            { center: {x: cx, y: cy}, startAngle: known, endAngle: total, radius: 50, label: 'x' }
                        ]
                    }
                },
                token: this.toBase64(unknown.toString()),
                clues: [
                    { text: lang === 'sv' ? (isSupp ? "Vinklarna delar en rak linje ($180^\\circ$)." : "Vinklarna bildar en rät vinkel ($90^\\circ$).") : (isSupp ? "The angles share a straight line ($180^\\circ$)." : "The angles form a right angle ($90^\\circ$).") },
                    { text: lang === 'sv' ? `Subtrahera den kända vinkeln: ${total} - ${known}.` : `Subtract the known angle: ${total} - ${known}.` }
                ],
                metadata: { variation: "comp_supp_visual", difficulty: 2 }
            };
        }

        // Variation B: Terminology Inverse
        const isSupp = Math.random() > 0.5;
        const known = MathUtils.randomInt(10, isSupp ? 170 : 80);
        const ans = isSupp ? 180 - known : 90 - known;
        const termSv = isSupp ? "supplementvinkel" : "komplementvinkel";
        const termEn = isSupp ? "supplementary angle" : "complementary angle";

        return {
            renderData: {
                description: lang === 'sv' ? `En vinkel är ${known}°. Vad är dess ${termSv}?` : `An angle is ${known}°. What is its ${termEn}?`,
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()),
            clues: [{ text: lang === 'sv' ? (isSupp ? "Summan av supplementvinklar är alltid $180^\\circ$." : "Summan av komplementvinklar är alltid $90^\\circ$.") : (isSupp ? "Supplementary angles sum to $180^\\circ$." : "Complementary angles sum to $90^\\circ$.") }],
            metadata: { variation: "comp_supp_inverse", difficulty: 2 }
        };
    }

    // --- LEVEL 3: VERTICAL & SIDE ---
    private level3_Vertical(lang: string): any {
        const variation = Math.random();
        const angle = MathUtils.randomInt(40, 140);

        // Variation A: Standard Visual
        if (variation < 0.6) {
            const isVertical = Math.random() > 0.5;
            const target = isVertical ? angle : 180 - angle;
            const cx = 150, cy = 125, len = 100, rot = 15;

            const lines = [
                {x1: cx - len * Math.cos(rot * Math.PI / 180), y1: cy + len * Math.sin(rot * Math.PI / 180), x2: cx + len * Math.cos(rot * Math.PI / 180), y2: cy - len * Math.sin(rot * Math.PI / 180)},
                {x1: cx - len * Math.cos((rot + angle) * Math.PI / 180), y1: cy + len * Math.sin((rot + angle) * Math.PI / 180), x2: cx + len * Math.cos((rot + angle) * Math.PI / 180), y2: cy - len * Math.sin((rot + angle) * Math.PI / 180)}
            ];

            const arcs = [{ center: {x: cx, y: cy}, startAngle: rot, endAngle: rot + angle, radius: 40, label: `${angle}°` }];
            if (isVertical) arcs.push({ center: {x: cx, y: cy}, startAngle: rot + 180, endAngle: rot + angle + 180, radius: 40, label: 'x' });
            else arcs.push({ center: {x: cx, y: cy}, startAngle: rot + angle, endAngle: rot + 180, radius: 35, label: 'x' });

            return {
                renderData: {
                    description: lang === 'sv' ? "Bestäm vinkeln x." : "Determine angle x.",
                    answerType: 'numeric',
                    geometry: { type: 'angle', lines, arcs }
                },
                token: this.toBase64(target.toString()),
                clues: [{ text: isVertical ? (lang === 'sv' ? "Vertikalvinklar (mitt emot varandra) är alltid lika stora." : "Vertical angles (opposite each other) are always equal.") : (lang === 'sv' ? "Sidovinklar ligger längs en rak linje och blir totalt $180^\\circ$." : "Side angles lie along a straight line and sum to $180^\\circ$.") }],
                metadata: { variation: "vertical_side_visual", difficulty: 3 }
            };
        }

        // Variation B: Spot the Lie (Vertical/Side Rules)
        const a = MathUtils.randomInt(40, 140);
        const b = 180 - a;
        const sTrue1 = lang === 'sv' ? `Vertikalvinklar till ${a}° är ${a}°` : `Vertical angles to ${a}° are ${a}°`;
        const sTrue2 = lang === 'sv' ? `Sidovinkeln till ${a}° är ${b}°` : `The side angle to ${a}° is ${b}°`;
        const sFalse = lang === 'sv' ? `Sidovinklar till ${a}° blir totalt 90°` : `Side angles to ${a}° sum to 90°`;

        return {
            renderData: {
                description: lang === 'sv' ? "Vilket påstående är FALSKT?" : "Which statement is FALSE?",
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([sTrue1, sTrue2, sFalse])
            },
            token: this.toBase64(sFalse),
            clues: [{ text: lang === 'sv' ? "Sidovinklar bildar en rak linje, vilket betyder att de tillsammans är $180^\\circ$." : "Side angles form a straight line, which means they sum to $180^\\circ$." }],
            metadata: { variation: "vertical_side_lie", difficulty: 2 }
        };
    }

    // --- LEVEL 4: TRIANGLE SUM ---
    private level4_TriangleSum(lang: string): any {
        const variation = Math.random();

        // Variation A: Standard Triangle
        if (variation < 0.5) {
            const a = MathUtils.randomInt(30, 80);
            const b = MathUtils.randomInt(30, 80);
            const ans = 180 - a - b;

            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna x i triangeln." : "Calculate x in the triangle.",
                    answerType: 'numeric',
                    geometry: {
                        type: 'angle',
                        polygons: [{ points: "50,220 250,220 150,50" }],
                        labels: [{x: 65, y: 210, text: `${a}°`}, {x: 235, y: 210, text: `${b}°`}, {x: 150, y: 85, text: 'x'}]
                    }
                },
                token: this.toBase64(ans.toString()),
                clues: [{ text: lang === 'sv' ? "Summan av alla vinklar i en triangel är alltid $180^\\circ$." : "The sum of all angles in a triangle is always $180^\\circ$." }],
                metadata: { variation: "triangle_sum_visual", difficulty: 3 }
            };
        }

        // Variation B: Isosceles Deduction
        const vertex = MathUtils.randomInt(30, 100);
        const base = (180 - vertex) / 2;
        const findVertex = Math.random() > 0.5;

        return {
            renderData: {
                description: lang === 'sv' ? "Triangeln är likbent. Beräkna x." : "The triangle is isosceles. Calculate x.",
                answerType: 'numeric',
                geometry: {
                    type: 'angle',
                    polygons: [{ points: "50,200 250,200 150,50" }],
                    labels: findVertex ? 
                        [{x: 100, y: 190, text: `${base}°`}, {x: 200, y: 190, text: `${base}°`}, {x: 150, y: 80, text: 'x'}] :
                        [{x: 100, y: 190, text: 'x'}, {x: 200, y: 190, text: `${base}°`}, {x: 150, y: 80, text: `${vertex}°`}]
                }
            },
            token: this.toBase64(findVertex ? vertex.toString() : base.toString()),
            clues: [{ text: lang === 'sv' ? "I en likbent triangel är de två vinklarna vid basen lika stora." : "In an isosceles triangle, the two base angles are equal." }],
            metadata: { variation: "triangle_isosceles", difficulty: 4 }
        };
    }

    // --- LEVEL 5: POLYGONS ---
    private level5_Polygons(lang: string): any {
        const variation = Math.random();

        // Variation A: Standard sum (n-gon)
        if (variation < 0.4) {
            const n = MathUtils.randomChoice([4, 5, 6]);
            const sum = (n - 2) * 180;
            const names = { 4: {sv:"fyrhörning", en:"quadrilateral"}, 5: {sv:"femhörning", en:"pentagon"}, 6: {sv:"sexhörning", en:"hexagon"} };

            return {
                renderData: {
                    description: lang === 'sv' ? `Vad är vinkelsumman i en ${names[n as 4|5|6].sv}?` : `What is the sum of angles in a ${names[n as 4|5|6].en}?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(sum.toString()),
                clues: [{ text: lang === 'sv' ? "Formeln är: $(n - 2) \\cdot 180^\\circ$ där n är antalet hörn." : "The formula is: $(n - 2) \\cdot 180^\\circ$ where n is the number of corners." }],
                metadata: { variation: "polygon_sum", difficulty: 4 }
            };
        }

        // Variation B: Inverse Sides
        if (variation < 0.7) {
            const n = MathUtils.randomChoice([3, 4, 5, 8]);
            const sum = (n - 2) * 180;
            return {
                renderData: {
                    description: lang === 'sv' ? `En polygon har en vinkelsumma på ${sum}°. Hur många sidor har den?` : `A polygon has an angle sum of ${sum}°. How many sides does it have?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(n.toString()),
                clues: [{ text: lang === 'sv' ? "Dela summan med 180 och addera sedan 2." : "Divide the sum by 180 and then add 2." }],
                metadata: { variation: "polygon_inverse", difficulty: 4 }
            };
        }

        // Variation C: Quadrilateral missing angle
        const a = MathUtils.randomInt(70, 110);
        const b = MathUtils.randomInt(70, 110);
        const c = MathUtils.randomInt(70, 110);
        const ans = 360 - a - b - c;
        return {
            renderData: {
                description: lang === 'sv' ? "Bestäm vinkeln x i fyrhörningen." : "Determine angle x in the quadrilateral.",
                answerType: 'numeric',
                geometry: { 
                    type: 'angle', 
                    polygons: [{ points: "50,50 250,50 230,200 70,200" }], 
                    labels: [{x: 70, y: 70, text: `${a}°`}, {x: 230, y: 70, text: `${b}°`}, {x: 210, y: 185, text: `${c}°`}, {x: 90, y: 185, text: 'x'}] 
                }
            },
            token: this.toBase64(ans.toString()),
            clues: [{ text: lang === 'sv' ? "Vinkelsumman i en fyrhörning är alltid $360^\\circ$." : "The sum of angles in a quadrilateral is always $360^\\circ$." }],
            metadata: { variation: "quad_missing", difficulty: 4 }
        };
    }

    // --- LEVEL 6: PARALLEL LINES ---
    private level6_Parallel(lang: string): any {
        const variation = Math.random();
        const angle = MathUtils.randomInt(50, 130);

        // Variation A: Visual Relationships
        if (variation < 0.6) {
            const type = MathUtils.randomChoice(['corr', 'alt_int', 'alt_ext', 'interior']);
            let target = (type === 'interior') ? 180 - angle : angle;
            const cy = 125;

            const lines = [
                {x1: 30, y1: cy - 50, x2: 270, y2: cy - 50}, 
                {x1: 30, y1: cy + 50, x2: 270, y2: cy + 50}, 
                {x1: 100, y1: 50, x2: 200, y2: 200}
            ];

            const labels = [];
            if (type === 'alt_int') { labels.push({ x: 145, y: 90, text: `${angle}°` }, { x: 155, y: 160, text: 'x' }); }
            else if (type === 'interior') { labels.push({ x: 145, y: 90, text: `${angle}°` }, { x: 195, y: 160, text: 'x' }); }
            else if (type === 'alt_ext') { labels.push({ x: 90, y: 60, text: `${angle}°` }, { x: 230, y: 190, text: 'x' }); }
            else { labels.push({ x: 145, y: 60, text: `${angle}°` }, { x: 215, y: 160, text: 'x' }); }

            return {
                renderData: {
                    description: lang === 'sv' ? "Linjerna är parallella. Bestäm x." : "The lines are parallel. Determine x.",
                    answerType: 'numeric',
                    geometry: { type: 'angle', lines, labels }
                },
                token: this.toBase64(target.toString()),
                clues: [{ text: lang === 'sv' ? "När linjer är parallella skapas parvis lika stora vinklar (Z, F). Endast U-vinklar blir 180." : "When lines are parallel, Z and F shapes create equal angles. U shapes sum to 180." }],
                metadata: { variation: "parallel_visual", difficulty: 5 }
            };
        }

        // Variation B: Spot the Lie (Dynamic Relationships)
        const a = MathUtils.randomInt(50, 130);
        const b = 180 - a;
        
        const sTrue1 = lang === 'sv' ? `Alternatvinklar är lika stora (${a}° = ${a}°)` : `Alternate angles are equal (${a}° = ${a}°)`;
        const sTrue2 = lang === 'sv' ? `Likbelägna vinklar är lika stora (${a}° = ${a}°)` : `Corresponding angles are equal (${a}° = ${a}°)`;
        const sFalse = lang === 'sv' ? `Likbelägna vinklar blir totalt 180° (${a}° + ${a}° = 180°)` : `Corresponding angles sum to 180° (${a}° + ${a}° = 180°)`;

        return {
            renderData: {
                description: lang === 'sv' ? "Vilket påstående om parallella linjer är FALSKT?" : "Which statement about parallel lines is FALSE?",
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([sTrue1, sTrue2, sFalse])
            },
            token: this.toBase64(sFalse),
            clues: [{ text: lang === 'sv' ? "Likbelägna vinklar (F-form) och Alternatvinklar (Z-form) är alltid lika stora. Bara vinklar på samma sida (U-form) blir 180°." : "Corresponding (F-shape) and Alternate (Z-shape) angles are always equal. Only angles on the same side (U-shape) sum to 180°." }],
            metadata: { variation: "parallel_lie", difficulty: 4 }
        };
    }
}