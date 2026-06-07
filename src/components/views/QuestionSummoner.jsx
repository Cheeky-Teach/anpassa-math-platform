import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, RefreshCcw, Type, Calculator, Zap } from 'lucide-react';
import { SKILL_BUCKETS } from '../../constants/skillBuckets.js';
import { GeometryVisual, GraphCanvas } from '../visuals/GeometryComponents';
import { VolumeVisualization } from '../visuals/VolumeVisualization';
import PatternVisual from '../visuals/PatternComponents';
import { ProbabilityMarbles, ProbabilitySpinner } from '../visuals/ProbabilityVisuals';
import ProbabilityTree from '../visuals/ProbabilityTree';
import { ScaleVisual, SimilarityCompare, CompareShapesArea } from '../visuals/ScaleVisuals';
import { FrequencyTable, PercentGrid } from '../visuals/StatisticsVisuals';
import AngleVisual from '../visuals/AngleComponents';

// Lightweight Math Renderer for the Preview
const MathDisplay = ({ content, className = "" }) => {
    const containerRef = useRef(null);
    useEffect(() => {
        if (!content || !containerRef.current) return;
        containerRef.current.innerText = content;
        if (window.renderMathInElement) {
            window.renderMathInElement(containerRef.current, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false }
                ], throwOnError: false, trust: true
            });
        }
    }, [content]);
    return <div ref={containerRef} className={`math-content leading-relaxed whitespace-pre-wrap text-inherit ${className}`} />;
};

export default function QuestionSummoner({ lang = 'sv', onClose, onSummon }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTopicId, setSelectedTopicId] = useState('basic_arithmetic');
    const [selectedVariation, setSelectedVariation] = useState(null);
    
    const [previewData, setPreviewData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isWordProblem, setIsWordProblem] = useState(false);

    // Flatten all topics for searching
    const allTopics = Object.values(SKILL_BUCKETS).flatMap(cat => 
        Object.entries(cat.topics).map(([id, data]) => ({ id, categoryName: cat.name[lang], ...data }))
    );

    const filteredTopics = allTopics.filter(t => 
        t.name[lang].toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const currentTopic = allTopics.find(t => t.id === selectedTopicId);
    
    // Auto-select first variation when topic changes
    useEffect(() => {
        if (currentTopic && currentTopic.variations.length > 0) {
            setSelectedVariation(currentTopic.variations[0]);
        }
    }, [selectedTopicId]);

    // Fetch Preview when variation or word-problem toggle changes
    useEffect(() => {
        if (!selectedTopicId || !selectedVariation) return;
        fetchPreview();
    }, [selectedVariation, isWordProblem]);

    const fetchPreview = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/question?topic=${selectedTopicId}&variation=${selectedVariation.key}&lang=${lang}&wordProblem=${isWordProblem}`);
            const data = await res.json();
            setPreviewData(data);
        } catch (err) {
            console.error("Preview fetch failed", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSummon = () => {
        if (!previewData) return;
        
        // Build a standardized item object matching QuestionStudio's packet format
        const newItem = {
            id: crypto.randomUUID(),
            topicId: selectedTopicId,
            variationKey: selectedVariation.key,
            name: selectedVariation.name[lang],
            columnSpan: 6, // Take full width on board
            resolvedData: previewData,
            instructionMode: isWordProblem ? 'inline' : 'header',
            showLatex: !isWordProblem,
            showVisual: !isWordProblem,
            showText: true,
            selectedStoryIndex: isWordProblem ? 0 : null
        };
        
        onSummon(newItem);
    };

    // --- VISUAL RENDERER ---
    const renderVisual = (rd) => {
        if (!rd) return null;
        if (rd.graph) return <GraphCanvas data={rd.graph} />;
        if (rd.pattern || rd.geometry?.subtype === 'sequence') return <PatternVisual data={rd.pattern || rd.geometry} />;
        if (rd.marbles) return <ProbabilityMarbles data={rd.marbles} />;
        if (rd.spinner) return <ProbabilitySpinner data={rd.spinner} />;
        if (rd.freqTable) return <FrequencyTable data={rd.freqTable} />;
        if (rd.geometry?.type === 'angle') return <AngleVisual data={rd.geometry} />;
        if (rd.geometry) return <GeometryVisual data={rd.geometry} width={220} height={180} />;
        return null;
    };

    return (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200">
            {/* The Command Palette Window */}
            <div className="bg-[#f9fbf7] w-full max-w-6xl h-[85vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
                
                {/* Header */}
                <header className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-xl"><Zap size={20} className="text-indigo-600" /></div>
                        <h2 className="text-lg font-black uppercase tracking-widest text-slate-800">
                            {lang === 'sv' ? "Hämta Uppgift" : "Summon Question"}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-rose-100 hover:text-rose-600 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </header>

                <div className="flex flex-1 min-h-0">
                    {/* COL 1: Topics */}
                    <div className="w-1/3 bg-white border-r border-slate-200 flex flex-col shrink-0">
                        <div className="p-4 border-b border-slate-100">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                <input 
                                    type="text" 
                                    placeholder={lang === 'sv' ? "Sök område..." : "Search topics..."} 
                                    className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {filteredTopics.map(topic => (
                                <button 
                                    key={topic.id} 
                                    onClick={() => setSelectedTopicId(topic.id)} 
                                    className={`w-full text-left px-4 py-3 text-sm rounded-xl transition-all ${selectedTopicId === topic.id ? 'bg-indigo-600 text-white font-black shadow-md' : 'text-slate-600 font-bold hover:bg-indigo-50'}`}
                                >
                                    {topic.name[lang]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* COL 2: Variations (The "Levels") */}
                    <div className="w-1/3 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
                        <div className="p-4 border-b border-slate-200 bg-slate-100/50">
                            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{lang === 'sv' ? "Välj Nivå / Typ" : "Select Level / Type"}</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {currentTopic?.variations.map((v, idx) => {
                                const isSelected = selectedVariation?.key === v.key;
                                return (
                                    <div 
                                        key={v.key} 
                                        onClick={() => setSelectedVariation(v)}
                                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${isSelected ? 'bg-white border-indigo-500 shadow-lg scale-[1.02]' : 'bg-white border-transparent hover:border-slate-300 shadow-sm'}`}
                                    >
                                        <div className="text-[10px] font-black text-indigo-400 mb-1 tracking-widest">NIVÅ {idx + 1}</div>
                                        <div className="font-bold text-slate-800 text-sm">{v.name[lang]}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* COL 3: Preview & Actions */}
                    <div className="w-1/3 flex flex-col bg-white shrink-0 relative">
                        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center custom-scrollbar">
                            {isLoading ? (
                                <Loader2 className="animate-spin text-indigo-600" size={48} />
                            ) : previewData ? (
                                <div className="w-full flex flex-col items-center animate-in zoom-in-95 duration-200">
                                    <div className="flex justify-center scale-90 origin-top mb-6">
                                        {renderVisual(previewData.renderData)}
                                    </div>
                                    <div className="text-lg text-slate-800 font-bold text-center px-4 leading-relaxed mb-6">
                                        <MathDisplay content={previewData.renderData.description} />
                                    </div>
                                    {previewData.renderData.latex && (
                                        <div className="text-3xl text-indigo-600 bg-indigo-50/50 px-8 py-6 rounded-3xl border-2 border-indigo-100 shadow-inner text-center font-serif w-full max-w-sm">
                                            <MathDisplay content={`$$${previewData.renderData.latex}$$`} />
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>

                        {/* Control Panel Footer */}
                        <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-4 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                            <div className="flex gap-2">
                                <button 
                                    onClick={fetchPreview}
                                    className="flex-1 py-3 bg-white border border-slate-300 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                                >
                                    <RefreshCcw size={16} /> {lang === 'sv' ? "Slumpa Siffror" : "Shuffle Numbers"}
                                </button>
                                <button 
                                    onClick={() => setIsWordProblem(!isWordProblem)}
                                    className={`flex-1 py-3 border rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 ${isWordProblem ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-white border-slate-300 text-slate-700 hover:border-amber-300'}`}
                                >
                                    <Type size={16} /> {isWordProblem ? (lang === 'sv' ? "Ta bort text" : "Remove Story") : (lang === 'sv' ? "Gör till text" : "Make Story")}
                                </button>
                            </div>
                            <button 
                                onClick={handleSummon}
                                disabled={isLoading || !previewData}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                            >
                                <Zap size={18} /> {lang === 'sv' ? "Lägg till på tavlan" : "Summon to Board"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}