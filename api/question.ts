import { IncomingMessage, ServerResponse } from 'http';

// Define types compatible with Vercel Serverless Functions
interface VercelRequest extends IncomingMessage {
    query: Partial<{ [key: string]: string | string[] }>;
    body: any;
}

type VercelResponse = ServerResponse & {
    status: (statusCode: number) => VercelResponse;
    json: (data: any) => VercelResponse;
    send: (data: any) => VercelResponse;
};

// Remove .js extensions to fix build resolution errors
import { BasicArithmeticGen } from '../src/generators/BasicArithmeticGen';
import { NegativeNumbersGen } from '../src/generators/NegativeNumbersGen';
import { TenPowersGen } from '../src/generators/TenPowersGen';
import { ExponentsGen } from '../src/generators/ExponentsGen';
import { PercentGen } from '../src/generators/PercentGen';
import { ExpressionSimplificationGen } from '../src/generators/ExpressionSimplificationGen';
import { EquationGenerator } from '../src/generators/EquationGenerator';
import { LinearGraphGenerator } from '../src/generators/LinearGraphGenerator';
import { GeometryGenerator } from '../src/generators/GeometryGenerator';
import { ScaleGenerator } from '../src/generators/ScaleGenerator';
import { VolumeGenerator } from '../src/generators/VolumeGenerator';
import { SimilarityGen } from '../src/generators/SimilarityGen';
import { PythagorasGen } from '../src/generators/PythagorasGen';
import { ProbabilityGen } from '../src/generators/ProbabilityGen';
import { StatisticsGen } from '../src/generators/StatisticsGen';
import { FractionBasicsGen } from '../src/generators/FractionBasicsGen';
import { FractionArithGen } from '../src/generators/FractionArithGen';

// Map the 'api' ID from localization.js to the class instance
const generators: any = {
    // Arithmetic
    arithmetic: new BasicArithmeticGen(),
    negative: new NegativeNumbersGen(),
    ten_powers: new TenPowersGen(),
    exponents: new ExponentsGen(),
    percent: new PercentGen(),
    fraction_basics: new FractionBasicsGen(),
    fraction_arith: new FractionArithGen(),

    // Algebra
    simplify: new ExpressionSimplificationGen(),
    equation: new EquationGenerator(),
    graph: new LinearGraphGenerator(),

    // Geometry
    geometry: new GeometryGenerator(),
    scale: new ScaleGenerator(),
    volume: new VolumeGenerator(),
    similarity: new SimilarityGen(),
    pythagoras: new PythagorasGen(),

    // Statistics
    probability: new ProbabilityGen(),
    statistics: new StatisticsGen()
};

export default function handler(req: VercelRequest, res: VercelResponse) {
    const { category, level, lang } = req.body;
    
    // 1. Check if generator exists
    if (!generators[category]) {
        console.error(`API Error: Generator not found for category '${category}'`);
        return res.status(400).json({ error: `Invalid category: ${category}` });
    }

    try {
        // 2. Generate question
        const question = generators[category].generate(Number(level), lang);
        res.status(200).json(question);
    } catch (error) {
        console.error(`API Error in ${category} (Level ${level}):`, error);
        res.status(500).json({ error: 'Generation failed' });
    }
}