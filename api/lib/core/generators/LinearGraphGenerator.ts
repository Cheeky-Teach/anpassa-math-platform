// src/generators/LinearGraphGenerator.ts

import { MathUtils } from '../utils/MathUtils.js';
import { enrichQuestionMetadata } from '../utils/WordProblemDecorator.js';

export interface RealisticProfile {
    type: 'wage' | 'taxi' | 'phone' | 'tank';
    k: number;
    m: number;
    xLabel: string;
    yLabel: string;
    xUnit: string;
    yUnit: string;
    graphConfig: any;
}

export class LinearGraphGenerator {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        let questionData: any;

        switch (level) {
            case 1: questionData = this.level1_FindM(lang, undefined, options); break;
            case 2: questionData = this.level2_FindK(lang, undefined, options); break;
            case 3: questionData = this.level3_TableFunctions(lang, undefined, options); break;
            case 4: questionData = this.level4_GraphFormulaAndEval(lang, undefined, options); break;
            case 5: questionData = this.level5_ReasoningAndParallel(lang, undefined, options); break;
            case 6: questionData = this.level6_ScaledRealWorld(lang, undefined, options); break;
            default: questionData = this.level1_FindM(lang, undefined, options); break;
        }

        enrichQuestionMetadata(questionData);

        const WORD_PROBLEM_ELIGIBLE_LEVELS = [1, 2, 3, 4, 5, 6];
        if (WORD_PROBLEM_ELIGIBLE_LEVELS.includes(level)) {
            if (!questionData.metadata) questionData.metadata = {};
            questionData.metadata.levelSupportsWordProblems = true;
        }

        return questionData;
    }

    public generateByVariation(key: string, lang: string = 'sv', options: any = {}): any {
        switch (key) {
            case 'intercept_id':
                return this.level1_FindM(lang, key, options);
            case 'slope_pos_int':
            case 'slope_pos_frac':
            case 'slope_neg_int':
            case 'slope_neg_frac':
                return this.level2_FindK(lang, key, options);
            case 'table_to_function':
            case 'table_fill_function':
                return this.level3_TableFunctions(lang, key, options);
            case 'eq_standard':
            case 'eq_no_m':
            case 'eq_horizontal':
            case 'graph_eval_point':
                return this.level4_GraphFormulaAndEval(lang, key, options);
            case 'point_on_line':
            case 'parallel_lines_id':
                return this.level5_ReasoningAndParallel(lang, key, options);
            case 'scaled_intercept':
            case 'scaled_slope':
            case 'scaled_equation':
                return this.level6_ScaledRealWorld(lang, key, options);
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

    private generateTableData(k: number, m: number, count: number = 4) {
        const isHorizontal = Math.random() > 0.5;
        const startX = MathUtils.randomChoice([0, 1, -1]);
        const rows: number[][] = [];

        for (let i = 0; i < count; i++) {
            const x = startX + i;
            const y = k * x + m;
            rows.push([x, y]);
        }

        return {
            table: {
                type: 'frequency_table',
                orientation: isHorizontal ? 'horizontal' : 'vertical',
                headers: ['x', 'y'],
                rows
            },
            startX,
            rows,
            isHorizontal
        };
    }

    private formatEquation(k: number, m: number): string {
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
        return eq;
    }

    /**
     * Level 6 Realistic Profiles with custom scales and clean grid intersections
     */
    private getRealisticProfile(lang: string = 'sv'): RealisticProfile {
        const archetypes = ['wage', 'taxi', 'phone', 'tank'] as const;
        const type = MathUtils.randomChoice(archetypes);

        if (type === 'wage') {
            const k = MathUtils.randomChoice([100, 120, 140, 150]); // Timlön
            const m = MathUtils.randomChoice([0, 100, 200, 300]);   // Startbonus
            return {
                type,
                k,
                m,
                xLabel: lang === 'sv' ? "Arbetstid (h)" : "Work Time (h)",
                yLabel: lang === 'sv' ? "Lön (kr)" : "Pay ($)",
                xUnit: "h",
                yUnit: "kr",
                graphConfig: {
                    xMin: 0,
                    xMax: 8,
                    xGridStep: 1,
                    xLabelStep: 2,
                    xLabel: lang === 'sv' ? "Tid i timmar (x)" : "Time in hours (x)",
                    yMin: 0,
                    yMax: 1400,
                    yGridStep: 100,
                    yLabelStep: 200,
                    yLabel: lang === 'sv' ? "Lön i kr (y)" : "Pay in $ (y)",
                    lines: [{ slope: k, intercept: m, color: '#2563eb' }]
                }
            };
        }

        if (type === 'taxi') {
            const k = MathUtils.randomChoice([15, 20, 25]); // kr per km
            const m = MathUtils.randomChoice([40, 50, 60]); // Fast startavgift
            return {
                type,
                k,
                m,
                xLabel: lang === 'sv' ? "Sträcka (km)" : "Distance (km)",
                yLabel: lang === 'sv' ? "Pris (kr)" : "Price ($)",
                xUnit: "km",
                yUnit: "kr",
                graphConfig: {
                    xMin: 0,
                    xMax: 16,
                    xGridStep: 2,
                    xLabelStep: 4,
                    xLabel: lang === 'sv' ? "Sträcka i km (x)" : "Distance in km (x)",
                    yMin: 0,
                    yMax: 450,
                    yGridStep: 50,
                    yLabelStep: 100,
                    yLabel: lang === 'sv' ? "Kostnad i kr (y)" : "Cost in $ (y)",
                    lines: [{ slope: k, intercept: m, color: '#059669' }]
                }
            };
        }

        if (type === 'phone') {
            const k = MathUtils.randomChoice([20, 30, 40]); // kr per GB
            const m = MathUtils.randomChoice([99, 149, 199]); // Fast månadspris
            return {
                type,
                k,
                m,
                xLabel: lang === 'sv' ? "Extra surf (GB)" : "Extra Data (GB)",
                yLabel: lang === 'sv' ? "Månadskostnad (kr)" : "Monthly Cost ($)",
                xUnit: "GB",
                yUnit: "kr",
                graphConfig: {
                    xMin: 0,
                    xMax: 10,
                    xGridStep: 1,
                    xLabelStep: 2,
                    xLabel: lang === 'sv' ? "Data i GB (x)" : "Data in GB (x)",
                    yMin: 0,
                    yMax: 500,
                    yGridStep: 50,
                    yLabelStep: 100,
                    yLabel: lang === 'sv' ? "Pris i kr (y)" : "Cost in $ (y)",
                    lines: [{ slope: k, intercept: m, color: '#7c3aed' }]
                }
            };
        }

        // 'tank' archetype: decreasing fuel tank (negative slope)
        const k = MathUtils.randomChoice([-5, -8, -10]); // liters consumed per unit
        const m = MathUtils.randomChoice([50, 60, 70]);  // full tank liters
        return {
            type,
            k,
            m,
            xLabel: lang === 'sv' ? "Körsträcka (mil)" : "Distance (miles)",
            yLabel: lang === 'sv' ? "Bränsle kvar (L)" : "Fuel Left (L)",
            xUnit: "mil",
            yUnit: "L",
            graphConfig: {
                xMin: 0,
                xMax: 8,
                xGridStep: 1,
                xLabelStep: 2,
                xLabel: lang === 'sv' ? "Körsträcka i mil (x)" : "Distance driven (x)",
                yMin: 0,
                yMax: 80,
                yGridStep: 10,
                yLabelStep: 20,
                yLabel: lang === 'sv' ? "Bränslenivå i liter (y)" : "Fuel level (y)",
                lines: [{ slope: k, intercept: m, color: '#dc2626' }]
            }
        };
    }

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
                    ? "Lutningen k beskriver linjens differens i rutnätet. Det talar om hur mycket linjen förändras i höjdled för varje steg åt höger." 
                    : "The slope k describes the rate of change. It tells us how much the line rises or drops for each step to the right.", 
                latex: `k = \\frac{\\text{steg i höjdled (\\Delta y)}}{\\text{steg åt höger (\\Delta x)}}` 
            },
            { 
                text: lang === 'sv' 
                    ? "Hitta en punkt där linjen korsar rutnätet precis i ett hörn." 
                    : "Find a spot where the line crosses a grid corner cleanly.", 
                latex: `\\text{Starta i en heltalspunkt}` 
            },
            { 
                text: lang === 'sv' 
                    ? `Ta nu ${dx} steg åt höger längs rutnätet:` 
                    : `Now move ${dx} steps to the right:`, 
                latex: `\\Delta x = \\mathbf{${dx}}` 
            },
            { 
                text: lang === 'sv' 
                    ? `För att träffa linjen igen måste vi ${actionTextSv}:` 
                    : `To land on the line again, we must ${actionTextEn}:`, 
                latex: `\\Delta y = \\mathbf{${dy}}` 
            },
            { 
                text: lang === 'sv' 
                    ? "Ställ upp bråket med höjdled däruppe och vågrätt där nere:" 
                    : "Set up the ratio with rise on top and run on the bottom:", 
                latex: `k = \\frac{\\mathbf{${dy}}}{\\mathbf{${dx}}} = \\mathbf{${kDisplay}}` 
            },
            { 
                text: lang === 'sv' ? `Svar: k = ${kDisplay}` : `Answer: k = ${kDisplay}`, 
                latex: `k = ${kDisplay}` 
            }
        ];
    }

    // =========================================================================
    // LEVEL 1: Intercept (m-värde) - Standard Integer Grid
    // =========================================================================
    private level1_FindM(lang: string, variationKey?: string, options: any = {}): any {
        const v = variationKey || 'intercept_id';
        const m = MathUtils.randomInt(-6, 6);
        const k = MathUtils.randomChoice([1, -1, 2, -2, 0.5]);

        return {
            renderData: {
                graph: { range: 10, lines: [{ slope: k, intercept: m, color: '#2563eb' }] },
                description: lang === 'sv' 
                    ? "Var skär linjen den stående y-axeln? Bestäm linjens m-värde (starttal)." 
                    : "Where does the line cross the vertical y-axis? Determine the m-value (start value).",
                interceptorToken: `${m} ; ${k}`,
                answerType: 'numeric'
            },
            token: this.toBase64(m.toString()),
            variationKey: v, 
            type: 'concept',
            clues: [
                { 
                    text: lang === 'sv' 
                        ? "Bokstaven m är linjens starttal (startport). Det är punkten där linjen korsar y-axeln (där x = 0)." 
                        : "The letter m is the line's starting value. It is the point where the line crosses the y-axis (where x = 0).", 
                    latex: `\\text{Skärningspunkt: } (0, m)` 
                },
                { 
                    text: lang === 'sv' 
                        ? "Följ den stående y-axeln med blicken tills du möter linjen." 
                        : "Follow the vertical y-axis until you intersect the line.", 
                    latex: `x = 0` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Linjen korsar y-axeln på höjden ${m}. Starttalet m är därför ${m}.` 
                        : `The line crosses the y-axis at height ${m}. The m-value is therefore ${m}.`, 
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

    // =========================================================================
    // LEVEL 2: Slope (k-värde) - Standard Integer Grid
    // =========================================================================
    private level2_FindK(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'slope_pos_int', type: 'calculate' },
            { key: 'slope_pos_frac', type: 'calculate' },
            { key: 'slope_neg_int', type: 'calculate' },
            { key: 'slope_neg_frac', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        let dy: number, dx: number, kDisplay: string, color: string;

        if (v === 'slope_pos_int') {
            dy = MathUtils.randomInt(1, 3);
            dx = 1;
            kDisplay = dy.toString();
            color = '#16a34a';
        } else if (v === 'slope_pos_frac') {
            dx = MathUtils.randomChoice([2, 4, 5]);
            dy = 1;
            kDisplay = `1/${dx}`;
            color = '#16a34a';
        } else if (v === 'slope_neg_int') {
            dy = MathUtils.randomInt(-3, -1);
            dx = 1;
            kDisplay = dy.toString();
            color = '#dc2626';
        } else {
            dx = MathUtils.randomChoice([2, 3, 5]);
            dy = -1;
            kDisplay = `-1/${dx}`;
            color = '#dc2626';
        }

        const m = MathUtils.randomInt(-3, 3);

        return {
            renderData: {
                graph: { range: 10, lines: [{ slope: dy / dx, intercept: m, color }] },
                description: lang === 'sv' 
                    ? (dy > 0 ? "Bestäm linjens lutning (k-värde)." : "Bestäm linjens lutning (k-värde). Tänk på att linjen lutar nedåt!") 
                    : "Determine the slope (k-value) of the line.",
                interceptorToken: `${dy} ; ${dx} ; ${kDisplay}`,
                answerType: 'text'
            },
            token: this.toBase64(kDisplay),
            variationKey: v, 
            type: 'calculate',
            clues: this.getDetailedSlopeClues(dy / dx, kDisplay, lang, dy, dx),
            metadata: { variation_key: v, difficulty: 2 }
        };
    }

    // =========================================================================
    // LEVEL 3: Tables & Function Machine
    // =========================================================================
    private level3_TableFunctions(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'table_to_function', type: 'calculate' },
            { key: 'table_fill_function', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        const k = MathUtils.randomChoice([2, 3, 4, 5, -2, -3]);
        const m = MathUtils.randomInt(-5, 8);
        const { table, rows } = this.generateTableData(k, m, 4);
        const eq = this.formatEquation(k, m);

        if (v === 'table_to_function') {
            return {
                renderData: {
                    description: lang === 'sv' 
                        ? "Vilken formel $y = kx + m$ beskriver sambandet i tabellen?" 
                        : "Which formula $y = kx + m$ describes the linear relationship in the table?",
                    geometry: table,
                    interceptorToken: `${k} ; ${m} ; ${eq}`,
                    answerType: 'text'
                },
                token: this.toBase64(eq.replace(/\s/g, "")),
                variationKey: v,
                type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv' 
                            ? "Steg 1: Hitta differensen (k-värdet). Hur mycket ändras y varje gång x ökar med 1?" 
                            : "Step 1: Find the difference (slope k). How much does y change when x steps by 1?",
                        latex: `k = ${rows[1][1]} - ${rows[0][1]} = \\mathbf{${k}}`
                    },
                    {
                        text: lang === 'sv' 
                            ? `Steg 2: Hitta starttalet m (värdet på y när x = 0):` 
                            : `Step 2: Find start value m (the value of y when x = 0):`,
                        latex: `m = \\mathbf{${m}}`
                    },
                    {
                        text: lang === 'sv' 
                            ? `Sätt ihop i mallen y = kx + m med k = ${k} och m = ${m}:` 
                            : `Combine into y = kx + m using k = ${k} and m = ${m}:`,
                        latex: `\\mathbf{${eq}}`
                    },
                    {
                        text: lang === 'sv' ? `Svar: ${eq}` : `Answer: ${eq}`,
                        latex: `${eq}`
                    }
                ],
                metadata: { variation_key: v, difficulty: 3 }
            };
        }

        const targetRowIdx = MathUtils.randomChoice([1, 2, 3]);
        const targetX = rows[targetRowIdx][0];
        const missingY = rows[targetRowIdx][1];

        const maskedRows = rows.map((r, i) => i === targetRowIdx ? [r[0], '?'] : r);
        const maskedTable = { ...table, rows: maskedRows };

        return {
            renderData: {
                description: lang === 'sv' 
                    ? `Formeln för tabellen är $${eq}$. Vilket värde saknas vid frågetecknet där $x = ${targetX}$?` 
                    : `The table formula is $${eq}$. What number replaces the question mark where $x = ${targetX}$?`,
                geometry: maskedTable,
                interceptorToken: `${k} ; ${m} ; ${targetX} ; ${missingY}`,
                answerType: 'numeric'
            },
            token: this.toBase64(missingY.toString()),
            variationKey: v,
            type: 'calculate',
            clues: [
                {
                    text: lang === 'sv' 
                        ? `Sätt in x = ${targetX} i formeln:` 
                        : `Substitute x = ${targetX} into the formula:`,
                    latex: `y = ${k === 1 ? '' : k === -1 ? '-' : k}(\\mathbf{${targetX}}) ${m >= 0 ? `+ ${m}` : `${m}`}`
                },
                {
                    text: lang === 'sv' 
                        ? `Multiplicera först: ${k} · ${targetX} = ${k * targetX}. Lägg därefter till starttalet:` 
                        : `Multiply first: ${k} · ${targetX} = ${k * targetX}. Then add the constant:`,
                    latex: `y = ${k * targetX} ${m >= 0 ? `+ ${m}` : `${m}`} = \\mathbf{${missingY}}`
                },
                {
                    text: lang === 'sv' ? `Svar: ${missingY}` : `Answer: ${missingY}`,
                    latex: `${missingY}`
                }
            ],
            metadata: { variation_key: v, difficulty: 3 }
        };
    }

    // =========================================================================
    // LEVEL 4: Graph Formula & Visual Evaluation
    // =========================================================================
    private level4_GraphFormulaAndEval(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'eq_standard', type: 'calculate' },
            { key: 'eq_no_m', type: 'calculate' },
            { key: 'eq_horizontal', type: 'calculate' },
            { key: 'graph_eval_point', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        let k = MathUtils.randomInt(-3, 3);
        let m = MathUtils.randomInt(-4, 4);

        if (v === 'eq_no_m') m = 0;
        if (v === 'eq_horizontal') { k = 0; if (m === 0) m = 3; }
        if (v === 'eq_standard' && k === 0) k = 1;

        const eq = this.formatEquation(k, m);

        if (v === 'graph_eval_point') {
            if (k === 0) k = 2;
            const testX = MathUtils.randomChoice([1, 2, 3, -1, -2]);
            const targetY = k * testX + m;

            return {
                renderData: {
                    graph: { 
                        range: 10, 
                        lines: [{ slope: k, intercept: m, color: '#059669' }] 
                    },
                    description: lang === 'sv' 
                        ? `Läs av grafen. Vad är y-värdet när $x = ${testX}$?` 
                        : `Read the graph. What is the value of y when $x = ${testX}$?`,
                    interceptorToken: `${k} ; ${m} ; ${testX} ; ${targetY}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(targetY.toString()),
                variationKey: v,
                type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv' 
                            ? `Steg 1: Leta upp x = ${testX} på den vågräta x-axeln.` 
                            : `Step 1: Locate x = ${testX} on the horizontal x-axis.`,
                        latex: `x = ${testX}`
                    },
                    {
                        text: lang === 'sv' 
                            ? `Steg 2: Följ rutnätet rakt upp eller ner tills du krockar med den gröna linjen.` 
                            : `Step 2: Move vertically until you intersect the green line.`,
                        latex: `\\text{Korsningspunkt: } (${testX}, ${targetY})`
                    },
                    {
                        text: lang === 'sv' 
                            ? `Steg 3: Titta vågrätt mot den stående y-axeln för att läsa av höjden (${targetY}):` 
                            : `Step 3: Read across to the vertical y-axis to find the height (${targetY}):`,
                        latex: `y = \\mathbf{${targetY}}`
                    },
                    {
                        text: lang === 'sv' ? `Svar: ${targetY}` : `Answer: ${targetY}`,
                        latex: `${targetY}`
                    }
                ],
                metadata: { variation_key: v, difficulty: 4 }
            };
        }

        return {
            renderData: {
                graph: { range: 10, lines: [{ slope: k, intercept: m, color: '#7c3aed' }] },
                description: lang === 'sv' 
                    ? "Bestäm linjens ekvation på formen y = kx + m." 
                    : "Determine the equation of the line in the form y = kx + m.",
                interceptorToken: `${k} ; ${m} ; ${eq}`,
                answerType: 'text'
            },
            token: this.toBase64(eq.replace(/\s/g, "")),
            variationKey: v, 
            type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' 
                        ? "Hela formeln byggs genom två pusselbitar: starttalet (m) och trappsteget/differensen (k)." 
                        : "The equation is built using two components: the start value (m) and the slope (k).", 
                    latex: `y = kx + m` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Pusselbit 1 (m): Linjen korsar y-axeln på höjden ${m}, så m = ${m}.` 
                        : `Component 1 (m): The line crosses the y-axis at height ${m}, so m = ${m}.`, 
                    latex: `m = \\mathbf{${m}}` 
                },
                { 
                    text: lang === 'sv' 
                        ? (k === 0 
                            ? "Pusselbit 2 (k): Linjen är helt platt. Den klättrar varken upp eller ner, så k = 0." 
                            : `Pusselbit 2 (k): Ta ett steg åt höger. Vi klättrar ${k} steg för att nå linjen, så k = ${k}.`)
                        : (k === 0 
                            ? "Component 2 (k): The line is flat, so k = 0." 
                            : `Component 2 (k): Take 1 step right. We move ${k} vertically, so k = ${k}.`), 
                    latex: `k = \\mathbf{${k}}` 
                },
                { 
                    text: lang === 'sv' ? `Sätt ihop till det rena uttrycket:` : `Combine into the clean equation:`, 
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

    // =========================================================================
    // LEVEL 5: Coordinate Verification & Parallel Lines
    // =========================================================================
    private level5_ReasoningAndParallel(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'point_on_line', type: 'concept' },
            { key: 'parallel_lines_id', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'point_on_line') {
            const k = MathUtils.randomChoice([2, 3, -2, -1]);
            const m = MathUtils.randomInt(-4, 6);
            const eq = this.formatEquation(k, m);

            const testX = MathUtils.randomInt(1, 4);
            const isMatch = Math.random() > 0.5;
            const testY = isMatch ? (k * testX + m) : (k * testX + m + MathUtils.randomChoice([1, -1, 2]));

            const correctAns = isMatch ? (lang === 'sv' ? "Ja" : "Yes") : (lang === 'sv' ? "Nej" : "No");

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Ligger punkten $(${testX}, ${testY})$ på linjen $${eq}$?` 
                        : `Does the point $(${testX}, ${testY})$ lie on the line $${eq}$?`,
                    answerType: 'multiple_choice',
                    options: lang === 'sv' ? ["Ja", "Nej"] : ["Yes", "No"],
                    interceptorToken: `${k} ; ${m} ; ${testX} ; ${testY} ; ${isMatch ? 1 : 0}`
                },
                token: this.toBase64(correctAns),
                variationKey: v,
                type: 'concept',
                clues: [
                    {
                        text: lang === 'sv' 
                            ? `I punkten (${testX}, ${testY}) är x = ${testX} och y = ${testY}. Sätt in x = ${testX} i linjens formel:` 
                            : `For point (${testX}, ${testY}), x = ${testX} and y = ${testY}. Substitute x = ${testX} into the formula:`,
                        latex: `y = ${k === 1 ? '' : k === -1 ? '-' : k}(\\mathbf{${testX}}) ${m >= 0 ? `+ ${m}` : `${m}`}`
                    },
                    {
                        text: lang === 'sv' 
                            ? `Beräkna vad y blir: ${k} · ${testX} ${m >= 0 ? `+ ${m}` : `${m}`} = ${k * testX + m}.` 
                            : `Calculate y: ${k} · ${testX} ${m >= 0 ? `+ ${m}` : `${m}`} = ${k * testX + m}.`,
                        latex: `y_{\\text{beräknat}} = \\mathbf{${k * testX + m}}`
                    },
                    {
                        text: lang === 'sv' 
                            ? (isMatch 
                                ? `Det beräknade värdet (${k * testX + m}) stämmer exakt med punktens y-värde (${testY}). Punkten ligger på linjen!` 
                                : `Det beräknade värdet (${k * testX + m}) stämmer inte med punktens y-värde (${testY}). Punkten ligger inte på linjen!`)
                            : (isMatch 
                                ? `The calculated y matches the point's y-value (${testY}). The point lies on the line!` 
                                : `The calculated y does not match the point's y-value (${testY}). The point is not on the line!`),
                        latex: isMatch ? `${testY} = ${k * testX + m}` : `${testY} \\ne ${k * testX + m}`
                    },
                    {
                        text: lang === 'sv' ? `Svar: ${correctAns}` : `Answer: ${correctAns}`,
                        latex: `\\text{${correctAns}}`
                    }
                ],
                metadata: { variation_key: v, difficulty: 5 }
            };
        }

        const targetK = MathUtils.randomChoice([2, 3, 4, -2, -3]);
        const targetM = MathUtils.randomInt(-5, 5);
        const baseEq = this.formatEquation(targetK, targetM);

        const correctM = targetM + MathUtils.randomChoice([1, 2, -2, -3]);
        const correctParallelEq = this.formatEquation(targetK, correctM);

        const wrongEq1 = this.formatEquation(-targetK, targetM);
        const wrongEq2 = this.formatEquation(targetK + 1, targetM);
        const wrongEq3 = this.formatEquation(1, targetK);

        const optionsPool = MathUtils.shuffle([correctParallelEq, wrongEq1, wrongEq2, wrongEq3]);

        return {
            renderData: {
                description: lang === 'sv' 
                    ? `Vilken av linjerna är parallell med $${baseEq}$?` 
                    : `Which line is parallel to $${baseEq}$?`,
                answerType: 'multiple_choice',
                options: optionsPool,
                interceptorToken: `${targetK} ; ${targetM} ; ${correctParallelEq}`
            },
            token: this.toBase64(correctParallelEq),
            variationKey: v,
            type: 'concept',
            clues: [
                {
                    text: lang === 'sv' 
                        ? "Två linjer är parallella om de lutar exakt lika mycket. Det betyder att de har samma k-värde!" 
                        : "Two lines are parallel if they have identical slopes. That means their k-values must match!",
                    latex: `k_1 = k_2`
                },
                {
                    text: lang === 'sv' 
                        ? `Linjen ${baseEq} har k-värdet k = ${targetK}.` 
                        : `The line ${baseEq} has slope k = ${targetK}.`,
                    latex: `k = \\mathbf{${targetK}}`
                },
                {
                    text: lang === 'sv' 
                        ? `Leta efter alternativet som också har k = ${targetK}. Det är ${correctParallelEq}.` 
                        : `Look for the option that also has k = ${targetK}. That is ${correctParallelEq}.`,
                    latex: `\\mathbf{${correctParallelEq}}`
                },
                {
                    text: lang === 'sv' ? `Svar: ${correctParallelEq}` : `Answer: ${correctParallelEq}`,
                    latex: `${correctParallelEq}`
                }
            ],
            metadata: { variation_key: v, difficulty: 5 }
        };
    }

    // =========================================================================
    // LEVEL 6: Scaled Real-World Contexts (Asymmetric Axes & Realistic Numbers)
    // =========================================================================
    private level6_ScaledRealWorld(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'scaled_intercept', type: 'concept' },
            { key: 'scaled_slope', type: 'calculate' },
            { key: 'scaled_equation', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        const profile = this.getRealisticProfile(lang);
        const { k, m, graphConfig, xUnit, yUnit } = profile;
        const eq = this.formatEquation(k, m);

        // VARIATION 6A: Read Start Value (m) on Scaled Axis
        if (v === 'scaled_intercept') {
            return {
                renderData: {
                    graph: graphConfig,
                    description: lang === 'sv'
                        ? `Läs av grafen. Vilket är startvärdet (m-värdet) där linjen skär den stående axeln?`
                        : `Read the graph. What is the initial starting value (m-value) where the line crosses the vertical axis?`,
                    interceptorToken: `${m} ; ${k}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(m.toString()),
                variationKey: v,
                type: 'concept',
                clues: [
                    {
                        text: lang === 'sv'
                            ? `Startvärdet m är den punkt på den stående axeln där x = 0.`
                            : `The initial value m is the point on the vertical axis where x = 0.`,
                        latex: `(0, m)`
                    },
                    {
                        text: lang === 'sv'
                            ? `Grafen skär den stående axeln vid ${m} ${yUnit}.`
                            : `The graph intersects the vertical axis at ${m} ${yUnit}.`,
                        latex: `m = \\mathbf{${m}}`
                    },
                    {
                        text: lang === 'sv' ? `Svar: ${m}` : `Answer: ${m}`,
                        latex: `${m}`
                    }
                ],
                metadata: { variation_key: v, difficulty: 6 }
            };
        }

        // VARIATION 6B: Calculate Rate / Slope (k) on Scaled Axis
        if (v === 'scaled_slope') {
            const stepX = graphConfig.xGridStep || 1;
            const deltaY = k * stepX;

            return {
                renderData: {
                    graph: graphConfig,
                    description: lang === 'sv'
                        ? `Bestäm linjens lutning (k-värde) utifrån axlarnas skalor.`
                        : `Determine the slope (k-value) of the line using the axes scales.`,
                    interceptorToken: `${k} ; ${stepX} ; ${k}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(k.toString()),
                variationKey: v,
                type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv'
                            ? `Lutningen k beräknas som ändring i y delat med ändring i x:`
                            : `Slope k is calculated as change in y divided by change in x:`,
                        latex: `k = \\frac{\\Delta y}{\\Delta x}`
                    },
                    {
                        text: lang === 'sv'
                            ? `När vi tar ${stepX} ${xUnit} åt höger ändras y med ${deltaY} ${yUnit}:`
                            : `Moving ${stepX} ${xUnit} right changes y by ${deltaY} ${yUnit}:`,
                        latex: `k = \\frac{${deltaY}}{${stepX}} = \\mathbf{${k}}`
                    },
                    {
                        text: lang === 'sv' ? `Svar: ${k}` : `Answer: ${k}`,
                        latex: `${k}`
                    }
                ],
                metadata: { variation_key: v, difficulty: 6 }
            };
        }

        // VARIATION 6C: Complete Equation y = kx + m on Scaled Axis
        return {
            renderData: {
                graph: graphConfig,
                description: lang === 'sv'
                    ? `Bestäm linjens fullständiga ekvation på formen y = kx + m utifrån grafen.`
                    : `Determine the full equation of the line in the form y = kx + m from the graph.`,
                interceptorToken: `${k} ; ${m} ; ${eq}`,
                answerType: 'text'
            },
            token: this.toBase64(eq.replace(/\s/g, "")),
            variationKey: v,
            type: 'calculate',
            clues: [
                {
                    text: lang === 'sv'
                        ? `Steg 1: Startvärdet m avläses på y-axeln vid x = 0:`
                        : `Step 1: Read starting value m on the vertical axis at x = 0:`,
                    latex: `m = \\mathbf{${m}}`
                },
                {
                    text: lang === 'sv'
                        ? `Steg 2: Lutningen k är ökningen per enhet på x-axeln:`
                        : `Step 2: Slope k is the rate of change per unit of x:`,
                    latex: `k = \\mathbf{${k}}`
                },
                {
                    text: lang === 'sv'
                        ? `Sätt samman formeln:`
                        : `Combine into the full equation:`,
                    latex: `\\mathbf{${eq}}`
                },
                {
                    text: lang === 'sv' ? `Svar: ${eq}` : `Answer: ${eq}`,
                    latex: `${eq}`
                }
            ],
            metadata: { variation_key: v, difficulty: 6 }
        };
    }
}