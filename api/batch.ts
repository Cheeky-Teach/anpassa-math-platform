import { IncomingMessage, ServerResponse } from 'http';

// IMPORTS - Ensuring .js extensions for ESM compatibility in Vercel
import { BasicArithmeticGen } from '../src/core/generators/BasicArithmeticGen.js';
import { NegativeNumbersGen } from '../src/core/generators/NegativeNumbersGen.js';
import { TenPowersGen } from '../src/core/generators/TenPowersGen.js';
import { ExponentsGen } from '../src/core/generators/ExponentsGen.js';
import { PercentGen } from '../src/core/generators/PercentGen.js';
import { ExpressionSimplificationGen } from '../src/core/generators/ExpressionSimplificationGen.js';
import { LinearEquationGen } from '../src/core/generators/LinearEquationGen.js';
import { LinearGraphGenerator } from '../src/core/generators/LinearGraphGenerator.js';
import { GeometryGenerator } from '../src/core/generators/GeometryGenerator.js';
import { ScaleGen } from '../src/core/generators/ScaleGen.js';
import { VolumeGen } from '../src/core/generators/VolumeGen.js';
import { SimilarityGen } from '../src/core/generators/SimilarityGen.js';
import { PythagorasGen } from '../src/core/generators/PythagorasGen.js';
import { ProbabilityGen } from '../src/core/generators/ProbabilityGen.js';
import { StatisticsGen } from '../src/core/generators/StatisticsGen.js';
import { FractionBasicsGen } from '../src/core/generators/FractionBasicsGen.js';
import { FractionArithGen } from '../src/core/generators/FractionArithGen.js';
import { ChangeFactorGen } from '../src/core/generators/ChangeFactorGen.js';
import { AnglesGen } from '../src/core/generators/AnglesGen.js';
import { PatternsGen } from '../src/core/generators/PatternsGen.js';

interface VercelRequest extends IncomingMessage {
    body: any;
}

type VercelResponse = ServerResponse & {
    status: (statusCode: number) => VercelResponse;
    json: (data: any) => VercelResponse;
};

const generators: any = {
    arithmetic: new BasicArithmeticGen(),
    basic_arithmetic: new BasicArithmeticGen(), // Alias for safety
    negative: new NegativeNumbersGen(),
    ten_powers: new TenPowersGen(),
    exponents: new ExponentsGen(),
    percent: new PercentGen(),
    fraction_basics: new FractionBasicsGen(),
    fraction_arith: new FractionArithGen(),
    simplify: new ExpressionSimplificationGen(),
    equation: new LinearEquationGen(),
    graph: new LinearGraphGenerator(),
    geometry: new GeometryGenerator(),
    scale: new ScaleGen(),
    volume: new VolumeGen(),
    similarity: new SimilarityGen(),
    pythagoras: new PythagorasGen(),
    probability: new ProbabilityGen(),
    statistics: new StatisticsGen(),
    change_factor: new ChangeFactorGen(),
    angles: new AnglesGen(),
    patterns: new PatternsGen()
};

export default function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Vercel automatically parses req.body for 'POST' if content-type is json
    const { requests } = req.body || {};

    if (!Array.isArray(requests)) {
        return res.status(400).json({ error: 'Invalid request format. Expected "requests" array.' });
    }

    try {
        const results = requests
            .map((item: any) => {
                const rawTopicId = item.topic || item.category;
                
                // Map frontend IDs to generator keys if they differ
                const topicId = rawTopicId === 'basic_arithmetic' ? 'arithmetic' : rawTopicId;
                
                const level = Number(item.level) || 1;
                const lang = item.lang || 'sv';
                const variation = item.variation || null;
                
                if (!generators[topicId]) {
                    console.error(`[API] Generator not found for topic: ${topicId}`);
                    return null;
                }

                // PHASE 2 FIX: Pass the variation key to the generate method
                const questionData = generators[topicId].generate(level, lang, variation);

                return {
                    ...questionData,
                    topic: rawTopicId,
                    level: level,
                    lang: lang,
                    variation: variation
                };
            })
            .filter(q => q !== null);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(results));
    } catch (error: any) {
        console.error("Batch generation error:", error);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Internal Server Error', details: error.message }));
    }
}