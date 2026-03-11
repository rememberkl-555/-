import { ReactNode } from 'react';

export type CardType = 'ATTACK' | 'SKILL' | 'POWER' | 'STATUS' | 'CURSE';
export type Rarity = 'STARTER' | 'COMMON' | 'UNCOMMON' | 'RARE' | 'SPECIAL';
export type StatusType = 'VULNERABLE' | 'WEAK' | 'POISON' | 'STRENGTH' | 'DEXTERITY' | 'LOCKED' | 'CHARGE' | 'OVERLOAD' | 'OVERWRITE';
export type IntentType = 'ATTACK' | 'DEFEND' | 'BUFF' | 'DEBUFF' | 'UNKNOWN' | 'CURSE';

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
  vfx?: 'electric' | 'fire' | 'psychic' | 'physical' | 'rock' | 'beam' | 'slash' | 'glitch';
  isExhaust?: boolean;
  isEthereal?: boolean; // Disappears if not played
  isInnate?: boolean; // Starts in hand
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
}

export interface Relic {
  id: string;
  name: string;
  desc: string;
  icon: string;
}

export type NodeType = 'COMBAT' | 'ELITE' | 'SHOP' | 'REST' | 'BOSS' | 'UNKNOWN';

export interface MapNode {
  id: string;
  type: NodeType;
  floor: number;
  x: number; // For visual layout
  connectedTo: string[];
}

export interface GameState {
  phase: 'START' | 'SELECT' | 'MAP' | 'BATTLE' | 'REWARD' | 'SHOP' | 'REST' | 'GAMEOVER';
  floor: number;
  relics: Relic[];
  gold: number;
  map: MapNode[];
  currentNodeId: string | null;
}

export interface LogEntry {
  id: string;
  msg: string;
  type: 'system' | 'player' | 'enemy';
}
