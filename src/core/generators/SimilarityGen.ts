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

    // Level 1: Concept (Restored Legacy Logic)
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
            const h2 = isSimilar ? Math.round(h1 * k) : Math.round(h1 * (k + 0.5)); // Distort height if not similar

            geom.left = { labels: { b: w1, h: h1 } };
            geom.right = { labels: { b: w2, h: h2 } };
            
            desc = lang === 'sv' ? "Är rektanglarna likformiga?" : "Are the rectangles similar?";
            steps.push({ 
                text: lang === 'sv' ? "För att de ska vara likformiga måste förhållandet mellan sidorna vara samma. Jämför baserna och höjderna." : "For similarity, the ratio of sides must be equal. Compare bases and heights.", 
                latex: `\\frac{${w2}}{${w1}} \\text{ vs } \\frac{${h2}}{${h1}}` 
            });
        } 
        else if (type === 'tri_angles') {
            geom.shapeType = 'triangle';
            const a1 = MathUtils.randomInt(40, 75);
            const a2 = MathUtils.randomInt(40, 75);
            
            const b1 = isSimilar ? a1 : a1 + MathUtils.randomChoice([-15, 15]);
            const b2 = isSimilar ? a2 : a2;

            // Pass angles array to trigger arc rendering in GeometryComponents
            geom.left = { angles: [a1, a2, null], labels: { a1: `${a1}°`, a2: `${a2}°` } };
            geom.right = { angles: [b1, b2, null], labels: { a1: `${b1}°`, a2: `${b2}°` } };

            desc = lang === 'sv' ? "Är trianglarna likformiga?" : "Are the triangles similar?";
            steps.push({ 
                text: lang === 'sv' ? "Likformiga trianglar måste ha exakt samma vinklar. Jämför vinklarna." : "Similar triangles must have exactly the same angles. Compare the angles.", 
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
                text: lang === 'sv' ? "Kolla om båda sidorna har växt lika mycket (samma skalning)." : "Check if both sides grew by the same factor.", 
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
                geometry: geom
            },
            token: Buffer.from(correct).toString('base64'),
            clues: steps
        };
    }

    private level2_CalcSide(lang: string): any {
        const k = 2;
        const s1 = 4, s2 = 5; 
        const ans = 10; 
        return {
            renderData: { geometry: { type: 'similarity_compare', shapeType: 'triangle', left: { labels: { s1, s2 } }, right: { labels: { s1: 'x', s2: s2*k } } }, description: "x?", answerType: 'text' },
            token: Buffer.from(ans.toString()).toString('base64'),
            clues: [{ text: "Dubbelt så stor" }]
        };
    }

    private level3_TopTriangle(lang: string): any {
        const ans = 12;
        return {
            renderData: { geometry: { type: 'transversal', labels: { left_top: 4, left_tot: 8, base_top: 6, base_bot: 'x' } }, description: "x?", answerType: 'text' },
            token: Buffer.from(ans.toString()).toString('base64'),
            clues: [{ text: "Topptriangelsatsen" }]
        };
    }

    private level4_Pythagoras(lang: string): any {
        const [a, b, c] = [3, 4, 5];
        return {
            renderData: { geometry: { type: 'triangle', subtype: 'right', width: a, height: b, labels: { base: a, height: b, hypotenuse: 'x' } }, description: "x?", answerType: 'text' },
            token: Buffer.from(c.toString()).toString('base64'),
            clues: [{ latex: "a^2 + b^2 = c^2" }]
        };
    }
}