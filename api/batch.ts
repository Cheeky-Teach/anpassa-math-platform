import type { VercelRequest, VercelResponse } from '@vercel/node';

// Define the shape of our generators
interface Generator {
    generate(level: number, lang: string): any;
}

// Helper to dynamically import generator instance
const getGenerator = async (topic: string): Promise<Generator | null> => {
    try {
        switch (topic) {
            case 'equation': return new (await import('../src/core/generators/LinearEquationGen')).LinearEquationGen();
            case 'simplify': return new (await import('../src/core/generators/ExpressionSimplificationGen')).ExpressionSimplificationGen();
            case 'geometry': return new (await import('../src/core/generators/GeometryGenerator')).GeometryGenerator();
            case 'scale': return new (await import('../src/core/generators/ScaleGen')).ScaleGen();
            case 'volume': return new (await import('../src/core/generators/VolumeGen')).VolumeGen();
            case 'similarity': return new (await import('../src/core/generators/SimilarityGen')).SimilarityGen();
            case 'arithmetic': return new (await import('../src/core/generators/BasicArithmeticGen')).BasicArithmeticGen();
            case 'negative': return new (await import('../src/core/generators/NegativeNumbersGen')).NegativeNumbersGen();
            case 'ten_powers': return new (await import('../src/core/generators/TenPowersGen')).TenPowersGen();
            case 'graph': return new (await import('../src/core/generators/LinearGraphGenerator')).LinearGraphGenerator();
            default: return null;
        }
    } catch (e) {
        console.error(`Failed to load generator for ${topic}:`, e);
        return null;
    }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

    try {
        let body = req.body;
        if (typeof body === 'string') {
            try { body = JSON.parse(body); } catch (e) {}
        }

        const config = body?.config; 
        const lang = body?.lang || 'sv';

        if (!config || !Array.isArray(config)) {
            return res.status(400).json({ error: "Invalid config format." });
        }

        const results = [];

        for (const item of config) {
            const { topic, level } = item;
            
            // Await the dynamic import
            const generator = await getGenerator(topic);

            if (generator) {
                try {
                    const questionData = generator.generate(parseInt(level), lang);
                    
                    let displayAnswer = "";
                    try {
                        const rawAnswer = Buffer.from(questionData.token, 'base64').toString('utf-8');
                        displayAnswer = rawAnswer;
                    } catch (e) { displayAnswer = "Error"; }

                    results.push({ ...questionData, topic, level, displayAnswer });
                } catch (genError) {
                    console.error(`Error generating ${topic}:`, genError);
                    results.push({ renderData: { description: "Error generating question" }, displayAnswer: "Err", topic, level });
                }
            } else {
                results.push({
                    renderData: { description: `Generator not found: ${topic}`, latex: topic, answerType: 'text' },
                    displayAnswer: "-", topic, level
                });
            }
        }

        return res.status(200).json({ questions: results });

    } catch (error) {
        console.error("Batch Fatal Error:", error);
        return res.status(500).json({ error: "Batch process failed", details: String(error) });
    }
}