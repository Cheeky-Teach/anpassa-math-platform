import { MathUtils } from '../utils/MathUtils.js';

export class AlgebraicGeometryGenerator {
    
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        let questionData: any;

        switch (level) {
            case 1: questionData = this.perimeter_writeExpression(lang); break;
            case 2: questionData = this.perimeter_solveEquation(lang); break;
            case 3: questionData = this.area_writeExpression(lang); break;
            case 4: questionData = this.area_solveEquation(lang); break;
            case 5: questionData = this.angles_writeExpression(lang); break;
            case 6: questionData = this.angles_solveEquation(lang); break;
            default: questionData = this.perimeter_writeExpression(lang); break;
        }

        return questionData;
    }

    public generateByVariation(key: string, lang: string = 'sv', options: any = {}): any {
        let questionData: any;
        switch (key) {
            case 'perimeter_write': questionData = this.perimeter_writeExpression(lang); break;
            case 'perimeter_solve': questionData = this.perimeter_solveEquation(lang); break;
            case 'area_write': questionData = this.area_writeExpression(lang); break;
            case 'area_solve': questionData = this.area_solveEquation(lang); break;
            case 'angles_write': questionData = this.angles_writeExpression(lang); break;
            case 'angles_solve': questionData = this.angles_solveEquation(lang); break;
            default: questionData = this.perimeter_writeExpression(lang); break;
        }
        if (!questionData.metadata) questionData.metadata = {};
        questionData.metadata.variation_key = key;
        return questionData;
    }

    private toBase64(str: string): string {
        return Buffer.from(str, 'utf-8').toString('base64');
    }

    private getLabels(w: string, h: string, s: string = '') {
        return { 
            w, h, s, 
            b: w, base: w, width: w, bottom: w, top: w,
            height: h, left: h, right: h, 
            hyp: s, c: s, diagonal: s, slant: s,
            s1: s, s2: s,
            arc1: w, arc2: h
        };
    }

    // 🟢 NEW: Mathematical Term Formatting Engine
    private formatTerm(a: number, b: number): string {
        if (b === 0) return `${a}x`;
        return b > 0 ? `${a}x+${b}` : `${a}x-${Math.abs(b)}`;
    }

    // 🟢 NEW: Dynamic Expression Generator (Mixes Single and Double Terms)
    private genLinearTerm(minA = 2, maxA = 12, minB = 1, maxB = 15, allowNegative = true): { a: number, b: number, text: string } {
        const a = MathUtils.randomInt(minA, maxA);
        const useConst = Math.random() > 0.4; // 60% chance to have a second term (+ b)
        let b = 0;
        if (useConst) {
            b = MathUtils.randomInt(minB, maxB);
            if (allowNegative && Math.random() > 0.5) b = -b; // 50% chance to be negative (- b)
        }
        return { a, b, text: this.formatTerm(a, b) };
    }

    // 🟢 NEW: Trigonometry Engine for True-to-Math Dynamic Angles
    private calcPoint(cx: number, cy: number, radius: number, angleDeg: number) {
        const rad = (angleDeg * Math.PI) / 180;
        return {
            x: Math.round(cx + radius * Math.cos(-rad)),
            y: Math.round(cy + radius * Math.sin(-rad)) // Negative because SVG Y goes down
        };
    }

    // =========================================================================
    // LEVEL 1: Omkrets - Teckna uttryck
    // =========================================================================
    private perimeter_writeExpression(lang: string): any {
        const shapeChoice = MathUtils.randomInt(1, 4);
        let geom: any, ans: string, desc: string, clues: any[];

        desc = lang === 'sv' ? `Teckna ett förenklat uttryck för figurens omkrets.` : `Write a simplified expression for the figure's perimeter.`;

        if (shapeChoice === 1) { // Rectangle
            const w = this.genLinearTerm(2, 6, 1, 10);
            const h = this.genLinearTerm(2, 6, 1, 10);
            geom = { type: "rectangle", width: 200, height: 120, labels: this.getLabels(w.text, h.text) };
            ans = this.formatTerm(2 * w.a + 2 * h.a, 2 * w.b + 2 * h.b);
            clues = [
                { text: lang === 'sv' ? "Omkretsen är summan av figurens yttre sidor." : "The perimeter is the sum of all outer sides of a figure.", latex: `\\text{Omkrets} = \\text{sida}_1 + \\text{sida}_2 + \\text{sida}_3 + \\text{sida}_4` },
                { text: lang === 'sv' ? "Ställ upp summan för rektangelns fyra yttre sidor." : "Set up the sum for the four outer sides of the rectangle.", latex: `(${w.text}) + (${h.text}) + (${w.text}) + (${h.text})` },
                { text: lang === 'sv' ? "Sortera uttrycket genom att samla x-termer och sifferkonstanter var för sig." : "Group the expression by gathering x-terms and constants separately.", latex: `\\mathbf{${w.a}x + ${w.a}x + ${h.a}x + ${h.a}x} ${w.b !== 0 || h.b !== 0 ? `+ \\mathbf{(${2 * w.b + 2 * h.b})}` : ''}` },
                { text: lang === 'sv' ? "Förenkla för att få slutsvaret." : "Simplify to get the final answer.", latex: `\\mathbf{${ans}}` }
            ];
        } else if (shapeChoice === 2) { // Square
            const s = this.genLinearTerm(2, 8, 1, 12);
            geom = { type: "rectangle", subtype: "square", width: 150, height: 150, labels: this.getLabels(s.text, s.text, s.text) };
            ans = this.formatTerm(4 * s.a, 4 * s.b);
            clues = [
                { text: lang === 'sv' ? "En kvadrat har fyra sidor som är lika långa." : "A square has four sides of equal length.", latex: `\\text{Omkrets} = 4 \\cdot \\text{sidan}` },
                { text: lang === 'sv' ? "Ställ upp summan för kvadratens fyra sidor." : "Set up the sum for the four sides of the square.", latex: `(${s.text}) + (${s.text}) + (${s.text}) + (${s.text})` },
                { text: lang === 'sv' ? "Slå ihop termerna för att få det färdiga förenklade uttrycket." : "Combine the terms to get the final simplified expression.", latex: `\\mathbf{${ans}}` }
            ];
        } else if (shapeChoice === 3) { // Equilateral Triangle
            const s = this.genLinearTerm(2, 8, 1, 12);
            geom = { type: "triangle", subtype: "equilateral", width: 160, height: 140, labels: this.getLabels(s.text, "", "") };
            ans = this.formatTerm(3 * s.a, 3 * s.b);
            clues = [
                { text: lang === 'sv' ? "En liksidig triangel har tre sidor som är lika långa." : "An equilateral triangle has three identical sides.", latex: `\\text{Omkrets} = \\text{sida}_1 + \\text{sida}_2 + \\text{sida}_3` },
                { text: lang === 'sv' ? "Ställ upp summan för triangelns tre sidor." : "Set up the sum for the three sides of the triangle.", latex: `(${s.text}) + (${s.text}) + (${s.text})` },
                { text: lang === 'sv' ? "Förenkla uttrycket genom att slå ihop termerna." : "Simplify the expression by combining terms.", latex: `\\mathbf{${ans}}` }
            ];
        } else { // Right Triangle
            const s1 = this.genLinearTerm(2, 6, 1, 8);
            const s2 = this.genLinearTerm(2, 6, 1, 8);
            const s3 = this.genLinearTerm(2, 6, 1, 8);
            geom = { type: "triangle", subtype: "right", width: 180, height: 140, labels: this.getLabels(s1.text, s2.text, s3.text) };
            ans = this.formatTerm(s1.a + s2.a + s3.a, s1.b + s2.b + s3.b);
            clues = [
                { text: lang === 'sv' ? "Omkretsen får vi om vi adderar alla tre sidor." : "We get the perimeter by adding all three outer sides.", latex: `\\text{Omkrets} = \\text{sida}_1 + \\text{sida}_2 + \\text{sida}_3` },
                { text: lang === 'sv' ? "Sätt upp summan för de tre sidorna." : "Set up the sum for the three sides.", latex: `(${s1.text}) + (${s2.text}) + (${s3.text})` },
                { text: lang === 'sv' ? "Förenkla genom att slå ihop x-termer och sifferkonstanter." : "Simplify by combining all x-terms and constants.", latex: `\\mathbf{${ans}}` }
            ];
        }

        return {
            renderData: { geometry: geom, description: desc, answerType: "text", answer: ans },
            token: this.toBase64(ans), variationKey: "perimeter_write", type: "expression", clues: clues
        };
    }

    // =========================================================================
    // LEVEL 2: Omkrets - Lös ekvationen
    // =========================================================================
    private perimeter_solveEquation(lang: string): any {
        const shapeChoice = MathUtils.randomInt(1, 4);
        const targetX = MathUtils.randomInt(2, 12);
        let geom: any, ans: number = targetX, desc: string, clues: any[], totalP: number;

        // Force positive 'b' for equation solving to ensure clean, pedagogical steps without double negatives
        if (shapeChoice === 1) { // Rectangle
            const w = this.genLinearTerm(2, 6, 1, 15, false);
            const h = this.genLinearTerm(2, 6, 1, 15, false);
            totalP = 2 * (w.a * targetX + w.b) + 2 * (h.a * targetX + h.b);
            geom = { type: "rectangle", width: 200, height: 120, labels: this.getLabels(w.text, h.text) };
            desc = lang === 'sv' ? `Rektangelns omkrets är ${totalP} cm. Beräkna x.` : `The rectangle's perimeter is ${totalP} cm. Calculate x.`;
            
            const totalA = 2 * w.a + 2 * h.a;
            const totalB = 2 * w.b + 2 * h.b;

            clues = [
                { text: lang === 'sv' ? "Sätt upp ekvationen genom att addera rektangelns fyra sidor." : "Set up the equation by adding all four sides.", latex: `(${w.text}) + (${h.text}) + (${w.text}) + (${h.text}) = ${totalP}` },
                { text: lang === 'sv' ? "Förenkla uttrycket på vänster sida till en tvåstegsekvation:" : "Simplify the left side into a standard two-step equation:", latex: `${totalA}x + \\mathbf{${totalB}} = ${totalP}` },
                ...(totalB > 0 ? [{ text: lang === 'sv' ? `Steg 1: Ta bort siffertermen genom att subtrahera ${totalB} från båda sidor.` : `Step 1: Remove the constant by subtracting ${totalB} from both sides.`, latex: `${totalA}x = \\mathbf{${totalP - totalB}}` }] : []),
                { text: lang === 'sv' ? `Steg 2: Dela båda sidor med ${totalA}.` : `Step 2: Divide both sides by ${totalA}.`, latex: `x = \\mathbf{${targetX}}` }
            ];
        } else if (shapeChoice === 2) { // Square
            const s = this.genLinearTerm(2, 8, 1, 15, false);
            totalP = 4 * (s.a * targetX + s.b);
            geom = { type: "rectangle", subtype: "square", width: 150, height: 150, labels: this.getLabels(s.text, s.text, s.text) };
            desc = lang === 'sv' ? `Kvadratens omkrets är ${totalP} cm. Beräkna x.` : `The square's perimeter is ${totalP} cm. Calculate x.`;
            
            const totalB = 4 * s.b;
            
            clues = [
                { text: lang === 'sv' ? "En kvadrat har fyra lika långa sidor. Vi ställer upp ekvationen:" : "A square has four equal sides. We set up the equation:", latex: `4 \\cdot (${s.text}) = ${totalP}` },
                { text: lang === 'sv' ? "Förenkla vänster sida:" : "Simplify the left side:", latex: `${4 * s.a}x + \\mathbf{${totalB}} = ${totalP}` },
                ...(totalB > 0 ? [{ text: lang === 'sv' ? `Steg 1: Subtrahera ${totalB} från båda sidor.` : `Step 1: Subtract ${totalB} from both sides.`, latex: `${4 * s.a}x = \\mathbf{${totalP - totalB}}` }] : []),
                { text: lang === 'sv' ? `Dela med ${4 * s.a} på båda sidor för att lösa ut x.` : `Divide by ${4 * s.a} on both sides to solve for x.`, latex: `x = \\mathbf{${targetX}}` }
            ];
        } else { // Equilateral Triangle
            const s = this.genLinearTerm(2, 8, 1, 15, false);
            totalP = 3 * (s.a * targetX + s.b);
            geom = { type: "triangle", subtype: "equilateral", width: 160, height: 140, labels: this.getLabels(s.text, "", "") };
            desc = lang === 'sv' ? `En liksidig triangels omkrets är ${totalP} cm. Beräkna x.` : `The triangle's perimeter is ${totalP} cm. Calculate x.`;
            
            const totalB = 3 * s.b;

            clues = [
                { text: lang === 'sv' ? "En liksidig triangel har tre lika långa sidor. Ekvationen blir:" : "An equilateral triangle has three equal sides. The equation is:", latex: `3 \\cdot (${s.text}) = ${totalP}` },
                { text: lang === 'sv' ? "Förenkla uttrycket:" : "Simplify the expression:", latex: `${3 * s.a}x + \\mathbf{${totalB}} = ${totalP}` },
                ...(totalB > 0 ? [{ text: lang === 'sv' ? `Steg 1: Subtrahera ${totalB} från båda sidor.` : `Step 1: Subtract ${totalB} from both sides.`, latex: `${3 * s.a}x = \\mathbf{${totalP - totalB}}` }] : []),
                { text: lang === 'sv' ? `Dela med ${3 * s.a} på båda sidor.` : `Divide by ${3 * s.a} on both sides.`, latex: `x = \\mathbf{${targetX}}` }
            ];
        }

        return {
            renderData: { geometry: geom, description: desc, answerType: "numeric", answer: ans },
            token: this.toBase64(ans.toString()), variationKey: "perimeter_solve", type: "calculate", clues: clues
        };
    }

    // =========================================================================
    // LEVEL 3: Area - Teckna uttryck
    // =========================================================================
    private area_writeExpression(lang: string): any {
        const shapeChoice = MathUtils.randomInt(1, 3);
        let geom: any, ans: string, desc: string, clues: any[];

        desc = lang === 'sv' ? `Teckna ett förenklat uttryck för figurens area.` : `Write a simplified expression for the figure's area.`;

        // 🟢 FIX: To prevent generating powers higher than 1 (x^2), the height is forced to be a pure scalar constant.
        if (shapeChoice === 1) { // Rectangle
            const base = this.genLinearTerm(2, 8, 1, 10);
            const heightC = MathUtils.randomInt(3, 12);
            geom = { type: "rectangle", width: 200, height: 120, labels: this.getLabels(base.text, `${heightC}`) };
            ans = this.formatTerm(base.a * heightC, base.b * heightC);
            clues = [
                { text: lang === 'sv' ? "Rektangelns area är basen multiplicerat med höjden." : "The rectangle's area is base multiplied by height.", latex: `\\text{Area} = \\text{basen} \\cdot \\text{höjden}` },
                { text: lang === 'sv' ? "Sätt in sidornas värden. Använd parentes runt uttrycket:" : "Insert the values. Use parentheses around the expression:", latex: `\\text{Area} = (${base.text}) \\cdot ${heightC}` },
                { text: lang === 'sv' ? `Multiplicera in ${heightC} med varje term inuti parentesen:` : `Distribute ${heightC} into each term inside the parentheses:`, latex: `\\text{Area} = \\mathbf{${heightC * base.a}x} ${base.b !== 0 ? (base.b > 0 ? `+ \\mathbf{${heightC * base.b}}` : `- \\mathbf{${Math.abs(heightC * base.b)}}`) : ''}` },
                { text: lang === 'sv' ? "Förenkla:" : "Simplify:", latex: `\\text{Area} = \\mathbf{${ans}}` }
            ];
        } else { // Right Triangle
            const base = this.genLinearTerm(2, 6, 1, 10);
            const heightC = MathUtils.randomInt(2, 8) * 2; // Always even so division by 2 is mathematically clean
            geom = { type: "triangle", subtype: "right", width: 180, height: 140, labels: this.getLabels(base.text, `${heightC}`) };
            ans = this.formatTerm((base.a * heightC) / 2, (base.b * heightC) / 2);
            clues = [
                { text: lang === 'sv' ? "Triangelns area är (basen * höjden) / 2." : "The triangle's area is (base * height) / 2.", latex: `\\text{Area} = \\frac{\\text{basen} \\cdot \\text{höjden}}{2}` },
                { text: lang === 'sv' ? "Sätt in kända värden i formeln:" : "Insert the values into the formula:", latex: `\\text{Area} = \\frac{(${base.text}) \\cdot ${heightC}}{2}` },
                { text: lang === 'sv' ? "Multiplicera ihop faktorerna i täljaren först:" : "Multiply the factors in the numerator first:", latex: `\\text{Area} = \\frac{${heightC * base.a}x ${base.b !== 0 ? (base.b > 0 ? `+ ${heightC * base.b}` : `- ${Math.abs(heightC * base.b)}`) : ''}}{2}` },
                { text: lang === 'sv' ? "Dela alla termer med 2:" : "Divide all terms by 2:", latex: `\\text{Area} = \\mathbf{${ans}}` }
            ];
        }

        return {
            renderData: { geometry: geom, description: desc, answerType: "text", answer: ans },
            token: this.toBase64(ans), variationKey: "area_write", type: "expression", clues: clues
        };
    }

    // =========================================================================
    // LEVEL 4: Area - Lös ekvationen
    // =========================================================================
    private area_solveEquation(lang: string): any {
        const shapeChoice = MathUtils.randomInt(1, 3);
        const targetX = MathUtils.randomInt(2, 12);
        let geom: any, ans: number = targetX, desc: string, clues: any[], totalA: number;

        if (shapeChoice === 1) { // Rectangle
            const base = this.genLinearTerm(2, 8, 1, 15, false); // Positive B for solving
            const heightC = MathUtils.randomInt(3, 10);
            totalA = heightC * (base.a * targetX + base.b);
            geom = { type: "rectangle", width: 200, height: 120, labels: this.getLabels(base.text, `${heightC}`) };
            desc = lang === 'sv' ? `Rektangelns area är ${totalA} cm². Beräkna x.` : `The rectangle's area is ${totalA} cm². Calculate x.`;
            
            const areaConstant = heightC * base.b;

            clues = [
                { text: lang === 'sv' ? "Area beräknas som basen gånger höjden. Ekvationen blir:" : "Area is base times height. The equation is:", latex: `${heightC} \\cdot (${base.text}) = ${totalA}` },
                { text: lang === 'sv' ? `Multiplicera in höjden ${heightC} inuti parentesen:` : `Multiply the height ${heightC} inside the parentheses:`, latex: `${heightC * base.a}x + \\mathbf{${areaConstant}} = ${totalA}` },
                ...(areaConstant > 0 ? [{ text: lang === 'sv' ? `Subtrahera ${areaConstant} från båda sidor.` : `Subtract ${areaConstant} from both sides.`, latex: `${heightC * base.a}x = \\mathbf{${totalA - areaConstant}}` }] : []),
                { text: lang === 'sv' ? `Dela båda sidor med ${heightC * base.a}.` : `Divide both sides by ${heightC * base.a}.`, latex: `x = \\mathbf{${targetX}}` }
            ];
        } else { // Right Triangle
            const base = this.genLinearTerm(2, 8, 1, 15, false);
            const heightC = MathUtils.randomInt(2, 8) * 2; 
            totalA = (heightC * (base.a * targetX + base.b)) / 2;
            geom = { type: "triangle", subtype: "right", width: 180, height: 140, labels: this.getLabels(base.text, `${heightC}`) };
            desc = lang === 'sv' ? `Triangelns area är ${totalA} cm². Beräkna x.` : `The triangle's area is ${totalA} cm². Calculate x.`;
            
            const reducedHeight = heightC / 2;
            const areaConstant = reducedHeight * base.b;

            clues = [
                { text: lang === 'sv' ? "Area för en triangel är (basen * höjden) / 2. Vi ställer upp ekvationen:" : "Area for a triangle is (base * height) / 2. We construct the equation:", latex: `\\frac{(${base.text}) \\cdot ${heightC}}{2} = ${totalA}` },
                { text: lang === 'sv' ? `Det är lättast att dividera höjden (${heightC}) med 2 direkt:` : `It is easiest to divide the height (${heightC}) by 2 right away:`, latex: `(${base.text}) \\cdot \\mathbf{${reducedHeight}} = ${totalA}` },
                { text: lang === 'sv' ? `Multiplicera in ${reducedHeight} i parentesen:` : `Multiply ${reducedHeight} into the parentheses:`, latex: `${reducedHeight * base.a}x + \\mathbf{${areaConstant}} = ${totalA}` },
                ...(areaConstant > 0 ? [{ text: lang === 'sv' ? `Subtrahera ${areaConstant} från båda sidor.` : `Subtract ${areaConstant} from both sides.`, latex: `${reducedHeight * base.a}x = \\mathbf{${totalA - areaConstant}}` }] : []),
                { text: lang === 'sv' ? `Dela med ${reducedHeight * base.a} för att lösa ut x.` : `Divide by ${reducedHeight * base.a} to solve for x.`, latex: `x = \\mathbf{${targetX}}` }
            ];
        }

        return {
            renderData: { geometry: geom, description: desc, answerType: "numeric", answer: ans },
            token: this.toBase64(ans.toString()), variationKey: "area_solve", type: "calculate", clues: clues
        };
    }

    // =========================================================================
    // LEVEL 5: Vinklar - Teckna uttryck
    // =========================================================================
    private angles_writeExpression(lang: string): any {
        const t1 = this.genLinearTerm(2, 8, 1, 15);
        const t2 = this.genLinearTerm(2, 8, 1, 15);
        const ans = this.formatTerm(t1.a + t2.a, t1.b + t2.b);
        
        // 🟢 FIX: Generate a completely arbitrary total visual angle (e.g. 110°) so students don't falsely assume it mathematically equals exactly 90 or 180.
        let totalVisDeg = MathUtils.randomChoice([70, 80, 100, 110, 120, 130, 140]);
        const angle1VisDeg = MathUtils.randomInt(25, totalVisDeg - 25);
        
        const pt1 = this.calcPoint(150, 180, 100, angle1VisDeg);
        const pt2 = this.calcPoint(150, 180, 100, totalVisDeg);

        const geomConfig = { 
            type: "angle", subtype: "adjacent", angle: totalVisDeg, 
            lines: [
                { x1: 150, y1: 180, x2: 250, y2: 180 }, 
                { x1: 150, y1: 180, x2: pt1.x, y2: pt1.y }, 
                { x1: 150, y1: 180, x2: pt2.x, y2: pt2.y }
            ],
            arcs: [
                { center: { x: 150, y: 180 }, startAngle: 0, endAngle: angle1VisDeg, radius: 45, label: `${t1.text}°`, color: "rgba(16, 185, 129, 0.15)", stroke: "#10b981" }, 
                { center: { x: 150, y: 180 }, startAngle: angle1VisDeg, endAngle: totalVisDeg, radius: 45, label: `${t2.text}°`, color: "rgba(59, 130, 246, 0.15)", stroke: "#3b82f6" }
            ],
            labels: [] 
        };

        const desc = lang === 'sv' ? "Teckna ett förenklat uttryck för de två vinklarnas sammanlagda summa." : "Write a simplified expression for the sum of the two angles.";
        const clues = [
            { text: lang === 'sv' ? "För att beräkna hela vinkeln adderar vi delarna." : "To get the combined angle, add the parts together.", latex: `\\text{Total vinkel} = \\text{vinkel}_1 + \\text{vinkel}_2` },
            { text: lang === 'sv' ? "Sätt in vinklarnas uttryck i summan:" : "Insert the sub-angle expressions:", latex: `(${t1.text}) + (${t2.text})` },
            { text: lang === 'sv' ? "Förenkla genom att slå ihop x-termer och sifferkonstanter:" : "Simplify by grouping x-terms and constants:", latex: `\\mathbf{${ans}}` }
        ];

        return {
            renderData: { geometry: geomConfig, description: desc, answerType: "text", answer: ans },
            token: this.toBase64(ans), variationKey: "angles_write", type: "expression", clues: clues
        };
    }

    // =========================================================================
    // LEVEL 6: Vinklar - Lös ekvationen
    // =========================================================================
    private angles_solveEquation(lang: string): any {
        const visualChoice = MathUtils.randomInt(1, 3);
        const totalDeg = visualChoice === 1 ? 90 : 180;
        
        const targetX = MathUtils.randomInt(5, 15);
        let t1 = { a: 0, b: 0, text: "" };
        let angle1Deg = 0;
        
        // 🟢 FIX: Ensure mathematical reality matches visual proportions exactly
        while (angle1Deg <= 20 || angle1Deg >= totalDeg - 20) {
            t1 = this.genLinearTerm(2, 6, 0, 20, false); // allow b=0 for pure "2x"
            angle1Deg = t1.a * targetX + t1.b;
        }
        
        const angle2Deg = totalDeg - angle1Deg;
        
        // 🟢 FIX: Randomly swap which slice gets the variable to ensure variety
        const swap = Math.random() > 0.5;
        const slice1Size = swap ? angle2Deg : angle1Deg;
        const slice2Size = swap ? angle1Deg : angle2Deg;
        const label1 = swap ? `${angle2Deg}°` : `${t1.text}°`;
        const label2 = swap ? `${t1.text}°` : `${angle2Deg}°`;

        const pt1 = this.calcPoint(150, 180, 100, slice1Size);
        let pt2;

        let geomConfig: any;
        if (visualChoice === 1) { 
            pt2 = this.calcPoint(150, 180, 100, 90);
            geomConfig = { 
                type: "angle", subtype: "adjacent", angle: 90, 
                lines: [
                    { x1: 150, y1: 180, x2: 250, y2: 180 }, 
                    { x1: 150, y1: 180, x2: pt1.x, y2: pt1.y }, 
                    { x1: 150, y1: 180, x2: pt2.x, y2: pt2.y }
                ],
                arcs: [
                    { center: { x: 150, y: 180 }, startAngle: 0, endAngle: slice1Size, radius: 40, label: label1, color: "rgba(16, 185, 129, 0.15)", stroke: "#10b981" }, 
                    { center: { x: 150, y: 180 }, startAngle: slice1Size, endAngle: 90, radius: 40, label: label2, color: "rgba(59, 130, 246, 0.15)", stroke: "#3b82f6" }
                ],
                labels: []
            };
        } else { 
            pt2 = this.calcPoint(150, 180, 100, 180);
            geomConfig = { 
                type: "angle", subtype: "supplementary", angle: 180, 
                lines: [
                    { x1: 40, y1: 180, x2: 260, y2: 180 }, // Complete straight baseline
                    { x1: 150, y1: 180, x2: pt1.x, y2: pt1.y } // Dividing ray
                ],
                arcs: [
                    { center: { x: 150, y: 180 }, startAngle: 0, endAngle: slice1Size, radius: 40, label: label1, color: "rgba(16, 185, 129, 0.15)", stroke: "#10b981" }, 
                    { center: { x: 150, y: 180 }, startAngle: slice1Size, endAngle: 180, radius: 40, label: label2, color: "rgba(59, 130, 246, 0.15)", stroke: "#3b82f6" }
                ],
                labels: []
            };
        }

        const desc = lang === 'sv' ? `Vinklarna bildar tillsammans ${totalDeg}°. Beräkna x.` : `The angles together form ${totalDeg}°. Calculate x.`;
        
        const clues = [
            { text: lang === 'sv' ? `Vinklarna bildar tillsammans vinkelsumman ${totalDeg}°.` : `The angles sum to ${totalDeg}°.`, latex: `${t1.text} + ${angle2Deg} = ${totalDeg}` },
            { text: lang === 'sv' ? `Förenkla genom att slå ihop siffrorna:` : `Simplify by grouping the constants:`, latex: `${t1.a}x + \\mathbf{${t1.b + angle2Deg}} = ${totalDeg}` },
            { text: lang === 'sv' ? `Subtrahera ${t1.b + angle2Deg} från båda sidor:` : `Subtract ${t1.b + angle2Deg} from both sides:`, latex: `${t1.a}x = \\mathbf{${totalDeg - (t1.b + angle2Deg)}}` },
            { text: lang === 'sv' ? `Dela med ${t1.a} för att lösa ekvationen.` : `Divide by ${t1.a} to solve the equation.`, latex: `x = \\mathbf{${targetX}}` }
        ];

        return {
            renderData: { geometry: geomConfig, description: desc, answerType: "numeric", answer: targetX },
            token: this.toBase64(targetX.toString()), variationKey: "angles_solve", type: "calculate", clues: clues
        };
    }
}