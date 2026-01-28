import { MathUtils } from '../utils/MathUtils.js';

export class ScaleGen {
    private static readonly SHAPES = ['arrow', 'star', 'lightning', 'key', 'heart', 'cloud', 'moon', 'sun'];
    private static readonly AREA_SHAPES = ['rectangle', 'triangle', 'circle', 'square'];

    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_Concepts(lang);
            case 2: return this.level2_CalcLengthSimple(lang);
            case 3: return this.level3_CalcLengthHard(lang);
            case 4: return this.level4_DetermineScale(lang);
            case 5: return this.level5_NoPictures(lang);
            case 6: return this.level6_AreaScale(lang);
            case 7: return this.level7_Mixed(lang);
            default: return this.level1_Concepts(lang);
        }
    }

    // Level 1: Concepts
    private level1_Concepts(lang: string): any {
        const isReduction = MathUtils.randomInt(0, 1) === 1;
        const ratio = MathUtils.randomChoice([2, 5, 10, 50, 100]);
        const scaleStr = isReduction ? `1:${ratio}` : `${ratio}:1`;
        
        const qType = MathUtils.randomInt(1, 2);
        let desc = "", correct = "", wrong = "", expl = "";

        if (qType === 1) {
            desc = lang === 'sv' ? `Visar skalan ${scaleStr} en förstoring eller en förminskning?` : `Does ${scaleStr} show an enlargement or reduction?`;
            if (isReduction) {
                correct = lang === 'sv' ? "Förminskning" : "Reduction";
                wrong = lang === 'sv' ? "Förstoring" : "Enlargement";
                expl = lang === 'sv' 
                    ? "Det första talet (1) är mindre än det andra. Bilden är mindre än verkligheten." 
                    : "The first number (1) is smaller. The image is smaller than reality.";
            } else {
                correct = lang === 'sv' ? "Förstoring" : "Enlargement";
                wrong = lang === 'sv' ? "Förminskning" : "Reduction";
                expl = lang === 'sv' 
                    ? "Det första talet är större än 1. Bilden är större än verkligheten." 
                    : "The first number is larger than 1. The image is larger than reality.";
            }
        } else {
            desc = lang === 'sv' ? `Skalan är ${scaleStr}. Vad är störst?` : `Scale is ${scaleStr}. Which is larger?`;
            const real = lang === 'sv' ? "Verkligheten" : "Reality";
            const img = lang === 'sv' ? "Bilden" : "The image";
            if (isReduction) {
                correct = real; wrong = img;
                expl = lang === 'sv' 
                    ? `1 cm på bilden motsvarar ${ratio} cm i verkligheten. Verkligheten är alltså mycket större.` 
                    : `1 cm on the image equals ${ratio} cm in reality. So reality is much larger.`;
            } else {
                correct = img; wrong = real;
                expl = lang === 'sv' 
                    ? `${ratio} cm på bilden är bara 1 cm i verkligheten. Bilden är uppförstorad.` 
                    : `${ratio} cm on the image is only 1 cm in reality. The image is magnified.`;
            }
        }

        return {
            renderData: {
                description: desc,
                latex: scaleStr,
                answerType: 'multiple_choice',
                choices: Math.random() > 0.5 ? [correct, wrong] : [wrong, correct],
                geometry: { type: 'scale_single', shape: 'magnifying_glass', label: scaleStr }
            },
            token: Buffer.from(correct).toString('base64'),
            serverData: { answer: correct, solutionSteps: [{ text: expl, latex: "" }] }
        };
    }

    // Level 2: Simple Length
    private level2_CalcLengthSimple(lang: string): any {
        const scale = MathUtils.randomChoice([2, 3, 4, 5, 10]);
        const imgVal = MathUtils.randomInt(2, 12);
        const isReduction = MathUtils.randomInt(0, 1) === 1;
        const scaleStr = isReduction ? `1:${scale}` : `${scale}:1`;
        const subType = MathUtils.randomInt(0, 1);
        const shape = MathUtils.randomChoice(ScaleGen.SHAPES);
        
        let ans = 0, label = "", desc = "", steps = [];

        if (isReduction) {
            if (subType === 0) { // Find Real
                ans = imgVal * scale;
                desc = lang === 'sv' ? `Bilden är ${imgVal} cm. Skalan är ${scaleStr}. Hur lång är den i verkligheten? (cm)` : `Image is ${imgVal} cm. Scale ${scaleStr}. Reality? (cm)`;
                label = `${imgVal} cm`;
                steps.push({ 
                    text: lang === 'sv' ? "Verkligheten är större än bilden. Därför multiplicerar vi måttet med skalan." : "Reality is larger than the image. Therefore, multiply the measurement by the scale.", 
                    latex: `${imgVal} \\cdot ${scale} = \\mathbf{${ans}}` 
                });
            } else { // Find Drawing
                const real = imgVal * scale;
                ans = imgVal;
                desc = lang === 'sv' ? `I verkligheten är den ${real} cm. Skalan är ${scaleStr}. Hur lång på ritningen?` : `Reality is ${real} cm. Scale ${scaleStr}. Drawing?`;
                label = `${real} cm`; 
                steps.push({ 
                    text: lang === 'sv' ? "Bilden är mindre än verkligheten. Därför dividerar vi måttet med skalan." : "The image is smaller than reality. Therefore, divide the measurement by the scale.", 
                    latex: `\\frac{${real}}{${scale}} = \\mathbf{${ans}}` 
                });
            }
        } else {
            // Enlargement logic...
            if (subType === 0) { // Find Image
                ans = imgVal * scale;
                desc = lang === 'sv' ? `Verkligheten är ${imgVal} cm. Skalan är ${scaleStr}. Hur stor blir den på bild?` : `Reality is ${imgVal} cm. Scale ${scaleStr}. Image size?`;
                label = `${imgVal} cm`;
                steps.push({ 
                    text: lang === 'sv' ? "Bilden är en förstoring. Multiplicera verkligheten med skalan." : "The image is an enlargement. Multiply reality by the scale.", 
                    latex: `${imgVal} \\cdot ${scale} = \\mathbf{${ans}}` 
                });
            } else { // Find Real
                ans = imgVal;
                const drawVal = ans * scale;
                desc = lang === 'sv' ? `På bilden är den ${drawVal} cm. Skala ${scaleStr}. Hur stor är den i verkligheten?` : `Image is ${drawVal} cm. Scale ${scaleStr}. Reality?`;
                label = `${drawVal} cm`;
                steps.push({ 
                    text: lang === 'sv' ? "Verkligheten är mindre än den förstorade bilden. Dividera bildens mått med skalan." : "Reality is smaller than the enlarged image. Divide the image measurement by the scale.", 
                    latex: `\\frac{${drawVal}}{${scale}} = \\mathbf{${ans}}` 
                });
            }
        }

        return {
            renderData: { description: desc, latex: scaleStr, answerType: 'numeric', geometry: { type: 'scale_single', shape, label } },
            token: Buffer.from(ans.toString()).toString('base64'),
            serverData: { answer: ans, solutionSteps: steps }
        };
    }

    // Level 3: Harder (Map)
    private level3_CalcLengthHard(lang: string): any {
        const scale = MathUtils.randomChoice([1000, 10000, 50000]);
        const cm = MathUtils.randomInt(3, 15);
        const realCm = cm * scale;
        const realM = realCm / 100;
        const realKm = realM / 1000;
        
        const useKm = realKm >= 1;
        const ans = useKm ? realKm : realM;
        const unit = useKm ? 'km' : 'm';

        const desc = lang === 'sv' ? `Karta: ${cm} cm. Skala 1:${scale}. Verkligheten (${unit})?` : `Map: ${cm} cm. Scale 1:${scale}. Reality (${unit})?`;
        const steps = [
            { text: lang === 'sv' ? "1. Multiplicera först med skalan för att få svaret i cm." : "1. First multiply by the scale to get the answer in cm.", latex: `${cm} \\cdot ${scale} = ${realCm} \\text{ cm}` },
            { 
                text: lang === 'sv' ? `2. Omvandla sedan till ${unit}. (1 m = 100 cm, 1 km = 1000 m).` : `2. Then convert to ${unit}. (1 m = 100 cm, 1 km = 1000 m).`, 
                latex: useKm ? `\\frac{${realCm}}{100000} = \\mathbf{${ans}}` : `\\frac{${realCm}}{100} = \\mathbf{${ans}}` 
            }
        ];

        return {
            renderData: { description: desc, latex: `1:${scale}`, answerType: 'numeric', geometry: { type: 'scale_single', shape: 'map', label: `${cm} cm` } },
            token: Buffer.from(ans.toString()).toString('base64'),
            serverData: { answer: ans, solutionSteps: steps }
        };
    }

    // Level 4: Determine Scale
    private level4_DetermineScale(lang: string): any {
        const factor = MathUtils.randomChoice([2, 3, 4, 5]);
        const base = MathUtils.randomInt(2, 6);
        const lg = base * factor;
        const isReduction = MathUtils.randomInt(0, 1) === 1;
        const shape = MathUtils.randomChoice(['rectangle', 'arrow', 'star']);
        
        let leftL, rightL, leftV, rightV, ansLeft, ansRight;
        if (isReduction) {
            leftL = lang === 'sv' ? "Bild" : "Image"; leftV = `${base} cm`;
            rightL = lang === 'sv' ? "Verklighet" : "Reality"; rightV = `${lg} cm`;
            ansLeft = 1; ansRight = factor;
        } else {
            leftL = lang === 'sv' ? "Verklighet" : "Reality"; leftV = `${base} cm`;
            rightL = lang === 'sv' ? "Bild" : "Image"; rightV = `${lg} cm`;
            ansLeft = factor; ansRight = 1;
        }

        return {
            renderData: {
                description: lang === 'sv' ? "Bestäm skalan." : "Determine the scale.",
                answerType: 'scale',
                geometry: { type: 'scale_compare', shape, leftLabel: leftL, leftValue: leftV, rightLabel: rightL, rightValue: rightV }
            },
            token: Buffer.from(`${ansLeft}:${ansRight}`).toString('base64'),
            serverData: { answer: { left: ansLeft, right: ansRight }, solutionSteps: [
                { text: lang === 'sv' ? "Ställ upp förhållandet Bild : Verklighet." : "Set up the ratio Image : Reality.", latex: isReduction ? `${base} : ${lg}` : `${lg} : ${base}` },
                { text: lang === 'sv' ? "Förenkla genom att dividera båda sidor med det minsta talet." : "Simplify by dividing both sides by the smallest number.", latex: `1:${factor}` }
            ]}
        };
    }

    // Level 5: Word Problems (Expanded)
    private level5_NoPictures(lang: string): any {
        const scenarios = [
            { sv: "Ett torn är 50 m högt. En modell är 50 cm hög.", en: "Tower is 50 m. Model is 50 cm.", scale: "1:100", conv: "50 m = 5000 cm" },
            { sv: "En fotbollsplan är 100 m lång. På ritningen 20 cm.", en: "Soccer field 100 m. Drawing 20 cm.", scale: "1:500", conv: "100 m = 10000 cm" },
            { sv: "En bro är 200 m lång. Modell är 20 cm.", en: "Bridge 200 m. Model 20 cm.", scale: "1:1000", conv: "200 m = 20000 cm" },
            { sv: "Avstånd mellan byar 5 km. Karta 10 cm.", en: "Distance 5 km. Map 10 cm.", scale: "1:50000", conv: "5 km = 500000 cm" },
            { sv: "Ett rum är 4 m brett. Ritning 8 cm.", en: "Room 4 m wide. Drawing 8 cm.", scale: "1:50", conv: "4 m = 400 cm" },
            { sv: "En insekt är 5 mm lång. På bild 10 cm.", en: "Insect 5 mm. Image 10 cm.", scale: "20:1", conv: "10 cm = 100 mm" },
            { sv: "En cell är 0.1 mm bred. På bild 5 cm.", en: "Cell 0.1 mm. Image 5 cm.", scale: "500:1", conv: "5 cm = 50 mm" },
            { sv: "En bil är 4 m lång. Leksaksbil 10 cm.", en: "Car 4 m. Toy 10 cm.", scale: "1:40", conv: "4 m = 400 cm" }
        ];

        const s = MathUtils.randomChoice(scenarios);
        
        // Parse answer
        const parts = s.scale.split(':');
        const ansObj = { left: parseInt(parts[0]), right: parseInt(parts[1]) };

        return {
            renderData: { description: `${s.sv} (Skala?)`, answerType: 'scale' },
            token: Buffer.from(s.scale).toString('base64'),
            serverData: { 
                answer: ansObj, 
                solutionSteps: [
                    { text: lang === 'sv' ? "Viktigt: Gör först om till samma enhet." : "Important: First convert to the same unit.", latex: s.conv },
                    { text: lang === 'sv' ? "Ställ upp Bild : Verklighet och förenkla." : "Set up Image : Reality and simplify.", latex: `\\text{Scale} = ${s.scale}` }
                ] 
            }
        };
    }

    // Level 6: Area Scale
    private level6_AreaScale(lang: string): any {
        const shape = MathUtils.randomChoice(ScaleGen.AREA_SHAPES);
        const L = MathUtils.randomInt(2, 5); 
        const A = L * L;
        const baseArea = MathUtils.randomInt(2, 10);
        const bigArea = baseArea * A;

        return {
            renderData: {
                description: lang === 'sv' 
                    ? `Längdskalan är 1:${L}. Lilla arean ${baseArea} cm². Vad är stora arean?`
                    : `Length scale 1:${L}. Small area ${baseArea} cm². Big area?`,
                answerType: 'numeric',
                geometry: { type: 'compare_shapes_area', shapeType: shape, left: { label: 'Bild', area: baseArea }, right: { label: 'Verklighet', area: '?' } }
            },
            token: Buffer.from(bigArea.toString()).toString('base64'),
            serverData: { answer: bigArea, solutionSteps: [
                { text: lang === 'sv' ? "När längden ökar med 2, ökar arean med 2² = 4. Här är skalan 1:" + L : "When length triples, area becomes 3² = 9 times bigger.", latex: `A_{skala} = ${L}^2 = ${A}` },
                { text: lang === 'sv' ? `Multiplicera arean med ${A}.` : `Multiply the area by ${A}.`, latex: `${baseArea} \\cdot ${A} = \\mathbf{${bigArea}}` }
            ]}
        };
    }

    private level7_Mixed(lang: string): any {
        return this.generate(MathUtils.randomInt(2, 6), lang);
    }
}