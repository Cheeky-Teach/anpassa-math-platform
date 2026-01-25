import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { TERMS, t, Language } from "../utils/i18n";

export class SimilarityGenerator {
    public static generate(level: number, seed: string, lang: Language = 'sv', multiplier: number = 1): GeneratedQuestion {
        const rng = new Random(seed);
        const formatColor = (val: string | number) => `\\textcolor{#D35400}{\\mathbf{${val}}}`;

        let steps: Clue[] = [];
        let qData: any = { 
            text_key: "", 
            description: "", 
            latex: "", 
            answer: 0,
            answerType: "numeric"
        };

        // --- LEVEL 1: Similar or Not? (Visual/Concept) ---
        if (level === 1) {
            const isSimilar = rng.intBetween(0, 1) === 1;
            // Weighted choice: rectangles are easier, triangles with angles are distinct
            const type = rng.pick(['rect_sides', 'tri_sides', 'tri_angles']);
            
            let shapeData: any = { type: 'similarity_compare', shapeType: 'triangle', left: {}, right: {} };
            
            qData.answerType = 'multiple_choice';
            qData.choices = lang === 'sv' ? ['Ja', 'Nej'] : ['Yes', 'No'];
            qData.answer = isSimilar ? qData.choices[0] : qData.choices[1];

            if (type === 'rect_sides') {
                shapeData.shapeType = 'rectangle';
                const w1 = rng.intBetween(2, 5) * 10;
                const h1 = rng.intBetween(2, 5) * 10;
                
                const k = isSimilar ? rng.pick([1.5, 2, 0.5]) : rng.pick([1.2, 1.8, 0.8]);
                const w2 = Math.round(w1 * k);
                // If similar, h2 matches k. If not, h2 is distorted.
                const h2 = isSimilar ? Math.round(h1 * k) : Math.round(h1 * (k + 0.5));

                shapeData.left = { labels: { b: w1, h: h1 } };
                shapeData.right = { labels: { b: w2, h: h2 } };
                
                qData.description = { sv: "Är rektanglarna likformiga?", en: "Are the rectangles similar?" };
                steps.push({ 
                    text: t(lang, { sv: `Jämför sidornas förhållande: ${w2}/${w1} vs ${h2}/${h1}`, en: `Compare ratios: ${w2}/${w1} vs ${h2}/${h1}` }), 
                    latex: "" 
                });
            } 
            else if (type === 'tri_angles') {
                shapeData.shapeType = 'triangle';
                // Generate base angles for Isosceles or Scalene
                const a1 = rng.intBetween(40, 75);
                const a2 = rng.intBetween(40, 75);
                
                // Similar = same angles. Not similar = change one angle significantly.
                const b1 = isSimilar ? a1 : a1 + rng.pick([-15, 15]);
                const b2 = isSimilar ? a2 : a2;

                shapeData.left = { labels: { a1: `${a1}°`, a2: `${a2}°` } };
                shapeData.right = { labels: { a1: `${b1}°`, a2: `${b2}°` } };

                qData.description = { sv: "Är trianglarna likformiga?", en: "Are the triangles similar?" };
                steps.push({ 
                    text: t(lang, { sv: "Likformiga trianglar har samma vinklar.", en: "Similar triangles have equal angles." }), 
                    latex: "" 
                });
            }
            else { // tri_sides
                shapeData.shapeType = 'triangle';
                const s1 = rng.intBetween(4, 9);
                const s2 = rng.intBetween(4, 9);
                
                const k = isSimilar ? 2 : 1.5;
                // If not similar, distort one side
                const r1 = s1 * k;
                const r2 = isSimilar ? s2 * k : Math.floor(s2 * (k + 0.4));

                shapeData.left = { labels: { s1: s1, s2: s2 } };
                shapeData.right = { labels: { s1: r1, s2: r2 } };
                qData.description = { sv: "Är trianglarna likformiga?", en: "Are the triangles similar?" };
                
                steps.push({ 
                    text: t(lang, { sv: "Jämför kvoterna mellan motsvarande sidor.", en: "Compare the ratios of corresponding sides." }), 
                    latex: `${r1}/${s1} \\text{ vs } ${r2}/${s2}` 
                });
            }

            qData.renderData = { text_key: "sim_check", description: qData.description, latex: "", answerType: "multiple_choice", choices: qData.choices, geometry: shapeData };
        }

        // --- LEVEL 2: Find Side (x) in Similar Shapes ---
        else if (level === 2) {
            const k = rng.pick([2, 3, 4, 1.5]);
            const isRect = rng.intBetween(0, 1) === 1;
            
            let w1 = rng.intBetween(3, 8);
            let h1 = rng.intBetween(4, 10);
            let w2 = Math.round(w1 * k * 10) / 10;
            let h2 = Math.round(h1 * k * 10) / 10;

            const missing = rng.pick(['w2', 'h2']);
            let answerVal = 0;

            let lLabels: any = {};
            let rLabels: any = {};

            if (isRect) {
                lLabels = { b: w1, h: h1 };
                rLabels = { b: w2, h: h2 };
                if (missing === 'w2') { rLabels.b = 'x'; answerVal = w2; }
                else { rLabels.h = 'x'; answerVal = h2; }
            } else {
                // Triangle sides mapping
                lLabels = { s1: w1, s2: h1 };
                rLabels = { s1: w2, s2: h2 };
                if (missing === 'w2') { rLabels.s1 = 'x'; answerVal = w2; }
                else { rLabels.s2 = 'x'; answerVal = h2; }
            }

            qData.answer = answerVal;
            qData.description = { sv: "Figurerna är likformiga. Beräkna x.", en: "The shapes are similar. Calculate x." };
            
            steps.push({
                text: t(lang, { sv: "Skala = Stor / Liten", en: "Scale = Big / Small" }),
                latex: missing === 'w2' ? `k = ${h2}/${h1} = ${k}` : `k = ${w2}/${w1} = ${k}`
            });
            steps.push({
                text: t(lang, { sv: "Multiplicera sidan med skalan", en: "Multiply side by scale" }),
                latex: `x = ${missing === 'w2' ? w1 : h1} \\cdot ${k} = ${formatColor(answerVal)}`
            });

            qData.renderData = {
                text_key: "sim_calc", description: qData.description, latex: "", answerType: "numeric",
                geometry: { type: 'similarity_compare', shapeType: isRect ? 'rectangle' : 'triangle', left: { labels: lLabels }, right: { labels: rLabels } }
            };
        }

        // --- LEVEL 3: Top Triangle Theorem (Transversal) ---
        else if (level === 3) {
            // Setup: Small triangle on top of big triangle
            const topSide = rng.intBetween(5, 12);
            const addSide = rng.intBetween(4, 10);
            const totSide = topSide + addSide;
            
            const k = totSide / topSide; // Scale factor
            
            const baseTop = rng.intBetween(6, 14);
            const baseBot = Math.round(baseTop * k * 10) / 10;

            const mode = rng.pick(['find_base', 'find_side']);
            let answerVal = 0;
            let geom: any = { labels: { base_top: baseTop, base_bot: baseBot, left_top: topSide, left_tot: totSide } };

            if (mode === 'find_base') {
                // Hide baseBot
                answerVal = baseBot;
                geom.labels.base_bot = 'x';
                steps = [
                    { text: t(lang, { sv: "Topptriangelsatsen: Liten/Stor", en: "Top Triangle Theorem: Small/Big" }), latex: `\\frac{${topSide}}{${totSide}} = \\frac{${baseTop}}{x}` },
                    { text: t(lang, { sv: "Beräkna x", en: "Calculate x" }), latex: `x = \\frac{${baseTop} \\cdot ${totSide}}{${topSide}} = ${formatColor(answerVal)}` }
                ];
            } else {
                // Hide total side
                answerVal = totSide;
                geom.labels.left_tot = 'x';
                steps = [
                    { text: t(lang, { sv: "Skala mellan baserna", en: "Scale between bases" }), latex: `k = \\frac{${baseBot}}{${baseTop}}` },
                    { text: t(lang, { sv: "Multiplicera toppens sida", en: "Multiply top side" }), latex: `x = ${topSide} \\cdot ${Math.round(k*100)/100} = ${formatColor(answerVal)}` }
                ];
            }

            qData.answer = answerVal;
            qData.description = { sv: "Linjen i mitten är parallell med basen. Beräkna x.", en: "The middle line is parallel to the base. Calculate x." };
            qData.renderData = { text_key: "top_tri", description: qData.description, latex: "", answerType: "numeric", geometry: { type: 'transversal', ...geom } };
        }

        // --- LEVEL 4: Hourglass / Butterfly (Likformighet) ---
        else {
            const k = rng.pick([1.5, 2, 2.5, 3]);
            
            const topBase = rng.intBetween(5, 12);
            const botBase = topBase * k;
            
            const topSide = rng.intBetween(4, 10);
            const botSide = topSide * k;

            // Decide which to hide. Usually hide a side on the 'x' variable.
            // In hourglass, top corresponds to bottom.
            const findBot = rng.intBetween(0, 1) === 1;
            const answerVal = findBot ? botSide : topSide;

            let geom = { 
                type: 'hourglass',
                labels: {
                    top_base: topBase,
                    bot_base: botBase,
                    top_side: findBot ? topSide : 'x',
                    bot_side: findBot ? 'x' : botSide
                }
            };

            qData.answer = answerVal;
            qData.description = { sv: "De horisontella linjerna är parallella. Beräkna x.", en: "The horizontal lines are parallel. Calculate x." };
            
            steps = [
                { text: t(lang, { sv: "Vertikalvinklar + Parallell = Likformiga", en: "Vertical angles + Parallel = Similar" }), latex: "\\Delta_{upp} \\sim \\Delta_{ner}" },
                { text: t(lang, { sv: "Beräkna skalan k", en: "Calculate scale k" }), latex: `k = \\frac{${botBase}}{${topBase}} = ${k}` },
                { text: t(lang, { sv: "Använd skalan", en: "Use the scale" }), latex: findBot ? `x = ${topSide} \\cdot ${k} = ${formatColor(answerVal)}` : `x = ${botSide} / ${k} = ${formatColor(answerVal)}` }
            ];

            qData.renderData = { text_key: "hourglass", description: qData.description, latex: "", answerType: "numeric", geometry: geom };
        }

        return {
            questionId: `sim-l${level}-${seed}`,
            renderData: qData.renderData,
            serverData: { answer: qData.answer, solutionSteps: steps }
        };
    }
}