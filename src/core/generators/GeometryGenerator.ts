import { MathUtils } from '../utils/MathUtils.js';

export class GeometryGenerator {
    public generate(level: number, lang: string = 'sv'): any {
        let mode = level;
        if (level >= 6) mode = MathUtils.randomInt(3, 5);

        switch (mode) {
            case 1: return this.level1_PerimeterRect(lang);
            case 2: return this.level2_AreaRect(lang);
            case 3: return this.level3_AreaTriangle(lang);
            case 4: return this.level4_Circles(lang);
            case 5: return this.level5_Composite(lang);
            default: return this.level1_PerimeterRect(lang);
        }
    }

    private level1_PerimeterRect(lang: string): any {
        const w = MathUtils.randomInt(3, 12);
        const h = MathUtils.randomInt(2, 8);
        const ans = 2 * (w + h);
        return {
            renderData: { 
                geometry: { 
                    type: 'rectangle', 
                    width: w, 
                    height: h, 
                    labels: { b: w, h: h } 
                }, 
                description: lang === 'sv' ? "Beräkna omkretsen." : "Calculate the perimeter.", 
                answerType: 'numeric' 
            },
            token: Buffer.from(ans.toString()).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Omkrets = 2 • (Bas + Höjd)" : "Perimeter = 2 • (Base + Height)", latex: `O = 2 \\cdot (${w} + ${h})` }
            ]
        };
    }

    private level2_AreaRect(lang: string): any {
        const w = MathUtils.randomInt(3, 12);
        const h = MathUtils.randomInt(3, 12);
        const ans = w * h;
        return {
            renderData: { 
                geometry: { 
                    type: 'rectangle', 
                    width: w, 
                    height: h, 
                    labels: { b: w, h: h } 
                }, 
                description: lang === 'sv' ? "Beräkna arean." : "Calculate the area.", 
                answerType: 'numeric' 
            },
            token: Buffer.from(ans.toString()).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Area = Bas • Höjd" : "Area = Base • Height", latex: `A = ${w} \\cdot ${h}` }
            ]
        };
    }

    private level3_AreaTriangle(lang: string): any {
        const b = MathUtils.randomInt(4, 12);
        const h = MathUtils.randomInt(4, 10);
        const ans = (b * h) / 2;
        return {
            renderData: { 
                geometry: { 
                    type: 'triangle', 
                    width: b, 
                    height: h, 
                    labels: { b: b, h: h } 
                }, 
                description: lang === 'sv' ? "Beräkna arean." : "Calculate the area.", 
                answerType: 'numeric' 
            },
            token: Buffer.from(ans.toString()).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Area = (Bas • Höjd) / 2" : "Area = (Base • Height) / 2", latex: `A = \\frac{${b} \\cdot ${h}}{2}` }
            ]
        };
    }

    private level4_Circles(lang: string): any {
        const r = MathUtils.randomInt(3, 10);
        const isArea = MathUtils.randomInt(0, 1) === 1;
        const ans = isArea ? Math.round(3.14 * r * r * 10) / 10 : Math.round(2 * 3.14 * r * 10) / 10;
        
        return {
            renderData: { 
                geometry: { 
                    type: 'circle', 
                    radius: r, 
                    show: isArea ? 'radius' : 'diameter', 
                    labels: isArea ? { r: r } : { diameter: 2*r } 
                }, 
                description: lang === 'sv' 
                    ? (isArea ? "Beräkna arean (använd pi = 3.14)." : "Beräkna omkretsen (använd pi = 3.14).")
                    : (isArea ? "Calculate area (use pi = 3.14)." : "Calculate perimeter (use pi = 3.14)."), 
                answerType: 'numeric' 
            },
            token: Buffer.from(ans.toString()).toString('base64'),
            clues: [
                { 
                    text: isArea ? "Area = pi • r²" : "Omkrets = pi • d", 
                    latex: isArea ? `A \\approx 3.14 \\cdot ${r}^2` : `O \\approx 3.14 \\cdot ${2*r}` 
                }
            ]
        };
    }

    private level5_Composite(lang: string): any {
        const isHouse = MathUtils.randomInt(0, 1) === 1;
        const w = MathUtils.randomInt(4, 10) * 10; 
        const h = MathUtils.randomInt(4, 8) * 10;
        
        let ans = 0;
        let geom: any = {};
        let desc = "";
        let steps = [];

        if (isHouse) {
            const hRoof = MathUtils.randomInt(2, 5) * 10;
            const isArea = MathUtils.randomInt(0, 1) === 1;
            
            if (isArea) {
                const aRect = w * h;
                const aTri = (w * hRoof) / 2;
                ans = aRect + aTri;
                desc = lang === 'sv' ? `Beräkna totala arean. (Bredd ${w}, Vägg ${h}, Tak höjd ${hRoof})` : `Calculate total area.`;
                steps = [{ latex: `${w}\\cdot${h} + \\frac{${w}\\cdot${hRoof}}{2} = \\mathbf{${ans}}` }];
            } else {
                // Perimeter logic
                const slope = Math.sqrt((w/2)**2 + hRoof**2);
                ans = Math.round((w + 2*h + 2*slope) * 10) / 10;
                desc = lang === 'sv' ? `Beräkna omkretsen. (Bredd ${w}, Vägg ${h}, Tak höjd ${hRoof})` : `Calculate perimeter.`;
                steps = [{ latex: `${w} + 2\\cdot${h} + 2\\cdot${Math.round(slope*10)/10} \\approx \\mathbf{${ans}}` }];
            }
            geom = { type: 'composite', subtype: 'house', labels: { w, h, h_roof: hRoof } };
        } else {
            const r = w / 2;
            const isArea = MathUtils.randomInt(0, 1) === 1;
            
            if (isArea) {
                const aRect = w * h;
                const aSemi = Math.round(3.14 * r * r / 2 * 10) / 10;
                ans = Math.round((aRect + aSemi)*10)/10;
                desc = lang === 'sv' ? `Beräkna arean av portalen (Bredd ${w}, Höjd ${h}).` : `Calculate portal area.`;
                steps = [{ latex: `${w}\\cdot${h} + \\frac{3.14\\cdot${r}^2}{2} \\approx \\mathbf{${ans}}` }];
            } else {
                const arc = 3.14 * r;
                ans = Math.round((w + 2*h + arc) * 10) / 10;
                desc = lang === 'sv' ? `Beräkna omkretsen (Bredd ${w}, Höjd ${h}).` : `Calculate perimeter.`;
                steps = [{ latex: `${w} + 2\\cdot${h} + 3.14\\cdot${r} \\approx \\mathbf{${ans}}` }];
            }
            geom = { type: 'composite', subtype: 'portal', labels: { w, h } };
        }

        return {
            renderData: { 
                geometry: geom, 
                description: desc, 
                answerType: 'numeric' 
            },
            token: Buffer.from(ans.toString()).toString('base64'),
            clues: steps
        };
    }
}