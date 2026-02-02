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

    // Level 1: Concept (Similar or Not?)
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
                text: lang === 'sv' ? "För att de ska vara likformiga måste förhållandet mellan sidorna vara samma. Jämför baserna och höjderna." : "For similarity, side ratios must be equal. Compare bases and heights.", 
                latex: `\\frac{${w2}}{${w1}} \\text{ vs } \\frac{${h2}}{${h1}}` 
            });
        } 
        else if (type === 'tri_angles') {
            geom.shapeType = 'triangle';
            const a1 = MathUtils.randomInt(40, 75);
            const a2 = MathUtils.randomInt(40, 75);
            
            const b1 = isSimilar ? a1 : a1 + MathUtils.randomChoice([-15, 15]);
            const b2 = isSimilar ? a2 : a2;

            // Pass angles for visual arcs
            geom.left = { angles: [a1, a2, null], labels: { a1: `${a1}°`, a2: `${a2}°` } };
            geom.right = { angles: [b1, b2, null], labels: { a1: `${b1}°`, a2: `${b2}°` } };

            desc = lang === 'sv' ? "Är trianglarna likformiga?" : "Are the triangles similar?";
            steps.push({ 
                text: lang === 'sv' ? "Likformiga trianglar måste ha exakt samma vinklar. Jämför vinklarna." : "Similar triangles must have exactly the same angles. Compare them.", 
                latex: "" 
            });
        }
        else { // tri_sides
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
                text: lang === 'sv' ? "Kolla om båda sidorna har växt lika mycket (samma skalning)." : "Check if both sides scaled by the same factor.", 
                latex: `\\frac{${r1}}{${s1}} \\text{ vs } \\frac{${r2}}{${s2}}` 
            });
        }

        const correct = isSimilar ? (lang === 'sv' ? "Ja" : "Yes") : (lang === 'sv' ? "Nej" : "No");
        const wrong = isSimilar ? (lang === 'sv' ? "Nej" : "No") : (lang === 'sv' ? "Ja" : "Yes");

        return {
            renderData: {
                description: desc,
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([correct, wrong]), // Assuming options expects shuffled array
                geometry: geom,
                latex: ""
            },
            token: this.toBase64(correct),
            clues: steps
        };
    }

    // Level 2: Calc Side (Updated with more variety and division)
    private level2_CalcSide(lang: string): any {
        // Expanded scale factors: decimals and larger integers
        const k = MathUtils.randomChoice([1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]);
        
        const s1 = MathUtils.randomInt(3, 12);
        const s2 = MathUtils.randomInt(3, 12);
        
        const bigS1 = Math.round(s1 * k * 10) / 10;
        const bigS2 = Math.round(s2 * k * 10) / 10;
        
        // Randomly find small side (division) or big side (multiplication)
        const findBig = MathUtils.randomInt(0, 1) === 1;
        let ans = 0, clues = [];

        let lLabels: any = { s1, s2 };
        let rLabels: any = {};

        if (findBig) {
            // Finding a side on the larger triangle
            ans = bigS1;
            // Left (Small) has s1, s2. Right (Big) has x, bigS2.
            lLabels = { s1: s1, s2: s2 };
            rLabels = { s1: 'x', s2: bigS2 };
            
            clues.push({ 
                text: lang === 'sv' ? "1. Hitta skalan genom att jämföra de kända sidorna." : "1. Find scale by comparing the known sides.", 
                latex: `k = \\frac{${bigS2}}{${s2}} = ${k}` 
            });
            clues.push({ 
                text: lang === 'sv' ? "2. Den okända sidan är i den stora figuren. Multiplicera." : "2. The unknown side is in the large shape. Multiply.", 
                latex: `x = ${s1} \\cdot ${k} = \\mathbf{${ans}}` 
            });
        } else {
            // Finding a side on the smaller triangle
            ans = s1;
            // Left (Small) has x, s2. Right (Big) has bigS1, bigS2.
            lLabels = { s1: 'x', s2: s2 };
            rLabels = { s1: bigS1, s2: bigS2 };
            
            clues.push({ 
                text: lang === 'sv' ? "1. Hitta skalan genom att jämföra de kända sidorna." : "1. Find scale by comparing the known sides.", 
                latex: `k = \\frac{${bigS2}}{${s2}} = ${k}` 
            });
            clues.push({ 
                text: lang === 'sv' ? "2. Den okända sidan är i den lilla figuren. Dividera." : "2. The unknown side is in the small shape. Divide.", 
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

    // Level 3: Top Triangle
    private level3_TopTriangle(lang: string): any {
        const top = MathUtils.randomInt(4, 10);
        const add = MathUtils.randomInt(2, 6);
        const tot = top + add;
        
        const smallBase = MathUtils.randomInt(5, 12);
        // Calculation: Scale = tot/top. LargeBase = Scale * smallBase.
        const scale = tot / top;
        const largeBase = scale * smallBase;
        
        // Reroll if scale logic produces ugly decimal not easily explainable, or if bases are not integers for simplicity in this level
        // We want the scale factor to be relatively clean or the answer to be an integer.
        // Let's force integer answer:
        if (!Number.isInteger(largeBase)) return this.level3_TopTriangle(lang);

        // Clue logic setup
        // 1. Identify scale factor (Big Side / Small Side)
        // 2. Multiply base by scale factor
        
        const scaleStr = Number.isInteger(scale) ? scale.toString() : scale.toFixed(1); 

        return {
            renderData: { 
                geometry: { type: 'transversal', labels: { left_top: top, left_tot: tot, base_top: smallBase, base_bot: 'x' } }, 
                description: lang === 'sv' ? "Beräkna basen x." : "Calculate base x.", 
                answerType: 'text',
                latex: ""
            },
            token: this.toBase64(largeBase.toString()),
            clues: [
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
            ]
        };
    }

    // Level 4: Pythagoras
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