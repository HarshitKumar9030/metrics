"use client";

import { motion } from "framer-motion";
import { createContext, useContext, ReactNode } from "react";

const FadeInStaggerContext = createContext(false);

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  const isInStaggerGroup = useContext(FadeInStaggerContext);
  
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] } },
      }}
      initial={isInStaggerGroup ? undefined : "hidden"}
      animate={isInStaggerGroup ? undefined : "visible"}
      transition={isInStaggerGroup ? undefined : { delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeInStagger({ faster = false, className, children }: { faster?: boolean; className?: string; children: ReactNode }) {
  return (
    <FadeInStaggerContext.Provider value={true}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: faster ? 0.1 : 0.15,
            },
          },
        }}
        className={className}
      >
        {children}
      </motion.div>
    </FadeInStaggerContext.Provider>
  );
}
