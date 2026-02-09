import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, Plus, Trash2, Layout, Send, Info, Layers, ArrowUp, ArrowDown, Search, Zap, FileText, Grid3X3 
} from 'lucide-react';
import { SKILL_BUCKETS } from '../../constants/skillBuckets';

// --- GENERATOR IMPORTS ---
import { BasicArithmeticGen } from '../../core/generators/BasicArithmeticGen';
import { NegativeNumbersGen } from '../../core/generators/NegativeNumbersGen';
import { TenPowersGen } from '../../core/generators/TenPowersGen';
import { ExponentsGen } from '../../core/generators/ExponentsGen';
import { PercentGen } from '../../core/generators/PercentGen';
import { ExpressionSimplificationGen } from '../../core/generators/ExpressionSimplificationGen';
import { LinearEquationGen } from '../../core/generators/LinearEquationGen';
import { LinearEquationProblemGen } from '../../core/generators/LinearEquationProblemGen';
import { LinearGraphGenerator } from '../../core/generators/LinearGraphGenerator';
import { GeometryGenerator } from '../../core/generators/GeometryGenerator';
import { ScaleGen } from '../../core/generators/ScaleGen';
import { VolumeGen } from '../../core/generators/VolumeGen';
import { SimilarityGen } from '../../core/generators/SimilarityGen';
import { PythagorasGen } from '../../core/generators/PythagorasGen';
import { ProbabilityGen } from '../../core/generators/ProbabilityGen';
import { StatisticsGen } from '../../core/generators/StatisticsGen';
import { FractionBasicsGen } from '../../core/generators/FractionBasicsGen';
import { FractionArithGen } from '../../core/generators/FractionArithGen';
import { ChangeFactorGen } from '../../core/generators/ChangeFactorGen';
import { AnglesGen } from '../../core/generators/AnglesGen'; 
import { PatternsGen } from '../../core/generators/PatternsGen';

// --- VISUAL COMPONENT IMPORTS ---
import { GraphCanvas } from '../visuals/GraphCanvas';
import { VolumeVisualization } from '../visuals/VolumeVisualization';
import { FrequencyTable, PercentGrid } from '../visuals/StatisticsVisuals';
import { ProbabilityMarbles, ProbabilitySpinner } from '../visuals/ProbabilityVisuals';
import ProbabilityTree from '../visuals/ProbabilityTree'; 
import { RenderShape } from '../visuals/GeometryShapes';
import { ScaleVisual, SimilarityCompare, CompareShapesArea } from '../visuals/ScaleVisuals';
import { TransversalVisual, CompositeVisual } from '../visuals/ComplexGeometry';
import PatternVisual from '../visuals/PatternComponents'; 
import AngleVisual from '../visuals/AngleComponents'; 

// FIXED: Registry keys synchronized EXACTLY with SKILL_BUCKETS IDs in src/constants/skillBuckets.js
const GENERATORS = {
  // Algebra
  'equations': new LinearEquationGen(),
  'expressions': new ExpressionSimplificationGen(),
  'equations_word': new LinearEquationProblemGen(),
  'patterns': new PatternsGen(),
  'graphs': new LinearGraphGenerator(),
  
  // Arithmetic
  'basic_arithmetic': new BasicArithmeticGen(),
  'negatives': new NegativeNumbersGen(),
  'ten_powers': new TenPowersGen(),
  'exponents': new ExponentsGen(),
  'fractions_basics': new FractionBasicsGen(),
  'fractions_arith': new FractionArithGen(),
  
  // Geometry
  'geometry': new GeometryGenerator(),
  'pythagoras': new PythagorasGen(),
  'volume': new VolumeGen(),
  'scale': new ScaleGen(),
  'similarity': new SimilarityGen(),
  'angles': new AnglesGen(),
  
  // Data
  'statistics': new StatisticsGen(),
  'probability': new ProbabilityGen(),
  'percents': new PercentGen(),
  'change_factor': new ChangeFactorGen()
};

export default function QuestionStudio({ onDoNowGenerate, ui, lang }) {
  const [setupMode, setSetupMode] = useState(null); // 'donow' or 'worksheet'
  const [selectedTopicId, setSelectedTopicId] = useState('basic_arithmetic');
  const [packet, setPacket] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [activePreviewKey, setActivePreviewKey] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Auto-clear preview when switching topics
  useEffect(() => {
    setPreviewData(null);
    setActivePreviewKey(null);
  }, [selectedTopicId]);

  const allTopics = Object.values(SKILL_BUCKETS).flatMap(cat => 
    Object.entries(cat.topics).map(([id, data]) => ({ id, categoryName: cat.name, ...data }))
  );

  const currentTopic = allTopics.find(t => t.id === selectedTopicId) || allTopics[0];

  const triggerPreview = (key) => {
    const gen = GENERATORS[selectedTopicId];
    if (gen) {
      try {
        // Use Phase 2 method for targeted generation
        const q = gen.generateByVariation(key);
        setPreviewData(q);
        setActivePreviewKey(key);
      } catch (err) {
        console.error("Preview failed:", err);
      }
    } else {
        console.warn(`No generator found for topic: ${selectedTopicId}`);
    }
  };

  const addToPacket = (variation) => {
    if (setupMode === 'donow' && packet.length >= 3) return; 

    setPacket([...packet, {
      id: crypto.randomUUID(),
      topicId: selectedTopicId,
      variationKey: variation.key,
      name: variation.name,
      quantity: setupMode === 'donow' ? 2 : 5, 
    }]);
  };

  const removeFromPacket = (id) => setPacket(packet.filter(p => p.id !== id));
  
  const updateQuantity = (id, delta) => {
    setPacket(packet.map(p => p.id === id ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p));
  };

  const moveItem = (index, direction) => {
    const newPacket = [...packet];
    const target = index + direction;
    if (target >= 0 && target < newPacket.length) {
      [newPacket[index], newPacket[target]] = [newPacket[target], newPacket[index]];
      setPacket(newPacket);
    }
  };

  const handleFinalAction = () => {
    if (typeof onDoNowGenerate !== 'function') {
        console.error("Error: onDoNowGenerate prop is missing in QuestionStudio.");
        return;
    }

    if (setupMode === 'donow') {
      const config = packet.map(p => {
          // Extract level from variation key (usually at the end e.g., 'add_std_1')
          // fallback to level 1 if not found
          const levelMatch = p.variationKey.match(/\d+$/);
          return {
            topic: p.topicId,
            level: levelMatch ? parseInt(levelMatch[0]) : 1
          };
      });
      onDoNowGenerate(config);
    } else {
      // Future: Publisera Arbetsblad
    }
  };

  const renderVisual = () => {
    if (!previewData?.visualData) return null;
    const { type, data } = previewData.visualData;

    switch (type) {
      case 'graph': return <GraphCanvas data={data} />;
      case 'volume': return <VolumeVisualization data={data} />;
      case 'angle': return <AngleVisual data={data} />;
      case 'pattern': return <PatternVisual data={data} />;
      case 'probability_tree': return <ProbabilityTree data={data} />;
      case 'frequency_table': return <FrequencyTable data={data} />;
      case 'percent_grid': return <PercentGrid data={data} />;
      case 'probability_marbles': return <ProbabilityMarbles data={data} />;
      case 'probability_spinner': return <ProbabilitySpinner data={data} />;
      case 'scale_single':
      case 'scale_compare': return <ScaleVisual data={data} />;
      case 'similarity_compare': return <SimilarityCompare data={data} />;
      case 'compare_shapes_area': return <CompareShapesArea data={data} />;
      case 'transversal': return <TransversalVisual data={data} />;
      case 'composite': return <CompositeVisual data={data} />;
      case 'rectangle': case 'square': case 'parallelogram': 
      case 'triangle': case 'circle': case 'semicircle': case 'quarter_circle':
        return (
          <div className="flex justify-center w-full py-4">
            <svg width="300" height="250" viewBox="0 0 300 250">
              <RenderShape type={type} dims={data} labels={data.labels} />
            </svg>
          </div>
        );
      default: return null;
    }
  };

  const filteredTopics = allTopics.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- VIEW: INITIAL CHOICE ---
  if (!setupMode) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="max-w-4xl w-full text-center space-y-12">
            <div className="space-y-4">
                <h2 className="text-5xl font-black text-slate-900 tracking-tight italic">Studio</h2>
                <p className="text-xl text-slate-500 font-medium">Välj vad du vill förbereda för lektionen.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <button onClick={() => setSetupMode('donow')} className="group p-10 bg-white border-2 border-slate-100 rounded-[3rem] hover:border-indigo-600 hover:shadow-2xl transition-all text-left">
                    <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform"><Grid3X3 size={32} /></div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tighter">Do Now Grid</h3>
                    <p className="text-slate-500 leading-relaxed font-medium">Skapa ett rutnät med 6 frågor. Perfekt för gemensam uppstart på tavlan.</p>
                </button>
                <button onClick={() => setSetupMode('worksheet')} className="group p-10 bg-white border-2 border-slate-100 rounded-[3rem] hover:border-emerald-600 hover:shadow-2xl transition-all text-left">
                    <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform"><FileText size={32} /></div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tighter">Arbetsblad</h3>
                    <p className="text-slate-500 leading-relaxed font-medium">Bygg ett komplett övningspaket som kan sparas digitalt eller skrivas ut.</p>
                </button>
            </div>
        </div>
      </div>
    );
  }

  // --- VIEW: THE STUDIO ---
  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-100 overflow-hidden font-sans text-slate-900">
      
      {/* PANE 1: SIDEBAR */}
      <div className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm shrink-0">
        <div className="p-5 border-b border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-black uppercase tracking-widest text-[10px] text-slate-400">Bibliotek</h2>
            <button onClick={() => setSetupMode(null)} className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-tighter">Byt läge</button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Sök område..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm outline-none transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {Object.values(SKILL_BUCKETS).map(cat => {
            const catTopics = Object.entries(cat.topics).filter(([id]) => filteredTopics.some(ft => ft.id === id));
            if (catTopics.length === 0) return null;
            return (
              <div key={cat.id}>
                <h3 className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{cat.name}</h3>
                <div className="space-y-1">
                  {catTopics.map(([id, data]) => (
                    <button
                      key={id}
                      onClick={() => setSelectedTopicId(id)}
                      className={`w-full text-left px-3 py-2.5 text-sm rounded-xl transition-all flex items-center justify-between group ${
                        selectedTopicId === id 
                          ? 'bg-indigo-600 text-white shadow-lg font-bold' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                      }`}
                    >
                      <span className="truncate">{data.name}</span>
                      <ChevronRight size={14} className={selectedTopicId === id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PANE 2: WORKSPACE (Variations + Preview) */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">{currentTopic?.name}</h1>
                <p className="text-sm text-slate-500 font-medium">
                    {setupMode === 'donow' ? `Välj upp till 3 unika typer.` : "Konfigurera ditt arbetsblad."}
                </p>
            </div>
            <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${setupMode === 'donow' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'}`}>
                Format: {setupMode === 'donow' ? 'Do Now Grid' : 'Arbetsblad'}
            </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
            {/* Variations List (Left side of workspace) */}
            <div className="w-1/2 overflow-y-auto p-6 space-y-4 border-r border-slate-100 bg-slate-50/30">
                {currentTopic?.variations.map(v => (
                    <div 
                        key={v.key}
                        onClick={() => triggerPreview(v.key)}
                        className={`p-5 rounded-[2rem] border-2 transition-all cursor-pointer relative group ${
                            activePreviewKey === v.key ? 'border-indigo-500 bg-white shadow-xl ring-8 ring-indigo-50' : 'border-white bg-white hover:border-indigo-200 shadow-sm'
                        }`}
                    >
                        <div className="flex justify-between items-start">
                            <div className="pr-10">
                                <h4 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-indigo-600 transition-colors">{v.name}</h4>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">{v.desc}</p>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); addToPacket(v); }}
                                className="p-2.5 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all shadow-xl group-hover:scale-110 active:scale-95"
                            >
                                <Plus size={20} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Live Preview (Right side of workspace - ENLARGED) */}
            <div className="w-1/2 p-6 bg-slate-50 flex flex-col overflow-y-auto">
                <div className="min-h-full bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col relative">
                    <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Preview</span>
                        </div>
                        {activePreviewKey && (
                            <button onClick={() => triggerPreview(activePreviewKey)} className="text-[10px] bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 rounded-full font-bold uppercase transition-all shadow-lg">
                                Regenerera
                            </button>
                        )}
                    </div>
                    
                    <div className="p-10 flex-1 flex flex-col items-center justify-center text-center">
                        {!previewData ? (
                            <div className="text-slate-300 flex flex-col items-center gap-4">
                                <Layout size={64} strokeWidth={1} className="opacity-20" />
                                <p className="text-sm font-black uppercase tracking-widest">Välj en variation till vänster</p>
                            </div>
                        ) : (
                            <div className="w-full space-y-10 animate-in fade-in zoom-in-95 duration-300">
                                <div className="max-w-full">
                                    {renderVisual()}
                                </div>

                                <p className="text-2xl text-slate-800 font-black leading-tight px-4 tracking-tight">
                                    {previewData.renderData.description}
                                </p>
                                
                                {previewData.renderData.latex && (
                                    <div className="text-5xl font-serif text-indigo-600 py-12 px-6 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100 shadow-inner overflow-x-auto">
                                        $${previewData.renderData.latex}$$
                                    </div>
                                )}
                                
                                <div className="pt-10 border-t border-slate-100 text-left px-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Info size={16} className="text-indigo-500" />
                                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pedagogisk Ledtråd</h5>
                                    </div>
                                    <p className="text-base text-slate-500 italic leading-relaxed font-medium">
                                        {previewData.clues[0]?.text || "Ingen ledtråd tillgänglig."}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* PANE 3: WORKBENCH (CART) */}
      <div className="w-80 bg-white border-l border-slate-200 flex flex-col shadow-2xl relative z-10 shrink-0">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg shadow-indigo-100">
              {packet.length}
            </div>
            <h2 className="text-xs font-black text-slate-600 uppercase tracking-widest">Ditt Paket</h2>
          </div>
          {packet.length > 0 && (
            <button onClick={() => setPacket([])} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
              <Trash2 size={18} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {packet.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-300">
              <Layers size={56} strokeWidth={1} className="mb-6 opacity-20" />
              <p className="text-xs font-black leading-relaxed uppercase tracking-widest">Tomt paket</p>
            </div>
          ) : (
            packet.map((item) => (
              <div key={item.id} className="p-5 bg-slate-50 border border-slate-200 rounded-[2rem] relative group transition-all hover:bg-white hover:shadow-xl">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[9px] font-black text-indigo-500 uppercase tracking-tighter">
                    {allTopics.find(t => t.id === item.topicId)?.name}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => removeFromPacket(item.id)} className="p-1 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button>
                  </div>
                </div>
                <h5 className="text-sm font-black text-slate-800 mb-4 leading-tight">{item.name}</h5>
                
                {setupMode === 'worksheet' && (
                    <div className="flex items-center justify-between bg-white rounded-2xl p-2 border border-slate-100 shadow-sm">
                        <span className="text-[10px] font-black text-slate-400 ml-3 uppercase">Antal</span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">-</button>
                            <span className="w-6 text-center font-black text-slate-700 text-sm">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">+</button>
                        </div>
                    </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-8 border-t border-slate-100 bg-white">
          <button 
            onClick={handleFinalAction}
            disabled={packet.length === 0}
            className={`w-full py-5 rounded-[1.5rem] font-black flex items-center justify-center gap-3 transition-all shadow-2xl tracking-tighter ${
                setupMode === 'donow' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100'
            } disabled:opacity-30 disabled:grayscale disabled:shadow-none`}
          >
            <Send size={20} /> {setupMode === 'donow' ? 'SKAPA DO NOW' : 'PUBLICERA PAKET'}
          </button>
        </div>
      </div>
    </div>
  );
}