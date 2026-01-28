import { MathUtils } from '../utils/MathUtils.js';

export class ScaleGen {
    // Matching the frontend supported list
    private static readonly SHAPES = [
        'arrow', 'star', 'lightning', 'key', 'heart', 'cloud', 'moon', 'sun'
    ];
    
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
        let desc = "", correct = "", wrong = "";

        if (qType === 1) {
            desc = lang === 'sv' ? `Visar skalan ${scaleStr} en förstoring eller en förminskning?` : `Does ${scaleStr} show an enlargement or reduction?`;
            correct = isReduction ? (lang === 'sv' ? "Förminskning" : "Reduction") : (lang === 'sv' ? "Förstoring" : "Enlargement");
            wrong = isReduction ? (lang === 'sv' ? "Förstoring" : "Enlargement") : (lang === 'sv' ? "Förminskning" : "Reduction");
        } else {
            desc = lang === 'sv' ? `Skalan är ${scaleStr}. Vad är störst?` : `Scale is ${scaleStr}. Which is larger?`;
            const real = lang === 'sv' ? "Verkligheten" : "Reality";
            const img = lang === 'sv' ? "Bilden" : "The image";
            correct = isReduction ? real : img;
            wrong = isReduction ? img : real;
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
            serverData: { answer: correct, solutionSteps: [{ text: lang === 'sv' ? "Titta på första siffran." : "Look at the first number." }] }
        };
    }

    // Level 2: Simple Length (Visuals updated)
    private level2_CalcLengthSimple(lang: string): any {
        const scale = MathUtils.randomChoice([2, 3, 4, 5, 10]);
        const imgVal = MathUtils.randomInt(2, 12);
        const isReduction = MathUtils.randomInt(0, 1) === 1;
        const scaleStr = isReduction ? `1:${scale}` : `${scale}:1`;
        const subType = MathUtils.randomInt(0, 1); // 0=Find Real, 1=Find Draw

        const shape = MathUtils.randomChoice(ScaleGen.SHAPES);
        let ans = 0, label = "", desc = "";

        if (isReduction) {
            if (subType === 0) { // Find Real
                ans = imgVal * scale;
                desc = lang === 'sv' ? `Bilden är ${imgVal} cm. Skalan är ${scaleStr}. Hur lång är den i verkligheten? (cm)` : `Image is ${imgVal} cm. Scale ${scaleStr}. Reality? (cm)`;
                label = `${imgVal} cm`;
            } else { // Find Draw
                const real = imgVal * scale;
                ans = imgVal;
                desc = lang === 'sv' ? `I verkligheten är den ${real} cm. Skalan är ${scaleStr}. Hur lång på ritningen?` : `Reality is ${real} cm. Scale ${scaleStr}. Drawing?`;
                label = `${real} cm`; 
            }
        } else {
            // Enlargement logic...
            if (subType === 0) { // Find Image
                ans = imgVal * scale;
                desc = lang === 'sv' ? `Verkligheten är ${imgVal} cm. Skala ${scaleStr}. Hur stor blir den på bild?` : `Reality is ${imgVal} cm. Scale ${scaleStr}. Image size?`;
                label = `${imgVal} cm`;
            } else { // Find Real
                ans = imgVal;
                const drawVal = ans * scale;
                desc = lang === 'sv' ? `På bilden är den ${drawVal} cm. Skala ${scaleStr}. Hur stor är den i verkligheten?` : `Image is ${drawVal} cm. Scale ${scaleStr}. Reality?`;
                label = `${drawVal} cm`;
            }
        }

        return {
            renderData: {
                description: desc,
                latex: scaleStr,
                answerType: 'numeric',
                geometry: { type: 'scale_single', shape: shape, label: label }
            },
            token: Buffer.from(ans.toString()).toString('base64'),
            serverData: { answer: ans, solutionSteps: [{ latex: `${scaleStr}` }] }
        };
    }

    // Level 3: Harder (Mixed Units)
    private level3_CalcLengthHard(lang: string): any {
        const scale = MathUtils.randomChoice([1000, 10000, 50000]);
        const isReduction = true; // Level 3 typically maps (1:X)
        const subType = MathUtils.randomInt(0, 1);
        const scaleStr = `1:${scale}`;
        const shape = MathUtils.randomChoice(ScaleGen.SHAPES);

        let ans = 0, label = "", desc = "";

        if (subType === 0) { // Find Real (Answer in m or km)
            const cm = MathUtils.randomInt(2, 15);
            const realCm = cm * scale;
            const realM = realCm / 100;
            const realKm = realM / 1000;
            
            const useKm = realKm >= 1;
            ans = useKm ? realKm : realM;
            const unit = useKm ? 'km' : 'm';
            
            desc = lang === 'sv' 
                ? `På ritningen är den ${cm} cm. Skalan är ${scaleStr}. Hur lång i verkligheten? (Svara i ${unit})`
                : `On drawing it is ${cm} cm. Scale ${scaleStr}. Reality? (Answer in ${unit})`;
            label = `${cm} cm`;
            
        } else { // Find Drawing (Given m or km, answer in cm)
            const realKm = MathUtils.randomInt(1, 10);
            const realCm = realKm * 100000;
            ans = realCm / scale; // Drawing cm
            
            // Try to keep it clean integer
            if (realCm % scale !== 0) return this.level3_CalcLengthHard(lang); // Retry

            desc = lang === 'sv'
                ? `I verkligheten är den ${realKm} km. Skalan är ${scaleStr}. Hur lång på ritningen? (Svara i cm)`
                : `Reality is ${realKm} km. Scale ${scaleStr}. Drawing? (Answer in cm)`;
            label = `${realKm} km`;
        }

        return {
            renderData: {
                description: desc,
                latex: scaleStr,
                answerType: 'numeric',
                geometry: { type: 'scale_single', shape: shape, label: label }
            },
            token: Buffer.from(ans.toString()).toString('base64'),
            serverData: { answer: ans, solutionSteps: [{ text: "cm <-> m <-> km" }] }
        };
    }

    // Level 4: Determine Scale (Visual Comparison)
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
            serverData: { answer: { left: ansLeft, right: ansRight }, solutionSteps: [{ text: "Bild : Verklighet" }] }
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
            serverData: { answer: { left: 1, right: 100 }, solutionSteps: [{ text: lang === 'sv' ? "Gör om till samma enhet." : "Convert to same unit.", latex: s.conv }] }
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
            serverData: { answer: bigArea, solutionSteps: [{ latex: `A_{skala} = L_{skala}^2 = ${L}^2 = ${A}` }] }
        };
    }

    private level7_Mixed(lang: string): any {
        return this.generate(MathUtils.randomInt(2, 6), lang);
    }
}