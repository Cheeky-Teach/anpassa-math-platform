import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { t, Language } from "../utils/i18n";

export class GeometryGenerator {
  public static generate(level: number, seed: string, lang: Language = 'sv', multiplier: number = 1): GeneratedQuestion {
    const rng = new Random(seed);
    const s = (val: number) => Math.round(val * multiplier);
    const piApprox = 3.14;

    const formatColor = (val: string | number) => `\\textcolor{#D35400}{\\mathbf{${val}}}`;

    let mode = level;
    if (level >= 6) mode = rng.intBetween(3, 5);

    let steps: Clue[] = [];
    let qData: { text_key: string, description: string | { sv: string, en: string }, latex: string, answer: number } = { text_key: "", description: "", latex: "", answer: 0 };
    let geometry: any = undefined;

    // --- LEVEL 1: Perimeter (Rectangles) ---
    if (mode === 1) {
        const w = rng.intBetween(s(3), s(12));
        const h = rng.intBetween(s(2), s(8));
        qData.answer = 2 * (w + h);
        qData.description = { sv: "Beräkna omkretsen.", en: "Calculate the perimeter." };
        geometry = { type: 'rectangle', width: w, height: h, labels: { width: w, height: h } };
        
        steps = [
            { 
                text: { 
                    sv: "Omkretsen är sträckan runt hela figuren. En rektangel har två baser och två höjder.", 
                    en: "Perimeter is the distance around the shape. A rectangle has two bases and two heights." 
                }, 
                latex: "" 
            },
            { 
                text: { 
                    sv: "Addera alla fyra sidor.", 
                    en: "Add all four sides together." 
                }, 
                latex: `${w} + ${w} + ${h} + ${h} = ${formatColor(qData.answer)}` 
            }
        ];
    }

    // --- LEVEL 2: Area (Rectangles) ---
    else if (mode === 2) {
        const w = rng.intBetween(s(3), s(12));
        const h = rng.intBetween(s(2), s(8));
        qData.answer = w * h;
        qData.description = { sv: "Beräkna arean.", en: "Calculate the area." };
        geometry = { type: 'rectangle', width: w, height: h, labels: { width: w, height: h } };
        
        steps = [
            { 
                text: { 
                    sv: "Arean berättar hur stor yta figuren täcker. För en rektangel multiplicerar vi basen med höjden.", 
                    en: "Area tells us how much surface the shape covers. For a rectangle, we multiply the base by the height." 
                }, 
                latex: "Area = b \\cdot h" 
            },
            { 
                text: { 
                    sv: "Sätt in värdena och räkna ut.", 
                    en: "Insert the values and calculate." 
                }, 
                latex: `${w} \\cdot ${h} = ${formatColor(qData.answer)}` 
            }
        ];
    }

    // --- LEVEL 3: Area (Triangles) ---
    else if (mode === 3) {
        const b = rng.intBetween(s(4), s(14));
        const h = rng.intBetween(s(3), s(10));
        qData.answer = (b * h) / 2;
        qData.description = { sv: "Beräkna arean.", en: "Calculate the area." };
        
        const subtype = rng.pick(['right', 'isosceles', 'scalene']);
        geometry = { type: 'triangle', subtype: subtype, width: b, height: h, labels: { base: b, height: h } };
        
        steps = [
            { 
                text: { 
                    sv: "En triangel är alltid hälften av en rektangel med samma bas och höjd.", 
                    en: "A triangle is always half of a rectangle with the same base and height." 
                }, 
                latex: "Area = \\frac{b \\cdot h}{2}" 
            },
            { 
                text: { 
                    sv: "Multiplicera basen med höjden och dela sedan med 2.", 
                    en: "Multiply the base by the height, then divide by 2." 
                }, 
                latex: `\\frac{${b} \\cdot ${h}}{2} = \\frac{${b*h}}{2} = ${formatColor(qData.answer)}` 
            }
        ];
    }

    // --- LEVEL 4: Circles (Area & Circumference) ---
    else if (mode === 4) {
        const isArea = rng.intBetween(0, 1) === 1;
        const r = rng.intBetween(s(3), s(10));
        
        if (isArea) {
            const area = Math.PI * r * r;
            qData.answer = Math.round(area * 10) / 10;
            qData.description = { sv: "Beräkna arean (avrunda till 1 decimal).", en: "Calculate the area (round to 1 decimal)." };
            
            steps = [
                { 
                    text: { sv: "För att räkna ut ytan (arean) på en cirkel använder vi radien (r) och talet Pi (π ≈ 3.14).", en: "To find the surface (area) of a circle, we use the radius (r) and Pi (π ≈ 3.14)." }, 
                    latex: "Area = \\pi \\cdot r^2" 
                },
                { 
                    text: { sv: "Radien i kvadrat betyder radien gånger sig själv.", en: "Radius squared means radius times itself." }, 
                    latex: `r^2 = ${r} \\cdot ${r} = ${r*r}` 
                },
                { 
                    text: { sv: "Multiplicera med Pi.", en: "Multiply by Pi." }, 
                    latex: `3.14 \\cdot ${r*r} \\approx ${formatColor(qData.answer)}` 
                }
            ];
        } else {
            const circ = 2 * Math.PI * r;
            qData.answer = Math.round(circ * 10) / 10;
            qData.description = { sv: "Beräkna omkretsen (avrunda till 1 decimal).", en: "Calculate the circumference (round to 1 decimal)." };
            
            steps = [
                { 
                    text: { sv: "Omkretsen är sträckan runt cirkeln. Vi kan använda diametern (som är 2 gånger radien) eller formeln med radien.", en: "Circumference is the distance around the circle. We can use the diameter (2 times radius) or the radius formula." }, 
                    latex: "Omkrets = 2 \\cdot \\pi \\cdot r" 
                },
                { 
                    text: { sv: "Räkna ut diametern först (dubbla radien).", en: "Calculate the diameter first (double the radius)." }, 
                    latex: `d = 2 \\cdot ${r} = ${2*r}` 
                },
                { 
                    text: { sv: "Multiplicera diametern med Pi (≈ 3.14).", en: "Multiply the diameter by Pi (≈ 3.14)." }, 
                    latex: `${2*r} \\cdot 3.14 \\approx ${formatColor(qData.answer)}` 
                }
            ];
        }
        geometry = { type: 'circle', radius: r, value: r, show: 'radius' };
    }

    // --- LEVEL 5: Composite Shapes ---
    else {
        // Example: Rectangle + Semicircle (Portal) or Triangle on Rectangle (House)
        const type = rng.pick(['portal', 'house']);
        const width = rng.intBetween(s(4), s(12)); // Base
        const height = rng.intBetween(s(4), s(10)); // Side height
        
        let shapeNameSv = "", shapeNameEn = "";
        
        const isArea = rng.intBetween(0, 1) === 1;

        if (type === 'house') {
            const hRoof = rng.intBetween(s(3), s(8));
            shapeNameSv = "huset"; shapeNameEn = "the house";
            
            if (isArea) {
                const areaRect = width * height;
                const areaTri = (width * hRoof) / 2;
                qData.answer = areaRect + areaTri;
                
                steps = [
                    { 
                        text: { sv: "Dela upp figuren i två delar: en rektangel i botten och en triangel på toppen.", en: "Split the shape into two parts: a rectangle at the bottom and a triangle on top." }, 
                        latex: "" 
                    },
                    { 
                        text: { sv: "Räkna ut arean för rektangeln.", en: "Calculate the area of the rectangle." }, 
                        latex: `${width} \\cdot ${height} = ${areaRect}` 
                    },
                    { 
                        text: { sv: "Räkna ut arean för taket (triangeln).", en: "Calculate the area of the roof (triangle)." }, 
                        latex: `\\frac{${width} \\cdot ${hRoof}}{2} = ${areaTri}` 
                    },
                    { 
                        text: { sv: "Addera delarna för att få totalen.", en: "Add the parts to get the total." }, 
                        latex: `${areaRect} + ${areaTri} = ${formatColor(qData.answer)}` 
                    }
                ];
            } else {
                // Perimeter of house (Base + 2 sides + 2 roof slopes)
                // Pythagoras for roof slope
                const halfBase = width / 2;
                const slope = Math.sqrt(halfBase*halfBase + hRoof*hRoof);
                const total = width + 2*height + 2*slope;
                qData.answer = Math.round(total * 10) / 10;
                
                steps = [
                    { 
                        text: { sv: "Omkretsen är vägen runt huset (golvet + väggarna + taket).", en: "The perimeter is the path around the house (floor + walls + roof)." }, 
                        latex: "" 
                    },
                    { 
                        text: { sv: "För att hitta takets längd använder vi Pythagoras sats på halva taket.", en: "To find the roof length, we use Pythagoras theorem on half the roof." }, 
                        latex: `\\sqrt{${halfBase}^2 + ${hRoof}^2} \\approx ${Math.round(slope*10)/10}` 
                    },
                    { 
                        text: { sv: "Addera alla sidor runt om.", en: "Add all sides around the outside." }, 
                        latex: `${width} + ${height} + ${height} + ${Math.round(slope*10)/10} + ${Math.round(slope*10)/10} \\approx ${formatColor(qData.answer)}` 
                    }
                ];
            }
            geometry = { type: 'composite', subtype: 'house', labels: { w: width, h: height, h_roof: hRoof } };
        } 
        else { // Portal
            shapeNameSv = "portalen"; shapeNameEn = "the portal";
            // Rectangle with semicircle on top
            if (isArea) {
                const areaRect = width * height;
                const r = width / 2;
                const areaSemi = (Math.PI * r * r) / 2;
                qData.answer = Math.round((areaRect + areaSemi) * 10) / 10;
                
                steps = [
                    { 
                        text: { sv: "Dela upp figuren: en rektangel och en halvcirkel.", en: "Split the shape: a rectangle and a semicircle." }, 
                        latex: "" 
                    },
                    { 
                        text: { sv: "Rektangelns area:", en: "Rectangle area:" }, 
                        latex: `${width} \\cdot ${height} = ${areaRect}` 
                    },
                    { 
                        text: { sv: "Halvcirkelns area (radien är hälften av bredden).", en: "Semicircle area (radius is half the width)." }, 
                        latex: `\\frac{\\pi \\cdot ${r}^2}{2} \\approx ${Math.round(areaSemi*10)/10}` 
                    },
                    { 
                        text: { sv: "Addera dem.", en: "Add them together." }, 
                        latex: `${formatColor(qData.answer)}` 
                    }
                ];
            } else {
                // Perimeter: Base + 2 sides + Arc (half circumference)
                const arc = (Math.PI * width) / 2;
                qData.answer = Math.round((width + 2 * height + arc) * 10) / 10;
                
                steps = [
                    { 
                        text: { sv: "Vi ska gå runt figuren: botten + två sidor + den bågformade toppen.", en: "We walk around the shape: bottom + two sides + the curved top." }, 
                        latex: "" 
                    },
                    { 
                        text: { sv: "Toppen är en halvcirkel. Räkna ut omkretsen för en hel cirkel och dela med 2.", en: "The top is a semicircle. Calculate circumference for a full circle and divide by 2." }, 
                        latex: `\\frac{\\pi \\cdot ${width}}{2} \\approx ${Math.round(arc*10)/10}` 
                    },
                    { 
                        text: { sv: "Lägg ihop alla delar.", en: "Sum all the parts." }, 
                        latex: `${width} + ${height} + ${height} + ${Math.round(arc*10)/10} \\approx ${formatColor(qData.answer)}` 
                    }
                ];
            }
            geometry = { type: 'composite', subtype: 'portal', w: width, labels: { w: width } };
        }
        
        qData.text_key = isArea ? "calc_area" : "calc_perim";
        if (!geometry) geometry = { type: 'composite', subtype: 'ice_cream', width: width, height: height, labels: { top: width, side: height } };
    }

    return {
        questionId: `geo-l${level}-${seed}`,
        renderData: {
            text_key: qData.text_key,
            description: qData.description,
            latex: "",
            answerType: "numeric",
            geometry: geometry,
            variables: {}
        },
        serverData: {
            answer: qData.answer,
            solutionSteps: steps
        }
    };
  }
}