import { MathUtils } from '../utils/MathUtils.js';

export class SimilarityGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_Concept(lang);
            case 2: return this.level2_CalcSide(lang);
            case 3: return this.level3_TopTriangle(lang);
            case 4: return this.level4_Pythagoras(lang);
            default: return this.level1_Concept(lang);
        }
    }

    /**
     * Phase 2: Targeted Generation
     * Allows the Question Studio to request a specific skill bucket.
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
                return this.level4_Pythagoras(lang, key);

            default:
                return this.generate(1, lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    // --- LEVEL 1: CONCEPT (Identifying Similarity) ---
    private level1_Concept(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['sim_rect_check', 'sim_tri_angle_check', 'sim_tri_side_check', 'sim_concept_lie']);
        const isSimilar = Math.random() > 0.5;

        if (v === 'sim_concept_lie') {
            const sTrue1 = lang === 'sv' ? "Alla liksidiga trianglar är likformiga." : "All equilateral triangles are similar.";
            const sTrue2 = lang === 'sv' ? "Alla cirklar är likformiga med varandra." : "All circles are similar to each other.";
            const sLie = lang === 'sv' ? "Alla rektanglar är likformiga." : "All rectangles are similar.";
            
            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket av följande påståenden om likformighet är FALSKT?" : "Which of the following statements about similarity is FALSE?",
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([sTrue1, sTrue2, sLie])
                },
                token: this.toBase64(sLie),
                clues: [{ text: lang === 'sv' ? "För att rektanglar ska vara likformiga måste förhållandet mellan långsida och kortsida vara detsamma. En kvadrat och en smal rektangel är inte likformiga." : "For rectangles to be similar, the ratio between the long side and the short side must be the same. A square and a thin rectangle are not similar." }],
                metadata: { variation_key: 'sim_concept_lie', difficulty: 1 }
            };
        }

        let geom: any = { type: 'similarity_compare' };
        let desc = "";
        let clues = [];

        if (v === 'sim_rect_check') {
            geom.shapeType = 'rectangle';
            const w1 = 4, h1 = 2;
            const k = isSimilar ? 2 : 1.5;
            const w2 = w1 * 2; // 8
            const h2 = isSimilar ? h1 * 2 : h1 * 1.2; // 4 or 2.4

            geom.left = { labels: { b: w1, h: h1 } };
            geom.right = { labels: { b: w2, h: h2 } };
            desc = lang === 'sv' ? "Avgör om rektanglarna är likformiga." : "Determine if the rectangles are similar.";
            clues.push({ text: lang === 'sv' ? "Dela de motsvarande sidorna med varandra. Om kvoten blir densamma är de likformiga." : "Divide corresponding sides by each other. If the quotient is the same, they are similar.", latex: `\\frac{${w2}}{${w1}} = ${w2/w1} \\quad \\text{vs} \\quad \\frac{${h2}}{${h1}} = ${h2/h1}` });
        } 
        else if (v === 'sim_tri_angle_check') {
            geom.shapeType = 'triangle';
            const a1 = 60, a2 = 70;
            const b1 = isSimilar ? a1 : a1 + 10;
            geom.left = { labels: { a1: `${a1}°`, a2: `${a2}°` } };
            geom.right = { labels: { a1: `${b1}°`, a2: `${a2}°` } };
            desc = lang === 'sv' ? "Är de två trianglarna likformiga baserat på vinklarna?" : "Are the two triangles similar based on their angles?";
            clues.push({ text: lang === 'sv' ? "Två trianglar är likformiga om de har exakt samma vinklar." : "Two triangles are similar if they have exactly the same angles." });
        }
        else {
            geom.shapeType = 'triangle';
            const s1 = 3, s2 = 5;
            const k = isSimilar ? 3 : 2;
            const r1 = s1 * 3;
            const r2 = isSimilar ? s2 * 3 : s2 * 2.5;
            geom.left = { labels: { s1: s1, s2: s2 } };
            geom.right = { labels: { s1: r1, s2: r2 } };
            desc = lang === 'sv' ? "Undersök sidorna. Är trianglarna likformiga?" : "Examine the sides. Are the triangles similar?";
            clues.push({ text: lang === 'sv' ? "Kontrollera om båda sidorna har förstorats med samma skala." : "Check if both sides have been magnified by the same scale.", latex: `\\frac{${r1}}{${s1}} = ${r1/s1} \\quad \\text{vs} \\quad \\frac{${r2}}{${s2}} = ${r2/s2}` });
        }

        const correct = isSimilar ? (lang === 'sv' ? "Ja" : "Yes") : (lang === 'sv' ? "Nej" : "No");
        return {
            renderData: {
                description: desc,
                answerType: 'multiple_choice',
                options: lang === 'sv' ? ["Ja", "Nej"] : ["Yes", "No"],
                geometry: geom
            },
            token: this.toBase64(correct),
            clues,
            metadata: { variation_key: v, difficulty: 1 }
        };
    }

    // --- LEVEL 2: CALCULATE SIDE ---
    private level2_CalcSide(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['sim_calc_big', 'sim_calc_small', 'sim_find_k']);
        const k = MathUtils.randomChoice([1.5, 2, 3, 5]);
        const s1 = 4, s2 = 6;
        const bigS1 = s1 * k, bigS2 = s2 * k;

        if (v === 'sim_find_k') {
            return {
                renderData: {
                    geometry: { type: 'similarity_compare', shapeType: 'rectangle', left: { labels: { b: s1, h: s2 } }, right: { labels: { b: bigS1, h: bigS2 } } },
                    description: lang === 'sv' ? "Figurerna är likformiga. Vilken är skalan (längdskalan) från den lilla till den stora figuren?" : "The shapes are similar. What is the scale (length scale) from the small to the large shape?",
                    answerType: 'numeric'
                },
                token: this.toBase64(k.toString()),
                clues: [{ text: lang === 'sv' ? "Du hittar skalan genom att dela den nya längden med den gamla längden." : "You find the scale by dividing the new length by the old length.", latex: `k = \\frac{${bigS1}}{${s1}} = ${k}` }],
                metadata: { variation_key: 'sim_find_k', difficulty: 2 }
            };
        }

        const findBig = v === 'sim_calc_big';
        const ans = findBig ? bigS1 : s1;

        return {
            renderData: {
                geometry: { 
                    type: 'similarity_compare', 
                    shapeType: 'triangle', 
                    left: { labels: findBig ? { s1: s1, s2: s2 } : { s1: 'x', s2: s2 } }, 
                    right: { labels: findBig ? { s1: 'x', s2: bigS2 } : { s1: bigS1, s2: bigS2 } } 
                },
                description: lang === 'sv' ? "Beräkna längden på den okända sidan x i de likformiga figurerna." : "Calculate the length of the unknown side x in the similar shapes.",
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()),
            clues: [
                { text: lang === 'sv' ? "Steg 1: Hitta skalan genom att jämföra sidorna du redan känner till." : "Step 1: Find the scale by comparing the sides you already know.", latex: `k = \\frac{${bigS2}}{${s2}} = ${k}` },
                { text: lang === 'sv' ? (findBig ? "Steg 2: Multiplicera den lilla sidan med skalan." : "Steg 2: Dela den stora sidan med skalan.") : (findBig ? "Step 2: Multiply the small side by the scale." : "Step 2: Divide the large side by the scale."), latex: findBig ? `${s1} \\cdot ${k} = ${ans}` : `${bigS1} / ${k} = ${ans}` }
            ],
            metadata: { variation_key: v, difficulty: 2 }
        };
    }

    // --- LEVEL 3: TOP TRIANGLE ---
    private level3_TopTriangle(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['transversal_total', 'transversal_extension', 'transversal_concept_id']);
        const top = 5, add = 3, smallBase = 4;
        const tot = top + add;
        const scale = tot / top; // 1.6
        const ans = smallBase * scale; // 6.4

        if (v === 'transversal_concept_id') {
            const ansLabel = lang === 'sv' ? "Topptriangeln och hela triangeln" : "The top triangle and the whole triangle";
            return {
                renderData: {
                    description: lang === 'sv' ? "I en figur med en topptriangel skapad av en parallelltransversal, vilka två figurer är likformiga?" : "In a figure with a top triangle created by a parallel transversal, which two shapes are similar?",
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([ansLabel, lang === 'sv' ? "Topptriangeln och den nedre fyrhörningen" : "The top triangle and the bottom quadrilateral", lang === 'sv' ? "Inga figurer är likformiga" : "No shapes are similar"])
                },
                token: this.toBase64(ansLabel),
                clues: [{ text: lang === 'sv' ? "Eftersom linjerna är parallella får de två trianglarna samma vinklar och blir därmed likformiga." : "Since the lines are parallel, the two triangles get the same angles and thus become similar." }],
                metadata: { variation_key: 'transversal_concept_id', difficulty: 2 }
            };
        }

        const isExt = v === 'transversal_extension';
        const visualLabels = isExt 
            ? { left_top: top, left_bot: add, base_top: smallBase, base_bot: 'x' }
            : { left_top: top, left_tot: tot, base_top: smallBase, base_bot: 'x' };

        return {
            renderData: {
                geometry: { type: 'transversal', labels: visualLabels },
                description: lang === 'sv' ? "Beräkna längden på basen x med hjälp av likformighet." : "Calculate the length of the base x using similarity.",
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()),
            clues: [
                { text: lang === 'sv' ? "Identifiera de två likformiga trianglarna: den lilla toppen och den stora helheten." : "Identify the two similar triangles: the small top and the large whole." },
                { text: lang === 'sv' ? (isExt ? `Hela sidans längd är ${top} + ${add} = ${tot}.` : `Skalan hittas genom att dela den stora sidan med den lilla.`) : (isExt ? `The total side length is ${top} + ${add} = ${tot}.` : `The scale is found by dividing the large side by the small one.`), latex: `k = \\frac{${tot}}{${top}} = ${scale}` }
            ],
            metadata: { variation_key: v, difficulty: 3 }
        };
    }

    // --- LEVEL 4: PYTHAGORAS & SIMILARITY ---
    private level4_Pythagoras(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['pythagoras_sim_hyp', 'pythagoras_sim_leg']);
        const a = 3, b = 4, c = 5;
        const k = 2;
        const bigA = a*k, bigB = b*k, bigC = c*k;

        const isHyp = v === 'pythagoras_sim_hyp';
        return {
            renderData: {
                geometry: { 
                    type: 'similarity_compare', shapeType: 'triangle', 
                    left: { labels: { b: a, h: b, hyp: c } }, 
                    right: { labels: isHyp ? { b: bigA, h: bigB, hyp: 'x' } : { b: 'x', h: bigB, hyp: bigC } } 
                },
                description: lang === 'sv' ? "Använd likformighet (eller Pythagoras sats) för att beräkna x." : "Use similarity (or Pythagoras' theorem) to calculate x.",
                answerType: 'numeric'
            },
            token: this.toBase64((isHyp ? bigC : bigA).toString()),
            clues: [
                { text: lang === 'sv' ? "Hitta skalan mellan trianglarna först." : "First find the scale between the triangles.", latex: `k = \\frac{${bigB}}{${b}} = ${k}` },
                { text: lang === 'sv' ? `Multiplicera motsvarande sida i den lilla triangeln med skalan ${k}.` : `Multiply the corresponding side in the small triangle by the scale ${k}.`, latex: isHyp ? `${c} \\cdot ${k} = ${bigC}` : `${a} \\cdot ${k} = ${bigA}` }
            ],
            metadata: { variation_key: v, difficulty: 4 }
        };
    }
}