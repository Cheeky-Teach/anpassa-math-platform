import { MathUtils } from '../utils/MathUtils.js';

export class SimilarityGen {
    // A pool of "clean" scale factors that tend to repeat to build intuition
    private static readonly COMMON_K = [1.5, 1.5, 2, 2, 2, 2.5, 3, 3, 4, 5, 10];

    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_Concept(lang);
            case 2: return this.level2_CalcSide(lang);
            case 3: return this.level3_TopTriangle(lang);
            case 4: return this.level4_Pythagoras(lang);
            default: return this.level1_Concept(lang);
        }
    }

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
        const k = MathUtils.randomChoice(SimilarityGen.COMMON_K);

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
                    { text: lang === 'sv' ? "Rektanglar har alltid 90° vinklar, men för likformighet krävs även att förhållandet mellan sidorna är detsamma." : "Rectangles always have 90° angles, but similarity also requires the ratio between sides to be the same." },
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
            const w1 = MathUtils.randomInt(2, 6), h1 = MathUtils.randomInt(2, 5);
            const w2 = w1 * k;
            const h2 = isSimilar ? h1 * k : h1 * (k + 0.5);

            geom.left = { labels: { b: w1, h: h1 } };
            geom.right = { labels: { b: w2, h: h2 } };
            desc = lang === 'sv' ? "Avgör om rektanglarna nedan är likformiga." : "Determine if the rectangles below are similar.";
            clues.push({ text: lang === 'sv' ? "Jämför sidornas kvoter. Om kvoten är densamma för båda sidpar är de likformiga." : "Compare side ratios. If the ratio is the same for both pairs, they are similar.", latex: `\\frac{${w2}}{${w1}} = ${w2/w1} \\quad \\text{vs} \\quad \\frac{${h2}}{${h1}} = ${h2/h1}` });
        } 
        else if (v === 'sim_tri_angle_check') {
            geom.shapeType = 'triangle';
            const a1 = MathUtils.randomChoice([30, 45, 60]), a2 = MathUtils.randomChoice([40, 70, 80]);
            const b1 = isSimilar ? a1 : a1 + 5;
            geom.left = { labels: { a1: `${a1}°`, a2: `${a2}°` } };
            geom.right = { labels: { a1: `${b1}°`, a2: `${a2}°` } };
            desc = lang === 'sv' ? "Är trianglarna likformiga baserat på deras vinklar?" : "Are the triangles similar based on their angles?";
            clues.push({ text: lang === 'sv' ? "Två trianglar är likformiga om de har samma uppsättning vinklar." : "Two triangles are similar if they share the same set of angles." });
        }
        else {
            geom.shapeType = 'triangle';
            const s1 = MathUtils.randomInt(3, 5), s2 = MathUtils.randomInt(6, 10);
            const r1 = s1 * k;
            const r2 = isSimilar ? s2 * k : s2 * (k + 1);
            geom.left = { labels: { s1: s1, s2: s2 } };
            geom.right = { labels: { s1: r1, s2: r2 } };
            desc = lang === 'sv' ? "Undersök sidorna. Är trianglarna likformiga?" : "Examine the sides. Are the triangles similar?";
            clues.push({ text: lang === 'sv' ? "Kontrollera om skalfaktorn är densamma för båda kända sidor." : "Check if the scale factor is the same for both known sides.", latex: `\\frac{${r1}}{${s1}} = ${r1/s1} \\quad \\text{vs} \\quad \\frac{${r2}}{${s2}} = ${r2/s2}` });
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
        const k = MathUtils.randomChoice(SimilarityGen.COMMON_K);
        const s1 = MathUtils.randomChoice([4, 6, 8, 10, 12]), s2 = MathUtils.randomChoice([3, 5, 7, 9]);
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
                    { text: lang === 'sv' ? "Skalan hittas genom att dividera ett mått i den nya figuren med motsvarande mått i den gamla." : "The scale is found by dividing a dimension in the new shape by the corresponding dimension in the old one.", latex: `k = \\frac{\\text{ny}}{\\text{gammal}} \\rightarrow \\frac{${bigS1}}{${s1}} = ${k}` },
                    { text: lang === 'sv' ? "Skalan är:" : "The scale is:", latex: `${k}` }
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
                { text: lang === 'sv' ? "Hitta först skalan genom att jämföra de kända sidorna." : "First find the scale by comparing the known sides.", latex: `k = \\frac{${bigS2}}{${s2}} = ${k}` },
                { text: lang === 'sv' ? (findBig ? `Multiplicera nu den lilla sidan med skalan ${k}.` : `Dela nu den stora sidan med skalan ${k}.`) : (findBig ? `Multiply the small side by scale ${k}.` : `Divide the large side by scale ${k}.`), latex: findBig ? `${s1} \\cdot ${k} = ${ans} \\rightarrow x = ${ans}` : `${bigS1} / ${k} = ${ans} \\rightarrow x = ${ans}` },
                { text: lang === 'sv' ? "Värdet på x är:" : "The value of x is:", latex: `${ans}` }
            ],
            metadata: { variation_key: v, difficulty: 2 }
        };
    }

    // --- LEVEL 3: TOP TRIANGLE ---
    private level3_TopTriangle(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['transversal_total', 'transversal_extension', 'transversal_concept_id']);
        const top = MathUtils.randomChoice([2, 4, 5, 10]), add = MathUtils.randomChoice([2, 3, 5]), smallBase = MathUtils.randomChoice([4, 6, 8, 12]);
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
                    { text: lang === 'sv' ? "Eftersom linjerna är parallella får den lilla toppen samma vinklar som den stora hela triangeln." : "Since the lines are parallel, the small top gets the same angles as the large whole triangle." },
                    { text: lang === 'sv' ? "Rätt svar är:" : "The correct answer is:", latex: `\\text{${ansLabel}}` }
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
                description: lang === 'sv' ? "Använd likformighet för att beräkna basen x." : "Use similarity to calculate the base x.",
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()),
            clues: [
                { text: lang === 'sv' ? (isExt ? `Hitta hela sidans längd först: ${top} + ${add} = ${tot}.` : "Hitta skalan mellan den lilla toppen och den stora triangeln.") : (isExt ? `Find the total side length first: ${top} + ${add} = ${tot}.` : "Find the scale between the small top and the large triangle."), latex: `k = \\frac{${tot}}{${top}} = ${scale}` },
                { text: lang === 'sv' ? `Multiplicera den lilla basen med skalan ${scale}.` : `Multiply the small base by scale ${scale}.`, latex: `${smallBase} \\cdot ${scale} = ${ans} \\rightarrow x = ${ans}` },
                { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${ans}` }
            ],
            metadata: { variation_key: v, difficulty: 3 }
        };
    }

    // --- LEVEL 4: PYTHAGORAS & SIMILARITY ---
    private level4_Pythagoras(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['pythagoras_sim_hyp', 'pythagoras_sim_leg']);
        const triples = [[3, 4, 5], [5, 12, 13], [8, 15, 17]];
        const [a, b, c] = MathUtils.randomChoice(triples);
        const k = MathUtils.randomChoice([2, 3, 4]);
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
                description: lang === 'sv' ? "Trianglarna är likformiga. Beräkna sidan x." : "The triangles are similar. Calculate side x.",
                answerType: 'numeric'
            },
            token: this.toBase64(ansValue.toString()),
            clues: [
                { text: lang === 'sv' ? "Hitta skalan genom att jämföra de kända sidorna i figurerna." : "Find the scale by comparing the known sides of the figures.", latex: `k = \\frac{${bigB}}{${b}} = ${k}` },
                { text: lang === 'sv' ? `Använd skalan ${k} för att räkna ut x.` : `Use the scale ${k} to calculate x.`, latex: isHyp ? `${c} \\cdot ${k} = ${bigC} \\rightarrow x = ${bigC}` : `${bigC} / ${k} = ${a} \\rightarrow x = ${a*k}` },
                { text: lang === 'sv' ? "Värdet på x är:" : "The value of x is:", latex: `${ansValue}` }
            ],
            metadata: { variation_key: v, difficulty: 4 }
        };
    }
}