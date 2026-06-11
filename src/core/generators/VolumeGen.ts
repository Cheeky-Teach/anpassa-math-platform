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
                    { 
                        text: lang === 'sv' ? "Vi ska räkna baklänges! Volymen (allt utrymme på insidan) är alltid golvytan i botten multiplicerat med höjden." : "We need to work backwards! The volume (all space inside) is always the floor area at the bottom multiplied by the height.", 
                        latex: `\\text{Volym} = \\text{Golvyta} \\cdot \\text{höjd}` 
                    },
                    { 
                        text: lang === 'sv' ? `För att kasta om formeln och hitta den dolda höjden, tar vi hela volymen (${vol}) och delar (dividerar) med den kända golvytan (${baseArea}).` : `To reverse the formula and find the hidden height, take the total volume (${vol}) and divide by the known floor area (${baseArea}).`, 
                        latex: `\\text{höjd} = \\frac{\\text{Volym}}{\\text{Golvyta}} = \\frac{${vol}}{\\mathbf{${baseArea}}}` 
                    },
                    { 
                        text: lang === 'sv' ? "Räkna ut divisionen för att låsa upp höjden." : "Calculate the division step to unlock the height.", 
                        latex: `\\text{höjd} = \\mathbf{${h}}` 
                    },
                    { text: lang === 'sv' ? `Svar: ${h}` : `Answer: ${h}`, latex: `${h}` }
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
                    { 
                        text: lang === 'sv' ? "Volymen (luftutrymmet) byggs upp av formeln: golvytan i botten gånger höjden." : "The volume (the air space) is built up by the formula: floor area at the bottom times the height.", 
                        latex: `\\text{Volym} = \\text{Golvyta} \\cdot \\text{höjd}` 
                    },
                    { 
                        text: lang === 'sv' ? `Eftersom vi behåller samma golvyta men bygger huset exakt ${factor} gånger högre rakt upp, kommer det att få plats exakt ${factor} gånger så mycket luft inuti.` : `Since we keep the exact same floor area but build the house exactly ${factor} times taller straight up, it will hold exactly ${factor} times as much air inside.`, 
                        latex: `\\text{Ny Volym} = \\text{Golvyta} \\cdot \\mathbf{(${factor} \\cdot \\text{höjd})}` 
                    },
                    { 
                        text: lang === 'sv' ? `Hela volymutrymmet växer alltså i exakt samma takt som höjden, det vill säga ${factor} gånger.` : `The entire volume space grows at the exact same rate as the height, meaning ${factor} times.`, 
                        latex: `\\text{Resultat} = \\mathbf{${factor} \\text{ gånger större}}` 
                    },
                    { text: lang === 'sv' ? `Svar: ${ansText}` : `Answer: ${ansText}`, latex: `\\text{${ansText}}` }
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
                { 
                    text: lang === 'sv' ? "För att hitta volymen (hur mycket som får plats inuti boxen) gångrar (multiplicerar) vi bredden, djupet och höjden med varandra." : "To find the volume (how much fits inside the box), we multiply the width, depth, and height with each other.", 
                    latex: `\\text{Volym} = \\text{bredd} \\cdot \\text{djup} \\cdot \\text{höjd}` 
                },
                { 
                    text: lang === 'sv' ? `Räkna först ut golvytan i botten av boxen genom att ta bredden (${w}) gånger djupet (${d}).` : `First, calculate the floor area at the bottom of the box by taking the width (${w}) times the depth (${d}).`, 
                    latex: `\\text{Golvyta} = ${w} \\cdot ${d} = \\mathbf{${baseArea}}` 
                },
                { 
                    text: lang === 'sv' ? `Gångra sedan golvytan (${baseArea}) med hur hög boxen är (${h}) för att fylla hela utrymmet.` : `Then multiply the floor area (${baseArea}) by how tall the box is (${h}) to fill the entire space.`, 
                    latex: `\\text{Volym} = \\mathbf{${baseArea}} \\cdot ${h}` 
                },
                { 
                    text: lang === 'sv' ? "Slutför multiplikationen för att bestämma slutsvaret." : "Complete the final multiplication to determine the final answer code.", 
                    latex: `\\text{Volym} = \\mathbf{${vol}}` 
                },
                { text: lang === 'sv' ? `Svar: ${vol}` : `Answer: ${vol}`, latex: `${vol}` }
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
                description: lang === 'sv' ? "Beräkna volymen for det triangulära prismat." : "Calculate the volume of the triangular prism.",
                interceptorToken: `${b} ; ${hTri} ; ${length}`, 
                answerType: 'numeric', suffix: 'cm³'
            },
            token: this.toBase64(vol.toString()), variationKey: 'vol_tri_prism_std', type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? "Volymen för ett prisma räknas ut genom att ta golvytan i botten (som här är en triangel) och gångra med hur lång figuren är." : "The volume of a prism is calculated by taking the floor area at the bottom (which here is a triangle) and multiplying by how long the shape is.", 
                    latex: `\\text{Volym} = \\text{Triangelns golvyta} \\cdot \\text{längd}` 
                },
                { 
                    text: lang === 'sv' ? `Räkna ut triangelns golvyta först: basen (${b}) gånger höjden (${hTri}) delat på 2.` : `Calculate the triangle's floor area first: base (${b}) times height (${hTri}) divided by 2.`, 
                    latex: `\\text{Triangelns golvyta} = \\frac{${b} \\cdot ${hTri}}{2} = \\mathbf{${baseArea}}` 
                },
                { 
                    text: lang === 'sv' ? `Gångra nu denna golvyta (${baseArea}) med prismats hela längd (${length}) för att få rymden.` : `Now multiply this floor area (${baseArea}) by the prism's entire length (${length}) to get the volume capacity.`, 
                    latex: `\\text{Volym} = \\mathbf{${baseArea}} \\cdot ${length}` 
                },
                { 
                    text: lang === 'sv' ? "Slutför uträkningen för att fastställa rymden." : "Complete the calculation step to establish the total capacity volume.", 
                    latex: `\\text{Volym} = \\mathbf{${vol}}` 
                },
                { text: lang === 'sv' ? `Svar: ${vol}` : `Answer: ${vol}`, latex: `${vol}` }
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
                { 
                    text: lang === 'sv' ? "Volymen för ett runt rör (en cylinder) räknas ut genom att ta den runda golvytan i botten och gångra med höjden." : "The volume of a cylinder is calculated by taking the round floor area at the bottom and multiplying by the height.", 
                    latex: `\\text{Volym} = \\text{Runda golvytan} \\cdot \\text{höjd}` 
                },
                ...(useDiameter ? [{ 
                    text: lang === 'sv' ? `Måttet i bilden visar hela bredden (diametern) som är ${displayVal} cm. Radien (avståndet från mitten) är hälften, alltså ${r} cm.` : `The dimension in the image shows the full width (diameter) which is ${displayVal} cm. The radius (distance from the center) is half, which is ${r} cm.`, 
                    latex: `r = \\frac{${displayVal}}{2} = \\mathbf{${r}}` 
                }] : []),
                { 
                    text: lang === 'sv' ? `Räkna ut den runda cirkelns golvyta: radien i kvadrat (${r} · ${r}) gånger pi (3,14).` : `Calculate the area of the round circle floor: radius squared (${r} · ${r}) times pi (3.14).`, 
                    latex: `\\text{Runda golvytan} = 3{,}14 \\cdot ${r} \\cdot ${r} = \\mathbf{${3.14 * r * r}}` 
                },
                { 
                    text: lang === 'sv' ? `Gångra nu denna runda golvyta (${3.14 * r * r}) med rörets hela höjd (${h}).` : `Now multiply this round floor area (${3.14 * r * r}) by the tube's full height (${h}).`, 
                    latex: `\\text{Volym} = \\mathbf{${3.14 * r * r}} \\cdot ${h}` 
                },
                { 
                    text: lang === 'sv' ? "Avrunda räkningen till närmaste heltal för att få slutsvaret." : "Round the calculation to the nearest whole number to get the final answer.", 
                    latex: `\\text{Volym} \\approx \\mathbf{${vol}}` 
                },
                { text: lang === 'sv' ? `Svar: ${vol}` : `Answer: ${vol}`, latex: `${vol}` }
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
                    { 
                        text: lang === 'sv' ? "Kom ihåg guldregeln för spetsiga figurer: En pyramid rymmer bara exakt en tredjedel (delat på 3) jämfört med ett rakt rätblock med samma botten." : "Remember the golden rule for pointed shapes: A pyramid holds exactly one third (divided by 3) compared to a straight box with the same base.", 
                        latex: `\\text{Volym} = \\frac{\\text{Golvyta} \\cdot \\text{höjd}}{3}` 
                    },
                    { 
                        text: lang === 'sv' ? `Räkna ut kvadratens golvyta i botten: ${s} gånger ${s} blir ${baseArea}.` : `Calculate the square floor area at the bottom: ${s} times ${s} equals ${baseArea}.`, 
                        latex: `\\text{Golvyta} = ${s} \\cdot ${s} = \\mathbf{${baseArea}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Gångra golvytan (${baseArea}) med höjden (${h}) och glöm inte att dela med 3 i slutet eftersom figuren är spetsig.` : `Multiply the floor area (${baseArea}) by the height (${h}) and don't forget to divide by 3 at the end because the shape is pointed.`, 
                        latex: `\\text{Volym} = \\frac{\\mathbf{${baseArea}} \\cdot ${h}}{3}` 
                    },
                    { 
                        text: lang === 'sv' ? "Räkna ut divisionen för att få fram pyramidens färdiga rymd." : "Calculate the division to get the pyramid's final volumetric capacity.", 
                        latex: `\\text{Volym} = \\mathbf{${vol}}` 
                    },
                    { text: lang === 'sv' ? `Svar: ${vol}` : `Answer: ${vol}`, latex: `${vol}` }
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
                { 
                    text: lang === 'sv' ? "En spetsig glasstrut (en kon) rymmer exakt en tredjedel (delat på 3) jämfört med en rak cylinder som har samma runda botten." : "A pointed ice cream cone holds exactly one third (divided by 3) compared to a straight cylinder with the same round base.", 
                    latex: `\\text{Volym} = \\frac{\\text{Runda golvytan} \\cdot \\text{höjd}}{3}` 
                },
                { 
                    text: lang === 'sv' ? `Räkna ut den runda bottenytans area: radien i kvadrat (${r} · ${r}) gånger 3,14.` : `Calculate the round base area: radius squared (${r} · ${r}) times 3.14.`, 
                    latex: `\\text{Runda golvytan} = 3{,}14 \\cdot ${r} \\cdot ${r} = \\mathbf{${baseArea}}` 
                },
                { 
                    text: lang === 'sv' ? `Gångra nu denna runda yta (${baseArea}) med höjden (${h}) och dela med 3 eftersom struten smalnar av till en spets.` : `Multiply this round area (${baseArea}) by the height (${h}) and divide by 3 because the cone narrows down to a point.`, 
                    latex: `\\text{Volym} = \\frac{\\mathbf{${baseArea}} \\cdot ${h}}{3}` 
                },
                { 
                    text: lang === 'sv' ? "Avrunda summan till närmaste heltal för att få fram svaret." : "Round the sum to the nearest whole number to get the final answer state.", 
                    latex: `\\text{Volym} \\approx \\mathbf{${vol}}` 
                },
                { text: lang === 'sv' ? `Svar: ${vol}` : `Answer: ${vol}`, latex: `${vol}` }
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
                    description: lang === 'sv' ? `Beräkna klotets volym med radien ${r} cm.` : `Calculate the volume of the sphere with radius ${r} cm.`,
                    interceptorToken: `${r}`, 
                    answerType: 'numeric', suffix: 'cm³'
                },
                token: this.toBase64(vol.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? "För att räkna ut rymden inuti en helt rund boll (ett klot) använder vi en färdig mall på tavlan." : "To calculate the space inside a perfectly round ball (a sphere), we use a standard layout template on the board.", 
                        latex: `\\text{Volym} = \\frac{4 \\cdot \\pi \\cdot r^3}{3}` 
                    },
                    { 
                        text: lang === 'sv' ? `Börja med att räkna ut radien i kub ($r^3$), vilket betyder radien gånger sig själv tre gånger: ${r} · ${r} · ${r}.` : `Begin by calculating the radius cubed ($r^3$), which means the radius times itself three times: ${r} · ${r} · ${r}.`, 
                        latex: `r^3 = ${r} \\cdot ${r} \\cdot ${r} = \\mathbf{${Math.pow(r, 3)}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Sätt in siffrorna i mallen: ta 4 gånger pi (3,14) gånger ditt kubik-tal (${Math.pow(r, 3)}) och dela allt med 3.` : `Plug the numbers into the template: multiply 4 by pi (3.14) by your cubed value (${Math.pow(r, 3)}) and divide everything by 3.`, 
                        latex: `\\text{Volym} = \\frac{4 \\cdot 3{,}14 \\cdot \\mathbf{${Math.pow(r, 3)}}}{3}` 
                    },
                    { 
                        text: lang === 'sv' ? "Räkna ut hela uttrycket och avrunda till närmaste heltal." : "Calculate the entire expression and round it to the nearest whole integer.", 
                        latex: `\\text{Volym} \\approx \\mathbf{${vol}}` 
                    },
                    { text: lang === 'sv' ? `Svar: ${vol}` : `Answer: ${vol}`, latex: `${vol}` }
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
                { 
                    text: lang === 'sv' ? "Vi delar upp den här konstiga figuren i två välkända bitar: ett halvklot på toppen, plus den undre kroppen." : "We split this strange shape into two well-known pieces: a hemisphere on top, plus the lower body element.", 
                    latex: `\\text{Total Volym} = \\text{Volym}_{(\\text{halvklot})} + \\text{Volym}_{(\\text{underdel})}` 
                },
                { 
                    text: lang === 'sv' ? `Räkna ut det runda halvklotet först. Det är exakt hälften så stort som en hel boll.` : `Calculate the round hemisphere top first. It is exactly half the size of a full round ball element.`, 
                    latex: `\\text{Volym}_{(\\text{halvklot})} = \\frac{2 \\cdot 3{,}14 \\cdot ${r}^3}{3} = \\mathbf{${vHemi}}` 
                },
                { 
                    text: lang === 'sv' ? `Räkna sedan ut underdelen som är en ren ${v === 'vol_silo_std' ? 'cylinder' : 'kon'}:` : `Next, calculate the lower part which is a pure ${v === 'vol_silo_std' ? 'cylinder' : 'cone'}:`, 
                    latex: `\\text{Volym}_{(\\text{underdel})} = \\mathbf{${vMain}}` 
                },
                { 
                    text: lang === 'sv' ? `Plussa till sist ihop de två uträknade delarna (${vHemi} + ${vMain}) för att få fram totalen.` : `Finally, add the two calculated sections (${vHemi} + ${vMain}) together to reach the absolute grand total.`, 
                    latex: `\\text{Total Volym} = \\mathbf{${vHemi} + ${vMain}} = \\mathbf{${total}}` 
                },
                { text: lang === 'sv' ? `Svar: ${total}` : `Answer: ${total}`, latex: `${total}` }
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
        const valStr = val.toString().replace('.', ',');
        const ansStr = ans.toString().replace('.', ',');

        return {
            renderData: {
                description: lang === 'sv' ? `Omvandla ${valStr} ${p.from} till ${p.to}.` : `Convert ${val} ${p.from} to ${p.to}.`,
                latex: `${valStr} \\text{ ${p.from}} = \\text{\\_\\_\\_} \\text{ ${p.to}}`,
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()),
            variationKey: 'vol_unit_conv',
            type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? `Titta på den gyllene översättningsregeln för dessa volymenheter på tavlan:` : `Look closely at the golden conversion bridge translation rule for these volume types:`, 
                    latex: `\\mathbf{${p.note}}` 
                },
                { 
                    text: lang === 'sv' ? `Använd regeln för att växla enheten till ${p.to}. Flytta kommatecknet om det behövs.` : `Apply the bridge rule to swap the target unit system to ${p.to}. Shift the decimal point if necessary.`, 
                    latex: `${valStr} \\text{ ${p.from}} = \\mathbf{${ansStr}} \\text{ ${p.to}}` 
                },
                { text: lang === 'sv' ? `Svar: ${ansStr} ${p.to}` : `Answer: ${ans} ${p.to}`, latex: `${ansStr}` }
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

        const formattedAns = roundedAns.toString().replace('.', ',');

        return {
            renderData: {
                geometry: { type: shape, labels: labels },
                description: lang === 'sv' 
                    ? `${obj.sv.charAt(0).toUpperCase() + obj.sv.slice(1)} har formen av ett ${shape === 'cuboid' ? 'rätblock' : shape === 'cylinder' ? 'cylinder' : 'kon'} ${dimDesc}. Vad är dess volym i ${targetUnit}?` 
                    : `${obj.en.charAt(0).toUpperCase() + obj.en.slice(1)} is shaped like a ${shape} ${dimDesc}. What is its volume in ${targetUnit === 'liter' ? 'liters' : 'milliliters'}?`,
                answerType: 'numeric',
                suffix: targetUnit === 'liter' ? 'l' : 'ml'
            },
            token: this.toBase64(roundedAns.toString()),
            variationKey: 'vol_word_unit',
            type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? `Börja med att räkna ut figurens volym i den vanliga måttenheten ${startUnit}³ först.` : `Begin by calculating the shape's geometric volume inside the standard measurements layer ${startUnit}³ first.`, 
                    latex: `\\text{Volym} = \\mathbf{${latex}}` 
                },
                { 
                    text: lang === 'sv' ? `Nu ska vi växla enheten till vätskemåttet ${targetUnit}. Kom ihåg att 1 dm³ motsvarar exakt 1 liter, och 1 cm³ motsvarar exakt 1 ml.` : `Now we need to swap our structural units to fluid ${targetUnit} metrics. Remember that 1 dm³ matches exactly 1 liter, and 1 cm³ maps exactly to 1 ml.`, 
                    latex: `1 \\text{ dm}^3 = 1 \\text{ l} \\quad \\text{och} \\quad 1 \\text{ cm}^3 = 1 \\text{ ml}` 
                },
                { 
                    text: lang === 'sv' ? `Gör om ditt mätartal till ${targetUnit} genom att flytta kommatecknet åt rätt håll.` : `Convert your measurement total code to ${targetUnit} format by shifting the decimal point accordingly.`, 
                    latex: `\\text{Volym} = \\mathbf{${formattedAns}} \\text{ ${targetUnit === 'liter' ? 'l' : 'ml'}}` 
                },
                { text: `${lang === 'sv' ? 'Svar' : 'Answer'}: ${formattedAns} ${targetUnit === 'liter' ? 'l' : 'ml'}`, latex: `${formattedAns}` }
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
                    description: lang === 'sv' ? "Beräkna rätblockets ytarea (arean av alla sex sidor sammanlagt)." : "Calculate the surface area of the rectangular prism (the area of all six sides).",
                    answerType: 'numeric', suffix: 'cm²'
                },
                token: this.toBase64(area.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? "Ytarean betyder att vi räknar ut arean för papperet som behövs om du ska slå in hela rätblocket som ett paket. Det har 6 platta sidor totalt, som är likadana två och två (botten/lock, fram/bak, sidoväggar)." : "Surface area means calculating the paper needed if you wrap the entire box like a gift. It features 6 flat sides total, matching in duplicate pairs (top/bottom, front/back, side walls).", 
                        latex: `\\text{Ytarea} = 2 \\cdot (\\text{sida}_1 + \\text{sida}_2 + \\text{sida}_3)` 
                    },
                    { 
                        text: lang === 'sv' ? `Räkna ut ytan för de tre unika rektanglarna: golvet (${w}·${d}), framväggen (${w}·${h}) och sidoväggen (${d}·${h}).` : `Calculate the area space for the three unique flat layouts: floor (${w}·${d}), front wall (${w}·${h}), and side profile (${d}·${h}).`, 
                        latex: `\\text{Areor} = \\mathbf{${w*d}} \\text{ och } \\mathbf{${w*h}} \\text{ och } \\mathbf{${d*h}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Plussa ihop de tre unika väggarna och gångra med 2 i slutet eftersom det finns två av varje sort.` : `Sum the three unique values together and multiply by 2 at the end since there are two of each layout type inside the box scope.`, 
                        latex: `\\text{Ytarea} = 2 \\cdot (\\mathbf{${w*d} + ${w*h} + ${d*h}})` 
                    },
                    { 
                        text: lang === 'sv' ? "Slutför beräkningen för att få fram den totala ytan runt om." : "Complete the calculation string row to discover the final outer surface area balance.", 
                        latex: `\\text{Ytarea} = \\mathbf{${area}}` 
                    },
                    { text: lang === 'sv' ? `Svar: ${area}` : `Answer: ${area}`, latex: `${area}` }
                ]
            };
        }

        const r = MathUtils.randomInt(4, 20);
        const sa = Math.round(4 * 3.14 * r * r);
        return {
            renderData: {
                geometry: { type: 'sphere', labels: { r } },
                description: lang === 'sv' ? `Beräkna ytarean för ett klot med radien ${r} cm.` : `Calculate the surface area for a sphere with radius ${r} cm.`,
                answerType: 'numeric', suffix: 'cm²'
            },
            token: this.toBase64(sa.toString()), variationKey: 'sa_sphere', type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? "För att räkna ut ytan runt om en helt rund boll (presentpapperet som täcker utsidan) använder vi en fast formel på tavlan." : "To calculate the surface covering a perfectly round ball (the gift wrapping covering the outside area), we use a fixed blueprint template.", 
                    latex: `\\text{Ytarea} = 4 \\cdot \\pi \\cdot r^2` 
                },
                { 
                    text: lang === 'sv' ? `Räkna ut radien i kvadrat först (${r} · ${r} = ${r*r}) och multiplicera sedan med 4 och med pi (3,14).` : `Calculate the radius squared first (${r} · ${r} = ${r*r}) and then multiply the layout by 4 and by pi (3.14).`, 
                    latex: `\\text{Ytarea} = 4 \\cdot 3{,}14 \\cdot \\mathbf{${r*r}}` 
                },
                { 
                    text: lang === 'sv' ? "Räkna ut hela raden och avrunda till närmaste heltal." : "Execute the multiplication line and round the outcome to the nearest whole integer.", 
                    latex: `\\text{Ytarea} \\approx \\mathbf{${sa}}` 
                },
                { text: lang === 'sv' ? `Svar: ${sa}` : `Answer: ${sa}`, latex: `${sa}` }
            ]
        };
    }

    private level6_Mixed(lang: string, variationKey?: string, options: any = {}): any {
        const subLevel = MathUtils.randomInt(3, 5);
        return this.generate(subLevel, lang, options);
    }
}