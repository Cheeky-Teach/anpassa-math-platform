import { MathUtils } from '../utils/MathUtils.js';

export class GeometryGenerator {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_PerimeterRect(lang);
            case 2: return this.level2_AreaRect(lang);
            case 3: return this.level3_AreaTriangle(lang);
            case 4: return this.level4_Circles(lang);
            case 5: return this.level5_Composite(lang);
            default: return this.level1_PerimeterRect(lang);
        }
    }

    // Level 1: Perimeter (Rectangle)
    private level1_PerimeterRect(lang: string): any {
        const w = MathUtils.randomInt(3, 12);
        const h = MathUtils.randomInt(3, 12);
        const ans = 2 * w + 2 * h;

        return {
            renderData: {
                geometry: { type: 'rectangle', width: w, height: h, labels: true },
                description: lang === 'sv' ? "Beräkna omkretsen (O)." : "Calculate the perimeter (P).",
                answerType: 'text'
            },
            token: Buffer.from(ans.toString()).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Omkrets är summan av alla sidor." : "Perimeter is the sum of all sides.", latex: `O = ${w} + ${w} + ${h} + ${h}` },
                { text: lang === 'sv' ? "Addera ihop sidorna." : "Add the sides together." }
            ]
        };
    }

    // Level 2: Area (Rectangle)
    private level2_AreaRect(lang: string): any {
        const w = MathUtils.randomInt(3, 12);
        const h = MathUtils.randomInt(3, 12);
        const ans = w * h;

        return {
            renderData: {
                geometry: { type: 'rectangle', width: w, height: h, labels: true },
                description: lang === 'sv' ? "Beräkna arean (A)." : "Calculate the area (A).",
                answerType: 'text'
            },
            token: Buffer.from(ans.toString()).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Area för rektangel = Basen × Höjden" : "Area of rectangle = Base × Height", latex: `A = b \\cdot h` },
                { text: lang === 'sv' ? "Multiplicera sidorna." : "Multiply the sides.", latex: `A = ${w} \\cdot ${h}` }
            ]
        };
    }

    // Level 3: Area (Triangle)
    private level3_AreaTriangle(lang: string): any {
        const b = MathUtils.randomInt(4, 14);
        // Ensure height is even so area is integer, or handle .5 in answer
        const h = MathUtils.randomInt(2, 6) * 2; 
        const ans = (b * h) / 2;

        return {
            renderData: {
                geometry: { type: 'triangle', width: b, height: h, labels: { base: b, height: h } },
                description: lang === 'sv' ? "Beräkna arean (A)." : "Calculate the area (A).",
                answerType: 'text'
            },
            token: Buffer.from(ans.toString()).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Area för triangel = (Basen × Höjden) / 2" : "Area of triangle = (Base × Height) / 2", latex: `A = \\frac{b \\cdot h}{2}` },
                { text: lang === 'sv' ? "Sätt in värdena." : "Insert the values.", latex: `A = \\frac{${b} \\cdot ${h}}{2}` }
            ]
        };
    }

    // Level 4: Circles (Perimeter & Area)
    private level4_Circles(lang: string): any {
        const r = MathUtils.randomInt(3, 10);
        // Randomly ask for Area or Circumference
        const isArea = Math.random() > 0.5;
        
        // Simple approximation for integer input
        const pi = 3.14; 
        const exact = isArea ? pi * r * r : 2 * pi * r;
        const ans = Math.round(exact); 

        return {
            renderData: {
                geometry: { type: 'circle', radius: r, show: 'radius', value: r },
                description: isArea 
                    ? (lang === 'sv' ? "Beräkna arean (avrunda till heltal, pi≈3.14)." : "Calculate area (round to integer, pi≈3.14).")
                    : (lang === 'sv' ? "Beräkna omkretsen (avrunda till heltal, pi≈3.14)." : "Calculate circumference (round to integer, pi≈3.14)."),
                answerType: 'text'
            },
            token: Buffer.from(ans.toString()).toString('base64'),
            clues: [
                { 
                    text: isArea ? (lang === 'sv' ? "Formel för Area:" : "Formula for Area:") : (lang === 'sv' ? "Formel för Omkrets:" : "Formula for Circumference:"),
                    latex: isArea ? `A = \\pi \\cdot r^2` : `O = 2 \\cdot \\pi \\cdot r`
                },
                {
                    text: lang === 'sv' ? `Använd r=${r}` : `Use r=${r}`,
                    latex: isArea ? `A \\approx 3.14 \\cdot ${r} \\cdot ${r}` : `O \\approx 2 \\cdot 3.14 \\cdot ${r}`
                }
            ]
        };
    }

    // Level 5: Composite Shapes (e.g., House shape: Rect + Triangle)
    private level5_Composite(lang: string): any {
        const w = 10;
        const hRect = 8;
        const hTri = 4;
        
        // Answer is Area of Rect + Area of Triangle
        const ans = (w * hRect) + ((w * hTri) / 2);

        return {
            renderData: {
                // Front-end 'composite' type logic
                geometry: { 
                    type: 'composite', 
                    subtype: 'house', 
                    labels: { w: w, h: hRect, h_roof: hTri } 
                },
                description: lang === 'sv' ? "Beräkna totala arean." : "Calculate the total area.",
                answerType: 'text'
            },
            token: Buffer.from(ans.toString()).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Dela upp figuren i en rektangel och en triangel." : "Split the shape into a rectangle and a triangle." },
                { text: lang === 'sv' ? "Addera de två areorna." : "Add the two areas together.", latex: `A_{tot} = (10 \\cdot 8) + \\frac{10 \\cdot 4}{2}` }
            ]
        };
    }
}