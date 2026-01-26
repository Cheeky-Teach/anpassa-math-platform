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
                const h2 = isSimilar ? Math.round(h1 * k) : Math.round(h1 * (k + 0.5));

                shapeData.left = { labels: { b: w1, h: h1 } };
                shapeData.right = { labels: { b: w2, h: h2 } };
                
                qData.description = { sv: "Är rektanglarna likformiga?", en: "Are the rectangles similar?" };
                steps.push({ 
                    text: t(lang, { 
                        sv: `För att de ska vara likformiga måste förhållandet mellan sidorna vara samma. Jämför baserna och höjderna.`, 
                        en: `For them to be similar, the ratio between sides must be the same. Compare the bases and heights.` 
                    }), 
                    latex: `\\frac{${w2}}{${w1}} \\text{ vs } \\frac{${h2}}{${h1}}` 
                });
            } 
            else if (type === 'tri_angles') {
                shapeData.shapeType = 'triangle';
                const a1 = rng.intBetween(40, 75);
                const a2 = rng.intBetween(40, 75);
                
                const b1 = isSimilar ? a1 : a1 + rng.pick([-15, 15]);
                const b2 = isSimilar ? a2 : a2;

                shapeData.left = { angles: [a1, a2, null], labels: { a1: `${a1}°`, a2: `${a2}°` } };
                shapeData.right = { angles: [b1, b2, null], labels: { a1: `${b1}°`, a2: `${b2}°` } };

                qData.description = { sv: "Är trianglarna likformiga?", en: "Are the triangles similar?" };
                steps.push({ 
                    text: t(lang, { 
                        sv: "Likformiga trianglar måste ha exakt samma vinklar. Jämför vinklarna i figurerna.", 
                        en: "Similar triangles must have exactly the same angles. Compare the angles in the figures." 
                    }), 
                    latex: "" 
                });
            }
            else { // tri_sides
                shapeData.shapeType = 'triangle';
                const s1 = rng.intBetween(4, 9);
                const s2 = rng.intBetween(4, 9);
                
                const k = isSimilar ? 2 : 1.5;
                const r1 = s1 * k;
                const r2 = isSimilar ? s2 * k : Math.floor(s2 * (k + 0.4));

                shapeData.left = { labels: { s1: s1, s2: s2 } };
                shapeData.right = { labels: { s1: r1, s2: r2 } };
                qData.description = { sv: "Är trianglarna likformiga?", en: "Are the triangles similar?" };
                
                steps.push({ 
                    text: t(lang, { 
                        sv: "Kolla om båda sidorna har växt lika mycket (samma multiplikationstabell).", 
                        en: "Check if both sides have grown by the same amount (same multiplication table)." 
                    }), 
                    latex: `\\frac{${r1}}{${s1}} \\text{ vs } \\frac{${r2}}{${s2}}` 
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
                lLabels = { s1: w1, s2: h1 };
                rLabels = { s1: w2, s2: h2 };
                if (missing === 'w2') { rLabels.s1 = 'x'; answerVal = w2; }
                else { rLabels.s2 = 'x'; answerVal = h2; }
            }

            qData.answer = answerVal;
            qData.description = { sv: "Figurerna är likformiga. Beräkna x.", en: "The shapes are similar. Calculate x." };
            
            steps.push({
                text: t(lang, { 
                    sv: "Först räknar vi ut hur många gånger större den stora figuren är (skalan). Vi jämför de sidor vi vet.", 
                    en: "First, figure out how many times bigger the large shape is (the scale). Compare the known sides." 
                }),
                latex: missing === 'w2' ? `k = \\frac{${h2}}{${h1}} = ${k}` : `k = \\frac{${w2}}{${w1}} = ${k}`
            });
            steps.push({
                text: t(lang, { 
                    sv: "Nu använder vi skalan för att hitta x. Vi multiplicerar den lilla sidan med skalan.", 
                    en: "Now use the scale to find x. Multiply the small side by the scale." 
                }),
                latex: `x = ${missing === 'w2' ? w1 : h1} \\cdot ${k} = ${formatColor(answerVal)}`
            });

            qData.renderData = {
                text_key: "sim_calc", description: qData.description, latex: "", answerType: "numeric",
                geometry: { type: 'similarity_compare', shapeType: isRect ? 'rectangle' : 'triangle', left: { labels: lLabels }, right: { labels: rLabels } }
            };
        }

        // --- LEVEL 3: Top Triangle Theorem (Transversal) ---
        else if (level === 3) {
            const topSide = rng.intBetween(5, 12);
            const addSide = rng.intBetween(4, 10);
            const totSide = topSide + addSide;
            const k = totSide / topSide; 
            
            const baseTop = rng.intBetween(6, 14);
            const baseBot = Math.round(baseTop * k * 10) / 10;

            const mode = rng.pick(['find_base', 'find_side']);
            let answerVal = 0;
            let geom: any = { labels: { base_top: baseTop, base_bot: baseBot, left_top: topSide, left_tot: totSide } };

            if (mode === 'find_base') {
                answerVal = baseBot;
                geom.labels.base_bot = 'x';
                steps = [
                    { 
                        text: t(lang, { 
                            sv: "Den lilla triangeln i toppen är likformig med den stora triangeln. Jämför lilla sidan med hela stora sidan.", 
                            en: "The small triangle at the top is similar to the big triangle. Compare the small side to the full big side." 
                        }), 
                        latex: `\\frac{\\text{Liten}}{\\text{Stor}} = \\frac{${topSide}}{${totSide}}` 
                    },
                    { 
                        text: t(lang, { 
                            sv: "Samma förhållande gäller för baserna. Ställ upp en ekvation.", 
                            en: "The same ratio applies to the bases. Set up an equation." 
                        }), 
                        latex: `\\frac{${topSide}}{${totSide}} = \\frac{${baseTop}}{x}` 
                    },
                    { 
                        text: t(lang, { sv: "Lös ut x.", en: "Solve for x." }), 
                        latex: `x = \\frac{${baseTop} \\cdot ${totSide}}{${topSide}} = ${formatColor(answerVal)}` 
                    }
                ];
            } else {
                answerVal = totSide;
                geom.labels.left_tot = 'x';
                steps = [
                    { 
                        text: t(lang, { 
                            sv: "Räkna ut hur mycket basen har växt (skalan).", 
                            en: "Calculate how much the base has grown (the scale)." 
                        }), 
                        latex: `k = \\frac{${baseBot}}{${baseTop}}` 
                    },
                    { 
                        text: t(lang, { 
                            sv: "Multiplicera den lilla sidan med skalan för att få den stora sidan.", 
                            en: "Multiply the small side by the scale to get the big side." 
                        }), 
                        latex: `x = ${topSide} \\cdot ${Math.round(k*100)/100} = ${formatColor(answerVal)}` 
                    }
                ];
            }

            qData.answer = answerVal;
            qData.description = { sv: "Linjen i mitten är parallell med basen. Beräkna x.", en: "The middle line is parallel to the base. Calculate x." };
            qData.renderData = { text_key: "top_tri", description: qData.description, latex: "", answerType: "numeric", geometry: { type: 'transversal', ...geom } };
        }

        // --- LEVEL 4: Pythagorean Theorem (NEW) ---
        else {
            // 1. Generate Primitive Triple using Euclid's Formula
            // m > n > 0.
            const m = rng.intBetween(2, 6);
            const n = rng.intBetween(1, m - 1);
            
            let a = m*m - n*n;
            let b = 2*m*n;
            let c = m*m + n*n;

            // 2. Scale the triple to create answer variety (multiples)
            const k = rng.pick([1, 1, 1, 2, 2, 3, 4, 5, 10]);
            a *= k;
            b *= k;
            c *= k;

            // 3. Randomize leg orientation (swap a and b visuals)
            if (rng.bool()) [a, b] = [b, a];

            // 4. Select Question Type
            const mode = rng.pick(['find_hyp', 'find_leg_a', 'find_leg_b']);
            let qDesc: any;
            let labels: any = {};
            
            if (mode === 'find_hyp') {
                // a^2 + b^2 = x^2
                qData.answer = c;
                labels = { base: a, height: b, hypotenuse: 'x' };
                qDesc = { sv: "Beräkna hypotenusan (den långa sidan).", en: "Calculate the hypotenuse (the long side)." };
                
                steps.push({
                    text: t(lang, { sv: "Använd Pythagoras sats:", en: "Use the Pythagorean theorem:" }),
                    latex: "a^2 + b^2 = c^2"
                });
                steps.push({
                    text: t(lang, { sv: "Sätt in värdena:", en: "Substitute the values:" }),
                    latex: `${a}^2 + ${b}^2 = x^2`
                });
                steps.push({
                    text: t(lang, { sv: "Beräkna och dra roten ur:", en: "Calculate and take the square root:" }),
                    latex: `x = \\sqrt{${a*a + b*b}} = ${formatColor(c)}`
                });
            } 
            else {
                // Find a Leg.  c^2 - b^2 = a^2
                // Visual variation: sometimes finding base, sometimes height
                const findingBase = (mode === 'find_leg_a');
                
                qData.answer = findingBase ? a : b;
                labels = {
                    base: findingBase ? 'x' : a,
                    height: findingBase ? b : 'x',
                    hypotenuse: c
                };
                
                qDesc = { sv: "Beräkna kateten (den korta sidan).", en: "Calculate the leg (the short side)." };
                
                const knownLeg = findingBase ? b : a;
                
                steps.push({
                    text: t(lang, { sv: "När vi söker en kort sida, subtraherar vi:", en: "When finding a short side, we subtract:" }),
                    latex: "c^2 - b^2 = a^2"
                });
                steps.push({
                    text: t(lang, { sv: "Sätt in värdena:", en: "Substitute the values:" }),
                    latex: `${c}^2 - ${knownLeg}^2 = x^2`
                });
                steps.push({
                    text: t(lang, { sv: "Beräkna och dra roten ur:", en: "Calculate and take the square root:" }),
                    latex: `x = \\sqrt{${c*c - knownLeg*knownLeg}} = ${formatColor(qData.answer)}`
                });
            }

            // Visual Orientation
            const orient = rng.pick(['up', 'left', 'right', 'down']); // Ensure frontend handles these

            qData.description = qDesc;
            qData.renderData = {
                text_key: "pythagoras",
                description: qData.description,
                latex: "",
                answerType: "numeric",
                geometry: {
                    type: 'triangle',
                    subtype: 'right', // Frontend triggers square marker
                    orientation: orient,
                    width: a,
                    height: b,
                    labels: labels
                }
            };
        }

        return {
            questionId: `sim-l${level}-${seed}`,
            renderData: qData.renderData,
            serverData: { answer: qData.answer, solutionSteps: steps }
        };
    }
}