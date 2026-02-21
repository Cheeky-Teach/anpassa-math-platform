import { MathUtils } from '../utils/MathUtils.js';

export class SimilarityGen {
    // A pool of "instructive" scale factors to build student intuition
    private static readonly COMMON_K = [1.5, 2, 2.5, 3, 4, 5, 10];

    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        // Adaptive Fallback: If Level 1 concepts are mastered, push to Level 2 calculations
        if (level === 1 && options.hideConcept && options.exclude?.includes('sim_concept_lie')) {
            return this.level2_CalcSide(lang, undefined, options);
        }

        switch (level) {
            case 1: return this.level1_Concept(lang, undefined, options);
            case 2: return this.level2_CalcSide(lang, undefined, options);
            case 3: return this.level3_TopTriangle(lang, undefined, options);
            case 4: return this.level4_Mixed(lang, options);
            default: return this.level1_Concept(lang, undefined, options);
        }
    }

    /**
     * Targeted Generation for Question Studio
     * Maps ALL keys from skillBuckets.js to maintain Studio compatibility.
     */
    public generateByVariation(key: string, lang: string = 'sv'): any {
        switch (key) {
            case 'sim_rect_check':
            case 'sim_tri_angle_check':
            case 'sim_tri_side_check':
            case 'sim_concept_lie':
                return this.level1_Concept(lang, key);
            case 'sim_calc_big':
            case 'sim_calc_small':
            case 'sim_find_k':
            case 'sim_calc_lie':
                return this.level2_CalcSide(lang, key);
            case 'transversal_total':
            case 'transversal_extension':
            case 'transversal_concept_id':
                return this.level3_TopTriangle(lang, key);
            case 'pythagoras_sim_hyp':
            case 'pythagoras_sim_leg':
                // Redirect legacy Pythagoras keys to the new Mixed logic
                return this.level4_Mixed(lang, {});
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

    // --- LEVEL 1: CONCEPT (Identifying Similarity) ---
    private level1_Concept(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'sim_rect_check', type: 'concept' },
            { key: 'sim_tri_angle_check', type: 'concept' },
            { key: 'sim_tri_side_check', type: 'concept' },
            { key: 'sim_concept_lie', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'sim_concept_lie') {
            const sTrue1 = lang === 'sv' ? "Alla liksidiga trianglar är likformiga." : "All equilateral triangles are similar.";
            const sTrue2 = lang === 'sv' ? "Alla cirklar är likformiga med varandra." : "All circles are similar to each other.";
            const sLie = lang === 'sv' ? "Alla rektanglar är likformiga." : "All rectangles are similar.";
            
            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket av följande påståenden om likformighet är FALSKT?" : "Which of the following statements about similarity is FALSE?",
                    answerType: 'multiple_choice', options: MathUtils.shuffle([sTrue1, sTrue2, sLie])
                },
                token: this.toBase64(sLie), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: För att två figurer ska vara likformiga måste de ha samma form, men kan ha olika storlek." : "Step 1: For two shapes to be similar, they must have the same shape, but can be of different sizes." },
                    { text: lang === 'sv' ? "Steg 2: Alla cirklar har samma form. Alla liksidiga trianglar har alltid vinklarna 60°, 60°, 60°." : "Step 2: All circles have the same shape. All equilateral triangles always have the angles 60°, 60°, 60°." },
                    { text: lang === 'sv' ? "Steg 3: Rektanglar har alltid 90° vinklar, men förhållandet mellan långsida och kortsida kan variera." : "Step 3: Rectangles always have 90° angles, but the ratio between the long side and short side can vary." },
                    { text: lang === 'sv' ? `Svar: ${sLie}` : `Answer: ${sLie}` }
                ]
            };
        }

        const isSimilar = Math.random() > 0.5;
        const k = MathUtils.randomChoice(SimilarityGen.COMMON_K);
        let geom: any = { type: 'similarity_compare' };
        let desc = "", clueText = "", clueLatex = "";

        if (v === 'sim_rect_check') {
            geom.shapeType = 'rectangle';
            const w1 = MathUtils.randomInt(2, 5), h1 = MathUtils.randomInt(2, 4);
            const w2 = w1 * k;
            const h2 = isSimilar ? h1 * k : h1 * (k + 0.5);
            geom.left = { labels: { b: w1, h: h1 } };
            geom.right = { labels: { b: w2, h: h2 } };
            desc = lang === 'sv' ? "Avgör om de två rektanglarna nedan är likformiga." : "Determine if the two rectangles below are similar.";
            clueText = lang === 'sv' ? "Kontrollera om förhållandet mellan motsvarande sidor är detsamma." : "Check if the ratio between corresponding sides is the same.";
            clueLatex = `\\frac{${w2}}{${w1}} = ${w2/w1} \\quad \\text{vs} \\quad \\frac{${h2}}{${h1}} = ${h2/h1}`;
        } else if (v === 'sim_tri_angle_check') {
            geom.shapeType = 'triangle';
            const a1 = MathUtils.randomChoice([30, 45, 60]), a2 = MathUtils.randomChoice([40, 70, 80]);
            const b1 = isSimilar ? a1 : a1 + 10;
            geom.left = { labels: { a1: `${a1}°`, a2: `${a2}°` } };
            geom.right = { labels: { a1: `${b1}°`, a2: `${a2}°` } };
            desc = lang === 'sv' ? "Är trianglarna likformiga baserat på vinklarna?" : "Are the triangles similar based on the angles?";
            clueText = lang === 'sv' ? "Två trianglar är likformiga om alla deras motsvarande vinklar är lika stora." : "Two triangles are similar if all their corresponding angles are equal.";
        } else {
            geom.shapeType = 'triangle';
            const s1 = MathUtils.randomInt(3, 5), s2 = MathUtils.randomInt(6, 10);
            const r1 = s1 * k, r2 = isSimilar ? s2 * k : s2 * (k + 1);
            geom.left = { labels: { s1, s2 } };
            geom.right = { labels: { s1: r1, s2: r2 } };
            desc = lang === 'sv' ? "Undersök sidorna nedan. Är figurerna likformiga?" : "Examine the sides below. Are the shapes similar?";
            clueText = lang === 'sv' ? "Dividera måtten i den stora figuren med motsvarande mått i den lilla." : "Divide the measures in the large shape by the corresponding measures in the small one.";
            clueLatex = `\\frac{${r1}}{${s1}} = ${r1/s1} \\quad \\text{vs} \\quad \\frac{${r2}}{${s2}} = ${r2/s2}`;
        }

        const ans = isSimilar ? (lang === 'sv' ? "Ja" : "Yes") : (lang === 'sv' ? "Nej" : "No");
        return {
            renderData: { description: desc, answerType: 'multiple_choice', options: lang === 'sv' ? ["Ja", "Nej"] : ["Yes", "No"], geometry: geom },
            token: this.toBase64(ans), variationKey: v, type: 'concept',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Vid likformighet måste alla vinklar vara lika och sidorna proportionella." : "Step 1: In similarity, all angles must be equal and the sides must be proportional." },
                { text: clueText, latex: clueLatex },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ]
        };
    }

    // --- LEVEL 2: CALCULATE SIDE ---
    private level2_CalcSide(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'sim_calc_big', type: 'calculate' },
            { key: 'sim_calc_small', type: 'calculate' },
            { key: 'sim_find_k', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const k = MathUtils.randomChoice(SimilarityGen.COMMON_K);
        
        const shapeType = MathUtils.randomChoice(['rectangle', 'parallelogram', 'triangle']);
        const s1 = MathUtils.randomChoice([4, 6, 8, 10]), s2 = MathUtils.randomChoice([3, 5, 7, 9]);
        const bigS1 = s1 * k, bigS2 = s2 * k;

        if (v === 'sim_find_k') {
            return {
                renderData: {
                    geometry: { type: 'similarity_compare', shapeType, left: { labels: { b: s1, h: s2 } }, right: { labels: { b: bigS1, h: bigS2 } } },
                    description: lang === 'sv' ? "Figurerna är likformiga. Bestäm längdskalan från den lilla till den stora figuren." : "The shapes are similar. Determine the length scale from the small to the large shape.",
                    answerType: 'numeric'
                },
                token: this.toBase64(k.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Längdskalan (k) hittas genom att jämföra två motsvarande sidor." : "Step 1: The length scale (k) is found by comparing two corresponding sides." },
                    { text: lang === 'sv' ? "Steg 2: Dividera måttet i den nya figuren (den stora) med måttet i den gamla (den lilla)." : "Step 2: Divide the measure in the new shape (the large one) by the measure in the old one (the small one)." },
                    { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `k = \\frac{\\text{Bild}}{\\text{Verklighet}} = \\frac{${bigS1}}{${s1}}` },
                    { text: lang === 'sv' ? `Svar: ${k}` : `Answer: ${k}` }
                ]
            };
        }

        const findBig = v === 'sim_calc_big';
        const ans = findBig ? bigS1 : s1;
        const labelsL = findBig ? { b: s1, h: s2 } : { b: 'x', h: s2 };
        const labelsR = findBig ? { b: 'x', h: bigS2 } : { b: bigS1, h: bigS2 };

        return {
            renderData: {
                geometry: { type: 'similarity_compare', shapeType, left: { labels: labelsL }, right: { labels: labelsR } },
                description: lang === 'sv' ? `Beräkna den saknade sidan x i de likformiga figurerna.` : `Calculate the missing side x in the similar shapes.`,
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Identifiera vilka sidor som motsvarar varandra i de två figurerna." : "Step 1: Identify which sides correspond to each other in the two shapes." },
                { text: lang === 'sv' ? `Steg 2: Beräkna skalan (k) genom att dividera de kända sidorna.` : `Step 2: Calculate the scale (k) by dividing the known sides.`, latex: `k = \\frac{${bigS2}}{${s2}} = ${k}` },
                { text: lang === 'sv' ? (findBig ? `Steg 3: Eftersom vi söker en sida i den stora figuren, multiplicerar vi lilla sidans mått med skalan.` : `Steg 3: Eftersom vi söker en sida i den lilla figuren, dividerar vi stora sidans mått med skalan.`) : (findBig ? `Step 3: Since we are looking for a side in the large shape, multiply the small side's measure by the scale.` : `Step 3: Since we are looking for a side in the small shape, divide the large side's measure by the scale.`) },
                { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: findBig ? `${s1} · ${k} = ${ans}` : `${bigS1} / ${k} = ${ans}` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ]
        };
    }

    // --- LEVEL 3: TOP TRIANGLE ---
    private level3_TopTriangle(lang: string, variationKey?: string, options: any = {}): any {
        const v = variationKey || this.getVariation([
            { key: 'transversal_total', type: 'calculate' },
            { key: 'transversal_extension', type: 'calculate' },
            { key: 'transversal_concept_id', type: 'concept' }
        ], options);

        const top = MathUtils.randomChoice([2, 4, 5]), extra = MathUtils.randomChoice([3, 5, 6]);
        const smallBase = MathUtils.randomChoice([4, 8, 10]);
        const totSide = top + extra;
        const k = totSide / top;
        const bigBase = smallBase * k;

        if (v === 'transversal_concept_id') {
            const correct = lang === 'sv' ? "Topptriangeln och hela triangeln" : "The top triangle and the whole triangle";
            return {
                renderData: {
                    description: lang === 'sv' ? "När en triangel delas av en parallelltransversal, vilka två figurer är likformiga?" : "When a triangle is divided by a parallel transversal, which two shapes are similar?",
                    answerType: 'multiple_choice', options: MathUtils.shuffle([correct, lang === 'sv' ? "Den övre och den nedre delen" : "The upper and lower parts", lang === 'sv' ? "Inga delar är likformiga" : "No parts are similar"])
                },
                token: this.toBase64(correct), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: En parallelltransversal är en linje inuti en triangel som är parallell med basen." : "Step 1: A parallel transversal is a line inside a triangle that is parallel to the base." },
                    { text: lang === 'sv' ? "Steg 2: Detta skapar en liten 'topptriangel' som har exakt samma vinklar som den stora 'orginaltriangeln'." : "Step 2: This creates a small 'top triangle' that has exactly the same angles as the large 'original triangle'." },
                    { text: lang === 'sv' ? `Svar: ${correct}` : `Answer: ${correct}` }
                ]
            };
        }

        const isExt = v === 'transversal_extension';
        const labels = isExt 
            ? { left_top: top, left_bot: extra, base_top: smallBase, base_bot: 'x' }
            : { left_top: top, left_tot: totSide, base_top: smallBase, base_bot: 'x' };

        return {
            renderData: {
                geometry: { type: 'transversal', labels },
                description: lang === 'sv' ? "Beräkna längden på basen x med hjälp av likformighet." : "Calculate the length of base x using similarity.",
                answerType: 'numeric'
            },
            token: this.toBase64(bigBase.toString()), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Identifiera de två likformiga figurerna: den lilla topptriangeln och den stora hela triangeln." : "Step 1: Identify the two similar shapes: the small top triangle and the large whole triangle." },
                { text: lang === 'sv' ? (isExt ? `Steg 2: Beräkna hela sidans längd i den stora triangeln genom addition.` : `Steg 2: Hitta måtten för de motsvarande sidorna.`) : (isExt ? `Step 2: Calculate the total side length of the large triangle by addition.` : `Step 2: Find the measures of the corresponding sides.`), latex: isExt ? `${top} + ${extra} = ${totSide}` : "" },
                { text: lang === 'sv' ? `Steg 3: Beräkna skalfaktorn (k) genom att dividera stora sidans längd med lilla sidans längd.` : `Step 3: Calculate the scale factor (k) by dividing the large side length by the small side length.`, latex: `k = \\frac{${totSide}}{${top}} = ${k}` },
                { text: lang === 'sv' ? `Steg 4: Multiplicera den lilla basen (${smallBase}) med skalfaktorn för att hitta x.` : `Step 4: Multiply the small base (${smallBase}) by the scale factor to find x.`, latex: `${smallBase} · ${k} = ${bigBase}` },
                { text: lang === 'sv' ? `Svar: ${bigBase}` : `Answer: ${bigBase}` }
            ]
        };
    }

    // --- LEVEL 4: MIXED (Variety and Comprehensive Review) ---
    private level4_Mixed(lang: string, options: any): any {
        const subLevel = MathUtils.randomInt(1, 3);
        const data = this.generate(subLevel, lang, options);
        
        // Ensure metadata exists and mark as mixed
        if (!data.metadata) data.metadata = {};
        data.metadata.mixed = true;
        data.metadata.original_level = subLevel;
        
        return data;
    }
}