import { IncomingMessage, ServerResponse } from 'http';

// FIX: Added .js extensions to all imports for Vercel/ESM compatibility
import { BasicArithmeticGen } from '../src/core/generators/BasicArithmeticGen.js';
import { NegativeNumbersGen } from '../src/core/generators/NegativeNumbersGen.js';
import { TenPowersGen } from '../src/core/generators/TenPowersGen.js';
import { ExponentsGen } from '../src/core/generators/ExponentsGen.js';
import { PercentGen } from '../src/core/generators/PercentGen.js';
import { ExpressionSimplificationGen } from '../src/core/generators/ExpressionSimplificationGen.js';
import { EquationGenerator } from '../src/core/generators/EquationGenerator.js';
import { LinearGraphGenerator } from '../src/core/generators/LinearGraphGenerator.js';
import { GeometryGenerator } from '../src/core/generators/GeometryGenerator.js';
import { ScaleGenerator } from '../src/core/generators/ScaleGenerator.js';
import { VolumeGenerator } from '../src/core/generators/VolumeGenerator.js';
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
    equation: new EquationGenerator(),
    graph: new LinearGraphGenerator(),
    geometry: new GeometryGenerator(),
    scale: new ScaleGenerator(),
    volume: new VolumeGenerator(),
    similarity: new SimilarityGen(),
    pythagoras: new PythagorasGen(),
    probability: new ProbabilityGen(),
    statistics: new StatisticsGen()
};

export default function handler(req: VercelRequest, res: VercelResponse) {
    // CORS Handling (Optional but good for safety)
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { category, level, lang } = req.body;
    
    // Debug log to check what Vercel receives
    console.log(`Generating: ${category} Level ${level} (${lang})`);

    if (!generators[category]) {
        return res.status(400).json({ error: `Generator not found: ${category}` });
    }

    try {
        const question = generators[category].generate(Number(level), lang);
        res.status(200).json(question);
    } catch (error) {
        console.error(`Generation error for ${category}:`, error);
        // Return detailed error in dev, generic in prod
        res.status(500).json({ error: 'Generation failed', details: String(error) });
    }
}