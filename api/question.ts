import { NextApiRequest, NextApiResponse } from 'next';

// 1. Import ALL generators based on your localization IDs
import { BasicArithmeticGen } from '../../generators/BasicArithmeticGen';
import { NegativeNumbersGen } from '../../generators/NegativeNumbersGen';
import { TenPowersGen } from '../../generators/TenPowersGen';
import { ExponentsGen } from '../../generators/ExponentsGen';
import { PercentGen } from '../../generators/PercentGen';
import { ExpressionSimplificationGen } from '../../generators/ExpressionSimplificationGen';
import { EquationGenerator } from '../../generators/EquationGenerator';
import { LinearGraphGenerator } from '../../generators/LinearGraphGenerator';
import { GeometryGenerator } from '../../generators/GeometryGenerator';
import { ScaleGenerator } from '../../generators/ScaleGenerator';
import { VolumeGenerator } from '../../generators/VolumeGenerator';
import { SimilarityGen } from '../../generators/SimilarityGen'; // Note: You shared this class name earlier
import { PythagorasGen } from '../../generators/PythagorasGen';
import { ProbabilityGen } from '../../generators/ProbabilityGen';
import { StatisticsGen } from '../../generators/StatisticsGen';
import { FractionBasicsGen } from '../../generators/FractionBasicsGen';
import { FractionArithGen } from '../../generators/FractionArithGen';

// 2. Map the 'api' string from localization.ts to the class instance
const generators: any = {
    // Arithmetic Category
    arithmetic: new BasicArithmeticGen(),
    negative: new NegativeNumbersGen(),
    ten_powers: new TenPowersGen(),
    exponents: new ExponentsGen(),
    percent: new PercentGen(),
    fraction_basics: new FractionBasicsGen(),
    fraction_arith: new FractionArithGen(),

    // Algebra Category
    simplify: new ExpressionSimplificationGen(),
    equation: new EquationGenerator(),
    graph: new LinearGraphGenerator(),

    // Geometry Category
    geometry: new GeometryGenerator(),
    scale: new ScaleGenerator(),
    volume: new VolumeGenerator(),
    similarity: new SimilarityGen(),
    pythagoras: new PythagorasGen(),

    // Statistics Category
    probability: new ProbabilityGen(),
    statistics: new StatisticsGen()
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { category, level, lang } = req.body;
    
    // Debugging: Log what is being requested if it fails
    if (!generators[category]) {
        console.error(`Generator not found for category: ${category}`);
        return res.status(400).json({ error: `Invalid category: ${category}` });
    }

    try {
        const question = generators[category].generate(Number(level), lang);
        res.status(200).json(question);
    } catch (error) {
        console.error(`Error generating ${category} level ${level}:`, error);
        res.status(500).json({ error: 'Generation failed' });
    }
}