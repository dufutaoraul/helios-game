/**
 * 赫利俄斯项目 MVP - 主入口文件
 * 
 * 这个文件提供了整个项目的统一访问接口，
 * 方便外部使用和模块化开发。
 */

// 核心类型定义
export * from './types';

// 配置和工具库
export * from './lib';

// 频道模拟系统
export * from './simulation';

// AI核心系统
export * from './core';

// 数据库模拟系统
export * from './database';

// 便捷的导入别名
export {
  // 全局实例 - 频道系统
  globalChannelManager
} from './simulation';

export {
  // 全局实例 - 核心系统
  globalInternalStateManager,
  globalDecisionEngine
} from './core';

export {
  // 全局实例 - 数据库系统
  globalDatabaseSimulator,
  globalBeliefObserver
} from './database';

export {
  // 全局实例 - API客户端
  globalDeepSeekClient
} from './lib';

export {
  // 演示程序
  runChannelSimulationExample
} from './simulation/ChannelExample';

export {
  runInternalStateExample
} from './core/InternalStateExample';

export {
  runDatabaseDemo
} from './database/DatabaseExample';

export {
  runDeepSeekTestSuite
} from './lib/deepseek-test';

// 默认导出：项目信息
export default {
  name: 'Helios MVP',
  version: '1.0.0',
  description: 'AI驱动的意识探索与演化沙盒游戏',
  author: 'Mike & Team',
  
  // 快速启动方法
  async quickStart() {
    console.log('🎭 欢迎使用赫利俄斯项目 MVP！');
    console.log('📚 请运行以下命令查看演示：');
    console.log('   npm run demo          - 交互式演示菜单');
    console.log('   npm run demo:channel  - 频道模拟系统演示');
    console.log('   npm run demo:state    - 内在状态系统演示');
    console.log('   npm run demo:database - 数据库模拟系统演示');
    console.log('   npm run demo:api      - DeepSeek API测试');
    console.log('📖 详细文档请参考 README.md');
  }
};