/**
 * AI NPC 私有内在状态管理系统
 * 
 * 这是整个系统中最核心的"隐私保护"机制。每个AI NPC都有一个
 * 完全私有的内在状态对象，这个对象模拟了角色的"内心世界"——
 * 那些不可被外界直接观测，但会影响其行为决策的心理状态。
 * 
 * 设计原则：
 * 1. 绝对隔离：任何AI都无法直接访问其他AI的内在状态
 * 2. 状态驱动：内在状态会影响AI的决策逻辑，但不会直接暴露
 * 3. 动态演化：状态会根据外在事件和时间流逝而自然变化
 * 4. 角色差异：不同角色类型有不同的初始状态和变化规律
 */

import { InternalState, Character } from '../types';

/**
 * 角色内在状态配置模板
 * 定义不同类型角色的基础心理特征
 */
interface CharacterStateTemplate {
  /** 基础能量水平 */
  baseEnergy: number;
  /** 基础专注度 */
  baseFocus: number;
  /** 基础好奇心 */
  baseCuriosity: number;
  /** 能量消耗速率（每分钟） */
  energyDecayRate: number;
  /** 专注度衰减速率 */
  focusDecayRate: number;
  /** 好奇心增长倾向 */
  curiosityGrowthRate: number;
  /** 状态恢复能力 */
  recoveryRate: number;
}

/**
 * 预定义的角色状态模板
 * 每种角色类型都有独特的心理特征
 */
const CHARACTER_TEMPLATES: Record<string, CharacterStateTemplate> = {
  // 陈浩：专注型技术人员
  'guard_type': {
    baseEnergy: 3,      // 较低能量，容易疲劳
    baseFocus: 9,       // 极高专注度
    baseCuriosity: 2,   // 较低好奇心，专注当前任务
    energyDecayRate: 0.1,
    focusDecayRate: 0.05,
    curiosityGrowthRate: 0.02,
    recoveryRate: 0.8
  },
  
  // 林溪：活跃型社交人员
  'wanderer_type': {
    baseEnergy: 6,      // 较高能量
    baseFocus: 2,       // 较低专注度，容易分心
    baseCuriosity: 8,   // 极高好奇心
    energyDecayRate: 0.15,
    focusDecayRate: 0.1,
    curiosityGrowthRate: 0.05,
    recoveryRate: 0.6
  },
  
  // 学者/祭司：平衡型智慧人员
  'scholar_type': {
    baseEnergy: 4,      // 中等能量
    baseFocus: 7,       // 较高专注度
    baseCuriosity: 6,   // 较高好奇心
    energyDecayRate: 0.08,
    focusDecayRate: 0.06,
    curiosityGrowthRate: 0.04,
    recoveryRate: 0.7
  },
  
  // 商人：机会主义者
  'merchant_type': {
    baseEnergy: 5,      // 中等偏高能量
    baseFocus: 6,       // 中等专注度
    baseCuriosity: 5,   // 中等好奇心，但对机会敏感
    energyDecayRate: 0.12,
    focusDecayRate: 0.08,
    curiosityGrowthRate: 0.03,
    recoveryRate: 0.9   // 高恢复能力
  },
  
  // 默认模板
  'default': {
    baseEnergy: 5,
    baseFocus: 5,
    baseCuriosity: 5,
    energyDecayRate: 0.1,
    focusDecayRate: 0.08,
    curiosityGrowthRate: 0.03,
    recoveryRate: 0.7
  }
};

/**
 * 状态变化事件类型
 * 定义什么样的外在事件会影响内在状态
 */
export interface StateModifier {
  /** 能量变化值 */
  energyDelta?: number;
  /** 专注度变化值 */
  focusDelta?: number;
  /** 好奇心变化值 */
  curiosityDelta?: number;
  /** 变化原因描述 */
  reason: string;
  /** 变化强度（0-1） */
  intensity?: number;
}

/**
 * AI NPC 内在状态管理器
 * 
 * 这个类负责管理所有AI NPC的私有内在状态。它确保每个AI的内心世界
 * 都是完全独立和隐私的，同时提供状态更新和查询的接口。
 */
export class InternalStateManager {
  /** 私有状态存储：角色ID -> 内在状态 */
  private states: Map<string, InternalState> = new Map();
  
  /** 角色模板映射：角色ID -> 模板类型 */
  private characterTemplates: Map<string, CharacterStateTemplate> = new Map();
  
  /** 状态更新历史记录（用于调试和分析） */
  private stateHistory: Map<string, Array<{
    timestamp: number;
    state: InternalState;
    reason: string;
  }>> = new Map();

  constructor() {
    console.log('🧠 AI NPC内在状态管理器已启动 - 每个AI的内心世界现在都是私密的');
  }

  /**
   * 为新的AI NPC初始化内在状态
   * 
   * @param character 角色信息
   * @param templateType 角色类型模板（可选）
   */
  initializeCharacterState(character: Character, templateType?: string): InternalState {
    // 确定使用哪个模板
    const templateKey = templateType || this.inferTemplateFromRole(character.role) || 'default';
    const template = CHARACTER_TEMPLATES[templateKey] || CHARACTER_TEMPLATES.default;
    
    // 添加一些随机性，让相同类型的角色也有个体差异
    const randomVariation = 0.2; // 20%的随机变化
    
    const initialState: InternalState = {
      energy: this.addRandomVariation(template.baseEnergy, randomVariation),
      focus: this.addRandomVariation(template.baseFocus, randomVariation),
      curiosity: this.addRandomVariation(template.baseCuriosity, randomVariation),
      lastUpdated: Date.now()
    };

    // 确保所有值都在合理范围内
    this.clampState(initialState);
    
    // 存储状态和模板
    this.states.set(character.id, initialState);
    this.characterTemplates.set(character.id, template);
    
    // 记录初始状态
    this.recordStateChange(character.id, initialState, `角色初始化 (模板: ${templateKey})`);
    
    console.log(`🎭 为角色 ${character.name} (${character.id}) 初始化内在状态:`, 
                `能量=${initialState.energy.toFixed(1)}, ` +
                `专注=${initialState.focus.toFixed(1)}, ` +
                `好奇=${initialState.curiosity.toFixed(1)}`);
    
    return { ...initialState }; // 返回副本，不是引用
  }

  /**
   * 获取角色的当前内在状态（只读副本）
   * 
   * 重要：这个方法返回的是状态的副本，不是原始对象的引用。
   * 这确保了外部代码无法直接修改内在状态。
   */
  getCharacterState(characterId: string): InternalState | null {
    const state = this.states.get(characterId);
    if (!state) {
      console.warn(`⚠️ 尝试获取不存在的角色内在状态: ${characterId}`);
      return null;
    }

    // 在返回状态之前，先更新自然衰减
    this.updateNaturalDecay(characterId);
    
    // 返回深拷贝，确保隐私性
    return { ...state };
  }

  /**
   * 应用状态修改
   * 
   * 这是外部影响AI NPC内在状态的唯一途径。
   * 所有的状态变化都必须通过这个方法，并提供变化原因。
   */
  applyStateModifier(characterId: string, modifier: StateModifier): boolean {
    const currentState = this.states.get(characterId);
    if (!currentState) {
      console.warn(`⚠️ 尝试修改不存在的角色状态: ${characterId}`);
      return false;
    }

    // 应用自然衰减
    this.updateNaturalDecay(characterId);
    
    // 计算变化强度（默认为1.0）
    const intensity = modifier.intensity || 1.0;
    
    // 应用状态变化
    const newState = { ...currentState };
    
    if (modifier.energyDelta !== undefined) {
      newState.energy += modifier.energyDelta * intensity;
    }
    
    if (modifier.focusDelta !== undefined) {
      newState.focus += modifier.focusDelta * intensity;
    }
    
    if (modifier.curiosityDelta !== undefined) {
      newState.curiosity += modifier.curiosityDelta * intensity;
    }
    
    newState.lastUpdated = Date.now();
    
    // 确保所有值都在合理范围内
    this.clampState(newState);
    
    // 更新存储的状态
    this.states.set(characterId, newState);
    
    // 记录状态变化
    this.recordStateChange(characterId, newState, modifier.reason);
    
    console.log(`🔄 角色 ${characterId} 状态变化: ${modifier.reason}`);
    console.log(`   能量: ${currentState.energy.toFixed(1)} → ${newState.energy.toFixed(1)}`);
    console.log(`   专注: ${currentState.focus.toFixed(1)} → ${newState.focus.toFixed(1)}`);
    console.log(`   好奇: ${currentState.curiosity.toFixed(1)} → ${newState.curiosity.toFixed(1)}`);
    
    return true;
  }

  /**
   * 获取角色的状态变化历史
   * 主要用于调试和行为分析
   */
  getStateHistory(characterId: string, limit?: number): Array<{
    timestamp: number;
    state: InternalState;
    reason: string;
  }> {
    const history = this.stateHistory.get(characterId) || [];
    return limit ? history.slice(-limit) : [...history];
  }

  /**
   * 移除角色的所有状态数据
   * 当角色离开游戏时调用
   */
  removeCharacterState(characterId: string): boolean {
    const hasState = this.states.has(characterId);
    
    this.states.delete(characterId);
    this.characterTemplates.delete(characterId);
    this.stateHistory.delete(characterId);
    
    if (hasState) {
      console.log(`🗑️ 已清理角色 ${characterId} 的内在状态数据`);
    }
    
    return hasState;
  }

  /**
   * 获取所有活跃角色的状态统计
   */
  getSystemStats(): {
    totalCharacters: number;
    averageEnergy: number;
    averageFocus: number;
    averageCuriosity: number;
    stateDistribution: Record<string, number>;
  } {
    const allStates = Array.from(this.states.values());
    
    if (allStates.length === 0) {
      return {
        totalCharacters: 0,
        averageEnergy: 0,
        averageFocus: 0,
        averageCuriosity: 0,
        stateDistribution: {}
      };
    }

    const totals = allStates.reduce((acc, state) => ({
      energy: acc.energy + state.energy,
      focus: acc.focus + state.focus,
      curiosity: acc.curiosity + state.curiosity
    }), { energy: 0, focus: 0, curiosity: 0 });

    // 分析状态分布
    const stateDistribution: Record<string, number> = {
      'high_energy': allStates.filter(s => s.energy > 7).length,
      'medium_energy': allStates.filter(s => s.energy >= 4 && s.energy <= 7).length,
      'low_energy': allStates.filter(s => s.energy < 4).length,
      'high_focus': allStates.filter(s => s.focus > 7).length,
      'medium_focus': allStates.filter(s => s.focus >= 4 && s.focus <= 7).length,
      'low_focus': allStates.filter(s => s.focus < 4).length,
      'high_curiosity': allStates.filter(s => s.curiosity > 7).length,
      'medium_curiosity': allStates.filter(s => s.curiosity >= 4 && s.curiosity <= 7).length,
      'low_curiosity': allStates.filter(s => s.curiosity < 4).length
    };

    return {
      totalCharacters: allStates.length,
      averageEnergy: totals.energy / allStates.length,
      averageFocus: totals.focus / allStates.length,
      averageCuriosity: totals.curiosity / allStates.length,
      stateDistribution
    };
  }

  /**
   * 私有方法：从角色职业推断模板类型
   */
  private inferTemplateFromRole(role: string): string | null {
    const roleKeywords: Record<string, string> = {
      '卫兵': 'guard_type',
      '守卫': 'guard_type',
      '士兵': 'guard_type',
      '流浪者': 'wanderer_type',
      '旅行者': 'wanderer_type',
      '冒险者': 'wanderer_type',
      '学者': 'scholar_type',
      '祭司': 'scholar_type',
      '法师': 'scholar_type',
      '商人': 'merchant_type',
      '贸易商': 'merchant_type',
      '店主': 'merchant_type'
    };

    for (const [keyword, template] of Object.entries(roleKeywords)) {
      if (role.includes(keyword)) {
        return template;
      }
    }

    return null;
  }

  /**
   * 私有方法：添加随机变化
   */
  private addRandomVariation(baseValue: number, variationPercent: number): number {
    const variation = baseValue * variationPercent * (Math.random() - 0.5) * 2;
    return baseValue + variation;
  }

  /**
   * 私有方法：确保状态值在合理范围内
   */
  private clampState(state: InternalState): void {
    state.energy = Math.max(0, Math.min(10, state.energy));
    state.focus = Math.max(0, Math.min(10, state.focus));
    state.curiosity = Math.max(0, Math.min(10, state.curiosity));
  }

  /**
   * 私有方法：记录状态变化历史
   */
  private recordStateChange(characterId: string, state: InternalState, reason: string): void {
    const history = this.stateHistory.get(characterId) || [];
    history.push({
      timestamp: Date.now(),
      state: { ...state },
      reason
    });
    
    // 限制历史记录长度
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    this.stateHistory.set(characterId, history);
  }

  /**
   * 私有方法：更新自然衰减
   * 随着时间流逝，状态会自然发生变化
   */
  private updateNaturalDecay(characterId: string): void {
    const state = this.states.get(characterId);
    const template = this.characterTemplates.get(characterId);
    
    if (!state || !template) return;

    const now = Date.now();
    const timeDelta = (now - state.lastUpdated) / (1000 * 60); // 转换为分钟

    if (timeDelta < 1) return; // 少于1分钟不处理

    // 应用自然衰减
    state.energy -= template.energyDecayRate * timeDelta;
    state.focus -= template.focusDecayRate * timeDelta;
    state.curiosity += template.curiosityGrowthRate * timeDelta;

    state.lastUpdated = now;
    
    // 确保值在合理范围内
    this.clampState(state);
  }
}

/**
 * 全局内在状态管理器实例
 * 
 * 在整个应用中，我们使用单例模式来确保所有AI NPC的内在状态
 * 都通过同一个管理器进行管理，这样可以保证状态的一致性和隔离性。
 */
export const globalInternalStateManager = new InternalStateManager();