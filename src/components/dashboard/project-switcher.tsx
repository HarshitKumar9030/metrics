"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function ProjectSwitcher({
  projects,
  selectedProjectId,
  days,
}: {
  projects: Array<{ id: string; name: string }>;
  selectedProjectId: string;
  days: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-8 w-[180px] items-center justify-between rounded-md border border-white/[0.08] bg-white/[0.02] px-3 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.04]"
      >
        <span className="truncate">{selectedProject?.name ?? "Select project..."}</span>
        <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 text-zinc-500" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 top-[calc(100%+4px)] z-50 w-full min-w-[180px] overflow-hidden rounded-md border border-white/[0.08] bg-[#111111]/90 shadow-xl backdrop-blur-xl"
          >
            <div className="p-1">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("project", project.id);
                    params.set("days", String(days));
                    router.push(`/dashboard?${params.toString()}`);
                    setIsOpen(false);
                  }}
                  className="flex w-full cursor-pointer items-center justify-between rounded-[4px] px-2 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.04] hover:text-zinc-100"
                >
                  <span className="truncate">{project.name}</span>
                  {selectedProjectId === project.id && (
                    <Check className="ml-2 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

