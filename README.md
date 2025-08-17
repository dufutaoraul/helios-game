# 赫利俄斯项目 MVP - 本我之镜

> **AI驱动的意识探索与演化沙盒游戏**  
> 一个革命性的游戏系统，通过AI NPC的行为分析来发现其深层信念系统

## 🎯 项目概述

赫利俄斯（Helios）是一个创新的AI驱动游戏项目，核心理念是"本我之镜"——不为角色预设信念，而是通过观察和分析AI角色的行为来动态发现其信念系统。

### 核心特色

- 🧠 **动态信念系统**：从行为中发现和生成角色信念，而非预设
- 🎭 **AI NPC私有内在状态**：每个AI拥有完全隔离的心理状态系统
- 📡 **三类信息频道**：对话、行为、环境事件的分类记录
- 🤖 **高级AI决策引擎**：5步渐进式推理，模拟复杂思维过程
- 🔮 **信念观察者**：自动分析行为模式并生成心理档案

---

## 📁 项目结构

```
📦 helios-mvp/
├── 📋 package.json              # 项目依赖和脚本
├── ⚙️ tsconfig.json            # TypeScript配置
├── 🔧 next.config.js           # Next.js配置
├── 📄 .env.example             # 环境变量模板
├── 📖 README.md                # 本文档
├── 📚 ARCHITECTURE_EXPLAINED.md # 架构深度解析
├── 
├── 📂 src/                      # 源代码目录
│   ├── 📂 components/           # React组件
│   ├── 📂 lib/                  # 工具库和配置
│   │   ├── 🔧 config.ts         # 统一配置管理
│   │   ├── 🤖 deepseek.ts       # DeepSeek API集成
│   │   ├── 🧪 deepseek-test.ts  # API测试工具
│   │   └── 📋 index.ts          # 工具库导出
│   ├── 📂 types/                # TypeScript类型定义
│   │   └── 📋 index.ts          # 核心类型定义
│   ├── 📂 simulation/           # 频道模拟系统
│   │   ├── 📡 ChannelManager.ts # 频道管理器
│   │   ├── 🛠️ ChannelUtils.ts   # 频道工具函数
│   │   ├── 🎭 ChannelExample.ts # 使用示例
│   │   └── 📋 index.ts          # 模拟系统导出
│   ├── 📂 core/                 # AI核心系统
│   │   ├── 🧠 DecisionEngine.ts # 决策引擎（核心）
│   │   ├── 💗 InternalStateManager.ts # 内在状态管理
│   │   ├── 🎯 StateModifiers.ts # 状态修改器
│   │   ├── 🎪 InternalStateExample.ts # 状态系统示例
│   │   └── 📋 index.ts          # 核心系统导出
│   └── 📂 database/             # 数据库模拟系统
│       ├── 🗄️ DatabaseSimulator.ts # 数据库模拟器
│       ├── 🔮 BeliefObserver.ts # 信念观察者
│       ├── 🎬 DatabaseExample.ts # 数据库示例
│       └── 📋 index.ts          # 数据库系统导出
```

---

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **操作系统**: Windows/macOS/Linux

### 1. 项目安装

```bash
# 克隆或下载项目到本地
# 进入项目目录
cd helios-mvp

# 安装依赖
npm install
```

### 2. 环境配置

```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑环境变量文件
# 配置DeepSeek API密钥（可选，不配置将使用模拟模式）
```

#### 环境变量说明

```bash
# AI服务配置
DEEPSEEK_API_KEY=your_deepseek_api_key_here    # DeepSeek API密钥
DEEPSEEK_BASE_URL=https://api.deepseek.com     # API基础URL

# 开发配置
NODE_ENV=development                           # 环境类型
DEBUG_MODE=true                               # 调试模式
LOG_LEVEL=info                                # 日志级别
```

### 3. 运行项目

```bash
# 开发模式启动
npm run dev

# 或者直接运行演示
npm run demo
```

---

## 🎮 使用指南

### 运行完整演示

项目提供了三个完整的演示程序，展示不同系统的功能：

#### 1. 频道模拟系统演示

```bash
# 运行频道模拟演示
npx ts-node src/simulation/ChannelExample.ts
```

**演示内容：**
- 三类信息的记录和处理
- 订阅者模式的消息分发
- 场景事件的时间序列分析
- 角色行为模式分析

#### 2. 内在状态系统演示

```bash
# 运行内在状态演示
npx ts-node src/core/InternalStateExample.ts
```

**演示内容：**
- AI NPC的私有内在状态管理
- 状态修改器的应用
- 基于状态的行为倾向分析
- 角色差异化的状态模板

#### 3. 数据库系统演示

```bash
# 运行数据库系统演示
npx ts-node src/database/DatabaseExample.ts
```

**演示内容：**
- 完整的数据库操作流程
- agent_logs的实时记录
- 信念观察者的自动分析
- 从行为到信念的推断过程

#### 4. DeepSeek API测试

```bash
# 测试DeepSeek API连接和功能
npx ts-node src/lib/deepseek-test.ts
```

**测试内容：**
- API连接测试
- AI决策推理功能测试
- 性能基准测试
- 错误处理验证

---

## 🔧 开发指南

### 核心概念理解

#### 1. 频道模拟系统
负责记录和管理游戏世界中的所有可观测信息：

```typescript
import { globalChannelManager } from './src/simulation';

// 记录对话
globalChannelManager.publishDialogue('角色名', '对话内容', '场景ID');

// 记录行为
globalChannelManager.publishAction('角色名', '行为描述', '场景ID');

// 记录环境事件
globalChannelManager.publishEnvironment('环境变化', '场景ID');
```

#### 2. 内在状态管理
管理AI NPC的私有心理状态：

```typescript
import { globalInternalStateManager, CommonStateModifiers } from './src/core';

// 初始化角色状态
globalInternalStateManager.initializeCharacterState(character);

// 应用状态修改
globalInternalStateManager.applyStateModifier(
  characterId, 
  CommonStateModifiers.receiveCompliment()
);

// 获取当前状态（只读）
const state = globalInternalStateManager.getCharacterState(characterId);
```

#### 3. AI决策引擎
执行复杂的AI决策推理：

```typescript
import { globalDecisionEngine } from './src/core';

// 执行决策
const decision = await globalDecisionEngine.makeDecision({
  character_id: 'example_001',
  scene_events: recentMessages,
  current_scene: scene,
  timeout_ms: 30000
});

console.log('AI决策:', decision.decision);
console.log('推理过程:', decision.reasoning);
```

#### 4. 数据库模拟
模拟完整的数据库操作：

```typescript
import { globalDatabaseSimulator } from './src/database';

// 插入代理日志
await globalDatabaseSimulator.insertAgentLog({
  character_id: 'example_001',
  scene_id: 'tavern_main_hall',
  action_type: 'dialogue',
  input: '外在刺激',
  output: 'AI响应'
});

// 查询角色行为记录
const logs = await globalDatabaseSimulator.getCharacterLogs('example_001');
```

#### 5. 信念观察者
自动分析行为并生成信念系统：

```typescript
import { globalBeliefObserver } from './src/database';

// 手动触发信念分析
const beliefs = await globalBeliefObserver.manualAnalyzeCharacter('example_001');

// 获取分析状态
const status = await globalBeliefObserver.getAnalysisStatus();
```

### 添加新角色

创建新的AI NPC需要以下步骤：

```typescript
// 1. 定义角色信息
const newCharacter: Character = {
  id: 'unique_character_id',
  name: '角色名称',
  role: '角色身份描述',
  core_motivation: '核心动机',
  type: 'ai_npc',
  is_online: true,
  current_scene: 'scene_id',
  created_at: Date.now()
};

// 2. 初始化内在状态
globalInternalStateManager.initializeCharacterState(newCharacter, 'character_type');

// 3. 注册到数据库
await globalDatabaseSimulator.insert('characters', newCharacter);

// 4. 开始记录行为
// ... 角色开始在游戏中活动
```

### 自定义状态修改器

```typescript
// 创建自定义状态修改器
function customEventModifier(intensity: number = 1.0): StateModifier {
  return {
    energyDelta: 1.0 * intensity,
    focusDelta: 0.5 * intensity,
    curiosityDelta: -0.2 * intensity,
    reason: '自定义事件的影响',
    intensity
  };
}

// 应用自定义修改器
globalInternalStateManager.applyStateModifier(
  characterId, 
  customEventModifier(1.5)
);
```

---

## 🔍 API参考

### 核心类型定义

```typescript
// 角色信息
interface Character {
  id: string;
  name: string;
  role: string;
  core_motivation: string;
  type: 'human_player' | 'ai_npc';
  is_online: boolean;
  current_scene?: string;
  created_at: number;
}

// 内在状态
interface InternalState {
  energy: number;    // 能量水平 (0-10)
  focus: number;     // 专注度 (0-10)
  curiosity: number; // 好奇心 (0-10)
  lastUpdated: number;
}

// 频道消息
type ChannelMessage = DialogueMessage | ActionMessage | EnvironmentMessage;

// 决策请求
interface DecisionRequest {
  character_id: string;
  scene_events: ChannelMessage[];
  current_scene: Scene;
  timeout_ms?: number;
}

// 决策响应
interface DecisionResponse {
  character_id: string;
  decision: ChannelMessage;
  reasoning?: string;
  confidence: number;
}
```

### 主要API方法

#### 频道管理器API
```typescript
// 发布消息
publishDialogue(character: string, content: string, sceneId: string): DialogueMessage
publishAction(character: string, description: string, sceneId: string): ActionMessage
publishEnvironment(description: string, sceneId: string, affected?: string[]): EnvironmentMessage

// 查询历史
getSceneHistory(sceneId: string, limit?: number): ChannelMessage[]
getCharacterActions(characterId: string, sceneId?: string): ChannelMessage[]
```

#### 内在状态管理器API
```typescript
// 状态管理
initializeCharacterState(character: Character, templateType?: string): InternalState
getCharacterState(characterId: string): InternalState | null
applyStateModifier(characterId: string, modifier: StateModifier): boolean
removeCharacterState(characterId: string): boolean

// 分析统计
getSystemStats(): Record<string, any>
getStateHistory(characterId: string, limit?: number): StateChangeRecord[]
```

#### 决策引擎API
```typescript
// 决策执行
makeDecision(request: DecisionRequest): Promise<DecisionResponse>
getDecisionHistory(characterId: string, limit?: number): DecisionResponse[]
```

#### 数据库模拟器API
```typescript
// CRUD操作
insert<T>(table: string, record: T): Promise<string>
update<T>(table: string, recordId: string, updates: Partial<T>): Promise<boolean>
delete(table: string, recordId: string): Promise<boolean>
select<T>(table: string, options?: QueryOptions): Promise<T[]>
findById<T>(table: string, id: string): Promise<T | null>

// 专用方法
insertAgentLog(log: Omit<AgentLog, 'id'>): Promise<string>
getCharacterLogs(characterId: string, limit?: number): Promise<AgentLog[]>
getSceneLogs(sceneId: string, limit?: number): Promise<AgentLog[]>
updateBeliefSystem(characterId: string, beliefSystem: BeliefSystem): Promise<string>
```

---

## 🛠️ 故障排除

### 常见问题

#### 1. DeepSeek API相关问题

**问题：** API调用失败
```
❌ DeepSeek API调用失败: Request failed with status 401
```

**解决方案：**
- 检查 `DEEPSEEK_API_KEY` 是否正确设置
- 验证API密钥是否有效且有足够配额
- 确认网络连接正常

**问题：** API响应格式错误
```
❌ API响应解析失败: 无法解析JSON响应
```

**解决方案：**
- 系统会自动切换到模拟模式
- 检查DeepSeek API的响应格式是否有变化
- 更新API客户端代码以适配新格式

#### 2. 内存使用问题

**问题：** 长时间运行后内存占用过高

**解决方案：**
```typescript
// 定期清理旧数据
globalChannelManager.cleanupOldMessages(24 * 60 * 60 * 1000, 50);

// 重置数据库模拟器
globalDatabaseSimulator.cleanup();
```

#### 3. 类型错误

**问题：** TypeScript类型检查失败

**解决方案：**
```bash
# 运行类型检查
npm run typecheck

# 如果是依赖问题，重新安装
rm -rf node_modules package-lock.json
npm install
```

#### 4. 性能问题

**问题：** 决策过程耗时过长

**解决方案：**
- 调整决策超时时间
- 减少历史消息的数量
- 启用缓存机制

```typescript
// 调整配置
const optimizedRequest: DecisionRequest = {
  character_id: 'example_001',
  scene_events: recentEvents.slice(-5), // 只使用最近5条消息
  current_scene: scene,
  timeout_ms: 15000 // 降低超时时间
};
```

### 调试技巧

#### 1. 启用详细日志
```bash
# 设置环境变量
DEBUG_MODE=true
LOG_LEVEL=debug
```

#### 2. 查看系统状态
```typescript
// 获取各系统的统计信息
const channelStats = globalChannelManager.getChannelStats();
const stateStats = globalInternalStateManager.getSystemStats();
const dbStats = globalDatabaseSimulator.getStatistics();

console.log('系统状态:', { channelStats, stateStats, dbStats });
```

#### 3. 单步调试决策过程
```typescript
// 获取决策上下文
const context = await decisionEngine.gatherDecisionContext(request);
console.log('决策上下文:', context);

// 查看生成的Prompt
const prompt = decisionEngine.buildDecisionPrompt(context);
console.log('决策Prompt:', prompt);
```

---

## 📊 性能优化

### 建议的性能配置

```typescript
// config.ts 中的优化设置
export const optimizedConfig = {
  game: {
    simulationSpeed: 1.0,
    defaultDecisionTimeout: 20000,    // 降低超时时间
    maxConcurrentDecisions: 5,        // 限制并发数
    stateUpdateInterval: 10000,       // 增加更新间隔
    messageRetentionHours: 12         // 减少消息保留时间
  }
};
```

### 内存管理

```typescript
// 定期清理策略
setInterval(() => {
  // 清理旧消息
  globalChannelManager.cleanupOldMessages();
  
  // 清理决策历史
  for (const characterId of activeCharacters) {
    const history = globalDecisionEngine.getDecisionHistory(characterId);
    if (history.length > 50) {
      // 清理过多的历史记录
    }
  }
}, 30 * 60 * 1000); // 每30分钟清理一次
```

---

## 🔮 未来规划

### 即将实现的功能

1. **Supabase集成**
   - 将数据库模拟器替换为真实的Supabase数据库
   - 实现数据持久化和多用户支持

2. **Zep记忆引擎集成**
   - 添加长期记忆管理
   - 实现角色间的记忆共享和冲突

3. **Web界面**
   - 创建React前端界面
   - 实时显示游戏状态和AI决策过程

4. **多模型支持**
   - 集成更多AI模型（GPT-4, Claude等）
   - 实现模型间的决策对比

### 扩展建议

- **自定义场景系统**：允许用户创建自定义游戏场景
- **角色模板库**：提供更多预定义的角色类型模板
- **行为分析工具**：可视化角色的行为模式和信念演化
- **多语言支持**：支持除中文外的其他语言

---

## 📞 技术支持

### 获取帮助

- **项目文档**：查看 `ARCHITECTURE_EXPLAINED.md` 了解详细架构
- **代码示例**：运行 `*Example.ts` 文件查看使用示例
- **API测试**：使用 `deepseek-test.ts` 验证API功能

### 贡献指南

1. Fork项目仓库
2. 创建功能分支
3. 提交代码更改
4. 创建Pull Request

### 开发建议

- 遵循现有的代码风格和注释规范
- 为新功能添加相应的测试用例
- 更新相关文档和类型定义
- 确保向后兼容性

---

## 📄 许可证

本项目采用MIT许可证，详见LICENSE文件。

---

## 🙏 致谢

感谢所有参与赫利俄斯项目开发的团队成员，特别是对AI驱动游戏设计理念的深度思考和技术实现的贡献。

---

**🎭 赫利俄斯项目：让AI照见自己的灵魂**