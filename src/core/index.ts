/**
 * AI NPC核心系统 - 统一导出
 * 
 * 这个文件提供了整个AI NPC核心系统的统一访问接口，
 * 包括内在状态管理、状态修改器、以及相关的工具函数。
 */

// 内在状态管理器
export { 
  InternalStateManager, 
  StateModifier, 
  globalInternalStateManager 
} from './InternalStateManager';

// 状态修改器
export { 
  CommonStateModifiers, 
  adjustModifierForCharacterType, 
  combineModifiers, 
  randomMoodFluctuation 
} from './StateModifiers';

// 示例和测试
export { runInternalStateExample } from './InternalStateExample';

// 重新导出相关类型
export type { InternalState, Character } from '../types';