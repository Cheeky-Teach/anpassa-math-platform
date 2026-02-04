import { MathUtils } from '../utils/MathUtils.js';

export class PatternsGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_NextNumber(lang);
            case 2: return this.level2_HighTerm(lang);
            case 3: return this.level3_VisualFormula(lang);
            case 4: return this.level4_TableToFormula(lang);
            case 5: return this.level5_ReverseEngineering(lang);
            default: return this.level1_NextNumber(lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    // L1: Next number or Difference (Arithmetic & simple Multiplicative)
    private level1_NextNumber(lang: string): any {
        const type = MathUtils.randomChoice(['arithmetic', 'geometric']);
        let sequence: any[] = [];
        let answer: number;
        let diff: number = 0;
        let isFindingDiff = MathUtils.randomInt(0, 1) === 0;

        if (type === 'arithmetic') {
            diff = MathUtils.randomInt(2, 7) * (MathUtils.randomInt(0, 1) === 0 ? 1 : -1);
            const start = MathUtils.randomInt(5, 30);
            sequence = [start, start + diff, start + diff * 2, start + diff * 3];
            answer = isFindingDiff ? diff : start + diff * 4;
        } else {
            const ratio = MathUtils.randomChoice([2, 3, 10]);
            const start = MathUtils.randomChoice([1, 2, 5]);
            sequence = [start, start * ratio, start * ratio * ratio, start * ratio * ratio * ratio];
            answer = sequence[3] * ratio;
            isFindingDiff = false; // Always find next for geometric
        }

        const desc = lang === 'sv' 
            ? (isFindingDiff ? "Vad är skillnaden (differensen) mellan talen?" : "Vilket tal kommer härnäst i mönstret?") 
            : (isFindingDiff ? "What is the common difference between the numbers?" : "What is the next number in the pattern?");

        const clues = [
            {
                text: lang === 'sv' 
                    ? "Jämför två tal som står bredvid varandra. Hur mycket ändras det?" 
                    : "Compare two adjacent numbers. How much does it change?",
                latex: `${sequence[1]} - ${sequence[0]} = ${sequence[1] - sequence[0]}`
            },
            {
                text: lang === 'sv' 
                    ? (type === 'arithmetic' ? "Mönstret ökar eller minskar med lika mycket varje gång." : "Här multipliceras talet med samma siffra varje gång.")
                    : (type === 'arithmetic' ? "The pattern increases or decreases by the same amount each time." : "Here, the number is multiplied by the same factor each time.")
            }
        ];

        return {
            renderData: {
                description: desc,
                answerType: 'numeric',
                geometry: {
                    type: 'pattern',
                    subtype: 'sequence',
                    sequence: [...sequence, (isFindingDiff ? sequence[3] + diff : '?')]
                }
            },
            token: this.toBase64(answer.toString()),
            clues
        };
    }

    // L2: High Terms & Decreasing patterns
    private level2_HighTerm(lang: string): any {
        const isDecreasing = MathUtils.randomInt(0, 1) === 1;
        const diff = MathUtils.randomInt(3, 10) * (isDecreasing ? -1 : 1);
        const startValue = MathUtils.randomInt(20, 100); // Figur 1
        const targetFig = MathUtils.randomChoice([10, 15, 20, 100]);
        
        // n=1 is startValue. n=targetFig is result.
        // Formula: Value = startValue + (targetFig - 1) * diff
        const answer = startValue + (targetFig - 1) * diff;
        const sequence = [startValue, startValue + diff, startValue + diff * 2];

        return {
            renderData: {
                description: lang === 'sv' 
                    ? `Mönstret börjar ${sequence.join(', ')}. Beräkna värdet för figur ${targetFig}.` 
                    : `The pattern starts ${sequence.join(', ')}. Calculate the value for figure ${targetFig}.`,
                answerType: 'numeric',
                geometry: {
                    type: 'pattern',
                    subtype: 'sequence',
                    sequence: [...sequence, '...']
                }
            },
            token: this.toBase64(answer.toString()),
            clues: [
                {
                    text: lang === 'sv' 
                        ? `Varje steg ändras med ${diff}. För att gå till figur ${targetFig} behöver du ta ${targetFig - 1} steg.` 
                        : `Each step changes by ${diff}. To get to figure ${targetFig}, you need to take ${targetFig - 1} steps.`,
                    latex: `\\text{Steg} = ${targetFig} - 1 = ${targetFig - 1}`
                },
                {
                    text: lang === 'sv' 
                        ? "Multiplicera antalet steg med skillnaden och addera till starttalet." 
                        : "Multiply the number of steps by the difference and add to the starting value.",
                    latex: `${startValue} + (${targetFig - 1} \\cdot ${diff}) = ${answer}`
                }
            ]
        };
    }

    // L3: Visual patterns (Matchsticks & Dots)
    private level3_VisualFormula(lang: string): any {
        const scenarios = [
            { name: 'triangles', diff: 2, start: 1, sv: 'trianglar', en: 'triangles' }, // 2n + 1
            { name: 'squares', diff: 3, start: 1, sv: 'kvadrater', en: 'squares' },   // 3n + 1
            { name: 'houses', diff: 5, start: 1, sv: 'hus', en: 'houses' },        // 5n + 1
            { name: 'fence', diff: 3, start: 2, sv: 'staketdelar', en: 'fence parts' } // 3n + 2
        ];
        const scene = MathUtils.randomChoice(scenarios);
        
        const getFigures = () => {
            const figs = [];
            for (let n = 1; n <= 3; n++) {
                const sticks = [];
                const offsetX = 10;
                const offsetY = 70;
                const size = 25;
                
                for (let i = 0; i < n; i++) {
                    const x = offsetX + i * size;
                    if (scene.name === 'triangles') {
                        sticks.push({ x1: x, y1: offsetY, x2: x + size, y2: offsetY });
                        sticks.push({ x1: x, y1: offsetY, x2: x + size/2, y2: offsetY - size });
                        if (i === n - 1) sticks.push({ x1: x + size, y1: offsetY, x2: x + size/2, y2: offsetY - size });
                    } else if (scene.name === 'squares' || scene.name === 'houses') {
                        sticks.push({ x1: x, y1: offsetY, x2: x + size, y2: offsetY }); // bottom
                        sticks.push({ x1: x, y1: offsetY, x2: x, y2: offsetY - size }); // left
                        if (i === n - 1) sticks.push({ x1: x + size, y1: offsetY, x2: x + size, y2: offsetY - size });
                        sticks.push({ x1: x, y1: offsetY - size, x2: x + size, y2: offsetY - size }); // top
                        if (scene.name === 'houses') {
                            sticks.push({ x1: x, y1: offsetY - size, x2: x + size/2, y2: offsetY - size - 12 });
                            sticks.push({ x1: x + size, y1: offsetY - size, x2: x + size/2, y2: offsetY - size - 12 });
                        }
                    } else if (scene.name === 'fence') {
                        sticks.push({ x1: x, y1: offsetY, x2: x, y2: offsetY - size }); // post
                        sticks.push({ x1: x, y1: offsetY - 5, x2: x + size, y2: offsetY - 5 }); // rail bottom
                        sticks.push({ x1: x, y1: offsetY - size + 5, x2: x + size, y2: offsetY - size + 5 }); // rail top
                        if (i === n - 1) sticks.push({ x1: x + size, y1: offsetY, x2: x + size, y2: offsetY - size });
                    }
                }
                figs.push({ sticks, width: 40 + n * size, height: 100 });
            }
            return figs;
        };

        const formula = `${scene.diff}n+${scene.start}`;

        return {
            renderData: {
                description: lang === 'sv' 
                    ? `Skriv ett uttryck för hur många stickor som behövs till $n$ stycken ${scene.sv}.` 
                    : `Write an expression for how many sticks are needed for $n$ ${scene.en}.`,
                answerType: 'text',
                geometry: {
                    type: 'pattern',
                    subtype: 'matchsticks',
                    figures: getFigures()
                }
            },
            token: this.toBase64(formula.replace(/\s/g, '')),
            clues: [
                {
                    text: lang === 'sv' 
                        ? `Steg 1: Hur många stickor läggs till för varje ny figur? Det talet ska stå framför n.` 
                        : `Step 1: How many sticks are added for each new figure? That number goes in front of n.`,
                    latex: `${scene.diff}n`
                },
                {
                    text: lang === 'sv' 
                        ? `Steg 2: Titta på Figur 1. Om n=1 ger uttrycket ${scene.diff} stycken. Hur många fler behövs för att nå det riktiga antalet?` 
                        : `Step 2: Look at Figure 1. If n=1, the expression gives ${scene.diff}. How many more are needed to reach the real count?`,
                    latex: `${scene.diff} \\cdot 1 + \\text{?} = ${scene.diff + scene.start}`
                }
            ]
        };
    }

    // L4: Table to Formula (with negative constants)
    private level4_TableToFormula(lang: string): any {
        const diff = MathUtils.randomInt(2, 6);
        const k = MathUtils.randomInt(-4, 4);
        const formula = `${diff}n${k > 0 ? '+' + k : (k < 0 ? k : '')}`;

        return {
            renderData: {
                description: lang === 'sv' 
                    ? "Vilket uttryck beskriver sambandet mellan n och värdet?" 
                    : "Which expression describes the relationship between n and the value?",
                answerType: 'text',
                geometry: {
                    type: 'frequency_table',
                    headers: ["n", "Värde (Value)"],
                    rows: [
                        [1, diff * 1 + k],
                        [2, diff * 2 + k],
                        [3, diff * 3 + k],
                        [4, diff * 4 + k]
                    ]
                }
            },
            token: this.toBase64(formula.replace(/\s/g, '')),
            clues: [
                {
                    text: lang === 'sv' ? "Hitta mönstrets 'hopp'. Hur mycket ökar värdet för varje steg n tar?" : "Find the 'jump'. How much does the value increase for every step n takes?",
                    latex: `d = ${diff}`
                },
                {
                    text: lang === 'sv' 
                        ? `Titta på n=1. Om hoppet är ${diff}, borde värdet vara ${diff}n. Men här är det ${diff*1 + k}. Vad har lagts till?` 
                        : `Look at n=1. If the jump is ${diff}, the value should be ${diff}n. But here it is ${diff*1 + k}. What was added?`,
                    latex: `${diff} \\cdot 1 + k = ${diff + k} \\rightarrow k = ${k}`
                }
            ]
        };
    }

    // L5: Reverse engineering (Solve for n)
    private level5_ReverseEngineering(lang: string): any {
        const diff = MathUtils.randomInt(3, 7);
        const k = MathUtils.randomInt(1, 15);
        const n = MathUtils.randomInt(15, 40);
        const total = diff * n + k;
        const formula = `${diff}n + ${k}`;

        const scenario = MathUtils.randomChoice(['houses', 'dots', 'tiles']);
        const desc = lang === 'sv'
            ? `Ett mönster av ${scenario === 'houses' ? 'tändstickshus' : 'plattor'} följer formeln $V = ${formula}$. Vilket nummer ($n$) har figuren som består av totalt ${total} delar?`
            : `A pattern of ${scenario === 'houses' ? 'matchstick houses' : 'tiles'} follows the formula $V = ${formula}$. Which figure number ($n$) consists of a total of ${total} parts?`;

        return {
            renderData: {
                description: desc,
                answerType: 'numeric'
            },
            token: this.toBase64(n.toString()),
            clues: [
                {
                    text: lang === 'sv' ? "Sätt uttrycket lika med det totala antalet." : "Set the expression equal to the total number.",
                    latex: `${diff}n + ${k} = ${total}`
                },
                {
                    text: lang === 'sv' ? "Börja med att ta bort konstanten (minus på båda sidor)." : "Start by removing the constant (subtract on both sides).",
                    latex: `${diff}n = ${total} - ${k} = ${total - k}`
                },
                {
                    text: lang === 'sv' ? "Dela nu med siffran framför n för att hitta svaret." : "Now divide by the number in front of n to find the answer.",
                    latex: `n = \\frac{${total - k}}{${diff}} = ${n}`
                }
            ]
        };
    }
}