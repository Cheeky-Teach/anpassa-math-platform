import { NEGATIVE_STORIES } from './negatives.stories.js';
import { FRACTION_STORIES } from './fractions.stories.js';
import { SCALE_STORIES } from './scale.stories.js';
import { TEN_POWER_STORIES } from './tenpowers.stories.js';
import { PROBABILITY_STORIES } from './probability.stories.js';
import { GEOMETRY_STORIES } from './geometry.stories.js'; 

export const GLOBAL_STORY_REGISTRY: Record<string, any> = {
    ...NEGATIVE_STORIES,
    ...FRACTION_STORIES,
    ...SCALE_STORIES,
    ...TEN_POWER_STORIES,
    ...PROBABILITY_STORIES,
    ...GEOMETRY_STORIES 
};