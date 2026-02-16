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
                clues: [
                    { text: lang === 'sv' ? "För att figurer ska vara likformiga måste alla vinklar vara lika och förhållandet mellan sidorna vara detsamma. Alla rektanglar har 90 graders vinklar, men deras sidförhållanden kan variera kraftigt." : "For shapes to be similar, all angles must be equal and the ratio between sides must be the same. All rectangles have 90-degree angles, but their side ratios can vary greatly." },
                    { text: lang === 'sv' ? "Därför är detta påstående lögnen:" : "Therefore, this statement is the lie:", latex: `\\text{${sLie}}` }
                ],
                metadata: { variation_key: 'sim_concept_lie', difficulty: 1 }
            };
        }

        let geom: any = { type: 'similarity_compare' };
        let desc = "";
        let clues = [];

        if (v === 'sim_rect_check') {
            geom.shapeType = 'rectangle';
            const w1 = 4, h1 = 2;
            const w2 = 8;
            const h2 = isSimilar ? h1 * 2 : h1 * 1.2;

            geom.left = { labels: { b: w1, h: h1 } };
            geom.right = { labels: { b: w2, h: h2 } };
            desc = lang === 'sv' ? "Avgör om rektanglarna nedan är likformiga." : "Determine if the rectangles below are similar.";
            clues.push({ text: lang === 'sv' ? "Dela de motsvarande sidorna med varandra. Om kvoten (skalan) blir exakt densamma är figurerna likformiga." : "Divide the corresponding sides by each other. If the quotient (scale) is exactly the same, the figures are similar.", latex: `\\frac{${w2}}{${w1}} = ${w2/w1} \\quad \\text{vs} \\quad \\frac{${h2}}{${h1}} = ${h2/h1}` });
        } 
        else if (v === 'sim_tri_angle_check') {
            geom.shapeType = 'triangle';
            const a1 = 60, a2 = 70;
            const b1 = isSimilar ? a1 : a1 + 10;
            geom.left = { labels: { a1: `${a1}°`, a2: `${a2}°` } };
            geom.right = { labels: { a1: `${b1}°`, a2: `${a2}°` } };
            desc = lang === 'sv' ? "Är trianglarna likformiga baserat på deras vinklar?" : "Are the triangles similar based on their angles?";
            clues.push({ text: lang === 'sv' ? "Två trianglar är likformiga om de har exakt samma uppsättning vinklar." : "Two triangles are similar if they have the exact same set of angles." });
        }
        else {
            geom.shapeType = 'triangle';
            const s1 = 3, s2 = 5;
            const r1 = s1 * 3;
            const r2 = isSimilar ? s2 * 3 : s2 * 2.5;
            geom.left = { labels: { s1: s1, s2: s2 } };
            geom.right = { labels: { s1: r1, s2: r2 } };
            desc = lang === 'sv' ? "Undersök sidorna i figurerna. Är trianglarna likformiga?" : "Examine the sides of the figures. Are the triangles similar?";
            clues.push({ text: lang === 'sv' ? "Kontrollera om förhållandet mellan de korta sidorna är detsamma som förhållandet mellan de långa sidorna." : "Check if the ratio between the short sides is the same as the ratio between the long sides.", latex: `\\frac{${r1}}{${s1}} = ${r1/s1} \\quad \\text{vs} \\quad \\frac{${r2}}{${s2}} = ${r2/s2}` });
        }

        const correct = isSimilar ? (lang === 'sv' ? "Ja" : "Yes") : (lang === 'sv' ? "Nej" : "No");
        clues.push({ text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `\\text{${correct}}` });

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
                    description: lang === 'sv' ? "Figurerna är likformiga. Vilken är längdskalan från den lilla till den stora figuren?" : "The shapes are similar. What is the length scale from the small to the large shape?",
                    answerType: 'numeric'
                },
                token: this.toBase64(k.toString()),
                clues: [
                    { text: lang === 'sv' ? "Skalan hittas genom att dividera ett mått i den nya figuren med motsvarande mått i den ursprungliga figuren." : "The scale is found by dividing a dimension in the new figure by the corresponding dimension in the original figure.", latex: `\\frac{\\text{ny}}{\\text{gammal}}` },
                    { text: lang === 'sv' ? "Uträkningen blir:" : "The calculation is:", latex: `\\frac{${bigS1}}{${s1}} = ${k}` }
                ],
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
                description: lang === 'sv' ? "Beräkna längden på sidan x i de likformiga figurerna." : "Calculate the length of side x in the similar shapes.",
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()),
            clues: [
                { text: lang === 'sv' ? "Hitta först skalan genom att jämföra de sidor som vi känner till i båda trianglarna." : "First find the scale by comparing the sides we know in both triangles.", latex: `frac{${bigS2}}{${s2}} = ${k}` },
                { text: lang === 'sv' ? (findBig ? `Multiplicera nu den lilla sidan med skalan ${k} för att få den stora sidan.` : `Dela nu den stora sidan med skalan ${k} för att få den lilla sidan.`) : (findBig ? `Multiply the small side by the scale ${k} to get the large side.` : `Divide the large side by the scale ${k} to get the small side.`), latex: findBig ? `${s1} \\cdot ${k} = ${ans} \\\\ x = ${ans}` : `${bigS1} / ${k} = ${ans} \\\\ x = ${ans}` },
                { text: lang === 'sv' ? "Värdet på x är:" : "The value of x is:", latex: `${ans}` }
            ],
            metadata: { variation_key: v, difficulty: 2 }
        };
    }

    // --- LEVEL 3: TOP TRIANGLE ---
    private level3_TopTriangle(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['transversal_total', 'transversal_extension', 'transversal_concept_id']);
        const top = 5, add = 3, smallBase = 4;
        const tot = top + add;
        const scale = tot / top; 
        const ans = smallBase * scale;

        if (v === 'transversal_concept_id') {
            const ansLabel = lang === 'sv' ? "Topptriangeln och hela triangeln" : "The top triangle and the whole triangle";
            return {
                renderData: {
                    description: lang === 'sv' ? "I en triangel med en parallelltransversal, vilka två figurer är likformiga?" : "In a triangle with a parallel transversal, which two shapes are similar?",
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([ansLabel, lang === 'sv' ? "Topptriangeln och den nedre fyrhörningen" : "The top triangle and the bottom quadrilateral", lang === 'sv' ? "Inga figurer är likformiga" : "No shapes are similar"])
                },
                token: this.toBase64(ansLabel),
                clues: [
                    { text: lang === 'sv' ? "Eftersom toppens baslinje är parallell med den stora triangelns baslinje, får den lilla triangeln längst upp exakt samma vinklar som den stora triangeln." : "Since the top's baseline is parallel to the large triangle's baseline, the small triangle at the top gets exactly the same angles as the large triangle." },
                    { text: lang === 'sv' ? "Därför är dessa likformiga:" : "Therefore, these are similar:", latex: `\\text{${ansLabel}}` }
                ],
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
                description: lang === 'sv' ? "Använd likformighet för att beräkna basen x i figuren." : "Use similarity to calculate the base x in the figure.",
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()),
            clues: [
                { text: lang === 'sv' ? "Identifiera den lilla topptriangeln och den stora hela triangeln som de två likformiga figurerna." : "Identify the small top triangle and the large whole triangle as the two similar shapes." },
                { text: lang === 'sv' ? (isExt ? `Hitta längden på den stora triangelns sida genom att lägga ihop delarna.` : `Hitta skalan genom att dela den stora sidans längd med den lilla sidans längd.`) : (isExt ? `Find the length of the large triangle's side by adding the parts together.` : `Find the scale by dividing the large side length by the small side length.`), latex: isExt ? `${top} + ${add} = ${tot} \\\\ \\frac{${tot}}{${top}} = ${scale}` : `\\frac{${tot}}{${top}} = ${scale}` },
                { text: lang === 'sv' ? `Multiplicera den lilla basen med skalan för att få x.` : `Multiply the small base by the scale to get x.`, latex: `${smallBase} \\cdot ${scale} = ${ans} \\\\ x = ${ans}` },
                { text: lang === 'sv' ? "Svaret blir:" : "The answer is:", latex: `${ans}` }
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
        const ansValue = isHyp ? bigC : bigA;

        return {
            renderData: {
                geometry: { 
                    type: 'similarity_compare', shapeType: 'triangle', 
                    left: { labels: { b: a, h: b, hyp: c } }, 
                    right: { labels: isHyp ? { b: bigA, h: bigB, hyp: 'x' } : { b: 'x', h: bigB, hyp: bigC } } 
                },
                description: lang === 'sv' ? "Trianglarna är likformiga. Beräkna längden på sidan x." : "The triangles are similar. Calculate the length of side x.",
                answerType: 'numeric'
            },
            token: this.toBase64(ansValue.toString()),
            clues: [
                { text: lang === 'sv' ? "Hitta först skalan genom att jämföra de sidor som är kända i båda figurerna." : "First find the scale by comparing the sides that are known in both figures.", latex: `\\frac{${bigB}}{${b}} = ${k}` },
                { text: lang === 'sv' ? `Använd skalan ${k} för att räkna ut den okända sidan x.` : `Use the scale ${k} to calculate the unknown side x.`, latex: isHyp ? `${c} \\cdot ${k} = ${bigC} \\\\ x = ${bigC}` : `${a} \\cdot ${k} = ${bigA} \\\\ x = ${bigA}` },
                { text: lang === 'sv' ? "Värdet på x är:" : "The value of x is:", latex: `${ansValue}` }
            ],
            metadata: { variation_key: v, difficulty: 4 }
        };
    }
}