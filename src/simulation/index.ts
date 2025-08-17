/**
 * 频道模拟系统 - 统一导出
 * 
 * 这个文件提供了整个频道模拟系统的统一访问接口。
 * 外部模块应该通过这个文件来导入所需的类和函数。
 */

// 核心管理器
export { ChannelManager, ChannelSubscriber, globalChannelManager } from './ChannelManager';

// 工具函数
export {
  formatMessage,
  formatAsNarrative,
  analyzeCharacterBehavior,
  detectCognitiveDissonance,
  generateSceneSummary
} from './ChannelUtils';

// 示例和测试
export { runChannelSimulationExample } from './ChannelExample';

// 重新导出相关类型
export type {
  ChannelMessage,
  DialogueMessage,
  ActionMessage,
  EnvironmentMessage
} from '../types';