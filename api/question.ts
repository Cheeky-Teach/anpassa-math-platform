import type { VercelRequest, VercelResponse } from '@vercel/node';
import { BasicArithmeticGen } from '../src/core/generators/BasicArithmeticGen.js';
import { NegativeNumbersGen } from '../src/core/generators/NegativeNumbersGen.js';
import { TenPowersGen } from '../src/core/generators/TenPowersGen.js';
import { ExpressionSimplificationGen } from '../src/core/generators/ExpressionSimplificationGen.js';
import { LinearEquationGen } from '../src/core/generators/LinearEquationGen.js';
import { LinearGraphGenerator } from '../src/core/generators/LinearGraphGenerator.js';
import { GeometryGenerator } from '../src/core/generators/GeometryGenerator.js';
import { ScaleGen } from '../src/core/generators/ScaleGen.js';
import { VolumeGen } from '../src/core/generators/VolumeGen.js';
import { SimilarityGen } from '../src/core/generators/SimilarityGen.js';
import { PercentGen } from '../src/core/generators/PercentGen.js';
import { ProbabilityGen } from '../src/core/generators/ProbabilityGen.js';
import { StatisticsGen } from '../src/core/generators/StatisticsGen.js';
import { PythagorasGen } from '../src/core/generators/PythagorasGen.js';
import { ExponentsGen } from '../src/core/generators/ExponentsGen.js'; // NEW
import { FractionBasicsGen } from '@core/generators/FractionBasicsGen.js';
import { FractionArithGen } from '@core/generators/FractionArithGen.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
    const { topic, level, lang = 'sv', force } = req.query;

    if (!topic || !level) {
        return res.status(400).json({ error: 'Missing topic or level' });
    }

    try {
        const lvl = parseInt(level as string);
        const generator = getGenerator(topic as string);
        
        if (!generator) {
            return res.status(400).json({ error: `Unknown topic: ${topic}` });
        }

        const question = generator.generate(lvl, lang as string);
        
        if (question.renderData && !question.renderData.geometry) {
            question.renderData.geometry = null;
        }

        res.status(200).json(question);
    } catch (error) {
        console.error("Generator error:", error);
        res.status(500).json({ error: 'Failed to generate question' });
    }
}

function getGenerator(topic: string) {
    switch (topic) {
        case 'arithmetic': return new BasicArithmeticGen();
        case 'negative': return new NegativeNumbersGen();
        case 'ten_powers': return new TenPowersGen();
        case 'simplify': return new ExpressionSimplificationGen();
        case 'equation': return new LinearEquationGen();
        case 'linear_graph': return new LinearGraphGenerator();
        case 'geometry': return new GeometryGenerator();
        case 'scale': return new ScaleGen();
        case 'volume': return new VolumeGen();
        case 'similarity': return new SimilarityGen();
        case 'percent': return new PercentGen();
        case 'probability': return new ProbabilityGen();
        case 'statistics': return new StatisticsGen();
        case 'pythagoras': return new PythagorasGen();
        case 'exponents': return new ExponentsGen();
        case 'fraction_basics': return new FractionBasicsGen(); 
        case 'fraction_arith': return new FractionArithGen(); 
        default: return null;
    }
}