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
            renderData: { geometry: { type: 'rectangle', width: w, height: h, labels: { width: w, height: h } }, description: lang === 'sv' ? "Beräkna omkretsen." : "Calculate the perimeter.", answerType: 'text' },
            token: Buffer.from(ans.toString()).toString('base64'),
            serverData: { answer: ans, solutionSteps: [{ latex: `${w} + ${w} + ${h} + ${h}` }] }
        };
    }

    private level2_AreaRect(lang: string): any {
        const w = MathUtils.randomInt(3, 12);
        const h = MathUtils.randomInt(2, 8);
        const ans = w * h;
        return {
            renderData: { geometry: { type: 'rectangle', width: w, height: h, labels: { width: w, height: h } }, description: lang === 'sv' ? "Beräkna arean." : "Calculate the area.", answerType: 'text' },
            token: Buffer.from(ans.toString()).toString('base64'),
            serverData: { answer: ans, solutionSteps: [{ latex: `A = ${w} \\cdot ${h}` }] }
        };
    }

    private level3_AreaTriangle(lang: string): any {
        const b = MathUtils.randomInt(4, 14);
        const h = MathUtils.randomInt(2, 8) * 2;
        const ans = (b * h) / 2;
        const subtype = MathUtils.randomChoice(['right', 'isosceles']); // Ensuring types are valid
        return {
            renderData: { geometry: { type: 'triangle', subtype, width: b, height: h, labels: { width: b, height: h } }, description: lang === 'sv' ? "Beräkna arean." : "Calculate the area.", answerType: 'text' },
            token: Buffer.from(ans.toString()).toString('base64'),
            serverData: { answer: ans, solutionSteps: [{ latex: `A = \\frac{${b} \\cdot ${h}}{2}` }] }
        };
    }

    private level4_Circles(lang: string): any {
        const r = MathUtils.randomInt(3, 9);
        const d = r * 2;
        const isArea = MathUtils.randomInt(0, 1) === 1;
        const showD = MathUtils.randomInt(0, 1) === 1;
        let ans = 0, desc = "", steps = [];
        if (isArea) {
            ans = Math.round(3.14 * r * r * 10) / 10;
            desc = lang === 'sv' ? "Beräkna arean." : "Calculate area.";
            steps.push({ latex: `A \\approx 3.14 \\cdot ${r}^2` });
        } else {
            ans = Math.round(2 * 3.14 * r * 10) / 10;
            desc = lang === 'sv' ? "Beräkna omkretsen." : "Calculate circumference.";
            steps.push({ latex: `O \\approx 3.14 \\cdot ${d}` });
        }

        return {
            renderData: { geometry: { type: 'circle', radius: r, labels: { val: showD ? `d=${d}` : `r=${r}` }, show: showD ? 'diameter' : 'radius' }, description: desc, answerType: 'text' },
            token: Buffer.from(ans.toString()).toString('base64'),
            serverData: { answer: ans, solutionSteps: steps }
        };
    }

    private level5_Composite(lang: string): any {
        const type = MathUtils.randomChoice(['house', 'portal']);
        const w = 6, h = 5;
        let ans = 0, steps = [], geom: any = {};
        
        if (type === 'house') {
            const hRoof = 3;
            const aRect = w*h;
            const aTri = w*hRoof/2;
            ans = aRect + aTri;
            steps = [{ latex: `${aRect} + ${aTri}` }];
            geom = { type: 'composite', subtype: 'house', labels: { w, h, h_roof: hRoof } };
        } else {
            const r = w/2;
            const aRect = w*h;
            const aSemi = Math.round(3.14*r*r/2 * 10)/10;
            ans = Math.round((aRect + aSemi)*10)/10;
            steps = [{ latex: `${aRect} + ${aSemi}` }];
            geom = { type: 'composite', subtype: 'portal', labels: { w, h } };
        }

        return {
            renderData: { geometry: geom, description: lang === 'sv' ? "Beräkna arean." : "Calculate area.", answerType: 'text' },
            token: Buffer.from(ans.toString()).toString('base64'),
            serverData: { answer: ans, solutionSteps: steps }
        };
    }
}