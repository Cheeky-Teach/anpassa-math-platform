import React, { useState } from 'react';
import { CATEGORIES, LEVEL_DESCRIPTIONS } from '../constants/localization';

// Your Generators (Corrected paths with no extensions)
import { BasicArithmeticGen } from '../core/generators/BasicArithmeticGen';
import { NegativeNumbersGen } from '../core/generators/NegativeNumbersGen';
import { TenPowersGen } from '../core/generators/TenPowersGen';
import { ExponentsGen } from '../core/generators/ExponentsGen';
import { PercentGen } from '../core/generators/PercentGen';
import { ExpressionSimplificationGen } from '../core/generators/ExpressionSimplificationGen';
import { LinearEquationGen } from '../core/generators/LinearEquationGen';
import { LinearEquationProblemGen } from '../core/generators/LinearEquationProblemGen';
import { LinearGraphGenerator } from '../core/generators/LinearGraphGenerator';
import { GeometryGenerator } from '../core/generators/GeometryGenerator';
import { ScaleGen } from '../core/generators/ScaleGen';
import { VolumeGen } from '../core/generators/VolumeGen';
import { SimilarityGen } from '../core/generators/SimilarityGen';
import { PythagorasGen } from '../core/generators/PythagorasGen';
import { ProbabilityGen } from '../core/generators/ProbabilityGen';
import { StatisticsGen } from '../core/generators/StatisticsGen';
import { FractionBasicsGen } from '../core/generators/FractionBasicsGen';
import { FractionArithGen } from '../core/generators/FractionArithGen';
import { ChangeFactorGen } from '../core/generators/ChangeFactorGen';
import { AnglesGen } from '../core/generators/AnglesGen';
import { PatternsGen } from '../core/generators/PatternsGen';
import { OrderOperationsGen } from '../core/generators/OrderOperationsGen';
import { UnitConversionGen } from '../core/generators/UnitConversionGen';
import { AlgebraicGeometryGenerator } from '../core/generators/AlgebraicGeometryGenerator';
import { PlaceValueGen } from '../core/generators/PlaceValueGen';

export default function MapGenerator() {
    const [status, setStatus] = useState("Redo att bygga Content Map...");

    // Map your topic IDs (from CATEGORIES) to the imported generator classes
    // A dictionary linking your topic IDs from skillBuckets to their specific generator functions
    const GENERATOR_ROUTER = {
        // ALGEBRA & MÖNSTER
        'equations': LinearEquationGen,
        'equations_word': LinearEquationProblemGen,
        'expressions': ExpressionSimplificationGen,
        'algebraic_geometry': AlgebraicGeometryGenerator,
        'patterns': PatternsGen,
        'graphs': LinearGraphGenerator,

        // ARITMETIK
        'basic_arithmetic': BasicArithmeticGen,
        'place_value': PlaceValueGen,
        'order_of_operations': OrderOperationsGen,
        'negatives': NegativeNumbersGen,
        'fractions_basics': FractionBasicsGen,
        'fraction_arith': FractionArithGen,
        'percent': PercentGen,
        'change_factor': ChangeFactorGen,
        'exponents': ExponentsGen,
        'ten_powers': TenPowersGen,

        // GEOMETRI
        'unit_conversion': UnitConversionGen,
        'geometry': GeometryGenerator,
        'angles': AnglesGen,
        'pythagoras': PythagorasGen,
        'similarity': SimilarityGen,
        'scale': ScaleGen,
        'volume': VolumeGen,

        // DATA & SANNOLIKHET
        'statistics': StatisticsGen,
        'probability': ProbabilityGen
    };

    const buildMap = () => {
        setStatus("Genererar...");
        const newMap = [];

        Object.entries(CATEGORIES).forEach(([catKey, categoryData]) => {
            const categoryObj = {
                category: catKey,
                topics: []
            };

            categoryData.topics.forEach(topicData => {
                const topicId = topicData.id;
                const levelsDict = LEVEL_DESCRIPTIONS[topicId] || {};
                const totalLevels = Object.keys(levelsDict).length;

                const topicObj = {
                    id: topicId,
                    levels: []
                };

                for (let lvl = 1; lvl <= totalLevels; lvl++) {
                    const GeneratorClass = GENERATOR_ROUTER[topicId];
                    let previewLatex = "Exempel saknas";

                    if (GeneratorClass) {
                        try {
                            // Safely call the static generate method
                            const questionData = typeof GeneratorClass.generate === 'function' 
                                ? GeneratorClass.generate(lvl, 'sv') 
                                : GeneratorClass(lvl, 'sv'); 
                                
                            // Try to grab LaTeX. If it's a word problem or diagram, grab the text description instead.
                            previewLatex = questionData.renderData?.latex || 
                                           (typeof questionData.renderData?.description === 'object' ? questionData.renderData?.description?.sv : questionData.renderData?.description) || 
                                           "Diagram/Textuppgift";

                        } catch (e) {
                            console.warn(`Kunde inte generera preview för ${topicId} nivå ${lvl}`);
                        }
                    }

                    topicObj.levels.push({
                        lvl: lvl,
                        ex: previewLatex,
                        student_desc: levelsDict[lvl] || { sv: "", en: "" },
                        teacher_desc: { 
                            sv: `Pedagogisk beskrivning för ${topicId} nivå ${lvl}`, 
                            en: `Pedagogical description for ${topicId} level ${lvl}` 
                        },
                        prerequisite: lvl > 1 ? { topic: topicId, level: lvl - 1 } : null
                    });
                }
                
                categoryObj.topics.push(topicObj);
            });

            newMap.push(categoryObj);
        });

        console.log("Kopiera detta och klistra in i content_map.js:");
        console.log(JSON.stringify(newMap, null, 4));
        setStatus("Klar! Öppna webbläsarens konsol (F12) för att kopiera koden.");
    };

    return (
        <div className="p-8 bg-white rounded-xl shadow-xl border border-slate-200 text-center max-w-md mx-auto my-10 relative z-[999]">
            <h2 className="text-xl font-black mb-4 text-slate-800">Content Map Auto-Builder</h2>
            <p className="text-sm text-slate-500 mb-6">{status}</p>
            <button 
                onClick={buildMap}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-md transition-all cursor-pointer"
            >
                Bygg Content Map & Logga till Konsol
            </button>
        </div>
    );
}