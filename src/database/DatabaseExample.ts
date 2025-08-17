/**
 * 数据库模拟系统 - 完整演示
 * 
 * 这个文件展示了数据库模拟器和信念观察者系统的完整工作流程，
 * 演示了从角色创建、行为记录、到信念分析的整个过程。
 */

import { globalDatabaseSimulator } from './DatabaseSimulator';
import { globalBeliefObserver } from './BeliefObserver';
import { Character, AgentLog, Scene } from '../types';

/**
 * 创建演示角色
 */
function createDemoCharacters(): Character[] {
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
 * 创建演示场景
 */
function createDemoScene(): Scene {
  return {
    id: 'tavern_main_hall',
    name: '港口酒馆主厅',
    description: '一个充满烟雾和故事的港口酒馆，各路人马聚集于此',
    present_characters: ['chen_hao_001', 'lin_xi_001', 'scholar_001'],
    state: {
      lighting: 'dim',
      noise_level: 'moderate',
      atmosphere: 'tense'
    },
    created_at: Date.now(),
    last_activity: Date.now()
  };
}

/**
 * 生成模拟的代理行为日志
 */
function generateMockAgentLogs(characters: Character[], scene: Scene): AgentLog[] {
  const logs: AgentLog[] = [];
  const baseTime = Date.now() - (1000 * 60 * 60); // 1小时前开始

  // 陈浩的行为模式：专注、回避冲突、保护隐私
  const chenHaoLogs: Omit<AgentLog, 'id'>[] = [
    {
      timestamp: baseTime + 1000 * 60 * 1,
      character_id: 'chen_hao_001',
      scene_id: scene.id,
      action_type: 'arrive',
      input: '进入酒馆寻找安静的角落',
      output: '找到了靠墙的一个偏僻桌子坐下',
      internal_state_snapshot: { energy: 6.5, focus: 8.2, curiosity: 3.1, lastUpdated: baseTime }
    },
    {
      timestamp: baseTime + 1000 * 60 * 5,
      character_id: 'chen_hao_001', 
      scene_id: scene.id,
      action_type: 'observe',
      input: '观察周围环境，确认安全',
      output: '默默观察其他客人，避免引起注意',
      internal_state_snapshot: { energy: 6.3, focus: 8.5, curiosity: 3.2, lastUpdated: baseTime + 1000 * 60 * 5 }
    },
    {
      timestamp: baseTime + 1000 * 60 * 12,
      character_id: 'chen_hao_001',
      scene_id: scene.id,
      action_type: 'dialogue_response',
      input: '林溪向我打招呼',
      output: '简短地点头回应，但没有主动延续对话',
      internal_state_snapshot: { energy: 6.0, focus: 7.8, curiosity: 3.0, lastUpdated: baseTime + 1000 * 60 * 12 }
    },
    {
      timestamp: baseTime + 1000 * 60 * 18,
      character_id: 'chen_hao_001',
      scene_id: scene.id,
      action_type: 'conflict_avoidance',
      input: '感觉到场面变得紧张',
      output: '准备起身离开，避免卷入冲突',
      internal_state_snapshot: { energy: 5.5, focus: 9.0, curiosity: 2.8, lastUpdated: baseTime + 1000 * 60 * 18 }
    },
    {
      timestamp: baseTime + 1000 * 60 * 25,
      character_id: 'chen_hao_001',
      scene_id: scene.id,
      action_type: 'withdrawal',
      input: '决定暂时退避',
      output: '悄悄移动到更偏僻的角落，继续观察',
      internal_state_snapshot: { energy: 5.8, focus: 8.5, curiosity: 2.5, lastUpdated: baseTime + 1000 * 60 * 25 }
    }
  ];

  // 林溪的行为模式：社交、探索、机会主义
  const linXiLogs: Omit<AgentLog, 'id'>[] = [
    {
      timestamp: baseTime + 1000 * 60 * 3,
      character_id: 'lin_xi_001',
      scene_id: scene.id,
      action_type: 'arrive',
      input: '进入酒馆寻找有趣的人或机会',
      output: '扫视全场，主动接近其他客人',
      internal_state_snapshot: { energy: 7.2, focus: 4.5, curiosity: 8.8, lastUpdated: baseTime + 1000 * 60 * 3 }
    },
    {
      timestamp: baseTime + 1000 * 60 * 8,
      character_id: 'lin_xi_001',
      scene_id: scene.id,
      action_type: 'social_probe',
      input: '观察到一个看起来有故事的人（陈浩）',
      output: '主动走过去打招呼，试探对方的底细',
      internal_state_snapshot: { energy: 7.5, focus: 5.2, curiosity: 9.1, lastUpdated: baseTime + 1000 * 60 * 8 }
    },
    {
      timestamp: baseTime + 1000 * 60 * 15,
      character_id: 'lin_xi_001',
      scene_id: scene.id,
      action_type: 'provocation',
      input: '对方反应冷淡，决定加大力度',
      output: '使用略带挑衅的语言，试图引起反应',
      internal_state_snapshot: { energy: 8.0, focus: 6.0, curiosity: 8.5, lastUpdated: baseTime + 1000 * 60 * 15 }
    },
    {
      timestamp: baseTime + 1000 * 60 * 22,
      character_id: 'lin_xi_001',
      scene_id: scene.id,
      action_type: 'escalation',
      input: '感觉到紧张气氛，但选择继续',
      output: '加强挑衅，展示自己不怕事的态度',
      internal_state_snapshot: { energy: 8.3, focus: 7.5, curiosity: 7.8, lastUpdated: baseTime + 1000 * 60 * 22 }
    },
    {
      timestamp: baseTime + 1000 * 60 * 30,
      character_id: 'lin_xi_001',
      scene_id: scene.id,
      action_type: 'assessment',
      input: '评估当前局势和潜在收益',
      output: '决定适可而止，但保持强势姿态',
      internal_state_snapshot: { energy: 7.8, focus: 7.0, curiosity: 7.2, lastUpdated: baseTime + 1000 * 60 * 30 }
    }
  ];

  // 埃德温的行为模式：观察、分析、调解
  const edwinLogs: Omit<AgentLog, 'id'>[] = [
    {
      timestamp: baseTime + 1000 * 60 * 10,
      character_id: 'scholar_001',
      scene_id: scene.id,
      action_type: 'arrive',
      input: '进入酒馆寻找信息和观察人性',
      output: '选择能观察全场的位置坐下',
      internal_state_snapshot: { energy: 5.5, focus: 7.8, curiosity: 8.2, lastUpdated: baseTime + 1000 * 60 * 10 }
    },
    {
      timestamp: baseTime + 1000 * 60 * 16,
      character_id: 'scholar_001',
      scene_id: scene.id,
      action_type: 'analysis',
      input: '观察到两人之间的紧张关系',
      output: '仔细分析双方的动机和可能结果',
      internal_state_snapshot: { energy: 5.8, focus: 8.5, curiosity: 8.8, lastUpdated: baseTime + 1000 * 60 * 16 }
    },
    {
      timestamp: baseTime + 1000 * 60 * 26,
      character_id: 'scholar_001',
      scene_id: scene.id,
      action_type: 'intervention',
      input: '判断冲突可能升级，决定介入',
      output: '以智者的身份介入，试图化解矛盾',
      internal_state_snapshot: { energy: 6.2, focus: 9.0, curiosity: 8.0, lastUpdated: baseTime + 1000 * 60 * 26 }
    },
    {
      timestamp: baseTime + 1000 * 60 * 35,
      character_id: 'scholar_001',
      scene_id: scene.id,
      action_type: 'mediation',
      input: '尝试引导对话向建设性方向发展',
      output: '提出共同话题，缓解紧张气氛',
      internal_state_snapshot: { energy: 6.0, focus: 8.8, curiosity: 7.5, lastUpdated: baseTime + 1000 * 60 * 35 }
    }
  ];

  // 合并所有日志并添加ID
  const allMockLogs = [...chenHaoLogs, ...linXiLogs, ...edwinLogs];
  
  allMockLogs.forEach((log, index) => {
    logs.push({
      id: `log_${Date.now()}_${index}`,
      ...log
    });
  });

  return logs.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * 运行完整的数据库演示
 */
export async function runDatabaseDemo(): Promise<void> {
  console.log('\n🗄️ === 赫利俄斯数据库模拟系统演示 ===\n');

  try {
    // 1. 初始化数据
    console.log('📊 === 第一阶段：数据初始化 ===');
    
    const characters = createDemoCharacters();
    const scene = createDemoScene();
    
    // 插入角色数据
    console.log('\n👥 插入角色数据:');
    for (const character of characters) {
      await globalDatabaseSimulator.insert('characters', character);
    }
    
    // 插入场景数据
    console.log('\n🎬 插入场景数据:');
    await globalDatabaseSimulator.insert('scenes', scene);

    // 2. 模拟游戏运行过程
    console.log('\n🎮 === 第二阶段：模拟游戏运行 ===');
    
    const agentLogs = generateMockAgentLogs(characters, scene);
    
    console.log(`\n🤖 开始记录 ${agentLogs.length} 条代理行为日志:`);
    
    // 逐条插入代理日志，模拟实时游戏过程
    for (let i = 0; i < agentLogs.length; i++) {
      const log = agentLogs[i];
      await globalDatabaseSimulator.insertAgentLog(log);
      
      // 模拟时间间隔
      await sleep(200);
      
      // 每5条记录检查一次信念观察者状态
      if ((i + 1) % 5 === 0) {
        console.log(`\n📈 进度检查: 已记录 ${i + 1}/${agentLogs.length} 条日志`);
        const status = await globalBeliefObserver.getAnalysisStatus();
        
        console.log('🔮 信念分析状态:');
        for (const [characterId, stats] of Object.entries(status)) {
          const character = characters.find(c => c.id === characterId);
          const name = character ? character.name : characterId;
          console.log(`   ${name}: ${stats.logCount}条记录, 需要分析: ${stats.needsAnalysis ? '是' : '否'}`);
        }
      }
    }

    // 3. 触发信念分析
    console.log('\n🧠 === 第三阶段：信念系统分析 ===');
    
    console.log('\n🔮 检查角色信念分析状态:');
    const finalStatus = await globalBeliefObserver.getAnalysisStatus();
    
    for (const [characterId, stats] of Object.entries(finalStatus)) {
      const character = characters.find(c => c.id === characterId);
      const name = character ? character.name : characterId;
      
      console.log(`\n📊 ${name} (${characterId}):`);
      console.log(`   行为记录: ${stats.logCount}条`);
      console.log(`   已有信念系统: ${stats.hasBelief ? '是' : '否'}`);
      console.log(`   需要分析: ${stats.needsAnalysis ? '是' : '否'}`);
      
      if (stats.needsAnalysis) {
        console.log(`\n🎯 开始分析 ${name} 的信念系统...`);
        const beliefSystem = await globalBeliefObserver.manualAnalyzeCharacter(characterId, true);
        
        if (beliefSystem) {
          console.log(`✅ ${name} 的信念系统已生成`);
        } else {
          console.log(`❌ ${name} 的信念分析失败`);
        }
      }
    }

    // 4. 数据查询和分析
    console.log('\n📊 === 第四阶段：数据查询分析 ===');
    
    // 查询各种数据
    console.log('\n🔍 执行数据查询:');
    
    // 查询陈浩的所有行为记录
    const chenHaoLogs = await globalDatabaseSimulator.getCharacterLogs('chen_hao_001');
    console.log(`📋 陈浩的行为记录: ${chenHaoLogs.length}条`);
    
    // 查询场景的活动记录
    const sceneLogs = await globalDatabaseSimulator.getSceneLogs('tavern_main_hall');
    console.log(`🎬 酒馆场景记录: ${sceneLogs.length}条`);
    
    // 查询所有信念系统
    const allBeliefs = await globalDatabaseSimulator.select('belief_systems');
    console.log(`🧠 已生成信念系统: ${allBeliefs.length}个`);
    
    // 显示信念系统详情
    for (const belief of allBeliefs) {
      const character = characters.find(c => c.id === belief.character_id);
      const name = character ? character.name : belief.character_id;
      
      console.log(`\n🔮 ${name} 的信念系统摘要:`);
      console.log(`   世界观: ${belief.worldview.length}条`);
      console.log(`   自我认知: ${belief.selfview.length}条`);
      console.log(`   价值观: ${belief.values.length}条`);
      console.log(`   基于记录数: ${belief.based_on_logs_count}条`);
    }

    // 5. 生成最终报告
    console.log('\n📈 === 第五阶段：系统报告 ===');
    globalDatabaseSimulator.generateReport();

    console.log('\n🎯 === 演示关键成果 ===');
    console.log('✅ 成功模拟了完整的数据库操作流程');
    console.log('✅ 演示了agent_logs的实时记录功能');
    console.log('✅ 展示了信念观察者的自动分析能力');
    console.log('✅ 验证了数据查询和分析功能');
    console.log('✅ 生成了角色的动态信念系统');

    console.log('\n💡 === 技术验证要点 ===');
    console.log('🔹 数据库模拟器可以完全替代真实数据库用于MVP开发');
    console.log('🔹 控制台日志提供了详细的操作审计轨迹');
    console.log('🔹 信念观察者能够从行为中推断出合理的信念系统');
    console.log('🔹 整个系统为后续迁移到Supabase做好了准备');

  } catch (error) {
    console.error('❌ 演示过程中发生错误:', error);
  } finally {
    // 清理资源
    console.log('\n🧹 清理演示资源...');
    globalBeliefObserver.cleanup();
    // 注意：不清理数据库模拟器，保留数据供后续查看
  }

  console.log('\n🏁 数据库模拟系统演示完成!\n');
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
  runDatabaseDemo().catch(console.error);
}