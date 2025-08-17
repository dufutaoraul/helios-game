/**
 * 赫利俄斯项目 - 快速演示（简化版）
 * 
 * 由于TypeScript配置问题，这里提供一个简化的JavaScript演示
 * 展示核心概念和功能
 */

console.log('\n🎭 === 赫利俄斯项目 MVP 快速演示 ===\n');

// 模拟频道消息系统
console.log('📡 1. 频道模拟系统演示');
console.log('═'.repeat(50));

// 模拟三类信息
const messages = [];

function publishDialogue(character, content, sceneId) {
  const message = {
    type: 'dialogue',
    character,
    content,
    timestamp: Date.now(),
    scene_id: sceneId
  };
  messages.push(message);
  console.log(`💬 [${character}]: "${content}"`);
  return message;
}

function publishAction(character, description, sceneId) {
  const message = {
    type: 'action',
    character,
    description,
    timestamp: Date.now(),
    scene_id: sceneId
  };
  messages.push(message);
  console.log(`🎭 [${character}] ${description}`);
  return message;
}

function publishEnvironment(description, sceneId) {
  const message = {
    type: 'environment',
    description,
    timestamp: Date.now(),
    scene_id: sceneId
  };
  messages.push(message);
  console.log(`🌍 环境变化: ${description}`);
  return message;
}

// 演示场景：港口酒馆对峙
console.log('\n📍 场景：港口酒馆主厅\n');

publishEnvironment('夜幕降临，酒馆里烟雾缭绕，烛光摇曳', 'tavern_main_hall');

setTimeout(() => {
  publishAction('林溪', '推开酒馆的门，扫视了一下里面的情况', 'tavern_main_hall');
}, 500);

setTimeout(() => {
  publishDialogue('林溪', '哟，新来的？也是要通宵啊。', 'tavern_main_hall');
}, 1000);

setTimeout(() => {
  publishAction('陈浩', '猛地一拍桌子', 'tavern_main_hall');
}, 1500);

setTimeout(() => {
  publishDialogue('陈浩', '我不是来找麻烦的，只是想安静地喝一杯。', 'tavern_main_hall');
}, 2000);

setTimeout(() => {
  publishEnvironment('咖啡吧的灯光闪烁了一下，然后恢复正常', 'tavern_main_hall');
}, 2500);

setTimeout(() => {
  publishAction('林溪', '慢慢走向陈浩的桌子，眼神变得锐利', 'tavern_main_hall');
}, 3000);

setTimeout(() => {
  publishDialogue('林溪', '安静？在我的地盘上，没有什么是真正安静的。', 'tavern_main_hall');
}, 3500);

setTimeout(() => {
  // 演示2：内在状态系统
  console.log('\n🧠 2. 内在状态系统演示');
  console.log('═'.repeat(50));
  
  // 模拟角色内在状态
  const characters = {
    '陈浩': {
      energy: 3.2,
      focus: 8.8,
      curiosity: 2.1,
      personality: '专注型技术工人'
    },
    '林溪': {
      energy: 7.5,
      focus: 4.2,
      curiosity: 9.1,
      personality: '流浪者社交达人'
    }
  };
  
  console.log('💗 角色内在状态分析:');
  Object.entries(characters).forEach(([name, state]) => {
    console.log(`\n👤 ${name} (${state.personality}):`);
    console.log(`   能量: ${state.energy.toFixed(1)}/10 ${getEnergyDesc(state.energy)}`);
    console.log(`   专注: ${state.focus.toFixed(1)}/10 ${getFocusDesc(state.focus)}`);
    console.log(`   好奇: ${state.curiosity.toFixed(1)}/10 ${getCuriosityDesc(state.curiosity)}`);
    console.log(`   行为倾向: ${getBehaviorTendency(state)}`);
  });
}, 4000);

setTimeout(() => {
  // 演示3：AI决策推理过程
  console.log('\n🤖 3. AI决策推理演示');
  console.log('═'.repeat(50));
  
  console.log('🧠 陈浩的决策推理过程:');
  console.log('步骤1 - 观察分析: 林溪靠近，带有威胁性');
  console.log('步骤2 - 内在状态: 能量较低，专注度高，不喜冲突');
  console.log('步骤3 - 信念过滤: "避免不必要的麻烦"是核心动机');
  console.log('步骤4 - 选项生成: 1)直接对抗 2)尝试缓解 3)准备离开');
  console.log('步骤5 - 最终决策: 选择"准备离开"（风险最低）');
  console.log('💭 决策结果: 缓缓站起身，右手移向腰间');
  
  publishAction('陈浩', '缓缓站起身，右手移向腰间', 'tavern_main_hall');
}, 5500);

setTimeout(() => {
  // 演示4：信念系统发现
  console.log('\n🔮 4. 信念观察者演示');
  console.log('═'.repeat(50));
  
  console.log('🧠 基于行为分析，推断陈浩的信念系统:');
  console.log('\n世界观信念:');
  console.log('  • "世界是一个需要谨慎应对的复杂系统" (强度: 0.85)');
  console.log('  • "冲突往往带来不必要的后果" (强度: 0.78)');
  
  console.log('\n自我认知:');
  console.log('  • "我需要保护自己的空间和时间" (强度: 0.92)');
  console.log('  • "我通过行动而非言语来表达" (强度: 0.71)');
  
  console.log('\n价值观念:');
  console.log('  • "个人自主权和独立性" (强度: 0.88)');
  console.log('  • "和平比胜利更重要" (强度: 0.83)');
  
  console.log('\n🎯 信心度: 87% (基于8条行为记录)');
}, 7000);

setTimeout(() => {
  // 演示5：系统总结
  console.log('\n🎊 5. 演示总结');
  console.log('═'.repeat(50));
  
  console.log('✅ 频道模拟系统: 成功记录了', messages.length, '条消息');
  console.log('✅ 内在状态系统: 展示了AI的心理动态');
  console.log('✅ 决策引擎: 演示了5步推理过程');
  console.log('✅ 信念观察者: 从行为中发现了深层信念');
  
  console.log('\n🎭 这就是赫利俄斯项目的核心魅力:');
  console.log('💡 不预设信念，从行为中发现真相');
  console.log('💡 每个AI都有私密的内心世界');
  console.log('💡 复杂的决策来自简单的规则');
  console.log('💡 "本我之镜"映照角色的灵魂');
  
  console.log('\n🚀 完整功能需要配置DeepSeek API才能体验');
  console.log('📖 详细文档请查看 README.md 和 ARCHITECTURE_EXPLAINED.md');
  
  console.log('\n🎉 演示完成！感谢体验赫利俄斯项目！\n');
}, 8500);

// 辅助函数
function getEnergyDesc(energy) {
  if (energy > 7) return '(精力充沛)';
  if (energy > 4) return '(状态正常)';
  if (energy > 2) return '(有些疲倦)';
  return '(精疲力竭)';
}

function getFocusDesc(focus) {
  if (focus > 7) return '(高度专注)';
  if (focus > 4) return '(注意力集中)';
  if (focus > 2) return '(容易分心)';
  return '(无法集中)';
}

function getCuriosityDesc(curiosity) {
  if (curiosity > 7) return '(极度好奇)';
  if (curiosity > 4) return '(有些兴趣)';
  if (curiosity > 2) return '(兴趣不大)';
  return '(毫无兴趣)';
}

function getBehaviorTendency(state) {
  if (state.energy > 6 && state.curiosity > 6) return '主动探索，积极社交';
  if (state.focus > 7 && state.energy < 5) return '专注当前，避免干扰';
  if (state.curiosity < 3 && state.focus > 6) return '专注任务，不喜变化';
  return '状态平衡，灵活应对';
}

console.log('⏰ 演示将在几秒后开始，请稍等...');