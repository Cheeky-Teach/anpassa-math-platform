import { MathUtils } from '../utils/MathUtils.js';

export class VolumeGen {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        // Adaptive Fallback: If Level 1 concepts (Standard Cuboid) are mastered, push to Prisms or Inverse logic
        if (level === 1 && options.hideConcept && options.exclude?.includes('vol_cuboid_std')) {
            return this.level2_TriPrism(lang, undefined, options);
        }

        switch (level) {
            case 1: return this.level1_Cuboid(lang, undefined, options);
            case 2: return this.level2_TriPrism(lang, undefined, options);
            case 3: return this.level3_Cylinder(lang, undefined, options);
            case 4: return this.level4_PyramidCone(lang, undefined, options);
            case 5: return this.level5_SphereComposite(lang, undefined, options);
            case 6: return this.level6_Mixed(lang, undefined, options);
            case 7: return this.level7_Units(lang, undefined, options);
            case 8: return this.level8_SurfaceArea(lang, undefined, options);
            default: return this.level1_Cuboid(lang, undefined, options);
        }
    }

    /**
     * Targeted Generation for Question Studio
     * Maps ALL keys from skillBuckets.js to preserve Studio compatibility.
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

    private getVariation(pool: {key: string, type: 'concept' | 'calculate'}[], options: any): string {
        let filtered = pool;
        if (options?.exclude && options.exclude.length > 0) {
            filtered = filtered.filter(v => !options.exclude.includes(v.key));
        }
        if (options?.hideConcept) {
            filtered = filtered.filter(v => v.type !== 'concept');
        }
        if (filtered.length === 0) return pool[pool.length - 1].key;
        return MathUtils.randomChoice(filtered.map(v => v.key));
    }

    // --- LEVEL 1: CUBOID (Rätblock) ---
    private level1_Cuboid(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'vol_cuboid_std', type: 'calculate' },
            { key: 'vol_cuboid_inverse', type: 'calculate' },
            { key: 'vol_cuboid_scaling', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const w = MathUtils.randomInt(3, 7), d = MathUtils.randomInt(4, 8), h = MathUtils.randomInt(3, 6);
        const baseArea = w * d;
        const vol = baseArea * h;

        if (v === 'vol_cuboid_inverse') {
            return {
                renderData: {
                    geometry: { type: 'cuboid', labels: { w, d, h: '?' } },
                    description: lang === 'sv' ? `Ett rätblock har volymen ${vol} cm³ och en bottenarea på ${baseArea} cm². Hur högt är rätblocket?` : `A rectangular prism has a volume of ${vol} cm³ and a base area of ${baseArea} cm². What is the height?`,
                    answerType: 'numeric', suffix: 'cm'
                },
                token: this.toBase64(h.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Volymen av ett rätblock beräknas som bottenarean multiplicerat med höjden." : "Step 1: The volume of a rectangular prism is calculated as base area multiplied by height.", latex: "V = B · h" },
                    { text: lang === 'sv' ? "Steg 2: För att hitta höjden måste vi dividera den totala volymen med bottenarean." : "Step 2: To find the height, we must divide the total volume by the base area." },
                    { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `h = \\frac{${vol}}{${baseArea}}` },
                    { text: lang === 'sv' ? `Svar: ${h}` : `Answer: ${h}` }
                ]
            };
        }

        if (v === 'vol_cuboid_scaling') {
            const factor = MathUtils.randomChoice([2, 3]);
            const ansText = lang === 'sv' ? `Den blir ${factor} gånger större` : `It becomes ${factor} times larger`;
            return {
                renderData: {
                    description: lang === 'sv' ? `Om du gör ett rätblock ${factor} gånger högre utan att ändra basen, vad händer med volymen?` : `If you make a cuboid ${factor} times taller without changing the base, what happens to the volume?`,
                    answerType: 'multiple_choice', options: MathUtils.shuffle([ansText, lang === 'sv' ? "Den ändras inte" : "It stays the same", lang === 'sv' ? "Den blir hälften så stor" : "It becomes half as big"])
                },
                token: this.toBase64(ansText), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Titta på formeln $V = B · h$." : "Step 1: Look at the formula $V = B · h$." },
                    { text: lang === 'sv' ? `Steg 2: Eftersom höjden (h) multipliceras med ${factor}, kommer hela resultatet också att multipliceras med ${factor}.` : `Step 2: Since the height (h) is multiplied by ${factor}, the whole result will also be multiplied by ${factor}.` },
                    { text: lang === 'sv' ? `Svar: ${ansText}` : `Answer: ${ansText}` }
                ]
            };
        }

        return {
            renderData: {
                geometry: { type: 'cuboid', labels: { w, d, h } },
                description: lang === 'sv' ? "Beräkna rätblockets volym." : "Calculate the volume of the rectangular prism.",
                answerType: 'numeric', suffix: 'cm³'
            },
            token: this.toBase64(vol.toString()), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Volymen beräknas genom att multiplicera längden, bredden och höjden." : "Step 1: The volume is calculated by multiplying the length, width, and height.", latex: "V = l · b · h" },
                { text: lang === 'sv' ? `Steg 2: Beräkna bottenarean först (${w} · ${d}).` : `Step 2: Calculate the base area first (${w} · ${d}).`, latex: `${w} · ${d} = ${baseArea}` },
                { text: lang === 'sv' ? `Steg 3: Multiplicera bottenarean med höjden (${h}).` : `Step 3: Multiply the base area by the height (${h}).`, latex: `${baseArea} · ${h} = ${vol}` },
                { text: lang === 'sv' ? `Svar: ${vol}` : `Answer: ${vol}` }
            ]
        };
    }

    // --- LEVEL 2: TRIANGULAR PRISM (Prisma) ---
    private level2_TriPrism(lang: string, variationKey?: string, options: any = {}): any {
        const b = MathUtils.randomInt(4, 8), hTri = MathUtils.randomInt(4, 6), length = MathUtils.randomInt(10, 15);
        const baseArea = (b * hTri) / 2;
        const vol = baseArea * length;

        return {
            renderData: {
                geometry: { type: 'triangular_prism', labels: { b, h: hTri, l: length } },
                description: lang === 'sv' ? "Beräkna volymen för det triangulära prismat." : "Calculate the volume of the triangular prism.",
                answerType: 'numeric', suffix: 'cm³'
            },
            token: this.toBase64(vol.toString()), variationKey: 'vol_tri_prism_std', type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Identifiera basytan. För ett prisma är volymen bottenarean (triangeln) multiplicerat med längden." : "Step 1: Identify the base surface. For a prism, the volume is the base area (the triangle) multiplied by the length." },
                { text: lang === 'sv' ? "Steg 2: Beräkna triangelns area (basen · höjden / 2)." : "Step 2: Calculate the area of the triangle (base · height / 2).", latex: `\\frac{${b} · ${hTri}}{2} = ${baseArea}` },
                { text: lang === 'sv' ? `Steg 3: Multiplicera basarean (${baseArea}) med prismats längd (${length}).` : `Step 3: Multiply the base area (${baseArea}) by the length of the prism (${length}).`, latex: `${baseArea} · ${length} = ${vol}` },
                { text: lang === 'sv' ? `Svar: ${vol}` : `Answer: ${vol}` }
            ]
        };
    }

    // --- LEVEL 3: CYLINDER (Cylinder) ---
    private level3_Cylinder(lang: string, variationKey?: string, options: any = {}): any {
        const r = MathUtils.randomInt(2, 5), h = MathUtils.randomInt(8, 12);
        const useDiameter = Math.random() > 0.5;
        const displayVal = useDiameter ? r * 2 : r;
        const vol = Math.round(3.14 * r * r * h);

        return {
            renderData: {
                geometry: { type: 'cylinder', show: useDiameter ? 'diameter' : 'radius', labels: useDiameter ? { d: displayVal, h } : { r: displayVal, h } },
                description: lang === 'sv' ? "Beräkna cylinderns volym ($\\pi \\approx 3,14$)." : "Calculate the volume of the cylinder ($\\pi \\approx 3.14$).",
                answerType: 'numeric', suffix: 'cm³'
            },
            token: this.toBase64(vol.toString()), variationKey: 'vol_cyl_std', type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Volymen för en cylinder är basarean (cirkeln) multiplicerat med höjden." : "Step 1: The volume of a cylinder is the base area (the circle) multiplied by the height.", latex: "V = \\pi · r^2 · h" },
                ...(useDiameter ? [{ text: lang === 'sv' ? `Steg 2: Eftersom diametern är ${displayVal} cm är radien hälften, alltså ${r} cm.` : `Step 2: Since the diameter is ${displayVal} cm, the radius is half, which is ${r} cm.`, latex: `r = \\frac{${displayVal}}{2} = ${r}` }] : []),
                { text: lang === 'sv' ? `Steg 3: Beräkna cirkelns area ($\\pi · r^2$).` : `Step 3: Calculate the area of the circle ($\\pi · r^2$).`, latex: `3,14 · ${r}^2 = ${3.14 * r * r}` },
                { text: lang === 'sv' ? `Steg 4: Multiplicera arean med höjden (${h}).` : `Step 4: Multiply the area by the height (${h}).`, latex: `${3.14 * r * r} · ${h} \\approx ${vol}` },
                { text: lang === 'sv' ? `Svar: ${vol}` : `Answer: ${vol}` }
            ]
        };
    }

    // --- LEVEL 4: PYRAMID & CONE ---
    private level4_PyramidCone(lang: string, variationKey?: string, options: any = {}): any {
        const v = variationKey || MathUtils.randomChoice(['vol_pyramid_std', 'vol_cone_std']);
        const h = MathUtils.randomChoice([9, 12, 15]);

        if (v === 'vol_pyramid_std') {
            const s = MathUtils.randomInt(4, 6);
            const baseArea = s * s;
            const vol = (baseArea * h) / 3;
            return {
                renderData: {
                    geometry: { type: 'pyramid', labels: { s, h } },
                    description: lang === 'sv' ? "Pyramiden har en kvadratisk basyta. Beräkna pyramidens volym." : "Calculate the volume of the pyramid with a square base.",
                    answerType: 'numeric', suffix: 'cm³'
                },
                token: this.toBase64(vol.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: En spetsig figur (som en pyramid) rymmer bara en tredjedel av vad ett rätblock med samma bas och höjd gör." : "Step 1: A pointed shape (like a pyramid) holds only one third of what a rectangular prism with the same base and height does.", latex: "V = \\frac{B · h}{3}" },
                    { text: lang === 'sv' ? `Steg 2: Beräkna basytans area (${s} · ${s}).` : `Step 2: Calculate the area of the base (${s} · ${s}).`, latex: `B = ${baseArea}` },
                    { text: lang === 'sv' ? `Steg 3: Multiplicera basarean med höjden (${h}) och dela sedan med 3.` : `Step 3: Multiply the base area by the height (${h}) and then divide by 3.`, latex: `\\frac{${baseArea} · ${h}}{3} = ${vol}` },
                    { text: lang === 'sv' ? `Svar: ${vol}` : `Answer: ${vol}` }
                ]
            };
        }

        const r = MathUtils.randomInt(3, 5);
        const baseArea = Math.round(3.14 * r * r * 10) / 10;
        const vol = Math.round((baseArea * h) / 3);
        return {
            renderData: {
                geometry: { type: 'cone', labels: { r, h } },
                description: lang === 'sv' ? "Beräkna konens volym ($\\pi \\approx 3,14$)." : "Calculate the volume of the cone ($\\pi \\approx 3.14$).",
                answerType: 'numeric', suffix: 'cm³'
            },
            token: this.toBase64(vol.toString()), variationKey: 'vol_cone_std', type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: En kon rymmer en tredjedel av vad en cylinder med samma bas och höjd gör." : "Step 1: A cone holds one third of what a cylinder with the same base and height does.", latex: "V = \\frac{\\pi · r^2 · h}{3}" },
                { text: lang === 'sv' ? "Steg 2: Beräkna bottenytans area." : "Step 2: Calculate the base area.", latex: `3,14 · ${r}^2 = ${baseArea}` },
                { text: lang === 'sv' ? `Steg 3: Multiplicera arean med höjden (${h}) och dela med 3.` : `Step 3: Multiply the area by the height (${h}) and divide by 3.`, latex: `\\frac{${baseArea} · ${h}}{3} \\approx ${vol}` },
                { text: lang === 'sv' ? `Svar: ${vol}` : `Answer: ${vol}` }
            ]
        };
    }

    // --- LEVEL 5: SPHERE & COMPOSITE ---
    private level5_SphereComposite(lang: string, variationKey?: string, options: any = {}): any {
        const v = variationKey || MathUtils.randomChoice(['vol_sphere_std', 'vol_silo_std', 'vol_icecream_std']);
        const r = MathUtils.randomInt(3, 5);
        const pi = 3.14;

        if (v === 'vol_sphere_std') {
            const vol = Math.round((4 * pi * Math.pow(r, 3)) / 3);
            return {
                renderData: {
                    geometry: { type: 'sphere', labels: { r } },
                    description: lang === 'sv' ? `Beräkna klotets volym med radien ${r} cm.` : `Calculate the volume of the sphere with radius ${r} cm.`,
                    answerType: 'numeric', suffix: 'cm³'
                },
                token: this.toBase64(vol.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Använd formeln för klotets volym." : "Step 1: Use the formula for the volume of a sphere.", latex: "V = \\frac{4 \\pi r^3}{3}" },
                    { text: lang === 'sv' ? `Steg 2: Räkna ut radien i kub ($r^3 = ${r} · ${r} · ${r}$).` : `Step 2: Calculate the radius cubed ($r^3 = ${r} · ${r} · ${r}$).`, latex: `${r}^3 = ${Math.pow(r, 3)}` },
                    { text: lang === 'sv' ? "Steg 3: Sätt in värdena och räkna ut resultatet." : "Step 3: Plug in the values and calculate the result.", latex: `\\frac{4 · 3,14 · ${Math.pow(r, 3)}}{3} \\approx ${vol}` },
                    { text: lang === 'sv' ? `Svar: ${vol}` : `Answer: ${vol}` }
                ]
            };
        }

        const hComp = MathUtils.randomInt(10, 15);
        const vHemi = Math.round((2 * pi * Math.pow(r, 3)) / 3);
        const vMain = v === 'vol_silo_std' ? Math.round(pi * r * r * hComp) : Math.round((pi * r * r * hComp) / 3);
        const total = vHemi + vMain;

        return {
            renderData: {
                geometry: { type: v === 'vol_silo_std' ? 'silo' : 'ice_cream', labels: { r, h: hComp } },
                description: lang === 'sv' ? "Beräkna den sammansatta figurens totala volym." : "Calculate the total volume of the composite figure.",
                answerType: 'numeric', suffix: 'cm³'
            },
            token: this.toBase64(total.toString()), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Dela upp figuren i två delar (halvklot + cylinder/kon)." : "Step 1: Split the figure into two parts (hemisphere + cylinder/cone)." },
                { text: lang === 'sv' ? `Steg 2: Beräkna halvklotets volym.` : `Step 2: Calculate the volume of the hemisphere.`, latex: `V_1 = \\frac{2 · 3,14 · ${r}^3}{3} = ${vHemi}` },
                { text: lang === 'sv' ? `Steg 3: Beräkna den andra delens volym.` : `Step 3: Calculate the volume of the other part.`, latex: `V_2 = ${vMain}` },
                { text: lang === 'sv' ? "Steg 4: Addera de två volymerna." : "Step 4: Add the two volumes together.", latex: `${vHemi} + ${vMain} = ${total}` },
                { text: lang === 'sv' ? `Svar: ${total}` : `Answer: ${total}` }
            ]
        };
    }

    // --- LEVEL 7: UNITS ---
    private level7_Units(lang: string, variationKey?: string, options: any = {}): any {
        const v = variationKey || MathUtils.randomChoice(['vol_units_liter', 'vol_units_m3']);
        
        if (v === 'vol_units_m3') {
            const w = MathUtils.randomInt(3, 5), d = MathUtils.randomInt(4, 6), h = 2;
            const m3 = w * d * h;
            const liters = m3 * 1000;
            return {
                renderData: {
                    description: lang === 'sv' ? `En pool har måtten ${w} m, ${d} m och djupet ${h} m. Hur många liter vatten rymmer den?` : `A pool has dimensions ${w} m, ${d} m, and a depth of ${h} m. How many liters of water does it hold?`,
                    answerType: 'numeric', suffix: 'liter'
                },
                token: this.toBase64(liters.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Beräkna först volymen i kubikmeter ($m^3$)." : "Step 1: First calculate the volume in cubic meters ($m^3$).", latex: `${w} · ${d} · ${h} = ${m3}` },
                    { text: lang === 'sv' ? "Steg 2: Omvandla kubikmeter till liter. Kom ihåg att $1 m^3 = 1000$ liter." : "Step 2: Convert cubic meters to liters. Remember that $1 m^3 = 1000$ liters." },
                    { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `${m3} · 1000 = ${liters}` },
                    { text: lang === 'sv' ? `Svar: ${liters}` : `Answer: ${liters}` }
                ]
            };
        }

        const w = 50, d = 20, h = 30; // 30 Liters
        const liters = (w * d * h) / 1000;
        return {
            renderData: {
                description: lang === 'sv' ? `Ett akvarium har måtten ${w} cm, ${d} cm och ${h} cm. Hur många liter rymmer det?` : `An aquarium has dimensions ${w} cm, ${d} cm, and ${h} cm. How many liters does it hold?`,
                answerType: 'numeric', suffix: 'liter'
            },
            token: this.toBase64(liters.toString()), variationKey: 'vol_units_liter', type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Omvandla måtten från cm till dm för att få resultatet i liter direkt ($1 dm^3 = 1$ liter)." : "Step 1: Convert the measurements from cm to dm to get the result in liters directly ($1 dm^3 = 1$ liter)." },
                { text: lang === 'sv' ? `Mått i dm: ${w/10} dm, ${d/10} dm och ${h/10} dm.` : `Measurements in dm: ${w/10} dm, ${d/10} dm, and ${h/10} dm.` },
                { text: lang === 'sv' ? "Steg 2: Multiplicera de nya måtten." : "Step 2: Multiply the new measurements.", latex: `${w/10} · ${d/10} · ${h/10} = ${liters}` },
                { text: lang === 'sv' ? `Svar: ${liters}` : `Answer: ${liters}` }
            ]
        };
    }

    // --- LEVEL 8: SURFACE AREA (Begränsningsarea) ---
    private level8_SurfaceArea(lang: string, variationKey?: string, options: any = {}): any {
        const v = variationKey || MathUtils.randomChoice(['sa_cuboid', 'sa_sphere']);
        
        if (v === 'sa_cuboid') {
            const w = MathUtils.randomInt(3, 5), d = MathUtils.randomInt(4, 6), h = MathUtils.randomInt(2, 4);
            const area = 2 * (w*d + w*h + d*h);
            return {
                renderData: {
                    geometry: { type: 'cuboid', labels: { w, d, h } },
                    description: lang === 'sv' ? "Beräkna rätblockets begränsningsarea (ytarean av alla sex sidor)." : "Calculate the surface area of the rectangular prism (the area of all six sides).",
                    answerType: 'numeric', suffix: 'cm²'
                },
                token: this.toBase64(area.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Ett rätblock har sex sidor som parvis är lika stora (botten/lock, fram/bak, höger/vänster)." : "Step 1: A rectangular prism has six sides that are equal in pairs (top/bottom, front/back, left/right)." },
                    { text: lang === 'sv' ? `Steg 2: Beräkna arean för de tre unika sidorna: ${w}·${d}=${w*d}, ${w}·${h}=${w*h}, ${d}·${h}=${d*h}.` : `Step 2: Calculate the area for the three unique sides: ${w}·${d}=${w*d}, ${w}·${h}=${w*h}, ${d}·${h}=${d*h}.` },
                    { text: lang === 'sv' ? "Steg 3: Summera dessa areor och multiplicera med 2." : "Step 3: Sum these areas and multiply by 2.", latex: `2 · (${w*d} + ${w*h} + ${d*h}) = ${area}` },
                    { text: lang === 'sv' ? `Svar: ${area}` : `Answer: ${area}` }
                ]
            };
        }

        const r = MathUtils.randomInt(4, 8);
        const sa = Math.round(4 * 3.14 * r * r);
        return {
            renderData: {
                geometry: { type: 'sphere', labels: { r } },
                description: lang === 'sv' ? `Beräkna ytarean (begränsningsarean) för ett klot med radien ${r} cm.` : `Calculate the surface area for a sphere with radius ${r} cm.`,
                answerType: 'numeric', suffix: 'cm²'
            },
            token: this.toBase64(sa.toString()), variationKey: 'sa_sphere', type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Använd formeln för klotets ytarea." : "Step 1: Use the formula for the surface area of a sphere.", latex: "A = 4 \\pi r^2" },
                { text: lang === 'sv' ? "Steg 2: Sätt in radien och beräkna." : "Step 2: Plug in the radius and calculate.", latex: `4 · 3,14 · ${r}^2 \\approx ${sa}` },
                { text: lang === 'sv' ? `Svar: ${sa}` : `Answer: ${sa}` }
            ]
        };
    }

    private level6_Mixed(lang: string, variationKey?: string, options: any = {}): any {
        const subLevel = MathUtils.randomInt(3, 5);
        return this.generate(subLevel, lang, options);
    }
}