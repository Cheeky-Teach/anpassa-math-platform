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
                    { 
                        text: lang === 'sv' ? "Vi klassificerar vinklar genom att jämföra deras storlek med en rät vinkel (90°)." : "We classify angles by comparing their size to a right angle (90°).", 
                        latex: `\\text{Rät vinkel} = 90^\\circ` 
                    },
                    { 
                        text: lang === 'sv' ? `Undersök om figurens markerade vinkel på ${angle}° är större, mindre eller lika med 90°.` : `Check if the figure's marked angle of ${angle}° is larger, smaller, or equal to 90°.`, 
                        latex: `\\text{Aktuell vinkel} = ${angle}^\\circ` 
                    },
                    { 
                        text: type === 'acute' 
                            ? (lang === 'sv' ? `Eftersom ${angle}° är mindre än 90°, kallas vinkeln för en spetsig vinkel.` : `Since ${angle}° is less than 90°, the angle is classified as an acute angle.`)
                            : type === 'right'
                            ? (lang === 'sv' ? "Eftersom vinkeln är exakt 90°, kallas den för en rät vinkel." : "Since the angle is exactly 90°, it is classified as a right angle.")
                            : type === 'obtuse'
                            ? (lang === 'sv' ? `Eftersom ${angle}° är större än 90° men mindre än 180°, kallas den för en trubbig vinkel.` : `Since ${angle}° is greater than 90° but less than 180°, it is classified as an obtuse angle.`)
                            : (lang === 'sv' ? "Eftersom vinkeln är exakt 180°, kallas den för en rak vinkel." : "Since the angle is exactly 180°, it is classified as a straight angle."),
                        latex: type === 'acute' ? `${angle}^\\circ < 90^\\circ \\rightarrow \\mathbf{\\text{${label}}}` : type === 'right' ? `${angle}^\\circ = 90^\\circ \\rightarrow \\mathbf{\\text{${label}}}` : type === 'obtuse' ? `90^\\circ < ${angle}^\\circ < 180^\\circ \\rightarrow \\mathbf{\\text{${label}}}` : `${angle}^\\circ = 180^\\circ \\rightarrow \\mathbf{\\text{${label}}}`
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${label}` : `Answer: ${label}`, 
                        latex: `\\text{${label}}` 
                    }
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
                    { 
                        text: lang === 'sv' ? "Kom ihåg regeln: En vinkel kallas spetsig om dess storlek ligger mellan 0° och 90°." : "Remember the definition: An angle is called acute if its size lies between 0° and 90°.", 
                        latex: `\\text{Spetsig vinkel} < 90^\\circ` 
                    },
                    { 
                        text: lang === 'sv' ? `Jämför nu uppgiftens givna vinkel på ${angle}° med gränsen på 90°.` : `Now compare the problem's given angle of ${angle}° against the 90° boundary.`, 
                        latex: `${angle}^\\circ \\mathbf{<} 90^\\circ` 
                    },
                    { 
                        text: angle < 90 
                            ? (lang === 'sv' ? `Ja, eftersom ${angle}° är mindre än 90° så stämmer påståendet.` : `Yes, because ${angle}° is less than 90°, the statement is true.`)
                            : (lang === 'sv' ? `Nej, eftersom ${angle}° är större än eller lika med 90° så är vinkeln inte spetsig.` : `No, because ${angle}° is greater than or equal to 90°, the angle is not acute.`),
                        latex: angle < 90 ? `${angle}^\\circ < 90^\\circ \\rightarrow \\mathbf{\\text{${ans}}}` : `${angle}^\\circ \\ge 90^\\circ \\rightarrow \\mathbf{\\text{${ans}}}`
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, 
                        latex: `\\text{${ans}}` 
                    }
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
                    { 
                        text: lang === 'sv' 
                            ? (isSupp ? "Vinklarna ligger tillsammans längs en rak linje, vilket betyder att de bildar sidovinklar (180° totalt)." : "Vinklarna bildar tillsammans ett rätvinkligt hörn, vilket betyder att de är komplementvinklar (90° totalt).")
                            : (isSupp ? "The angles lie together on a straight line, meaning they form supplementary angles (180° total)." : "The angles join together to form a right angle corner, meaning they are complementary angles (90° total)."), 
                        latex: `x + ${known}^\\circ = ${total}^\\circ` 
                    },
                    { 
                        text: lang === 'sv' ? `Minska med ${known}° på båda sidor för att lämna x ensamt.` : `Subtract ${known}° from both sides to isolate variable x.`, 
                        latex: `x + ${known}^\\circ \\mathbf{- ${known}^\\circ} = ${total}^\\circ \\mathbf{- ${known}^\\circ}` 
                    },
                    { 
                        text: lang === 'sv' ? "Förenkla uträkningen för att bestämma det okända värdet på vinkeln." : "Simplify the subtractions to compute the unknown angle value.", 
                        latex: `x = \\mathbf{${ans}^\\circ}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: x = ${ans}` : `Answer: x = ${ans}`, 
                        latex: `x = ${ans}` 
                    }
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
                    { 
                        text: lang === 'sv' 
                            ? (isVertical ? `Vinklarna står mitt emot varandra där två linjer korsas, vilket innebär att de är vertikalvinklar.` : `Vinklarna ligger bredvid varandra på en rak linje, vilket innebär det är sidovinklar (180° totalt).`)
                            : (isVertical ? `The angles sit opposite each other where two straight lines intersect, meaning they are vertical angles.` : `The angles sit adjacent to each other on a single straight line, meaning they are supplementary side angles (180° total).`),
                        latex: isVertical ? `x = ${a}^\\circ` : `x + ${a}^\\circ = 180^\\circ`
                    },
                    isVertical ? {
                        text: lang === 'sv' ? "Eftersom vertikalvinklar alltid är helt identiska får vi x direkt utan uträkning." : "Since vertical angles are always completely identical, we obtain x directly without further calculation.",
                        latex: `x = \\mathbf{${target}^\\circ}`
                    } : {
                        text: lang === 'sv' ? `Ta bort ${a}° genom att subtrahera det från 180° på båda sidor.` : `Isolate x by subtracting ${a}° from 180° on both sides.`,
                        latex: `x + ${a}^\\circ \\mathbf{- ${a}^\\circ} = 180^\\circ \\mathbf{- ${a}^\\circ}`
                    },
                    !isVertical ? {
                        text: lang === 'sv' ? "Räkna ut subtraktionen för att bestämma vinkeln x." : "Perform the subtraction on the right side to determine angle x.",
                        latex: `x = \\mathbf{${target}^\\circ}`
                    } : {
                        text: lang === 'sv' ? "Kontrollera att likheten stämmer." : "Confirm that the equality balance is correct.",
                        latex: `${target}^\\circ = ${a}^\\circ`
                    },
                    { 
                        text: lang === 'sv' ? `Svar: x = ${target}` : `Answer: x = ${target}`, 
                        latex: `x = ${target}` 
                    }
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
                    { 
                        text: lang === 'sv' ? "Kom ihåg geometrisatsen: Den sammanlagda vinkelsumman inuti en triangel är alltid exakt 180°." : "Remember the geometric rule: The total combined sum of internal angles inside any triangle is always exactly 180°.", 
                        latex: `x + ${a}^\\circ + ${b}^\\circ = 180^\\circ` 
                    },
                    { 
                        text: lang === 'sv' ? `Addera de två kända vinklarna (${a}° + ${b}°) på vänster sida.` : `Add the two known internal angles (${a}° + ${b}°) together on the left side.`, 
                        latex: `x + \\mathbf{${a + b}^\\circ} = 180^\\circ` 
                    },
                    { 
                        text: lang === 'sv' ? `Isolera x genom att subtrahera ${a + b}° från 180° på båda sidor.` : `Isolate x by subtracting ${a + b}° from 180° on both sides.`, 
                        latex: `x + ${a + b}^\\circ \\mathbf{- ${a + b}^\\circ} = 180^\\circ \\mathbf{- ${a + b}^\\circ}` 
                    },
                    { 
                        text: lang === 'sv' ? "Förenkla siffertermerna för att räkna ut den saknade vinkeln." : "Simplify the constant scalar expressions to calculate the missing angle layout.", 
                        latex: `x = \\mathbf{${ans}^\\circ}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: x = ${ans}` : `Answer: x = ${ans}`, 
                        latex: `x = ${ans}` 
                    }
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
                    { 
                        text: lang === 'sv' ? "Kom ihåg geometrisatsen: Den sammanlagda vinkelsumman inuti en fyrhörning (kvadrilateral) är alltid 360°." : "Remember the geometric rule: The total combined sum of internal angles inside a four-sided quadrilateral shape is always 360°.", 
                        latex: `x + ${a}^\\circ + ${b}^\\circ + ${c}^\\circ = 360^\\circ` 
                    },
                    { 
                        text: lang === 'sv' ? `Addera ihop de tre kända vinklarna (${a}° + ${b}° + ${c}°) tillsammans på vänster sida.` : `Add the three known tracking internal angles (${a}° + ${b}° + ${c}°) together on the left side.`, 
                        latex: `x + \\mathbf{${a + b + c}^\\circ} = 360^\\circ` 
                    },
                    { 
                        text: lang === 'sv' ? `Isolera x genom att subtrahera ${a + b + c}° från 360° på båda sidor.` : `Isolate x by subtracting ${a + b + c}° from 360° on both sides.`, 
                        latex: `x + ${a + b + c}^\\circ \\mathbf{- ${a + b + c}^\\circ} = 360^\\circ \\mathbf{- ${a + b + c}^\\circ}` 
                    },
                    { 
                        text: lang === 'sv' ? "Förenkla högerledet för att bestämma storleken på den fjärde vinkeln." : "Simplify the right side equation expression to resolve the size of the fourth angle.", 
                        latex: `x = \\mathbf{${ans}^\\circ}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: x = ${ans}` : `Answer: x = ${ans}`, 
                        latex: `x = ${ans}` 
                    }
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

            const relTextSv = type === 'corr' ? "likbelägna vinklar (de är lika stora)" : type === 'alt_int' ? "alternatvinklar på insidan (de är lika stora)" : type === 'alt_ext' ? "alternatvinklar på utsidan (de är lika stora)" : "liksidiga inre vinklar (de blir tillsammans 180°)";
            const relTextEn = type === 'corr' ? "corresponding angles (they are equal)" : type === 'alt_int' ? "alternate interior angles (they are equal)" : type === 'alt_ext' ? "alternate exterior angles (they are equal)" : "consecutive interior angles (they supplement to 180°)";

            return {
                renderData: {
                    description: lang === 'sv' ? "Bestäm vinkeln x utifrån teorin om parallella linjer." : "Determine angle x using parallel lines angle theorems.",
                    answerType: 'numeric', geometry: { type: 'angle', lines, labels }
                },
                token: this.toBase64(target.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? `När en rät linje skär två parallella linjer kan vi identifiera vinkelrelationer. Här har vi ${relTextSv}.` : `When a transversal line crosses two parallel lines, we map out specific properties. Here we observe ${relTextEn}.`,
                        latex: type === 'interior' ? `x + ${angle}^\\circ = 180^\\circ` : `x = ${angle}^\\circ`
                    },
                    type === 'interior' ? {
                        text: lang === 'sv' ? `Ta bort ${angle}° genom att subtrahera det från 180° på båda sidor.` : `Undo the constant addition by subtracting ${angle}° from 180° on both sides.`,
                        latex: `x + ${angle}^\\circ \\mathbf{- ${angle}^\\circ} = 180^\\circ \\mathbf{- ${angle}^\\circ}`
                    } : {
                        text: lang === 'sv' ? "Eftersom vinklarna är direkt lika stora krävs ingen uträkning på tavlan." : "Since these matching angle configurations are equal by theorem, no complex calculation is required on the board.",
                        latex: `x = \\mathbf{${target}^\\circ}`
                    },
                    type === 'interior' ? {
                        text: lang === 'sv' ? "Förenkla uträkningen för att bestämma värdet på x." : "Simplify the mathematical balance row layout to get x.",
                        latex: `x = \\mathbf{${target}^\\circ}`
                    } : {
                        text: lang === 'sv' ? "Verifiera det slutgiltiga geometriska värdet." : "Verify the final geometric theorem output matching state.",
                        latex: `${target}^\\circ = ${angle}^\\circ`
                    },
                    { 
                        text: lang === 'sv' ? `Svar: x = ${target}` : `Answer: x = ${target}`, 
                        latex: `x = ${target}` 
                    }
                ]
            };
        }
        return this.level6_Parallel(lang, 'parallel_visual', options);
    }
}