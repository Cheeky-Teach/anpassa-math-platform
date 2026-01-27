import type { VercelRequest, VercelResponse } from '@vercel/node';
import { LinearEquationGen } from '../src/core/generators/LinearEquationGen';
import { GeometryGenerator } from '../src/core/generators/GeometryGenerator';
import { BasicArithmeticGen } from '../src/core/generators/BasicArithmeticGen';
import { NegativeNumbersGen } from '../src/core/generators/NegativeNumbersGen';
import { TenPowersGen } from '../src/core/generators/TenPowersGen';
import { ExpressionSimplificationGen } from '../src/core/generators/ExpressionSimplificationGen';
import { ScaleGen } from '../src/core/generators/ScaleGen';
import { VolumeGen } from '../src/core/generators/VolumeGen';
import { SimilarityGen } from '../src/core/generators/SimilarityGen';
import { LinearGraphGenerator } from '../src/core/generators/LinearGraphGenerator';

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
            // Algebra
            case 'equation':
                generator = new LinearEquationGen();
                break;
            case 'simplify':
                generator = new ExpressionSimplificationGen();
                break;

            // Geometry
            case 'geometry':
                generator = new GeometryGenerator();
                break;
            case 'scale':
                generator = new ScaleGen();
                break;
            case 'volume':
                generator = new VolumeGen();
                break;
            case 'similarity':
                generator = new SimilarityGen();
                break;

            // Arithmetic (Number Theory)
            case 'arithmetic':
                generator = new BasicArithmeticGen();
                break;
            case 'negative':
                generator = new NegativeNumbersGen();
                break;
            case 'ten_powers':
                generator = new TenPowersGen();
                break;

            // Functions
            case 'graph':
                generator = new LinearGraphGenerator();
                break;
            
            default:
                return res.status(404).json({ error: `Generator for topic '${topic}' not found or not migrated yet.` });
        }

        if (generator) {
            const questionData = generator.generate(levelNum, language);
            
            // Inject metadata for the frontend
            const response = {
                ...questionData,
                topic,
                level: levelNum
            };
            
            return res.status(200).json(response);
        }

    } catch (error) {
        console.error("Generator Error:", error);
        return res.status(500).json({ error: "Failed to generate question. Check server logs." });
    }
}