import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, Plus, Trash2, Eye, FileText, 
  Layout, Send, Info, Layers, ArrowUp, ArrowDown, Search, Zap 
} from 'lucide-react';
import { SKILL_BUCKETS } from '../../constants/skillBuckets';

// --- ALLA 21 GENERATORER (Inga filändelser enligt Vite-standard) ---
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

// --- INSTANSIERING ---
// Nycklarna här (t.ex. 'equations') måste matcha ID i skillBuckets.js topics
const GENERATORS = {
  'equations': new LinearEquationGen(),
  'expressions': new ExpressionSimplificationGen(),
  'equations_word': new LinearEquationProblemGen(),
  'patterns': new PatternsGen(),
  'graphs': new LinearGraphGenerator(),
  'basic_arithmetic': new BasicArithmeticGen(),
  'negatives': new NegativeNumbersGen(),
  'ten_powers': new TenPowersGen(),
  'exponents': new ExponentsGen(),
  'fractions_basics': new FractionBasicsGen(),
  'fractions_arith': new FractionArithGen(),
  'geometry': new GeometryGenerator(),
  'pythagoras': new PythagorasGen(),
  'volume': new VolumeGen(),
  'scale': new ScaleGen(),
  'similarity': new SimilarityGen(),
  'angles': new AnglesGen(),
  'statistics': new StatisticsGen(),
  'probability': new ProbabilityGen(),
  'percents': new PercentGen(),
  'change_factor': new ChangeFactorGen()
};

export default function QuestionStudio() {
  const [selectedTopicId, setSelectedTopicId] = useState('equations');
  const [packet, setPacket] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [activePreviewKey, setActivePreviewKey] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Flatten topics för sökning och rendering
  const allTopics = Object.values(SKILL_BUCKETS).flatMap(cat => 
    Object.entries(cat.topics).map(([id, data]) => ({ 
      id, 
      categoryName: cat.name,
      ...data 
    }))
  );

  const currentTopic = allTopics.find(t => t.id === selectedTopicId) || allTopics[0];

  const addToPacket = (variation) => {
    setPacket([...packet, {
      id: crypto.randomUUID(),
      topicId: selectedTopicId,
      variationKey: variation.key,
      name: variation.name,
      quantity: 5,
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

  const triggerPreview = (key) => {
    const gen = GENERATORS[selectedTopicId];
    if (gen) {
      const q = gen.generateByVariation(key);
      setPreviewData(q);
      setActivePreviewKey(key);
    }
  };

  const filteredTopics = allTopics.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50 overflow-hidden font-sans text-slate-900">
      
      {/* PANE 1: LIBRARY SIDEBAR */}
      <div className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        <div className="p-5 border-b border-slate-100 space-y-4">
          <div className="flex items-center gap-2 text-indigo-600">
            <Zap size={20} fill="currentColor" fillOpacity={0.2} />
            <h2 className="font-bold uppercase tracking-tight text-sm">Question Studio</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Sök område..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {Object.values(SKILL_BUCKETS).map(cat => {
            const catTopics = Object.entries(cat.topics).filter(([id]) => 
              filteredTopics.some(ft => ft.id === id)
            );
            if (catTopics.length === 0) return null;

            return (
              <div key={cat.id}>
                <h3 className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{cat.name}</h3>
                <div className="space-y-1">
                  {catTopics.map(([id, data]) => (
                    <button
                      key={id}
                      onClick={() => setSelectedTopicId(id)}
                      className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all flex items-center justify-between group ${
                        selectedTopicId === id 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 font-semibold' 
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

      {/* PANE 2: VARIATION LIST & PREVIEW */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className="p-8 border-b border-slate-100">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter bg-indigo-50 px-2 py-0.5 rounded">Valt Område</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{currentTopic?.name}</h1>
            <p className="text-slate-500 mt-2 text-lg">Konfigurera ditt paket genom att välja specifika färdigheter.</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          <div className="max-w-5xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-4">
              {currentTopic?.variations.map(v => (
                <div 
                  key={v.key}
                  onClick={() => triggerPreview(v.key)}
                  className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative group ${
                    activePreviewKey === v.key ? 'border-indigo-500 bg-white shadow-2xl ring-8 ring-indigo-50' : 'border-white bg-white hover:border-indigo-200 shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="pr-12">
                      <h4 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{v.name}</h4>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">{v.desc}</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); addToPacket(v); }}
                      className="absolute top-6 right-6 p-2.5 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all shadow-xl hover:scale-110 active:scale-95 group-hover:opacity-100 opacity-0"
                    >
                      <Plus size={20} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative">
              <div className="sticky top-0 bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col min-h-[550px]">
                <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Preview</span>
                  </div>
                  {activePreviewKey && (
                    <button onClick={() => triggerPreview(activePreviewKey)} className="text-[10px] bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-full font-bold transition-all uppercase">Nytt Exempel</button>
                  )}
                </div>
                
                <div className="p-12 flex-1 flex flex-col justify-center text-center">
                  {!previewData ? (
                    <div className="text-slate-300 flex flex-col items-center gap-6">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                        <Layout size={40} className="text-slate-200" />
                      </div>
                      <p className="text-lg font-bold">Välj en färdighet för förhandsgranskning</p>
                    </div>
                  ) : (
                    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-300">
                      <p className="text-2xl text-slate-800 leading-tight font-bold">{previewData.renderData.description}</p>
                      {previewData.renderData.latex && (
                        <div className="text-5xl font-serif text-indigo-600 py-10 px-4 bg-indigo-50/30 rounded-[2rem] border border-indigo-100">
                          {previewData.renderData.latex}
                        </div>
                      )}
                      <div className="pt-10 border-t border-slate-100 text-left">
                        <div className="flex items-center gap-2 mb-3">
                          <Info size={16} className="text-indigo-500" />
                          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pedagogisk Ledtråd</h5>
                        </div>
                        <p className="text-sm text-slate-500 italic">{previewData.clues[0]?.text || "Ingen ledtråd tillgänglig."}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PANE 3: WORKBENCH */}
      <div className="w-80 bg-white border-l border-slate-200 flex flex-col shadow-2xl relative z-10">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg shadow-indigo-100">{packet.length}</div>
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
              <p className="text-sm font-bold">Inga moment tillagda.</p>
            </div>
          ) : (
            packet.map((item, idx) => (
              <div key={item.id} className="p-5 bg-slate-50 border border-slate-200 rounded-3xl relative group transition-all hover:bg-white hover:shadow-xl">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[9px] font-black text-indigo-500 uppercase tracking-tighter">
                    {allTopics.find(t => t.id === item.topicId)?.name}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => moveItem(idx, -1)} className="p-1 text-slate-400 hover:bg-white rounded"><ArrowUp size={12} /></button>
                    <button onClick={() => moveItem(idx, 1)} className="p-1 text-slate-400 hover:bg-white rounded"><ArrowDown size={12} /></button>
                    <button onClick={() => removeFromPacket(item.id)} className="p-1 text-red-400 hover:bg-red-50 rounded"><Trash2 size={12} /></button>
                  </div>
                </div>
                <h5 className="text-sm font-black text-slate-800 mb-4 leading-tight">{item.name}</h5>
                <div className="flex items-center justify-between bg-white rounded-2xl p-2 border border-slate-100 shadow-sm">
                  <span className="text-[10px] font-black text-slate-400 ml-3 uppercase">Antal</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-xl hover:bg-indigo-600 hover:text-white">-</button>
                    <span className="w-6 text-center font-bold text-slate-700 text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-xl hover:bg-indigo-600 hover:text-white">+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-8 border-t border-slate-100 bg-white space-y-4">
          <button 
            disabled={packet.length === 0}
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-indigo-700 disabled:opacity-30 disabled:grayscale transition-all shadow-2xl shadow-indigo-100"
          >
            <Send size={20} /> PUBLICERA
          </button>
          <button 
            disabled={packet.length === 0}
            className="w-full py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-50 transition-all text-sm"
          >
            <FileText size={18} /> SKAPA ARBETSBLAD
          </button>
        </div>
      </div>
    </div>
  );
}