'use client';

import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import motionShim, { AnimatePresence } from '@/lib/motion';
const motion = motionShim;
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight, Video, Brain, Sparkles,
  ChevronRight, Shield, Globe, Target, User, BarChart
} from "lucide-react";
import { cn } from "@/lib/utils-r";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const handleStartDiscovery = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return;

    setIsStarting(true);
    sessionStorage.setItem('userName', name.trim());
    // Simulation delay for premium feel
    setTimeout(() => {
      // route through the public personality-prediction entrypoint
      router.push('/personality-prediction');
    }, 800);
  };

  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  return (
    <main className="min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      {/* Ambient Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50/50 rounded-full blur-[120px] mix-blend-multiply animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-[120px] mix-blend-multiply animate-pulse anim-delay-2s" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-50/30 rounded-full blur-[100px] animate-pulse anim-delay-4s" />
      </div>


      {/* Back Button */}
      <div className="fixed top-10 left-10 z-50">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-bold transition-all"
        >
          <ArrowRight className="w-5 h-5 rotate-180" />
          Back
        </Button>
      </div>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 md:px-12 z-10 overflow-hidden">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center"
        >
          <div className="space-y-10 text-center lg:text-left">
            {/* <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-100 bg-indigo-50/50 text-[11px] font-bold text-indigo-600 uppercase tracking-widest shadow-sm">
              <Sparkles className="w-3 h-3" />
              Next-Gen Career Discovery
            </motion.div> */}

            <div className="space-y-6">
              <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.1] tracking-tight">
                Unlock Your <br />
                <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">True Potential.</span>
              </motion.h1>
              <motion.p variants={itemVariants} className="text-xl text-gray-500 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                The world&apos;s first career engine that syncs your <span className="text-indigo-600 font-bold">real-time emotions</span> with the scientific <span className="text-gray-900 font-bold">Big Five personality model</span>.
              </motion.p>
            </div>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 h-20">
              <AnimatePresence mode="wait">
                {!showInput ? (
                  <motion.div
                    key="cta-button"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Button
                      onClick={() => router.push('/Personality-career/interview')}
                      className="h-14 px-10 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 text-lg font-bold group"
                    >
                      Start Free Discovery
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="name-input"
                    onSubmit={handleStartDiscovery}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col sm:flex-row gap-3 w-full max-w-md"
                  >
                    <div className="relative flex-1">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        autoFocus
                        placeholder="Enter your name..."
                        value={name}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                        className="h-14 pl-12 pr-4 rounded-2xl border-2 border-indigo-100 bg-white/80 backdrop-blur-md shadow-inner text-lg focus:border-indigo-500 transition-all font-medium"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={name.trim().length < 2 || isStarting}
                      className="h-14 px-8 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 font-bold disabled:opacity-50"
                    >
                      {isStarting ? "Launching..." : "Go"}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>

            {/* <motion.div variants={itemVariants} className="flex items-center justify-center lg:justify-start gap-6 pt-2">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden shadow-sm">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Joined by 10k+ Seekers</p>
            </motion.div> */}
          </div>

          {/* Hero Visual */}
          <motion.div
            variants={itemVariants}
            className="relative hidden lg:block"
          >
            <div className="relative z-10 bg-white/40 backdrop-blur-2xl rounded-[40px] border border-white/50 p-8 shadow-2xl shadow-indigo-100 group">
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-amber-100 rounded-full blur-[50px] animate-pulse" />
              <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-indigo-100 rounded-full blur-[50px] animate-pulse" />

              {/* Mock UI Element */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-900 uppercase">Live Analysis</p>
                      <p className="text-[10px] text-indigo-500 font-bold">Scanning Micro-expressions...</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce dot-delay-${i}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="h-48 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent flex items-center justify-center">
                    <Brain className="w-16 h-16 text-indigo-100 animate-pulse" />
                  </div>
                  <p className="text-[10px] font-black text-gray-300 uppercase relative z-10">Real-time Visualization</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                    <p className="text-[10px] font-bold text-indigo-400 mb-1">Emotion</p>
                    <p className="text-lg font-black text-indigo-900">Surprised</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
                    <p className="text-[10px] font-bold text-amber-500 mb-1">Trait</p>
                    <p className="text-lg font-black text-amber-900">Openness</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Trait Section */}
      <section id="traits" className="py-24 px-6 md:px-12 bg-gray-50/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-xs font-bold text-indigo-500 uppercase tracking-[0.3em]">The Foundation</h2>
            <h3 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Scientifically Grounded.</h3>
            <p className="text-gray-500 max-w-2xl mx-auto font-medium">We combine high-resolution facial expression tracking with the Gold Standard of psychometrics.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Video, title: "Emotion AI", desc: "Our neural networks track 10+ facial micro-expressions to determine genuine confidence levels." },
              { icon: BarChart, title: "Big Five Traits", desc: "Scientific assessment of Openness, Conscientiousness, Extraversion, Agreeableness, and Emotional Composure." },
              { icon: Target, title: "Career Mapping", desc: "Proprietary database linking biological traits to 2,000+ modern professional roles." },
              { icon: Shield, title: "Deep Privacy", desc: "All biometric processing happens real-time. No video data ever touches our database." },
              { icon: Globe, title: "Market Alignment", desc: "Dynamic career paths adjusted for the AI era and the future of work." },
              { icon: ChevronRight, title: "Instant Report", desc: "Deep qualitative insights and growth paths delivered immediately after assessment." },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="p-8 rounded-[32px] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 font-bold shadow-inner">
                  <item.icon className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-black text-gray-900 mb-3">{item.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 border-t border-gray-100 text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm font-bold text-gray-400">© 2026 Antigravity Career Engine</p>
          <div className="flex gap-8 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Science</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">API</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
