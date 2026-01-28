import { MathUtils } from '../utils/MathUtils.js';

export class ScaleGen {
    private static readonly SHAPES = ['arrow', 'star', 'lightning', 'key', 'heart', 'cloud', 'moon', 'sun'];
    private static readonly AREA_SHAPES = ['rectangle', 'triangle', 'circle', 'square'];

    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_Concepts(lang);
            case 2: return this.level2_CalcLengthSimple(lang);
            case 3: return this.level3_MixedScenarios(lang);
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
            clues: [{ text: expl, latex: "" }]
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
                    text: lang === 'sv' ? "Verkligheten är större än bilden. Multiplicera bilden med skalan." : "Reality is larger. Multiply image by scale.", 
                    latex: `${imgVal} \\cdot ${scale} = \\mathbf{${ans}}` 
                });
            } else { // Find Image
                const real = imgVal * scale;
                ans = imgVal;
                desc = lang === 'sv' ? `I verkligheten är den ${real} cm. Skalan är ${scaleStr}. Hur lång är den på ritningen?` : `Reality is ${real} cm. Scale ${scaleStr}. Drawing?`;
                label = `${real} cm`; 
                steps.push({ 
                    text: lang === 'sv' ? "Bilden är mindre än verkligheten. Dividera verkligheten med skalan." : "Image is smaller. Divide reality by scale.", 
                    latex: `\\frac{${real}}{${scale}} = \\mathbf{${ans}}` 
                });
            }
        } else {
            // Enlargement
            if (subType === 0) { // Find Image
                ans = imgVal * scale;
                desc = lang === 'sv' ? `Verkligheten är ${imgVal} cm. Skala ${scaleStr}. Hur stor blir den på bild?` : `Reality is ${imgVal} cm. Scale ${scaleStr}. Image size?`;
                label = `${imgVal} cm`;
                steps.push({ 
                    text: lang === 'sv' ? "Bilden är en förstoring. Multiplicera verkligheten med skalan." : "Image is enlarged. Multiply reality by scale.", 
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
            clues: steps
        };
    }

    // Level 3: Mixed Scenarios (Map, House, Model, Microscope)
    private level3_MixedScenarios(lang: string): any {
        const type = MathUtils.randomChoice(['map', 'house', 'model', 'microscope']);
        
        let scale = 0, drawVal = 0, answer = 0;
        let scaleStr = "", desc = "", label = "", shape = "scale_single", icon = "";
        let steps: any[] = [];

        if (type === 'map') {
            // Map: Find Reality in km/m
            scale = MathUtils.randomChoice([10000, 20000, 50000]);
            scaleStr = `1:${scale}`;
            drawVal = MathUtils.randomInt(2, 10);
            const realCm = drawVal * scale;
            const realKm = realCm / 100000;
            const useKm = realKm >= 1;
            const unit = useKm ? 'km' : 'm';
            answer = useKm ? realKm : realCm / 100;
            
            icon = 'map'; 
            label = `${drawVal} cm`;
            
            desc = lang === 'sv' 
                ? `På en karta är avståndet ${drawVal} cm. Skalan är ${scaleStr}. Hur långt är det i verkligheten? (Svara i ${unit})`
                : `On a map distance is ${drawVal} cm. Scale is ${scaleStr}. How far is it in reality? (Answer in ${unit})`;
                
            steps = [
                { text: lang === 'sv' ? "1. Multiplicera först för att få svaret i cm." : "1. Multiply first to get answer in cm.", latex: `${drawVal} \\cdot ${scale} = ${realCm} \\text{ cm}` },
                { text: lang === 'sv' ? `2. Omvandla till ${unit}.` : `2. Convert to ${unit}.`, latex: `\\mathbf{${answer}}` }
            ];
        } 
        else if (type === 'house') {
            // House Plan: Find Reality in m
            scale = MathUtils.randomChoice([50, 100]);
            scaleStr = `1:${scale}`;
            drawVal = MathUtils.randomInt(4, 15);
            const realCm = drawVal * scale;
            answer = realCm / 100; // meters
            
            icon = 'house'; 
            label = `${drawVal} cm`; // No emoji in label
            
            desc = lang === 'sv'
                ? `På en ritning är en vägg ${drawVal} cm lång. Skalan är ${scaleStr}. Hur lång är den i verkligheten? (Svara i m)`
                : `On a blueprint a wall is ${drawVal} cm. Scale ${scaleStr}. How long in reality? (Answer in m)`;
                
            steps = [
                { text: lang === 'sv' ? "Verkligheten är större. Multiplicera med skalan." : "Reality is larger. Multiply by scale.", latex: `${drawVal} \\cdot ${scale} = ${realCm} \\text{ cm}` },
                { text: lang === 'sv' ? "Omvandla cm till meter (dela med 100)." : "Convert cm to meters (divide by 100).", latex: `\\frac{${realCm}}{100} = \\mathbf{${answer}}` }
            ];
        }
        else if (type === 'model') {
            // Model Car: Find Model size in cm given Reality in m
            scale = MathUtils.randomChoice([20, 24, 40]);
            scaleStr = `1:${scale}`;
            const realM = MathUtils.randomInt(3, 6);
            const realCm = realM * 100;
            // Ensure integer division
            let adjRealCm = realCm;
            while (adjRealCm % scale !== 0) adjRealCm += 100; // add meters until divisible
            const adjRealM = adjRealCm / 100;
            
            answer = adjRealCm / scale;
            
            icon = 'car'; 
            label = `${adjRealM} m`; // No emoji in label
            
            desc = lang === 'sv'
                ? `En bil är ${adjRealM} m lång i verkligheten. Skalan på modellen är ${scaleStr}. Hur lång är modellen på ritningen? (Svara i cm)`
                : `A car is ${adjRealM} m long. Model scale is ${scaleStr}. How long is the model? (Answer in cm)`;
                
            steps = [
                { text: lang === 'sv' ? "Gör om bilens längd till cm." : "Convert car length to cm.", latex: `${adjRealM} \\text{ m} = ${adjRealCm} \\text{ cm}` },
                { text: lang === 'sv' ? "Modellen är mindre. Dividera med skalan." : "Model is smaller. Divide by scale.", latex: `\\frac{${adjRealCm}}{${scale}} = \\mathbf{${answer}}` }
            ];
        }
        else {
            // Microscope: Enlargement. Given Drawing cm, Find Reality mm.
            scale = MathUtils.randomChoice([10, 20, 50]);
            scaleStr = `${scale}:1`;
            // Target real size in mm (integer)
            const realMm = MathUtils.randomInt(2, 8);
            answer = realMm;
            // Draw cm = (real mm * scale) / 10
            const drawCm = (realMm * scale) / 10;
            
            icon = 'ladybug';
            label = `${drawCm} cm`; // No emoji in label
            
            desc = lang === 'sv'
                ? `På en bild är en insekt ${drawCm} cm lång. Skalan är ${scaleStr} (förstoring). Hur lång är den i verkligheten? (Svara i mm)`
                : `In a picture an insect is ${drawCm} cm. Scale ${scaleStr}. Reality? (Answer in mm)`;
                
            steps = [
                { text: lang === 'sv' ? "Gör om bildens mått till mm." : "Convert picture to mm.", latex: `${drawCm} \\text{ cm} = ${drawCm*10} \\text{ mm}` },
                { text: lang === 'sv' ? "Verkligheten är mindre än den förstorade bilden. Dividera." : "Reality is smaller. Divide.", latex: `\\frac{${drawCm*10}}{${scale}} = \\mathbf{${answer}}` }
            ];
        }

        return {
            renderData: {
                description: desc,
                latex: scaleStr,
                answerType: 'numeric',
                geometry: { type: 'scale_single', shape: icon, label: label }
            },
            token: Buffer.from(answer.toString()).toString('base64'),
            clues: steps
        };
    }

    // Level 4: Determine Scale
    private level4_DetermineScale(lang: string): any {
        const factor = MathUtils.randomChoice([2, 3, 4, 5]);
        const base = MathUtils.randomInt(2, 6);
        const lg = base * factor;
        const isReduction = MathUtils.randomInt(0, 1) === 1;
        const shape = MathUtils.randomChoice(ScaleGen.SHAPES);
        
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
            clues: [
                { text: lang === 'sv' ? "Skala = Bild : Verklighet" : "Scale = Image : Reality", latex: "" },
                { text: lang === 'sv' ? "Förenkla." : "Simplify.", latex: `1:${factor}` }
            ]
        };
    }

    // Level 5: Word Problems
    private level5_NoPictures(lang: string): any {
        const scenarios = [
            { sv: "Ett torn är 50 m högt. En modell är 50 cm hög.", en: "Tower is 50 m. Model is 50 cm.", scale: "1:100", conv: "50 m = 5000 cm" },
            { sv: "En insekt är 5 mm lång. På bild 10 cm.", en: "Insect is 5 mm. Image is 10 cm.", scale: "20:1", conv: "10 cm = 100 mm" }
        ];
        const s = MathUtils.randomChoice(scenarios);
        
        return {
            renderData: { description: `${s.sv} (Skala?)`, answerType: 'scale' },
            token: Buffer.from(s.scale).toString('base64'),
            clues: [{ text: lang === 'sv' ? "Gör om till samma enhet." : "Convert to same unit.", latex: s.conv }]
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
                description: lang === 'sv' ? `Längdskala 1:${L}. Lilla arean ${baseArea}. Stora arean?` : `Length scale 1:${L}. Small area ${baseArea}. Big area?`,
                answerType: 'numeric',
                geometry: { type: 'compare_shapes_area', shapeType: shape, left: { label: 'Bild', area: baseArea }, right: { label: 'Verklighet', area: '?' } }
            },
            token: Buffer.from(bigArea.toString()).toString('base64'),
            clues: [{ latex: `A_{skala} = L_{skala}^2 = ${L}^2 = ${A}` }]
        };
    }

    private level7_Mixed(lang: string): any {
        return this.generate(MathUtils.randomInt(2, 6), lang);
    }
}