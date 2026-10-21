import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface RouteTransitionProps {
  children: React.ReactNode;
}

export const RouteTransition: React.FC<RouteTransitionProps> = ({ children }) => {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReduced ? 0 : 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};
