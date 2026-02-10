import { IncomingMessage, ServerResponse } from 'http';

// IMPORTS
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
    body: any;import { IncomingMessage, ServerResponse } from 'http';

// IMPORTS
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

    const { requests } = req.body;

    if (!Array.isArray(requests)) {
        return res.status(400).json({ error: 'Invalid request format' });
    }

    try {
        const results = requests
            .map((item: any) => {
                const topicId = item.topic || item.category;
                const level = Number(item.level);
                const lang = item.lang || 'sv';
                const variation = item.variation; // <--- ADDED: Extract variation key
                
                if (!generators[topicId]) {
                    console.warn(`Generator not found for: ${topicId}`);
                    return null;
                }

                // FIX: Pass the variation key as the 3rd argument to the generator
                const questionData = generators[topicId].generate(level, lang, variation);

                return {
                    ...questionData,
                    topic: topicId,
                    level: level,
                    lang: lang,
                    variation: variation
                };
            })
            .filter(q => q !== null);

        res.status(200).json(results);
    } catch (error) {
        console.error("Batch generation error:", error);
        res.status(500).json({ error: 'Batch generation failed' });
    }
}
}

type VercelResponse = ServerResponse & {
    status: (statusCode: number) => VercelResponse;
    json: (data: any) => VercelResponse;
};

const generators: any = {
    arithmetic: new BasicArithmeticGen(),
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

    const { requests } = req.body;

    if (!Array.isArray(requests)) {
        return res.status(400).json({ error: 'Invalid request format' });
    }

    try {
        const results = requests
            .map((item: any) => {
                const topicId = item.topic || item.category;
                const level = Number(item.level);
                const lang = item.lang || 'sv';
                
                if (!generators[topicId]) {
                    console.warn(`Generator not found for: ${topicId}`);
                    return null;
                }

                const questionData = generators[topicId].generate(level, lang);

                // FIX: Inject topic/level/lang so DoNowGrid logic functions correctly
                return {
                    ...questionData,
                    topic: topicId,
                    level: level,
                    lang: lang
                };
            })
            .filter(q => q !== null); // Remove failed generations to prevent UI crashes

        // FIX: Return the array directly to match DoNowGrid's expectation of questions.map()
        res.status(200).json(results);
    } catch (error) {
        console.error("Batch generation error:", error);
        res.status(500).json({ error: 'Batch generation failed' });
    }
}