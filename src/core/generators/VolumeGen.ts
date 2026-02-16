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
            case 8: return this.level8_SurfaceArea(lang);
            default: return this.level1_Cuboid(lang);
        }
    }

    public generateByVariation(key: string, lang: string = 'sv'): any {
        switch (key) {
            case 'vol_cuboid_std':
            case 'vol_cuboid_inverse':
            case 'vol_cuboid_scaling':
                return this.level1_Cuboid(lang, key);
            case 'vol_tri_prism_std':
            case 'vol_tri_prism_inverse':
                return this.level2_TriPrism(lang, key);
            case 'vol_cyl_std':
            case 'vol_cyl_est':
            case 'vol_cyl_inverse':
                return this.level3_Cylinder(lang, key);
            case 'vol_pyramid_std':
            case 'vol_cone_rule3':
            case 'vol_cone_std':
                return this.level4_PyramidCone(lang, key);
            case 'vol_sphere_std':
            case 'vol_silo_std':
            case 'vol_icecream_std':
                return this.level5_SphereComposite(lang, key);
            case 'vol_sphere_diameter':
            case 'vol_icecream_diameter':
                return this.level6_Mixed(lang, key);
            case 'vol_units_liter':
            case 'vol_units_m3':
                return this.level7_Units(lang, key);
            case 'sa_cuboid':
            case 'sa_cylinder':
            case 'sa_cone':
            case 'sa_sphere':
                return this.level8_SurfaceArea(lang, key);
            default:
                return this.generate(1, lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    // --- LEVEL 1: CUBOID ---
    private level1_Cuboid(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['vol_cuboid_std', 'vol_cuboid_inverse', 'vol_cuboid_scaling']);
        const w = MathUtils.randomInt(3, 7), d = MathUtils.randomInt(4, 8), h = MathUtils.randomInt(3, 6);
        const baseArea = w * d;
        const vol = baseArea * h;

        if (v === 'vol_cuboid_inverse') {
            const desc = lang === 'sv' 
                ? `Ett rätblock har volymen ${vol} cm³ och en bottenarea på ${baseArea} cm². Beräkna rätblockets höjd.` 
                : `A rectangular prism has a volume of ${vol} cm³ and a base area of ${baseArea} cm². Calculate the height.`;
            
            return {
                renderData: { geometry: { type: 'cuboid', labels: { w, d, h: '?' } }, description: desc, answerType: 'numeric', suffix: 'cm' },
                token: this.toBase64(h.toString()),
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Använd formeln $V = B \\cdot h$." : "Step 1: Use the formula $V = B \\cdot h$.", latex: "V = B \\cdot h" },
                    { text: lang === 'sv' ? "Dela volymen med bottenarean för att få fram höjden." : "Divide the volume by the base area to find the height.", latex: `\\frac{${vol}}{${baseArea}} = ${h} \\\\ h = ${h}` },
                    { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${h}` }
                ],
                metadata: { variation_key: 'vol_cuboid_inverse', difficulty: 2 }
            };
        }

        if (v === 'vol_cuboid_scaling') {
            const factor = MathUtils.randomInt(2, 4);
            const ansText = lang === 'sv' ? `Den blir ${factor} gånger större` : `It becomes ${factor} times larger`;
            const wrongText = lang === 'sv' ? "Den ändras inte" : "It stays the same";
            
            return {
                renderData: {
                    description: lang === 'sv' ? `Om du gör ett rätblock ${factor} gånger högre, vad händer då med volymen?` : `If you make a cuboid ${factor} times taller, what happens to the volume?`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([ansText, wrongText, lang === 'sv' ? "Den blir hälften så stor" : "It becomes half the size"])
                },
                token: this.toBase64(ansText),
                clues: [
                    { text: lang === 'sv' ? "Volymen beräknas som $B \\cdot h$. Om höjden ökar med en faktor så ökar volymen med samma faktor." : "The volume is calculated as $B \\cdot h$. If the height increases by a factor, the volume increases by that same factor.", latex: `V_{ny} = B \\cdot (${factor} \\cdot h) \\\\ ${factor} \\cdot V` },
                    { text: lang === 'sv' ? "Rätt svar är:" : "The correct answer is:", latex: `\\text{${ansText}}` }
                ],
                metadata: { variation_key: 'vol_cuboid_scaling', difficulty: 2 }
            };
        }

        return {
            renderData: { geometry: { type: 'cuboid', labels: { w, d, h } }, description: lang === 'sv' ? "Beräkna rätblockets volym." : "Calculate the volume of the cuboid.", answerType: 'numeric', suffix: 'cm³' },
            token: this.toBase64(vol.toString()),
            clues: [
                { text: lang === 'sv' ? "Steg 1: Använd formeln $V = l \\cdot b \\cdot h$." : "Step 1: Use the formula $V = l \\cdot b \\cdot h$.", latex: "V = l \\cdot b \\cdot h" },
                { text: lang === 'sv' ? "Multiplicera bredden, djupet och höjden." : "Multiply the width, depth, and height.", latex: `${w} \\cdot ${d} \\cdot ${h} = ${vol} \\\\ V = ${vol}` },
                { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${vol}` }
            ],
            metadata: { variation_key: 'vol_cuboid_std', difficulty: 1 }
        };
    }

    // --- LEVEL 2: TRIANGULAR PRISM ---
    private level2_TriPrism(lang: string, variationKey?: string): any {
        const b = MathUtils.randomInt(4, 10), hTri = MathUtils.randomInt(4, 8), length = MathUtils.randomInt(10, 20);
        const baseArea = (b * hTri) / 2;
        const vol = baseArea * length;

        return {
            renderData: {
                geometry: { type: 'triangular_prism', labels: { b, h: hTri, l: length } },
                description: lang === 'sv' ? "Beräkna volymen för det triangulära prismat." : "Calculate the volume of the triangular prism.",
                answerType: 'numeric', suffix: 'cm³'
            },
            token: this.toBase64(vol.toString()),
            clues: [
                { text: lang === 'sv' ? "Steg 1: Använd formeln $V = B \\cdot l$ där $B$ är triangelns area." : "Step 1: Use the formula $V = B \\cdot l$ where $B$ is the area of the triangle.", latex: "V = B \\cdot l" },
                { text: lang === 'sv' ? "Räkna ut triangelns area först." : "Calculate the triangle's area first.", latex: `\\frac{${b} \\cdot ${hTri}}{2} = ${baseArea} \\\\ B = ${baseArea}` },
                { text: lang === 'sv' ? "Multiplicera basytan med prismats längd." : "Multiply the base area by the length of the prism.", latex: `${baseArea} \\cdot ${length} = ${vol} \\\\ V = ${vol}` },
                { text: lang === 'sv' ? "Svaret blir:" : "The answer is:", latex: `${vol}` }
            ],
            metadata: { variation_key: 'vol_tri_prism_std', difficulty: 2 }
        };
    }

    // --- LEVEL 3: CYLINDER ---
    private level3_Cylinder(lang: string, variationKey?: string): any {
        const r = MathUtils.randomInt(2, 5), h = MathUtils.randomInt(6, 12);
        const useDiameter = Math.random() > 0.5;
        const displayVal = useDiameter ? r * 2 : r;
        const show = useDiameter ? 'diameter' : 'radius';
        const labels = useDiameter ? { d: displayVal, h } : { r: displayVal, h };
        const vol = Math.round(3.14 * r * r * h);

        const clues = [{ text: lang === 'sv' ? "Steg 1: Använd formeln $V = \\pi \\cdot r^2 \\cdot h$." : "Step 1: Use the formula $V = \\pi \\cdot r^2 \\cdot h$.", latex: "V = \\pi \\cdot r^2 \\cdot h" }];
        if (useDiameter) {
            clues.push({ text: lang === 'sv' ? `Eftersom diametern är ${displayVal} cm, beräkna radien genom att dela med 2.` : `Since the diameter is ${displayVal} cm, calculate the radius by dividing by 2.`, latex: `r = \\frac{${displayVal}}{2} = ${r}` });
        }
        clues.push({ text: lang === 'sv' ? "Beräkna nu volymen med radien." : "Now calculate the volume using the radius.", latex: `3,14 \\cdot ${r}^2 \\cdot ${h} = ${vol} \\\\ V = ${vol}` });
        clues.push({ text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${vol}` });

        return {
            renderData: { description: lang === 'sv' ? "Beräkna cylinderns volym ($\\pi \\approx 3,14$)." : "Calculate the cylinder's volume ($\\pi \\approx 3.14$).", answerType: 'numeric', suffix: 'cm³', geometry: { type: 'cylinder', show, labels } },
            token: this.toBase64(vol.toString()),
            clues,
            metadata: { variation_key: 'vol_cyl_std', difficulty: 2 }
        };
    }

    // --- LEVEL 4: PYRAMID & CONE ---
    private level4_PyramidCone(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['vol_pyramid_std', 'vol_cone_std']);
        const r = MathUtils.randomInt(3, 5), h = MathUtils.randomChoice([9, 12]);

        if (v === 'vol_pyramid_std') {
            const s = MathUtils.randomInt(4, 7);
            const vol = (s * s * h) / 3;
            return {
                renderData: { geometry: { type: 'pyramid', labels: { s, h } }, description: lang === 'sv' ? "Beräkna pyramidens volym." : "Calculate the volume of the pyramid.", answerType: 'numeric', suffix: 'cm³' },
                token: this.toBase64(vol.toString()),
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Använd formeln $V = \\frac{B \\cdot h}{3}$." : "Step 1: Use the formula $V = \\frac{B \\cdot h}{3}$.", latex: "V = \\frac{B \\cdot h}{3}" },
                    { text: lang === 'sv' ? "Räkna ut basytan ($s \\cdot s$) och multiplicera med höjden, dela sedan med 3." : "Calculate the base area ($s \\cdot s$) and multiply by the height, then divide by 3.", latex: `\\frac{${s} \\cdot ${s} \\cdot ${h}}{3} = ${vol} \\\\ V = ${vol}` },
                    { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${vol}` }
                ],
                metadata: { variation_key: 'vol_pyramid_std', difficulty: 3 }
            };
        }

        const vol = Math.round((3.14 * r * r * h) / 3);
        return {
            renderData: { geometry: { type: 'cone', labels: { r, h } }, description: lang === 'sv' ? "Beräkna konens volym ($\\pi \\approx 3,14$)." : "Calculate the cone's volume ($\\pi \\approx 3.14$).", answerType: 'numeric', suffix: 'cm³' },
            token: this.toBase64(vol.toString()),
            clues: [
                { text: lang === 'sv' ? "Steg 1: Använd formeln $V = \\frac{\\pi \\cdot r^2 \\cdot h}{3}$." : "Step 1: Use the formula $V = \\frac{\\pi \\cdot r^2 \\cdot h}{3}$.", latex: "V = \\frac{\\pi \\cdot r^2 \\cdot h}{3}" },
                { text: lang === 'sv' ? "Beräkna volymen." : "Calculate the volume.", latex: `\\frac{3,14 \\cdot ${r}^2 \\cdot ${h}}{3} \\approx ${vol} \\\\ V = ${vol}` },
                { text: lang === 'sv' ? "Svaret blir:" : "The answer is:", latex: `${vol}` }
            ],
            metadata: { variation_key: 'vol_cone_std', difficulty: 3 }
        };
    }

    // --- LEVEL 5: SPHERE & COMPOSITE ---
    private level5_SphereComposite(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['vol_sphere_std', 'vol_silo_std', 'vol_icecream_std']);
        const r = MathUtils.randomInt(3, 6);
        const pi = 3.14;

        if (v === 'vol_sphere_std') {
            const vol = Math.round((4 * pi * Math.pow(r, 3)) / 3);
            return {
                renderData: { description: lang === 'sv' ? `Beräkna volymen för ett klot med radien ${r} cm.` : `Calculate the volume of a sphere with radius ${r} cm.`, answerType: 'numeric', suffix: 'cm³', geometry: { type: 'sphere', labels: { r } } },
                token: this.toBase64(vol.toString()),
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Använd formeln $V = \\frac{4 \\pi r^3}{3}$." : "Step 1: Use the formula $V = \\frac{4 \\pi r^3}{3}$.", latex: "V = \\frac{4 \\pi r^3}{3}" },
                    { text: lang === 'sv' ? "Sätt in radien i formeln." : "Insert the radius into the formula.", latex: `\\frac{4 \\cdot 3,14 \\cdot ${r}^3}{3} \\approx ${vol} \\\\ V = ${vol}` },
                    { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${vol}` }
                ],
                metadata: { variation_key: 'vol_sphere_std', difficulty: 3 }
            };
        }

        if (v === 'vol_silo_std') {
            const hCyl = MathUtils.randomInt(10, 18);
            const vCyl = Math.round(pi * r * r * hCyl);
            const vHemi = Math.round((2 * pi * Math.pow(r, 3)) / 3);
            const total = vCyl + vHemi;

            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna den totala volymen för silon (cylinder + halvklot)." : "Calculate the total volume of the silo (cylinder + hemisphere).",
                    answerType: 'numeric', suffix: 'cm³',
                    geometry: { type: 'silo', labels: { r, h: hCyl } }
                },
                token: this.toBase64(total.toString()),
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Dela upp figuren i en cylinder ($V = \\pi r^2 h$) och ett halvklot ($V = \\frac{2 \\pi r^3}{3}$)." : "Step 1: Split the shape into a cylinder ($V = \\pi r^2 h$) and a hemisphere ($V = \\frac{2 \\pi r^3}{3}$)." },
                    { text: lang === 'sv' ? "Beräkna först cylinderns volym." : "First calculate the cylinder's volume.", latex: `3,14 \\cdot ${r}^2 \\cdot ${hCyl} = ${vCyl} \\\\ V_{cyl} = ${vCyl}` },
                    { text: lang === 'sv' ? "Beräkna sedan halvklotets volym." : "Then calculate the hemisphere's volume.", latex: `\\frac{2 \\cdot 3,14 \\cdot ${r}^3}{3} = ${vHemi} \\\\ V_{hemi} = ${vHemi}` },
                    { text: lang === 'sv' ? "Addera de två delarna för att få hela volymen." : "Add the two parts together to get the total volume.", latex: `${vCyl} + ${vHemi} = ${total} \\\\ V_{tot} = ${total}` },
                    { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${total}` }
                ],
                metadata: { variation_key: 'vol_silo_std', difficulty: 4 }
            };
        }

        // Ice Cream Cone
        const hCone = MathUtils.randomInt(8, 14);
        const vCone = Math.round((pi * r * r * hCone) / 3);
        const vHemi = Math.round((2 * pi * Math.pow(r, 3)) / 3);
        const total = vCone + vHemi;

        return {
            renderData: {
                description: lang === 'sv' ? "Beräkna den totala volymen för glasstruten (kon + halvklot)." : "Calculate the total volume of the ice cream cone (cone + hemisphere).",
                answerType: 'numeric', suffix: 'cm³',
                geometry: { type: 'ice_cream', labels: { r, h: hCone } }
            },
            token: this.toBase64(total.toString()),
            clues: [
                { text: lang === 'sv' ? "Steg 1: Beräkna volymen för konen ($V = \\frac{\\pi r^2 h}{3}$) och halvklotet ($V = \\frac{2 \\pi r^3}{3}$)." : "Step 1: Calculate the volume for the cone ($V = \\frac{\\pi r^2 h}{3}$) and the hemisphere ($V = \\frac{2 \\pi r^3}{3}$)." },
                { text: lang === 'sv' ? "Konens volym:" : "Cone volume:", latex: `\\frac{3,14 \\cdot ${r}^2 \\cdot ${hCone}}{3} = ${vCone} \\\\ V_{kon} = ${vCone}` },
                { text: lang === 'sv' ? "Halvklotets volym:" : "Hemisphere volume:", latex: `\\frac{2 \\cdot 3,14 \\cdot ${r}^3}{3} = ${vHemi} \\\\ V_{glass} = ${vHemi}` },
                { text: lang === 'sv' ? "Summa:" : "Total:", latex: `${vCone} + ${vHemi} = ${total} \\\\ V_{tot} = ${total}` },
                { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${total}` }
            ],
            metadata: { variation_key: 'vol_icecream_std', difficulty: 4 }
        };
    }

    // --- LEVEL 6: MIXED DIAMETER ---
    private level6_Mixed(lang: string, variationKey?: string): any {
        const r = MathUtils.randomInt(3, 7);
        const d = r * 2;
        const vol = Math.round((4 * 3.14 * Math.pow(r, 3)) / 3);

        return {
            renderData: {
                description: lang === 'sv' ? `Ett klot har diametern ${d} cm. Beräkna klotets volym ($\\pi \\approx 3,14$).` : `A sphere has a diameter of ${d} cm. Calculate the sphere's volume ($\\pi \\approx 3.14$).`,
                answerType: 'numeric', suffix: 'cm³',
                geometry: { type: 'sphere', show: 'diameter', labels: { d } }
            },
            token: this.toBase64(vol.toString()),
            clues: [
                { text: lang === 'sv' ? "Steg 1: Använd formeln $V = \\frac{4 \\pi r^3}{3}$." : "Step 1: Use the formula $V = \\frac{4 \\pi r^3}{3}$." },
                { text: lang === 'sv' ? "Hitta radien först genom att dela diametern med 2." : "Find the radius first by dividing the diameter by 2.", latex: `r = \\frac{${d}}{2} = ${r} \\\\ r = ${r}` },
                { text: lang === 'sv' ? "Beräkna volymen." : "Calculate the volume.", latex: `\\frac{4 \\cdot 3,14 \\cdot ${r}^3}{3} \\approx ${vol} \\\\ V = ${vol}` },
                { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${vol}` }
            ],
            metadata: { variation_key: 'vol_sphere_diameter', difficulty: 3 }
        };
    }

    // --- LEVEL 7: UNITS ---
    private level7_Units(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['vol_units_liter', 'vol_units_m3']);

        if (v === 'vol_units_m3') {
            const w = MathUtils.randomInt(3, 5), d = MathUtils.randomInt(5, 8), h = 2;
            const m3 = w * d * h;
            const liters = m3 * 1000;
            return {
                renderData: {
                    description: lang === 'sv' ? `En pool har måtten ${w} m, ${d} m och ${h} m. Hur många liter rymmer den?` : `A pool has the dimensions ${w} m, ${d} m, and ${h} m. How many liters does it hold?`,
                    answerType: 'numeric', suffix: 'liter'
                },
                token: this.toBase64(liters.toString()),
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Beräkna volymen i kubikmeter ($l \\cdot b \\cdot h$)." : "Step 1: Calculate the volume in cubic meters ($l \\cdot b \\cdot h$).", latex: `${w} \\cdot ${d} \\cdot ${h} = ${m3} \\\\ V = ${m3} \\text{ m}^3` },
                    { text: lang === 'sv' ? "Omvandla till liter genom att multiplicera med 1000 ($1 \\text{ m}^3 = 1000 \\text{ liter}$)." : "Convert to liters by multiplying by 1000 ($1 \\text{ m}^3 = 1000 \\text{ liters}$).", latex: `${m3} \\cdot 1000 = ${liters} \\\\ L = ${liters}` },
                    { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${liters}` }
                ],
                metadata: { variation_key: 'vol_units_m3', difficulty: 4 }
            };
        }

        const w = 50, d = 20, h = 30;
        const liters = (w * d * h) / 1000;
        return {
            renderData: {
                description: lang === 'sv' ? `Ett akvarium har måtten ${w} cm, ${d} cm och ${h} cm. Hur många liter vatten rymmer det?` : `An aquarium has the dimensions ${w} cm, ${d} cm, and ${h} cm. How many liters does it hold?`,
                answerType: 'numeric', suffix: 'liter'
            },
            token: this.toBase64(liters.toString()),
            clues: [
                { text: lang === 'sv' ? "Steg 1: Omvandla måtten till decimeter för att få liter direkt ($1 \\text{ dm}^3 = 1 \\text{ liter}$)." : "Step 1: Convert dimensions to decimeters to get liters directly ($1 \\text{ dm}^3 = 1 \\text{ liter}$).", latex: `5, 2, 3 \\text{ dm} \\\\ 5 \\cdot 2 \\cdot 3 = ${liters} \\text{ liter}` },
                { text: lang === 'sv' ? "Svaret blir:" : "The answer is:", latex: `${liters}` }
            ],
            metadata: { variation_key: 'vol_units_liter', difficulty: 3 }
        };
    }

    // --- LEVEL 8: SURFACE AREA ---
    private level8_SurfaceArea(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['sa_cuboid', 'sa_sphere']);

        if (v === 'sa_cuboid') {
            const w = MathUtils.randomInt(2, 5), d = MathUtils.randomInt(3, 6), h = MathUtils.randomInt(4, 7);
            const area = 2 * (w*d + w*h + d*h);
            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna rätblockets begränsningsarea (ytarea)." : "Calculate the surface area of the rectangular prism.",
                    answerType: 'numeric', suffix: 'cm²',
                    geometry: { type: 'cuboid', labels: { w, d, h } }
                },
                token: this.toBase64(area.toString()),
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Använd formeln $A = 2(lw + lh + wh)$." : "Step 1: Use the formula $A = 2(lw + lh + wh)$.", latex: "A = 2(lw + lh + wh)" },
                    { text: lang === 'sv' ? "Addera arean för de sex sidorna (tre par)." : "Add the areas of the six sides (three pairs).", latex: `2(${w} \\cdot ${d} + ${w} \\cdot ${h} + ${d} \\cdot ${h}) = ${area} \\\\ A = ${area}` },
                    { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${area}` }
                ],
                metadata: { variation_key: 'sa_cuboid', difficulty: 4 }
            };
        }

        const r = MathUtils.randomInt(3, 8);
        const area = Math.round(4 * 3.14 * r * r);
        return {
            renderData: {
                description: lang === 'sv' ? `Beräkna ytarean för ett klot med radien ${r} cm.` : `Calculate the surface area for a sphere with radius ${r} cm.`,
                answerType: 'numeric', suffix: 'cm²',
                geometry: { type: 'sphere', labels: { r } }
            },
            token: this.toBase64(area.toString()),
            clues: [
                { text: lang === 'sv' ? "Steg 1: Använd formeln $A = 4 \\pi r^2$." : "Step 1: Use the formula $A = 4 \\pi r^2$.", latex: "A = 4 \\pi r^2" },
                { text: lang === 'sv' ? "Beräkna arean." : "Calculate the area.", latex: `4 \\cdot 3,14 \\cdot ${r}^2 \\approx ${area} \\\\ A = ${area}` },
                { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${area}` }
            ],
            metadata: { variation_key: 'sa_sphere', difficulty: 4 }
        };
    }
}