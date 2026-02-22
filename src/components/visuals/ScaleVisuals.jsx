import React from 'react';
import { RenderShape } from './GeometryShapes';

/**
 * ScaleVisual - Refactored for fluid layouts.
 * Uses emojis to represent objects in scale factor problems.
 */
export const ScaleVisual = ({ data, width = "100%" }) => {
    const shapeEmojis = { 
        square: '⬛', rectangle: '▭', circle: '⚫', triangle: '🔺', cube: '🧊', 
        cylinder: '🛢️', pyramid: '⛰️', cone: '🍦', sphere: '🔮', arrow: '➡', 
        star: '⭐', lightning: '⚡', key: '🔑', heart: '❤️', cloud: '☁️', 
        moon: '🌙', sun: '☀️', magnifying_glass: '🔍', map: '🗺️', car: '🚗', 
        ladybug: '🐞', house: '🏠' 
    }; 
    
    const emoji = shapeEmojis[data.shape] || '📦'; 
    
    const ShapeIcon = ({ size, className = "" }) => (
        <div 
            className={`flex items-center justify-center select-none leading-none ${className}`} 
            style={{ fontSize: size }}
        >
            {emoji}
        </div>
    ); 
    
    if (data.type === 'scale_single') {
        return (
            <div className="flex flex-col items-center gap-2 my-4 w-full" style={{ width }}>
                <ShapeIcon size="clamp(40px, 10vw, 80px)" />
                <span className="bg-white px-4 py-2 rounded shadow text-2xl sm:text-3xl font-bold font-mono border border-gray-200">
                    {data.label}
                </span>
            </div>
        ); 
    }

    return (
        <div className="flex items-center justify-center gap-4 sm:gap-8 my-6 w-full" style={{ width }}>
            <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] sm:text-xs font-black uppercase text-slate-400 tracking-widest">{data.leftLabel}</span>
                <ShapeIcon size="clamp(30px, 8vw, 60px)" />
                <span className="text-lg sm:text-2xl font-bold font-mono bg-white px-3 rounded border border-slate-100 shadow-sm">{data.leftValue}</span>
            </div>
            
            <div className="text-slate-300 text-2xl sm:text-3xl">→</div>
            
            <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] sm:text-xs font-black uppercase text-slate-400 tracking-widest">{data.rightLabel}</span>
                <ShapeIcon size="clamp(50px, 12vw, 100px)" />
                <span className="text-lg sm:text-2xl font-bold font-mono bg-white px-3 rounded border border-slate-100 shadow-sm">{data.rightValue}</span>
            </div>
        </div>
    ); 
};

/**
 * SimilarityCompare - Refactored to be container-responsive.
 * Compares two shapes side-by-side using the internal 500x250 coordinate system.
 */
export const SimilarityCompare = ({ data, width = "100%", height = "auto" }) => {
    const shapeType = data.shapeType || 'triangle';
    const leftDims = { ...data.left, width: 40, height: 40, radius: 20, subtype: shapeType === 'triangle' ? 'isosceles' : undefined };
    const rightDims = { ...data.right, width: 60, height: 60, radius: 30, subtype: shapeType === 'triangle' ? 'isosceles' : undefined };
    
    // Internal coordinate math based on 500x250
    return (
        <div className="w-full flex justify-center py-2 overflow-hidden">
            <svg 
                width={width} 
                height={height} 
                viewBox="0 0 500 250" 
                preserveAspectRatio="xMidYMid meet"
                className="block overflow-visible drop-shadow-sm"
            >
                <RenderShape type={shapeType} dims={leftDims} labels={data.left.labels} offsetX={-25} scale={0.8} />
                <text x="250" y="125" textAnchor="middle" fontSize="30" fontWeight="bold" fill="#cbd5e1">→</text>
                <RenderShape type={shapeType} dims={rightDims} labels={data.right.labels} offsetX={225} scale={1.2} />
            </svg>
        </div>
    );
};

/**
 * CompareShapesArea - Refactored to be container-responsive.
 * Visualizes area relationships between two shapes.
 */
export const CompareShapesArea = ({ data, width = "100%", height = "auto" }) => {
    return (
        <div className="w-full flex justify-center py-2 overflow-hidden">
            <svg 
                width={width} 
                height={height} 
                viewBox="0 0 500 250"
                preserveAspectRatio="xMidYMid meet"
                className="block overflow-visible drop-shadow-sm"
            >
                <RenderShape type={data.shapeType} dims={data.left} areaText={data.left.area} offsetX={-25} scale={0.8} />
                <text x="250" y="125" textAnchor="middle" fontSize="30" fontWeight="bold" fill="#cbd5e1">→</text>
                <RenderShape type={data.shapeType} dims={data.right} areaText={data.right.area} offsetX={225} scale={1.2} />
            </svg>
        </div>
    );
};