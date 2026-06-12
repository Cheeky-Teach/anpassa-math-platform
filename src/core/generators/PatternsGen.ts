import { MathUtils } from '../utils/MathUtils.js';
import { enrichQuestionMetadata } from '../utils/WordProblemDecorator.js';

export class PatternsGen {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        // Adaptive Fallback: If Level 1 is mastered, push to Level 2
        if (level === 1 && options.hideConcept && options.exclude?.includes('seq_next')) {
            return this.level2_HighTerm(lang, undefined, options);
        }

        let questionData: any;

        switch (level) {
            case 1: questionData = this.level1_Sequences(lang, undefined, options); break;
            case 2: questionData = this.level2_HighTerm(lang, undefined, options); break;
            case 3: questionData = this.level3_VisualFormula(lang, undefined, options); break;
            case 4: questionData = this.level4_TableToFormula(lang, undefined, options); break;
            case 5: questionData = this.level5_ReverseEngineering(lang, undefined, options); break;
            default: questionData = this.level1_Sequences(lang, undefined, options); break;
        }

        // 🟢 Run through the decorator
        enrichQuestionMetadata(questionData);

        // 🟢 Practice Mode Level-Wide Override
        const WORD_PROBLEM_ELIGIBLE_LEVELS = [2, 3, 4, 5];
        if (WORD_PROBLEM_ELIGIBLE_LEVELS.includes(level)) {
            if (!questionData.metadata) questionData.metadata = {};
            questionData.metadata.levelSupportsWordProblems = true;
        }

        return questionData;
    }

    /**
     * Targeted Generation for Question Studio
     * Maps ALL keys from skillBuckets.js to maintain visual/studio compatibility.
     */
    public generateByVariation(key: string, lang: string = 'sv'): any {
        switch (key) {
            case 'seq_lie':
            case 'seq_type':
            case 'seq_diff':
            case 'seq_next':
                return this.level1_Sequences(lang, key);
            case 'high_term':
                return this.level2_HighTerm(lang, key);
            case 'formula_missing':
            case 'visual_calc':
            case 'find_formula':
                return this.level3_VisualFormula(lang, key);
            case 'table_formula':
            case 'table_fill':
                return this.level4_TableToFormula(lang, key);
            case 'reverse_calc':
                return this.level5_ReverseEngineering(lang, key);
            default:
                return this.generate(1, lang);
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

    /**
     * Internal Logic for Matchstick Rendering
     * Dynamically generates stick coordinates for PatternComponents.jsx
     */
    private generateMatchstickData(type: 'squares' | 'triangles' | 'houses', count: number) {
        const sticks: { x1: number, y1: number, x2: number, y2: number }[] = [];
        const unitW = 40;
        const padding = 10;
        for (let i = 0; i < count; i++) {
            const xOffset = padding + (i * unitW);
            if (type === 'squares') {
                sticks.push({ x1: xOffset, y1: 40, x2: xOffset + unitW, y2: 40 });
                sticks.push({ x1: xOffset, y1: 80, x2: xOffset + unitW, y2: 80 });
                sticks.push({ x1: xOffset + unitW, y1: 40, x2: xOffset + unitW, y2: 80 });
                if (i === 0) sticks.push({ x1: xOffset, y1: 40, x2: xOffset, y2: 80 });
            } 
            else if (type === 'triangles') {
                sticks.push({ x1: xOffset, y1: 80, x2: xOffset + unitW, y2: 80 });
                sticks.push({ x1: xOffset + unitW / 2, y1: 40, x2: xOffset + unitW, y2: 80 });
                if (i === 0) sticks.push({ x1: xOffset, y1: 80, x2: xOffset + unitW / 2, y2: 40 });
            }
            else if (type === 'houses') {
                if (i === 0) sticks.push({ x1: xOffset, y1: 50, x2: xOffset, y2: 90 });
                sticks.push({ x1: xOffset, y1: 90, x2: xOffset + unitW, y2: 90 });
                sticks.push({ x1: xOffset + unitW, y1: 50, x2: xOffset + unitW, y2: 90 });
                sticks.push({ x1: xOffset, y1: 50, x2: xOffset + unitW / 2, y2: 20 });
                sticks.push({ x1: xOffset + unitW / 2, y1: 20, x2: xOffset + unitW, y2: 50 });
                sticks.push({ x1: xOffset, y1: 50, x2: xOffset + unitW, y2: 50 });
            }
        }
        return { width: (count * unitW) + (padding * 2), height: 100, sticks };
    }

    // --- LEVEL 1: SEQUENCES ---
    private level1_Sequences(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'seq_lie', type: 'concept' },
            { key: 'seq_type', type: 'concept' },
            { key: 'seq_diff', type: 'calculate' },
            { key: 'seq_next', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'seq_lie') {
            const start = MathUtils.randomInt(2, 8), diff = MathUtils.randomInt(3, 6);
            const seq = [start, start + diff, start + diff * 2, start + diff * 3];
            const lie = lang === 'sv' ? `Mönstret hoppar med ${diff + 1} varje steg` : `The pattern jumps by ${diff + 1} each step`;
            const sTrue1 = lang === 'sv' ? `Mönstret hoppar med ${diff} varje steg` : `The pattern jumps by ${diff} each step`;
            const sTrue2 = lang === 'sv' ? `Första talet i raden är ${start}` : `The first number in line is ${start}`;

            return {
                renderData: {
                    description: lang === 'sv' ? "Titta på talen. Vilket påstående stämmer INTE?" : "Look at the numbers. Which statement is NOT correct?",
                    answerType: 'multiple_choice', options: MathUtils.shuffle([sTrue1, sTrue2, lie]),
                    geometry: { type: 'pattern', subtype: 'sequence', sequence: [...seq, '...'] }
                },
                token: this.toBase64(lie), variationKey: v, type: 'concept',
                clues: [
                    { 
                        text: lang === 'sv' ? "Vi kollar hur långt hoppet är i mönstret genom att ta det andra talet minus det första." : "Let's find out how large the jump is by taking the second number minus the first.", 
                        latex: `${seq[1]} - ${seq[0]} = \\mathbf{${diff}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Kontrollera om nästa hopp också är lika stort: ${seq[2]} minus ${seq[1]} blir också ${diff}.` : `Check if the next jump is the same size: ${seq[2]} minus ${seq[1]} also equals ${diff}.`, 
                        latex: `${seq[2]} - ${seq[1]} = \\mathbf{${diff}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Eftersom mönstret hela tiden hoppar med ${diff}, så är påståendet "${lie}" helt felaktigt.` : `Since the pattern consistently jumps by ${diff}, the statement "${lie}" is completely wrong.`, 
                        latex: `\\text{Verkligt hopp} = \\mathbf{${diff}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${lie}` : `Answer: ${lie}`, 
                        latex: `\\text{${lie}}` 
                    }
                ]
            };
        }

        const d = MathUtils.randomInt(3, 8), s = MathUtils.randomInt(1, 15);
        const seq = [s, s + d, s + d * 2, s + d * 3];

        if (v === 'seq_diff') {
            return {
                renderData: {
                    description: lang === 'sv' ? "Hur stort är hoppet mellan talen i mönstret?" : "How large is the jump between the numbers in the pattern?",
                    answerType: 'numeric',
                    geometry: { type: 'pattern', subtype: 'sequence', sequence: [...seq, '...'] }
                },
                token: this.toBase64(d.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? "Välj de två första talen i raden för att mäta hur mycket mönstret växer." : "Pick the first two numbers in line to measure how much the pattern grows.", 
                        latex: `\\text{Mönster: } ${seq[0]}, \\; ${seq[1]}, \\; ${seq[2]}, \\; ${seq[3]}` 
                    },
                    { 
                        text: lang === 'sv' ? `Ta det andra talet (${seq[1]}) minus det första talet (${seq[0]}) för att räkna ut hoppet.` : `Take the second number (${seq[1]}) minus the first number (${seq[0]}) to calculate the jump.`, 
                        latex: `\\text{Hopp} = ${seq[1]} - ${seq[0]}` 
                    },
                    { 
                        text: lang === 'sv' ? "Räkna ut subtraktionen för att hitta svaret." : "Calculate the subtraction to reach the final answer value.", 
                        latex: `\\text{Hopp} = \\mathbf{${d}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${d}` : `Answer: ${d}`, 
                        latex: `${d}` 
                    }
                ]
            };
        }

        const next = seq[3] + d;
        return {
            renderData: {
                description: lang === 'sv' ? "Vilket tal ska stå istället för frågetecknet?" : "Which number should stand instead of the question mark?",
                answerType: 'numeric',
                geometry: { type: 'pattern', subtype: 'sequence', sequence: [...seq, '?'] }
            },
            token: this.toBase64(next.toString()), variationKey: v, type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? "Börja med att ta reda på hur mycket mönstret ökar för varje steg." : "Start by finding out how much the pattern increases for each step.", 
                    latex: `\\text{Hopp} = ${seq[1]} - ${seq[0]} = \\mathbf{${d}}` 
                },
                { 
                    text: lang === 'sv' ? `För att hitta nästa tal lägger vi helt enkelt till hoppet (${d}) till det sista kända talet (${seq[3]}).` : `To find the next number, simply add the jump size (${d}) to the last known number (${seq[3]}).`, 
                    latex: `? = ${seq[3]} + \\mathbf{${d}}` 
                },
                { 
                    text: lang === 'sv' ? "Räkna ut plusset för att få fram det saknade talet." : "Calculate the addition to find the missing number block total.", 
                    latex: `? = \\mathbf{${next}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${next}` : `Answer: ${next}`, 
                    latex: `${next}` 
                }
            ]
        };
    }

    // --- LEVEL 2: HIGH TERM ---
    private level2_HighTerm(lang: string, variationKey?: string, options: any = {}): any {
        const d = MathUtils.randomInt(4, 9), s = MathUtils.randomInt(2, 10);
        const targetN = MathUtils.randomChoice([10, 20, 50, 100]);
        const ans = s + (targetN - 1) * d;

        const backgroundToken = `${s} ; ${d} ; ${targetN}`;

        return {
            renderData: {
                description: lang === 'sv' ? `Vilket värde har tal nummer ${targetN} i mönstret: ${s}, ${s+d}, ${s+d*2}... ?` : `What is the value of number ${targetN} in the pattern: ${s}, ${s+d}, ${s+d*2}... ?`,
                interceptorToken: backgroundToken,
                answerType: 'numeric',
                geometry: { type: 'pattern', subtype: 'sequence', sequence: [s, s + d, s + d * 2, '...'] }
            },
            token: this.toBase64(ans.toString()), variationKey: 'high_term', type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? "Ta först reda på hur mycket mönstret växer för varje steg." : "First, figure out how much the pattern grows for each step.", 
                    latex: `\\text{Hoppstorlek} = ${s+d} - ${s} = \\mathbf{${d}}` 
                },
                { 
                    text: lang === 'sv' ? `För att nå fram till tal nummer ${targetN} från början, måste vi ta exakt ${targetN - 1} stycken kliv framåt.` : `To get all the way to number ${targetN} from the start, we must take exactly ${targetN - 1} steps forward.`, 
                    latex: `\\text{Antal kliv} = ${targetN} - 1 = \\mathbf{${targetN - 1}}` 
                },
                { 
                    text: lang === 'sv' ? `Räkna ut det totala värdet av alla kliv: gångra antalet kliv (${targetN - 1}) med storleken (${d}).` : `Calculate the total value of all steps combined: multiply the number of steps (${targetN - 1}) by the step size (${d}).`, 
                    latex: `\\text{Klivens värde} = ${targetN - 1} \\cdot \\mathbf{${d}} = \\mathbf{${(targetN - 1) * d}}` 
                },
                { 
                    text: lang === 'sv' ? `Plussa till sist ihop klivens värde med talet vi startade på (${s}) för att hitta slutsvar.` : `Finally, add the step value to our starting number (${s}) to find the final answer block score.`, 
                    latex: `\\text{Resultat} = ${s} + \\mathbf{${(targetN - 1) * d}} = \\mathbf{${ans}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, 
                    latex: `${ans}` 
                }
            ]
        };
    }

    // --- LEVEL 3: VISUAL FORMULA ---
    private level3_VisualFormula(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'formula_missing', type: 'calculate' },
            { key: 'visual_calc', type: 'calculate' },
            { key: 'find_formula', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        
        // Configuration map for shapes and their "per-unit" stick costs
        const shapeConfigs = [
            { type: 'squares', diff: 3, unitBase: 1 },
            { type: 'triangles', diff: 2, unitBase: 1 },
            { type: 'houses', diff: 5, unitBase: 1 }
        ];
        const config = MathUtils.randomChoice(shapeConfigs);
        
        // REFACTOR: Randomize the starting number of shapes (1, 2, or 3)
        const startShapes = MathUtils.randomInt(1, 3);
        
        // Calculate the an + b formula parameters
        // a = increase per figure (constant)
        // b = startShapes calculation: V = a(n + startShapes - 1) + unitBase
        // This simplifies to V = an + (a * (startShapes - 1) + unitBase)
        const a = config.diff;
        const b = (a * (startShapes - 1)) + config.unitBase;

        // Generate visual data for Figures 1, 2, and 3
        const figs = [
            this.generateMatchstickData(config.type as any, startShapes),
            this.generateMatchstickData(config.type as any, startShapes + 1),
            this.generateMatchstickData(config.type as any, startShapes + 2)
        ];

        // Actual stick counts for clues
        const counts = [a*1 + b, a*2 + b, a*3 + b];

        if (v === 'visual_calc') {
            const target = MathUtils.randomInt(5, 12);
            const ans = a * target + b;

            const backgroundToken = `${a} · ${target} + ${b}`;

            return {
                renderData: {
                    description: lang === 'sv' ? `Mönstret följer formeln $V = ${a}n + ${b}$. Hur många stickor behövs till figur nummer ${target}?` : `The pattern follows the formula $V = ${a}n + ${b}$. How many sticks are needed for figure number ${target}?`,
                    interceptorToken: backgroundToken,
                    answerType: 'numeric',
                    geometry: { type: 'pattern', subtype: 'matchsticks', figures: figs }
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? `Bokstaven n betyder figurnummer. Vi byter ut n mot siffran ${target} i vår mall.` : `The letter n stands for the figure number. We replace n with the number ${target} inside our template layout.`, 
                        latex: `V = ${a} \\cdot n + ${b}` 
                    },
                    { 
                        text: lang === 'sv' ? `Gångra (multiplicera) talen först: ${a} gånger ${target} blir ${a * target}.` : `Multiply the front numbers first: ${a} times ${target} equals ${a * target}.`, 
                        latex: `V = \\mathbf{${a} \\cdot ${target}} + ${b} \\rightarrow V = \\mathbf{${a * target}} + ${b}` 
                    },
                    { 
                        text: lang === 'sv' ? `Plussa till sist ihop svaret med den fasta extrasiffran ${b}.` : `Finally, add the product result to the loose starting number component ${b}.`, 
                        latex: `V = \\mathbf{${a * target} + ${b}} = \\mathbf{${ans}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, 
                        latex: `${ans}` 
                    }
                ]
            };
        }

        const formula = `${a}n+${b}`;
        return {
            renderData: {
                description: lang === 'sv' ? "Vilket uttryck på formen $an + b$ beskriver antalet stickor i mönstret?" : "Which expression of the form $an + b$ describes the number of sticks in the pattern?",
                answerType: 'text',
                geometry: { type: 'pattern', subtype: 'matchsticks', figures: figs }
            },
            token: this.toBase64(formula), variationKey: 'find_formula', type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? "Räkna hur många tändstickor det finns i de tre första figurerna i bilden." : "Count up how many matchsticks are built into the first three figures shown on screen.", 
                    latex: `\\text{Figur 1} = ${counts[0]}, \\quad \\text{Figur 2} = ${counts[1]}, \\quad \\text{Figur 3} = ${counts[2]}` 
                },
                { 
                    text: lang === 'sv' ? `Kolla hur mycket mönstret växer för varje ny figur: det plussas på ${a} stickor varje gång. Detta blir talet 'a' framför n.` : `See how much the shape grows with each new step: it adds ${a} sticks every single time. This is our step value 'a' placed before n.`, 
                    latex: `a = ${counts[1]} - ${counts[0]} = \\mathbf{${a}}` 
                },
                { 
                    text: lang === 'sv' ? `Hitta extrasiffran 'b' genom att ta din första figur (${counts[0]}) minus växt-talet (${a}).` : `Find the loose starting value 'b' by taking your first figure count (${counts[0]}) minus the growth rate (${a}).`, 
                    latex: `b = ${counts[0]} - ${a} = \\mathbf{${b}}` 
                },
                { 
                    text: lang === 'sv' ? `Sätt ihop dina två delar i mallen an + b för att bygga det färdiga uttrycket.` : `Assemble your two discovered pieces into the an + b template map to complete the expression layer score.`, 
                    latex: `\\text{Uttryck} = \\mathbf{${a}n + ${b}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${a}n + ${b}` : `Answer: ${a}n + ${b}`, 
                    latex: `${a}n + ${b}` 
                }
            ]
        };
    }

    // --- LEVEL 4: TABLE TO FORMULA ---
    private level4_TableToFormula(lang: string, variationKey?: string, options: any = {}): any {
        const v = variationKey || MathUtils.randomChoice(['table_formula', 'table_fill']);
        const a = MathUtils.randomInt(3, 7), b = MathUtils.randomInt(1, 10);
        const rows = [[1, a+b], [2, a*2+b], [3, a*3+b], [4, a*4+b]];

        if (v === 'table_fill') {
            const nextVal = a * 5 + b;
            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket värde saknas i tabellen för n = 5?" : "Which value is missing in the table for n = 5?",
                    answerType: 'numeric',
                    geometry: { type: 'frequency_table', headers: ['n', 'Värde'], rows }
                },
                token: this.toBase64(nextVal.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? "Kolla på 'Värde'-spalten i tabellen för att se hur mycket siffrorna växer för varje steg nedåt." : "Look closely at the 'Value' column in the chart to spot how much the numbers grow with each step down.", 
                        latex: `${rows[1][1]} - ${rows[0][1]} = \\mathbf{${a}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Eftersom raderna hela tiden ökar med ${a}, lägger vi helt enkelt till ${a} till det sista kända talet (${rows[3][1]}).` : `Since the rows consistently increase by ${a}, simply add ${a} to the last known chart value (${rows[3][1]}).`, 
                        latex: `? = ${rows[3][1]} + \\mathbf{${a}}` 
                    },
                    { 
                        text: lang === 'sv' ? "Räkna ut plusset på raden för att fylla i den tomma luckan." : "Compute the addition step row to fill in the empty block slot correctly.", 
                        latex: `? = \\mathbf{${nextVal}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${nextVal}` : `Answer: ${nextVal}`, 
                        latex: `${nextVal}` 
                    }
                ]
            };
        }

        return {
            renderData: {
                description: lang === 'sv' ? "Bestäm uttrycket $an + b$ som beskriver mönstret i tabellen." : "Determine the expression $an + b$ that describes the pattern inside the chart.",
                answerType: 'text',
                geometry: { type: 'frequency_table', headers: ['n', 'Värde'], rows }
            },
            token: this.toBase64(`${a}n+${b}`), variationKey: 'table_formula', type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? "Mallen an + b består av två delar. Siffran 'a' framför n är helt enkelt hur mycket tabellvärdet växer för varje rad." : "The an + b layout consists of two puzzle parts. The rate 'a' is simply how much the chart value grows with each row step.", 
                    latex: `a = ${rows[1][1]} - ${rows[0][1]} = \\mathbf{${a}}` 
                },
                { 
                    text: lang === 'sv' ? `Siffran 'b' är extrasiffran. Vi hittar den genom att ta tabellens allra första värde (${rows[0][1]}) minus växt-talet (${a}).` : `The piece 'b' is the loose modifier. We find it by taking the chart's very first value (${rows[0][1]}) minus the growth rate (${a}).`, 
                    latex: `b = ${rows[0][1]} - ${a} = \\mathbf{${b}}` 
                },
                { 
                    text: lang === 'sv' ? `Sätt ihop dina två funna pusselbitar till det färdiga uttrycket:` : `Assemble your two discovered structural blocks directly into the clean expression framework row:`, 
                    latex: `\\text{Uttryck} = \\mathbf{${a}n + ${b}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${a}n + ${b}` : `Answer: ${a}n + ${b}`, 
                    latex: `${a}n + ${b}` 
                }
            ]
        };
    }

    // --- LEVEL 5: REVERSE ENGINEERING ---
    private level5_ReverseEngineering(lang: string, variationKey?: string, options: any = {}): any {
        const a = MathUtils.randomInt(4, 9), b = MathUtils.randomInt(2, 12);
        const n = MathUtils.randomInt(10, 40);
        const total = a * n + b;

        const backgroundToken = `${a}n + ${b} = ${total}`;

        return {
            renderData: {
                description: lang === 'sv' ? `I ett mönster med formeln $V = ${a}n + ${b}$, vilken figur (n) består av ${total} stycken delar?` : `In a pattern with the formula $V = ${a}n + ${b}$, which figure (n) consists of ${total} parts?`,
                interceptorToken: backgroundToken,
                answerType: 'numeric'
            },
            token: this.toBase64(n.toString()), variationKey: 'reverse_calc', type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? `Vi ska räkna baklänges! Vi vet att hela uttrycket ska ge summan ${total} totalt på tavlan.` : `We need to work backwards! We know that the whole expression must equal the balance total of ${total} on the board.`, 
                    latex: `${a}n + ${b} = ${total}` 
                },
                { 
                    text: lang === 'sv' ? `Börja med att städa undan extrasiffran +${b} genom att dra bort (subtrahera) ${b} från totalsumman på båda sidor.` : `Begin by clearing away the loose modifier number +${b} by subtracting ${b} from the total on both sides.`, 
                    latex: `${a}n + ${b} \\mathbf{- ${b}} = ${total} \\mathbf{- ${b}}` 
                },
                { 
                    text: lang === 'sv' ? `Förenkla raden: nu vet vi att ${a}n är lika med ${total - b}.` : `Simplify the row line: now we establish that ${a}n equals exactly ${total - b}.`, 
                    latex: `${a}n = \\mathbf{${total - b}}` 
                },
                { 
                    text: lang === 'sv' ? `Dela (dividera) resultatet med växt-talet ${a} för att frigöra och hitta figurnumret n.` : `Divide that result value by the growth step rate ${a} to isolate and reveal the hidden figure number n.`, 
                    latex: `n = \\frac{${total - b}}{\\mathbf{${a}}}` 
                },
                { 
                    text: lang === 'sv' ? "Räkna ut delningen för att nå fram till den saknade figuren." : "Compute the final division fraction step to settle the target missing figure index.", 
                    latex: `n = \\mathbf{${n}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: n = ${n}` : `Answer: n = ${n}`, 
                    latex: `${n}` 
                }
            ]
        };
    }
}