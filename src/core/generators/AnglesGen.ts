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
            default:
                return this.generate(1, lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    // --- LEVEL 1: TERMINOLOGY & CLASSIFICATION ---
    private level1_Terminology(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['classification_visual', 'classification_inverse_numeric', 'classification_lie']);

        if (v === 'classification_visual') {
            const type = MathUtils.randomChoice(['acute', 'right', 'obtuse', 'straight']);
            let angle = 0, labelSv = "", labelEn = "";

            if (type === 'acute') { angle = MathUtils.randomInt(20, 80); labelSv = "Spetsig"; labelEn = "Acute"; }
            else if (type === 'right') { angle = 90; labelSv = "Rät"; labelEn = "Right"; }
            else if (type === 'obtuse') { angle = MathUtils.randomInt(100, 170); labelSv = "Trubbig"; labelEn = "Obtuse"; }
            else { angle = 180; labelSv = "Rak"; labelEn = "Straight"; }

            const cx = 150, cy = 200, len = 100;
            const x2 = cx + len * Math.cos(-angle * Math.PI / 180);
            const y2 = cy + len * Math.sin(-angle * Math.PI / 180);

            const ans = lang === 'sv' ? labelSv : labelEn;

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
                token: this.toBase64(ans),
                clues: [
                    { 
                        text: lang === 'sv' ? "Vi kategoriserar vinklar genom att jämföra dem med en rät vinkel ($90^\\circ$)." : "We categorize angles by comparing them to a right angle ($90^\\circ$).",
                        latex: `90^\\circ = \\text{${lang === 'sv' ? 'Rät' : 'Right'}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Eftersom ${angle}^\\circ$ är ${angle < 90 ? 'mindre' : angle > 90 ? 'större' : 'lika med'} $90^\\circ$, kallas den:` : `Since ${angle}^\\circ$ is ${angle < 90 ? 'less' : angle > 90 ? 'greater' : 'equal to'} $90^\\circ$, it is called:`,
                        latex: `\\text{${ans}}` 
                    }
                ],
                metadata: { variation_key: "classification_visual", difficulty: 1 }
            };
        }

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
                clues: [
                    { 
                        text: lang === 'sv' ? "Spetsig ($<90^\\circ$), Rät ($90^\\circ$), Trubbig ($>90^\\circ$) och Rak ($180^\\circ$)." : "Acute ($<90^\\circ$), Right ($90^\\circ$), Obtuse ($>90^\\circ$), and Straight ($180^\\circ$).",
                        latex: `${angle}^\\circ` 
                    },
                    { 
                        text: lang === 'sv' ? "Rätt kategori är:" : "The correct category is:",
                        latex: `\\text{${correct}}` 
                    }
                ],
                metadata: { variation_key: "classification_inverse_numeric", difficulty: 1 }
            };
        }

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
            const names: any = { acute: { sv: "spetsig", en: "acute" }, right: { sv: "rät", en: "right" }, obtuse: { sv: "trubbig", en: "obtuse" }, straight: { sv: "rak", en: "straight" } };
            return lang === 'sv' ? `${angle}° är en ${names[type].sv} vinkel` : `${angle}° is an ${names[type].en} angle`;
        };

        const sFalse = getAngleTypePair(false);
        return {
            renderData: {
                description: lang === 'sv' ? "Vilket påstående är FALSKT?" : "Which statement is FALSE?",
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([getAngleTypePair(true), getAngleTypePair(true), sFalse])
            },
            token: this.toBase64(sFalse),
            clues: [
                { text: lang === 'sv' ? "Kontrollera om gradtalet stämmer överens med namnet. Trubbiga vinklar måste vara större än $90^\\circ$ men mindre än $180^\\circ$." : "Check if the degrees match the name. Obtuse angles must be larger than $90^\\circ$ but smaller than $180^\\circ$." },
                { text: lang === 'sv' ? "Detta påstående stämmer inte:" : "This statement is not true:", latex: `\\text{${sFalse}}` }
            ],
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
                    geometry: { type: 'angle', lines, arcs: [{ center: {x: cx, y: cy}, startAngle: 0, endAngle: known, radius: 40, label: `${known}°` }, { center: {x: cx, y: cy}, startAngle: known, endAngle: total, radius: 50, label: 'x' }] }
                },
                token: this.toBase64(unknown.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? (isSupp ? "Vinklarna ligger på en rak linje, vilket betyder att deras summa är $180^\\circ$." : "Vinklarna bildar ett hörn (rät vinkel), vilket betyder att deras summa är $90^\\circ$.") : (isSupp ? "The angles are on a straight line, which means their sum is $180^\\circ$." : "The angles form a corner (right angle), which means their sum is $90^\\circ$."),
                        latex: `x + ${known}^\\circ = ${total}^\\circ`
                    },
                    { 
                        text: lang === 'sv' ? `Dra bort den kända vinkeln från ${total}^\\circ$ för att hitta x.` : `Subtract the known angle from ${total}^\\circ$ to find x.`,
                        latex: `x = ${total} - ${known}`
                    },
                    { 
                        text: lang === 'sv' ? "Värdet på x är:" : "The value of x is:",
                        latex: `x = ${unknown}`
                    }
                ],
                metadata: { variation_key: "comp_supp_visual", difficulty: 2 }
            };
        }

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
            clues: [
                { text: lang === 'sv' ? (isSupp ? "Supplementvinklar blir $180^\\circ$ tillsammans." : "Komplementvinklar blir $90^\\circ$ tillsammans.") : (isSupp ? "Supplementary angles sum to $180^\\circ$." : "Complementary angles sum to $90^\\circ$.") },
                { text: lang === 'sv' ? `Räkna ut skillnaden:` : `Calculate the difference:`, latex: `${isSupp ? 180 : 90} - ${known} = ${ans}` }
            ],
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
                clues: [
                    { 
                        text: isVertical 
                            ? (lang === 'sv' ? "Vinklar som sitter mitt emot varandra i ett kors kallas vertikalvinklar. De är alltid lika stora." : "Angles opposite each other in a crossing are called vertical angles. They are always equal.") 
                            : (lang === 'sv' ? "Vinklar bredvid varandra på en rak linje kallas sidovinklar. De blir $180^\\circ$ tillsammans." : "Angles next to each other on a straight line are side angles. They sum to $180^\\circ$."),
                        latex: isVertical ? `x = ${angle}^\\circ` : `x + ${angle}^\\circ = 180^\\circ`
                    },
                    { 
                        text: lang === 'sv' ? "Detta ger oss svaret:" : "This gives us the answer:",
                        latex: `x = ${target}`
                    }
                ],
                metadata: { variation_key: "vertical_side_visual", difficulty: 3 }
            };
        }

        const a = MathUtils.randomInt(40, 140), b = 180 - a;
        const sFalse = lang === 'sv' ? `Sidovinklar till ${a}° blir totalt 90°` : `Side angles to ${a}° sum to 90°`;

        return {
            renderData: {
                description: lang === 'sv' ? "Vilket påstående är FALSKT?" : "Which statement is FALSE?",
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([
                    lang === 'sv' ? `Vertikalvinkeln till ${a}° är ${a}°` : `The vertical angle to ${a}° is ${a}°`,
                    lang === 'sv' ? `Sidovinkeln till ${a}° är ${b}°` : `The side angle to ${a}° is ${b}°`,
                    sFalse
                ])
            },
            token: this.toBase64(sFalse),
            clues: [
                { text: lang === 'sv' ? "Sidovinklar bildar en linje ($180^\\circ$). Komplementvinklar bildar ett hörn ($90^\\circ$)." : "Side angles form a line ($180^\\circ$). Complementary angles form a corner ($90^\\circ$)." },
                { text: lang === 'sv' ? "Detta påstående är alltså lögnen:" : "This statement is the lie:", latex: `\\text{${sFalse}}` }
            ],
            metadata: { variation_key: "vertical_side_lie", difficulty: 2 }
        };
    }

    // --- LEVEL 4: TRIANGLE SUM ---
    private level4_TriangleSum(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['triangle_sum_visual', 'triangle_isosceles']);

        if (v === 'triangle_sum_visual') {
            const a = MathUtils.randomInt(30, 80), b = MathUtils.randomInt(30, 80);
            const ans = 180 - a - b;

            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna x i triangeln." : "Calculate x in the triangle.",
                    answerType: 'numeric',
                    geometry: { type: 'angle', polygons: [{ points: "50,220 250,220 150,50" }], labels: [{x: 65, y: 210, text: `${a}°`}, {x: 235, y: 210, text: `${b}°`}, {x: 150, y: 85, text: 'x'}] }
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? "Summan av alla tre vinklar i en triangel är alltid $180^\\circ$." : "The sum of all three angles in a triangle is always $180^\\circ$.",
                        latex: `x + ${a}^\\circ + ${b}^\\circ = 180^\\circ`
                    },
                    { 
                        text: lang === 'sv' ? "Vi hittar x genom att dra bort de kända vinklarna från 180." : "We find x by subtracting the known angles from 180.",
                        latex: `x = 180 - ${a + b} = ${ans}` 
                    }
                ],
                metadata: { variation_key: "triangle_sum_visual", difficulty: 3 }
            };
        }

        const vertex = MathUtils.randomInt(30, 100);
        const base = (180 - vertex) / 2;
        const findVertex = Math.random() > 0.5;
        const ans = findVertex ? vertex : base;

        return {
            renderData: {
                description: lang === 'sv' ? "Triangeln är likbent. Beräkna x." : "The triangle is isosceles. Calculate x.",
                answerType: 'numeric',
                geometry: { type: 'angle', polygons: [{ points: "50,200 250,200 150,50" }], labels: findVertex ? [{x: 100, y: 190, text: `${base}°`}, {x: 200, y: 190, text: `${base}°`}, {x: 150, y: 80, text: 'x'}] : [{x: 100, y: 190, text: 'x'}, {x: 200, y: 190, text: `${base}°`}, {x: 150, y: 80, text: `${vertex}°`}] }
            },
            token: this.toBase64(ans.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? "I en likbent triangel är de två vinklarna vid basen lika stora." : "In an isosceles triangle, the two angles at the base are equal.",
                    latex: findVertex ? `${base}^\\circ = \\text{${lang === 'sv' ? 'basvinkel' : 'base angle'}}` : `x = ${base}^\\circ`
                },
                { 
                    text: lang === 'sv' ? "Använd vinkelsumman $180^\\circ$ för att hitta den saknade vinkeln." : "Use the angle sum of $180^\\circ$ to find the missing angle.",
                    latex: findVertex ? `x = 180 - (2 \\cdot ${base})` : `x = (180 - ${vertex}) / 2`
                },
                {
                    text: lang === 'sv' ? "Svaret är:" : "The answer is:",
                    latex: `x = ${ans}`
                }
            ],
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
                clues: [
                    { text: lang === 'sv' ? `En figur med ${n} hörn kan delas upp i ${n-2} stycken trianglar.` : `A figure with ${n} corners can be divided into ${n-2} triangles.`, latex: `n - 2 = ${n-2}` },
                    { text: lang === 'sv' ? "Varje triangel bidrar med $180^\\circ$. Den totala vinkelsumman är:" : "Each triangle contributes $180^\\circ$. The total angle sum is:", latex: `(${n}-2) \\cdot 180 = ${sum}` }
                ],
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
                clues: [
                    { text: lang === 'sv' ? "Vi börjar med att ta reda på hur många trianglar som ryms i figuren genom att dela summan med 180." : "We start by finding out how many triangles fit inside the figure by dividing the sum by 180.", latex: `${sum} / 180 = ${n-2}` },
                    { text: lang === 'sv' ? "Antalet sidor (n) är alltid 2 fler än antalet trianglar." : "The number of sides (n) is always 2 more than the number of triangles.", latex: `n = ${n-2} + 2 = ${n}` }
                ],
                metadata: { variation_key: "polygon_inverse", difficulty: 4 }
            };
        }

        const a = MathUtils.randomInt(70, 110), b = MathUtils.randomInt(70, 110), c = MathUtils.randomInt(70, 110);
        const ans = 360 - a - b - c;
        return {
            renderData: {
                description: lang === 'sv' ? "Bestäm vinkeln x i fyrhörningen." : "Determine angle x in the quadrilateral.",
                answerType: 'numeric',
                geometry: { type: 'angle', polygons: [{ points: "50,50 250,50 230,200 70,200" }], labels: [{x: 70, y: 70, text: `${a}°`}, {x: 230, y: 70, text: `${b}°`}, {x: 210, y: 185, text: `${c}°`}, {x: 90, y: 185, text: 'x'}] }
            },
            token: this.toBase64(ans.toString()),
            clues: [
                { text: lang === 'sv' ? "Vinkelsumman i en fyrhörning är alltid $360^\\circ$." : "The sum of angles in a quadrilateral is always $360^\\circ$.", latex: `x + ${a} + ${b} + ${c} = 360` },
                { text: lang === 'sv' ? "Räkna ut x genom att dra bort summan av de andra vinklarna." : "Calculate x by subtracting the sum of the other angles.", latex: `x = 360 - ${a+b+c} = ${ans}` }
            ],
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
            const cy = 125, lines = [{x1: 30, y1: cy - 50, x2: 270, y2: cy - 50}, {x1: 30, y1: cy + 50, x2: 270, y2: cy + 50}, {x1: 100, y1: 50, x2: 200, y2: 200}];
            const labels = [];
            if (type === 'alt_int') { labels.push({ x: 145, y: 90, text: `${angle}°` }, { x: 155, y: 160, text: 'x' }); }
            else if (type === 'interior') { labels.push({ x: 145, y: 90, text: `${angle}°` }, { x: 195, y: 160, text: 'x' }); }
            else if (type === 'alt_ext') { labels.push({ x: 90, y: 60, text: `${angle}°` }, { x: 230, y: 190, text: 'x' }); }
            else { labels.push({ x: 145, y: 60, text: `${angle}°` }, { x: 215, y: 160, text: 'x' }); }

            let typeName = type === 'interior' ? (lang === 'sv' ? 'liksidig inre' : 'consecutive interior') : (lang === 'sv' ? 'likbelägen eller alternat' : 'corresponding or alternate');

            return {
                renderData: {
                    description: lang === 'sv' ? "Linjerna är parallella. Bestäm x." : "The lines are parallel. Determine x.",
                    answerType: 'numeric',
                    geometry: { type: 'angle', lines, labels }
                },
                token: this.toBase64(target.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? `Vinklarna bildar en ${typeName}-relation.` : `The angles form a ${typeName} relationship.`, 
                        latex: type === 'interior' ? `x + ${angle}^\\circ = 180^\\circ` : `x = ${angle}^\\circ` 
                    },
                    { text: lang === 'sv' ? "Värdet på x är:" : "The value of x is:", latex: `x = ${target}` }
                ],
                metadata: { variation_key: "parallel_visual", difficulty: 5 }
            };
        }

        const a = MathUtils.randomInt(50, 130);
        const sFalse = lang === 'sv' ? `Likbelägna vinklar blir totalt 180° (${a}° + ${a}° = 180°)` : `Corresponding angles sum to 180° (${a}° + ${a}° = 180°)`;

        return {
            renderData: {
                description: lang === 'sv' ? "Vilket påstående om parallella linjer är FALSKT?" : "Which statement about parallel lines is FALSE?",
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([
                    lang === 'sv' ? `Alternatvinklar är lika stora (${a}° = ${a}°)` : `Alternate angles are equal (${a}° = ${a}°)`,
                    lang === 'sv' ? `Likbelägna vinklar är lika stora (${a}° = ${a}°)` : `Corresponding angles are equal (${a}° = ${a}°)`,
                    sFalse
                ])
            },
            token: this.toBase64(sFalse),
            clues: [
                { text: lang === 'sv' ? "Likbelägna och alternatvinklar är alltid identiska om linjerna är parallella." : "Corresponding and alternate angles are always identical if the lines are parallel." },
                { text: lang === 'sv' ? "Falskt påstående:" : "False statement:", latex: `\\text{${sFalse}}` }
            ],
            metadata: { variation_key: "parallel_lie", difficulty: 4 }
        };
    }
}