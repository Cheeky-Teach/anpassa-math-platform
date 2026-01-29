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
            const h = MathUtils.randomInt(6, 12);
            // Square pyramid
            const volume = Math.round((w * w * h) / 3);
            return {
                renderData: {
                    geometry: { type: 'pyramid', labels: { w, h } },
                    description: lang === 'sv' ? "Beräkna pyramidens volym (kvadratisk bas)." : "Calculate pyramid volume (square base).",
                    answerType: 'numeric',
                    suffix: 'cm³'
                },
                token: Buffer.from(volume.toString()).toString('base64'),
                clues: [
                    { text: "Formel:", latex: `V = \\\\frac{B \\\\cdot h}{3}` },
                    { text: "Basytan:", latex: `B = ${w} \\\\cdot ${w} = ${w * w}` }
                ]
            };
        }
    }

    // ========================================================================
    // LEVEL 5: SPHERE & COMPOSITE (FIXED SCALING)
    // Ensures Silo/Ice Cream shapes fit within canvas by checking aspect ratio
    // ========================================================================
    private level5_SphereComposite(lang: string): any {
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
            // Silo = Cylinder + Hemisphere on top
            // Fix: Constrain height relative to radius to prevent "tall thin" shapes that clip
            const r = MathUtils.randomInt(3, 6);
            // Height is 1.5x to 2.5x radius. 
            const h = MathUtils.randomInt(Math.floor(r * 1.5), Math.floor(r * 2.5));
            
            const volCyl = Math.PI * r * r * h;
            const volHemi = (2 * Math.PI * Math.pow(r, 3)) / 3;
            const total = Math.round(volCyl + volHemi);

            return {
                renderData: {
                    geometry: { type: 'silo', labels: { r, h } }, // 'h' is cylinder part
                    description: lang === 'sv' ? "Beräkna silons volym (Cylinder + Halvklot)." : "Calculate silo volume (Cylinder + Hemisphere).",
                    answerType: 'numeric',
                    suffix: 'cm³'
                },
                token: Buffer.from(total.toString()).toString('base64'),
                clues: [
                    { text: "Cylinder:", latex: `V_{cyl} = \\\\pi \\\\cdot ${r}^2 \\\\cdot ${h}` },
                    { text: "Halvklot:", latex: `V_{halv} = \\\\frac{2 \\\\pi \\\\cdot ${r}^3}{3}` }
                ]
            };
        } 
        else {
            // Ice Cream = Cone + Hemisphere
            // Fix: Constrain cone height relative to radius
            const r = MathUtils.randomInt(3, 6);
            const h = MathUtils.randomInt(Math.floor(r * 1.5), Math.floor(r * 2.5));

            const volCone = (Math.PI * r * r * h) / 3;
            const volHemi = (2 * Math.PI * Math.pow(r, 3)) / 3;
            const total = Math.round(volCone + volHemi);

            return {
                renderData: {
                    geometry: { type: 'ice_cream', labels: { r, h } },
                    description: lang === 'sv' ? "Beräkna volymen (Kon + Halvklot)." : "Calculate volume (Cone + Hemisphere).",
                    answerType: 'numeric',
                    suffix: 'cm³'
                },
                token: Buffer.from(total.toString()).toString('base64'),
                clues: [
                    { text: "Kon:", latex: `V_{kon} = \\\\frac{\\\\pi \\\\cdot ${r}^2 \\\\cdot ${h}}{3}` },
                    { text: "Halvklot:", latex: `V_{halv} = \\\\frac{2 \\\\pi \\\\cdot ${r}^3}{3}` }
                ]
            };
        }
    }

    // Level 6: Mixed
    private level6_Mixed(lang: string): any {
        const mode = MathUtils.randomInt(3, 5);
        if (mode === 3) return this.level3_Cylinder(lang);
        if (mode === 4) return this.level4_PyramidCone(lang);
        return this.level5_SphereComposite(lang);
    }

    // ========================================================================
    // LEVEL 7: MIXED UNITS CONVERSION
    // Forces user to convert units (e.g., cm -> dm) BEFORE calculating volume
    // ========================================================================
    private level7_Units(lang: string): any {
        // Scenarios:
        // 0: Cuboid (cm -> Liters/dm³)
        // 1: Cylinder (cm -> Liters/dm³)
        // 2: Cuboid (cm -> m³)
        // 3: Cuboid (mm -> cm³)

        const scenario = MathUtils.randomChoice([0, 1, 2, 3]);

        if (scenario === 0 || scenario === 1) {
            // --- TARGET: LITERS (dm³) ---
            // Input: cm
            // Strategy: Convert cm to dm (/10), then calc volume.
            
            const isCyl = scenario === 1;
            // Generate dims that are multiples of 10 for clean conversion
            // e.g., 20cm, 50cm -> 2dm, 5dm
            const dim1 = MathUtils.randomInt(2, 8) * 10; // 20-80 cm
            const dim2 = MathUtils.randomInt(2, 8) * 10;
            const dim3 = MathUtils.randomInt(2, 8) * 10; // Only used for cuboid

            const val1_dm = dim1 / 10;
            const val2_dm = dim2 / 10;
            const val3_dm = dim3 / 10;

            let volume = 0;
            let visual: any = {};
            let formula = "";

            if (isCyl) {
                // dim1 = radius, dim2 = height
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
            // --- TARGET: m³ ---
            // Input: cm (e.g. 200 cm)
            const w = MathUtils.randomInt(1, 5) * 100; // 100, 200... cm
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
            // --- TARGET: cm³ ---
            // Input: mm
            const w = MathUtils.randomInt(2, 9) * 10; // 20-90 mm
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