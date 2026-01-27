import type { VercelRequest, VercelResponse } from '@vercel/node';

// --- Generators (STRICTLY Existing Files Only) ---
import { ScaleGenerator } from '../src/core/generators/ScaleGenerator';
import { GeometryGenerator } from '../src/core/generators/GeometryGenerator';
import { LinearGraphGenerator } from '../src/core/generators/LinearGraphGenerator';
import { LinearEquationGenerator } from '../src/core/generators/LinearEquationGen';
import { ExpressionSimplificationGen } from '../src/core/generators/ExpressionSimplificationGen';
import { LinearEquationProblemGen } from '../src/core/generators/LinearEquationProblemGen';
import { VolumeGenerator } from '../src/core/generators/VolumeGenerator';
import { BasicArithmeticGen } from '../src/core/generators/BasicArithmeticGen';
import { NegativeNumbersGen } from '../src/core/generators/NegativeNumbersGen';
import { SimilarityGenerator } from '../src/core/generators/SimilarityGenerator';
import { TenPowersGenerator } from '../src/core/generators/TenPowersGen';

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { token, answer, topic, level } = req.body;

    if (!token || answer === undefined) {
        return res.status(400).json({ error: 'Missing token or answer' });
    }

    // Decode Token
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    const correctAnswer = decoded.a;

    // --- Validation Logic ---
    // 1. Basic String Match (Case insensitive, trimmed)
    const normalize = (s: any) => String(s).toLowerCase().replace(/\s+/g, '').replace(',', '.');
    
    let isCorrect = normalize(answer) === normalize(correctAnswer);

    // 2. Generator-Specific Validation (if needed)
    // Used for equivalent expressions (e.g. "x + 1" == "1 + x")
    if (!isCorrect && topic) {
        let generator: any = null;
        switch (topic) {
            case 'simplify': generator = new ExpressionSimplificationGen(); break;
            case 'equation': generator = new LinearEquationGen(); break;
        }

        if (generator && typeof generator.validate === 'function') {
            isCorrect = generator.validate(answer, correctAnswer);
        }
    }

    return res.status(200).json({
        correct: isCorrect,
        correctAnswer: correctAnswer
    });

  } catch (error: any) {
    console.error("Answer API Error:", error);
    return res.status(500).json({ error: "Validation Failed", details: error.message });
  }
}