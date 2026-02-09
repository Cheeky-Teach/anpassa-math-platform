import { IncomingMessage, ServerResponse } from 'http';

// IMPORTS: Pointing to ../src/core/generators/ with .js extension for Vercel/ESM compatibility
import { BasicArithmeticGen } from '../src/core/generators/BasicArithmeticGen.js';
import { NegativeNumbersGen } from '../src/core/generators/NegativeNumbersGen.js';
import { TenPowersGen } from '../src/core/generators/TenPowersGen.js';
import { ExponentsGen } from '../src/core/generators/ExponentsGen.js';
import { PercentGen } from '../src/core/generators/PercentGen.js';
import { ExpressionSimplificationGen } from '../src/core/generators/ExpressionSimplificationGen.js';
import { LinearEquationGen } from '../src/core/generators/LinearEquationGen.js';
import { LinearEquationProblemGen } from '../src/core/generators/LinearEquationProblemGen.js';
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
    query: Partial<{ [key: string]: string | string[] }>;
}

type VercelResponse = ServerResponse & {
    status: (statusCode: number) => VercelResponse;
    json: (data: any) => VercelResponse;
};

// Instantiate reusable generators
const graphGen = new LinearGraphGenerator();
const basicArithmeticGen = new BasicArithmeticGen();
const negativeGen = new NegativeNumbersGen();
const percentGen = new PercentGen();
const fractionBasicsGen = new FractionBasicsGen();
const expressionGen = new ExpressionSimplificationGen();
const equationGen = new LinearEquationGen();

// Generator Registry with ID Aliasing
const generators: any = {
    // Algebra
    equation: equationGen,
    equations: equationGen,
    simplify: expressionGen,
    expressions: expressionGen,
    equations_word: new LinearEquationProblemGen(),
    patterns: new PatternsGen(),
    graph: graphGen,
    linear_graph: graphGen,
    graphs: graphGen,

    // Arithmetic
    arithmetic: basicArithmeticGen,
    basic_arithmetic: basicArithmeticGen,
    negative: negativeGen,
    negatives: negativeGen,
    ten_powers: new TenPowersGen(),
    exponents: new ExponentsGen(),
    percent: percentGen,
    percents: percentGen,
    fraction_basics: fractionBasicsGen,
    fractions_basics: fractionBasicsGen,
    fraction_arith: new FractionArithGen(),

    // Geometry
    geometry: new GeometryGenerator(),
    pythagoras: new PythagorasGen(),
    volume: new VolumeGen(),
    scale: new ScaleGen(),
    similarity: new SimilarityGen(),
    angles: new AnglesGen(),

    // Data
    statistics: new StatisticsGen(),
    probability: new ProbabilityGen(),
    change_factor: new ChangeFactorGen()
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

    const body = req.body || {};
    const query = req.query || {};

    // Normalize parameters (Supports both body and query string)
    const category = body.category || body.topic || query.category || query.topic;
    const level = body.level || query.level;
    const variation = query.variation || body.variation; // Crucial for Studio Preview
    const lang = body.lang || query.lang || 'sv';

    if (!category) {
        return res.status(400).json({ error: "Missing 'topic' or 'category' parameter" });
    }

    const generator = generators[category];

    if (!generator) {
        return res.status(400).json({ error: `Generator not found: ${category}` });
    }

    try {
        let question;

        // PREVIEW MODE: If a specific variation is requested
        if (variation && typeof generator.generateByVariation === 'function') {
            question = generator.generateByVariation(String(variation), String(lang));
        } 
        // STANDARD MODE: Randomly pick based on level
        else {
            question = generator.generate(Number(level || 1), String(lang));
        }

        res.status(200).json(question);
    } catch (error) {
        console.error(`[API] Question generation error for ${category}:`, error);
        res.status(500).json({ error: 'Generation failed', details: String(error) });
    }
}