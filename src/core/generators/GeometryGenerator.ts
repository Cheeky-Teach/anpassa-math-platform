import { MathUtils } from '../utils/MathUtils.js';

export class GeometryGenerator {
    public generate(level: number, lang: string = 'sv'): any {
        let mode = level;
        // Level 6 in legacy was a mix of harder levels (3-5)
        if (level >= 6) {
            mode = MathUtils.randomInt(3, 5);
        }

        switch (mode) {
            case 1: return this.level1_PerimeterRect(lang);
            case 2: return this.level2_AreaRect(lang);
            case 3: return this.level3_AreaTriangle(lang);
            case 4: return this.level4_Circles(lang);
            case 5: return this.level5_Composite(lang);
            default: return this.level1_PerimeterRect(lang);
        }
    }

    // --- LEVEL 1: Perimeter (Rectangles) ---
    private level1_PerimeterRect(lang: string): any {
        const w = MathUtils.randomInt(3, 12);
        const h = MathUtils.randomInt(2, 8);
        const ans = 2 * (w + h);

        return {
            renderData: {
                geometry: { type: 'rectangle', width: w, height: h, labels: { width: w, height: h } },
                description: lang === 'sv' ? "Beräkna omkretsen." : "Calculate the perimeter.",
                answerType: 'text'
            },
            token: Buffer.from(ans.toString()).toString('base64'),
            serverData: { 
                answer: ans, 
                solutionSteps: [
                    { 
                        text: lang === 'sv' 
                            ? "Omkretsen är sträckan runt hela figuren. En rektangel har två baser och två höjder." 
                            : "Perimeter is the distance around the shape. A rectangle has two bases and two heights.",
                        latex: "" 
                    },
                    { 
                        text: lang === 'sv' ? "Addera alla fyra sidor." : "Add all four sides together.", 
                        latex: `${w} + ${w} + ${h} + ${h} = \\mathbf{${ans}}` 
                    }
                ]
            }
        };
    }

    // --- LEVEL 2: Area (Rectangles) ---
    private level2_AreaRect(lang: string): any {
        const w = MathUtils.randomInt(3, 12);
        const h = MathUtils.randomInt(2, 8);
        const ans = w * h;

        return {
            renderData: {
                geometry: { type: 'rectangle', width: w, height: h, labels: { width: w, height: h } },
                description: lang === 'sv' ? "Beräkna arean." : "Calculate the area.",
                answerType: 'text'
            },
            token: Buffer.from(ans.toString()).toString('base64'),
            serverData: { 
                answer: ans, 
                solutionSteps: [
                    { 
                        text: lang === 'sv' 
                            ? "Arean berättar hur stor yta figuren täcker. För en rektangel multiplicerar vi basen med höjden." 
                            : "Area tells us how much surface the shape covers. For a rectangle, we multiply the base by the height.",
                        latex: "Area = b \\cdot h" 
                    },
                    { 
                        text: lang === 'sv' ? "Sätt in värdena och räkna ut." : "Insert the values and calculate.", 
                        latex: `${w} \\cdot ${h} = \\mathbf{${ans}}` 
                    }
                ]
            }
        };
    }

    // --- LEVEL 3: Area (Triangles) ---
    private level3_AreaTriangle(lang: string): any {
        const b = MathUtils.randomInt(4, 14);
        const h = MathUtils.randomInt(3, 10);
        // Ensure integer result if possible, or handle .5
        // Legacy didn't strictly force even numbers, so we handle float in answer
        const ans = (b * h) / 2;
        
        const subtype = MathUtils.randomChoice(['right', 'isosceles', 'scalene']);

        return {
            renderData: {
                geometry: { type: 'triangle', subtype: subtype, width: b, height: h, labels: { base: b, height: h } },
                description: lang === 'sv' ? "Beräkna arean." : "Calculate the area.",
                answerType: 'text'
            },
            token: Buffer.from(ans.toString()).toString('base64'),
            serverData: { 
                answer: ans, 
                solutionSteps: [
                    { 
                        text: lang === 'sv' 
                            ? "En triangel är alltid hälften av en rektangel med samma bas och höjd." 
                            : "A triangle is always half of a rectangle with the same base and height.",
                        latex: "Area = \\frac{b \\cdot h}{2}" 
                    },
                    { 
                        text: lang === 'sv' ? "Multiplicera basen med höjden och dela sedan med 2." : "Multiply the base by the height, then divide by 2.", 
                        latex: `\\frac{${b} \\cdot ${h}}{2} = \\frac{${b*h}}{2} = \\mathbf{${ans}}` 
                    }
                ]
            }
        };
    }

    // --- LEVEL 4: Circles (Area & Circumference) ---
    private level4_Circles(lang: string): any {
        const isArea = MathUtils.randomInt(0, 1) === 1;
        const showDiameter = MathUtils.randomInt(0, 1) === 1;
        
        const r = MathUtils.randomInt(3, 10);
        const d = r * 2;
        const piApprox = 3.14;

        let ans = 0;
        let desc = "";
        let steps = [];

        if (isArea) {
            ans = Math.round(piApprox * r * r * 10) / 10;
            desc = lang === 'sv' ? "Beräkna arean (avrunda till 1 decimal)." : "Calculate the area (round to 1 decimal).";
            
            if (showDiameter) {
                steps.push({ 
                    text: lang === 'sv' ? "För att räkna ut arean behöver vi radien (r). Radien är hälften av diametern (d)." : "To calculate the area we need the radius (r). The radius is half of the diameter (d).",
                    latex: `r = \\frac{d}{2} = \\frac{${d}}{2} = ${r}`
                });
            }
            steps.push({ 
                text: lang === 'sv' ? "Använd formeln för cirkelns area." : "Use the formula for the area of a circle.",
                latex: "Area = \\pi \\cdot r^2"
            });
            steps.push({ 
                text: lang === 'sv' ? "Sätt in radien och räkna ut." : "Insert the radius and calculate.",
                latex: `3.14 \\cdot ${r}^2 = 3.14 \\cdot ${r*r} \\approx \\mathbf{${ans}}`
            });
        } else {
            ans = Math.round(2 * piApprox * r * 10) / 10;
            desc = lang === 'sv' ? "Beräkna omkretsen (avrunda till 1 decimal)." : "Calculate the circumference (round to 1 decimal).";
            
            if (showDiameter) {
                steps.push({ 
                    text: lang === 'sv' ? "Omkretsen är sträckan runt cirkeln. Med diametern (d) är formeln enkel." : "Circumference is the distance around the circle. With diameter (d), the formula is simple.",
                    latex: "Omkrets = \\pi \\cdot d"
                });
                steps.push({ 
                    text: lang === 'sv' ? "Multiplicera diametern med Pi (≈ 3.14)." : "Multiply the diameter by Pi (≈ 3.14).",
                    latex: `3.14 \\cdot ${d} \\approx \\mathbf{${ans}}`
                });
            } else {
                steps.push({ 
                    text: lang === 'sv' ? "Omkretsen är sträckan runt cirkeln. Vi kan använda formeln med radien." : "Circumference is the distance around the circle. We can use the formula with the radius.",
                    latex: "Omkrets = 2 \\cdot \\pi \\cdot r"
                });
                steps.push({ 
                    text: lang === 'sv' ? "Multiplicera 2 · Pi · radien." : "Multiply 2 · Pi · radius.",
                    latex: `2 \\cdot 3.14 \\cdot ${r} \\approx \\mathbf{${ans}}`
                });
            }
        }

        return {
            renderData: {
                geometry: { type: 'circle', radius: r, value: showDiameter ? d : r, show: showDiameter ? 'diameter' : 'radius' },
                description: desc,
                answerType: 'text'
            },
            token: Buffer.from(ans.toString()).toString('base64'),
            serverData: { answer: ans, solutionSteps: steps }
        };
    }

    // --- LEVEL 5: Composite Shapes ---
    private level5_Composite(lang: string): any {
        const type = MathUtils.randomChoice(['portal', 'house']);
        const width = MathUtils.randomInt(4, 12);
        const height = MathUtils.randomInt(4, 10);
        
        const isArea = MathUtils.randomInt(0, 1) === 1;
        let ans = 0;
        let steps = [];
        let geometry: any = {};
        let desc = "";

        if (type === 'house') {
            const hRoof = MathUtils.randomInt(3, 8);
            
            if (isArea) {
                const areaRect = width * height;
                const areaTri = (width * hRoof) / 2;
                ans = areaRect + areaTri;
                desc = lang === 'sv' ? "Beräkna arean av huset." : "Calculate the area of the house.";
                
                steps = [
                    { text: lang === 'sv' ? "Dela upp figuren: en rektangel i botten och en triangel på toppen." : "Split the shape: a rectangle at the bottom and a triangle on top.", latex: "" },
                    { text: lang === 'sv' ? "Räkna ut arean för rektangeln." : "Calculate the area of the rectangle.", latex: `${width} \\cdot ${height} = ${areaRect}` },
                    { text: lang === 'sv' ? "Räkna ut arean för taket (triangeln)." : "Calculate the area of the roof (triangle).", latex: `\\frac{${width} \\cdot ${hRoof}}{2} = ${areaTri}` },
                    { text: lang === 'sv' ? "Addera delarna." : "Add the parts.", latex: `${areaRect} + ${areaTri} = \\mathbf{${ans}}` }
                ];
            } else {
                // Perimeter
                const halfBase = width / 2;
                const slope = Math.sqrt(halfBase*halfBase + hRoof*hRoof);
                ans = Math.round((width + 2*height + 2*slope) * 10) / 10;
                desc = lang === 'sv' ? "Beräkna omkretsen av huset." : "Calculate the perimeter of the house.";

                steps = [
                    { text: lang === 'sv' ? "Omkretsen är vägen runt huset (golvet + väggarna + taket)." : "Perimeter is the path around the house (floor + walls + roof).", latex: "" },
                    { text: lang === 'sv' ? "För att hitta takets längd använder vi Pythagoras sats på halva taket." : "To find the roof length, use Pythagoras on half the roof.", latex: `\\sqrt{${halfBase}^2 + ${hRoof}^2} \\approx ${Math.round(slope*10)/10}` },
                    { text: lang === 'sv' ? "Addera alla sidor runt om." : "Add all sides around.", latex: `${width} + 2\\cdot${height} + 2\\cdot${Math.round(slope*10)/10} \\approx \\mathbf{${ans}}` }
                ];
            }
            geometry = { type: 'composite', subtype: 'house', labels: { w: width, h: height, h_roof: hRoof } };
        } else {
            // Portal (Rect + Semicircle)
            const r = width / 2;
            
            if (isArea) {
                const areaRect = width * height;
                const areaSemi = (Math.PI * r * r) / 2;
                ans = Math.round((areaRect + areaSemi) * 10) / 10;
                desc = lang === 'sv' ? "Beräkna arean av portalen." : "Calculate the area of the portal.";

                steps = [
                    { text: lang === 'sv' ? "Dela upp figuren: en rektangel och en halvcirkel." : "Split the figure: a rectangle and a semicircle.", latex: "" },
                    { text: lang === 'sv' ? "Rektangelns area:" : "Rectangle area:", latex: `${width} \\cdot ${height} = ${areaRect}` },
                    { text: lang === 'sv' ? "Halvcirkelns area:" : "Semicircle area:", latex: `\\frac{\\pi \\cdot ${r}^2}{2} \\approx ${Math.round(areaSemi*10)/10}` },
                    { text: lang === 'sv' ? "Addera dem." : "Add them.", latex: `\\approx \\mathbf{${ans}}` }
                ];
            } else {
                const arc = (Math.PI * width) / 2;
                ans = Math.round((width + 2 * height + arc) * 10) / 10;
                desc = lang === 'sv' ? "Beräkna omkretsen av portalen." : "Calculate the perimeter of the portal.";

                steps = [
                    { text: lang === 'sv' ? "Vi ska gå runt figuren: botten + två sidor + den bågformade toppen." : "Walk around the figure: bottom + two sides + the curved top.", latex: "" },
                    { text: lang === 'sv' ? "Toppen är en halvcirkel." : "The top is a semicircle.", latex: `\\frac{\\pi \\cdot ${width}}{2} \\approx ${Math.round(arc*10)/10}` },
                    { text: lang === 'sv' ? "Lägg ihop alla delar." : "Add all parts.", latex: `${width} + ${height} + ${height} + ${Math.round(arc*10)/10} \\approx \\mathbf{${ans}}` }
                ];
            }
            geometry = { type: 'composite', subtype: 'portal', labels: { w: width, h: height } };
        }

        return {
            renderData: {
                geometry: geometry,
                description: desc,
                answerType: 'text'
            },
            token: Buffer.from(ans.toString()).toString('base64'),
            serverData: { answer: ans, solutionSteps: steps }
        };
    }
}