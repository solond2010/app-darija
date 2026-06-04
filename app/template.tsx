"use client";

import { motion } from "framer-motion";

// Re-mounts on every route change, giving each page a soft enter animation.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
