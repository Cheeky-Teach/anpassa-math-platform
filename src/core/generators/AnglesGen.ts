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
            const x2 = cx + len * Math.cos(-angle * Math.PI / 180);
            const y2 = cy + len * Math.sin(-angle * Math.PI / 180);

            return {
                renderData: {
                    description: lang === 'sv' ? "Vad kallas denna typ av vinkel?" : "What is this type of angle called?",
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle(lang === 'sv' ? ["Spetsig", "Rät", "Trubbig", "Rak"] : ["Acute", "Right", "Obtuse", "Straight"]),
                    geometry: { type: 'angle', lines: [{x1: cx, y1: cy, x2: cx + len, y2: cy}, {x1: cx, y1: cy, x2: x2, y2: y2}], arcs: [{ center: {x: cx, y: cy}, startAngle: 0, endAngle: angle, radius: 40, label: `${angle}°` }] }
                },
                token: this.toBase64(label), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Vi jämför vinklar med en rät vinkel ($90^\\circ$)." : "Step 1: We compare angles to a right angle ($90^\\circ$).", latex: `90^\\circ = \\text{${lang === 'sv' ? 'Rät' : 'Right'}}` },
                    { text: lang === 'sv' ? `Steg 2: En vinkel på ${angle}^\\circ$ kategoriseras som:` : `Step 2: An angle of ${angle}^\\circ$ is categorized as:`, latex: `${angle}^\\circ \\\\ \\text{${label}}` },
                    { text: label }
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
                    { text: lang === 'sv' ? "Steg 1: En vinkel är spetsig om den är mindre än $90^\\circ$." : "Step 1: An angle is acute if it is less than $90^\\circ$." },
                    { text: lang === 'sv' ? `Steg 2: Är ${angle}^\\circ < 90^\\circ?` : `Step 2: Is ${angle}^\\circ < 90^\\circ?`, latex: `${angle}^\\circ \\\\ \\text{${ans}}` },
                    { text: ans }
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
        const cx = 150, cy = 200, len = 120;

        if (v === 'comp_supp_visual') {
            const xCut = cx + len * Math.cos(-known * Math.PI / 180);
            const yCut = cy + len * Math.sin(-known * Math.PI / 180);
            const lines = isSupp ? [{x1: cx - len, y1: cy, x2: cx + len, y2: cy}, {x1: cx, y1: cy, x2: xCut, y2: yCut}] : [{x1: cx, y1: cy, x2: cx + len, y2: cy}, {x1: cx, y1: cy, x2: cx, y2: cy - len}, {x1: cx, y1: cy, x2: xCut, y2: yCut}];
            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna x." : "Calculate x.",
                    answerType: 'numeric',
                    geometry: { type: 'angle', lines, arcs: [{center:{x:cx,y:cy}, startAngle:0, endAngle:known, radius:40, label:`${known}°`}, {center:{x:cx,y:cy}, startAngle:known, endAngle:total, radius:50, label:'x'}] }
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? `Steg 1: Vinklar på en linje är $180^\\circ$, i ett hörn $90^\\circ$.` : `Step 1: Angles on a line are $180^\\circ$, in a corner $90^\\circ$.`, latex: `x + ${known}^\\circ = ${total}^\\circ` },
                    { text: lang === 'sv' ? "Steg 2: Subtrahera för att hitta x." : "Step 2: Subtract to find x.", latex: `${total} - ${known} \\\\ x = ${ans}` },
                    { text: ans.toString() }
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

        if (v === 'vertical_side_visual') {
            const cx = 150, cy = 125, len = 100;
            const lines = [{x1: cx - len, y1: cy, x2: cx + len, y2: cy}, {x1: cx - len * Math.cos(a * Math.PI/180), y1: cy + len * Math.sin(a * Math.PI/180), x2: cx + len * Math.cos(a * Math.PI/180), y2: cy - len * Math.sin(a * Math.PI/180)}];
            return {
                renderData: {
                    description: lang === 'sv' ? "Bestäm x." : "Determine x.",
                    answerType: 'numeric',
                    geometry: { type: 'angle', lines, arcs: [{center:{x:cx,y:cy}, startAngle:0, endAngle:a, radius:40, label:`${a}°`}, {center:{x:cx,y:cy}, startAngle: isVertical ? 180 : a, endAngle: isVertical ? 180+a : 180, radius:40, label:'x'}] }
                },
                token: this.toBase64(target.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? (isVertical ? "Steg 1: Vertikalvinklar är lika stora." : "Steg 1: Sidovinklar är totalt $180^\\circ$.") : (isVertical ? "Step 1: Vertical angles are equal." : "Step 1: Side angles sum to $180^\\circ$.") },
                    { text: lang === 'sv' ? "Steg 2: Lös ut x." : "Step 2: Solve for x.", latex: `${isVertical ? a : '180 - ' + a} \\\\ x = ${target}` },
                    { text: target.toString() }
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
            const a = MathUtils.randomInt(30, 75), b = MathUtils.randomInt(30, 75), ans = 180 - a - b;
            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna x i triangeln." : "Calculate x in the triangle.",
                    answerType: 'numeric',
                    geometry: { type: 'angle', polygons: [{ points: "50,220 250,220 150,50" }], labels: [{x: 75, y: 210, text: `${a}°`}, {x: 225, y: 210, text: `${b}°`}, {x: 150, y: 85, text: 'x'}] }
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Vinkelsumman i en triangel är $180^\\circ$." : "Step 1: The angle sum in a triangle is $180^\\circ$." },
                    { text: lang === 'sv' ? "Steg 2: Dra bort de kända vinklarna från 180." : "Step 2: Subtract the known angles from 180.", latex: `180 - ${a+b} \\\\ x = ${ans}` },
                    { text: ans.toString() }
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
            const a = MathUtils.randomInt(70, 110), b = MathUtils.randomInt(70, 110), c = MathUtils.randomInt(70, 110), ans = 360 - a - b - c;
            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna x i fyrhörningen." : "Calculate x in the quadrilateral.",
                    answerType: 'numeric',
                    geometry: { type: 'angle', polygons: [{ points: "50,50 250,50 230,200 70,200" }], labels: [{x: 70, y: 70, text: `${a}°`}, {x: 230, y: 70, text: `${b}°`}, {x: 210, y: 185, text: `${c}°`}, {x: 90, y: 185, text: 'x'}] }
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Vinkelsumman i en fyrhörning är $360^\\circ$." : "Step 1: The sum of angles in a quadrilateral is $360^\\circ$." },
                    { text: lang === 'sv' ? "Steg 2: Dra bort de kända vinklarna." : "Step 2: Subtract the known angles.", latex: `360 - ${a+b+c} \\\\ x = ${ans}` },
                    { text: ans.toString() }
                ]
            };
        }
        return this.level5_Polygons(lang, 'quad_missing', options);
    }

    // --- LEVEL 6: PARALLEL (Fixed Visual Logic) ---
    private level6_Parallel(lang: string, variationKey?: string, options: any = {}): any {
        const pool = [{ key: 'parallel_visual', type: 'calculate' }, { key: 'parallel_lie', type: 'concept' }];
        const v = variationKey || this.getVariation([...pool], options);
        const angle = MathUtils.randomChoice([40, 50, 60, 70, 110, 120, 130]);

        if (v === 'parallel_visual') {
            const type = MathUtils.randomChoice(['corr', 'alt_int', 'alt_ext', 'interior']);
            const target = (type === 'interior') ? 180 - angle : angle;
            const labels: any[] = [];
            
            // Fixed geometry points for consistent visualization
            const cy = 125;
            const lines = [{x1: 30, y1: 75, x2: 270, y2: 75}, {x1: 30, y1: 175, x2: 270, y2: 175}, {x1: 100, y1: 50, x2: 200, y2: 200}];

            // Precise label positioning based on angle relation type
            if (type === 'alt_int') { labels.push({ x: 145, y: 90, text: `${angle}°` }, { x: 155, y: 160, text: 'x' }); }
            else if (type === 'interior') { labels.push({ x: 145, y: 90, text: `${angle}°` }, { x: 195, y: 160, text: 'x' }); }
            else if (type === 'alt_ext') { labels.push({ x: 90, y: 60, text: `${angle}°` }, { x: 230, y: 190, text: 'x' }); }
            else { labels.push({ x: 145, y: 60, text: `${angle}°` }, { x: 215, y: 160, text: 'x' }); }

            const typeSv = type === 'interior' ? "liksidig inre" : "likbelägen eller alternat";
            return {
                renderData: {
                    description: lang === 'sv' ? "Bestäm vinkeln x (parallella linjer)." : "Determine angle x (parallel lines).",
                    answerType: 'numeric', geometry: { type: 'angle', lines, labels }
                },
                token: this.toBase64(target.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? `Steg 1: Vinklarna bildar en ${typeSv}-relation.` : `Step 1: Identify the angle relationship.` },
                    { text: lang === 'sv' ? "Steg 2: Beräkna x." : "Step 2: Solve for x.", latex: type === 'interior' ? `180 - ${angle} \\\\ x = ${target}` : `x = ${angle}` },
                    { text: target.toString() }
                ]
            };
        }
        return this.level6_Parallel(lang, 'parallel_visual', options);
    }
}