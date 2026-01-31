import { IncomingMessage, ServerResponse } from 'http';

// IMPORTS: Pointing to ../src/core/generators/ with .js extension for Vercel/ESM
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

interface VercelRequest extends IncomingMessage {
    body: any;
    query: Partial<{ [key: string]: string | string[] }>;
}

type VercelResponse = ServerResponse & {
    status: (statusCode: number) => VercelResponse;
    json: (data: any) => VercelResponse;
    send: (data: any) => VercelResponse;
};

// Instantiate generators
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
    statistics: new StatisticsGen()
};

export default function handler(req: VercelRequest, res: VercelResponse) {
    // CORS Handling
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // FIX: Handle both GET (query) and POST (body)
    const body = req.body || {};
    const query = req.query || {};

    // Normalize parameters (Frontend uses 'topic', API uses 'category')
    const category = body.category || body.topic || query.category || query.topic;
    const level = body.level || query.level;
    const lang = body.lang || query.lang || 'sv';

    // Debug log
    console.log(`[API] Generating: ${category} Level ${level} (${lang})`);

    if (!category) {
        return res.status(400).json({ error: "Missing 'topic' or 'category' parameter" });
    }

    if (!generators[category]) {
        return res.status(400).json({ error: `Generator not found: ${category}` });
    }

    try {
        const question = generators[category].generate(Number(level), String(lang));
        res.status(200).json(question);
    } catch (error) {
        console.error(`[API] Generation error for ${category}:`, error);
        res.status(500).json({ error: 'Generation failed', details: String(error) });
    }
}