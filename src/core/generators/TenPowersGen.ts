import { GeneratedQuestion, Clue } from "../types/generator";
import { Random } from "../utils/random";
import { t, Language } from "../utils/i18n";

export class TenPowersGenerator {
    public static generate(level: number, seed: string, lang: Language = 'sv', multiplier: number = 1): GeneratedQuestion {
        const rng = new Random(seed);
        const formatColor = (val: string | number) => `\\textcolor{#D35400}{\\mathbf{${val}}}`;

        // Helper to fix floating point issues (e.g. 0.1 + 0.2 = 0.300000004)
        const fixFloat = (n: number) => parseFloat(n.toFixed(6));

        let qData: any = { 
            text_key: "", 
            description: "", 
            latex: "", 
            answer: 0,
            answerType: "numeric"
        };
        let steps: Clue[] = [];

        // --- LEVEL 1: Basic 10, 100, 1000 ---
        if (level === 1) {
            const power = rng.pick([10, 100, 1000]);
            const isMult = rng.intBetween(0, 1) === 1;
            
            // Generate a number (integer or decimal)
            // Case A: Integer (e.g. 532)
            // Case B: Decimal (e.g. 0.13, 1.305)
            const isDecimal = rng.intBetween(0, 1) === 1;
            let num = 0;
            
            if (isDecimal) {
                // Generate something like 0.13 or 13.05
                const base = rng.intBetween(1, 9999);
                const div = rng.pick([10, 100, 1000]);
                num = base / div;
            } else {
                num = rng.intBetween(2, 900);
            }

            // Calculation
            let answer = 0;
            let zeros = power.toString().length - 1; // 10->1, 100->2, 1000->3

            if (isMult) {
                // Multiplication
                answer = fixFloat(num * power);
                qData.latex = `${num} \\cdot ${power} =`;
                
                const direction = lang === 'sv' ? "höger" : "right";
                steps.push({
                    text: t(lang, {
                        sv: `När du multiplicerar med ${power} flyttar du kommatecknet ${zeros} steg åt ${direction}.`,
                        en: `When multiplying by ${power}, move the decimal point ${zeros} steps to the ${direction}.`
                    }),
                    latex: `${num} \\cdot ${power} = ${formatColor(answer)}`
                });
            } else {
                // Division
                // Ensure we don't divide 10 by 1000 (0.01) if we want to keep it somewhat simple, 
                // but requirements say "variations with up to 3 decimal places".
                answer = fixFloat(num / power);
                qData.latex = `${num} / ${power} =`; // Horizontal division as requested

                const direction = lang === 'sv' ? "vänster" : "left";
                steps.push({
                    text: t(lang, {
                        sv: `När du dividerar med ${power} flyttar du kommatecknet ${zeros} steg åt ${direction}.`,
                        en: `When dividing by ${power}, move the decimal point ${zeros} steps to the ${direction}.`
                    }),
                    latex: `${num} / ${power} = ${formatColor(answer)}`
                });
            }

            qData.description = { sv: "Beräkna.", en: "Calculate." };
            qData.answer = answer;
        }

        // --- LEVEL 2: Conceptual Equivalence (Multiple Choice) ---
        else if (level === 2) {
            // Mappings
            // Mult 10 = Div 0.1
            // Mult 100 = Div 0.01
            // Mult 1000 = Div 0.001
            // Div 10 = Mult 0.1
            // ...
            
            const pairs = [
                { op: 'mul', val: 10, equivOp: 'div', equivVal: 0.1 },
                { op: 'mul', val: 100, equivOp: 'div', equivVal: 0.01 },
                { op: 'mul', val: 1000, equivOp: 'div', equivVal: 0.001 },
                { op: 'mul', val: 0.1, equivOp: 'div', equivVal: 10 },
                { op: 'mul', val: 0.01, equivOp: 'div', equivVal: 100 },
                { op: 'mul', val: 0.001, equivOp: 'div', equivVal: 1000 },
                // Division variants
                { op: 'div', val: 10, equivOp: 'mul', equivVal: 0.1 },
                { op: 'div', val: 100, equivOp: 'mul', equivVal: 0.01 },
                { op: 'div', val: 1000, equivOp: 'mul', equivVal: 0.001 },
                { op: 'div', val: 0.1, equivOp: 'mul', equivVal: 10 },
                { op: 'div', val: 0.01, equivOp: 'mul', equivVal: 100 },
                { op: 'div', val: 0.001, equivOp: 'mul', equivVal: 1000 },
            ];

            const scenario = rng.pick(pairs);
            
            const opStr = (op: string) => {
                if (lang === 'sv') return op === 'mul' ? "Multiplicera med" : "Dividera med";
                return op === 'mul' ? "Multiplying by" : "Dividing by";
            };
            
            const targetOpStr = (op: string) => {
                if (lang === 'sv') return op === 'div' ? "dividera med..." : "multiplicera med...";
                return op === 'div' ? "dividing by..." : "multiplying by...";
            };

            qData.description = {
                sv: `${opStr(scenario.op)} ${scenario.val} är samma sak som att ${targetOpStr(scenario.equivOp)}`,
                en: `${opStr(scenario.op)} ${scenario.val} is the same as ${targetOpStr(scenario.equivOp)}`
            };

            qData.answerType = 'multiple_choice';
            qData.choices = [10, 100, 1000, 0.1, 0.01, 0.001].map(String); // Ensure strings for MC comparison
            qData.answer = String(scenario.equivVal);

            // Clue
            const fraction = scenario.equivVal < 1 ? `1/${1/scenario.equivVal}` : `1/${1/scenario.equivVal}`; // e.g. 1/10
            steps.push({
                text: t(lang, { 
                    sv: "Tänk på bråkformen. Att dividera med ett tal är samma som att multiplicera med dess invers.",
                    en: "Think about fractions. Dividing by a number is the same as multiplying by its inverse."
                }),
                latex: ""
            });
        }

        // --- LEVEL 3: 0.1, 0.01, 0.001 Calculations ---
        else {
            const power = rng.pick([0.1, 0.01, 0.001]);
            const isMult = rng.intBetween(0, 1) === 1;
            
            // Pick a number
            const num = rng.intBetween(2, 900);
            
            // Determine zeros for explanation (0.1 -> 1 step, 0.01 -> 2 steps)
            let stepsCount = 0;
            if (power === 0.1) stepsCount = 1;
            else if (power === 0.01) stepsCount = 2;
            else stepsCount = 3;

            let answer = 0;

            if (isMult) {
                // Mult by 0.1 = Div by 10 = Left shift
                answer = fixFloat(num * power);
                qData.latex = `${num} \\cdot ${power} =`;
                
                const direction = lang === 'sv' ? "vänster" : "left";
                steps.push({
                    text: t(lang, {
                        sv: `Att multiplicera med ${power} är samma som att dividera med ${1/power}. Flytta kommatecknet ${stepsCount} steg åt ${direction}.`,
                        en: `Multiplying by ${power} is the same as dividing by ${1/power}. Move the decimal ${stepsCount} steps to the ${direction}.`
                    }),
                    latex: `${num} / ${1/power} = ${formatColor(answer)}`
                });
            } else {
                // Div by 0.1 = Mult by 10 = Right shift
                answer = fixFloat(num / power);
                qData.latex = `${num} / ${power} =`;

                const direction = lang === 'sv' ? "höger" : "right";
                steps.push({
                    text: t(lang, {
                        sv: `Att dividera med ${power} är samma som att multiplicera med ${1/power}. Flytta kommatecknet ${stepsCount} steg åt ${direction}.`,
                        en: `Dividing by ${power} is the same as multiplying by ${1/power}. Move the decimal ${stepsCount} steps to the ${direction}.`
                    }),
                    latex: `${num} \\cdot ${1/power} = ${formatColor(answer)}`
                });
            }

            qData.description = { sv: "Beräkna.", en: "Calculate." };
            qData.answer = answer;
        }

        return {
            questionId: `ten-l${level}-${seed}`,
            renderData: {
                text_key: "ten_powers",
                description: qData.description,
                latex: qData.latex,
                answerType: qData.answerType,
                choices: qData.choices,
                variables: {}
            },
            serverData: {
                answer: qData.answer,
                solutionSteps: steps
            }
        };
    }
}