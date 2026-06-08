import { MathUtils } from '../utils/MathUtils.js';

export class AlgebraicGeometryGenerator {
    
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        let questionData: any;

        switch (level) {
            // --- SEGMENT 1: PERIMETER BASICS ---
            case 1: questionData = this.perimeter_writeExpression(lang); break;
            case 2: questionData = this.perimeter_solveEquation(lang); break;

            // --- SEGMENT 2: AREA BASICS ---
            case 3: questionData = this.area_writeExpression(lang); break;
            case 4: questionData = this.area_solveEquation(lang); break;

            // --- SEGMENT 3: TRIANGLES & ANGLES ---
            case 5: questionData = this.angles_writeExpression(lang); break;
            case 6: questionData = this.angles_solveEquation(lang); break;

            // 🟢 FIXED: Levels 7 and 8 removed completely to focus on the optimized 6-level layout track
            default: questionData = this.perimeter_writeExpression(lang); break;
        }

        return questionData;
    }

    private toBase64(str: string): string {
        return btoa(unescape(encodeURIComponent(str)));
    }

    // Comprehensive label mapping matrix matching GeometryShapes.jsx expectations
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

    // =========================================================================
    // LEVEL 1: Omkrets - Teckna uttryck (Rectangles, Squares, Triangles)
    // =========================================================================
    private perimeter_writeExpression(lang: string): any {
        const shapeChoice = MathUtils.randomInt(1, 4);
        let geom: any, ans: string, desc: string, clues: any[];

        desc = lang === 'sv' ? `Teckna ett förenklat uttryck för figurens omkrets.` : `Write a simplified expression for the figure's perimeter.`;

        if (shapeChoice === 1) { // Rectangle
            const a = MathUtils.randomInt(2, 5); // 🟢 Downscaled bounds
            const b = MathUtils.randomInt(3, 12);
            const wText = `${a}x`;
            const hText = `${b}`;
            geom = { type: "rectangle", width: 200, height: 120, labels: this.getLabels(wText, hText) };
            ans = `${2*a}x+${2*b}`;
            clues = [
                { text: lang === 'sv' ? "Omkretsen är den totala sträckan runt en figurs alla sidor." : "Perimeter is the total distance around all sides of a figure." },
                { text: lang === 'sv' ? "Steg 1: Addera alla rektangelns fyra sidor tillsammans:" : "Step 1: Add all four sides of the rectangle together:", latex: `${wText} + ${wText} + ${hText} + ${hText}` },
                { text: lang === 'sv' ? "Nu förenklar vi genom att lägga ihop x-termerna för sig och talen för sig:" : "Now we simplify by combining x-terms and numbers separately:", latex: `${ans}` }
            ];
        } else if (shapeChoice === 2) { // Square
            const a = MathUtils.randomInt(2, 4);
            const b = MathUtils.randomInt(1, 6);
            const sText = `${a}x+${b}`;
            geom = { type: "rectangle", subtype: "square", width: 150, height: 150, labels: this.getLabels(sText, sText, sText) };
            ans = `${4*a}x+${4*b}`;
            
            // 🟢 REFACTORED CLUES: Replaced multiplication with simple, explicit side addition
            clues = [
                { text: lang === 'sv' ? "En kvadrat har fyra sidor som alla är lika långa." : "A square has four sides that are all the same length." },
                { text: lang === 'sv' ? "Steg 1: Addera alla fyra sidor tillsammans:" : "Step 1: Add all four sides together:", latex: `${sText} + ${sText} + ${sText} + ${sText}` },
                { text: lang === 'sv' ? "Nu förenklar vi genom att lägga ihop x-termerna för sig och talen för sig:" : "Now we simplify by combining x-terms and numbers separately:", latex: `${ans}` }
            ];
        } else if (shapeChoice === 3) { // Equilateral Triangle
            const a = MathUtils.randomInt(2, 6);
            const sText = `${a}x`;
            geom = { type: "triangle", subtype: "equilateral", width: 160, height: 140, labels: this.getLabels(sText, "", sText) };
            ans = `${3*a}x`;
            
            // 🟢 REFACTORED CLUES: Replaced multiplication with simple, explicit side addition
            clues = [
                { text: lang === 'sv' ? "En liksidig triangel har tre sidor som alla är lika långa." : "An equilateral triangle has three sides that are all the same length." },
                { text: lang === 'sv' ? "Steg 1: Addera alla tre sidor tillsammans:" : "Step 1: Add all three sides together:", latex: `${sText} + ${sText} + ${sText}` },
                { text: lang === 'sv' ? "Förenklat uttryck:" : "Simplified expression:", latex: `${ans}` }
            ];
        } else { // Right Triangle
            const a = MathUtils.randomInt(2, 4);
            const b = MathUtils.randomInt(2, 5);
            const c = MathUtils.randomInt(2, 6);
            geom = { type: "triangle", subtype: "right", width: 180, height: 140, labels: this.getLabels(`${a}x`, `${b}x`, `${c}x`) };
            ans = `${a+b+c}x`;
            clues = [
                { text: lang === 'sv' ? "Omkretsen får vi om vi plussar ihop alla triangelns tre sidor." : "We get the perimeter by adding all three sides of the triangle together." },
                { text: lang === 'sv' ? "Steg 1: Addera de tre sidorna:" : "Step 1: Add the three sides together:", latex: `${a}x + ${b}x + ${c}x` },
                { text: lang === 'sv' ? "Slå ihop x-termerna till ett enda svar:" : "Combine the x-terms into a single final answer:", latex: `${ans}` }
            ];
        }

        return {
            renderData: { geometry: geom, description: desc, answerType: "text", answer: ans },
            token: this.toBase64(ans), variationKey: "perimeter_write", type: "expression", clues: clues
        };
    }

    // =========================================================================
    // LEVEL 2: Omkrets - Lös ekvationen (Concise Step-by-Step LaTeX)
    // =========================================================================
    private perimeter_solveEquation(lang: string): any {
        const shapeChoice = MathUtils.randomInt(1, 4);
        const targetX = MathUtils.randomInt(2, 8); // 🟢 Student-friendly concise target values
        let geom: any, ans: number = targetX, desc: string, clues: any[], totalP: number;

        if (shapeChoice === 1) { // Rectangle
            const a = MathUtils.randomInt(1, 4);
            const b = MathUtils.randomInt(2, 8);
            const wText = `x+${a}`;
            const hText = `${b}`;
            totalP = 2*(targetX + a) + 2*b;
            geom = { type: "rectangle", width: 200, height: 120, labels: this.getLabels(wText, hText) };
            desc = lang === 'sv' ? `Rektangelns omkrets är ${totalP} cm. Beräkna x.` : `The rectangle's perimeter is ${totalP} cm. Calculate x.`;
            
            // 🟢 REFACTORED CLUES: Modeled exactly after LinearEquationGen.ts tracks
            clues = [
                { text: lang === 'sv' ? "En tvåstegsekvation löses i två tydliga steg." : "A two-step equation is solved in two clear steps." },
                { text: lang === 'sv' ? "Sätt upp ekvationen utifrån omkretsen (2 baser + 2 höjder):" : "Set up the equation using the perimeter (2 bases + 2 heights):", latex: `2(x + ${a}) + 2(${b}) = ${totalP}` },
                { text: lang === 'sv' ? "Multiplicera in i parentesen och förenkla siffrorna:" : "Distribute into the parenthesis and simplify the numbers:", latex: `2x + ${2*a} + ${2*b} = ${totalP} \\rightarrow 2x + ${2*a + 2*b} = ${totalP}` },
                { text: lang === 'sv' ? `Steg 1: Flytta ${2*a + 2*b} genom att subtrahera det från båda sidor.` : `Step 1: Move ${2*a + 2*b} by subtracting it from both sides.`, latex: `${totalP} - ${2*a + 2*b} = ${totalP - (2*a + 2*b)}` },
                { text: lang === 'sv' ? "Nu har vi ekvationen:" : "Now we have the equation:", latex: `2x = ${totalP - (2*a + 2*b)}` },
                { text: lang === 'sv' ? "Steg 2: Dela med 2 på båda sidor för att få fram x." : "Step 2: Divide by 2 on both sides to find x.", latex: `\\frac{${totalP - (2*a + 2*b)}}{2} = ${targetX}` },
                { text: lang === 'sv' ? `Svar: x = ${targetX}` : `Answer: x = ${targetX}` }
            ];
        } else if (shapeChoice === 2) { // Square
            const a = MathUtils.randomInt(2, 4);
            const sText = `${a}x`;
            totalP = 4 * a * targetX;
            geom = { type: "rectangle", subtype: "square", width: 150, height: 150, labels: this.getLabels(sText, sText, sText) };
            desc = lang === 'sv' ? `Kvadratens omkrets är ${totalP} cm. Beräkna x.` : `The square's perimeter is ${totalP} cm. Calculate x.`;
            
            // 🟢 REFACTORED CLUES: Breaks equation down into initial raw additions before aggregating the linear equation balance
            clues = [
                { text: lang === 'sv' ? "En kvadrat har fyra sidor som alla är lika långa." : "A square has four sides that are all the same length." },
                { text: lang === 'sv' ? "Sätt upp ekvationen genom att addera alla fyra sidor:" : "Set up the equation by adding all four sides:", latex: `${sText} + ${sText} + ${sText} + ${sText} = ${totalP}` },
                { text: lang === 'sv' ? "Förenkla vänster sida genom att slå ihop x-termerna:" : "Simplify the left side by combining the x-terms:", latex: `${4*a}x = ${totalP}` },
                { text: lang === 'sv' ? `Steg 1: Dela med ${4*a} på båda sidor för att få x ensamt.` : `Step 1: Divide by ${4*a} on both sides to isolate x.`, latex: `x = \\frac{${totalP}}{${4*a}} = ${targetX}` },
                { text: lang === 'sv' ? `Svar: x = ${targetX}` : `Answer: x = ${targetX}` }
            ];
        } else { // Equilateral Triangle
            const a = MathUtils.randomInt(2, 4);
            const b = MathUtils.randomInt(1, 5);
            const sText = `${a}x+${b}`;
            totalP = 3 * (a * targetX + b);
            geom = { type: "triangle", subtype: "equilateral", width: 160, height: 140, labels: this.getLabels(sText, "", "") };
            desc = lang === 'sv' ? `En liksidig triangels omkrets är ${totalP} cm. Beräkna x.` : `The triangle's perimeter is ${totalP} cm. Calculate x.`;
            
            // 🟢 REFACTORED CLUES: Erased distributive law dependencies. Aggregates terms row-by-row on step 2 cleanly
            clues = [
                { text: lang === 'sv' ? "En liksidig triangel har tre sidor som alla är lika långa." : "An equilateral triangle has three sides that are all the same length." },
                { text: lang === 'sv' ? "Sätt upp ekvationen genom att addera alla tre sidor:" : "Set up the equation by adding all three sides:", latex: `${sText} + ${sText} + ${sText} = ${totalP}` },
                { text: lang === 'sv' ? "Förenkla vänster sida genom att lägga ihop x-termerna för sig och talen för sig:" : "Simplify the left side by combining x-terms and numbers separately:", latex: `${3*a}x + ${3*b} = ${totalP}` },
                { text: lang === 'sv' ? `Steg 1: Flytta ${3*b} genom att subtrahera det från båda sidor.` : `Step 1: Move ${3*b} by subtracting it from both sides.`, latex: `${totalP} - ${3*b} = ${totalP - 3*b}` },
                { text: lang === 'sv' ? "Nu har vi ekvationen:" : "Now we have the equation:", latex: `${3*a}x = ${totalP - 3*b}` },
                { text: lang === 'sv' ? `Steg 2: Dela med ${3*a} på båda sidor för att få fram x.` : `Step 2: Divide by ${3*a} on both sides to find x.`, latex: `x = \\frac{${totalP - 3*b}}{${3*a}} = ${targetX}` },
                { text: lang === 'sv' ? `Svar: x = ${targetX}` : `Answer: x = ${targetX}` }
            ];
        }

        return {
            renderData: { geometry: geom, description: desc, answerType: "numeric", answer: ans },
            token: this.toBase64(ans.toString()), variationKey: "perimeter_solve", type: "calculate", clues: clues
        };
    }

    // =========================================================================
    // LEVEL 3: Area - Teckna uttryck (Strictly Linear)
    // =========================================================================
    private area_writeExpression(lang: string): any {
        const shapeChoice = MathUtils.randomInt(1, 3);
        let geom: any, ans: string, desc: string, clues: any[];

        desc = lang === 'sv' ? `Teckna ett förenklat uttryck för figurens area.` : `Write a simplified expression for the figure's area.`;

        if (shapeChoice === 1) { // Rectangle
            const a = MathUtils.randomInt(2, 5);
            const b = MathUtils.randomInt(1, 5);
            const c = MathUtils.randomInt(2, 6); // 🟢 Maintained as scalar scalar constants to block x^2 development
            const wText = `${a}x+${b}`;
            const hText = `${c}`;
            geom = { type: "rectangle", width: 200, height: 120, labels: this.getLabels(wText, hText) };
            ans = `${a*c}x+${b*c}`;
            clues = [
                { text: lang === 'sv' ? "Rektangelns area beräknas genom att multiplicera basen med höjden." : "The area of a rectangle is found by multiplying the base by the height." },
                { text: lang === 'sv' ? "Multiplicera ihop sidorna och använd parentes för uttrycket:" : "Multiply the sides together and use parentheses for the expression:", latex: `${c} \\cdot (${a}x + ${b})` },
                { text: lang === 'sv' ? "Multiplicera in konstanten i parentesen för att få svaret:" : "Distribute the constant into the parentheses to get the answer:", latex: `${ans}` }
            ];
        } else { // Right Triangle
            const a = MathUtils.randomInt(2, 4);
            const c = MathUtils.randomInt(2, 5) * 2; // Clean even constants for nice divisions
            const wText = `${a}x`;
            const hText = `${c}`;
            geom = { type: "triangle", subtype: "right", width: 180, height: 140, labels: this.getLabels(wText, hText) };
            ans = `${(a*c)/2}x`;
            clues = [
                { text: lang === 'sv' ? "Triangelns area beräknas med formeln: (basen * höjden) / 2." : "The area of a triangle is found using the formula: (base * height) / 2." },
                { text: lang === 'sv' ? "Sätt in sidornas värden i formeln:" : "Insert the side values into the formula:", latex: `\\frac{${a}x \\cdot ${c}}{2}` },
                { text: lang === 'sv' ? "Förenkla täljaren och dela sedan med 2:" : "Simplify the numerator and then divide by 2:", latex: `\\frac{${a*c}x}{2} = ${ans}` }
            ];
        }

        return {
            renderData: { geometry: geom, description: desc, answerType: "text", answer: ans },
            token: this.toBase64(ans), variationKey: "area_write", type: "expression", clues: clues
        };
    }

    // =========================================================================
    // LEVEL 4: Area - Lös ekvationen (Step-by-Step LaTeX Clues)
    // =========================================================================
    private area_solveEquation(lang: string): any {
        const shapeChoice = MathUtils.randomInt(1, 3);
        const targetX = MathUtils.randomInt(2, 10);
        let geom: any, ans: number = targetX, desc: string, clues: any[], totalA: number;

        if (shapeChoice === 1) { // Rectangle
            const a = MathUtils.randomInt(2, 6);
            const c = MathUtils.randomInt(2, 6);
            const wText = `x+${a}`;
            const hText = `${c}`;
            totalA = c * (targetX + a);
            geom = { type: "rectangle", width: 200, height: 120, labels: this.getLabels(wText, hText) };
            desc = lang === 'sv' ? `Rektangelns area är ${totalA} cm². Beräkna x.` : `The rectangle's area is ${totalA} cm². Calculate x.`;
            
            clues = [
                { text: lang === 'sv' ? "Area beräknas som basen gånger höjden. Vi ställer upp ekvationen:" : "Area is calculated as base times height. We set up the equation:", latex: `${c} \\cdot (x + ${a}) = ${totalA}` },
                { text: lang === 'sv' ? "Multiplicera in i parentesen:" : "Distribute into the parentheses:", latex: `${c}x + ${c*a} = ${totalA}` },
                { text: lang === 'sv' ? `Steg 1: Subtrahera siffertermen ${c*a} från båda sidor.` : `Step 1: Subtract the constant term ${c*a} from both sides.`, latex: `${totalA} - ${c*a} = ${totalA - (c*a)}` },
                { text: lang === 'sv' ? "Nu har vi ekvationen:" : "Now we have the equation:", latex: `${c}x = ${totalA - (c*a)}` },
                { text: lang === 'sv' ? `Steg 2: Dela med ${c} på båda sidor för att få fram x.` : `Step 2: Divide by ${c} on both sides to find x.`, latex: `x = \\frac{${totalA - (c*a)}}{${c}} = ${targetX}` },
                { text: lang === 'sv' ? `Svar: x = ${targetX}` : `Answer: x = ${targetX}` }
            ];
        } else { // Right Triangle
            const a = MathUtils.randomInt(2, 4);
            const c = MathUtils.randomInt(2, 5) * 2; 
            totalA = (a * targetX * c) / 2;
            geom = { type: "triangle", subtype: "right", width: 180, height: 140, labels: this.getLabels(`${a}x`, `${c}`) };
            desc = lang === 'sv' ? `Triangelns area är ${totalA} cm². Beräkna x.` : `The triangle's area is ${totalA} cm². Calculate x.`;
            
            clues = [
                { text: lang === 'sv' ? "Area för en triangel är (basen * höjden) / 2. Vi ställer upp ekvationen:" : "Area for a triangle is (base * height) / 2. We set up the equation:", latex: `\\frac{${a}x \\cdot ${c}}{2} = ${totalA}` },
                { text: lang === 'sv' ? "Förenkla bråket på vänster sida genom att utföra täljarmultiplikationen och dela med 2:" : "Simplify the fraction on the left side by multiplying the numerator and dividing by 2:", latex: `\\frac{${a*c}x}{2} = ${totalA} \\rightarrow ${(a*c)/2}x = ${totalA}` },
                { text: lang === 'sv' ? `Steg 1: Dela med x-koefficienten ${(a*c)/2} på båda sidor för att få fram x.` : `Step 1: Divide both sides by the x-coefficient ${(a*c)/2} to solve for x.`, latex: `x = \\frac{${totalA}}{${(a*c)/2}} = ${targetX}` },
                { text: lang === 'sv' ? `Svar: x = ${targetX}` : `Answer: x = ${targetX}` }
            ];
        }

        return {
            renderData: { geometry: geom, description: desc, answerType: "numeric", answer: ans },
            token: this.toBase64(ans.toString()), variationKey: "area_solve", type: "calculate", clues: clues
        };
    }

    // =========================================================================
    // LEVEL 5: Vinklar - Teckna uttryck (Alternating Subtypes)
    // =========================================================================
    private angles_writeExpression(lang: string): any {
        const visualChoice = MathUtils.randomInt(1, 3); 
        const xCoeff = MathUtils.randomInt(2, 6);
        const constant = MathUtils.randomInt(10, 50); 
        const angle1Text = `${xCoeff}x`;
        const angle2Text = `${constant}°`;
        const ans = `${xCoeff}x+${constant}`;
        
        let geomConfig: any;
        if (visualChoice === 1) { // 3-Ray Acute Corner Layout Split
            geomConfig = { 
                type: "angle", subtype: "adjacent", angle: 120, 
                lines: [{ x1: 150, y1: 170, x2: 260, y2: 170 }, { x1: 150, y1: 170, x2: 234, y2: 99 }, { x1: 150, y1: 170, x2: 104, y2: 70 }],
                arcs: [{ center: { x: 150, y: 170 }, startAngle: 0, endAngle: 40, radius: 45, label: angle1Text, color: "rgba(16, 185, 129, 0.15)", stroke: "#10b981" }, { center: { x: 150, y: 170 }, startAngle: 40, endAngle: 115, radius: 45, label: angle2Text, color: "rgba(59, 130, 246, 0.15)", stroke: "#3b82f6" }],
                labels: [] 
            };
        } else { // 180° Straight Line Split
            geomConfig = { 
                type: "angle", subtype: "supplementary", angle: 180, 
                lines: [{ x1: 40, y1: 180, x2: 260, y2: 180 }, { x1: 150, y1: 180, x2: 213, y2: 90 }],
                arcs: [{ center: { x: 150, y: 180 }, startAngle: 0, endAngle: 55, radius: 40, label: angle1Text, color: "rgba(16, 185, 129, 0.15)", stroke: "#10b981" }, { center: { x: 150, y: 180 }, startAngle: 55, endAngle: 180, radius: 40, label: angle2Text, color: "rgba(59, 130, 246, 0.15)", stroke: "#3b82f6" }],
                labels: []
            };
        }

        const desc = lang === 'sv' ? "Teckna ett uttryck för de två vinklarnas sammanlagda summa." : "Write an expression for the sum of the two angles.";
        const clues = [
            { text: lang === 'sv' ? "För att hitta uttrycket för hela vinkeln lägger vi ihop de två delarna med varandra." : "To find the expression for the total angle, we add the two individual parts together." },
            { text: lang === 'sv' ? "Steg 1: Addera de två delvinklarna:" : "Step 1: Add the two individual angles together:", latex: `(${angle1Text}) + (${angle2Text})` },
            { text: lang === 'sv' ? "Eftersom x-termer och vanliga siffergrader inte kan slås ihop blir detta det färdiga uttrycket:" : "Since variable x-terms and basic scalar constants cannot merge, this forms the final expression:", latex: `${ans}` }
        ];

        return {
            renderData: { geometry: geomConfig, description: desc, answerType: "text", answer: ans },
            token: this.toBase64(ans), variationKey: "angles_write", type: "expression", clues: clues
        };
    }

    // =========================================================================
    // LEVEL 6: Vinklar - Lös ekvationen (Alternating Subtypes + Concise Track Engine)
    // =========================================================================
    private options_solveEquation_data(lang: string, targetX: number, xCoeff: number, remainder: number, totalDeg: number, geomConfig: any, desc: string): any {
        // 🟢 FIXED: All clue elements precisely replicate the sequential step configurations seen in LinearEquationGen.ts
        const clues = [
            { text: lang === 'sv' ? `Vinklarna bildar tillsammans en känd vinkelsumma på ${totalDeg}°.` : `The angles together form a known angle configuration summing to ${totalDeg}°.` },
            { text: lang === 'sv' ? "Vi ställer upp ekvationen:" : "We set up the equation:", latex: `${xCoeff}x + ${remainder} = ${totalDeg}` },
            { text: lang === 'sv' ? `Steg 1: Flytta ${remainder} genom att subtrahera det från båda sidor.` : `Step 1: Move ${remainder} by subtracting it from both sides.`, latex: `${totalDeg} - ${remainder} = ${totalDeg - remainder}` },
            { text: lang === 'sv' ? "Nu har vi ekvationen:" : "Now we have the equation:", latex: `${xCoeff}x = ${totalDeg - remainder}` },
            { text: lang === 'sv' ? `Steg 2: Dela med ${xCoeff} på båda sidor för att få fram x.` : `Step 2: Divide by ${xCoeff} on both sides to isolate x.`, latex: `x = \\frac{${totalDeg - remainder}}{${xCoeff}} = ${targetX}` },
            { text: lang === 'sv' ? `Svar: x = ${targetX}` : `Answer: x = ${targetX}` }
        ];
        return {
            renderData: { geometry: geomConfig, description: desc, answerType: "numeric", answer: targetX },
            token: this.toBase64(targetX.toString()), variationKey: "angles_solve", type: "calculate", clues: clues
        };
    }

    private angles_solveEquation(lang: string): any {
        const visualChoice = MathUtils.randomInt(1, 3);
        let targetX: number, xCoeff: number, angle1Remainder: number;
        let geomConfig: any, desc: string;

        if (visualChoice === 1) { // Right Angle Corner Split (Adds up to 90°)
            targetX = MathUtils.randomInt(2, 6); // 🟢 Safe low limits block negative constants completely
            xCoeff = MathUtils.randomInt(2, 4);
            angle1Remainder = 90 - (xCoeff * targetX); 

            geomConfig = { 
                type: "angle", subtype: "adjacent", angle: 90, 
                lines: [{ x1: 150, y1: 180, x2: 250, y2: 180 }, { x1: 150, y1: 180, x2: 220, y2: 110 }, { x1: 150, y1: 180, x2: 150, y2: 80 }],
                arcs: [{ center: { x: 150, y: 180 }, startAngle: 0, endAngle: 45, radius: 40, label: `${xCoeff}x`, color: "rgba(16, 185, 129, 0.15)", stroke: "#10b981" }, { center: { x: 150, y: 180 }, startAngle: 45, endAngle: 90, radius: 40, label: `${angle1Remainder}°`, color: "rgba(59, 130, 246, 0.15)", stroke: "#3b82f6" }],
                labels: []
            };
            desc = lang === 'sv' ? `Vinklarna bildar tillsammans en rät vinkel (90° totalt). Beräkna x.` : `The angles together form a right angle (90° total). Calculate x.`;
            return this.options_solveEquation_data(lang, targetX, xCoeff, angle1Remainder, 90, geomConfig, desc);
        } else { // Straight Line Split (Adds up to 180°)
            targetX = MathUtils.randomInt(5, 15);
            xCoeff = MathUtils.randomInt(2, 4);
            angle1Remainder = 180 - (xCoeff * targetX); 

            geomConfig = { 
                type: "angle", subtype: "supplementary", angle: 180, 
                lines: [{ x1: 40, y1: 180, x2: 260, y2: 180 }, { x1: 150, y1: 180, x2: 213, y2: 90 }],
                arcs: [{ center: { x: 150, y: 180 }, startAngle: 0, endAngle: 55, radius: 40, label: `${xCoeff}x`, color: "rgba(16, 185, 129, 0.15)", stroke: "#10b981" }, { center: { x: 150, y: 180 }, startAngle: 55, endAngle: 180, radius: 40, label: `${angle1Remainder}°`, color: "rgba(59, 130, 246, 0.15)", stroke: "#3b82f6" }],
                labels: []
            };
            desc = lang === 'sv' ? `Vinklarna ligger längs en rät linje (180° totalt). Beräkna x.` : `The angles lie on a straight line (180° total). Calculate x.`;
            return this.options_solveEquation_data(lang, targetX, xCoeff, angle1Remainder, 180, geomConfig, desc);
        }
    }
}