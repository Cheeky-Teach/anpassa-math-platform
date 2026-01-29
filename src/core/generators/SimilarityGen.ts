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
                choices: [correct, wrong],
                geometry: geom,
                latex: ""
            },
            token: Buffer.from(correct).toString('base64'),
            clues: steps
        };
    }

    // Level 2: Calc Side
    private level2_CalcSide(lang: string): any {
        const k = MathUtils.randomChoice([2, 3, 1.5]);
        const s1 = MathUtils.randomInt(3, 8);
        const s2 = MathUtils.randomInt(4, 10);
        const bigS2 = s2 * k; // known big side
        
        // Randomly find small side or big side
        const findBig = MathUtils.randomInt(0, 1) === 1;
        let ans = 0, clues = [];

        let lLabels: any = { s1, s2 };
        let rLabels: any = {};

        if (findBig) {
            ans = s1 * k;
            rLabels = { s1: 'x', s2: bigS2 };
            clues.push({ text: lang === 'sv' ? "Räkna ut skalan först (Stora / Lilla)." : "Calculate scale first (Big / Small).", latex: `k = \\frac{${bigS2}}{${s2}} = ${k}` });
            clues.push({ text: lang === 'sv' ? "Multiplicera lilla sidan med skalan." : "Multiply small side by scale.", latex: `x = ${s1} \\cdot ${k} = \\mathbf{${ans}}` });
        } else {
            const bigS1 = s1 * k;
            ans = s1;
            lLabels = { s1: 'x', s2: s2 };
            rLabels = { s1: bigS1, s2: bigS2 };
            clues.push({ text: lang === 'sv' ? "Räkna ut skalan (Stora / Lilla)." : "Calculate scale (Big / Small).", latex: `k = \\frac{${bigS2}}{${s2}} = ${k}` });
            clues.push({ text: lang === 'sv' ? "Dela stora sidan med skalan för att få den lilla." : "Divide big side by scale to get small one.", latex: `x = \\frac{${bigS1}}{${k}} = \\mathbf{${ans}}` });
        }
        
        return {
            renderData: { 
                geometry: { type: 'similarity_compare', shapeType: 'triangle', left: { labels: lLabels }, right: { labels: rLabels } }, 
                description: lang === 'sv' ? "Figurerna är likformiga. Beräkna x." : "Shapes are similar. Calculate x.", 
                answerType: 'text',
                latex: ""
            },
            token: Buffer.from(ans.toString()).toString('base64'),
            clues: clues
        };
    }

    // Level 3: Top Triangle
    private level3_TopTriangle(lang: string): any {
        const top = MathUtils.randomInt(4, 10);
        const add = MathUtils.randomInt(2, 6);
        const tot = top + add;
        
        const smallBase = MathUtils.randomInt(5, 12);
        const largeBase = (tot / top) * smallBase;
        
        // Ensure integer answer or simple decimal
        // Reroll if ugly
        if (!Number.isInteger(largeBase) && (largeBase * 10) % 5 !== 0) return this.level3_TopTriangle(lang);

        return {
            renderData: { 
                geometry: { type: 'transversal', labels: { left_top: top, left_tot: tot, base_top: smallBase, base_bot: 'x' } }, 
                description: lang === 'sv' ? "Beräkna basen x." : "Calculate base x.", 
                answerType: 'text',
                latex: ""
            },
            token: Buffer.from(largeBase.toString()).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Topptriangelsatsen: Liten sida / Stor sida = Liten bas / Stor bas" : "Top Triangle Theorem: Small side / Big side = Small base / Big base", latex: `\\frac{${top}}{${tot}} = \\frac{${smallBase}}{x}` },
                { text: lang === 'sv' ? "Lös ut x." : "Solve for x.", latex: `x = \\frac{${tot} \\cdot ${smallBase}}{${top}} = \\mathbf{${largeBase}}` }
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

        if (findHyp) {
            ans = c;
            labels = { base: a, height: b, hypotenuse: 'x' };
            clue = `x = \\sqrt{${a}^2 + ${b}^2} = \\sqrt{${c*c}} = \\mathbf{${c}}`;
        } else {
            ans = a;
            labels = { base: 'x', height: b, hypotenuse: c };
            clue = `x = \\sqrt{${c}^2 - ${b}^2} = \\sqrt{${a*a}} = \\mathbf{${a}}`;
        }

        return {
            renderData: { 
                geometry: { type: 'triangle', subtype: 'right', width: a, height: b, labels, orientation: orient }, 
                description: lang === 'sv' ? "Beräkna x." : "Calculate x.",
                answerType: 'text',
                latex: ""
            },
            token: Buffer.from(ans.toString()).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Pythagoras sats:" : "Pythagoras theorem:", latex: "a^2 + b^2 = c^2" },
                { latex: clue }
            ]
        };
    }
}