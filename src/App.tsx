/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Shield, Zap, Heart, Swords, RefreshCw, ChevronRight, 
  Skull, Activity, ZapOff, Database, Trash2, Play, Info, Flame,
  ShoppingCart, Coins, Search, HeartPulse, Star, Disc, Crosshair, ShieldCheck, Briefcase, X, Cpu,
  Snowflake, CheckCircle2, Circle, Gift, Package, Clock, Share2, ShieldAlert, Coffee, Lock, Layers, ArrowLeft, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { io, Socket } from 'socket.io-client';
import { StarterSelection } from './components/StarterSelection';
import { CaptureAnimation } from './components/CaptureAnimation';
import { SafeImage } from './components/SafeImage';
import { Card, EntityState, LogEntry, StatusEffect, Intent, IntentType, StatusType, Relic, MapNode, NodeType, CombatPiles, Consumable, Task, Phase, EndlessState, ShopUpgrade, PVPState } from './types';
import { 
  POKEMON_DB, INITIAL_DECKS, TERMINOLOGY, RELICS_DB, ENEMIES_DB, JUNK_CARD, 
  CONSUMABLES_DB, TASKS_DB, SHOP_UPGRADES_DB, CARDS_DB, COLLECTION_DB, 
  FALLBACK_IMG, CDNS, getPokemonImg 
} from './constants';

// --- Helpers ---
const shuffle = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const generateUUID = () => Math.random().toString(36).substring(2, 11);

// --- Components ---

const SpeechBubble = ({ text, side }: { text: string, side: 'left' | 'right' }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.5, y: 20 }}
    className={`absolute -top-24 ${side === 'left' ? 'left-1/2 -translate-x-1/2' : 'right-1/2 translate-x-1/2'} z-50 pointer-events-none`}
  >
    <div className="bg-white text-black px-4 py-2 rounded-2xl font-black text-sm shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-2 border-black relative whitespace-nowrap">
      {text}
      <div className={`absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-white`}></div>
    </div>
  </motion.div>
);

const StatusIcon = ({ effect }: { effect: StatusEffect, key?: any }) => {
  const icons: Record<StatusType, React.ReactNode> = {
    VULNERABLE: <Skull className="w-3 h-3 text-red-400" />,
    WEAK: <ZapOff className="w-3 h-3 text-yellow-400" />,
    POISON: <Activity className="w-3 h-3 text-green-400" />,
    STRENGTH: <Swords className="w-3 h-3 text-orange-400" />,
    DEXTERITY: <Shield className="w-3 h-3 text-blue-400" />,
    LOCKED: <Database className="w-3 h-3 text-gray-400" />,
    CHARGE: <Zap className="w-3 h-3 text-yellow-400 animate-pulse" />,
    OVERLOAD: <Flame className="w-3 h-3 text-orange-600" />,
    OVERWRITE: <RefreshCw className="w-3 h-3 text-cyan-400" />,
    BURN: <Flame className="w-3 h-3 text-red-600" />,
    FREEZE: <Snowflake className="w-3 h-3 text-blue-300" />,
    COMBO: <Zap className="w-3 h-3 text-yellow-500 animate-bounce" />,
  };

  const labels: Record<StatusType, string> = {
    VULNERABLE: '漏洞暴露 (1.5x 受伤)',
    WEAK: '算力降频 (0.75x 伤害)',
    POISON: '病毒感染 (每回合伤害)',
    STRENGTH: '系统强化 (+伤害)',
    DEXTERITY: '防御强化 (+屏障)',
    LOCKED: '数据锁定',
    CHARGE: '电荷储备 (3层时伤害翻倍)',
    OVERLOAD: '核心过载 (出牌受损)',
    OVERWRITE: '覆写模式',
    BURN: '系统过热 (每回合伤害)',
    FREEZE: '核心冻结 (行动受限)',
    COMBO: '连击点数 (增加伤害)',
  };

  return (
    <div className="flex items-center gap-0.5 bg-black/40 px-1 rounded border border-white/10 group relative">
      {icons[effect.type]}
      <span className="text-[10px] font-bold">{effect.value}</span>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 border border-white/20 rounded text-[8px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
        {labels[effect.type]}
      </div>
    </div>
  );
};

const IntentDisplay = ({ intent }: { intent?: Intent }) => {
  if (!intent) return null;
  const icons: Record<IntentType, React.ReactNode> = {
    ATTACK: <Swords className="w-6 h-6 text-red-500" />,
    DEFEND: <Shield className="w-6 h-6 text-blue-500" />,
    BUFF: <Zap className="w-6 h-6 text-yellow-500" />,
    DEBUFF: <Skull className="w-6 h-6 text-purple-500" />,
    UNKNOWN: <Info className="w-6 h-6 text-gray-500" />,
    CURSE: <Lock className="w-6 h-6 text-gray-700" />,
    STUN: <ZapOff className="w-6 h-6 text-yellow-600 animate-pulse" />,
  };

  return (
    <motion.div 
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute -top-20 left-1/2 -translate-x-1/2 flex flex-col items-center z-30"
    >
      <div className="relative group">
        <div className="absolute inset-0 bg-white/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500" />
        <div className="relative bg-black/60 backdrop-blur-md border border-white/20 p-2 rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center gap-2">
          {icons[intent.type]}
          {intent.value && (
            <span className="text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
              {intent.value}
            </span>
          )}
        </div>
      </div>
      <div className="mt-1 px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[8px] uppercase font-mono text-white/80 tracking-widest backdrop-blur-sm">
        {intent.desc}
      </div>
    </motion.div>
  );
};

const INTRO_FULL_LINES = [
  "> 警告：检测到未经授权的访问...",
  "> 防火墙在 7G 扇区被突破",
  "> 病毒特征：'POKEMON_GLITCH_V2'",
  "> 系统完整度下降：42%...",
  "> 正在启动 AI 反制措施...",
  "> 正在优化全球节点连接...",
  "> 正在加载神经模型：'AEGIS_PROTO'...",
  "> 正在生成战斗化身...",
  "> 任务：清除所有恶意数据。"
];

const IntroSequence = ({ onComplete, onCdnDetected }: { onComplete: () => void, onCdnDetected: (index: number) => void }) => {
  const [step, setStep] = useState(0);
  const [lines, setLines] = useState<string[]>([]);
  const [isCheckingNetwork, setIsCheckingNetwork] = useState(false);
  const hasCheckedNetwork = useRef(false);

  const detectBestCdn = async () => {
    if (hasCheckedNetwork.current) return;
    hasCheckedNetwork.current = true;
    
    setIsCheckingNetwork(true);
    setLines(prev => [...prev, "> 正在检测最佳图像节点 (Detecting best CDN)..."]);
    
    const testImage = '1.png'; // Bulbasaur
    const promises = CDNS.map(async (baseUrl, index) => {
      const start = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

      try {
        await fetch(`${baseUrl}${testImage}`, { mode: 'no-cors', signal: controller.signal });
        clearTimeout(timeoutId);
        return { index, latency: Date.now() - start };
      } catch (e) {
        clearTimeout(timeoutId);
        return { index, latency: Infinity };
      }
    });

    const results = await Promise.all(promises);
    const best = results.sort((a, b) => a.latency - b.latency)[0];
    
    if (best && best.latency !== Infinity) {
      onCdnDetected(best.index);
      setLines(prev => [...prev, `> 节点优化完成：已连接至节点 #${best.index} (延迟: ${best.latency}ms)`]);
    } else {
      onCdnDetected(0);
      setLines(prev => [...prev, "> 节点检测失败：使用默认节点。"]);
    }
    setIsCheckingNetwork(false);
  };

  useEffect(() => {
    if (isCheckingNetwork) return; // Pause progression while checking network

    if (step < INTRO_FULL_LINES.length) {
      const timer = setTimeout(() => {
        setLines(prev => [...prev, INTRO_FULL_LINES[step]]);
        setStep(s => s + 1);
        
        // Trigger network check at specific step
        if (step === 4 && !hasCheckedNetwork.current) {
          detectBestCdn();
        }
      }, 600);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => onComplete(), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, onComplete, isCheckingNetwork]);

  return (
    <div className="h-full w-full bg-black flex flex-col items-center justify-center p-8 font-mono overflow-hidden">
      <div className="w-full max-w-2xl border border-red-500/30 bg-red-950/10 p-6 rounded-lg shadow-[0_0_50px_rgba(239,68,68,0.1)] relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50 animate-pulse" />
        
        <div className="flex items-center gap-3 mb-6 border-b border-red-500/20 pb-4">
          <ShieldAlert className="w-6 h-6 text-red-500 animate-bounce" />
          <span className="text-red-500 font-black tracking-widest uppercase">系统入侵警告</span>
        </div>

        <div className="space-y-2 min-h-[240px]">
          <AnimatePresence>
            {lines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className={`${line.includes('ALERT') || line.includes('BREACHED') ? 'text-red-400' : 'text-cyan-400'} text-sm md:text-base`}
              >
                {line}
              </motion.div>
            ))}
          </AnimatePresence>
          {step < INTRO_FULL_LINES.length && (
            <motion.div
              animate={{ opacity: [0, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="w-2 h-5 bg-cyan-500 inline-block align-middle ml-1"
            />
          )}
        </div>

        {step >= 5 && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-8 flex justify-center"
          >
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 border-2 border-cyan-500 rounded-full animate-ping opacity-20" />
              <div className="absolute inset-0 border-2 border-cyan-500 rounded-full animate-spin [animation-duration:3s]" />
              <div className="absolute inset-4 border border-cyan-400/30 rounded-full animate-reverse-spin [animation-duration:5s]" />
              <Database className="absolute inset-0 m-auto w-12 h-12 text-cyan-400 animate-pulse" />
            </div>
          </motion.div>
        )}
      </div>

      <div className="mt-12 flex flex-col items-center">
        <p className="text-white/20 text-[10px] uppercase tracking-[0.5em] mb-4">Neural Link Establishing...</p>
        <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(step / INTRO_FULL_LINES.length) * 100}%` }}
            className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
          />
        </div>
      </div>

      {/* Matrix Rain Background Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="grid grid-cols-12 gap-4 h-full">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -1000 }}
              animate={{ y: 1000 }}
              transition={{ repeat: Infinity, duration: 2 + Math.random() * 3, ease: "linear", delay: Math.random() * 2 }}
              className="text-cyan-500 text-[8px] whitespace-nowrap writing-mode-vertical"
            >
              {Math.random().toString(2).substring(2, 20)}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Skip Button */}
      <div className="absolute bottom-8 right-8 flex gap-4 z-50">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 5 }}
          onClick={() => {
            if (window.confirm('确定要重置所有数据吗？这将清除你的所有进度、金币和解锁。')) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="px-4 py-2 border border-red-500/30 text-red-500/50 text-[10px] uppercase tracking-widest hover:text-red-400 hover:border-red-400 transition-all"
        >
          重置系统 (RESET SYSTEM)
        </motion.button>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          onClick={onComplete}
          className="px-4 py-2 border border-cyan-500/30 text-cyan-500/50 text-[10px] uppercase tracking-widest hover:text-cyan-400 hover:border-cyan-400 transition-all"
        >
          跳过初始化 (SKIP INTRO)
        </motion.button>
      </div>
    </div>
  );
};

export default function App() {
  // --- Game State ---
  const [phase, setPhase] = useState<Phase>(() => {
    try {
      return (localStorage.getItem('cyberpoke_phase') as Phase) || 'INTRO';
    } catch (e) {
      return 'INTRO';
    }
  });
  const [floor, setFloor] = useState(() => {
    try {
      return Number(localStorage.getItem('cyberpoke_floor')) || 1;
    } catch (e) {
      return 1;
    }
  });
  const [relics, setRelics] = useState<Relic[]>(() => {
    try {
      const saved = localStorage.getItem('cyberpoke_relics');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [gold, setGold] = useState(() => {
    try {
      return Number(localStorage.getItem('cyberpoke_gold')) || 100;
    } catch (e) {
      return 100;
    }
  });
  const [permanentDeck, setPermanentDeck] = useState<Card[]>(() => {
    try {
      const saved = localStorage.getItem('cyberpoke_deck');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [map, setMap] = useState<MapNode[]>(() => {
    try {
      const saved = localStorage.getItem('cyberpoke_map');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('cyberpoke_node');
    } catch (e) {
      return null;
    }
  });
  const [turn, setTurn] = useState<'PLAYER' | 'ENEMY'>('PLAYER');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [winner, setWinner] = useState<'PLAYER' | 'ENEMY' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isShaking, setIsShaking] = useState(0); 
  const [isGlitching, setIsGlitching] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<{id: string, text: string, color: string, x: number, y: number}[]>([]);
  const [activeVfx, setActiveVfx] = useState<{type: string, target: 'PLAYER' | 'ENEMY'} | null>(null);
  const [playerAnim, setPlayerAnim] = useState<'idle' | 'attack' | 'hit'>('idle');
  const [enemyAnim, setEnemyAnim] = useState<'idle' | 'attack' | 'hit'>('idle');
  const [shopCards, setShopCards] = useState<Card[]>(() => {
    try {
      const saved = localStorage.getItem('cyberpoke_shop_cards');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [shopPokemon, setShopPokemon] = useState<EntityState[]>(() => {
    try {
      const saved = localStorage.getItem('cyberpoke_shop_pokemon');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [shopRelics, setShopRelics] = useState<Relic[]>(() => {
    try {
      const saved = localStorage.getItem('cyberpoke_shop_relics');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [shopConsumables, setShopConsumables] = useState<Consumable[]>(() => {
    try {
      const saved = localStorage.getItem('cyberpoke_shop_consumables');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [inventory, setInventory] = useState<Consumable[]>(() => {
    try {
      const saved = localStorage.getItem('cyberpoke_inventory');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('cyberpoke_tasks');
      return saved ? JSON.parse(saved) : TASKS_DB;
    } catch (e) {
      return TASKS_DB;
    }
  });
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(() => {
    try {
      return localStorage.getItem('cyberpoke_last_checkin');
    } catch (e) {
      return null;
    }
  });
  const [showTasks, setShowTasks] = useState(false);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [showGacha, setShowGacha] = useState(false);
  const [gachaTickets, setGachaTickets] = useState(() => {
    try {
      return Number(localStorage.getItem('cyberpoke_tickets')) || 0;
    } catch (e) {
      return 0;
    }
  });
  const [gachaResult, setGachaResult] = useState<any>(null);
  const [isGachaSpinning, setIsGachaSpinning] = useState(false);
  const [diagnosticStep, setDiagnosticStep] = useState<'CHOICE' | 'REMOVE' | 'REPAIR'>('CHOICE');
  const [party, setParty] = useState<EntityState[]>(() => {
    try {
      const saved = localStorage.getItem('cyberpoke_party');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [activePokemonIndex, setActivePokemonIndex] = useState(() => {
    try {
      return Number(localStorage.getItem('cyberpoke_active_idx')) || 0;
    } catch (e) {
      return 0;
    }
  });
  const [rewards, setRewards] = useState<Card[]>([]);
  const [showBackpack, setShowBackpack] = useState(false);
  const [showPartySwitch, setShowPartySwitch] = useState(false);
  const [showEvolution, setShowEvolution] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [shopUpgrades, setShopUpgrades] = useState<ShopUpgrade[]>(() => {
    try {
      const saved = localStorage.getItem('cyberpoke_shop_upgrades');
      return saved ? JSON.parse(saved) : SHOP_UPGRADES_DB;
    } catch (e) {
      return SHOP_UPGRADES_DB;
    }
  });
  const [purchasedUpgrades, setPurchasedUpgrades] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cyberpoke_upgrades');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [unlockedPokemonIds, setUnlockedPokemonIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cyberpoke_unlocked');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [cdnIndex, setCdnIndex] = useState(() => {
    try {
      return Number(localStorage.getItem('cyberpoke_cdn_index')) || 0;
    } catch (e) {
      return 0;
    }
  });
  const [activeSkillName, setActiveSkillName] = useState<string | null>(null);

  const resetGame = () => {
    if (window.confirm('确定要重置所有数据吗？这将清除你的所有进度、金币和解锁。')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const addLog = (msg: string, type: 'system' | 'player' | 'enemy') => {
    setLogs(prev => [{ id: generateUUID(), msg, type }, ...prev].slice(0, 50));
  };

  // Endless Tower State
  const [endlessLineup, setEndlessLineup] = useState<{
    player: EntityState[];
    enemy: EntityState[];
    playerIdx: number;
    enemyIdx: number;
    wave: number;
  }>({
    player: [],
    enemy: [],
    playerIdx: 0,
    enemyIdx: 0,
    wave: 1
  });

  const [pvpState, setPvpState] = useState<PVPState | null>(null);
  const [isSearchingMatch, setIsSearchingMatch] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const updateTaskProgress = (type: Task['type'], amount: number) => {
    setTasks(prev => prev.map(t => {
      if (t.type === type && !t.isClaimed) {
        const newProgress = Math.min(t.target, t.progress + amount);
        return { ...t, progress: newProgress };
      }
      return t;
    }));
  };

  const handleCheckIn = () => {
    const today = new Date().toISOString().split('T')[0];
    if (lastCheckIn !== today) {
      setLastCheckIn(today);
      setGold(prev => prev + 50);
      addFloatingText('+50 签到奖励', '#facc15', 'PLAYER');
      updateTaskProgress('DAILY_LOGIN', 1);
    }
  };

  useEffect(() => {
    // Initialize socket
    socketRef.current = io();

    socketRef.current.on('match_found', ({ roomId, opponentId, opponentData, isFirst }) => {
      setPvpState({
        roomId,
        opponentId,
        opponentName: opponentData.name,
        opponentPokemon: opponentData.pokemon,
        opponentParty: opponentData.party || [opponentData.pokemon],
        opponentActiveIndex: opponentData.activeIndex || 0,
        opponentInventory: opponentData.inventory || [],
        isMyTurn: isFirst,
        turnNumber: 1,
        opponentHandCount: 5,
        opponentShield: 0,
        opponentHp: opponentData.pokemon.maxHp,
        opponentMaxHp: opponentData.pokemon.maxHp,
      });
      setIsSearchingMatch(false);
      setPhase('PVP_BATTLE');
      
      // Initialize PVP combat piles
      const deck = shuffle(permanentDeck.filter(c => c.isEquipped));
      setPiles({
        deck: deck.slice(5),
        hand: deck.slice(0, 5),
        discard: [],
      });
      
      // Sync initial state
      socketRef.current?.emit('join_room', roomId);
    });

    socketRef.current.on('opponent_action', (action: any) => {
      handleOpponentAction(action);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [permanentDeck]);

  const handleOpponentAction = async (action: any) => {
    switch (action.type) {
      case 'PLAY_CARD': {
        const card = action.card;
        
        setActiveSkillName(card.name);
        setTimeout(() => setActiveSkillName(null), 1500);
        
        setEnemyAnimation(card.type === 'ATTACK' ? 'attack' : 'skill');
        showDialogue('ENEMY', card.type === 'ATTACK' ? 'ATTACK' : 'SKILL');
        
        setActiveVfx({ 
          type: card.vfx || (card.type === 'ATTACK' ? 'physical' : 'buff'), 
          target: card.type === 'ATTACK' ? 'PLAYER' : 'ENEMY' 
        });

        if (card.type === 'ATTACK') {
          triggerShake(card.damage && card.damage > 10 ? 15 : 5);
          await new Promise(r => setTimeout(r, 120)); 
          if (card.cost >= 2) {
            setIsGlitching(true);
            setTimeout(() => setIsGlitching(false), 150);
          }
        }

        await new Promise(r => setTimeout(r, 400));
        setActiveVfx(null);

        // Apply effects to player (me)
        if (card.damage) {
          setPlayer(prev => {
            if (!prev) return null;
            const actualDamage = Math.max(0, card.damage - prev.shield);
            const newHp = Math.max(0, prev.hp - actualDamage);
            
            addFloatingText(`-${actualDamage}`, '#ef4444', 'PLAYER');
            setPlayerAnimation('hit');
            showDialogue('PLAYER', 'HIT');
            setTimeout(() => setPlayerAnimation('idle'), 500);

            if (newHp <= 0 && pvpState) {
              setWinner('ENEMY');
              setPhase('GAMEOVER');
              socketRef.current?.emit('game_action', {
                roomId: pvpState.roomId,
                action: { type: 'GAME_OVER', winner: 'PLAYER' }
              });
            }
            return {
              ...prev,
              hp: newHp,
              shield: Math.max(0, prev.shield - card.damage),
            };
          });
        }

        if (card.shield) {
          addFloatingText(`+${card.shield} 屏障`, '#60a5fa', 'ENEMY');
        }

        if (card.statusEffect) {
          setPlayer(prev => {
            if (!prev) return null;
            const statusEffects = prev.statusEffects || [];
            const existing = statusEffects.find(s => s.type === card.statusEffect!.type);
            const newStatusEffects = existing
              ? statusEffects.map(s => s.type === card.statusEffect!.type ? { ...s, value: s.value + card.statusEffect!.value } : s)
              : [...statusEffects, card.statusEffect!];
            
            addFloatingText(card.statusEffect!.type, '#c084fc', 'PLAYER');
            return { ...prev, statusEffects: newStatusEffects };
          });
        }

        if (card.selfStatusEffect) {
          setPvpState(prev => {
            if (!prev) return null;
            const statusEffects = prev.opponentPokemon.statusEffects || [];
            const existing = statusEffects.find(s => s.type === card.selfStatusEffect!.type);
            const newStatusEffects = existing
              ? statusEffects.map(s => s.type === card.selfStatusEffect!.type ? { ...s, value: s.value + card.selfStatusEffect!.value } : s)
              : [...statusEffects, card.selfStatusEffect!];
            
            addFloatingText(card.selfStatusEffect!.type, '#facc15', 'ENEMY');
            return {
              ...prev,
              opponentPokemon: {
                ...prev.opponentPokemon,
                statusEffects: newStatusEffects
              }
            };
          });
        }

        if (card.heal) {
          addFloatingText(`+${card.heal} HP`, '#4ade80', 'ENEMY');
        }

        // Update opponent state
        setPvpState(prev => prev ? {
          ...prev,
          opponentHandCount: prev.opponentHandCount - 1 + (card.draw || 0),
          opponentShield: prev.opponentShield + (card.shield || 0),
          opponentHp: Math.min(prev.opponentMaxHp, prev.opponentHp + (card.heal || 0)),
        } : null);
        
        addLog(`${pvpState?.opponentName} 使用了 ${card.name}`, 'enemy');
        break;
      }
      case 'USE_ITEM': {
        const item = action.item;
        addLog(`${pvpState?.opponentName} 使用了道具: ${item.name}`, 'enemy');
        addFloatingText(`${item.name}`, '#facc15', 'ENEMY');
        
        setPvpState(prev => {
          if (!prev) return null;
          let newHp = prev.opponentHp;
          let newMaxHp = prev.opponentMaxHp;
          let newShield = prev.opponentShield;
          let newStatusEffects = [...(prev.opponentPokemon.statusEffects || [])];

          if (item.type === 'HEAL') {
            newHp = Math.min(newMaxHp, newHp + item.value);
          } else if (item.type === 'STATUS') {
            if (item.id === 'guard_spec') {
              newShield += item.value;
            } else if (item.statusType) {
              newStatusEffects.push({ type: item.statusType, value: item.value });
            }
          }

          return {
            ...prev,
            opponentHp: newHp,
            opponentMaxHp: newMaxHp,
            opponentShield: newShield,
            opponentPokemon: {
              ...prev.opponentPokemon,
              hp: newHp,
              maxHp: newMaxHp,
              shield: newShield,
              statusEffects: newStatusEffects
            }
          };
        });
        break;
      }
      case 'SWITCH_POKEMON': {
        const index = action.index;
        const newPokemon = pvpState?.opponentParty?.[index];
        if (newPokemon) {
          addLog(`${pvpState?.opponentName} 切换了宝可梦: ${newPokemon.name}`, 'enemy');
          addFloatingText(`切换至 ${newPokemon.name}`, newPokemon.color, 'ENEMY');
          
          setPvpState(prev => {
            if (!prev) return null;
            return {
              ...prev,
              opponentActiveIndex: index,
              opponentPokemon: newPokemon,
              opponentHp: newPokemon.hp,
              opponentMaxHp: newPokemon.maxHp,
              opponentShield: newPokemon.shield || 0
            };
          });
        }
        break;
      }
      case 'END_TURN':
        setPvpState(prev => prev ? { ...prev, isMyTurn: true, turnNumber: prev.turnNumber + 1 } : null);
        startMyPVPTurn();
        break;
      case 'UPDATE_STATE':
        setPvpState(prev => prev ? { ...prev, ...action.state } : null);
        break;
      case 'GAME_OVER':
        if (action.winner === 'PLAYER') {
          setWinner('ENEMY');
          setPhase('GAMEOVER');
        } else {
          setWinner('PLAYER');
          setPhase('VICTORY');
        }
        break;
    }
  };

  const startMyPVPTurn = () => {
    setPlayer(prev => prev ? { ...prev, energy: prev.maxEnergy, shield: 0 } : null);
    
    setPiles(prev => {
      // Discard current hand
      const newDiscard = [...prev.discard, ...prev.hand];
      let newDeck = [...prev.deck];
      let newHand: Card[] = [];

      // Draw 5 cards
      for (let i = 0; i < 5; i++) {
        if (newDeck.length === 0) {
          if (newDiscard.length === 0) break;
          newDeck = shuffle(newDiscard);
          newDiscard.length = 0;
        }
        if (newDeck.length > 0) {
          newHand.push(newDeck.pop()!);
        }
      }

      return { hand: newHand, deck: newDeck, discard: newDiscard };
    });
    
    addLog("你的回合开始", 'system');
  };

  const joinPVPLobby = () => {
    setPhase('PVP_LOBBY');
    setIsSearchingMatch(true);
    socketRef.current?.emit('join_queue', {
      name: 'Player', // In a real app, this would be the user's name
      pokemon: player,
      party: party,
      inventory: inventory,
      activeIndex: activePokemonIndex
    });
  };

  const leavePVPLobby = () => {
    setIsSearchingMatch(false);
    socketRef.current?.emit('leave_queue');
    setPhase('HUB');
  };

  const startAiBattle = () => {
    if (!player) return;
    const randomOpponent = POKEMON_DB[Math.floor(Math.random() * POKEMON_DB.length)];
    const initialPvpState: PVPState = {
      roomId: 'ai-room',
      opponentId: 'ai-bot',
      opponentName: '虚拟AI对手',
      opponentPokemon: {
        ...randomOpponent,
        hp: randomOpponent.maxHp,
        maxHp: randomOpponent.maxHp,
        shield: 0,
        energy: randomOpponent.maxEnergy,
        maxEnergy: randomOpponent.maxEnergy,
        statusEffects: [],
        level: 50,
        xp: 0,
        nextXp: 100
      },
      isMyTurn: true,
      turnNumber: 1,
      opponentHandCount: 5,
      opponentShield: 0,
      opponentHp: randomOpponent.maxHp,
      opponentMaxHp: randomOpponent.maxHp,
      opponentParty: [{
        ...randomOpponent,
        hp: randomOpponent.maxHp,
        maxHp: randomOpponent.maxHp,
        shield: 0,
        energy: randomOpponent.maxEnergy,
        maxEnergy: randomOpponent.maxEnergy,
        statusEffects: [],
        level: 50,
        xp: 0,
        nextXp: 100
      }],
      opponentActiveIndex: 0,
      opponentInventory: [],
      isAiOpponent: true
    };

    setPvpState(initialPvpState);
    setPhase('PVP_BATTLE');
    
    // Initialize piles
    const deck = shuffle(permanentDeck.filter(c => c.isEquipped));
    setPiles({
      deck: deck.slice(5),
      hand: deck.slice(0, 5),
      discard: [],
    });
    addLog("练习赛开始 (VS AI)", 'system');
  };

  useEffect(() => {
    if (phase === 'PVP_BATTLE' && pvpState?.isAiOpponent && !pvpState.isMyTurn) {
      const aiThink = async () => {
        await new Promise(r => setTimeout(r, 1500));
        
        // AI plays a card
        const aiCards = INITIAL_DECKS[pvpState.opponentPokemon.id] || INITIAL_DECKS['default'];
        const randomCard = aiCards[Math.floor(Math.random() * aiCards.length)];
        
        setActiveSkillName(randomCard.name);
        setTimeout(() => setActiveSkillName(null), 1500);

        setEnemyAnimation(randomCard.type === 'ATTACK' ? 'attack' : 'skill');
        showDialogue('ENEMY', randomCard.type === 'ATTACK' ? 'ATTACK' : 'SKILL');

        setActiveVfx({ type: randomCard.vfx || (randomCard.type === 'ATTACK' ? 'physical' : 'buff'), target: randomCard.type === 'ATTACK' ? 'PLAYER' : 'ENEMY' });

        if (randomCard.type === 'ATTACK') {
          triggerShake(randomCard.damage && randomCard.damage > 10 ? 15 : 5);
          await new Promise(r => setTimeout(r, 120)); 
          if (randomCard.cost >= 2) {
            setIsGlitching(true);
            setTimeout(() => setIsGlitching(false), 150);
          }
        }

        await new Promise(r => setTimeout(r, 400));
        setActiveVfx(null);

        if (randomCard.damage) {
          setPlayer(prev => {
            if (!prev) return null;
            const actualDamage = Math.max(0, randomCard.damage! - prev.shield);
            const newHp = Math.max(0, prev.hp - actualDamage);
            
            addFloatingText(`-${actualDamage}`, '#ef4444', 'PLAYER');
            setPlayerAnimation('hit');
            showDialogue('PLAYER', 'HIT');
            setTimeout(() => setPlayerAnimation('idle'), 500);

            if (newHp <= 0) {
              setWinner('ENEMY');
              setPhase('GAMEOVER');
            }
            return { ...prev, hp: newHp, shield: Math.max(0, prev.shield - randomCard.damage!) };
          });
        }
        
        if (randomCard.shield) {
          setPvpState(prev => prev ? { ...prev, opponentShield: prev.opponentShield + randomCard.shield! } : null);
          addFloatingText(`+${randomCard.shield} 屏障`, '#60a5fa', 'ENEMY');
        }

        if (randomCard.heal) {
          setPvpState(prev => prev ? { ...prev, opponentHp: Math.min(prev.opponentMaxHp, prev.opponentHp + randomCard.heal!) } : null);
          addFloatingText(`+${randomCard.heal} HP`, '#4ade80', 'ENEMY');
        }

        if (randomCard.statusEffect) {
          setPlayer(prev => {
            if (!prev) return null;
            const statusEffects = prev.statusEffects || [];
            const existing = statusEffects.find(s => s.type === randomCard.statusEffect!.type);
            const newStatusEffects = existing
              ? statusEffects.map(s => s.type === randomCard.statusEffect!.type ? { ...s, value: s.value + randomCard.statusEffect!.value } : s)
              : [...statusEffects, randomCard.statusEffect!];
            
            addFloatingText(randomCard.statusEffect!.type, '#c084fc', 'PLAYER');
            return { ...prev, statusEffects: newStatusEffects };
          });
        }

        if (randomCard.selfStatusEffect) {
          setPvpState(prev => {
            if (!prev) return null;
            const statusEffects = prev.opponentPokemon.statusEffects || [];
            const existing = statusEffects.find(s => s.type === randomCard.selfStatusEffect!.type);
            const newStatusEffects = existing
              ? statusEffects.map(s => s.type === randomCard.selfStatusEffect!.type ? { ...s, value: s.value + randomCard.selfStatusEffect!.value } : s)
              : [...statusEffects, randomCard.selfStatusEffect!];
            
            addFloatingText(randomCard.selfStatusEffect!.type, '#facc15', 'ENEMY');
            return {
              ...prev,
              opponentPokemon: {
                ...prev.opponentPokemon,
                statusEffects: newStatusEffects
              }
            };
          });
        }

        addLog(`虚拟AI对手 使用了 ${randomCard.name}`, 'enemy');
        
        await new Promise(r => setTimeout(r, 1000));
        setPvpState(prev => prev ? { ...prev, isMyTurn: true, turnNumber: prev.turnNumber + 1 } : null);
        startMyPVPTurn();
      };
      aiThink();
    }
  }, [phase, pvpState?.isMyTurn, pvpState?.isAiOpponent]);

  const claimTaskReward = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.progress >= task.target && !task.isClaimed) {
      setGold(prev => prev + task.reward);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isClaimed: true } : t));
      addFloatingText(`+${task.reward} 任务奖励`, '#facc15', 'PLAYER');
    }
  };

  const handleEvolve = (pokemonIndex: number) => {
    const p = party[pokemonIndex];
    if (!p || !p.evolutionLevel || !p.evolvesTo) return;
    if (p.level < p.evolutionLevel) {
      addFloatingText(`等级不足 (需要 Lv.${p.evolutionLevel})`, '#ef4444', 'PLAYER');
      return;
    }

    const nextForm = POKEMON_DB.find(dbP => dbP.id === p.evolvesTo);
    if (!nextForm) return;

    setParty(prev => {
      const newParty = [...prev];
      newParty[pokemonIndex] = {
        ...p,
        ...nextForm,
        hp: nextForm.maxHp,
        maxHp: nextForm.maxHp,
        maxEnergy: nextForm.maxEnergy,
      };
      return newParty;
    });
    
    setUnlockedPokemonIds(prev => prev.includes(nextForm.id) ? prev : [...prev, nextForm.id]);

    // Add Ultimate Card
    const ultimateCard: Card = {
      id: `ult_${p.id}`,
      uid: generateUUID(),
      name: `${nextForm.name.split(' ')[0]} 终极协议`,
      type: 'ATTACK',
      rarity: 'RARE',
      cost: 3,
      damage: 50,
      desc: `造成 50 点伤害。消耗。`,
      vfx: 'explosion',
      isExhaust: true,
    };
    setPermanentDeck(prev => [...prev, ultimateCard]);

    addFloatingText(`${p.name} 进化为 ${nextForm.name}!`, '#facc15', 'PLAYER');
    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), 1000);
    setShowEvolution(false);
  };

  const refreshShop = () => {
    const baseRefreshCost = 50;
    const hasDataMiner = purchasedUpgrades.includes('data_miner');
    const cost = hasDataMiner ? Math.floor(baseRefreshCost / 2) : baseRefreshCost;

    if (gold < cost) {
      addFloatingText(`信用点不足 (${cost})`, '#ef4444', 'PLAYER');
      return;
    }

    setGold(prev => prev - cost);
    
    // Refresh Cards
    const allCards = CARDS_DB;
    const randomCards = shuffle(allCards).slice(0, 3).map(c => {
      let basePrice = 50;
      if (c.rarity === 'UNCOMMON') basePrice = 100;
      if (c.rarity === 'RARE') basePrice = 180;
      if (c.rarity === 'STARTER') basePrice = 30;
      
      return { 
        ...c, 
        uid: generateUUID(),
        price: basePrice + Math.floor(Math.random() * 20)
      };
    });
    setShopCards(randomCards as any);

    // Refresh Relics
    const unownedRelics = RELICS_DB.filter(r => !relics.find(pr => pr.id === r.id));
    const randomRelics = shuffle(unownedRelics).slice(0, 2);
    setShopRelics(randomRelics);

    // Refresh Consumables
    const randomConsumables = shuffle(CONSUMABLES_DB).slice(0, 4);
    setShopConsumables(randomConsumables);

    // Refresh Pokemon
    const unownedPokemon = POKEMON_DB.filter(p => !unlockedPokemonIds.includes(p.id) && !p.isBoss && !p.isElite);
    const randomPokemon = shuffle(unownedPokemon).slice(0, 2).map(p => ({
      ...p,
      hp: p.maxHp,
      energy: p.maxEnergy,
      statusEffects: [],
      level: p.level || 1,
      xp: p.xp || 0,
      nextXp: p.nextXp || 100,
      price: p.rarity === 'LEGENDARY' ? 1000 : p.rarity === 'EPIC' ? 500 : p.rarity === 'RARE' ? 250 : 150
    }));
    setShopPokemon(randomPokemon as EntityState[]);

    // Refresh Upgrades
    const upgradesPool = shuffle(SHOP_UPGRADES_DB).filter(u => !purchasedUpgrades.includes(u.id)).slice(0, 2);
    setShopUpgrades(upgradesPool);

    addFloatingText('商店已刷新', '#10b981', 'PLAYER');
  };

  const gainXp = (amount: number) => {
    setParty(prev => prev.map((p, i) => {
      if (i === activePokemonIndex) {
        let newXp = p.xp + amount;
        let newLevel = p.level;
        let newMaxHp = p.maxHp;
        let newMaxEnergy = p.maxEnergy;
        let newNextXp = p.nextXp;

        while (newXp >= newNextXp) {
          newXp -= newNextXp;
          newLevel++;
          newMaxHp += 10;
          if (newLevel % 5 === 0) newMaxEnergy += 1;
          newNextXp = Math.floor(newNextXp * 1.2);
          addFloatingText(`LEVEL UP! LVL ${newLevel}`, '#facc15', 'PLAYER');
        }

        const updated = { ...p, xp: newXp, level: newLevel, maxHp: newMaxHp, maxEnergy: newMaxEnergy, nextXp: newNextXp };
        if (i === activePokemonIndex) setPlayer(updated);
        return updated;
      }
      return p;
    }));
  };

  const handleDiagnostic = (type: 'REMOVE' | 'REPAIR') => {
    if (type === 'REMOVE') {
      if (gold < 75) {
        addFloatingText('信用点不足 (75)', '#ef4444', 'PLAYER');
        return;
      }
      setDiagnosticStep('REMOVE');
    } else {
      if (gold < 50) {
        addFloatingText('信用点不足 (50)', '#ef4444', 'PLAYER');
        return;
      }
      setGold(prev => prev - 50);
      setPlayer(p => p ? { ...p, hp: p.maxHp } : null);
      setParty(prev => prev.map((p, i) => i === activePokemonIndex ? { ...p, hp: p.maxHp } : p));
      addFloatingText('系统完全修复', '#4ade80', 'PLAYER');
      setShowDiagnostic(false);
    }
  };

  const useConsumable = (consumable: Consumable, index: number) => {
    if (phase !== 'BATTLE' && phase !== 'MAP' && phase !== 'HUB' && phase !== 'PVP_BATTLE') return;
    
    setInventory(prev => prev.filter((_, i) => i !== index));

    if (phase === 'PVP_BATTLE' && pvpState?.isMyTurn) {
      socketRef.current?.emit('game_action', {
        roomId: pvpState.roomId,
        action: { type: 'USE_ITEM', item: consumable }
      });
    }
    
    switch (consumable.type) {
      case 'HEAL':
        setPlayer(p => {
          if (!p) return null;
          const healAmount = consumable.value === 999 ? p.maxHp - p.hp : Math.min(p.maxHp - p.hp, consumable.value);
          addFloatingText(`+${healAmount} 修复`, '#4ade80', 'PLAYER');
          return { ...p, hp: p.hp + healAmount };
        });
        break;
      case 'ENERGY':
        setPlayer(p => p ? { ...p, energy: Math.min(p.maxEnergy, p.energy + consumable.value) } : null);
        addFloatingText(`+${consumable.value} 核心`, '#06b6d4', 'PLAYER');
        break;
      case 'DRAW':
        if (phase === 'BATTLE') {
          drawCards(consumable.value);
          addFloatingText(`+${consumable.value} 协议`, '#3b82f6', 'PLAYER');
        }
        break;
      case 'STATUS':
        if (consumable.id === 'full_heal') {
          setPlayer(p => p ? { ...p, statusEffects: [] } : null);
          addFloatingText('系统清理', '#ffffff', 'PLAYER');
        } else if (consumable.id === 'x_attack' || (consumable.statusType === 'STRENGTH')) {
          setPlayer(p => p ? { ...p, statusEffects: [...p.statusEffects, { type: 'STRENGTH', value: consumable.value }] } : null);
          addFloatingText(`+${consumable.value} 力量`, '#f97316', 'PLAYER');
        } else if (consumable.id === 'x_defense' || (consumable.statusType === 'DEXTERITY')) {
          setPlayer(p => p ? { ...p, statusEffects: [...p.statusEffects, { type: 'DEXTERITY', value: consumable.value }] } : null);
          addFloatingText(`+${consumable.value} 敏捷`, '#3b82f6', 'PLAYER');
        } else if (consumable.id === 'x_accuracy' || (consumable.statusType === 'CHARGE')) {
          setPlayer(p => p ? { ...p, statusEffects: [...p.statusEffects, { type: 'CHARGE', value: consumable.value }] } : null);
          addFloatingText(`+${consumable.value} 电荷`, '#facc15', 'PLAYER');
        } else if (consumable.id === 'guard_spec') {
          setPlayer(p => p ? { ...p, shield: p.shield + consumable.value } : null);
          addFloatingText(`+${consumable.value} 屏障`, '#94a3b8', 'PLAYER');
        } else if (consumable.id === 'rare_candy') {
          setPlayer(p => p ? { ...p, maxHp: p.maxHp + 20, hp: p.hp + 20 } : null);
          setParty(prev => prev.map((p, i) => i === activePokemonIndex ? { ...p, maxHp: p.maxHp + 20, hp: p.hp + 20 } : p));
          addFloatingText('等级提升 (LVL UP)', '#facc15', 'PLAYER');
        } else if (consumable.id === 'protein') {
          setPlayer(p => p ? { ...p, maxHp: p.maxHp + 2, hp: p.hp + 2 } : null);
          setParty(prev => prev.map((p, i) => i === activePokemonIndex ? { ...p, maxHp: p.maxHp + 2, hp: p.hp + 2 } : p));
          addFloatingText('永久强化 (MAX HP+2)', '#4ade80', 'PLAYER');
        } else if (['poke_ball', 'great_ball', 'ultra_ball', 'master_ball'].includes(consumable.id)) {
          if (phase === 'BATTLE' && enemy) {
            setIsCapturing(true);
            addFloatingText('正在捕获...', '#facc15', 'ENEMY');
            setTimeout(() => {
              let bonus = 30; // Increased base bonus
              if (consumable.id === 'great_ball') bonus += 30;
              if (consumable.id === 'ultra_ball') bonus += 50;
              const captureChance = consumable.id === 'master_ball' ? 100 : ((1 - (enemy.hp / enemy.maxHp)) * 100) + bonus;
              const roll = Math.random() * 100;
              if (roll < captureChance && !enemy.isBoss) {
                addFloatingText('捕获成功! (CAPTURED)', '#4ade80', 'ENEMY');
                const newPokemon: EntityState = {
                  ...enemy,
                  hp: Math.floor(enemy.maxHp * 0.5),
                  maxHp: enemy.maxHp,
                  shield: 0,
                  energy: 3,
                  maxEnergy: 3,
                  statusEffects: [],
                  level: enemy.level || 1,
                  xp: enemy.xp || 0,
                  nextXp: enemy.nextXp || 100,
                };
                setParty(prev => [...prev, newPokemon]);
                setUnlockedPokemonIds(prev => [...prev, enemy.id]);
                const starterCards = INITIAL_DECKS[enemy.id] || INITIAL_DECKS['default'];
                const newCards = starterCards.map(c => ({ ...c, uid: generateUUID(), isEquipped: true } as Card));
                setPermanentDeck(prev => [...prev, ...newCards]);
                setEnemy(e => e ? { ...e, hp: 0 } : null);
              } else {
                addFloatingText('捕获失败 (FAILED)', '#ef4444', 'ENEMY');
              }
              setIsCapturing(false);
            }, 3000);
          }
        } else if (consumable.id === 'revive' || consumable.id === 'max_revive') {
          const healPercent = consumable.id === 'max_revive' ? 1 : 0.5;
          setParty(prev => prev.map(p => p.hp <= 0 ? { ...p, hp: Math.floor(p.maxHp * healPercent) } : p));
          addFloatingText('系统重启 (REVIVED)', '#facc15', 'PLAYER');
        } else if (consumable.id === 'dire_hit') {
          setPlayer(p => p ? { ...p, statusEffects: [...p.statusEffects, { type: 'STRENGTH', value: 5 }] } : null);
          addFloatingText('暴击指令 (CRIT)', '#ef4444', 'PLAYER');
        } else if (consumable.id === 'iron') {
          setPlayer(p => p ? { ...p, shield: p.shield + 20 } : null);
          addFloatingText('物理加固 (IRON)', '#94a3b8', 'PLAYER');
        }
        break;
    }
  };

  const switchPokemon = (index: number) => {
    if (index === activePokemonIndex || !party[index]) return;
    if ((phase === 'BATTLE' || phase === 'PVP_BATTLE') && (turn !== 'PLAYER' && !pvpState?.isMyTurn)) return;
    if (isAnimating) return;
    
    if (phase === 'PVP_BATTLE' && pvpState?.isMyTurn) {
      if (player!.energy < 1) {
        addFloatingText('算力核心不足', '#ef4444', 'PLAYER');
        return;
      }
      socketRef.current?.emit('game_action', {
        roomId: pvpState.roomId,
        action: { type: 'SWITCH_POKEMON', index }
      });
    }

    if (player!.energy < 1 && phase !== 'HUB' && phase !== 'MAP') {
      addFloatingText('算力核心不足', '#ef4444', 'PLAYER');
      return;
    }

    // Save current state to party
    const updatedParty = [...party];
    updatedParty[activePokemonIndex] = { ...player! };
    
    // Switch to new pokemon
    const nextPokemon = updatedParty[index];
    setPlayer({ ...nextPokemon, energy: phase === 'HUB' || phase === 'MAP' ? nextPokemon.maxEnergy : player!.energy - 1 }); // Switching costs 1 energy
    setParty(updatedParty);
    setActivePokemonIndex(index);
    addFloatingText(`切换至 ${nextPokemon.name}`, nextPokemon.color, 'PLAYER');
    if (phase === 'BATTLE' || phase === 'PVP_BATTLE') {
      showDialogue('PLAYER', 'START');
    }
    setShowPartySwitch(false);
  };
  const [enemyAnimation, setEnemyAnimation] = useState<'idle' | 'attack' | 'hit' | 'skill'>('idle');
  const [playerAnimation, setPlayerAnimation] = useState<'idle' | 'attack' | 'hit' | 'skill'>('idle');
  const [playerDialogue, setPlayerDialogue] = useState<string | null>(null);
  const [enemyDialogue, setEnemyDialogue] = useState<string | null>(null);

  // --- Dialogue Sets ---
  const PLAYER_DIALOGUES = {
    ATTACK: ["接招吧！", "看我的厉害！", "数据重构！", "全功率输出！"],
    SKILL: ["协议加载，启动！", "系统超频，准备反击！", "正在分析你的漏洞..."],
    HIT: ["啧，大意了...", "防御系统报警！", "还没完呢！"],
    WIN: ["战斗结束，系统清理完毕。", "这就是我的实力！", "任务达成，返回。"],
    START: ["检测到敌对程序，开始清除。", "系统已就绪，准备战斗。", "防火墙已开启，来吧！"],
  };

  const ENEMY_DIALOGUES = {
    ATTACK: ["消失吧，入侵者！", "锁定目标，执行清除。", "你的数据到此为止了。"],
    SKILL: ["正在扫描你的弱点...", "防火墙强化中。", "逻辑陷阱已布下。"],
    HIT: ["核心受损... 正在重启...", "检测到高能攻击！", "这不可能..."],
    WIN: ["目标已清除，系统恢复平静。", "弱小的程序。", "清除完毕。"],
    START: ["发现非法访问，立即拦截！", "警告：检测到未授权操作。", "正在初始化清除程序..."],
  };

  const showDialogue = (target: 'PLAYER' | 'ENEMY', type: 'ATTACK' | 'SKILL' | 'HIT' | 'WIN' | 'START') => {
    const setDialogue = target === 'PLAYER' ? setPlayerDialogue : setEnemyDialogue;
    const dialogues = target === 'PLAYER' ? PLAYER_DIALOGUES[type] : ENEMY_DIALOGUES[type];
    const text = dialogues[Math.floor(Math.random() * dialogues.length)];
    setDialogue(text);
    setTimeout(() => setDialogue(null), 2500);
  };

  // --- Deck & Piles ---
  const [piles, setPiles] = useState<CombatPiles>(() => {
    const saved = localStorage.getItem('cyberpoke_piles');
    return saved ? JSON.parse(saved) : { hand: [], deck: [], discard: [] };
  });

  const hand = piles.hand;
  const deck = piles.deck;
  const discard = piles.discard;

  const setHand = (newHand: Card[] | ((prev: Card[]) => Card[])) => {
    setPiles(prev => ({ ...prev, hand: typeof newHand === 'function' ? newHand(prev.hand) : newHand }));
  };
  const setDeck = (newDeck: Card[] | ((prev: Card[]) => Card[])) => {
    setPiles(prev => ({ ...prev, deck: typeof newDeck === 'function' ? newDeck(prev.deck) : newDeck }));
  };
  const setDiscard = (newDiscard: Card[] | ((prev: Card[]) => Card[])) => {
    setPiles(prev => ({ ...prev, discard: typeof newDiscard === 'function' ? newDiscard(prev.discard) : newDiscard }));
  };

  // --- Entities ---
  const [player, setPlayer] = useState<EntityState | null>(() => {
    const saved = localStorage.getItem('cyberpoke_player');
    return saved ? JSON.parse(saved) : null;
  });
  const [enemy, setEnemy] = useState<EntityState | null>(() => {
    const saved = localStorage.getItem('cyberpoke_enemy');
    return saved ? JSON.parse(saved) : null;
  });

  // --- Refs for latest state (to avoid stale closures in async functions) ---
  const playerRef = useRef<EntityState | null>(null);
  const enemyRef = useRef<EntityState | null>(null);
  const handRef = useRef<Card[]>([]);
  const deckRef = useRef<Card[]>([]);
  const discardRef = useRef<Card[]>([]);

  // --- Sync refs with state ---
  useEffect(() => { playerRef.current = player; }, [player]);
  useEffect(() => { enemyRef.current = enemy; }, [enemy]);
  useEffect(() => { handRef.current = hand; }, [hand]);
  useEffect(() => { deckRef.current = deck; }, [deck]);
  useEffect(() => { discardRef.current = discard; }, [discard]);

  // --- Powers (Permanent Buffs) ---
  const [playerPowers, setPlayerPowers] = useState<string[]>(() => {
    const saved = localStorage.getItem('cyberpoke_player_powers');
    return saved ? JSON.parse(saved) : [];
  });
  const [enemyPowers, setEnemyPowers] = useState<string[]>(() => {
    const saved = localStorage.getItem('cyberpoke_enemy_powers');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('cyberpoke_phase', phase);
    localStorage.setItem('cyberpoke_floor', floor.toString());
    localStorage.setItem('cyberpoke_relics', JSON.stringify(relics));
    localStorage.setItem('cyberpoke_gold', gold.toString());
    localStorage.setItem('cyberpoke_deck', JSON.stringify(permanentDeck));
    localStorage.setItem('cyberpoke_map', JSON.stringify(map));
    localStorage.setItem('cyberpoke_node', currentNodeId || '');
    localStorage.setItem('cyberpoke_inventory', JSON.stringify(inventory));
    localStorage.setItem('cyberpoke_tasks', JSON.stringify(tasks));
    localStorage.setItem('cyberpoke_last_checkin', lastCheckIn || '');
    localStorage.setItem('cyberpoke_tickets', gachaTickets.toString());
    localStorage.setItem('cyberpoke_party', JSON.stringify(party));
    localStorage.setItem('cyberpoke_active_idx', activePokemonIndex.toString());
    localStorage.setItem('cyberpoke_upgrades', JSON.stringify(purchasedUpgrades));
    localStorage.setItem('cyberpoke_unlocked', JSON.stringify(unlockedPokemonIds));
    localStorage.setItem('cyberpoke_cdn_index', cdnIndex.toString());
    localStorage.setItem('cyberpoke_player', JSON.stringify(player));
    localStorage.setItem('cyberpoke_enemy', JSON.stringify(enemy));
    localStorage.setItem('cyberpoke_piles', JSON.stringify(piles));
    localStorage.setItem('cyberpoke_player_powers', JSON.stringify(playerPowers));
    localStorage.setItem('cyberpoke_enemy_powers', JSON.stringify(enemyPowers));
    localStorage.setItem('cyberpoke_shop_cards', JSON.stringify(shopCards));
    localStorage.setItem('cyberpoke_shop_relics', JSON.stringify(shopRelics));
    localStorage.setItem('cyberpoke_shop_consumables', JSON.stringify(shopConsumables));
    localStorage.setItem('cyberpoke_shop_pokemon', JSON.stringify(shopPokemon));
    localStorage.setItem('cyberpoke_shop_upgrades', JSON.stringify(shopUpgrades));
  }, [phase, floor, relics, gold, permanentDeck, map, currentNodeId, inventory, tasks, lastCheckIn, gachaTickets, party, activePokemonIndex, purchasedUpgrades, unlockedPokemonIds, player, enemy, piles, playerPowers, enemyPowers, shopCards, shopRelics, shopConsumables, shopPokemon, shopUpgrades]);

  // --- Refs ---
  const containerRef = useRef<HTMLDivElement>(null);

  // --- Logic ---

  const addFloatingText = useCallback((text: string, color: string, target: 'PLAYER' | 'ENEMY') => {
    const id = generateUUID();
    const x = (Math.random() - 0.5) * 60;
    const y = target === 'ENEMY' ? -120 : 120;
    setFloatingTexts(prev => [...prev, { id, text, color, x, y }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 1000);
  }, []);

  const triggerShake = (intensity: number = 10) => {
    setIsShaking(intensity);
    setTimeout(() => setIsShaking(0), 200);
  };

  const generateMap = (floors: number) => {
    const newMap: MapNode[] = [];
    const nodesPerFloor = 4;
    
    for (let f = 1; f <= floors; f++) {
      const floorNodes: MapNode[] = [];
      
      for (let i = 0; i < nodesPerFloor; i++) {
        let type: NodeType = 'COMBAT';
        const roll = Math.random();
        
        if (f === floors) {
          type = 'BOSS';
        } else if (i === 0 && f > 1) {
          type = 'REST';
        } else if (i === nodesPerFloor - 1 && f > 1) {
          type = 'SHOP';
        } else {
          if (roll < 0.15) type = 'ELITE';
          else if (roll < 0.3) type = 'SHOP';
          else if (roll < 0.45) type = 'REST';
          else if (roll < 0.6) type = 'UNKNOWN';
          else type = 'COMBAT';
        }

        const node: MapNode = {
          id: `node-${f}-${i}`,
          type,
          floor: f,
          x: (i + 1) * (100 / (nodesPerFloor + 1)),
          connectedTo: []
        };
        floorNodes.push(node);
        newMap.push(node);
      }

      // Connect to next floor
      if (f < floors) {
        // We'll connect them after generating all nodes or just connect to all in next floor for now
      }
    }

    // Connect nodes between floors
    for (let f = 1; f < floors; f++) {
      const currentFloorNodes = newMap.filter(n => n.floor === f);
      const nextFloorNodes = newMap.filter(n => n.floor === f + 1);
      
      currentFloorNodes.forEach(node => {
        // Each node connects to 1-2 random nodes in the next floor
        const targets = shuffle(nextFloorNodes).slice(0, Math.random() > 0.7 ? 2 : 1);
        node.connectedTo = targets.map(t => t.id);
      });
    }

    return newMap;
  };

  const initGame = (selectedId: string) => {
    const pBase = POKEMON_DB.find(p => p.id === selectedId)!;
    const initialDeck = (INITIAL_DECKS[selectedId] || INITIAL_DECKS['default']).map(c => ({ ...c, uid: generateUUID(), isEquipped: true } as Card));
    
    const initialPokemon: EntityState = {
      ...pBase,
      hp: pBase.maxHp,
      maxHp: pBase.maxHp,
      shield: 0,
      energy: pBase.maxEnergy,
      maxEnergy: pBase.maxEnergy,
      statusEffects: [],
      level: pBase.level || 1,
      xp: pBase.xp || 0,
      nextXp: pBase.nextXp || 100,
    };
    
    setParty([initialPokemon]);
    setUnlockedPokemonIds(prev => prev.includes(selectedId) ? prev : [...prev, selectedId]);
    setActivePokemonIndex(0);
    setPlayer(initialPokemon);
    setPermanentDeck(initialDeck);
    setRelics([]);
    setInventory([
      CONSUMABLES_DB.find(c => c.id === 'potion')!,
      CONSUMABLES_DB.find(c => c.id === 'poke_ball')!
    ]);
    setPhase('HUB');
    addLog(`初始化成功: 协议 [${pBase.name}] 已激活`, 'system');
  };

  const startEndlessTower = () => {
    // Initialize player lineup from current party
    const playerLineup = party.map(p => ({ ...p, hp: p.maxHp, shield: 0, statusEffects: [] }));
    
    // Generate initial enemy lineup
    const enemyLineup = generateEnemyLineup(3); // Start with 3 enemies
    
    setEndlessLineup({
      player: playerLineup,
      enemy: enemyLineup,
      playerIdx: 0,
      enemyIdx: 0,
      wave: 1
    });

    // Set active combatants
    setPlayer(playerLineup[0]);
    setEnemy(enemyLineup[0]);
    setActivePokemonIndex(0);

    // Prepare deck
    const fullDeck = shuffle(permanentDeck.filter(c => c.isEquipped !== false)) as Card[];
    setPiles({
      deck: fullDeck.filter(c => !c.isInnate),
      hand: fullDeck.filter(c => c.isInnate).slice(0, 5),
      discard: []
    });

    setPlayerPowers([]);
    setEnemyPowers([]);
    setTurn('PLAYER');
    setPhase('ENDLESS');
    addFloatingText('无尽塔链接成功', '#06b6d4', 'PLAYER');
  };

  const generateEnemyLineup = (count: number) => {
    const lineup: EntityState[] = [];
    for (let i = 0; i < count; i++) {
      const eBase = ENEMIES_DB[Math.floor(Math.random() * ENEMIES_DB.length)];
      lineup.push({
        ...eBase,
        maxHp: eBase.maxHp + (endlessLineup.wave * 10),
        hp: eBase.maxHp + (endlessLineup.wave * 10),
        shield: 0,
        energy: 3,
        statusEffects: [],
        intent: generateEnemyIntent(eBase as any),
        bgGradient: 'from-red-900/40 to-black',
        neonClass: 'neon-red',
        color: '#ef4444'
      } as any);
    }
    return lineup;
  };

  const startBattle = (node: MapNode) => {
    setCurrentNodeId(node.id);

    if (node.type === 'BOSS') {
      setPlayer(p => p ? { ...p, hp: p.maxHp } : null);
      addFloatingText('系统全量恢复 (FULL RESTORE)', '#4ade80', 'PLAYER');
    }

    let enemyPool = ENEMIES_DB.filter(e => !e.isElite && !e.isBoss);
    if (node.type === 'ELITE') {
      enemyPool = ENEMIES_DB.filter(e => e.isElite);
    } else if (node.type === 'BOSS') {
      if (floor === 5) {
        enemyPool = ENEMIES_DB.filter(e => e.id === 'rayquaza');
      } else {
        // Pick a boss that isn't the final one
        enemyPool = ENEMIES_DB.filter(e => e.isBoss && e.id !== 'rayquaza');
      }
    }

    // Floor 5 All-Star logic: pull from any enemy for non-boss nodes
    if (floor === 5 && node.type !== 'BOSS') {
      enemyPool = ENEMIES_DB.filter(e => !e.isBoss);
    }

    const eBase = enemyPool[Math.floor(Math.random() * enemyPool.length)];
    const hpMultiplier = node.type === 'BOSS' ? 2.5 : (node.type === 'ELITE' ? 1.8 : 1);

    setEnemy({
      ...eBase,
      maxHp: Math.floor((eBase.maxHp + (floor * 20)) * hpMultiplier),
      hp: Math.floor((eBase.maxHp + (floor * 20)) * hpMultiplier),
      shield: 0,
      energy: 3,
      statusEffects: [],
      intent: generateEnemyIntent(eBase as any),
      bgGradient: node.type === 'BOSS' ? 'from-purple-900/60 to-black' : (node.type === 'ELITE' ? 'from-orange-900/40 to-black' : 'from-red-900/40 to-black'),
      neonClass: node.type === 'BOSS' ? 'neon-purple' : (node.type === 'ELITE' ? 'neon-orange' : 'neon-red'),
      color: node.type === 'BOSS' ? '#c084fc' : (node.type === 'ELITE' ? '#f97316' : '#ef4444')
    } as any);

    const fullDeck = shuffle(permanentDeck.filter(c => c.isEquipped !== false)) as Card[];
    const innateCards = fullDeck.filter(c => c.isInnate);
    const otherCards = fullDeck.filter(c => !c.isInnate);
    const startingHand = [...innateCards];
    const remainingDeck = [...otherCards];
    while (startingHand.length < 5 && remainingDeck.length > 0) {
      startingHand.push(remainingDeck.pop()!);
    }

    setPiles({
      deck: remainingDeck,
      hand: startingHand,
      discard: []
    });
    setPlayerPowers([]);
    setEnemyPowers([]);
    setTurn('PLAYER');
    setPhase('BATTLE');
    
    // Opening Dialogues
    setTimeout(() => {
      showDialogue('PLAYER', 'START');
      setTimeout(() => showDialogue('ENEMY', 'START'), 1000);
    }, 500);

    if (relics.find(r => r.id === 'usb')) {
      setTimeout(() => drawCards(2), 500);
    }
    if (relics.find(r => r.id === 'shield_gen')) {
      setPlayer(p => p ? { ...p, shield: p.shield + 10 } : null);
    }
  };

  const enterNode = (node: MapNode) => {
    setCurrentNodeId(node.id);
    if (node.type === 'COMBAT' || node.type === 'ELITE' || node.type === 'BOSS') {
      startBattle(node);
    } else if (node.type === 'SHOP') {
      const pool = INITIAL_DECKS[player!.id];
      const cards = shuffle(pool).slice(0, 3).map(c => {
        const basePrice = c.rarity === 'RARE' ? 90 : (c.rarity === 'UNCOMMON' ? 65 : 45);
        return { 
          ...c, 
          uid: generateUUID(), 
          price: basePrice + Math.floor(Math.random() * 20) 
        };
      });
      const relicsPool = shuffle(RELICS_DB).filter(r => !relics.find(pr => pr.id === r.id)).slice(0, 2);
      const consumablesPool = shuffle(CONSUMABLES_DB).slice(0, 3);
      const unownedPokemon = POKEMON_DB.filter(p => !unlockedPokemonIds.includes(p.id) && (!p.level || p.level === 1) && !p.isBoss && !p.isElite);
      const pokemonPool = shuffle(unownedPokemon).slice(0, 2).map(p => ({
        ...p, hp: p.maxHp, energy: p.maxEnergy, statusEffects: [], level: p.level || 1, xp: p.xp || 0, nextXp: p.nextXp || 100, price: p.rarity === 'LEGENDARY' ? 1000 : p.rarity === 'EPIC' ? 500 : p.rarity === 'RARE' ? 250 : 100
      }));
      setShopCards(cards as any);
      setShopRelics(relicsPool);
      setShopConsumables(consumablesPool);
      setShopPokemon(pokemonPool as EntityState[]);
      setPhase('SHOP');
    } else if (node.type === 'REST') {
      setPhase('REST');
    }
  };

  const generateEnemyIntent = (enemyObj: EntityState): Intent => {
    const roll = Math.random();
    const currentNode = map.find(n => n.id === currentNodeId);
    const isElite = currentNode?.type === 'ELITE';
    const isBoss = currentNode?.type === 'BOSS';
    
    let baseDmg = 6 + floor * 2;
    if (isElite) baseDmg += 5;
    if (isBoss) baseDmg += 6;

    // Enemy-specific logic
    if (enemyObj.id === 'caterpie') {
      if (roll < 0.4) return { type: 'ATTACK', value: Math.floor(baseDmg * 0.8), desc: '吐丝攻击' };
      if (roll < 0.8) return { type: 'DEBUFF', value: 2, statusType: 'WEAK', desc: '虫丝缠绕 (WEAK)' };
      return { type: 'DEFEND', value: 5 + floor, desc: '硬化' };
    }

    if (enemyObj.id === 'rattata') {
      if (roll < 0.6) return { type: 'ATTACK', value: baseDmg, desc: '撞击' };
      if (roll < 0.8) return { type: 'BUFF', value: 2, statusType: 'STRENGTH', desc: '磨牙 (STRENGTH)' };
      return { type: 'ATTACK', value: Math.floor(baseDmg * 1.2), desc: '必杀门牙' };
    }

    if (enemyObj.id === 'pidgey') {
      if (roll < 0.5) return { type: 'ATTACK', value: baseDmg, desc: '烈暴风' };
      if (roll < 0.8) return { type: 'DEFEND', value: 8 + floor, desc: '羽栖' };
      return { type: 'DEBUFF', value: 2, statusType: 'WEAK', desc: '泼沙 (WEAK)' };
    }

    if (enemyObj.id === 'meowth') {
      if (roll < 0.4) return { type: 'ATTACK', value: baseDmg, desc: '乱抓' };
      if (roll < 0.7) return { type: 'DEBUFF', value: 2, statusType: 'VULNERABLE', desc: '刺耳声 (VULN)' };
      return { type: 'BUFF', value: 3, statusType: 'STRENGTH', desc: '聚宝功 (STRENGTH)' };
    }

    if (enemyObj.id === 'zubat') {
      if (roll < 0.5) return { type: 'ATTACK', value: baseDmg, desc: '吸血' };
      if (roll < 0.8) return { type: 'DEBUFF', value: 2, statusType: 'POISON', desc: '毒牙 (POISON)' };
      return { type: 'DEBUFF', value: 2, statusType: 'VULNERABLE', desc: '超音波 (VULN)' };
    }

    if (roll < 0.5) return { type: 'ATTACK', value: baseDmg, desc: '攻击指令' };
    if (roll < 0.7) return { type: 'DEFEND', value: 6 + floor * 2, desc: '屏障协议' };
    if (roll < 0.9) return { type: 'DEBUFF', value: 2, desc: '病毒注入' };
    return { type: 'ATTACK', value: Math.floor(baseDmg * 1.5), desc: '强力打击' };
  };

  const handleWin = () => {
    showDialogue('PLAYER', 'WIN');
    const currentNode = map.find(n => n.id === currentNodeId);
    
    // XP reward
    const baseXp = 20 + Math.floor(Math.random() * 10) + (floor * 5);
    const xpMultiplier = currentNode?.type === 'BOSS' ? 5 : (currentNode?.type === 'ELITE' ? 2.5 : 1);
    const finalXp = Math.min(500, Math.floor(baseXp * xpMultiplier)); // Cap XP to 500
    gainXp(finalXp);
    addFloatingText(`+${finalXp} 经验`, '#34d399', 'PLAYER');

    // Gacha Ticket reward
    setGachaTickets(prev => prev + 1);
    addFloatingText('+1 抽奖机会', '#f472b6', 'PLAYER');

    // Post-battle healing: 15% of Max HP
    setPlayer(p => {
      if (!p) return null;
      const healAmount = Math.floor(p.maxHp * 0.15);
      const newHp = Math.min(p.maxHp, p.hp + healAmount);
      addFloatingText(`+${healAmount} 修复`, '#4ade80', 'PLAYER');
      return { ...p, hp: newHp };
    });

    // Gold reward based on node type and floor
    const baseGold = 25 + Math.floor(Math.random() * 15) + (floor * 2);
    const multiplier = currentNode?.type === 'BOSS' ? 4 : (currentNode?.type === 'ELITE' ? 2 : 1);
    const finalGold = Math.min(300, Math.floor(baseGold * multiplier)); // Cap Gold to 300
    
    setGold(prev => prev + finalGold);
    addFloatingText(`+${finalGold} 金币`, '#facc15', 'PLAYER');
    updateTaskProgress('BATTLE_WIN', 1);

    if (currentNode?.type === 'BOSS') {
      if (floor === 5) {
        setPhase('VICTORY');
      } else {
        setFloor(prev => prev + 1);
        addFloatingText(`Sector ${floor + 1} 渗透中`, '#06b6d4', 'PLAYER');
        // Bonus reward for boss
        const bonusConsumable = CONSUMABLES_DB[Math.floor(Math.random() * CONSUMABLES_DB.length)];
        setInventory(prev => [...prev, bonusConsumable]);
        addFloatingText(`获得: ${bonusConsumable.name}`, '#4ade80', 'PLAYER');
        
        setPhase('HUB'); // Return to HUB after boss to prepare for next floor
      }
    } else {
      // Generate rewards here
      const allCards = Object.values(INITIAL_DECKS).flat();
      const newRewards = shuffle(allCards).slice(0, 3).map(c => ({ ...c, uid: generateUUID() } as Card));
      setRewards(newRewards);
      setPhase('REWARD');
    }
  };

  const drawCardsFromPiles = (count: number, currentHand: Card[], currentDeck: Card[], currentDiscard: Card[]) => {
    const newHand = [...currentHand];
    let newDeck = [...currentDeck];
    let newDiscard = [...currentDiscard];
    let shuffles = 0;

    for (let i = 0; i < count; i++) {
      if (newHand.length >= 10) break;
      if (newDeck.length === 0) {
        if (newDiscard.length === 0) break;
        newDeck = shuffle([...newDiscard]);
        newDiscard = [];
        shuffles++;
      }
      const card = newDeck.pop();
      if (card) newHand.push(card);
    }

    return { hand: newHand, deck: newDeck, discard: newDiscard, shuffles };
  };

  const drawCards = (count: number) => {
    const result = drawCardsFromPiles(count, handRef.current, deckRef.current, discardRef.current);
    setPiles({ hand: result.hand, deck: result.deck, discard: result.discard });

    // Handle side effects
    if (result.shuffles > 0 && relics.find(r => r.id === 'cooling')) {
      for (let i = 0; i < result.shuffles; i++) {
        setPlayer(p => p ? { ...p, hp: Math.min(p.maxHp, p.hp + 5) } : null);
        addFloatingText('+5 修复', '#4ade80', 'PLAYER');
      }
    }
  };

  const applyStatus = (target: 'PLAYER' | 'ENEMY', type: StatusType, value: number) => {
    const setter = target === 'PLAYER' ? setPlayer : setEnemy;
    setter(prev => {
      if (!prev) return null;
      const statusEffects = prev.statusEffects || [];
      const existing = statusEffects.find(s => s.type === type);
      if (existing) {
        return {
          ...prev,
          statusEffects: statusEffects.map(s => s.type === type ? { ...s, value: s.value + value } : s)
        };
      }
      return { ...prev, statusEffects: [...statusEffects, { type, value }] };
    });
  };

  const calculateDamage = (base: number, attacker: EntityState, defender: EntityState) => {
    let dmg = base;
    const attackerStatus = attacker.statusEffects || [];
    const defenderStatus = defender.statusEffects || [];
    const strength = attackerStatus.find(s => s.type === 'STRENGTH')?.value || 0;
    dmg += strength;

    // Relic: Chip
    if (playerRef.current && attacker.id === playerRef.current.id && relics.find(r => r.id === 'chip')) dmg += 1;

    const weak = attackerStatus.find(s => s.type === 'WEAK');
    if (weak && weak.value > 0) dmg = Math.floor(dmg * 0.75);
    const vuln = defenderStatus.find(s => s.type === 'VULNERABLE');
    if (vuln && vuln.value > 0) dmg = Math.floor(dmg * 1.5);
    
    // Pikachu Charge Mechanic
    const charge = attackerStatus.find(s => s.type === 'CHARGE');
    if (charge && charge.value >= 3) {
      dmg = Math.floor(dmg * 2);
    }
    
    return Math.max(0, dmg);
  };

  const executeCard = async (card: Card) => {
    // Use latest state from refs
    const currentPlayer = playerRef.current;
    const currentEnemy = enemyRef.current;
    if (!currentPlayer || !currentEnemy || isAnimating || currentPlayer.energy < card.cost || card.type === 'CURSE') return;

    setIsAnimating(true);
    setActiveSkillName(card.name);
    setTimeout(() => setActiveSkillName(null), 1500);
    
    setPlayerAnimation(card.type === 'ATTACK' ? 'attack' : 'skill');
    showDialogue('PLAYER', card.type === 'ATTACK' ? 'ATTACK' : 'SKILL');
    
    setPlayer(prev => prev ? { ...prev, energy: prev.energy - card.cost } : null);
    setPiles(prev => ({ ...prev, hand: prev.hand.filter(c => c.uid !== card.uid) }));

    // VFX & Hit-stop
    setActiveVfx({ type: card.vfx || (card.type === 'ATTACK' ? 'physical' : 'buff'), target: card.type === 'ATTACK' ? 'ENEMY' : 'PLAYER' });
    
    if (card.type === 'ATTACK') {
      triggerShake(card.damage && card.damage > 10 ? 15 : 5);
      await new Promise(r => setTimeout(r, 120)); 
      if (card.cost >= 2) {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 150);
      }
    }

    await new Promise(r => setTimeout(r, 400));
    setActiveVfx(null);

    // Logic
    if (card.damage) {
      // Re-fetch latest from refs just in case
      const attacker = playerRef.current!;
      const defender = enemyRef.current!;
      const finalDmg = calculateDamage(card.damage, attacker, defender);
      const extraDmg = playerPowers.includes('静电场协议') ? 2 : 0;
      const total = finalDmg + extraDmg;

      setEnemy(prev => {
        if (!prev) return null;
        let d = total;
        let s = prev.shield;
        if (s >= d) { s -= d; d = 0; } else { d -= s; s = 0; }
        return { ...prev, shield: s, hp: Math.max(0, prev.hp - d) };
      });
      addFloatingText(`-${total}`, '#ef4444', 'ENEMY');
      setEnemyAnimation('hit');
      showDialogue('ENEMY', 'HIT');
      setTimeout(() => setEnemyAnimation('idle'), 500);
      
      // Clear Charge if used
      const charge = attacker.statusEffects.find(s => s.type === 'CHARGE');
      if (charge && charge.value >= 3) {
        setPlayer(p => p ? { ...p, statusEffects: p.statusEffects.filter(s => s.type !== 'CHARGE') } : null);
      }
    }

    if (card.shield) {
      const dex = playerRef.current?.statusEffects.find(s => s.type === 'DEXTERITY')?.value || 0;
      const totalShield = card.shield + dex;
      setPlayer(prev => prev ? { ...prev, shield: prev.shield + totalShield } : null);
      addFloatingText(`+${totalShield} 屏障`, '#60a5fa', 'PLAYER');
    }

    if (card.statusEffect) {
      applyStatus('ENEMY', card.statusEffect.type, card.statusEffect.value);
      addFloatingText(card.statusEffect.type, '#c084fc', 'ENEMY');
      if (playerPowers.includes('覆写协议')) drawCards(1);
    }

    if (card.selfStatusEffect) {
      applyStatus('PLAYER', card.selfStatusEffect.type, card.selfStatusEffect.value);
      addFloatingText(card.selfStatusEffect.type, '#facc15', 'PLAYER');
    }

    if (card.type === 'POWER') {
      setPlayerPowers(prev => [...prev, card.name]);
      // If it's Sandstorm, we treat it as a power for turn-end logic
    }
    
    // Special case for Sandstorm which is a Skill but has a Power-like effect
    if (card.name === '沙暴.sys') {
      setPlayerPowers(prev => prev.includes('沙暴.sys') ? prev : [...prev, '沙暴.sys']);
    }

    if (card.draw) drawCards(card.draw);

    setTimeout(() => setPlayerAnimation('idle'), 500);

    if (card.id === 'junk') {
      addFloatingText('数据清理中...', '#4ade80', 'PLAYER');
    }

    // Charizard Overload Mechanic
    const overload = playerRef.current?.statusEffects.find(s => s.type === 'OVERLOAD');
    if (overload) {
      setPlayer(p => p ? { ...p, hp: Math.max(1, p.hp - overload.value) } : null);
      addFloatingText(`-${overload.value}`, '#f97316', 'PLAYER');
    }

    if (!card.isExhaust) {
      setDiscard(prev => [...prev, card]);
    }
    setIsAnimating(false);
  };



  const endPlayerTurn = () => {
    if (turn !== 'PLAYER' || isAnimating) return;
    setTurn('ENEMY');
    
    // Junk Card Damage
    const junkCount = handRef.current.filter(c => c.id === 'junk').length;
    if (junkCount > 0) {
      setPlayer(p => p ? { ...p, hp: Math.max(1, p.hp - (junkCount * 2)) } : null);
      addFloatingText(`-${junkCount * 2} 垃圾数据`, '#ef4444', 'PLAYER');
    }

    // Clear hand immediately and move to discard
    setPiles(prev => ({
      ...prev,
      hand: [],
      discard: [...prev.discard, ...prev.hand]
    }));

    // Tyranitar Power: Shield Retention
    // REMOVED: Shield reset at end of player turn to fix "useless defense" bug
    // if (!playerPowers.includes('硬化协议')) {
    //   setPlayer(prev => prev ? { ...prev, shield: 0 } : null);
    // }

    // Turn-end Powers/Effects
    setTimeout(async () => {
      if (playerPowers.includes('燃烧协议')) {
        setEnemy(prev => prev ? { ...prev, hp: Math.max(0, prev.hp - 5) } : null);
        addFloatingText('-5 燃烧', '#f97316', 'ENEMY');
        await new Promise(r => setTimeout(r, 400));
      }
      if (playerPowers.includes('沙暴.sys')) {
        setEnemy(prev => prev ? { ...prev, hp: Math.max(0, prev.hp - 3) } : null);
        addFloatingText('-3 沙暴', '#a8a878', 'ENEMY');
        await new Promise(r => setTimeout(r, 400));
      }
    }, 100);
    
    // Enemy Turn
    setTimeout(async () => {
      const currentEnemy = enemyRef.current;
      const currentPlayer = playerRef.current;
      if (!currentEnemy || !currentPlayer) return;
      
      // Poison Damage at start of turn
      const poison = currentEnemy.statusEffects.find(s => s.type === 'POISON');
      if (poison && poison.value > 0) {
        setEnemy(prev => prev ? { ...prev, hp: Math.max(0, prev.hp - poison.value) } : null);
        addFloatingText(`-${poison.value} 病毒`, '#4ade80', 'ENEMY');
        await new Promise(r => setTimeout(r, 400));
      }

      const intent = currentEnemy.intent!;
      setEnemyAnimation(intent.type === 'ATTACK' ? 'attack' : 'skill');
      setActiveSkillName(intent.desc || (intent.type === 'ATTACK' ? '基础攻击' : '系统指令'));
      setTimeout(() => setActiveSkillName(null), 1500);
      
      showDialogue('ENEMY', intent.type === 'ATTACK' ? 'ATTACK' : 'SKILL');
      
      setActiveVfx({ type: intent.type === 'ATTACK' ? 'physical' : 'buff', target: intent.type === 'ATTACK' ? 'PLAYER' : 'ENEMY' });
      
      if (intent.type === 'ATTACK') {
        const dmg = calculateDamage(intent.value!, currentEnemy, currentPlayer);
        setPlayer(prev => {
          if (!prev) return null;
          let d = dmg;
          let s = prev.shield;
          if (s >= d) { s -= d; d = 0; } else { d -= s; s = 0; }
          return { ...prev, shield: s, hp: Math.max(0, prev.hp - d) };
        });
        addFloatingText(`-${dmg}`, '#ef4444', 'PLAYER');
        setPlayerAnimation('hit');
        showDialogue('PLAYER', 'HIT');
        setTimeout(() => setPlayerAnimation('idle'), 500);
        triggerShake(10);
      } else if (intent.type === 'DEFEND') {
        setEnemy(prev => prev ? { ...prev, shield: prev.shield + intent.value! } : null);
        addFloatingText(`+${intent.value} 屏障`, '#60a5fa', 'ENEMY');
      } else if (intent.type === 'DEBUFF') {
        const sType = intent.statusType || 'WEAK';
        applyStatus('PLAYER', sType, intent.value!);
        addFloatingText(intent.desc || '病毒注入', '#facc15', 'PLAYER');
        // Add Junk Card
        setDiscard(prev => [...prev, { ...JUNK_CARD, uid: generateUUID() } as Card]);
      } else if (intent.type === 'BUFF') {
        const sType = intent.statusType || 'STRENGTH';
        applyStatus('ENEMY', sType, intent.value!);
        addFloatingText(intent.desc || '系统强化', '#facc15', 'ENEMY');
      }

      await new Promise(r => setTimeout(r, 800));
      setEnemyAnimation('idle');
      setActiveVfx(null);

      // End Enemy Turn
      setTurn('PLAYER');

      // Status Effect Decrement Logic
      const decrementStatus = (effects: StatusEffect[]) => {
        const turnBased: StatusType[] = ['VULNERABLE', 'WEAK', 'POISON', 'OVERLOAD'];
        return (effects || []).map(s => {
          if (turnBased.includes(s.type)) {
            return { ...s, value: s.value - 1 };
          }
          return s;
        }).filter(s => s.value > 0);
      };

      setEnemy(prev => {
        if (!prev) return null;
        return { 
          ...prev, 
          shield: 0, 
          statusEffects: decrementStatus(prev.statusEffects), 
          intent: generateEnemyIntent(prev) 
        };
      });
      
      setPlayer(prev => {
        if (!prev) return null;
        
        // Poison Damage for player
        const pPoison = prev.statusEffects.find(s => s.type === 'POISON');
        let newHp = prev.hp;
        if (pPoison && pPoison.value > 0) {
           newHp = Math.max(0, prev.hp - pPoison.value);
           addFloatingText(`-${pPoison.value} 病毒`, '#4ade80', 'PLAYER');
        }

        const energyGain = relics.find(r => r.id === 'battery') ? 1 : 0;
        
        // SHIELD RESET AT START OF PLAYER TURN
        let newShield = 0;
        if (playerPowers.includes('硬化协议')) {
           newShield = prev.shield;
        }

        return { 
          ...prev, 
          hp: newHp,
          shield: newShield,
          energy: Math.min(prev.maxEnergy + energyGain, prev.maxEnergy + 1), 
          statusEffects: decrementStatus(prev.statusEffects) 
        };
      });

      // CRITICAL FIX: Use unified setPiles for atomic updates
      setPiles(prev => {
        const result = drawCardsFromPiles(5, [], prev.deck, prev.discard);
        return result;
      });
    }, 1000);
  };

  // Check Game Over
  useEffect(() => {
    if (phase === 'BATTLE') {
      if (player && player.hp <= 0) {
        // Check if there are other alive Pokemon in the party
        const nextAliveIdx = party.findIndex((p, idx) => idx !== activePokemonIndex && p.hp > 0);
        if (nextAliveIdx !== -1) {
          const nextPokemon = party[nextAliveIdx];
          setPlayer(nextPokemon);
          setActivePokemonIndex(nextAliveIdx);
          addFloatingText(`切换至 ${nextPokemon.name}`, nextPokemon.color, 'PLAYER');
        } else {
          showDialogue('ENEMY', 'WIN');
          setPhase('GAMEOVER');
          setWinner('ENEMY');
        }
      } else if (enemy && enemy.hp <= 0) {
        // Prevent double call
        setPhase('REWARD_TRANSITION'); 
        handleWin();
      }
    } else if (phase === 'ENDLESS') {
      if (player && player.hp <= 0) {
        // Player Pokemon fainted
        const nextIdx = endlessLineup.playerIdx + 1;
        if (nextIdx < endlessLineup.player.length) {
          addFloatingText(`${player.name} 离线`, '#ef4444', 'PLAYER');
          const nextPokemon = endlessLineup.player[nextIdx];
          setPlayer(nextPokemon);
          setEndlessLineup(prev => ({ ...prev, playerIdx: nextIdx }));
          setActivePokemonIndex(nextIdx);
          addFloatingText(`切换至 ${nextPokemon.name}`, nextPokemon.color, 'PLAYER');
        } else {
          setPhase('GAMEOVER');
          setWinner('ENEMY');
        }
      } else if (enemy && enemy.hp <= 0) {
    // Enemy Pokemon fainted
    const nextIdx = endlessLineup.enemyIdx + 1;
    setGachaTickets(prev => prev + 1);
    addFloatingText('+1 抽奖机会', '#f472b6', 'PLAYER');
    
    if (nextIdx < endlessLineup.enemy.length) {
          addFloatingText(`${enemy.name} 已清除`, '#4ade80', 'ENEMY');
          const nextEnemy = endlessLineup.enemy[nextIdx];
          setEnemy(nextEnemy);
          setEndlessLineup(prev => ({ ...prev, enemyIdx: nextIdx }));
          addFloatingText(`下一个病毒: ${nextEnemy.name}`, '#ef4444', 'ENEMY');
        } else {
    // Wave cleared
    const nextWave = endlessLineup.wave + 1;
    addFloatingText(`WAVE ${endlessLineup.wave} 清除`, '#facc15', 'PLAYER');
    const waveGold = Math.min(500, 100 * endlessLineup.wave);
    setGold(prev => prev + waveGold);
    setGachaTickets(prev => prev + 3); // Bonus tickets for wave clear
    addFloatingText('+3 抽奖机会', '#f472b6', 'PLAYER');
    
    const newEnemyLineup = generateEnemyLineup(3 + Math.floor(nextWave / 2));
          setEndlessLineup(prev => ({
            ...prev,
            enemy: newEnemyLineup,
            enemyIdx: 0,
            wave: nextWave
          }));
          setEnemy(newEnemyLineup[0]);
          addFloatingText(`WAVE ${nextWave} 开始`, '#ef4444', 'ENEMY');
        }
      }
    }
  }, [player?.hp, enemy?.hp, phase, endlessLineup]);

  const renderEndless = () => (
    <div className="h-full w-full bg-[#05050a] flex flex-col overflow-hidden relative">
      {/* Background VFX */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      </div>

      {/* Header */}
      <div className="p-2 md:p-4 bg-black/60 border-b border-white/10 flex justify-between items-center z-20 shrink-0">
        <div className="flex items-center gap-2 md:gap-6">
          <div className="text-sm md:text-2xl font-black italic text-red-500 glitch-text">无尽塔 // WAVE {endlessLineup.wave}</div>
          <div className="text-[10px] md:text-xs font-mono text-yellow-400">CREDITS: {gold}</div>
        </div>
        <button 
          onClick={() => setPhase('HUB')}
          className="px-3 md:px-6 py-1 md:py-2 border-2 border-red-500 text-red-500 text-[10px] md:text-base font-black uppercase tracking-widest hover:bg-red-500 hover:text-black transition-all"
        >
          终止链接 (EXIT)
        </button>
      </div>

      {/* Main Battle Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Enemy Lineup */}
        <div className="absolute top-2 md:top-4 left-1/2 -translate-x-1/2 flex gap-1 md:gap-2 z-30">
          {endlessLineup.enemy?.map((e, i) => (
            <div 
              key={i} 
              className={`w-8 h-8 md:w-10 md:h-10 rounded-lg border-2 flex items-center justify-center transition-all ${i === endlessLineup.enemyIdx ? 'border-red-500 bg-red-500/20 scale-110' : i < endlessLineup.enemyIdx ? 'border-white/5 opacity-20' : 'border-white/20 opacity-60'}`}
            >
              <SafeImage 
                src={e.img} 
                className="w-6 h-6 md:w-8 md:h-8 object-contain" 
                cdnIndex={cdnIndex} 
                pokemonId={e.id}
              />
            </div>
          ))}
        </div>

        {/* Player Lineup */}
        <div className="absolute bottom-48 md:bottom-32 left-1/2 -translate-x-1/2 flex gap-1 md:gap-2 z-30">
          {endlessLineup.player?.map((p, i) => (
            <div 
              key={i} 
              onClick={() => {
                if (i !== endlessLineup.playerIdx && p.hp > 0 && turn === 'PLAYER' && !isAnimating) {
                  setPlayer(p);
                  setEndlessLineup(prev => ({ ...prev, playerIdx: i }));
                  setActivePokemonIndex(i);
                  addFloatingText(`切换至 ${p.name}`, p.color, 'PLAYER');
                }
              }}
              className={`w-10 h-10 md:w-12 md:h-12 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all ${i === endlessLineup.playerIdx ? 'border-cyan-400 bg-cyan-400/20 scale-110 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : p.hp <= 0 ? 'border-red-900 bg-red-900/20 opacity-30 grayscale' : 'border-white/20 opacity-60 hover:opacity-100'}`}
            >
              <SafeImage 
                src={p.img} 
                className="w-8 h-8 md:w-10 md:h-10 object-contain" 
                cdnIndex={cdnIndex} 
                pokemonId={p.id}
              />
              {p.hp <= 0 && <Skull className="absolute w-4 h-4 md:w-6 md:h-6 text-red-600" />}
            </div>
          ))}
        </div>

        {/* The Battle View (Reusing components if possible or just inline) */}
        <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
          {renderBattle()}
        </div>
      </div>
    </div>
  );
  const renderMap = () => (
    <div className="h-full w-full bg-[#05050a] p-8 text-white flex flex-col items-center justify-center overflow-y-auto no-scrollbar">
      <div className="mb-12 text-center">
        <h2 className="text-5xl font-black italic tracking-tighter mb-2 glitch-text">网络拓扑结构 (NETWORK TOPOLOGY)</h2>
        <p className="font-mono text-xs text-cyan-400 opacity-60 uppercase tracking-[0.3em]">Sector {floor} // 防火墙渗透中</p>
      </div>
      
      <div className="relative w-full max-w-4xl min-h-[400px] md:min-h-[500px] flex flex-col items-center justify-between border border-white/5 rounded-3xl bg-white/5 backdrop-blur-sm p-4 md:p-12 overflow-x-auto no-scrollbar">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:20px_20px] md:bg-[size:40px_40px]" />
        
        {Array.from({ length: 5 }).map((_, f) => {
          const nodes = map.filter(n => n.floor === f + 1);
          return (
            <div key={f} className="flex justify-around w-full min-w-[300px] relative z-10 my-2 md:my-0">
              {nodes?.map(node => {
                const isCurrentFloor = floor === node.floor;
                const isVisited = floor > node.floor;
                
                let isSelectable = false;
                if (floor === 1 && node.floor === 1) isSelectable = true;
                else if (currentNodeId) {
                  const currentNode = map.find(n => n.id === currentNodeId);
                  if (currentNode && currentNode.connectedTo.includes(node.id)) isSelectable = true;
                }

                return (
                  <motion.div 
                    key={node.id}
                    whileHover={isSelectable ? { scale: 1.2, boxShadow: '0 0 30px rgba(0,255,255,0.4)' } : {}}
                    onClick={() => isSelectable && enterNode(node)}
                    className={`relative w-12 h-12 md:w-20 md:h-20 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 shrink-0
                      ${isSelectable ? 'border-cyan-400 bg-cyan-950/20 shadow-[0_0_15px_rgba(0,255,255,0.2)]' : 'border-white/10 bg-black/40 opacity-40'}
                      ${isVisited ? 'grayscale opacity-20 cursor-not-allowed' : ''}
                      ${currentNodeId === node.id ? 'border-yellow-400 bg-yellow-950/20 shadow-[0_0_20px_rgba(250,204,21,0.4)]' : ''}
                    `}
                  >
                    {node.type === 'COMBAT' && <Swords className="w-5 h-5 md:w-8 md:h-8 text-red-500" />}
                    {node.type === 'ELITE' && <Skull className="w-5 h-5 md:w-8 md:h-8 text-purple-500" />}
                    {node.type === 'BOSS' && <Zap className="w-6 h-6 md:w-10 md:h-10 text-yellow-500 animate-pulse" />}
                    {node.type === 'SHOP' && <Database className="w-5 h-5 md:w-8 md:h-8 text-yellow-400" />}
                    {node.type === 'REST' && <Activity className="w-5 h-5 md:w-8 md:h-8 text-green-400" />}
                    <span className="text-[6px] md:text-[8px] font-black uppercase tracking-tighter mt-1">{node.type}</span>
                    {isSelectable && <div className="absolute -inset-1 md:-inset-2 border border-cyan-400/20 rounded-xl animate-ping" />}
                  </motion.div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="mt-8 md:mt-12 flex flex-col md:flex-row gap-4 md:gap-8">
        <div className="flex items-center gap-2 px-6 py-3 border border-white/10 rounded-full bg-black/60">
          <Database className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-mono uppercase">Credits: <span className="text-yellow-400 font-black">{gold}</span></span>
        </div>
        <div className="flex items-center gap-2 px-6 py-3 border border-white/10 rounded-full bg-black/60">
          <Play className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-mono uppercase">Deck: <span className="text-cyan-400 font-black">{deck.length + hand.length + discard.length}</span></span>
        </div>
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="fixed top-16 md:top-4 right-4 flex gap-2 z-[60] flex-wrap justify-end max-w-[150px] md:max-w-none">
      {inventory?.map((item, i) => (
        <motion.div
          key={i}
          whileHover={{ scale: 1.1, y: -5 }}
          onClick={() => useConsumable(item, i)}
          className="w-10 h-10 md:w-12 md:h-12 bg-black/80 border border-white/20 rounded-xl flex items-center justify-center cursor-pointer group relative"
        >
          <Package className="w-5 h-5 md:w-6 md:h-6 text-cyan-400 group-hover:text-white transition-colors" />
          <div className="absolute top-full right-0 mt-2 w-48 p-2 bg-black/90 border border-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[70]">
            <div className="text-xs font-black text-cyan-400 uppercase">{item.name}</div>
            <div className="text-[10px] text-white/60 mt-1">{item.desc}</div>
            <div className="text-[8px] text-yellow-400 mt-1 uppercase font-mono">点击使用</div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderTasks = () => (
    <AnimatePresence>
      {showTasks && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-8"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-[#0a0a15] border-2 border-cyan-500/30 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(0,255,255,0.1)] flex flex-col max-h-[90vh]"
          >
            <div className="p-4 md:p-6 border-b border-white/10 flex justify-between items-center bg-cyan-950/20 shrink-0">
              <h3 className="text-xl md:text-3xl font-black italic text-cyan-400 uppercase tracking-tighter">任务协议 (TASK PROTOCOLS)</h3>
              <button onClick={() => setShowTasks(false)} className="text-white/40 hover:text-white transition-colors">
                <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
            <div className="p-4 md:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              {tasks?.map((task) => (
                <div key={task.id} className={`p-3 md:p-4 border rounded-2xl transition-all ${task.isClaimed ? 'bg-white/5 border-white/5 opacity-50' : 'bg-white/5 border-white/10 hover:border-cyan-500/50'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-black italic text-base md:text-lg uppercase tracking-tight">{task.title}</h4>
                      <p className="text-[10px] md:text-xs text-white/60 mt-1">{task.desc}</p>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 text-yellow-400 font-black shrink-0 ml-2">
                      <Coins className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="text-sm md:text-base">{task.reward}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-4 mt-4">
                    <div className="flex-1 h-1.5 md:h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(task.progress / task.target) * 100}%` }}
                        className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]"
                      />
                    </div>
                    <span className="text-[8px] md:text-[10px] font-mono text-white/40 shrink-0">{task.progress} / {task.target}</span>
                    {task.progress >= task.target && !task.isClaimed ? (
                      <button 
                        onClick={() => claimTaskReward(task.id)}
                        className="px-2 md:px-4 py-1 bg-yellow-400 text-black text-[8px] md:text-[10px] font-black uppercase rounded hover:bg-yellow-300 transition-all shrink-0"
                      >
                        领取奖励
                      </button>
                    ) : task.isClaimed ? (
                      <span className="text-[8px] md:text-[10px] text-green-400 font-black uppercase flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-2 h-2 md:w-3 md:h-3" /> 已完成
                      </span>
                    ) : (
                      <span className="text-[8px] md:text-[10px] text-white/20 font-black uppercase shrink-0">进行中</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderPVPLobby = () => (
    <div className="h-full w-full bg-black text-white flex flex-col items-center justify-center relative overflow-hidden p-4">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#ff0000_0%,transparent_70%)]" />
      </div>
      
      <div className="relative z-10 text-center w-full max-w-md mx-auto">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="mb-6 md:mb-8 flex justify-center"
        >
          <Swords className="w-16 h-16 md:w-24 md:h-24 text-red-500" />
        </motion.div>
        
        <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter text-red-500 mb-2 md:mb-4">PVP 匹配中...</h2>
        <p className="font-mono text-[10px] md:text-sm opacity-60 uppercase tracking-[0.1em] md:tracking-[0.3em]">正在寻找合适的对手 (SEARCHING FOR OPPONENT)</p>
        
        <div className="mt-8 md:mt-12 flex flex-col items-center gap-4 md:gap-6">
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-2 h-2 md:w-3 md:h-3 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"
              />
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={leavePVPLobby}
              className="px-6 md:px-8 py-2 md:py-3 border-2 border-white/20 rounded-full font-black italic uppercase hover:bg-white/10 transition-colors text-sm md:text-base w-full sm:w-auto"
            >
              取消匹配
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startAiBattle}
              className="px-6 md:px-8 py-2 md:py-3 bg-red-500 text-white rounded-full font-black italic uppercase hover:bg-red-600 transition-colors shadow-[0_0_20px_rgba(239,68,68,0.3)] text-sm md:text-base w-full sm:w-auto"
            >
              练习模式 (VS AI)
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
  const renderPVPBattle = () => {
    if (!pvpState || !player) return null;

    return (
      <div className="h-full w-full bg-[#05050a] p-4 md:p-8 text-white flex flex-col relative overflow-hidden">
        {/* Opponent Section */}
        <div className="flex-1 flex flex-col items-center justify-start pt-4 md:pt-12">
          <div className="relative">
            <motion.div
              animate={{
                y: [0, -10, 0],
                filter: ["hue-rotate(0deg)", "hue-rotate(10deg)", "hue-rotate(0deg)"]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className={`w-32 h-32 md:w-64 md:h-64 rounded-full flex items-center justify-center relative z-20 ${pvpState.opponentPokemon?.bgGradient || ''} border-4 border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.1)]`}
            >
              <SafeImage 
                src={pvpState.opponentPokemon?.img || ''} 
                alt={pvpState.opponentPokemon?.name || ''}
                className="w-24 h-24 md:w-48 md:h-48 object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                cdnIndex={cdnIndex}
              />
            </motion.div>
            
            {/* Opponent Info */}
            <div className="absolute -bottom-8 md:-bottom-12 left-1/2 -translate-x-1/2 w-64 md:w-80 bg-black/80 backdrop-blur-md border border-white/20 p-2 md:p-4 rounded-xl md:rounded-2xl z-30">
              <div className="flex justify-between items-end mb-1 md:mb-2">
                <span className="text-sm md:text-xl font-black italic text-red-400 uppercase tracking-tighter truncate max-w-[150px] md:max-w-none">{pvpState.opponentName}</span>
                <span className="text-[10px] md:text-xs font-mono opacity-60">LV.{pvpState.opponentPokemon?.level}</span>
              </div>
              
              <div className="w-full h-2 md:h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 mb-1">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(pvpState.opponentHp / pvpState.opponentMaxHp) * 100}%` }}
                  className="h-full bg-gradient-to-r from-red-600 to-red-400"
                />
              </div>
              <div className="flex justify-between text-[8px] md:text-[10px] font-mono font-bold">
                <span className="text-red-400">HP {pvpState.opponentHp}/{pvpState.opponentMaxHp}</span>
                {pvpState.opponentShield > 0 && <span className="text-blue-400">SHIELD {pvpState.opponentShield}</span>}
              </div>
              <div className="flex gap-1 mt-1 md:mt-2">
                {pvpState.opponentPokemon?.statusEffects?.map((s, i) => <StatusIcon key={i} effect={s} />)}
              </div>
            </div>
          </div>
          
          {/* Opponent Hand Count */}
          <div className="mt-12 md:mt-20 flex gap-1">
            {[...Array(pvpState.opponentHandCount || 0)].map((_, i) => (
              <div key={i} className="w-4 h-6 md:w-8 md:h-12 bg-red-950/40 border border-red-500/30 rounded-sm md:rounded-md transform -rotate-6" />
            ))}
          </div>
        </div>

        {/* VS Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent my-4 md:my-8 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black px-3 md:px-4 py-1 border border-white/20 rounded-full text-[10px] md:text-xs font-black italic uppercase text-white/40 whitespace-nowrap">
            Turn {pvpState.turnNumber} - {pvpState.isMyTurn ? "你的回合" : "对手回合"}
          </div>
        </div>

        {/* Opponent Party Status */}
        <div className="flex gap-1 md:gap-2 justify-center mb-2 md:mb-4">
          {pvpState.opponentParty?.map((p, i) => (
            <div 
              key={i} 
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full border ${i === pvpState.opponentActiveIndex ? 'bg-red-500 border-red-400 animate-pulse' : p.hp <= 0 ? 'bg-gray-800 border-gray-700' : 'bg-red-900/40 border-red-500/30'}`}
              title={p.name}
            />
          ))}
        </div>

        {/* Player Section */}
        <div className="flex-1 flex flex-col items-center justify-end pb-24 md:pb-32">
          <div className="relative">
            <motion.div
              animate={{
                y: [0, -5, 0],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className={`w-32 h-32 md:w-48 md:h-48 rounded-full flex items-center justify-center relative z-20 ${player.bgGradient} border-4 border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]`}
            >
              <SafeImage 
                src={player.img} 
                alt={player.name}
                className="w-20 h-20 md:w-32 md:h-32 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                cdnIndex={cdnIndex}
              />
            </motion.div>

            {/* Player Info */}
            <div className="absolute -top-12 md:-top-16 left-1/2 -translate-x-1/2 w-56 md:w-64 bg-black/80 backdrop-blur-md border border-white/20 p-2 md:p-3 rounded-xl z-30">
              <div className="flex justify-between items-end mb-1">
                <span className="text-sm md:text-lg font-black italic text-cyan-400 uppercase tracking-tighter truncate max-w-[120px] md:max-w-none">{player.name}</span>
                <div className="flex items-center gap-1 bg-cyan-500/20 px-1 md:px-2 py-0.5 rounded border border-cyan-500/30">
                  <Zap className="w-2 h-2 md:w-3 md:h-3 text-cyan-400" />
                  <span className="text-[10px] md:text-xs font-black text-cyan-400">{player.energy}/{player.maxEnergy}</span>
                </div>
              </div>
              
              <div className="w-full h-1.5 md:h-2 bg-white/5 rounded-full overflow-hidden border border-white/10 mb-1">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                  className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400"
                />
              </div>
              <div className="flex justify-between text-[8px] font-mono font-bold">
                <span className="text-cyan-400">HP {player.hp}/{player.maxHp}</span>
                {player.shield > 0 && <span className="text-blue-400">SHIELD {player.shield}</span>}
              </div>
              <div className="flex gap-1 mt-1 md:mt-2">
                {player?.statusEffects?.map((s, i) => <StatusIcon key={i} effect={s} />)}
              </div>
            </div>
          </div>
          
          {/* Player Party Status */}
          <div className="flex gap-1 md:gap-2 mt-2 md:mt-4">
            {party?.map((p, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full border ${i === activePokemonIndex ? 'bg-cyan-500 border-cyan-400 animate-pulse' : p.hp <= 0 ? 'bg-gray-800 border-gray-700' : 'bg-cyan-900/40 border-cyan-500/30'}`}
                title={p.name}
              />
            ))}
          </div>
        </div>

        {/* Hand UI */}
        <div className="fixed bottom-0 left-0 w-full p-2 md:p-8 flex justify-center items-end gap-1 md:gap-2 z-50 pointer-events-none overflow-x-auto no-scrollbar">
          {piles.hand?.map((card, i) => {
            const canPlay = pvpState.isMyTurn && player.energy >= card.cost && !isAnimating;
            return (
              <motion.div
                key={card.uid}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                whileHover={canPlay ? { y: -10, scale: 1.05 } : {}}
                onClick={() => canPlay && playPVPCard(card, i)}
                className={`w-24 h-36 md:w-48 md:h-64 bg-black/90 border-2 rounded-xl md:rounded-2xl p-2 md:p-4 flex flex-col relative cursor-pointer pointer-events-auto transition-all shrink-0 ${
                  canPlay ? 'border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'border-white/10 opacity-50 grayscale'
                }`}
              >
                <div className="flex justify-between items-start mb-1 md:mb-2">
                  <span className="text-[8px] md:text-xs font-black italic text-cyan-400 uppercase">{card.type}</span>
                  <div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-cyan-500 flex items-center justify-center text-[10px] md:text-xs font-black">
                    {card.cost}
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <h4 className="text-[10px] md:text-lg font-black italic uppercase mb-1 md:mb-2 leading-tight">{card.name}</h4>
                  <p className="text-[8px] md:text-[10px] opacity-60 leading-relaxed hidden md:block">{card.desc}</p>
                </div>
                <div className={`mt-1 md:mt-4 pt-1 md:pt-4 border-t border-white/10 text-[8px] md:text-[10px] font-mono uppercase tracking-widest text-center ${
                  card.rarity === 'RARE' ? 'text-yellow-400' : 
                  card.rarity === 'UNCOMMON' ? 'text-cyan-400' : 'text-white/40'
                }`}>
                  {card.rarity}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="fixed bottom-20 md:bottom-8 right-2 md:right-8 z-50 flex flex-col gap-2 md:gap-4 items-end">
          <div className="flex gap-2 md:gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowBackpack(true)}
              disabled={!pvpState.isMyTurn || isAnimating}
              className="w-10 h-10 md:w-14 md:h-14 bg-cyan-500/20 border border-cyan-500/50 rounded-full flex items-center justify-center text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all disabled:opacity-30"
            >
              <Briefcase className="w-4 h-4 md:w-6 md:h-6" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPartySwitch(true)}
              disabled={!pvpState.isMyTurn || isAnimating}
              className="w-10 h-10 md:w-14 md:h-14 bg-purple-500/20 border border-purple-500/50 rounded-full flex items-center justify-center text-purple-400 hover:bg-purple-500 hover:text-black transition-all disabled:opacity-30"
            >
              <Layers className="w-4 h-4 md:w-6 md:h-6" />
            </motion.button>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={endPVPTurn}
            disabled={!pvpState.isMyTurn}
            className={`px-4 md:px-8 py-2 md:py-4 rounded-full font-black italic uppercase shadow-xl transition-all text-xs md:text-base ${
              pvpState.isMyTurn 
                ? 'bg-cyan-500 text-black hover:bg-cyan-400' 
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
          >
            结束回合
          </motion.button>
        </div>
      </div>
    );
  };

  const playPVPCard = async (card: Card, index: number) => {
    if (!pvpState || !pvpState.isMyTurn || !player || player.energy < card.cost || isAnimating) return;

    setIsAnimating(true);
    setActiveSkillName(card.name);
    setTimeout(() => setActiveSkillName(null), 1500);

    setPlayerAnimation(card.type === 'ATTACK' ? 'attack' : 'skill');
    showDialogue('PLAYER', card.type === 'ATTACK' ? 'ATTACK' : 'SKILL');

    setActiveVfx({ type: card.vfx || (card.type === 'ATTACK' ? 'physical' : 'buff'), target: card.type === 'ATTACK' ? 'ENEMY' : 'PLAYER' });

    if (card.type === 'ATTACK') {
      triggerShake(card.damage && card.damage > 10 ? 15 : 5);
      await new Promise(r => setTimeout(r, 120)); 
      if (card.cost >= 2) {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 150);
      }
    }

    await new Promise(r => setTimeout(r, 400));
    setActiveVfx(null);

    // Apply effects locally
    setPlayer(prev => prev ? { ...prev, energy: prev.energy - card.cost, shield: prev.shield + (card.shield || 0) } : null);
    
    // Move card to discard and handle draw
    setPiles(prev => {
      const newHand = [...prev.hand];
      newHand.splice(index, 1);
      let newDiscard = [...prev.discard, card];
      let newDeck = [...prev.deck];
      let drawnCards: Card[] = [];

      if (card.draw) {
        for (let i = 0; i < card.draw; i++) {
          if (newDeck.length === 0) {
            newDeck = shuffle(newDiscard);
            newDiscard = [];
          }
          if (newDeck.length > 0) {
            drawnCards.push(newDeck.pop()!);
          }
        }
      }

      return {
        ...prev,
        hand: [...newHand, ...drawnCards],
        deck: newDeck,
        discard: newDiscard
      };
    });

    if (card.damage) {
      setPvpState(prev => {
        if (!prev) return null;
        const actualDamage = Math.max(0, card.damage! - prev.opponentShield);
        const newOpponentHp = Math.max(0, prev.opponentHp - actualDamage);
        
        addFloatingText(`-${actualDamage}`, '#ef4444', 'ENEMY');
        setEnemyAnimation('hit');
        showDialogue('ENEMY', 'HIT');
        setTimeout(() => setEnemyAnimation('idle'), 500);

        if (newOpponentHp <= 0) {
          setWinner('PLAYER');
          setPhase('VICTORY');
          if (!prev.isAiOpponent) {
            socketRef.current?.emit('game_action', {
              roomId: prev.roomId,
              action: { type: 'GAME_OVER', winner: 'OPPONENT' }
            });
          }
        }

        return {
          ...prev,
          opponentHp: newOpponentHp,
          opponentShield: Math.max(0, prev.opponentShield - card.damage!),
        };
      });
    }

    if (card.shield) {
      addFloatingText(`+${card.shield} 屏障`, '#60a5fa', 'PLAYER');
    }

    if (card.statusEffect) {
      setPvpState(prev => {
        if (!prev) return null;
        const statusEffects = prev.opponentPokemon.statusEffects || [];
        const existing = statusEffects.find(s => s.type === card.statusEffect!.type);
        const newStatusEffects = existing
          ? statusEffects.map(s => s.type === card.statusEffect!.type ? { ...s, value: s.value + card.statusEffect!.value } : s)
          : [...statusEffects, card.statusEffect!];
        
        return {
          ...prev,
          opponentPokemon: {
            ...prev.opponentPokemon,
            statusEffects: newStatusEffects
          }
        };
      });
      addFloatingText(card.statusEffect.type, '#c084fc', 'ENEMY');
    }

    if (card.selfStatusEffect) {
      setPlayer(prev => {
        if (!prev) return null;
        const statusEffects = prev.statusEffects || [];
        const existing = statusEffects.find(s => s.type === card.selfStatusEffect!.type);
        if (existing) {
          return {
            ...prev,
            statusEffects: statusEffects.map(s => s.type === card.selfStatusEffect!.type ? { ...s, value: s.value + card.selfStatusEffect!.value } : s)
          };
        }
        return { ...prev, statusEffects: [...statusEffects, card.selfStatusEffect!] };
      });
      addFloatingText(card.selfStatusEffect.type, '#facc15', 'PLAYER');
    }

    if (card.heal) {
      setPlayer(prev => prev ? { ...prev, hp: Math.min(prev.maxHp, prev.hp + card.heal!) } : null);
      addFloatingText(`+${card.heal} HP`, '#4ade80', 'PLAYER');
    }

    // Send action to opponent
    if (!pvpState.isAiOpponent) {
      socketRef.current?.emit('game_action', {
        roomId: pvpState.roomId,
        action: { type: 'PLAY_CARD', card }
      });
    }

    addLog(`你使用了 ${card.name}`, 'player');

    setIsAnimating(false);
  };

  const endPVPTurn = () => {
    if (!pvpState || !pvpState.isMyTurn) return;

    // Sync state before ending turn
    if (!pvpState.isAiOpponent) {
      socketRef.current?.emit('game_action', {
        roomId: pvpState.roomId,
        action: { 
          type: 'UPDATE_STATE', 
          state: { 
            opponentParty: party,
            opponentInventory: inventory,
            opponentActiveIndex: activePokemonIndex,
            opponentHp: player?.hp,
            opponentMaxHp: player?.maxHp,
            opponentShield: player?.shield,
            opponentPokemon: player
          } 
        }
      });

      socketRef.current?.emit('game_action', {
        roomId: pvpState.roomId,
        action: { type: 'END_TURN' }
      });
    }

    setPvpState(prev => prev ? { ...prev, isMyTurn: false } : null);
    addLog("回合结束", 'system');
  };
  const renderHub = () => (
    <div className="h-full w-full bg-[#05050a] p-8 text-white flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#00ffff_0%,transparent_70%)]" />
      </div>

      <div className="mb-12 text-center relative z-10">
        <h2 className="text-7xl font-black italic tracking-tighter text-cyan-400 mb-2 glitch-text">作战中心 (HUB)</h2>
        <p className="font-mono text-xs opacity-60 uppercase tracking-[0.5em]">准备下一次协议注入 (PREPARE FOR NEXT PROTOCOL)</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 max-w-7xl w-full relative z-10 overflow-y-auto pb-20 md:pb-0">
        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          onClick={startRun}
          className="p-4 md:p-6 border-2 border-cyan-500/30 bg-cyan-950/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400 hover:bg-cyan-900/20 transition-all group col-span-2 md:col-span-1"
        >
          <Zap className="w-10 h-10 md:w-12 md:h-12 text-cyan-400 mb-2 md:mb-4 group-hover:animate-pulse" />
          <h3 className="text-lg md:text-xl font-black italic uppercase">开始任务</h3>
          <p className="text-[10px] opacity-60 mt-1 md:mt-2 text-center">挑战病毒程序</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          onClick={() => {
            const allCards = Object.values(INITIAL_DECKS).flat();
            const randomCards = shuffle(allCards).slice(0, 3).map(c => {
              let basePrice = 50;
              if (c.rarity === 'UNCOMMON') basePrice = 100;
              if (c.rarity === 'RARE') basePrice = 180;
              if (c.rarity === 'STARTER') basePrice = 30;
              
              return { 
                ...c, 
                uid: generateUUID(),
                price: basePrice + Math.floor(Math.random() * 20)
              };
            });
            const relicsPool = shuffle(RELICS_DB).filter(r => !relics.find(pr => pr.id === r.id)).slice(0, 2);
            const consumablesPool = shuffle(CONSUMABLES_DB).slice(0, 3);
            const upgradesPool = shuffle(SHOP_UPGRADES_DB).filter(u => !purchasedUpgrades.includes(u.id)).slice(0, 2);
            const unownedPokemon = POKEMON_DB.filter(p => !unlockedPokemonIds.includes(p.id) && (!p.level || p.level === 1) && !p.isBoss && !p.isElite);
            const pokemonPool = shuffle(unownedPokemon).slice(0, 2).map(p => ({
              ...p, hp: p.maxHp, energy: p.maxEnergy, statusEffects: [], level: p.level || 1, xp: p.xp || 0, nextXp: p.nextXp || 100, price: p.rarity === 'LEGENDARY' ? 1000 : p.rarity === 'EPIC' ? 500 : p.rarity === 'RARE' ? 250 : 100
            }));
            setShopCards(randomCards as any);
            setShopRelics(relicsPool);
            setShopConsumables(consumablesPool);
            setShopUpgrades(upgradesPool);
            setShopPokemon(pokemonPool as EntityState[]);
            setPhase('SHOP');
          }}
          className="p-4 md:p-6 border-2 border-yellow-500/30 bg-yellow-950/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-yellow-400 hover:bg-yellow-900/20 transition-all group"
        >
          <ShoppingCart className="w-10 h-10 md:w-12 md:h-12 text-yellow-400 mb-2 md:mb-4 group-hover:animate-bounce" />
          <h3 className="text-lg md:text-xl font-black italic uppercase">黑市终端</h3>
          <p className="text-[10px] opacity-60 mt-1 md:mt-2 text-center text-yellow-400/80">CREDITS: {gold}</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          onClick={() => setPhase('DECK_VIEW')}
          className="p-4 md:p-6 border-2 border-purple-500/30 bg-purple-950/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-900/20 transition-all group"
        >
          <Database className="w-10 h-10 md:w-12 md:h-12 text-purple-400 mb-2 md:mb-4 group-hover:rotate-12 transition-transform" />
          <h3 className="text-lg md:text-xl font-black italic uppercase">背包系统</h3>
          <p className="text-[10px] opacity-60 mt-1 md:mt-2 text-center">协议数: {permanentDeck.length}</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          onClick={() => setPhase('COLLECTION')}
          className="p-4 md:p-6 border-2 border-yellow-500/30 bg-yellow-950/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-yellow-400 hover:bg-yellow-900/20 transition-all group"
        >
          <BookOpen className="w-10 h-10 md:w-12 md:h-12 text-yellow-400 mb-2 md:mb-4" />
          <h3 className="text-lg md:text-xl font-black italic uppercase">藏品库</h3>
          <p className="text-[10px] opacity-60 mt-1 md:mt-2 text-center">查看高级藏品</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          onClick={resetGame}
          className="p-4 md:p-6 border-2 border-red-500/30 bg-red-950/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-red-400 hover:bg-red-900/20 transition-all group"
        >
          <Trash2 className="w-10 h-10 md:w-12 md:h-12 text-red-400 mb-2 md:mb-4" />
          <h3 className="text-lg md:text-xl font-black italic uppercase">系统重置</h3>
          <p className="text-[10px] opacity-60 mt-1 md:mt-2 text-center">恢复出厂设置</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          onClick={joinPVPLobby}
          className="p-4 md:p-6 border-2 border-red-500/30 bg-red-950/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-red-400 hover:bg-red-900/20 transition-all group"
        >
          <Swords className="w-10 h-10 md:w-12 md:h-12 text-red-400 mb-2 md:mb-4 group-hover:animate-spin" />
          <h3 className="text-lg md:text-xl font-black italic uppercase">PVP 竞技场</h3>
          <p className="text-[10px] opacity-60 mt-1 md:mt-2 text-center">与其他玩家对战</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          onClick={() => {
            setDiagnosticStep('CHOICE');
            setShowDiagnostic(true);
          }}
          className="p-4 md:p-6 border-2 border-emerald-500/30 bg-emerald-950/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-900/20 transition-all group"
        >
          <ShieldCheck className="w-10 h-10 md:w-12 md:h-12 text-emerald-400 mb-2 md:mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg md:text-xl font-black italic uppercase">系统自检</h3>
          <p className="text-[10px] opacity-60 mt-1 md:mt-2 text-center">优化或修复</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          onClick={() => setShowEvolution(true)}
          className="p-6 border-2 border-emerald-500/30 bg-emerald-950/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-900/20 transition-all group"
        >
          <Activity className="w-12 h-12 text-emerald-400 mb-4 group-hover:animate-pulse" />
          <h3 className="text-xl font-black italic uppercase">进化实验室</h3>
          <p className="text-[10px] opacity-60 mt-2 text-center">提升协议等级</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          onClick={() => setPhase('START')}
          className="p-4 md:p-6 border-2 border-gray-500/30 bg-gray-950/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-900/20 transition-all group"
        >
          <X className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mb-2 md:mb-4 group-hover:animate-pulse" />
          <h3 className="text-lg md:text-xl font-black italic uppercase">终止协议</h3>
          <p className="text-[10px] opacity-60 mt-1 md:mt-2 text-center">重置系统状态</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          onClick={() => setShowGacha(true)}
          className="p-4 md:p-6 border-2 border-pink-500/30 bg-pink-950/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-pink-400 hover:bg-pink-900/20 transition-all group"
        >
          <Gift className="w-10 h-10 md:w-12 md:h-12 text-pink-400 mb-2 md:mb-4 group-hover:animate-bounce" />
          <h3 className="text-lg md:text-xl font-black italic uppercase">抽奖终端</h3>
          <p className="text-[10px] opacity-60 mt-1 md:mt-2 text-center">机会: {gachaTickets}</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          onClick={startEndlessTower}
          className="p-4 md:p-6 border-2 border-red-500/30 bg-red-950/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-red-400 hover:bg-red-900/20 transition-all group"
        >
          <Skull className="w-10 h-10 md:w-12 md:h-12 text-red-400 mb-2 md:mb-4 group-hover:scale-125 transition-transform" />
          <h3 className="text-lg md:text-xl font-black italic uppercase">无尽塔</h3>
          <p className="text-[10px] opacity-60 mt-1 md:mt-2 text-center">极限挑战</p>
        </motion.div>
      </div>

      <div className="flex gap-4 mt-8 relative z-10">
        <button 
          onClick={handleCheckIn}
          disabled={lastCheckIn === new Date().toISOString().split('T')[0]}
          className={`flex items-center gap-2 px-6 py-3 border-2 rounded-xl font-black uppercase tracking-widest transition-all
            ${lastCheckIn === new Date().toISOString().split('T')[0] 
              ? 'border-white/10 text-white/20 cursor-not-allowed' 
              : 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black shadow-[0_0_20px_rgba(250,204,21,0.2)]'}
          `}
        >
          <Gift className="w-5 h-5" />
          {lastCheckIn === new Date().toISOString().split('T')[0] ? '今日已签到' : '每日签到'}
        </button>

        <button 
          onClick={() => setShowTasks(true)}
          className="flex items-center gap-2 px-6 py-3 border-2 border-cyan-400 text-cyan-400 rounded-xl font-black uppercase tracking-widest hover:bg-cyan-400 hover:text-black transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)]"
        >
          <CheckCircle2 className="w-5 h-5" />
          任务协议
        </button>
      </div>

      <div className="mt-12 p-6 border border-white/10 rounded-2xl bg-white/5 flex items-center gap-6 z-10">
        <SafeImage 
          src={player?.img} 
          className="w-24 h-24 object-contain" 
          cdnIndex={cdnIndex} 
          pokemonId={player?.id}
        />
        <div>
          <h4 className="text-xl font-black italic" style={{ color: player?.color }}>{player?.name}</h4>
          <div className="flex gap-4 mt-2 text-[10px] font-mono opacity-60 uppercase tracking-widest">
            <span>HP: {player?.hp} / {player?.maxHp}</span>
            <span>ENERGY: {player?.maxEnergy}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCollection = () => {
    return (
      <div className="h-full w-full bg-[#05050a] text-white p-4 md:p-8 overflow-y-auto custom-scrollbar">
        <button onClick={() => setPhase('HUB')} className="mb-4 md:mb-8 p-2 border border-white/20 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <h2 className="text-2xl md:text-4xl font-black italic text-yellow-400 mb-4 md:mb-8">藏品库 (COLLECTION)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          {COLLECTION_DB.map((relic, i) => (
            <div key={relic.id || i} className="bg-white/5 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/10">
              <h4 className="text-lg md:text-xl font-black italic text-white uppercase">{relic.name}</h4>
              <p className="text-[10px] md:text-xs text-white/60 mt-1 md:mt-2">{relic.desc}</p>
              <span className="text-[8px] md:text-[10px] font-mono text-yellow-400 uppercase mt-2 md:mt-4 block">{relic.rarity}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderShop = () => {
    const hasDiscount = purchasedUpgrades.includes('bulk_discount');
    const getPrice = (base: number) => hasDiscount ? Math.floor(base * 0.85) : base;
    const refreshCost = purchasedUpgrades.includes('data_miner') ? 25 : 50;

    return (
      <div className="h-full w-full bg-[#05050a] text-white flex flex-col items-center overflow-hidden relative">
        {/* Sticky Header with improved contrast */}
        <div className="shrink-0 w-full bg-[#05050a]/90 backdrop-blur-xl border-b border-white/10 py-4 md:py-8 z-30 flex flex-col items-center relative">
          <button 
            onClick={() => setPhase(currentNodeId ? 'MAP' : 'HUB')}
            className="absolute top-4 md:top-8 right-4 md:right-8 p-2 border border-white/20 rounded-full hover:bg-white/10 transition-all z-50 group"
          >
            <X className="w-5 h-5 md:w-6 md:h-6 text-white/40 group-hover:text-white transition-colors" />
          </button>
          
          <div className="absolute top-4 md:top-8 left-4 md:left-8 flex items-center gap-2 md:gap-4">
            <button 
              onClick={refreshShop}
              className="flex items-center gap-1 md:gap-2 px-3 md:px-6 py-1.5 md:py-2 bg-cyan-900/40 border border-cyan-500/50 rounded-full text-[8px] md:text-[10px] font-black uppercase hover:bg-cyan-500 hover:text-black transition-all group"
            >
              <RefreshCw className="w-3 h-3 md:w-4 md:h-4 group-hover:rotate-180 transition-transform duration-500" />
              刷新商店 ({refreshCost})
            </button>
          </div>

          <h2 className="text-2xl md:text-4xl lg:text-6xl font-black italic tracking-tighter text-yellow-400 mb-2 md:mb-3 glitch-text mt-10 md:mt-0">黑市终端</h2>
          <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-1.5 md:py-2 bg-yellow-400/10 border border-yellow-400/30 rounded-full">
            <Coins className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" />
            <span className="font-mono text-xs md:text-sm uppercase tracking-[0.1em] md:tracking-[0.2em] text-yellow-400">可用信用点: {gold}</span>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 w-full overflow-y-auto custom-scrollbar px-4 md:px-8 pt-4 md:pt-8 pb-32 md:pb-48">
          <div className="w-full max-w-6xl mx-auto space-y-8 md:space-y-16">
            {/* Shop Pokemon Section */}
            {shopPokemon && shopPokemon.length > 0 && (
              <section>
                <h3 className="text-lg md:text-2xl font-black italic text-purple-400 uppercase mb-4 md:mb-8 border-l-4 border-purple-400 pl-2 md:pl-4">黑市宝可梦 (BLACK MARKET POKEMON)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                  {shopPokemon.map((pokemon, i) => {
                    const price = getPrice(pokemon.price || 500);
                    return (
                      <div key={pokemon.id || i} className="flex flex-col items-center gap-2 md:gap-4 bg-white/5 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/10 hover:border-purple-500/30 transition-all group relative">
                        <SafeImage 
                          src={pokemon.img} 
                          alt={pokemon.name} 
                          className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-2xl" 
                          cdnIndex={cdnIndex} 
                          pokemonId={pokemon.id}
                        />
                        <div className="text-center">
                          <h4 className="text-xl font-black italic text-white">{pokemon.name}</h4>
                          <p className="text-xs text-white/50 mt-1">HP: {pokemon.maxHp} | 能量: {pokemon.maxEnergy}</p>
                        </div>
                        <button
                          onClick={() => {
                            if (gold >= price) {
                              setGold(g => g - price);
                              setUnlockedPokemonIds(prev => [...prev, pokemon.id]);
                              setParty(prev => [...prev, { ...pokemon, hp: pokemon.maxHp, energy: pokemon.maxEnergy, statusEffects: [], level: pokemon.level || 1, xp: pokemon.xp || 0, nextXp: pokemon.nextXp || 100 }]);
                              
                              const starterCards = INITIAL_DECKS[pokemon.id] || INITIAL_DECKS['default'];
                              const newCards = starterCards.map(c => ({ ...c, uid: generateUUID(), isEquipped: true } as Card));
                              setPermanentDeck(prev => [...prev, ...newCards]);
                              
                              setShopPokemon(prev => prev.filter(p => p.id !== pokemon.id));
                              addFloatingText(`购买成功: ${pokemon.name}`, '#a855f7', 'PLAYER');
                            } else {
                              addFloatingText(`信用点不足 (${price})`, '#ef4444', 'PLAYER');
                            }
                          }}
                          className={`w-full py-3 rounded-xl font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                            gold >= price 
                              ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500 hover:text-white border border-purple-500/50' 
                              : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                          }`}
                        >
                          <Coins className="w-4 h-4" />
                          {price} 信用点
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Shop Upgrades Section */}
            <section>
              <h3 className="text-2xl font-black italic text-emerald-400 uppercase mb-8 border-l-4 border-emerald-400 pl-4">系统升级 (SHOP UPGRADES)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {shopUpgrades?.map((upgrade, i) => (
                  <div key={upgrade.id || i} className="flex items-center gap-6 bg-white/5 p-6 rounded-3xl border border-white/10 hover:border-emerald-500/30 transition-all group">
                    <div className="w-24 h-24 bg-emerald-950/20 border-2 border-emerald-500/30 rounded-2xl flex items-center justify-center group-hover:border-emerald-400 transition-all shrink-0">
                      {upgrade.icon === 'ShoppingCart' && <ShoppingCart className="w-12 h-12 text-emerald-400" />}
                      {upgrade.icon === 'Search' && <Search className="w-12 h-12 text-emerald-400" />}
                      {upgrade.icon === 'Star' && <Star className="w-12 h-12 text-emerald-400" />}
                      {upgrade.icon === 'Lock' && <Lock className="w-12 h-12 text-emerald-400" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-black italic text-white uppercase">{upgrade.name}</h4>
                      <p className="text-xs text-white/60 mt-2 leading-relaxed">{upgrade.desc}</p>
                      <button 
                        onClick={() => {
                          const price = getPrice(upgrade.price);
                          if (gold >= price) {
                            setGold(prev => prev - price);
                            setPurchasedUpgrades(prev => [...prev, upgrade.id]);
                            setShopUpgrades(prev => prev.filter(u => u.id !== upgrade.id));
                            addFloatingText(`已激活: ${upgrade.name}`, '#10b981', 'PLAYER');
                          }
                        }}
                        disabled={gold < getPrice(upgrade.price)}
                        className={`mt-5 px-8 py-3 border-2 font-black uppercase text-[10px] tracking-widest transition-all rounded-lg
                          ${gold >= getPrice(upgrade.price) ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black shadow-[0_0_15px_rgba(250,204,21,0.2)]' : 'border-white/10 text-white/20 cursor-not-allowed'}
                        `}
                      >
                        购买: {getPrice(upgrade.price)}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Cards Section */}
            <section>
              <h3 className="text-2xl font-black italic text-cyan-400 uppercase mb-8 border-l-4 border-cyan-400 pl-4">协议卡牌 (PROTOCOLS)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {shopCards?.map((card: any, i) => {
                  const price = getPrice(card.price);
                  return (
                    <div key={card.uid || i} className="flex flex-col items-center gap-6 bg-white/5 p-6 rounded-3xl border border-white/10 hover:border-cyan-500/30 transition-all group">
                      {renderCard(card, i, { isStatic: true })}
                      <button 
                        onClick={() => {
                          if (gold >= price) {
                            setGold(prev => prev - price);
                            setPermanentDeck(prev => [...prev, { ...card, uid: generateUUID(), isEquipped: true }]);
                            setShopCards(prev => prev.filter(c => c.uid !== card.uid));
                            updateTaskProgress('GOLD_SPENT', price);
                          }
                        }}
                        disabled={gold < price}
                        className={`w-full py-4 border-2 font-black uppercase text-xs tracking-widest transition-all rounded-xl
                          ${gold >= price ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black shadow-[0_0_15px_rgba(250,204,21,0.2)]' : 'border-white/10 text-white/20 cursor-not-allowed'}
                        `}
                      >
                        购买: {price}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Relics Section */}
            <section>
              <h3 className="text-2xl font-black italic text-purple-400 uppercase mb-8 border-l-4 border-purple-400 pl-4">永久插件 (RELICS)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {shopRelics?.map((relic, i) => {
                  const price = getPrice(relic.price || 150);
                  return (
                    <div key={relic.id || i} className="flex items-center gap-6 bg-white/5 p-6 rounded-3xl border border-white/10 hover:border-purple-500/30 transition-all group">
                      <div className="w-24 h-24 bg-purple-950/20 border-2 border-purple-500/30 rounded-2xl flex items-center justify-center group-hover:border-purple-400 transition-all shrink-0">
                        {relic.icon === 'Database' && <Database className="w-12 h-12 text-purple-400" />}
                        {relic.icon === 'Activity' && <Activity className="w-12 h-12 text-purple-400" />}
                        {relic.icon === 'Zap' && <Zap className="w-12 h-12 text-purple-400" />}
                        {relic.icon === 'Shield' && <Shield className="w-12 h-12 text-purple-400" />}
                        {relic.icon === 'Swords' && <Swords className="w-12 h-12 text-purple-400" />}
                        {relic.icon === 'Coins' && <Coins className="w-12 h-12 text-purple-400" />}
                        {relic.icon === 'HeartPulse' && <HeartPulse className="w-12 h-12 text-purple-400" />}
                        {relic.icon === 'Search' && <Search className="w-12 h-12 text-purple-400" />}
                        {relic.icon === 'Share2' && <Share2 className="w-12 h-12 text-purple-400" />}
                        {relic.icon === 'Heart' && <Heart className="w-12 h-12 text-purple-400" />}
                        {relic.icon === 'Coffee' && <Coffee className="w-12 h-12 text-purple-400" />}
                        {relic.icon === 'ShieldAlert' && <ShieldAlert className="w-12 h-12 text-purple-400" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-black italic text-white uppercase">{relic.name}</h4>
                        <p className="text-xs text-white/60 mt-2 leading-relaxed">{relic.desc}</p>
                        <button 
                          onClick={() => {
                            if (gold >= price) {
                              setGold(prev => prev - price);
                              setRelics(prev => [...prev, relic]);
                              setShopRelics(prev => prev.filter(r => r.id !== relic.id));
                              updateTaskProgress('GOLD_SPENT', price);
                            }
                          }}
                          disabled={gold < price}
                          className={`mt-5 px-8 py-3 border-2 font-black uppercase text-[10px] tracking-widest transition-all rounded-lg
                            ${gold >= price ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black shadow-[0_0_15px_rgba(250,204,21,0.2)]' : 'border-white/10 text-white/20 cursor-not-allowed'}
                          `}
                        >
                          购买: {price}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Consumables Section */}
            <section>
              <h3 className="text-2xl font-black italic text-green-400 uppercase mb-8 border-l-4 border-green-400 pl-4">消耗性补给 (CONSUMABLES)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {shopConsumables?.map((item, i) => {
                  const price = getPrice(item.price);
                  return (
                    <div key={item.id || i} className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:border-green-500/30 transition-all flex flex-col items-center text-center group">
                      <div className="w-20 h-20 bg-green-950/20 border-2 border-green-500/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        {item.icon === 'Heart' && <Heart className="w-10 h-10 text-green-400" />}
                        {item.icon === 'HeartPulse' && <HeartPulse className="w-10 h-10 text-green-400" />}
                        {item.icon === 'Activity' && <Activity className="w-10 h-10 text-green-400" />}
                        {item.icon === 'Zap' && <Zap className="w-10 h-10 text-green-400" />}
                        {item.icon === 'RefreshCw' && <RefreshCw className="w-10 h-10 text-green-400" />}
                        {item.icon === 'Swords' && <Swords className="w-10 h-10 text-green-400" />}
                        {item.icon === 'Shield' && <Shield className="w-10 h-10 text-green-400" />}
                        {item.icon === 'Star' && <Star className="w-10 h-10 text-green-400" />}
                        {item.icon === 'Circle' && <Circle className="w-10 h-10 text-green-400" />}
                        {item.icon === 'Disc' && <Disc className="w-10 h-10 text-green-400" />}
                        {item.icon === 'Crosshair' && <Crosshair className="w-10 h-10 text-green-400" />}
                        {item.icon === 'ShieldCheck' && <ShieldCheck className="w-10 h-10 text-green-400" />}
                      </div>
                      <h4 className="text-xl font-black italic text-white uppercase">{item.name}</h4>
                      <p className="text-xs text-white/60 mt-2 h-10 leading-relaxed">{item.desc}</p>
                      <button 
                        onClick={() => {
                          if (gold >= price) {
                            setGold(prev => prev - price);
                            setInventory(prev => [...prev, item]);
                            updateTaskProgress('GOLD_SPENT', price);
                          }
                        }}
                        disabled={gold < price}
                        className={`mt-6 w-full py-3 border-2 font-black uppercase text-[10px] tracking-widest transition-all rounded-lg
                          ${gold >= price ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black shadow-[0_0_15px_rgba(250,204,21,0.2)]' : 'border-white/10 text-white/20 cursor-not-allowed'}
                        `}
                      >
                        购买: {price}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>

        {/* Fixed Navigation with safe area */}
        <div className="shrink-0 w-full py-10 bg-gradient-to-t from-[#05050a] via-[#05050a]/80 to-transparent flex justify-center z-40 pointer-events-none">
          <button 
            onClick={() => setPhase('MAP')}
            className="pointer-events-auto px-20 py-5 bg-yellow-400 text-black border-2 border-yellow-400 text-sm font-black uppercase tracking-[0.4em] hover:bg-black hover:text-yellow-400 transition-all rounded-2xl shadow-[0_0_50px_rgba(250,204,21,0.3)]"
          >
            返回地图 (EXIT SHOP)
          </button>
        </div>
      </div>
    );
  };

  const renderRest = () => (
    <div className="h-full w-full bg-[#05050a] p-4 md:p-8 text-white flex flex-col items-center justify-center overflow-y-auto custom-scrollbar">
      <div className="mb-8 md:mb-12 text-center">
        <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter text-green-400 mb-2 glitch-text">数据碎片整理</h2>
        <p className="font-mono text-[10px] md:text-xs opacity-60 uppercase tracking-[0.2em] md:tracking-[0.4em]">选择一项维护操作</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-12">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          onClick={() => {
            setPlayer(p => p ? { ...p, hp: Math.min(p.maxHp, p.hp + Math.floor(p.maxHp * 0.5)) } : null);
            setPhase('MAP');
          }}
          className="w-full max-w-[250px] md:w-64 h-48 md:h-64 border-2 border-green-500/30 bg-green-950/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-green-400 transition-all group"
        >
          <Activity className="w-12 h-12 md:w-16 md:h-16 text-green-400 mb-2 md:mb-4 group-hover:animate-pulse" />
          <h3 className="text-lg md:text-xl font-black italic uppercase">系统修复</h3>
          <p className="text-[10px] opacity-60 mt-1 md:mt-2">恢复 50% 系统完整度</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05 }}
          onClick={() => {
            // Simple upgrade logic: pick a random card in permanent deck and add +3 damage or +3 shield
            setPermanentDeck(prev => {
              const newDeck = [...prev];
              if (newDeck.length === 0) return prev;
              const idx = Math.floor(Math.random() * newDeck.length);
              const card = { ...newDeck[idx] };
              if (card.damage) card.damage += 3;
              if (card.shield) card.shield += 3;
              card.name += '+';
              newDeck[idx] = card;
              return newDeck;
            });
            setPhase('MAP');
          }}
          className="w-full max-w-[250px] md:w-64 h-48 md:h-64 border-2 border-cyan-500/30 bg-cyan-950/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400 transition-all group"
        >
          <Zap className="w-12 h-12 md:w-16 md:h-16 text-cyan-400 mb-2 md:mb-4 group-hover:animate-pulse" />
          <h3 className="text-lg md:text-xl font-black italic uppercase">内核优化</h3>
          <p className="text-[10px] opacity-60 mt-1 md:mt-2 text-center px-4">随机强化背包系统中的一张卡牌</p>
        </motion.div>
      </div>
    </div>
  );

  const renderGameOver = () => (
    <div className="h-full w-full bg-[#05050a] flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-red-900/10 pointer-events-none" />
      <motion.h2 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-5xl md:text-8xl font-black italic tracking-tighter mb-4 text-red-500 drop-shadow-[0_0_30px_rgba(255,0,0,0.5)] text-center"
      >
        系统崩溃 (CRASH)
      </motion.h2>
      <p className="font-mono text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.5em] text-red-400/60 uppercase mb-8 md:mb-12 text-center">连接已断开，数据已上传至 HUB</p>
      <button 
        onClick={() => setPhase('HUB')}
        className="px-8 md:px-12 py-3 md:py-4 bg-transparent border-2 border-red-500 text-red-400 text-sm md:text-base font-black uppercase tracking-widest hover:bg-red-500 hover:text-black transition-all shadow-[0_0_30px_rgba(255,0,0,0.2)]"
      >
        返回作战中心
      </button>
    </div>
  );

  const renderVictory = () => (
    <div className="h-full w-full bg-cyan-950/20 flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-black opacity-80 z-0" />
      <div className="relative z-10 text-center">
        <motion.h2 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="text-5xl md:text-8xl font-black italic tracking-tighter text-cyan-400 mb-4 glitch-text"
        >
          防火墙已突破
        </motion.h2>
        <p className="font-mono text-[10px] md:text-sm tracking-[0.2em] md:tracking-[0.8em] text-cyan-400 uppercase mb-8 md:mb-12">最高权限已获得 // 任务完成</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 md:px-12 py-3 md:py-4 bg-cyan-600 text-white text-sm md:text-base font-black uppercase tracking-widest hover:bg-cyan-500 transition-all shadow-[0_0_30px_rgba(0,255,255,0.5)]"
        >
          返回主界面
        </button>
      </div>
    </div>
  );

  const renderCard = (card: Card, index: number, options?: { isStatic?: boolean, onClick?: () => void }) => {
    const isPlayable = !options?.isStatic && turn === 'PLAYER' && !isAnimating && (player?.energy || 0) >= card.cost;
    const typeColors = {
      ATTACK: 'border-red-500/50 text-red-400 bg-red-950/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
      SKILL: 'border-blue-500/50 text-blue-400 bg-blue-950/20 shadow-[0_0_10px_rgba(96,165,250,0.2)]',
      POWER: 'border-yellow-500/50 text-yellow-400 bg-yellow-950/20 shadow-[0_0_10px_rgba(250,204,21,0.2)]',
      STATUS: 'border-gray-500/50 text-gray-400 bg-gray-950/20 shadow-[0_0_10px_rgba(156,163,175,0.2)]',
      CURSE: 'border-purple-900/50 text-purple-400 bg-purple-950/40 shadow-[0_0_10px_rgba(147,51,234,0.2)]',
    };

    return (
      <motion.div
        key={card.uid}
        layout
        initial={{ y: 100, opacity: 0, rotate: (Math.random() - 0.5) * 10 }}
        animate={{ y: 0, opacity: 1 }}
        whileHover={isPlayable ? { 
          y: -60, 
          scale: 1.15, 
          zIndex: 50,
          boxShadow: '0 0 30px rgba(0,255,255,0.3)'
        } : (options?.isStatic ? {} : { scale: 1.02 })}
        onClick={options?.onClick || (options?.isStatic ? undefined : () => executeCard(card))}
        className={`relative w-28 md:w-36 h-40 md:h-52 rounded-xl border-2 p-2 md:p-3 flex flex-col cursor-pointer transition-all duration-300 shrink-0
          ${typeColors[card.type]} ${isPlayable || options?.isStatic ? 'hover:border-cyan-400' : 'opacity-40 grayscale cursor-not-allowed'}
          backdrop-blur-xl overflow-hidden group`}
      >
        {/* Card Scanline */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px]" />
        
        <div className="flex justify-between items-start mb-1 md:mb-2 relative z-10">
          <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest opacity-70">{card.type}</span>
          <div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-black/60 flex items-center justify-center font-black text-xs md:text-sm border border-white/20 text-white shadow-inner">
            {card.cost}
          </div>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
          <h3 className="font-black italic text-xs md:text-sm mb-1 md:mb-2 uppercase tracking-tight group-hover:scale-110 transition-transform">{card.name}</h3>
          <div className="w-full h-px bg-white/10 mb-1 md:mb-2" />
          <p className="text-[8px] md:text-[10px] leading-tight opacity-90 font-mono px-1">{card.desc}</p>
        </div>

        <div className="mt-auto flex justify-between items-center opacity-40 text-[5px] md:text-[7px] font-mono relative z-10">
          <span className="flex items-center gap-1"><Database className="w-2 h-2" /> {card.rarity}</span>
          <span>V-PROTOCOL</span>
        </div>

        {/* Glitch Overlay on Hover */}
        <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        
        {/* Pixel Fragments Decor */}
        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white/5 rotate-45 group-hover:bg-cyan-500/20 transition-colors" />
      </motion.div>
    );
  };

  const renderDeckView = () => {
    const equippedCount = permanentDeck.filter(c => c.isEquipped !== false).length;
    
    return (
      <div className="h-full w-full bg-[#05050a] p-4 md:p-8 text-white flex flex-col items-center overflow-y-auto no-scrollbar relative">
        <button 
          onClick={() => setPhase('HUB')}
          className="absolute top-4 md:top-8 right-4 md:right-8 p-2 border border-white/20 rounded-full hover:bg-white/10 transition-all z-50"
        >
          <Trash2 className="w-5 h-5 md:w-6 md:h-6 text-white/40 rotate-45" />
        </button>

        <div className="mb-8 md:mb-12 text-center mt-12 md:mt-0">
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter text-purple-400 mb-2 glitch-text">背包系统 (BACKPACK)</h2>
          <div className="flex flex-col items-center gap-2">
            <p className="font-mono text-[10px] md:text-xs opacity-60 uppercase tracking-[0.2em] md:tracking-[0.4em]">当前加载的协议数量: {permanentDeck.length}</p>
            <p className="font-mono text-[8px] md:text-[10px] text-cyan-400 uppercase tracking-[0.1em] md:tracking-[0.2em]">已装载战斗协议: {equippedCount} / {permanentDeck.length}</p>
            <p className="text-[8px] md:text-[10px] text-white/40 italic mt-1 md:mt-2">点击卡牌切换装载状态 (至少保留5张以保证系统运行)</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 max-w-7xl mx-auto mb-24">
          {permanentDeck?.map((card, i) => {
            const isEquipped = card.isEquipped !== false;
            return (
              <div 
                key={card.uid} 
                className={`scale-90 origin-top transition-all duration-300 relative group ${!isEquipped ? 'opacity-40 grayscale' : ''}`}
              >
                {renderCard(card, i, { 
                  isStatic: true, 
                  onClick: () => {
                    if (isEquipped && equippedCount <= 5) {
                      addFloatingText('系统警告: 至少需要5个协议', '#ef4444', 'PLAYER');
                      return;
                    }
                    setPermanentDeck(prev => prev.map(c => c.uid === card.uid ? { ...c, isEquipped: !isEquipped } : c));
                  }
                })}
                <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center z-50 transition-all pointer-events-none
                  ${isEquipped ? 'bg-cyan-500 border-cyan-400' : 'bg-black/80 border-white/20'}
                `}>
                  {isEquipped ? <CheckCircle2 className="w-4 h-4 text-white" /> : <div className="w-2 h-2 rounded-full bg-white/20" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <button 
            onClick={() => setPhase('HUB')}
            className="px-16 py-4 bg-purple-950/20 border-2 border-purple-500/30 text-sm font-black uppercase tracking-[0.3em] hover:bg-purple-900/40 hover:border-purple-400 transition-all backdrop-blur-md rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.1)]"
          >
            退出背包系统
          </button>
        </div>
      </div>
    );
  };

  const renderBackpack = () => {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#0a0a15] border-2 border-cyan-500/50 p-6 rounded-2xl w-full max-w-md relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_center,#06b6d4_0%,transparent_70%)]" />
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h2 className="text-2xl font-black italic tracking-tighter text-cyan-400 uppercase">战术背包 (TACTICAL BACKPACK)</h2>
            <button onClick={() => setShowBackpack(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 relative z-10 custom-scrollbar">
            {inventory.length === 0 ? (
              <div className="text-center py-8 opacity-40 italic font-mono">背包为空 (EMPTY)</div>
            ) : (
              inventory?.map((item, idx) => (
                <div 
                  key={`${item.id}-${idx}`}
                  className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-4 hover:border-cyan-500/50 transition-all group"
                >
                  <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    {item.icon === 'Heart' && <Heart className="w-6 h-6 text-cyan-400" />}
                    {item.icon === 'HeartPulse' && <HeartPulse className="w-6 h-6 text-cyan-400" />}
                    {item.icon === 'Activity' && <Activity className="w-6 h-6 text-cyan-400" />}
                    {item.icon === 'Zap' && <Zap className="w-6 h-6 text-cyan-400" />}
                    {item.icon === 'RefreshCw' && <RefreshCw className="w-6 h-6 text-cyan-400" />}
                    {item.icon === 'Swords' && <Swords className="w-6 h-6 text-cyan-400" />}
                    {item.icon === 'Shield' && <Shield className="w-6 h-6 text-cyan-400" />}
                    {item.icon === 'Star' && <Star className="w-6 h-6 text-cyan-400" />}
                    {item.icon === 'Circle' && <Circle className="w-6 h-6 text-cyan-400" />}
                    {item.icon === 'Disc' && <Disc className="w-6 h-6 text-cyan-400" />}
                    {item.icon === 'Crosshair' && <Crosshair className="w-6 h-6 text-cyan-400" />}
                    {item.icon === 'ShieldCheck' && <ShieldCheck className="w-6 h-6 text-cyan-400" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-black text-sm uppercase tracking-wide">{item.name}</div>
                    <div className="text-[10px] opacity-60 font-mono">{item.desc}</div>
                  </div>
                  <button 
                    onClick={() => {
                      useConsumable(item, idx);
                      setShowBackpack(false);
                    }}
                    disabled={turn !== 'PLAYER' || isAnimating}
                    className="px-4 py-2 bg-cyan-500 text-black font-black text-xs rounded-lg hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase"
                  >
                    使用 (USE)
                  </button>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  const renderPartySwitch = () => {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#0a0a15] border-2 border-purple-500/50 p-4 md:p-6 rounded-2xl w-full max-w-md relative overflow-hidden max-h-[90vh] flex flex-col"
        >
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_center,#a855f7_0%,transparent_70%)]" />
          <div className="flex justify-between items-center mb-4 md:mb-6 relative z-10 shrink-0">
            <h2 className="text-xl md:text-2xl font-black italic tracking-tighter text-purple-400 uppercase">终端切换 (TERMINAL SWITCH)</h2>
            <button onClick={() => setShowPartySwitch(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2 md:gap-3 relative z-10 overflow-y-auto custom-scrollbar pr-2">
            {party?.map((p, idx) => (
              <div 
                key={`${p.id}-${idx}`}
                className={`p-2 md:p-3 border rounded-xl flex items-center gap-2 md:gap-4 transition-all ${idx === activePokemonIndex ? 'bg-purple-500/20 border-purple-500' : 'bg-white/5 border-white/10 hover:border-purple-500/50'}`}
              >
                <SafeImage 
                  src={p.img} 
                  alt={p.name} 
                  className="w-10 h-10 md:w-12 md:h-12 object-contain shrink-0" 
                  cdnIndex={cdnIndex} 
                  pokemonId={p.id}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <div className="font-black text-xs md:text-sm uppercase tracking-wide truncate" style={{ color: p.color }}>{p.name}</div>
                    <div className="text-[8px] md:text-[10px] font-black text-yellow-400 shrink-0 ml-2">LVL {p.level}</div>
                  </div>
                  <div className="h-1.5 md:h-2 bg-white/5 rounded-full overflow-hidden border border-white/10 mt-1">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600" style={{ width: `${(p.hp / p.maxHp) * 100}%` }} />
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-yellow-400" style={{ width: `${(p.xp / p.nextXp) * 100}%` }} />
                  </div>
                  <div className="flex justify-between text-[6px] md:text-[8px] font-mono opacity-60 mt-1">
                    <span>HP: {p.hp} / {p.maxHp}</span>
                    <span>XP: {p.xp} / {p.nextXp}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  {idx === activePokemonIndex ? (
                    <div className="px-2 md:px-3 py-1 bg-purple-500 text-black font-black text-[8px] md:text-[10px] rounded uppercase">当前 (ACTIVE)</div>
                  ) : (
                    <button 
                      onClick={() => switchPokemon(idx)}
                      disabled={p.hp <= 0 || turn !== 'PLAYER' || isAnimating}
                      className="px-2 md:px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/50 font-black text-[8px] md:text-[10px] rounded hover:bg-purple-500 hover:text-black disabled:opacity-50 transition-all uppercase"
                    >
                      切换 (SWAP)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-[8px] md:text-[10px] font-mono opacity-40 text-center uppercase shrink-0">切换终端消耗 1 点算力 (COSTS 1 ENERGY)</div>
        </motion.div>
      </div>
    );
  };

  const startRun = () => {
    setFloor(1);
    setMap(generateMap(5));
    setPhase('MAP');
    setCurrentNodeId(null);
    // Heal all Pokemon to full HP when starting a new run
    setParty(prev => prev.map(p => ({ ...p, hp: p.maxHp, shield: 0, statusEffects: [] })));
    if (player) {
      setPlayer({ ...player, hp: player.maxHp, shield: 0, statusEffects: [] });
    }
  };

  const renderBattle = () => {
    if (!player || !enemy) return null;
    
    return (
      <div 
        ref={containerRef}
        className={`h-full w-full bg-[#05050a] flex flex-col text-white relative overflow-hidden ${isGlitching ? 'animate-pulse' : ''}`}
        style={{ 
          transform: isShaking ? `translate(${(Math.random()-0.5)*isShaking}px, ${(Math.random()-0.5)*isShaking}px)` : 'none'
        }}
      >
          {/* Scanline Effect */}
          <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
          
          {/* Modals */}
          {showBackpack && renderBackpack()}
          {showPartySwitch && renderPartySwitch()}
          
          {renderInventory()}
          {renderTasks()}
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />

          {/* Floating Texts */}
          <AnimatePresence>
            {floatingTexts?.map(t => (
              <motion.div
                key={t.id}
                initial={{ opacity: 1, y: t.y, x: t.x }}
                animate={{ opacity: 0, y: t.y - 100 }}
                className="absolute left-1/2 top-1/2 z-[100] font-black text-3xl italic pointer-events-none"
                style={{ color: t.color, textShadow: '0 0 10px rgba(0,0,0,0.5)' }}
              >
                {t.text}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Top Bar: Enemy */}
          <div className="p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-start gap-4 md:gap-0 relative z-20">
            <div className="flex flex-col gap-2 w-full md:w-64">
              <div className="flex justify-between items-end">
                <span className="text-xs font-mono opacity-60 uppercase tracking-widest">敌方协议 (ENEMY PROTOCOL)</span>
                <span className="text-xl font-black italic" style={{ color: enemy?.color }}>{enemy?.name}</span>
              </div>
              <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 relative shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                <motion.div 
                  animate={{ width: `${(enemy!.hp / enemy!.maxHp) * 100}%` }}
                  className="h-full bg-gradient-to-r from-red-600 via-pink-500 to-red-600 bg-[length:200%_100%] animate-shimmer"
                />
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black drop-shadow-md">
                  {enemy?.hp} / {enemy?.maxHp}
                </div>
              </div>
              <div className="flex gap-2">
                {enemy?.shield! > 0 && (
                  <div className="bg-blue-600 px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1">
                    <Shield className="w-3 h-3" /> {enemy?.shield}
                  </div>
                )}
                {enemy?.statusEffects?.map((s, i) => <StatusIcon key={i} effect={s} />)}
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
               <div className="flex items-center gap-2 w-full justify-between md:justify-end">
                 <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${turn === 'PLAYER' ? 'border-cyan-400 text-cyan-400 bg-cyan-950/40 animate-pulse' : 'border-red-400 text-red-400 bg-red-950/40'}`}>
                   {turn === 'PLAYER' ? '玩家回合 (PLAYER TURN)' : '敌方回合 (ENEMY TURN)'}
                 </div>
                 <div className="text-[10px] font-mono opacity-40 uppercase hidden md:block">System Time: {new Date().toLocaleTimeString()}</div>
               </div>
               <div className="flex gap-2 mb-2">
                  {relics?.map(r => (
                    <div key={r.id} className="w-8 h-8 rounded border border-cyan-400/30 bg-cyan-950/20 flex items-center justify-center group relative cursor-help">
                      <Database className="w-4 h-4 text-cyan-400" />
                      <div className="absolute top-full right-0 mt-2 w-48 p-2 bg-black/90 border border-cyan-400 text-[10px] hidden group-hover:block z-50">
                        <div className="font-black text-cyan-400 uppercase mb-1">{r.name}</div>
                        <div className="opacity-70">{r.desc}</div>
                      </div>
                    </div>
                  ))}
               </div>
               <div className="flex gap-4">
                  <div className="text-right">
                     <div className="text-[8px] opacity-40 uppercase">回收站 (RECYCLE)</div>
                     <div className="text-xl font-black italic text-pink-500">{discard.length}</div>
                  </div>
                  <div className="text-right">
                     <div className="text-[8px] opacity-40 uppercase">背包系统 (BACKPACK)</div>
                     <div className="text-xl font-black italic text-cyan-500">{deck.length}</div>
                  </div>
               </div>
            </div>
          </div>

          {/* Battle Arena */}
          <div className="flex-1 flex flex-col md:flex-row items-center justify-center md:justify-around relative px-4 md:px-12 gap-8 md:gap-0">
            {/* Skill Name Overlay */}
            <AnimatePresence>
              {activeSkillName && (
                <motion.div
                  initial={{ opacity: 0, x: -50, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 50, scale: 0.9 }}
                  className="absolute top-1/4 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
                >
                  <div className="bg-black/60 border border-cyan-500/50 rounded-full backdrop-blur-sm px-4 md:px-8 py-2 shadow-[0_0_30px_rgba(0,255,255,0.2)] flex items-center gap-2 md:gap-4">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <div className="text-sm md:text-xl font-black italic tracking-wider text-white uppercase whitespace-nowrap">
                      {activeSkillName}
                    </div>
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-cyan-400 animate-pulse" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Enemy Character (Top on mobile) */}
            <div className="relative flex flex-col items-center order-1 md:order-3">
              <AnimatePresence>
                {enemyDialogue && <SpeechBubble text={enemyDialogue} side="right" />}
              </AnimatePresence>
              <IntentDisplay intent={enemy?.intent} />
              <motion.div
                animate={
                  enemyAnimation === 'attack' ? { x: [0, -150, 0], scale: [1, 1.2, 1] } :
                  enemyAnimation === 'hit' ? { x: [5, -5, 5, -5, 0], filter: ['brightness(1)', 'brightness(2)', 'brightness(1)'] } :
                  enemyAnimation === 'skill' ? { y: [-10, 0], scale: [1, 1.1, 1], filter: ['hue-rotate(0deg)', 'hue-rotate(-180deg)', 'hue-rotate(0deg)'] } :
                  { y: [0, -10, 0] }
                }
                transition={
                  enemyAnimation === 'idle' ? { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 } :
                  { duration: 0.5 }
                }
                className="relative"
              >
                <SafeImage 
                  src={enemy?.img || ''} 
                  alt={enemy?.name || ''} 
                  className={`w-32 h-32 md:w-64 md:h-64 object-contain drop-shadow-[0_0_50px_rgba(255,0,0,0.2)] ${isCapturing ? 'capture-shake' : ''}`} 
                  cdnIndex={cdnIndex}
                />
                {activeVfx?.target === 'ENEMY' && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0, rotate: 0 }}
                    animate={{ scale: [0, 2, 1.5], opacity: [0, 1, 0], rotate: [0, 90, 180] }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <div className={`vfx-${activeVfx.type}`} />
                  </motion.div>
                )}
              </motion.div>
              <div className="mt-2 md:mt-4 flex flex-col items-center">
                <span className="text-sm md:text-xl font-black italic uppercase tracking-tighter" style={{ color: enemy?.color }}>{enemy?.name}</span>
                <div className="flex gap-1 mt-1 md:mt-2">
                  {enemy?.statusEffects?.map((s, i) => <StatusIcon key={i} effect={s} />)}
                </div>
              </div>
            </div>

            {/* VS Divider */}
            <div className="text-3xl md:text-6xl font-black italic opacity-10 tracking-tighter select-none order-2 my-2 md:my-0">VS</div>

            {/* Player Character (Bottom on mobile) */}
            <div className="relative flex flex-col items-center order-3 md:order-1">
              <AnimatePresence>
                {playerDialogue && <SpeechBubble text={playerDialogue} side="left" />}
              </AnimatePresence>
              <motion.div
                animate={
                  playerAnimation === 'attack' ? { x: [0, 150, 0], scale: [1, 1.2, 1] } :
                  playerAnimation === 'hit' ? { x: [-5, 5, -5, 5, 0], filter: ['brightness(1)', 'brightness(2)', 'brightness(1)'] } :
                  playerAnimation === 'skill' ? { y: [-10, 0], scale: [1, 1.1, 1], filter: ['hue-rotate(0deg)', 'hue-rotate(180deg)', 'hue-rotate(0deg)'] } :
                  { y: [0, -10, 0] }
                }
                transition={
                  playerAnimation === 'idle' ? { duration: 3, repeat: Infinity, ease: "easeInOut" } :
                  { duration: 0.5 }
                }
                className="relative"
              >
                <SafeImage 
                  src={player?.img || ''} 
                  alt={player?.name || ''} 
                  className="w-32 h-32 md:w-64 md:h-64 object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.2)]" 
                  cdnIndex={cdnIndex}
                />
                {activeVfx?.target === 'PLAYER' && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0, rotate: 0 }}
                    animate={{ scale: [0, 2, 1.5], opacity: [0, 1, 0], rotate: [0, 90, 180] }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <div className={`vfx-${activeVfx.type}`} />
                  </motion.div>
                )}
              </motion.div>
              <div className="mt-2 md:mt-4 flex flex-col items-center">
                <span className="text-sm md:text-xl font-black italic uppercase tracking-tighter" style={{ color: player?.color }}>{player?.name}</span>
                <div className="flex gap-1 mt-1 md:mt-2">
                  {player?.statusEffects?.map((s, i) => <StatusIcon key={i} effect={s} />)}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Player */}
          <div className="p-4 md:p-6 bg-gradient-to-t from-black to-transparent relative z-20">
            <div className="max-w-6xl mx-auto flex flex-col gap-4">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-4 md:gap-0">
                <div className="flex flex-col gap-2 w-full md:w-64">
                  <div className="flex justify-between items-end">
                    <span className="text-xl font-black italic" style={{ color: player?.color }}>{player?.name}</span>
                    <span className="text-[10px] font-mono opacity-60 uppercase tracking-widest">系统完整度 (INTEGRITY)</span>
                  </div>
                  <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 relative shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                    <motion.div 
                      animate={{ width: `${(player!.hp / player!.maxHp) * 100}%` }}
                      className="h-full bg-gradient-to-r from-cyan-500 via-blue-400 to-cyan-500 bg-[length:200%_100%] animate-shimmer"
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black drop-shadow-md">
                      {player?.hp} / {player?.maxHp}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {player?.shield! > 0 && (
                      <div className="bg-blue-600 px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1">
                        <Shield className="w-3 h-3" /> {player?.shield}
                      </div>
                    )}
                    {player?.statusEffects?.map((s, i) => <StatusIcon key={i} effect={s} />)}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => setShowBackpack(true)}
                      className="flex-1 py-1 bg-cyan-900/40 border border-cyan-500/50 rounded text-[10px] font-black uppercase hover:bg-cyan-500 hover:text-black transition-all flex items-center justify-center gap-1"
                    >
                      <Briefcase className="w-3 h-3" /> 背包 (ITEM)
                    </button>
                    <button 
                      onClick={() => setShowPartySwitch(true)}
                      className="flex-1 py-1 bg-purple-900/40 border border-purple-500/50 rounded text-[10px] font-black uppercase hover:bg-purple-500 hover:text-black transition-all flex items-center justify-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> 切换 (SWITCH)
                    </button>
                  </div>
                </div>

                {/* Energy Display */}
                <div className="flex flex-row md:flex-col items-center gap-4 md:gap-0 w-full md:w-auto justify-between md:justify-center">
                  <div className="text-[10px] font-mono opacity-60 uppercase md:mb-1 flex items-center gap-2">
                    <Zap className="w-3 h-3 text-cyan-400" />
                    {TERMINOLOGY.ENERGY}
                  </div>
                  <div className="flex gap-1.5">
                    {Array.from({ length: player?.maxEnergy || 0 }).map((_, i) => (
                      <motion.div 
                        key={i} 
                        initial={false}
                        animate={{ 
                          scale: i < player!.energy ? [1, 1.1, 1] : 1,
                          opacity: i < player!.energy ? 1 : 0.2
                        }}
                        className={`w-3 md:w-4 h-8 md:h-10 skew-x-[-20deg] border-2 transition-all duration-500 ${i < player!.energy ? 'bg-cyan-500 border-cyan-400 shadow-[0_0_15px_#00ffff]' : 'bg-transparent border-white/10'}`} 
                      />
                    ))}
                  </div>
                </div>

                <button 
                  onClick={endPlayerTurn}
                  disabled={turn !== 'PLAYER' || isAnimating}
                  className="w-full md:w-auto px-8 py-3 bg-pink-600 border-2 border-pink-400 font-black italic uppercase tracking-tighter hover:bg-pink-500 disabled:opacity-30 disabled:grayscale transition-all shadow-[0_0_20px_rgba(255,0,255,0.3)]"
                >
                  {TERMINOLOGY.END_TURN}
                </button>
              </div>

              {/* Hand */}
              <div className="flex justify-start md:justify-center gap-2 h-48 md:h-64 items-end pb-4 overflow-x-auto no-scrollbar snap-x">
                <AnimatePresence>
                  {hand?.map((card, i) => renderCard(card, i))}
                </AnimatePresence>
              </div>
            </div>
          </div>
      </div>
    );
  };

  const handleGachaSpin = () => {
    if (gachaTickets < 1 || isGachaSpinning) return;
    
    setIsGachaSpinning(true);
    setGachaTickets(prev => prev - 1);
    setGachaResult(null);

    setTimeout(() => {
      const luckBonus = purchasedUpgrades.includes('gacha_luck') ? 0.1 : 0;
      const roll = Math.random() + luckBonus;
      let result: any = null;

      if (roll < 0.6) {
        // Common: Consumables
        const pool = CONSUMABLES_DB.filter(c => c.price <= 100);
        const item = pool[Math.floor(Math.random() * pool.length)];
        result = { type: 'ITEM', data: item };
        setInventory(prev => [...prev, item]);
      } else if (roll < 0.85) {
        // Uncommon: Better Consumables or Gold
        const roll2 = Math.random();
        if (roll2 < 0.5) {
          const pool = CONSUMABLES_DB.filter(c => c.price > 100 && c.price <= 250);
          const item = pool[Math.floor(Math.random() * pool.length)];
          result = { type: 'ITEM', data: item };
          setInventory(prev => [...prev, item]);
        } else {
          const goldAmt = 100 + Math.floor(Math.random() * 100);
          result = { type: 'GOLD', data: goldAmt };
          setGold(prev => prev + goldAmt);
        }
      } else if (roll < 0.98) {
        // Rare: Relics
        const pool = RELICS_DB.filter(r => !relics.find(pr => pr.id === r.id));
        if (pool.length > 0) {
          const relic = pool[Math.floor(Math.random() * pool.length)];
          result = { type: 'RELIC', data: relic };
          setRelics(prev => [...prev, relic]);
        } else {
          const goldAmt = 300;
          result = { type: 'GOLD', data: goldAmt };
          setGold(prev => prev + goldAmt);
        }
      } else {
        // Jackpot: Rare Cards or Big Gold
        const roll3 = Math.random();
        if (roll3 < 0.3) {
          const pool = CARDS_DB.filter(c => c.rarity === 'RARE');
          const card = pool[Math.floor(Math.random() * pool.length)];
          result = { type: 'CARD', data: card };
          setPermanentDeck(prev => [...prev, { ...card, uid: generateUUID(), isEquipped: true }]);
        } else {
          const goldAmt = 500;
          result = { type: 'GOLD', data: goldAmt };
          setGold(prev => prev + goldAmt);
        }
      }

      setGachaResult(result);
      setIsGachaSpinning(false);
    }, 2000);
  };

  const renderGacha = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#0a0a15] border-2 border-pink-500/30 rounded-3xl w-full max-w-xl overflow-hidden shadow-[0_0_100px_rgba(236,72,153,0.2)] flex flex-col max-h-[90vh]"
      >
        <div className="p-4 md:p-6 border-b border-white/10 flex justify-between items-center bg-pink-950/20 shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <Gift className="w-6 h-6 md:w-8 md:h-8 text-pink-400" />
            <h3 className="text-xl md:text-3xl font-black italic text-pink-400 uppercase tracking-tighter">协议抽奖 (GACHA TERMINAL)</h3>
          </div>
          <button onClick={() => setShowGacha(false)} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        <div className="p-6 md:p-12 flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px] overflow-y-auto custom-scrollbar">
          <div className="relative mb-8 md:mb-12">
            <motion.div
              animate={isGachaSpinning ? { rotate: 360 } : { rotate: 0 }}
              transition={isGachaSpinning ? { repeat: Infinity, duration: 0.5, ease: "linear" } : {}}
              className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 md:border-8 border-dashed border-pink-500/30 flex items-center justify-center"
            >
              <Disc className={`w-16 h-16 md:w-24 md:h-24 ${isGachaSpinning ? 'text-pink-400 animate-pulse' : 'text-white/20'}`} />
            </motion.div>
            
            <AnimatePresence>
              {gachaResult && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-full backdrop-blur-sm border-2 border-pink-500"
                >
                  <div className="text-pink-400 font-black text-[10px] md:text-xs uppercase mb-1">获得奖励!</div>
                  <div className="text-sm md:text-xl font-black text-white text-center px-2 md:px-4">
                    {gachaResult.type === 'ITEM' && gachaResult.data.name}
                    {gachaResult.type === 'GOLD' && `+${gachaResult.data} 信用点`}
                    {gachaResult.type === 'RELIC' && gachaResult.data.name}
                    {gachaResult.type === 'CARD' && `稀有协议: ${gachaResult.data.name}`}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="text-center mb-6 md:mb-8">
            <p className="text-white/40 font-mono text-[10px] md:text-xs uppercase tracking-widest mb-1 md:mb-2">可用抽奖机会 (AVAILABLE TICKETS)</p>
            <div className="text-4xl md:text-5xl font-black text-white italic">{gachaTickets}</div>
          </div>

          <button
            onClick={handleGachaSpin}
            disabled={gachaTickets < 1 || isGachaSpinning}
            className={`w-full py-4 md:py-6 rounded-2xl font-black text-lg md:text-xl uppercase tracking-widest transition-all ${
              gachaTickets < 1 || isGachaSpinning
                ? 'bg-white/5 text-white/20 border border-white/10 cursor-not-allowed'
                : 'bg-pink-500 text-black hover:bg-pink-400 shadow-[0_0_30px_rgba(236,72,153,0.4)]'
            }`}
          >
            {isGachaSpinning ? '正在解析协议...' : '启动抽奖 (SPIN)'}
          </button>
          
          <p className="mt-4 md:mt-6 text-[8px] md:text-[10px] text-white/30 font-mono uppercase text-center">
            击败病毒程序可获得抽奖机会 // 奖励包含稀有道具、信用点与遗物
          </p>
        </div>
      </motion.div>
    </div>
  );

  const renderDiagnostic = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-[#0a0a15] border-2 border-emerald-500/30 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.1)] flex flex-col max-h-[90vh]"
      >
        <div className="p-4 md:p-6 border-b border-white/10 flex justify-between items-center bg-emerald-950/20 shrink-0">
          <h3 className="text-xl md:text-3xl font-black italic text-emerald-400 uppercase tracking-tighter">系统自检 (DIAGNOSTIC)</h3>
          <button onClick={() => setShowDiagnostic(false)} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
        
        <div className="p-4 md:p-8 overflow-y-auto custom-scrollbar">
          {diagnosticStep === 'CHOICE' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <button 
                onClick={() => handleDiagnostic('REPAIR')}
                className="p-4 md:p-6 border-2 border-white/10 rounded-2xl bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all group text-center"
              >
                <HeartPulse className="w-8 h-8 md:w-12 md:h-12 text-emerald-400 mx-auto mb-2 md:mb-4 group-hover:animate-pulse" />
                <h4 className="font-black italic text-lg md:text-xl uppercase">全面修复</h4>
                <p className="text-[10px] md:text-xs text-white/40 mt-1 md:mt-2">恢复所有系统完整度</p>
                <div className="mt-2 md:mt-4 text-yellow-400 font-mono text-xs md:text-sm">COST: 50 CREDITS</div>
              </button>
              
              <button 
                onClick={() => handleDiagnostic('REMOVE')}
                className="p-4 md:p-6 border-2 border-white/10 rounded-2xl bg-white/5 hover:border-red-500/50 hover:bg-red-500/10 transition-all group text-center"
              >
                <Trash2 className="w-8 h-8 md:w-12 md:h-12 text-red-400 mx-auto mb-2 md:mb-4 group-hover:rotate-12 transition-transform" />
                <h4 className="font-black italic text-lg md:text-xl uppercase">协议优化</h4>
                <p className="text-[10px] md:text-xs text-white/40 mt-1 md:mt-2">从背包中永久移除一个协议</p>
                <div className="mt-2 md:mt-4 text-yellow-400 font-mono text-xs md:text-sm">COST: 75 CREDITS</div>
              </button>
            </div>
          )}

          {diagnosticStep === 'REMOVE' && (
            <div className="space-y-4">
              <p className="text-center text-white/60 font-mono text-xs md:text-sm mb-4 md:mb-6">选择要移除的协议 (SELECT PROTOCOL TO PURGE)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto custom-scrollbar p-2">
                {permanentDeck?.map((card, i) => (
                  <div 
                    key={card.uid} 
                    onClick={() => {
                      setPermanentDeck(prev => prev.filter(c => c.uid !== card.uid));
                      setGold(prev => prev - 75);
                      addFloatingText('协议已净化', '#ef4444', 'PLAYER');
                      setShowDiagnostic(false);
                    }}
                    className="cursor-pointer transform hover:scale-105 transition-transform"
                  >
                    {renderCard(card, i, { isStatic: true })}
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setDiagnosticStep('CHOICE')}
                className="w-full py-2 md:py-3 border border-white/10 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all mt-2 md:mt-4"
              >
                返回
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );

  const renderEvolution = () => (
    <AnimatePresence>
      {showEvolution && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-8"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-[#0a0a15] border-2 border-emerald-500/30 rounded-3xl w-full max-w-4xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.1)] flex flex-col max-h-[90vh]"
          >
            <div className="p-4 md:p-6 border-b border-white/10 flex justify-between items-center bg-emerald-950/20 shrink-0">
              <div className="flex items-center gap-2 md:gap-3">
                <Activity className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
                <h2 className="text-lg md:text-2xl font-black italic tracking-tighter uppercase">进化实验室 (EVOLUTION LAB)</h2>
              </div>
              <button onClick={() => setShowEvolution(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
            
            <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 overflow-y-auto custom-scrollbar">
              {party?.map((p, i) => {
                const canEvolve = p.evolutionLevel && p.level >= p.evolutionLevel;
                const nextForm = p.evolvesTo ? POKEMON_DB.find(dbP => dbP.id === p.evolvesTo) : null;
                
                return (
                  <div key={i} className={`p-4 md:p-6 rounded-2xl border-2 transition-all ${canEvolve ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/5 bg-white/5 opacity-60'}`}>
                    <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                      <SafeImage 
                        src={p.img} 
                        alt={p.name} 
                        className="w-12 h-12 md:w-16 md:h-16 object-contain" 
                        cdnIndex={cdnIndex} 
                        pokemonId={p.id}
                      />
                      <div>
                        <div className="text-base md:text-lg font-black italic">{p.name}</div>
                        <div className="text-[10px] md:text-xs font-mono text-emerald-400">Lv.{p.level} / {p.evolutionLevel ? `进化需要 Lv.${p.evolutionLevel}` : '已达最高级'}</div>
                      </div>
                    </div>
                    
                    {canEvolve && nextForm && (
                      <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between mb-3 md:mb-4">
                          <div className="text-[10px] md:text-xs uppercase opacity-60">进化为:</div>
                          <div className="text-xs md:text-sm font-black text-emerald-400">{nextForm.name}</div>
                        </div>
                        <button 
                          onClick={() => handleEvolve(i)}
                          className="w-full py-2 md:py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black italic rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] text-sm md:text-base"
                        >
                          执行进化协议
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderContent = () => {
    return (
      <>
        {isCapturing && <CaptureAnimation onComplete={() => {}} />}
        {showTasks && renderTasks()}
        {showDiagnostic && renderDiagnostic()}
        {showGacha && renderGacha()}
        {showEvolution && renderEvolution()}
        {(() => {
          if (phase === 'INTRO') return <IntroSequence onComplete={() => setPhase('STARTER_SELECT')} onCdnDetected={setCdnIndex} />;
          if (phase === 'STARTER_SELECT') return <StarterSelection onSelect={initGame} cdnIndex={cdnIndex} />;
          if (phase === 'PVP_LOBBY') return renderPVPLobby();
          if (phase === 'PVP_BATTLE') return renderPVPBattle();
          if (phase === 'START') {
            return (
              <div className="h-full w-full bg-[#05050a] flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
                {renderTasks()}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
                </div>
                <motion.h1 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-7xl font-black italic tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-pink-500 drop-shadow-[0_0_20px_rgba(0,255,255,0.5)]"
                >
                  赛博宝可梦
                </motion.h1>
                <p className="font-mono text-xs tracking-[0.5em] text-cyan-400/60 uppercase mb-12">CYBERPOKE: 战术指令集 (Tactical Protocol)</p>
                <button 
                  onClick={() => {
                    if (unlockedPokemonIds.length > 0) {
                      setPhase('SELECT');
                    } else {
                      setPhase('STARTER_SELECT');
                    }
                  }}
                  className="px-12 py-4 bg-transparent border-2 border-cyan-500 text-cyan-400 font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all shadow-[0_0_30px_rgba(0,255,255,0.2)]"
                >
                  初始化链接
                </button>
              </div>
            );
          }
    if (phase === 'SELECT') {
      const displayPokemon = POKEMON_DB.filter(p => {
        const isUnlocked = unlockedPokemonIds.includes(p.id);
        const isBaseForm = !p.level || p.level === 1;
        // Show if unlocked, OR if it's a locked base form
        return isUnlocked || isBaseForm;
      });

      return (
        <div className="h-full w-full bg-[#05050a] p-8 text-white overflow-y-auto no-scrollbar">
          {renderTasks()}
          <h2 className="text-4xl font-black italic mb-12 text-center tracking-tighter uppercase">作战终端选择 (PROTOCOL SELECTION)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
            {displayPokemon?.map(p => {
              const isUnlocked = unlockedPokemonIds.includes(p.id);

              if (!isUnlocked) {
                return (
                  <div
                    key={p.id}
                    className="relative p-6 rounded-2xl border-2 border-white/5 bg-white/5 flex flex-col items-center justify-center opacity-50 grayscale"
                  >
                    <div className="w-24 h-24 rounded-full border-2 border-white/10 flex items-center justify-center mb-4">
                      <Database className="w-10 h-10 text-white/20" />
                    </div>
                    <h3 className="text-lg font-black italic uppercase mb-2 text-white/30">???</h3>
                    <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest text-center">
                      未解锁 (LOCKED)
                    </div>
                  </div>
                );
              }

              return (
                <motion.div
                  key={p.id}
                  whileHover={{ scale: 1.05, y: -5 }}
                  onClick={() => initGame(p.id)}
                  className={`relative p-6 rounded-2xl border-2 border-white/10 cursor-pointer overflow-hidden group bg-gradient-to-b ${p.bgGradient}`}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                    <Database className="w-16 h-16" />
                  </div>
                  <SafeImage 
                    src={p.img} 
                    alt={p.name} 
                    className="w-24 h-24 object-contain mx-auto mb-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
                    cdnIndex={cdnIndex} 
                    pokemonId={p.id}
                  />
                  <h3 className="text-lg font-black italic uppercase mb-1 text-center" style={{ color: p.color }}>{p.name.split(' ')[0]}</h3>
                  <div className="space-y-0.5 text-[10px] font-mono opacity-60 text-center">
                    <p>LVL: {p.level || 1}</p>
                    <p>HP: {p.maxHp}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-center text-cyan-400 font-black text-[10px] group-hover:scale-110 transition-transform">
                    建立链接 <ChevronRight className="w-3 h-3 ml-1" />
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-sm font-mono text-white/40 uppercase tracking-widest mb-4">通过进化或黑市解锁更多协议 (UNLOCK MORE VIA EVOLUTION OR SHOP)</p>
            <button 
              onClick={() => setPhase('HUB')}
              className="px-8 py-3 border border-white/20 rounded-full text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              返回中心 (RETURN TO HUB)
            </button>
          </div>
        </div>
      );
    }
    if (phase === 'HUB') return (
      <>
        {renderInventory()}
        {renderTasks()}
        {renderHub()}
      </>
    );
    if (phase === 'MAP') return (
      <div className="h-full w-full bg-[#05050a] flex flex-col">
        {renderInventory()}
        {renderTasks()}
        <div className="p-4 bg-black/40 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-xs font-mono opacity-50 uppercase tracking-widest">当前进度: FLOOR {floor}</div>
            <div className="text-xs font-mono text-yellow-400">CREDITS: {gold}</div>
          </div>
          <button 
            onClick={() => setPhase('HUB')}
            className="px-4 py-1 border border-red-500/50 text-red-400 text-[10px] font-black uppercase hover:bg-red-500 hover:text-black transition-all"
          >
            终止任务 (EXIT)
          </button>
        </div>
        {renderMap()}
      </div>
    );
    if (phase === 'REWARD') {
      return (
        <div className="h-full w-full bg-[#05050a] p-4 md:p-8 text-white flex flex-col items-center justify-center overflow-y-auto custom-scrollbar">
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8 md:mb-12 text-center"
          >
            <h2 className="text-3xl md:text-6xl font-black italic tracking-tighter text-cyan-400 mb-2 glitch-text">数据提取成功 (DATA EXTRACTED)</h2>
            <p className="font-mono text-[10px] md:text-xs opacity-60 uppercase tracking-[0.2em] md:tracking-[0.4em]">选择一个协议注入你的背包系统</p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-8 md:mb-12">
            {rewards?.map((card, i) => (
              <div key={card.uid} onClick={() => {
                setPermanentDeck(prev => [...prev, { ...card, isEquipped: true }]);
                setFloor(prev => prev + 1);
                setPhase('MAP');
              }}>
                {renderCard(card, i, { isStatic: true })}
              </div>
            ))}
          </div>

          <button 
            onClick={() => {
              setFloor(prev => prev + 1);
              setPhase('MAP');
            }}
            className="px-8 md:px-12 py-3 md:py-4 border-2 border-white/20 text-xs md:text-sm font-black uppercase tracking-[0.2em] md:tracking-[0.3em] hover:bg-white/10 transition-all"
          >
            跳过注入
          </button>
        </div>
      );
    }
    if (phase === 'SHOP') return (
      <>
        {renderInventory()}
        {renderTasks()}
        {renderShop()}
      </>
    );
    if (phase === 'COLLECTION') return renderCollection();
    if (phase === 'DECK_VIEW') return (
      <>
        {renderInventory()}
        {renderTasks()}
        {renderDeckView()}
      </>
    );
    if (phase === 'REST') return (
      <>
        {renderInventory()}
        {renderTasks()}
        {renderRest()}
      </>
    );
    if (phase === 'GAMEOVER') return renderGameOver();
    if (phase === 'VICTORY') return renderVictory();
    if (phase === 'ENDLESS') return renderEndless();

    return renderBattle();
        })()}
      </>
    );
  };

  return (
    <div className="h-screen w-screen bg-black overflow-hidden select-none relative">
      {/* Global Reset Button */}
      <button
        onClick={() => {
          if (window.confirm('确定要恢复出厂设置吗？所有进度将丢失。')) {
            resetGame();
          }
        }}
        className="absolute top-4 right-4 z-[9999] p-2 bg-red-900/50 border border-red-500/50 rounded-full hover:bg-red-600 transition-colors group"
        title="系统重置 (恢复出厂设置)"
      >
        <Trash2 className="w-4 h-4 text-red-200 group-hover:text-white" />
      </button>
      {renderContent()}
    </div>
  );
}