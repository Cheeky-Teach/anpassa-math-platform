import { MathUtils } from '../utils/MathUtils.js';

export class AlgebraicGeometryGenerator {
    
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        let questionData: any;

        switch (level) {
            case 1: questionData = this.perimeter_writeExpression(lang); break;
            case 2: questionData = this.perimeter_solveEquation(lang); break;
            case 3: questionData = this.area_writeExpression(lang); break;
            case 4: questionData = this.area_solveEquation(lang); break;
            case 5: questionData = this.angles_writeExpression(lang); break;
            case 6: questionData = this.angles_solveEquation(lang); break;
            default: questionData = this.perimeter_writeExpression(lang); break;
        }

        return questionData;
    }

    public generateByVariation(key: string, lang: string = 'sv', options: any = {}): any {
        let questionData: any;
        switch (key) {
            case 'perimeter_write': questionData = this.perimeter_writeExpression(lang); break;
            case 'perimeter_solve': questionData = this.perimeter_solveEquation(lang); break;
            case 'area_write': questionData = this.area_writeExpression(lang); break;
            case 'area_solve': questionData = this.area_solveEquation(lang); break;
            case 'angles_write': questionData = this.angles_writeExpression(lang); break;
            case 'angles_solve': questionData = this.angles_solveEquation(lang); break;
            default: questionData = this.perimeter_writeExpression(lang); break;
        }
        if (!questionData.metadata) questionData.metadata = {};
        questionData.metadata.variation_key = key;
        return questionData;
    }

    private toBase64(str: string): string {
        return Buffer.from(str, 'utf-8').toString('base64');
    }

    private getLabels(w: string, h: string, s?: string) {
        const hasSlantOrHyp = Boolean(s && s.trim().length > 0);
        return { 
            w, 
            h,
            b: w, base: w, width: w, bottom: w, top: w,
            height: h, left: h, right: h,
            ...(hasSlantOrHyp ? {
                s,
                hyp: s,
                c: s,
                diagonal: s,
                slant: s,
                s1: s,
                s2: s
            } : {}),
            arc1: w, 
            arc2: h
        };
    }

    // Mathematical Term Formatting Engine
    private formatTerm(a: number, b: number): string {
        if (b === 0) return `${a}x`;
        return b > 0 ? `${a}x + ${b}` : `${a}x - ${Math.abs(b)}`;
    }

    // Compact format for token matching (no spaces)
    private formatTokenTerm(a: number, b: number): string {
        if (b === 0) return `${a}x`;
        return b > 0 ? `${a}x+${b}` : `${a}x-${Math.abs(b)}`;
    }

    // Formats a list of signed numbers cleanly: e.g. [4, -3, 2] -> "4 - 3 + 2"
    private formatSignedChain(nums: number[], suffix: string = ''): string {
        const nonZero = nums.filter(n => n !== 0);
        if (nonZero.length === 0) return '';
        return nonZero
            .map((n, idx) => {
                const absVal = `${Math.abs(n)}${suffix}`;
                if (idx === 0) return n < 0 ? `-${absVal}` : absVal;
                return n < 0 ? `- ${absVal}` : `+ ${absVal}`;
            })
            .join(' ');
    }

    // Builds clean grouped-terms LaTeX for combining like terms
    private buildGroupedTermsLatex(terms: { a: number; b: number }[]): string {
        const xChain = this.formatSignedChain(terms.map(t => t.a), 'x');
        const constValues = terms.map(t => t.b).filter(b => b !== 0);
        if (constValues.length === 0) {
            return `\\mathbf{${xChain}}`;
        }
        const constChain = this.formatSignedChain(constValues, '');
        const leadingPlus = constValues[0] > 0 ? '+ ' : '';
        return `\\mathbf{${xChain}} ${leadingPlus}\\mathbf{${constChain}}`;
    }

    // Dynamic Expression Generator (Mixes Single and Double Terms)
    private genLinearTerm(minA = 2, maxA = 12, minB = 1, maxB = 15, allowNegative = true): { a: number, b: number, text: string } {
        const a = MathUtils.randomInt(minA, maxA);
        const useConst = Math.random() > 0.35;
        let b = 0;
        if (useConst) {
            b = MathUtils.randomInt(minB, maxB);
            if (allowNegative && Math.random() > 0.5) b = -b;
        }
        return { a, b, text: this.formatTerm(a, b) };
    }

    // Trigonometry Engine for True-to-Math Dynamic Angles
    private calcPoint(cx: number, cy: number, radius: number, angleDeg: number) {
        const rad = (angleDeg * Math.PI) / 180;
        return {
            x: Math.round(cx + radius * Math.cos(-rad)),
            y: Math.round(cy + radius * Math.sin(-rad))
        };
    }

    // =========================================================================
    // LEVEL 1: Omkrets - Teckna uttryck
    // =========================================================================
    private perimeter_writeExpression(lang: string): any {
        const shapeChoice = MathUtils.randomInt(1, 4);
        let geom: any, ansDisplay: string, ansToken: string, desc: string, clues: any[];

        desc = lang === 'sv'
            ? `Teckna ett förenklat uttryck för figurens omkrets.`
            : `Write a simplified expression for the figure's perimeter.`;

        if (shapeChoice === 1) { // Rectangle
            const w = this.genLinearTerm(2, 6, 1, 10);
            const h = this.genLinearTerm(2, 6, 1, 10);
            geom = { type: "rectangle", width: 200, height: 120, labels: this.getLabels(w.text, h.text) };
            const sumA = 2 * w.a + 2 * h.a;
            const sumB = 2 * w.b + 2 * h.b;
            ansDisplay = this.formatTerm(sumA, sumB);
            ansToken = this.formatTokenTerm(sumA, sumB);
            const grouped = this.buildGroupedTermsLatex([w, w, h, h]);

            clues = [
                {
                    text: lang === 'sv'
                        ? "Omkretsen är summan av rektangelns fyra yttre sidor (två baser och två höjder)."
                        : "The perimeter is the sum of the rectangle's four outer sides (two bases and two heights).",
                    latex: `O = (${w.text}) + (${h.text}) + (${w.text}) + (${h.text})`
                },
                {
                    text: lang === 'sv'
                        ? "Samla alla x-termer för sig och alla sifferkonstanter för sig:"
                        : "Group all x-terms together and all number constants together:",
                    latex: grouped
                },
                {
                    text: lang === 'sv'
                        ? "Förenkla varje grupp genom att räkna ihop termerna:"
                        : "Simplify each group by combining like terms:",
                    latex: `O = \\mathbf{${ansDisplay}}`
                },
                {
                    text: lang === 'sv' ? `Svar: ${ansDisplay}` : `Answer: ${ansDisplay}`,
                    latex: `\\mathbf{${ansDisplay}}`
                }
            ];
        } else if (shapeChoice === 2) { // Square
            const s = this.genLinearTerm(2, 8, 1, 12);
            geom = { type: "rectangle", subtype: "square", width: 150, height: 150, labels: this.getLabels(s.text, s.text) };
            const sumA = 4 * s.a;
            const sumB = 4 * s.b;
            ansDisplay = this.formatTerm(sumA, sumB);
            ansToken = this.formatTokenTerm(sumA, sumB);

            clues = [
                {
                    text: lang === 'sv'
                        ? "En kvadrat har fyra lika långa sidor. Multiplicera sidans uttryck med 4:"
                        : "A square has four equal sides. Multiply the side expression by 4:",
                    latex: `O = 4 \\cdot (${s.text})`
                },
                {
                    text: lang === 'sv'
                        ? (s.b !== 0
                            ? `Multiplicera in 4 med både ${s.a}x och ${Math.abs(s.b)} i parentesen:`
                            : `Multiplicera 4 med ${s.a}x:`)
                        : (s.b !== 0
                            ? `Distribute 4 into both ${s.a}x and ${Math.abs(s.b)} inside the parentheses:`
                            : `Multiply 4 by ${s.a}x:`),
                    latex: s.b !== 0
                        ? `O = \\mathbf{4 \\cdot ${s.a}x ${s.b > 0 ? '+' : '-'} 4 \\cdot ${Math.abs(s.b)}}`
                        : `O = \\mathbf{4 \\cdot ${s.a}x}`
                },
                {
                    text: lang === 'sv'
                        ? "Förenkla multiplikationerna till ett färdigt uttryck:"
                        : "Simplify the multiplications into the final expression:",
                    latex: `O = \\mathbf{${ansDisplay}}`
                },
                {
                    text: lang === 'sv' ? `Svar: ${ansDisplay}` : `Answer: ${ansDisplay}`,
                    latex: `\\mathbf{${ansDisplay}}`
                }
            ];
        } else if (shapeChoice === 3) { // Equilateral Triangle
            const s = this.genLinearTerm(2, 8, 1, 12);
            geom = { type: "triangle", subtype: "equilateral", width: 160, height: 140, labels: this.getLabels(s.text, "", "") };
            const sumA = 3 * s.a;
            const sumB = 3 * s.b;
            ansDisplay = this.formatTerm(sumA, sumB);
            ansToken = this.formatTokenTerm(sumA, sumB);

            clues = [
                {
                    text: lang === 'sv'
                        ? "En liksidig triangel har tre lika långa sidor. Multiplicera sidans uttryck med 3:"
                        : "An equilateral triangle has three equal sides. Multiply the side expression by 3:",
                    latex: `O = 3 \\cdot (${s.text})`
                },
                {
                    text: lang === 'sv'
                        ? (s.b !== 0
                            ? `Multiplicera in 3 med varje term inuti parentesen:`
                            : `Multiplicera 3 med ${s.a}x:`)
                        : (s.b !== 0
                            ? `Distribute 3 into every term inside the parentheses:`
                            : `Multiply 3 by ${s.a}x:`),
                    latex: s.b !== 0
                        ? `O = \\mathbf{3 \\cdot ${s.a}x ${s.b > 0 ? '+' : '-'} 3 \\cdot ${Math.abs(s.b)}}`
                        : `O = \\mathbf{3 \\cdot ${s.a}x}`
                },
                {
                    text: lang === 'sv'
                        ? "Förenkla uttrycket:"
                        : "Simplify the expression:",
                    latex: `O = \\mathbf{${ansDisplay}}`
                },
                {
                    text: lang === 'sv' ? `Svar: ${ansDisplay}` : `Answer: ${ansDisplay}`,
                    latex: `\\mathbf{${ansDisplay}}`
                }
            ];
        } else { // Right Triangle
            const s1 = this.genLinearTerm(2, 6, 1, 8);
            const s2 = this.genLinearTerm(2, 6, 1, 8);
            const s3 = this.genLinearTerm(2, 6, 1, 8);
            geom = { type: "triangle", subtype: "right", width: 180, height: 140, labels: this.getLabels(s1.text, s2.text, s3.text) };
            const sumA = s1.a + s2.a + s3.a;
            const sumB = s1.b + s2.b + s3.b;
            ansDisplay = this.formatTerm(sumA, sumB);
            ansToken = this.formatTokenTerm(sumA, sumB);
            const grouped = this.buildGroupedTermsLatex([s1, s2, s3]);

            clues = [
                {
                    text: lang === 'sv'
                        ? "Omkretsen är summan av triangelns tre yttre sidor:"
                        : "The perimeter is the sum of the triangle's three outer sides:",
                    latex: `O = (${s1.text}) + (${s2.text}) + (${s3.text})`
                },
                {
                    text: lang === 'sv'
                        ? "Sortera uttrycket genom att samla x-termer och siffertermer var för sig:"
                        : "Group x-terms and constant terms separately:",
                    latex: grouped
                },
                {
                    text: lang === 'sv'
                        ? "Förenkla genom att räkna ihop lika termer:"
                        : "Simplify by combining like terms:",
                    latex: `O = \\mathbf{${ansDisplay}}`
                },
                {
                    text: lang === 'sv' ? `Svar: ${ansDisplay}` : `Answer: ${ansDisplay}`,
                    latex: `\\mathbf{${ansDisplay}}`
                }
            ];
        }

        return {
            renderData: { geometry: geom, description: desc, answerType: "text", answer: ansToken },
            token: this.toBase64(ansToken), variationKey: "perimeter_write", type: "expression", clues: clues
        };
    }

    // =========================================================================
    // LEVEL 2: Omkrets - Lös ekvationen
    // =========================================================================
    private perimeter_solveEquation(lang: string): any {
        const shapeChoice = MathUtils.randomInt(1, 3);
        const targetX = MathUtils.randomInt(2, 12);
        let geom: any, desc: string, clues: any[], totalP: number;

        if (shapeChoice === 1) { // Rectangle
            const w = this.genLinearTerm(2, 6, 1, 15, false);
            const h = this.genLinearTerm(2, 6, 1, 15, false);
            totalP = 2 * (w.a * targetX + w.b) + 2 * (h.a * targetX + h.b);
            geom = { type: "rectangle", width: 200, height: 120, labels: this.getLabels(w.text, h.text) };
            desc = lang === 'sv' ? `Rektangelns omkrets är ${totalP} cm. Beräkna x.` : `The rectangle's perimeter is ${totalP} cm. Calculate x.`;

            const totalA = 2 * w.a + 2 * h.a;
            const totalB = 2 * w.b + 2 * h.b;
            const rhsAfterSub = totalP - totalB;

            clues = [
                {
                    text: lang === 'sv'
                        ? `Summan av rektangelns fyra sidor är lika med omkretsen ${totalP}:`
                        : `The sum of the rectangle's four sides equals the perimeter ${totalP}:`,
                    latex: `(${w.text}) + (${h.text}) + (${w.text}) + (${h.text}) = ${totalP}`
                },
                {
                    text: lang === 'sv'
                        ? "Samla x-termer och siffror i vänsterledet till en enklare ekvation:"
                        : "Combine x-terms and constants on the left side into a standard equation:",
                    latex: totalB > 0 ? `${totalA}x + \\mathbf{${totalB}} = ${totalP}` : `${totalA}x = ${totalP}`
                },
                ...(totalB > 0 ? [
                    {
                        text: lang === 'sv'
                            ? `Ta bort +${totalB} genom att subtrahera ${totalB} från båda sidor:`
                            : `Remove +${totalB} by subtracting ${totalB} from both sides:`,
                        latex: `${totalA}x + ${totalB} \\mathbf{- ${totalB}} = ${totalP} \\mathbf{- ${totalB}}`
                    },
                    {
                        text: lang === 'sv'
                            ? "Förenkla siffertermerna så att x-termen står ensam:"
                            : "Simplify the constants to isolate the x-term:",
                        latex: `${totalA}x = \\mathbf{${rhsAfterSub}}`
                    }
                ] : []),
                {
                    text: lang === 'sv'
                        ? `Dela båda sidor med ${totalA} för att få x ensamt:`
                        : `Divide both sides by ${totalA} to isolate x:`,
                    latex: `\\frac{${totalA}x}{\\mathbf{${totalA}}} = \\frac{${rhsAfterSub}}{\\mathbf{${totalA}}}`
                },
                {
                    text: lang === 'sv' ? `Svar: x = ${targetX}` : `Answer: x = ${targetX}`,
                    latex: `x = \\mathbf{${targetX}}`
                }
            ];
        } else if (shapeChoice === 2) { // Square
            const s = this.genLinearTerm(2, 8, 1, 15, false);
            totalP = 4 * (s.a * targetX + s.b);
            geom = { type: "rectangle", subtype: "square", width: 150, height: 150, labels: this.getLabels(s.text, s.text) };
            desc = lang === 'sv' ? `Kvadratens omkrets är ${totalP} cm. Beräkna x.` : `The square's perimeter is ${totalP} cm. Calculate x.`;

            const totalA = 4 * s.a;
            const totalB = 4 * s.b;
            const rhsAfterSub = totalP - totalB;

            clues = [
                {
                    text: lang === 'sv'
                        ? `En kvadrat har 4 lika långa sidor. Ställ upp ekvationen för omkretsen ${totalP}:`
                        : `A square has 4 equal sides. Set up the equation for the perimeter ${totalP}:`,
                    latex: `4 \\cdot (${s.text}) = ${totalP}`
                },
                {
                    text: lang === 'sv'
                        ? "Multiplicera in 4 i parentesen för att förenkla vänsterledet:"
                        : "Multiply 4 into the parentheses to simplify the left side:",
                    latex: totalB > 0 ? `${totalA}x + \\mathbf{${totalB}} = ${totalP}` : `${totalA}x = ${totalP}`
                },
                ...(totalB > 0 ? [
                    {
                        text: lang === 'sv'
                            ? `Ta bort +${totalB} genom att subtrahera ${totalB} från båda sidor:`
                            : `Remove +${totalB} by subtracting ${totalB} from both sides:`,
                        latex: `${totalA}x + ${totalB} \\mathbf{- ${totalB}} = ${totalP} \\mathbf{- ${totalB}}`
                    },
                    {
                        text: lang === 'sv'
                            ? "Förenkla siffertermerna:"
                            : "Simplify the constant numbers:",
                        latex: `${totalA}x = \\mathbf{${rhsAfterSub}}`
                    }
                ] : []),
                {
                    text: lang === 'sv'
                        ? `Dela båda sidor med ${totalA} för att lösa ut x:`
                        : `Divide both sides by ${totalA} to solve for x:`,
                    latex: `\\frac{${totalA}x}{\\mathbf{${totalA}}} = \\frac{${rhsAfterSub}}{\\mathbf{${totalA}}}`
                },
                {
                    text: lang === 'sv' ? `Svar: x = ${targetX}` : `Answer: x = ${targetX}`,
                    latex: `x = \\mathbf{${targetX}}`
                }
            ];
        } else { // Equilateral Triangle
            const s = this.genLinearTerm(2, 8, 1, 15, false);
            totalP = 3 * (s.a * targetX + s.b);
            geom = { type: "triangle", subtype: "equilateral", width: 160, height: 140, labels: this.getLabels(s.text, "", "") };
            desc = lang === 'sv' ? `En liksidig triangels omkrets är ${totalP} cm. Beräkna x.` : `The triangle's perimeter is ${totalP} cm. Calculate x.`;

            const totalA = 3 * s.a;
            const totalB = 3 * s.b;
            const rhsAfterSub = totalP - totalB;

            clues = [
                {
                    text: lang === 'sv'
                        ? `En liksidig triangel har 3 lika långa sidor. Ställ upp ekvationen:`
                        : `An equilateral triangle has 3 equal sides. Set up the equation:`,
                    latex: `3 \\cdot (${s.text}) = ${totalP}`
                },
                {
                    text: lang === 'sv'
                        ? "Multiplicera in 3 i parentesen:"
                        : "Multiply 3 into the parentheses:",
                    latex: totalB > 0 ? `${totalA}x + \\mathbf{${totalB}} = ${totalP}` : `${totalA}x = ${totalP}`
                },
                ...(totalB > 0 ? [
                    {
                        text: lang === 'sv'
                            ? `Ta bort +${totalB} genom att subtrahera ${totalB} från båda sidor:`
                            : `Remove +${totalB} by subtracting ${totalB} from both sides:`,
                        latex: `${totalA}x + ${totalB} \\mathbf{- ${totalB}} = ${totalP} \\mathbf{- ${totalB}}`
                    },
                    {
                        text: lang === 'sv'
                            ? "Förenkla uttrycket:"
                            : "Simplify the expression:",
                        latex: `${totalA}x = \\mathbf{${rhsAfterSub}}`
                    }
                ] : []),
                {
                    text: lang === 'sv'
                        ? `Dela båda sidor med ${totalA}:`
                        : `Divide both sides by ${totalA}:`,
                    latex: `\\frac{${totalA}x}{\\mathbf{${totalA}}} = \\frac{${rhsAfterSub}}{\\mathbf{${totalA}}}`
                },
                {
                    text: lang === 'sv' ? `Svar: x = ${targetX}` : `Answer: x = ${targetX}`,
                    latex: `x = \\mathbf{${targetX}}`
                }
            ];
        }

        return {
            renderData: { geometry: geom, description: desc, answerType: "numeric", answer: targetX },
            token: this.toBase64(targetX.toString()), variationKey: "perimeter_solve", type: "calculate", clues: clues
        };
    }

    // =========================================================================
    // LEVEL 3: Area - Teckna uttryck
    // =========================================================================
    private area_writeExpression(lang: string): any {
        const shapeChoice = MathUtils.randomInt(1, 2);
        let geom: any, ansDisplay: string, ansToken: string, desc: string, clues: any[];

        desc = lang === 'sv'
            ? `Teckna ett förenklat uttryck för figurens area.`
            : `Write a simplified expression for the figure's area.`;

        if (shapeChoice === 1) { // Rectangle
            const base = this.genLinearTerm(2, 8, 1, 10);
            const heightC = MathUtils.randomInt(3, 12);
            geom = { type: "rectangle", width: 200, height: 120, labels: this.getLabels(base.text, `${heightC}`) };
            const prodA = base.a * heightC;
            const prodB = base.b * heightC;
            ansDisplay = this.formatTerm(prodA, prodB);
            ansToken = this.formatTokenTerm(prodA, prodB);

            clues = [
                {
                    text: lang === 'sv'
                        ? "Rektangelns area är basen multiplicerat med höjden. Sätt parentes runt basens uttryck:"
                        : "The rectangle's area is base times height. Put parentheses around the base expression:",
                    latex: `A = ${heightC} \\cdot (${base.text})`
                },
                {
                    text: lang === 'sv'
                        ? (base.b !== 0
                            ? `Multiplicera in ${heightC} med varje term inuti parentesen:`
                            : `Multiplicera ${heightC} med ${base.a}x:`)
                        : (base.b !== 0
                            ? `Distribute ${heightC} into every term inside the parentheses:`
                            : `Multiply ${heightC} by ${base.a}x:`),
                    latex: base.b !== 0
                        ? `A = \\mathbf{${heightC} \\cdot ${base.a}x ${base.b > 0 ? '+' : '-'} ${heightC} \\cdot ${Math.abs(base.b)}}`
                        : `A = \\mathbf{${heightC} \\cdot ${base.a}x}`
                },
                {
                    text: lang === 'sv'
                        ? "Förenkla multiplikationerna:"
                        : "Simplify the multiplications:",
                    latex: `A = \\mathbf{${ansDisplay}}`
                },
                {
                    text: lang === 'sv' ? `Svar: ${ansDisplay}` : `Answer: ${ansDisplay}`,
                    latex: `\\mathbf{${ansDisplay}}`
                }
            ];
        } else { // Right Triangle
            const base = this.genLinearTerm(2, 6, 1, 10);
            const heightC = MathUtils.randomInt(2, 8) * 2;
            geom = { type: "triangle", subtype: "right", width: 180, height: 140, labels: this.getLabels(base.text, `${heightC}`) };
            const halfH = heightC / 2;
            const prodA = base.a * halfH;
            const prodB = base.b * halfH;
            ansDisplay = this.formatTerm(prodA, prodB);
            ansToken = this.formatTokenTerm(prodA, prodB);
            const numExpr = this.formatTerm(base.a * heightC, base.b * heightC);

            clues = [
                {
                    text: lang === 'sv'
                        ? "Triangelns area beräknas med formeln (basen · höjden) / 2:"
                        : "A triangle's area is calculated using (base · height) / 2:",
                    latex: `A = \\frac{(${base.text}) \\cdot ${heightC}}{2}`
                },
                {
                    text: lang === 'sv'
                        ? `Multiplicera in ${heightC} i täljarens parentes:`
                        : `Distribute ${heightC} into the numerator's parentheses:`,
                    latex: `A = \\frac{${numExpr}}{2}`
                },
                {
                    text: lang === 'sv'
                        ? (base.b !== 0
                            ? "Dela varje term i täljaren med 2 var för sig:"
                            : "Dela termen i täljaren med 2:")
                        : (base.b !== 0
                            ? "Divide each term in the numerator by 2 separately:"
                            : "Divide the numerator term by 2:"),
                    latex: base.b !== 0
                        ? `A = \\frac{${base.a * heightC}x}{2} ${base.b > 0 ? '+' : '-'} \\frac{${Math.abs(base.b * heightC)}}{2}`
                        : `A = \\frac{${base.a * heightC}x}{2}`
                },
                {
                    text: lang === 'sv' ? `Svar: ${ansDisplay}` : `Answer: ${ansDisplay}`,
                    latex: `A = \\mathbf{${ansDisplay}}`
                }
            ];
        }

        return {
            renderData: { geometry: geom, description: desc, answerType: "text", answer: ansToken },
            token: this.toBase64(ansToken), variationKey: "area_write", type: "expression", clues: clues
        };
    }

    // =========================================================================
    // LEVEL 4: Area - Lös ekvationen
    // =========================================================================
    private area_solveEquation(lang: string): any {
        const shapeChoice = MathUtils.randomInt(1, 2);
        const targetX = MathUtils.randomInt(2, 12);
        let geom: any, desc: string, clues: any[], totalA: number;

        if (shapeChoice === 1) { // Rectangle
            const base = this.genLinearTerm(2, 8, 1, 15, false);
            const heightC = MathUtils.randomInt(3, 10);
            totalA = heightC * (base.a * targetX + base.b);
            geom = { type: "rectangle", width: 200, height: 120, labels: this.getLabels(base.text, `${heightC}`) };
            desc = lang === 'sv' ? `Rektangelns area är ${totalA} cm². Beräkna x.` : `The rectangle's area is ${totalA} cm². Calculate x.`;

            const areaA = heightC * base.a;
            const areaB = heightC * base.b;
            const rhsAfterSub = totalA - areaB;

            clues = [
                {
                    text: lang === 'sv'
                        ? `Area = basen · höjden. Ställ upp ekvationen för arean ${totalA}:`
                        : `Area = base · height. Set up the equation for the area ${totalA}:`,
                    latex: `${heightC} \\cdot (${base.text}) = ${totalA}`
                },
                {
                    text: lang === 'sv'
                        ? `Multiplicera in ${heightC} i parentesen:`
                        : `Distribute ${heightC} into the parentheses:`,
                    latex: areaB > 0 ? `${areaA}x + \\mathbf{${areaB}} = ${totalA}` : `${areaA}x = ${totalA}`
                },
                ...(areaB > 0 ? [
                    {
                        text: lang === 'sv'
                            ? `Ta bort +${areaB} genom att subtrahera ${areaB} från båda sidor:`
                            : `Remove +${areaB} by subtracting ${areaB} from both sides:`,
                        latex: `${areaA}x + ${areaB} \\mathbf{- ${areaB}} = ${totalA} \\mathbf{- ${areaB}}`
                    },
                    {
                        text: lang === 'sv'
                            ? "Förenkla siffertermerna:"
                            : "Simplify the constant numbers:",
                        latex: `${areaA}x = \\mathbf{${rhsAfterSub}}`
                    }
                ] : []),
                {
                    text: lang === 'sv'
                        ? `Dela båda sidor med ${areaA} för att få x ensamt:`
                        : `Divide both sides by ${areaA} to isolate x:`,
                    latex: `\\frac{${areaA}x}{\\mathbf{${areaA}}} = \\frac{${rhsAfterSub}}{\\mathbf{${areaA}}}`
                },
                {
                    text: lang === 'sv' ? `Svar: x = ${targetX}` : `Answer: x = ${targetX}`,
                    latex: `x = \\mathbf{${targetX}}`
                }
            ];
        } else { // Right Triangle
            const base = this.genLinearTerm(2, 8, 1, 15, false);
            const heightC = MathUtils.randomInt(2, 8) * 2;
            totalA = (heightC * (base.a * targetX + base.b)) / 2;
            geom = { type: "triangle", subtype: "right", width: 180, height: 140, labels: this.getLabels(base.text, `${heightC}`) };
            desc = lang === 'sv' ? `Triangelns area är ${totalA} cm². Beräkna x.` : `The triangle's area is ${totalA} cm². Calculate x.`;

            const reducedHeight = heightC / 2;
            const areaA = reducedHeight * base.a;
            const areaB = reducedHeight * base.b;
            const rhsAfterSub = totalA - areaB;

            clues = [
                {
                    text: lang === 'sv'
                        ? `Triangelns area är (basen · höjden) / 2. Ställ upp ekvationen:`
                        : `A triangle's area is (base · height) / 2. Set up the equation:`,
                    latex: `\\frac{(${base.text}) \\cdot ${heightC}}{2} = ${totalA}`
                },
                {
                    text: lang === 'sv'
                        ? `Förenkla bråket genom att dela höjden ${heightC} med 2 direkt:`
                        : `Simplify the fraction by dividing the height ${heightC} by 2 first:`,
                    latex: `(${base.text}) \\cdot \\mathbf{${reducedHeight}} = ${totalA}`
                },
                {
                    text: lang === 'sv'
                        ? `Multiplicera in ${reducedHeight} i parentesen:`
                        : `Distribute ${reducedHeight} into the parentheses:`,
                    latex: areaB > 0 ? `${areaA}x + \\mathbf{${areaB}} = ${totalA}` : `${areaA}x = ${totalA}`
                },
                ...(areaB > 0 ? [
                    {
                        text: lang === 'sv'
                            ? `Subtrahera ${areaB} från båda sidor:`
                            : `Subtract ${areaB} from both sides:`,
                        latex: `${areaA}x + ${areaB} \\mathbf{- ${areaB}} = ${totalA} \\mathbf{- ${areaB}}`
                    },
                    {
                        text: lang === 'sv'
                            ? "Förenkla siffertermerna:"
                            : "Simplify the constant numbers:",
                        latex: `${areaA}x = \\mathbf{${rhsAfterSub}}`
                    }
                ] : []),
                {
                    text: lang === 'sv'
                        ? `Dela båda sidor med ${areaA}:`
                        : `Divide both sides by ${areaA}:`,
                    latex: `\\frac{${areaA}x}{\\mathbf{${areaA}}} = \\frac{${rhsAfterSub}}{\\mathbf{${areaA}}}`
                },
                {
                    text: lang === 'sv' ? `Svar: x = ${targetX}` : `Answer: x = ${targetX}`,
                    latex: `x = \\mathbf{${targetX}}`
                }
            ];
        }

        return {
            renderData: { geometry: geom, description: desc, answerType: "numeric", answer: targetX },
            token: this.toBase64(targetX.toString()), variationKey: "area_solve", type: "calculate", clues: clues
        };
    }

    // =========================================================================
    // LEVEL 5: Vinklar - Teckna uttryck
    // =========================================================================
    private angles_writeExpression(lang: string): any {
        const t1 = this.genLinearTerm(2, 8, 1, 15);
        const t2 = this.genLinearTerm(2, 8, 1, 15);
        const ansDisplay = this.formatTerm(t1.a + t2.a, t1.b + t2.b);
        const ansToken = this.formatTokenTerm(t1.a + t2.a, t1.b + t2.b);
        const grouped = this.buildGroupedTermsLatex([t1, t2]);

        let totalVisDeg = MathUtils.randomChoice([70, 80, 100, 110, 120, 130, 140]);
        const angle1VisDeg = MathUtils.randomInt(25, totalVisDeg - 25);

        const pt1 = this.calcPoint(150, 180, 100, angle1VisDeg);
        const pt2 = this.calcPoint(150, 180, 100, totalVisDeg);

        const geomConfig = {
            type: "angle", subtype: "adjacent", angle: totalVisDeg,
            lines: [
                { x1: 150, y1: 180, x2: 250, y2: 180 },
                { x1: 150, y1: 180, x2: pt1.x, y2: pt1.y },
                { x1: 150, y1: 180, x2: pt2.x, y2: pt2.y }
            ],
            arcs: [
                { center: { x: 150, y: 180 }, startAngle: 0, endAngle: angle1VisDeg, radius: 45, label: `${t1.text}°`, color: "rgba(16, 185, 129, 0.15)", stroke: "#10b981" },
                { center: { x: 150, y: 180 }, startAngle: angle1VisDeg, endAngle: totalVisDeg, radius: 45, label: `${t2.text}°`, color: "rgba(59, 130, 246, 0.15)", stroke: "#3b82f6" }
            ],
            labels: []
        };

        const desc = lang === 'sv'
            ? "Teckna ett förenklat uttryck för de två vinklarnas sammanlagda summa."
            : "Write a simplified expression for the sum of the two angles.";

        const clues = [
            {
                text: lang === 'sv'
                    ? "Hela vinkeln är summan av de två intilliggande delvinklarna:"
                    : "The combined angle is the sum of the two adjacent angles:",
                latex: `(${t1.text}) + (${t2.text})`
            },
            {
                text: lang === 'sv'
                    ? "Samla x-termer för sig och siffertermer för sig:"
                    : "Group x-terms and constant terms separately:",
                latex: grouped
            },
            {
                text: lang === 'sv'
                    ? "Förenkla genom att räkna ihop lika termer:"
                    : "Simplify by combining like terms:",
                latex: `\\mathbf{${ansDisplay}}`
            },
            {
                text: lang === 'sv' ? `Svar: ${ansDisplay}` : `Answer: ${ansDisplay}`,
                latex: `\\mathbf{${ansDisplay}}`
            }
        ];

        return {
            renderData: { geometry: geomConfig, description: desc, answerType: "text", answer: ansToken },
            token: this.toBase64(ansToken), variationKey: "angles_write", type: "expression", clues: clues
        };
    }

    // =========================================================================
    // LEVEL 6: Vinklar - Lös ekvationen
    // =========================================================================
    private angles_solveEquation(lang: string): any {
        const visualChoice = MathUtils.randomInt(1, 3);
        const totalDeg = visualChoice === 1 ? 90 : 180;

        const targetX = MathUtils.randomInt(5, 15);
        let t1 = { a: 0, b: 0, text: "" };
        let angle1Deg = 0;

        while (angle1Deg <= 20 || angle1Deg >= totalDeg - 20) {
            t1 = this.genLinearTerm(2, 6, 0, 20, false);
            angle1Deg = t1.a * targetX + t1.b;
        }

        const angle2Deg = totalDeg - angle1Deg;

        const swap = Math.random() > 0.5;
        const slice1Size = swap ? angle2Deg : angle1Deg;
        const slice2Size = swap ? angle1Deg : angle2Deg;
        const label1 = swap ? `${angle2Deg}°` : `${t1.text}°`;
        const label2 = swap ? `${t1.text}°` : `${angle2Deg}°`;

        const pt1 = this.calcPoint(150, 180, 100, slice1Size);
        let pt2;

        let geomConfig: any;
        if (visualChoice === 1) {
            pt2 = this.calcPoint(150, 180, 100, 90);
            geomConfig = {
                type: "angle", subtype: "adjacent", angle: 90,
                lines: [
                    { x1: 150, y1: 180, x2: 250, y2: 180 },
                    { x1: 150, y1: 180, x2: pt1.x, y2: pt1.y },
                    { x1: 150, y1: 180, x2: pt2.x, y2: pt2.y }
                ],
                arcs: [
                    { center: { x: 150, y: 180 }, startAngle: 0, endAngle: slice1Size, radius: 40, label: label1, color: "rgba(16, 185, 129, 0.15)", stroke: "#10b981" },
                    { center: { x: 150, y: 180 }, startAngle: slice1Size, endAngle: 90, radius: 40, label: label2, color: "rgba(59, 130, 246, 0.15)", stroke: "#3b82f6" }
                ],
                labels: []
            };
        } else {
            pt2 = this.calcPoint(150, 180, 100, 180);
            geomConfig = {
                type: "angle", subtype: "supplementary", angle: 180,
                lines: [
                    { x1: 40, y1: 180, x2: 260, y2: 180 },
                    { x1: 150, y1: 180, x2: pt1.x, y2: pt1.y }
                ],
                arcs: [
                    { center: { x: 150, y: 180 }, startAngle: 0, endAngle: slice1Size, radius: 40, label: label1, color: "rgba(16, 185, 129, 0.15)", stroke: "#10b981" },
                    { center: { x: 150, y: 180 }, startAngle: slice1Size, endAngle: 180, radius: 40, label: label2, color: "rgba(59, 130, 246, 0.15)", stroke: "#3b82f6" }
                ],
                labels: []
            };
        }

        const desc = lang === 'sv'
            ? `Vinklarna bildar tillsammans ${totalDeg}°. Beräkna x.`
            : `The angles together form ${totalDeg}°. Calculate x.`;

        const totalConst = t1.b + angle2Deg;
        const rhsAfterSub = totalDeg - totalConst;
        const angleRuleText = totalDeg === 90
            ? (lang === 'sv'
                ? "Vinklarna bildar en rät vinkel (90°). Ställ upp ekvationen:"
                : "The angles form a right angle (90°). Set up the equation:")
            : (lang === 'sv'
                ? "Vinklar på en rät linje har alltid summan 180°. Ställ upp ekvationen:"
                : "Angles on a straight line always sum to 180°. Set up the equation:");

        const clues = [
            {
                text: angleRuleText,
                latex: `${t1.text} + ${angle2Deg} = ${totalDeg}`
            },
            ...(t1.b > 0 ? [{
                text: lang === 'sv'
                    ? `Slå ihop siffertermerna (${t1.b} + ${angle2Deg}) i vänsterledet:`
                    : `Combine the constant numbers (${t1.b} + ${angle2Deg}) on the left side:`,
                latex: `${t1.a}x + \\mathbf{${totalConst}} = ${totalDeg}`
            }] : []),
            {
                text: lang === 'sv'
                    ? `Ta bort +${totalConst} genom att subtrahera ${totalConst} från båda sidor:`
                    : `Remove +${totalConst} by subtracting ${totalConst} from both sides:`,
                latex: `${t1.a}x + ${totalConst} \\mathbf{- ${totalConst}} = ${totalDeg} \\mathbf{- ${totalConst}}`
            },
            {
                text: lang === 'sv'
                    ? "Förenkla siffertermerna:"
                    : "Simplify the constant numbers:",
                latex: `${t1.a}x = \\mathbf{${rhsAfterSub}}`
            },
            {
                text: lang === 'sv'
                    ? `Dela båda sidor med ${t1.a} för att få x ensamt:`
                    : `Divide both sides by ${t1.a} to isolate x:`,
                latex: `\\frac{${t1.a}x}{\\mathbf{${t1.a}}} = \\frac{${rhsAfterSub}}{\\mathbf{${t1.a}}}`
            },
            {
                text: lang === 'sv' ? `Svar: x = ${targetX}` : `Answer: x = ${targetX}`,
                latex: `x = \\mathbf{${targetX}}`
            }
        ];

        return {
            renderData: { geometry: geomConfig, description: desc, answerType: "numeric", answer: targetX },
            token: this.toBase64(targetX.toString()), variationKey: "angles_solve", type: "calculate", clues: clues
        };
    }
}