'use client';
// Animates children when the route changes. Uses motion (v12, the maintained
// fork of framer-motion). The pathname becomes the key so AnimatePresence
// detects new pages and runs exit → enter.
import { motion, AnimatePresence } from 'motion/react';
import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        // Keep the container behaving normally (full-height for chat, etc.)
        className="contents"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
