// src/core/utils/stories/index.ts
import { NEGATIVE_STORIES } from './negatives.stories.js';
import { FRACTION_STORIES } from './fractions.stories.js';
import { SCALE_STORIES } from './scale.stories.js';
import { TENPOWERS_STORIES } from './tenpowers.stories.js';
import { PROBABILITY_STORIES } from './probability.stories.js';
import { GEOMETRY_STORIES } from './geometry.stories.js'; 
import { PERCENT_STORIES } from './percent.stories.js';
import { EQUATION_STORIES } from './equation.stories.js';
import { EXPRESSION_STORIES } from './expressions.stories.js';
import { CHANGE_FACTOR_STORIES } from './changefactor.stories.js';
import { PATTERN_STORIES } from './patterns.stories.js';
import { ARITHMETIC_STORIES } from './arithmetic.stories.js';
import { VOLUME_STORIES } from './volume.stories.js';
import { SIMILARITY_STORIES } from './similarity.stories.js';
import { STATISTICS_STORIES } from './statistics.stories.js';
import { EXPONENTS_STORIES } from './exponents.stories.js';
import { LINEAR_GRAPHS_STORIES } from './linearGraphs.stories.js';
import { PYTHAGORAS_STORIES } from './pythagoras.stories.js';

export const GLOBAL_STORY_REGISTRY: Record<string, any> = {
    ...ARITHMETIC_STORIES,
    ...CHANGE_FACTOR_STORIES,
    ...EQUATION_STORIES,
    ...EXPRESSION_STORIES,
    ...EXPONENTS_STORIES,
    ...FRACTION_STORIES,
    ...GEOMETRY_STORIES,
    ...LINEAR_GRAPHS_STORIES,
    ...NEGATIVE_STORIES,
    ...PATTERN_STORIES,
    ...PERCENT_STORIES,
    ...PROBABILITY_STORIES,
    ...PYTHAGORAS_STORIES,
    ...SIMILARITY_STORIES,
    ...SCALE_STORIES,
    ...STATISTICS_STORIES,
    ...TENPOWERS_STORIES,
    ...VOLUME_STORIES
};