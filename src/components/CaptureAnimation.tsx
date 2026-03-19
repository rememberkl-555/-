import React from 'react';
import { motion } from 'motion/react';
import { Circle } from 'lucide-react';

export const CaptureAnimation = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/80"
    >
      <motion.div
        animate={{
          rotate: [0, 15, -15, 15, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 1, repeat: 2 }}
        onAnimationComplete={onComplete}
      >
        <Circle className="w-24 h-24 text-red-500 fill-white" />
      </motion.div>
    </motion.div>
  );
};
