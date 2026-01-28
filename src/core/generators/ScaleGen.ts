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
                    ? `1 cm på bilden motsvarar ${ratio} cm i verkligheten.` 
                    : `1 cm on the image equals ${ratio} cm in reality.`;
            } else {
                correct = img; wrong = real;
                expl = lang === 'sv' 
                    ? `${ratio} cm på bilden är bara 1 cm i verkligheten.` 
                    : `${ratio} cm on the image is only 1 cm in reality.`;
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
                    text: lang === 'sv' ? "Verkligheten är större än bilden. Multiplicera." : "Reality is larger. Multiply.", 
                    latex: `${imgVal} \\cdot ${scale} = \\mathbf{${ans}}` 
                });
            } else { // Find Image
                const real = imgVal * scale;
                ans = imgVal;
                desc = lang === 'sv' ? `I verkligheten är den ${real} cm. Skalan är ${scaleStr}. Hur lång på ritningen?` : `Reality is ${real} cm. Scale ${scaleStr}. Drawing?`;
                label = `${real} cm`; 
                steps.push({ 
                    text: lang === 'sv' ? "Bilden är mindre än verkligheten. Dividera." : "Image is smaller. Divide.", 
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
                    text: lang === 'sv' ? "Bilden är en förstoring. Multiplicera." : "Image is enlarged. Multiply.", 
                    latex: `${imgVal} \\cdot ${scale} = \\mathbf{${ans}}` 
                });
            } else { // Find Real
                ans = imgVal;
                const drawVal = ans * scale;
                desc = lang === 'sv' ? `På bilden är den ${drawVal} cm. Skala ${scaleStr}. Hur stor är den i verkligheten?` : `Image is ${drawVal} cm. Scale ${scaleStr}. Reality?`;
                label = `${drawVal} cm`;
                steps.push({ 
                    text: lang === 'sv' ? "Verkligheten är mindre. Dividera." : "Reality is smaller. Divide.", 
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
            { text: lang === 'sv' ? "Multiplicera först för att få cm." : "Multiply first to get cm.", latex: `${cm} \\cdot ${scale} = ${realCm} \\text{ cm}` },
            { 
                text: lang === 'sv' ? `Omvandla till ${unit}.` : `Convert to ${unit}.`, 
                latex: useKm ? `\\frac{${realCm}}{100000} = \\mathbf{${ans}}` : `\\frac{${realCm}}{100} = \\mathbf{${ans}}` 
            }
        ];

        return {
            renderData: { description: desc, latex: `1:${scale}`, answerType: 'numeric', geometry: { type: 'scale_single', shape: 'map', label: `${cm} cm` } },
            token: Buffer.from(ans.toString()).toString('base64'),
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