/**
 * 《日识》世界引擎API - 新一代实时世界模拟器
 * 
 * 设计哲学：从"请求-响应"升级为"活着的世界"
 * 核心创新：
 * 1. 服务器端持续运行的世界心跳
 * 2. AI拥有内在状态和自主决策能力 
 * 3. 玩家只能看到外在行为，内心想法完全隐藏
 * 4. 导演命令拥有最高优先级
 */

import { NextRequest, NextResponse } from 'next/server';
import { WorldEngine, createCharacterState } from '@/lib/world-engine';
import { getCharacterConfig } from '@/lib/character_configs';

/**
 * POST 端点：处理玩家消息并更新世界状态
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { 
      userMessage, 
      playerName, 
      sceneId = 'moonlight_tavern',
      playerInputType = 'dialogue',
      forceCharacter,
      isInitialEntry = false 
    } = await request.json();

    console.log(`🌍 世界引擎处理: "${userMessage}" (场景: ${sceneId}, 玩家: ${playerName})`);

    // 🔧 修复：使用新的异步单例模式获取世界引擎实例
    const worldEngine = await WorldEngine.getInstance(sceneId, '月影酒馆');

    // 如果是初次进入，初始化世界
    if (isInitialEntry) {
      await initializeWorldForPlayer(worldEngine, playerName);
    }

    // 发布玩家消息到世界
    const playerEvent = {
      id: `player_${Date.now()}`,
      type: playerInputType === 'action' ? 'action' : 'dialogue',
      speaker_id: playerName || 'anonymous_player',
      content: userMessage,
      timestamp: Date.now(),
    } as const;

    worldEngine.publishEvent(playerEvent);

    // 处理导演强制指令（最高优先级）
    if (forceCharacter) {
      console.log(`🎬 导演命令: 强制 ${forceCharacter} 回应`);
      await handleDirectorCommand(worldEngine, forceCharacter, userMessage, playerName);
    }

    // 触发AI自主决策（非强制情况下）
    if (!forceCharacter) {
      await triggerAIResponses(worldEngine, userMessage, playerName);
    }

    // 返回最近的世界事件
    const recentEvents = worldEngine.getRecentEvents(20);
    
    return NextResponse.json({
      success: true,
      events: recentEvents.map(formatEventForClient), // 🔒 过滤内心想法
      world_state: {
        scene_id: sceneId,
        tick_count: worldEngine.getWorldState().tick_count,
        active_characters: Array.from(worldEngine.getWorldState().characters.keys()),
      },
      processing_time: Date.now() - startTime,
    });

  } catch (error) {
    console.error('世界引擎处理错误:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * 🔧 重构：初始化世界 - 实现动态临时角色系统
 */
async function initializeWorldForPlayer(worldEngine: WorldEngine, playerName: string): Promise<void> {
  console.log(`🌟 为玩家 ${playerName} 初始化世界...`);

  // 添加玩家角色
  const playerCharacter = createCharacterState(
    playerName || 'anonymous_player',
    playerName || '匿名访客',
    'PLAYER'
  );
  worldEngine.addCharacter(playerCharacter);

  // 🔧 核心设计哲学：只添加"核心AI"（林溪、陈浩）和一个"万能系统AI"
  const linxiCharacter = createCharacterState('linxi', '林溪', 'CORE_AI');
  const chenhaoCharacter = createCharacterState('chenhao', '陈浩', 'CORE_AI');
  
  // 🔧 新增：万能系统AI - 可以动态扮演任何临时角色（老板、服务员等）
  const systemAICharacter = createCharacterState('system_ai', '系统AI', 'SYSTEM_AI');
  // 🔧 重要：系统AI不直接出现在场景中，而是通过动态临时角色系统工作
  systemAICharacter.is_online = false; // 默认隐藏
  
  worldEngine.addCharacter(linxiCharacter);
  worldEngine.addCharacter(chenhaoCharacter);
  worldEngine.addCharacter(systemAICharacter);

  // 🔧 新增：初始化动态角色映射表
  await initializeDynamicRoleSystem(worldEngine);

  // 发布匿名进入事件
  worldEngine.publishEvent({
    id: `anonymous_entry_${Date.now()}`,
    type: 'environment',
    speaker_id: 'narrator',
    content: '一位陌生的访客推开了月影酒馆厚重的木门，踏入了昏暗而温暖的空间...',
    timestamp: Date.now(),
  });

  // 启动世界心跳（如果尚未启动）
  worldEngine.startHeartbeat(3000); // 每3秒一次心跳

  console.log(`✅ 世界初始化完成，心跳已启动，动态角色系统已激活`);
}

/**
 * 🔧 新增：初始化动态角色映射系统
 */
async function initializeDynamicRoleSystem(worldEngine: WorldEngine): Promise<void> {
  // 🔧 设计哲学：系统AI可以动态扮演多种临时角色
  const dynamicRoles = {
    'boss': {
      name: '老板',
      description: '月影酒馆的老板，知道酒馆的一切',
      personality: '权威、友善、生意人气质',
      keywords: ['老板', '店主', '掌柜', '厕所', '酒水', '房间', '价格'],
      priority: 0.9 // 高优先级
    },
    'bartender': {
      name: '调酒师',
      description: '专业的调酒师',
      personality: '专业、安静、观察力强',
      keywords: ['酒', '调酒', '饮料', '酒水'],
      priority: 0.7
    },
    'waitress': {
      name: '服务员',
      description: '酒馆的服务员',
      personality: '热情、勤劳、细心',
      keywords: ['服务', '上菜', '点餐', '需要什么'],
      priority: 0.6
    },
    'cook': {
      name: '厨师',
      description: '酒馆的厨师',
      personality: '专注、自豪、手艺精湛',
      keywords: ['菜', '食物', '厨房', '做饭'],
      priority: 0.7
    }
  };

  // 🔧 将动态角色配置存储到世界引擎的扩展属性中
  const worldState = worldEngine.getWorldState();
  (worldState as any).dynamicRoles = dynamicRoles;
  
  console.log(`🎭 动态角色系统已初始化，可用角色:`, Object.keys(dynamicRoles));
}

/**
 * 处理导演强制指令
 */
async function handleDirectorCommand(
  worldEngine: WorldEngine, 
  characterId: string, 
  userMessage: string, 
  playerName: string
): Promise<void> {
  const character = worldEngine.getWorldState().characters.get(characterId);
  
  if (!character) {
    console.error(`🎬 导演错误: 找不到角色 ${characterId}`);
    return;
  }

  const config = getCharacterConfig(characterId);
  if (!config) {
    console.error(`🎬 导演错误: 找不到角色配置 ${characterId}`);
    return;
  }

  // 导演命令直接触发AI响应
  const { AIDecisionEngine } = await import('@/lib/ai-decision-engine');
  
  const context = {
    character,
    recentEvents: worldEngine.getRecentEvents(10),
    tickCount: worldEngine.getWorldState().tick_count,
    timeSinceLastSpeech: character.last_speech_time 
      ? Date.now() - character.last_speech_time 
      : Number.MAX_SAFE_INTEGER,
    forceCharacter: characterId,
    otherCharacters: Array.from(worldEngine.getWorldState().characters.values())
      .filter(char => char.id !== characterId),
  };

  const decision = await AIDecisionEngine.makeDecision(context);

  // 执行决策并发布事件
  if (decision.should_act) {
    await executeAIDecision(worldEngine, character, decision);
  }
}

/**
 * 🔧 重构：触发AI自主响应 - 支持动态临时角色系统
 */
async function triggerAIResponses(
  worldEngine: WorldEngine, 
  userMessage: string, 
  playerName: string
): Promise<void> {
  // 🔧 第一步：检查是否需要动态临时角色响应
  const dynamicResponse = await checkDynamicRoleResponse(worldEngine, userMessage, playerName);
  if (dynamicResponse) {
    console.log(`🎭 动态角色系统处理了该消息`);
    return; // 动态角色已处理，核心AI保持沉默
  }

  // 🔧 第二步：核心AI的智能响应逻辑（提高阈值，减少无意义响应）
  const coreAICharacters = Array.from(worldEngine.getWorldState().characters.values())
    .filter(char => char.type === 'CORE_AI');

  for (const character of coreAICharacters) {
    // 使用相关性算法判断是否应该响应
    const config = getCharacterConfig(character.id);
    if (!config) continue;

    const { calculateRelevanceWeight } = await import('@/lib/character_configs');
    const relevanceWeight = calculateRelevanceWeight(
      userMessage, 
      config, 
      worldEngine.getRecentEvents(5).map(e => e.content).join('\n')
    );

    // 🔧 重要修复：大幅提高响应阈值，减少无意义的AI"观察"
    const responseThreshold = 3.5; // 从1.5提高到3.5，减少噪音
    const shouldRespond = relevanceWeight > responseThreshold || Math.random() < 0.03; // 从10%降到3%

    if (shouldRespond) {
      console.log(`🎯 ${character.name} 被触发响应 (相关性: ${relevanceWeight.toFixed(2)})`);
      
      const { AIDecisionEngine } = await import('@/lib/ai-decision-engine');
      
      const context = {
        character,
        recentEvents: worldEngine.getRecentEvents(10),
        tickCount: worldEngine.getWorldState().tick_count,
        timeSinceLastSpeech: character.last_speech_time 
          ? Date.now() - character.last_speech_time 
          : Number.MAX_SAFE_INTEGER,
        otherCharacters: Array.from(worldEngine.getWorldState().characters.values())
          .filter(char => char.id !== character.id),
      };

      try {
        const decision = await AIDecisionEngine.makeDecision(context);
        
        if (decision.should_act) {
          await executeAIDecision(worldEngine, character, decision);
        }
      } catch (error) {
        console.error(`AI响应错误 (${character.name}):`, error);
      }
    }
  }
}

/**
 * 🔧 新增：检查动态角色响应逻辑
 */
async function checkDynamicRoleResponse(
  worldEngine: WorldEngine, 
  userMessage: string, 
  playerName: string
): Promise<boolean> {
  const worldState = worldEngine.getWorldState() as any;
  const dynamicRoles = worldState.dynamicRoles;
  
  if (!dynamicRoles) {
    console.log('🎭 动态角色系统未初始化');
    return false;
  }

  // 🔧 分析用户消息，匹配最合适的动态角色
  let bestMatch: { roleId: string; role: any; score: number } | null = null;
  
  for (const [roleId, role] of Object.entries(dynamicRoles)) {
    const score = calculateRoleMatchScore(userMessage, role as any);
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { roleId, role: role as any, score };
    }
  }

  if (bestMatch && bestMatch.score > 0.5) { // 50%匹配度阈值
    console.log(`🎭 匹配到动态角色: ${bestMatch.role.name} (匹配度: ${bestMatch.score.toFixed(2)})`);
    
    // 🔧 让系统AI扮演这个角色进行响应
    await triggerDynamicRoleResponse(worldEngine, bestMatch.roleId, bestMatch.role, userMessage, playerName);
    return true;
  }

  return false;
}

/**
 * 🔧 新增：计算角色匹配分数
 */
function calculateRoleMatchScore(userMessage: string, role: any): number {
  const message = userMessage.toLowerCase();
  let score = 0;
  
  // 关键词匹配
  for (const keyword of role.keywords) {
    if (message.includes(keyword.toLowerCase())) {
      score += role.priority; // 基于角色优先级加分
    }
  }
  
  return Math.min(score, 1.0); // 最高1.0分
}

/**
 * 🔧 新增：触发动态角色响应
 */
async function triggerDynamicRoleResponse(
  worldEngine: WorldEngine,
  roleId: string,
  role: any,
  userMessage: string,
  playerName: string
): Promise<void> {
  // 🔧 获取系统AI作为执行者
  const systemAI = worldEngine.getWorldState().characters.get('system_ai');
  if (!systemAI) {
    console.error('🎭 系统AI未找到，无法执行动态角色响应');
    return;
  }

  const { AIDecisionEngine } = await import('@/lib/ai-decision-engine');
  
  // 🔧 构建特殊的动态角色上下文
  const context = {
    character: {
      ...systemAI,
      id: roleId, // 🔧 临时替换ID
      name: role.name, // 🔧 临时替换名称
    },
    recentEvents: worldEngine.getRecentEvents(10),
    tickCount: worldEngine.getWorldState().tick_count,
    timeSinceLastSpeech: 0, // 动态角色没有历史
    otherCharacters: Array.from(worldEngine.getWorldState().characters.values())
      .filter(char => char.id !== 'system_ai'),
    // 🔧 添加角色扮演指令
    roleContext: {
      roleId,
      roleName: role.name,
      rolePersonality: role.personality,
      roleDescription: role.description,
      userMessage,
      playerName
    }
  };

  try {
    const decision = await AIDecisionEngine.makeDecision(context);
    
    if (decision.should_act) {
      // 🔧 以动态角色身份发布事件
      await executeAIDecisionAsRole(worldEngine, roleId, role.name, decision);
    }
  } catch (error) {
    console.error(`动态角色响应错误 (${role.name}):`, error);
  }
}

/**
 * 🔧 新增：以动态角色身份执行AI决策
 */
async function executeAIDecisionAsRole(
  worldEngine: WorldEngine,
  roleId: string,
  roleName: string,
  decision: any
): Promise<void> {
  const now = Date.now();

  // 🔒 关键修复：内心想法只记录到日志，绝对不发布到公共事件
  if (decision.internal_thought) {
    console.log(`💭 ${roleName} 内心想法: ${decision.internal_thought}`);
    // 内心想法到此为止，不会传递给客户端
  }

  // 发布对话事件（玩家可见）- 以动态角色身份
  if (decision.dialogue) {
    worldEngine.publishEvent({
      id: `dynamic_dialogue_${roleId}_${now}`,
      type: 'dialogue',
      speaker_id: roleId, // 🔧 使用动态角色ID
      content: decision.dialogue,
      timestamp: now,
      is_autonomous: false, // 动态角色响应不算自主行为
    });
  }

  // 发布行动事件（玩家可见）- 以动态角色身份
  if (decision.action) {
    worldEngine.publishEvent({
      id: `dynamic_action_${roleId}_${now}`,
      type: 'action',
      speaker_id: roleId, // 🔧 使用动态角色ID
      content: decision.action,
      timestamp: now,
      is_autonomous: false,
    });
  }

  console.log(`🎭 动态角色 ${roleName} 完成响应: 对话=${!!decision.dialogue}, 行动=${!!decision.action}`);
}

/**
 * 执行AI决策并发布事件（确保内心想法不泄露）
 */
async function executeAIDecision(
  worldEngine: WorldEngine,
  character: any,
  decision: any
): Promise<void> {
  const now = Date.now();

  // 🔒 关键修复：内心想法只记录到日志，绝对不发布到公共事件
  if (decision.internal_thought) {
    console.log(`💭 ${character.name} 内心想法: ${decision.internal_thought}`);
    // 内心想法到此为止，不会传递给客户端
  }

  // 发布对话事件（玩家可见）
  if (decision.dialogue) {
    worldEngine.publishEvent({
      id: `ai_dialogue_${character.id}_${now}`,
      type: 'dialogue',
      speaker_id: character.id,
      content: decision.dialogue,
      timestamp: now,
      is_autonomous: true,
    });
  }

  // 发布行动事件（玩家可见）
  if (decision.action) {
    worldEngine.publishEvent({
      id: `ai_action_${character.id}_${now}`,
      type: 'action',
      speaker_id: character.id,
      content: decision.action,
      timestamp: now,
      is_autonomous: true,
    });
  }

  // 更新角色内在状态（玩家不可见）
  if (decision.emotion_change) {
    Object.assign(character.internal_state, decision.emotion_change);
  }

  // 更新活动时间
  character.internal_state.lastActivity = now;
  character.last_speech_time = now;

  console.log(`✅ ${character.name} 决策执行完成`);
}

/**
 * 🔒 格式化事件给客户端：过滤所有内部信息
 */
function formatEventForClient(event: any) {
  // 只返回玩家应该看到的信息
  return {
    id: event.id,
    type: event.type,
    speaker_id: event.speaker_id,
    content: event.content, // 只包含对话或行动，绝对不包含内心想法
    timestamp: event.timestamp,
    is_autonomous: event.is_autonomous || false,
    // 🔒 明确排除任何内部信息：internal_thought, emotion_change 等
  };
}

/**
 * GET 端点：获取世界状态信息
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sceneId = searchParams.get('sceneId') || 'moonlight_tavern';

  try {
    // 🔧 修复：使用异步方式获取世界引擎实例
    const worldEngine = await WorldEngine.getInstance(sceneId);
    const worldState = worldEngine.getWorldState();

    return NextResponse.json({
      success: true,
      world_state: {
        scene_id: worldState.scene_id,
        scene_type: worldState.scene_type,
        tick_count: worldState.tick_count,
        is_active: worldState.is_active,
        character_count: worldState.characters.size,
        event_count: worldState.scene_events.length,
        last_tick: worldState.last_tick,
      },
      recent_events: worldEngine.getRecentEvents(10).map(formatEventForClient),
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}