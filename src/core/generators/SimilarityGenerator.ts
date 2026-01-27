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

        // Helper: Generate points for a right triangle starting at 0,0
        const getTriPoints = (w: number, h: number) => {
            return [{x:0, y:h}, {x:w, y:h}, {x:0, y:0}];
        };

        // Helper: Generate points for a rectangle
        const getRectPoints = (w: number, h: number) => {
            return [{x:0, y:0}, {x:w, y:0}, {x:w, y:h}, {x:0, y:h}];
        };

        // --- LEVEL 1: Similar or Not? ---
        if (level === 1) {
            const isSimilar = rng.bool(); // Using rng.bool() from random.ts
            const type = rng.pick(['rect_sides', 'tri_sides']);
            
            qData.answerType = 'multiple_choice';
            qData.choices = lang === 'sv' ? ['Ja', 'Nej'] : ['Yes', 'No'];
            qData.answer = isSimilar ? qData.choices[0] : qData.choices[1];

            let leftPoints, rightPoints;
            let lLabels:any = {}, rLabels:any = {};

            if (type === 'rect_sides') {
                const w1 = rng.intBetween(20, 60);
                const h1 = rng.intBetween(20, 60);
                const k = isSimilar ? 1.5 : 1.2;
                
                const w2 = Math.round(w1 * k);
                const h2 = isSimilar ? Math.round(h1 * k) : Math.round(h1 * (k + 0.3));

                leftPoints = getRectPoints(w1, h1);
                rightPoints = getRectPoints(w2, h2);
                lLabels = { b: Math.round(w1/10), h: Math.round(h1/10) };
                rLabels = { b: Math.round(w2/10), h: Math.round(h2/10) };
                qData.description = { sv: "Är rektanglarna likformiga?", en: "Are the rectangles similar?" };
            } 
            else { // tri_sides
                const w1 = rng.intBetween(30, 60);
                const h1 = rng.intBetween(30, 60);
                const k = isSimilar ? 1.5 : 1.3;

                const w2 = Math.round(w1 * k);
                const h2 = isSimilar ? Math.round(h1 * k) : Math.round(h1 * (k + 0.2));

                leftPoints = getTriPoints(w1, h1);
                rightPoints = getTriPoints(w2, h2);
                lLabels = { s1: Math.round(w1/10), s2: Math.round(h1/10) };
                rLabels = { s1: Math.round(w2/10), s2: Math.round(h2/10) };
                qData.description = { sv: "Är trianglarna likformiga?", en: "Are the triangles similar?" };
            }

            steps.push({ 
                text: t(lang, { sv: "Jämför sidornas proportioner.", en: "Compare the proportions of the sides." }), 
                latex: "" 
            });

            qData.renderData = { 
                text_key: "sim_check", 
                description: qData.description, 
                latex: "", 
                answerType: "multiple_choice", 
                choices: qData.choices, 
                geometry: {
                    type: 'similarity_compare',
                    left: { points: leftPoints, labels: lLabels },
                    right: { points: rightPoints, labels: rLabels }
                }
            };
        }

        // --- LEVEL 2: Find Side (x) ---
        else if (level === 2) {
            const k = rng.pick([1.5, 2, 2.5]);
            const w1 = rng.intBetween(30, 60);
            const h1 = rng.intBetween(30, 60);
            const w2 = Math.round(w1 * k);
            const h2 = Math.round(h1 * k);

            const missing = rng.pick(['w', 'h']);
            let answerVal = 0;
            let lLabels: any = { b: Math.round(w1/10), h: Math.round(h1/10) };
            let rLabels: any = { b: Math.round(w2/10), h: Math.round(h2/10) };

            if (missing === 'w') {
                rLabels.b = 'x';
                answerVal = rLabels.b_val = Math.round(w2/10);
            } else {
                rLabels.h = 'x';
                answerVal = rLabels.h_val = Math.round(h2/10);
            }

            qData.answer = answerVal;
            qData.description = { sv: "Figurerna är likformiga. Beräkna x.", en: "Shapes are similar. Find x." };
            
            steps.push({
                text: t(lang, { sv: "Räkna ut skalan.", en: "Calculate the scale." }),
                latex: `k = ${k}`
            });

            qData.renderData = {
                text_key: "sim_calc", 
                description: qData.description, 
                latex: "", 
                answerType: "numeric", 
                geometry: {
                    type: 'similarity_compare',
                    left: { points: getTriPoints(w1, h1), labels: lLabels },
                    right: { points: getTriPoints(w2, h2), labels: rLabels }
                }
            };
        }

        // --- LEVEL 3: Top Triangle Theorem (Transversal) ---
        else if (level === 3) {
            // Revert to simple visual for now since GeometryVisual handles 'transversal' separately
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
            } else {
                answerVal = totSide;
                geom.labels.left_tot = 'x';
            }

            qData.answer = answerVal;
            qData.description = { sv: "Linjen i mitten är parallell med basen. Beräkna x.", en: "The middle line is parallel to the base. Calculate x." };
            qData.renderData = { text_key: "top_tri", description: qData.description, latex: "", answerType: "numeric", geometry: { type: 'transversal', ...geom } };
        }

        // --- LEVEL 4: Pythagoras ---
        else {
            // Generate standard right triangle data
            const a = rng.intBetween(3, 8);
            const b = rng.intBetween(4, 10);
            const c = Math.round(Math.sqrt(a*a + b*b) * 10) / 10;
            
            const mode = rng.pick(['hyp', 'leg']);
            let answer = 0;
            let labels: any = { base: a, height: b, hypotenuse: c };

            if (mode === 'hyp') {
                answer = c;
                labels.hypotenuse = 'x';
                qData.description = { sv: "Beräkna hypotenusan.", en: "Calculate the hypotenuse." };
            } else {
                answer = a;
                labels.base = 'x';
                qData.description = { sv: "Beräkna kateten.", en: "Calculate the leg." };
            }

            qData.answer = answer;
            qData.renderData = {
                text_key: "pythagoras",
                description: qData.description,
                latex: "",
                answerType: "numeric",
                geometry: {
                    type: 'triangle',
                    subtype: 'right',
                    width: a * 10,
                    height: b * 10,
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