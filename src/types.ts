import { ReactNode } from 'react';

export type CardType = 'ATTACK' | 'SKILL' | 'POWER' | 'STATUS' | 'CURSE';
export type Rarity = 'STARTER' | 'COMMON' | 'UNCOMMON' | 'RARE' | 'SPECIAL';
export type StatusType = 'VULNERABLE' | 'WEAK' | 'POISON' | 'STRENGTH' | 'DEXTERITY' | 'LOCKED' | 'CHARGE' | 'OVERLOAD' | 'OVERWRITE' | 'BURN' | 'FREEZE' | 'COMBO';
export type IntentType = 'ATTACK' | 'DEFEND' | 'BUFF' | 'DEBUFF' | 'UNKNOWN' | 'CURSE' | 'STUN';

export interface StatusEffect {
  type: StatusType;
  value: number;
}

export interface Card {
  id: string;
  uid: string;
  name: string;
  type: CardType;
  rarity: Rarity;
  cost: number;
  damage?: number;
  shield?: number;
  heal?: number;
  draw?: number;
  statusEffect?: StatusEffect;
  selfStatusEffect?: StatusEffect;
  desc: string;
  vfx?: 'electric' | 'fire' | 'psychic' | 'physical' | 'rock' | 'beam' | 'slash' | 'glitch' | 'explosion' | 'freeze' | 'poison' | 'buff' | 'heal' | 'shield';
  isExhaust?: boolean;
  isEthereal?: boolean; // Disappears if not played
  isInnate?: boolean; // Starts in hand
  comboValue?: number; // Extra damage if combo is active
  isEquipped?: boolean; // Whether the card is in the active combat deck
}

export interface Intent {
  type: IntentType;
  value?: number;
  statusType?: StatusType;
  desc?: string;
}

export interface EntityState {
  id: string;
  name: string;
  img: string;
  hp: number;
  maxHp: number;
  shield: number;
  energy: number;
  maxEnergy: number;
  statusEffects: StatusEffect[];
  intent?: Intent;
  color: string;
  neonClass: string;
  bgGradient: string;
  level: number;
  xp: number;
  nextXp: number;
  price?: number;
  evolutionLevel?: number;
  evolvesTo?: string;
    skills?: { 
      name: string; 
      desc: string; 
      cost: number; 
      damage?: number; 
      shield?: number; 
      heal?: number;
      selfDamage?: number;
      statusEffect?: StatusEffect;
      selfStatusEffect?: StatusEffect;
      vfx?: 'electric' | 'fire' | 'psychic' | 'physical' | 'rock' | 'beam' | 'slash' | 'glitch' | 'explosion' | 'freeze' | 'poison' | 'buff' | 'heal' | 'shield';
    }[];
  isBoss?: boolean;
  isElite?: boolean;
  rarity?: string;
}

export interface Relic {
  id: string;
  name: string;
  desc: string;
  icon: string;
  price?: number;
  rarity?: string;
}

export interface Consumable {
  id: string;
  name: string;
  desc: string;
  icon: string;
  price: number;
  type: 'HEAL' | 'ENERGY' | 'STATUS' | 'DAMAGE' | 'DRAW';
  statusType?: StatusType;
  value: number;
}

export interface ShopUpgrade {
  id: string;
  name: string;
  desc: string;
  icon: string;
  price: number;
  effect: 'DISCOUNT' | 'REFRESH_SALE' | 'GACHA_LUCK' | 'RARE_CHANCE';
}

export interface Task {
  id: string;
  title: string;
  desc: string;
  reward: number;
  type: 'DAILY_LOGIN' | 'BATTLE_WIN' | 'GOLD_SPENT';
  progress: number;
  target: number;
  isClaimed: boolean;
}

export type NodeType = 'COMBAT' | 'ELITE' | 'SHOP' | 'REST' | 'BOSS' | 'UNKNOWN';

export interface MapNode {
  id: string;
  type: NodeType;
  floor: number;
  x: number; // For visual layout
  connectedTo: string[];
}

export interface EndlessState {
  playerLineup: EntityState[];
  enemyLineup: EntityState[];
  activePlayerIndex: number;
  activeEnemyIndex: number;
  wave: number;
}

export type Phase = 'INTRO' | 'START' | 'STARTER_SELECT' | 'HUB' | 'MAP' | 'BATTLE' | 'REWARD' | 'SHOP' | 'REST' | 'GAMEOVER' | 'VICTORY' | 'DECK_VIEW' | 'REWARD_TRANSITION' | 'ENDLESS' | 'PVP_LOBBY' | 'PVP_BATTLE' | 'COLLECTION' | 'SELECT';

export interface PVPState {
  roomId: string;
  opponentId: string;
  opponentName: string;
  opponentPokemon: EntityState;
  opponentParty: EntityState[];
  opponentActiveIndex: number;
  opponentInventory: Consumable[];
  isMyTurn: boolean;
  turnNumber: number;
  opponentHandCount: number;
  opponentShield: number;
  opponentHp: number;
  opponentMaxHp: number;
  isAiOpponent?: boolean;
}

export interface GameState {
  phase: Phase;
  floor: number;
  relics: Relic[];
  gold: number;
  map: MapNode[];
  currentNodeId: string | null;
}

export interface CombatPiles {
  hand: Card[];
  deck: Card[];
  discard: Card[];
}

export interface LogEntry {
  id: string;
  msg: string;
  type: 'system' | 'player' | 'enemy';
}
