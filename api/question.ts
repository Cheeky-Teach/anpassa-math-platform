import type { VercelRequest, VercelResponse } from '@vercel/node';
// Static imports with .js extension for TS resolution
import { LinearEquationGen } from '../src/core/generators/LinearEquationGen.js';
import { GeometryGenerator } from '../src/core/generators/GeometryGenerator.js';
import { BasicArithmeticGen } from '../src/core/generators/BasicArithmeticGen.js';
import { NegativeNumbersGen } from '../src/core/generators/NegativeNumbersGen.js';
import { TenPowersGen } from '../src/core/generators/TenPowersGen.js';
import { ExpressionSimplificationGen } from '../src/core/generators/ExpressionSimplificationGen.js';
import { ScaleGen } from '../src/core/generators/ScaleGen.js';
import { VolumeGen } from '../src/core/generators/VolumeGen.js';
import { SimilarityGen } from '../src/core/generators/SimilarityGen.js';
import { LinearGraphGenerator } from '../src/core/generators/LinearGraphGenerator.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
    const { topic, level, lang } = req.query;

    if (!topic || !level) {
        return res.status(400).json({ error: "Missing topic or level" });
    }

    const levelNum = parseInt(level as string);
    const language = (lang as string) || 'sv';

    try {
        let generator;

        switch (topic) {
            case 'equation': generator = new LinearEquationGen(); break;
            case 'simplify': generator = new ExpressionSimplificationGen(); break;
            case 'geometry': generator = new GeometryGenerator(); break;
            case 'scale': generator = new ScaleGen(); break;
            case 'volume': generator = new VolumeGen(); break;
            case 'similarity': generator = new SimilarityGen(); break;
            case 'arithmetic': generator = new BasicArithmeticGen(); break;
            case 'negative': generator = new NegativeNumbersGen(); break;
            case 'ten_powers': generator = new TenPowersGen(); break;
            case 'graph': generator = new LinearGraphGenerator(); break;
            default:
                return res.status(404).json({ error: `Generator for topic '${topic}' not found.` });
        }

        if (generator) {
            const questionData = generator.generate(levelNum, language);
            const response = { ...questionData, topic, level: levelNum };
            return res.status(200).json(response);
        }

    } catch (error) {
        console.error("Generator Load Error:", error);
        return res.status(500).json({ error: "Failed to load generator.", details: String(error) });
    }
}