/**
 * 工具库 - 统一导出
 * 
 * 这个文件提供了整个项目工具库的统一访问接口，
 * 包括配置管理、API客户端、测试工具等。
 */

// 配置管理
export { default as config, appConfig, aiConfig, dbConfig, gameConfig, getConfigSummary, checkRuntimeConfig } from './config';

// DeepSeek API集成
export { 
  DeepSeekClient, 
  globalDeepSeekClient, 
  generateAIDecision, 
  DecisionReasoningSchema 
} from './deepseek';

export type { DecisionReasoning } from './deepseek';

// 测试工具
export { 
  testDeepSeekConnection, 
  testAIDecisionReasoning, 
  runDeepSeekTestSuite, 
  benchmarkDeepSeekPerformance 
} from './deepseek-test';