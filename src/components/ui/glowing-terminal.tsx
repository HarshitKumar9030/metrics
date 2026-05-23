"use client";

import React, { useRef, useEffect } from "react";
import { TerminalSquare, Check, Copy } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CodeBlock } from "./code-block";

// Register ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface GlowingTerminalProps {
  installSnippet: string;
  sdkSnippet: string;
}

export function GlowingTerminal({ installSnippet, sdkSnippet }: GlowingTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    
    if (container && cardRef.current) {
      // Scroll animation for the terminal to pop out
      gsap.fromTo(
        cardRef.current,
        {
          y: 60,
          scale: 0.95,
          opacity: 0,
        },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          ease: "power3.out",
          duration: 1,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
          },
        }
      );

      return () => {
        ScrollTrigger.getAll().forEach(t => t.kill());
      };
    }
  }, []);

  return (
    <div ref={containerRef} className="relative w-full mt-24 max-w-4xl mx-auto overflow-hidden rounded-[24px] lg:rounded-[32px] p-px bg-linear-to-br from-white/10 via-white/5 to-transparent">
      
      <div 
        ref={cardRef}
        className="relative rounded-[23px] lg:rounded-[31px] bg-[#050505] p-6 sm:p-8 md:p-12 text-left w-full h-full shadow-[0_30px_60px_-15px_rgba(0,0,0,1)]"
      >
        <div className="mb-8 flex items-center justify-between">
          <div className="flex gap-2.5">
            <div className="h-3.5 w-3.5 rounded-full bg-[#FF5F56]" />
            <div className="h-3.5 w-3.5 rounded-full bg-[#FFBD2E]" />
            <div className="h-3.5 w-3.5 rounded-full bg-[#27C93F]" />
          </div>
          <div className="text-sm text-neutral-600 flex items-center gap-2 font-mono font-medium">
            <TerminalSquare className="h-4 w-4 opacity-70" />
            terminal
          </div>
        </div>
        <div className="space-y-8">
          <div className="font-mono text-sm md:text-[15px] text-[#e5e5e5] flex items-center justify-between group py-2 border-b border-white/[0.08] pb-8">
            <div className="flex items-center gap-4">
              <span className="text-neutral-500 font-bold">$</span> 
              <span>{installSnippet}</span>
            </div>
            <button 
              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-md hover:bg-white/10"
              title="Copy"
            >
              <CopyIcon onClick={() => navigator.clipboard.writeText(installSnippet)} />
            </button>
          </div>
          <div className="pt-2">
            <CodeBlock code={sdkSnippet} language="typescript" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CopyIcon({ onClick }: { onClick: () => void }) {
  const [copied, setCopied] = React.useState(false);
  return copied ? (
    <Check className="h-4 w-4 text-green-400" />
  ) : (
    <Copy className="h-4 w-4 text-neutral-500" onClick={(e) => {
      e.stopPropagation();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onClick();
    }}/>
  );
}
