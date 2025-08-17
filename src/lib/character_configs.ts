/**
 * 《日识》核心互动原型 - 终极简化角色配置 v2.0
 * 
 * 设计哲学：只保留两个核心AI角色 + 一个万能系统AI
 * 彻底移除所有预设背景NPC，实现真正的动态角色召唤
 */

/**
 * 角色类型枚举 - 极简版
 */
export type CharacterType = 'CORE_AI' | 'SYSTEM_AI';

/**
 * 角色配置接口 - 极简版
 */
export interface CharacterConfig {
  /** 角色唯一标识符 */
  id: string;
  /** 角色显示名称 */
  name: string;
  /** 角色类型：核心AI或系统AI */
  type: CharacterType;
  /** 角色核心动机描述，用于AI生成时的人格指导 */
  motivation: string;
  /** 触发该角色响应的关键词列表，用于智能路由 */
  keywords: string[];
  /** 角色的默认响应概率（仅对CORE_AI有效，0-1之间） */
  responseRate?: number;
  /** 角色头像表情符号 */
  avatar?: string;
  /** 角色简短描述 */
  description?: string;
}

/**
 * 终极简化角色配置表
 * 
 * 只包含：
 * 1. 两个核心AI角色（林溪、陈浩）- 拥有独立内在状态和复杂人格
 * 2. 一个万能系统AI - 负责动态扮演所有临时角色
 */
export const characterConfigs: Record<string, CharacterConfig> = {
  // ===== 核心AI角色：故事主角，拥有复杂内在逻辑 =====
  linxi: {
    id: 'linxi',
    name: '林溪',
    type: 'CORE_AI',
    motivation: '作为经验丰富的调查员，我眼神锐利，善于观察细节，喜欢掌控局面，对新来者保持警觉但不失礼貌。我总是试图从对话中获取信息，分析每个人的动机和行为模式。',
    // 🎭 重新设计关键词：更精准，避免过度触发
    keywords: [
      // 直接指名
      '林溪', '@林溪', 'linxi', '@linxi',
      // 职业相关
      '调查', '观察', '分析', '案件', '线索', '证据', '嫌疑',
      // 互动词汇
      '看起来', '注意到', '发现', '怀疑', '检查',
      // 疑问和询问
      '什么情况', '怎么回事', '有什么发现'
    ],
    responseRate: 0.45, // 🎭 提高基础响应率，让林溪更主动参与
    avatar: '👩‍🦱',
    description: '经验丰富的调查员，眼神锐利，善于观察细节'
  },
  
  chenhao: {
    id: 'chenhao',
    name: '陈浩',
    type: 'CORE_AI',
    motivation: '我是一个看似普通但内心紧张不安的年轻人，试图保持低调避免引起注意，对外界刺激反应强烈，容易紧张。我有些不为人知的秘密，总是担心被发现。',
    // 🎭 重新设计关键词：更敏感，反映焦虑性格
    keywords: [
      // 直接指名
      '陈浩', '@陈浩', 'chenhao', '@chenhao',
      // 情绪相关
      '紧张', '秘密', '低调', '害怕', '担心', '不安',
      // 触发反应的词汇
      '警察', '调查', '问题', '麻烦', '出事',
      // 年轻人日常
      '小伙子', '年轻人', '朋友'
    ],
    responseRate: 0.25, // 🎭 适度提高，但保持被动特质
    avatar: '👨‍💻',
    description: '看似普通的年轻人，但眼中闪烁着不安的光芒'
  }

  // ===== 系统AI在代码中动态处理，不需要在这里配置 =====
  // 系统AI的职责：根据上下文动态推断并扮演任何临时角色
};

/**
 * 获取指定角色配置
 */
export function getCharacterConfig(characterId: string): CharacterConfig | undefined {
  return characterConfigs[characterId];
}

/**
 * 获取所有核心AI角色
 */
export function getCoreAICharacters(): CharacterConfig[] {
  return Object.values(characterConfigs).filter(char => char.type === 'CORE_AI');
}

/**
 * 根据关键词匹配核心AI角色
 * 注意：系统AI不在这里匹配，而是作为默认fallback处理
 */
export function matchCoreAIByKeywords(message: string): CharacterConfig | null {
  const lowerMessage = message.toLowerCase();
  
  // 优先级匹配：@ 指名 > 直接姓名 > 相关关键词
  const directMentions = ['@林溪', '@linxi', '@陈浩', '@chenhao'];
  const nameMatches = ['林溪', 'linxi', '陈浩', 'chenhao'];
  
  // 最高优先级：@ 指名匹配
  for (const mention of directMentions) {
    if (lowerMessage.includes(mention.toLowerCase())) {
      const character = Object.values(characterConfigs).find(char => 
        char.keywords.includes(mention)
      );
      if (character) {
        console.log(`🎯 核心AI直接指名匹配: "${mention}" -> ${character.name}`);
        return character;
      }
    }
  }
  
  // 第二优先级：姓名匹配
  for (const name of nameMatches) {
    if (lowerMessage.includes(name.toLowerCase())) {
      const character = Object.values(characterConfigs).find(char => 
        char.keywords.includes(name)
      );
      if (character) {
        console.log(`🎯 核心AI姓名匹配: "${name}" -> ${character.name}`);
        return character;
      }
    }
  }
  
  // 第三优先级：相关关键词匹配
  for (const character of Object.values(characterConfigs)) {
    if (character.type === 'CORE_AI') {
      for (const keyword of character.keywords) {
        // 跳过已经检查过的直接指名和姓名
        if (directMentions.includes(keyword) || nameMatches.includes(keyword)) continue;
        
        if (lowerMessage.includes(keyword.toLowerCase())) {
          console.log(`🎯 核心AI关键词匹配: "${keyword}" -> ${character.name}`);
          return character;
        }
      }
    }
  }
  
  console.log(`🌐 无核心AI匹配，将使用万能系统AI处理`);
  return null;
}

/**
 * 🆕 获取可能响应的核心AI角色列表
 * 用于并行决策：基于概率确定哪些核心AI可能对公共消息产生反应
 */
export function getPotentialCoreAIResponders(message: string): CharacterConfig[] {
  const potentialResponders: CharacterConfig[] = [];
  
  // 获取所有核心AI角色
  const coreAIs = getCoreAICharacters();
  
  for (const character of coreAIs) {
    // 检查是否应该基于概率响应
    const shouldRespond = Math.random() < (character.responseRate || 0);
    
    if (shouldRespond) {
      console.log(`🎲 ${character.name} 决定响应 (概率: ${Math.round((character.responseRate || 0) * 100)}%)`);
      potentialResponders.push(character);
    } else {
      console.log(`🎲 ${character.name} 决定保持沉默 (概率: ${Math.round((character.responseRate || 0) * 100)}%)`);
    }
  }
  
  return potentialResponders;
}

/**
 * 🧠 高级相关性评分系统 - 基于语义和上下文的智能评分
 * 用于动态调整核心AI的响应概率，实现更自然的对话参与
 */
export function calculateRelevanceWeight(message: string, character: CharacterConfig, chatHistory?: string): number {
  const lowerMessage = message.toLowerCase();
  let baseWeight = 1.0;
  let contextBonus = 0;
  let semanticBonus = 0;
  
  // 🎯 基础关键词匹配（权重较低，避免过度反应）
  for (const keyword of character.keywords) {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      baseWeight += 0.2; // 降低基础权重，让其他因素发挥作用
    }
  }
  
  // 🧠 语义相关性评分（新增）
  semanticBonus = calculateSemanticRelevance(lowerMessage, character);
  
  // 📖 上下文连续性评分（新增）
  if (chatHistory) {
    contextBonus = calculateContextRelevance(lowerMessage, character, chatHistory);
  }
  
  // 🎭 角色性格特异性加权
  const personalityWeight = calculatePersonalityWeight(lowerMessage, character);
  
  // 📊 综合评分公式
  const finalWeight = baseWeight + semanticBonus + contextBonus + personalityWeight;
  
  // 🎲 动态权重范围：最低0.1（几乎不响应），最高3.0（强烈响应）
  return Math.max(0.1, Math.min(finalWeight, 3.0));
}

/**
 * 🧠 语义相关性评分 - 基于话题和情境的深度分析
 */
function calculateSemanticRelevance(message: string, character: CharacterConfig): number {
  let score = 0;
  
  // 🔍 林溪：调查员的职业敏感度
  if (character.id === 'linxi') {
    // 疑问和推理类话题
    if (message.includes('?') || message.includes('？') || 
        message.includes('什么') || message.includes('为什么') ||
        message.includes('怎么') || message.includes('谁')) {
      score += 0.4;
    }
    
    // 观察和分析类行为
    if (message.includes('观察') || message.includes('看') || message.includes('注意') ||
        message.includes('发现') || message.includes('检查')) {
      score += 0.5; // 林溪对观察行为非常敏感
    }
    
    // 异常行为或可疑情况
    if (message.includes('奇怪') || message.includes('不对劲') || message.includes('可疑') ||
        message.includes('秘密') || message.includes('隐藏')) {
      score += 0.6;
    }
  }
  
  // 😰 陈浩：敏感和焦虑的心理特征
  if (character.id === 'chenhao') {
    // 威胁和压力类话题
    const stressWords = ['警察', '调查', '问题', '麻烦', '出事', '检查', '搜查'];
    for (const stress of stressWords) {
      if (message.includes(stress)) {
        score += 0.7; // 陈浩对威胁极度敏感
      }
    }
    
    // 社交压力情境
    if (message.includes('大家') || message.includes('所有人') || message.includes('注意')) {
      score += 0.3; // 陈浩不喜欢成为焦点
    }
    
    // 逃避和隐藏相关
    if (message.includes('离开') || message.includes('走') || message.includes('逃')) {
      score += 0.4;
    }
  }
  
  return score;
}

/**
 * 📖 上下文连续性评分 - 基于对话历史的参与度分析
 */
function calculateContextRelevance(message: string, character: CharacterConfig, chatHistory: string): number {
  let score = 0;
  
  // 检查该角色最近是否参与了对话
  const recentMentions = chatHistory.toLowerCase().split('\n').slice(-3); // 最近3条消息
  const characterMentioned = recentMentions.some(line => 
    line.includes(character.name.toLowerCase()) || line.includes(character.id)
  );
  
  // 如果最近被提及或参与对话，提高响应概率
  if (characterMentioned) {
    score += 0.3;
  }
  
  // 检查是否是延续性对话
  const isFollowUp = message.includes('那么') || message.includes('然后') || 
                     message.includes('还有') || message.includes('另外');
  if (isFollowUp && characterMentioned) {
    score += 0.2;
  }
  
  return score;
}

/**
 * 🎭 角色性格权重计算 - 基于角色独特性格的响应倾向
 */
function calculatePersonalityWeight(message: string, character: CharacterConfig): number {
  let weight = 0;
  
  // 林溪：主动性和控制欲
  if (character.id === 'linxi') {
    // 对冲突和异常情况更主动
    if (message.includes('争吵') || message.includes('冲突') || message.includes('打架')) {
      weight += 0.5;
    }
    
    // 对新信息和线索敏感
    if (message.includes('消息') || message.includes('消息') || message.includes('听说')) {
      weight += 0.3;
    }
  }
  
  // 陈浩：被动性和回避倾向
  if (character.id === 'chenhao') {
    // 对直接询问或点名会被动响应
    if (message.includes(character.name) || message.includes('年轻人') || message.includes('小伙子')) {
      weight += 0.6; // 被点名时不得不回应
    }
    
    // 但对群体性话题倾向于回避
    if (message.includes('大家') || message.includes('所有人')) {
      weight -= 0.2; // 负权重：降低响应概率
    }
  }
  
  return weight;
}

/**
 * 角色配置验证函数
 */
export function validateCharacterConfigs(): boolean {
  try {
    for (const [id, config] of Object.entries(characterConfigs)) {
      if (config.id !== id) {
        throw new Error(`角色配置错误: ${id} 的 id 字段与键名不匹配`);
      }
      if (!config.name || !config.motivation || !config.keywords || config.keywords.length === 0) {
        throw new Error(`角色配置不完整: ${id} 缺少必需字段`);
      }
      if (!['CORE_AI', 'SYSTEM_AI'].includes(config.type)) {
        throw new Error(`角色类型错误: ${id} 的类型必须是 CORE_AI 或 SYSTEM_AI`);
      }
    }
    console.log('✅ 角色配置验证通过（终极简化版）');
    return true;
  } catch (error) {
    console.error('❌ 角色配置验证失败:', error);
    return false;
  }
}

/**
 * 获取配置统计信息
 */
export function getConfigStats() {
  const totalCharacters = Object.keys(characterConfigs).length;
  const coreAICount = getCoreAICharacters().length;
  
  return {
    total: totalCharacters,
    coreAI: coreAICount,
    systemAI: 1, // 系统AI固定为1个
    characters: Object.keys(characterConfigs),
    philosophy: 'CORE_AI + SYSTEM_AI 终极简化架构'
  };
}