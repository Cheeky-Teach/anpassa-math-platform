import { MathUtils } from '../utils/MathUtils.js';

export class VolumeGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_Cuboid(lang);
            case 2: return this.level2_TriPrism(lang);
            case 3: return this.level3_Cylinder(lang);
            case 4: return this.level4_PyramidCone(lang);
            case 5: return this.level5_Sphere(lang);
            case 6: return this.level6_Mixed(lang);
            case 7: return this.level7_Units(lang);
            default: return this.level1_Cuboid(lang);
        }
    }

    // Level 1: Rectangular Prism (Cuboid) & Cube
    private level1_Cuboid(lang: string): any {
        const w = MathUtils.randomInt(2, 10);
        const d = MathUtils.randomInt(2, 10);
        const h = MathUtils.randomInt(2, 10);
        const volume = w * d * h;

        return {
            renderData: {
                geometry: { 
                    type: 'cuboid', 
                    labels: { w, h, d } 
                },
                description: lang === 'sv' ? "Beräkna volymen (V)." : "Calculate the volume (V).",
                answerType: 'text'
            },
            token: Buffer.from(volume.toString()).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Volym = Basytan · Höjden" : "Volume = Base Area · Height" },
                { latex: `V = ${w} \\cdot ${d} \\cdot ${h}` }
            ]
        };
    }

    // Level 2: Triangular Prism
    private level2_TriPrism(lang: string): any {
        const b = MathUtils.randomInt(3, 10);
        const hTri = MathUtils.randomInt(2, 8); // Height of triangle base
        const len = MathUtils.randomInt(5, 15); // Length of prism
        const volume = (b * hTri / 2) * len;

        return {
            renderData: {
                geometry: { 
                    type: 'triangular_prism', 
                    labels: { b, h: hTri, l: len } 
                },
                description: lang === 'sv' ? "Beräkna volymen." : "Calculate the volume.",
                answerType: 'text'
            },
            token: Buffer.from(volume.toString()).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Räkna ut triangelns area (Basytan) först." : "Calculate the triangle area (Base) first.", latex: `B = \\frac{${b} \\cdot ${hTri}}{2}` },
                { text: lang === 'sv' ? "Multiplicera sedan med längden." : "Then multiply by the length.", latex: `V = B \\cdot ${len}` }
            ]
        };
    }

    // Level 3: Cylinder
    private level3_Cylinder(lang: string): any {
        const r = MathUtils.randomInt(2, 6);
        const h = MathUtils.randomInt(5, 15);
        // Approximation for input simplicity
        const vol = Math.round(Math.PI * r * r * h); 

        return {
            renderData: {
                geometry: { 
                    type: 'cylinder', 
                    labels: { r, h } 
                },
                description: lang === 'sv' 
                    ? "Beräkna volymen (avrunda till heltal, pi≈3.14)." 
                    : "Calculate volume (round to integer, pi≈3.14).",
                answerType: 'text'
            },
            token: Buffer.from(vol.toString()).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Basytan är en cirkel." : "The base is a circle.", latex: `B = \\pi \\cdot r^2` },
                { latex: `V \\approx 3.14 \\cdot ${r}^2 \\cdot ${h}` }
            ]
        };
    }

    // Level 4: Pyramid & Cone
    private level4_PyramidCone(lang: string): any {
        const isCone = Math.random() > 0.5;
        
        if (isCone) {
            const r = MathUtils.randomInt(3, 8);
            const h = MathUtils.randomInt(3, 12);
            // V = (pi*r^2*h)/3
            const vol = Math.round((Math.PI * r * r * h) / 3);
            
            return {
                renderData: {
                    geometry: { type: 'cone', labels: { r, h } },
                    description: lang === 'sv' ? "Beräkna volymen (avrunda till heltal)." : "Calculate volume (round to integer).",
                    answerType: 'text'
                },
                token: Buffer.from(vol.toString()).toString('base64'),
                clues: [{ latex: `V = \\frac{\\pi \\cdot r^2 \\cdot h}{3}` }]
            };
        } else {
            // Square Pyramid
            const s = MathUtils.randomInt(4, 10);
            const h = MathUtils.randomInt(6, 15);
            // Ensure integer answer if possible, or round
            const vol = Math.round((s * s * h) / 3);

            return {
                renderData: {
                    geometry: { type: 'pyramid', labels: { s, h } },
                    description: lang === 'sv' ? "Beräkna volymen (avrunda till heltal)." : "Calculate volume (round to integer).",
                    answerType: 'text'
                },
                token: Buffer.from(vol.toString()).toString('base64'),
                clues: [{ text: lang === 'sv' ? "Spetsiga kroppar delas med 3." : "Pointed shapes are divided by 3.", latex: `V = \\frac{${s} \\cdot ${s} \\cdot ${h}}{3}` }]
            };
        }
    }

    // Level 5: Sphere
    private level5_Sphere(lang: string): any {
        const r = MathUtils.randomInt(3, 15); // Use integers divisible by 3 for cleaner math? No, just round.
        // V = 4 * pi * r^3 / 3
        const vol = Math.round((4 * Math.PI * Math.pow(r, 3)) / 3);

        return {
            renderData: {
                geometry: { type: 'sphere', labels: { r } },
                description: lang === 'sv' ? "Beräkna volymen (avrunda till heltal)." : "Calculate volume (round to integer).",
                answerType: 'text'
            },
            token: Buffer.from(vol.toString()).toString('base64'),
            clues: [{ latex: `V = \\frac{4 \\cdot \\pi \\cdot r^3}{3}` }]
        };
    }

    // Level 6: Mixed
    private level6_Mixed(lang: string): any {
        return this.generate(MathUtils.randomInt(1, 5), lang);
    }

    // Level 7: Units Conversion Logic
    private level7_Units(lang: string): any {
        // Example: Cube with side 10cm. Answer in Liters.
        const sideCm = 10;
        const volCm3 = 1000;
        const volLiters = 1;

        return {
            renderData: {
                geometry: { type: 'cuboid', labels: { w: '10 cm', d: '10 cm', h: '10 cm' } },
                description: lang === 'sv' 
                    ? "Hur många liter rymmer kuben?" 
                    : "How many liters does the cube hold?",
                answerType: 'text'
            },
            token: Buffer.from(volLiters.toString()).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "1 liter = 1 dm³" : "1 liter = 1 dm³" },
                { text: lang === 'sv' ? "Omvandla sidorna till dm först: 10 cm = 1 dm." : "Convert sides to dm first: 10 cm = 1 dm." }
            ]
        };
    }
}