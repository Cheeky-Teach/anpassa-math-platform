import type { VercelRequest, VercelResponse } from '@vercel/node';
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
import { PercentGen } from '../src/core/generators/PercentGen.js';
import { ProbabilityGen } from '../src/core/generators/ProbabilityGen.js';
import { StatisticsGen } from '../src/core/generators/StatisticsGen.js';
import { PythagorasGen } from '../src/core/generators/PythagorasGen.js';
import { ExponentsGen } from '../src/core/generators/ExponentsGen.js'; // NEW

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
        case 'linear_graph': return new LinearGraphGenerator();
        case 'percent': return new PercentGen();
        case 'probability': return new ProbabilityGen();
        case 'statistics': return new StatisticsGen();
        case 'pythagoras': return new PythagorasGen();
        case 'exponents': return new ExponentsGen(); // NEW
        default: return null;
    }
};

export default function handler(req: VercelRequest, res: VercelResponse) {
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
            const generator = getGenerator(topic);

            if (generator) {
                try {
                    const questionData = generator.generate(parseInt(level), lang);
                    let displayAnswer = "";
                    try {
                        const rawAnswer = Buffer.from(questionData.token, 'base64').toString('utf-8');
                        displayAnswer = rawAnswer;
                    } catch (e) { displayAnswer = "Error"; }

                    if (questionData.renderData && !questionData.renderData.geometry) {
                        questionData.renderData.geometry = null;
                    }

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