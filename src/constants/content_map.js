import { SKILL_BUCKETS } from './skillBuckets';
import { CATEGORIES, LEVEL_DESCRIPTIONS } from './localization';
import MathText from '../components/ui/MathText';

// --- IMPORT ALL GENERATORS ---
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

// --- BROWSER POLYFILL FOR NODE.JS BUFFER ---
if (typeof window !== 'undefined' && typeof window.Buffer === 'undefined') {
    window.Buffer = {
        from: (str) => ({
            toString: (encoding) => {
                if (encoding === 'base64') {
                    return window.btoa(unescape(encodeURIComponent(str)));
                }
                return str;
            }
        })
    };
}
// -------------------------------------------

// --- LATEX WRAPPER HELPER ---
const wrapLatex = (str, isMath) => {
    if (typeof str !== 'string') return "Visualisering";
    
    // If it already has delimiters, leave it alone
    if (str.includes('$$') || str.includes('$')) return str;
    if (isMath) return `$$${str}$$`;
    
    return str; 
};

// Map your topic IDs (from SKILL_BUCKETS) to the imported generator classes
const GENERATOR_ROUTER = {
    'equations': LinearEquationGen,
    'equations_word': LinearEquationProblemGen,
    'expressions': ExpressionSimplificationGen,
    'algebraic_geometry': AlgebraicGeometryGenerator,
    'patterns': PatternsGen,
    'graphs': LinearGraphGenerator,
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
    'unit_conversion': UnitConversionGen,
    'geometry': GeometryGenerator,
    'angles': AnglesGen,
    'pythagoras': PythagorasGen,
    'similarity': SimilarityGen,
    'scale': ScaleGen,
    'volume': VolumeGen,
    'statistics': StatisticsGen,
    'probability': ProbabilityGen
};

/**
 * CONTENT_MAP (Dynamically Generated on Load)
 */
export const CONTENT_MAP = Object.entries(SKILL_BUCKETS).map(([categoryId, categoryData]) => {
    const localizationData = CATEGORIES[categoryId];

    return {
        id: categoryId, 
        category: categoryId,
        title: localizationData ? localizationData.label : categoryData.name,
        color: localizationData ? localizationData.color : 'indigo',
        topics: Object.entries(categoryData.topics).map(([topicId, topicData]) => {
            
            const levelMap = {};
            topicData.variations.forEach(variation => {
                const lvl = variation.level || 1;
                
                // 1. Initialize the level object
                if (!levelMap[lvl]) {
                    levelMap[lvl] = {
                        lvl: lvl,
                        ex: "", 
                        highestPriority: -99, // NEW: Track the best preview score
                        desc: variation.name, 
                        student_desc: (LEVEL_DESCRIPTIONS[topicId] && LEVEL_DESCRIPTIONS[topicId][lvl]) 
                            ? LEVEL_DESCRIPTIONS[topicId][lvl] 
                            : variation.name,
                        teacher_desc: variation.desc,
                        prerequisite: lvl > 1 ? { topic: topicId, level: lvl - 1 } : null,
                        variations: [] 
                    };
                }

                // 2. Generate a live preview
                let previewLatex = "Visualisering";
                let hasLatex = false;
                const GeneratorClass = GENERATOR_ROUTER[topicId];
                
                if (GeneratorClass) {
                    try {
                        let questionData;
                        if (typeof GeneratorClass.generate === 'function') {
                            questionData = GeneratorClass.generate(lvl, 'sv', variation.key);
                        } else {
                            const generatorInstance = new GeneratorClass();
                            questionData = generatorInstance.generate(lvl, 'sv', variation.key);
                        }
                            
                        hasLatex = !!questionData.renderData?.latex;
                        const rawPreview = questionData.renderData?.latex || 
                                       (typeof questionData.renderData?.description === 'object' ? questionData.renderData?.description?.sv : questionData.renderData?.description) || 
                                       "Visualisering";
                        
                        previewLatex = wrapLatex(rawPreview, hasLatex);
                    } catch (e) {}
                }

                // 3. PRIORITY SCORING SYSTEM
                // Score the current variation to see if it makes a better "Hero" preview
                let priorityScore = 0;
                if (hasLatex) priorityScore += 2;
                if (variation.key.includes('calc') || variation.key.includes('std') || variation.key.includes('solve')) priorityScore += 3;
                if (variation.key.includes('concept') || variation.key.includes('lie') || variation.key.includes('visual')) priorityScore -= 3;

                // Update the main level preview if this variation has a higher score
                if (priorityScore > levelMap[lvl].highestPriority) {
                    levelMap[lvl].ex = previewLatex;
                    levelMap[lvl].highestPriority = priorityScore;
                }

                // 4. Push this specific variation into the array
                levelMap[lvl].variations.push({
                    key: variation.key,
                    name: variation.name,
                    desc: variation.desc,
                    ex: previewLatex
                });
            });

            const levelsArray = Object.values(levelMap).sort((a, b) => a.lvl - b.lvl);
            
            // Clean up the temporary highestPriority tracking key so it doesn't clutter state
            levelsArray.forEach(l => delete l.highestPriority);

            return {
                id: topicId,
                name: topicData.name, 
                label: topicData.name,
                levels: levelsArray
            };
        })
    };
});