"use client";

import { motion } from "framer-motion";

export function AbstractHeroShapes() {
  return (
    <div className="relative w-full aspect-[4/3] max-w-[600px] mx-auto mt-8 lg:mt-0">
      {/* Top Left Glass Morphic piece - using a complex rounded shape with an abstract gradient */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
        className="absolute top-0 left-[5%] w-[55%] h-[65%] rounded-[40px] rounded-br-[120px] rounded-tl-[20px] overflow-hidden shadow-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(238,130,238,0.8) 0%, rgba(138,43,226,0.9) 100%)",
          boxShadow: "inset 0 0 50px rgba(255,255,255,0.3)"
        }}
      >
        <div className="absolute inset-0 bg-[#FF6B6B]/20 mix-blend-color-burn" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent,rgba(255,255,255,0.4),transparent)] -translate-x-[100%] animate-[shimmer_3s_infinite]" />
        
        {/* Faux 3d bubble layers */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/30 rounded-full blur-2xl" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-400/40 rounded-full blur-xl" />
      </motion.div>

      {/* Top Right Orange square */}
      <motion.div 
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
        className="absolute top-[5%] right-[5%] w-[32%] aspect-square rounded-[32px] bg-gradient-to-br from-[#FF9A9E] to-[#FF6B6B] shadow-xl p-4 flex items-center justify-center pointer-events-none"
      >
        <div className="w-full h-full border border-black/80 rounded-[20px] relative">
          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#111] rounded-full" />
          <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#111] rounded-full" />
        </div>
      </motion.div>

      {/* Bottom Left Purple/Blue shape */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
        className="absolute bottom-[5%] left-[5%] w-[65%] h-[28%] rounded-[40px] rounded-tr-[10px] bg-gradient-to-r from-[#D980FA] to-[#0652DD] shadow-2xl p-4"
      >
        <div className="w-full h-full border border-black/60 rounded-[24px] relative flex flex-col justify-between p-3">
          <div className="w-2.5 h-2.5 bg-[#111] rounded-full" />
          <div className="w-[80%] h-[1px] bg-black/60 self-end relative">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-[#111] rounded-full" />
          </div>
        </div>
      </motion.div>

      {/* Bottom Right Cream Circle */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
        className="absolute bottom-[5%] right-[10%] w-[18%] aspect-square rounded-full bg-[#EFEBE0] p-2.5 shadow-xl"
      >
        <div className="w-full h-full border border-black/80 rounded-full" />
      </motion.div>
    </div>
  );
}