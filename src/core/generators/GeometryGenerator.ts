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

    // Level 1: Perimeter
    private level1_PerimeterRect(lang: string): any {
        const w = MathUtils.randomInt(3, 12);
        const h = MathUtils.randomInt(2, 8);
        const ans = 2 * (w + h);
        return {
            renderData: { geometry: { type: 'rectangle', width: w, height: h, labels: { width: w, height: h } }, description: lang === 'sv' ? "Beräkna omkretsen." : "Calculate the perimeter.", answerType: 'text' },
            token: Buffer.from(ans.toString()).toString('base64'),
            serverData: { answer: ans, solutionSteps: [
                { text: lang === 'sv' ? "Omkretsen är sträckan runt hela figuren. En rektangel har två baser och två höjder." : "Perimeter is the distance around the shape. It has two widths and two heights.", latex: "" },
                { text: lang === 'sv' ? "Addera alla fyra sidor." : "Add all four sides.", latex: `${w} + ${w} + ${h} + ${h} = \\mathbf{${ans}}` }
            ]}
        };
    }

    // Level 2: Area Rect
    private level2_AreaRect(lang: string): any {
        const w = MathUtils.randomInt(3, 12);
        const h = MathUtils.randomInt(2, 8);
        const ans = w * h;
        return {
            renderData: { geometry: { type: 'rectangle', width: w, height: h, labels: { width: w, height: h } }, description: lang === 'sv' ? "Beräkna arean." : "Calculate the area.", answerType: 'text' },
            token: Buffer.from(ans.toString()).toString('base64'),
            serverData: { answer: ans, solutionSteps: [
                { text: lang === 'sv' ? "Arean är hur stor yta figuren täcker. För en rektangel multiplicerar vi basen med höjden." : "Area is the surface coverage. Multiply base by height.", latex: "Area = b \\cdot h" },
                { latex: `${w} \\cdot ${h} = \\mathbf{${ans}}` }
            ]}
        };
    }

    // Level 3: Area Triangle
    private level3_AreaTriangle(lang: string): any {
        const b = MathUtils.randomInt(4, 14);
        const h = MathUtils.randomInt(2, 8) * 2;
        const ans = (b * h) / 2;
        const subtype = MathUtils.randomChoice(['right', 'isosceles']);
        return {
            renderData: { geometry: { type: 'triangle', subtype, width: b, height: h, labels: { base: b, height: h } }, description: lang === 'sv' ? "Beräkna arean." : "Calculate the area.", answerType: 'text' },
            token: Buffer.from(ans.toString()).toString('base64'),
            serverData: { answer: ans, solutionSteps: [
                { text: lang === 'sv' ? "En triangel är alltid hälften av en rektangel med samma bas och höjd." : "A triangle is half of a rectangle with the same base and height.", latex: "A = \\frac{b \\cdot h}{2}" },
                { text: lang === 'sv' ? "Multiplicera basen med höjden, dela sen med 2." : "Multiply base by height, then divide by 2.", latex: `\\frac{${b} \\cdot ${h}}{2} = \\mathbf{${ans}}` }
            ]}
        };
    }

    // Level 4: Circles
    private level4_Circles(lang: string): any {
        const r = MathUtils.randomInt(3, 10);
        const d = r * 2;
        const isArea = MathUtils.randomInt(0, 1) === 1;
        const showD = MathUtils.randomInt(0, 1) === 1;
        
        let ans = 0, desc = "", steps = [];
        if (isArea) {
            ans = Math.round(3.14 * r * r * 10) / 10;
            desc = lang === 'sv' ? "Beräkna arean (avrunda till 1 decimal)." : "Calculate area (round to 1 decimal).";
            if (showD) steps.push({ text: lang === 'sv' ? "Först måste vi hitta radien (r), som är hälften av diametern." : "First find the radius (r), which is half the diameter.", latex: `r = ${d}/2 = ${r}` });
            steps.push({ text: lang === 'sv' ? "Använd formeln för area:" : "Use the area formula:", latex: "A = \\pi \\cdot r^2" });
            steps.push({ latex: `3.14 \\cdot ${r}^2 \\approx \\mathbf{${ans}}` });
        } else {
            ans = Math.round(2 * 3.14 * r * 10) / 10;
            desc = lang === 'sv' ? "Beräkna omkretsen (avrunda till 1 decimal)." : "Calculate circumference (round to 1 decimal).";
            if (showD) {
                steps.push({ text: lang === 'sv' ? "Omkretsen är Pi gånger diametern." : "Circumference is Pi times diameter.", latex: `O = \\pi \\cdot d \\approx 3.14 \\cdot ${d}` });
            } else {
                steps.push({ text: lang === 'sv' ? "Omkretsen är 2 gånger Pi gånger radien." : "Circumference is 2 times Pi times radius.", latex: `O = 2 \\cdot \\pi \\cdot r \\approx 2 \\cdot 3.14 \\cdot ${r}` });
            }
            steps.push({ latex: `\\approx \\mathbf{${ans}}` });
        }

        return {
            renderData: { geometry: { type: 'circle', radius: r, labels: { val: showD ? `d=${d}` : `r=${r}` }, show: showD ? 'diameter' : 'radius' }, description: desc, answerType: 'text' },
            token: Buffer.from(ans.toString()).toString('base64'),
            serverData: { answer: ans, solutionSteps: steps }
        };
    }

    // Level 5: Composite
    private level5_Composite(lang: string): any {
        const type = MathUtils.randomChoice(['house', 'portal']);
        const w = 6, h = 5;
        let ans = 0, steps = [], geom: any = {};
        
        if (type === 'house') {
            const hRoof = 3;
            const aRect = w*h;
            const aTri = w*hRoof/2;
            ans = aRect + aTri;
            steps = [
                { text: lang === 'sv' ? "Dela upp figuren i en rektangel och en triangel." : "Split into a rectangle and a triangle.", latex: "" },
                { text: lang === 'sv' ? "Räkna ut arean för varje del och plussa ihop." : "Calculate area for each part and add together.", latex: `${aRect} + ${aTri} = \\mathbf{${ans}}` }
            ];
            geom = { type: 'composite', subtype: 'house', labels: { w, h, h_roof: hRoof } };
        } else {
            const r = w/2;
            const aRect = w*h;
            const aSemi = Math.round(3.14*r*r/2 * 10)/10;
            ans = Math.round((aRect + aSemi)*10)/10;
            steps = [
                { text: lang === 'sv' ? "Dela upp figuren i en rektangel och en halvcirkel." : "Split into a rectangle and a semicircle.", latex: "" },
                { latex: `${aRect} + ${aSemi} \\approx \\mathbf{${ans}}` }
            ];
            geom = { type: 'composite', subtype: 'portal', labels: { w, h } };
        }

        return {
            renderData: { geometry: geom, description: lang === 'sv' ? "Beräkna arean." : "Calculate area.", answerType: 'text' },
            token: Buffer.from(ans.toString()).toString('base64'),
            serverData: { answer: ans, solutionSteps: steps }
        };
    }
}