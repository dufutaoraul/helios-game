/**
 * 《日识》微型世界模拟器 - 世界引擎核心架构
 * 
 * 设计哲学：从"请求-响应"模式升级为"实时世界模拟"模式
 * 核心创新：服务器端持续运行的"世界心跳"，AI拥有真正的自主生活
 */

/**
 * 角色内在状态接口 - AI的"灵魂"数据结构
 */
export interface InternalState {
  /** 能量值：影响AI的活跃程度 (0-100) */
  energy: number;
  /** 专注度：影响AI对特定话题的关注 (0-100) */
  focus: number;
  /** 好奇心：影响AI主动探索的倾向 (0-100) */
  curiosity: number;
  /** 无聊值：达到阈值时AI会主动寻找话题 (0-100) */
  boredom: number;
  /** 最后活动时间戳：用于计算状态衰减 */
  lastActivity: number;
}

/**
 * 场景中角色的完整状态
 */
export interface CharacterState {
  /** 角色基本信息 */
  id: string;
  name: string;
  type: 'CORE_AI' | 'SYSTEM_AI' | 'PLAYER';
  
  /** 角色的私有内在状态（玩家看不见） */
  internal_state: InternalState;
  
  /** 角色当前的情绪标签 */
  current_emotion?: string;
  
  /** 角色是否在线（对于玩家有效） */
  is_online: boolean;
  
  /** 角色的最后发言时间 */
  last_speech_time?: number;
}

/**
 * 场景事件 - 玩家可见的公共事件
 */
export interface SceneEvent {
  /** 事件唯一ID */
  id: string;
  /** 事件类型 */
  type: 'dialogue' | 'action' | 'system' | 'environment';
  /** 事件发起者 */
  speaker_id: string;
  /** 事件内容（玩家可见） */
  content: string;
  /** 事件发生时间戳 */
  timestamp: number;
  /** 事件是否来自AI自主行为 */
  is_autonomous?: boolean;
}

/**
 * 行动队列项 - 需要时间的动作
 */
export interface ActionQueueItem {
  id: string;
  character_id: string;
  action_type: string;
  description: string;
  start_time: number;
  duration: number; // 毫秒
  completion_callback?: () => void;
}

/**
 * 世界状态对象 - 单一真相来源
 */
export interface WorldState {
  /** 场景唯一标识符 */
  scene_id: string;
  
  /** 场景类型（如"月影酒馆"） */
  scene_type: string;
  
  /** 场景创建时间 */
  created_at: number;
  
  /** 场景中的所有角色状态 */
  characters: Map<string, CharacterState>;
  
  /** 公共事件历史（玩家可见的"篝火"） */
  scene_events: SceneEvent[];
  
  /** 行动队列（进行中的动作） */
  action_queue: ActionQueueItem[];
  
  /** 世界心跳计数器 */
  tick_count: number;
  
  /** 最后一次心跳时间 */
  last_tick: number;
  
  /** 场景是否活跃 */
  is_active: boolean;
}

/**
 * AI决策结果接口
 */
export interface AIDecisionResult {
  /** 是否决定行动 */
  should_act: boolean;
  
  /** 对话内容（如果有） */
  dialogue?: string;
  
  /** 行动描述（如果有） */
  action?: string;
  
  /** 内心想法（仅用于日志，不对玩家可见） */
  internal_thought?: string;
  
  /** 情绪变化 */
  emotion_change?: Partial<InternalState>;
  
  /** 决策原因（调试用） */
  decision_reason?: string;
}

/**
 * 世界引擎管理器 - 微型世界模拟器的核心控制器
 * 🔧 修复：实施真正的异步单例模式，彻底解决多实例并发问题
 */
export class WorldEngine {
  // 🔧 修复：真正的单例模式 - 只允许存在一个实例
  private static instance: WorldEngine | null = null;
  private static initializationPromise: Promise<WorldEngine> | null = null;
  private static initializationLock = false;
  
  private worldState: WorldState;
  private heartbeatInterval?: NodeJS.Timeout;
  private eventSubscribers: Set<(event: SceneEvent) => void> = new Set();

  private constructor(sceneId: string, sceneType: string = 'default') {
    this.worldState = {
      scene_id: sceneId,
      scene_type: sceneType,
      created_at: Date.now(),
      characters: new Map(),
      scene_events: [],
      action_queue: [],
      tick_count: 0,
      last_tick: Date.now(),
      is_active: true,
    };
    
    console.log(`🌍 世界引擎已创建: ${sceneId} (${sceneType})`);
  }

  /**
   * 🔧 修复：异步单例模式 - 彻底解决多实例问题
   */
  static async getInstance(sceneId: string, sceneType?: string): Promise<WorldEngine> {
    // 如果已有实例且场景ID匹配，直接返回
    if (WorldEngine.instance?.worldState.scene_id === sceneId) {
      return WorldEngine.instance;
    }
    
    // 如果正在初始化，等待完成
    if (WorldEngine.initializationPromise) {
      console.log('⏳ 等待现有初始化完成...');
      return WorldEngine.initializationPromise;
    }
    
    // 防止并发初始化
    if (WorldEngine.initializationLock) {
      throw new Error('WorldEngine 正在初始化中，请稍后重试');
    }
    
    try {
      WorldEngine.initializationLock = true;
      
      // 如果存在旧实例，先销毁
      if (WorldEngine.instance) {
        console.log('🔄 销毁旧世界引擎实例...');
        WorldEngine.instance.destroy();
        WorldEngine.instance = null;
      }
      
      // 创建初始化Promise
      WorldEngine.initializationPromise = new Promise(async (resolve) => {
        // 短暂延迟确保完全清理
        await new Promise(r => setTimeout(r, 100));
        
        const newInstance = new WorldEngine(sceneId, sceneType || 'default');
        WorldEngine.instance = newInstance;
        
        console.log(`✅ 新世界引擎实例创建完成: ${sceneId}`);
        resolve(newInstance);
      });
      
      const result = await WorldEngine.initializationPromise;
      
      // 清理初始化状态
      WorldEngine.initializationPromise = null;
      WorldEngine.initializationLock = false;
      
      return result;
      
    } catch (error) {
      // 清理失败状态
      WorldEngine.initializationPromise = null;
      WorldEngine.initializationLock = false;
      throw error;
    }
  }

  /**
   * 🔧 修复：强制获取当前实例（同步方法，用于兼容性）
   */
  static getCurrentInstance(): WorldEngine | null {
    return WorldEngine.instance;
  }

  /**
   * 添加角色到世界
   */
  addCharacter(character: CharacterState): void {
    this.worldState.characters.set(character.id, character);
    console.log(`👤 角色加入世界: ${character.name} (${character.type})`);
    
    // 发布角色加入事件
    this.publishEvent({
      id: `join_${character.id}_${Date.now()}`,
      type: 'system',
      speaker_id: 'system',
      content: `${character.name} 进入了场景`,
      timestamp: Date.now(),
    });
  }

  /**
   * 移除角色
   */
  removeCharacter(characterId: string): void {
    const character = this.worldState.characters.get(characterId);
    if (character) {
      this.worldState.characters.delete(characterId);
      console.log(`👤 角色离开世界: ${character.name}`);
      
      // 发布角色离开事件
      this.publishEvent({
        id: `leave_${characterId}_${Date.now()}`,
        type: 'system',
        speaker_id: 'system',
        content: `${character.name} 离开了场景`,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * 发布事件到公共频道
   */
  publishEvent(event: SceneEvent): void {
    this.worldState.scene_events.push(event);
    
    // 通知所有订阅者
    this.eventSubscribers.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('事件订阅者回调错误:', error);
      }
    });
    
    console.log(`📢 事件发布: [${event.type}] ${event.speaker_id}: ${event.content}`);
  }

  /**
   * 订阅事件流
   */
  subscribe(callback: (event: SceneEvent) => void): () => void {
    this.eventSubscribers.add(callback);
    console.log(`📡 新订阅者加入，当前订阅者数量: ${this.eventSubscribers.size}`);
    
    // 返回取消订阅函数
    return () => {
      this.eventSubscribers.delete(callback);
      console.log(`📡 订阅者离开，当前订阅者数量: ${this.eventSubscribers.size}`);
    };
  }

  /**
   * 启动世界心跳
   */
  startHeartbeat(intervalMs: number = 1000): void {
    if (this.heartbeatInterval) {
      console.log('⚠️ 世界心跳已在运行');
      return;
    }

    console.log(`💓 启动世界心跳，间隔: ${intervalMs}ms`);
    
    this.heartbeatInterval = setInterval(() => {
      this.worldTick();
    }, intervalMs);
  }

  /**
   * 停止世界心跳
   */
  stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
      console.log('💓 世界心跳已停止');
    }
  }

  /**
   * 世界心跳逻辑 - 每一次心跳的核心处理
   */
  private async worldTick(): Promise<void> {
    const now = Date.now();
    this.worldState.tick_count++;
    this.worldState.last_tick = now;

    console.log(`💓 世界心跳 #${this.worldState.tick_count}`);

    try {
      // 1. 更新所有角色的内在状态
      this.updateAllCharacterStates(now);

      // 2. 处理行动队列
      this.processActionQueue(now);

      // 3. 检查AI自主决策
      await this.processAIAutonomousDecisions(now);

      // 4. 清理过期数据
      this.cleanupExpiredData(now);

    } catch (error) {
      console.error('世界心跳处理错误:', error);
    }
  }

  /**
   * 更新所有角色的内在状态
   */
  private updateAllCharacterStates(now: number): void {
    this.worldState.characters.forEach((character, characterId) => {
      if (character.type !== 'PLAYER') {
        this.updateCharacterInternalState(character, now);
      }
    });
  }

  /**
   * 更新单个角色的内在状态
   */
  private updateCharacterInternalState(character: CharacterState, now: number): void {
    const timeSinceLastActivity = now - character.internal_state.lastActivity;
    const minutesSinceActivity = timeSinceLastActivity / (1000 * 60);

    // 状态自然衰减/增长规律
    const state = character.internal_state;
    
    // 无聊值随时间增长
    state.boredom = Math.min(100, state.boredom + minutesSinceActivity * 2);
    
    // 能量值缓慢恢复
    if (state.energy < 80) {
      state.energy = Math.min(100, state.energy + minutesSinceActivity * 0.5);
    }
    
    // 专注度随时间衰减
    if (state.focus > 20) {
      state.focus = Math.max(0, state.focus - minutesSinceActivity * 1);
    }
    
    // 好奇心波动
    if (minutesSinceActivity > 5) { // 5分钟没活动，好奇心增长
      state.curiosity = Math.min(100, state.curiosity + minutesSinceActivity * 0.3);
    }

    // 更新最后活动时间
    state.lastActivity = now;
  }

  /**
   * 处理行动队列
   */
  private processActionQueue(now: number): void {
    this.worldState.action_queue = this.worldState.action_queue.filter(action => {
      if (now >= action.start_time + action.duration) {
        // 动作完成
        console.log(`✅ 动作完成: ${action.character_id} - ${action.description}`);
        
        if (action.completion_callback) {
          action.completion_callback();
        }
        
        return false; // 从队列中移除
      }
      return true; // 保留在队列中
    });
  }

  /**
   * 处理AI自主决策 - 世界心跳的核心逻辑
   */
  private async processAIAutonomousDecisions(now: number): Promise<void> {
    // 获取所有AI角色
    const aiCharacters = Array.from(this.worldState.characters.values())
      .filter(char => char.type === 'CORE_AI' || char.type === 'SYSTEM_AI');

    for (const character of aiCharacters) {
      // 相关性过滤器：大部分情况下不需要调用LLM
      if (!this.shouldAIConsiderAction(character, now)) {
        continue;
      }

      console.log(`🤖 ${character.name} 开始自主决策...`);
      
      try {
        const decision = await this.makeAIDecision(character, now);
        await this.executeAIDecision(character, decision, now);
      } catch (error) {
        console.error(`AI决策错误 (${character.name}):`, error);
      }
    }
  }

  /**
   * 🔧 重构：智能行动过滤器 - 实现boredom主动性驱动器
   */
  private shouldAIConsiderAction(character: CharacterState, now: number): boolean {
    const state = character.internal_state;
    
    // 🔧 跳过系统AI，它只通过动态角色系统工作
    if (character.type === 'SYSTEM_AI') {
      return false;
    }
    
    // 🔧 第一优先级：无聊值驱动的主动性（boredom主动性驱动器）
    if (state.boredom > 75) {
      console.log(`😴 ${character.name} 极度无聊 (${state.boredom})，强烈需要主动行动`);
      return true; // 无聊值>75时，必须行动
    }
    
    if (state.boredom > 60 && Math.random() < 0.7) {
      console.log(`😴 ${character.name} 很无聊 (${state.boredom})，70%概率主动行动`);
      return true;
    }
    
    if (state.boredom > 45 && Math.random() < 0.3) {
      console.log(`😴 ${character.name} 有些无聊 (${state.boredom})，30%概率主动行动`);
      return true;
    }
    
    // 🔧 第二优先级：沉默时间驱动（防止AI永远沉默）
    const timeSinceLastSpeech = character.last_speech_time 
      ? now - character.last_speech_time 
      : Number.MAX_SAFE_INTEGER;
    
    if (timeSinceLastSpeech > 300000) { // 5分钟没说话
      console.log(`🤐 ${character.name} 沉默超过5分钟，需要打破沉默`);
      if (Math.random() < 0.4) return true; // 40%概率
    }
    
    // 🔧 第三优先级：高能量+高好奇心的探索行为
    if (state.curiosity > 70 && state.energy > 60) {
      console.log(`🔍 ${character.name} 高好奇心+高能量，考虑探索行动`);
      if (Math.random() < 0.3) return true; // 30%概率
    }
    
    // 🔧 第四优先级：对最近事件的智能响应（大幅减少）
    const recentEvents = this.worldState.scene_events
      .filter(event => now - event.timestamp < 30000) // 缩短到30秒
      .filter(event => event.speaker_id !== character.id) // 不是自己的发言
      .filter(event => event.type === 'dialogue'); // 只关注对话
    
    if (recentEvents.length > 0 && state.focus > 40) {
      console.log(`👂 ${character.name} 对最近对话感兴趣，考虑回应`);
      if (Math.random() < 0.15) return true; // 从无条件降到15%概率
    }
    
    // 🔧 第五优先级：极低随机触发（应急机制）
    if (Math.random() < 0.02) { // 从15%大幅降到2%
      console.log(`🎲 ${character.name} 极低概率随机触发`);
      return true;
    }
    
    // 🔧 默认：保持沉默（AI应该大部分时间安静）
    return false;
  }

  /**
   * 执行AI决策（使用LLM）
   */
  private async makeAIDecision(character: CharacterState, now: number): Promise<AIDecisionResult> {
    // 导入AI决策引擎
    const { AIDecisionEngine } = await import('./ai-decision-engine');
    
    // 构建决策上下文
    const timeSinceLastSpeech = character.last_speech_time 
      ? now - character.last_speech_time 
      : Number.MAX_SAFE_INTEGER; // 如果从未发言，设为最大值

    const context = {
      character,
      recentEvents: this.getRecentEvents(10), // 最近10个事件
      tickCount: this.worldState.tick_count,
      timeSinceLastSpeech,
      otherCharacters: Array.from(this.worldState.characters.values())
        .filter(char => char.id !== character.id),
      // TODO: 在后续实现中添加 forceCharacter 支持
    };

    return await AIDecisionEngine.makeDecision(context);
  }

  /**
   * 执行AI决策结果
   */
  private async executeAIDecision(character: CharacterState, decision: AIDecisionResult, now: number): Promise<void> {
    if (!decision.should_act) return;

    // 更新角色内在状态
    if (decision.emotion_change) {
      Object.assign(character.internal_state, decision.emotion_change);
    }

    // 发布对话事件
    if (decision.dialogue) {
      this.publishEvent({
        id: `ai_speech_${character.id}_${now}`,
        type: 'dialogue',
        speaker_id: character.id,
        content: decision.dialogue,
        timestamp: now,
        is_autonomous: true,
      });
    }

    // 发布行动事件
    if (decision.action) {
      this.publishEvent({
        id: `ai_action_${character.id}_${now}`,
        type: 'action',
        speaker_id: character.id,
        content: decision.action,
        timestamp: now,
        is_autonomous: true,
      });
    }

    // 记录内心想法到日志（不对玩家可见）
    if (decision.internal_thought) {
      console.log(`💭 ${character.name} 内心想法: ${decision.internal_thought}`);
    }

    // 重置相关状态
    character.internal_state.boredom = Math.max(0, character.internal_state.boredom - 30);
    character.internal_state.lastActivity = now;
    character.last_speech_time = now;
  }

  /**
   * 清理过期数据
   */
  private cleanupExpiredData(now: number): void {
    // 清理超过1小时的旧事件
    const oneHourAgo = now - (60 * 60 * 1000);
    this.worldState.scene_events = this.worldState.scene_events
      .filter(event => event.timestamp > oneHourAgo);
  }

  /**
   * 获取世界状态（只读）
   */
  getWorldState(): Readonly<WorldState> {
    return this.worldState;
  }

  /**
   * 获取最近的场景事件
   */
  getRecentEvents(limit: number = 50): SceneEvent[] {
    return this.worldState.scene_events.slice(-limit);
  }

  /**
   * 🔧 修复：销毁世界引擎 - 适配新的单例模式
   */
  destroy(): void {
    this.stopHeartbeat();
    this.eventSubscribers.clear();
    
    // 🔧 修复：清理单例引用
    if (WorldEngine.instance === this) {
      WorldEngine.instance = null;
    }
    
    console.log(`🌍 世界引擎已销毁: ${this.worldState.scene_id}`);
  }
}

/**
 * 创建默认的角色内在状态
 */
export function createDefaultInternalState(): InternalState {
  return {
    energy: 60 + Math.random() * 20, // 60-80 随机起始值
    focus: 40 + Math.random() * 20,  // 40-60 随机起始值
    curiosity: 50 + Math.random() * 30, // 50-80 随机起始值
    boredom: 10 + Math.random() * 20,   // 10-30 随机起始值
    lastActivity: Date.now(),
  };
}

/**
 * 创建角色状态
 */
export function createCharacterState(
  id: string, 
  name: string, 
  type: 'CORE_AI' | 'SYSTEM_AI' | 'PLAYER'
): CharacterState {
  return {
    id,
    name,
    type,
    internal_state: createDefaultInternalState(),
    is_online: true,
    current_emotion: type === 'PLAYER' ? undefined : 'neutral',
  };
}