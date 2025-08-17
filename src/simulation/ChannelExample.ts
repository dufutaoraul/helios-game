/**
 * 频道模拟系统 - 使用示例
 * 
 * 这个文件演示了如何使用频道管理器来模拟一个游戏场景。
 * 通过这个例子，你可以看到三类信息是如何被记录和处理的。
 */

import { ChannelManager, ChannelSubscriber } from './ChannelManager';
import { formatMessage, formatAsNarrative, analyzeCharacterBehavior, detectCognitiveDissonance } from './ChannelUtils';
import { ChannelMessage } from '../types';

/**
 * 示例订阅者：信念观察者的简化版本
 * 
 * 在真实系统中，这个组件会分析角色行为并生成信念系统
 */
class MockBeliefObserver implements ChannelSubscriber {
  id = 'belief-observer';
  
  onMessage(message: ChannelMessage): void {
    // 模拟信念观察者的处理逻辑
    if (message.type === 'dialogue' || message.type === 'action') {
      const character = (message as any).character;
      console.log(`🧠 信念观察者注意到：${character} 的行为可能反映了某种内在信念`);
    }
  }
}

/**
 * 示例订阅者：世界事件监听器
 */
class MockWorldEventListener implements ChannelSubscriber {
  id = 'world-event-listener';
  typeFilter: ChannelMessage['type'][] = ['environment'];
  
  onMessage(message: ChannelMessage): void {
    console.log(`🌍 世界监听器：环境发生了变化，可能需要调整世界状态`);
  }
}

/**
 * 运行频道模拟系统的完整示例
 * 
 * 这个函数模拟了一个港口酒馆中的经典对峙场景，
 * 展示了三类信息是如何协调工作的。
 */
export async function runChannelSimulationExample(): Promise<void> {
  console.log('\n🎭 === 赫利俄斯频道模拟系统演示 ===\n');
  
  // 创建频道管理器
  const channelManager = new ChannelManager();
  
  // 注册订阅者
  const beliefObserver = new MockBeliefObserver();
  const worldListener = new MockWorldEventListener();
  
  channelManager.subscribe(beliefObserver);
  channelManager.subscribe(worldListener);
  
  // 场景ID
  const tavernScene = 'tavern_main_hall';
  
  console.log('📍 场景：港口酒馆的主厅\n');
  
  // === 场景开始：环境设定 ===
  channelManager.publishEnvironment(
    '夜幕降临，酒馆里烟雾缭绕，烛光摇曳',
    tavernScene
  );
  
  // 稍作延时，模拟时间流逝
  await sleep(100);
  
  // === 角色入场 ===
  channelManager.publishAction(
    '林溪',
    '推开酒馆的门，扫视了一下里面的情况',
    tavernScene
  );
  
  await sleep(100);
  
  channelManager.publishDialogue(
    '林溪',
    '哟，新来的？也是要通宵啊。',
    tavernScene
  );
  
  await sleep(100);
  
  // === 另一个角色回应 ===
  channelManager.publishAction(
    '陈浩',
    '猛地一拍桌子',
    tavernScene
  );
  
  await sleep(100);
  
  channelManager.publishDialogue(
    '陈浩',
    '我不是来找麻烦的，只是想安静地喝一杯。',
    tavernScene
  );
  
  await sleep(100);
  
  // === 环境变化 ===
  channelManager.publishEnvironment(
    '咖啡吧的灯光闪烁了一下，然后恢复正常',
    tavernScene,
    ['林溪', '陈浩']
  );
  
  await sleep(100);
  
  // === 紧张升级 ===
  channelManager.publishAction(
    '林溪',
    '慢慢走向陈浩的桌子，眼神变得锐利',
    tavernScene
  );
  
  await sleep(100);
  
  channelManager.publishDialogue(
    '林溪',
    '安静？在我的地盘上，没有什么是真正安静的。',
    tavernScene
  );
  
  await sleep(100);
  
  channelManager.publishAction(
    '陈浩',
    '缓缓站起身，右手移向腰间',
    tavernScene
  );
  
  await sleep(100);
  
  // === 第三方介入 ===
  channelManager.publishEnvironment(
    '酒馆门口传来沉重的脚步声',
    tavernScene
  );
  
  await sleep(100);
  
  channelManager.publishAction(
    '卫兵队长',
    '大步走进酒馆，手按在剑柄上',
    tavernScene
  );
  
  await sleep(100);
  
  channelManager.publishDialogue(
    '卫兵队长',
    '都给我住手！这里是文明的地方，不是你们解决私人恩怨的斗兽场！',
    tavernScene
  );
  
  console.log('\n🎯 === 场景分析结果 ===\n');
  
  // === 分析场景数据 ===
  const sceneHistory = channelManager.getSceneHistory(tavernScene);
  console.log('📊 场景消息统计：');
  console.log(`- 总消息数: ${sceneHistory.length}`);
  console.log(`- 对话: ${sceneHistory.filter(m => m.type === 'dialogue').length}`);
  console.log(`- 动作: ${sceneHistory.filter(m => m.type === 'action').length}`);
  console.log(`- 环境: ${sceneHistory.filter(m => m.type === 'environment').length}`);
  
  console.log('\n📖 场景叙述：');
  console.log(formatAsNarrative(sceneHistory));
  
  // === 分析角色行为 ===
  console.log('\n🎭 角色行为分析：');
  const characters = ['林溪', '陈浩', '卫兵队长'];
  
  characters.forEach(character => {
    const characterActions = channelManager.getCharacterActions(character, tavernScene);
    if (characterActions.length > 0) {
      console.log(`\n${character}:`);
      const behavior = analyzeCharacterBehavior(sceneHistory, character);
      console.log(`- 总行动数: ${behavior.totalActions}`);
      console.log(`- 对话数: ${behavior.dialogueCount}`);
      console.log(`- 动作数: ${behavior.actionCount}`);
      console.log(`- 平均对话长度: ${behavior.averageWordsPerDialogue.toFixed(1)} 字`);
      
      // 检测认知失调
      const dissonance = detectCognitiveDissonance(sceneHistory, character);
      if (dissonance.hasPotentialDissonance) {
        console.log(`⚠️  检测到潜在的认知失调:`, dissonance.conflicts.length, '个冲突');
      } else {
        console.log(`✅ 行为与表达基本一致`);
      }
    }
  });
  
  // === 显示订阅者统计 ===
  console.log('\n📡 系统统计：');
  const stats = channelManager.getChannelStats();
  console.log(`- 活跃场景: ${stats.totalScenes}`);
  console.log(`- 订阅者数量: ${stats.totalSubscribers}`);
  console.log('- 消息类型分布:', stats.messagesByType);
  
  console.log('\n🎭 === 演示完成 ===\n');
}

/**
 * 简单的延时函数，用于模拟时间流逝
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 如果直接运行此文件，执行演示
 */
if (require.main === module) {
  runChannelSimulationExample().catch(console.error);
}