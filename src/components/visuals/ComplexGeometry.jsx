import React from 'react';

export const TransversalVisual = ({ data }) => {
    const labels = data.labels;
    return (
        <svg width="300" height="250" viewBox="0 0 300 250" className="my-2 w-full max-w-[300px] mx-auto">
            <polygon points="150,30 50,220 250,220" fill="#ecfdf5" stroke="#10b981" strokeWidth="3" fillOpacity="0.3" />
            <line x1="100" y1="125" x2="200" y2="125" stroke="#059669" strokeWidth="3" />
            <path d="M 150 125 l -5 -5 m 5 5 l -5 5" stroke="#059669" strokeWidth="2" fill="none"/>
            <path d="M 150 220 l -5 -5 m 5 5 l -5 5" stroke="#10b981" strokeWidth="2" fill="none"/>

            {/* Standard Labels */}
            <text x="85" y="80" fontSize="18" fontWeight="bold" fill="#374151" textAnchor="end">{labels.left_top}</text>
            <text x="150" y="115" fontSize="18" fontWeight="bold" fill="#374151" textAnchor="middle">{labels.base_top}</text>
            <text x="150" y="240" fontSize="18" fontWeight="bold" fill="#374151" textAnchor="middle">{labels.base_bot}</text>

            {/* Conditional Labels: Total Bracket OR Bottom Extension */}
            {labels.left_tot && (
                <g transform="translate(-10, 0)"> 
                    <line x1="110" y1="20" x2="10" y2="210" stroke="#64748b" strokeWidth="2" />
                    <line x1="110" y1="20" x2="120" y2="25" stroke="#64748b" strokeWidth="2" />
                    <line x1="10" y1="210" x2="20" y2="215" stroke="#64748b" strokeWidth="2" />
                    <text x="50" y="115" fontSize="18" fontWeight="bold" fill="#374151" textAnchor="end" dominantBaseline="middle">{labels.left_tot}</text>
                </g>
            )}
            {labels.left_bot && (
                <text x="65" y="170" fontSize="18" fontWeight="bold" fill="#374151" textAnchor="end">{labels.left_bot}</text>
            )}
        </svg>
    );
};

export const CompositeVisual = ({ data }) => {
    return (
        <div className="flex justify-center my-4">
            <svg width="200" height="200" viewBox="0 0 200 200" className="border border-gray-100 rounded-lg bg-white shadow-sm">
                {data.subtype === 'house' ? (
                    <>
                        <rect x="50" y="80" width="100" height="80" fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
                        <polygon points="50,80 150,80 100,20" fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
                        <text x="160" y="120" fontWeight="bold" fill="#374151" fontSize="18">{data.labels.h}</text>
                        <text x="100" y="180" textAnchor="middle" fontWeight="bold" fill="#374151" fontSize="18">{data.labels.w}</text>
                        <text x="130" y="60" fontWeight="bold" fill="#374151" fontSize="18">{data.labels.h_roof}</text>
                    </>
                ) : (
                    <>
                        <rect x="50" y="70" width="100" height="100" fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
                        <path d="M 50 70 A 50 50 0 0 1 150 70" fill="#ecfdf5" stroke="#10b981" strokeWidth="3" />
                        <text x="100" y="190" textAnchor="middle" fontWeight="bold" fill="#374151" fontSize="18">{data.labels.w}</text>
                        <text x="160" y="120" textAnchor="start" fontWeight="bold" fill="#374151" fontSize="18">{data.labels.h}</text>
                    </>
                )}
            </svg>
        </div>
    );
};