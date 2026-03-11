/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Shield, Zap, Heart, Swords, RefreshCw, ChevronRight, 
  Skull, Activity, ZapOff, Database, Trash2, Play, Info, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, EntityState, LogEntry, StatusEffect, Intent, IntentType, StatusType, Relic, MapNode, NodeType } from './types';
import { POKEMON_DB, INITIAL_DECKS, TERMINOLOGY, RELICS_DB, ENEMIES_DB, JUNK_CARD } from './constants';

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
  };

  return (
    <motion.div 
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute -top-16 left-1/2 -translate-x-1/2 flex flex-col items-center"
    >
      <div className="relative">
        {icons[intent.type]}
        {intent.value && (
          <span className="absolute -right-4 top-0 text-lg font-black text-white drop-shadow-md">
            {intent.value}
          </span>
        )}
      </div>
      <span className="text-[10px] uppercase font-mono text-white/60 tracking-tighter mt-1">{intent.desc}</span>
    </motion.div>
  );
};

export default function App() {
  // --- Game State ---
  const [phase, setPhase] = useState<'START' | 'SELECT' | 'MAP' | 'BATTLE' | 'REWARD' | 'SHOP' | 'REST' | 'GAMEOVER' | 'VICTORY'>('START');
  const [floor, setFloor] = useState(1);
  const [relics, setRelics] = useState<Relic[]>([]);
  const [gold, setGold] = useState(0);
  const [map, setMap] = useState<MapNode[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [turn, setTurn] = useState<'PLAYER' | 'ENEMY'>('PLAYER');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [winner, setWinner] = useState<'PLAYER' | 'ENEMY' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isShaking, setIsShaking] = useState(0); 
  const [isGlitching, setIsGlitching] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<{id: string, text: string, color: string, x: number, y: number}[]>([]);
  const [activeVfx, setActiveVfx] = useState<{type: string, target: 'PLAYER' | 'ENEMY'} | null>(null);
  const [shopCards, setShopCards] = useState<Card[]>([]);

  // --- Entities ---
  const [player, setPlayer] = useState<EntityState | null>(null);
  const [enemy, setEnemy] = useState<EntityState | null>(null);

  // --- Refs for latest state (to avoid stale closures in async functions) ---
  const playerRef = useRef<EntityState | null>(null);
  const enemyRef = useRef<EntityState | null>(null);

  // --- Sync refs with state ---
  useEffect(() => { playerRef.current = player; }, [player]);
  useEffect(() => { enemyRef.current = enemy; }, [enemy]);

  // --- Deck ---
  const [deck, setDeck] = useState<Card[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [discard, setDiscard] = useState<Card[]>([]);

  // --- Powers (Permanent Buffs) ---
  const [playerPowers, setPlayerPowers] = useState<string[]>([]);
  const [enemyPowers, setEnemyPowers] = useState<string[]>([]);

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
    for (let f = 1; f <= floors; f++) {
      const nodeCount = f === floors ? 1 : 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < nodeCount; i++) {
        let type: NodeType = 'COMBAT';
        const roll = Math.random();
        if (f === floors) type = 'BOSS';
        else if (f === 1) type = 'COMBAT';
        else if (roll < 0.15) type = 'ELITE';
        else if (roll < 0.3) type = 'SHOP';
        else if (roll < 0.45) type = 'REST';
        else type = 'COMBAT';

        newMap.push({
          id: `node-${f}-${i}`,
          type,
          floor: f,
          x: (i + 1) * (100 / (nodeCount + 1)),
          connectedTo: []
        });
      }
    }
    // Connect nodes
    for (let f = 1; f < floors; f++) {
      const currentFloorNodes = newMap.filter(n => n.floor === f);
      const nextFloorNodes = newMap.filter(n => n.floor === f + 1);
      currentFloorNodes.forEach(n => {
        // Each node connects to at least one node in next floor
        const targetCount = 1 + Math.floor(Math.random() * 2);
        const targets = shuffle(nextFloorNodes).slice(0, targetCount);
        targets.forEach(t => n.connectedTo.push(t.id));
      });
    }
    return newMap;
  };

  const initGame = (selectedId: string) => {
    const pBase = POKEMON_DB.find(p => p.id === selectedId)!;
    const initialDeck = INITIAL_DECKS[selectedId].map(c => ({ ...c, uid: generateUUID() } as Card));
    
    setPlayer({
      ...pBase,
      hp: pBase.maxHp,
      maxHp: pBase.maxHp,
      shield: 0,
      energy: pBase.maxEnergy,
      statusEffects: [],
    });
    
    setDeck(shuffle(initialDeck));
    setHand([]);
    setDiscard([]);
    setRelics([]);
    setGold(50);
    setFloor(1);
    setMap(generateMap(5));
    setCurrentNodeId(null);
    setPhase('MAP');
  };

  const startBattle = (node: MapNode) => {
    setCurrentNodeId(node.id);
    const enemies = node.type === 'BOSS' ? [POKEMON_DB.find(p => p.id === 'mewtwo')!] : ENEMIES_DB;
    const eBase = enemies[Math.floor(Math.random() * enemies.length)];
    
    const hpMultiplier = node.type === 'BOSS' ? 3 : (node.type === 'ELITE' ? 1.8 : 1);

    setEnemy({
      ...eBase,
      maxHp: Math.floor((eBase.maxHp + (floor * 15)) * hpMultiplier),
      hp: Math.floor((eBase.maxHp + (floor * 15)) * hpMultiplier),
      shield: 0,
      energy: 3,
      statusEffects: [],
      intent: generateEnemyIntent(eBase as any),
      bgGradient: node.type === 'BOSS' ? 'from-purple-900/60 to-black' : 'from-red-900/40 to-black',
      neonClass: node.type === 'BOSS' ? 'neon-purple' : 'neon-red',
      color: node.type === 'BOSS' ? '#c084fc' : '#ef4444'
    } as any);

    const fullDeck = shuffle([...deck, ...hand, ...discard]);
    const innateCards = fullDeck.filter(c => c.isInnate);
    const otherCards = fullDeck.filter(c => !c.isInnate);
    const startingHand = [...innateCards];
    const remainingDeck = [...otherCards];
    while (startingHand.length < 5 && remainingDeck.length > 0) {
      startingHand.push(remainingDeck.pop()!);
    }

    setDeck(remainingDeck);
    setHand(startingHand);
    setDiscard([]);
    setPlayerPowers([]);
    setEnemyPowers([]);
    setTurn('PLAYER');
    setPhase('BATTLE');

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
      const cards = shuffle(pool).slice(0, 3).map(c => ({ ...c, uid: generateUUID(), price: 50 + Math.floor(Math.random() * 50) }));
      setShopCards(cards as any);
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
    
    let baseDmg = 8 + floor * 2;
    if (isElite) baseDmg += 5;
    if (isBoss) baseDmg += 10;

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
    const currentNode = map.find(n => n.id === currentNodeId);
    if (currentNode?.type === 'BOSS') {
      setPhase('VICTORY');
    } else {
      setPhase('REWARD');
      setGold(prev => prev + 25 + Math.floor(Math.random() * 20));
    }
  };

  const drawCards = (count: number) => {
    setHand(prevHand => {
      let currentHand = [...prevHand];
      let currentDeck = [...deck];
      let currentDiscard = [...discard];

      for (let i = 0; i < count; i++) {
        if (currentHand.length >= 10) break;
        if (currentDeck.length === 0) {
          if (currentDiscard.length === 0) break;
          currentDeck = shuffle([...currentDiscard]);
          currentDiscard = [];
          // Relic: Liquid Cooling System
          if (relics.find(r => r.id === 'cooling')) {
            setPlayer(p => p ? { ...p, hp: Math.min(p.maxHp, p.hp + 5) } : null);
            addFloatingText('+5 修复', '#4ade80', 'PLAYER');
          }
        }
        const card = currentDeck.pop();
        if (card) currentHand.push(card);
      }

      setDeck(currentDeck);
      setDiscard(currentDiscard);
      return currentHand;
    });
  };

  const applyStatus = (target: 'PLAYER' | 'ENEMY', type: StatusType, value: number) => {
    const setter = target === 'PLAYER' ? setPlayer : setEnemy;
    setter(prev => {
      if (!prev) return null;
      const existing = prev.statusEffects.find(s => s.type === type);
      if (existing) {
        return {
          ...prev,
          statusEffects: prev.statusEffects.map(s => s.type === type ? { ...s, value: s.value + value } : s)
        };
      }
      return { ...prev, statusEffects: [...prev.statusEffects, { type, value }] };
    });
  };

  const calculateDamage = (base: number, attacker: EntityState, defender: EntityState) => {
    let dmg = base;
    const strength = attacker.statusEffects.find(s => s.type === 'STRENGTH')?.value || 0;
    dmg += strength;

    // Relic: Chip
    if (playerRef.current && attacker.id === playerRef.current.id && relics.find(r => r.id === 'chip')) dmg += 1;

    const weak = attacker.statusEffects.find(s => s.type === 'WEAK');
    if (weak && weak.value > 0) dmg = Math.floor(dmg * 0.75);
    const vuln = defender.statusEffects.find(s => s.type === 'VULNERABLE');
    if (vuln && vuln.value > 0) dmg = Math.floor(dmg * 1.5);
    
    // Pikachu Charge Mechanic
    const charge = attacker.statusEffects.find(s => s.type === 'CHARGE');
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
    setPlayer(prev => prev ? { ...prev, energy: prev.energy - card.cost } : null);
    setHand(prev => prev.filter(c => c.uid !== card.uid));

    // VFX & Hit-stop
    setActiveVfx({ type: card.vfx || 'physical', target: 'ENEMY' });
    
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
    const junkCount = hand.filter(c => c.id === 'junk').length;
    if (junkCount > 0) {
      setPlayer(p => p ? { ...p, hp: Math.max(1, p.hp - (junkCount * 2)) } : null);
      addFloatingText(`-${junkCount * 2} 垃圾数据`, '#ef4444', 'PLAYER');
    }

    // Tyranitar Power: Shield Retention
    if (!playerPowers.includes('硬化协议')) {
      setPlayer(prev => prev ? { ...prev, shield: 0 } : null);
    }

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
      setActiveVfx({ type: 'physical', target: 'PLAYER' });
      
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
      setActiveVfx(null);

      // End Enemy Turn
      setTurn('PLAYER');

      // Status Effect Decrement Logic
      const decrementStatus = (effects: StatusEffect[]) => {
        const turnBased: StatusType[] = ['VULNERABLE', 'WEAK', 'POISON', 'OVERLOAD'];
        return effects.map(s => {
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
        return { 
          ...prev, 
          hp: newHp,
          energy: Math.min(prev.maxEnergy + energyGain, prev.maxEnergy + 1), 
          statusEffects: decrementStatus(prev.statusEffects) 
        };
      });

      setDiscard(prev => [...prev, ...hand]);
      setHand([]);
      drawCards(5);
    }, 1000);
  };

  // Check Game Over
  useEffect(() => {
    if (phase === 'BATTLE') {
      if (player && player.hp <= 0) {
        setPhase('GAMEOVER');
        setWinner('ENEMY');
      } else if (enemy && enemy.hp <= 0) {
        handleWin();
      }
    }
  }, [player?.hp, enemy?.hp, phase]);

  const renderMap = () => (
    <div className="h-full w-full bg-[#05050a] p-8 text-white flex flex-col items-center justify-center overflow-y-auto no-scrollbar">
      <div className="mb-12 text-center">
        <h2 className="text-5xl font-black italic tracking-tighter mb-2 glitch-text">网络拓扑结构 (NETWORK TOPOLOGY)</h2>
        <p className="font-mono text-xs text-cyan-400 opacity-60 uppercase tracking-[0.3em]">Sector {floor} // 防火墙渗透中</p>
      </div>
      
      <div className="relative w-full max-w-4xl min-h-[500px] flex flex-col items-center justify-between border border-white/5 rounded-3xl bg-white/5 backdrop-blur-sm p-12">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {Array.from({ length: 5 }).map((_, f) => {
          const nodes = map.filter(n => n.floor === f + 1);
          return (
            <div key={f} className="flex justify-around w-full relative z-10">
              {nodes.map(node => {
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
                    className={`relative w-20 h-20 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300
                      ${isSelectable ? 'border-cyan-400 bg-cyan-950/20 shadow-[0_0_15px_rgba(0,255,255,0.2)]' : 'border-white/10 bg-black/40 opacity-40'}
                      ${isVisited ? 'grayscale opacity-20 cursor-not-allowed' : ''}
                      ${currentNodeId === node.id ? 'border-yellow-400 bg-yellow-950/20 shadow-[0_0_20px_rgba(250,204,21,0.4)]' : ''}
                    `}
                  >
                    {node.type === 'COMBAT' && <Swords className="w-8 h-8 text-red-500" />}
                    {node.type === 'ELITE' && <Skull className="w-8 h-8 text-purple-500" />}
                    {node.type === 'BOSS' && <Zap className="w-10 h-10 text-yellow-500 animate-pulse" />}
                    {node.type === 'SHOP' && <Database className="w-8 h-8 text-yellow-400" />}
                    {node.type === 'REST' && <Activity className="w-8 h-8 text-green-400" />}
                    <span className="text-[8px] font-black uppercase tracking-tighter mt-1">{node.type}</span>
                    {isSelectable && <div className="absolute -inset-2 border border-cyan-400/20 rounded-xl animate-ping" />}
                  </motion.div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="mt-12 flex gap-8">
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

  const renderShop = () => (
    <div className="h-full w-full bg-[#05050a] p-8 text-white flex flex-col items-center justify-center">
      <div className="mb-12 text-center">
        <h2 className="text-6xl font-black italic tracking-tighter text-yellow-400 mb-2 glitch-text">黑市终端 (BLACK MARKET)</h2>
        <p className="font-mono text-xs opacity-60 uppercase tracking-[0.4em]">可用信用点: <span className="text-yellow-400">{gold}</span></p>
      </div>

      <div className="flex gap-8 mb-12">
        {shopCards.map((card: any, i) => (
          <div key={i} className="flex flex-col items-center gap-4">
            {renderCard(card, i)}
            <button 
              onClick={() => {
                if (gold >= card.price) {
                  setGold(prev => prev - card.price);
                  setDeck(prev => [...prev, { ...card, uid: generateUUID() }]);
                  setShopCards(prev => prev.filter(c => c.uid !== card.uid));
                }
              }}
              disabled={gold < card.price}
              className={`px-6 py-2 border-2 font-black uppercase text-xs tracking-widest transition-all
                ${gold >= card.price ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black' : 'border-white/10 text-white/20 cursor-not-allowed'}
              `}
            >
              购买: {card.price}
            </button>
          </div>
        ))}
      </div>

      <button 
        onClick={() => setPhase('MAP')}
        className="px-12 py-4 border-2 border-white/20 text-sm font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all"
      >
        离开终端
      </button>
    </div>
  );

  const renderRest = () => (
    <div className="h-full w-full bg-[#05050a] p-8 text-white flex flex-col items-center justify-center">
      <div className="mb-12 text-center">
        <h2 className="text-6xl font-black italic tracking-tighter text-green-400 mb-2 glitch-text">数据碎片整理 (DEFRAGMENTATION)</h2>
        <p className="font-mono text-xs opacity-60 uppercase tracking-[0.4em]">选择一项维护操作</p>
      </div>

      <div className="flex gap-12">
        <motion.div 
          whileHover={{ scale: 1.1 }}
          onClick={() => {
            setPlayer(p => p ? { ...p, hp: Math.min(p.maxHp, p.hp + Math.floor(p.maxHp * 0.3)) } : null);
            setPhase('MAP');
          }}
          className="w-64 h-64 border-2 border-green-500/30 bg-green-950/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-green-400 transition-all group"
        >
          <Activity className="w-16 h-16 text-green-400 mb-4 group-hover:animate-pulse" />
          <h3 className="text-xl font-black italic uppercase">系统修复</h3>
          <p className="text-[10px] opacity-60 mt-2">恢复 30% 系统完整度</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.1 }}
          onClick={() => {
            // Simple upgrade logic: pick a random card in deck and add +3 damage or +3 shield
            setDeck(prev => {
              const newDeck = [...prev];
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
          className="w-64 h-64 border-2 border-cyan-500/30 bg-cyan-950/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400 transition-all group"
        >
          <Zap className="w-16 h-16 text-cyan-400 mb-4 group-hover:animate-pulse" />
          <h3 className="text-xl font-black italic uppercase">内核优化</h3>
          <p className="text-[10px] opacity-60 mt-2">随机强化数据库中的一张卡牌</p>
        </motion.div>
      </div>
    </div>
  );

  const renderGameOver = () => (
    <div className="h-full w-full bg-red-950/20 flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-black opacity-80 z-0" />
      <div className="relative z-10 text-center">
        <motion.h2 
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-8xl font-black italic tracking-tighter text-red-600 mb-4 glitch-text"
        >
          SYSTEM CRASHED
        </motion.h2>
        <p className="font-mono text-sm tracking-[0.8em] text-red-400 uppercase mb-12">核心数据已损坏 // 链接中断</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-12 py-4 bg-red-600 text-white font-black uppercase tracking-widest hover:bg-red-500 transition-all shadow-[0_0_30px_rgba(255,0,0,0.5)]"
        >
          重新引导系统
        </button>
      </div>
    </div>
  );

  const renderVictory = () => (
    <div className="h-full w-full bg-cyan-950/20 flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-black opacity-80 z-0" />
      <div className="relative z-10 text-center">
        <motion.h2 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="text-8xl font-black italic tracking-tighter text-cyan-400 mb-4 glitch-text"
        >
          FIREWALL BREACHED
        </motion.h2>
        <p className="font-mono text-sm tracking-[0.8em] text-cyan-400 uppercase mb-12">最高权限已获得 // 任务完成</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-12 py-4 bg-cyan-600 text-white font-black uppercase tracking-widest hover:bg-cyan-500 transition-all shadow-[0_0_30px_rgba(0,255,255,0.5)]"
        >
          返回主界面
        </button>
      </div>
    </div>
  );

  const renderCard = (card: Card, index: number) => {
    const isPlayable = turn === 'PLAYER' && !isAnimating && (player?.energy || 0) >= card.cost;
    const typeColors = {
      ATTACK: 'border-red-500/50 text-red-400 bg-red-950/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
      SKILL: 'border-blue-500/50 text-blue-400 bg-blue-950/20 shadow-[0_0_10px_rgba(96,165,250,0.2)]',
      POWER: 'border-yellow-500/50 text-yellow-400 bg-yellow-950/20 shadow-[0_0_10px_rgba(250,204,21,0.2)]',
      STATUS: 'border-gray-500/50 text-gray-400 bg-gray-950/20 shadow-[0_0_10px_rgba(156,163,175,0.2)]',
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
        } : {}}
        onClick={() => executeCard(card)}
        className={`relative w-36 h-52 rounded-xl border-2 p-3 flex flex-col cursor-pointer transition-all duration-300
          ${typeColors[card.type]} ${isPlayable ? 'hover:border-cyan-400' : 'opacity-40 grayscale cursor-not-allowed'}
          backdrop-blur-xl overflow-hidden group`}
      >
        {/* Card Scanline */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px]" />
        
        <div className="flex justify-between items-start mb-2 relative z-10">
          <span className="text-[9px] font-black uppercase tracking-widest opacity-70">{card.type}</span>
          <div className="w-7 h-7 rounded-full bg-black/60 flex items-center justify-center font-black text-sm border border-white/20 text-white shadow-inner">
            {card.cost}
          </div>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
          <h3 className="font-black italic text-sm mb-2 uppercase tracking-tight group-hover:scale-110 transition-transform">{card.name}</h3>
          <div className="w-full h-px bg-white/10 mb-2" />
          <p className="text-[10px] leading-tight opacity-90 font-mono px-1">{card.desc}</p>
        </div>

        <div className="mt-auto flex justify-between items-center opacity-40 text-[7px] font-mono relative z-10">
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

  if (phase === 'START') {
    return (
      <div className="h-full w-full bg-[#05050a] flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        </div>
        <motion.h1 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-7xl font-black italic tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-pink-500 drop-shadow-[0_0_20px_rgba(0,255,255,0.5)]"
        >
          CYBERPOKE
        </motion.h1>
        <p className="font-mono text-xs tracking-[0.5em] text-cyan-400/60 uppercase mb-12">赛博宝可梦：战术指令集 (Tactical Protocol)</p>
        <button 
          onClick={() => setPhase('SELECT')}
          className="px-12 py-4 bg-transparent border-2 border-cyan-500 text-cyan-400 font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all shadow-[0_0_30px_rgba(0,255,255,0.2)]"
        >
          初始化链接 (INITIALIZE)
        </button>
      </div>
    );
  }

  if (phase === 'SELECT') {
    return (
      <div className="h-full w-full bg-[#05050a] p-8 text-white overflow-y-auto no-scrollbar">
        <h2 className="text-4xl font-black italic mb-12 text-center tracking-tighter">选择你的作战终端 (SELECT TERMINAL)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {POKEMON_DB.map(p => (
            <motion.div
              key={p.id}
              whileHover={{ scale: 1.05, y: -10 }}
              onClick={() => initGame(p.id)}
              className={`relative p-6 rounded-2xl border-2 border-white/10 cursor-pointer overflow-hidden group bg-gradient-to-b ${p.bgGradient}`}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                <Database className="w-24 h-24" />
              </div>
              <img src={p.img} alt={p.name} className="w-48 h-48 object-contain mx-auto mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]" />
              <h3 className="text-2xl font-black italic uppercase mb-2" style={{ color: p.color }}>{p.name}</h3>
              <div className="space-y-1 text-xs font-mono opacity-60">
                <p>系统完整度: {p.maxHp}</p>
                <p>核心算力: {p.maxEnergy}</p>
              </div>
              <div className="mt-6 flex items-center text-cyan-400 font-black text-sm group-hover:translate-x-2 transition-transform">
                建立链接 <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'MAP') return renderMap();
  if (phase === 'REWARD') {
    const rewards = INITIAL_DECKS[player!.id].slice(0, 3).map(c => ({ ...c, uid: generateUUID() }));
    return (
      <div className="h-full w-full bg-[#05050a] p-8 text-white flex flex-col items-center justify-center">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-12 text-center"
        >
          <h2 className="text-6xl font-black italic tracking-tighter text-cyan-400 mb-2 glitch-text">数据提取成功 (DATA EXTRACTED)</h2>
          <p className="font-mono text-xs opacity-60 uppercase tracking-[0.4em]">选择一个协议注入你的源代码库</p>
        </motion.div>

        <div className="flex gap-6 mb-12">
          {rewards.map((card, i) => (
            <div key={i} onClick={() => {
              setDeck(prev => [...prev, card as any]);
              setFloor(prev => prev + 1);
              setPhase('MAP');
            }}>
              {renderCard(card as any, i)}
            </div>
          ))}
        </div>

        <button 
          onClick={() => {
            setFloor(prev => prev + 1);
            setPhase('MAP');
          }}
          className="px-12 py-4 border-2 border-white/20 text-sm font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all"
        >
          跳过注入
        </button>
      </div>
    );
  }
  if (phase === 'SHOP') return renderShop();
  if (phase === 'REST') return renderRest();
  if (phase === 'GAMEOVER') return renderGameOver();
  if (phase === 'VICTORY') return renderVictory();

  return (
    <div 
      ref={containerRef}
      className={`h-full w-full bg-[#05050a] flex flex-col text-white relative overflow-hidden ${isGlitching ? 'animate-pulse' : ''}`}
      style={{ 
        transform: isShaking ? `translate(${(Math.random()-0.5)*isShaking}px, ${(Math.random()-0.5)*isShaking}px)` : 'none'
      }}
    >
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Floating Texts */}
        <AnimatePresence>
          {floatingTexts.map(t => (
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
        <div className="p-6 flex justify-between items-start relative z-20">
          <div className="flex flex-col gap-2 w-64">
            <div className="flex justify-between items-end">
              <span className="text-xs font-mono opacity-60 uppercase tracking-widest">敌方协议 (ENEMY PROTOCOL)</span>
              <span className="text-xl font-black italic" style={{ color: enemy?.color }}>{enemy?.name}</span>
            </div>
            <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 relative">
              <motion.div 
                animate={{ width: `${(enemy!.hp / enemy!.maxHp) * 100}%` }}
                className="h-full bg-gradient-to-r from-red-600 to-pink-500"
              />
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black">
                {enemy?.hp} / {enemy?.maxHp}
              </div>
            </div>
            <div className="flex gap-2">
              {enemy?.shield! > 0 && (
                <div className="bg-blue-600 px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1">
                  <Shield className="w-3 h-3" /> {enemy?.shield}
                </div>
              )}
              {enemy?.statusEffects.map((s, i) => <StatusIcon key={i} effect={s} />)}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
             <div className="text-[10px] font-mono opacity-40 uppercase">System Time: {new Date().toLocaleTimeString()}</div>
             <div className="flex gap-2 mb-2">
                {relics.map(r => (
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
                   <div className="text-[8px] opacity-40 uppercase">源代码库 (SOURCE)</div>
                   <div className="text-xl font-black italic text-cyan-500">{deck.length}</div>
                </div>
             </div>
          </div>
        </div>

        {/* Battle Arena */}
        <div className="flex-1 relative flex flex-col items-center justify-center">
          {/* VFX Overlay */}
          <AnimatePresence>
            {activeVfx && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center"
              >
                <div className={`vfx-${activeVfx.type} ${activeVfx.target === 'PLAYER' ? 'translate-y-48' : '-translate-y-48'}`} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enemy Sprite */}
          <div className="relative mb-24">
            <IntentDisplay intent={enemy?.intent} />
            <motion.img 
              animate={activeVfx?.target === 'ENEMY' ? { x: [0, -10, 10, -10, 0], filter: ['brightness(1)', 'brightness(3)', 'brightness(1)'] } : {}}
              src={enemy?.img} 
              className="w-48 h-48 object-contain drop-shadow-[0_0_50px_rgba(255,0,0,0.2)]" 
            />
          </div>

          {/* Player Sprite */}
          <div className="relative">
            <motion.img 
              animate={activeVfx?.target === 'PLAYER' ? { x: [0, -10, 10, -10, 0], filter: ['brightness(1)', 'brightness(3)', 'brightness(1)'] } : {}}
              src={player?.img} 
              className="w-48 h-48 object-contain drop-shadow-[0_0_50px_rgba(0,255,255,0.2)]" 
            />
          </div>
        </div>

        {/* Bottom Bar: Player */}
        <div className="p-6 bg-gradient-to-t from-black to-transparent relative z-20">
          <div className="max-w-6xl mx-auto flex flex-col gap-4">
            <div className="flex justify-between items-end">
              <div className="flex flex-col gap-2 w-64">
                <div className="flex justify-between items-end">
                  <span className="text-xl font-black italic" style={{ color: player?.color }}>{player?.name}</span>
                  <span className="text-[10px] font-mono opacity-60 uppercase tracking-widest">系统完整度 (INTEGRITY)</span>
                </div>
                <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 relative">
                  <motion.div 
                    animate={{ width: `${(player!.hp / player!.maxHp) * 100}%` }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black">
                    {player?.hp} / {player?.maxHp}
                  </div>
                </div>
                <div className="flex gap-2">
                  {player?.shield! > 0 && (
                    <div className="bg-blue-600 px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1">
                      <Shield className="w-3 h-3" /> {player?.shield}
                    </div>
                  )}
                  {player?.statusEffects.map((s, i) => <StatusIcon key={i} effect={s} />)}
                </div>
              </div>

              {/* Energy Display */}
              <div className="flex flex-col items-center">
                <div className="text-[10px] font-mono opacity-60 uppercase mb-1">{TERMINOLOGY.ENERGY}</div>
                <div className="flex gap-1">
                  {Array.from({ length: player?.maxEnergy || 0 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-4 h-8 skew-x-[-20deg] border-2 transition-all duration-500 ${i < player!.energy ? 'bg-cyan-500 border-cyan-400 shadow-[0_0_10px_#00ffff]' : 'bg-transparent border-white/10'}`} 
                    />
                  ))}
                </div>
              </div>

              <button 
                onClick={endPlayerTurn}
                disabled={turn !== 'PLAYER' || isAnimating}
                className="px-8 py-3 bg-pink-600 border-2 border-pink-400 font-black italic uppercase tracking-tighter hover:bg-pink-500 disabled:opacity-30 disabled:grayscale transition-all shadow-[0_0_20px_rgba(255,0,255,0.3)]"
              >
                {TERMINOLOGY.END_TURN}
              </button>
            </div>

            {/* Hand */}
            <div className="flex justify-center gap-2 h-64 items-end pb-4">
              <AnimatePresence>
                {hand.map((card, i) => renderCard(card, i))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    );
}
