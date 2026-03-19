import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { POKEMON_DB } from '../constants';
import { EntityState } from '../types';
import { Database } from 'lucide-react';

const STARTER_IDS = ['pikachu', 'charmander', 'squirtle', 'bulbasaur', 'gastly', 'dratini', 'machop', 'abra', 'geodude'];

export const StarterSelection = ({ onSelect }: { onSelect: (id: string) => void }) => {
  const starters = POKEMON_DB.filter(p => STARTER_IDS.includes(p.id));
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffledStarters, setShuffledStarters] = useState<EntityState[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<string | null>(null);

  useEffect(() => {
    // Initially show them in order
    setShuffledStarters(starters.slice(0, 9));

    const timer = setTimeout(() => {
      setIsFlipped(true);
      // Shuffle them after they flip so the player doesn't know which is which
      setTimeout(() => {
        setShuffledStarters([...starters.slice(0, 9)].sort(() => Math.random() - 0.5));
      }, 400); // Wait for flip animation to be halfway done
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  const handleSelect = (p: EntityState) => {
    if (!isFlipped || selected) return;
    setSelected(p.id);
    
    // Reveal the selected one
    setTimeout(() => {
      setRevealed(p.id);
      setTimeout(() => {
        onSelect(p.id);
      }, 1500);
    }, 500);
  };

  return (
    <div className="h-full w-full bg-[#05050a] flex flex-col items-center justify-center p-8 text-white overflow-hidden">
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-black italic mb-8 text-center tracking-tighter uppercase"
      >
        {isFlipped ? "选择一个神秘协议" : "正在初始化基础化身"}
        <span className="block text-sm font-mono mt-2 text-cyan-500/70 tracking-widest">
          {isFlipped ? "CHOOSE A PROTOCOL" : "INITIALIZING AVATARS"}
        </span>
      </motion.h2>

      <div className="grid grid-cols-3 gap-6">
        {shuffledStarters.map((p, i) => {
          const isThisRevealed = revealed === p.id;
          const isThisSelected = selected === p.id;
          const showFront = !isFlipped || isThisRevealed;
          
          return (
            <motion.div
              key={i} // Use index as key so React doesn't remount them when shuffled
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1, scale: isThisSelected ? 1.05 : 1 }}
              transition={{ delay: i * 0.1, type: 'spring' }}
              onClick={() => handleSelect(p)}
              className={`relative w-40 h-56 group ${!isFlipped || selected ? 'cursor-default' : 'cursor-pointer'}`}
              style={{ perspective: '1000px' }}
            >
              <motion.div
                animate={{ rotateY: showFront ? 0 : 180 }}
                transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
                className="w-full h-full relative"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front: The Pokemon */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-b from-cyan-900/40 to-black border-2 rounded-xl flex flex-col items-center justify-center p-4 ${isThisSelected ? 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)]' : 'border-cyan-500/50'}`}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 blur-xl opacity-30" style={{ backgroundColor: p.color }}></div>
                    <img src={p.img} alt={p.name} className="w-24 h-24 object-contain mb-2 relative z-10" referrerPolicy="no-referrer" />
                  </div>
                  <h3 className="text-sm font-black italic tracking-tighter text-center" style={{ color: p.color }}>{p.name.split(' ')[0]}</h3>
                  <div className="mt-2 flex gap-1 flex-wrap justify-center">
                    {p.types?.map(t => (
                      <span key={t} className="px-1.5 py-0.5 text-[8px] font-bold uppercase border border-white/20 rounded-full opacity-60">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Back: The Mystery Card */}
                <div 
                  className={`absolute inset-0 bg-black border-2 rounded-xl flex flex-col items-center justify-center p-4 ${isThisSelected ? 'border-pink-400 shadow-[0_0_20px_rgba(244,114,182,0.5)]' : 'border-pink-500/50 shadow-[0_0_20px_rgba(236,72,153,0.3)]'}`}
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <div className="w-16 h-16 rounded-full border-2 border-pink-500/30 flex items-center justify-center mb-4">
                    <Database className="w-8 h-8 text-pink-500 animate-pulse" />
                  </div>
                  <div className="text-pink-500 font-mono text-[10px] tracking-widest uppercase text-center">Mystery</div>
                  <div className="mt-1 text-[8px] text-pink-500/50 font-mono">ENCRYPTED</div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
