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
        return Buffer.from(str, 'utf-8').toString('base64');
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
            const a = MathUtils.randomInt(2, 5);
            const b = MathUtils.randomInt(3, 12);
            const wText = `${a}x`;
            const hText = `${b}`;
            geom = { type: "rectangle", width: 200, height: 120, labels: this.getLabels(wText, hText) };
            ans = `${2*a}x+${2*b}`;
            clues = [
                {
                    text: lang === 'sv' ? "Omkretsen är summan av en figurs sidor." : "The perimeter is the sum of all outer sides of a figure.",
                    latex: `\\text{Omkrets} = \\text{sida}_1 + \\text{sida}_2 + \\text{sida}_3 + \\text{sida}_4`
                },
                {
                    text: lang === 'sv' ? "Steg 1: Ställ upp summan för rektangelns fyra yttre sidor." : "Step 1: Set up the sum for the four outer sides of the rectangle.",
                    latex: `\\text{Omkrets} = ${wText} + ${hText} + ${wText} + ${hText}`
                },
                {
                    text: lang === 'sv' ? "Sortera uttrycket genom att samla x-termer och sifferkonstanter var för sig." : "Group the expression by gathering x-terms and constants separately.",
                    latex: `\\text{Omkrets} = \\mathbf{${a}x + ${a}x} + \\mathbf{${b} + ${b}}`
                },
                {
                    text: lang === 'sv' ? "Förenkla genom att slå ihop x-termerna för sig och talen för sig." : "Simplify by combining the x-terms together and the constants together.",
                    latex: `\\text{Omkrets} = \\mathbf{${ans}}`
                }
            ];
        } else if (shapeChoice === 2) { // Square
            const a = MathUtils.randomInt(2, 4);
            const b = MathUtils.randomInt(1, 6);
            const sText = `${a}x+${b}`;
            geom = { type: "rectangle", subtype: "square", width: 150, height: 150, labels: this.getLabels(sText, sText, sText) };
            ans = `${4*a}x+${4*b}`;
            clues = [
                {
                    text: lang === 'sv' ? "En kvadrat har fyra sidor som är lika långa." : "A square has four sides that are all the same length.",
                    latex: `\\text{Omkrets} = \\text{sida}_1 + \\text{sida}_2 + \\text{sida}_3 + \\text{sida}_4`
                },
                {
                    text: lang === 'sv' ? "Steg 1: Ställ upp summan för kvadratens fyra sidor." : "Step 1: Set up the sum for the four sides of the square.",
                    latex: `\\text{Omkrets} = (${sText}) + (${sText}) + (${sText}) + (${sText})`
                },
                {
                    text: lang === 'sv' ? "Sortera uttrycket genom att samla alla x-termer och sifferkonstanter var för sig." : "Group the expression by gathering all x-terms and constants separately.",
                    latex: `\\text{Omkrets} = \\mathbf{${a}x + ${a}x + ${a}x + ${a}x} + \\mathbf{${b} + ${b} + ${b} + ${b}}`
                },
                {
                    text: lang === 'sv' ? "Slå ihop termerna för att få det färdiga förenklade uttrycket." : "Combine the terms to get the final simplified expression.",
                    latex: `\\text{Omkrets} = \\mathbf{${ans}}`
                }
            ];
        } else if (shapeChoice === 3) { // Equilateral Triangle
            const a = MathUtils.randomInt(2, 6);
            const sText = `${a}x`;
            geom = { type: "triangle", subtype: "equilateral", width: 160, height: 140, labels: this.getLabels(sText, "", sText) };
            ans = `${3*a}x`;
            clues = [
                {
                    text: lang === 'sv' ? "En liksidig triangel har tre sidor som är lika långa." : "An equilateral triangle has three sides that are all the same length.",
                    latex: `\\text{Omkrets} = \\text{sida}_1 + \\text{sida}_2 + \\text{sida}_3`
                },
                {
                    text: lang === 'sv' ? "Steg 1: Ställ upp summan för triangelns tre sidor." : "Step 1: Set up the sum for the three sides of the triangle.",
                    latex: `\\text{Omkrets} = ${sText} + ${sText} + ${sText}`
                },
                {
                    text: lang === 'sv' ? "Förenkla uttrycket genom att lägga ihop de tre likadana x-termerna." : "Simplify the expression by adding the three identical x-terms together.",
                    latex: `\\text{Omkrets} = \\mathbf{${ans}}`
                }
            ];
        } else { // Right Triangle
            const a = MathUtils.randomInt(2, 4);
            const b = MathUtils.randomInt(2, 5);
            const c = MathUtils.randomInt(2, 6);
            geom = { type: "triangle", subtype: "right", width: 180, height: 140, labels: this.getLabels(`${a}x`, `${b}x`, `${c}x`) };
            ans = `${a+b+c}x`;
            clues = [
                {
                    text: lang === 'sv' ? "Omkretsen får vi om vi adderar alla tre sidor." : "We get the perimeter by adding all three outer sides of the triangle together.",
                    latex: `\\text{Omkrets} = \\text{sida}_1 + \\text{sida}_2 + \\text{sida}_3`
                },
                {
                    text: lang === 'sv' ? "Steg 1: Sätt upp summan för de tre sidorna." : "Step 1: Set up the sum for the three sides.",
                    latex: `\\text{Omkrets} = ${a}x + ${b}x + ${c}x`
                },
                {
                    text: lang === 'sv' ? "Förenkla genom att slå ihop alla x-termer." : "Simplify by combining all x-terms into a single final answer.",
                    latex: `\\text{Omkrets} = \\mathbf{${ans}}`
                }
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
            clues = [
                {
                    text: lang === 'sv' ? "Sätt upp ekvationen genom att addera rektangelns alla fyra sidor med den kända omkretsen." : "Set up the equation by adding all four sides of the rectangle and setting them equal to the perimeter.",
                    latex: `(x + ${a}) + ${b} + (x + ${a}) + ${b} = ${totalP}`
                },
                {
                    text: lang === 'sv' ? "Gruppera termerna på vänster sida genom att samla alla x-termer och sifferkonstanter." : "Group the terms on the left side by gathering all x-terms and numerical constants together.",
                    latex: `\\mathbf{x + x} + \\mathbf{${a} + ${b} + ${a} + ${b}} = ${totalP}`
                },
                {
                    text: lang === 'sv' ? "Förenkla uttrycket till en vanlig tvåstegsekvation:" : "Simplify the expression into a standard two-step equation:",
                    latex: `2x + \\mathbf{${2*a + 2*b}} = ${totalP}`
                },
                {
                    text: lang === 'sv' ? `Steg 1: Ta bort siffertermen genom att subtrahera ${2*a + 2*b} från båda sidor.` : `Step 1: Remove the constant term by subtracting ${2*a + 2*b} from both sides.`,
                    latex: `2x + ${2*a + 2*b} \\mathbf{- ${2*a + 2*b}} = ${totalP} \\mathbf{- ${2*a + 2*b}}`
                },
                {
                    text: lang === 'sv' ? "Förenkla raden för att helt isolera x-termen på sin sida:" : "Simplify the row to cleanly isolate the x-term on its side:",
                    latex: `2x = \\mathbf{${totalP - (2*a + 2*b)}}`
                },
                {
                    text: lang === 'sv' ? "Steg 2: Dela båda sidor med 2 för att få bort multiplikationen." : "Step 2: Divide both sides by 2 to undo the multiplication.",
                    latex: `\\frac{2x}{\\mathbf{2}} = \\frac{${totalP - (2*a + 2*b)}}{\\mathbf{2}}`
                },
                {
                    text: lang === 'sv' ? "Räkna ut divisionen för att få värdet på x." : "Calculate the division to find the final value of x.",
                    latex: `x = \\mathbf{${targetX}}`
                },
                {
                    text: lang === 'sv' ? `Svar: x = ${targetX}` : `Answer: x = ${targetX}`,
                    latex: `x = ${targetX}`
                }
            ];
        } else if (shapeChoice === 2) { // Square
            const a = MathUtils.randomInt(2, 4);
            const sText = `${a}x`;
            totalP = 4 * a * targetX;
            geom = { type: "rectangle", subtype: "square", width: 150, height: 150, labels: this.getLabels(sText, sText, sText) };
            desc = lang === 'sv' ? `Kvadratens omkrets är ${totalP} cm. Beräkna x.` : `The square's perimeter is ${totalP} cm. Calculate x.`;
            clues = [
                {
                    text: lang === 'sv' ? "En kvadrat har fyra lika långa sidor. Vi ställer upp ekvationen utifrån omkretsen:" : "A square has four sides of equal length. We set up the equation based on the perimeter:",
                    latex: `${sText} + ${sText} + ${sText} + ${sText} = ${totalP}`
                },
                {
                    text: lang === 'sv' ? "Förenkla vänster sida genom att addera ihop alla fyra likadana x-termer:" : "Simplify the left side by adding all four identical x-terms together:",
                    latex: `\\mathbf{${4*a}}x = ${totalP}`
                },
                {
                    text: lang === 'sv' ? `Steg 1: Dela med x-koefficienten ${4*a} på båda sidor för att få x ensam.` : `Step 1: Divide by the x-coefficient ${4*a} on both sides to leave x completely isolated.`,
                    latex: `\\frac{${4*a}x}{\\mathbf{${4*a}}} = \\frac{${totalP}}{\\mathbf{${4*a}}}`
                },
                {
                    text: lang === 'sv' ? "Utför divisionen för att räkna ut värdet på x." : "Perform the division to find the final answer.",
                    latex: `x = \\mathbf{${targetX}}`
                },
                {
                    text: lang === 'sv' ? `Svar: x = ${targetX}` : `Answer: x = ${targetX}`,
                    latex: `x = ${targetX}`
                }
            ];
        } else { // Equilateral Triangle
            const a = MathUtils.randomInt(2, 4);
            const b = MathUtils.randomInt(1, 5);
            const sText = `${a}x+${b}`;
            totalP = 3 * (a * targetX + b);
            geom = { type: "triangle", subtype: "equilateral", width: 160, height: 140, labels: this.getLabels(sText, "", "") };
            desc = lang === 'sv' ? `En liksidig triangels omkrets är ${totalP} cm. Beräkna x.` : `The triangle's perimeter is ${totalP} cm. Calculate x.`;
            clues = [
                {
                    text: lang === 'sv' ? "En liksidig triangel har tre sidor som är lika långa. Vi sätter upp summan:" : "An equilateral triangle has three sides that are all the same length. We set up the sum:",
                    latex: `(${sText}) + (${sText}) + (${sText}) = ${totalP}`
                },
                {
                    text: lang === 'sv' ? "Sortera och gruppera x-termerna för sig och sifferkonstanterna för sig på vänster sida." : "Group the x-terms and the numerical constants separately on the left side.",
                    latex: `\\mathbf{${a}x + ${a}x + ${a}x} + \\mathbf{${b} + ${b} + ${b}} = ${totalP}`
                },
                {
                    text: lang === 'sv' ? "Förenkla uttrycket till en vanlig tvåstegsekvation:" : "Simplify the expression into a standard two-step equation:",
                    latex: `${3*a}x + \\mathbf{${3*b}} = ${totalP}`
                },
                {
                    text: lang === 'sv' ? `Steg 1: Ta bort siffertermen genom att subtrahera ${3*b} från båda sidor.` : `Step 1: Remove the constant term by subtracting ${3*b} from both sides.`,
                    latex: `${3*a}x + ${3*b} \\mathbf{- ${3*b}} = ${totalP} \\mathbf{- ${3*b}}`
                },
                {
                    text: lang === 'sv' ? "Förenkla subtraktionen för att isolera variabeltermen:" : "Simplify the subtraction to cleanly isolate the variable term:",
                    latex: `${3*a}x = \\mathbf{${totalP - 3*b}}`
                },
                {
                    text: lang === 'sv' ? `Steg 2: Dela båda sidor med ${3*a} för att få bort multiplikationen.` : `Step 2: Divide both sides by ${3*a} to undo the multiplication.`,
                    latex: `\\frac{${3*a}x}{\\mathbf{${3*a}}} = \\frac{${totalP - 3*b}}{\\mathbf{${3*a}}}`
                },
                {
                    text: lang === 'sv' ? "Räkna ut divisionen för att få fram det färdiga värdet på x." : "Calculate the division to yield the final value of x.",
                    latex: `x = \\mathbf{${targetX}}`
                },
                {
                    text: lang === 'sv' ? `Svar: x = ${targetX}` : `Answer: x = ${targetX}`,
                    latex: `x = ${targetX}`
                }
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
            const c = MathUtils.randomInt(2, 6);
            const wText = `${a}x+${b}`;
            const hText = `${c}`;
            geom = { type: "rectangle", width: 200, height: 120, labels: this.getLabels(wText, hText) };
            ans = `${a*c}x+${b*c}`;
            clues = [
                {
                    text: lang === 'sv' ? "Rektangelns area beräknas genom att multiplicera basen med höjden." : "The area of a rectangle is found by multiplying the base by the height.",
                    latex: `\\text{Area} = \\text{basen} \\cdot \\text{höjden}`
                },
                {
                    text: lang === 'sv' ? "Steg 1: Sätt in sidornas värden i formeln. Använd parentes runt basens uttryck:" : "Step 1: Insert the side dimensions into the formula. Use parentheses around the base expression:",
                    latex: `\\text{Area} = (${a}x + ${b}) \\cdot ${c}`
                },
                {
                    text: lang === 'sv' ? `Multiplicera in ${c} med varje term inuti parentesen:` : `Distribute (multiply) ${c} into each term inside the parentheses:`,
                    latex: `\\text{Area} = \\mathbf{${c} \\cdot ${a}x + ${c} \\cdot ${b}}`
                },
                {
                    text: lang === 'sv' ? "Förenkla:" : "Simplify:",
                    latex: `\\text{Area} = \\mathbf{${ans}}`
                }
            ];
        } else { // Right Triangle
            const a = MathUtils.randomInt(2, 4);
            const c = MathUtils.randomInt(2, 5) * 2;
            const wText = `${a}x`;
            const hText = `${c}`;
            geom = { type: "triangle", subtype: "right", width: 180, height: 140, labels: this.getLabels(wText, hText) };
            ans = `${(a*c)/2}x`;
            clues = [
                {
                    text: lang === 'sv' ? "Triangelns area beräknas med formeln: (basen * höjden) / 2." : "The area of a triangle is found using the formula: (base * height) / 2.",
                    latex: `\\text{Area} = \\frac{\\text{basen} \\cdot \\text{höjden}}{2}`
                },
                {
                    text: lang === 'sv' ? "Steg 1: Sätt in triangelns kända bas och höjd i formeluppställningen:" : "Step 1: Insert the triangle's base and height parameters into the formula layout:",
                    latex: `\\text{Area} = \\frac{${a}x \\cdot ${c}}{2}`
                },
                {
                    text: lang === 'sv' ? "Multiplicera ihop faktorerna uppe i täljaren först:" : "Multiply the factors in the numerator first:",
                    latex: `\\text{Area} = \\frac{\\mathbf{${a*c}}x}{2}`
                },
                {
                    text: lang === 'sv' ? "Slutför divisionen med 2:" : "Complete the final division by 2:",
                    latex: `\\text{Area} = \\mathbf{${ans}}`
                }
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
                {
                    text: lang === 'sv' ? "Area beräknas som basen gånger höjden. Vi ställer upp ekvationen mot det kända areavärdet:" : "Area is calculated as base times height. We set up the equation against the known area value:",
                    latex: `${c} \\cdot (x + ${a}) = ${totalA}`
                },
                {
                    text: lang === 'sv' ? `Multiplicera in höjden ${c} med båda termerna inuti parentesen:` : `Multiply the height dimension value ${c} across both terms inside the parentheses:`,
                    latex: `\\mathbf{${c} \\cdot x + ${c} \\cdot ${a}} = ${totalA}`
                },
                {
                    text: lang === 'sv' ? "Förenkla:" : "Simplify:",
                    latex: `${c}x + \\mathbf{${c*a}} = ${totalA}`
                },
                {
                    text: lang === 'sv' ? `Steg 1: Ta bort sifferkonstanten genom att subtrahera ${c*a} från båda sidor.` : `Step 1: Eliminate the constant term by subtracting ${c*a} from both sides.`,
                    latex: `${c}x + ${c*a} \\mathbf{- ${c*a}} = ${totalA} \\mathbf{- ${c*a}}`
                },
                {
                    text: lang === 'sv' ? "Förenkla raden för att isolera variabeltermen på vänster sida:" : "Simplify the expressions to leave the variable term isolated on the left side:",
                    latex: `${c}x = \\mathbf{${totalA - (c*a)}}`
                },
                {
                    text: lang === 'sv' ? `Steg 2: Dela båda sidor med ${c} för att få bort multiplikationsfaktorn.` : `Step 2: Divide both sides by ${c} to eliminate the multiplier factor completely.`,
                    latex: `\\frac{${c}x}{\\mathbf{${c}}} = \\frac{${totalA - (c*a)}}{\\mathbf{${c}}}`
                },
                {
                    text: lang === 'sv' ? "Räkna ut divisionen för att finna det slutgiltiga svaret på x." : "Compute the final division step to reveal the target tracking solution value for x.",
                    latex: `x = \\mathbf{${targetX}}`
                },
                {
                    text: lang === 'sv' ? `Svar: x = ${targetX}` : `Answer: x = ${targetX}`,
                    latex: `x = ${targetX}`
                }
            ];
        } else { // Right Triangle
            const a = MathUtils.randomInt(2, 4);
            const c = MathUtils.randomInt(2, 5) * 2; 
            totalA = (a * targetX * c) / 2;
            geom = { type: "triangle", subtype: "right", width: 180, height: 140, labels: this.getLabels(`${a}x`, `${c}`) };
            desc = lang === 'sv' ? `Triangelns area är ${totalA} cm². Beräkna x.` : `The triangle's area is ${totalA} cm². Calculate x.`;
            clues = [
                {
                    text: lang === 'sv' ? "Area för en triangel är (basen * höjden) / 2. Vi ställer upp ekvationen:" : "Area for a triangle is (base * height) / 2. We construct the equation structure:",
                    latex: `\\frac{${a}x \\cdot ${c}}{2} = ${totalA}`
                },
                {
                    text: lang === 'sv' ? "Multiplicera ihop faktorerna uppe i täljaren först:" : "Multiply the coefficient parameters sitting in the numerator first:",
                    latex: `\\frac{\\mathbf{${a*c}}x}{2} = ${totalA}`
                },
                {
                    text: lang === 'sv' ? "Utför divisionen med 2 på vänster sida:" : "Perform the division by 2 on the left side:",
                    latex: `\\mathbf{${(a*c)/2}}x = ${totalA}`
                },
                {
                    text: lang === 'sv' ? `Steg 1: Dela med ${(a*c)/2} på båda sidor för att lösa ut x.` : `Step 1: Divide both sides by the core x-coefficient multiplier ${(a*c)/2} to isolate x.`,
                    latex: `\\frac{${(a*c)/2}x}{\\mathbf{${(a*c)/2}}} = \\frac{${totalA}}{\\mathbf{${(a*c)/2}}}`
                },
                {
                    text: lang === 'sv' ? "Räkna ut divisionen på höger sida." : "Calculate the final division on the right side.",
                    latex: `x = \\mathbf{${targetX}}`
                },
                {
                    text: lang === 'sv' ? `Svar: x = ${targetX}` : `Answer: x = ${targetX}`,
                    latex: `x = ${targetX}`
                }
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
            { 
                text: lang === 'sv' ? "För att beräkna uttrycket för hela vinkeln adderar vi de två delvinklarna med varandra." : "To construct the expression for the combined angle, we add the two individual parts together.",
                latex: `\\text{Total vinkel} = \\text{vinkel}_1 + \\text{vinkel}_2`
            },
            { 
                text: lang === 'sv' ? "Steg 1: Sätt in de två delvinklarnas kända värden i summan:" : "Step 1: Insert the two sub-angle values directly into the expression sum track:", 
                latex: `\\text{Total vinkel} = ${angle1Text} + ${angle2Text}` 
            },
            { 
                text: lang === 'sv' ? "Eftersom x-termer och siffergrader inte kan slås samman bildar detta det färdiga uttrycket:" : "Since variable x-terms and basic scalar constants cannot merge together, this forms the final output expression:", 
                latex: `\\text{Total vinkel} = \\mathbf{${ans}}` 
            }
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
        const clues = [
            { 
                text: lang === 'sv' ? `Vinklarna bildar tillsammans en känd geometrisk vinkelsumma på ${totalDeg}°.` : `The angles together combine to form a known geometric angle sum of ${totalDeg}°.`,
                latex: `${xCoeff}x + ${remainder} = ${totalDeg}`
            },
            { 
                text: lang === 'sv' ? `Steg 1: Ta bort sifferkonstanten genom att subtrahera ${remainder} från båda sidor.` : `Step 1: Remove the scalar constant term by subtracting ${remainder} from both sides.`, 
                latex: `${xCoeff}x + ${remainder} \\mathbf{- ${remainder}} = ${totalDeg} \\mathbf{- ${remainder}}` 
            },
            { 
                text: lang === 'sv' ? "Förenkla subtraktionerna på båda sidor för att isolera variabeltermen:" : "Simplify the subtractions on both sides to isolate the variable term:", 
                latex: `${xCoeff}x = \\mathbf{${totalDeg - remainder}}` 
            },
            { 
                text: lang === 'sv' ? `Steg 2: Dela båda sidor med ${xCoeff} för att ta bort multiplikationsfaktorn.` : `Step 2: Divide both sides by ${xCoeff} to eliminate the multiplier factor.`, 
                latex: `\\frac{${xCoeff}x}{\\mathbf{${xCoeff}}} = \\frac{${totalDeg - remainder}}{\\mathbf{${xCoeff}}}` 
            },
            { 
                text: lang === 'sv' ? "Räkna ut divisionen på höger sida för att finna värdet på x." : "Compute the division step on the right side to resolve the tracking value of x.", 
                latex: `x = \\mathbf{${targetX}}` 
            },
            { 
                text: lang === 'sv' ? `Svar: x = ${targetX}` : `Answer: x = ${targetX}`, 
                latex: `x = ${targetX}` 
            }
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