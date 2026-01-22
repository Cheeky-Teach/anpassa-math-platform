import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { TERMS, t, Language } from "../utils/i18n";

export class BasicArithmeticGen {
    public static generate(level: number, seed: string, lang: Language = 'sv', multiplier: number = 1): GeneratedQuestion {
        const rng = new Random(seed);
        const formatColor = (val: string | number) => `\\textcolor{#D35400}{\\mathbf{${val}}}`;

        let mode = level;

        // --- LEVEL 8: Mixed Integers (1, 2, 4, 7) ---
        if (level === 8) {
            mode = rng.pick([1, 2, 4, 7]);
        }
        
        // --- LEVEL 9: Mixed All (1-7) ---
        if (level === 9) {
            mode = rng.intBetween(1, 7);
        }

        let steps: Clue[] = [];
        let answer: number = 0;
        let latex = "";
        
        // Description defaults
        let description = { sv: "Beräkna", en: "Calculate" };

        // Helper for vertical layout
        const makeVertical = (top: number | string, bottom: number | string, op: string) => {
            return `\\begin{array}{r} ${top} \\\\ ${op} \\; ${bottom} \\\\ \\hline \\end{array}`;
        };

        // --- LEVEL 1: Addition (1-3 digits) ---
        if (mode === 1) {
            const a = rng.intBetween(1, 999);
            const b = rng.intBetween(1, 999);
            answer = a + b;
            
            if (rng.intBetween(0, 1) === 1) {
                latex = makeVertical(a, b, '+');
                description = { sv: "Ställ upp och addera.", en: "Set up and add." };
            } else {
                latex = `${a} + ${b} =`;
                description = { sv: "Addera.", en: "Add." };
            }

            steps = [
                { text: t(lang, TERMS.common.calculate), latex: `${a} + ${b} = ${formatColor(answer)}` }
            ];
        }

        // --- LEVEL 2: Subtraction (1-3 digits, a > b) ---
        else if (mode === 2) {
            const a = rng.intBetween(2, 999);
            const b = rng.intBetween(1, a - 1); 
            answer = a - b;

            if (rng.intBetween(0, 1) === 1) {
                latex = makeVertical(a, b, '-');
                description = { sv: "Ställ upp och subtrahera.", en: "Set up and subtract." };
            } else {
                latex = `${a} - ${b} =`;
                description = { sv: "Subtrahera.", en: "Subtract." };
            }

            steps = [
                { text: t(lang, TERMS.common.calculate), latex: `${a} - ${b} = ${formatColor(answer)}` }
            ];
        }

        // --- LEVEL 3: Decimal (+/-) ---
        else if (mode === 3) {
            const isAdd = rng.intBetween(0, 1) === 1;
            
            const getDec = () => {
                const num = rng.intBetween(1, 4900); 
                return num / 100; 
            };

            let a = getDec();
            let b = getDec();
            
            if (isAdd) {
                while (Math.floor(a + b) > 50) { a = getDec(); b = getDec(); }
                answer = Math.round((a + b) * 100) / 100;
                latex = `${a} + ${b} =`;
            } else {
                if (b > a) [a, b] = [b, a];
                while (Math.floor(a - b) > 50) { a = getDec(); b = getDec(); if (b>a) [a,b]=[b,a];}
                answer = Math.round((a - b) * 100) / 100;
                latex = `${a} - ${b} =`;
            }

            description = { sv: "Beräkna decimaltalen.", en: "Calculate the decimals." };
            steps = [{ text: t(lang, TERMS.common.calculate), latex: `${latex} ${formatColor(answer)}` }];
        }

        // --- LEVEL 4: Multiplication Easy (<= 10) ---
        else if (mode === 4) {
            const a = rng.intBetween(1, 10);
            const b = rng.intBetween(1, 10);
            answer = a * b;

            if (rng.intBetween(0, 1) === 1) {
                const top = Math.max(a, b);
                const bot = Math.min(a, b);
                latex = makeVertical(top, bot, '\\times');
            } else {
                latex = `${a} \\cdot ${b} =`;
            }

            description = { sv: "Multiplicera.", en: "Multiply." };
            steps = [{ text: t(lang, TERMS.common.calculate), latex: `${a} \\cdot ${b} = ${formatColor(answer)}` }];
        }

        // --- LEVEL 5: Multiplication Medium (<= 20) ---
        else if (mode === 5) {
            const a = rng.intBetween(2, 20);
            const b = rng.intBetween(2, 20);
            answer = a * b;

            if (rng.intBetween(0, 1) === 1) {
                const top = Math.max(a, b);
                const bot = Math.min(a, b);
                latex = makeVertical(top, bot, '\\times');
            } else {
                latex = `${a} \\cdot ${b} =`;
            }

            description = { sv: "Multiplicera.", en: "Multiply." };
            steps = [{ text: t(lang, TERMS.common.calculate), latex: `${a} \\cdot ${b} = ${formatColor(answer)}` }];
        }

        // --- LEVEL 6: Multiplication Hard (Decimals) ---
        else if (mode === 6) {
            const type = rng.intBetween(1, 4);
            let a = 0, b = 0;

            if (type === 1) { // 0.x * 0.y
                a = rng.intBetween(1, 9) / 10;
                b = rng.intBetween(1, 9) / 10;
            } else if (type === 2) { // Int * 0.x
                a = rng.intBetween(2, 20);
                b = rng.intBetween(1, 9) / 10;
            } else if (type === 3) { // 0.x * 0.yz
                a = rng.intBetween(1, 9) / 10;
                b = rng.intBetween(1, 99) / 100;
            } else { // Int * 0.yz
                a = rng.intBetween(2, 20);
                b = rng.intBetween(1, 99) / 100;
            }

            answer = Math.round((a * b) * 1000) / 1000;
            latex = `${a} \\cdot ${b} =`;
            description = { sv: "Multiplicera decimaltalen.", en: "Multiply the decimals." };
            steps = [{ text: t(lang, TERMS.common.calculate), latex: `${a} \\cdot ${b} = ${formatColor(answer)}` }];
        }

        // --- LEVEL 7: Division (Tables) ---
        else if (mode === 7) {
            const f1 = rng.intBetween(1, 10);
            const f2 = rng.intBetween(1, 10);
            const product = f1 * f2;
            
            const divisor = rng.intBetween(0, 1) === 1 ? f1 : f2;
            answer = product / divisor; 

            latex = `\\frac{${product}}{${divisor}} =`;
            description = { sv: "Dividera.", en: "Divide." };
            
            steps = [{ text: t(lang, TERMS.common.calculate), latex: `\\frac{${product}}{${divisor}} = ${formatColor(answer)}` }];
        }

        return {
            questionId: `arith-l${level}-${seed}`,
            renderData: {
                text_key: "arithmetic",
                description: description,
                latex: latex,
                answerType: "numeric",
                variables: {}
            },
            serverData: {
                answer: answer,
                solutionSteps: steps
            }
        };
    }
}