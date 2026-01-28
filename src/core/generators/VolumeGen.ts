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
                geometry: { type: 'cuboid', labels: { w, h, d } },
                description: lang === 'sv' ? "Beräkna volymen." : "Calculate the volume.",
                answerType: 'text'
            },
            token: Buffer.from(volume.toString()).toString('base64'),
            clues: [
                { 
                    text: lang === 'sv' ? "För rätblock är volymen = Bredd · Djup · Höjd." : "For a rectangular prism, Volume = Width · Depth · Height.", 
                    latex: "V = b \\cdot d \\cdot h" 
                },
                { 
                    text: lang === 'sv' ? "Multiplicera sidorna." : "Multiply the sides.", 
                    latex: `V = ${w} \\cdot ${d} \\cdot ${h} = \\mathbf{${volume}}` 
                }
            ]
        };
    }

    // Level 2: Triangular Prism
    private level2_TriPrism(lang: string): any {
        const b = MathUtils.randomInt(3, 10);
        const hTri = MathUtils.randomInt(2, 8); 
        const len = MathUtils.randomInt(5, 15); 
        const areaBase = (b * hTri) / 2;
        const volume = areaBase * len;

        return {
            renderData: {
                geometry: { type: 'triangular_prism', labels: { b, h: hTri, l: len } },
                description: lang === 'sv' ? "Beräkna volymen." : "Calculate the volume.",
                answerType: 'text'
            },
            token: Buffer.from(volume.toString()).toString('base64'),
            clues: [
                { 
                    text: lang === 'sv' ? "1. Räkna först ut arean på triangeln (Basytan)." : "1. First calculate the area of the triangle (Base Area).", 
                    latex: `B = \\frac{${b} \\cdot ${hTri}}{2} = ${areaBase}` 
                },
                { 
                    text: lang === 'sv' ? "2. Multiplicera basytan med längden." : "2. Multiply the base area by the length.", 
                    latex: `V = B \\cdot l = ${areaBase} \\cdot ${len} = \\mathbf{${volume}}` 
                }
            ]
        };
    }

    // Level 3: Cylinder
    private level3_Cylinder(lang: string): any {
        const r = MathUtils.randomInt(2, 6);
        const h = MathUtils.randomInt(5, 15);
        const piApprox = 3.14;
        
        // Randomly show radius or diameter
        const showDiameter = MathUtils.randomInt(0, 1) === 1;
        const d = r * 2;
        const labelVal = showDiameter ? `d=${d}` : `r=${r}`;

        const vol = Math.round(Math.PI * r * r * h); 
        
        let steps = [];
        
        if (showDiameter) {
            steps.push({
                text: lang === 'sv' ? "Vi har diametern (d). Radien (r) är hälften." : "We have the diameter (d). The radius (r) is half.",
                latex: `r = \\frac{${d}}{2} = ${r}`
            });
        }
        
        steps.push({
            text: lang === 'sv' ? "Räkna ut basytan (cirkeln)." : "Calculate the base area (circle).",
            latex: `B = \\pi \\cdot r^2 \\approx 3.14 \\cdot ${r}^2`
        });
        
        steps.push({
            text: lang === 'sv' ? "Multiplicera med höjden." : "Multiply by the height.",
            latex: `V \\approx 3.14 \\cdot ${r*r} \\cdot ${h} \\approx \\mathbf{${vol}}`
        });

        return {
            renderData: {
                geometry: { 
                    type: 'cylinder', 
                    labels: { r, h, val: labelVal }, 
                    show: showDiameter ? 'diameter' : 'radius' 
                },
                description: lang === 'sv' ? "Beräkna volymen (heltal)." : "Calculate volume (integer).",
                answerType: 'text'
            },
            token: Buffer.from(vol.toString()).toString('base64'),
            clues: steps
        };
    }

    // Level 4: Pyramid & Cone
    private level4_PyramidCone(lang: string): any {
        const isCone = MathUtils.randomInt(0, 1) === 1;
        const h = MathUtils.randomInt(5, 15);
        
        let vol = 0, geom: any = {}, steps = [], desc = "";

        if (isCone) {
            // CONE
            const r = MathUtils.randomInt(3, 8);
            const d = r * 2;
            const showDiameter = MathUtils.randomInt(0, 1) === 1;
            
            vol = Math.round((Math.PI * r * r * h) / 3);
            
            desc = lang === 'sv' ? "Beräkna volymen av konen (heltal)." : "Calculate the volume of the cone (integer).";
            
            if (showDiameter) {
                steps.push({
                    text: lang === 'sv' ? "Först, hitta radien (hälften av diametern)." : "First, find the radius (half the diameter).",
                    latex: `r = ${d} / 2 = ${r}`
                });
            }

            steps.push({
                text: lang === 'sv' ? "Volymen för en kon är (Basytan · Höjden) / 3." : "Volume of a cone is (Base · Height) / 3.",
                latex: `V = \\frac{\\pi \\cdot r^2 \\cdot h}{3}`
            });

            steps.push({
                text: lang === 'sv' ? "Sätt in värdena." : "Insert the values.",
                latex: `V \\approx \\frac{3.14 \\cdot ${r}^2 \\cdot ${h}}{3} \\approx \\mathbf{${vol}}`
            });

            geom = { 
                type: 'cone', 
                labels: { r, h, val: showDiameter ? `d=${d}` : `r=${r}` },
                show: showDiameter ? 'diameter' : 'radius'
            };

        } else {
            // PYRAMID (Rectangular Base)
            const w = MathUtils.randomInt(3, 8); // Width
            const l = MathUtils.randomInt(3, 8); // Length
            
            vol = Math.round((w * l * h) / 3);
            
            desc = lang === 'sv' ? "Beräkna volymen av pyramiden (heltal)." : "Calculate the volume of the pyramid (integer).";

            steps.push({
                text: lang === 'sv' ? "Räkna ut basytan (rektangeln)." : "Calculate the base area (rectangle).",
                latex: `B = ${w} \\cdot ${l} = ${w*l}`
            });

            steps.push({
                text: lang === 'sv' ? "Volymen för en pyramid är (Basytan · Höjden) / 3." : "Volume of a pyramid is (Base · Height) / 3.",
                latex: `V = \\frac{B \\cdot h}{3} = \\frac{${w*l} \\cdot ${h}}{3} \\approx \\mathbf{${vol}}`
            });

            // Geometry component expects 's' for square side or 'w'/'d' for rect.
            // Using generic labels object to pass explicit strings if needed.
            geom = { 
                type: 'pyramid', 
                labels: { w, d: l, h } 
            };
        }

        return {
            renderData: { geometry: geom, description: desc, answerType: 'text' },
            token: Buffer.from(vol.toString()).toString('base64'),
            clues: steps
        };
    }

    // Level 5: Sphere & Hemisphere
    private level5_Sphere(lang: string): any {
        const isSphere = MathUtils.randomInt(0, 1) === 1;
        const r = MathUtils.randomInt(3, 15);
        const d = r * 2;
        const showDiameter = MathUtils.randomInt(0, 1) === 1;
        
        let vol = 0, geom: any = {}, steps = [], desc = "";
        const labelVal = showDiameter ? `d=${d}` : `r=${r}`;

        if (showDiameter) {
            steps.push({
                text: lang === 'sv' ? "Hitta radien först (d/2)." : "Find radius first (d/2).",
                latex: `r = ${d} / 2 = ${r}`
            });
        }

        if (isSphere) {
            // SPHERE
            vol = Math.round((4 * Math.PI * Math.pow(r, 3)) / 3);
            desc = lang === 'sv' ? "Beräkna volymen (Klot)." : "Calculate volume (Sphere).";
            
            steps.push({
                text: lang === 'sv' ? "Använd formeln för klotets volym." : "Use the sphere volume formula.",
                latex: `V = \\frac{4 \\cdot \\pi \\cdot r^3}{3}`
            });
            steps.push({
                text: lang === 'sv' ? "Beräkna." : "Calculate.",
                latex: `V \\approx \\frac{4 \\cdot 3.14 \\cdot ${r}^3}{3} \\approx \\mathbf{${vol}}`
            });

            geom = { 
                type: 'sphere', 
                labels: { val: labelVal }, 
                show: showDiameter ? 'diameter' : 'radius' 
            };

        } else {
            // HEMISPHERE
            const vFull = (4 * Math.PI * Math.pow(r, 3)) / 3;
            vol = Math.round(vFull / 2);
            desc = lang === 'sv' ? "Beräkna volymen (Halvklot)." : "Calculate volume (Hemisphere).";

            steps.push({
                text: lang === 'sv' ? "Räkna ut volymen för ett HELT klot först." : "Calculate the volume of a FULL sphere first.",
                latex: `V_{hel} = \\frac{4 \\cdot \\pi \\cdot ${r}^3}{3} \\approx ${Math.round(vFull)}`
            });
            steps.push({
                text: lang === 'sv' ? "Dela sedan med 2." : "Then divide by 2.",
                latex: `V_{halv} = \\frac{${Math.round(vFull)}}{2} \\approx \\mathbf{${vol}}`
            });

            geom = { 
                type: 'hemisphere', 
                labels: { val: labelVal }, 
                show: showDiameter ? 'diameter' : 'radius' 
            };
        }

        return {
            renderData: { geometry: geom, description: desc, answerType: 'text' },
            token: Buffer.from(vol.toString()).toString('base64'),
            clues: steps
        };
    }

    // Level 6: Mixed
    private level6_Mixed(lang: string): any {
        const mode = MathUtils.randomInt(3, 5);
        if (mode === 3) return this.level3_Cylinder(lang);
        if (mode === 4) return this.level4_PyramidCone(lang);
        return this.level5_Sphere(lang);
    }

    // Level 7: Units Conversion Logic
    private level7_Units(lang: string): any {
        const side = MathUtils.randomInt(1, 10);
        const volLiters = Math.pow(side, 3); // Since 1dm^3 = 1 liter, if side is in dm, vol is liters.
        
        // Scenario: Cube with side in cm. Ask for Liters.
        // side cm = side/10 dm.
        // Let's keep numbers integer for the question: Side given in dm.
        // Or Side given in cm (e.g. 10cm, 20cm) to make it 1dm, 2dm.
        const sideCm = side * 10;
        
        return {
            renderData: { 
                geometry: { type: 'cuboid', labels: { w: `${sideCm} cm`, h: `${sideCm} cm`, d: `${sideCm} cm` } }, 
                description: lang === 'sv' ? "Hur många liter rymmer kuben?" : "How many liters does the cube hold?", 
                answerType: 'text' 
            },
            token: Buffer.from(volLiters.toString()).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Kom ihåg: 1 liter = 1 dm³." : "Remember: 1 liter = 1 dm³." },
                { text: lang === 'sv' ? "Omvandla sidan till decimeter (dm) först." : "Convert the side to decimeters (dm) first.", latex: `${sideCm} \\text{ cm} = ${side} \\text{ dm}` },
                { text: lang === 'sv' ? "Räkna ut volymen." : "Calculate the volume.", latex: `V = ${side}^3 = \\mathbf{${volLiters}}` }
            ]
        };
    }
}