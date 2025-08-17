/**
 * 赫利俄斯项目 - 统一配置管理
 * 
 * 本文件集中管理所有的环境变量和配置项，确保配置的一致性和安全性。
 * 
 * 配置优先级：
 * 1. 环境变量 (process.env)
 * 2. .env.local 文件
 * 3. 默认值
 * 
 * 安全说明：
 * - 敏感信息（如API密钥）仅通过环境变量提供
 * - 本地开发时使用.env.local文件
 * - 生产环境通过Vercel环境变量自动注入
 */

/**
 * 环境类型
 */
export type Environment = 'development' | 'production' | 'test';

/**
 * 应用配置接口
 */
interface AppConfig {
  /** 当前环境 */
  environment: Environment;
  /** 是否为开发模式 */
  isDevelopment: boolean;
  /** 是否为生产模式 */
  isProduction: boolean;
  /** 调试模式 */
  debugMode: boolean;
  /** 日志级别 */
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * AI服务配置接口
 */
interface AIConfig {
  /** Vercel AI Gateway配置 */
  vercelAI: {
    apiKey: string;
    baseURL: string;
  };
  /** DeepSeek API配置 */
  deepSeek: {
    apiKey: string;
    baseURL: string;
    model: string;
    timeout: number;
    maxRetries: number;
  };
}

/**
 * 数据库配置接口
 */
interface DatabaseConfig {
  /** Supabase配置 */
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  };
  /** Zep记忆引擎配置 */
  zep: {
    apiURL: string;
    apiKey: string;
  };
}

/**
 * 游戏世界配置接口
 */
interface GameConfig {
  /** 模拟速度 */
  simulationSpeed: number;
  /** 默认决策超时时间（毫秒） */
  defaultDecisionTimeout: number;
  /** 最大并发决策数 */
  maxConcurrentDecisions: number;
  /** 状态更新间隔（毫秒） */
  stateUpdateInterval: number;
  /** 消息历史保留时间（小时） */
  messageRetentionHours: number;
}

/**
 * 完整配置接口
 */
interface Config {
  app: AppConfig;
  ai: AIConfig;
  database: DatabaseConfig;
  game: GameConfig;
}

/**
 * 获取环境变量，如果不存在则返回默认值
 */
function getEnvVar(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

/**
 * 获取数字类型的环境变量
 */
function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
}

/**
 * 获取布尔类型的环境变量
 */
function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * 创建配置对象
 */
function createConfig(): Config {
  const environment = (getEnvVar('NODE_ENV', 'development') as Environment);
  const isDevelopment = environment === 'development';
  const isProduction = environment === 'production';

  return {
    app: {
      environment,
      isDevelopment,
      isProduction,
      debugMode: getEnvBoolean('DEBUG_MODE', isDevelopment),
      logLevel: (getEnvVar('LOG_LEVEL', 'info') as any) || 'info'
    },

    ai: {
      vercelAI: {
        // Vercel AI Gateway API密钥
        // 生产环境中由Vercel自动管理
        apiKey: getEnvVar('AI_GATEWAY_API_KEY', 'your_ai_gateway_api_key'),
        baseURL: getEnvVar('AI_GATEWAY_BASE_URL', 'https://api.vercel.com/v1/ai')
      },
      deepSeek: {
        // DeepSeek API密钥
        // 本地开发使用，云端部署时会被自动替换
        apiKey: getEnvVar('DEEPSEEK_API_KEY', 'your_deepseek_api_key_here'),
        baseURL: getEnvVar('DEEPSEEK_BASE_URL', 'https://api.deepseek.com'),
        model: getEnvVar('DEEPSEEK_MODEL', 'deepseek-chat'),
        timeout: getEnvNumber('DEEPSEEK_TIMEOUT', 30000),
        maxRetries: getEnvNumber('DEEPSEEK_MAX_RETRIES', 3)
      }
    },

    database: {
      supabase: {
        // Supabase配置
        // 注意：ANON_KEY是公开的，SERVICE_ROLE_KEY是敏感的
        url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL', 'your_supabase_project_url'),
        anonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'your_supabase_anon_key'),
        serviceRoleKey: getEnvVar('SUPABASE_SERVICE_ROLE_KEY', 'your_supabase_service_role_key')
      },
      zep: {
        // Zep记忆引擎配置
        apiURL: getEnvVar('ZEP_API_URL', 'your_zep_api_url'),
        apiKey: getEnvVar('ZEP_API_KEY', 'your_zep_api_key')
      }
    },

    game: {
      simulationSpeed: getEnvNumber('WORLD_SIMULATION_SPEED', 1),
      defaultDecisionTimeout: getEnvNumber('DEFAULT_DECISION_TIMEOUT', 30000),
      maxConcurrentDecisions: getEnvNumber('MAX_CONCURRENT_DECISIONS', 10),
      stateUpdateInterval: getEnvNumber('STATE_UPDATE_INTERVAL', 5000),
      messageRetentionHours: getEnvNumber('MESSAGE_RETENTION_HOURS', 24)
    }
  };
}

/**
 * 验证必需的配置项
 */
function validateConfig(config: Config): void {
  const errors: string[] = [];

  // 检查生产环境必需的配置
  if (config.app.isProduction) {
    if (config.ai.deepSeek.apiKey === 'your_deepseek_api_key_here') {
      errors.push('生产环境中DeepSeek API密钥未配置');
    }
    if (config.database.supabase.url === 'your_supabase_project_url') {
      errors.push('生产环境中Supabase URL未配置');
    }
    if (config.database.supabase.serviceRoleKey === 'your_supabase_service_role_key') {
      errors.push('生产环境中Supabase服务角色密钥未配置');
    }
  }

  if (errors.length > 0) {
    throw new Error(`配置验证失败:\n${errors.join('\n')}`);
  }
}

/**
 * 创建并验证配置
 */
const config = createConfig();

// 在非测试环境中验证配置
if (config.app.environment !== 'test') {
  try {
    validateConfig(config);
    console.log(`✅ 配置验证通过 (环境: ${config.app.environment})`);
  } catch (error) {
    console.error('❌ 配置验证失败:', error);
    if (config.app.isProduction) {
      // 生产环境中，配置错误应该导致应用启动失败
      process.exit(1);
    }
  }
}

/**
 * 导出配置
 */
export default config;

/**
 * 便捷的配置访问器
 */
export const {
  app: appConfig,
  ai: aiConfig,
  database: dbConfig,
  game: gameConfig
} = config;

/**
 * 获取配置摘要（不包含敏感信息）
 */
export function getConfigSummary(): Record<string, any> {
  return {
    environment: config.app.environment,
    debugMode: config.app.debugMode,
    logLevel: config.app.logLevel,
    deepSeekModel: config.ai.deepSeek.model,
    simulationSpeed: config.game.simulationSpeed,
    decisionTimeout: config.game.defaultDecisionTimeout,
    // 注意：不包含API密钥等敏感信息
    hasDeepSeekKey: config.ai.deepSeek.apiKey !== 'your_deepseek_api_key_here',
    hasSupabaseConfig: config.database.supabase.url !== 'your_supabase_project_url'
  };
}

/**
 * 运行时配置检查
 */
export function checkRuntimeConfig(): void {
  const summary = getConfigSummary();
  
  console.log('🔧 运行时配置检查:');
  console.log(`   环境: ${summary.environment}`);
  console.log(`   调试模式: ${summary.debugMode}`);
  console.log(`   DeepSeek API: ${summary.hasDeepSeekKey ? '✅ 已配置' : '❌ 未配置'}`);
  console.log(`   Supabase: ${summary.hasSupabaseConfig ? '✅ 已配置' : '❌ 未配置'}`);
  
  if (!summary.hasDeepSeekKey) {
    console.warn('⚠️ DeepSeek API密钥未配置，将使用模拟模式');
  }
  
  if (!summary.hasSupabaseConfig) {
    console.warn('⚠️ Supabase配置未完整，数据持久化功能将受限');
  }
}