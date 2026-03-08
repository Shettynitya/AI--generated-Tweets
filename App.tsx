import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Check, 
  Zap, 
  Target,
  Download,
  AlertCircle,
  Loader2,
  RotateCcw,
  Lightbulb,
  ArrowRight,
  Quote,
  Github,
  Twitter,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { BrandInput, BrandVoice, Tweet, GenerationConfig } from "./types";
import { analyzeBrandVoice, generateTweets, regenerateSingleTweet } from "./services/aiService";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SAMPLE_BRAND: BrandInput = {
  name: "GlowSip",
  industry: "Beverages",
  objective: "Awareness",
  productInfo: "A healthy sparkling drink brand for Gen Z with fruity flavors and a playful personality",
  keywords: "Vibrant, Fresh, Social, Fun",
  targetAudience: "Gen Z, Health-conscious young adults",
  styleNotes: "Use emojis, short punchy sentences, and trendy slang sparingly."
};

export default function App() {
  const [input, setInput] = useState<BrandInput>({
    name: "",
    industry: "",
    objective: "engagement",
    productInfo: "",
    keywords: "",
    targetAudience: "",
    styleNotes: "",
    referenceLinks: ""
  });

  const [voice, setVoice] = useState<BrandVoice | null>(null);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [config, setConfig] = useState<GenerationConfig>({
    toneValue: 50,
    creativity: "medium"
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const workspaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleReset = () => {
    setInput({
      name: "",
      industry: "",
      objective: "engagement",
      productInfo: "",
      keywords: "",
      targetAudience: "",
      styleNotes: "",
      referenceLinks: ""
    });
    setVoice(null);
    setTweets([]);
    setError(null);
  };

  const handleTrySample = () => {
    setInput({
      ...SAMPLE_BRAND,
      referenceLinks: "twitter.com/glowsip"
    });
    scrollToWorkspace();
  };

  const scrollToWorkspace = () => {
    workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleGenerateAll = async () => {
    if (!input.industry || !input.productInfo) {
      setError("Please provide at least the Industry and Brand Description.");
      return;
    }
    setError(null);
    setIsGenerating(true);
    try {
      const voiceResult = await analyzeBrandVoice(input);
      setVoice(voiceResult);
      const tweetsResult = await generateTweets(input, voiceResult, config);
      setTweets(tweetsResult);
      setTimeout(scrollToWorkspace, 100);
    } catch (err: any) {
      console.error("Generation Error:", err);
      const errorMessage = err.message || "Something went wrong. Please check your connection and try again.";
      setError(errorMessage);
      // Scroll to error
      setTimeout(() => {
        const errorEl = document.querySelector('.text-red-500');
        errorEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateSingle = async (id: string) => {
    if (!voice) return;
    setRegeneratingId(id);
    try {
      const newTweet = await regenerateSingleTweet(input, voice, config, tweets);
      setTweets(prev => prev.map(t => t.id === id ? newTweet : t));
    } catch (err) {
      console.error(err);
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = () => {
    const text = tweets.map(t => `[${t.style.toUpperCase()}] ${t.text}`).join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${input.name || "brand"}-tweets.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-peach selection:text-charcoal">
      {/* 1. HEADER / NAVBAR */}
      <nav className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "bg-cream/90 backdrop-blur-md border-b border-beige shadow-sm py-3" : "bg-transparent py-5"
      )}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 rounded-xl bg-charcoal flex items-center justify-center text-white shadow-lg shadow-charcoal/10 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">Brand Tweet Generator</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-10">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How it works</a>
            <a href="#examples" className="nav-link">Examples</a>
            <button onClick={scrollToWorkspace} className="nav-link">Generate Tweets</button>
          </div>

          <button 
            onClick={scrollToWorkspace}
            className="btn-primary hidden sm:block"
          >
            Generate Tweets
          </button>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden bg-section-hero">
        <div className="depth-shape top-[-10%] left-[-5%] w-[40%] h-[40%] bg-coral/20" />
        <div className="depth-shape bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-mint/10" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-left space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-coral/10 border border-coral/20 text-[12px] font-bold uppercase tracking-wider text-coral">
              <Zap className="w-4 h-4 fill-coral" />
              <span>AI Brand Intelligence</span>
            </div>
            
            <h1 className="hero-headline">
              Generate <span className="text-gradient-coral">Tweets</span> <br />
              That Sound <br />
              Like Your <span className="text-gradient-mint">Brand</span>
            </h1>

            <p className="text-xl md:text-2xl text-charcoal/70 font-medium max-w-xl leading-relaxed">
              Stop guessing. Our AI analyzes your unique voice to create 
              perfectly tailored social content in seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <button 
                onClick={scrollToWorkspace}
                className="btn-vibrant-primary w-full sm:w-auto"
              >
                Generate Tweets
              </button>
              <button 
                onClick={handleTrySample}
                className="btn-vibrant-secondary w-full sm:w-auto"
              >
                Try Sample Brand
              </button>
            </div>
          </motion.div>

          {/* Floating UI Elements for Hero */}
          <div className="relative h-[500px] hidden lg:block">
            <motion.div 
              className="absolute top-10 right-0 w-80 floating-card animate-float"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-coral/20" />
                <div className="w-24 h-2 bg-gray-100 rounded-full" />
              </div>
              <p className="text-sm font-medium text-charcoal/80 leading-relaxed">
                "Sustainability isn't a trend, it's our foundation. Discover our new organic cotton collection. 🌿 #EcoFriendly"
              </p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-[10px] font-bold text-coral uppercase">Minimalist</span>
                <Twitter className="w-4 h-4 text-gray-200" />
              </div>
            </motion.div>

            <motion.div 
              className="absolute bottom-10 left-0 w-72 floating-card animate-float-delayed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-mint/20" />
                <div className="w-20 h-2 bg-gray-100 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="w-full h-2 bg-gray-50 rounded-full" />
                <div className="w-3/4 h-2 bg-gray-50 rounded-full" />
              </div>
              <div className="mt-4 flex gap-2">
                <div className="px-2 py-1 rounded-md bg-lavender text-[8px] font-bold">Witty</div>
                <div className="px-2 py-1 rounded-md bg-peach text-[8px] font-bold">Fresh</div>
              </div>
            </motion.div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-coral/20 to-mint/20 rounded-full blur-3xl -z-10" />
      </div>
    </div>
  </section>

      {/* 7. MAIN GENERATOR SECTION - Moved up */}
      <main ref={workspaceRef} className="flex-1 max-w-7xl mx-auto w-full px-6 pb-32 pt-12 scroll-mt-24 bg-section-generator">
        <div className="depth-shape top-[20%] right-[-10%] w-[30%] h-[30%] bg-lavender/20" />
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
        >
          
          {/* LEFT SIDE: INPUT PANEL */}
          <div className="lg:col-span-5 space-y-8">
            <div className="premium-card p-10 space-y-10 border-gray-50 shadow-xl">
              <div className="space-y-2">
                <h2 className="text-3xl font-display font-bold">Brand Details</h2>
                <p className="text-lg text-charcoal/60 font-medium">Enter your brand information to generate tailored content.</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-charcoal/40 uppercase tracking-wider">Brand Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. GlowSip"
                      className="premium-input"
                      value={input.name}
                      onChange={e => setInput({...input, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-charcoal/40 uppercase tracking-wider">Industry</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Beverages"
                      className="premium-input"
                      value={input.industry}
                      onChange={e => setInput({...input, industry: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-charcoal/40 uppercase tracking-wider">Campaign Objective</label>
                  <div className="relative">
                    <select 
                      className="premium-select"
                      value={input.objective}
                      onChange={e => setInput({...input, objective: e.target.value})}
                    >
                      <option value="engagement">Engagement</option>
                      <option value="promotion">Promotion</option>
                      <option value="awareness">Awareness</option>
                      <option value="launch">Product Launch</option>
                      <option value="education">Education</option>
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/40 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-charcoal/40 uppercase tracking-wider">Brand / Product Description</label>
                  <textarea 
                    rows={4}
                    placeholder="What makes your brand unique? What are you selling?"
                    className="premium-input resize-none"
                    value={input.productInfo}
                    onChange={e => setInput({...input, productInfo: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-charcoal/40 uppercase tracking-wider">Personality Keywords</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Playful, Fresh, Gen Z"
                    className="premium-input"
                    value={input.keywords}
                    onChange={e => setInput({...input, keywords: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-charcoal/40 uppercase tracking-wider">Target Audience</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Health-conscious young adults"
                    className="premium-input"
                    value={input.targetAudience}
                    onChange={e => setInput({...input, targetAudience: e.target.value})}
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 text-red-500 text-sm font-bold bg-red-50 p-5 rounded-2xl border border-red-100"
                >
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </motion.div>
              )}

              <div className="flex flex-col gap-4">
                <button 
                  onClick={handleGenerateAll}
                  disabled={isGenerating}
                  className="btn-vibrant-primary w-full flex items-center justify-center gap-3 py-5"
                >
                  {isGenerating ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <span>Generate 10 Tweets</span>
                      <Zap className="w-5 h-5" />
                    </>
                  )}
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={handleReset}
                    className="px-6 py-4 bg-gray-100 text-charcoal/60 rounded-2xl text-sm font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </button>
                  <button 
                    onClick={handleTrySample}
                    className="px-6 py-4 bg-gray-100 text-charcoal/60 rounded-2xl text-sm font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Lightbulb className="w-4 h-4" />
                    Sample
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: RESULTS PANEL */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-32 space-y-8"
                >
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-coral/20 border-t-coral animate-spin" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-coral" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-3xl font-display font-bold">Analyzing Brand Voice...</h3>
                    <p className="text-charcoal/50 font-medium text-lg">Crafting 10 unique tweets for {input.name || 'your brand'}.</p>
                  </div>
                </motion.div>
              ) : voice ? (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-12"
                >
                  {/* Brand Voice Summary Card */}
                  <div className="premium-card p-10 bg-gradient-to-br from-white to-coral/5 border-coral/10 relative overflow-hidden shadow-xl">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 rounded-2xl bg-coral/10 text-coral">
                        <Quote className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-display font-bold">Brand Voice Summary</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        {voice.summaryPoints.map((point, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-coral flex-shrink-0" />
                            <p className="text-base text-charcoal/70 leading-relaxed font-medium">{point}</p>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <span className="text-[10px] font-bold text-charcoal/30 uppercase tracking-widest">Attributes</span>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 rounded-full bg-coral/10 text-coral text-[10px] font-bold border border-coral/20">{voice.tone}</span>
                            <span className="px-3 py-1 rounded-full bg-mint/10 text-brand-secondary text-[10px] font-bold border border-mint/20">{voice.audience}</span>
                            <span className="px-3 py-1 rounded-full bg-lavender/50 text-light-purple text-[10px] font-bold border border-lavender/20">{voice.communicationStyle}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 10 Tweet Cards */}
                  <div className="space-y-8">
                    <div className="flex items-center justify-between px-4">
                      <div className="flex items-center gap-3">
                        <Twitter className="w-5 h-5 text-coral" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-charcoal/30">Generated Drafts</h3>
                      </div>
                      <button 
                        onClick={handleExport}
                        className="text-xs font-bold text-coral hover:text-coral/80 transition-colors flex items-center gap-2 px-4 py-2 rounded-xl bg-coral/5"
                      >
                        <Download className="w-4 h-4" />
                        Export All
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      {tweets.map((tweet, i) => (
                        <motion.div
                          key={tweet.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={cn(
                            "premium-card p-8 flex flex-col md:flex-row gap-8 group hover:scale-[1.02] transition-all duration-300",
                            tweet.style === 'promotional' && "bg-coral/5 border-coral/10",
                            tweet.style === 'witty' && "bg-lavender/30 border-lavender/20",
                            tweet.style === 'conversational' && "bg-mint/5 border-mint/10",
                            tweet.style === 'informative' && "bg-light-yellow/30 border-light-yellow/20",
                          )}
                        >
                          <div className="flex-1 space-y-6">
                            <div className="flex items-center justify-between">
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                                tweet.style === 'promotional' && "bg-coral/20 text-coral border-coral/30",
                                tweet.style === 'witty' && "bg-lavender text-light-purple border-lavender/50",
                                tweet.style === 'conversational' && "bg-mint/20 text-brand-secondary border-mint/30",
                                tweet.style === 'informative' && "bg-light-yellow text-soft-orange border-light-yellow/50",
                              )}>
                                {tweet.style}
                              </span>
                              <span className="text-[10px] font-bold text-charcoal/20 uppercase tracking-widest">
                                {tweet.characterCount} / 280
                              </span>
                            </div>
                            <p className="text-xl text-charcoal leading-relaxed font-medium">
                              {tweet.text}
                            </p>
                          </div>
                          
                          <div className="flex md:flex-col items-center justify-end gap-3 md:opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button 
                              onClick={() => handleCopy(tweet.text, tweet.id)}
                              className="p-4 rounded-2xl bg-white border border-gray-100 text-charcoal/40 hover:text-coral hover:border-coral hover:shadow-lg transition-all"
                              title="Copy Tweet"
                            >
                              <AnimatePresence mode="wait">
                                {copiedId === tweet.id ? (
                                  <motion.div key="check" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
                                    <Check className="w-5 h-5 text-green-500" />
                                  </motion.div>
                                ) : (
                                  <motion.div key="copy" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
                                    <Copy className="w-5 h-5" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </button>
                            <button 
                              onClick={() => handleRegenerateSingle(tweet.id)}
                              disabled={regeneratingId === tweet.id}
                              className="p-4 rounded-2xl bg-white border border-gray-100 text-charcoal/40 hover:text-coral hover:border-coral hover:shadow-lg transition-all disabled:opacity-50"
                              title="Regenerate Tweet"
                            >
                              <RefreshCw className={cn("w-5 h-5", regeneratingId === tweet.id && "animate-spin")} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="flex justify-center pt-8">
                      <button 
                        onClick={handleGenerateAll}
                        className="btn-vibrant-secondary px-12 py-5"
                      >
                        <RefreshCw className="w-5 h-5" />
                        Regenerate All
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* EMPTY STATE */
                <div className="h-full min-h-[600px] flex flex-col items-center justify-center p-16 text-center space-y-12 border-4 border-dashed border-coral/10 rounded-[4rem] bg-white/40 group hover:bg-white/60 transition-all duration-500">
                  <div className="relative">
                    <motion.div 
                      animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 0.9, 1] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                      className="w-40 h-40 rounded-[3.5rem] bg-coral/5 flex items-center justify-center text-coral/20 shadow-inner"
                    >
                      <Twitter className="w-20 h-20" />
                    </motion.div>
                    <div className="absolute -top-6 -right-6 w-16 h-16 rounded-[2rem] bg-coral flex items-center justify-center shadow-2xl shadow-coral/30">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-display font-bold">Ready to craft your brand voice?</h3>
                    <p className="text-xl text-charcoal/50 max-w-md mx-auto font-medium leading-relaxed">
                      Enter your details on the left and our AI will craft 10 perfectly tailored social posts.
                    </p>
                  </div>
                  <button 
                    onClick={handleTrySample}
                    className="btn-vibrant-secondary flex items-center gap-4 group-hover:scale-105 transition-transform"
                  >
                    <Lightbulb className="w-6 h-6" />
                    See an Example
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>

      {/* 3. FEATURES SECTION */}
      <section id="features" className="py-32 relative overflow-hidden bg-section-features">
        <div className="depth-shape top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-lavender/10" />
        <div className="max-w-7xl mx-auto px-6 text-center space-y-24 relative z-10">
          <div className="space-y-6">
            <h2 className="text-5xl md:text-6xl font-display font-bold tracking-tight">Built for Modern Brands</h2>
            <p className="text-charcoal/60 max-w-2xl mx-auto text-xl font-medium leading-relaxed">Everything you need to maintain a consistent brand voice across social media, powered by state-of-the-art AI.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Zap, title: "Voice Analysis", desc: "AI analyzes your tone, audience, and communication style automatically to ensure every tweet feels authentic.", color: "bg-coral/10 text-coral" },
              { icon: Target, title: "Dynamic Variations", desc: "Get engaging, promotional, witty, and informative tweets in one go, tailored to your specific campaign goals.", color: "bg-mint/10 text-brand-secondary" },
              { icon: RotateCcw, title: "Instant Iteration", desc: "Create ready-to-post social media tweets in seconds. Regenerate single tweets or entire sets with one click.", color: "bg-lavender text-light-purple" }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="premium-card p-12 text-left space-y-8 hover:border-coral/20 group bg-white/50"
              >
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm", feature.color)}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <div className="space-y-4">
                  <h4 className="text-2xl font-bold tracking-tight">{feature.title}</h4>
                  <p className="text-charcoal/60 leading-relaxed font-medium text-lg">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* 4. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-32 bg-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-display font-bold">How It Works</h2>
                <p className="text-charcoal/60 text-xl font-medium leading-relaxed">Three simple steps to social media consistency and brand growth.</p>
              </div>
              <div className="space-y-10">
                {[
                  { step: "01", title: "Define Your Brand", desc: "Tell us your brand name, industry, and what you're trying to achieve. The more context, the better the results." },
                  { step: "02", title: "AI Voice Analysis", desc: "Our advanced models analyze your input to infer your unique brand personality, tone, and communication style." },
                  { step: "03", title: "Generate & Refine", desc: "Get 10 tailored drafts instantly. Copy, export, or regenerate until every word perfectly matches your vision." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-8 group">
                    <span className="text-5xl font-display font-extrabold text-charcoal/5 group-hover:text-coral/10 transition-colors duration-500">{item.step}</span>
                    <div className="space-y-2">
                      <h4 className="text-xl font-bold">{item.title}</h4>
                      <p className="text-charcoal/60 font-medium text-base leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="premium-card p-10 bg-white/80 border-white shadow-2xl rotate-2 scale-105">
                <div className="space-y-4">
                  <div className="w-full h-4 bg-gray-50 rounded-full" />
                  <div className="w-full h-4 bg-gray-50 rounded-full" />
                  <div className="w-3/4 h-4 bg-gray-50 rounded-full" />
                  <div className="pt-6 flex gap-2">
                    <div className="w-20 h-8 bg-coral/10 rounded-full" />
                    <div className="w-20 h-8 bg-mint/10 rounded-full" />
                  </div>
                </div>
              </div>
              <div className="absolute -top-12 -left-12 premium-card p-6 bg-white shadow-2xl -rotate-6 border-white">
                <Sparkles className="w-10 h-10 text-coral" />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* 5. EXAMPLES SECTION */}
      <section id="examples" className="py-32 relative overflow-hidden bg-section-examples">
        <div className="depth-shape top-0 right-0 w-[40%] h-[40%] bg-mint/10" />
        <div className="max-w-7xl mx-auto px-6 text-center space-y-20 relative z-10">
          <div className="space-y-6">
            <h2 className="text-5xl md:text-6xl font-display font-bold tracking-tight">Real Examples</h2>
            <p className="text-charcoal/60 max-w-2xl mx-auto text-xl font-medium leading-relaxed">See how different brands use our generator to stay relevant and engaging across social channels.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { brand: "EcoWear", style: "Minimalist", text: "Sustainability isn't a trend, it's our foundation. Discover our new organic cotton collection. 🌿 #EcoFriendly", color: "bg-mint/5 border-mint/10" },
              { brand: "TechFlow", style: "Witty", text: "Our code is so clean, even your mom would approve. (Maybe). 💻✨ #DevLife", color: "bg-lavender/30 border-lavender/20" }
            ].map((example, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={cn("premium-card p-12 text-left space-y-6 bg-white/40 backdrop-blur-2xl", example.color)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-charcoal">{example.brand}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal/30">{example.style}</span>
                </div>
                <p className="text-2xl font-medium text-charcoal/90 italic leading-snug">"{example.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PRICING SECTION */}
      <section className="py-32 relative overflow-hidden bg-section-pricing">
        <div className="depth-shape bottom-0 left-0 w-[50%] h-[50%] bg-coral/10" />
        <div className="max-w-7xl mx-auto px-6 text-center space-y-20 relative z-10">
          <div className="space-y-6">
            <h2 className="text-5xl md:text-6xl font-display font-bold tracking-tight">Simple Pricing</h2>
            <p className="text-charcoal/60 max-w-2xl mx-auto text-xl font-medium leading-relaxed">Start generating for free, upgrade as you grow. No hidden fees, just pure brand intelligence.</p>
          </div>
          <div className="max-w-xl mx-auto premium-card p-16 space-y-10 border-coral/10 bg-coral/5 relative">
            <div className="absolute top-0 right-0 p-6">
              <div className="px-3 py-1 rounded-full bg-coral text-white text-[10px] font-bold uppercase tracking-widest">Most Popular</div>
            </div>
            <div className="space-y-2">
              <h4 className="text-2xl font-bold">Pro Plan</h4>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-7xl font-display font-extrabold">$19</span>
                <span className="text-xl text-charcoal/40 font-medium">/month</span>
              </div>
            </div>
            <ul className="space-y-4 text-left max-w-xs mx-auto">
              {["Unlimited generations", "Advanced voice analysis", "Export to CSV/JSON", "Priority support", "Custom style notes"].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-lg font-medium text-charcoal/70">
                  <div className="w-5 h-5 rounded-full bg-coral/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-coral" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
            <button className="btn-vibrant-primary w-full py-6 text-xl">Get Started Now</button>
          </div>
        </div>
      </section>



      {/* 7. FOOTER */}
      <footer className="py-24 bg-ivory border-t border-beige">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="md:col-span-2 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-charcoal flex items-center justify-center text-white shadow-lg shadow-charcoal/10">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">Brand Tweet Generator</span>
            </div>
            <p className="text-taupe max-w-xs font-medium text-lg leading-relaxed">
              The modern way to maintain consistency across social channels. 
              Built for teams who care about brand voice.
            </p>
            <div className="flex gap-5">
              <a href="#" className="p-3 rounded-xl bg-beige hover:bg-charcoal hover:text-white transition-all shadow-sm">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-3 rounded-xl bg-beige hover:bg-charcoal hover:text-white transition-all shadow-sm">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div className="space-y-8">
            <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-charcoal/30">Product</h4>
            <ul className="space-y-5">
              <li><a href="#features" className="nav-link text-base">Features</a></li>
              <li><a href="#how-it-works" className="nav-link text-base">How it works</a></li>
              <li><a href="#examples" className="nav-link text-base">Examples</a></li>
              <li><a href="#" className="nav-link text-base">Pricing</a></li>
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-charcoal/30">Support</h4>
            <ul className="space-y-5">
              <li><a href="#" className="nav-link text-base">Help Center</a></li>
              <li><a href="#" className="nav-link text-base">API Docs</a></li>
              <li><a href="#" className="nav-link text-base">Community</a></li>
              <li><a href="#" className="nav-link text-base">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 mt-24 pt-10 border-t border-beige flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-taupe text-sm font-medium">
            &copy; 2026 Brand Tweet Generator. All rights reserved.
          </p>
          <div className="flex gap-10">
            <a href="#" className="text-sm font-medium text-taupe hover:text-charcoal transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm font-medium text-taupe hover:text-charcoal transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
