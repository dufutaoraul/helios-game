/**
 * 赫利俄斯项目 - 核心类型定义
 * 
 * 本文件定义了整个游戏系统的核心数据结构，包括：
 * - 角色系统（Character System）
 * - 信念系统（Belief System）
 * - 事件系统（Event System）  
 * - 频道模拟系统（Channel Simulation System）
 */

// ===========================================
// 频道模拟系统 - 三类可观测信息
// ===========================================

/**
 * 公开的语言对话
 * 任何角色说出的话都会被记录为这种类型
 */
export interface DialogueMessage {
  type: 'dialogue';
  character: string;
  content: string;
  timestamp: number;
  scene_id: string;
}

/**
 * 可观测的非语言行为
 * 角色的动作、表情、姿态等外在表现
 */
export interface ActionMessage {
  type: 'action';
  character: string;
  description: string;
  timestamp: number;
  scene_id: string;
}

/**
 * 公共的环境事件
 * 影响所有在场角色的环境变化
 */
export interface EnvironmentMessage {
  type: 'environment';
  description: string;
  timestamp: number;
  scene_id: string;
  affected_characters?: string[];
}

/**
 * 频道中的所有消息类型联合
 */
export type ChannelMessage = DialogueMessage | ActionMessage | EnvironmentMessage;

// ===========================================
// AI NPC 私有内在状态系统
// ===========================================

/**
 * AI NPC的私有内在状态
 * 这个对象绝对不能被其他AI直接访问
 * 只能通过decisionLogic函数来影响行为
 */
export interface InternalState {
  /** 能量水平 (0-10) */
  energy: number;
  /** 专注度 (0-10) */
  focus: number;
  /** 好奇心 (0-10) */
  curiosity: number;
  /** 上次更新时间 */
  lastUpdated: number;
}

// ===========================================
// 角色系统
// ===========================================

/**
 * 角色类型：人类玩家 vs AI NPC
 */
export type CharacterType = 'human_player' | 'ai_npc';

/**
 * 角色基础信息
 */
export interface Character {
  id: string;
  name: string;
  role: string;
  core_motivation: string;
  type: CharacterType;
  /** 是否当前在线 */
  is_online: boolean;
  /** 当前所在场景 */
  current_scene?: string;
  /** 创建时间 */
  created_at: number;
}

// ===========================================
// 信念系统（动态生成）
// ===========================================

/**
 * 世界观信念
 */
export interface WorldviewBelief {
  description: string;
  weight: number; // 0-1之间，表示信念强度
  evidence_count: number; // 支持此信念的证据数量
}

/**
 * 自我认知信念
 */
export interface SelfviewBelief {
  description: string;
  weight: number;
  evidence_count: number;
}

/**
 * 价值观信念
 */
export interface ValueBelief {
  description: string;
  weight: number;
  evidence_count: number;
}

/**
 * 完整的信念系统
 * 由"信念观察者"动态生成和更新
 */
export interface BeliefSystem {
  character_id: string;
  worldview: WorldviewBelief[];
  selfview: SelfviewBelief[];
  values: ValueBelief[];
  /** 信念系统最后更新时间 */
  last_updated: number;
  /** 基于多少条行为记录生成 */
  based_on_logs_count: number;
}

// ===========================================
// 事件系统
// ===========================================

/**
 * 事件类型
 */
export type EventType = 
  | 'dialogue'           // 对话事件
  | 'action'             // 行动事件
  | 'environment'        // 环境事件
  | 'catalyst.dissonance' // 认知失调催化剂
  | 'catalyst.tension'   // 世界张力催化剂
  | 'system.notification'; // 系统通知

/**
 * 游戏事件
 */
export interface GameEvent {
  id: string;
  type: EventType;
  timestamp: number;
  scene_id: string;
  /** 事件发起者 */
  initiator?: string;
  /** 事件目标 */
  target?: string;
  /** 事件载荷数据 */
  payload: Record<string, any>;
  /** 是否已处理 */
  processed: boolean;
}

// ===========================================
// 场景系统
// ===========================================

/**
 * 游戏场景
 */
export interface Scene {
  id: string;
  name: string;
  description: string;
  /** 当前在场的角色ID列表 */
  present_characters: string[];
  /** 场景状态 */
  state: Record<string, any>;
  /** 创建时间 */
  created_at: number;
  /** 最后活动时间 */
  last_activity: number;
}

// ===========================================
// 代理日志系统
// ===========================================

/**
 * 代理行为日志
 * 记录每一次有意义的交互
 */
export interface AgentLog {
  id: string;
  timestamp: number;
  character_id: string;
  scene_id: string;
  action_type: string;
  /** 输入内容 */
  input: string;
  /** 输出结果 */
  output: string;
  /** 行动时的信念快照 */
  belief_snapshot?: Partial<BeliefSystem>;
  /** 内在状态快照（仅AI NPC） */
  internal_state_snapshot?: InternalState;
}

// ===========================================
// API 请求/响应类型
// ===========================================

/**
 * AI决策请求
 */
export interface DecisionRequest {
  character_id: string;
  scene_events: ChannelMessage[];
  current_scene: Scene;
  timeout_ms?: number;
}

/**
 * AI决策响应
 */
export interface DecisionResponse {
  character_id: string;
  decision: ChannelMessage;
  reasoning?: string;
  internal_state_update?: Partial<InternalState>;
  confidence: number; // 0-1之间
}

// ===========================================
// 错误类型
// ===========================================

export interface HeliosError {
  code: string;
  message: string;
  details?: Record<string, any>;
}