import { MathUtils } from '../utils/MathUtils.js';
import { enrichQuestionMetadata } from '../utils/WordProblemDecorator.js';

export class PatternsGen {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
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

        enrichQuestionMetadata(questionData);

        const WORD_PROBLEM_ELIGIBLE_LEVELS = [2, 3, 4, 5];
        if (WORD_PROBLEM_ELIGIBLE_LEVELS.includes(level)) {
            if (!questionData.metadata) questionData.metadata = {};
            questionData.metadata.levelSupportsWordProblems = true;
        }

        return questionData;
    }

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
            
            // Concise options under 20 chars to comply with api/answer.ts validation
            const lie = lang === 'sv' ? `Ökar med ${diff + 1}` : `Jumps by ${diff + 1}`;
            const sTrue1 = lang === 'sv' ? `Ökar med ${diff}` : `Jumps by ${diff}`;
            const sTrue2 = lang === 'sv' ? `Börjar på ${start}` : `Starts at ${start}`;

            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket påstående om mönstret är FEL?" : "Which statement about the pattern is FALSE?",
                    answerType: 'multiple_choice', 
                    options: MathUtils.shuffle([sTrue1, sTrue2, lie]),
                    geometry: { type: 'pattern', subtype: 'sequence', sequence: [...seq, '...'] }
                },
                token: this.toBase64(lie), 
                variationKey: v, 
                type: 'concept',
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? "Räkna ut differensen genom att ta det andra talet minus det första:" 
                            : "Find the difference by taking the second number minus the first:", 
                        latex: `\\text{Differens} = ${seq[1]} - ${seq[0]} = \\mathbf{${diff}}` 
                    },
                    { 
                        text: lang === 'sv' 
                            ? `Kontrollera nästa steg. Ökar det fortfarande med ${diff}?` 
                            : `Check the next step. Does it still increase by ${diff}?`, 
                        latex: `${seq[2]} - ${seq[1]} = \\mathbf{${diff}}` 
                    },
                    { 
                        text: lang === 'sv' 
                            ? `Mönstret ökar med ${diff} varje gång. Därför stämmer inte påståendet "${lie}".` 
                            : `The pattern increases by ${diff} each time. Therefore, "${lie}" is false.`, 
                        latex: `\\text{Rätt differens} = \\mathbf{${diff}}` 
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
                    description: lang === 'sv' ? "Hur stor är differensen mellan talen i mönstret?" : "What is the difference between the numbers in the pattern?",
                    answerType: 'numeric',
                    geometry: { type: 'pattern', subtype: 'sequence', sequence: [...seq, '...'] }
                },
                token: this.toBase64(d.toString()), 
                variationKey: v, 
                type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? "Differens betyder skillnaden mellan två tal intill varandra i raden." 
                            : "Difference means the gap between two numbers standing next to each other.", 
                        latex: `\\text{Talen är: } ${seq[0]}, \\; ${seq[1]}, \\; ${seq[2]}, \\; ${seq[3]}` 
                    },
                    { 
                        text: lang === 'sv' 
                            ? `Ta det andra talet minus det första talet för att hitta differensen:` 
                            : `Subtract the first number from the second number:`, 
                        latex: `\\text{Differens} = ${seq[1]} - ${seq[0]} = \\mathbf{${d}}` 
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
                description: lang === 'sv' ? "Vilket tal ska stå istället för frågetecknet?" : "Which number replaces the question mark?",
                answerType: 'numeric',
                geometry: { type: 'pattern', subtype: 'sequence', sequence: [...seq, '?'] }
            },
            token: this.toBase64(next.toString()), 
            variationKey: v, 
            type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' 
                        ? "Börja med att hitta differensen (hur mycket mönstret ökar för varje steg):" 
                        : "Start by finding the difference (how much the pattern grows each step):", 
                    latex: `\\text{Differens} = ${seq[1]} - ${seq[0]} = \\mathbf{${d}}` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Lägg till differensen (${d}) på det sista talet (${seq[3]}):` 
                        : `Add the difference (${d}) to the last number (${seq[3]}):`, 
                    latex: `? = ${seq[3]} + \\mathbf{${d}} = \\mathbf{${next}}` 
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
        const starttal_b = s - d;

        const backgroundToken = `${s} ; ${d} ; ${targetN}`;

        return {
            renderData: {
                description: lang === 'sv' 
                    ? `Vilket värde har tal nummer ${targetN} i mönstret: ${s}, ${s+d}, ${s+d*2}... ?` 
                    : `What is the value of term ${targetN} in the pattern: ${s}, ${s+d}, ${s+d*2}... ?`,
                interceptorToken: backgroundToken,
                answerType: 'numeric',
                geometry: { type: 'pattern', subtype: 'sequence', sequence: [s, s + d, s + d * 2, '...'] }
            },
            token: this.toBase64(ans.toString()), 
            variationKey: 'high_term', 
            type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' 
                        ? "Steg 1: Hitta differensen. Hur mycket ökar mönstret i varje steg?" 
                        : "Step 1: Find the difference. How much does the pattern grow each step?", 
                    latex: `\\text{Differens} = ${s+d} - ${s} = \\mathbf{${d}}` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Steg 2: Hitta starttalet (talet precis innan figur 1). Ta figur 1 (${s}) minus differensen (${d}):` 
                        : `Step 2: Find the starting number (term 0). Take figure 1 (${s}) minus the difference (${d}):`, 
                    latex: `\\text{Starttal} = ${s} - ${d} = \\mathbf{${starttal_b}}` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Formeln för mönstret är differensen gånger n plus starttalet:` 
                        : `The pattern formula is the difference times n plus the starting number:`, 
                    latex: `\\text{Formel} = ${d}n ${starttal_b >= 0 ? `+ ${starttal_b}` : `- ${Math.abs(starttal_b)}`}` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Sätt in figurnummer n = ${targetN} i formeln och räkna ut:` 
                        : `Substitute figure n = ${targetN} into the formula:`, 
                    latex: `${d} \\cdot \\mathbf{${targetN}} ${starttal_b >= 0 ? `+ ${starttal_b}` : `- ${Math.abs(starttal_b)}`} = ${d * targetN} ${starttal_b >= 0 ? `+ ${starttal_b}` : `- ${Math.abs(starttal_b)}`} = \\mathbf{${ans}}` 
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
        
        const shapeConfigs = [
            { type: 'squares', diff: 3, unitBase: 1 },
            { type: 'triangles', diff: 2, unitBase: 1 },
            { type: 'houses', diff: 5, unitBase: 1 }
        ];
        const config = MathUtils.randomChoice(shapeConfigs);
        
        const startShapes = MathUtils.randomInt(1, 3);
        const a = config.diff;
        const b = (a * (startShapes - 1)) + config.unitBase;

        const figs = [
            this.generateMatchstickData(config.type as any, startShapes),
            this.generateMatchstickData(config.type as any, startShapes + 1),
            this.generateMatchstickData(config.type as any, startShapes + 2)
        ];

        const counts = [a*1 + b, a*2 + b, a*3 + b];

        if (v === 'visual_calc') {
            const target = MathUtils.randomInt(5, 12);
            const ans = a * target + b;
            const backgroundToken = `${a} · ${target} + ${b}`;

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Mönstret följer formeln $V = ${a}n + ${b}$. Hur många stickor behövs till figur nummer ${target}?` 
                        : `The pattern follows the formula $V = ${a}n + ${b}$. How many sticks are needed for figure ${target}?`,
                    interceptorToken: backgroundToken,
                    answerType: 'numeric',
                    geometry: { type: 'pattern', subtype: 'matchsticks', figures: figs }
                },
                token: this.toBase64(ans.toString()), 
                variationKey: v, 
                type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? `I formeln står n för figurnumret. Byt ut n mot ${target}:` 
                            : `In the formula, n is the figure number. Replace n with ${target}:`, 
                        latex: `V = ${a} \\cdot \\mathbf{${target}} + ${b}` 
                    },
                    { 
                        text: lang === 'sv' 
                            ? `Multiplicera först: ${a} · ${target} = ${a * target}. Addera sedan starttalet (${b}):` 
                            : `Multiply first: ${a} · ${target} = ${a * target}. Then add the start value (${b}):`, 
                        latex: `V = ${a * target} + ${b} = \\mathbf{${ans}}` 
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
                description: lang === 'sv' 
                    ? "Vilket uttryck beskriver antalet stickor i figur n?" 
                    : "Which expression describes the number of sticks in figure n?",
                answerType: 'text',
                geometry: { type: 'pattern', subtype: 'matchsticks', figures: figs }
            },
            token: this.toBase64(formula), 
            variationKey: 'find_formula', 
            type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' 
                        ? "Räkna stickorna i figurerna för att skriva talföljden:" 
                        : "Count the sticks in each figure to form the sequence:", 
                    latex: `\\text{Figur 1} = ${counts[0]}, \\quad \\text{Figur 2} = ${counts[1]}, \\quad \\text{Figur 3} = ${counts[2]}` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Steg 1: Hitta differensen. Hur många stickor läggs till för varje ny figur?` 
                        : `Step 1: Find the difference. How many sticks are added for each figure?`, 
                    latex: `\\text{Differens} = ${counts[1]} - ${counts[0]} = \\mathbf{${a}}` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Steg 2: Hitta starttalet (tänk figur 0 innan mönstret började). Ta figur 1 (${counts[0]}) minus differensen (${a}):` 
                        : `Step 2: Find the starting number (figure 0). Take figure 1 (${counts[0]}) minus the difference (${a}):`, 
                    latex: `\\text{Starttal} = ${counts[0]} - ${a} = \\mathbf{${b}}` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Sätt ihop till formeln: differensen gånger n plus starttalet:` 
                        : `Combine into the formula: difference times n plus starting number:`, 
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
                token: this.toBase64(nextVal.toString()), 
                variationKey: v, 
                type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? "Titta i tabellens värdekolumn. Hur mycket ökar värdet för varje steg?" 
                            : "Look at the table values. How much does the value increase each step?", 
                        latex: `\\text{Differens} = ${rows[1][1]} - ${rows[0][1]} = \\mathbf{${a}}` 
                    },
                    { 
                        text: lang === 'sv' 
                            ? `Eftersom tabellen ökar med ${a} för varje steg, addera ${a} till värdet vid n = 4:` 
                            : `Since the table grows by ${a} each step, add ${a} to the value at n = 4:`, 
                        latex: `V(5) = ${rows[3][1]} + \\mathbf{${a}} = \\mathbf{${nextVal}}` 
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
                description: lang === 'sv' 
                    ? "Bestäm uttrycket på formen $an + b$ som beskriver mönstret i tabellen." 
                    : "Determine the expression $an + b$ that describes the pattern in the table.",
                answerType: 'text',
                geometry: { type: 'frequency_table', headers: ['n', 'Värde'], rows }
            },
            token: this.toBase64(`${a}n+${b}`), 
            variationKey: 'table_formula', 
            type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' 
                        ? "Steg 1: Hitta differensen (a). Hur mycket ökar värdet när n ökar med 1?" 
                        : "Step 1: Find the difference (a). How much does the value increase when n increases by 1?", 
                    latex: `a = ${rows[1][1]} - ${rows[0][1]} = \\mathbf{${a}}` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Steg 2: Hitta starttalet (b) vid n = 0. Ta värdet vid n = 1 (${rows[0][1]}) minus differensen (${a}):` 
                        : `Step 2: Find the starting number (b) at n = 0. Take the value at n = 1 (${rows[0][1]}) minus the difference (${a}):`, 
                    latex: `b = ${rows[0][1]} - ${a} = \\mathbf{${b}}` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Formeln skrivs alltid som differensen framför n plus starttalet:` 
                        : `The formula is written as the difference in front of n plus the starting number:`, 
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
                description: lang === 'sv' 
                    ? `I ett mönster med formeln $V = ${a}n + ${b}$, vilket figurnummer (n) har värdet ${total}?` 
                    : `In a pattern with the formula $V = ${a}n + ${b}$, which figure (n) has the value ${total}?`,
                interceptorToken: backgroundToken,
                answerType: 'numeric'
            },
            token: this.toBase64(n.toString()), 
            variationKey: 'reverse_calc', 
            type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' 
                        ? `Sätt formeln lika med det totala värdet (${total}):` 
                        : `Set the formula equal to the total value (${total}):`, 
                    latex: `${a}n + ${b} = ${total}` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Dra bort starttalet (${b}) från båda sidor:` 
                        : `Subtract the start number (${b}) from both sides:`, 
                    latex: `${a}n = ${total} - ${b} \\implies ${a}n = \\mathbf{${total - b}}` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Dela med differensen (${a}) för att hitta figurnumret n:` 
                        : `Divide by the difference (${a}) to find the figure number n:`, 
                    latex: `n = \\frac{${total - b}}{${a}} = \\mathbf{${n}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: n = ${n}` : `Answer: n = ${n}`, 
                    latex: `${n}` 
                }
            ]
        };
    }
}