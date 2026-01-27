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

    // Level 1: Concept (Multiple Choice)
    private level1_Concept(lang: string): any {
        // Theoretical question
        return {
            renderData: {
                latex: "",
                description: lang === 'sv' 
                    ? "Vad krävs för att två trianglar ska vara likformiga?" 
                    : "What is required for two triangles to be similar?",
                answerType: 'multiple_choice',
                choices: [
                    lang === 'sv' ? "Alla motsvarande vinklar är lika stora." : "All corresponding angles are equal.",
                    lang === 'sv' ? "Alla sidor är lika långa." : "All sides are the same length.",
                    lang === 'sv' ? "De har samma area." : "They have the same area.",
                    lang === 'sv' ? "En vinkel är 90 grader." : "One angle is 90 degrees."
                ].sort(() => Math.random() - 0.5)
            },
            token: Buffer.from(lang === 'sv' ? "Alla motsvarande vinklar är lika stora." : "All corresponding angles are equal.").toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Det handlar om formen, inte storleken." : "It's about shape, not size." }
            ]
        };
    }

    // Level 2: Calculate Side (X) using Ratio
    private level2_CalcSide(lang: string): any {
        const ratio = MathUtils.randomInt(2, 4);
        const s1 = MathUtils.randomInt(3, 8);
        const s2 = MathUtils.randomInt(4, 10); // Unrelated side
        
        const bigS1 = s1 * ratio;
        const bigS2 = s2 * ratio;

        // Visual: Two rectangles or triangles side by side
        return {
            renderData: {
                geometry: {
                    type: 'similarity_compare',
                    shapeType: 'triangle',
                    left: { labels: { s1: s1, s2: s2 } },
                    right: { labels: { s1: 'x', s2: bigS2 } } // x corresponds to bigS1
                },
                description: lang === 'sv' ? "Figurerna är likformiga. Beräkna x." : "The shapes are similar. Calculate x.",
                answerType: 'text'
            },
            token: Buffer.from(bigS1.toString()).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Jämför motsvarande sidor." : "Compare corresponding sides." },
                { latex: `\\frac{x}{${s1}} = \\frac{${bigS2}}{${s2}}` },
                { text: lang === 'sv' ? `Förhållandet är ${ratio}.` : `The ratio is ${ratio}.` }
            ]
        };
    }

    // Level 3: Top Triangle Theorem (Transversal)
    private level3_TopTriangle(lang: string): any {
        const top = MathUtils.randomInt(2, 6);
        const bot = MathUtils.randomInt(2, 6); // Additive part of side
        const wholeSide = top + bot;
        
        const baseSmall = MathUtils.randomInt(3, 8);
        // Ratio = whole / top
        // Redo for integer safety:
        const scale = MathUtils.randomInt(2, 3);
        const smallH = MathUtils.randomInt(4, 8);
        const largeH = smallH * scale;
        const smallB = MathUtils.randomInt(3, 6);
        const largeB = smallB * scale;

        return {
            renderData: {
                geometry: {
                    type: 'transversal',
                    labels: { 
                        left_top: smallH, 
                        left_tot: largeH, 
                        base_top: smallB, 
                        base_bot: 'x' 
                    }
                },
                description: lang === 'sv' ? "Beräkna basen x." : "Calculate base x.",
                answerType: 'text'
            },
            token: Buffer.from(largeB.toString()).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Topptriangeln är likformig med hela triangeln." : "The top triangle is similar to the whole triangle." },
                { latex: `\\frac{x}{${smallB}} = \\frac{${largeH}}{${smallH}}` }
            ]
        };
    }

    // Level 4: Pythagorean Theorem
    private level4_Pythagoras(lang: string): any {
        // Generate Pythagorean triples for clean integers
        // k*(3,4,5) or k*(5,12,13)
        const triples = [[3,4,5], [5,12,13], [8,15,17]];
        const baseTriple = MathUtils.randomChoice(triples);
        const k = MathUtils.randomInt(1, 3);
        // Explicitly type parameter n to number to satisfy noImplicitAny
        const [a, b, c] = baseTriple.map((n: number) => n * k);

        // Randomly solving for hypotenuse (c) or a leg (a)
        const solveHyp = Math.random() > 0.5;

        let labels: any = {};
        let ans = 0;
        let clueFormula = "";

        if (solveHyp) {
            labels = { base: a, height: b, hypotenuse: 'x' };
            ans = c;
            clueFormula = `x^2 = ${a}^2 + ${b}^2`;
        } else {
            labels = { base: 'x', height: b, hypotenuse: c };
            ans = a;
            clueFormula = `x^2 + ${b}^2 = ${c}^2`;
        }

        return {
            renderData: {
                geometry: {
                    type: 'triangle',
                    subtype: 'right', // Frontend renders right angle box
                    width: a,
                    height: b,
                    labels: labels,
                    orientation: 'up'
                },
                description: lang === 'sv' ? "Beräkna x." : "Calculate x.",
                answerType: 'text'
            },
            token: Buffer.from(ans.toString()).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Använd Pythagoras sats." : "Use the Pythagorean theorem.", latex: "a^2 + b^2 = c^2" },
                { latex: clueFormula }
            ]
        };
    }
}