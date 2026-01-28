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
            serverData: { answer: volume, solutionSteps: [
                { text: lang === 'sv' ? "Volym = Bredd · Djup · Höjd" : "Volume = Width · Depth · Height", latex: `V = ${w} \\cdot ${d} \\cdot ${h}` }
            ]}
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
            serverData: { answer: volume, solutionSteps: [
                { text: lang === 'sv' ? "1. Räkna ut basytan (triangeln)." : "1. Calculate base area (triangle).", latex: `B = \\frac{${b} \\cdot ${hTri}}{2} = ${areaBase}` },
                { text: lang === 'sv' ? "2. Multiplicera med längden." : "2. Multiply by length.", latex: `V = ${areaBase} \\cdot ${len} = ${volume}` }
            ]}
        };
    }

    // Level 3: Cylinder
    private level3_Cylinder(lang: string): any {
        const r = MathUtils.randomInt(2, 6);
        const h = MathUtils.randomInt(5, 15);
        const vol = Math.round(Math.PI * r * r * h); 
        
        return {
            renderData: {
                geometry: { type: 'cylinder', labels: { r, h } },
                description: lang === 'sv' ? "Beräkna volymen (heltal)." : "Calculate volume (integer).",
                answerType: 'text'
            },
            token: Buffer.from(vol.toString()).toString('base64'),
            serverData: { answer: vol, solutionSteps: [
                { text: lang === 'sv' ? "Basytan är en cirkel." : "Base is a circle.", latex: `B = \\pi \\cdot ${r}^2` },
                { text: lang === 'sv' ? "Volym = Basytan · Höjden" : "Volume = Base · Height", latex: `V \\approx 3.14 \\cdot ${r*r} \\cdot ${h}` }
            ]}
        };
    }

    // Level 4: Pyramid & Cone
    private level4_PyramidCone(lang: string): any {
        const isCone = MathUtils.randomInt(0, 1) === 1;
        const h = MathUtils.randomInt(5, 15);
        
        let vol, geom, steps;

        if (isCone) {
            const r = MathUtils.randomInt(3, 8);
            vol = Math.round((Math.PI * r * r * h) / 3);
            geom = { type: 'cone', labels: { r, h } };
            steps = [{ text: lang === 'sv' ? "Volym = (Basytan · Höjden) / 3" : "Volume = (Base · Height) / 3", latex: `V \\approx \\frac{3.14 \\cdot ${r}^2 \\cdot ${h}}{3}` }];
        } else {
            const s = MathUtils.randomInt(4, 10);
            vol = Math.round((s * s * h) / 3);
            geom = { type: 'pyramid', labels: { s, h } };
            steps = [{ text: lang === 'sv' ? "Volym = (Sida · Sida · Höjden) / 3" : "Volume = (Side · Side · Height) / 3", latex: `V = \\frac{${s}^2 \\cdot ${h}}{3}` }];
        }

        return {
            renderData: { geometry: geom, description: lang === 'sv' ? "Beräkna volymen (heltal)." : "Calculate volume (integer).", answerType: 'text' },
            token: Buffer.from(vol.toString()).toString('base64'),
            serverData: { answer: vol, solutionSteps: steps }
        };
    }

    // Level 5: Sphere & Composite
    private level5_Sphere(lang: string): any {
        const type = MathUtils.randomChoice(['sphere', 'hemisphere', 'ice_cream', 'silo']);
        const r = MathUtils.randomInt(3, 7);
        const pi = 3.14;
        let vol = 0, geom: any = {}, steps = [], desc = "";

        if (type === 'sphere') {
            vol = Math.round(4 * pi * Math.pow(r, 3) / 3);
            geom = { type: 'sphere', labels: { r } };
            desc = lang === 'sv' ? "Beräkna volymen (Klot)." : "Calculate volume (Sphere).";
            steps = [{ latex: `V = \\frac{4 \\cdot \\pi \\cdot ${r}^3}{3}` }];
        } else if (type === 'hemisphere') {
            const vFull = 4 * pi * Math.pow(r, 3) / 3;
            vol = Math.round(vFull / 2);
            geom = { type: 'hemisphere', labels: { r } };
            desc = lang === 'sv' ? "Beräkna volymen (Halvklot)." : "Calculate volume (Hemisphere).";
            steps = [{ text: lang === 'sv' ? "Räkna ut hela klotet och dela med 2." : "Calculate full sphere then divide by 2.", latex: `V \\approx \\frac{${Math.round(vFull)}}{2}` }];
        } else if (type === 'ice_cream') {
            const hCone = MathUtils.randomInt(r + 2, 15);
            const vCone = (pi * r * r * hCone) / 3;
            const vHemi = (4 * pi * Math.pow(r, 3) / 3) / 2;
            vol = Math.round(vCone + vHemi);
            geom = { type: 'ice_cream', labels: { r, h: hCone } };
            desc = lang === 'sv' ? "Beräkna totala volymen." : "Calculate total volume.";
            steps = [
                { text: "Kon", latex: `V_{kon} \\approx ${Math.round(vCone)}` },
                { text: "Halvklot", latex: `V_{halv} \\approx ${Math.round(vHemi)}` },
                { text: "Total", latex: `${Math.round(vCone)} + ${Math.round(vHemi)}` }
            ];
        } else { // Silo
            const hCyl = MathUtils.randomInt(r + 2, 15);
            const vCyl = pi * r * r * hCyl;
            const vHemi = (4 * pi * Math.pow(r, 3) / 3) / 2;
            vol = Math.round(vCyl + vHemi);
            geom = { type: 'silo', labels: { r, h: hCyl } };
            desc = lang === 'sv' ? "Beräkna totala volymen." : "Calculate total volume.";
            steps = [
                { text: "Cylinder", latex: `V_{cyl} \\approx ${Math.round(vCyl)}` },
                { text: "Halvklot", latex: `V_{halv} \\approx ${Math.round(vHemi)}` }
            ];
        }

        return {
            renderData: { geometry: geom, description: desc, answerType: 'text' },
            token: Buffer.from(vol.toString()).toString('base64'),
            serverData: { answer: vol, solutionSteps: steps }
        };
    }

    private level6_Mixed(lang: string): any {
        return this.generate(MathUtils.randomInt(1, 5), lang);
    }

    // Level 7: Unit Conversion
    private level7_Units(lang: string): any {
        // e.g. Cube 10cm -> 1 Liter
        const vol = 1;
        return {
            renderData: { 
                geometry: { type: 'cuboid', labels: { w: '10 cm', h: '10 cm', d: '10 cm' } }, 
                description: lang === 'sv' ? "Hur många liter rymmer kuben?" : "How many liters does the cube hold?", 
                answerType: 'text' 
            },
            token: Buffer.from(vol.toString()).toString('base64'),
            serverData: { answer: vol, solutionSteps: [
                { text: lang === 'sv' ? "1 liter = 1 dm³" : "1 liter = 1 dm³" },
                { text: lang === 'sv' ? "Omvandla sidorna till dm: 10 cm = 1 dm." : "Convert sides to dm: 10 cm = 1 dm." },
                { latex: "V = 1 \\cdot 1 \\cdot 1 = 1 \\text{ dm}^3" }
            ]}
        };
    }
}