import { MathUtils } from '../utils/MathUtils.js';
import { enrichQuestionMetadata } from '../utils/WordProblemDecorator.js';

export class VolumeGen {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        // Adaptive Fallback: If Level 1 concepts (Standard Cuboid) are mastered, push to Prisms or Inverse logic
        if (level === 1 && options.hideConcept && options.exclude?.includes('vol_cuboid_std')) {
            return this.level2_TriPrism(lang, undefined, options);
        }

        let questionData: any;

        switch (level) {
            case 1: questionData = this.level1_Cuboid(lang, undefined, options); break;
            case 2: questionData = this.level2_TriPrism(lang, undefined, options); break;
            case 3: questionData = this.level3_Cylinder(lang, undefined, options); break;
            case 4: questionData = this.level4_PyramidCone(lang, undefined, options); break;
            case 5: questionData = this.level5_SphereComposite(lang, undefined, options); break;
            case 6: questionData = this.level6_Mixed(lang, undefined, options); break;
            case 7: questionData = this.level7_Units(lang, undefined, options); break;
            case 8: questionData = this.level8_SurfaceArea(lang, undefined, options); break;
            default: questionData = this.level1_Cuboid(lang, undefined, options); break;
        }

        // 🟢 Run through the decorator
        enrichQuestionMetadata(questionData);

        // 🟢 Practice Mode Level-Wide Override
        const WORD_PROBLEM_ELIGIBLE_LEVELS = [1, 2, 3, 4, 5, 6];
        if (WORD_PROBLEM_ELIGIBLE_LEVELS.includes(level)) {
            if (!questionData.metadata) questionData.metadata = {};
            questionData.metadata.levelSupportsWordProblems = true;
        }

        return questionData;
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
            case 'vol_unit_conv': return this.generateDirectConversion(lang);
            case 'vol_word_unit': return this.generateGeometricWordProblem(lang);
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
        const w = MathUtils.randomInt(3, 9), d = MathUtils.randomInt(3, 9), h = MathUtils.randomInt(3, 12);
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
            const factor = MathUtils.randomChoice([2, 3, 4, 5, 6, 7]);
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
                interceptorToken: `${w} ; ${d} ; ${h}`,
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
        const b = MathUtils.randomInt(4, 12), hTri = MathUtils.randomInt(5, 12), length = MathUtils.randomInt(8, 17);
        const baseArea = (b * hTri) / 2;
        const vol = baseArea * length;

        return {
            renderData: {
                geometry: { type: 'triangular_prism', labels: { b, h: hTri, l: length } },
                description: lang === 'sv' ? "Beräkna volymen för det triangulära prismat." : "Calculate the volume of the triangular prism.",
                interceptorToken: `${b} ; ${hTri} ; ${length}`, 
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
        const r = MathUtils.randomInt(2, 10), h = MathUtils.randomInt(10, 20);
        const useDiameter = Math.random() > 0.5;
        const displayVal = useDiameter ? r * 2 : r;
        const vol = Math.round(3.14 * r * r * h);

        return {
            renderData: {
                geometry: { type: 'cylinder', show: useDiameter ? 'diameter' : 'radius', labels: useDiameter ? { d: displayVal, h } : { r: displayVal, h } },
                description: lang === 'sv' ? "Beräkna cylinderns volym ($\\pi \\approx 3,14$)." : "Calculate the volume of the cylinder ($\\pi \\approx 3.14$).",
                interceptorToken: `${r} ; ${h}`,
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
        const h = MathUtils.randomInt(14, 22);

        if (v === 'vol_pyramid_std') {
            const s = MathUtils.randomInt(4, 12);
            const baseArea = s * s;
            const vol = (baseArea * h) / 3;
            return {
                renderData: {
                    geometry: { type: 'pyramid', labels: { s, h } },
                    description: lang === 'sv' ? "Pyramiden har en kvadratisk basyta. Beräkna pyramidens volym." : "Calculate the volume of the pyramid with a square base.",
                    interceptorToken: `${s} ; ${h}`, 
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

        const r = MathUtils.randomInt(3, 12);
        const baseArea = Math.round(3.14 * r * r * 10) / 10;
        const vol = Math.round((baseArea * h) / 3);
        return {
            renderData: {
                geometry: { type: 'cone', labels: { r, h } },
                description: lang === 'sv' ? "Beräkna konens volym ($\\pi \\approx 3,14$)." : "Calculate the volume of the cone ($\\pi \\approx 3.14$).",
                interceptorToken: `${r} ; ${h}`,
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
        const r = MathUtils.randomInt(3, 11);
        const pi = 3.14;

        if (v === 'vol_sphere_std') {
            const vol = Math.round((4 * pi * Math.pow(r, 3)) / 3);
            return {
                renderData: {
                    geometry: { type: 'sphere', labels: { r } },
                    description: lang === 'sv' ? `Beräkna klotets volym med radien ${r} cm.` : `Calculate the volume of the sphere with radius ${r} cm.,`,
                    interceptorToken: `${r}`, 
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

        const hComp = MathUtils.randomInt(11, 18);
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

    // --- LEVEL 7: UNITS & CONVERSIONS ---
    private level7_Units(lang: string, variationKey?: string, options: any = {}): any {
        const v = variationKey || (Math.random() > 0.5 ? 'vol_unit_conv' : 'vol_word_unit');
        return v === 'vol_unit_conv' ? this.generateDirectConversion(lang) : this.generateGeometricWordProblem(lang);
    }

    private generateDirectConversion(lang: string): any {
        const pairs = [
            { from: 'dm³', to: 'l', factor: 1, note: "1 dm³ = 1 l" },
            { from: 'l', to: 'dm³', factor: 1, note: "1 l = 1 dm³" },
            { from: 'cm³', to: 'ml', factor: 1, note: "1 cm³ = 1 ml" },
            { from: 'ml', to: 'cm³', factor: 1, note: "1 ml = 1 cm³" },
            { from: 'l', to: 'cm³', factor: 1000, note: "1 l = 1000 cm³" },
            { from: 'cm³', to: 'l', factor: 0.001, note: "1000 cm³ = 1 l" },
            { from: 'ml', to: 'dm³', factor: 0.001, note: "1000 ml = 1 dm³" }
        ];

        const p = MathUtils.randomChoice(pairs);
        const val = p.factor === 1 ? MathUtils.randomInt(2, 500) : (p.factor < 1 ? MathUtils.randomChoice([500, 1500, 2500, 5000]) : MathUtils.randomChoice([0.5, 1.5, 2, 5]));
        const ans = val * p.factor;

        return {
            renderData: {
                description: lang === 'sv' ? `Omvandla ${val} ${p.from} till ${p.to}.` : `Convert ${val} ${p.from} to ${p.to}.`,
                latex: `${val.toString().replace('.', ',')} \\text{ ${p.from}} = \\text{\\_\\_\\_} \\text{ ${p.to}}`,
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()),
            variationKey: 'vol_unit_conv',
            type: 'calculate',
            clues: [
                { text: lang === 'sv' ? `Kom ihåg: ${p.note}` : `Remember: ${p.note}` },
                { text: lang === 'sv' ? `Svar: ${ans.toString().replace('.', ',')} ${p.to}` : `Answer: ${ans} ${p.to}` }
            ]
        };
    }

    private generateGeometricWordProblem(lang: string): any {
        const objects: any = {
            cuboid: [
                { sv: "ett akvarium", en: "an aquarium" }, { sv: "en låda", en: "a box" }, { sv: "en tegelsten", en: "a brick" },
                { sv: "en container", en: "a container" }, { sv: "en kista", en: "a chest" }, { sv: "en pool", en: "a pool" },
                { sv: "ett suddgummi", en: "an eraser" }, { sv: "en chokladkaka", en: "a chocolate bar" }, { sv: "ett rum", en: "a room" }, { sv: "en resväska", en: "a suitcase" }
            ],
            cylinder: [
                { sv: "en tunna", en: "a barrel" }, { sv: "en läskburk", en: "a soda can" }, { sv: "ett rör", en: "a pipe" },
                { sv: "ett batteri", en: "a battery" }, { sv: "ett limstift", en: "a glue stick" }, { sv: "ett ljus", en: "a candle" },
                { sv: "en vattentank", en: "a water tank" }, { sv: "en mugg", en: "a mug" }, { sv: "en silo", en: "a silo" }, { sv: "en kavel", en: "a rolling pin" }
            ],
            cone: [
                { sv: "en glasstrut", en: "an ice cream cone" }, { sv: "en trafikkon", en: "a traffic cone" }, { sv: "en partytut", en: "a party hat" },
                { sv: "en tratt", en: "a funnel" }, { sv: "en vulkanmodell", en: "a volcano model" }, { sv: "ett tipi-tält", en: "a teepee" },
                { sv: "en pennvässartopp", en: "a pencil tip" }, { sv: "en pappersmugg", en: "a paper cup" }, { sv: "en sandhög", en: "a sand pile" }, { sv: "en megafon", en: "a megaphone" }
            ]
        };

        const shape = MathUtils.randomChoice(['cuboid', 'cylinder', 'cone']);
        const obj = MathUtils.randomChoice(objects[shape]);
        const startUnit = MathUtils.randomChoice(['cm', 'dm']);
        const targetUnit = MathUtils.randomChoice(['liter', 'milliliter']);

        let vRaw = 0, labels: any = {}, latex = "";

        if (shape === 'cuboid') {
            const w = MathUtils.randomInt(2, 10), h = MathUtils.randomInt(2, 10), d = MathUtils.randomInt(2, 10);
            vRaw = w * h * d;
            labels = { w, h, d };
            latex = `${w} · ${h} · ${d} = ${vRaw} ${startUnit}³`;
        } else if (shape === 'cylinder') {
            const r = MathUtils.randomInt(2, 12), h = MathUtils.randomInt(5, 15);
            vRaw = 3.14 * r * r * h;
            labels = { r, h };
            latex = `3,14 · ${r}^2 · ${h} = ${vRaw.toFixed(1)} ${startUnit}³`;
        } else {
            const r = MathUtils.randomInt(3, 10), h = MathUtils.randomInt(5, 12);
            vRaw = (3.14 * r * r * h) / 3;
            labels = { r, h };
            latex = `\\frac{3,14 · ${r}^2 · ${h}}{3} = ${vRaw.toFixed(1)} ${startUnit}³`;
        }

        // --- CONVERSION LOGIC [Requirement 1] ---
        let finalAns = 0;
        if (startUnit === 'dm') {
            // dm³ -> l (1:1), dm³ -> ml (1:1000)
            finalAns = targetUnit === 'liter' ? vRaw : vRaw * 1000;
        } else {
            // cm³ -> l (1:0.001), cm³ -> ml (1:1)
            finalAns = targetUnit === 'liter' ? vRaw / 1000 : vRaw;
        }

        // Limit check for ml [Requirement 1]
        if (targetUnit === 'milliliter' && finalAns > 70000) return this.generateGeometricWordProblem(lang);

        const roundedAns = Number(finalAns.toFixed(1));
        const dimDesc = shape === 'cuboid' 
            ? (lang === 'sv' ? `med bredden ${labels.w} ${startUnit}, höjden ${labels.h} ${startUnit} och djupet ${labels.d} ${startUnit}` : `with width ${labels.w} ${startUnit}, height ${labels.h} ${startUnit} and depth ${labels.d} ${startUnit}`)
            : (lang === 'sv' ? `med radien ${labels.r} ${startUnit} och höjden ${labels.h} ${startUnit}` : `with radius ${labels.r} ${startUnit} and height ${labels.h} ${startUnit}`);

        return {
            renderData: {
                // FIXED: Dimensions are now passed in a 'labels' object [Requirement 2]
                geometry: { type: shape, labels: labels },
                description: lang === 'sv' 
                    ? `${obj.sv.charAt(0).toUpperCase() + obj.sv.slice(1)} har formen av en ${shape === 'cuboid' ? 'rätblock' : shape === 'cylinder' ? 'cylinder' : 'kon'} ${dimDesc}. Vad är dess volym i ${targetUnit}?` 
                    : `${obj.en.charAt(0).toUpperCase() + obj.en.slice(1)} is shaped like a ${shape} ${dimDesc}. What is its volume in ${targetUnit === 'liter' ? 'liters' : 'milliliters'}?`,
                answerType: 'numeric',
                suffix: targetUnit === 'liter' ? 'l' : 'ml'
            },
            token: this.toBase64(roundedAns.toString()),
            variationKey: 'vol_word_unit',
            type: 'calculate',
            clues: [
                { text: lang === 'sv' ? `Steg 1: Beräkna volymen i ${startUnit}³.` : `Step 1: Calculate the volume in ${startUnit}³.`, latex },
                { text: lang === 'sv' ? `Steg 2: Omvandla till ${targetUnit}. (1 dm³ = 1 l, 1 cm³ = 1 ml)` : `Step 2: Convert to ${targetUnit}. (1 dm³ = 1 l, 1000 cm³ = 1 l)` },
                { text: `${lang === 'sv' ? 'Svar' : 'Answer'}: ${roundedAns.toString().replace('.', ',')} ${targetUnit === 'liter' ? 'l' : 'ml'}` }
            ]
        };
    }

    // --- LEVEL 8: SURFACE AREA (Begränsningsarea) ---
    private level8_SurfaceArea(lang: string, variationKey?: string, options: any = {}): any {
        const v = variationKey || MathUtils.randomChoice(['sa_cuboid', 'sa_sphere']);
        
        if (v === 'sa_cuboid') {
            const w = MathUtils.randomInt(3, 12), d = MathUtils.randomInt(3, 12), h = MathUtils.randomInt(2, 12);
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

        const r = MathUtils.randomInt(4, 20);
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