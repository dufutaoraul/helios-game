/**
 * 信念观察者系统
 * 
 * 这是赫利俄斯项目的核心组件之一，负责分析AI角色的行为记录，
 * 从中推断和生成角色的信念系统。这个过程模拟了"从行为中发现信念"
 * 的哲学理念。
 * 
 * 工作原理：
 * 1. 监听agent_logs表的变化
 * 2. 当某个角色的行为记录达到阈值时触发分析
 * 3. 使用AI模型分析行为模式，生成信念系统
 * 4. 将生成的信念系统存储到belief_systems表
 */

import { globalDatabaseSimulator } from './DatabaseSimulator';
import { globalDeepSeekClient } from '../lib/deepseek';
import { AgentLog, BeliefSystem, WorldviewBelief, SelfviewBelief, ValueBelief } from '../types';
import { z } from 'zod';

/**
 * 信念分析结果的Schema
 * 用于验证AI生成的信念系统结构
 */
const BeliefAnalysisSchema = z.object({
  worldview: z.array(z.object({
    description: z.string(),
    weight: z.number().min(0).max(1),
    evidence_count: z.number().min(0)
  })),
  selfview: z.array(z.object({
    description: z.string(),
    weight: z.number().min(0).max(1),
    evidence_count: z.number().min(0)
  })),
  values: z.array(z.object({
    description: z.string(),
    weight: z.number().min(0).max(1),
    evidence_count: z.number().min(0)
  })),
  confidence: z.number().min(0).max(1),
  analysis_summary: z.string()
});

type BeliefAnalysisResult = z.infer<typeof BeliefAnalysisSchema>;

/**
 * 信念观察者配置
 */
interface BeliefObserverConfig {
  /** 触发分析的最小行为记录数 */
  minLogsForAnalysis: number;
  /** 触发重新分析的新增记录数 */
  reanalysisThreshold: number;
  /** 分析间隔（毫秒） */
  analysisInterval: number;
  /** 是否启用自动分析 */
  autoAnalysisEnabled: boolean;
}

/**
 * 信念观察者系统
 * 
 * 这个系统持续监控角色的行为，当积累足够的数据时，
 * 就会自动分析并生成或更新角色的信念系统。
 */
export class BeliefObserver {
  private config: BeliefObserverConfig;
  private characterLogCounts: Map<string, number> = new Map();
  private lastAnalysisTime: Map<string, number> = new Map();
  private analysisTimer?: NodeJS.Timer;

  constructor(config?: Partial<BeliefObserverConfig>) {
    this.config = {
      minLogsForAnalysis: 10,
      reanalysisThreshold: 20,
      analysisInterval: 30000, // 30秒
      autoAnalysisEnabled: true,
      ...config
    };

    console.log('🔮 信念观察者系统已启动');
    console.log(`📊 配置: 最小记录数=${this.config.minLogsForAnalysis}, 重分析阈值=${this.config.reanalysisThreshold}`);

    if (this.config.autoAnalysisEnabled) {
      this.startAutoAnalysis();
    }
  }

  /**
   * 启动自动分析定时器
   */
  private startAutoAnalysis(): void {
    this.analysisTimer = setInterval(() => {
      this.checkAndAnalyzeAll();
    }, this.config.analysisInterval);

    console.log(`⏰ 自动分析已启动，间隔 ${this.config.analysisInterval}ms`);
  }

  /**
   * 停止自动分析
   */
  stopAutoAnalysis(): void {
    if (this.analysisTimer) {
      clearInterval(this.analysisTimer);
      this.analysisTimer = undefined;
      console.log('⏹️ 自动分析已停止');
    }
  }

  /**
   * 检查并分析所有角色
   */
  private async checkAndAnalyzeAll(): Promise<void> {
    try {
      // 获取所有角色的行为记录统计
      const allLogs = await globalDatabaseSimulator.select('agent_logs');
      const characterStats: Map<string, number> = new Map();

      // 统计每个角色的记录数
      for (const log of allLogs) {
        const count = characterStats.get(log.character_id) || 0;
        characterStats.set(log.character_id, count + 1);
      }

      // 检查哪些角色需要分析
      for (const [characterId, currentCount] of characterStats) {
        const previousCount = this.characterLogCounts.get(characterId) || 0;
        const newLogsSinceLastCheck = currentCount - previousCount;

        // 更新记录数
        this.characterLogCounts.set(characterId, currentCount);

        // 判断是否需要分析
        if (await this.shouldAnalyzeCharacter(characterId, currentCount, newLogsSinceLastCheck)) {
          console.log(`🎯 检测到角色 ${characterId} 需要信念分析 (当前记录: ${currentCount}, 新增: ${newLogsSinceLastCheck})`);
          await this.analyzeCharacterBeliefs(characterId);
        }
      }

    } catch (error) {
      console.error('❌ 自动分析检查失败:', error);
    }
  }

  /**
   * 判断角色是否需要信念分析
   */
  private async shouldAnalyzeCharacter(
    characterId: string, 
    currentLogCount: number, 
    newLogsSinceLastCheck: number
  ): Promise<boolean> {
    // 检查是否达到最小记录数
    if (currentLogCount < this.config.minLogsForAnalysis) {
      return false;
    }

    // 检查是否已经有信念系统
    const existingBeliefs = await globalDatabaseSimulator.select('belief_systems', {
      where: [{ field: 'character_id', operator: '=', value: characterId }]
    });

    if (existingBeliefs.length === 0) {
      // 没有信念系统，需要创建
      return true;
    }

    // 有信念系统，检查是否需要更新
    const lastBelief = existingBeliefs[0];
    const logsSinceLastAnalysis = currentLogCount - (lastBelief.based_on_logs_count || 0);

    return logsSinceLastAnalysis >= this.config.reanalysisThreshold;
  }

  /**
   * 分析角色的信念系统
   */
  async analyzeCharacterBeliefs(characterId: string): Promise<BeliefSystem | null> {
    console.log(`\n🔮 开始分析角色 ${characterId} 的信念系统...`);

    try {
      // 1. 获取角色的所有行为记录
      const characterLogs = await globalDatabaseSimulator.getCharacterLogs(characterId);
      
      if (characterLogs.length < this.config.minLogsForAnalysis) {
        console.log(`⚠️ 角色 ${characterId} 的记录数不足 (${characterLogs.length}/${this.config.minLogsForAnalysis})`);
        return null;
      }

      // 2. 构建分析提示
      const analysisPrompt = this.buildBeliefAnalysisPrompt(characterId, characterLogs);

      // 3. 调用AI进行信念分析
      const beliefAnalysis = await this.performBeliefAnalysis(analysisPrompt);

      // 4. 构建信念系统对象
      const beliefSystem: Omit<BeliefSystem, 'character_id'> = {
        worldview: beliefAnalysis.worldview,
        selfview: beliefAnalysis.selfview,
        values: beliefAnalysis.values,
        last_updated: Date.now(),
        based_on_logs_count: characterLogs.length
      };

      // 5. 保存到数据库
      const beliefId = await globalDatabaseSimulator.updateBeliefSystem(characterId, beliefSystem);

      // 6. 记录分析时间
      this.lastAnalysisTime.set(characterId, Date.now());

      console.log(`✅ 角色 ${characterId} 的信念系统分析完成 (信心度: ${beliefAnalysis.confidence.toFixed(2)})`);
      console.log(`📝 分析摘要: ${beliefAnalysis.analysis_summary}`);

      return { character_id: characterId, ...beliefSystem };

    } catch (error) {
      console.error(`❌ 角色 ${characterId} 的信念分析失败:`, error);
      return null;
    }
  }

  /**
   * 构建信念分析提示词
   */
  private buildBeliefAnalysisPrompt(characterId: string, logs: AgentLog[]): string {
    // 按时间排序行为记录
    const sortedLogs = logs.sort((a, b) => a.timestamp - b.timestamp);

    // 提取关键行为信息
    const behaviorSummary = sortedLogs.map((log, index) => {
      const timeStr = new Date(log.timestamp).toLocaleString();
      return `${index + 1}. [${timeStr}] ${log.action_type}: ${log.input} → ${log.output}`;
    }).join('\n');

    return `你是一个专业的心理学家和行为分析师，需要根据一个AI角色的行为记录来推断其深层信念系统。

## 🎭 分析目标
角色ID: ${characterId}
行为记录数量: ${logs.length}条
分析时间跨度: ${this.getTimeSpan(sortedLogs)}

## 📊 行为记录序列
${behaviorSummary}

## 🧠 分析任务
请基于上述行为记录，深入分析这个角色的内在信念系统。需要从以下三个维度进行分析：

### 1. 世界观信念 (Worldview)
- 角色如何看待世界的运作方式？
- 对人际关系、权力结构、道德规则的基本假设
- 对风险、机会、变化的基本态度

### 2. 自我认知 (Selfview)  
- 角色如何定义和评价自己？
- 自己的能力、价值、身份认同
- 在群体中的定位和作用

### 3. 价值观念 (Values)
- 什么对这个角色最重要？
- 愿意为什么而努力或牺牲？
- 道德底线和行为准则

## 📋 分析要求
1. **基于证据**: 每个信念都要有具体的行为记录支撑
2. **权重评估**: 根据行为频率和一致性评估信念强度 (0.0-1.0)
3. **证据计数**: 记录支持每个信念的行为证据数量
4. **整体信心**: 评估这次分析的可靠程度

## 🔍 特别关注
- 行为的一致性和矛盾性
- 压力情况下的行为选择
- 与他人互动时的模式
- 决策过程中体现的优先级

请以JSON格式返回分析结果：

\`\`\`json
{
  "worldview": [
    {
      "description": "具体的世界观信念描述",
      "weight": 0.85,
      "evidence_count": 3
    }
  ],
  "selfview": [
    {
      "description": "具体的自我认知描述", 
      "weight": 0.75,
      "evidence_count": 2
    }
  ],
  "values": [
    {
      "description": "具体的价值观描述",
      "weight": 0.90,
      "evidence_count": 4
    }
  ],
  "confidence": 0.80,
  "analysis_summary": "简要总结这个角色的核心信念特征"
}
\`\`\`

请开始你的深度分析：`;
  }

  /**
   * 执行信念分析
   */
  private async performBeliefAnalysis(prompt: string): Promise<BeliefAnalysisResult> {
    try {
      console.log('🧠 正在调用AI进行信念分析...');
      
      // 调用DeepSeek API
      const response = await this.callBeliefAnalysisAPI(prompt);
      
      // 验证返回结果
      const validatedResult = BeliefAnalysisSchema.parse(response);
      
      console.log('✅ 信念分析完成');
      return validatedResult;
      
    } catch (error) {
      console.warn('⚠️ AI信念分析失败，使用模拟分析:', error);
      // 如果AI分析失败，生成基础的模拟信念系统
      return this.generateMockBeliefAnalysis();
    }
  }

  /**
   * 调用信念分析API
   */
  private async callBeliefAnalysisAPI(prompt: string): Promise<any> {
    // 构建API请求
    const requestBody = {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的心理学家和行为分析师，擅长从行为模式中推断深层信念系统。请严格按照指定的JSON格式返回分析结果。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // 较低的温度确保分析的一致性
      max_tokens: 2048,
      response_format: { type: 'json_object' }
    };

    // 这里应该调用实际的API，但在演示中我们使用模拟
    // 在真实环境中，这里会调用globalDeepSeekClient
    console.log('🔄 发送信念分析请求到DeepSeek API...');
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 返回模拟结果
    throw new Error('使用模拟分析代替API调用');
  }

  /**
   * 生成模拟的信念分析结果
   */
  private generateMockBeliefAnalysis(): BeliefAnalysisResult {
    return {
      worldview: [
        {
          description: "世界是一个需要谨慎应对的复杂系统",
          weight: 0.8,
          evidence_count: 3
        },
        {
          description: "人际关系需要建立在相互尊重的基础上",
          weight: 0.7,
          evidence_count: 2
        }
      ],
      selfview: [
        {
          description: "我是一个需要保护自己空间和时间的人",
          weight: 0.85,
          evidence_count: 4
        },
        {
          description: "我倾向于通过行动而非言语来表达自己",
          weight: 0.6,
          evidence_count: 2
        }
      ],
      values: [
        {
          description: "个人自主权和独立性",
          weight: 0.9,
          evidence_count: 5
        },
        {
          description: "避免不必要的冲突和麻烦",
          weight: 0.75,
          evidence_count: 3
        }
      ],
      confidence: 0.72,
      analysis_summary: "这个角色表现出强烈的独立倾向，重视个人空间，倾向于避免冲突，通过实际行动表达自己。"
    };
  }

  /**
   * 获取时间跨度描述
   */
  private getTimeSpan(logs: AgentLog[]): string {
    if (logs.length === 0) return '无记录';
    
    const firstLog = logs[0];
    const lastLog = logs[logs.length - 1];
    const spanMs = lastLog.timestamp - firstLog.timestamp;
    
    const hours = spanMs / (1000 * 60 * 60);
    
    if (hours < 1) {
      const minutes = spanMs / (1000 * 60);
      return `${Math.round(minutes)}分钟`;
    } else if (hours < 24) {
      return `${Math.round(hours)}小时`;
    } else {
      const days = hours / 24;
      return `${Math.round(days)}天`;
    }
  }

  /**
   * 手动触发角色信念分析
   */
  async manualAnalyzeCharacter(characterId: string, force: boolean = false): Promise<BeliefSystem | null> {
    if (force) {
      console.log(`🎯 强制分析角色 ${characterId} 的信念系统`);
      return await this.analyzeCharacterBeliefs(characterId);
    }

    const logs = await globalDatabaseSimulator.getCharacterLogs(characterId);
    if (logs.length < this.config.minLogsForAnalysis) {
      console.log(`⚠️ 角色 ${characterId} 的记录数不足，无法进行分析 (${logs.length}/${this.config.minLogsForAnalysis})`);
      return null;
    }

    return await this.analyzeCharacterBeliefs(characterId);
  }

  /**
   * 获取所有角色的信念分析状态
   */
  async getAnalysisStatus(): Promise<Record<string, any>> {
    const allLogs = await globalDatabaseSimulator.select('agent_logs');
    const allBeliefs = await globalDatabaseSimulator.select('belief_systems');
    
    const characterStats: Record<string, any> = {};
    
    // 统计每个角色的记录数
    for (const log of allLogs) {
      if (!characterStats[log.character_id]) {
        characterStats[log.character_id] = {
          logCount: 0,
          hasBelief: false,
          lastAnalysis: null,
          needsAnalysis: false
        };
      }
      characterStats[log.character_id].logCount++;
    }
    
    // 统计信念系统
    for (const belief of allBeliefs) {
      if (characterStats[belief.character_id]) {
        characterStats[belief.character_id].hasBelief = true;
        characterStats[belief.character_id].lastAnalysis = belief.last_updated;
      }
    }
    
    // 判断是否需要分析
    for (const [characterId, stats] of Object.entries(characterStats)) {
      stats.needsAnalysis = stats.logCount >= this.config.minLogsForAnalysis && 
                           (!stats.hasBelief || 
                            stats.logCount - (allBeliefs.find(b => b.character_id === characterId)?.based_on_logs_count || 0) >= this.config.reanalysisThreshold);
    }
    
    return characterStats;
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.stopAutoAnalysis();
    this.characterLogCounts.clear();
    this.lastAnalysisTime.clear();
    console.log('🧹 信念观察者系统已清理');
  }
}

/**
 * 全局信念观察者实例
 */
export const globalBeliefObserver = new BeliefObserver();