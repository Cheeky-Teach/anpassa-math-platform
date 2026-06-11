import { MathUtils } from '../utils/MathUtils.js';
import { enrichQuestionMetadata } from '../utils/WordProblemDecorator.js';

export class LinearGraphGenerator {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        // Adaptive Fallback: If Level 1 concepts are mastered, push to Level 2
        if (level === 1 && options.hideConcept && options.exclude?.includes('intercept_id')) {
            return this.level2_FindK_Pos(lang, undefined, options);
        }

        let questionData: any;

        switch (level) {
            case 1: questionData = this.level1_FindM(lang, undefined, options); break;
            case 2: questionData = this.level2_FindK_Pos(lang, undefined, options); break;
            case 3: questionData = this.level3_FindK_Neg(lang, undefined, options); break;
            case 4: questionData = this.level4_FindFunction(lang, undefined, options); break;
            case 5: questionData = this.level5_Mixed(lang, options); break;
            default: questionData = this.level1_FindM(lang, undefined, options); break;
        }

        // 🟢 Run through the decorator
        enrichQuestionMetadata(questionData);

        // 🟢 Practice Mode Level-Wide Override
        const WORD_PROBLEM_ELIGIBLE_LEVELS = [1, 2, 3, 4, 5];
        if (WORD_PROBLEM_ELIGIBLE_LEVELS.includes(level)) {
            if (!questionData.metadata) questionData.metadata = {};
            questionData.metadata.levelSupportsWordProblems = true;
        }

        return questionData;
    }

    /**
     * Targeted Generation for Question Studio
     */
    public generateByVariation(key: string, lang: string = 'sv', options: any = {}): any {
        switch (key) {
            case 'intercept_id':
                return this.level1_FindM(lang, key, options);
            case 'slope_pos_int':
            case 'slope_pos_frac':
                return this.level2_FindK_Pos(lang, key, options);
            case 'slope_neg_int':
            case 'slope_neg_frac':
                return this.level3_FindK_Neg(lang, key, options);
            case 'eq_standard':
            case 'eq_no_m':
            case 'eq_horizontal':
                return this.level4_FindFunction(lang, key, options);
            default:
                return this.generate(1, lang, options);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    private getVariation(pool: {key: string, type: 'concept' | 'calculate'}[], options: any): string {
        let filtered = pool;
        if (options?.exclude && options.exclude.length > 0) {
            filtered = filtered.filter(v => !options.exclude.includes(v.key));
        }
        if (options?.hideConcept) {
            filtered = filtered.filter(v => v.type !== 'concept');
        }
        if (filtered.length === 0) return pool[pool.length - 1].key;
        return MathUtils.randomChoice(filtered.map(v => v.key));
    }

    // --- LEVEL 1: Intercept (m) ---
    // --- LEVEL 1: Intercept (m) ---
    private level1_FindM(lang: string, variationKey?: string, options: any = {}): any {
        const v = variationKey || 'intercept_id';
        const m = MathUtils.randomInt(-6, 6);
        const k = MathUtils.randomChoice([1, -1, 2, 0.5]);

        return {
            renderData: {
                graph: { range: 10, lines: [{ slope: k, intercept: m, color: '#2563eb' }] },
                description: lang === 'sv' 
                    ? "Var krockar linjen med den stående y-axeln? Bestäm linjens m-värde." 
                    : "Where does the line crash into the vertical y-axis? Find the m-value.",
                interceptorToken: `${m} ; ${k}`,
                answerType: 'numeric'
            },
            token: this.toBase64(m.toString()),
            variationKey: v, type: 'concept',
            clues: [
                { 
                    text: lang === 'sv' ? "Bokstaven m är linjens startport. Det är den höjd där den blå linjen krockar med den stående mittlinjen (y-axeln)." : "The letter m is the line's starting gate. It is the exact height where the blue line crashes through the vertical center line (y-axis).", 
                    latex: `\\text{Startpunkt: } (0, m)` 
                },
                { 
                    text: lang === 'sv' ? "Leta upp den stående mittlinjen och följ den med fingret tills den möter den blå linjen." : "Find the vertical center line and follow it with your finger until it intersects with the blue line.", 
                    latex: `\\text{Kolla längs stående axeln}` 
                },
                { 
                    text: lang === 'sv' ? `Vi ser att linjen krockar med mittlinjen på höjden ${m}. Detta är vårt m-värde.` : `We see that the line hits the center axis at the height of ${m}. This is our m-value.`, 
                    latex: `m = \\mathbf{${m}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: m = ${m}` : `Answer: m = ${m}`, 
                    latex: `m = ${m}` 
                }
            ],
            metadata: { variation_key: v, difficulty: 1 }
        };
    }

    // --- LEVEL 2 & 3: Slope (k) ---
    // --- LEVEL 2 & 3: Slope (k) ---
    private getDetailedSlopeClues(k: number, kDisplay: string, lang: string, dy: number, dx: number) {
        const isPos = k > 0;
        const actionTextSv = isPos 
            ? `klättra UPPÅT med ${Math.abs(dy)} steg` 
            : `klättra NEDÅT med ${Math.abs(dy)} steg`;
        const actionTextEn = isPos 
            ? `climb UPWARDS by ${Math.abs(dy)} steps` 
            : `climb DOWNWARDS by ${Math.abs(dy)} steps`;

        return [
            { 
                text: lang === 'sv' 
                    ? "Bokstaven k beskriver linjens trappsteg. Det talar om hur många steg vi klättrar upp eller ner när vi tar kliv åt höger." 
                    : "The letter k describes the line's steps. It tells us how many spaces we climb up or down when we take steps to the right.", 
                latex: `k = \\frac{\\text{steg i höjdled}}{\\text{steg åt höger}}` 
            },
            { 
                text: lang === 'sv' 
                    ? "Hitta ett ställe där linjen korsar ett hörn i rutnätet helt perfekt och starta där." 
                    : "Find a spot where the line crosses a grid corner perfectly and start tracking from there.", 
                latex: `\\text{Hitta ett rent rutan-hörn}` 
            },
            { 
                text: lang === 'sv' 
                    ? `Ta nu exakt ${dx} steg åt höger i rutnätet.` 
                    : `Now move exactly ${dx} steps to the right along the grid squares.`, 
                latex: `\\text{Steg åt höger} = \\mathbf{${dx}}` 
            },
            { 
                text: lang === 'sv' 
                    ? `För att träffa linjen igen måste vi ${actionTextSv}.` 
                    : `To land back on the line again, we must ${actionTextEn}.`, 
                latex: `\\text{Steg i höjdled} = \\mathbf{${dy}}` 
            },
            { 
                text: lang === 'sv' 
                    ? "Skriv ut bråket genom att sätta höjd-stegen däruppe och höger-stegen där nere:" 
                    : "Write out the step fraction by putting the height steps on top and the right steps on the bottom:", 
                latex: `k = \\frac{\\mathbf{${dy}}}{\\mathbf{${dx}}}` 
            },
            { 
                text: lang === 'sv' ? `Det ger oss lutningen k = ${kDisplay}.` : `This gives us the slope k = ${kDisplay}.`, 
                latex: `k = \\mathbf{${kDisplay}}` 
            }
        ];
    }

    private level2_FindK_Pos(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'slope_pos_int', type: 'calculate' },
            { key: 'slope_pos_frac', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        
        let dy: number, dx: number, kDisplay: string;
        if (v === 'slope_pos_int') {
            dy = MathUtils.randomInt(1, 3);
            dx = 1;
            kDisplay = dy.toString();
        } else {
            dx = MathUtils.randomChoice([2, 4, 5]);
            dy = 1;
            kDisplay = `1/${dx}`;
        }

        return {
            renderData: {
                graph: { range: 10, lines: [{ slope: dy/dx, intercept: MathUtils.randomInt(-3, 1), color: '#16a34a' }] },
                description: lang === 'sv' ? "Bestäm linjens lutning (k-värde)." : "Determine the slope (k-value) of the line.",
                interceptorToken: `${dy} ; ${dx} ; ${kDisplay}`,
                answerType: 'text'
            },
            token: this.toBase64(kDisplay),
            variationKey: v, type: 'calculate',
            clues: this.getDetailedSlopeClues(dy/dx, kDisplay, lang, dy, dx),
            metadata: { variation_key: v, difficulty: 2 }
        };
    }

    private level3_FindK_Neg(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'slope_neg_int', type: 'calculate' },
            { key: 'slope_neg_frac', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        
        let dy: number, dx: number, kDisplay: string;
        if (v === 'slope_neg_int') {
            dy = MathUtils.randomInt(-3, -1);
            dx = 1;
            kDisplay = dy.toString();
        } else {
            dx = MathUtils.randomChoice([2, 3, 5]);
            dy = -1;
            kDisplay = `-1/${dx}`;
        }

        return {
            renderData: {
                graph: { range: 10, lines: [{ slope: dy/dx, intercept: MathUtils.randomInt(0, 4), color: '#dc2626' }] },
                description: lang === 'sv' ? "Vad är linjens k-värde? Tänk på att linjen lutar nedåt!" : "What is the k-value of the line? Remember that it slopes downward!",
                interceptorToken: `${dy} ; ${dx} ; ${kDisplay}`,
                answerType: 'text'
            },
            token: this.toBase64(kDisplay),
            variationKey: v, type: 'calculate',
            clues: this.getDetailedSlopeClues(dy/dx, kDisplay, lang, dy, dx),
            metadata: { variation_key: v, difficulty: 3 }
        };
    }

    // --- LEVEL 4: Full Function (y = kx + m) ---
    private level4_FindFunction(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'eq_standard', type: 'calculate' },
            { key: 'eq_no_m', type: 'calculate' },
            { key: 'eq_horizontal', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        
        let k = MathUtils.randomInt(-3, 3);
        let m = MathUtils.randomInt(-4, 4);

        if (v === 'eq_no_m') m = 0;
        if (v === 'eq_horizontal') { k = 0; if (m === 0) m = 3; }
        if (v === 'eq_standard' && k === 0) k = 1;

        // Assembly logic for y = kx + m
        let eq = "y=";
        if (k !== 0) {
            if (k === 1) eq += "x";
            else if (k === -1) eq += "-x";
            else eq += `${k}x`;
            
            if (m > 0) eq += `+${m}`;
            else if (m < 0) eq += `${m}`;
        } else {
            eq += `${m}`;
        }

        return {
            renderData: {
                graph: { range: 10, lines: [{ slope: k, intercept: m, color: '#7c3aed' }] },
                description: lang === 'sv' ? "Bestäm linjens ekvation på formen y = kx + m." : "Determine the equation of the line in the form y = kx + m.",
                interceptorToken: `${k} ; ${m} ; ${eq}`,
                answerType: 'text'
            },
            token: this.toBase64(eq.replace(/\s/g, "")),
            variationKey: v, type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' 
                        ? "Hela formeln byggs pussel-likt genom att leta reda på två dolda pusselbitar: startporten (m) och trappsteget (k)." 
                        : "The entire formula is built puzzle-style by finding two hidden pieces: the starting gate (m) and the step-rate (k).", 
                    latex: `y = kx + m` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Pusselbit 1: Kolla var den lila linjen krockar med den stående mittlinjen. Den träffar på höjden ${m}, så m = ${m}.` 
                        : `Puzzle Piece 1: Check where the purple line crashes through the vertical center axis. It hits at height ${m}, so m = ${m}.`, 
                    latex: `m = \\mathbf{${m}}` 
                },
                { 
                    text: lang === 'sv' 
                        ? (k === 0 
                            ? "Pusselbit 2: Linjen är helt platt! Det betyder att den varken klättrar upp eller ner när vi går åt höger. Steget k är noll." 
                            : `Pusselbit 2: Starta i en punkt och ta ett kliv till höger i rutorna. Vi tvingas klättra med ${k} steg för att hamna på linjen igen, så k = ${k}.`)
                        : (k === 0 
                            ? "Puzzle Piece 2: The line is completely flat! This means it neither climbs up nor down when moving right. The step-rate k is zero." 
                            : `Puzzle Piece 2: Start at a point and take one step right in the grid. We must climb by ${k} spaces to find the line again, so k = ${k}.`), 
                    latex: `k = \\mathbf{${k}}` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Pussla ihop delarna i mallen y = kx + m genom att byta ut k mot ${k} och m mot ${m}.` 
                        : `Assemble the pieces into the y = kx + m template by replacing k with ${k} and m with ${m}.`, 
                    latex: `y = \\mathbf{(${k})x + (${m})}` 
                },
                { 
                    text: lang === 'sv' 
                        ? "Städa bort osynliga ettor eller nollor för att skriva det färdiga, rena uttrycket." 
                        : "Clean up any hidden ones or zeroes to express the final clean equation state.", 
                    latex: `\\mathbf{${eq}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${eq}` : `Answer: ${eq}`, 
                    latex: `${eq}` 
                }
            ],
            metadata: { variation_key: v, difficulty: 4 }
        };
    }

    private level5_Mixed(lang: string, options: any): any {
        const lvl = MathUtils.randomInt(1, 4);
        const res = this.generate(lvl, lang, options);
        res.metadata.mixed = true;
        return res;
    }
}