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
        const type = MathUtils.randomChoice(['rect', 'tri_angles']);
        
        let geom: any = { type: 'similarity_compare' };
        let desc = "";
        let steps = [];

        if (type === 'rect') {
            geom.shapeType = 'rectangle';
            const w1 = 20, h1 = 30;
            const k = isSimilar ? 1.5 : 1.2; 
            const w2 = w1 * k;
            const h2 = isSimilar ? h1 * k : h1 * (k + 0.3); // distort height if not similar
            geom.left = { labels: { b: w1, h: h1 } };
            geom.right = { labels: { b: Math.round(w2), h: Math.round(h2) } };
            desc = lang === 'sv' ? "Är rektanglarna likformiga?" : "Are the rectangles similar?";
            steps.push({ text: lang === 'sv' ? "Jämför sidornas förhållande." : "Compare side ratios.", latex: `\\frac{${Math.round(w2)}}{${w1}} \\text{ vs } \\frac{${Math.round(h2)}}{${h1}}` });
        } else {
            geom.shapeType = 'triangle';
            const a1 = 50, a2 = 70;
            const b1 = isSimilar ? 50 : 55;
            const b2 = 70;
            geom.left = { labels: { s1: `${a1}°`, s2: `${a2}°` }, angles: true }; // Custom flag handled by frontend visuals if needed
            geom.right = { labels: { s1: `${b1}°`, s2: `${b2}°` } }; // Reusing labels prop for angles visually
            desc = lang === 'sv' ? "Är trianglarna likformiga?" : "Are the triangles similar?";
            steps.push({ text: lang === 'sv' ? "Vinklarna måste vara exakt lika." : "Angles must be exactly the same." });
        }

        const correct = isSimilar ? (lang === 'sv' ? "Ja" : "Yes") : (lang === 'sv' ? "Nej" : "No");
        const wrong = isSimilar ? (lang === 'sv' ? "Nej" : "No") : (lang === 'sv' ? "Ja" : "Yes");

        return {
            renderData: { 
                description: desc, 
                latex: "", 
                answerType: 'multiple_choice', 
                choices: [correct, wrong],
                geometry: geom 
            },
            token: Buffer.from(correct).toString('base64'),
            serverData: { answer: correct, solutionSteps: steps }
        };
    }

    // Level 2: Calc Side
    private level2_CalcSide(lang: string): any {
        const k = MathUtils.randomChoice([1.5, 2, 3]);
        const s1 = 4, s2 = 6;
        const bigS1 = s1 * k; 
        const bigS2 = s2 * k; // 6*k
        
        return {
            renderData: {
                geometry: { 
                    type: 'similarity_compare', 
                    shapeType: 'triangle', 
                    left: { labels: { s1, s2 } }, 
                    right: { labels: { s1: 'x', s2: bigS2 } } 
                },
                description: lang === 'sv' ? "Likformiga. Beräkna x." : "Similar. Calculate x.",
                answerType: 'text'
            },
            token: Buffer.from(bigS1.toString()).toString('base64'),
            serverData: { answer: bigS1, solutionSteps: [
                { text: lang === 'sv' ? "Räkna ut skalan först." : "Calculate scale first.", latex: `k = \\frac{${bigS2}}{${s2}} = ${k}` },
                { text: lang === 'sv' ? "Multiplicera lilla sidan med skalan." : "Multiply small side by scale.", latex: `x = ${s1} \\cdot ${k} = ${bigS1}` }
            ]}
        };
    }

    // Level 3: Top Triangle
    private level3_TopTriangle(lang: string): any {
        const top = 6, tot = 10; // k = 10/6 = 5/3
        const smallBase = 9;
        const largeBase = (10/6) * 9; // 15

        return {
            renderData: { 
                geometry: { type: 'transversal', labels: { left_top: top, left_tot: tot, base_top: smallBase, base_bot: 'x' } }, 
                description: "Beräkna x.", 
                answerType: 'text' 
            },
            token: Buffer.from(largeBase.toString()).toString('base64'),
            serverData: { answer: largeBase, solutionSteps: [
                { text: lang === 'sv' ? "Topptriangelsatsen: Liten/Stor = Liten/Stor" : "Top Triangle Theorem: Small/Big = Small/Big", latex: `\\frac{${top}}{${tot}} = \\frac{${smallBase}}{x}` }
            ]}
        };
    }

    // Level 4: Pythagoras
    private level4_Pythagoras(lang: string): any {
        const [a, b, c] = MathUtils.randomChoice([[3,4,5], [5,12,13], [6,8,10]]);
        const findHyp = MathUtils.randomInt(0, 1) === 1;
        
        let ans = 0;
        let labels: any = {};
        let clue = "";

        if (findHyp) {
            ans = c;
            labels = { base: a, height: b, hypotenuse: 'x' };
            clue = `x^2 = ${a}^2 + ${b}^2`;
        } else {
            ans = a;
            labels = { base: 'x', height: b, hypotenuse: c };
            clue = `x^2 = ${c}^2 - ${b}^2`;
        }

        return {
            renderData: {
                geometry: { type: 'triangle', subtype: 'right', width: a, height: b, labels, orientation: 'right' },
                description: "Beräkna x.",
                answerType: 'text'
            },
            token: Buffer.from(ans.toString()).toString('base64'),
            serverData: { answer: ans, solutionSteps: [{ latex: clue }] }
        };
    }
}