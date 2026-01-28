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
        
        // Ensure explicit label value is passed to prevent "undefined"
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
            
            // Pass explicit string to avoid undefined
            const labelVal = showDiameter ? `d=${d}` : `r=${r}`;
            
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
                labels: { r, h, val: labelVal },
                show: showDiameter ? 'diameter' : 'radius'
            };

        } else {
            // PYRAMID (Rectangular Base)
            const w = MathUtils.randomInt(3, 8); // Width
            const l = MathUtils.randomInt(3, 8); // Length
            
            vol = Math.round((w * l * h) / 3);
            
            desc = lang === 'sv' ? "Beräkna volymen av pyramiden (heltal)." : "Calculate the volume of the pyramid (integer).";

            steps.push({
                text: lang === 'sv' ? "1. Räkna ut basytan (rektangeln)." : "1. Calculate the base area (rectangle).",
                latex: `B = ${w} \\cdot ${l} = ${w*l}`
            });

            steps.push({
                text: lang === 'sv' ? "2. Volymen för en pyramid är (Basytan · Höjden) / 3." : "2. Volume of a pyramid is (Base · Height) / 3.",
                latex: `V = \\frac{B \\cdot h}{3} = \\frac{${w*l} \\cdot ${h}}{3} \\approx \\mathbf{${vol}}`
            });

            // Use 'd' for depth/length to match Cuboid labels
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

    // Level 5: Sphere, Hemisphere, Ice Cream, Silo
    private level5_SphereComposite(lang: string): any {
        // Randomly pick a shape type
        const type = MathUtils.randomChoice(['sphere', 'hemisphere', 'ice_cream', 'silo']);
        
        const r = MathUtils.randomInt(3, 10);
        const d = r * 2;
        const showDiameter = MathUtils.randomInt(0, 1) === 1; // 50% chance for Sphere/Hemi
        
        // Pass explicit string to avoid undefined
        const labelVal = showDiameter ? `d=${d}` : `r=${r}`;

        let vol = 0, geom: any = {}, steps = [], desc = "";

        if (type === 'sphere') {
            vol = Math.round((4 * Math.PI * Math.pow(r, 3)) / 3);
            desc = lang === 'sv' ? "Beräkna volymen (Klot)." : "Calculate volume (Sphere).";
            
            if (showDiameter) {
                steps.push({
                    text: lang === 'sv' ? "Vi har diametern. Radien är hälften." : "We have diameter. Radius is half.",
                    latex: `r = ${d}/2 = ${r}`
                });
            }

            steps.push({
                text: lang === 'sv' ? "Använd formeln för klotets volym." : "Use the sphere volume formula.",
                latex: `V = \\frac{4 \\cdot \\pi \\cdot r^3}{3}`
            });
            steps.push({
                text: lang === 'sv' ? "Sätt in radien och beräkna." : "Insert radius and calculate.",
                latex: `V \\approx \\frac{4 \\cdot 3.14 \\cdot ${r}^3}{3} \\approx \\mathbf{${vol}}`
            });

            geom = { 
                type: 'sphere', 
                labels: { val: labelVal, r }, 
                show: showDiameter ? 'diameter' : 'radius' 
            };

        } else if (type === 'hemisphere') {
            const vFull = (4 * Math.PI * Math.pow(r, 3)) / 3;
            vol = Math.round(vFull / 2);
            desc = lang === 'sv' ? "Beräkna volymen (Halvklot)." : "Calculate volume (Hemisphere).";

            if (showDiameter) {
                steps.push({
                    text: lang === 'sv' ? "Vi har diametern. Radien är hälften." : "We have diameter. Radius is half.",
                    latex: `r = ${d}/2 = ${r}`
                });
            }

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
                labels: { val: labelVal, r }, 
                show: showDiameter ? 'diameter' : 'radius' 
            };

        } else if (type === 'ice_cream') {
            // Cone + Hemisphere
            const hCone = MathUtils.randomInt(r + 2, 15);
            const vCone = (Math.PI * r * r * hCone) / 3;
            const vHemi = (2 * Math.PI * Math.pow(r, 3)) / 3; // (4/3 pi r^3) / 2 = 2/3 pi r^3
            vol = Math.round(vCone + vHemi);
            
            desc = lang === 'sv' ? "Beräkna totala volymen (Glass)." : "Calculate total volume (Ice Cream).";
            
            steps = [
                { text: lang === 'sv' ? "Dela upp i Kon och Halvklot." : "Split into Cone and Hemisphere.", latex: "" },
                { text: lang === 'sv' ? "Konens volym:" : "Cone volume:", latex: `V_{kon} = \\frac{\\pi \\cdot ${r}^2 \\cdot ${hCone}}{3} \\approx ${Math.round(vCone)}` },
                { text: lang === 'sv' ? "Halvklotets volym:" : "Hemisphere volume:", latex: `V_{halv} = \\frac{2 \\cdot \\pi \\cdot ${r}^3}{3} \\approx ${Math.round(vHemi)}` },
                { text: lang === 'sv' ? "Addera delarna." : "Add the parts.", latex: `${Math.round(vCone)} + ${Math.round(vHemi)} = \\mathbf{${vol}}` }
            ];

            geom = { 
                type: 'ice_cream', 
                labels: { r, h: hCone, val: `r=${r}` } // Composite usually shows radius for simplicity
            };

        } else {
            // Silo (Cylinder + Hemisphere)
            const hCyl = MathUtils.randomInt(r + 2, 15);
            const vCyl = Math.PI * r * r * hCyl;
            const vHemi = (2 * Math.PI * Math.pow(r, 3)) / 3;
            vol = Math.round(vCyl + vHemi);

            desc = lang === 'sv' ? "Beräkna totala volymen (Silo)." : "Calculate total volume (Silo).";

            steps = [
                { text: lang === 'sv' ? "Dela upp i Cylinder och Halvklot." : "Split into Cylinder and Hemisphere.", latex: "" },
                { text: lang === 'sv' ? "Cylinderns volym:" : "Cylinder volume:", latex: `V_{cyl} = \\pi \\cdot ${r}^2 \\cdot ${hCyl} \\approx ${Math.round(vCyl)}` },
                { text: lang === 'sv' ? "Halvklotets volym:" : "Hemisphere volume:", latex: `V_{halv} = \\frac{2 \\cdot \\pi \\cdot ${r}^3}{3} \\approx ${Math.round(vHemi)}` },
                { text: lang === 'sv' ? "Addera delarna." : "Add the parts.", latex: `${Math.round(vCyl)} + ${Math.round(vHemi)} = \\mathbf{${vol}}` }
            ];

            geom = { 
                type: 'silo', 
                labels: { r, h: hCyl, val: `r=${r}` } 
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
        // Randomly choose from Level 3, 4, 5
        const mode = MathUtils.randomInt(3, 5);
        if (mode === 3) return this.level3_Cylinder(lang);
        if (mode === 4) return this.level4_PyramidCone(lang);
        return this.level5_SphereComposite(lang);
    }

    // Level 7: Units Conversion Logic
    private level7_Units(lang: string): any {
        const side = MathUtils.randomInt(1, 10);
        const volLiters = Math.pow(side, 3);
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