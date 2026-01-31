import { IncomingMessage, ServerResponse } from 'http';

// UPDATED IMPORTS: Pointing to ../src/core/generators/
import { BasicArithmeticGen } from '../src/core/generators/BasicArithmeticGen';
import { NegativeNumbersGen } from '../src/core/generators/NegativeNumbersGen';
import { TenPowersGen } from '../src/core/generators/TenPowersGen';
import { ExponentsGen } from '../src/core/generators/ExponentsGen';
import { PercentGen } from '../src/core/generators/PercentGen';
import { ExpressionSimplificationGen } from '../src/core/generators/ExpressionSimplificationGen';
import { EquationGenerator } from '../src/core/generators/EquationGenerator';
import { LinearGraphGenerator } from '../src/core/generators/LinearGraphGenerator';
import { GeometryGenerator } from '../src/core/generators/GeometryGenerator';
import { ScaleGenerator } from '../src/core/generators/ScaleGenerator';
import { VolumeGenerator } from '../src/core/generators/VolumeGenerator';
import { SimilarityGen } from '../src/core/generators/SimilarityGen';
import { PythagorasGen } from '../src/core/generators/PythagorasGen';
import { ProbabilityGen } from '../src/core/generators/ProbabilityGen';
import { StatisticsGen } from '../src/core/generators/StatisticsGen';
import { FractionBasicsGen } from '../src/core/generators/FractionBasicsGen';
import { FractionArithGen } from '../src/core/generators/FractionArithGen';

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