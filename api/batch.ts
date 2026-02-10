import type { VercelRequest, VercelResponse } from '@vercel/node';

// IMPORTS
import { LinearEquationGen } from '../src/core/generators/LinearEquationGen.js';
import { LinearGraphGenerator } from '../src/core/generators/LinearGraphGenerator.js';
import { ExpressionSimplificationGen } from '../src/core/generators/ExpressionSimplificationGen.js';
import { PatternsGen } from '../src/core/generators/PatternsGen.js';
import { BasicArithmeticGen } from '../src/core/generators/BasicArithmeticGen.js';
import { NegativeNumbersGen } from '../src/core/generators/NegativeNumbersGen.js';
import { FractionBasicsGen } from '../src/core/generators/FractionBasicsGen.js';
import { FractionArithGen } from '../src/core/generators/FractionArithGen.js';
import { PercentGen } from '../src/core/generators/PercentGen.js';
import { ChangeFactorGen } from '../src/core/generators/ChangeFactorGen.js';
import { ExponentsGen } from '../src/core/generators/ExponentsGen.js';
import { TenPowersGen } from '../src/core/generators/TenPowersGen.js';
import { GeometryGenerator } from '../src/core/generators/GeometryGenerator.js';
import { AnglesGen } from '../src/core/generators/AnglesGen.js';
import { PythagorasGen } from '../src/core/generators/PythagorasGen.js';
import { ScaleGen } from '../src/core/generators/ScaleGen.js';
import { SimilarityGen } from '../src/core/generators/SimilarityGen.js';
import { VolumeGen } from '../src/core/generators/VolumeGen.js';
import { StatisticsGen } from '../src/core/generators/StatisticsGen.js';
import { ProbabilityGen } from '../src/core/generators/ProbabilityGen.js';

// COMPLETE TOPIC MAP (Aligned with skillBuckets.js)
const TopicMap: Record<string, any> = {
  // Algebra & Patterns
  'equations': LinearEquationGen,
  'equations_word': LinearEquationGen, // Delegated internally
  'expressions': ExpressionSimplificationGen,
  'patterns': PatternsGen,
  'graphs': LinearGraphGenerator,

  // Arithmetic
  'basic_arithmetic': BasicArithmeticGen,
  'negatives': NegativeNumbersGen,
  'fractions_basics': FractionBasicsGen,
  'fractions_arith': FractionArithGen,
  'percent': PercentGen,
  'change_factor': ChangeFactorGen,
  'exponents': ExponentsGen,
  'ten_powers': TenPowersGen,

  // Geometry
  'geometry': GeometryGenerator,
  'angles': AnglesGen,
  'pythagoras': PythagorasGen,
  'scale': ScaleGen,
  'similarity': SimilarityGen,
  'volume': VolumeGen,

  // Data
  'statistics': StatisticsGen,
  'probability': ProbabilityGen
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. CORS & Preflight
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    }

    const { requests } = body; // Updated to match App.jsx contract

    if (!requests || !Array.isArray(requests)) {
      return res.status(400).json({ error: 'Missing or invalid "requests" array in payload' });
    }

    console.log("Processing Batch:", JSON.stringify(requests));

    const questions: any[] = [];
    let globalIndex = 1;

    // 3. Generation Loop
    for (const item of requests) {
      const { topic, variation, level, lang } = item;
      
      const GeneratorClass = TopicMap[topic];

      if (!GeneratorClass) {
        console.warn(`Generator not found for topic: ${topic}`);
        questions.push({
          id: `err-${globalIndex}`,
          text: `Error: Generator for topic '${topic}' not found.`,
          answer: "N/A",
          type: "error"
        });
        globalIndex++;
        continue;
      }

      const generator = new GeneratorClass();

      try {
        let questionData;
        
        // PHASE 2 LOGIC: Priority on Variation
        if (variation && typeof generator.generateByVariation === 'function') {
          questionData = generator.generateByVariation(variation, lang);
        } else {
          questionData = generator.generate(level || 1, lang);
        }

        questions.push({
          ...questionData,
          id: `q-${globalIndex}-${Date.now()}`,
          number: globalIndex,
          topic_id: topic,
          variation_key: variation || 'generic',
          is_generated: true
        });

        globalIndex++;

      } catch (genError) {
        console.error(`Generation error for ${topic}/${variation}:`, genError);
        questions.push({
          id: `err-${globalIndex}`,
          text: `Error generating question for ${topic}.`,
          answer: "Error",
          meta: { error: true }
        });
        globalIndex++;
      }
    }

    // 4. Success Response - Direct Array (Matches App.jsx)
    return res.status(200).json(questions);

  } catch (error: any) {
    console.error("Critical Batch API Error:", error);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      details: error.message 
    });
  }
}