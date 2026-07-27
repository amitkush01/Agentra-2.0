'use client';

import { motion } from 'framer-motion';

interface HeroProps {
  isDarkMode: boolean;
  isMobile: boolean;
  isHovering: boolean;
  setIsHovering: (value: boolean) => void;
  onGetStarted: () => void;
}

export default function Hero({ isDarkMode, isMobile, isHovering, setIsHovering, onGetStarted }: HeroProps) {
  const textClass = isDarkMode ? 'text-white' : 'text-orange-900';

  return (
    <section className="pt-24 md:pt-32 lg:pt-40 pb-16 flex flex-col lg:flex-row items-center max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
      {/* Left */}
      <div className="w-full lg:w-3/5 space-y-6 md:space-y-8 lg:space-y-10 text-center lg:text-left">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 border border-yellow-500/40 backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.2)]"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping"></span>
          <span className="text-yellow-400 font-bold text-xs sm:text-sm tracking-wide uppercase">
            ⚡ Next-Gen Autonomous AI Platform
          </span>
        </motion.div>

        <motion.h1 
          className={`text-4xl sm:text-5xl md:text-6xl lg:text-[68px] xl:text-[76px] font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent leading-tight drop-shadow-2xl`}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          Autonomous <span className="italic text-yellow-400">AI Agents</span> That Revolutionize Work
        </motion.h1>

        <motion.p 
          className={`text-lg sm:text-xl md:text-2xl font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} max-w-2xl`}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Deploy multi-agent 3D AI workforces for marketing, sales, support, and business operations — working 24/7 with interactive voice intelligence.
        </motion.p>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <motion.button
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-slate-950 font-black px-8 py-4 rounded-2xl shadow-[0_0_35px_rgba(245,158,11,0.4)] text-xl hover:shadow-[0_0_50px_rgba(245,158,11,0.6)] transition relative overflow-hidden group w-full sm:w-auto cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <span className="relative z-10">🚀 Launch AI Agent</span>
          </motion.button>

          <motion.a
            href="/profile"
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-800/80 border border-yellow-500/40 text-yellow-400 font-bold text-lg hover:bg-yellow-500/20 transition backdrop-blur-md w-full sm:w-auto shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>👤 User Panel</span>
          </motion.a>
        </div>
      </div>
      
      {/* Right: 3D Animated Agent Stage */}
      <div className="w-full lg:w-2/5 flex justify-center items-center mt-12 lg:mt-0 relative">
        <motion.div
          className={`w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] lg:w-[440px] lg:h-[440px] rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.3)] ${
            isDarkMode ? 'bg-slate-900/80 border-2 border-yellow-500/40' : 'bg-white/80 border-2 border-yellow-300'
          } backdrop-blur-2xl flex flex-col items-center justify-center relative overflow-hidden group`}
          initial={{ y: 30, opacity: 0, rotateY: -15 }}
          animate={{ y: 0, opacity: 1, rotateY: 0 }}
          transition={{ type: 'spring', stiffness: 80, damping: 12 }}
          whileHover={{ 
            scale: 1.04, 
            rotateY: 8,
            rotateX: 4
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Glowing 3D Orb Background */}
          <div className="absolute w-64 h-64 bg-gradient-to-tr from-yellow-500/30 via-orange-500/30 to-red-500/30 rounded-full blur-3xl animate-pulse pointer-events-none"></div>

          {/* 3D Agent Badge */}
          <motion.div 
            className="w-full h-full flex flex-col items-center justify-center relative z-10"
            animate={{ 
              y: [0, -12, 0],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 4, 
              repeatType: 'loop',
              ease: "easeInOut"
            }}
          >
            <span className="text-8xl lg:text-9xl drop-shadow-[0_10px_20px_rgba(245,158,11,0.5)]">
              🤖
            </span>
            
            <div className="mt-4 px-4 py-1.5 rounded-full bg-slate-950/80 border border-yellow-500/50 text-yellow-300 font-bold text-xs flex items-center gap-2 shadow-lg backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
              Maya 3D Voice Assistant Active
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}