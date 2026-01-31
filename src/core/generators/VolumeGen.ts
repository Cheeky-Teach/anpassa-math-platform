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

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
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
            token: this.toBase64(volume.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? "För ett rätblock multiplicerar du alla tre sidorna." : "For a rectangular prism, multiply all three sides.", 
                    latex: `V = \\text{Bredd} \\cdot \\text{Djup} \\cdot \\text{Höjd}` 
                },
                { 
                    text: lang === 'sv' ? "Sätt in siffrorna:" : "Insert the numbers:", 
                    latex: `V = ${w} \\cdot ${d} \\cdot ${h}` 
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
            token: this.toBase64(volume.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? "1. Börja med att räkna ut arean på triangeln (basytan)." : "1. Start by calculating the area of the triangle (base).", 
                    latex: `B = \\frac{${b} \\cdot ${hTri}}{2} = ${areaBase}` 
                },
                { 
                    text: lang === 'sv' ? "2. Multiplicera basytan med prismats längd." : "2. Multiply the base area by the prism's length.", 
                    latex: `V = ${areaBase} \\cdot ${length}` 
                }
            ]
        };
    }

    // Level 3: Cylinder
    private level3_Cylinder(lang: string): any {
        const r = MathUtils.randomInt(2, 6);
        const h = MathUtils.randomInt(5, 15);
        const areaBase = Math.round(Math.PI * r * r * 10) / 10;
        const volume = Math.round(Math.PI * r * r * h);

        return {
            renderData: {
                geometry: { type: 'cylinder', labels: { r, h } },
                description: lang === 'sv' ? "Beräkna cylinderns volym (avrunda till heltal)." : "Calculate volume (round to integer).",
                answerType: 'numeric',
                suffix: 'cm³'
            },
            token: this.toBase64(volume.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? "1. Beräkna bottenplattans area (en cirkel)." : "1. Calculate the area of the base (a circle).", 
                    latex: `A = \\pi \\cdot r^2 \\approx 3.14 \\cdot ${r}^2 \\approx ${areaBase}` 
                },
                { 
                    text: lang === 'sv' ? "2. Multiplicera bottenarean med höjden." : "2. Multiply the base area by the height.", 
                    latex: `V \\approx ${areaBase} \\cdot ${h}` 
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
            const cylinderVol = Math.round(Math.PI * r * r * h);
            
            return {
                renderData: {
                    geometry: { type: 'cone', labels: { r, h } },
                    description: lang === 'sv' ? "Beräkna konens volym (avrunda till heltal)." : "Calculate cone volume (round to integer).",
                    answerType: 'numeric',
                    suffix: 'cm³'
                },
                token: this.toBase64(volume.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? "Tänk dig först att det var en cylinder:" : "Imagine it was a cylinder first:", 
                        latex: `V_{cyl} = \\pi \\cdot ${r}^2 \\cdot ${h} \\approx ${cylinderVol}` 
                    },
                    { 
                        text: lang === 'sv' ? "Eftersom figuren är spetsig, dela med 3." : "Since the figure is pointy, divide by 3.", 
                        latex: `V_{kon} = \\frac{${cylinderVol}}{3}` 
                    }
                ]
            };
        } else {
            const w = MathUtils.randomInt(3, 8);
            const d = MathUtils.randomInt(3, 8); 
            const h = MathUtils.randomInt(6, 12);
            const volume = Math.round((w * d * h) / 3);
            const boxVol = w * d * h;

            return {
                renderData: {
                    geometry: { type: 'pyramid', labels: { w, d, h } }, 
                    description: lang === 'sv' ? "Beräkna pyramidens volym." : "Calculate pyramid volume.",
                    answerType: 'numeric',
                    suffix: 'cm³'
                },
                token: this.toBase64(volume.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? "Räkna ut basytan (botten)." : "Calculate the base area.", 
                        latex: `B = ${w} \\cdot ${d} = ${w * d}` 
                    },
                    { 
                        text: lang === 'sv' ? "Volymen är (Basen × Höjden) delat med 3." : "Volume is (Base × Height) divided by 3.", 
                        latex: `V = \\frac{${w*d} \\cdot ${h}}{3} = \\frac{${boxVol}}{3}` 
                    }
                ]
            };
        }
    }

    // Level 5: Sphere & Composite (Basic)
    private level5_SphereComposite(lang: string): any {
        const type = MathUtils.randomChoice(['sphere', 'silo']);

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
                token: this.toBase64(volume.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? "Formeln för ett klot är:" : "The formula for a sphere is:", 
                        latex: `V = \\frac{4 \\cdot \\pi \\cdot r^3}{3}` 
                    },
                    { 
                        text: lang === 'sv' ? "Börja med att räkna ut r³." : "Start by calculating r³.", 
                        latex: `${r}^3 = ${r} \\cdot ${r} \\cdot ${r} = ${r*r*r}` 
                    }
                ]
            };
        }
        else { // Silo
            const r = MathUtils.randomInt(3, 6);
            const h = MathUtils.randomInt(6, 12);
            const cylVol = Math.round(Math.PI * r * r * h);
            const hemiVol = Math.round(((4 * Math.PI * Math.pow(r, 3)) / 3) / 2);
            const total = cylVol + hemiVol;

            return {
                renderData: {
                    geometry: { type: 'silo', labels: { r, h } }, 
                    description: lang === 'sv' ? "Beräkna silons volym (Cylinder + Halvklot)." : "Calculate silo volume (Cylinder + Hemisphere).",
                    answerType: 'numeric',
                    suffix: 'cm³'
                },
                token: this.toBase64(total.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? "1. Beräkna cylinderns volym." : "1. Calculate cylinder volume.", 
                        latex: `V_{cyl} \\approx ${cylVol}` 
                    },
                    { 
                        text: lang === 'sv' ? "2. Beräkna halvklotets volym (Klot / 2)." : "2. Calculate hemisphere volume (Sphere / 2).", 
                        latex: `V_{halv} \\approx ${hemiVol}` 
                    },
                    { 
                        text: lang === 'sv' ? "3. Addera dem." : "3. Add them together.", 
                        latex: `${cylVol} + ${hemiVol}` 
                    }
                ]
            };
        } 
    }

    // Level 6: Mixed with DIAMETER Logic
    private level6_Mixed(lang: string): any {
        const type = MathUtils.randomChoice(['sphere', 'ice_cream']);
        const useDiameter = true; // Force diameter practice for this level

        let r = MathUtils.randomInt(3, 8);
        let dLabel = r * 2;
        let h = MathUtils.randomInt(8, 15); 

        if (type === 'sphere') {
            let volume = Math.round((4 * Math.PI * Math.pow(r, 3)) / 3);
            return {
                renderData: {
                    geometry: { type: 'sphere', labels: { d: dLabel }, show: 'diameter' },
                    description: lang === 'sv' ? `Beräkna klotets volym (d = ${dLabel}).` : `Calculate sphere volume (d = ${dLabel}).`,
                    answerType: 'numeric',
                    suffix: 'cm³'
                },
                token: this.toBase64(volume.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? "Först måste du hitta radien (hälften av diametern)." : "First find the radius (half the diameter).", 
                        latex: `r = \\frac{${dLabel}}{2} = ${r}` 
                    },
                    { 
                        text: lang === 'sv' ? "Använd nu volymformeln." : "Now use the volume formula.", 
                        latex: `V = \\frac{4 \\cdot \\pi \\cdot ${r}^3}{3}` 
                    }
                ]
            };
        }
        else { // Ice Cream
            const coneVol = Math.round((Math.PI * r * r * h) / 3);
            const hemiVol = Math.round(((4 * Math.PI * Math.pow(r, 3)) / 3) / 2);
            const total = coneVol + hemiVol;

            return {
                renderData: {
                    geometry: { type: 'ice_cream', labels: { d: dLabel, h }, show: 'diameter' },
                    description: lang === 'sv' ? "Beräkna volymen (Kon + Halvklot)." : "Calculate volume (Cone + Hemisphere).",
                    answerType: 'numeric',
                    suffix: 'cm³'
                },
                token: this.toBase64(total.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? "Hitta radien:" : "Find radius:", 
                        latex: `r = ${r}` 
                    },
                    { 
                        text: lang === 'sv' ? "Dela upp i Kon + Halvklot." : "Split into Cone + Hemisphere.", 
                        latex: `V \\approx ${coneVol} + ${hemiVol}` 
                    }
                ]
            };
        }
    }

    // Level 7: Mixed Units Conversion
    private level7_Units(lang: string): any {
        // We want final answer in Liters (dm³)
        // Dimensions given in cm or mm
        const dim1 = MathUtils.randomInt(2, 8) * 10; // e.g., 20 cm
        const dim2 = MathUtils.randomInt(2, 8) * 10;
        const dim3 = MathUtils.randomInt(2, 8) * 10;

        const val1_dm = dim1 / 10;
        const val2_dm = dim2 / 10;
        const val3_dm = dim3 / 10;

        const volume = val1_dm * val2_dm * val3_dm; // dm³ = liters

        return {
            renderData: {
                geometry: { type: 'cuboid', labels: { w: `${dim1} cm`, d: `${dim2} cm`, h: `${dim3} cm` } },
                description: lang === 'sv' 
                    ? "Hur många liter rymmer akvariet? (1 liter = 1 dm³)" 
                    : "How many liters does the tank hold? (1 liter = 1 dm³)",
                answerType: 'numeric',
                suffix: 'liter'
            },
            token: this.toBase64(volume.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? "Eftersom vi vill ha svar i liter (dm³), är det smartast att omvandla sidorna till dm först." : "Since we want liters (dm³), convert sides to dm first.", 
                    latex: `10 \\text{ cm} = 1 \\text{ dm}` 
                },
                { 
                    text: lang === 'sv' ? "Nya mått:" : "New dimensions:", 
                    latex: `${val1_dm} \\cdot ${val2_dm} \\cdot ${val3_dm}` 
                }
            ]
        };
    }
}