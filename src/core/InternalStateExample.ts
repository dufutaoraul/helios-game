/**
 * AI NPC内在状态系统 - 使用示例
 * 
 * 这个文件演示了内在状态系统如何与频道模拟系统配合工作，
 * 展示了外在事件如何影响AI NPC的内在心理状态，以及这些
 * 状态如何影响角色的后续行为倾向。
 */

import { InternalStateManager, StateModifier, globalInternalStateManager } from './InternalStateManager';
import { CommonStateModifiers, adjustModifierForCharacterType } from './StateModifiers';
import { globalChannelManager } from '../simulation/ChannelManager';
import { Character } from '../types';

/**
 * 创建示例角色
 */
function createExampleCharacters(): Character[] {
  return [
    {
      id: 'chen_hao_001',
      name: '陈浩',
      role: '酒馆常客_技术工人',
      core_motivation: '安静地完成自己的工作，避免不必要的麻烦',
      type: 'ai_npc',
      is_online: true,
      current_scene: 'tavern_main_hall',
      created_at: Date.now()
    },
    {
      id: 'lin_xi_001', 
      name: '林溪',
      role: '流浪者_社交达人',
      core_motivation: '探索新的机会，建立有用的人际关系',
      type: 'ai_npc',
      is_online: true,
      current_scene: 'tavern_main_hall',
      created_at: Date.now()
    },
    {
      id: 'scholar_001',
      name: '智者埃德温',
      role: '学者_知识守护者',
      core_motivation: '收集古老的知识，理解世界的真相',
      type: 'ai_npc',
      is_online: true,
      current_scene: 'tavern_main_hall',
      created_at: Date.now()
    }
  ];
}

/**
 * 状态感知的行为建议生成器
 * 
 * 这个函数根据角色的当前内在状态，为其生成行为倾向建议。
 * 这模拟了内在状态如何影响AI的决策逻辑。
 */
function generateBehaviorSuggestions(characterId: string, characterName: string): string[] {
  const state = globalInternalStateManager.getCharacterState(characterId);
  if (!state) return ['状态未知，建议保持观望'];

  const suggestions: string[] = [];

  // 基于能量水平的建议
  if (state.energy > 7) {
    suggestions.push('精力充沛，适合主动发起对话或行动');
  } else if (state.energy < 3) {
    suggestions.push('精力不足，倾向于寻找休息机会或避免冲突');
  }

  // 基于专注度的建议
  if (state.focus > 7) {
    suggestions.push('专注度很高，适合处理复杂任务或深入对话');
  } else if (state.focus < 3) {
    suggestions.push('注意力涣散，可能容易被外界事物分心');
  }

  // 基于好奇心的建议
  if (state.curiosity > 7) {
    suggestions.push('好奇心强烈，倾向于探索新事物或询问问题');
  } else if (state.curiosity < 3) {
    suggestions.push('对新事物兴趣不大，倾向于关注当前任务');
  }

  // 综合状态建议
  const totalEnergy = state.energy + state.focus + state.curiosity;
  if (totalEnergy > 20) {
    suggestions.push('整体状态良好，适合承担领导角色');
  } else if (totalEnergy < 10) {
    suggestions.push('整体状态低迷，需要外在刺激来恢复活力');
  }

  return suggestions;
}

/**
 * 事件响应处理器
 * 
 * 这个函数模拟了当频道中发生事件时，如何自动更新相关角色的内在状态
 */
function handleEventImpact(eventDescription: string, affectedCharacterId: string): void {
  console.log(`\n🧠 分析事件对 ${affectedCharacterId} 的心理影响: "${eventDescription}"`);

  // 简单的事件分类和状态修改逻辑
  let modifier: StateModifier;

  if (eventDescription.includes('威胁') || eventDescription.includes('危险')) {
    modifier = CommonStateModifiers.feelThreatened();
  } else if (eventDescription.includes('赞美') || eventDescription.includes('成功')) {
    modifier = CommonStateModifiers.receiveCompliment();
  } else if (eventDescription.includes('争论') || eventDescription.includes('冲突')) {
    modifier = CommonStateModifiers.engageInArgument();
  } else if (eventDescription.includes('无聊') || eventDescription.includes('安静')) {
    modifier = CommonStateModifiers.feelBored();
  } else if (eventDescription.includes('神秘') || eventDescription.includes('奇怪')) {
    modifier = CommonStateModifiers.encounterMystery();
  } else {
    // 默认的轻微状态波动
    modifier = {
      energyDelta: (Math.random() - 0.5) * 0.5,
      focusDelta: (Math.random() - 0.5) * 0.3,
      curiosityDelta: (Math.random() - 0.5) * 0.4,
      reason: `对事件"${eventDescription}"的反应`,
      intensity: 0.7
    };
  }

  // 应用状态修改
  globalInternalStateManager.applyStateModifier(affectedCharacterId, modifier);

  // 生成新的行为建议
  const suggestions = generateBehaviorSuggestions(affectedCharacterId, '');
  console.log(`💡 基于新状态的行为建议:`);
  suggestions.forEach(suggestion => console.log(`   - ${suggestion}`));
}

/**
 * 运行完整的内在状态系统演示
 */
export async function runInternalStateExample(): Promise<void> {
  console.log('\n🧠 === AI NPC内在状态系统演示 ===\n');

  // 创建示例角色
  const characters = createExampleCharacters();
  
  // 为每个角色初始化内在状态
  console.log('📊 初始化角色内在状态:');
  characters.forEach(character => {
    globalInternalStateManager.initializeCharacterState(character);
    
    // 显示初始状态和行为建议
    const state = globalInternalStateManager.getCharacterState(character.id);
    console.log(`\n${character.name} (${character.role}):`);
    console.log(`  能量: ${state!.energy.toFixed(1)} | 专注: ${state!.focus.toFixed(1)} | 好奇: ${state!.curiosity.toFixed(1)}`);
    
    const suggestions = generateBehaviorSuggestions(character.id, character.name);
    console.log(`  行为倾向:`);
    suggestions.forEach(s => console.log(`    - ${s}`));
  });

  console.log('\n🎭 === 模拟事件序列 ===');

  // 事件1：林溪进入酒馆
  console.log('\n📍 事件1: 林溪进入酒馆');
  globalChannelManager.publishAction('林溪', '推开门，环顾四周', 'tavern_main_hall');
  
  // 林溪遇到新环境，好奇心增加
  globalInternalStateManager.applyStateModifier(
    'lin_xi_001', 
    CommonStateModifiers.meetStranger()
  );

  await sleep(200);

  // 事件2: 陈浩感到被打扰
  console.log('\n📍 事件2: 陈浩感到被打扰');
  globalChannelManager.publishAction('陈浩', '皱眉看向门口', 'tavern_main_hall');
  
  // 陈浩不喜欢被打扰，专注度下降
  globalInternalStateManager.applyStateModifier('chen_hao_001', {
    energyDelta: -0.5,
    focusDelta: -1.0,
    curiosityDelta: 0.2,
    reason: '被突然的动静打扰',
    intensity: 1.0
  });

  await sleep(200);

  // 事件3: 紧张对峙
  console.log('\n📍 事件3: 紧张对峙开始');
  globalChannelManager.publishDialogue('林溪', '哟，看起来有人不太欢迎我啊', 'tavern_main_hall');
  
  // 林溪感到挑战，能量和专注度提升
  handleEventImpact('挑衅性对话', 'lin_xi_001');
  
  // 陈浩感到威胁
  handleEventImpact('被挑衅，感到威胁', 'chen_hao_001');

  await sleep(200);

  // 事件4: 学者介入
  console.log('\n📍 事件4: 学者尝试调解');
  globalChannelManager.publishDialogue('智者埃德温', '两位，何必为小事争执呢？不如一起来讨论一些有趣的话题？', 'tavern_main_hall');
  
  // 埃德温感到需要维护和平，专注度提升
  globalInternalStateManager.applyStateModifier('scholar_001', {
    energyDelta: -0.3,
    focusDelta: 1.5,
    curiosityDelta: 0.8,
    reason: '尝试调解冲突，承担责任',
    intensity: 1.0
  });

  await sleep(200);

  // 事件5: 环境变化
  console.log('\n📍 事件5: 环境变化');
  globalChannelManager.publishEnvironment('酒馆里的其他客人开始关注这边的动静', 'tavern_main_hall', 
    ['chen_hao_001', 'lin_xi_001', 'scholar_001']);
  
  // 所有角色都受到关注，状态发生变化
  characters.forEach(character => {
    if (character.name === '林溪') {
      // 林溪享受成为焦点
      globalInternalStateManager.applyStateModifier(character.id, 
        CommonStateModifiers.beingCenterOfAttention());
    } else if (character.name === '陈浩') {
      // 陈浩不喜欢被关注
      globalInternalStateManager.applyStateModifier(character.id, {
        energyDelta: -1.0,
        focusDelta: 0.5,
        curiosityDelta: -0.5,
        reason: '被众人关注，感到不自在',
        intensity: 1.0
      });
    } else {
      // 埃德温保持中性
      globalInternalStateManager.applyStateModifier(character.id, {
        energyDelta: 0.2,
        focusDelta: 0.8,
        curiosityDelta: 0.3,
        reason: '成为调解者，获得成就感',
        intensity: 1.0
      });
    }
  });

  console.log('\n📊 === 最终状态分析 ===');
  
  // 显示所有角色的最终状态
  characters.forEach(character => {
    const state = globalInternalStateManager.getCharacterState(character.id);
    const history = globalInternalStateManager.getStateHistory(character.id, 3);
    
    console.log(`\n${character.name}:`);
    console.log(`  当前状态: 能量=${state!.energy.toFixed(1)} | 专注=${state!.focus.toFixed(1)} | 好奇=${state!.curiosity.toFixed(1)}`);
    
    console.log(`  状态变化历史:`);
    history.forEach((entry, index) => {
      if (index > 0) { // 跳过初始状态
        console.log(`    ${index}. ${entry.reason}`);
      }
    });

    const suggestions = generateBehaviorSuggestions(character.id, character.name);
    console.log(`  当前行为倾向:`);
    suggestions.forEach(s => console.log(`    - ${s}`));
  });

  // 显示系统统计
  console.log('\n🏢 系统统计:');
  const stats = globalInternalStateManager.getSystemStats();
  console.log(`  管理角色数: ${stats.totalCharacters}`);
  console.log(`  平均能量: ${stats.averageEnergy.toFixed(1)}`);
  console.log(`  平均专注: ${stats.averageFocus.toFixed(1)}`);
  console.log(`  平均好奇: ${stats.averageCuriosity.toFixed(1)}`);
  console.log(`  状态分布:`, stats.stateDistribution);

  console.log('\n🧠 === 内在状态系统演示完成 ===\n');
  
  console.log('🎯 关键观察:');
  console.log('- 每个AI的内在状态都是完全私有的，无法被其他AI直接访问');
  console.log('- 外在事件通过状态修改器影响内在状态');
  console.log('- 内在状态为AI决策提供"情绪化"的倾向建议');
  console.log('- 不同角色类型对同样事件有不同的反应模式');
}

/**
 * 简单的延时函数
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 如果直接运行此文件，执行演示
 */
if (require.main === module) {
  runInternalStateExample().catch(console.error);
}