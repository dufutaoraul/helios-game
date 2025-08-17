/**
 * 内在状态修改器库
 * 
 * 这个文件定义了各种预制的状态修改器，用于响应不同的游戏事件。
 * 这些修改器定义了外在事件如何影响AI NPC的内在心理状态。
 * 
 * 设计思路：
 * - 将常见的状态变化模式封装成可复用的函数
 * - 每个修改器都有清晰的语义，便于理解和维护
 * - 支持强度调节，同样的事件对不同角色可能有不同影响
 */

import { StateModifier } from './InternalStateManager';

/**
 * 常见状态修改器集合
 * 
 * 这些修改器模拟了真实世界中各种事件对人的心理状态的影响。
 * 通过组合使用这些修改器，我们可以创造出丰富多样的心理动态。
 */
export const CommonStateModifiers = {
  
  // ===========================================
  // 正面刺激类修改器
  // ===========================================
  
  /**
   * 获得赞美或成功时的状态提升
   */
  receiveCompliment(): StateModifier {
    return {
      energyDelta: 1.5,
      focusDelta: 0.5,
      curiosityDelta: 0.3,
      reason: '获得赞美，心情愉快',
      intensity: 1.0
    };
  },

  /**
   * 发现有趣的事物
   */
  discoverSomethingInteresting(): StateModifier {
    return {
      energyDelta: 0.8,
      focusDelta: 1.2,
      curiosityDelta: 2.0,
      reason: '发现了感兴趣的事物',
      intensity: 1.0
    };
  },

  /**
   * 与朋友进行愉快的对话
   */
  pleasantConversation(): StateModifier {
    return {
      energyDelta: 1.0,
      focusDelta: 0.0,
      curiosityDelta: 0.8,
      reason: '进行了愉快的对话',
      intensity: 1.0
    };
  },

  /**
   * 完成一项重要任务
   */
  completeImportantTask(): StateModifier {
    return {
      energyDelta: 0.5,
      focusDelta: -1.0, // 任务完成后专注度会下降
      curiosityDelta: 0.5,
      reason: '完成了重要任务',
      intensity: 1.0
    };
  },

  /**
   * 得到休息和恢复
   */
  restAndRecover(): StateModifier {
    return {
      energyDelta: 2.5,
      focusDelta: 1.0,
      curiosityDelta: 0.2,
      reason: '得到了充分休息',
      intensity: 1.0
    };
  },

  // ===========================================
  // 负面刺激类修改器
  // ===========================================

  /**
   * 受到威胁或恐吓
   */
  feelThreatened(): StateModifier {
    return {
      energyDelta: -1.2,
      focusDelta: 2.0, // 危险时专注度会提高
      curiosityDelta: -0.8,
      reason: '感到威胁，心理紧张',
      intensity: 1.0
    };
  },

  /**
   * 遭受批评或失败
   */
  receiveCriticism(): StateModifier {
    return {
      energyDelta: -1.8,
      focusDelta: -0.5,
      curiosityDelta: -0.3,
      reason: '受到批评，情绪低落',
      intensity: 1.0
    };
  },

  /**
   * 感到无聊或单调
   */
  feelBored(): StateModifier {
    return {
      energyDelta: -0.8,
      focusDelta: -1.5,
      curiosityDelta: 1.2, // 无聊时好奇心会增加
      reason: '感到无聊，需要刺激',
      intensity: 1.0
    };
  },

  /**
   * 身体疲劳或长时间工作
   */
  physicalFatigue(): StateModifier {
    return {
      energyDelta: -2.0,
      focusDelta: -1.2,
      curiosityDelta: -0.5,
      reason: '身体疲劳，需要休息',
      intensity: 1.0
    };
  },

  /**
   * 遇到挫折或阻碍
   */
  encounterObstacle(): StateModifier {
    return {
      energyDelta: -1.0,
      focusDelta: 0.8, // 面对挫折时可能更专注
      curiosityDelta: -0.2,
      reason: '遇到挫折，感到沮丧',
      intensity: 1.0
    };
  },

  // ===========================================
  // 社交互动类修改器
  // ===========================================

  /**
   * 参与激烈的争论
   */
  engageInArgument(): StateModifier {
    return {
      energyDelta: -1.5,
      focusDelta: 1.8,
      curiosityDelta: 0.3,
      reason: '参与激烈争论，情绪激动',
      intensity: 1.0
    };
  },

  /**
   * 被他人忽视
   */
  beingIgnored(): StateModifier {
    return {
      energyDelta: -0.8,
      focusDelta: -0.3,
      curiosityDelta: 0.5,
      reason: '被他人忽视，感到失落',
      intensity: 1.0
    };
  },

  /**
   * 成为关注的焦点
   */
  beingCenterOfAttention(): StateModifier {
    return {
      energyDelta: 1.2,
      focusDelta: 0.5,
      curiosityDelta: -0.2,
      reason: '成为关注焦点，感到兴奋',
      intensity: 1.0
    };
  },

  /**
   * 与陌生人初次见面
   */
  meetStranger(): StateModifier {
    return {
      energyDelta: 0.3,
      focusDelta: 1.0,
      curiosityDelta: 1.5,
      reason: '遇到陌生人，产生好奇',
      intensity: 1.0
    };
  },

  // ===========================================
  // 环境影响类修改器
  // ===========================================

  /**
   * 环境变得嘈杂混乱
   */
  noisyEnvironment(): StateModifier {
    return {
      energyDelta: -0.5,
      focusDelta: -1.8,
      curiosityDelta: 0.2,
      reason: '环境嘈杂，难以集中注意力',
      intensity: 1.0
    };
  },

  /**
   * 环境安静舒适
   */
  peacefulEnvironment(): StateModifier {
    return {
      energyDelta: 0.8,
      focusDelta: 1.2,
      curiosityDelta: 0.0,
      reason: '环境安静，有利于思考',
      intensity: 1.0
    };
  },

  /**
   * 天气变化影响心情
   */
  weatherChange(isGoodWeather: boolean): StateModifier {
    if (isGoodWeather) {
      return {
        energyDelta: 0.8,
        focusDelta: 0.3,
        curiosityDelta: 0.5,
        reason: '好天气让人心情愉悦',
        intensity: 1.0
      };
    } else {
      return {
        energyDelta: -0.5,
        focusDelta: -0.2,
        curiosityDelta: -0.3,
        reason: '坏天气影响情绪',
        intensity: 1.0
      };
    }
  },

  // ===========================================
  // 认知刺激类修改器
  // ===========================================

  /**
   * 学习新知识或技能
   */
  learnSomethingNew(): StateModifier {
    return {
      energyDelta: 0.5,
      focusDelta: 0.8,
      curiosityDelta: 1.8,
      reason: '学到了新知识，充满成就感',
      intensity: 1.0
    };
  },

  /**
   * 解决复杂问题
   */
  solveDifficultProblem(): StateModifier {
    return {
      energyDelta: -0.8, // 解题过程消耗能量
      focusDelta: 2.0,   // 但提高专注度
      curiosityDelta: 0.5,
      reason: '解决难题，获得成就感',
      intensity: 1.0
    };
  },

  /**
   * 遇到无法理解的现象
   */
  encounterMystery(): StateModifier {
    return {
      energyDelta: 0.2,
      focusDelta: 1.5,
      curiosityDelta: 2.5,
      reason: '遇到神秘现象，激发探索欲',
      intensity: 1.0
    };
  }
};

/**
 * 基于角色类型的状态修改器调整
 * 
 * 同样的事件对不同类型的角色可能有不同的影响强度。
 * 这个函数根据角色类型调整修改器的强度。
 */
export function adjustModifierForCharacterType(
  modifier: StateModifier, 
  characterType: string
): StateModifier {
  const adjustments: Record<string, {
    energyMultiplier: number;
    focusMultiplier: number;
    curiosityMultiplier: number;
  }> = {
    'guard_type': {
      energyMultiplier: 0.8,  // 卫兵能量变化较小
      focusMultiplier: 1.2,   // 但专注度变化更明显
      curiosityMultiplier: 0.6 // 好奇心变化较小
    },
    'wanderer_type': {
      energyMultiplier: 1.3,  // 流浪者能量变化明显
      focusMultiplier: 0.7,   // 专注度变化较小
      curiosityMultiplier: 1.4 // 好奇心变化很大
    },
    'scholar_type': {
      energyMultiplier: 0.9,
      focusMultiplier: 1.1,
      curiosityMultiplier: 1.3
    },
    'merchant_type': {
      energyMultiplier: 1.1,
      focusMultiplier: 1.0,
      curiosityMultiplier: 0.8
    }
  };

  const adjustment = adjustments[characterType];
  if (!adjustment) {
    return modifier; // 如果没有特殊调整，返回原始修改器
  }

  return {
    energyDelta: modifier.energyDelta ? modifier.energyDelta * adjustment.energyMultiplier : undefined,
    focusDelta: modifier.focusDelta ? modifier.focusDelta * adjustment.focusMultiplier : undefined,
    curiosityDelta: modifier.curiosityDelta ? modifier.curiosityDelta * adjustment.curiosityMultiplier : undefined,
    reason: modifier.reason + ` (${characterType}类型调整)`,
    intensity: modifier.intensity
  };
}

/**
 * 复合状态修改器
 * 
 * 有些复杂的事件会同时触发多个简单的状态变化。
 * 这个函数可以将多个修改器合并成一个。
 */
export function combineModifiers(modifiers: StateModifier[], reason: string): StateModifier {
  const combined: StateModifier = {
    energyDelta: 0,
    focusDelta: 0,
    curiosityDelta: 0,
    reason,
    intensity: 1.0
  };

  modifiers.forEach(modifier => {
    if (modifier.energyDelta !== undefined) {
      combined.energyDelta! += modifier.energyDelta;
    }
    if (modifier.focusDelta !== undefined) {
      combined.focusDelta! += modifier.focusDelta;
    }
    if (modifier.curiosityDelta !== undefined) {
      combined.curiosityDelta! += modifier.curiosityDelta;
    }
  });

  return combined;
}

/**
 * 随机状态波动
 * 
 * 模拟日常生活中的随机心理波动
 */
export function randomMoodFluctuation(): StateModifier {
  return {
    energyDelta: (Math.random() - 0.5) * 0.6,
    focusDelta: (Math.random() - 0.5) * 0.4,
    curiosityDelta: (Math.random() - 0.5) * 0.3,
    reason: '随机心情波动',
    intensity: 1.0
  };
}