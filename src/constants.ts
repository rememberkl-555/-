import { Card, EntityState, Relic, Consumable, Task, ShopUpgrade } from './types';

export const TERMINOLOGY = {
  HP: '系统完整度 (Integrity)',
  ENERGY: '核心算力 (Core)',
  DRAW_PILE: '背包系统 (Backpack)',
  DISCARD_PILE: '回收站 (Recycle)',
  END_TURN: '执行指令 (Execute)',
};

export const FALLBACK_IMG = 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/items/poke-ball.png';

export const CDNS = [
  'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/',
  'https://fastly.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/',
  'https://gcore.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/',
  'https://unpkg.com/pokeapi-sprites@2.0.2/sprites/pokemon/other/official-artwork/',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/'
];

export const getPokemonImg = (id: number | string, cdnIndex: number = 0) => {
  const baseUrl = CDNS[cdnIndex] || CDNS[0];
  return `${baseUrl}${id}.png`;
};

export const POKEMON_DB: Omit<EntityState, 'hp' | 'shield' | 'energy' | 'statusEffects' | 'intent'>[] = [
  {
    id: 'pikachu',
    name: '皮卡丘 (Pikachu)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
    maxHp: 100,
    maxEnergy: 3,
    color: '#facc15',
    neonClass: 'neon-yellow',
    bgGradient: 'from-yellow-900/40 to-black',
    level: 1,
    xp: 0,
    nextXp: 100,
    evolutionLevel: 10,
    evolvesTo: 'raichu',
    skills: [
      { name: '电击 (Thunder Shock)', desc: '造成 8 点伤害。获得 1 层 [电荷]', cost: 1, damage: 8, statusEffect: { type: 'CHARGE', value: 1 } },
      { name: '电光一闪 (Quick Attack)', desc: '造成 4 点伤害，抽 1 张牌', cost: 0, damage: 4 },
      { name: '光墙 (Light Screen)', desc: '获得 6 点屏障', cost: 1, shield: 6 }
    ]
  },
  {
    id: 'raichu',
    name: '雷丘 (Raichu)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/26.png',
    maxHp: 140,
    maxEnergy: 4,
    color: '#facc15',
    neonClass: 'neon-yellow',
    bgGradient: 'from-yellow-900/40 to-black',
    level: 10,
    xp: 0,
    nextXp: 250,
    skills: [
      { name: '十万伏特 (Thunderbolt)', desc: '造成 15 点伤害。获得 2 层 [电荷]', cost: 1, damage: 15, statusEffect: { type: 'CHARGE', value: 2 } },
      { name: '打雷 (Thunder)', desc: '造成 30 点伤害。获得 1 层 [过载]', cost: 2, damage: 30, statusEffect: { type: 'OVERLOAD', value: 1 } },
      { name: '高速移动 (Agility)', desc: '抽 2 张牌', cost: 1 }
    ]
  },
  {
    id: 'charmander',
    name: '小火龙 (Charmander)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png',
    maxHp: 90,
    maxEnergy: 3,
    color: '#f97316',
    neonClass: 'neon-orange',
    bgGradient: 'from-orange-900/40 to-black',
    level: 1,
    xp: 0,
    nextXp: 100,
    evolutionLevel: 10,
    evolvesTo: 'charmeleon',
    skills: [
      { name: '火花 (Ember)', desc: '造成 10 点伤害', cost: 1, damage: 10 },
      { name: '喷射火焰 (Flamethrower)', desc: '造成 18 点伤害。获得 2 层 [过载]', cost: 1, damage: 18, statusEffect: { type: 'OVERLOAD', value: 2 } },
      { name: '守住 (Protect)', desc: '获得 9 点屏障', cost: 1, shield: 9 }
    ]
  },
  {
    id: 'charmeleon',
    name: '火恐龙 (Charmeleon)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/5.png',
    maxHp: 120,
    maxEnergy: 3,
    color: '#f97316',
    neonClass: 'neon-orange',
    bgGradient: 'from-orange-900/40 to-black',
    level: 10,
    xp: 0,
    nextXp: 250,
    evolutionLevel: 20,
    evolvesTo: 'charizard',
    skills: [
      { name: '火焰牙 (Fire Fang)', desc: '造成 12 点伤害', cost: 1, damage: 12 },
      { name: '大字爆炎 (Fire Blast)', desc: '造成 25 点伤害。获得 2 层 [过载]', cost: 2, damage: 25, statusEffect: { type: 'OVERLOAD', value: 2 } },
      { name: '龙之怒 (Dragon Rage)', desc: '造成 15 点伤害', cost: 1, damage: 15 }
    ]
  },
  {
    id: 'charizard',
    name: '喷火龙 (Charizard)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
    maxHp: 160,
    maxEnergy: 4,
    color: '#f97316',
    neonClass: 'neon-orange',
    bgGradient: 'from-orange-900/40 to-black',
    level: 20,
    xp: 0,
    nextXp: 500,
    skills: [
      { name: '闪焰冲锋 (Flare Blitz)', desc: '造成 35 点伤害。自身受到 5 点伤害', cost: 2, damage: 35, selfDamage: 5 },
      { name: '热风 (Heat Wave)', desc: '造成 20 点伤害。获得 3 层 [过载]', cost: 1, damage: 20, statusEffect: { type: 'OVERLOAD', value: 3 } },
      { name: '龙之舞 (Dragon Dance)', desc: '获得 2 层 [电荷]，获得 5 点屏障', cost: 1, statusEffect: { type: 'CHARGE', value: 2 }, shield: 5 }
    ]
  },
  {
    id: 'squirtle',
    name: '杰尼龟 (Squirtle)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png',
    maxHp: 110,
    maxEnergy: 3,
    color: '#3b82f6',
    neonClass: 'neon-blue',
    bgGradient: 'from-blue-900/40 to-black',
    level: 1,
    xp: 0,
    nextXp: 100,
    evolutionLevel: 10,
    evolvesTo: 'wartortle',
    skills: [
      { name: '水枪 (Water Gun)', desc: '造成 9 点伤害', cost: 1, damage: 9 },
      { name: '水炮 (Hydro Pump)', desc: '造成 28 点伤害', cost: 2, damage: 28 },
      { name: '缩入壳中 (Withdraw)', desc: '获得 10 点屏障', cost: 1, shield: 10 }
    ]
  },
  {
    id: 'wartortle',
    name: '卡咪龟 (Wartortle)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/8.png',
    maxHp: 140,
    maxEnergy: 3,
    color: '#3b82f6',
    neonClass: 'neon-blue',
    bgGradient: 'from-blue-900/40 to-black',
    level: 10,
    xp: 0,
    nextXp: 250,
    evolutionLevel: 20,
    evolvesTo: 'blastoise',
    skills: [
      { name: '水之波动 (Water Pulse)', desc: '造成 12 点伤害', cost: 1, damage: 12 },
      { name: '火箭头锤 (Skull Bash)', desc: '获得 10 点屏障。下回合造成 15 点伤害', cost: 2, shield: 10, damage: 15 },
      { name: '铁壁 (Iron Defense)', desc: '获得 15 点屏障', cost: 1, shield: 15 }
    ]
  },
  {
    id: 'blastoise',
    name: '水箭龟 (Blastoise)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png',
    maxHp: 180,
    maxEnergy: 4,
    color: '#3b82f6',
    neonClass: 'neon-blue',
    bgGradient: 'from-blue-900/40 to-black',
    level: 20,
    xp: 0,
    nextXp: 500,
    skills: [
      { name: '加农水炮 (Hydro Cannon)', desc: '造成 40 点伤害', cost: 3, damage: 40 },
      { name: '冲浪 (Surf)', desc: '造成 15 点伤害。获得 10 点屏障', cost: 1, damage: 15, shield: 10 },
      { name: '高速旋转 (Rapid Spin)', desc: '造成 10 点伤害。抽 1 张牌', cost: 1, damage: 10 }
    ]
  },
  {
    id: 'bulbasaur',
    name: '妙蛙种子 (Bulbasaur)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
    maxHp: 100,
    maxEnergy: 3,
    color: '#22c55e',
    neonClass: 'neon-green',
    bgGradient: 'from-green-900/40 to-black',
    level: 1,
    xp: 0,
    nextXp: 100,
    evolutionLevel: 10,
    evolvesTo: 'ivysaur',
    skills: [
      { name: '藤鞭 (Vine Whip)', desc: '造成 8 点伤害', cost: 1, damage: 8 },
      { name: '寄生种子 (Leech Seed)', desc: '施加 3 层 [病毒]', cost: 1, statusEffect: { type: 'POISON', value: 3 } },
      { name: '光合作用 (Synthesis)', desc: '获得 7 点屏障，恢复 5 点生命', cost: 1, shield: 7 }
    ]
  },
  {
    id: 'ivysaur',
    name: '妙蛙草 (Ivysaur)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/2.png',
    maxHp: 130,
    maxEnergy: 3,
    color: '#22c55e',
    neonClass: 'neon-green',
    bgGradient: 'from-green-900/40 to-black',
    level: 10,
    xp: 0,
    nextXp: 250,
    evolutionLevel: 20,
    evolvesTo: 'venusaur',
    skills: [
      { name: '飞叶快刀 (Razor Leaf)', desc: '造成 12 点伤害', cost: 1, damage: 12 },
      { name: '毒粉 (Poison Powder)', desc: '施加 5 层 [病毒]', cost: 1, statusEffect: { type: 'POISON', value: 5 } },
      { name: '扎根 (Ingrain)', desc: '获得 10 点屏障。每回合恢复 2 点生命', cost: 1, shield: 10 }
    ]
  },
  {
    id: 'venusaur',
    name: '妙蛙花 (Venusaur)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png',
    maxHp: 170,
    maxEnergy: 4,
    color: '#22c55e',
    neonClass: 'neon-green',
    bgGradient: 'from-green-900/40 to-black',
    level: 20,
    xp: 0,
    nextXp: 500,
    skills: [
      { name: '疯狂植物 (Frenzy Plant)', desc: '造成 45 点伤害', cost: 3, damage: 45 },
      { name: '阳光烈焰 (Solar Beam)', desc: '造成 30 点伤害', cost: 2, damage: 30 },
      { name: '催眠粉 (Sleep Powder)', desc: '施加 2 层 [虚弱]', cost: 1, statusEffect: { type: 'WEAK', value: 2 } }
    ]
  },
  {
    id: 'mewtwo',
    name: '超梦 (Mewtwo)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
    maxHp: 200,
    maxEnergy: 5,
    color: '#c084fc',
    neonClass: 'neon-purple',
    bgGradient: 'from-purple-900/40 to-black',
    level: 20,
    xp: 0,
    nextXp: 1000,
    skills: [
      { name: '精神强念 (Psychic)', desc: '造成 25 点伤害。施加 3 层 [虚弱]', cost: 1, damage: 25, statusEffect: { type: 'WEAK', value: 3 } },
      { name: '自我再生 (Recover)', desc: '恢复 40 点生命', cost: 2, heal: 40 },
      { name: '精神击破 (Psystrike)', desc: '造成 50 点伤害', cost: 3, damage: 50 }
    ]
  },
  {
    id: 'arcanine',
    name: '风速狗 (Arcanine)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/59.png',
    maxHp: 150,
    maxEnergy: 3,
    color: '#f97316',
    neonClass: 'neon-orange',
    bgGradient: 'from-orange-900/40 to-black',
    level: 5,
    xp: 0,
    nextXp: 200,
    skills: [
      { name: '喷射火焰 (Flamethrower)', desc: '造成 18 点伤害。获得 2 层 [过载]', cost: 1, damage: 18, statusEffect: { type: 'OVERLOAD', value: 2 } },
      { name: '神速 (Extreme Speed)', desc: '造成 15 点伤害', cost: 1, damage: 15 }
    ]
  },
  {
    id: 'tyranitar',
    name: '班基拉斯 (Tyranitar)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/248.png',
    maxHp: 150,
    maxEnergy: 3,
    color: '#4ade80',
    neonClass: 'neon-green',
    bgGradient: 'from-green-900/40 to-black',
    level: 1,
    xp: 0,
    nextXp: 100,
    skills: [
      { name: '咬碎 (Crunch)', desc: '造成 12 点伤害', cost: 1, damage: 12, vfx: 'slash' },
      { name: '尖石攻击 (Stone Edge)', desc: '造成 25 点伤害。若敌方有屏障，伤害翻倍', cost: 2, damage: 25, vfx: 'rock' },
      { name: '沙暴 (Sandstorm)', desc: '获得 15 点屏障。回合结束时对敌方造成 5 点伤害', cost: 2, shield: 15, vfx: 'rock' }
    ]
  },
  {
    id: 'lucario',
    name: '路卡利欧 (Lucario)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png',
    maxHp: 110,
    maxEnergy: 4,
    color: '#38bdf8',
    neonClass: 'neon-blue',
    bgGradient: 'from-blue-900/40 to-black',
    level: 1,
    xp: 0,
    nextXp: 100,
    skills: [
      { name: '波导弹 (Aura Sphere)', desc: '造成 10 点伤害。必中', cost: 1, damage: 10, vfx: 'psychic' },
      { name: '骨棒乱打 (Bone Rush)', desc: '造成 4 点伤害，重复 3 次', cost: 1, damage: 4, vfx: 'physical' },
      { name: '神速 (Extreme Speed)', desc: '造成 15 点伤害', cost: 1, damage: 15, vfx: 'physical' }
    ]
  },
  {
    id: 'gastly',
    name: '鬼斯 (Gastly)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/92.png',
    maxHp: 70,
    maxEnergy: 3,
    color: '#a855f7',
    neonClass: 'neon-purple',
    bgGradient: 'from-purple-900/40 to-black',
    level: 1,
    xp: 0,
    nextXp: 100,
    evolutionLevel: 10,
    evolvesTo: 'haunter',
    skills: [
      { name: '舌舔 (Lick)', desc: '造成 6 点伤害，施加 1 层 [冻结]', cost: 1, damage: 6, statusEffect: { type: 'FREEZE', value: 1 }, vfx: 'psychic' },
      { name: '奇异之光 (Confuse Ray)', desc: '施加 2 层 [虚弱]', cost: 1, statusEffect: { type: 'WEAK', value: 2 }, vfx: 'psychic' },
      { name: '夜幕魔影 (Night Shade)', desc: '造成等同于等级的伤害', cost: 1, damage: 10, vfx: 'psychic' }
    ]
  },
  {
    id: 'haunter',
    name: '鬼斯通 (Haunter)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/93.png',
    maxHp: 100,
    maxEnergy: 3,
    color: '#a855f7',
    neonClass: 'neon-purple',
    bgGradient: 'from-purple-900/40 to-black',
    level: 10,
    xp: 0,
    nextXp: 250,
    evolutionLevel: 20,
    evolvesTo: 'gengar',
    skills: [
      { name: '暗影拳 (Shadow Punch)', desc: '造成 12 点伤害', cost: 1, damage: 12, vfx: 'psychic' },
      { name: '催眠术 (Hypnosis)', desc: '施加 1 层 [冻结]', cost: 1, statusEffect: { type: 'FREEZE', value: 1 }, vfx: 'psychic' },
      { name: '食梦 (Dream Eater)', desc: '若敌方处于 [冻结]，造成 20 点伤害并恢复 10 点生命', cost: 1, damage: 20, heal: 10, vfx: 'psychic' }
    ]
  },
  {
    id: 'gengar',
    name: '耿鬼 (Gengar)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png',
    maxHp: 140,
    maxEnergy: 4,
    color: '#a855f7',
    neonClass: 'neon-purple',
    bgGradient: 'from-purple-900/40 to-black',
    level: 20,
    xp: 0,
    nextXp: 500,
    skills: [
      { name: '暗影球 (Shadow Ball)', desc: '造成 18 点伤害', cost: 1, damage: 18, vfx: 'psychic' },
      { name: '污泥炸弹 (Sludge Bomb)', desc: '造成 12 点伤害，施加 3 层 [病毒]', cost: 1, damage: 12, statusEffect: { type: 'POISON', value: 3 }, vfx: 'poison' },
      { name: '同命 (Destiny Bond)', desc: '下一次受到的伤害将反弹给敌方', cost: 2, vfx: 'psychic' }
    ]
  },
  {
    id: 'dratini',
    name: '迷你龙 (Dratini)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/147.png',
    maxHp: 80,
    maxEnergy: 3,
    color: '#fbbf24',
    neonClass: 'neon-yellow',
    bgGradient: 'from-yellow-900/40 to-black',
    level: 1,
    xp: 0,
    nextXp: 100,
    evolutionLevel: 10,
    evolvesTo: 'dragonair',
    skills: [
      { name: '紧束 (Wrap)', desc: '造成 6 点伤害，施加 1 层 [虚弱]', cost: 1, damage: 6, statusEffect: { type: 'WEAK', value: 1 }, vfx: 'physical' },
      { name: '电磁波 (Thunder Wave)', desc: '施加 2 层 [虚弱]', cost: 1, statusEffect: { type: 'WEAK', value: 2 }, vfx: 'electric' },
      { name: '龙之怒 (Dragon Rage)', desc: '造成 15 点固定伤害', cost: 2, damage: 15, vfx: 'fire' }
    ]
  },
  {
    id: 'dragonair',
    name: '哈克龙 (Dragonair)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/148.png',
    maxHp: 110,
    maxEnergy: 3,
    color: '#fbbf24',
    neonClass: 'neon-yellow',
    bgGradient: 'from-yellow-900/40 to-black',
    level: 10,
    xp: 0,
    nextXp: 250,
    evolutionLevel: 20,
    evolvesTo: 'dragonite',
    skills: [
      { name: '龙之尾 (Dragon Tail)', desc: '造成 14 点伤害', cost: 1, damage: 14, vfx: 'physical' },
      { name: '水之尾 (Aqua Tail)', desc: '造成 16 点伤害', cost: 1, damage: 16, vfx: 'physical' },
      { name: '摔打 (Slam)', desc: '造成 20 点伤害', cost: 2, damage: 20, vfx: 'physical' }
    ]
  },
  {
    id: 'dragonite',
    name: '快龙 (Dragonite)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png',
    maxHp: 160,
    maxEnergy: 4,
    color: '#fbbf24',
    neonClass: 'neon-yellow',
    bgGradient: 'from-yellow-900/40 to-black',
    level: 20,
    xp: 0,
    nextXp: 500,
    skills: [
      { name: '龙爪 (Dragon Claw)', desc: '造成 18 点伤害', cost: 1, damage: 18, vfx: 'physical' },
      { name: '暴风 (Hurricane)', desc: '造成 25 点伤害，施加 1 层 [虚弱]', cost: 2, damage: 25, statusEffect: { type: 'WEAK', value: 1 }, vfx: 'physical' },
      { name: '逆鳞 (Outrage)', desc: '造成 40 点伤害，获得 2 层 [过载]', cost: 3, damage: 40, selfStatusEffect: { type: 'OVERLOAD', value: 2 }, vfx: 'explosion' }
    ]
  },
  {
    id: 'snorlax',
    name: '卡比兽 (Snorlax)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png',
    maxHp: 250,
    maxEnergy: 2,
    color: '#a3e635',
    neonClass: 'neon-green',
    bgGradient: 'from-green-900/40 to-black',
    level: 1,
    xp: 0,
    nextXp: 100,
    skills: [
      { name: '泰山压顶 (Body Slam)', desc: '造成 15 点伤害，有概率施加 [冻结]', cost: 1, damage: 15, statusEffect: { type: 'FREEZE', value: 1 }, vfx: 'physical' },
      { name: '睡觉 (Rest)', desc: '恢复全部生命，获得 2 层 [冻结]', cost: 2, heal: 250, selfStatusEffect: { type: 'FREEZE', value: 2 }, vfx: 'buff' },
      { name: '梦话 (Sleep Talk)', desc: '在 [冻结] 状态下随机使用一个技能', cost: 0, vfx: 'buff' }
    ]
  },
  {
    id: 'rattata',
    name: '小拉达 (Rattata)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/19.png',
    maxHp: 45,
    maxEnergy: 3,
    color: '#a8a878',
    neonClass: 'neon-gray',
    bgGradient: 'from-gray-900/40 to-black',
    level: 1,
    xp: 0,
    nextXp: 100,
    skills: [
      { name: '撞击 (Tackle)', desc: '造成 6 点伤害', cost: 1, damage: 6, vfx: 'physical' },
      { name: '电光一闪 (Quick Attack)', desc: '造成 4 点伤害，抽 1 张牌', cost: 0, damage: 4, vfx: 'physical' },
      { name: '咬住 (Bite)', desc: '造成 8 点伤害', cost: 1, damage: 8, vfx: 'physical' }
    ]
  },
  {
    id: 'caterpie',
    name: '绿毛虫 (Caterpie)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10.png',
    maxHp: 40,
    maxEnergy: 3,
    color: '#a8b820',
    neonClass: 'neon-green',
    bgGradient: 'from-green-900/40 to-black',
    level: 1,
    xp: 0,
    nextXp: 100,
    skills: [
      { name: '撞击 (Tackle)', desc: '造成 5 点伤害', cost: 1, damage: 5, vfx: 'physical' },
      { name: '吐丝 (String Shot)', desc: '施加 1 层 [虚弱]', cost: 1, statusEffect: { type: 'WEAK', value: 1 }, vfx: 'poison' }
    ]
  },
  {
    id: 'pidgey',
    name: '波波 (Pidgey)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/16.png',
    maxHp: 50,
    maxEnergy: 3,
    color: '#a890f0',
    neonClass: 'neon-blue',
    bgGradient: 'from-blue-900/40 to-black',
    level: 1,
    xp: 0,
    nextXp: 100,
    skills: [
      { name: '烈暴风 (Gust)', desc: '造成 8 点伤害', cost: 1, damage: 8, vfx: 'physical' },
      { name: '泼沙 (Sand Attack)', desc: '施加 1 层 [虚弱]', cost: 1, statusEffect: { type: 'WEAK', value: 1 }, vfx: 'physical' },
      { name: '翅膀攻击 (Wing Attack)', desc: '造成 12 点伤害', cost: 1, damage: 12, vfx: 'physical' }
    ]
  },
  {
    id: 'zubat',
    name: '超音蝠 (Zubat)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/41.png',
    maxHp: 55,
    maxEnergy: 3,
    color: '#a040a0',
    neonClass: 'neon-purple',
    bgGradient: 'from-purple-900/40 to-black',
    level: 1,
    xp: 0,
    nextXp: 100,
    skills: [
      { name: '吸血 (Leech Life)', desc: '造成 6 点伤害，恢复等量生命', cost: 1, damage: 6, heal: 6, vfx: 'physical' },
      { name: '超音波 (Supersonic)', desc: '施加 1 层 [虚弱]', cost: 1, statusEffect: { type: 'WEAK', value: 1 }, vfx: 'psychic' },
      { name: '咬住 (Bite)', desc: '造成 8 点伤害', cost: 1, damage: 8, vfx: 'physical' }
    ]
  },
  {
    id: 'meowth',
    name: '喵喵 (Meowth)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png',
    maxHp: 65,
    maxEnergy: 3,
    color: '#f7d02c',
    neonClass: 'neon-yellow',
    bgGradient: 'from-yellow-900/40 to-black',
    level: 1,
    xp: 0,
    nextXp: 100,
    skills: [
      { name: '抓 (Scratch)', desc: '造成 7 点伤害', cost: 1, damage: 7, vfx: 'physical' },
      { name: '聚宝功 (Pay Day)', desc: '造成 5 点伤害，获得 10 金币', cost: 1, damage: 5, vfx: 'physical' },
      { name: '咬住 (Bite)', desc: '造成 8 点伤害', cost: 1, damage: 8, vfx: 'physical' }
    ]
  },
  {
    id: 'magnemite',
    name: '小磁怪 (Magnemite)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/81.png',
    maxHp: 70,
    maxEnergy: 3,
    color: '#b8b8d0',
    neonClass: 'neon-gray',
    bgGradient: 'from-gray-900/40 to-black',
    level: 1,
    xp: 0,
    nextXp: 100,
    skills: [
      { name: '电击 (Thunder Shock)', desc: '造成 8 点伤害，获得 1 层 [电荷]', cost: 1, damage: 8, selfStatusEffect: { type: 'CHARGE', value: 1 }, vfx: 'electric' },
      { name: '超音波 (Sonic Boom)', desc: '造成 10 点固定伤害', cost: 1, damage: 10, vfx: 'electric' },
      { name: '磁铁炸弹 (Magnet Bomb)', desc: '造成 12 点伤害，必中', cost: 1, damage: 12, vfx: 'physical' }
    ]
  },
  {
    id: 'koffing',
    name: '瓦斯弹 (Koffing)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/109.png',
    maxHp: 75,
    maxEnergy: 3,
    color: '#a040a0',
    neonClass: 'neon-purple',
    bgGradient: 'from-purple-900/40 to-black',
    level: 1,
    xp: 0,
    nextXp: 100,
    skills: [
      { name: '毒瓦斯 (Poison Gas)', desc: '施加 3 层 [病毒]', cost: 1, statusEffect: { type: 'POISON', value: 3 }, vfx: 'poison' },
      { name: '污泥 (Sludge)', desc: '造成 10 点伤害，施加 1 层 [病毒]', cost: 1, damage: 10, statusEffect: { type: 'POISON', value: 1 }, vfx: 'poison' },
      { name: '自爆 (Self-Destruct)', desc: '造成 50 点伤害，自身生命归零', cost: 3, damage: 50, vfx: 'explosion' }
    ]
  },
  {
    id: 'machop',
    name: '腕力 (Machop)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/66.png',
    maxHp: 80,
    maxEnergy: 3,
    color: '#d0d0d0',
    neonClass: 'neon-gray',
    bgGradient: 'from-gray-900/40 to-black',
    level: 1,
    xp: 0,
    nextXp: 100,
    skills: [
      { name: '踢倒 (Low Kick)', desc: '造成 8 点伤害', cost: 1, damage: 8, vfx: 'physical' },
      { name: '空手劈 (Karate Chop)', desc: '造成 12 点伤害', cost: 1, damage: 12, vfx: 'physical' },
      { name: '地球上投 (Seismic Toss)', desc: '造成等同于等级的伤害', cost: 1, damage: 10, vfx: 'physical' }
    ]
  },
  {
    id: 'abra',
    name: '凯西 (Abra)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/63.png',
    maxHp: 40,
    maxEnergy: 3,
    color: '#f8d030',
    neonClass: 'neon-yellow',
    bgGradient: 'from-yellow-900/40 to-black',
    level: 1,
    xp: 0,
    nextXp: 100,
    skills: [
      { name: '瞬间移动 (Teleport)', desc: '获得 15 点屏障', cost: 1, shield: 15, vfx: 'psychic' },
      { name: '念力 (Confusion)', desc: '造成 8 点伤害', cost: 1, damage: 8, vfx: 'psychic' }
    ]
  },
  {
    id: 'geodude',
    name: '小拳石 (Geodude)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/74.png',
    maxHp: 90,
    maxEnergy: 3,
    color: '#b8b8d0',
    neonClass: 'neon-gray',
    bgGradient: 'from-gray-900/40 to-black',
    level: 1,
    xp: 0,
    nextXp: 100,
    skills: [
      { name: '撞击 (Tackle)', desc: '造成 6 点伤害', cost: 1, damage: 6, vfx: 'physical' },
      { name: '变圆 (Defense Curl)', desc: '获得 8 点屏障', cost: 1, shield: 8, vfx: 'buff' },
      { name: '落石 (Rock Throw)', desc: '造成 12 点伤害', cost: 1, damage: 12, vfx: 'rock' }
    ]
  },
  {
    id: 'eevee',
    name: '伊布 (Eevee)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png',
    maxHp: 60,
    maxEnergy: 3,
    color: '#d97706',
    neonClass: 'neon-orange',
    bgGradient: 'from-orange-900/40 to-black',
    level: 1,
    xp: 0,
    nextXp: 100,
    skills: [
      { name: '高速星 (Swift)', desc: '造成 10 点伤害，必中', cost: 1, damage: 10, vfx: 'physical' },
      { name: '电光一闪 (Quick Attack)', desc: '造成 4 点伤害，抽 1 张牌', cost: 0, damage: 4, vfx: 'physical' },
      { name: '帮助 (Helping Hand)', desc: '获得 1 层 [力量]', cost: 1, selfStatusEffect: { type: 'STRENGTH', value: 1 }, vfx: 'buff' }
    ]
  },
  {
    id: 'jigglypuff',
    name: '胖丁 (Jigglypuff)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png',
    maxHp: 80,
    maxEnergy: 3,
    color: '#f472b6',
    neonClass: 'neon-purple',
    bgGradient: 'from-purple-900/40 to-black',
    level: 1,
    xp: 0,
    nextXp: 100,
    skills: [
      { name: '唱歌 (Sing)', desc: '施加 1 层 [冻结]', cost: 1, statusEffect: { type: 'FREEZE', value: 1 }, vfx: 'psychic' },
      { name: '拍击 (Pound)', desc: '造成 8 点伤害', cost: 1, damage: 8, vfx: 'physical' },
      { name: '魅惑之声 (Disarming Voice)', desc: '造成 10 点伤害，必中', cost: 1, damage: 10, vfx: 'psychic' }
    ]
  },
  {
    id: 'psyduck',
    name: '可达鸭 (Psyduck)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png',
    maxHp: 70,
    maxEnergy: 3,
    color: '#fbbf24',
    neonClass: 'neon-yellow',
    bgGradient: 'from-yellow-900/40 to-black',
    level: 1,
    xp: 0,
    nextXp: 100,
    skills: [
      { name: '抓 (Scratch)', desc: '造成 7 点伤害', cost: 1, damage: 7, vfx: 'physical' },
      { name: '水之波动 (Water Pulse)', desc: '造成 12 点伤害，有概率施加 [冻结]', cost: 1, damage: 12, statusEffect: { type: 'FREEZE', value: 1 }, vfx: 'physical' },
      { name: '念力 (Confusion)', desc: '造成 8 点伤害', cost: 1, damage: 8, vfx: 'psychic' }
    ]
  },
  {
    id: 'growlithe',
    name: '卡蒂狗 (Growlithe)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/58.png',
    maxHp: 75,
    maxEnergy: 3,
    color: '#f97316',
    neonClass: 'neon-orange',
    bgGradient: 'from-orange-900/40 to-black',
    level: 1,
    xp: 0,
    nextXp: 100,
    skills: [
      { name: '火花 (Ember)', desc: '造成 10 点伤害', cost: 1, damage: 10, vfx: 'fire' },
      { name: '咬住 (Bite)', desc: '造成 8 点伤害', cost: 1, damage: 8, vfx: 'physical' },
      { name: '火焰轮 (Flame Wheel)', desc: '造成 15 点伤害', cost: 2, damage: 15, vfx: 'fire' }
    ]
  },
  {
    id: 'gyarados',
    name: '暴鲤龙 (Gyarados)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/130.png',
    maxHp: 220,
    maxEnergy: 4,
    color: '#3b82f6',
    neonClass: 'neon-blue',
    bgGradient: 'from-blue-900/40 to-black',
    level: 20,
    xp: 0,
    nextXp: 500,
    rarity: 'EPIC',
    skills: [
      { name: '咬碎 (Crunch)', desc: '造成 15 点伤害，施加 1 层 [虚弱]', cost: 1, damage: 15, statusEffect: { type: 'WEAK', value: 1 }, vfx: 'physical' },
      { name: '水流尾 (Aqua Tail)', desc: '造成 22 点伤害', cost: 2, damage: 22, vfx: 'physical' },
      { name: '破坏光线 (Hyper Beam)', desc: '造成 45 点伤害，下回合无法行动', cost: 3, damage: 45, selfStatusEffect: { type: 'FREEZE', value: 1 }, vfx: 'explosion' }
    ]
  },
  {
    id: 'alakazam',
    name: '胡地 (Alakazam)',
    img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/65.png',
    maxHp: 140,
    maxEnergy: 5,
    color: '#f59e0b',
    neonClass: 'neon-yellow',
    bgGradient: 'from-yellow-900/40 to-black',
    level: 20,
    xp: 0,
    nextXp: 500,
    rarity: 'EPIC',
    skills: [
      { name: '精神强念 (Psychic)', desc: '造成 18 点伤害，施加 2 层 [易伤]', cost: 2, damage: 18, statusEffect: { type: 'VULNERABLE', value: 2 }, vfx: 'psychic' },
      { name: '自我再生 (Recover)', desc: '恢复 30 点生命', cost: 2, heal: 30, vfx: 'heal' },
      { name: '反射壁 (Reflect)', desc: '获得 20 点屏障', cost: 2, shield: 20, vfx: 'shield' }
    ]
  }
];

export const INITIAL_DECKS: Record<string, Omit<Card, 'uid'>[]> = {
  default: [
    { id: 'd1', name: 'Tackle (撞击).exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 6, desc: '造成 6 点伤害', vfx: 'physical' },
    { id: 'd1', name: 'Tackle (撞击).exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 6, desc: '造成 6 点伤害', vfx: 'physical' },
    { id: 'd1', name: 'Tackle (撞击).exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 6, desc: '造成 6 点伤害', vfx: 'physical' },
    { id: 'd1', name: 'Tackle (撞击).exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 6, desc: '造成 6 点伤害', vfx: 'physical' },
    { id: 'd2', name: 'Defend (防守).prot', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 5, desc: '获得 5 点屏障' },
    { id: 'd2', name: 'Defend (防守).prot', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 5, desc: '获得 5 点屏障' },
    { id: 'd2', name: 'Defend (防守).prot', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 5, desc: '获得 5 点屏障' },
    { id: 'd2', name: 'Defend (防守).prot', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 5, desc: '获得 5 点屏障' },
    { id: 'd3', name: 'Bite (咬住).cmd', type: 'ATTACK', rarity: 'COMMON', cost: 2, damage: 12, desc: '造成 12 点伤害', vfx: 'physical' },
    { id: 'd4', name: 'Growl (叫声).sys', type: 'SKILL', rarity: 'COMMON', cost: 1, statusEffect: { type: 'WEAK', value: 1 }, desc: '施加 1 层 [虚弱]' },
  ],
  pikachu: [
    { id: 'p1', name: 'Thunder Shock (电击).exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 8, desc: '造成 8 点伤害。获得 1 层 [电荷]', vfx: 'electric', selfStatusEffect: { type: 'CHARGE', value: 1 } },
    { id: 'p1', name: 'Thunder Shock (电击).exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 8, desc: '造成 8 点伤害。获得 1 层 [电荷]', vfx: 'electric', selfStatusEffect: { type: 'CHARGE', value: 1 } },
    { id: 'p1', name: 'Thunder Shock (电击).exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 8, desc: '造成 8 点伤害。获得 1 层 [电荷]', vfx: 'electric', selfStatusEffect: { type: 'CHARGE', value: 1 } },
    { id: 'p1', name: 'Thunder Shock (电击).exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 8, desc: '造成 8 点伤害。获得 1 层 [电荷]', vfx: 'electric', selfStatusEffect: { type: 'CHARGE', value: 1 } },
    { id: 'p2', name: 'Quick Attack (电光一闪).cmd', type: 'ATTACK', rarity: 'STARTER', cost: 0, damage: 4, draw: 1, desc: '造成 4 点伤害，抽 1 张牌', vfx: 'physical' },
    { id: 'p3', name: 'Light Screen (光墙).prot', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 6, desc: '获得 6 点屏障' },
    { id: 'p3', name: 'Light Screen (光墙).prot', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 6, desc: '获得 6 点屏障' },
    { id: 'p3', name: 'Light Screen (光墙).prot', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 6, desc: '获得 6 点屏障' },
    { id: 'p3', name: 'Light Screen (光墙).prot', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 6, desc: '获得 6 点屏障' },
    { id: 'p4', name: 'Static (静电).sys', type: 'POWER', rarity: 'RARE', cost: 2, desc: '每当你打出一张攻击卡，额外造成 3 点伤害', vfx: 'electric' },
    { id: 'p5', name: 'Thunderbolt (十万伏特).bin', type: 'ATTACK', rarity: 'UNCOMMON', cost: 2, damage: 14, desc: '造成 14 点伤害。若 [电荷] >= 3，伤害翻倍', vfx: 'electric' },
    { id: 'p6', name: 'Charge (充电).sh', type: 'SKILL', rarity: 'COMMON', cost: 1, selfStatusEffect: { type: 'CHARGE', value: 3 }, desc: '获得 3 层 [电荷]' },
    { id: 'p7', name: 'Thunder (打雷).sys', type: 'ATTACK', rarity: 'RARE', cost: 3, damage: 25, statusEffect: { type: 'FREEZE', value: 1 }, desc: '造成 25 点伤害，施加 1 层 [冻结]', vfx: 'electric' },
    { id: 'p8', name: 'Thunder Wave (电磁波).scan', type: 'SKILL', rarity: 'UNCOMMON', cost: 1, statusEffect: { type: 'WEAK', value: 2 }, desc: '施加 2 层 [虚弱]', vfx: 'electric' },
  ],
  charmander: [
    { id: 'c1', name: 'Ember (火花).sh', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 10, desc: '造成 10 点伤害', vfx: 'fire' },
    { id: 'c1', name: 'Ember (火花).sh', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 10, desc: '造成 10 点伤害', vfx: 'fire' },
    { id: 'c1', name: 'Ember (火花).sh', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 10, desc: '造成 10 点伤害', vfx: 'fire' },
    { id: 'c1', name: 'Ember (火花).sh', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 10, desc: '造成 10 点伤害', vfx: 'fire' },
    { id: 'c2', name: 'Flamethrower (喷射火焰).bin', type: 'ATTACK', rarity: 'UNCOMMON', cost: 1, damage: 18, desc: '造成 18 点伤害。获得 2 层 [过载]', vfx: 'fire', selfStatusEffect: { type: 'OVERLOAD', value: 2 } },
    { id: 'c3', name: 'Protect (守住).prot', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 9, desc: '获得 9 点屏障' },
    { id: 'c3', name: 'Protect (守住).prot', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 9, desc: '获得 9 点屏障' },
    { id: 'c3', name: 'Protect (守住).prot', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 9, desc: '获得 9 点屏障' },
    { id: 'c3', name: 'Protect (守住).prot', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 9, desc: '获得 9 点屏障' },
    { id: 'c4', name: 'Fire Blast (大字爆炎).exe', type: 'ATTACK', rarity: 'RARE', cost: 3, damage: 35, desc: '造成 35 点伤害。消耗', vfx: 'explosion', isExhaust: true },
    { id: 'c5', name: 'Dragon Dance (龙之舞).cmd', type: 'POWER', rarity: 'UNCOMMON', cost: 1, selfStatusEffect: { type: 'STRENGTH', value: 3 }, desc: '获得 3 层 [力量]' },
    { id: 'c6', name: 'Fire Spin (火焰旋涡).sys', type: 'ATTACK', rarity: 'COMMON', cost: 1, damage: 6, statusEffect: { type: 'BURN', value: 4 }, desc: '造成 6 点伤害，施加 4 层 [灼烧]', vfx: 'fire' },
  ],
  squirtle: [
    { id: 's1', name: 'Water Gun (水枪).sh', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 9, desc: '造成 9 点伤害', vfx: 'physical' },
    { id: 's1', name: 'Water Gun (水枪).sh', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 9, desc: '造成 9 点伤害', vfx: 'physical' },
    { id: 's1', name: 'Water Gun (水枪).sh', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 9, desc: '造成 9 点伤害', vfx: 'physical' },
    { id: 's1', name: 'Water Gun (水枪).sh', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 9, desc: '造成 9 点伤害', vfx: 'physical' },
    { id: 's2', name: 'Hydro Pump (水炮).bin', type: 'ATTACK', rarity: 'RARE', cost: 2, damage: 28, desc: '造成 28 点伤害', vfx: 'beam' },
    { id: 's3', name: 'Withdraw (缩入壳中).cmd', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 10, desc: '获得 10 点屏障' },
    { id: 's3', name: 'Withdraw (缩入壳中).cmd', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 10, desc: '获得 10 点屏障' },
    { id: 's3', name: 'Withdraw (缩入壳中).cmd', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 10, desc: '获得 10 点屏障' },
    { id: 's3', name: 'Withdraw (缩入壳中).cmd', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 10, desc: '获得 10 点屏障' },
  ],
  bulbasaur: [
    { id: 'b1', name: 'Vine Whip (藤鞭).sh', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 8, desc: '造成 8 点伤害', vfx: 'physical' },
    { id: 'b1', name: 'Vine Whip (藤鞭).sh', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 8, desc: '造成 8 点伤害', vfx: 'physical' },
    { id: 'b1', name: 'Vine Whip (藤鞭).sh', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 8, desc: '造成 8 点伤害', vfx: 'physical' },
    { id: 'b1', name: 'Vine Whip (藤鞭).sh', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 8, desc: '造成 8 点伤害', vfx: 'physical' },
    { id: 'b2', name: 'Leech Seed (寄生种子).bin', type: 'SKILL', rarity: 'UNCOMMON', cost: 1, statusEffect: { type: 'POISON', value: 3 }, desc: '施加 3 层 [病毒]', vfx: 'poison' },
    { id: 'b3', name: 'Synthesis (光合作用).cmd', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 7, heal: 5, desc: '获得 7 点屏障，恢复 5 点生命' },
    { id: 'b3', name: 'Synthesis (光合作用).cmd', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 7, heal: 5, desc: '获得 7 点屏障，恢复 5 点生命' },
    { id: 'b3', name: 'Synthesis (光合作用).cmd', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 7, heal: 5, desc: '获得 7 点屏障，恢复 5 点生命' },
    { id: 'b3', name: 'Synthesis (光合作用).cmd', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 7, heal: 5, desc: '获得 7 点屏障，恢复 5 点生命' },
  ],
  mewtwo: [
    { id: 'm1', name: 'Confusion (念力).py', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 8, draw: 1, desc: '造成 8 点伤害，抽 1 张牌', vfx: 'psychic' },
    { id: 'm1', name: 'Confusion (念力).py', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 8, draw: 1, desc: '造成 8 点伤害，抽 1 张牌', vfx: 'psychic' },
    { id: 'm1', name: 'Confusion (念力).py', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 8, draw: 1, desc: '造成 8 点伤害，抽 1 张牌', vfx: 'psychic' },
    { id: 'm1', name: 'Confusion (念力).py', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 8, draw: 1, desc: '造成 8 点伤害，抽 1 张牌', vfx: 'psychic' },
    { id: 'm2', name: 'Psychic (精神强念).bin', type: 'ATTACK', rarity: 'RARE', cost: 2, damage: 20, desc: '造成 20 点伤害。每有一张手牌，伤害 +2', vfx: 'psychic' },
    { id: 'm3', name: 'Recover (精神补给).sh', type: 'SKILL', rarity: 'UNCOMMON', cost: 1, heal: 15, desc: '恢复 15 点生命' },
    { id: 'm4', name: 'Psystrike (精神击破).exe', type: 'ATTACK', rarity: 'RARE', cost: 2, damage: 30, desc: '造成 30 点伤害。无视屏障', vfx: 'psychic' },
  ],
  tyranitar: [
    { id: 't1', name: 'Crunch (咬碎).exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 12, desc: '造成 12 点伤害', vfx: 'slash' },
    { id: 't1', name: 'Crunch (咬碎).exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 12, desc: '造成 12 点伤害', vfx: 'slash' },
    { id: 't1', name: 'Crunch (咬碎).exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 12, desc: '造成 12 点伤害', vfx: 'slash' },
    { id: 't1', name: 'Crunch (咬碎).exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 12, desc: '造成 12 点伤害', vfx: 'slash' },
    { id: 't2', name: 'Sandstorm (沙暴).sys', type: 'SKILL', rarity: 'UNCOMMON', cost: 2, shield: 15, desc: '获得 15 点屏障。回合结束时对敌方造成 5 点伤害', vfx: 'rock' },
    { id: 't3', name: 'Stone Edge (尖石攻击).exe', type: 'ATTACK', rarity: 'RARE', cost: 2, damage: 25, desc: '造成 25 点伤害。若敌方有屏障，伤害翻倍', vfx: 'rock' },
  ],
  lucario: [
    { id: 'l1', name: 'Aura Sphere (波导弹).exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 10, desc: '造成 10 点伤害。必中', vfx: 'psychic' },
    { id: 'l1', name: 'Aura Sphere (波导弹).exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 10, desc: '造成 10 点伤害。必中', vfx: 'psychic' },
    { id: 'l1', name: 'Aura Sphere (波导弹).exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 10, desc: '造成 10 点伤害。必中', vfx: 'psychic' },
    { id: 'l1', name: 'Aura Sphere (波导弹).exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 10, desc: '造成 10 点伤害。必中', vfx: 'psychic' },
  ],
  gengar: [
    { id: 'g1', name: 'Shadow Ball (暗影球).bin', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 12, desc: '造成 12 点伤害', vfx: 'psychic' },
    { id: 'g1', name: 'Shadow Ball (暗影球).bin', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 12, desc: '造成 12 点伤害', vfx: 'psychic' },
    { id: 'g1', name: 'Shadow Ball (暗影球).bin', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 12, desc: '造成 12 点伤害', vfx: 'psychic' },
    { id: 'g1', name: 'Shadow Ball (暗影球).bin', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 12, desc: '造成 12 点伤害', vfx: 'psychic' },
  ],
  dragonite: [
    { id: 'd1', name: 'Dragon Claw (龙爪).exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 14, desc: '造成 14 点伤害', vfx: 'physical' },
    { id: 'd1', name: 'Dragon Claw (龙爪).exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 14, desc: '造成 14 点伤害', vfx: 'physical' },
    { id: 'd1', name: 'Dragon Claw (龙爪).exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 14, desc: '造成 14 点伤害', vfx: 'physical' },
    { id: 'd1', name: 'Dragon Claw (龙爪).exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 14, desc: '造成 14 点伤害', vfx: 'physical' },
  ],
  arcanine: [
    { id: 'arc1', name: 'Flamethrower (喷射火焰).bin', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 18, desc: '造成 18 点伤害。获得 2 层 [过载]', vfx: 'fire', selfStatusEffect: { type: 'OVERLOAD', value: 2 } },
    { id: 'arc1', name: 'Flamethrower (喷射火焰).bin', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 18, desc: '造成 18 点伤害。获得 2 层 [过载]', vfx: 'fire', selfStatusEffect: { type: 'OVERLOAD', value: 2 } },
    { id: 'arc2', name: 'Extreme Speed (神速).cmd', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 15, desc: '造成 15 点伤害', vfx: 'physical' },
    { id: 'arc2', name: 'Extreme Speed (神速).cmd', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 15, desc: '造成 15 点伤害', vfx: 'physical' },
  ],
  snorlax: [
    { id: 'sn1', name: 'Body Slam (泰山压顶).exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 15, desc: '造成 15 点伤害', vfx: 'physical' },
    { id: 'sn1', name: 'Body Slam (泰山压顶).exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 15, desc: '造成 15 点伤害', vfx: 'physical' },
    { id: 'sn2', name: 'Rest (睡觉).sh', type: 'SKILL', rarity: 'STARTER', cost: 2, heal: 50, selfStatusEffect: { type: 'FREEZE', value: 2 }, desc: '恢复 50 点生命，获得 2 层 [冻结]' },
    { id: 'sn2', name: 'Rest (睡觉).sh', type: 'SKILL', rarity: 'STARTER', cost: 2, heal: 50, selfStatusEffect: { type: 'FREEZE', value: 2 }, desc: '恢复 50 点生命，获得 2 层 [冻结]' },
  ],
  eevee: [
    { id: 'ev1', name: 'Swift (高速星).exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 10, desc: '造成 10 点伤害', vfx: 'physical' },
    { id: 'ev1', name: 'Swift (高速星).exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 10, desc: '造成 10 点伤害', vfx: 'physical' },
    { id: 'ev2', name: 'Quick Attack (电光一闪).cmd', type: 'ATTACK', rarity: 'STARTER', cost: 0, damage: 4, draw: 1, desc: '造成 4 点伤害，抽 1 张牌', vfx: 'physical' },
    { id: 'ev2', name: 'Quick Attack (电光一闪).cmd', type: 'ATTACK', rarity: 'STARTER', cost: 0, damage: 4, draw: 1, desc: '造成 4 点伤害，抽 1 张牌', vfx: 'physical' },
  ],
  gyarados: [
    { id: 'strike', name: '打击 (Strike).exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 6, desc: '造成 6 点伤害', vfx: 'physical' },
    { id: 'strike', name: '打击 (Strike).exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 6, desc: '造成 6 点伤害', vfx: 'physical' },
    { id: 'defend', name: '防御 (Defend).prot', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 5, desc: '获得 5 点屏障', vfx: 'shield' },
    { id: 'defend', name: '防御 (Defend).prot', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 5, desc: '获得 5 点屏障', vfx: 'shield' },
    { id: 'aqua_jet', name: '喷射水柱 (Aqua Jet).exe', type: 'ATTACK', rarity: 'COMMON', cost: 0, damage: 4, desc: '造成 4 点伤害', vfx: 'physical' },
    { id: 'dragon_dance', name: '龙之舞 (Dragon Dance).sys', type: 'POWER', rarity: 'RARE', cost: 1, desc: '获得 1 层 [力量] 和 1 层 [敏捷]', vfx: 'buff' },
  ],
  alakazam: [
    { id: 'strike', name: '打击 (Strike).exe', type: 'ATTACK', rarity: 'STARTER', cost: 1, damage: 6, desc: '造成 6 点伤害', vfx: 'physical' },
    { id: 'defend', name: '防御 (Defend).prot', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 5, desc: '获得 5 点屏障', vfx: 'shield' },
    { id: 'defend', name: '防御 (Defend).prot', type: 'SKILL', rarity: 'STARTER', cost: 1, shield: 5, desc: '获得 5 点屏障', vfx: 'shield' },
    { id: 'psybeam', name: '幻象光线 (Psybeam).exe', type: 'ATTACK', rarity: 'COMMON', cost: 1, damage: 8, statusEffect: { type: 'WEAK', value: 1 }, desc: '造成 8 点伤害，施加 1 层 [虚弱]', vfx: 'psychic' },
    { id: 'calm_mind', name: '冥想 (Calm Mind).sys', type: 'POWER', rarity: 'UNCOMMON', cost: 1, desc: '获得 2 层 [敏捷]', vfx: 'buff' },
    { id: 'teleport', name: '瞬间移动 (Teleport).sys', type: 'SKILL', rarity: 'RARE', cost: 0, draw: 3, desc: '抽 3 张牌。消耗', isExhaust: true, vfx: 'psychic' },
  ],
};

export const RELICS_DB: Relic[] = [
  { id: 'usb', name: '生锈的U盘', desc: '每场战斗第一回合额外抽 2 张牌', icon: 'Database', price: 140 },
  { id: 'cooling', name: '液冷系统', desc: '每次洗牌时恢复 5 点系统完整度', icon: 'Activity', price: 160 },
  { id: 'battery', name: '备用电池', desc: '每回合开始时额外获得 1 点算力核心', icon: 'Zap', price: 240 },
  { id: 'shield_gen', name: '便携护盾发生器', desc: '每场战斗开始时获得 10 点屏障', icon: 'Shield', price: 110 },
  { id: 'chip', name: '超频芯片', desc: '你的攻击额外造成 1 点伤害', icon: 'Swords', price: 180 },
  { id: 'gold_magnet', name: '金币磁铁', desc: '每场战斗额外获得 10 金币', icon: 'Coins', price: 130 },
  { id: 'heal_module', name: '修复模块', desc: '战斗胜利后恢复 10% 系统完整度', icon: 'HeartPulse', price: 200 },
  { id: 'energy_core', name: '能量核心', desc: '最大算力核心 +1', icon: 'Zap', price: 280 },
  { id: 'data_analyzer', name: '数据分析仪', desc: '战斗奖励中额外出现 1 张卡牌选项', icon: 'Search', price: 160 },
  { id: 'exp_share', name: '学习装置', desc: '战斗胜利后金币奖励增加 25%', icon: 'Share2', price: 150 },
  { id: 'quick_claw', name: '先制之爪', desc: '每场战斗第一张攻击牌伤害翻倍', icon: 'Zap', price: 220 },
  { id: 'focus_band', name: '气势披带', desc: '每场战斗可抵挡一次致命伤害，保留 1 点生命', icon: 'Heart', price: 250 },
  { id: 'leftovers', name: '吃剩的东西', desc: '回合结束时恢复 2 点生命', icon: 'Coffee', price: 180 },
  { id: 'rocky_helmet', name: '凸凸头盔', desc: '受到攻击时对敌方造成 3 点反伤', icon: 'ShieldAlert', price: 160 },
];

export const SHOP_UPGRADES_DB: ShopUpgrade[] = [
  { id: 'bulk_discount', name: '大宗采购协议', desc: '商店所有商品价格永久降低 15%', icon: 'ShoppingCart', price: 250, effect: 'DISCOUNT' },
  { id: 'data_miner', name: '数据挖掘工具', desc: '刷新商店的费用降低 50%', icon: 'Search', price: 180, effect: 'REFRESH_SALE' },
  { id: 'lucky_charm', name: '幸运护符', desc: '抽奖获得稀有奖励的概率提升', icon: 'Star', price: 220, effect: 'GACHA_LUCK' },
  { id: 'premium_access', name: '高级访问权限', desc: '商店中出现稀有协议的概率提升', icon: 'Lock', price: 300, effect: 'RARE_CHANCE' },
];

export const COLLECTION_DB: Relic[] = [
  { id: 'master_ball_relic', name: '大师球原型', desc: '所有捕获成功率提升 50%', icon: 'Circle', rarity: 'LEGENDARY' },
  { id: 'ancient_data_core', name: '远古数据核心', desc: '每回合额外获得 1 点能量', icon: 'Database', rarity: 'LEGENDARY' },
  { id: 'glitch_shield', name: '故障护盾', desc: '战斗开始时获得 10 点护盾', icon: 'Shield', rarity: 'RARE' },
];

export const TASKS_DB: Task[] = [
  { id: 'daily_login', title: '每日签到', desc: '今天也要努力渗透网络', reward: 50, type: 'DAILY_LOGIN', progress: 0, target: 1, isClaimed: false },
  { id: 'battle_win_1', title: '初露锋芒', desc: '赢得 1 场战斗', reward: 30, type: 'BATTLE_WIN', progress: 0, target: 1, isClaimed: false },
  { id: 'battle_win_3', title: '渗透专家', desc: '赢得 3 场战斗', reward: 100, type: 'BATTLE_WIN', progress: 0, target: 3, isClaimed: false },
  { id: 'gold_spent_100', title: '消费达人', desc: '在商店消费 100 金币', reward: 50, type: 'GOLD_SPENT', progress: 0, target: 100, isClaimed: false },
];

export const ENEMIES_DB = [
  // Normal Enemies
  { id: 'rattata', name: '小拉达.virus', img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/19.png', maxHp: 45, color: '#a8a878', neonClass: 'neon-gray', bgGradient: 'from-gray-900/40 to-black' },
  { id: 'caterpie', name: '绿毛虫.worm', img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10.png', maxHp: 40, color: '#a8b820', neonClass: 'neon-green', bgGradient: 'from-green-900/40 to-black' },
  { id: 'pidgey', name: '波波.bot', img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/16.png', maxHp: 50, color: '#a890f0', neonClass: 'neon-blue', bgGradient: 'from-blue-900/40 to-black' },
  { id: 'zubat', name: '超音蝠.sonar', img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/41.png', maxHp: 55, color: '#a040a0', neonClass: 'neon-purple', bgGradient: 'from-purple-900/40 to-black' },
  { id: 'meowth', name: '喵喵.coin', img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png', maxHp: 65, color: '#f7d02c', neonClass: 'neon-yellow', bgGradient: 'from-yellow-900/40 to-black' },
  { id: 'magnemite', name: '小磁怪.magnet', img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/81.png', maxHp: 70, color: '#b8b8d0', neonClass: 'neon-gray', bgGradient: 'from-gray-900/40 to-black' },
  { id: 'koffing', name: '瓦斯弹.gas', img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/109.png', maxHp: 75, color: '#a040a0', neonClass: 'neon-purple', bgGradient: 'from-purple-900/40 to-black' },
  { id: 'machop', name: '腕力.str', img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/66.png', maxHp: 80, color: '#d0d0d0', neonClass: 'neon-gray', bgGradient: 'from-gray-900/40 to-black' },
  { id: 'abra', name: '凯西.teleport', img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/63.png', maxHp: 40, color: '#f8d030', neonClass: 'neon-yellow', bgGradient: 'from-yellow-900/40 to-black' },
  { id: 'geodude', name: '小拳石.rock', img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/74.png', maxHp: 90, color: '#b8b8d0', neonClass: 'neon-gray', bgGradient: 'from-gray-900/40 to-black' },
  { id: 'eevee', name: '伊布.data', img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png', maxHp: 60, color: '#d97706', neonClass: 'neon-orange', bgGradient: 'from-orange-900/40 to-black' },
  { id: 'jigglypuff', name: '胖丁.sleep', img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png', maxHp: 80, color: '#f472b6', neonClass: 'neon-purple', bgGradient: 'from-purple-900/40 to-black' },
  { id: 'psyduck', name: '可达鸭.headache', img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png', maxHp: 70, color: '#fbbf24', neonClass: 'neon-yellow', bgGradient: 'from-yellow-900/40 to-black' },
  { id: 'growlithe', name: '卡蒂狗.fire', img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/58.png', maxHp: 75, color: '#f97316', neonClass: 'neon-orange', bgGradient: 'from-orange-900/40 to-black' },
  
  // Elite Enemies
  { id: 'scyther', name: '飞天螳螂.blade', img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/123.png', maxHp: 120, color: '#a8b820', neonClass: 'neon-green', bgGradient: 'from-green-900/40 to-black', isElite: true },
  { id: 'gyarados', name: '暴鲤龙.hydra', img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/130.png', maxHp: 150, color: '#7038f8', neonClass: 'neon-blue', bgGradient: 'from-blue-900/40 to-black', isElite: true },
  { id: 'gengar_elite', name: '耿鬼.phantom', img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png', maxHp: 140, color: '#705898', neonClass: 'neon-purple', bgGradient: 'from-purple-900/40 to-black', isElite: true },
  { id: 'alakazam', name: '胡地.mind', img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/65.png', maxHp: 130, color: '#f8d030', neonClass: 'neon-yellow', bgGradient: 'from-yellow-900/40 to-black', isElite: true },
  { id: 'machamp', name: '怪力.titan', img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/68.png', maxHp: 180, color: '#d0d0d0', neonClass: 'neon-gray', bgGradient: 'from-gray-900/40 to-black', isElite: true },

  // Bosses
  { id: 'articuno', name: '急冻鸟.cryo', img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/144.png', maxHp: 300, color: '#98d8d8', neonClass: 'neon-blue', bgGradient: 'from-blue-900/40 to-black', isBoss: true },
  { id: 'zapdos', name: '闪电鸟.volt', img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/145.png', maxHp: 300, color: '#f8d030', neonClass: 'neon-yellow', bgGradient: 'from-yellow-900/40 to-black', isBoss: true },
  { id: 'moltres', name: '火焰鸟.pyro', img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/146.png', maxHp: 300, color: '#f08030', neonClass: 'neon-orange', bgGradient: 'from-orange-900/40 to-black', isBoss: true },
  { id: 'dragonite_boss', name: '快龙.dragon', img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png', maxHp: 400, color: '#7038f8', neonClass: 'neon-orange', bgGradient: 'from-orange-900/40 to-black', isBoss: true },
  { id: 'mewtwo_boss', name: '超梦.omega', img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png', maxHp: 600, color: '#c084fc', neonClass: 'neon-purple', bgGradient: 'from-purple-900/40 to-black', isBoss: true },
  { id: 'rayquaza', name: '烈空坐.zenith', img: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/384.png', maxHp: 800, color: '#4ade80', neonClass: 'neon-green', bgGradient: 'from-green-900/40 to-black', isBoss: true },
];

export const JUNK_CARD: Omit<Card, 'uid'> = {
  id: 'junk',
  name: '垃圾数据 (Junk)',
  type: 'SKILL',
  rarity: 'SPECIAL',
  cost: 1,
  desc: '消耗 1 点能量以清理。回合结束时，若在手牌中，失去 2 点系统完整度。',
  vfx: 'glitch',
  isExhaust: true,
};

export const CARDS_DB: Omit<Card, 'uid'>[] = [
  ...Array.from(
    new Set(Object.values(INITIAL_DECKS).flat().map(c => JSON.stringify(c)))
  ).map(s => JSON.parse(s)),
  { id: 'plasma_strike', name: '等离子打击 (Plasma Strike).exe', type: 'ATTACK', rarity: 'UNCOMMON', cost: 1, damage: 12, desc: '造成 12 点伤害。获得 1 层 [电荷]', vfx: 'lightning' },
  { id: 'fire_wall_plus', name: '高级防火墙 (Firewall+).prot', type: 'SKILL', rarity: 'RARE', cost: 1, shield: 15, desc: '获得 15 点屏障。消耗', isExhaust: true, vfx: 'shield' },
  { id: 'data_mine', name: '数据挖掘 (Data Mine).scan', type: 'SKILL', rarity: 'UNCOMMON', cost: 0, draw: 2, desc: '抽 2 张牌。消耗', isExhaust: true, vfx: 'search' },
  { id: 'overclock', name: '超频 (Overclock).sys', type: 'POWER', rarity: 'RARE', cost: 3, desc: '每回合开始时额外获得 1 点核心算力', vfx: 'buff' },
  { id: 'logic_bomb', name: '逻辑炸弹 (Logic Bomb).exe', type: 'ATTACK', rarity: 'RARE', cost: 2, damage: 30, desc: '造成 30 点伤害。消耗', isExhaust: true, vfx: 'explosion' },
  { id: 'system_restore', name: '系统还原 (Restore).sh', type: 'SKILL', rarity: 'UNCOMMON', cost: 1, heal: 10, desc: '恢复 10 点生命。消耗', isExhaust: true, vfx: 'heal' },
  { id: 'glitch_strike', name: '故障打击 (Glitch Strike).exe', type: 'ATTACK', rarity: 'RARE', cost: 1, damage: 20, selfStatusEffect: { type: 'VULNERABLE', value: 1 }, desc: '造成 20 点伤害，自身获得 1 层 [易伤]', vfx: 'glitch' },
  { id: 'data_corruption', name: '数据腐蚀 (Corrupt).sys', type: 'SKILL', rarity: 'RARE', cost: 2, statusEffect: { type: 'POISON', value: 10 }, desc: '给予敌方 10 层 [中毒]', vfx: 'poison' },
  { id: 'logic_loop', name: '逻辑循环 (Loop).sys', type: 'SKILL', rarity: 'UNCOMMON', cost: 1, draw: 2, desc: '抽 2 张牌', vfx: 'buff' },
  { id: 'binary_shield', name: '二进制屏障 (Binary).prot', type: 'SKILL', rarity: 'COMMON', cost: 1, shield: 12, desc: '获得 12 点屏障', vfx: 'buff' },
];

export const CONSUMABLES_DB: Consumable[] = [
  { id: 'potion', name: '基础修复液 (Potion)', desc: '恢复 20 点系统完整度', price: 50, type: 'HEAL', value: 20, icon: 'Heart' },
  { id: 'super_potion', name: '高级修复液 (Super Potion)', desc: '恢复 50 点系统完整度', price: 100, type: 'HEAL', value: 50, icon: 'Heart' },
  { id: 'hyper_potion', name: '全复药 (Hyper Potion)', desc: '恢复所有系统完整度', price: 200, type: 'HEAL', value: 999, icon: 'HeartPulse' },
  { id: 'ether', name: '核心补给 (Ether)', desc: '恢复 2 点核心算力', price: 80, type: 'ENERGY', value: 2, icon: 'Zap' },
  { id: 'max_ether', name: '最大核心补给 (Max Ether)', desc: '恢复所有核心算力', price: 150, type: 'ENERGY', value: 5, icon: 'Zap' },
  { id: 'x_attack', name: '力量强化插件 (X Attack)', desc: '获得 3 层 [力量]', price: 120, type: 'STATUS', value: 3, icon: 'Sword', statusType: 'STRENGTH' },
  { id: 'x_defense', name: '防御强化插件 (X Defense)', desc: '获得 3 层 [敏捷]', price: 120, type: 'STATUS', value: 3, icon: 'Shield', statusType: 'DEXTERITY' },
  { id: 'x_accuracy', name: '精准强化插件 (X Accuracy)', desc: '获得 3 层 [电荷]', price: 100, type: 'STATUS', value: 3, icon: 'Target', statusType: 'CHARGE' },
  { id: 'full_heal', name: '系统清理程序 (Full Heal)', desc: '清除所有负面状态', price: 100, type: 'STATUS', value: 0, icon: 'RefreshCw' },
  { id: 'poke_ball', name: '数据捕捉球 (Poke Ball)', desc: '尝试捕获敌方数据 (低成功率)', price: 50, type: 'STATUS', value: 0, icon: 'Circle' },
  { id: 'great_ball', name: '高级捕捉球 (Great Ball)', desc: '尝试捕获敌方数据 (中成功率)', price: 150, type: 'STATUS', value: 0, icon: 'CircleDot' },
  { id: 'ultra_ball', name: '特级捕捉球 (Ultra Ball)', desc: '尝试捕获敌方数据 (高成功率)', price: 300, type: 'STATUS', value: 0, icon: 'Disc' },
  { id: 'master_ball', name: '大师捕捉球 (Master Ball)', desc: '必中捕获敌方数据', price: 1000, type: 'STATUS', value: 0, icon: 'Crown' },
  { id: 'rare_candy', name: '神奇糖果 (Rare Candy)', desc: '永久提升 20 点最大系统完整度', price: 400, type: 'STATUS', value: 0, icon: 'Star' },
  { id: 'protein', name: '蛋白质 (Protein)', desc: '永久提升 2 点最大系统完整度', price: 150, type: 'STATUS', value: 0, icon: 'Dumbbell' },
  { id: 'revive', name: '系统重启 (Revive)', desc: '复活所有已失效的宝可梦 (50% HP)', price: 250, type: 'STATUS', value: 0, icon: 'Power' },
  { id: 'max_revive', name: '完全重启 (Max Revive)', desc: '复活所有已失效的宝可梦 (100% HP)', price: 500, type: 'STATUS', value: 0, icon: 'Power' },
  { id: 'dire_hit', name: '暴击插件 (Dire Hit)', desc: '获得 5 层 [力量]', price: 200, type: 'STATUS', value: 5, icon: 'Zap' },
  { id: 'iron', name: '铁甲插件 (Iron)', desc: '获得 20 点屏障', price: 150, type: 'STATUS', value: 20, icon: 'Shield' },
  { id: 'cyber_snack', name: '赛博零食 (Cyber Snack)', desc: '恢复 10 点 HP', price: 30, type: 'HEAL', value: 10, icon: 'Coffee' },
  { id: 'energy_drink', name: '能量饮料 (Energy Drink)', desc: '抽 2 张牌', price: 60, type: 'DRAW', value: 2, icon: 'GlassWater' },
  { id: 'glitch_patch', name: '故障补丁 (Glitch Patch)', desc: '清除 1 层 [过载]', price: 80, type: 'STATUS', value: -1, icon: 'Wrench', statusType: 'OVERLOAD' },
  { id: 'fire_stone', name: '火之石 (Fire Stone)', desc: '使火系技能伤害提升', price: 300, type: 'STATUS', value: 5, icon: 'Flame', statusType: 'STRENGTH' },
  { id: 'water_stone', name: '水之石 (Water Stone)', desc: '使水系技能防御提升', price: 300, type: 'STATUS', value: 5, icon: 'Droplets', statusType: 'DEXTERITY' },
  { id: 'thunder_stone', name: '雷之石 (Thunder Stone)', desc: '使电系技能充能提升', price: 300, type: 'STATUS', value: 5, icon: 'Zap', statusType: 'CHARGE' },
];
