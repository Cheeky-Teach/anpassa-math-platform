import { NextApiRequest, NextApiResponse } from 'next';

// IMPORTANT: The .js extension is REQUIRED for local resolution with NodeNext
import { BasicArithmeticGen } from '../src/generators/BasicArithmeticGen.js';
import { NegativeNumbersGen } from '../src/generators/NegativeNumbersGen.js';
import { TenPowersGen } from '../src/generators/TenPowersGen.js';
import { ExponentsGen } from '../src/generators/ExponentsGen.js';
import { PercentGen } from '../src/generators/PercentGen.js';
import { ExpressionSimplificationGen } from '../src/generators/ExpressionSimplificationGen.js';
import { EquationGenerator } from '../src/generators/EquationGenerator.js';
import { LinearGraphGenerator } from '../src/generators/LinearGraphGenerator.js';
import { GeometryGenerator } from '../src/generators/GeometryGenerator.js';
import { ScaleGenerator } from '../src/generators/ScaleGenerator.js';
import { VolumeGenerator } from '../src/generators/VolumeGenerator.js';
import { SimilarityGen } from '../src/generators/SimilarityGen.js';
import { PythagorasGen } from '../src/generators/PythagorasGen.js';
import { ProbabilityGen } from '../src/generators/ProbabilityGen.js';
import { StatisticsGen } from '../src/generators/StatisticsGen.js';
import { FractionBasicsGen } from '../src/generators/FractionBasicsGen.js';
import { FractionArithGen } from '../src/generators/FractionArithGen.js';

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

export default function handler(req: NextApiRequest, res: NextApiResponse) {
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