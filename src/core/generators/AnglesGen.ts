import { MathUtils } from '../utils/MathUtils.js';

export class AnglesGen {
    private CLEAN_ANGLES = [15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 100, 110, 115, 120, 125, 130, 140, 150, 160];

    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        if (level === 1 && options.hideConcept) {
            return this.level2_CompSupp(lang, undefined, options);
        }
        switch (level) {
            case 1: return this.level1_Terminology(lang, undefined, options);
            case 2: return this.level2_CompSupp(lang, undefined, options);
            case 3: return this.level3_Vertical(lang, undefined, options);
            case 4: return this.level4_TriangleSum(lang, undefined, options);
            case 5: return this.level5_Polygons(lang, undefined, options);
            case 6: return this.level6_Parallel(lang, undefined, options);
            default: return this.level1_Terminology(lang, undefined, options);
        }
    }

    public generateByVariation(key: string, lang: string = 'sv'): any {
        switch (key) {
            case 'classification_visual':
            case 'classification_inverse_numeric':
            case 'classification_lie':
            case 'classification_check_acute': return this.level1_Terminology(lang, key);
            case 'comp_supp_visual':
            case 'comp_supp_inverse': return this.level2_CompSupp(lang, key);
            case 'vertical_side_visual':
            case 'vertical_side_lie': return this.level3_Vertical(lang, key);
            case 'triangle_sum_visual':
            case 'triangle_isosceles': return this.level4_TriangleSum(lang, key);
            case 'polygon_sum':
            case 'polygon_inverse':
            case 'quad_missing': return this.level5_Polygons(lang, key);
            case 'parallel_visual':
            case 'parallel_lie': return this.level6_Parallel(lang, key);
            default: return this.generate(1, lang);
        }
    }

    private toBase64(str: string): string { return Buffer.from(str).toString('base64'); }

    private getVariation(pool: {key: string, type: 'concept' | 'calculate'}[], options: any): string {
        let filtered = pool;
        if (options?.exclude?.length > 0) filtered = filtered.filter(v => !options.exclude.includes(v.key));
        if (options?.hideConcept) filtered = filtered.filter(v => v.type !== 'concept');
        return filtered.length === 0 ? pool[0].key : MathUtils.randomChoice(filtered.map(v => v.key));
    }

    // 🟢 NEW: Trigonometric Math Helpers for perfectly accurate SVGs
    private toRad(deg: number): number {
        return (deg * Math.PI) / 180;
    }

    private calcPoint(cx: number, cy: number, radius: number, angleDeg: number) {
        return {
            x: Math.round(cx + radius * Math.cos(-this.toRad(angleDeg))),
            y: Math.round(cy + radius * Math.sin(-this.toRad(angleDeg))) // Negative because SVG Y-axis points down
        };
    }

    // Generates a label coordinate by pushing it towards the centroid of a polygon
    private getCornerLabel(px: number, py: number, cx: number, cy: number, dist: number, text: string) {
        const dx = cx - px;
        const dy = cy - py;
        const len = Math.sqrt(dx * dx + dy * dy);
        return { x: Math.round(px + (dx / len) * dist), y: Math.round(py + (dy / len) * dist), text };
    }

    // --- LEVEL 1: TERMINOLOGY ---
    private level1_Terminology(lang: string, variationKey?: string, options: any = {}): any {
        const pool = [
            { key: 'classification_visual', type: 'concept' },
            { key: 'classification_check_acute', type: 'concept' }
        ] as const;
        const v = variationKey || this.getVariation([...pool], options);

        if (v === 'classification_visual') {
            const type = MathUtils.randomChoice(['acute', 'right', 'obtuse', 'straight']);
            let angle = type === 'acute' ? MathUtils.randomInt(20, 80) : type === 'right' ? 90 : type === 'obtuse' ? MathUtils.randomInt(100, 170) : 180;
            const label = { sv: { acute: "Spetsig", right: "Rät", obtuse: "Trubbig", straight: "Rak" }, en: { acute: "Acute", right: "Right", obtuse: "Obtuse", straight: "Straight" } }[lang as 'sv' | 'en'][type as 'acute' | 'right' | 'obtuse' | 'straight'];
            
            const cx = 150, cy = 200, len = 100;
            const pt2 = this.calcPoint(cx, cy, len, angle);

            return {
                renderData: {
                    description: lang === 'sv' ? "Vad kallas denna typ av vinkel?" : "What is this type of angle called?",
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle(lang === 'sv' ? ["Spetsig", "Rät", "Trubbig", "Rak"] : ["Acute", "Right", "Obtuse", "Straight"]),
                    geometry: { type: 'angle', lines: [{x1: cx, y1: cy, x2: cx + len, y2: cy}, {x1: cx, y1: cy, x2: pt2.x, y2: pt2.y}], arcs: [{ center: {x: cx, y: cy}, startAngle: 0, endAngle: angle, radius: 40, label: `${angle}°` }] }
                },
                token: this.toBase64(label), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Vi kategoriserar vinklar genom att jämföra deras storlek med en rät vinkel (90°)." : "We classify angles by comparing their size to a right angle (90°).", latex: `\\text{Rät vinkel} = 90^\\circ` },
                    { text: lang === 'sv' ? `Kolla om figurens markerade vinkel på ${angle}° är större, mindre eller lika med 90°.` : `Check if the figure's marked angle of ${angle}° is larger, smaller, or equal to 90°.`, latex: `\\text{Aktuell vinkel} = ${angle}^\\circ` },
                    { 
                        text: type === 'acute' ? (lang === 'sv' ? `Eftersom ${angle}° är mindre än 90°, kallas vinkeln spetsig.` : `Since ${angle}° is less than 90°, the angle is acute.`) : type === 'right' ? (lang === 'sv' ? "Eftersom vinkeln är exakt 90°, kallas den för en rät vinkel." : "Since the angle is exactly 90°, it is a right angle.") : type === 'obtuse' ? (lang === 'sv' ? `Eftersom ${angle}° är större än 90° men mindre än 180°, kallas den trubbig.` : `Since ${angle}° is greater than 90° but less than 180°, it is obtuse.`) : (lang === 'sv' ? "Eftersom vinkeln är exakt 180°, kallas den för en rak vinkel." : "Since the angle is exactly 180°, it is a straight angle."),
                        latex: type === 'acute' ? `${angle}^\\circ < 90^\\circ \\rightarrow \\mathbf{\\text{${label}}}` : type === 'right' ? `${angle}^\\circ = 90^\\circ \\rightarrow \\mathbf{\\text{${label}}}` : type === 'obtuse' ? `90^\\circ < ${angle}^\\circ < 180^\\circ \\rightarrow \\mathbf{\\text{${label}}}` : `${angle}^\\circ = 180^\\circ \\rightarrow \\mathbf{\\text{${label}}}`
                    },
                    { text: lang === 'sv' ? `Svar: ${label}` : `Answer: ${label}`, latex: `\\text{${label}}` }
                ]
            };
        }

        if (v === 'classification_check_acute') {
            const angle = MathUtils.randomInt(15, 165);
            const ans = angle < 90 ? (lang === 'sv' ? "Ja" : "Yes") : (lang === 'sv' ? "Nej" : "No");
            return {
                renderData: {
                    description: lang === 'sv' ? `Är en vinkel på ${angle}° spetsig?` : `Is an angle of ${angle}° acute?`,
                    answerType: 'multiple_choice', options: lang === 'sv' ? ["Ja", "Nej"] : ["Yes", "No"]
                },
                token: this.toBase64(ans), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Kom ihåg regeln: En vinkel kallas spetsig om dess storlek ligger mellan 0° och 90°." : "Remember the definition: An angle is called acute if its size lies between 0° and 90°.", latex: `\\text{Spetsig vinkel} < 90^\\circ` },
                    { text: lang === 'sv' ? `Jämför nu uppgiftens givna vinkel på ${angle}° med gränsen på 90°.` : `Now compare the problem's given angle of ${angle}° against the 90° boundary.`, latex: `${angle}^\\circ \\mathbf{<} 90^\\circ` },
                    { 
                        text: angle < 90 ? (lang === 'sv' ? `Ja, eftersom ${angle}° är mindre än 90° så stämmer påståendet.` : `Yes, because ${angle}° is less than 90°, the statement is true.`) : (lang === 'sv' ? `Nej, eftersom ${angle}° är större än eller lika med 90° så är vinkeln inte spetsig.` : `No, because ${angle}° is greater than or equal to 90°, the angle is not acute.`),
                        latex: angle < 90 ? `${angle}^\\circ < 90^\\circ \\rightarrow \\mathbf{\\text{${ans}}}` : `${angle}^\\circ \\ge 90^\\circ \\rightarrow \\mathbf{\\text{${ans}}}`
                    },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, latex: `\\text{${ans}}` }
                ]
            };
        }
        return this.level1_Terminology(lang, 'classification_visual', options);
    }

    // --- LEVEL 2: COMP & SUPP ---
    private level2_CompSupp(lang: string, variationKey?: string, options: any = {}): any {
        const pool = [{ key: 'comp_supp_visual', type: 'calculate' }, { key: 'comp_supp_inverse', type: 'calculate' }];
        const v = variationKey || this.getVariation([...pool], options);
        const isSupp = Math.random() > 0.5;
        const total = isSupp ? 180 : 90;
        const known = MathUtils.randomChoice(this.CLEAN_ANGLES.filter(a => a < total - 10));
        const ans = total - known;
        
        // 🟢 FIXED: Mathematically accurate angles drawn via trig
        const cx = 150, cy = 180, len = 110;
        const ptCut = this.calcPoint(cx, cy, len, known);

        if (v === 'comp_supp_visual') {
            const lines = isSupp 
                ? [{x1: cx - len, y1: cy, x2: cx + len, y2: cy}, {x1: cx, y1: cy, x2: ptCut.x, y2: ptCut.y}] 
                : [{x1: cx, y1: cy, x2: cx + len, y2: cy}, {x1: cx, y1: cy, x2: cx, y2: cy - len}, {x1: cx, y1: cy, x2: ptCut.x, y2: ptCut.y}];
            
            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna x." : "Calculate x.",
                    answerType: 'numeric',
                    geometry: { type: 'angle', lines, arcs: [{center:{x:cx,y:cy}, startAngle:0, endAngle:known, radius:40, label:`${known}°`}, {center:{x:cx,y:cy}, startAngle:known, endAngle:total, radius:50, label:'x'}] }
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? (isSupp ? "Vinklarna ligger tillsammans längs en rak linje, vilket betyder att de bildar sidovinklar (180° totalt)." : "Vinklarna bildar tillsammans ett rätvinkligt hörn, vilket betyder att de är komplementvinklar (90° totalt).") : (isSupp ? "The angles lie together on a straight line, meaning they form supplementary angles (180° total)." : "The angles join together to form a right angle corner, meaning they are complementary angles (90° total)."), latex: `x + ${known}^\\circ = ${total}^\\circ` },
                    { text: lang === 'sv' ? `Minska med ${known}° på båda sidor för att lämna x ensamt.` : `Subtract ${known}° from both sides to isolate variable x.`, latex: `x + ${known}^\\circ \\mathbf{- ${known}^\\circ} = ${total}^\\circ \\mathbf{- ${known}^\\circ}` },
                    { text: lang === 'sv' ? "Förenkla uträkningen för att bestämma det okända värdet på vinkeln." : "Simplify the subtractions to compute the unknown angle value.", latex: `x = \\mathbf{${ans}^\\circ}` },
                    { text: lang === 'sv' ? `Svar: x = ${ans}` : `Answer: x = ${ans}`, latex: `x = ${ans}` }
                ]
            };
        }
        return this.level2_CompSupp(lang, 'comp_supp_visual', options);
    }

    // --- LEVEL 3: VERTICAL & SIDE ---
    private level3_Vertical(lang: string, variationKey?: string, options: any = {}): any {
        const pool = [{ key: 'vertical_side_visual', type: 'calculate' }, { key: 'vertical_side_lie', type: 'concept' }];
        const v = variationKey || this.getVariation([...pool], options);
        const a = MathUtils.randomChoice(this.CLEAN_ANGLES.filter(ang => ang > 20 && ang < 160 && ang !== 90));
        const b = 180 - a;
        const isVertical = Math.random() > 0.5;
        const target = isVertical ? a : b;

        // 🟢Mathematically accurate angles
        if (v === 'vertical_side_visual') {
            const cx = 150, cy = 125, len = 110;
            const ptRight = this.calcPoint(cx, cy, len, a);
            const ptLeft = this.calcPoint(cx, cy, len, 180 + a);

            const lines = [
                {x1: cx - len, y1: cy, x2: cx + len, y2: cy}, // Horizontal line
                {x1: ptLeft.x, y1: ptLeft.y, x2: ptRight.x, y2: ptRight.y} // Angled transversal line
            ];

            return {
                renderData: {
                    description: lang === 'sv' ? "Bestäm x." : "Determine x.",
                    answerType: 'numeric',
                    geometry: { type: 'angle', lines, arcs: [{center:{x:cx,y:cy}, startAngle:0, endAngle:a, radius:35, label:`${a}°`}, {center:{x:cx,y:cy}, startAngle: isVertical ? 180 : a, endAngle: isVertical ? 180+a : 180, radius:45, label:'x'}] }
                },
                token: this.toBase64(target.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? (isVertical ? `Vinklarna står mitt emot varandra där två linjer korsas, vilket innebär att de är vertikalvinklar.` : `Vinklarna ligger bredvid varandra på en rak linje, vilket innebär det är sidovinklar (180° totalt).`) : (isVertical ? `The angles sit opposite each other where two straight lines intersect, meaning they are vertical angles.` : `The angles sit adjacent to each other on a single straight line, meaning they are supplementary side angles (180° total).`), latex: isVertical ? `x = ${a}^\\circ` : `x + ${a}^\\circ = 180^\\circ` },
                    isVertical ? { text: lang === 'sv' ? "Eftersom vertikalvinklar alltid är helt identiska får vi x direkt utan uträkning." : "Since vertical angles are always completely identical, we obtain x directly without further calculation.", latex: `x = \\mathbf{${target}^\\circ}` } : { text: lang === 'sv' ? `Ta bort ${a}° genom att subtrahera det från 180° på båda sidor.` : `Isolate x by subtracting ${a}° from 180° on both sides.`, latex: `x + ${a}^\\circ \\mathbf{- ${a}^\\circ} = 180^\\circ \\mathbf{- ${a}^\\circ}` },
                    !isVertical ? { text: lang === 'sv' ? "Räkna ut subtraktionen för att bestämma vinkeln x." : "Perform the subtraction on the right side to determine angle x.", latex: `x = \\mathbf{${target}^\\circ}` } : { text: lang === 'sv' ? "Kontrollera att likheten stämmer." : "Confirm that the equality balance is correct.", latex: `${target}^\\circ = ${a}^\\circ` },
                    { text: lang === 'sv' ? `Svar: x = ${target}` : `Answer: x = ${target}`, latex: `x = ${target}` }
                ]
            };
        }
        return this.level3_Vertical(lang, 'vertical_side_visual', options);
    }

    // --- LEVEL 4: TRIANGLE SUM ---
    private level4_TriangleSum(lang: string, variationKey?: string, options: any = {}): any {
        const pool = [{ key: 'triangle_sum_visual', type: 'calculate' }, { key: 'triangle_isosceles', type: 'calculate' }];
        const v = variationKey || this.getVariation([...pool], options);
        
        if (v === 'triangle_sum_visual') {
            const a = MathUtils.randomInt(30, 75);
            const b = MathUtils.randomInt(30, 75);
            const ans = 180 - a - b;

            // 🟢 FIXED: Mathematically Exact Dynamic Triangle Calculation
            let baseLen = 160;
            const radA = this.toRad(a);
            const radB = this.toRad(b);
            
            let t = (baseLen * Math.sin(radB)) / Math.sin(this.toRad(a + b));
            let pt3x = t * Math.cos(radA);
            let pt3y = t * Math.sin(radA);

            // If the calculated height is taller than 140px, scale the entire triangle down proportionally.
            const maxHeight = 140; 
            if (pt3y > maxHeight) {
                const scale = maxHeight / pt3y;
                baseLen *= scale;
                pt3x *= scale;
                pt3y *= scale;
            }

            // Shift triangle to center of 300x250 canvas
            const offsetX = 150 - (baseLen / 2);
            const offsetY = 200; // bottom baseline

            const p1 = { x: offsetX, y: offsetY };
            const p2 = { x: offsetX + baseLen, y: offsetY };
            const p3 = { x: Math.round(offsetX + pt3x), y: Math.round(offsetY - pt3y) }; // Subtract y because SVG is inverted

            const centroidX = (p1.x + p2.x + p3.x) / 3;
            const centroidY = (p1.y + p2.y + p3.y) / 3;

            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna x i triangeln." : "Calculate x in the triangle.",
                    answerType: 'numeric',
                    geometry: { 
                        type: 'angle', 
                        polygons: [{ points: `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}` }], 
                        labels: [
                            this.getCornerLabel(p1.x, p1.y, centroidX, centroidY, 25, `${a}°`),
                            this.getCornerLabel(p2.x, p2.y, centroidX, centroidY, 25, `${b}°`),
                            this.getCornerLabel(p3.x, p3.y, centroidX, centroidY, 25, 'x')
                        ] 
                    }
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Kom ihåg regeln: Alla 3 vinklar i en triangel tillsammans blir exakt 180°." : "Remember the rule: The total combined sum of internal angles inside any triangle is always exactly 180°.", latex: `x + ${a}^\\circ + ${b}^\\circ = 180^\\circ` },
                    { text: lang === 'sv' ? `Addera de två kända vinklarna (${a}° + ${b}°) på vänster sida.` : `Add the two known internal angles (${a}° + ${b}°) together on the left side.`, latex: `x + \\mathbf{${a + b}^\\circ} = 180^\\circ` },
                    { text: lang === 'sv' ? `Isolera x genom att subtrahera ${a + b}° från 180° på båda sidor.` : `Isolate x by subtracting ${a + b}° from 180° on both sides.`, latex: `x + ${a + b}^\\circ \\mathbf{- ${a + b}^\\circ} = 180^\\circ \\mathbf{- ${a + b}^\\circ}` },
                    { text: lang === 'sv' ? "Förenkla siffertermerna för att räkna ut den saknade vinkeln." : "Simplify the constant scalar expressions to calculate the missing angle layout.", latex: `x = \\mathbf{${ans}^\\circ}` },
                    { text: lang === 'sv' ? `Svar: x = ${ans}` : `Answer: x = ${ans}`, latex: `x = ${ans}` }
                ]
            };
        }
        return this.level4_TriangleSum(lang, 'triangle_sum_visual', options);
    }

    // --- LEVEL 5: POLYGONS ---
    private level5_Polygons(lang: string, variationKey?: string, options: any = {}): any {
        const pool = [{ key: 'polygon_sum', type: 'calculate' }, { key: 'polygon_inverse', type: 'calculate' }, { key: 'quad_missing', type: 'calculate' }];
        const v = variationKey || this.getVariation([...pool], options);
        
        if (v === 'quad_missing') {
            let a = 0, b = 0, c = 0, ans = 0;
            let p1, p2, p3, p4;
            let t = 0;

            // 🟢 FIX: Reject and Reroll Malformed Shapes!
            // We loop until the random angles produce a quadrilateral where the left side 't' is at least 60px long (preventing label overlap), but no taller than 150px (preventing clipping).
            let isValidShape = false;
            while (!isValidShape) {
                a = MathUtils.randomInt(70, 110);
                b = MathUtils.randomInt(70, 110);
                c = MathUtils.randomInt(70, 110);
                ans = 360 - a - b - c;

                // Ensure the final calculated angle isn't wildly inverted or too sharp
                if (ans < 40 || ans > 140) continue;

                p1 = { x: 0, y: 0 };
                p2 = { x: 120, y: 0 };
                p3 = { 
                    x: 120 + 80 * Math.cos(this.toRad(180 - b)), 
                    y: 80 * Math.sin(this.toRad(180 - b)) 
                };
                
                const theta = 360 - b - c; 
                
                // Ray intersection algorithm
                const divisor = Math.sin(this.toRad(theta - a));
                if (Math.abs(divisor) < 0.01) continue; // Prevent dividing by zero if lines are parallel
                
                t = (p3.x * Math.sin(this.toRad(theta)) - p3.y * Math.cos(this.toRad(theta))) / divisor;
                
                p4 = {
                    x: t * Math.cos(this.toRad(a)),
                    y: t * Math.sin(this.toRad(a))
                };

                // Validate the structural integrity of the shape
                // t >= 60 ensures p1 and p4 are far enough apart so labels never overlap!
                if (t >= 60 && t <= 150 && p4.y > 30 && p4.y < 160 && p3.y > 30 && p3.y < 160) {
                    isValidShape = true;
                }
            }

            // Shift shape to fit nicely into 300x250 canvas
            const offsetX = 80;
            const offsetY = 200;

            const sp1 = { x: Math.round(p1.x + offsetX), y: Math.round(offsetY - p1.y) };
            const sp2 = { x: Math.round(p2.x + offsetX), y: Math.round(offsetY - p2.y) };
            const sp3 = { x: Math.round(p3.x + offsetX), y: Math.round(offsetY - p3.y) };
            const sp4 = { x: Math.round(p4.x + offsetX), y: Math.round(offsetY - p4.y) };

            const centroidX = (sp1.x + sp2.x + sp3.x + sp4.x) / 4;
            const centroidY = (sp1.y + sp2.y + sp3.y + sp4.y) / 4;

            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna x i fyrhörningen." : "Calculate x in the quadrilateral.",
                    answerType: 'numeric',
                    geometry: { 
                        type: 'angle', 
                        polygons: [{ points: `${sp1.x},${sp1.y} ${sp2.x},${sp2.y} ${sp3.x},${sp3.y} ${sp4.x},${sp4.y}` }], 
                        labels: [
                            this.getCornerLabel(sp1.x, sp1.y, centroidX, centroidY, 20, `${a}°`),
                            this.getCornerLabel(sp2.x, sp2.y, centroidX, centroidY, 20, `${b}°`),
                            this.getCornerLabel(sp3.x, sp3.y, centroidX, centroidY, 20, `${c}°`),
                            this.getCornerLabel(sp4.x, sp4.y, centroidX, centroidY, 20, 'x')
                        ] 
                    }
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Kom ihåg regeln: Alla vinklar i en fyrhörning tillsammans är alltid 360°." : "Remember the rule: All of the angles in a four sided shape together is always 360°.", latex: `x + ${a}^\\circ + ${b}^\\circ + ${c}^\\circ = 360^\\circ` },
                    { text: lang === 'sv' ? `Addera ihop de tre kända vinklarna (${a}° + ${b}° + ${c}°) tillsammans på vänster sida.` : `Add the three known tracking internal angles (${a}° + ${b}° + ${c}°) together on the left side.`, latex: `x + \\mathbf{${a + b + c}^\\circ} = 360^\\circ` },
                    { text: lang === 'sv' ? `Isolera x genom att subtrahera ${a + b + c}° från 360° på båda sidor.` : `Isolate x by subtracting ${a + b + c}° from 360° on both sides.`, latex: `x + ${a + b + c}^\\circ \\mathbf{- ${a + b + c}^\\circ} = 360^\\circ \\mathbf{- ${a + b + c}^\\circ}` },
                    { text: lang === 'sv' ? "Förenkla högerledet för att bestämma storleken på den fjärde vinkeln." : "Simplify the right side equation expression to resolve the size of the fourth angle.", latex: `x = \\mathbf{${ans}^\\circ}` },
                    { text: lang === 'sv' ? `Svar: x = ${ans}` : `Answer: x = ${ans}`, latex: `x = ${ans}` }
                ]
            };
        }
        return this.level5_Polygons(lang, 'quad_missing', options);
    }

    // --- LEVEL 6: PARALLEL ---
    private level6_Parallel(lang: string, variationKey?: string, options: any = {}): any {
        const pool = [{ key: 'parallel_visual', type: 'calculate' }, { key: 'parallel_lie', type: 'concept' }];
        const v = variationKey || this.getVariation([...pool], options);
        const angle = MathUtils.randomChoice([40, 50, 60, 70, 110, 120, 130]);

        if (v === 'parallel_visual') {
            const type = MathUtils.randomChoice(['corr', 'alt_int', 'alt_ext', 'interior']);
            const target = (type === 'interior') ? 180 - angle : angle;
            
            const cx = 150;
            const topY = 75;
            const botY = 175;
            const dy = (botY - topY) / 2; // 50
            const dx = dy / Math.tan(this.toRad(angle));

            const topIntersectX = cx + dx;
            const botIntersectX = cx - dx;

            // Transversal Line Extension bounds
            const transTopX = cx + (125 - 25) / Math.tan(this.toRad(angle));
            const transBotX = cx - (225 - 125) / Math.tan(this.toRad(angle));

            const lines = [
                {x1: 20, y1: topY, x2: 280, y2: topY}, // Parallel Top
                {x1: 20, y1: botY, x2: 280, y2: botY}, // Parallel Bottom
                {x1: Math.round(transTopX), y1: 25, x2: Math.round(transBotX), y2: 225} // Transversal
            ];

            // 🟢 FIXED: Dynamic Quadrant Bisectors with Anti-Pinch Scaling
            const getLabelPos = (ix: number, iy: number, quadrant: 'TR' | 'TL' | 'BR' | 'BL', text: string) => {
                let bisectDeg = 0;
                let sizeDeg = 0;
                
                // Define the exact bisector direction and the size of the angle in that quadrant
                switch(quadrant) {
                    case 'TR':
                        bisectDeg = -angle / 2;
                        sizeDeg = angle;
                        break;
                    case 'TL':
                        bisectDeg = -90 - angle / 2;
                        sizeDeg = 180 - angle;
                        break;
                    case 'BR':
                        bisectDeg = 90 - angle / 2;
                        sizeDeg = 180 - angle;
                        break;
                    case 'BL':
                        bisectDeg = 180 - angle / 2;
                        sizeDeg = angle;
                        break;
                }
                
                if (sizeDeg < 0) sizeDeg += 180; // Safety normalization
                
                // Dynamic distance: The sharper the angle, the further out we push the label to prevent clipping
                const R = 18; // Approximate text bounding box radius
                const d = Math.max(26, R / Math.sin(this.toRad(sizeDeg / 2)));
                
                return {
                    x: Math.round(ix + d * Math.cos(this.toRad(bisectDeg))),
                    y: Math.round(iy + d * Math.sin(this.toRad(bisectDeg))),
                    text
                };
            };

            const labels: any[] = [];

            // 🟢 FIXED: Mathematically accurate quadrant targeting
            // We now explicitly map the properties to the exact geometric quadrants that represent them!
            if (type === 'alt_int') { 
                // Alternate Interior: Inside parallel lines, opposite sides. (Size: angle & angle)
                labels.push(
                    getLabelPos(topIntersectX, topY, 'BL', `${angle}°`), 
                    getLabelPos(botIntersectX, botY, 'TR', 'x')
                ); 
            }
            else if (type === 'interior') { 
                // Consecutive Interior: Inside parallel lines, same side. (Size: 180-angle & angle)
                labels.push(
                    getLabelPos(topIntersectX, topY, 'BR', 'x'), 
                    getLabelPos(botIntersectX, botY, 'TR', `${angle}°`)
                ); 
            }
            else if (type === 'alt_ext') { 
                // Alternate Exterior: Outside parallel lines, opposite sides. (Size: angle & angle)
                labels.push(
                    getLabelPos(topIntersectX, topY, 'TR', `${angle}°`), 
                    getLabelPos(botIntersectX, botY, 'BL', 'x')
                ); 
            }
            else { 
                // Corresponding: Same relative position. (Size: angle & angle)
                labels.push(
                    getLabelPos(topIntersectX, topY, 'TR', `${angle}°`), 
                    getLabelPos(botIntersectX, botY, 'TR', 'x')
                ); 
            }

            const relTextSv = type === 'corr' ? "likbelägna vinklar (de är lika stora)" : type === 'alt_int' ? "alternatvinklar på insidan (de är lika stora)" : type === 'alt_ext' ? "alternatvinklar på utsidan (de är lika stora)" : "liksidiga inre vinklar (de blir tillsammans 180°)";
            const relTextEn = type === 'corr' ? "corresponding angles (they are equal)" : type === 'alt_int' ? "alternate interior angles (they are equal)" : type === 'alt_ext' ? "alternate exterior angles (they are equal)" : "consecutive interior angles (they supplement to 180°)";

            return {
                renderData: {
                    description: lang === 'sv' ? "Bestäm vinkeln x utifrån teorin om parallella linjer." : "Determine angle x using parallel lines angle theorems.",
                    answerType: 'numeric', geometry: { type: 'angle', lines, labels }
                },
                token: this.toBase64(target.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? `När en rät linje skär två parallella linjer kan vi identifiera vinkelrelationer. Här har vi ${relTextSv}.` : `When a transversal line crosses two parallel lines, we map out specific properties. Here we observe ${relTextEn}.`, latex: type === 'interior' ? `x + ${angle}^\\circ = 180^\\circ` : `x = ${angle}^\\circ` },
                    type === 'interior' ? { text: lang === 'sv' ? `Ta bort ${angle}° genom att subtrahera det från 180° på båda sidor.` : `Undo the constant addition by subtracting ${angle}° from 180° on both sides.`, latex: `x + ${angle}^\\circ \\mathbf{- ${angle}^\\circ} = 180^\\circ \\mathbf{- ${angle}^\\circ}` } : { text: lang === 'sv' ? "Eftersom vinklarna är direkt lika stora krävs ingen uträkning på tavlan." : "Since these matching angle configurations are equal by theorem, no complex calculation is required on the board.", latex: `x = \\mathbf{${target}^\\circ}` },
                    type === 'interior' ? { text: lang === 'sv' ? "Förenkla uträkningen för att bestämma värdet på x." : "Simplify the mathematical balance row layout to get x.", latex: `x = \\mathbf{${target}^\\circ}` } : { text: lang === 'sv' ? "Verifiera det slutgiltiga geometriska värdet." : "Verify the final geometric theorem output matching state.", latex: `${target}^\\circ = ${angle}^\\circ` },
                    { text: lang === 'sv' ? `Svar: x = ${target}` : `Answer: x = ${target}`, latex: `x = ${target}` }
                ]
            };
        }
        return this.level6_Parallel(lang, 'parallel_visual', options);
    }
}