import React from 'react';
import { RenderShape } from './GeometryShapes';

export const ScaleVisual = ({ data }) => {
    const shapeEmojis = { square: '⬛', rectangle: '▭', circle: '⚫', triangle: '🔺', cube: '🧊', cylinder: '🛢️', pyramid: '⛰️', cone: '🍦', sphere: '🔮', arrow: '➡', star: '⭐', lightning: '⚡', key: '🔑', heart: '❤️', cloud: '☁️', moon: '🌙', sun: '☀️', magnifying_glass: '🔍', map: '🗺️', car: '🚗', ladybug: '🐞', house: '🏠' }; 
    const emoji = shapeEmojis[data.shape] || '📦'; 
    const ShapeIcon = ({ size }) => <div className="flex items-center justify-center text-6xl select-none" style={{ fontSize: size }}>{emoji}</div>; 
    
    if (data.type === 'scale_single') {
        return <div className="flex flex-col items-center gap-2 my-4"><ShapeIcon size="80px" /><span className="bg-white px-4 py-2 rounded shadow text-3xl font-bold font-mono border border-gray-200">{data.label}</span></div>; 
    }
    return (
        <div className="flex items-center justify-center gap-4 sm:gap-8 my-6">
            <div className="flex flex-col items-center gap-2"><span className="text-base font-bold uppercase text-gray-400 mb-1">{data.leftLabel}</span><ShapeIcon size="60px" /><span className="text-2xl font-bold font-mono bg-white px-3 rounded border mt-2">{data.leftValue}</span></div>
            <div className="text-gray-300 text-3xl">→</div>
            <div className="flex flex-col items-center gap-2"><span className="text-base font-bold uppercase text-gray-400 mb-1">{data.rightLabel}</span><ShapeIcon size="100px" /><span className="text-2xl font-bold font-mono bg-white px-3 rounded border mt-2">{data.rightValue}</span></div>
        </div>
    ); 
};

export const SimilarityCompare = ({ data }) => {
    const shapeType = data.shapeType || 'triangle';
    const leftDims = { ...data.left, width: 40, height: 40, radius: 20, subtype: shapeType === 'triangle' ? 'isosceles' : undefined };
    const rightDims = { ...data.right, width: 60, height: 60, radius: 30, subtype: shapeType === 'triangle' ? 'isosceles' : undefined };
    return (
        <svg width="500" height="250" viewBox="0 0 500 250" className="my-2 w-full mx-auto" style={{ maxWidth: '500px' }}>
            <RenderShape type={shapeType} dims={leftDims} labels={data.left.labels} offsetX={-25} scale={0.8} />
            <text x="250" y="125" textAnchor="middle" fontSize="30" fill="#cbd5e1">→</text>
            <RenderShape type={shapeType} dims={rightDims} labels={data.right.labels} offsetX={225} scale={1.2} />
        </svg>
    );
};

export const CompareShapesArea = ({ data }) => {
    return (
            <svg width="500" height="250" viewBox="0 0 500 250" className="my-2 w-full mx-auto" style={{ maxWidth: '500px' }}>
            <RenderShape type={data.shapeType} dims={data.left} areaText={data.left.area} offsetX={-25} scale={0.8} />
            <text x="250" y="125" textAnchor="middle" fontSize="30" fill="#cbd5e1">→</text>
            <RenderShape type={data.shapeType} dims={data.right} areaText={data.right.area} offsetX={225} scale={1.2} />
        </svg>
    );
};