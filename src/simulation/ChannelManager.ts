/**
 * 频道模拟系统 - 核心管理器
 * 
 * 此系统负责管理游戏世界中所有可被外部观测的信息流。
 * 它是整个游戏世界"现实"的记录者和广播者。
 * 
 * 设计哲学：
 * - 只记录"可观测"的信息，内在状态不进入频道
 * - 所有事件都有明确的时间戳和来源
 * - 支持实时订阅和历史查询
 * - 为信念观察者提供行为分析的原始数据
 */

import { 
  ChannelMessage, 
  DialogueMessage, 
  ActionMessage, 
  EnvironmentMessage,
  Scene 
} from '../types';

/**
 * 频道订阅者接口
 * 任何需要接收频道消息的组件都需要实现此接口
 */
export interface ChannelSubscriber {
  /** 订阅者唯一标识 */
  id: string;
  /** 处理接收到的消息 */
  onMessage(message: ChannelMessage): void;
  /** 可选：只订阅特定场景的消息 */
  sceneFilter?: string;
  /** 可选：只订阅特定类型的消息 */
  typeFilter?: ChannelMessage['type'][];
}

/**
 * 频道管理器
 * 
 * 这是整个频道模拟系统的中央调度器。它管理着游戏世界中
 * 所有"可见"事件的流动，确保每个重要时刻都被准确记录
 * 并及时广播给所有需要知道的"观察者"。
 */
export class ChannelManager {
  /** 消息历史记录 - 按场景分组存储 */
  private messageHistory: Map<string, ChannelMessage[]> = new Map();
  
  /** 活跃的订阅者列表 */
  private subscribers: Map<string, ChannelSubscriber> = new Map();
  
  /** 消息计数器，用于生成唯一ID */
  private messageCounter: number = 0;

  constructor() {
    console.log('🎭 频道管理器已启动 - 开始记录世界的每一个时刻');
  }

  /**
   * 发布公开的语言对话
   * 
   * 当任何角色说话时，都会通过此方法记录。这些话语将成为
   * 其他角色了解世界、形成印象、做出判断的重要信息来源。
   * 
   * @param character 说话者的名字
   * @param content 说话内容
   * @param sceneId 发生对话的场景ID
   */
  publishDialogue(character: string, content: string, sceneId: string): DialogueMessage {
    const message: DialogueMessage = {
      type: 'dialogue',
      character,
      content,
      timestamp: Date.now(),
      scene_id: sceneId
    };

    this.recordAndBroadcast(message);
    
    console.log(`🗣️ [${character}]: "${content}"`);
    return message;
  }

  /**
   * 发布可观测的非语言行为
   * 
   * 记录角色的动作、表情、姿态等外在表现。这些细节虽然不是
   * 语言，但往往比话语更能透露一个角色的真实意图和内心状态。
   * 
   * @param character 行动者的名字
   * @param description 行为描述
   * @param sceneId 发生行为的场景ID
   */
  publishAction(character: string, description: string, sceneId: string): ActionMessage {
    const message: ActionMessage = {
      type: 'action',
      character,
      description,
      timestamp: Date.now(),
      scene_id: sceneId
    };

    this.recordAndBroadcast(message);
    
    console.log(`🎬 [${character}] ${description}`);
    return message;
  }

  /**
   * 发布公共的环境事件
   * 
   * 记录影响所有在场角色的环境变化。这些事件构成了游戏世界
   * 的"共同现实"，是所有角色都必须面对和适应的客观条件。
   * 
   * @param description 环境变化描述
   * @param sceneId 发生变化的场景ID
   * @param affectedCharacters 受影响的角色列表（可选）
   */
  publishEnvironment(description: string, sceneId: string, affectedCharacters?: string[]): EnvironmentMessage {
    const message: EnvironmentMessage = {
      type: 'environment',
      description,
      timestamp: Date.now(),
      scene_id: sceneId,
      affected_characters: affectedCharacters
    };

    this.recordAndBroadcast(message);
    
    const affectedInfo = affectedCharacters ? 
      ` (影响: ${affectedCharacters.join(', ')})` : '';
    console.log(`🌍 环境变化: ${description}${affectedInfo}`);
    
    return message;
  }

  /**
   * 添加频道订阅者
   * 
   * @param subscriber 订阅者对象
   */
  subscribe(subscriber: ChannelSubscriber): void {
    this.subscribers.set(subscriber.id, subscriber);
    console.log(`📡 新订阅者加入: ${subscriber.id}`);
  }

  /**
   * 移除频道订阅者
   * 
   * @param subscriberId 订阅者ID
   */
  unsubscribe(subscriberId: string): void {
    this.subscribers.delete(subscriberId);
    console.log(`📡 订阅者离开: ${subscriberId}`);
  }

  /**
   * 获取指定场景的消息历史
   * 
   * @param sceneId 场景ID
   * @param limit 最大返回数量（可选）
   * @param since 时间戳，只返回此时间之后的消息（可选）
   */
  getSceneHistory(sceneId: string, limit?: number, since?: number): ChannelMessage[] {
    const messages = this.messageHistory.get(sceneId) || [];
    
    let filtered = messages;
    if (since) {
      filtered = messages.filter(msg => msg.timestamp > since);
    }
    
    if (limit) {
      filtered = filtered.slice(-limit);
    }
    
    return filtered;
  }

  /**
   * 获取指定角色的行为记录
   * 
   * 这个方法主要用于"信念观察者"分析角色行为模式
   * 
   * @param characterId 角色ID
   * @param sceneId 场景ID（可选，如果指定则只返回该场景的记录）
   * @param messageTypes 消息类型过滤（可选）
   */
  getCharacterActions(
    characterId: string, 
    sceneId?: string,
    messageTypes?: ChannelMessage['type'][]
  ): ChannelMessage[] {
    const allMessages: ChannelMessage[] = [];
    
    // 收集所有相关消息
    for (const [scene, messages] of this.messageHistory) {
      if (sceneId && scene !== sceneId) continue;
      
      const characterMessages = messages.filter(msg => {
        // 检查是否是该角色的消息
        const isCharacterMessage = (msg.type === 'dialogue' || msg.type === 'action') && 
                                  (msg as DialogueMessage | ActionMessage).character === characterId;
        
        // 应用类型过滤
        if (messageTypes && !messageTypes.includes(msg.type)) {
          return false;
        }
        
        return isCharacterMessage;
      });
      
      allMessages.push(...characterMessages);
    }
    
    // 按时间排序
    return allMessages.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * 获取所有活跃场景的统计信息
   */
  getChannelStats(): Record<string, any> {
    const stats: Record<string, any> = {
      totalScenes: this.messageHistory.size,
      totalSubscribers: this.subscribers.size,
      messagesByScene: {},
      messagesByType: {
        dialogue: 0,
        action: 0,
        environment: 0
      }
    };

    for (const [sceneId, messages] of this.messageHistory) {
      stats.messagesByScene[sceneId] = messages.length;
      
      messages.forEach(msg => {
        stats.messagesByType[msg.type]++;
      });
    }

    return stats;
  }

  /**
   * 私有方法：记录消息并广播给订阅者
   */
  private recordAndBroadcast(message: ChannelMessage): void {
    // 记录到历史
    const sceneMessages = this.messageHistory.get(message.scene_id) || [];
    sceneMessages.push(message);
    this.messageHistory.set(message.scene_id, sceneMessages);

    // 广播给订阅者
    for (const subscriber of this.subscribers.values()) {
      // 检查场景过滤
      if (subscriber.sceneFilter && subscriber.sceneFilter !== message.scene_id) {
        continue;
      }

      // 检查类型过滤
      if (subscriber.typeFilter && !subscriber.typeFilter.includes(message.type)) {
        continue;
      }

      // 安全地调用订阅者的处理方法
      try {
        subscriber.onMessage(message);
      } catch (error) {
        console.error(`❌ 订阅者 ${subscriber.id} 处理消息时出错:`, error);
      }
    }

    this.messageCounter++;
  }

  /**
   * 清理旧消息以节省内存
   * 
   * @param olderThanMs 清理多久之前的消息（毫秒）
   * @param keepMinimum 每个场景至少保留的消息数量
   */
  cleanupOldMessages(olderThanMs: number = 24 * 60 * 60 * 1000, keepMinimum: number = 50): void {
    const cutoffTime = Date.now() - olderThanMs;
    let totalCleaned = 0;

    for (const [sceneId, messages] of this.messageHistory) {
      const originalLength = messages.length;
      
      // 保留新消息和最小数量的消息
      const filteredMessages = messages.filter((msg, index) => {
        return msg.timestamp > cutoffTime || index >= originalLength - keepMinimum;
      });

      this.messageHistory.set(sceneId, filteredMessages);
      totalCleaned += originalLength - filteredMessages.length;
    }

    if (totalCleaned > 0) {
      console.log(`🧹 已清理 ${totalCleaned} 条旧消息`);
    }
  }
}

/**
 * 全局频道管理器实例
 * 
 * 在整个应用中，我们使用单例模式来确保所有组件
 * 都通过同一个频道管理器进行通信。这样可以保证
 * 消息的一致性和完整性。
 */
export const globalChannelManager = new ChannelManager();