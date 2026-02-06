import { MathUtils } from '../utils/MathUtils.js';

export class VolumeGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_Cuboid(lang);
            case 2: return this.level2_TriPrism(lang);
            case 3: return this.level3_Cylinder(lang);
            case 4: return this.level4_PyramidCone(lang);
            case 5: return this.level5_SphereComposite(lang);
            default: return this.level1_Cuboid(lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    // --- LEVEL 1: Cuboids ---
    private level1_Cuboid(lang: string): any {
        const variation = Math.random();

        // VARIATION A: Inverse (Find Height)
        if (variation < 0.3) {
            const w = MathUtils.randomInt(2, 6);
            const d = MathUtils.randomInt(2, 6);
            const h = MathUtils.randomInt(3, 12);
            const vol = w * d * h;
            const baseArea = w * d;

            return {
                renderData: {
                    geometry: { type: 'cuboid', labels: { w, d, h: '?' } },
                    description: lang === 'sv' 
                        ? `Volymen är ${vol} cm³. Bottenarean är ${baseArea} cm². Vad är höjden?` 
                        : `The volume is ${vol} cm³. The base area is ${baseArea} cm². What is the height?`,
                    answerType: 'numeric',
                    suffix: 'cm'
                },
                token: this.toBase64(h.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? "Volym = Bas * Höjd. Dela volymen med basen." : "Volume = Base * Height. Divide volume by base.", 
                        latex: `h = ${vol} \\div ${baseArea}` 
                    }
                ]
            };
        }

        // VARIATION B: Concept (Scaling)
        if (variation < 0.6) {
            const q = lang==='sv' 
                ? "Om du dubblerar höjden på en låda, vad händer med volymen?" 
                : "If you double the height of a box, what happens to the volume?";
            const ans = lang==='sv' ? "Den dubblas" : "It doubles";
            const wrong1 = lang==='sv' ? "Den fyrdubblas" : "It quadruples";
            const wrong2 = lang==='sv' ? "Ingen skillnad" : "No change";

            return {
                renderData: {
                    description: q,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([ans, wrong1, wrong2]),
                    geometry: { type: 'cuboid', labels: { w: 'w', d: 'd', h: 'h' } }
                },
                token: this.toBase64(ans),
                clues: [{ text: "V_new = w*d*(2h) = 2(w*d*h)", latex: "" }]
            };
        }

        // VARIATION C: Standard Calc
        const w = MathUtils.randomInt(2, 9);
        const d = MathUtils.randomInt(2, 9);
        const h = MathUtils.randomInt(2, 12);
        return {
            renderData: { 
                geometry: { type: 'cuboid', labels: { w, h, d } }, 
                description: lang === 'sv' ? "Beräkna rätblockets volym:" : "Calculate the volume of the rectangular prism:", 
                answerType: 'numeric' 
            },
            token: this.toBase64((w*d*h).toString()),
            clues: [{latex: `${w}\\cdot${d}\\cdot${h}`}]
        };
    }

    // --- LEVEL 2: Triangular Prism ---
    private level2_TriPrism(lang: string): any {
        const variation = Math.random();
        const b = MathUtils.randomInt(3, 8);
        const hTri = MathUtils.randomInt(3, 8);
        const length = MathUtils.randomInt(5, 15);
        
        // Ensure even base area for clean integers
        if ((b * hTri) % 2 !== 0) return this.level2_TriPrism(lang);

        const baseArea = (b * hTri) / 2;
        const vol = baseArea * length;

        // VARIATION A: Standard Volume
        if (variation < 0.5) {
            return {
                renderData: {
                    geometry: { type: 'triangular_prism', labels: { b, h: hTri, l: length } },
                    description: lang === 'sv' 
                        ? "Beräkna det triangulära prismats volym:" 
                        : "Calculate the volume of the triangular prism:",
                    answerType: 'numeric', suffix: 'cm³'
                },
                token: this.toBase64(vol.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? "Räkna ut triangelns area först." : "Calculate the triangle area first.", 
                        latex: `B = \\frac{${b} \\cdot ${hTri}}{2} = ${baseArea}` 
                    },
                    {
                        text: lang === 'sv' ? "Multiplicera sedan med längden." : "Then multiply by the length.",
                        latex: `${baseArea} \\cdot ${length}`
                    }
                ]
            };
        }

        // VARIATION B: Inverse (Find Length)
        return {
            renderData: {
                geometry: { type: 'triangular_prism', labels: { b, h: hTri, l: '?' } },
                description: lang==='sv' 
                    ? `Volymen är ${vol} cm³. Triangelns bas är ${b} och höjd ${hTri}. Vad är längden?`
                    : `The volume is ${vol} cm³. The triangle base is ${b} and height ${hTri}. What is the length?`,
                answerType: 'numeric', suffix: 'cm'
            },
            token: this.toBase64(length.toString()),
            clues: [
                { latex: `\\text{Base Area} = ${baseArea}` },
                { latex: `L = ${vol} \\div ${baseArea}` }
            ]
        };
    }

    // --- LEVEL 3: Cylinder ---
    private level3_Cylinder(lang: string): any {
        const variation = Math.random();
        const r = MathUtils.randomInt(2, 6);
        const h = MathUtils.randomInt(5, 15);
        const vol = Math.round(Math.PI * r * r * h);

        // VARIATION A: Estimation
        if (variation < 0.3) {
            const threshold = vol - MathUtils.randomInt(10, 50);
            const ans = lang==='sv' ? "Ja" : "Yes";
            const wrong = lang==='sv' ? "Nej" : "No";

            return {
                renderData: {
                    description: lang==='sv' 
                        ? `En cylinder har radie ${r} och höjd ${h}. Är volymen större än ${threshold}?` 
                        : `A cylinder has radius ${r} and height ${h}. Is the volume greater than ${threshold}?`,
                    answerType: 'multiple_choice',
                    options: [ans, wrong],
                    geometry: { type: 'cylinder', labels: { r, h } }
                },
                token: this.toBase64(ans),
                clues: [{latex: `\\pi \\approx 3 \\implies V \\approx 3 \\cdot ${r*r} \\cdot ${h}`}]
            };
        }

        // VARIATION B: Missing Height (Fixed)
        if (variation < 0.6) {
            const baseArea = Math.round(Math.PI * r * r);
            const approxVol = baseArea * h;
            
            return {
                renderData: {
                    description: lang==='sv' 
                        ? `Volymen är ca ${approxVol}. Bottenarean är ${baseArea}. Vad är höjden?` 
                        : `The volume is approx ${approxVol}. The base area is ${baseArea}. What is the height?`,
                    answerType: 'numeric',
                    // Explicitly pass 'r' so the radius line/label draws, and 'h' as '?'
                    geometry: { type: 'cylinder', labels: { r: r, h: '?' } }
                },
                token: this.toBase64(h.toString()),
                clues: [{latex: `${approxVol} \\div ${baseArea}`}]
            };
        }

        // VARIATION C: Standard
        return {
            renderData: { 
                description: lang === 'sv' 
                    ? "Beräkna cylinderns volym (avrunda till heltal):" 
                    : "Calculate the volume of the cylinder (round to the nearest integer):", 
                answerType: 'numeric', 
                geometry: {type: 'cylinder', labels: {r, h}} 
            },
            token: this.toBase64(vol.toString()),
            clues: [{text: "V = pi * r^2 * h", latex: `\\pi \\cdot ${r}^2 \\cdot ${h}`}]
        };
    }

    // --- LEVEL 4: Pyramid/Cone ---
    private level4_PyramidCone(lang: string): any {
        const variation = Math.random();

        // VARIATION A: Pyramid Volume
        // NOTE: Ensure 'd' is passed in labels so that if visualizer supports it, it draws.
        if (variation < 0.3) {
            const w = MathUtils.randomInt(3, 8);
            const d = MathUtils.randomInt(3, 8);
            const h = MathUtils.randomInt(6, 12);
            // Ensure result is clean integer if possible, or round it
            const hClean = h - (h % 3) + 3; 
            const vol = (w * d * hClean) / 3;

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? "Beräkna pyramidens volym:" 
                        : "Calculate the volume of the pyramid:",
                    answerType: 'numeric',
                    geometry: { 
                        type: 'pyramid', 
                        labels: { w, d, h: hClean } 
                    }
                },
                token: this.toBase64(vol.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? "Pyramidens volym är (basytan * höjden) / 3." : "Pyramid volume is (base area * height) / 3.", 
                        latex: `V = \\frac{${w} \\cdot ${d} \\cdot ${hClean}}{3}` 
                    }
                ]
            };
        }

        // VARIATION B: Rule of 3 (Cone vs Cyl)
        if (variation < 0.6) {
            return {
                renderData: {
                    description: lang==='sv' 
                        ? "Hur många koner ryms i en cylinder med samma mått?" 
                        : "How many cones fit inside a cylinder with the same dimensions?",
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle(["2", "3", "4", "1.5"]),
                    geometry: { type: 'cone', labels: { r: 'r', h: 'h' } }
                },
                token: this.toBase64("3"),
                clues: [
                    {
                        text: lang === 'sv' ? "Spetsiga figurer (som koner) har alltid exakt en tredjedel av volymen jämfört med raka figurer (som cylindrar)." : "Pointy shapes (like cones) always have exactly one-third the volume of straight shapes (like cylinders).",
                        latex: ""
                    }
                ]
            };
        }

        // VARIATION C: Standard Cone Calc
        const r = MathUtils.randomInt(3, 6);
        const h = MathUtils.randomInt(6, 12);
        const v = Math.round((Math.PI*r*r*h)/3);
        
        return {
            renderData: { 
                description: lang === 'sv' 
                    ? "Beräkna konens volym (avrunda till heltal):" 
                    : "Calculate the volume of the cone (round to the nearest integer):", 
                answerType: 'numeric', 
                geometry: {type: 'cone', labels: {r, h}} 
            },
            token: this.toBase64(v.toString()),
            clues: [
                {
                    text: lang === 'sv' ? "Låtsas först att det är en vanlig cylinder (Area * höjd)." : "First pretend it's a regular cylinder (Area * Height).",
                    latex: `\\pi \\cdot ${r}^2 \\cdot ${h}`
                },
                {
                    text: lang === 'sv' ? "Eftersom den är spetsig, dela ditt svar med 3." : "Since it's pointy, divide your answer by 3.",
                    latex: "\\div 3"
                }
            ]
        };
    }

    // --- LEVEL 5: Sphere & Composite ---
    private level5_SphereComposite(lang: string): any {
        const variation = Math.random();
        
        // VARIATION A: Sphere Volume (33%)
        if (variation < 0.33) {
            const r = MathUtils.randomInt(3, 9) * 3;
            const vol = Math.round((4 * Math.PI * Math.pow(r, 3)) / 3);
            
            return {
                renderData: {
                    description: lang==='sv' 
                        ? "Beräkna klotets volym (avrunda till heltal):" 
                        : "Calculate the volume of the sphere (round to the nearest integer):",
                    answerType: 'numeric',
                    geometry: { type: 'sphere', labels: { r } }
                },
                token: this.toBase64(vol.toString()),
                clues: [
                    { text: "Formula", latex: `V = \\frac{4 \\cdot \\pi \\cdot r^3}{3}` },
                    { latex: `\\frac{4 \\cdot \\pi \\cdot ${r}^3}{3}` }
                ]
            };
        }

        // VARIATION B: Composite (Silo: Cylinder + Hemisphere) (33%)
        if (variation < 0.66) {
            const r = MathUtils.randomInt(3, 6);
            const hCyl = MathUtils.randomInt(5, 12);
            
            const vCyl = Math.PI * r * r * hCyl;
            const vSphere = (4 * Math.PI * Math.pow(r, 3)) / 3;
            const vHemi = vSphere / 2;
            const total = Math.round(vCyl + vHemi);

            return {
                renderData: {
                    description: lang==='sv' 
                        ? "En silo består av en cylinder och en halvsfär på toppen. Beräkna totala volymen." 
                        : "A silo consists of a cylinder and a hemisphere on top. Calculate the total volume.",
                    answerType: 'numeric',
                    geometry: { type: 'silo', labels: { r, h: hCyl } }
                },
                token: this.toBase64(total.toString()),
                clues: [
                    { text: lang==='sv' ? "Addera cylindern och halvsfären." : "Add the cylinder and the hemisphere.", latex: "V_{total} = V_{cyl} + V_{hemi}" },
                    { latex: `(\\pi \\cdot ${r}^2 \\cdot ${hCyl}) + (\\frac{2}{3} \\cdot \\pi \\cdot ${r}^3)` }
                ]
            };
        }

        // VARIATION C: Ice Cream Cone (Cone + Hemisphere) (34%)
        const rVal = MathUtils.randomInt(3, 6);
        const hCone = MathUtils.randomInt(6, 12);
        
        const vCone = (Math.PI * rVal * rVal * hCone) / 3;
        const vSphere = (4 * Math.PI * Math.pow(rVal, 3)) / 3;
        const vHemi = vSphere / 2;
        const totalVol = Math.round(vCone + vHemi);

        // Randomly choose Radius or Diameter
        const showDiameter = Math.random() > 0.5;
        const labelVal = showDiameter ? rVal * 2 : rVal;
        const labelKey = showDiameter ? 'd' : 'r';
        const dimText = showDiameter 
            ? (lang === 'sv' ? `diameter ${labelVal}` : `diameter ${labelVal}`) 
            : (lang === 'sv' ? `radie ${labelVal}` : `radius ${labelVal}`);

        return {
            renderData: {
                description: lang==='sv' 
                    ? `En glasstrut består av en kon och en halvsfär (glasskula) på toppen. Konen har höjden ${hCone} och ${dimText}. Beräkna totala volymen (avrunda till heltal).` 
                    : `An ice cream cone consists of a cone and a hemisphere (scoop) on top. The cone has height ${hCone} and ${dimText}. Calculate the total volume (round to integer).`,
                answerType: 'numeric',
                // FIX: Pass show: 'diameter' when needed so visualizer draws full line
                geometry: { 
                    type: 'ice_cream', 
                    show: showDiameter ? 'diameter' : undefined,
                    labels: { [labelKey]: labelVal, h: hCone } 
                }
            },
            token: this.toBase64(totalVol.toString()),
            clues: [
                { 
                    text: lang==='sv' ? "Dela upp figuren: En kon nertill och en halv boll (halvsfär) upptill." : "Split the shape: A cone at the bottom and a half-ball (hemisphere) on top.", 
                    latex: "" 
                },
                { 
                    text: lang==='sv' ? "Beräkna volymen för konen och halvsfären separat och addera dem." : "Calculate the volume for the cone and the hemisphere separately and add them.", 
                    latex: `V_{total} = V_{cone} + V_{hemi}` 
                },
                {
                    text: lang==='sv' ? `Radien är ${rVal}.` : `The radius is ${rVal}.`,
                    latex: showDiameter ? `r = d/2 = ${rVal}` : `r = ${rVal}`
                }
            ]
        };
    }
}