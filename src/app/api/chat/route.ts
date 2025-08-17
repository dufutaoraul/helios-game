/**
 * 《日识》核心互动原型 - 终极智能调度中心 v2.0
 * 
 * 设计哲学重构：核心AI + 万能系统AI
 * 
 * 架构说明：
 * 1. 核心AI（林溪、陈浩）：拥有独立内在状态，负责复杂剧情互动
 * 2. 万能系统AI：动态推断并扮演任何临时角色，彻底消除硬编码
 * 
 * 路由逻辑：
 * - 匹配核心AI关键词 → 核心AI直接响应
 * - 无匹配 → 万能系统AI分析上下文并动态扮演相应角色
 */

import { NextRequest, NextResponse } from 'next/server';
import { globalFastBrainClient, type ActionPackage } from '@/lib/fast-brain';
import { 
  matchCoreAIByKeywords, 
  getCoreAICharacters, 
  getCharacterConfig,
  validateCharacterConfigs,
  getConfigStats,
  getPotentialCoreAIResponders,
  calculateRelevanceWeight,
  type CharacterConfig 
} from '@/lib/character_configs';

// 🆕 角色实例持久化 - 会话级别的角色身份存储
interface UniversalAISession {
  displayName: string;
  avatar: string;
  motivation: string;
  lastUsed: number;
  messageCount: number;
  // 🔧 修复1：添加playerName关联，但不作为key使用
  associatedPlayerName: string;
}

// 简单的内存存储（生产环境中应使用Redis等）
const universalAISessionStore = new Map<string, UniversalAISession>();

// 会话过期时间（30分钟）
const SESSION_EXPIRE_TIME = 30 * 60 * 1000;

// 🔧 修复1：全局唯一的会话标识符，解决playerName变化导致的人格分裂
// 问题：之前使用 `universal_ai_${playerName}` 导致开场和游戏中创建不同会话
// 解决：使用单一固定key，确保同一游戏会话中万能AI身份持久化
const UNIVERSAL_AI_SESSION_KEY = 'universal_ai_persistent_session';

/**
 * 🔧 修复1：统一会话Key生成 - 不再依赖playerName
 * 修复前问题：playerName从空字符串变为"陶子"时，创建了两个不同的会话key
 * 修复后效果：始终使用相同的会话key，确保万能AI身份一致性
 */
function getSessionKey(playerName: string): string {
  // 🔧 使用固定key替代动态key，彻底解决人格分裂问题
  return UNIVERSAL_AI_SESSION_KEY;
}

function getUniversalAISession(playerName: string): UniversalAISession | null {
  const sessionKey = getSessionKey(playerName);
  const session = universalAISessionStore.get(sessionKey);
  
  if (!session) return null;
  
  // 检查会话是否过期
  if (Date.now() - session.lastUsed > SESSION_EXPIRE_TIME) {
    universalAISessionStore.delete(sessionKey);
    console.log(`🕐 万能AI会话过期: ${sessionKey}`);
    return null;
  }
  
  return session;
}

function setUniversalAISession(playerName: string, roleInfo: { displayName: string; avatar: string; motivation: string }): void {
  const sessionKey = getSessionKey(playerName);
  const session: UniversalAISession = {
    displayName: roleInfo.displayName,
    avatar: roleInfo.avatar,
    motivation: roleInfo.motivation,
    lastUsed: Date.now(),
    messageCount: 1,
    // 🔧 修复1：记录玩家关联但不影响会话标识
    associatedPlayerName: playerName || 'anonymous'
  };
  
  universalAISessionStore.set(sessionKey, session);
  console.log(`💾 万能AI会话保存: ${sessionKey} -> ${roleInfo.displayName} (玩家: ${playerName || 'anonymous'})`);
}

function updateUniversalAISession(playerName: string): void {
  const sessionKey = getSessionKey(playerName);
  const session = universalAISessionStore.get(sessionKey);
  
  if (session) {
    session.lastUsed = Date.now();
    session.messageCount++;
    console.log(`🔄 万能AI会话更新: ${sessionKey} (消息数: ${session.messageCount})`);
  }
}

function shouldResetUniversalAISession(userMessage: string, currentSession: UniversalAISession): boolean {
  const lowerMessage = userMessage.toLowerCase();
  
  // 明确的角色切换请求
  if (lowerMessage.includes('换个人') || lowerMessage.includes('换一个') || lowerMessage.includes('别人')) {
    return true;
  }
  
  // 如果消息内容与当前角色完全不符，建议切换
  const currentRole = currentSession.displayName;
  
  if (currentRole === '酒保' && lowerMessage.includes('房间')) {
    return true; // 酒保不处理房间相关问题
  }
  
  if (currentRole === '环境' && (lowerMessage.includes('老板') || lowerMessage.includes('服务员'))) {
    return true; // 环境角色不应该回应服务类请求
  }
  
  return false;
}

/**
 * 🔧 辅助函数：清理万能AI会话（用于测试和重置）
 * 在新游戏开始时可以调用此函数确保干净的状态
 */
function clearUniversalAISession(): void {
  universalAISessionStore.clear();
  console.log(`🧹 万能AI会话已清理，重置为干净状态`);
}

/**
 * 终极智能调度中心 - 核心处理函数
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 验证角色配置
    if (!validateCharacterConfigs()) {
      throw new Error('角色配置验证失败');
    }

    const { userMessage, chatHistory, playerName, playerInputType, forceCharacter, isNaturalOpening, targetCharacter } = await request.json();
    
    console.log(`🎯 智能调度中心: 处理消息 "${userMessage}" (输入: ${playerInputType || 'dialogue'}, 开场: ${isNaturalOpening ? '是' : '否'}, 目标: ${targetCharacter || '无'})`);
    console.log(`📊 当前架构: ${JSON.stringify(getConfigStats())}`);
    
    // 🎭 新增：自然开场处理逻辑
    if (isNaturalOpening) {
      console.log(`🎭 自然开场模式: 酒保主动招呼新客人`);
      return await handleNaturalOpeningGreeting(userMessage, startTime, playerName);
    }
    
    // 🎭 新增：指定角色观察处理
    if (targetCharacter && playerInputType === 'observation') {
      console.log(`👁️ 观察模式: ${targetCharacter} 观察陌生人`);
      return await handleCharacterObservation(targetCharacter, userMessage, chatHistory, startTime);
    }
    
    // 🔧 强制角色机制详细日志（保留原有逻辑）
    if (forceCharacter) {
      console.log(`🎯 开始强制角色响应流程...`);
      console.log(`🎯 目标角色: ${forceCharacter}`);
      console.log(`🎯 可用角色: ${getCoreAICharacters().map(c => c.id).join(', ')}`);
    }
    
    // 验证必需参数
    if (!userMessage) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少必需参数：userMessage',
        dispatchCenter: true
      }, { status: 400 });
    }

    // 🔧 修复2：强制指定角色响应（用于开场序列）
    // 修复前问题：前端传递的角色ID格式与后端期望不匹配，导致⚠️ 无效的强制角色ID错误
    // 修复后效果：标准化角色ID验证，确保前后端参数格式一致
    if (forceCharacter) {
      console.log(`🎯 尝试强制角色响应: ${forceCharacter}`);
      
      // 🔧 修复2：增强角色ID匹配逻辑，支持多种格式
      let forcedCharacter = getCharacterConfig(forceCharacter);
      
      // 如果直接匹配失败，尝试其他常见格式
      if (!forcedCharacter) {
        const allCharacters = getCoreAICharacters();
        // 尝试通过name匹配
        forcedCharacter = allCharacters.find(char => 
          char.name === forceCharacter || 
          char.name.toLowerCase() === forceCharacter.toLowerCase()
        );
        
        // 尝试通过ID的不同格式匹配
        if (!forcedCharacter) {
          forcedCharacter = allCharacters.find(char => 
            char.id === forceCharacter ||
            char.id.toLowerCase() === forceCharacter.toLowerCase()
          );
        }
      }
      
      // 🔧 修复2核心Bug：类型检查错误
      // Bug原因：后端检查 'core'，但角色配置中类型是 'CORE_AI'
      // 修复方案：统一类型检查，并增加详细诊断日志
      if (forcedCharacter) {
        console.log(`🔍 强制角色匹配诊断: 找到角色 ${forcedCharacter.name}, 类型: ${forcedCharacter.type}`);
        
        if (forcedCharacter.type === 'CORE_AI') { // 🔧 修复：使用正确的类型值
          console.log(`✅ 强制角色响应匹配成功: ${forcedCharacter.name} (ID: ${forcedCharacter.id})`);
          console.log(`🎬 ${forcedCharacter.name} 正在执行强制开场...`);
          const response = await handleCoreAIDirectResponse(forcedCharacter, userMessage, chatHistory, startTime);
          return response;
        } else {
          console.warn(`⚠️ 强制角色类型不匹配: ${forcedCharacter.name} 类型为 ${forcedCharacter.type}，期望 CORE_AI`);
        }
      } else {
        console.warn(`❌ 强制角色响应失败，无法匹配角色: ${forceCharacter}`);
        console.warn(`💡 可用角色列表: ${getCoreAICharacters().map(c => `${c.name}(${c.id})`).join(', ')}`);
        console.warn(`🔍 详细匹配尝试结果:`);
        console.warn(`   - getCharacterConfig("${forceCharacter}"): ${getCharacterConfig(forceCharacter) ? '找到' : '未找到'}`);
        if (getCharacterConfig(forceCharacter)) {
          console.warn(`   - 找到的角色信息: ${JSON.stringify(getCharacterConfig(forceCharacter))}`);
        }
        // 🔧 修复2：失败时不阻断流程，继续正常的AI决策逻辑
      }
    }

    // ===== 第一步：尝试匹配核心AI =====
    const targetCoreAI = matchCoreAIByKeywords(userMessage);
    
    if (targetCoreAI) {
      // ===== 路径A：核心AI直接响应（言行合一） =====
      console.log(`🎯 路由决策: 核心AI直接响应 - ${targetCoreAI.name}`);
      const response = await handleCoreAIDirectResponse(targetCoreAI, userMessage, chatHistory, startTime);
      return response;
    } else {
      // ===== 路径B：并行决策系统 - 检查是否有核心AI想要响应 =====
      const potentialResponders = getPotentialCoreAIResponders(userMessage);
      
      if (potentialResponders.length > 0) {
        // ===== 路径B1：核心AI并行响应 =====
        console.log(`🎭 路由决策: ${potentialResponders.length}个核心AI并行响应`);
        const response = await handleParallelCoreAIResponse(potentialResponders, userMessage, chatHistory, startTime);
        return response;
      } else {
        // ===== 路径B2：万能系统AI处理（优化：降低活跃度，给核心AI更多机会） =====
        console.log(`🌐 路由决策: 万能系统AI接管 (核心AI都选择观望)`);
        
        // 🎭 新增：万能AI节制逻辑 - 避免过度活跃
        // 如果玩家输入很简单（如单纯的行动），降低万能AI响应概率
        const isSimpleAction = playerInputType === 'action' && userMessage.length < 10;
        const universalAIRate = isSimpleAction ? 0.6 : 0.9; // 简单行动时60%概率响应
        
        if (Math.random() < universalAIRate) {
          const response = await handleUniversalSystemAI(userMessage, chatHistory, playerName, startTime, playerInputType);
          return response;
        } else {
          console.log(`🤫 万能系统AI选择保持沉默，给核心AI更多表现机会`);
          return NextResponse.json({
            success: true,
            actionPackage: null,
            message: '暂时无人响应，环境保持安静...',
            responseTime: Date.now() - startTime,
            dispatchCenter: true,
            routingType: 'SILENCE'
          });
        }
      }
    }

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ 终极调度中心错误:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '终极调度中心调用失败',
      responseTime,
      dispatchCenter: true
    }, { status: 500 });
  }
}

/**
 * 🆕 处理核心AI的直接响应（言行合一版本）
 * 这些是有独立内在状态的主要角色（林溪、陈浩）
 */
async function handleCoreAIDirectResponse(
  character: CharacterConfig, 
  userMessage: string, 
  chatHistory: string, 
  startTime: number
): Promise<NextResponse> {
  console.log(`🎯 核心AI直接响应: ${character.name}`);
  
  try {
    // 🆕 使用言行合一的ActionPackage生成器
    const actionPackage = await globalFastBrainClient.generateActionPackage(
      character.name,
      character.motivation,
      chatHistory || '',
      userMessage
    );
    
    const responseTime = Date.now() - startTime;
    console.log(`✅ 核心AI言行合一响应完成: ${character.name} (${responseTime}ms)`, actionPackage);

    // 记录核心AI交互日志
    logCoreAIInteraction({
      characterId: character.id,
      characterName: character.name,
      userMessage,
      aiResponse: actionPackage,
      responseTime,
      timestamp: Date.now(),
      interactionType: 'direct'
    });

    return NextResponse.json({
      success: true,
      actionPackage, // 🆕 返回完整的行动包
      character: {
        id: character.id,
        name: character.name,
        type: character.type
      },
      responseTime,
      dispatchCenter: true,
      routingType: 'CORE_AI_DIRECT'
    });

  } catch (error) {
    console.error(`❌ 核心AI直接响应失败 (${character.name}):`, error);
    throw error;
  }
}

/**
 * 🆕 处理并行核心AI响应
 * 实现Promise.all并行处理多个核心AI的响应
 */
async function handleParallelCoreAIResponse(
  characters: CharacterConfig[],
  userMessage: string,
  chatHistory: string,
  startTime: number
): Promise<NextResponse> {
  console.log(`🎭 开始并行处理${characters.length}个核心AI的响应`);
  
  try {
    // 🆕 并行生成所有核心AI的响应
    const parallelPromises = characters.map(async (character) => {
      try {
        // 🧠 智能相关性权重计算（包含上下文分析）
        const weight = calculateRelevanceWeight(userMessage, character, chatHistory);
        const adjustedRate = Math.min((character.responseRate || 0) * weight, 1.0);
        
        console.log(`🧠 ${character.name} 智能评分: 基础${Math.round((character.responseRate || 0) * 100)}% × 权重${weight.toFixed(2)} = ${Math.round(adjustedRate * 100)}%`);
        
        // 🔧 修复3：检查是否为开场序列或强制角色响应
        // 修复前问题：即使有forceCharacter指定，概率系统仍可能让角色沉默
        // 修复后效果：开场序列或强制响应时，绕过概率检查，确保角色必定响应
        const isOpeningSequence = userMessage.includes('新来者') && userMessage.includes('进入了酒馆');
        
        // 🎬 新增：检查是否为强制角色响应的上下文
        // 通过检查chatHistory是否为空来判断是否为开场序列
        const isInitialResponse = !chatHistory || chatHistory.trim() === '';
        
        if (!isOpeningSequence && !isInitialResponse) {
          // 非开场序列且非强制响应：正常的概率判断
          if (Math.random() > adjustedRate) {
            console.log(`🤐 ${character.name} 最终选择保持沉默 (概率: ${Math.round(adjustedRate * 100)}%)`);
            return null;
          }
        } else {
          // 🔧 修复3：开场序列或强制响应时，必定响应
          if (isOpeningSequence) {
            console.log(`🎬 ${character.name} 开场序列强制响应 (跳过概率检查)`);
          } else if (isInitialResponse) {
            console.log(`🎯 ${character.name} 强制角色响应 (跳过概率检查)`);
          }
        }
        
        const actionPackage = await globalFastBrainClient.generateActionPackage(
          character.name,
          character.motivation,
          chatHistory || '',
          userMessage
        );
        
        return {
          character,
          actionPackage
        };
      } catch (error) {
        console.error(`❌ ${character.name} 并行响应失败:`, error);
        return null;
      }
    });
    
    // 等待所有并行任务完成
    const results = await Promise.all(parallelPromises);
    const validResponses = results.filter(result => result !== null);
    
    const responseTime = Date.now() - startTime;
    console.log(`✅ 并行处理完成: ${validResponses.length}/${characters.length}个AI响应 (${responseTime}ms)`);
    
    if (validResponses.length === 0) {
      // 如果没有AI最终选择响应，回退到万能系统AI
      console.log(`🌐 所有核心AI都选择沉默，回退到万能系统AI`);
      return await handleUniversalSystemAI(userMessage, chatHistory, '', startTime, 'dialogue');
    }
    
    // 记录所有有效响应的日志
    validResponses.forEach(({ character, actionPackage }) => {
      logCoreAIInteraction({
        characterId: character.id,
        characterName: character.name,
        userMessage,
        aiResponse: actionPackage,
        responseTime,
        timestamp: Date.now(),
        interactionType: 'parallel'
      });
    });
    
    return NextResponse.json({
      success: true,
      responses: validResponses, // 🆕 返回所有响应
      responseTime,
      dispatchCenter: true,
      routingType: 'CORE_AI_PARALLEL'
    });

  } catch (error) {
    console.error(`❌ 并行核心AI处理失败:`, error);
    throw error;
  }
}

/**
 * 万能系统AI处理器
 * 
 * 核心功能：动态推断并扮演任何临时角色
 * 
 * 实现逻辑：
 * 1. 分析用户消息的上下文和意图
 * 2. 推断用户想要交流的角色类型
 * 3. 动态生成该角色的身份和回应
 * 4. 返回自然、合乎逻辑的响应
 */
/**
 * 🆕 万能系统AI处理器（言行合一版本）
 * 
 * 核心功能：动态推断并扮演任何临时角色，支持完整的行动包生成
 * 
 * 实现逻辑：
 * 1. 分析用户消息的上下文和意图
 * 2. 推断用户想要交流的角色类型
 * 3. 动态生成该角色的身份和完整行动响应
 * 4. 返回自然、合乎逻辑的言行合一响应
 */
async function handleUniversalSystemAI(
  userMessage: string, 
  chatHistory: string, 
  playerName: string, 
  startTime: number,
  playerInputType?: string
): Promise<NextResponse> {
  console.log(`🌐 万能系统AI: 开始角色分析 (持久化模式)`);
  
  try {
    // 🆕 角色实例持久化：首先检查现有会话
    const roleInfo = buildUniversalSystemAIRoleWithPersistence(userMessage, chatHistory, playerName, playerInputType);
    console.log(`🎭 万能系统AI${roleInfo.isExisting ? '继续扮演' : '开始扮演'}角色: ${roleInfo.displayName} ${roleInfo.avatar} (响应${playerInputType || 'dialogue'})`);
    
    // 使用言行合一的ActionPackage生成器
    const actionPackage = await globalFastBrainClient.generateActionPackage(
      roleInfo.displayName, // 使用持久化角色名作为内部标识
      roleInfo.motivation,  // 使用持久化动机
      chatHistory || '',
      userMessage
    );
    
    // 🆕 更新会话使用时间
    updateUniversalAISession(playerName);
    
    const responseTime = Date.now() - startTime;
    console.log(`✅ 万能系统AI言行合一响应完成 (${responseTime}ms):`, actionPackage);

    // 记录系统AI交互日志（包含持久化信息）
    logSystemAIInteraction({
      userMessage,
      aiResponse: actionPackage,
      responseTime,
      timestamp: Date.now(),
      chatHistory,
      roleInfo: {
        ...roleInfo,
        sessionPersisted: roleInfo.isExisting // 记录是否使用了持久化会话
      },
      playerInputType // 🆕 记录玩家输入类型
    });

    return NextResponse.json({
      success: true,
      actionPackage, // 返回完整的行动包
      character: {
        id: 'system',
        name: roleInfo.displayName, // 🆕 使用持久化角色名
        type: 'SYSTEM_AI',
        avatar: roleInfo.avatar    // 🆕 使用持久化角色头像
      },
      responseTime,
      dispatchCenter: true,
      routingType: 'UNIVERSAL_SYSTEM_AI'
    });

  } catch (error) {
    console.error(`❌ 万能系统AI处理失败:`, error);
    throw error;
  }
}

/**
 * 🆕 带持久化的万能系统AI角色构建器
 * 首先检查现有会话，如果存在且合适则继续使用，否则创建新角色
 */
function buildUniversalSystemAIRoleWithPersistence(
  userMessage: string, 
  chatHistory: string, 
  playerName: string, 
  playerInputType?: string
): {
  motivation: string;
  displayName: string;
  avatar: string;
  isExisting: boolean;
} {
  // 检查现有会话
  const existingSession = getUniversalAISession(playerName);
  
  if (existingSession) {
    // 检查是否需要重置会话（角色切换）
    if (shouldResetUniversalAISession(userMessage, existingSession)) {
      console.log(`🔄 万能AI会话重置: ${existingSession.displayName} -> 新角色 (原因: 角色不匹配)`);
      // 删除现有会话，将创建新角色
      const sessionKey = getSessionKey(playerName);
      universalAISessionStore.delete(sessionKey);
    } else {
      // 继续使用现有角色
      console.log(`♻️ 万能AI会话复用: ${existingSession.displayName} (使用次数: ${existingSession.messageCount + 1})`);
      return {
        motivation: existingSession.motivation,
        displayName: existingSession.displayName,
        avatar: existingSession.avatar,
        isExisting: true
      };
    }
  }
  
  // 创建新角色（无现有会话或已重置）
  const newRoleInfo = buildUniversalSystemAIRole(userMessage, chatHistory, playerName, playerInputType);
  
  // 保存新会话
  setUniversalAISession(playerName, newRoleInfo);
  
  return {
    ...newRoleInfo,
    isExisting: false
  };
}

/**
 * 🆕 动态构建万能系统AI的动机和角色身份（原版，现在被持久化版本调用）
 * 根据用户消息和上下文，智能推断应该扮演的角色类型
 * 返回: { motivation: string, displayName: string, avatar: string }
 */
function buildUniversalSystemAIRole(
  userMessage: string, 
  chatHistory: string, 
  playerName: string, 
  playerInputType?: string
): {
  motivation: string;
  displayName: string;
  avatar: string;
} {
  const lowerMessage = userMessage.toLowerCase();
  
  // 🆕 根据玩家输入类型调整角色响应策略
  const isPlayerAction = playerInputType === 'action';
  
  // 服务性角色检测
  if (lowerMessage.includes('老板') || lowerMessage.includes('掌柜') || lowerMessage.includes('店主')) {
    return {
      motivation: '我是月影酒馆的老板，经营这家酒馆多年，熟悉每一位常客，善于观察顾客需求，提供优质服务。',
      displayName: '酒馆老板',
      avatar: '👨‍💼'
    };
  }
  
  if (lowerMessage.includes('服务员') || lowerMessage.includes('小二') || lowerMessage.includes('伙计')) {
    return {
      motivation: '我是酒馆的服务员，热情周到，熟悉菜品和酒水，总是尽力满足客人的需求。',
      displayName: '服务员',
      avatar: '👨‍🍳'
    };
  }
  
  // 酒保角色检测（最重要的服务角色）
  if (lowerMessage.includes('酒') || lowerMessage.includes('喝') || lowerMessage.includes('来杯') || lowerMessage.includes('龙舌兰') || lowerMessage.includes('威士忌')) {
    return {
      motivation: '我是酒馆的专业酒保，精通各种调酒技巧，熟悉每一种酒类，总是能为客人推荐最合适的饮品。',
      displayName: '酒保',
      avatar: '🍸'
    };
  }
  
  // 环境解说检测
  if (lowerMessage.includes('这是哪') || lowerMessage.includes('什么地方') || lowerMessage.includes('几点') || lowerMessage.includes('时间')) {
    return {
      motivation: '我是这个世界的环境叙述者，熟知周围的一切情况，能够为来访者提供准确的环境信息。',
      displayName: '环境叙述',
      avatar: '🌍'
    };
  }
  
  // 路人角色检测
  if (lowerMessage.includes('有人吗') || lowerMessage.includes('大家') || lowerMessage.includes('各位')) {
    return {
      motivation: '我是酒馆中的一位普通顾客，平时比较安静，但会对新来的客人表示关注。',
      displayName: '酒馆顾客',
      avatar: '👤'
    };
  }
  
  // 🆕 默认角色：根据输入类型智能环境响应
  if (isPlayerAction) {
    // 玩家执行行动时，环境或其他角色可能有反应
    return {
      motivation: `我是月影酒馆的环境观察者，当有人在酒馆中做出行动时，我会描述环境的变化、其他人的反应，或者代表相关的角色做出回应。`,
      displayName: '环境',
      avatar: '🌍'
    };
  } else {
    // 玩家说话时，推断最合适的回应者
    return {
      motivation: `我是这个世界的万能系统AI，会根据${playerName}的话语动态推断并扮演最合适的临时角色，提供自然、贴切的回应。`,
      displayName: '系统',
      avatar: '🎭'
    };
  }
}

/**
 * 记录核心AI交互日志
 */
function logCoreAIInteraction(logData: {
  characterId: string;
  characterName: string;
  userMessage: string;
  aiResponse: any;
  responseTime: number;
  timestamp: number;
  interactionType: 'direct' | 'parallel' | 'observation';
}) {
  try {
    console.log('📊 核心AI交互日志:', {
      log_type: 'core_ai_interaction',
      character_id: logData.characterId,
      character_name: logData.characterName,
      user_input: logData.userMessage,
      ai_output: logData.aiResponse,
      response_time_ms: logData.responseTime,
      timestamp: logData.timestamp,
      interaction_type: logData.interactionType,
      note: '核心AI角色的复杂互动日志，用于慢脑深度分析'
    });
  } catch (error) {
    console.error('⚠️ 核心AI日志记录失败:', error);
  }
}

/**
 * 记录万能系统AI交互日志
 */
function logSystemAIInteraction(logData: {
  userMessage: string;
  aiResponse: any;
  responseTime: number;
  timestamp: number;
  chatHistory: string;
  roleInfo?: any; // 可选的角色信息
  playerInputType?: string; // 🆕 可选的玩家输入类型
}) {
  try {
    console.log('📊 万能系统AI交互日志:', {
      log_type: 'universal_system_ai_interaction',
      user_input: logData.userMessage,
      player_input_type: logData.playerInputType, // 🆕 玩家输入类型
      ai_output: logData.aiResponse,
      response_time_ms: logData.responseTime,
      timestamp: logData.timestamp,
      chat_context: logData.chatHistory,
      role_info: logData.roleInfo, // 记录扮演的角色信息
      note: '万能系统AI的动态角色扮演日志 - 实现了零硬编码的临时角色召唤，支持动态身份显示和双输入模式'
    });
  } catch (error) {
    console.error('⚠️ 系统AI日志记录失败:', error);
  }
}

/**
 * 🎭 处理自然开场的酒保招呼
 * 设计目标：模拟真实酒保对新客人的自然反应
 */
async function handleNaturalOpeningGreeting(
  userMessage: string,
  startTime: number,
  playerName?: string
): Promise<NextResponse> {
  console.log(`🍺 酒保自然招呼: 向匿名新客人问好`);
  
  try {
    // 🎭 构建自然的酒保问候动机
    const barkeepMotivation = `我是月影酒馆的酒保。现在有一位陌生客人进入酒馆，作为专业的酒保，我应该主动友好地招呼客人，询问需要什么服务，但我并不知道客人的姓名。`;
    
    // 🎭 生成自然的问候
    const actionPackage = await globalFastBrainClient.generateActionPackage(
      '酒保',
      barkeepMotivation,
      '', // 无历史对话
      '有新客人进入酒馆，我需要主动招呼'
    );
    
    const responseTime = Date.now() - startTime;
    console.log(`✅ 酒保自然招呼完成 (${responseTime}ms):`, actionPackage);

    return NextResponse.json({
      success: true,
      actionPackage,
      character: {
        id: 'system',
        name: '酒保',
        type: 'BARKEEPER',
        avatar: '🍺'
      },
      responseTime,
      dispatchCenter: true,
      routingType: 'NATURAL_OPENING'
    });

  } catch (error) {
    console.error(`❌ 酒保自然招呼失败:`, error);
    throw error;
  }
}

/**
 * 🎭 处理角色观察反应
 * 设计目标：让指定角色自然地观察并可能反应
 */
async function handleCharacterObservation(
  targetCharacterId: string,
  userMessage: string,
  chatHistory: string,
  startTime: number
): Promise<NextResponse> {
  console.log(`👁️ ${targetCharacterId} 开始观察陌生人`);
  
  try {
    const character = getCharacterConfig(targetCharacterId);
    if (!character || character.type !== 'CORE_AI') {
      throw new Error(`无效的观察角色: ${targetCharacterId}`);
    }
    
    // 🎭 构建观察情境的动机
    const observationMotivation = `${character.motivation} 现在一位陌生人进入了酒馆，我会根据自己的性格特点对这位陌生人进行观察，可能会有一些内心想法，也可能会采取一些谨慎的行动。`;
    
    const actionPackage = await globalFastBrainClient.generateActionPackage(
      character.name,
      observationMotivation,
      chatHistory || '',
      userMessage
    );
    
    const responseTime = Date.now() - startTime;
    console.log(`✅ ${character.name} 观察反应完成 (${responseTime}ms):`, actionPackage);

    // 记录观察交互日志
    logCoreAIInteraction({
      characterId: character.id,
      characterName: character.name,
      userMessage,
      aiResponse: actionPackage,
      responseTime,
      timestamp: Date.now(),
      interactionType: 'observation'
    });

    return NextResponse.json({
      success: true,
      actionPackage,
      character: {
        id: character.id,
        name: character.name,
        type: character.type,
        avatar: character.avatar
      },
      responseTime,
      dispatchCenter: true,
      routingType: 'CHARACTER_OBSERVATION'
    });

  } catch (error) {
    console.error(`❌ 角色观察处理失败:`, error);
    throw error;
  }
}

/**
 * 健康检查接口
 */
export async function GET(request: NextRequest) {
  try {
    const configValid = validateCharacterConfigs();
    const fastBrainHealthy = await globalFastBrainClient.testConnection();
    const stats = getConfigStats();
    
    return NextResponse.json({
      status: configValid && fastBrainHealthy ? 'healthy' : 'degraded',
      service: 'ultimate-dispatch-center',
      configValid,
      fastBrainHealthy,
      stats,
      architecture: 'CORE_AI + UNIVERSAL_SYSTEM_AI',
      timestamp: Date.now(),
      version: '2.0.0'
    });
    
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      service: 'ultimate-dispatch-center',
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: Date.now()
    }, { status: 503 });
  }
}