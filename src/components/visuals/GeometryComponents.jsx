import React from 'react';

// 3D & Graphing
import { GraphCanvas } from './GraphCanvas';
import { VolumeVisualization } from './VolumeVisualization';

// Statistics & Probability
import { FrequencyTable, PercentGrid } from './StatisticsVisuals';
import { ProbabilityMarbles, ProbabilitySpinner } from './ProbabilityVisuals';
import ProbabilityTree from './ProbabilityTree';

// 2D Geometry & Utilities
import { RenderShape } from './GeometryShapes';
import { ScaleVisual, SimilarityCompare, CompareShapesArea } from './ScaleVisuals';
import { TransversalVisual, CompositeVisual } from './ComplexGeometry';
import PatternVisual from './PatternComponents';
import AngleVisual from './AngleComponents';

export const GeometryVisual = ({ data }) => {
    if (!data) return null;

    // Catches VolumeGen payloads and routes them safely to the 3D Canvas
    if (['cuboid', 'triangular_prism', 'cylinder', 'pyramid', 'cone', 'sphere'].includes(data.type)) {
        return (
            <div className="w-full h-[200px] sm:h-[250px] max-w-[300px] mx-auto">
                <VolumeVisualization data={data} />
            </div>
        );
    }

    // --- ANGLE VISUAL ---
    if (data.type === 'angle') {
        return <AngleVisual data={data} />;
    }
    // --- PATTERNS ---
    if (data.type === 'pattern') {
        return <PatternVisual data={data} />;
    }
    // --- PROBABILITY TREES ---
    if (data.type === 'probability_tree') {
        return <ProbabilityTree data={data} />;
    }

    // --- FREQUENCY TABLE ---
    if (data.type === 'frequency_table') {
        return <FrequencyTable data={data} />;
    }

    // --- PROBABILITY MARBLES ---
    if (data.type === 'probability_marbles') {
        return <ProbabilityMarbles data={data} />;
    }

    // --- PROBABILITY SPINNER ---
    if (data.type === 'probability_spinner') {
        return <ProbabilitySpinner data={data} />;
    }

    // --- PERCENT GRID ---
    if (data.type === 'percent_grid') {
        return <PercentGrid data={data} />;
    }

    // --- SIMILARITY COMPARISON ---
    if (data.type === 'similarity_compare') {
        return <SimilarityCompare data={data} />;
    }

    // --- SCALES (Single & Compare) ---
    if (data.type === 'scale_single' || data.type === 'scale_compare') { 
        return <ScaleVisual data={data} />;
    }

    // --- TRANSVERSAL ---
    if (data.type === 'transversal') {
        return <TransversalVisual data={data} />;
    }

    // --- AREA COMPARISON ---
    if (data.type === 'compare_shapes_area') {
        return <CompareShapesArea data={data} />;
    }

    // Safely reads from either the legacy root object or the clean modern nested geometry configuration
    const shapeType = data.type;
    if (['rectangle', 'square', 'parallelogram', 'triangle', 'circle', 'semicircle', 'quarter_circle', 'composite'].includes(shapeType)) {
        const activeDims = data.dims || data;
        const activeLabels = data.labels || (data.dims && data.dims.labels);

        return (
            <svg width="300" height="250" viewBox="0 0 300 250" className="my-2 w-full max-w-[300px] mx-auto">
                <RenderShape 
                    type={shapeType} 
                    subtype={data.subtype || activeDims.subtype}
                    dims={activeDims}
                    labels={activeLabels} 
                    areaText={data.areaText} 
                />
            </svg>
        );
    }
    
    // Fallback or Legacy Composite (if any types remain that RenderShape doesn't handle)
    // Since RenderShape handles all 'composite' subtypes now, this might be redundant
    // but kept just in case of other 'composite' variants from ComplexGeometry.
    if (data.type === 'composite_legacy') { // Renaming or removing to prevent conflict
        return <CompositeVisual data={data} />;
    }

    return <div className="flex justify-center my-4"><div className="text-gray-400 text-sm">Visual</div></div>;
};

// Re-export these for backward compatibility if other files import them from here
export { GraphCanvas, VolumeVisualization };

export const StaticGeometryVisual = ({ description }) => { 
    if (!description) return null; 
    const d = description.toLowerCase(); 
    if (d.includes("rect") || d.includes("rektangel")) return <div className="flex justify-center my-4 opacity-80"><div className="w-28 h-16 border-2 border-primary-500 bg-primary-50 rounded-sm"></div></div>; 
    return null; 
};