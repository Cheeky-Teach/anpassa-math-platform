import { IncomingMessage, ServerResponse } from 'http';

// FIX: Imports match exact filenames
import { BasicArithmeticGen } from '../src/core/generators/BasicArithmeticGen.js';
import { NegativeNumbersGen } from '../src/core/generators/NegativeNumbersGen.js';
import { TenPowersGen } from '../src/core/generators/TenPowersGen.js';
import { ExponentsGen } from '../src/core/generators/ExponentsGen.js';
import { PercentGen } from '../src/core/generators/PercentGen.js';
import { ExpressionSimplificationGen } from '../src/core/generators/ExpressionSimplificationGen.js';
import { LinearEquationGen } from '../src/core/generators/LinearEquationGen.js'; // Fixed
import { LinearGraphGenerator } from '../src/core/generators/LinearGraphGenerator.js';
import { GeometryGenerator } from '../src/core/generators/GeometryGenerator.js';
import { ScaleGen } from '../src/core/generators/ScaleGen.js'; // Fixed
import { VolumeGen } from '../src/core/generators/VolumeGen.js'; // Fixed
import { SimilarityGen } from '../src/core/generators/SimilarityGen.js';
import { PythagorasGen } from '../src/core/generators/PythagorasGen.js';
import { ProbabilityGen } from '../src/core/generators/ProbabilityGen.js';
import { StatisticsGen } from '../src/core/generators/StatisticsGen.js';
import { FractionBasicsGen } from '../src/core/generators/FractionBasicsGen.js';
import { FractionArithGen } from '../src/core/generators/FractionArithGen.js';

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
    equation: new LinearEquationGen(), // Fixed
    graph: new LinearGraphGenerator(),
    geometry: new GeometryGenerator(),
    scale: new ScaleGen(), // Fixed
    volume: new VolumeGen(), // Fixed
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
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { requests } = req.body;

    if (!Array.isArray(requests)) {
        return res.status(400).json({ error: 'Invalid request format' });
    }

    try {
        const results = requests.map((req: any) => {
            if (!generators[req.category]) return null;
            return generators[req.category].generate(Number(req.level), req.lang);
        });
        res.status(200).json({ results });
    } catch (error) {
        console.error("Batch error:", error);
        res.status(500).json({ error: 'Batch generation failed' });
    }
}