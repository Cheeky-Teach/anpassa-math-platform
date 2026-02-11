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

    /**
     * Phase 2: Targeted Generation
     * Allows the Question Studio to request a specific variation key.
     */
    public generateByVariation(key: string, lang: string = 'sv'): any {
        switch (key) {
            case 'classification_visual': return this.level1_Terminology(lang, key);
            case 'classification_inverse_numeric': return this.level1_Terminology(lang, key);
            case 'classification_lie': return this.level1_Terminology(lang, key);
            case 'comp_supp_visual': return this.level2_CompSupp(lang, key);
            case 'comp_supp_inverse': return this.level2_CompSupp(lang, key);
            case 'vertical_side_visual': return this.level3_Vertical(lang, key);
            case 'vertical_side_lie': return this.level3_Vertical(lang, key);
            case 'triangle_sum_visual': return this.level4_TriangleSum(lang, key);
            case 'triangle_isosceles': return this.level4_TriangleSum(lang, key);
            case 'polygon_sum': return this.level5_Polygons(lang, key);
            case 'polygon_inverse': return this.level5_Polygons(lang, key);
            case 'quad_missing': return this.level5_Polygons(lang, key);
            case 'parallel_visual': return this.level6_Parallel(lang, key);
            case 'parallel_lie': return this.level6_Parallel(lang, key);
            default: return this.generate(1, lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    // --- LEVEL 1: TERMINOLOGY & CLASSIFICATION ---
    private level1_Terminology(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['classification_visual', 'classification_inverse_numeric', 'classification_lie']);

        // Variation A: Standard Visual Identification
        if (v === 'classification_visual') {
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
                clues: [{ text: lang === 'sv' ? "En rät vinkel är exakt $90^\\circ$. Vinklar mindre än det är spetsiga. De som är större är trubbiga." : "A right angle is exactly $90^\\circ$. Smaller angles are acute, and larger angles are obtuse." }],
                metadata: { variation_key: "classification_visual", difficulty: 1 }
            };
        }

        // Variation B: Numeric Categorization (Inverse)
        if (v === 'classification_inverse_numeric') {
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
                clues: [{ text: lang === 'sv' ? "Titta på gradtalet. En spetsig vinkel är $< 90^\\circ$, en rät är $90^\\circ$, en trubbig är $> 90^\\circ$ och en rak är $180^\\circ$." : "Look at the degrees. Acute is $< 90^\\circ$, Right is $90^\\circ$, Obtuse is $> 90^\\circ$, and Straight is $180^\\circ$." }],
                metadata: { variation_key: "classification_inverse_numeric", difficulty: 1 }
            };
        }

        // Variation C: Spot the Lie
        const getAngleTypePair = (isCorrect: boolean) => {
            const type = MathUtils.randomChoice(['acute', 'right', 'obtuse', 'straight']);
            let angle = 0;
            if (isCorrect) {
                if (type === 'acute') angle = MathUtils.randomInt(10, 89);
                else if (type === 'right') angle = 90;
                else if (type === 'obtuse') angle = MathUtils.randomInt(91, 179);
                else angle = 180;
            } else {
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
            clues: [{ text: lang === 'sv' ? "Gå igenom varje påstående. Kom ihåg: Spetsig ($<90^\\circ$), Rät ($90^\\circ$), Trubbig ($>90^\\circ$), Rak ($180^\\circ$)." : "Check each statement. Remember: Acute ($<90^\\circ$), Right ($90^\\circ$), Obtuse ($>90^\\circ$), Straight ($180^\\circ$)." }],
            metadata: { variation_key: "classification_lie", difficulty: 1 }
        };
    }

    // --- LEVEL 2: COMPLEMENTARY & SUPPLEMENTARY ---
    private level2_CompSupp(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['comp_supp_visual', 'comp_supp_inverse']);

        if (v === 'comp_supp_visual') {
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
                    { text: lang === 'sv' ? `Eftersom de bildar ${total}^\\circ$ kan vi räkna ut x genom: ${total} - ${known}.` : `Since they form ${total}^\\circ$, we can find x by: ${total} - ${known}.` }
                ],
                metadata: { variation_key: "comp_supp_visual", difficulty: 2 }
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
            clues: [{ text: lang === 'sv' ? (isSupp ? "Supplementvinklar bildar tillsammans en rak linje ($180^\\circ$)." : "Komplementvinklar bildar tillsammans en rät vinkel ($90^\\circ$).") : (isSupp ? "Supplementary angles sum to $180^\\circ$." : "Complementary angles sum to $90^\\circ$.") }],
            metadata: { variation_key: "comp_supp_inverse", difficulty: 2 }
        };
    }

    // --- LEVEL 3: VERTICAL & SIDE ---
    private level3_Vertical(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['vertical_side_visual', 'vertical_side_lie']);
        const angle = MathUtils.randomInt(40, 140);

        if (v === 'vertical_side_visual') {
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
                clues: [{ text: isVertical ? (lang === 'sv' ? "Vertikalvinklar sitter mitt emot varandra vid ett linjekryss och är alltid lika stora." : "Vertical angles are opposite each other in a line crossing and are always equal.") : (lang === 'sv' ? "Sidovinklar ligger längs en rak linje, vilket betyder att x + känd vinkel = $180^\\circ$." : "Side angles lie along a straight line, which means x + known angle = $180^\\circ$.") }],
                metadata: { variation_key: "vertical_side_visual", difficulty: 3 }
            };
        }

        const a = MathUtils.randomInt(40, 140);
        const b = 180 - a;
        const sTrue1 = lang === 'sv' ? `Vertikalvinkeln till ${a}° är ${a}°` : `The vertical angle to ${a}° is ${a}°`;
        const sTrue2 = lang === 'sv' ? `Sidovinkeln till ${a}° är ${b}°` : `The side angle to ${a}° is ${b}°`;
        const sFalse = lang === 'sv' ? `Sidovinklar till ${a}° blir totalt 90°` : `Side angles to ${a}° sum to 90°`;

        return {
            renderData: {
                description: lang === 'sv' ? "Vilket påstående är FALSKT?" : "Which statement is FALSE?",
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([sTrue1, sTrue2, sFalse])
            },
            token: this.toBase64(sFalse),
            clues: [{ text: lang === 'sv' ? "Sidovinklar bildar en rak linje, vilket betyder att de tillsammans är $180^\\circ$. Komplementvinklar är de som blir $90^\\circ$." : "Side angles form a straight line, which means they sum to $180^\\circ$. Complementary angles are those that sum to $90^\\circ$." }],
            metadata: { variation_key: "vertical_side_lie", difficulty: 2 }
        };
    }

    // --- LEVEL 4: TRIANGLE SUM ---
    private level4_TriangleSum(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['triangle_sum_visual', 'triangle_isosceles']);

        if (v === 'triangle_sum_visual') {
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
                clues: [{ text: lang === 'sv' ? "Vinkelsumman i en triangel är alltid $180^\\circ$. Räkna ut $180 - vinkel_1 - vinkel_2$." : "The sum of angles in a triangle is always $180^\\circ$. Calculate $180 - angle_1 - angle_2$." }],
                metadata: { variation_key: "triangle_sum_visual", difficulty: 3 }
            };
        }

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
            clues: [{ text: lang === 'sv' ? "I en likbent triangel är de två basvinklarna lika stora. Vinkelsumman är fortfarande $180^\\circ$." : "In an isosceles triangle, the two base angles are equal. The sum is still $180^\\circ$." }],
            metadata: { variation_key: "triangle_isosceles", difficulty: 4 }
        };
    }

    // --- LEVEL 5: POLYGONS ---
    private level5_Polygons(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['polygon_sum', 'polygon_inverse', 'quad_missing']);

        if (v === 'polygon_sum') {
            const n = MathUtils.randomChoice([4, 5, 6]);
            const sum = (n - 2) * 180;
            const names = { 4: {sv:"fyrhörning", en:"quadrilateral"}, 5: {sv:"femhörning", en:"pentagon"}, 6: {sv:"sexhörning", en:"hexagon"} };

            return {
                renderData: {
                    description: lang === 'sv' ? `Vad är vinkelsumman i en ${names[n as 4|5|6].sv}?` : `What is the sum of angles in a ${names[n as 4|5|6].en}?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(sum.toString()),
                clues: [{ text: lang === 'sv' ? "Använd formeln $(n - 2) \\cdot 180^\\circ$, där n är antalet hörn eller sidor." : "Use the formula $(n - 2) \\cdot 180^\\circ$, where n is the number of corners or sides." }],
                metadata: { variation_key: "polygon_sum", difficulty: 4 }
            };
        }

        if (v === 'polygon_inverse') {
            const n = MathUtils.randomChoice([3, 4, 5, 8]);
            const sum = (n - 2) * 180;
            return {
                renderData: {
                    description: lang === 'sv' ? `En polygon har en vinkelsumma på ${sum}°. Hur många sidor har den?` : `A polygon has an angle sum of ${sum}°. How many sides does it have?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(n.toString()),
                clues: [{ text: lang === 'sv' ? "Baklänges räknat: $(\\text{summa} / 180) + 2$." : "Calculated backwards: $(\\text{sum} / 180) + 2$." }],
                metadata: { variation_key: "polygon_inverse", difficulty: 4 }
            };
        }

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
            clues: [{ text: lang === 'sv' ? "Vinkelsumman i en fyrhörning (4 hörn) är alltid $360^\\circ$." : "The sum of angles in a quadrilateral (4 corners) is always $360^\\circ$." }],
            metadata: { variation_key: "quad_missing", difficulty: 4 }
        };
    }

    // --- LEVEL 6: PARALLEL LINES ---
    private level6_Parallel(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['parallel_visual', 'parallel_lie']);
        const angle = MathUtils.randomInt(50, 130);

        if (v === 'parallel_visual') {
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
                clues: [{ text: lang === 'sv' ? "När linjer är parallella bildas parvis lika vinklar. Z-vinklar (alternat) och F-vinklar (likbelägna) är lika stora. U-vinklar är supplementära ($180^\\circ$)." : "Parallel lines create pairs of equal angles. Z-shapes (alternate) and F-shapes (corresponding) are equal. U-shapes sum to $180^\\circ$." }],
                metadata: { variation_key: "parallel_visual", difficulty: 5 }
            };
        }

        const a = MathUtils.randomInt(50, 130);
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
            clues: [{ text: lang === 'sv' ? "Likbelägna vinklar (F-form) och Alternatvinklar (Z-form) är alltid lika stora. Bara vinklar på samma sida (U-form) blir supplementära ($180^\\circ$)." : "Corresponding (F-shape) and Alternate (Z-shape) angles are always equal. Only angles on the same side (U-shape) sum to $180^\\circ$." }],
            metadata: { variation_key: "parallel_lie", difficulty: 4 }
        };
    }
}