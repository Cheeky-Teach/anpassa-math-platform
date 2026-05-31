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

export const GLOBAL_STORY_REGISTRY: Record<string, any> = {
    ...NEGATIVE_STORIES,
    ...CHANGE_FACTOR_STORIES,
    ...EQUATION_STORIES,
    ...EXPRESSION_STORIES,
    ...FRACTION_STORIES,
    ...GEOMETRY_STORIES,
    ...PERCENT_STORIES,
    ...PROBABILITY_STORIES,
    ...SCALE_STORIES,
    ...TENPOWERS_STORIES
};