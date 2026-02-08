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

    /**
     * Phase 2: Targeted Generation
     * Allows the Question Studio to request a specific skill bucket.
     */
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

        if (v === 'vol_cuboid_inverse') {
            const w = MathUtils.randomInt(3, 6), d = MathUtils.randomInt(3, 6), h = MathUtils.randomInt(4, 12);
            const baseArea = w * d;
            const vol = baseArea * h;

            return {
                renderData: {
                    geometry: { type: 'cuboid', labels: { w, d, h: '?' } },
                    description: lang === 'sv' 
                        ? `Ett rätblock har volymen ${vol} cm³. Vi vet att bottenarean är ${baseArea} cm². Hur högt är rätblocket?` 
                        : `A rectangular prism has a volume of ${vol} cm³. We know the base area is ${baseArea} cm². What is the height?`,
                    answerType: 'numeric', suffix: 'cm'
                },
                token: this.toBase64(h.toString()),
                clues: [
                    { text: lang === 'sv' ? "Volymen beräknas som Basytan multiplicerat med Höjden. För att hitta höjden gör vi tvärtom och dividerar volymen med basytan." : "Volume is calculated as Base Area multiplied by Height. To find the height, we do the inverse and divide the volume by the base area.", latex: `h = \\frac{\\text{Volym}}{\\text{Basarea}} = \\frac{${vol}}{${baseArea}}` }
                ],
                metadata: { variation_key: 'vol_cuboid_inverse', difficulty: 2 }
            };
        }

        if (v === 'vol_cuboid_scaling') {
            const factor = MathUtils.randomChoice([2, 3]);
            const q = lang === 'sv' 
                ? `Om du har en låda och gör den ${factor} gånger högre (utan att ändra bredden eller djupet), vad händer då med lådans volym?` 
                : `If you have a box and make it ${factor} times taller (without changing the width or depth), what happens to the volume of the box?`;
            const ans = lang === 'sv' ? `Den blir ${factor} gånger större` : `It becomes ${factor} times larger`;

            return {
                renderData: {
                    description: q,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([ans, lang === 'sv' ? "Den ändras inte" : "It doesn't change", lang === 'sv' ? `Den blir ${factor * factor} gånger större` : `It becomes ${factor * factor} times larger`]),
                    geometry: { type: 'cuboid', labels: { w: 'b', d: 'd', h: 'h' } }
                },
                token: this.toBase64(ans),
                clues: [{ text: lang === 'sv' ? "Volymen är direkt proportionell mot höjden. Om en sida växer så växer volymen med samma faktor." : "Volume is directly proportional to height. If one dimension grows, the volume grows by the same factor.", latex: `V_{ny} = b \\cdot d \\cdot (${factor}h) = ${factor} \\cdot (b \\cdot d \\cdot h)` }],
                metadata: { variation_key: 'vol_cuboid_scaling', difficulty: 2 }
            };
        }

        // Standard Calculation with context
        const items = [
            { sv: "en tegelsida", en: "a brick", w: 5, d: 10, h: 4 },
            { sv: "en container", en: "a container", w: 3, d: 6, h: 3 },
            { sv: "ett paket", en: "a package", w: 4, d: 8, h: 5 }
        ];
        const item = MathUtils.randomChoice(items);
        const w = item.w, d = item.d, h = item.h;
        const vol = w * d * h;

        return {
            renderData: { 
                geometry: { type: 'cuboid', labels: { w, d, h } }, 
                description: lang === 'sv' ? `Beräkna volymen för ${item.sv} med måtten som visas i figuren.` : `Calculate the volume of ${item.en} using the dimensions shown in the figure.`, 
                answerType: 'numeric', suffix: 'cm³'
            },
            token: this.toBase64(vol.toString()),
            clues: [{ text: lang === 'sv' ? "Tänk på volym som att vi räknar ut hur många 'sockerbitar' (kubikcentimeter) som får plats. Vi tar basytan (bredd · djup) och staplar den på höjden." : "Think of volume as counting how many 'sugar cubes' (cubic centimeters) fit. We take the base area (width · depth) and stack it up by the height.", latex: `V = ${w} \\cdot ${d} \\cdot ${h}` }],
            metadata: { variation_key: 'vol_cuboid_std', difficulty: 1 }
        };
    }

    // --- LEVEL 2: TRIANGULAR PRISM ---
    private level2_TriPrism(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['vol_tri_prism_std', 'vol_tri_prism_inverse']);
        const b = MathUtils.randomInt(4, 8), hTri = MathUtils.randomInt(4, 6), length = MathUtils.randomInt(10, 20);
        const baseArea = (b * hTri) / 2;
        const vol = baseArea * length;

        if (v === 'vol_tri_prism_inverse') {
            return {
                renderData: {
                    geometry: { type: 'triangular_prism', labels: { b, h: hTri, l: '?' } },
                    description: lang === 'sv' ? `Ett triangulärt prisma (som t.ex. ett tält) har volymen ${vol} cm³. Triangelns bas är ${b} cm och dess höjd är ${hTri} cm. Hur långt är prismat?` : `A triangular prism (like a tent) has a volume of ${vol} cm³. The triangle's base is ${b} cm and its height is ${hTri} cm. How long is the prism?`,
                    answerType: 'numeric', suffix: 'cm'
                },
                token: this.toBase64(length.toString()),
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Räkna ut arean på den triangulära kortsidan (basytan)." : "Step 1: Calculate the area of the triangular side (the base area).", latex: `B = \\frac{${b} \\cdot ${hTri}}{2} = ${baseArea}` },
                    { text: lang === 'sv' ? "Steg 2: Dela den totala volymen med basytan för att hitta längden." : "Step 2: Divide the total volume by the base area to find the length.", latex: `L = \\frac{${vol}}{${baseArea}} = ${length}` }
                ],
                metadata: { variation_key: 'vol_tri_prism_inverse', difficulty: 3 }
            };
        }

        const scenarios = [
            { sv: "ett tält", en: "a tent" },
            { sv: "en chokladask", en: "a chocolate box" }
        ];
        const s = MathUtils.randomChoice(scenarios);

        return {
            renderData: {
                geometry: { type: 'triangular_prism', labels: { b, h: hTri, l: length } },
                description: lang === 'sv' ? `Beräkna volymen för ${s.sv} som har formen av ett triangulärt prisma.` : `Calculate the volume of ${s.en} which has the shape of a triangular prism.`,
                answerType: 'numeric', suffix: 'cm³'
            },
            token: this.toBase64(vol.toString()),
            clues: [
                { text: lang === 'sv' ? "Principen för alla prismor är densamma: Beräkna arean på 'botten' (här triangeln) och multiplicera med längden/höjden." : "The principle for all prisms is the same: Calculate the area of the 'base' (here the triangle) and multiply by the length/height.", latex: `B = \\frac{${b} \\cdot ${hTri}}{2} = ${baseArea}` },
                { text: lang === 'sv' ? `Volymen blir då ${baseArea} · ${length}.` : `The volume is then ${baseArea} · ${length}.`, latex: `${vol}` }
            ],
            metadata: { variation_key: 'vol_tri_prism_std', difficulty: 2 }
        };
    }

    // --- LEVEL 3: CYLINDER ---
    private level3_Cylinder(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['vol_cyl_std', 'vol_cyl_est', 'vol_cyl_inverse']);
        const r = MathUtils.randomInt(2, 5), h = MathUtils.randomInt(5, 12);
        const pi = 3.14;
        const vol = Math.round(pi * r * r * h);

        if (v === 'vol_cyl_est') {
            const threshold = Math.floor(3 * r * r * h);
            const q = lang === 'sv' ? `En cylinder har radien ${r} cm och höjden ${h} cm. Är volymen större eller mindre än ${threshold} cm³?` : `A cylinder has a radius of ${r} cm and a height of ${h} cm. Is the volume greater or smaller than ${threshold} cm³?`;
            const ans = lang === 'sv' ? "Större" : "Greater";
            return {
                renderData: {
                    description: q,
                    answerType: 'multiple_choice',
                    options: lang === 'sv' ? ["Större", "Mindre"] : ["Greater", "Smaller"],
                    geometry: { type: 'cylinder', labels: { r, h } }
                },
                token: this.toBase64(ans),
                clues: [{ text: lang === 'sv' ? "Eftersom pi ($\approx 3,14$) är större än 3, kommer den verkliga volymen alltid att vara större än om vi bara räknar med 3." : "Since pi ($\approx 3.14$) is larger than 3, the actual volume will always be larger than if we only calculate using 3." }],
                metadata: { variation_key: 'vol_cyl_est', difficulty: 2 }
            };
        }

        if (v === 'vol_cyl_inverse') {
            const baseArea = Math.round(pi * r * r);
            const totalVol = baseArea * h;
            return {
                renderData: {
                    description: lang === 'sv' ? `En läskburk har volymen ${totalVol} cm³ och en bottenarea på ${baseArea} cm². Hur hög är burken?` : `A soda can has a volume of ${totalVol} cm³ and a base area of ${baseArea} cm². How tall is the can?`,
                    answerType: 'numeric', suffix: 'cm',
                    geometry: { type: 'cylinder', labels: { r, h: '?' } }
                },
                token: this.toBase64(h.toString()),
                clues: [{ text: lang === 'sv' ? "Dela den totala volymen med arean på cirkelbotten för att få fram höjden." : "Divide the total volume by the area of the circular base to find the height.", latex: `h = \\frac{${totalVol}}{${baseArea}}` }],
                metadata: { variation_key: 'vol_cyl_inverse', difficulty: 3 }
            };
        }

        return {
            renderData: { 
                description: lang === 'sv' ? "Beräkna cylinderns volym. Använd $\\pi \\approx 3,14$ och avrunda svaret till ett heltal." : "Calculate the cylinder's volume. Use $\\pi \\approx 3.14$ and round your answer to the nearest integer.", 
                answerType: 'numeric', suffix: 'cm³',
                geometry: { type: 'cylinder', labels: { r, h } }
            },
            token: this.toBase64(vol.toString()),
            clues: [{ text: lang === 'sv' ? "Formeln för en cylinders volym är bottenarean (en cirkel) gånger höjden." : "The formula for a cylinder's volume is the base area (a circle) times the height.", latex: `V = \\pi \\cdot r^2 \\cdot h = 3,14 \\cdot ${r}^2 \\cdot ${h}` }],
            metadata: { variation_key: 'vol_cyl_std', difficulty: 2 }
        };
    }

    // --- LEVEL 4: PYRAMID & CONE ---
    private level4_PyramidCone(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['vol_pyramid_std', 'vol_cone_rule3', 'vol_cone_std']);

        if (v === 'vol_pyramid_std') {
            const s = MathUtils.randomInt(4, 8), h = 9; 
            const vol = (s * s * h) / 3;
            return {
                renderData: {
                    description: lang === 'sv' ? `Beräkna volymen för en pyramid med en kvadratisk bas där sidan är ${s} cm och höjden är ${h} cm.` : `Calculate the volume of a pyramid with a square base where the side is ${s} cm and the height is ${h} cm.`,
                    answerType: 'numeric', suffix: 'cm³',
                    geometry: { type: 'pyramid', labels: { s, h } }
                },
                token: this.toBase64(vol.toString()),
                clues: [{ text: lang === 'sv' ? "En pyramid har precis en tredjedel av volymen hos ett rätblock med samma mått. Räkna ut basytan gånger höjden och dela med 3." : "A pyramid has exactly one-third the volume of a rectangular prism with the same dimensions. Calculate the base area times the height and divide by 3.", latex: `V = \\frac{${s} \\cdot ${s} \\cdot ${h}}{3} = ${vol}` }],
                metadata: { variation_key: 'vol_pyramid_std', difficulty: 3 }
            };
        }

        if (v === 'vol_cone_rule3') {
            return {
                renderData: {
                    description: lang === 'sv' ? "Tänk dig en cylinder och en kon med exakt samma radie och höjd. Hur många koner behöver du tömma i cylindern för att den ska bli helt full?" : "Imagine a cylinder and a cone with the exact same radius and height. How many cones do you need to empty into the cylinder for it to be completely full?",
                    answerType: 'multiple_choice',
                    options: ["2", "3", "4", "3,14"],
                    geometry: { type: 'cone', labels: { r: 'r', h: 'h' } }
                },
                token: this.toBase64("3"),
                clues: [{ text: lang === 'sv' ? "Detta är 'tredjedelsregeln'. Spetsiga figurer rymmer alltid en tredjedel så mycket som deras raka motsvarigheter." : "This is the 'one-third rule'. Pointy shapes always hold one-third as much as their straight counterparts." }],
                metadata: { variation_key: 'vol_cone_rule3', difficulty: 2 }
            };
        }

        const r = 3, h = 10;
        const vol = Math.round((3.14 * r * r * h) / 3);
        return {
            renderData: {
                description: lang === 'sv' ? "Beräkna volymen för konen i figuren. Använd 3,14 för pi och avrunda till ett heltal." : "Calculate the volume of the cone in the figure. Use 3.14 for pi and round to an integer.",
                answerType: 'numeric', suffix: 'cm³',
                geometry: { type: 'cone', labels: { r, h } }
            },
            token: this.toBase64(vol.toString()),
            clues: [{ text: lang === 'sv' ? "Beräkna arean av cirkeln i botten, multiplicera med höjden och dela sedan med 3 eftersom konen smalnar av till en spets." : "Calculate the area of the circle at the bottom, multiply by the height, and then divide by 3 because the cone narrows to a point.", latex: `V = \\frac{3,14 \\cdot ${r}^2 \\cdot ${h}}{3}` }],
            metadata: { variation_key: 'vol_cone_std', difficulty: 3 }
        };
    }

    // --- LEVEL 5: SPHERE & COMPOSITE ---
    private level5_SphereComposite(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['vol_sphere_std', 'vol_silo_std', 'vol_icecream_std']);
        const r = 3; 
        const pi = 3.14;

        if (v === 'vol_sphere_std') {
            const vol = Math.round((4 * pi * Math.pow(r, 3)) / 3);
            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna volymen av ett klot (en boll) med radien 3 cm. Använd 3,14 för pi." : "Calculate the volume of a sphere (a ball) with a radius of 3 cm. Use 3.14 for pi.",
                    answerType: 'numeric', suffix: 'cm³',
                    geometry: { type: 'sphere', labels: { r } }
                },
                token: this.toBase64(vol.toString()),
                clues: [{ text: lang === 'sv' ? "Använd standardformeln för ett klot." : "Use the standard formula for a sphere.", latex: `V = \\frac{4 \\cdot 3,14 \\cdot 3^3}{3}` }],
                metadata: { variation_key: 'vol_sphere_std', difficulty: 3 }
            };
        }

        if (v === 'vol_silo_std') {
            const hCyl = 10;
            const vCyl = pi * r * r * hCyl;
            const vHemi = (2 * pi * Math.pow(r, 3)) / 3;
            const total = Math.round(vCyl + vHemi);
            return {
                renderData: {
                    description: lang === 'sv' ? "En silo består av en cylinder och ett halvklot som tak. Beräkna den totala volymen för hela silon." : "A silo consists of a cylinder and a hemisphere as a roof. Calculate the total volume for the entire silo.",
                    answerType: 'numeric', suffix: 'cm³',
                    geometry: { type: 'silo', labels: { r, h: hCyl } }
                },
                token: this.toBase64(total.toString()),
                clues: [{ text: lang === 'sv' ? "Dela upp figuren: Beräkna först cylinderns volym och lägg sedan till volymen för ett halvt klot." : "Split the figure: First calculate the cylinder's volume and then add the volume of half a sphere.", latex: `V_{total} = (\\pi \\cdot r^2 \\cdot h) + (\\frac{2 \\cdot \\pi \\cdot r^3}{3})` }],
                metadata: { variation_key: 'vol_silo_std', difficulty: 4 }
            };
        }

        const hCone = 9;
        const vCone = (pi * r * r * hCone) / 3;
        const vHemi = (2 * pi * Math.pow(r, 3)) / 3;
        const total = Math.round(vCone + vHemi);
        return {
            renderData: {
                description: lang === 'sv' ? "En glasstrut består av en kon och en glasskula (halvklot) på toppen. Beräkna den sammanlagda volymen." : "An ice cream cone consists of a cone and a scoop (hemisphere) on top. Calculate the combined volume.",
                answerType: 'numeric', suffix: 'cm³',
                geometry: { type: 'ice_cream', labels: { r, h: hCone } }
            },
            token: this.toBase64(total.toString()),
            clues: [{ text: lang === 'sv' ? "Beräkna volymen för konen och halvklotet separat och addera dem sedan." : "Calculate the volume of the cone and the hemisphere separately and then add them together." }],
            metadata: { variation_key: 'vol_icecream_std', difficulty: 4 }
        };
    }

    // --- LEVEL 6: MIXED DIAMETER ---
    private level6_Mixed(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['vol_sphere_diameter', 'vol_icecream_diameter']);
        const d = 10, r = 5;

        if (v === 'vol_sphere_diameter') {
            const vol = Math.round((4 * 3.14 * Math.pow(r, 3)) / 3);
            return {
                renderData: {
                    description: lang === 'sv' ? `Ett klot har diametern ${d} cm. Beräkna klotets volym. ` : `A sphere has a diameter of ${d} cm. Calculate the sphere's volume.`,
                    answerType: 'numeric', suffix: 'cm³',
                    geometry: { type: 'sphere', show: 'diameter', labels: { d } }
                },
                token: this.toBase64(vol.toString()),
                clues: [{ text: lang === 'sv' ? "Formeln för volym kräver radien. Radien är hälften av diametern." : "The formula for volume requires the radius. The radius is half the diameter.", latex: `r = \\frac{${d}}{2} = ${r}` }],
                metadata: { variation_key: 'vol_sphere_diameter', difficulty: 3 }
            };
        }

        const h = 12;
        const vCone = (3.14 * r * r * h) / 3;
        const vHemi = (2 * 3.14 * Math.pow(r, 3)) / 3;
        const total = Math.round(vCone + vHemi);
        return {
            renderData: {
                description: lang === 'sv' ? `Beräkna volymen för en glasstrut där diametern är ${d} cm och konens höjd är ${h} cm.` : `Calculate the volume of an ice cream cone where the diameter is ${d} cm and the cone's height is ${h} cm.`,
                answerType: 'numeric', suffix: 'cm³',
                geometry: { type: 'ice_cream', show: 'diameter', labels: { d, h } }
            },
            token: this.toBase64(total.toString()),
            clues: [{ text: lang === 'sv' ? "Börja med att räkna ut radien (diametern / 2) och använd den för att beräkna konens och halvklotets volymer." : "Begin by calculating the radius (diameter / 2) and use it to calculate the volumes of the cone and the hemisphere." }],
            metadata: { variation_key: 'vol_icecream_diameter', difficulty: 4 }
        };
    }

    // --- LEVEL 7: UNITS ---
    private level7_Units(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['vol_units_liter', 'vol_units_m3']);

        if (v === 'vol_units_m3') {
            const w = 4, d = 5, h = 2; 
            const m3 = w * d * h;
            const liters = m3 * 1000;
            return {
                renderData: {
                    description: lang === 'sv' ? `En pool har måtten ${w} m x ${d} m x ${h} m. Hur många liter vatten rymmer den när den är helt full?` : `A pool has the dimensions ${w} m x ${d} m x ${h} m. How many liters of water does it hold when completely full?`,
                    answerType: 'numeric', suffix: 'liter'
                },
                token: this.toBase64(liters.toString()),
                clues: [
                    { text: lang === 'sv' ? "Räkna först ut volymen i kubikmeter genom att multiplicera de tre sidorna." : "First calculate the volume in cubic meters by multiplying the three sides.", latex: `${w} \\cdot ${d} \\cdot ${h} = ${m3} \\text{ m}^3` },
                    { text: lang === 'sv' ? "Omvandla sedan till liter. Kom ihåg att 1 m³ motsvarar exakt 1000 liter." : "Then convert to liters. Remember that 1 m³ corresponds to exactly 1000 liters.", latex: `${m3} \\cdot 1000 = ${liters}` }
                ],
                metadata: { variation_key: 'vol_units_m3', difficulty: 4 }
            };
        }

        const w = 50, d = 20, h = 30; 
        const liters = (w * d * h) / 1000;
        return {
            renderData: {
                description: lang === 'sv' ? `Ett akvarium har måtten ${w} cm, ${d} cm och ${h} cm. Hur många liter vatten rymmer det? (Tips: 1 liter = 1 dm³).` : `An aquarium has the dimensions ${w} cm, ${d} cm, and ${h} cm. How many liters of water does it hold? (Hint: 1 liter = 1 dm³).`,
                answerType: 'numeric', suffix: 'liter'
            },
            token: this.toBase64(liters.toString()),
            clues: [
                { text: lang === 'sv' ? "Det enklaste sättet är att först göra om alla mått från cm till dm." : "The easiest way is to first convert all measurements from cm to dm.", latex: `50 \\text{ cm} = 5 \\text{ dm}, \\, 20 \\text{ cm} = 2 \\text{ dm}, \\, 30 \\text{ cm} = 3 \\text{ dm}` },
                { text: lang === 'sv' ? "Volymen i dm³ är detsamma som antalet liter." : "The volume in dm³ is the same as the number of liters.", latex: `5 \\cdot 2 \\cdot 3 = ${liters} \\text{ dm}^3` }
            ],
            metadata: { variation_key: 'vol_units_liter', difficulty: 3 }
        };
    }

    // --- LEVEL 8: SURFACE AREA ---
    private level8_SurfaceArea(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['sa_cuboid', 'sa_cylinder', 'sa_cone', 'sa_sphere']);

        if (v === 'sa_cuboid') {
            const w = 3, d = 4, h = 5;
            const area = 2 * (w*d + w*h + d*h);
            return {
                renderData: {
                    description: lang === 'sv' ? `Du ska slå in ett paket (rätblock) med måtten ${w} cm, ${d} cm och ${h} cm. Hur stor area har paketet som ska täckas av papper?` : `You are wrapping a gift (rectangular prism) with dimensions ${w} cm, ${d} cm, and ${h} cm. What is the surface area of the gift to be covered by paper?`,
                    answerType: 'numeric', suffix: 'cm²',
                    geometry: { type: 'cuboid', labels: { w, d, h } }
                },
                token: this.toBase64(area.toString()),
                clues: [{ text: lang === 'sv' ? "Ett rätblock har sex sidor som sitter ihop parvis. Räkna ut arean för de tre olika sidotyperna och dubblera dem." : "A rectangular prism has six faces that come in identical pairs. Calculate the area for the three different face types and double them.", latex: `2(${w}\\cdot${d}) + 2(${w}\\cdot${h}) + 2(${d}\\cdot${h})` }],
                metadata: { variation_key: 'sa_cuboid', difficulty: 4 }
            };
        }

        if (v === 'sa_sphere') {
            const r = 5;
            const area = Math.round(4 * 3.14 * r * r);
            return {
                renderData: {
                    description: lang === 'sv' ? `Beräkna begränsningsarean (ytarean) för ett klot med radien ${r} cm. Använd 3,14 för pi.` : `Calculate the surface area for a sphere with a radius of ${r} cm. Use 3.14 for pi.`,
                    answerType: 'numeric', suffix: 'cm²',
                    geometry: { type: 'sphere', labels: { r } }
                },
                token: this.toBase64(area.toString()),
                clues: [{ text: lang === 'sv' ? "Använd formeln för ett klots begränsningsarea." : "Use the formula for a sphere's surface area.", latex: `A = 4 \\cdot \\pi \\cdot r^2` }],
                metadata: { variation_key: 'sa_sphere', difficulty: 4 }
            };
        }

        if (v === 'sa_cone') {
            const r = 3, h = 4, s = 5; // 3-4-5 triple
            const area = Math.round(3.14 * r * r + 3.14 * r * s);
            return {
                renderData: {
                    description: lang === 'sv' ? `Beräkna den totala begränsningsarean för en kon där radien är ${r} cm och den sneda sidan (s) är ${s} cm.` : `Calculate the total surface area for a cone where the radius is ${r} cm and the slant height (s) is ${s} cm.`,
                    answerType: 'numeric', suffix: 'cm²',
                    geometry: { type: 'cone', labels: { r, h, s } }
                },
                token: this.toBase64(area.toString()),
                clues: [{ text: lang === 'sv' ? "Addera arean för cirkelbotten och den böjda mantelytan." : "Add the area of the circular base and the curved lateral surface.", latex: `A = (\\pi \\cdot r^2) + (\\pi \\cdot r \\cdot s)` }],
                metadata: { variation_key: 'sa_cone', difficulty: 5 }
            };
        }

        // Standard Cylinder fallback
        const r = 3, h = 7;
        const total = Math.round(2 * 3.14 * r * r + 2 * 3.14 * r * h);
        return {
            renderData: {
                description: lang === 'sv' ? `Beräkna den totala begränsningsarean för en cylinder med radien ${r} cm och höjden ${h} cm.` : `Calculate the total surface area for a cylinder with a radius of ${r} cm and a height of ${h} cm.`,
                answerType: 'numeric', suffix: 'cm²',
                geometry: { type: 'cylinder', labels: { r, h } }
            },
            token: this.toBase64(total.toString()),
            clues: [{ text: lang === 'sv' ? "Beräkna arean för de två cirklarna (botten och lock) plus arean för mantelytan (sidan)." : "Calculate the area for the two circles (base and top) plus the area for the lateral surface (the side).", latex: `A = 2(\\pi \\cdot r^2) + (2 \\cdot \\pi \\cdot r \\cdot h)` }],
            metadata: { variation_key: 'sa_cylinder', difficulty: 5 }
        };
    }
}