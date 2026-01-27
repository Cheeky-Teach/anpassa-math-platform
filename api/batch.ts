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

// Helper to get generator instance
const getGenerator = (topic: string) => {
    switch (topic) {
        case 'equation': return new LinearEquationGen();
        case 'simplify': return new ExpressionSimplificationGen();
        case 'geometry': return new GeometryGenerator();
        case 'scale': return new ScaleGen();
        case 'volume': return new VolumeGen();
        case 'similarity': return new SimilarityGen();
        case 'arithmetic': return new BasicArithmeticGen();
        case 'negative': return new NegativeNumbersGen();
        case 'ten_powers': return new TenPowersGen();
        case 'graph': return new LinearGraphGenerator();
        default: return null;
    }
};

export default function handler(req: VercelRequest, res: VercelResponse) {
    console.log("Batch endpoint hit. Method:", req.method); // Debug log

    // Enable CORS for local development if needed
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed. Use POST." });
    }

    try {
        // Robust Body Parsing
        let body = req.body;
        if (typeof body === 'string') {
            try {
                body = JSON.parse(body);
            } catch (e) {
                console.error("JSON Parse Error:", e);
                return res.status(400).json({ error: "Invalid JSON body" });
            }
        }

        const config = body?.config; 
        const lang = body?.lang || 'sv';

        if (!config || !Array.isArray(config)) {
            return res.status(400).json({ error: "Invalid config format. Expected array." });
        }

        const results = [];

        for (const item of config) {
            const { topic, level } = item;
            const generator = getGenerator(topic);

            if (generator) {
                const questionData = generator.generate(parseInt(level), lang);
                
                // Add display answer for the key
                let displayAnswer = "";
                try {
                    // Decode token to get raw answer
                    const rawAnswer = Buffer.from(questionData.token, 'base64').toString('utf-8');
                    displayAnswer = rawAnswer;
                } catch (e) {
                    displayAnswer = "Error";
                }

                results.push({
                    ...questionData,
                    topic,
                    level,
                    displayAnswer
                });
            } else {
                // Fallback for unknown topic to prevent crash
                results.push({
                    renderData: { 
                        description: "Topic not found", 
                        latex: topic, 
                        answerType: 'text' 
                    },
                    displayAnswer: "-",
                    topic,
                    level
                });
            }
        }

        return res.status(200).json({ questions: results });

    } catch (error) {
        console.error("Batch Generator Error:", error);
        // Return JSON error so frontend doesn't hang, but logs details
        return res.status(500).json({ error: "Failed to generate batch.", details: String(error) });
    }
}