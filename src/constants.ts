import { Card, EntityState, Relic } from './types';

export const TERMINOLOGY = {
  HP: '系统完整度 (Integrity)',
  ENERGY: '核心算力 (Core)',
  DRAW_PILE: '源代码库 (Source)',
  DISCARD_PILE: '回收站 (Recycle)',
  END_TURN: '执行指令 (Execute)',
};

export const POKEMON_DB: Omit<EntityState, 'hp' | 'shield' | 'energy' | 'statusEffects' | 'intent'>[] = [
  {
    id: 'pikachu',
    name: '皮卡丘 (Pikachu)',
    img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
    maxHp: 70,
    maxEnergy: 3,
    color: '#facc15',
    neonClass: 'neon-yellow',
    bgGradient: 'from-yellow-900/40 to-black',
  },
  {
    id: 'charizard',
    name: '喷火龙 (Charizard)',
    img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
    maxHp: 100,
    maxEnergy: 3,
    color: '#f97316',
    neonClass: 'neon-orange',
    bgGradient: 'from-orange-900/40 to-black',
  },
  {
    id: 'mewtwo',
    name: '超梦 (Mewtwo)',
    img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
    maxHp: 90,
    maxEnergy: 3,
    color: '#c084fc',
    neonClass: 'neon-purple',
    bgGradient: 'from-purple-900/40 to-black',
  },
  {
    id: 'tyranitar',
    name: '班基拉斯 (Tyranitar)',
    img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/248.png',
    maxHp: 120,
    maxEnergy: 3,
    color: '#4ade80',
    neonClass: 'neon-green',
    bgGradient: 'from-green-900/40 to-black',
  },
];

export const INITIAL_DECKS: Record<string, Omit<Card, 'uid'>[]> = {
  pikachu: [
    { id: 'p1', name: '电击.exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 6, desc: '造成 6 点伤害。获得 1 层 [电荷]', vfx: 'electric', selfStatusEffect: { type: 'CHARGE', value: 1 } },
    { id: 'p1', name: '电击.exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 6, desc: '造成 6 点伤害。获得 1 层 [电荷]', vfx: 'electric', selfStatusEffect: { type: 'CHARGE', value: 1 } },
    { id: 'p1', name: '电击.exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 6, desc: '造成 6 点伤害。获得 1 层 [电荷]', vfx: 'electric', selfStatusEffect: { type: 'CHARGE', value: 1 } },
    { id: 'p1', name: '电击.exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 6, desc: '造成 6 点伤害。获得 1 层 [电荷]', vfx: 'electric', selfStatusEffect: { type: 'CHARGE', value: 1 } },
    { id: 'p2', name: '电光一闪.cmd', type: 'ATTACK', rarity: 'STARTER', cost: 0, damage: 3, draw: 1, desc: '造成 3 点伤害，抽 1 张牌', vfx: 'physical' },
    { id: 'p3', name: '屏障协议', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 5, desc: '获得 5 点屏障' },
    { id: 'p3', name: '屏障协议', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 5, desc: '获得 5 点屏障' },
    { id: 'p3', name: '屏障协议', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 5, desc: '获得 5 点屏障' },
    { id: 'p3', name: '屏障协议', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 5, desc: '获得 5 点屏障' },
    { id: 'p4', name: '静电场协议', type: 'POWER', rarity: 'RARE', cost: 2, desc: '每当你打出一张攻击卡，额外造成 2 点伤害', vfx: 'electric' },
    { id: 'p5', name: '十万伏特.bin', type: 'ATTACK', rarity: 'UNCOMMON', cost: 2, damage: 12, desc: '造成 12 点伤害。若 [电荷] >= 3，伤害翻倍', vfx: 'electric' },
    { id: 'p6', name: '充电.sh', type: 'SKILL', rarity: 'COMMON', cost: 1, selfStatusEffect: { type: 'CHARGE', value: 3 }, desc: '获得 3 层 [电荷]' },
  ],
  charizard: [
    { id: 'c1', name: '抓取.sh', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 7, desc: '造成 7 点伤害', vfx: 'physical' },
    { id: 'c1', name: '抓取.sh', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 7, desc: '造成 7 点伤害', vfx: 'physical' },
    { id: 'c1', name: '抓取.sh', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 7, desc: '造成 7 点伤害', vfx: 'physical' },
    { id: 'c1', name: '抓取.sh', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 7, desc: '造成 7 点伤害', vfx: 'physical' },
    { id: 'c2', name: '过载喷射.bin', type: 'ATTACK', rarity: 'UNCOMMON', cost: 1, damage: 15, desc: '造成 15 点伤害。获得 2 层 [过载]', vfx: 'fire', selfStatusEffect: { type: 'OVERLOAD', value: 2 } },
    { id: 'c3', name: '热能屏障', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 8, desc: '获得 8 点屏障' },
    { id: 'c3', name: '热能屏障', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 8, desc: '获得 8 点屏障' },
    { id: 'c3', name: '热能屏障', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 8, desc: '获得 8 点屏障' },
    { id: 'c3', name: '热能屏障', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 8, desc: '获得 8 点屏障' },
    { id: 'c4', name: '燃烧协议', type: 'POWER', rarity: 'RARE', cost: 3, desc: '回合结束时，对所有敌人造成 5 点伤害', vfx: 'fire' },
    { id: 'c5', name: '大字爆炎.exe', type: 'ATTACK', rarity: 'RARE', cost: 3, damage: 30, desc: '造成 30 点伤害。消耗', vfx: 'fire', isExhaust: true },
    { id: 'c6', name: '龙之舞.cmd', type: 'POWER', rarity: 'UNCOMMON', cost: 1, selfStatusEffect: { type: 'STRENGTH', value: 2 }, desc: '获得 2 层 [力量]' },
  ],
  mewtwo: [
    { id: 'm1', name: '念力.py', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 5, draw: 1, desc: '造成 5 点伤害，抽 1 张牌', vfx: 'psychic' },
    { id: 'm1', name: '念力.py', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 5, draw: 1, desc: '造成 5 点伤害，抽 1 张牌', vfx: 'psychic' },
    { id: 'm1', name: '念力.py', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 5, draw: 1, desc: '造成 5 点伤害，抽 1 张牌', vfx: 'psychic' },
    { id: 'm1', name: '念力.py', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 5, draw: 1, desc: '造成 5 点伤害，抽 1 张牌', vfx: 'psychic' },
    { id: 'm2', name: '漏洞扫描.scan', type: 'SKILL', rarity: 'UNCOMMON', cost: 1, statusEffect: { type: 'VULNERABLE', value: 2 }, desc: '施加 2 层 [漏洞暴露]', vfx: 'psychic' },
    { id: 'm3', name: '精神屏障', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 7, desc: '获得 7 点屏障' },
    { id: 'm3', name: '精神屏障', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 7, desc: '获得 7 点屏障' },
    { id: 'm3', name: '精神屏障', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 7, desc: '获得 7 点屏障' },
    { id: 'm3', name: '精神屏障', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 7, desc: '获得 7 点屏障' },
    { id: 'm4', name: '覆写协议', type: 'POWER', rarity: 'RARE', cost: 2, desc: '每当你施加 Debuff，抽 1 张牌', vfx: 'psychic' },
  ],
  tyranitar: [
    { id: 't1', name: '咬碎.exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 8, desc: '造成 8 点伤害', vfx: 'slash' },
    { id: 't1', name: '咬碎.exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 8, desc: '造成 8 点伤害', vfx: 'slash' },
    { id: 't1', name: '咬碎.exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 8, desc: '造成 8 点伤害', vfx: 'slash' },
    { id: 't1', name: '咬碎.exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 8, desc: '造成 8 点伤害', vfx: 'slash' },
    { id: 't2', name: '沙暴.sys', type: 'SKILL', rarity: 'UNCOMMON', cost: 2, shield: 12, desc: '获得 12 点屏障。回合结束时对敌方造成 3 点伤害', vfx: 'rock' },
    { id: 't3', name: '加固协议', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 6, desc: '获得 6 点屏障' },
    { id: 't3', name: '加固协议', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 6, desc: '获得 6 点屏障' },
    { id: 't3', name: '加固协议', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 6, desc: '获得 6 点屏障' },
    { id: 't3', name: '加固协议', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 6, desc: '获得 6 点屏障' },
    { id: 't4', name: '硬化协议', type: 'POWER', rarity: 'RARE', cost: 2, desc: '你的屏障在回合结束时不再清零', vfx: 'rock' },
  ]
};

export const RELICS_DB: Relic[] = [
  { id: 'usb', name: '生锈的U盘', desc: '每场战斗第一回合额外抽 2 张牌', icon: 'Database' },
  { id: 'cooling', name: '液冷系统', desc: '每次洗牌时恢复 5 点系统完整度', icon: 'Activity' },
  { id: 'battery', name: '备用电池', desc: '每回合开始时额外获得 1 点算力核心', icon: 'Zap' },
  { id: 'shield_gen', name: '便携护盾发生器', desc: '每场战斗开始时获得 10 点屏障', icon: 'Shield' },
  { id: 'chip', name: '超频芯片', desc: '你的攻击额外造成 1 点伤害', icon: 'Swords' },
];

export const ENEMIES_DB = [
  { id: 'rattata', name: '小拉达.virus', img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/19.png', maxHp: 40, color: '#a8a878', neonClass: 'neon-gray', bgGradient: 'from-gray-900/40 to-black' },
  { id: 'caterpie', name: '绿毛虫.worm', img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10.png', maxHp: 35, color: '#a8b820', neonClass: 'neon-green', bgGradient: 'from-green-900/40 to-black' },
  { id: 'pidgey', name: '波波.bot', img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/16.png', maxHp: 45, color: '#a890f0', neonClass: 'neon-blue', bgGradient: 'from-blue-900/40 to-black' },
  { id: 'zubat', name: '超音蝠.sonar', img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/41.png', maxHp: 50, color: '#a040a0', neonClass: 'neon-purple', bgGradient: 'from-purple-900/40 to-black' },
  { id: 'meowth', name: '喵喵.coin', img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png', maxHp: 60, color: '#f7d02c', neonClass: 'neon-yellow', bgGradient: 'from-yellow-900/40 to-black' },
];

export const JUNK_CARD: Omit<Card, 'uid'> = {
  id: 'junk',
  name: '垃圾数据 (Junk)',
  type: 'CURSE',
  rarity: 'SPECIAL',
  cost: 1,
  desc: '无法被打出。回合结束时，若在手牌中，失去 2 点系统完整度。',
  vfx: 'glitch',
};
