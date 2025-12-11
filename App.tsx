import React, { useState } from 'react';
import { Sparkles, Loader2, Camera, Shirt, Footprints, Image as ImageIcon } from 'lucide-react';
import { UploadSlot, UploadType, PromptResult } from './types';
import ImageUploader from './components/ImageUploader';
import PromptCard from './components/PromptCard';
import { generatePrompts } from './services/geminiService';

const App: React.FC = () => {
  const [slots, setSlots] = useState<UploadSlot[]>([
    { id: 'model', type: UploadType.MODEL, file: null, previewUrl: null },
    { id: 'garment', type: UploadType.GARMENT, file: null, previewUrl: null },
    { id: 'footwear', type: UploadType.FOOTWEAR, file: null, previewUrl: null },
    { id: 'bg', type: UploadType.BACKGROUND, file: null, previewUrl: null },
  ]);

  const [prompts, setPrompts] = useState<PromptResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = (id: string, file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setSlots(prev => prev.map(slot => 
      slot.id === id ? { ...slot, file, previewUrl } : slot
    ));
    setError(null);
  };

  const handleClear = (id: string) => {
    setSlots(prev => prev.map(slot => 
      slot.id === id ? { ...slot, file: null, previewUrl: null } : slot
    ));
  };

  const handleGenerate = async () => {
    const modelSlot = slots.find(s => s.id === 'model');
    const garmentSlot = slots.find(s => s.id === 'garment');
    const footwearSlot = slots.find(s => s.id === 'footwear');
    const bgSlot = slots.find(s => s.id === 'bg');

    if (!modelSlot?.file || !garmentSlot?.file) {
      setError("Please upload at least the Model Reference and Garment images.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setPrompts([]);

    try {
      const results = await generatePrompts(
        modelSlot.file,
        garmentSlot.file,
        footwearSlot?.file || null,
        bgSlot?.file || null
      );
      setPrompts(results);
    } catch (err) {
      setError("Failed to generate prompts. Please ensure the API key is valid and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 selection:bg-indigo-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Camera size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              VTO Prompt Architect
            </h1>
          </div>
          <div className="text-xs text-slate-500 hidden sm:block">
            Powered by Gemini 2.5 Flash / 3.0 Pro Vision
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* Intro */}
        <section className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Virtual Try-On Workflow</h2>
          <p className="text-slate-400">
            Upload your reference assets. Our AI analyzes textures, fit, and lighting to generate precise
            prompt engineering for photorealistic results.
          </p>
        </section>

        {/* Upload Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {slots.map(slot => (
            <ImageUploader 
              key={slot.id} 
              slot={slot} 
              onUpload={handleUpload} 
              onClear={handleClear} 
            />
          ))}
        </section>

        {/* Action Area */}
        <section className="flex flex-col items-center gap-4">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`
              relative group overflow-hidden rounded-full px-8 py-4 font-semibold text-lg transition-all duration-300 shadow-xl
              ${isGenerating 
                ? 'bg-slate-700 cursor-not-allowed opacity-70' 
                : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[size:200%] hover:bg-[position:100%] hover:shadow-indigo-500/25'
              }
            `}
          >
            <div className="flex items-center gap-3">
              {isGenerating ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Sparkles className="group-hover:rotate-12 transition-transform" />
              )}
              <span>{isGenerating ? 'Analyzing Textures...' : 'Generate 5-Angle Prompts'}</span>
            </div>
          </button>
          
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
        </section>

        {/* Results Grid */}
        {prompts.length > 0 && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-bold">Analysis Results</h2>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                Analysis Complete
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {prompts.map((prompt, idx) => (
                <PromptCard key={idx} data={prompt} index={idx} />
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
};

export default App;