import { MathUtils } from '../utils/MathUtils.js';

export class VolumeGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_Cuboid(lang);
            case 2: return this.level2_TriPrism(lang);
            case 3: return this.level3_Cylinder(lang);
            case 4: return this.level4_PyramidCone(lang);
            case 5: return this.level5_SphereComposite(lang);
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
                geometry: { type: 'cuboid', labels: { w, h, d } },
                description: lang === 'sv' ? "Beräkna volymen." : "Calculate the volume.",
                answerType: 'text',
                suffix: 'cm³'
            },
            token: Buffer.from(volume.toString()).toString('base64'),
            clues: [
                { 
                    text: lang === 'sv' ? "Volymen = Bredd × Djup × Höjd" : "Volume = Width × Depth × Height", 
                    latex: `V = ${w} \\\\cdot ${d} \\\\cdot ${h}` 
                }
            ]
        };
    }

    // Level 2: Triangular Prism
    private level2_TriPrism(lang: string): any {
        const b = MathUtils.randomInt(3, 8);
        const hTri = MathUtils.randomInt(2, 6);
        const length = MathUtils.randomInt(5, 12);
        const areaBase = (b * hTri) / 2;
        const volume = areaBase * length;

        return {
            renderData: {
                geometry: { type: 'triangular_prism', labels: { b, h: hTri, l: length } },
                description: lang === 'sv' ? "Beräkna prismats volym." : "Calculate the prism's volume.",
                answerType: 'numeric',
                suffix: 'cm³'
            },
            token: Buffer.from(volume.toString()).toString('base64'),
            clues: [
                { 
                    text: lang === 'sv' ? "Räkna ut basytan (triangeln) först." : "Calculate the base area (triangle) first.", 
                    latex: `B = \\\\frac{${b} \\\\cdot ${hTri}}{2} = ${areaBase}` 
                },
                { 
                    text: lang === 'sv' ? "Multiplicera basytan med längden." : "Multiply base area by length.", 
                    latex: `V = ${areaBase} \\\\cdot ${length}` 
                }
            ]
        };
    }

    // Level 3: Cylinder
    private level3_Cylinder(lang: string): any {
        const r = MathUtils.randomInt(2, 6);
        const h = MathUtils.randomInt(5, 15);
        const volume = Math.round(Math.PI * r * r * h);

        return {
            renderData: {
                geometry: { type: 'cylinder', labels: { r, h } },
                description: lang === 'sv' ? "Beräkna cylinderns volym (avrunda till heltal)." : "Calculate volume (round to integer).",
                answerType: 'numeric',
                suffix: 'cm³'
            },
            token: Buffer.from(volume.toString()).toString('base64'),
            clues: [
                { 
                    text: lang === 'sv' ? "Basytan är en cirkel." : "The base is a circle.", 
                    latex: `A = \\\\pi \\\\cdot r^2 = \\\\pi \\\\cdot ${r}^2 \\\\approx ${Math.round(Math.PI * r * r)}` 
                },
                { 
                    text: lang === 'sv' ? "Volym = Basytan × Höjden" : "Volume = Base Area × Height", 
                    latex: `V \\\\approx ${Math.round(Math.PI * r * r)} \\\\cdot ${h}` 
                }
            ]
        };
    }

    // Level 4: Pyramid & Cone
    private level4_PyramidCone(lang: string): any {
        const isCone = MathUtils.randomInt(0, 1) === 1;

        if (isCone) {
            const r = MathUtils.randomInt(3, 8);
            const h = MathUtils.randomInt(6, 15);
            const volume = Math.round((Math.PI * r * r * h) / 3);
            return {
                renderData: {
                    geometry: { type: 'cone', labels: { r, h } },
                    description: lang === 'sv' ? "Beräkna konens volym (avrunda till heltal)." : "Calculate cone volume (round to integer).",
                    answerType: 'numeric',
                    suffix: 'cm³'
                },
                token: Buffer.from(volume.toString()).toString('base64'),
                clues: [
                    { text: "Formel:", latex: `V = \\\\frac{\\\\pi r^2 h}{3}` }
                ]
            };
        } else {
            const w = MathUtils.randomInt(3, 8);
            const d = MathUtils.randomInt(3, 8); // Explicit depth
            const h = MathUtils.randomInt(6, 12);
            // Square/Rect pyramid
            const volume = Math.round((w * d * h) / 3);
            return {
                renderData: {
                    geometry: { type: 'pyramid', labels: { w, d, h } }, // Pass 'd' explicitly
                    description: lang === 'sv' ? "Beräkna pyramidens volym." : "Calculate pyramid volume.",
                    answerType: 'numeric',
                    suffix: 'cm³'
                },
                token: Buffer.from(volume.toString()).toString('base64'),
                clues: [
                    { text: "Formel:", latex: `V = \\\\frac{B \\\\cdot h}{3}` },
                    { text: "Basytan:", latex: `B = ${w} \\\\cdot ${d} = ${w * d}` }
                ]
            };
        }
    }

    // Level 5: Sphere & Composite
    private level5_SphereComposite(lang: string): any {
        // Here we just delegate to the mixed/diameter logic in Level 6 essentially, 
        // but Level 5 is usually "intro to sphere".
        // Let's add Diameter logic here too if desired, but sticking to Level 6 request.
        // Actually, let's keep Level 5 standard (Radius) and Level 6 Mixed (Radius OR Diameter).
        
        const type = MathUtils.randomChoice(['sphere', 'silo', 'ice_cream']);

        if (type === 'sphere') {
            const r = MathUtils.randomInt(3, 9);
            const volume = Math.round((4 * Math.PI * Math.pow(r, 3)) / 3);
            return {
                renderData: {
                    geometry: { type: 'sphere', labels: { r } },
                    description: lang === 'sv' ? "Beräkna klotets volym." : "Calculate sphere volume.",
                    answerType: 'numeric',
                    suffix: 'cm³'
                },
                token: Buffer.from(volume.toString()).toString('base64'),
                clues: [{ text: "Formel:", latex: `V = \\\\frac{4 \\\\pi r^3}{3}` }]
            };
        }
        else if (type === 'silo') {
            const r = MathUtils.randomInt(3, 6);
            const h = MathUtils.randomInt(Math.floor(r * 1.5), Math.floor(r * 2.5));
            const total = Math.round((Math.PI * r * r * h) + ((2 * Math.PI * Math.pow(r, 3)) / 3));

            return {
                renderData: {
                    geometry: { type: 'silo', labels: { r, h } }, 
                    description: lang === 'sv' ? "Beräkna silons volym (Cylinder + Halvklot)." : "Calculate silo volume.",
                    answerType: 'numeric',
                    suffix: 'cm³'
                },
                token: Buffer.from(total.toString()).toString('base64'),
                clues: [{ text: "Total:", latex: `V_{cyl} + V_{halv}` }]
            };
        } 
        else {
            const r = MathUtils.randomInt(3, 6);
            const h = MathUtils.randomInt(Math.floor(r * 1.5), Math.floor(r * 2.5));
            const total = Math.round(((Math.PI * r * r * h) / 3) + ((2 * Math.PI * Math.pow(r, 3)) / 3));

            return {
                renderData: {
                    geometry: { type: 'ice_cream', labels: { r, h } },
                    description: lang === 'sv' ? "Beräkna volymen (Kon + Halvklot)." : "Calculate volume.",
                    answerType: 'numeric',
                    suffix: 'cm³'
                },
                token: Buffer.from(total.toString()).toString('base64'),
                clues: [{ text: "Total:", latex: `V_{kon} + V_{halv}` }]
            };
        }
    }

    // Level 6: Mixed with DIAMETER Logic
    private level6_Mixed(lang: string): any {
        const type = MathUtils.randomChoice(['sphere', 'silo', 'ice_cream']);
        const useDiameter = MathUtils.randomInt(0, 1) === 1; // 50% chance of Diameter

        let r = MathUtils.randomInt(3, 8);
        let dLabel = r * 2;
        let h = MathUtils.randomInt(Math.floor(r * 1.5), Math.floor(r * 2.5)); // For composites

        let volume = 0;
        let labels: any = {};
        
        // Prepare Labels based on Mode
        if (useDiameter) labels = { d: dLabel, h };
        else labels = { r, h };

        // Helper to get R from D description
        const dimDesc = useDiameter ? `(d = ${dLabel})` : `(r = ${r})`;

        if (type === 'sphere') {
            volume = Math.round((4 * Math.PI * Math.pow(r, 3)) / 3);
            if (useDiameter) labels = { d: dLabel }; // No height for sphere
            else labels = { r };

            return {
                renderData: {
                    geometry: { type: 'sphere', labels, show: useDiameter ? 'diameter' : 'radius' },
                    description: lang === 'sv' 
                        ? `Beräkna klotets volym ${dimDesc}.` 
                        : `Calculate sphere volume ${dimDesc}.`,
                    answerType: 'numeric',
                    suffix: 'cm³'
                },
                token: Buffer.from(volume.toString()).toString('base64'),
                clues: [
                    useDiameter ? { text: lang === 'sv' ? "Radien är hälften av diametern." : "Radius is half the diameter.", latex: `r = ${dLabel}/2 = ${r}` } : null,
                    { text: "Formel:", latex: `V = \\\\frac{4 \\\\pi \\\\cdot ${r}^3}{3}` }
                ].filter(Boolean)
            };
        }
        else if (type === 'silo') {
            // Silo = Cylinder + Hemisphere
            const volCyl = Math.PI * r * r * h;
            const volHemi = (2 * Math.PI * Math.pow(r, 3)) / 3;
            volume = Math.round(volCyl + volHemi);

            return {
                renderData: {
                    geometry: { type: 'silo', labels, show: useDiameter ? 'diameter' : 'radius' },
                    description: lang === 'sv' ? "Beräkna silons volym." : "Calculate silo volume.",
                    answerType: 'numeric',
                    suffix: 'cm³'
                },
                token: Buffer.from(volume.toString()).toString('base64'),
                clues: [
                    useDiameter ? { text: "Hitta radien:", latex: `r = ${dLabel}/2 = ${r}` } : null,
                    { text: "Cylinder:", latex: `\\pi \\cdot ${r}^2 \\cdot ${h}` },
                    { text: "Halvklot:", latex: `\\frac{2 \\cdot \\pi \\cdot ${r}^3}{3}` }
                ].filter(Boolean)
            };
        }
        else {
            // Ice Cream = Cone + Hemisphere
            const volCone = (Math.PI * r * r * h) / 3;
            const volHemi = (2 * Math.PI * Math.pow(r, 3)) / 3;
            volume = Math.round(volCone + volHemi);

            return {
                renderData: {
                    geometry: { type: 'ice_cream', labels, show: useDiameter ? 'diameter' : 'radius' },
                    description: lang === 'sv' ? "Beräkna volymen." : "Calculate volume.",
                    answerType: 'numeric',
                    suffix: 'cm³'
                },
                token: Buffer.from(volume.toString()).toString('base64'),
                clues: [
                    useDiameter ? { text: "Hitta radien:", latex: `r = ${dLabel}/2 = ${r}` } : null,
                    { text: "Kon:", latex: `\\frac{\\pi \\cdot ${r}^2 \\cdot ${h}}{3}` },
                    { text: "Halvklot:", latex: `\\frac{2 \\cdot \\pi \\cdot ${r}^3}{3}` }
                ].filter(Boolean)
            };
        }
    }

    // Level 7: Mixed Units Conversion
    private level7_Units(lang: string): any {
        const scenario = MathUtils.randomChoice([0, 1, 2, 3]);

        if (scenario === 0 || scenario === 1) {
            const isCyl = scenario === 1;
            const dim1 = MathUtils.randomInt(2, 8) * 10; 
            const dim2 = MathUtils.randomInt(2, 8) * 10;
            const dim3 = MathUtils.randomInt(2, 8) * 10;

            const val1_dm = dim1 / 10;
            const val2_dm = dim2 / 10;
            const val3_dm = dim3 / 10;

            let volume = 0;
            let visual: any = {};
            let formula = "";

            if (isCyl) {
                volume = Math.round(Math.PI * val1_dm * val1_dm * val2_dm);
                visual = { type: 'cylinder', labels: { r: `${dim1} cm`, h: `${dim2} cm` } };
                formula = `V \\\\approx \\\\pi \\\\cdot ${val1_dm}^2 \\\\cdot ${val2_dm}`;
            } else {
                volume = val1_dm * val2_dm * val3_dm;
                visual = { type: 'cuboid', labels: { w: `${dim1} cm`, d: `${dim2} cm`, h: `${dim3} cm` } };
                formula = `V = ${val1_dm} \\\\cdot ${val2_dm} \\\\cdot ${val3_dm}`;
            }

            return {
                renderData: {
                    geometry: visual,
                    description: lang === 'sv' 
                        ? "Hur många liter rymmer figuren? (Tips: 1 liter = 1 dm³)" 
                        : "How many liters does the shape hold? (Hint: 1 liter = 1 dm³)",
                    answerType: 'numeric',
                    suffix: 'liter'
                },
                token: Buffer.from(volume.toString()).toString('base64'),
                clues: [
                    { 
                        text: lang === 'sv' ? "Gör om sidorna till dm först." : "Convert sides to dm first.", 
                        latex: `${dim1} \\\\text{ cm} = ${val1_dm} \\\\text{ dm}` 
                    },
                    { 
                        text: lang === 'sv' ? "Beräkna sedan volymen." : "Then calculate volume.", 
                        latex: formula 
                    }
                ]
            };
        } 
        
        else if (scenario === 2) {
            const w = MathUtils.randomInt(1, 5) * 100; 
            const d = MathUtils.randomInt(1, 4) * 100;
            const h = MathUtils.randomInt(1, 3) * 100;
            
            const w_m = w / 100;
            const d_m = d / 100;
            const h_m = h / 100;
            
            const volume = w_m * d_m * h_m;

            return {
                renderData: {
                    geometry: { type: 'cuboid', labels: { w: `${w} cm`, d: `${d} cm`, h: `${h} cm` } },
                    description: lang === 'sv' ? "Beräkna volymen i kubikmeter (m³)." : "Calculate volume in cubic meters (m³).",
                    answerType: 'numeric',
                    suffix: 'm³'
                },
                token: Buffer.from(volume.toString()).toString('base64'),
                clues: [
                    { text: lang === 'sv' ? "Omvandla cm till m." : "Convert cm to m.", latex: `${w} \\\\text{ cm} = ${w_m} \\\\text{ m}` },
                    { text: "Volym:", latex: `${w_m} \\\\cdot ${d_m} \\\\cdot ${h_m} = ${volume}` }
                ]
            };
        } 
        
        else {
            const w = MathUtils.randomInt(2, 9) * 10; 
            const d = MathUtils.randomInt(2, 9) * 10;
            const h = MathUtils.randomInt(2, 9) * 10;

            const w_cm = w / 10;
            const d_cm = d / 10;
            const h_cm = h / 10;
            const volume = w_cm * d_cm * h_cm;

            return {
                renderData: {
                    geometry: { type: 'cuboid', labels: { w: `${w} mm`, d: `${d} mm`, h: `${h} mm` } },
                    description: lang === 'sv' ? "Beräkna volymen i cm³." : "Calculate volume in cm³.",
                    answerType: 'numeric',
                    suffix: 'cm³'
                },
                token: Buffer.from(volume.toString()).toString('base64'),
                clues: [
                    { text: lang === 'sv' ? "Omvandla mm till cm." : "Convert mm to cm.", latex: `${w} \\\\text{ mm} = ${w_cm} \\\\text{ cm}` },
                    { text: "Volym:", latex: `${w_cm} \\\\cdot ${d_cm} \\\\cdot ${h_cm} = ${volume}` }
                ]
            };
        }
    }
}