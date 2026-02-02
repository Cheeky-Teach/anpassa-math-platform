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

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    private level1_Concept(lang: string): any {
        const isSimilar = MathUtils.randomInt(0, 1) === 1;
        const type = MathUtils.randomChoice(['rect_sides', 'tri_sides', 'tri_angles']);
        
        let geom: any = { type: 'similarity_compare' };
        let desc = "";
        let steps = [];

        if (type === 'rect_sides') {
            geom.shapeType = 'rectangle';
            const w1 = MathUtils.randomInt(2, 5) * 10;
            const h1 = MathUtils.randomInt(2, 5) * 10;
            
            const k = isSimilar ? MathUtils.randomChoice([1.5, 2, 0.5]) : MathUtils.randomChoice([1.2, 1.8, 0.8]);
            const w2 = Math.round(w1 * k);
            const h2 = isSimilar ? Math.round(h1 * k) : Math.round(h1 * (k + 0.5)); 

            geom.left = { labels: { b: w1, h: h1 } };
            geom.right = { labels: { b: w2, h: h2 } };
            
            desc = lang === 'sv' ? "Är rektanglarna likformiga?" : "Are the rectangles similar?";
            steps.push({ 
                text: lang === 'sv' ? "Jämför baserna och höjderna." : "Compare bases and heights.", 
                latex: `\\frac{${w2}}{${w1}} \\text{ vs } \\frac{${h2}}{${h1}}` 
            });
        } 
        else if (type === 'tri_angles') {
            geom.shapeType = 'triangle';
            const a1 = MathUtils.randomInt(40, 75);
            const a2 = MathUtils.randomInt(40, 75);
            
            const b1 = isSimilar ? a1 : a1 + MathUtils.randomChoice([-15, 15]);
            const b2 = isSimilar ? a2 : a2;

            geom.left = { angles: [a1, a2, null], labels: { a1: `${a1}°`, a2: `${a2}°` } };
            geom.right = { angles: [b1, b2, null], labels: { a1: `${b1}°`, a2: `${b2}°` } };

            desc = lang === 'sv' ? "Är trianglarna likformiga?" : "Are the triangles similar?";
            steps.push({ 
                text: lang === 'sv' ? "Likformiga trianglar måste ha exakt samma vinklar." : "Similar triangles must have exactly the same angles.", 
                latex: "" 
            });
        }
        else { 
            geom.shapeType = 'triangle';
            const s1 = MathUtils.randomInt(4, 9);
            const s2 = MathUtils.randomInt(4, 9);
            
            const k = isSimilar ? 2 : 1.5;
            const r1 = s1 * k;
            const r2 = isSimilar ? s2 * k : Math.floor(s2 * (k + 0.4));

            geom.left = { labels: { s1: s1, s2: s2 } };
            geom.right = { labels: { s1: r1, s2: r2 } };
            
            desc = lang === 'sv' ? "Är trianglarna likformiga?" : "Are the triangles similar?";
            steps.push({ 
                text: lang === 'sv' ? "Kolla om båda sidorna har växt lika mycket." : "Check if both sides scaled by the same factor.", 
                latex: `\\frac{${r1}}{${s1}} \\text{ vs } \\frac{${r2}}{${s2}}` 
            });
        }

        const correct = isSimilar ? (lang === 'sv' ? "Ja" : "Yes") : (lang === 'sv' ? "Nej" : "No");
        const wrong = isSimilar ? (lang === 'sv' ? "Nej" : "No") : (lang === 'sv' ? "Ja" : "Yes");

        return {
            renderData: {
                description: desc,
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([correct, wrong]),
                geometry: geom,
                latex: ""
            },
            token: this.toBase64(correct),
            clues: steps
        };
    }

    private level2_CalcSide(lang: string): any {
        const k = MathUtils.randomChoice([1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]);
        const s1 = MathUtils.randomInt(3, 12);
        const s2 = MathUtils.randomInt(3, 12);
        
        const bigS1 = Math.round(s1 * k * 10) / 10;
        const bigS2 = Math.round(s2 * k * 10) / 10;
        
        const findBig = MathUtils.randomInt(0, 1) === 1;
        let ans = 0, clues = [];

        let lLabels: any = { s1, s2 };
        let rLabels: any = {};

        if (findBig) {
            ans = bigS1;
            lLabels = { s1: s1, s2: s2 };
            rLabels = { s1: 'x', s2: bigS2 };
            
            clues.push({ 
                text: lang === 'sv' ? "1. Hitta skalan." : "1. Find the scale.", 
                latex: `k = \\frac{${bigS2}}{${s2}} = ${k}` 
            });
            clues.push({ 
                text: lang === 'sv' ? "2. Multiplicera den kända sidan med skalan." : "2. Multiply the known side by the scale.", 
                latex: `x = ${s1} \\cdot ${k} = \\mathbf{${ans}}` 
            });
        } else {
            ans = s1;
            lLabels = { s1: 'x', s2: s2 };
            rLabels = { s1: bigS1, s2: bigS2 };
            
            clues.push({ 
                text: lang === 'sv' ? "1. Hitta skalan." : "1. Find the scale.", 
                latex: `k = \\frac{${bigS2}}{${s2}} = ${k}` 
            });
            clues.push({ 
                text: lang === 'sv' ? "2. Dividera den kända sidan med skalan." : "2. Divide the known side by the scale.", 
                latex: `x = \\frac{${bigS1}}{${k}} = \\mathbf{${ans}}` 
            });
        }
        
        return {
            renderData: { 
                geometry: { type: 'similarity_compare', shapeType: 'triangle', left: { labels: lLabels }, right: { labels: rLabels } }, 
                description: lang === 'sv' ? "Figurerna är likformiga. Beräkna x." : "Shapes are similar. Calculate x.", 
                answerType: 'text',
                latex: ""
            },
            token: this.toBase64(ans.toString()),
            clues: clues
        };
    }

    private level3_TopTriangle(lang: string): any {
        const top = MathUtils.randomInt(4, 10);
        const add = MathUtils.randomInt(2, 6);
        const tot = top + add;
        
        const smallBase = MathUtils.randomInt(5, 12);
        const scale = tot / top;
        const largeBase = scale * smallBase;
        
        if (!Number.isInteger(largeBase)) return this.level3_TopTriangle(lang);

        const scaleStr = Number.isInteger(scale) ? scale.toString() : scale.toFixed(1); 
        const showExtension = MathUtils.randomInt(0, 1) === 1;

        let visualLabels = {};
        let clueSteps = [];

        if (showExtension) {
            // Variation: Give Top and Extension (bottom part). User must sum them.
            // Note: GeometryComponents handles 'left_bot' by drawing it on the segment
            visualLabels = { left_top: top, left_bot: add, base_top: smallBase, base_bot: 'x' };
            
            clueSteps = [
                {
                    text: lang === 'sv' 
                        ? "1. Addera toppens längd och den nedre delens längd för att få hela sidans längd." 
                        : "1. Add the top length and the extension length to get the total side length.",
                    latex: `\\text{Stor Sida} = ${top} + ${add} = ${tot}`
                },
                { 
                    text: lang === 'sv' 
                        ? "2. Räkna ut skalan (Stor Sida / Liten Sida)." 
                        : "2. Calculate the scale (Big Side / Small Side).", 
                    latex: `\\text{Skala} = \\frac{${tot}}{${top}} = ${scaleStr}` 
                },
                { 
                    text: lang === 'sv' 
                        ? `3. Multiplicera den lilla basen med skalan.` 
                        : `3. Multiply the small base by the scale.`, 
                    latex: `x = ${smallBase} \\cdot ${scaleStr} = \\mathbf{${largeBase}}` 
                }
            ];

        } else {
            // Standard: Give Top and Total Length
            visualLabels = { left_top: top, left_tot: tot, base_top: smallBase, base_bot: 'x' };
            
            clueSteps = [
                { 
                    text: lang === 'sv' 
                        ? "1. Räkna ut hur många gånger större den stora triangeln är (Skala)." 
                        : "1. Calculate how many times bigger the large triangle is (Scale Factor).", 
                    latex: `\\text{Skala} = \\frac{\\text{Stor Sida}}{\\text{Liten Sida}} = \\frac{${tot}}{${top}} = ${scaleStr}` 
                },
                { 
                    text: lang === 'sv' 
                        ? `2. Multiplicera den lilla basen med skalan för att få x.` 
                        : `2. Multiply the small base by the scale to get x.`, 
                    latex: `x = ${smallBase} \\cdot ${scaleStr} = \\mathbf{${largeBase}}` 
                }
            ];
        }

        return {
            renderData: { 
                geometry: { type: 'transversal', labels: visualLabels }, 
                description: lang === 'sv' ? "Beräkna basen x." : "Calculate base x.", 
                answerType: 'text',
                latex: ""
            },
            token: this.toBase64(largeBase.toString()),
            clues: clueSteps
        };
    }

    private level4_Pythagoras(lang: string): any {
        const [a, b, c] = MathUtils.randomChoice([[3,4,5], [5,12,13], [6,8,10], [8,15,17]]);
        const findHyp = MathUtils.randomInt(0, 1) === 1;
        const orient = MathUtils.randomChoice(['up', 'down', 'left', 'right']);
        
        let ans = 0;
        let labels: any = {};
        let clue = "";
        let desc = "";

        if (findHyp) {
            ans = c;
            labels = { base: a, height: b, hypotenuse: 'x' };
            clue = `x = \\sqrt{${a}^2 + ${b}^2} = \\mathbf{${c}}`;
            desc = lang === 'sv' ? "Beräkna hypotenusan (x)." : "Calculate hypotenuse (x).";
        } else {
            ans = a;
            labels = { base: 'x', height: b, hypotenuse: c };
            clue = `x = \\sqrt{${c}^2 - ${b}^2} = \\mathbf{${a}}`;
            desc = lang === 'sv' ? "Beräkna kateten (x)." : "Calculate leg (x).";
        }

        return {
            renderData: { 
                geometry: { type: 'triangle', subtype: 'right', width: a, height: b, labels, orientation: orient }, 
                description: desc,
                answerType: 'text',
                latex: ""
            },
            token: this.toBase64(ans.toString()),
            clues: [
                { text: lang === 'sv' ? "Pythagoras sats:" : "Pythagoras theorem:", latex: "a^2 + b^2 = c^2" },
                { text: lang === 'sv' ? (findHyp ? "För hypotenusan, addera kvadraterna." : "För en katet, subtrahera.") : (findHyp ? "Add squares." : "Subtract squares."), latex: clue }
            ]
        };
    }
}