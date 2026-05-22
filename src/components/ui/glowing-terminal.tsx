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
  const glowRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    
    if (container && glowRef.current && cardRef.current) {
      // Mouse move effect for the glow
      const handleMouseMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        gsap.to(glowRef.current, {
          x: x,
          y: y,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
        });
      };

      const handleMouseLeave = () => {
        gsap.to(glowRef.current, {
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
        });
      };

      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);

      // Scroll animation for the terminal to pop out
      gsap.fromTo(
        cardRef.current,
        {
          y: 50,
          scale: 0.95,
          opacity: 0.8,
          rotateX: 10,
        },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          rotateX: 0,
          duration: 1.2,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
            end: "top 40%",
            scrub: 1,
          },
        }
      );

      return () => {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
        ScrollTrigger.getAll().forEach(t => t.kill());
      };
    }
  }, []);

  return (
    <div ref={containerRef} className="relative w-full mt-24 max-w-3xl mx-auto perspective-[1000px] overflow-hidden rounded-3xl p-[1px]">
      {/* Dynamic GSAP glow */}
      <div 
        ref={glowRef}
        className="pointer-events-none absolute -inset-px -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 opacity-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 blur-3xl rounded-full"
      />
      
      {/* Static blur fallback */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-black/5 to-transparent dark:from-white/10 opacity-30 blur-lg -z-20" />
      
      <div 
        ref={cardRef}
        className="relative rounded-2xl border border-[color:var(--border)] bg-black backdrop-blur-xl p-6 md:p-10 text-left shadow-2xl overflow-hidden"
      >
        <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <div className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
          <div className="text-xs text-neutral-500 flex items-center gap-2 font-mono">
            <TerminalSquare className="h-3.5 w-3.5" />
            terminal
          </div>
        </div>
        <div className="space-y-4">
          <div className="font-mono text-sm text-neutral-300 flex items-center justify-between group rounded-md p-1 -ml-1 transition-colors hover:bg-white/5">
            <div>
              <span className="text-neutral-500">$</span> {installSnippet}
            </div>
            <button 
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-white/10"
              title="Copy"
            >
              <CopyIcon onClick={() => navigator.clipboard.writeText(installSnippet)} />
            </button>
          </div>
          <div className="border-t border-white/5 pt-4">
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
    <Check className="h-3.5 w-3.5 text-green-400" />
  ) : (
    <Copy className="h-3.5 w-3.5 text-neutral-400" onClick={(e) => {
      e.stopPropagation();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onClick();
    }}/>
  );
}
