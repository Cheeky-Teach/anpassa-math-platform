import React from 'react';

// --- THE SINGLE SOURCE OF TRUTH FOR ALL VISUAL IMPORTS ---
import { GeometryVisual, GraphCanvas } from './GeometryComponents';
import { VolumeVisualization } from './VolumeVisualization';
import { TransversalVisual, CompositeVisual } from './ComplexGeometry';
import PatternVisual from './PatternComponents';
import ProbabilityTree from './ProbabilityTree';
import { ProbabilityMarbles, ProbabilitySpinner } from './ProbabilityVisuals';
import { ScaleVisual, SimilarityCompare, CompareShapesArea } from './ScaleVisuals';
import { FrequencyTable, BarGraph, PercentGrid } from './StatisticsVisuals';
import AngleVisual from './AngleComponents';

export default function VisualRenderer({ data, width, height, isWordProblem }) {
    // If there is no data to render, safely return null
    if (!data) return null;

    // 1. WORD PROBLEM GUARD (Prevents matchsticks from showing during word problems)
    if (isWordProblem && (data.pattern || data.geometry?.subtype === 'matchsticks' || data.geometry?.subtype === 'sequence')) {
        return null;
    }

    // 2. GRAPHS & PATTERNS
    if (data.graph) return <GraphCanvas data={data.graph} width={width} height={height} />;
    if (data.pattern || data.geometry?.subtype === 'matchsticks' || data.geometry?.subtype === 'sequence') {
        return <PatternVisual data={data.pattern || data.geometry} />;
    }
    
    // 3. PROBABILITY
    if (data.tree || data.geometry?.type === 'pathway') return <ProbabilityTree data={data.tree || data.geometry} />;
    if (data.marbles || data.geometry?.type === 'marbles' || data.geometry?.items) return <ProbabilityMarbles data={data.marbles || data.geometry} />;
    if (data.spinner || data.geometry?.type === 'spinner') return <ProbabilitySpinner data={data.spinner || data.geometry} />;

    // 4. STATISTICS
    if (data.geometry?.type === 'bar_graph') return <BarGraph data={data.geometry} width={width} height={height} />;
    if (data.freqTable || data.geometry?.type === 'frequency_table' || data.geometry?.headers) return <FrequencyTable data={data.freqTable || data.geometry} />;
    if (data.percentGrid || data.geometry?.type === 'percent_grid') return <PercentGrid data={data.percentGrid || data.geometry} />;

    // 5. GEOMETRY & SCALING
    if (data.scale || data.geometry?.type === 'scale') return <ScaleVisual data={data.scale || data.geometry} />;
    if (data.similarity || data.geometry?.type === 'similarity') return <SimilarityCompare data={data.similarity || data.geometry} />;
    if (data.compareArea || data.geometry?.type === 'compare_area') return <CompareShapesArea data={data.compareArea || data.geometry} />;
    
    // 6. CORE GEOMETRY & VOLUME
    if (data.geometry) {
        const geom = data.geometry;
        
        if (geom.type === 'transversal') return <TransversalVisual data={geom} />;
        if (geom.type === 'composite') return <CompositeVisual data={geom} />;
        if (geom.type === 'angle') return <AngleVisual data={geom} />;
        
        const volumeTypes = ['cuboid', 'cylinder', 'cone', 'sphere', 'hemisphere', 'pyramid', 'triangular_prism', 'silo', 'ice_cream', 'volume'];
        if (volumeTypes.includes(geom.type)) {
            return (
                <div style={{ 
                    width: width || 350, 
                    height: height || 250, 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    margin: 'auto'
                }}>
                    <VolumeVisualization data={geom} />
                </div>
            );
        }
        
        return <GeometryVisual data={geom} width={width} height={height} />;
    }
    
    return null;
}