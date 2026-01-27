import { MathUtils } from '../utils/MathUtils.js';

export class LinearEquationProblemGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 5: return this.level5_WordProblemsWrite(lang);
            case 6: return this.level6_WordProblemsSolve(lang);
            default: return this.level5_WordProblemsWrite(lang);
        }
    }

    // Level 5: Word Problems (Write Equation)
    private level5_WordProblemsWrite(lang: string): any {
        const x = MathUtils.randomInt(2, 10);
        const add = MathUtils.randomInt(2, 9);
        const sum = x + add;
        
        const textSV = `Om jag tänker på ett tal (x) och lägger till ${add} får jag ${sum}. Skriv ekvationen.`;
        const textEN = `If I think of a number (x) and add ${add}, I get ${sum}. Write the equation.`;
        
        const expected = `x+${add}=${sum}`; 

        return {
            renderData: { 
                latex: "", 
                description: lang === 'sv' ? textSV : textEN, 
                answerType: 'text' 
            },
            token: Buffer.from(expected).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "\"Lägger till\" betyder plus (+)." : "\"Add\" means plus (+)." },
                { text: lang === 'sv' ? "Resultatet \"får jag\" betyder likamedtecken (=)." : "The result \"I get\" means equals sign (=)." }
            ]
        };
    }

    // Level 6: Word Problems (Solve)
    private level6_WordProblemsSolve(lang: string): any {
        const x = MathUtils.randomInt(2, 10);
        const factor = MathUtils.randomInt(2, 5);
        const prod = x * factor;

        const textSV = `Ett tal multiplicerat med ${factor} blir ${prod}. Vilket är talet?`;
        const textEN = `A number multiplied by ${factor} becomes ${prod}. What is the number?`;

        return {
            renderData: { 
                latex: "", 
                description: lang === 'sv' ? textSV : textEN, 
                answerType: 'text' 
            },
            token: Buffer.from(x.toString()).toString('base64'),
            clues: [
                { text: lang === 'sv' ? `Teckna ekvationen: ${factor}x = ${prod}` : `Write the equation: ${factor}x = ${prod}` },
                { text: lang === 'sv' ? `Dela med ${factor} för att få svaret.` : `Divide by ${factor} to get the answer.` }
            ]
        };
    }
}