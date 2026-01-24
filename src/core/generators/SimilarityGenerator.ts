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

        // --- LEVEL 1: Similar or Not? (Yes/No) ---
        if (level === 1) {
            const isSimilar = rng.intBetween(0, 1) === 1;
            const type = rng.pick(['rect_sides', 'tri_sides', 'tri_angles']);
            
            let shapeData: any = { type: 'similarity_compare', shapeType: 'triangle', left: {}, right: {} };
            
            qData.answerType = 'multiple_choice';
            qData.choices = lang === 'sv' ? ['Ja', 'Nej'] : ['Yes', 'No'];
            qData.answer = isSimilar ? qData.choices[0] : qData.choices[1];
            qData.description = { sv: "Är figurerna likformiga?", en: "Are the shapes similar?" };

            if (type === 'rect_sides' || type === 'tri_sides') {
                const isRect = type === 'rect_sides';
                shapeData.shapeType = isRect ? 'rectangle' : 'triangle';
                
                // Base dimensions
                const w1 = rng.intBetween(3, 8);
                const h1 = rng.intBetween(4, 10);
                const k = rng.pick([2, 3, 1.5, 2.5]);
                
                let w2 = w1 * k;
                let h2 = h1 * k;

                if (!isSimilar) {
                    // Distort one side to break the ratio
                    if (rng.bool()) w2 += rng.pick([-1, 1]);
                    else h2 += rng.pick([-1, 1]);
                }

                // Populate shapes
                if (isRect) {
                    shapeData.left = { w: w1, h: h1, labels: { b: w1, h: h1 } };
                    shapeData.right = { w: w2, h: h2, labels: { b: w2, h: h2 } };
                } else {
                    // Simplified triangle logic for Level 1 visuals
                    shapeData.left = { w: w1, h: h1, labels: { s1: w1, s2: h1 } };
                    shapeData.right = { w: w2, h: h2, labels: { s1: w2, s2: h2 } };
                }
                
                const ratioW = Math.round(w2/w1 * 100)/100;
                const ratioH = Math.round(h2/h1 * 100)/100;
                
                // Pedagogical Clues
                steps.push({
                    text: t(lang, TERMS.similarity.rule_sides), // "To be similar, side ratios must be constant."
                    latex: ""
                });
                steps.push({
                    text: { sv: "Jämför sidornas förhållanden:", en: "Compare the side ratios:" },
                    latex: `\\frac{${w2}}{${w1}} \\approx ${ratioW}, \\quad \\frac{${h2}}{${h1}} \\approx ${ratioH}`
                });
                steps.push({
                    text: { sv: "Slutsats:", en: "Conclusion:" },
                    latex: isSimilar ? `\\text{${t(lang, 'Yes')}} (${ratioW} = ${ratioH})` : `\\text{${t(lang, 'No')}} (${ratioW} \\neq ${ratioH})`
                });

            } else {
                // Triangles by Angles
                const A = rng.intBetween(30, 80);
                const B = rng.intBetween(30, 100 - A);
                const C = 180 - A - B;
                
                shapeData.left = { angles: [A, B, null], labels: { a1: A+"°", a2: B+"°" } };
                
                if (isSimilar) {
                    // Show corresponding angles or require sum of angles deduction
                    if (rng.bool()) {
                        shapeData.right = { angles: [A, null, C], labels: { a1: A+"°", a3: C+"°" } };
                        steps.push({ text: t(lang, TERMS.similarity.rule_angles), latex: "" });
                        steps.push({ 
                            text: { sv: "Beräkna den saknade vinkeln.", en: "Calculate the missing angle." }, 
                            latex: `180^\\circ - ${A}^\\circ - ${C}^\\circ = ${formatColor(B)}^\\circ` 
                        });
                    } else {
                        shapeData.right = { angles: [A, B, null], labels: { a1: A+"°", a2: B+"°" } };
                        steps.push({ text: t(lang, TERMS.similarity.rule_angles), latex: "" });
                    }
                } else {
                    const Wrong = B + rng.pick([-10, 15]);
                    shapeData.right = { angles: [A, Wrong, null], labels: { a1: A+"°", a2: Wrong+"°" } };
                    steps.push({ text: t(lang, TERMS.similarity.rule_angles), latex: "" });
                    steps.push({ text: {sv: "Vinklarna matchar inte.", en: "Angles do not match."}, latex: `${B}^\\circ \\neq ${Wrong}^\\circ` });
                }
            }
            
            qData.renderData = {
                text_key: "sim_check",
                description: qData.description,
                latex: "",
                answerType: "multiple_choice",
                choices: qData.choices,
                geometry: shapeData,
                variables: {}
            };
        }

        // --- LEVEL 2: Calculate Length (Basic) ---
        else if (level === 2) {
            const k = rng.pick([2, 3, 4, 1.5, 2.5]);
            const smallSide = rng.intBetween(4, 12);
            const largeSide = smallSide * k;
            
            const findLarge = rng.bool();
            const xVal = findLarge ? largeSide : smallSide;
            const knownPairSmall = rng.intBetween(3, 8);
            const knownPairLarge = knownPairSmall * k;

            qData.answer = xVal;
            qData.description = { sv: "Beräkna sidan markerad med x.", en: "Calculate the side marked x." };

            const geom = {
                type: 'similarity_compare',
                shapeType: 'triangle',
                left: { labels: { s1: knownPairSmall, s2: findLarge ? smallSide : 'x' } },
                right: { labels: { s1: knownPairLarge, s2: findLarge ? 'x' : largeSide } }
            };

            steps = [
                { 
                    text: t(lang, TERMS.similarity.step_k), // "Find scale factor k..."
                    latex: `k = \\frac{${knownPairLarge}}{${knownPairSmall}} = ${k}` 
                },
                { 
                    text: t(lang, TERMS.similarity.step_calc), // "Use k to find x..."
                    latex: findLarge 
                        ? `x = ${smallSide} \\cdot ${k} = ${formatColor(xVal)}` 
                        : `x = \\frac{${largeSide}}{${k}} = ${formatColor(xVal)}` 
                }
            ];

            qData.renderData = {
                text_key: "sim_calc",
                description: qData.description,
                latex: "",
                answerType: "numeric",
                geometry: geom,
                variables: {}
            };
        }

        // --- LEVEL 3: Top Triangle Theorem (Easy) ---
        else if (level === 3) {
            const k = rng.intBetween(2, 4);
            const topBase = rng.intBetween(4, 10);
            const topSide = rng.intBetween(3, 8);
            
            const bigBase = topBase * k;
            const bigSide = topSide * k;
            
            const findBase = rng.bool();
            const findBig = rng.bool(); // Find the larger triangle dimension or smaller?
            
            qData.answer = findBase 
                ? (findBig ? bigBase : topBase)
                : (findBig ? bigSide : topSide);

            let geom: any = { type: 'transversal', labels: {} };
            
            // Populate logic
            if (findBase) {
                // We know sides, find base
                geom.labels = {
                    left_top: topSide,
                    left_tot: bigSide,
                    base_top: findBig ? topBase : 'x',
                    base_bot: findBig ? 'x' : bigBase
                };
                
                steps.push({
                    text: t(lang, TERMS.similarity.rule_top), // "Top triangle is similar..."
                    latex: "\\Delta_{\\text{liten}} \\sim \\Delta_{\\text{stor}}"
                });
                steps.push({
                    text: t(lang, TERMS.similarity.step_k),
                    latex: `k = \\frac{${bigSide}}{${topSide}} = ${k}`
                });
                steps.push({
                    text: t(lang, TERMS.similarity.step_calc),
                    latex: findBig 
                        ? `x = ${topBase} \\cdot ${k} = ${formatColor(bigBase)}`
                        : `x = \\frac{${bigBase}}{${k}} = ${formatColor(topBase)}`
                });

            } else {
                // We know bases, find side
                geom.labels = {
                    base_top: topBase,
                    base_bot: bigBase,
                    right_top: findBig ? topSide : 'x',
                    right_tot: findBig ? 'x' : bigSide
                };

                steps.push({
                    text: t(lang, TERMS.similarity.rule_top),
                    latex: "\\Delta_{\\text{liten}} \\sim \\Delta_{\\text{stor}}"
                });
                steps.push({
                    text: t(lang, TERMS.similarity.step_k),
                    latex: `k = \\frac{${bigBase}}{${topBase}} = ${k}`
                });
                steps.push({
                    text: t(lang, TERMS.similarity.step_calc),
                    latex: findBig
                        ? `x = ${topSide} \\cdot ${k} = ${formatColor(bigSide)}`
                        : `x = \\frac{${bigSide}}{${k}} = ${formatColor(topSide)}`
                });
            }

            qData.description = { sv: "Linjerna med pilar är parallella. Beräkna x.", en: "The lines with arrows are parallel. Calculate x." };
            qData.renderData = {
                text_key: "top_tri",
                description: qData.description,
                latex: "",
                answerType: "numeric",
                geometry: geom,
                variables: {}
            };
        }

        // --- LEVEL 4: Hourglass (Vertical Angles) ---
        else {
            const k = rng.pick([1.5, 2, 2.5, 3]);
            const topBase = rng.intBetween(4, 10);
            const topSide = rng.intBetween(4, 10);
            
            const botBase = topBase * k;
            const botSide = topSide * k;
            
            const findBig = rng.bool();
            qData.answer = findBig ? botSide : topSide;
            
            const geom = {
                type: 'hourglass',
                labels: {
                    top_base: topBase,
                    bot_base: botBase,
                    top_side: findBig ? topSide : 'x',
                    bot_side: findBig ? 'x' : botSide
                }
            };
            
            steps = [
                { 
                    text: t(lang, TERMS.similarity.rule_hourglass), // "Vertical angles + Parallel = Similar"
                    latex: "\\Delta_{\\text{upp}} \\sim \\Delta_{\\text{ner}}" 
                },
                { 
                    text: t(lang, TERMS.similarity.step_k),
                    latex: `k = \\frac{${botBase}}{${topBase}} = ${k}` 
                },
                { 
                    text: t(lang, TERMS.similarity.step_calc),
                    latex: findBig 
                        ? `x = ${topSide} \\cdot ${k} = ${formatColor(botSide)}` 
                        : `x = \\frac{${botSide}}{${k}} = ${formatColor(topSide)}` 
                }
            ];

            qData.description = { sv: "De horisontella linjerna är parallella. Beräkna x.", en: "The horizontal lines are parallel. Calculate x." };
            qData.renderData = {
                text_key: "hourglass",
                description: qData.description,
                latex: "",
                answerType: "numeric",
                geometry: geom,
                variables: {}
            };
        }

        return {
            questionId: `sim-l${level}-${seed}`,
            renderData: qData.renderData,
            serverData: {
                answer: qData.answer,
                solutionSteps: steps
            }
        };
    }
}