import { IncomingMessage, ServerResponse } from 'http';
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

// Define Vercel Request/Response types since 'next' is not installed
interface VercelRequest extends IncomingMessage {
    body: any;
    query: Partial<{ [key: string]: string | string[] }>;
}

type VercelResponse = ServerResponse & {
    status: (statusCode: number) => VercelResponse;
    json: (data: any) => VercelResponse;
    send: (data: any) => VercelResponse;
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
    const { category, level, lang } = req.body;
    
    if (!generators[category]) {
        return res.status(400).json({ error: `Generator not found: ${category}` });
    }

    try {
        const question = generators[category].generate(Number(level), lang);
        res.status(200).json(question);
    } catch (error) {
        console.error(`Generation error:`, error);
        res.status(500).json({ error: 'Generation failed' });
    }
}