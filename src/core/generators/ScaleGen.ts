import { MathUtils } from '../utils/MathUtils.js';

export class ScaleGen {
    // Standard shapes for legacy/lower levels
    private static readonly SHAPES = ['arrow', 'star', 'lightning', 'key', 'heart', 'cloud', 'moon', 'sun'];

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

    // Helper to safely format numbers (replaces MathUtils.formatNumber dependency)
    private formatNum(n: number): string {
        return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    // Helper for Base64 (Node/Browser safe-ish)
    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    // Level 1: Basic Concepts (Understanding 1:X vs X:1)
    private level1_Concepts(lang: string): any {
        // Fallback for shuffle if MathUtils is missing it
        const shuffle = (arr: any[]) => arr.sort(() => Math.random() - 0.5);

        const isReduction = MathUtils.randomInt(0, 1) === 1;
        const ratio = MathUtils.randomChoice([2, 5, 10, 50, 100]);
        const scaleStr = isReduction ? `1:${ratio}` : `${ratio}:1`;
        
        const desc = lang === 'sv' 
            ? `Vad betyder skalan ${scaleStr}?`
            : `What does the scale ${scaleStr} mean?`;
            
        let correct = "";
        let wrong = "";
        const same = lang === 'sv' ? "De är lika stora." : "They are the same size.";
        
        if (isReduction) {
            correct = lang === 'sv' ? `Verkligheten är ${ratio} ggr större än bilden.` : `Reality is ${ratio}x larger than image.`;
            wrong = lang === 'sv' ? `Bilden är ${ratio} ggr större än verkligheten.` : `Image is ${ratio}x larger than reality.`;
        } else {
            correct = lang === 'sv' ? `Bilden är ${ratio} ggr större än verkligheten.` : `Image is ${ratio}x larger than reality.`;
            wrong = lang === 'sv' ? `Verkligheten är ${ratio} ggr större än bilden.` : `Reality is ${ratio}x larger than image.`;
        }

        // Ensure options array is valid
        const options = shuffle([correct, wrong, same]);

        return {
            renderData: {
                description: desc,
                answerType: 'multiple_choice',
                options: options,
                geometry: { 
                    type: 'scale_compare', 
                    leftLabel: lang === 'sv' ? 'Bild' : 'Image', 
                    rightLabel: lang === 'sv' ? 'Verklighet' : 'Reality',
                    leftValue: isReduction ? 1 : ratio,
                    rightValue: isReduction ? ratio : 1,
                    shape: 'arrow' // Safe shape
                }
            },
            token: this.toBase64(correct),
            clues: []
        };
    }

    // Level 2: Simple Calculation
    private level2_CalcLengthSimple(lang: string): any {
        const scale = MathUtils.randomChoice([2, 3, 4, 5, 10]);
        const imageSize = MathUtils.randomInt(2, 12);
        const realSize = imageSize * scale;

        const desc = lang === 'sv'
            ? `En bild är ritad i skala 1:${scale}. Bilden är ${imageSize} cm bred. Hur bred är den i verkligheten?`
            : `A picture is drawn in scale 1:${scale}. The picture is ${imageSize} cm wide. How wide is it in reality?`;

        return {
            renderData: {
                description: desc,
                answerType: 'numeric',
                geometry: { 
                    type: 'scale_compare', 
                    leftLabel: lang === 'sv' ? 'Bild' : 'Image', 
                    rightLabel: lang === 'sv' ? 'Verklighet' : 'Reality',
                    leftValue: 1,
                    rightValue: scale,
                    shape: MathUtils.randomChoice(ScaleGen.SHAPES)
                },
                suffix: 'cm'
            },
            token: this.toBase64(realSize.toString()),
            clues: [
                { text: lang === 'sv' ? "Multiplicera med skalan." : "Multiply by the scale.", latex: `${imageSize} \\\\cdot ${scale}` }
            ]
        };
    }

    // Level 3: Mixed Scenarios (Fixed formatting)
    private level3_MixedScenarios(lang: string): any {
        const scenarioType = MathUtils.randomChoice([0, 1, 2, 3]);

        let desc = "";
        let answer = 0;
        let suffix = "";
        let visualData: any = {};
        let clues: any[] = [];

        // Scenario 0: Map
        if (scenarioType === 0) {
            const scaleBase = MathUtils.randomChoice([10000, 20000, 50000]); 
            const mapCm = MathUtils.randomInt(2, 8); 
            const realCm = mapCm * scaleBase;
            const realKm = realCm / 100000; 
            
            const useMeters = realKm < 1;
            answer = useMeters ? realCm / 100 : realKm;
            suffix = useMeters ? 'm' : 'km';

            desc = lang === 'sv'
                ? `På en karta i skala 1:${this.formatNum(scaleBase)} är avståndet mellan två stugor ${mapCm} cm. Hur långt är det i verkligheten? Svara i ${suffix}.`
                : `On a map with scale 1:${this.formatNum(scaleBase)}, the distance between two cabins is ${mapCm} cm. How far is it in reality? Answer in ${suffix}.`;

            visualData = {
                type: 'scale_compare',
                leftLabel: lang === 'sv' ? 'Karta' : 'Map',
                rightLabel: lang === 'sv' ? 'Verklighet' : 'Reality',
                leftValue: 1,
                rightValue: scaleBase,
                shape: 'map' 
            };

            clues = [
                {
                    text: lang === 'sv' ? "Räkna ut cm i verkligheten." : "Calc real cm.",
                    latex: `${mapCm} \\\\cdot ${this.formatNum(scaleBase)} = ${this.formatNum(realCm)} \\\\text{ cm}`
                },
                {
                    text: lang === 'sv' ? `Omvandla cm till ${suffix}.` : `Convert cm to ${suffix}.`,
                    latex: useMeters ? `${realCm} / 100 = ${answer}` : `${realCm} / 100000 = ${answer}`
                }
            ];
        }

        // Scenario 1: Blueprint
        else if (scenarioType === 1) {
            const scale = MathUtils.randomChoice([20, 40, 50, 100]);
            const realM = MathUtils.randomInt(30, 80) / 10; 
            const realCm = realM * 100;
            const drawingCm = realCm / scale;

            answer = drawingCm;
            suffix = 'cm';

            desc = lang === 'sv'
                ? `En vägg är ${realM} meter lång i verkligheten. Hur lång blir linjen på en ritning i skala 1:${scale}? Svara i cm.`
                : `A wall is ${realM} meters long in reality. How long is the line on a blueprint with scale 1:${scale}? Answer in cm.`;

            visualData = {
                type: 'scale_compare',
                leftLabel: lang === 'sv' ? 'Ritning' : 'Blueprint',
                rightLabel: lang === 'sv' ? 'Verklighet' : 'Reality',
                leftValue: 1,
                rightValue: scale,
                shape: 'house' 
            };

            clues = [
                {
                    text: lang === 'sv' ? "Gör om till cm." : "Convert to cm.",
                    latex: `${realM} \\\\text{ m} = ${realCm} \\\\text{ cm}`
                },
                {
                    text: lang === 'sv' ? "Dela med skalan." : "Divide by scale.",
                    latex: `${realCm} / ${scale} = ${answer}`
                }
            ];
        }

        // Scenario 2: Model
        else if (scenarioType === 2) {
            const scale = MathUtils.randomChoice([18, 24, 87]); 
            let realM = 4.5;
            if (scale === 18) realM = MathUtils.randomChoice([3.6, 4.5, 5.4]);
            if (scale === 24) realM = MathUtils.randomChoice([4.8, 7.2, 9.6]);
            if (scale === 87) realM = MathUtils.randomChoice([17.4, 26.1]);

            const realCm = Math.round(realM * 100);
            answer = realCm / scale; 
            suffix = 'cm';

            desc = lang === 'sv'
                ? `Ett tåg är ${realM} meter långt. Hur lång blir en modell i skala 1:${scale}? Svara i cm.`
                : `A train is ${realM} meters long. How long is the model in scale 1:${scale}? Answer in cm.`;

            visualData = {
                type: 'scale_compare',
                leftLabel: lang === 'sv' ? 'Modell' : 'Model',
                rightLabel: lang === 'sv' ? 'Verklighet' : 'Reality',
                leftValue: 1,
                rightValue: scale,
                shape: 'car'
            };

            clues = [
                {
                    text: lang === 'sv' ? "Gör om till cm." : "Convert to cm.",
                    latex: `${realM} \\\\text{ m} = ${realCm} \\\\text{ cm}`
                },
                {
                    text: lang === 'sv' ? "Dela med skalan." : "Divide by scale.",
                    latex: `${realCm} / ${scale} = ${answer}`
                }
            ];
        }

        // Scenario 3: Magnification
        else {
            const scale = MathUtils.randomChoice([10, 20, 50, 100]);
            const realMm = MathUtils.randomChoice([0.5, 1, 2, 4, 5]); 
            const imageMm = realMm * scale;
            answer = imageMm / 10; // cm
            suffix = 'cm';

            desc = lang === 'sv'
                ? `En insekt är ${realMm} mm lång. Den fotograferas i skala ${scale}:1. Hur lång blir insekten på bilden? Svara i cm.`
                : `An insect is ${realMm} mm long. It is photographed in scale ${scale}:1. How long is the insect in the picture? Answer in cm.`;

            visualData = {
                type: 'scale_compare',
                leftLabel: lang === 'sv' ? 'Bild' : 'Image',
                rightLabel: lang === 'sv' ? 'Verklighet' : 'Reality',
                leftValue: scale,
                rightValue: 1,
                shape: 'ladybug' 
            };

            clues = [
                {
                    text: lang === 'sv' ? "Skalan X:1 betyder förstoring." : "X:1 means magnification.",
                    latex: `${realMm} \\\\text{ mm} \\\\cdot ${scale} = ${imageMm} \\\\text{ mm}`
                },
                {
                    text: lang === 'sv' ? "Svara i cm." : "Answer in cm.",
                    latex: `${imageMm} / 10 = ${answer}`
                }
            ];
        }

        return {
            renderData: {
                description: desc,
                answerType: 'numeric',
                geometry: visualData,
                suffix: suffix
            },
            token: this.toBase64(answer.toString()),
            clues: clues
        };
    }

    // Level 4: Determine Scale
    private level4_DetermineScale(lang: string): any {
        const scale = MathUtils.randomChoice([10, 20, 50, 100]);
        const drawCm = MathUtils.randomInt(2, 8);
        const realM = (drawCm * scale) / 100;

        const desc = lang === 'sv'
            ? `Ett rum är ${realM} m långt. På ritningen är det ${drawCm} cm. Vilken skala är ritningen? Svara som 1:X.`
            : `A room is ${realM} m long. On the drawing it is ${drawCm} cm. What is the scale? Answer as 1:X.`;

        return {
            renderData: {
                description: desc,
                answerType: 'text',
                placeholder: '1:...'
            },
            token: this.toBase64(`1:${scale}`),
            clues: [
                { text: lang === 'sv' ? "Gör om till samma enhet (cm)." : "Convert to same unit (cm).", latex: `${realM} \\\\text{ m} = ${realM*100} \\\\text{ cm}` },
                { text: lang === 'sv' ? "Jämför bild och verklighet." : "Compare image and reality.", latex: `${drawCm} : ${realM*100}` },
                { text: lang === 'sv' ? "Förkorta." : "Simplify.", latex: `1 : ${(realM*100)/drawCm}` }
            ]
        };
    }

    // Level 5: Word Problems
    private level5_NoPictures(lang: string): any {
        const data = this.level3_MixedScenarios(lang);
        data.renderData.geometry = null;
        return data;
    }

    // Level 6: Area Scale (Fixed Visuals)
    private level6_AreaScale(lang: string): any {
        const shape = MathUtils.randomChoice(['rectangle', 'triangle']);
        const L = MathUtils.randomInt(2, 5); 
        const A = L * L; 
        
        let width = 0, height = 0, baseArea = 0;
        let subtype: string | undefined = undefined;

        if (shape === 'rectangle') {
            width = MathUtils.randomInt(2, 6);
            height = MathUtils.randomInt(2, 6);
            baseArea = width * height;
        } else if (shape === 'triangle') {
            width = MathUtils.randomInt(2, 6); 
            height = MathUtils.randomInt(2, 6); 
            if ((width * height) % 2 !== 0) width += 1; 
            subtype = 'isosceles';
            baseArea = (width * height) / 2;
        }

        const bigArea = baseArea * A;
        const scaledWidth = width * L;
        const scaledHeight = height * L;

        const desc = lang === 'sv' 
            ? `Längdskalan är 1:${L}. Lilla arean är ${baseArea} cm². Hur stor är den stora arean?`
            : `Length scale 1:${L}. Small area ${baseArea} cm². How big is the large area?`;

        return {
            renderData: {
                description: desc,
                answerType: 'numeric',
                geometry: { 
                    type: 'compare_shapes_area', 
                    shapeType: shape, 
                    // Left (Image)
                    left: { 
                        width: width, height: height, subtype: subtype,
                        label: lang === 'sv'?'Bild':'Image', area: baseArea,
                        labels: { b: width, h: height } 
                    }, 
                    // Right (Reality - Scaled)
                    right: { 
                        width: scaledWidth, height: scaledHeight, subtype: subtype,
                        label: lang === 'sv'?'Verklighet':'Reality', area: '?',
                        labels: { b: scaledWidth, h: scaledHeight } 
                    } 
                },
                suffix: 'cm²'
            },
            token: this.toBase64(bigArea.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? "Area skalan = (Längdskalan)²" : "Area scale = (Length scale)²", 
                    latex: `A_{skala} = ${L}^2 = ${A}` 
                },
                { 
                    text: lang === 'sv' ? `Arean blir ${A} gånger större.` : `Area becomes ${A} times larger.`, 
                    latex: `${baseArea} \\\\cdot ${A} = ${bigArea}` 
                }
            ]
        };
    }

    // Level 7: Mixed Bag
    private level7_Mixed(lang: string): any {
        const subLevel = MathUtils.randomInt(2, 6);
        return this.generate(subLevel, lang);
    }
}