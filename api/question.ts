import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { topic, level, lang } = req.query;

    if (!topic || !level) {
        return res.status(400).json({ error: "Missing topic or level" });
    }

    const levelNum = parseInt(level as string);
    const language = (lang as string) || 'sv';

    try {
        let generator;

        // Dynamic Imports
        switch (topic) {
            case 'equation': generator = new (await import('../src/core/generators/LinearEquationGen')).LinearEquationGen(); break;
            case 'simplify': generator = new (await import('../src/core/generators/ExpressionSimplificationGen')).ExpressionSimplificationGen(); break;
            case 'geometry': generator = new (await import('../src/core/generators/GeometryGenerator')).GeometryGenerator(); break;
            case 'scale': generator = new (await import('../src/core/generators/ScaleGen')).ScaleGen(); break;
            case 'volume': generator = new (await import('../src/core/generators/VolumeGen')).VolumeGen(); break;
            case 'similarity': generator = new (await import('../src/core/generators/SimilarityGen')).SimilarityGen(); break;
            case 'arithmetic': generator = new (await import('../src/core/generators/BasicArithmeticGen')).BasicArithmeticGen(); break;
            case 'negative': generator = new (await import('../src/core/generators/NegativeNumbersGen')).NegativeNumbersGen(); break;
            case 'ten_powers': generator = new (await import('../src/core/generators/TenPowersGen')).TenPowersGen(); break;
            case 'graph': generator = new (await import('../src/core/generators/LinearGraphGenerator')).LinearGraphGenerator(); break;
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